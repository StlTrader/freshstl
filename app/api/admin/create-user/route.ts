import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '../../../../services/firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(request: Request) {
    try {
        const { email, password, displayName, role } = await request.json();
        const authHeader = request.headers.get('Authorization');

        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];

        if (!adminAuth || !adminDb) {
            return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
        }

        // Verify the token
        const decodedToken = await adminAuth.verifyIdToken(token);

        // Check if requester is admin
        const requesterDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
        const requesterData = requesterDoc.data();

        if (requesterData?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
        }

        if (!email || !password || !displayName) {
            return NextResponse.json({ error: 'Email, password, and display name are required' }, { status: 400 });
        }

        // 1. Create User in Firebase Auth
        let userRecord;
        try {
            userRecord = await adminAuth.createUser({
                email,
                password,
                displayName,
            });
        } catch (error: any) {
            if (error.code === 'auth/email-already-exists') {
                return NextResponse.json({ error: 'A user with this email already exists.' }, { status: 409 });
            }
            throw error;
        }

        // 2. Set Custom Claims (Role)
        if (role && ['admin', 'customer', 'tester'].includes(role)) {
            await adminAuth.setCustomUserClaims(userRecord.uid, { role });
        }

        // 3. Create User Document in Firestore
        await adminDb.collection('users').doc(userRecord.uid).set({
            email,
            displayName,
            role: role || 'customer',
            createdAt: Timestamp.now(),
            isBlocked: false,
            photoURL: null
        });

        return NextResponse.json({ success: true, message: 'User created successfully', userId: userRecord.uid });
    } catch (error: any) {
        console.error('Create user error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
