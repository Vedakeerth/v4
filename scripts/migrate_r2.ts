import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables FIRST before importing client modules that depend on them
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

function extractFilename(url: string, fallback: string): string {
    // Attempt to extract filename from Mega URL or use fallback
    // Mega URLs often don't have filenames in the pure link, but sometimes they do in format #!...
    // We'll just generate a unique name if not parsable
    return fallback;
}

async function run() {
    console.log("Starting migration to R2...");
    const { getAdminDb } = await import('../lib/firebaseAdmin');
    const { getFileBufferFromMega } = await import('../lib/mega');
    const { uploadFileToR2 } = await import('../lib/r2');
    
    const adminDb = await getAdminDb();
    
    // 1. Migrate Products
    const productsSnapshot = await adminDb.collection('products').get();
    console.log(`Found ${productsSnapshot.docs.length} products.`);

    for (const doc of productsSnapshot.docs) {
        const product = doc.data();
        let changed = false;
        
        console.log(`\nProcessing product: ${product.name || doc.id}`);

        // 1. Process primary image
        if (product.image && product.image.includes('mega.nz')) {
            try {
                console.log(`Downloading primary image from MEGA...`);
                const buf = await getFileBufferFromMega(product.image);
                if (buf) {
                    const filename = `primary_${Date.now()}.jpg`;
                    const r2Key = `products/${doc.id}/${filename}`;
                    
                    console.log(`Uploading primary image to R2...`);
                    await uploadFileToR2(buf, r2Key, 'image/jpeg');
                    
                    product.image = `/api/r2-file?key=${encodeURIComponent(r2Key)}`;
                    product.r2Key = r2Key;
                    changed = true;
                    console.log(`Primary image migrated: ${product.image}`);
                }
            } catch (err: any) {
                console.error(`Failed to migrate primary image:`, err.message);
            }
        }

        // 2. Process gallery images
        if (product.images && Array.isArray(product.images)) {
            const newImages: string[] = [];
            for (let i = 0; i < product.images.length; i++) {
                const img = product.images[i];
                if (img && img.includes('mega.nz')) {
                    try {
                        console.log(`Downloading gallery image ${i+1} from MEGA...`);
                        const buf = await getFileBufferFromMega(img);
                        if (buf) {
                            const filename = `gallery_${i}_${Date.now()}.jpg`;
                            const r2Key = `products/${doc.id}/${filename}`;
                            
                            console.log(`Uploading gallery image ${i+1} to R2...`);
                            await uploadFileToR2(buf, r2Key, 'image/jpeg');
                            
                            newImages.push(`/api/r2-file?key=${encodeURIComponent(r2Key)}`);
                            changed = true;
                            console.log(`Gallery image ${i+1} migrated.`);
                        } else {
                            newImages.push(img);
                        }
                    } catch (err: any) {
                        console.error(`Failed to migrate gallery image ${i+1}:`, err.message);
                        newImages.push(img); // keep original if fail
                    }
                } else {
                    newImages.push(img); // already migrated or local
                }
            }
            product.images = newImages;
        }

        if (changed) {
            console.log(`Updating document for ${product.name}...`);
            await doc.ref.update({
                image: product.image,
                images: product.images,
                ...(product.r2Key && { r2Key: product.r2Key })
            });
            console.log(`Document updated.`);
        } else {
            console.log(`No updates needed for ${product.name}.`);
        }
    }

    // 2. Migrate Projects
    const projectsSnapshot = await adminDb.collection('projects').get();
    console.log(`\nFound ${projectsSnapshot.docs.length} projects.`);

    for (const doc of projectsSnapshot.docs) {
        const project = doc.data();
        let changed = false;
        
        console.log(`\nProcessing project: ${project.title || doc.id}`);

        if (project.image && project.image.includes('mega.nz')) {
            try {
                console.log(`Downloading project image from MEGA...`);
                const buf = await getFileBufferFromMega(project.image);
                if (buf) {
                    const filename = `cover_${Date.now()}.jpg`;
                    const r2Key = `projects/${doc.id}/${filename}`;
                    
                    console.log(`Uploading project image to R2...`);
                    await uploadFileToR2(buf, r2Key, 'image/jpeg');
                    
                    project.image = `/api/r2-file?key=${encodeURIComponent(r2Key)}`;
                    changed = true;
                    console.log(`Project image migrated: ${project.image}`);
                }
            } catch (err: any) {
                console.error(`Failed to migrate project image:`, err.message);
            }
        }

        if (changed) {
            console.log(`Updating document for ${project.title}...`);
            await doc.ref.update({
                image: project.image
            });
            console.log(`Document updated.`);
        }
    }
    
    console.log("\nMigration completed.");
    process.exit(0);
}

run().catch(err => {
    console.error("Fatal error:", err);
    process.exit(1);
});
