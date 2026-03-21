// This file is safe to import on both client and server.
// firebase-admin is only loaded on the server.

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

class FirebaseAdminSingleton {
    private static instance: FirebaseAdminSingleton;
    public db: any;
    public auth: any;

    private constructor() {
        if (typeof window === 'undefined') {
            try {
                const { initializeApp, getApps, cert } = require("firebase-admin/app");
                const { getFirestore } = require("firebase-admin/firestore");
                const { getAuth } = require("firebase-admin/auth");

                const isConfigured =
                    process.env.FIREBASE_PROJECT_ID &&
                    process.env.FIREBASE_CLIENT_EMAIL &&
                    process.env.FIREBASE_PRIVATE_KEY;

                let adminApp;
                const apps = getApps();
                if (apps.length > 0) {
                    adminApp = apps[0];
                } else if (isConfigured) {
                    adminApp = initializeApp({
                        credential: cert({
                            projectId: process.env.FIREBASE_PROJECT_ID,
                            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n").replace(/^"|"$/g, ""),
                        }),
                    });
                    console.log("Firebase Admin Initialized for Project:", process.env.FIREBASE_PROJECT_ID);
                } else {
                    console.warn("Firebase Admin credentials missing. Using dummy Firebase.");
                    adminApp = null;
                }

                this.db = adminApp ? getFirestore(adminApp) : dummyDb;
                this.auth = adminApp ? getAuth(adminApp) : dummyAuth;
            } catch (error) {
                console.error("CRITICAL: Failed to initialize Firebase Admin:", error);
                this.db = dummyDb;
                this.auth = dummyAuth;
            }
        } else {
            this.db = dummyDb;
            this.auth = dummyAuth;
        }
    }

    public static getInstance(): FirebaseAdminSingleton {
        if (!FirebaseAdminSingleton.instance) {
            FirebaseAdminSingleton.instance = new FirebaseAdminSingleton();
        }
        return FirebaseAdminSingleton.instance;
    }
}

// Export getters
export const getAdminDb = async () => FirebaseAdminSingleton.getInstance().db;
export const getAdminAuth = async () => FirebaseAdminSingleton.getInstance().auth;

// Provide proxy objects for legacy synchronous `adminDb.collection(...)` usages
export const adminDb: any = new Proxy({}, {
    get: function (target, prop) {
        return FirebaseAdminSingleton.getInstance().db[prop];
    }
});

export const adminAuth: any = new Proxy({}, {
    get: function (target, prop) {
        return FirebaseAdminSingleton.getInstance().auth[prop];
    }
});
