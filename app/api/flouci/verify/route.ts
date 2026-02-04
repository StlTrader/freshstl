import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '../../../../services/firebaseAdmin';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const paymentId = searchParams.get('paymentId');

        if (!paymentId) {
            return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 });
        }

        // 1. Fetch Flouci Config from Firestore
        if (!adminDb) {
            return NextResponse.json({ error: 'DB Connection Failed' }, { status: 500 });
        }
        const flouciDoc = await adminDb.collection('settings').doc('flouci').get();
        if (!flouciDoc.exists) {
            return NextResponse.json({ error: 'Flouci is not configured' }, { status: 400 });
        }

        const config = flouciDoc.data();

        // 2. Call Flouci Verify API with Bearer Authorization (matching docs format)
        const authToken = `${config?.appToken}:${config?.appSecret}`;
        console.log('[Flouci Verify] Checking payment:', paymentId);

        const response = await fetch(`https://developers.flouci.com/api/v2/verify_payment/${paymentId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        });

        const result = await response.json();
        console.log('[Flouci Verify] Response:', result);

        if (!response.ok || result.code !== 0) {
            return NextResponse.json({ error: result.message || 'Verification Failed', result }, { status: response.status });
        }

        return NextResponse.json({
            success: true,
            status: result.result.status,
            amount: result.result.amount,
            tracking_id: result.result.developer_tracking_id,
            details: result.result.details
        });
    } catch (error: any) {
        console.error('[API Flouci Verify] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
