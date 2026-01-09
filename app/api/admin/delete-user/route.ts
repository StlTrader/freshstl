import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '../../../../services/firebaseAdmin';

export async function POST(request: Request) {
    try {
        const { userId } = await request.json();
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

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // 1. Delete from Firebase Auth
        try {
            await adminAuth.deleteUser(userId);
            console.log(`Successfully deleted user ${userId} from Auth`);
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                console.log(`User ${userId} not found in Auth, proceeding to delete data.`);
            } else {
                console.error('Error deleting auth user:', error);
                // Continue to delete data even if auth delete fails (e.g. if user already deleted)
            }
        }

        // 2. Delete from Firestore (Users collection)
        await adminDb.collection('users').doc(userId).delete();
        console.log(`Successfully deleted user ${userId} from Firestore`);

        // 3. Clean up subcollections (Best effort)
        const subcollections = ['cart', 'paymentMethods'];
        for (const sub of subcollections) {
            const subRef = adminDb.collection('users').doc(userId).collection(sub);
            const snapshot = await subRef.get();
            if (!snapshot.empty) {
                const batch = adminDb.batch();
                snapshot.docs.forEach(doc => batch.delete(doc.ref));
                await batch.commit();
            }
        }

        return NextResponse.json({ success: true, message: 'User deleted successfully' });
    } catch (error: any) {
        console.error('Delete user error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
