import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { adminDb } from '../../../services/firebaseAdmin';

export async function GET() {
    const envStatus = {
        projectId: !!process.env.FIREBASE_PROJECT_ID,
        clientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: !!process.env.FIREBASE_PRIVATE_KEY,
        storageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    };

    let dbStatus = "Not Initialized";
    let error = null;
    let productCount = 0;

    try {
        if (!admin.apps.length) {
            // Try manual init here to capture error
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                }),
                storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            });
        }

        if (admin.apps.length) {
            dbStatus = "Initialized";
            const db = admin.firestore();
            const snapshot = await db.collection('products').get();
            productCount = snapshot.size;
        }
    } catch (e: any) {
        dbStatus = "Error";
        error = e.message;
    }

    return NextResponse.json({
        envStatus,
        dbStatus,
        adminAppsLength: admin.apps.length,
        productCount,
        error
    });
}
