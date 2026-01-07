import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';
import { readFileSync, existsSync } from 'fs';
import * as readline from 'readline';

// --- Configuration ---
const PROJECT_ID = 'freshstlstore-99511217-ca510';
const STORAGE_BUCKET = `${PROJECT_ID}.firebasestorage.app`;

// --- Initialize Firebase Admin ---
try {
    let credential = applicationDefault();
    if (existsSync('./service-account.json')) {
        const serviceAccount = JSON.parse(readFileSync('./service-account.json', 'utf8'));
        credential = cert(serviceAccount);
    }
    initializeApp({
        credential: credential,
        projectId: PROJECT_ID,
        storageBucket: STORAGE_BUCKET
    });
} catch (e) {
    console.error("Failed to initialize Firebase Admin:", e);
    process.exit(1);
}

const db = getFirestore();
const auth = getAuth();
const storage = getStorage();
const bucket = storage.bucket();

// --- Data Definitions ---

const FAKE_PRODUCTS = [
    {
        id: 'seed_prod_1',
        name: 'Cyberpunk Oni Mask',
        price: 1500,
        description: 'High-detail mask for cosplay. Features separated parts for easy printing.',
        imageUrl: 'https://placehold.co/400x400/1f2937/white?text=Oni+Mask',
        modelUrl: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/stl/binary/colored.stl',
        category: 'Cosplay',
        sales: 12,
        rating: 4.8,
        reviewCount: 5,
        tags: ['cyberpunk', 'mask', 'wearable'],
        isSeed: true
    },
    {
        id: 'seed_prod_2',
        name: 'Ancient Red Dragon',
        price: 2500,
        description: 'Colossal dragon miniature. Standing 200mm tall.',
        imageUrl: 'https://placehold.co/400x400/7f1d1d/white?text=Dragon',
        modelUrl: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/stl/binary/colored.stl',
        category: 'Miniatures',
        sales: 45,
        rating: 5.0,
        reviewCount: 12,
        tags: ['fantasy', 'dragon', 'dnd'],
        isSeed: true
    },
    {
        id: 'seed_prod_3',
        name: 'Mandalorian Helmet',
        price: 3500,
        description: 'Screen-accurate Mandalorian helmet.',
        imageUrl: 'https://placehold.co/400x400/374151/white?text=Mando',
        modelUrl: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/stl/binary/colored.stl',
        category: 'Cosplay',
        sales: 28,
        rating: 4.9,
        reviewCount: 15,
        tags: ['starwars', 'helmet', 'cosplay'],
        isSeed: true
    }
];

const FAKE_USERS = [
    {
        uid: 'seed_user_1',
        email: 'seed_john@example.com',
        displayName: 'Seed John Doe',
        password: 'password123',
        isSeed: true
    },
    {
        uid: 'seed_user_2',
        email: 'seed_jane@example.com',
        displayName: 'Seed Jane Smith',
        password: 'password123',
        isSeed: true
    }
];

// --- Helper Functions ---

const askQuestion = (query) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }));
};

async function uploadDummyAsset(url, destinationPath, contentType) {
    try {
        console.log(`   ⬇️  Downloading ${url}...`);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch ${url}`);
        const buffer = await response.arrayBuffer();
        const file = bucket.file(destinationPath);

        console.log(`   ⬆️  Uploading to ${destinationPath}...`);
        await file.save(Buffer.from(buffer), {
            metadata: { contentType: contentType, metadata: { isSeed: 'true' } },
            public: true
        });

        return `https://storage.googleapis.com/${bucket.name}/${destinationPath}`;
    } catch (error) {
        console.error(`   ⚠️  Failed to upload asset: ${error.message}`);
        return '';
    }
}

// --- Cleanup Logic ---

