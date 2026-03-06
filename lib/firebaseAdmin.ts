import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

let adminApp: App;

const isConfigured =
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY;

if (!getApps().length) {
    if (isConfigured) {
        try {
            adminApp = initializeApp({
                credential: cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
                }),
            });
        } catch (error) {
            console.error("Failed to initialize Firebase Admin:", error);
            // Fallback to empty app to prevent crash
            adminApp = {} as App;
        }
    } else {
        if (process.env.NODE_ENV === 'production') {
            console.warn("Firebase Admin environment variables are missing. Firestore access will fail.");
        }
        adminApp = {} as App;
    }
} else {
    adminApp = getApps()[0];
}

export const adminDb = isConfigured ? getFirestore(adminApp) : null as any;
