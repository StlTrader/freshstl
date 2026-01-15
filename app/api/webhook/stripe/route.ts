import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { adminDb } from '@/services/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: Request) {
    const body = await request.text();
    const headerList = await headers();
    const signature = headerList.get('stripe-signature') as string;

    if (!adminDb) {
        console.error('Firebase Admin not initialized');
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }

    // ... (rest of the file)



    // 1. Fetch Settings to get Webhook Secrets
    let stripeSettings: any = {};
    const settingsDoc = await adminDb.collection('settings').doc('stripe').get();
    if (settingsDoc.exists) {
        stripeSettings = settingsDoc.data() || {};
    }

    // We need to determine which secret to use.
    // Strategy: Try verifying with Live Secret first, then Test Secret.
    // Or check the event object mode if possible before verification (unsafe).
    // Safer: Try both.

    let event: Stripe.Event;
    let isLive = false;

    // Try Live Secret
    try {
        const liveSecret = process.env.STRIPE_WEBHOOK_SECRET_LIVE || stripeSettings.liveWebhookSecret;
        if (liveSecret) {
            console.log(`[Webhook] Attempting verification with Live Secret (ending in ...${liveSecret.slice(-4)})`);
            const stripe = new Stripe(stripeSettings.liveSecretKey || process.env.STRIPE_SECRET_KEY_LIVE || '', { apiVersion: '2023-10-16' as any });
            event = stripe.webhooks.constructEvent(body, signature, liveSecret);
            isLive = true;
            console.log('[Webhook] Live verification successful');
        } else {
            console.log('[Webhook] No Live Secret found to attempt verification');
            throw new Error('No Live Secret');
        }
    } catch (err: any) {
        console.log(`[Webhook] Live verification failed: ${err.message}`);

        // If Live fails, try Test Secret
        try {
            const testSecret = process.env.STRIPE_WEBHOOK_SECRET_TEST || stripeSettings.testWebhookSecret;
            if (testSecret) {
                console.log(`[Webhook] Attempting verification with Test Secret (ending in ...${testSecret.slice(-4)})`);
                const stripe = new Stripe(stripeSettings.testSecretKey || process.env.STRIPE_SECRET_KEY_TEST || '', { apiVersion: '2023-10-16' as any });
                event = stripe.webhooks.constructEvent(body, signature, testSecret);
                isLive = false;
                console.log('[Webhook] Test verification successful');
            } else {
                console.log('[Webhook] No Test Secret found to attempt verification');
                throw new Error('Invalid signature or missing secrets');
            }
        } catch (err2: any) {
            console.error(`[Webhook] Signature verification failed for both Live and Test secrets.`);
            console.error(`[Webhook] Test Error: ${err2.message}`);
            return NextResponse.json({ error: 'Webhook Error: Signature Verification Failed' }, { status: 400 });
        }
    }

    // 2. Handle Event
    try {
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                console.log(`💰 Payment succeeded: ${paymentIntent.id}`);
                await handlePaymentSucceeded(paymentIntent, isLive);
                break;

            case 'payment_intent.payment_failed':
                const failedIntent = event.data.object as Stripe.PaymentIntent;
                console.log(`❌ Payment failed: ${failedIntent.id}`);
                await handlePaymentFailed(failedIntent);
                break;

            case 'charge.refunded':
                const refund = event.data.object as Stripe.Charge;
                console.log(`💸 Charge refunded: ${refund.id}`);
                await handleChargeRefunded(refund);
                break;

            case 'payment_method.attached':
                const paymentMethod = event.data.object as Stripe.PaymentMethod;
                console.log(`💳 Payment method attached: ${paymentMethod.id}`);
                await handlePaymentMethodAttached(paymentMethod);
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
    } catch (error) {
        console.error(`Error handling event ${event.type}:`, error);
        return NextResponse.json({ error: 'Handler Error' }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent, isLive: boolean) {
    if (!adminDb) return;

    const { metadata, amount, currency, id: paymentId } = paymentIntent;
    const { customer_email, customer_name, firebaseUID, items: itemsJson, orderId } = metadata;

    console.log(`[Webhook] Processing fulfillment for ${paymentId}`);

    // 1. Idempotency Check: Check if order already exists (by paymentId)
    // Note: If we created a pending order, it might not have the paymentId yet if the update failed, 
    // OR it might have it. We need to be careful not to double-fulfill.
    // If we find an order with this paymentId that is ALREADY PAID, we skip.
    const existingOrderSnap = await adminDb.collection('orders').where('paymentId', '==', paymentId).limit(1).get();
    if (!existingOrderSnap.empty) {
        const existingOrder = existingOrderSnap.docs[0].data();
        if (existingOrder.status === 'paid') {
            console.log(`[Webhook] Order ${paymentId} already paid. Skipping.`);
            return;
        }
    }

    let userId = firebaseUID;
    let userEmail = customer_email;

    // Fallback: Look up user by email if UID missing
    if (!userId && userEmail) {
        const usersSnap = await adminDb.collection('users').where('email', '==', userEmail).limit(1).get();
        if (!usersSnap.empty) {
            userId = usersSnap.docs[0].id;
        }
    }

    let items: any[] = [];
    let orderRef: any;

    // 2. Strategy A: Pending Order (Preferred)
    if (orderId) {
        console.log(`[Webhook] Found orderId ${orderId} in metadata. Fetching pending order...`);
        const pendingOrderDoc = await adminDb.collection('orders').doc(orderId).get();

        if (pendingOrderDoc.exists) {
            const orderData = pendingOrderDoc.data();
            items = orderData?.items || [];
            orderRef = pendingOrderDoc.ref;
            console.log(`[Webhook] Retrieved ${items.length} items from pending order.`);
        } else {
            console.warn(`[Webhook] Pending order ${orderId} not found! Falling back to metadata.`);
        }
    }

    // 3. Strategy B: Metadata Fallback (Legacy/Fallback)
    if (items.length === 0) {
        try {
            items = itemsJson ? JSON.parse(itemsJson) : [];
            console.log(`[Webhook] Parsed ${items.length} items from metadata.`);
        } catch (e) {
            console.error("Failed to parse items from metadata", e);
        }
    }

    if (items.length === 0) {
        console.error("[Webhook] CRITICAL: No items found for order. Fulfillment cannot proceed.");
        return;
    }

    // 4. Update or Create Order Record
    const batch = adminDb.batch();

    if (orderRef) {
        // Update existing pending order
        batch.update(orderRef, {
            status: 'paid',
            paymentId: paymentId, // Ensure paymentId is set
            paidAt: FieldValue.serverTimestamp(),
            metadata: metadata // Update metadata just in case
        });
    } else {
        // Create new order (Fallback)
        orderRef = adminDb.collection('orders').doc();
        const orderData = {
            paymentId,
            amount,
            currency,
            status: 'paid',
            email: userEmail,
            userId: userId || 'guest',
            createdAt: FieldValue.serverTimestamp(),
            mode: isLive ? 'live' : 'test',
            items: items,
            metadata: metadata
        };
        batch.set(orderRef, orderData);
    }

    // 5. User Purchases & Product Sales
    if (userId && userId !== 'guest') {
        const purchaseDate = FieldValue.serverTimestamp();

        items.forEach((item: any) => {
            // Add to User Purchases
            const purchaseRef = adminDb!.collection('users').doc(userId).collection('purchases').doc();
            batch.set(purchaseRef, {
                transactionId: paymentId,
                productId: item.id,
                productName: item.name,
                purchaseDate: purchaseDate,
                downloadLink: item.sourceStoragePath || item.modelUrl || `https://freshstl.com/downloads/${paymentId}/${item.id}`,
                amount: item.price,
                currency: currency
            });

            // Increment Product Sales Count
            if (item.id) {
                const productRef = adminDb!.collection('products').doc(item.id);
                batch.update(productRef, {
                    sales: FieldValue.increment(1)
                });
            }
        });
    }

    await batch.commit();
    console.log(`[Webhook] Fulfillment complete for ${paymentId}`);
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    if (!adminDb) return;
    // Log failure or notify user (optional)
    // For now, we just log it.
    console.log(`Payment failed for ${paymentIntent.id}: ${paymentIntent.last_payment_error?.message}`);
}

async function handleChargeRefunded(charge: Stripe.Charge) {
    if (!adminDb) return;

    // Find the order associated with this payment
    const paymentId = charge.payment_intent as string;
    const ordersSnap = await adminDb.collection('orders').where('paymentId', '==', paymentId).limit(1).get();

    if (!ordersSnap.empty) {
        const orderDoc = ordersSnap.docs[0];
        await orderDoc.ref.update({
            status: 'refunded',
            refundedAt: FieldValue.serverTimestamp()
        });
        console.log(`Order ${orderDoc.id} marked as refunded.`);
    }
}

async function handlePaymentMethodAttached(paymentMethod: Stripe.PaymentMethod) {
    if (!adminDb) return;

    // If the payment method is attached to a customer, we can save it to their profile for future use.
    // Note: This requires us to know the Firebase UID associated with the Stripe Customer ID.
    // We can find this by querying users where stripeCustomerId == paymentMethod.customer

    const stripeCustomerId = paymentMethod.customer as string;
    if (!stripeCustomerId) return;

    const usersSnap = await adminDb.collection('users').where('stripeCustomerId', '==', stripeCustomerId).limit(1).get();

    if (!usersSnap.empty) {
        const userDoc = usersSnap.docs[0];
        const userId = userDoc.id;

        // Save to subcollection
        await adminDb.collection('users').doc(userId).collection('paymentMethods').doc(paymentMethod.id).set({
            id: paymentMethod.id,
            brand: paymentMethod.card?.brand || 'unknown',
            last4: paymentMethod.card?.last4 || '0000',
            expiryMonth: paymentMethod.card?.exp_month,
            expiryYear: paymentMethod.card?.exp_year,
            createdAt: FieldValue.serverTimestamp()
        });
        console.log(`Payment method ${paymentMethod.id} saved for user ${userId}`);
    }
}