async function cleanDatabase() {
    console.log('\n🧹 Cleaning up OLD seed data...');

    // 1. Clean Firestore Collections
    const collections = ['products', 'orders', 'payments', 'reviews', 'coupons', 'users'];
    for (const colName of collections) {
        // Delete docs with isSeed: true
        const snapshot = await db.collection(colName).where('isSeed', '==', true).get();
        if (!snapshot.empty) {
            const batch = db.batch();
            snapshot.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
            console.log(`   - Deleted ${snapshot.size} seed documents from '${colName}'`);
        }

        // Also check for IDs starting with 'seed_' (legacy check)
        const snapshotLegacy = await db.collection(colName).get();
        const legacyBatch = db.batch();
        let legacyCount = 0;
        snapshotLegacy.docs.forEach(doc => {
            if (doc.id.startsWith('seed_')) {
                legacyBatch.delete(doc.ref);
                legacyCount++;
            }
        });
        if (legacyCount > 0) {
            await legacyBatch.commit();
            console.log(`   - Deleted ${legacyCount} legacy seed documents from '${colName}'`);
        }
    }

    // 2. Clean Auth Users
    console.log('   - Cleaning Auth users...');
    let pageToken;
    do {
        const listUsersResult = await auth.listUsers(1000, pageToken);
        const usersToDelete = listUsersResult.users
            .filter(u => u.email?.startsWith('seed_') || u.uid.startsWith('seed_'))
            .map(u => u.uid);

        if (usersToDelete.length > 0) {
            await auth.deleteUsers(usersToDelete);
            console.log(`   - Deleted ${usersToDelete.length} seed users from Auth`);
        }
        pageToken = listUsersResult.pageToken;
    } while (pageToken);

    // 3. Clean Storage
    console.log('   - Cleaning Storage...');
    const [files] = await bucket.getFiles({ prefix: 'products/' });
    let fileCount = 0;
    for (const file of files) {
        // Check metadata or filename pattern
        // Since we can't easily check metadata in list without extra calls, 
        // we'll rely on the filename pattern matching our seed IDs
        if (file.name.includes('seed_prod_')) {
            await file.delete();
            fileCount++;
        }
    }
    console.log(`   - Deleted ${fileCount} seed files from Storage`);
}

// --- Seeding Logic ---

async function seedDatabase() {
    console.log('\n🌱 Seeding NEW data...');

    // 1. Seed Users
    for (const user of FAKE_USERS) {
        try {
            await auth.createUser({
                uid: user.uid,
                email: user.email,
                password: user.password,
                displayName: user.displayName
            });
            console.log(`   - Created user: ${user.email}`);

            // Create User Doc
            await db.collection('users').doc(user.uid).set({
                email: user.email,
                displayName: user.displayName,
                createdAt: Timestamp.now(),
                role: 'customer',
                isSeed: true
            });
        } catch (e) {
            if (e.code === 'auth/uid-already-exists' || e.code === 'auth/email-already-exists') {
                console.log(`   - User ${user.email} already exists (skipped)`);
            } else {
                console.error(`   - Failed to create user ${user.email}:`, e.message);
            }
        }
    }

    // 2. Seed Products
    const batch = db.batch();
    for (const product of FAKE_PRODUCTS) {
        console.log(`   - Processing product: ${product.name}`);

        // Upload Assets
        const imagePath = `products/${product.id}.jpg`;
        const modelPath = `products/models/${product.id}.stl`;

        const imageUrl = await uploadDummyAsset(product.imageUrl, imagePath, 'image/jpeg');
        const modelUrl = await uploadDummyAsset(product.modelUrl, modelPath, 'model/stl');

        const productData = {
            ...product,
            imageUrl: imageUrl || product.imageUrl,
            modelUrl: modelUrl || product.modelUrl,
            createdAt: Timestamp.now()
        };

        const ref = db.collection('products').doc(product.id);
        batch.set(ref, productData);
    }
    await batch.commit();
    console.log(`   - Seeded ${FAKE_PRODUCTS.length} products`);

    // 3. Seed Orders (Sample)
    const orderBatch = db.batch();
    const user = FAKE_USERS[0];
    const product = FAKE_PRODUCTS[0];

    const orderId = `seed_order_${Date.now()}`;
    const orderRef = db.collection('orders').doc(orderId);
    orderBatch.set(orderRef, {
        userId: user.uid,
        items: [{ id: product.id, name: product.name, price: product.price, quantity: 1 }],
        amount: product.price,
        status: 'completed',
        date: Timestamp.now(),
        isSeed: true
    });
    await orderBatch.commit();
    console.log(`   - Seeded 1 sample order`);
}

// --- Main ---

async function main() {
    console.log('⚠️  WARNING: This script will DELETE all data marked as "seed" or with IDs starting with "seed_".');
    console.log('⚠️  Real user data will NOT be touched.');

    const answer = await askQuestion('Type "yes" to proceed with CLEANUP: ');

    if (answer.toLowerCase() !== 'yes') {
        console.log('❌ Aborted.');
        process.exit(0);
    }

    try {
        await cleanDatabase();

        const seedAnswer = await askQuestion('Do you want to SEED new data? (yes/no): ');
        if (seedAnswer.toLowerCase() === 'yes') {
            await seedDatabase();
            console.log('\n✨ Done! Database is clean and re-seeded.');
        } else {
            console.log('\n✨ Done! Database is clean (no new data seeded).');
        }
    } catch (error) {
        console.error('\n❌ Error:', error);
    }
    process.exit(0);
}

main();
