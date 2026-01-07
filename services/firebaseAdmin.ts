import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    console.log("Initializing Firebase Admin...");
    console.log("Project ID:", process.env.FIREBASE_PROJECT_ID ? "Found" : "Missing");
    console.log("Client Email:", process.env.FIREBASE_CLIENT_EMAIL ? "Found" : "Missing");
    console.log("Private Key:", process.env.FIREBASE_PRIVATE_KEY ? "Found" : "Missing");

    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        });
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
