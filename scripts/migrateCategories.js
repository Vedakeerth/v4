const { initializeApp, getApps, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const FIREBASE_PROJECT_ID = 'react-website-7a1a0';
const FIREBASE_CLIENT_EMAIL = 'firebase-adminsdk-fbsvc@react-website-7a1a0.iam.gserviceaccount.com';
const FIREBASE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDSETtlLevxAF3x\n0l0S55cRVXE0aABnL1fH9no8WxMSKkua8BwQKYbdLLyg/Ff2xmDRsd/X3dot4DRJ\n/WT1V6H3QPt5UyFG9BDmrAjYXMC/0fUSA+OjRHap3UhuE+oDjW6UT3TokKjeLepc\nNWhzmmG6BTtIxG2r+AOSMSbYCKjCtiI5FJXm1e1+3eB9QiGQqQ6Ja+GPFVjZjFCH\nK7ffn9/Ez4WlHN/kwOdmRNakjeDmLpZ0RRVJ+94QbTqRe3mhWAFACeZQkmTnoC7h\nGSZBmhygUK2aC9YtEE4YyR+rJ00hXe7rEq0QJcq9r/5Wls2kt8GS8DZseWmP3Xl7\nl7VbSCEdAgMBAAECggEAAhAIQMSUKgAibALwRgS/H3zyyRxyUJEO8Bgz+A6+37FJ\nn8JWzDPULqzHR19i77nf7n8sHv7/Ku8mJEnYKW6MWRSqw3S1AXDZD6LFzXYPsHJ7\n0Qr3u70q2x0gnnAUnqdPXCZxk+0Ds3bI89HUbjooVn7Bp8PB/evIATH5WyqumYbS\nufDRRWmDsXVQ3pVKWwUPMCeW1z7UYu3NPi9Ws6ZnxGNJHjoErIf92WeZWUXPdz3v\nC9WC56WVBybVRe4Xs22rIVBsiD5k51QrEw4ZdSd/GG4RABEJMjZXuVQHXsk2kA3H\n9cXVfCv7csgdFMcTiW5NwTPLYkOxwYhD9vwCQtPUMQKBgQD9AIpMVaCqaxzIrLqK\n2+gEhKsNmu9I8sSBRLwHKJyzR0dP06eqy9x6B+dYJOg4GFRwNHnhJWDM+rDm6tIH\nKWGRn6zyvqdb0eKf5C2Q2vGRQMd0yaqsJwfUhNP7yaR29f1qtyPPTCiiAmO7LS3E\nL3GxP5VxPYjXatpHI8U6U926yQKBgQDUjnPsyGRcv2lw96bXoH+2ltfnUGBKekxq\napWHWHyLDlG0uCRKKYj5pJoPwWx6CfatmhO2KyzMw9bP3dBhwGssmZQceqy3pCIM\nNrwJ3NSahRDoZos6oinq49HajlUloMwfVTu+IuIPKncVQZ1stmGjhKpNBFdmfh3a\nICMkK2IJtQKBgQCr5OURzg+2GcZZtbmcRKLUBwts1/qBtqe6KGgT+QzWZbRW0TgW\nvCGVK6+L3K+GBUnBXnX8eXfWbPEqQxrl0MDAvxszZkOxB94QwmgPBiKgjMG3YJk8\nE9ynEIQyiyLZzHIcQkfrPRRSVotKDf0NUSrOwaOYZ7WEns2lDfGfmoGIuQKBgAEO\nrFjzLjyf3yBmuve7nqcD3RMTfUchkJu+5/uCXyw56AIkIFoWFs5XGUUWyzlYL1fx\nukNft5tVJg5mphC2alIQeYIiwhUvxdOVuh26cXxLSSg+ylaCU/8NHxAdQSMsx5co\nT2HEvqcgqPL8HpJZ3eZ4VHiJmv2xhuh83G/jn1s5AoGAf3gloFcLRiRnjQIH7KcL\nc1tDTXMISe6Sqa9n29R/EMGL885pAc6x3DAdsxj4G2OmNb4j+2jHH1W4G9fuidCM\nkAum7/LFvNsUlFXLVWMsZnsFFLvsRD98x8EfUYHcNt+NdzcXcQmm+hbrjvZKq/Ph\nNYAPRraz4/Sk5LxsY4FcQ9c=\n-----END PRIVATE KEY-----\n';

console.log('Initializing app...');
const app = initializeApp({
    credential: cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: FIREBASE_PRIVATE_KEY
    })
});

const db = getFirestore(app);

async function run() {
    console.log('Connected to Firestore, getting snapshot...');
    const snapshot = await db.collection('categories').get();

    // Clear old categories
    console.log('Clearing old categories...');
    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    const newCategories = [
        'Gifts',
        'Table Decor',
        'Wall Decals',
        'Organizers',
        '3D Prints',
        'Machine Organizers',
        'Uncategorized'
    ];

    console.log('Inserting new categories...');
    for (let i = 0; i < newCategories.length; i++) {
        await db.collection('categories').add({
            name: newCategories[i],
            description: 'Products in ' + newCategories[i],
            order: i,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
    }

    console.log('Fetching products to update their categories...');
    const productsSnapshot = await db.collection('products').get();
    let updatedProductsCount = 0;

    for (const doc of productsSnapshot.docs) {
        const product = doc.data();
        let newCategory = 'Uncategorized';
        const nameLower = (product.name || '').toLowerCase();

        if (nameLower.includes('machine') || nameLower.includes('organizer') || nameLower.includes('storage') || nameLower.includes('holder')) {
            newCategory = 'Machine Organizers';
        } else if (nameLower.includes('table') || nameLower.includes('desk') || nameLower.includes('lamp') || nameLower.includes('vase')) {
            newCategory = 'Table Decor';
        } else if (nameLower.includes('wall') || nameLower.includes('decal') || nameLower.includes('art') || nameLower.includes('frame')) {
            newCategory = 'Wall Decals';
        } else if (nameLower.includes('gift') || nameLower.includes('toy') || nameLower.includes('present') || nameLower.includes('mini')) {
            newCategory = 'Gifts';
        } else if (nameLower.includes('3d') || nameLower.includes('print') || nameLower.includes('filament') || nameLower.includes('resin')) {
            newCategory = '3D Prints';
        }

        if (product.category !== newCategory) {
            await db.collection('products').doc(doc.id).update({
                category: newCategory,
                updatedAt: new Date().toISOString()
            });
            updatedProductsCount++;
            console.log('Migrated', product.name, '=>', newCategory);
        }
    }

    console.log('Migration complete. Updated ' + updatedProductsCount + ' products.');
    process.exit(0);
}

run().catch(e => {
    console.error(e);
    process.exit(1);
});
