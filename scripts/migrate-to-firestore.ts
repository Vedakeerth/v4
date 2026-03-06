import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

const firebaseConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!firebaseConfig.projectId || !firebaseConfig.clientEmail || !firebaseConfig.privateKey ||
    firebaseConfig.clientEmail === 'YOUR_SERVICE_ACCOUNT_CLIENT_EMAIL') {
    console.error('❌ Error: Firebase Admin env vars are missing or placeholders in .env.local');
    process.exit(1);
}

try {
    admin.initializeApp({
        credential: admin.credential.cert(firebaseConfig),
    });
} catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error);
    process.exit(1);
}

const db = admin.firestore();

const collectionsToMigrate = [
    { name: 'products', path: 'data/products.json' },
    { name: 'blogs', path: 'data/blogs.json' },
    { name: 'testimonials', path: 'data/testimonials.json' },
    { name: 'projects', path: 'data/projects.json' },
    { name: 'coupons', path: 'data/coupons.json' },
    { name: 'deals', path: 'data/deals.json' },
    { name: 'catalogs', path: 'data/catalogs.json' },
    { name: 'settings', path: 'data/settings.json' },
    { name: 'socials', path: 'data/socials.json' },
    { name: 'seo', path: 'data/seo.json' }
];

async function migrate() {
    console.log('🚀 Starting migration to Firestore...');

    // 1. Migrate Standard Collections
    for (const config of collectionsToMigrate) {
        const filePath = path.join(process.cwd(), config.path);
        if (!fs.existsSync(filePath)) continue;

        try {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            const items = Array.isArray(data) ? data : [data];
            console.log(`📦 Migrating ${items.length} items to collection "${config.name}"...`);
            const batch = db.batch();
            for (const item of items) {
                const docId = item.id?.toString() || undefined;
                const docRef = docId ? db.collection(config.name).doc(docId) : db.collection(config.name).doc();
                batch.set(docRef, { ...item, updatedAt: new Date().toISOString() }, { merge: true });
            }
            await batch.commit();
        } catch (error) {
            console.error(`❌ Error migrating "${config.name}":`, error);
        }
    }

    // 2. Migrate All Page Configs to a single "pages" collection
    const pagesDir = path.join(process.cwd(), 'data', 'pages');
    if (fs.existsSync(pagesDir)) {
        const pageFiles = fs.readdirSync(pagesDir).filter(f => f.endsWith('.json'));
        console.log(`📑 Migrating ${pageFiles.length} page configs to collection "pages"...`);
        const batch = db.batch();
        for (const file of pageFiles) {
            const pageName = file.replace('.json', '');
            const filePath = path.join(pagesDir, file);
            try {
                const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                const docRef = db.collection('pages').doc(pageName);
                batch.set(docRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
                console.log(`   ✅ Prepared page: ${pageName}`);
            } catch (error) {
                console.error(`   ❌ Error reading page ${file}:`, error);
            }
        }
        await batch.commit();
    }

    console.log('\n✨ All data migrated successfully!');
}

migrate();
