import { NextResponse } from 'next/server';
import { adminDb } from '@/services/firebaseAdmin';
import Stripe from 'stripe';

export async function POST(request: Request) {
    try {
        if (!adminDb) {
            return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
        }

        // Initialize Stripe with Test Key explicitly
        const stripeTestKey = process.env.STRIPE_TEST_SECRET_KEY;
        if (!stripeTestKey) {
            return NextResponse.json({ error: 'Stripe Test Secret Key not configured' }, { status: 500 });
        }
        const stripe = new Stripe(stripeTestKey, {
            apiVersion: '2023-10-16' as any,
        });

        const deletedOrders: string[] = [];
        const deletedPayments: string[] = [];

        // 1. Fetch all Orders
        const ordersSnap = await adminDb.collection('orders').get();
        const orders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // 2. Fetch all Payments
        const paymentsSnap = await adminDb.collection('payments').get();
        const payments = paymentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // 3. Process Payments first (to identify test intents)
        for (const payment of payments) {
            const p = payment as any;
            let isTest = false;

            // Check 1: Explicit Mock
            if (p.paymentMethod === 'mock' || p.id.startsWith('mock_')) {
                isTest = true;
            }
            // Check 2: Stripe Test Intent
            else if (p.stripePaymentIntentId) {
                try {
                    const intent = await stripe.paymentIntents.retrieve(p.stripePaymentIntentId);
                    if (!intent.livemode) {
                        isTest = true;
                    }
                } catch (e: any) {
                    // If not found in Test env, it might be Live or invalid.
                    // If it's invalid/not found in Test, we assume it's NOT a test payment unless proven otherwise.
                    // However, if we are SURE it was created in test mode (e.g. by date or other metadata), we could be more aggressive.
                    // For safety, we only delete if we CONFIRM it exists in Test env.
                    console.log(`Payment ${p.id}: Intent not found in Test env or error: ${e.message}`);
                }
            }

            if (isTest) {
                await adminDb.collection('payments').doc(p.id).delete();
                deletedPayments.push(p.id);
            }
        }

        // 4. Process Orders
        for (const order of orders) {
            const o = order as any;
            let isTest = false;

            // Check 1: Explicit Mock
            if (o.transactionId && o.transactionId.startsWith('txn_')) {
                isTest = true;
            }
            // Check 2: Linked to a deleted Test Payment
            else if (o.paymentId && deletedPayments.includes(o.paymentId)) {
                isTest = true;
            }
            // Check 3: Check Stripe Payment Intent from Order if available (sometimes stored directly)
            // (Skipping this as paymentId link should cover it)

            if (isTest) {
                await adminDb.collection('orders').doc(o.id).delete();
                deletedOrders.push(o.id);
            }
        }

        return NextResponse.json({
            success: true,
            deletedOrdersCount: deletedOrders.length,
            deletedPaymentsCount: deletedPayments.length,
            message: `Successfully deleted ${deletedOrders.length} orders and ${deletedPayments.length} payments from Test Mode.`
        });

    } catch (error: any) {
        console.error('Delete Test Data Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
