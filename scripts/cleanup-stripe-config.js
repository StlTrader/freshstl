const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json'); // I need to make sure this exists or use default credentials

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function cleanup() {
    const stripeRef = db.collection('settings').doc('stripe');
    const doc = await stripeRef.get();

    if (!doc.exists) {
        console.log("Stripe settings document not found.");
        return;
    }

    const data = doc.data();
    const cleanData = {
        testPublicKey: data.testPublicKey,
        testSecretKey: data.testSecretKey,
        testWebhookSecret: data.testWebhookSecret,
        livePublicKey: data.livePublicKey,
        liveSecretKey: data.liveSecretKey,
        liveWebhookSecret: data.liveWebhookSecret,
        testerEmails: data.testerEmails || [],
        isConnected: data.isConnected || false,
        mode: data.mode || 'test',
        minDelay: data.minDelay || 1000,
        maxDelay: data.maxDelay || 2500,
        failureRate: data.failureRate || 0
    };

    await stripeRef.set(cleanData);
    console.log("Stripe settings cleaned up successfully.");

    // Also update public config
    const publicRef = db.collection('settings').doc('stripe_public');
    const publicData = {
        testPublicKey: data.testPublicKey,
        livePublicKey: data.livePublicKey,
        testerEmails: data.testerEmails || [],
        isConnected: data.isConnected || false,
        mode: data.mode || 'test'
    };
    await publicRef.set(publicData);
    console.log("Stripe public settings updated successfully.");
}

cleanup().catch(console.error);
