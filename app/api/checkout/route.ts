import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { amount, currency, customerInfo, paymentMethodId, saveCard } = body;

        // Determine mode and key
        // This route is STRICTLY for Test Mode. Live mode uses Firebase Extension.
        const secretKey = process.env.STRIPE_SECRET_KEY_TEST;

        if (!secretKey) {
            console.error(`Stripe Test Secret Key is missing.`);
            return NextResponse.json(
                { error: 'Stripe configuration error on server.' },
                { status: 500 }
            );
        }

        // STRICT ENFORCEMENT: Only whitelisted users can use this Test Mode route
        const TESTER_EMAILS = ['yassinebouomrine@gmail.com'];
        const userEmail = customerInfo?.email;

        if (!userEmail || !TESTER_EMAILS.includes(userEmail)) {
            console.warn(`Unauthorized access attempt to Test Mode by: ${userEmail}`);
            return NextResponse.json(
                { error: 'Unauthorized: This payment mode is restricted to testers.' },
                { status: 403 }
            );
        }

        // Initialize Stripe
        const stripe = new Stripe(secretKey, {
            apiVersion: '2023-10-16' as any, // Cast to any to avoid strict type checking
        });

        // Prepare PaymentIntent parameters
        const params: Stripe.PaymentIntentCreateParams = {
            amount: Math.round(amount),
            currency: currency || 'usd',
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                customer_email: customerInfo?.email || 'guest@example.com',
                customer_name: customerInfo?.fullName || 'Guest',
                shipping_address: customerInfo ? `${customerInfo.address}, ${customerInfo.city}, ${customerInfo.zipCode}, ${customerInfo.country}` : ''
            },
            receipt_email: customerInfo?.email,
        };

        if (saveCard) {
            params.setup_future_usage = 'off_session';
        }

        if (paymentMethodId) {
            params.payment_method = paymentMethodId;
            // If using a saved payment method, we might need to attach customer
            // But for simplicity in this test route, we assume standard flow
        }

        const paymentIntent = await stripe.paymentIntents.create(params);

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            id: paymentIntent.id
        });

    } catch (error: any) {
        console.error('Stripe Test Checkout Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
