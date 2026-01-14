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
        // Logic: 
        // - If user is in whitelist -> Allow requested mode (Test or Live)
        // - If user NOT in whitelist -> FORCE Live Mode

        const whitelist = stripeSettings.testerEmails || ['yassinebouomrine@gmail.com'];
        const userEmail = customerInfo?.email;
        const isTester = userEmail && whitelist.includes(userEmail);

        // Force Live if not a tester
        const mode = isTester ? requestedMode : 'live';
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

        // Prepare Metadata
        // We need to pass items to the webhook. Stripe metadata has a 500 char limit per key.
        // If items are too long, we might need a different strategy (e.g. storing a temp cart in Firestore).
        // For now, let's try to serialize a simplified version of items.
        const simplifiedItems = (body.items || []).map((item: any) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            sourceStoragePath: item.sourceStoragePath || '',
            modelUrl: item.modelUrl || ''
        }));

        const metadata = {
            customer_email: customerInfo?.email || 'guest@example.com',
            customer_name: customerInfo?.fullName || 'Guest',
            shipping_address: customerInfo ? `${customerInfo.address}, ${customerInfo.city}, ${customerInfo.zipCode}, ${customerInfo.country}` : '',
            firebaseUID: body.userId || '', // Passed from client
            items: JSON.stringify(simplifiedItems).substring(0, 500) // Truncate if too long (TODO: Handle large carts better)
        };

        // Prepare PaymentIntent parameters
        const params: Stripe.PaymentIntentCreateParams = {
            amount: Math.round(amount),
            currency: currency || 'usd',
            automatic_payment_methods: {
                enabled: true,
            },
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
                } else {
                    throw error;
                }
            } else {
                throw error;
            }
        }

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            id: paymentIntent.id
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

        if (snapshot.empty) {
            // Guest checkout (no user account) -> Create a new Customer but don't save to DB (or maybe we should?)
            // For now, let's just create one for this session.
            const customer = await stripe.customers.create({ email, name });
            return customer.id;
        }

        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();

        // 2. Check if user already has a Stripe Customer ID
        if (userData.stripeCustomerId) {
            return userData.stripeCustomerId;
        }

        // 3. If not, create one and save it
        const customer = await stripe.customers.create({
            email,
            name,
            metadata: {
                firebaseUID: userDoc.id
            }
        });

        await userDoc.ref.update({ stripeCustomerId: customer.id });
        return customer.id;

    } catch (e) {
        console.error("Error managing Stripe Customer:", e);
        return undefined;
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
