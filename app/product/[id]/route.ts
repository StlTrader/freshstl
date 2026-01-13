import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '../../../services/firebaseAdmin';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    if (!adminDb) {
        return new NextResponse('Database Error', { status: 500 });
    }

    try {
        const docRef = adminDb.collection('products').doc(id);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            const data = docSnap.data();
            if (data && data.slug) {
                const url = new URL(`/3d-print/${data.slug}`, request.url);
                return NextResponse.redirect(url, 301);
            }
        }

        return new NextResponse('Product Not Found', { status: 404 });
    } catch (error) {
        console.error('Error redirecting product:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
