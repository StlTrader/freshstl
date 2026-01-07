import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
try {
    initializeApp({
        credential: applicationDefault(),
        projectId: 'freshstlstore-99511217-ca510'
    });
} catch (e) {
    console.error("Failed to initialize Firebase Admin.");
    console.error(e);
    process.exit(1);
}

const db = getFirestore();

async function checkCollection(name) {
    try {
        const snapshot = await db.collection(name).get();
        console.log(`\n📂 Collection: ${name}`);
        console.log(`   Count: ${snapshot.size}`);
        if (snapshot.size > 0) {
            console.log('   Sample IDs:');
            snapshot.docs.slice(0, 3).forEach(doc => console.log(`   - ${doc.id}`));
        } else {
            console.log('   (Empty)');
        }
        return snapshot.size;
    } catch (error) {
        console.error(`Error fetching ${name}:`, error.message);
        return 0;
    }
}

async function main() {
    console.log("🔍 Checking Firestore Database...");

    await checkCollection('products');
    await checkCollection('users');
    await checkCollection('orders');
    await checkCollection('payments');
    await checkCollection('reviews');
    await checkCollection('coupons');

    console.log("\n✅ Check complete.");
}

main();
