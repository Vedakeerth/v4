import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCaMGkATpPbN8wEk2WhFSMybYh55VTS3Ew",
    authDomain: "react-website-7a1a0.firebaseapp.com",
    projectId: "react-website-7a1a0",
    storageBucket: "react-website-7a1a0.firebasestorage.app",
    messagingSenderId: "260751756727",
    appId: "1:260751756727:web:33459564c1459b96c72c32",
    measurementId: "G-5JEBST6KWH"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Analytics conditionally (only in browser)
export const initAnalytics = async () => {
    if (typeof window !== "undefined") {
        const supported = await isSupported();
        if (supported) {
            return getAnalytics(app);
        }
    }
    return null;
};

export { app };
