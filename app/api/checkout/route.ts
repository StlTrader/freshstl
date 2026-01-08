import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { amount, currency, customerInfo, paymentMethodId, saveCard } = body;

        // Initialize Stripe with Test Secret Key
        // Note: In a real app, you might want to fetch this from Firestore or Secret Manager if not in env
        // But for security, Env vars are best.
        const stripe = new Stripe(process.env.STRIPE_TEST_SECRET_KEY || '', {
            apiVersion: '2025-11-17.clover' as any, // Cast to any to avoid strict type checking if types update
        });

        if (!process.env.STRIPE_TEST_SECRET_KEY) {
            return NextResponse.json(
                { error: 'Stripe Test Secret Key is not configured on the server.' },
                { status: 500 }
            );
        }

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
