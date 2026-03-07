// This file is safe to import on both client and server.
// firebase-admin is only loaded on the server.

let adminDb: any;

const isConfigured =
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY;

const dummyDb = {
    collection: () => ({
        get: async () => ({ docs: [], empty: true, size: 0 }),
        where: () => dummyDb.collection(),
        doc: () => ({
            get: async () => ({ exists: false, data: () => null }),
            set: async () => { },
            update: async () => { },
            delete: async () => { },
            collection: () => dummyDb.collection(),
        }),
        orderBy: () => dummyDb.collection(),
        limit: () => dummyDb.collection(),
        add: async () => ({ id: 'dummy' }),
    }),
    batch: () => ({
        set: () => { },
        update: () => { },
        delete: () => { },
        commit: async () => { },
    })
};

if (typeof window === 'undefined') {
    // We are on the server
    try {
        const { initializeApp, getApps, cert } = require("firebase-admin/app");
        const { getFirestore } = require("firebase-admin/firestore");

        let adminApp;
        if (!getApps().length) {
            if (isConfigured) {
                adminApp = initializeApp({
                    credential: cert({
                        projectId: process.env.FIREBASE_PROJECT_ID,
                        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
                    }),
                });
            } else {
                adminApp = {};
            }
        } else {
            adminApp = getApps()[0];
        }

        adminDb = isConfigured ? getFirestore(adminApp) : dummyDb;
    } catch (error) {
        console.error("Failed to initialize Firebase Admin on server:", error);
        adminDb = dummyDb;
    }
} else {
    // We are on the client
    adminDb = dummyDb;
}

export { adminDb };
