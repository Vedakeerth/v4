import { getAdminDb } from '../lib/firebaseAdmin';
import { uploadToMega } from '../lib/mega';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables for Firebase and MEGA
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import fs from 'fs';

async function downloadImage(url: string): Promise<Buffer | null> {
    if (url.startsWith('/')) {
        // Read from local public directory
        try {
            const localPath = path.join(process.cwd(), 'public', url);
            console.log(`Reading local file: ${localPath}`);
            if (fs.existsSync(localPath)) {
                return fs.readFileSync(localPath);
            } else {
                console.warn(`Local file not found: ${localPath}`);
                return null;
            }
        } catch (err: any) {
            console.error(`Error reading local file ${url}:`, err.message);
            return null;
        }
    }
    if (url.includes('mega.nz')) {
        return null; // Already in MEGA
    }
    try {
        console.log(`Downloading: ${url}`);
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to download: ${res.statusText}`);
        const arrayBuffer = await res.arrayBuffer();
        return Buffer.from(arrayBuffer);
    } catch (err: any) {
        console.error(`Error downloading ${url}:`, err.message);
        return null;
    }
}

function extractFilename(url: string, index: number): string {
    try {
        const parsed = new URL(url);
        const pathname = parsed.pathname;
        const filename = pathname.split('/').pop() || `image_${index}.jpg`;
        // Handle query params or weird names
        return filename.split('?')[0] || `image_${index}.jpg`;
    } catch {
        return `image_${index}.jpg`;
    }
}

async function run() {
    console.log("Starting migration...");
    const adminDb = await getAdminDb();
    const snapshot = await adminDb.collection('products').get();
    const products = snapshot.docs;

    console.log(`Found ${products.length} products.`);

    for (const doc of products) {
        const product = doc.data();
        let changed = false;
        
        console.log(`\nProcessing product: ${product.name || doc.id}`);

        // 1. Process primary image
        if (product.image && !product.image.includes('mega.nz')) {
            const buf = await downloadImage(product.image);
            if (buf) {
                const filename = extractFilename(product.image, 0);
                try {
                    console.log(`Uploading primary image for ${product.name}...`);
                    const result = await uploadToMega(buf, filename, `migration/${doc.id}`, 'website');
                    product.image = result.url;
                    changed = true;
                    console.log(`Primary image uploaded: ${result.url}`);
                } catch (err: any) {
                    console.error(`Failed to upload primary image:`, err.message);
                }
            }
        }

        // 2. Process gallery images
        if (product.images && Array.isArray(product.images)) {
            const newImages: string[] = [];
            for (let i = 0; i < product.images.length; i++) {
                const img = product.images[i];
                if (img && !img.includes('mega.nz')) {
                    const buf = await downloadImage(img);
                    if (buf) {
                        const filename = extractFilename(img, i + 1);
                        try {
                            console.log(`Uploading gallery image ${i+1} for ${product.name}...`);
                            const result = await uploadToMega(buf, filename, `migration/${doc.id}`, 'website');
                            newImages.push(result.url);
                            changed = true;
                            console.log(`Gallery image ${i+1} uploaded: ${result.url}`);
                        } catch (err: any) {
                            console.error(`Failed to upload gallery image ${i+1}:`, err.message);
                            newImages.push(img); // keep original if fail
                        }
                    } else {
                        newImages.push(img); // keep original if skip/fail
                    }
                } else {
                    newImages.push(img); // already in mega
                }
            }
            product.images = newImages;
        }

        if (changed) {
            console.log(`Updating document for ${product.name}...`);
            await doc.ref.update({
                image: product.image,
                images: product.images
            });
            console.log(`Document updated.`);
        } else {
            console.log(`No updates needed for ${product.name}.`);
        }
    }
    
    console.log("\nMigration completed.");
    process.exit(0);
}

run().catch(err => {
    console.error("Fatal error:", err);
    process.exit(1);
});
