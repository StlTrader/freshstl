import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    console.log("Initializing Firebase Admin...");

    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    try {
        if (clientEmail && privateKey) {
            console.log("Using explicit credentials from env vars.");
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey: privateKey.replace(/\\n/g, '\n'),
                }),
                storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            });
        } else {
            console.log("Using Application Default Credentials (ADC).");
            admin.initializeApp({
                credential: admin.credential.applicationDefault(),
                projectId: projectId,
                storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            });
        }
        console.log("Firebase Admin initialized successfully.");
    } catch (error) {
        console.error('Firebase admin initialization error:', error);
    }
} else {
    console.log("Firebase Admin already initialized.");
}

export const adminDb = admin.apps.length ? admin.firestore() : null;
export const adminAuth = admin.apps.length ? admin.auth() : null;
export const adminStorage = admin.apps.length ? admin.storage() : null;
