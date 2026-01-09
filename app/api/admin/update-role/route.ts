import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '../../../../services/firebaseAdmin';

export async function POST(request: Request) {
    try {
        const { userId, role } = await request.json();
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

        if (!userId || !role) {
            return NextResponse.json({ error: 'User ID and Role are required' }, { status: 400 });
        }

        if (!['admin', 'customer', 'tester'].includes(role)) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        // 1. Update Custom Claims in Firebase Auth (so role is available in token)
        try {
            await adminAuth.setCustomUserClaims(userId, { role });
            console.log(`Successfully updated custom claims for user ${userId} to role ${role}`);
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                console.log(`User ${userId} not found in Auth, skipping claims update.`);
            } else {
                console.error('Error updating auth claims:', error);
                // Continue to update Firestore
            }
        }

        // 2. Update Firestore Document
        await adminDb.collection('users').doc(userId).set({ role }, { merge: true });
        console.log(`Successfully updated Firestore role for user ${userId} to ${role}`);

        return NextResponse.json({ success: true, message: 'User role updated successfully' });
    } catch (error: any) {
        console.error('Update user role error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
