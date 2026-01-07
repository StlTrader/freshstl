import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
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

    // Try to get project ID from env or service account
    const projectId = process.env.FIREBASE_PROJECT_ID || 'freshstlstore-99511217-ca510';

    initializeApp({
        credential: credential,
        projectId: projectId,
    });
    console.log(`🔥 Initialized Firebase Admin for project: ${projectId}`);
} catch (e) {
    console.error("Failed to initialize Firebase Admin.");
    console.error(e);
    process.exit(1);
}

const db = getFirestore();

function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')        // Replace spaces with -
        .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
        .replace(/\-\-+/g, '-')      // Replace multiple - with single -
        .replace(/^-+/, '')          // Trim - from start of text
        .replace(/-+$/, '');         // Trim - from end of text
}

async function backfillSlugs() {
    console.log('🚀 Starting Slug Backfill...');

    const productsRef = db.collection('products');
    const snapshot = await productsRef.get();

    if (snapshot.empty) {
        console.log('No products found.');
        return;
    }

    const batch = db.batch();
    let count = 0;

    snapshot.forEach(doc => {
        const data = doc.data();
        if (!data.slug && data.name) {
            const slug = slugify(data.name);
            console.log(`Updating ${data.name} -> ${slug}`);
            batch.update(doc.ref, { slug: slug });
            count++;
        } else if (data.slug) {
            console.log(`Skipping ${data.name} (already has slug: ${data.slug})`);
        }
    });

    if (count > 0) {
        await batch.commit();
        console.log(`✅ Successfully backfilled ${count} products with slugs.`);
    } else {
        console.log('✅ All products already have slugs.');
    }
}

backfillSlugs().catch(console.error);
