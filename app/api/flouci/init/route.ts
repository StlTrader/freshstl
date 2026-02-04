import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '../../../../services/firebaseAdmin';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { amount, email, fullName, items } = body;

        // 1. Fetch Flouci Config from Firestore (Admin collection)
        if (!adminDb) {
            return NextResponse.json({ error: 'DB Connection Failed' }, { status: 500 });
        }
        const flouciDoc = await adminDb.collection('settings').doc('flouci').get();
        if (!flouciDoc.exists) {
            return NextResponse.json({ error: 'Flouci is not configured' }, { status: 400 });
        }

        const config = flouciDoc.data();
        if (!config?.isConnected) {
            return NextResponse.json({ error: 'Flouci is disconnected' }, { status: 400 });
        }

        // 2. Prepare Flouci Payload (credentials go in Authorization header, not body)
        const payload = {
            amount: amount, // in millimes
            success_link: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://freshstl.com'}/checkout/success?gateway=flouci`,
            fail_link: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://freshstl.com'}/checkout/fail?gateway=flouci`,
            developer_tracking_id: config.developerId || 'freshstl_admin',
            accept_card: true,
            pay_with_card: true, // Try forcing card
            payment_methods: ["card"], // Try restricting methods
            session_timeout_secs: 1200
        };

        // 3. Call Flouci API with Bearer Authorization
        const authToken = `${config.appToken}:${config.appSecret}`;
        console.log('[Flouci API] Sending payload:', JSON.stringify(payload, null, 2));
        console.log('[Flouci API] Auth token prefix:', authToken.substring(0, 20) + '...');

        const response = await fetch('https://developers.flouci.com/api/v2/generate_payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        console.log('[Flouci API] Response status:', response.status);
        console.log('[Flouci API] Response body:', JSON.stringify(result, null, 2));

        if (!response.ok || result.code !== 0) {
            console.error('[Flouci API] Error response:', result);
            return NextResponse.json({ error: result.message || result.error || 'Flouci API Error', details: result }, { status: response.status || 400 });
        }
        // Flouci response structure: { result: { success, link, payment_id, ... }, code, name, version }
        return NextResponse.json({
            success: true,
            result: result.result  // Extract the inner 'result' object
        });
    } catch (error: any) {
        console.error('[API Flouci Init] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
