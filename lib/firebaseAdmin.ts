// This file is safe to import on both client and server.
// firebase-admin is only loaded on the server.

let adminDb: any;
let adminAuth: any;

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

const dummyAuth = {
    verifyIdToken: async () => {
        console.warn("Firebase Admin not configured or running on client. verifyIdToken skipped.");
        throw new Error("Firebase Admin not initialized");
    }
};

// Initialize on demand to avoid top-level require/import issues in some environments
async function initAdmin() {
    if (typeof window !== 'undefined') return { db: dummyDb, auth: dummyAuth };

    if (adminDb && adminAuth) return { db: adminDb, auth: adminAuth };

    try {
        const { initializeApp, getApps, cert } = await import("firebase-admin/app");
        const { getFirestore } = await import("firebase-admin/firestore");
        const { getAuth } = await import("firebase-admin/auth");

        let adminApp;
        const apps = getApps();
        if (!apps.length) {
            if (isConfigured) {
                adminApp = initializeApp({
                    credential: cert({
                        projectId: process.env.FIREBASE_PROJECT_ID,
                        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
                    }),
                });
            } else {
                adminApp = null;
            }
        } else {
            adminApp = apps[0];
        }

        adminDb = adminApp ? getFirestore(adminApp) : dummyDb;
        adminAuth = adminApp ? getAuth(adminApp) : dummyAuth;

        return { db: adminDb, auth: adminAuth };
    } catch (error) {
        console.error("Failed to initialize Firebase Admin:", error);
        return { db: dummyDb, auth: dummyAuth };
    }
}

// Export a proxy or helper to ensure initialization
export const getAdminDb = async () => (await initAdmin()).db;
export const getAdminAuth = async () => (await initAdmin()).auth;

// For backward compatibility with existing code that imports adminDb directly
// Note: This might still be null if imported before initAdmin completes, 
// but getUserByEmail in lib/users.ts now uses dynamic imports.
export { adminDb, adminAuth };
