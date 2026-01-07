import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';

// Initialize Firebase Admin
try {
    let credential = applicationDefault();

    // Check for local service account key
    if (existsSync('./service-account.json')) {
        console.log('🔑 Found service-account.json, using it for credentials...');
        const serviceAccount = JSON.parse(readFileSync('./service-account.json', 'utf8'));
        credential = cert(serviceAccount);
    }

    initializeApp({
        credential: credential,
        projectId: 'freshstlstore-99511217-ca510'
    });
    console.log('🔥 Initialized Firebase Admin for project: freshstlstore-99511217-ca510');
} catch (e) {
    console.error("Failed to initialize Firebase Admin.");
    console.error(e);
    process.exit(1);
}

const db = getFirestore();

const CATEGORIES = [
    "Miniatures",
    "Gadgets",
    "Art",
    "Tools",
    "Home Decor",
    "Toys",
    "Fashion",
    "Jewelry",
    "Cosplay",
    "Tech",
    "Automotive",
    "Architecture"
];

async function seedCategories() {
    console.log('🚀 Seeding Categories...');
    const batch = db.batch();
    const collectionRef = db.collection('categories');

    for (const name of CATEGORIES) {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        // Use slug as ID for easy lookup and uniqueness
        const docRef = collectionRef.doc(slug);

        batch.set(docRef, {
            name: name,
            slug: slug,
            createdAt: Timestamp.now()
        }, { merge: true }); // Merge to avoid overwriting if exists (though we want to ensure they exist)
    }

    await batch.commit();
    console.log(`✅ Successfully seeded ${CATEGORIES.length} categories.`);
}

seedCategories().catch(console.error);
