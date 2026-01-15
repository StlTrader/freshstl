import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb } from '@/services/firebaseAdmin';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { amount, currency, customerInfo, paymentMethodId, saveCard, mode: requestedMode } = body;

        // 1. Fetch Settings from Firestore
        let stripeSettings: any = {};
        if (adminDb) {
            const settingsDoc = await adminDb.collection('settings').doc('stripe').get();
            if (settingsDoc.exists) {
                stripeSettings = settingsDoc.data() || {};
            }
        }

        // 2. Determine Mode & Key
        const whitelist = stripeSettings.testerEmails || [];
        const userEmail = customerInfo?.email;
        const isTester = userEmail && whitelist.includes(userEmail);

        // STRICT ENFORCEMENT:
        // - If user is a tester -> Use requested mode (allows testing both test/live if they want, but usually defaults to test)
        // - If user NOT in whitelist -> FORCE Live Mode
        const mode = isTester ? (requestedMode || 'test') : 'live';
        const isLive = mode === 'live';

        // 3. Get Secret Key (Firestore > Env Var)
        let secretKey = isLive
            ? (stripeSettings.liveSecretKey || process.env.STRIPE_SECRET_KEY_LIVE)
            : (stripeSettings.testSecretKey || process.env.STRIPE_SECRET_KEY_TEST);

        if (!secretKey) {
            console.error(`Stripe ${isLive ? 'Live' : 'Test'} Secret Key is missing.`);
            return NextResponse.json(
                { error: 'Stripe configuration error on server.' },
                { status: 500 }
            );
        }

        // Initialize Stripe
        const stripe = new Stripe(secretKey, {
            apiVersion: '2023-10-16' as any,
        });

        // 4. Customer Management (Get or Create Stripe Customer)
        let stripeCustomerId = customerInfo?.email ? await getOrCreateStripeCustomer(stripe, adminDb, customerInfo.email, customerInfo.fullName) : undefined;

        // 5. Create Pending Order in Firestore
        // This ensures we have the full item list even if Stripe metadata truncates it.
        let orderId = '';
        if (adminDb) {
            const pendingOrderRef = adminDb.collection('orders').doc();
            orderId = pendingOrderRef.id;

            await pendingOrderRef.set({
                amount,
                currency,
                status: 'pending', // Initial status
                email: customerInfo?.email || '',
                userId: body.userId || 'guest',
                createdAt: new Date(), // Use server timestamp in webhook, but this is fine for now
                mode: mode,
                items: body.items || [], // Store FULL items here
                customerInfo: customerInfo || {},
                metadata: {
                    source: 'web_checkout',
                    platform: 'freshstl'
                }
            });
            console.log(`[Checkout] Created pending order ${orderId}`);
        }

        // Prepare Metadata
        // We pass the orderId so the webhook can look it up.
        // We still pass simplified items as a backup/reference, but rely on Firestore for the source of truth.
        const simplifiedItems = (body.items || []).map((item: any) => ({
            id: item.id,
            name: item.name
        }));

        const metadata = {
            orderId: orderId, // CRITICAL: Link to Firestore Order
            customer_email: customerInfo?.email || 'guest@example.com',
            customer_name: customerInfo?.fullName || 'Guest',
            firebaseUID: body.userId || '',
            // Keep items for quick reference in Stripe Dashboard, but don't rely on them for fulfillment
            items_summary: JSON.stringify(simplifiedItems).substring(0, 400)
        };

        // Prepare PaymentIntent parameters
        const params: Stripe.PaymentIntentCreateParams = {
            amount: Math.round(amount),
            currency: currency || 'usd',
            payment_method_types: ['card'], // Card includes Google Pay and Apple Pay
            metadata: metadata,
            receipt_email: customerInfo?.email,
        };

        if (stripeCustomerId) {
            params.customer = stripeCustomerId;
        }

        if (saveCard) {
            params.setup_future_usage = 'off_session';
        }

        if (paymentMethodId) {
            params.payment_method = paymentMethodId;
            if (stripeCustomerId) {
                params.customer = stripeCustomerId;
            }
        }

        let paymentIntent;
        try {
            paymentIntent = await stripe.paymentIntents.create(params);

            // Update the pending order with the payment ID
            if (adminDb && orderId) {
                await adminDb.collection('orders').doc(orderId).update({
                    paymentId: paymentIntent.id
                });
            }

        } catch (error: any) {
            // Handle "No such customer" error (switching between Test/Live modes)
            if (error.code === 'resource_missing' && error.param === 'customer') {
                console.warn("Stripe Customer ID mismatch (likely mode switch). Creating new customer...");

                if (customerInfo?.email) {
                    // Force create a new customer
                    const newCustomerId = await forceCreateStripeCustomer(stripe, adminDb, customerInfo.email, customerInfo.fullName, body.userId);
                    params.customer = newCustomerId;
                    // Retry payment creation
                    paymentIntent = await stripe.paymentIntents.create(params);

                    if (adminDb && orderId) {
                        await adminDb.collection('orders').doc(orderId).update({
                            paymentId: paymentIntent.id
                        });
                    }
                } else {
                    throw error;
                }
            } else {
                throw error;
            }
        }

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            id: paymentIntent.id,
            orderId: orderId // Return orderId to client if needed
        });

    } catch (error: any) {
        console.error('Stripe Checkout Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}

// Helper: Get or Create Stripe Customer
async function getOrCreateStripeCustomer(stripe: Stripe, db: any, email: string, name: string): Promise<string | undefined> {
    if (!db) return undefined;

    try {
        // 1. Check if user exists in Firestore by email
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('email', '==', email).limit(1).get();
        let userDoc = !snapshot.empty ? snapshot.docs[0] : null;

        // 2. If user has a Stripe ID in Firestore, verify it exists in Stripe
        if (userDoc) {
            const userData = userDoc.data();
            if (userData.stripeCustomerId) {
                try {
                    const customer = await stripe.customers.retrieve(userData.stripeCustomerId);
                    if (customer && !customer.deleted) {
                        return customer.id;
                    }
                } catch (e) {
                    console.warn("Stored Stripe Customer ID invalid or deleted. Searching by email...");
                }
            }
        }

        // 3. Search Stripe by email (to avoid duplicates)
        const existingCustomers = await stripe.customers.list({ email: email, limit: 1 });
        if (existingCustomers.data.length > 0) {
            const customerId = existingCustomers.data[0].id;
            // Update Firestore if we have a user doc
            if (userDoc) {
                await userDoc.ref.update({ stripeCustomerId: customerId });
            }
            return customerId;
        }

        // 4. Create new Customer
        const customer = await stripe.customers.create({
            email,
            name,
            metadata: {
                firebaseUID: userDoc ? userDoc.id : 'guest'
            }
        });

        // Update Firestore if we have a user doc
        if (userDoc) {
            await userDoc.ref.update({ stripeCustomerId: customer.id });
        }

        return customer.id;

    } catch (e) {
        console.error("Error managing Stripe Customer:", e);
        // Fallback: Create a guest customer just for this transaction if everything else fails
        try {
            const guestCustomer = await stripe.customers.create({ email, name });
            return guestCustomer.id;
        } catch (innerE) {
            console.error("Critical: Failed to create even a guest customer", innerE);
            return undefined;
        }
    }
}

// Helper: Force Create Stripe Customer (for mode switching)
async function forceCreateStripeCustomer(stripe: Stripe, db: any, email: string, name: string, userId?: string): Promise<string> {
    const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
            firebaseUID: userId || ''
        }
    });

    // Update Firestore if we have a user ID
    if (db && userId) {
        try {
            await db.collection('users').doc(userId).update({ stripeCustomerId: customer.id });
        } catch (e) {
            console.error("Failed to update user with new Stripe Customer ID:", e);
        }
    } else if (db) {
        // Try to find by email if userId not provided (fallback)
        try {
            const usersRef = db.collection('users');
            const snapshot = await usersRef.where('email', '==', email).limit(1).get();
            if (!snapshot.empty) {
                await snapshot.docs[0].ref.update({ stripeCustomerId: customer.id });
            }
        } catch (e) {
            console.error("Failed to update user by email:", e);
        }
    }

    return customer.id;
}
