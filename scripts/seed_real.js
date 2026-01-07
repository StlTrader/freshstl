import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';
import { readFileSync, existsSync } from 'fs';
import { faker } from '@faker-js/faker';

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
        projectId: 'freshstlstore-99511217-ca510',
        storageBucket: 'freshstlstore-99511217-ca510.firebasestorage.app'
    });
    console.log('🔥 Initialized Firebase Admin for project: freshstlstore-99511217-ca510');
} catch (e) {
    console.error("Failed to initialize Firebase Admin.");
    console.error(e);
    process.exit(1);
}

const db = getFirestore();
const auth = getAuth();
const storage = getStorage();
const bucket = storage.bucket();

// --- CONFIGURATION ---
const NUM_USERS = 20;
const MAX_ORDERS_PER_USER = 5;
const MAX_REVIEWS_PER_PRODUCT = 8;

// --- REALISTIC PRODUCT DATA ---
const REAL_PRODUCTS = [
    {
        name: 'Cyberpunk Oni Mask',
        price: 25.00,
        description: 'High-detail mask for cosplay. Features separated parts for easy printing and assembly. Optimized for FDM printers.',
        category: 'Cosplay',
        tags: ['cyberpunk', 'mask', 'wearable', 'scifi'],
        imageSource: 'https://placehold.co/600x600/1f2937/white?text=Oni+Mask',
        modelSource: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/stl/binary/colored.stl' // Dummy STL
    },
    {
        name: 'Ancient Red Dragon',
        price: 45.00,
        description: 'Colossal dragon miniature. Standing 200mm tall, this model comes pre-supported and hollowed for resin printing.',
        category: 'Miniatures',
        tags: ['fantasy', 'dragon', 'dnd', 'tabletop'],
        imageSource: 'https://placehold.co/600x600/7f1d1d/white?text=Red+Dragon',
        modelSource: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/stl/binary/colored.stl'
    },
    {
        name: 'Voronoi Planter',
        price: 12.00,
        description: 'Modern geometric planter with Voronoi pattern. Perfect for succulents. Prints without supports.',
        category: 'Home Decor',
        tags: ['home', 'modern', 'vase', 'planter'],
        imageSource: 'https://placehold.co/600x600/065f46/white?text=Voronoi+Planter',
        modelSource: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/stl/binary/colored.stl'
    },
    {
        name: 'Mandalorian Helmet',
        price: 35.00,
        description: 'Screen-accurate Mandalorian helmet. Full size wearable replica with separate visor piece.',
        category: 'Cosplay',
        tags: ['starwars', 'helmet', 'cosplay', 'scifi'],
        imageSource: 'https://placehold.co/600x600/374151/white?text=Mando+Helmet',
        modelSource: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/stl/binary/colored.stl'
    },
    {
        name: 'Articulated Crystal Dragon',
        price: 18.00,
        description: 'Print-in-place articulated dragon. No assembly required. Flexible joints for posing.',
        category: 'Toys',
        tags: ['articulated', 'dragon', 'fidget', 'toy'],
        imageSource: 'https://placehold.co/600x600/4b5563/white?text=Crystal+Dragon',
        modelSource: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/stl/binary/colored.stl'
    },
    {
        name: 'Geometric Desk Organizer',
        price: 15.00,
        description: 'Modular honeycomb desk organizer. Stack and combine pieces to fit your workspace.',
        category: 'Home Decor',
        tags: ['office', 'organization', 'modular', 'desk'],
        imageSource: 'https://placehold.co/600x600/1e3a8a/white?text=Desk+Organizer',
        modelSource: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/stl/binary/colored.stl'
    },
    {
        name: 'Goblin King Miniature',
        price: 8.00,
        description: '32mm scale tabletop miniature. Highly detailed with ornate throne base.',
        category: 'Miniatures',
        tags: ['goblin', 'dnd', 'tabletop', 'fantasy'],
        imageSource: 'https://placehold.co/600x600/14532d/white?text=Goblin+King',
        modelSource: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/stl/binary/colored.stl'
    },
    {
        name: 'Mechanical Keyboard Keycaps',
        price: 22.00,
        description: 'Full set of 104 artisan keycaps with custom legends. Cherry MX compatible.',
        category: 'Tech',
        tags: ['keyboard', 'tech', 'gaming', 'keycaps'],
        imageSource: 'https://placehold.co/600x600/be185d/white?text=Keycaps',
        modelSource: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/stl/binary/colored.stl'
    },
    {
        name: 'Low Poly Wolf',
        price: 10.00,
        description: 'Elegant low-poly wolf sculpture. Perfect centerpiece for your desk or shelf.',
        category: 'Art',
        tags: ['lowpoly', 'animal', 'sculpture', 'art'],
        imageSource: 'https://placehold.co/600x600/374151/white?text=Low+Poly+Wolf',
        modelSource: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/stl/binary/colored.stl'
    },
    {
        name: 'Samurai Phone Stand',
        price: 14.00,
        description: 'Samurai warrior themed phone stand. Holds phones up to 7 inches.',
        category: 'Tech',
        tags: ['phone', 'stand', 'samurai', 'desk'],
        imageSource: 'https://placehold.co/600x600/991b1b/white?text=Phone+Stand',
        modelSource: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/stl/binary/colored.stl'
    },
    {
        name: 'Baby Yoda Figure',
        price: 20.00,
        description: 'Adorable figure with floating pod. Multi-part assembly for easy painting.',
        category: 'Toys',
        tags: ['starwars', 'grogu', 'toy', 'figure'],
        imageSource: 'https://placehold.co/600x600/166534/white?text=Baby+Yoda',
        modelSource: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/stl/binary/colored.stl'
    },
    {
        name: 'Dungeon Terrain Set',
        price: 55.00,
        description: 'Complete modular dungeon terrain set. Includes walls, floors, doors, and props.',
        category: 'Miniatures',
        tags: ['terrain', 'dnd', 'modular', 'rpg'],
        imageSource: 'https://placehold.co/600x600/4b5563/white?text=Dungeon+Set',
        modelSource: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/stl/binary/colored.stl'
    }
];

// --- HELPERS ---

async function clearDatabase() {
    console.log('🧹 Clearing Database...');

    // 1. Clear Firestore Collections
    const collections = ['products', 'users', 'orders', 'reviews', 'coupons', 'payments', 'wishlist'];
    for (const col of collections) {
        const snapshot = await db.collection(col).get();
        if (snapshot.size === 0) continue;

        const batch = db.batch();
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        console.log(`   Deleted ${snapshot.size} docs from ${col}`);
    }

    // 2. Clear Storage Bucket
    console.log('🧹 Clearing Storage...');
    const [files] = await bucket.getFiles();
    if (files.length > 0) {
        // Delete in chunks to avoid limits if many files
        const deletePromises = files.map(file => file.delete());
        await Promise.all(deletePromises);
        console.log(`   Deleted ${files.length} files from storage`);
    } else {
        console.log('   Storage already empty');
    }
}

async function uploadDummyAsset(url, destinationPath, contentType) {
    try {
        // console.log(`   ⬇️  Fetching ${url}...`);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
        const buffer = await response.arrayBuffer();
        const file = bucket.file(destinationPath);

        // console.log(`   ⬆️  Uploading to ${destinationPath}...`);
        await file.save(Buffer.from(buffer), {
            metadata: { contentType: contentType },
            public: true
        });

        // Make public
        await file.makePublic();

        // Return public URL
        return `https://storage.googleapis.com/${bucket.name}/${destinationPath}`;
    } catch (error) {
        console.error(`   ⚠️  Failed to upload asset: ${error.message}`);
        return '';
    }
}

// --- SEEDING FUNCTIONS ---

async function seedUsers() {
    console.log('\n👥 Seeding Users...');
    const users = [];

    // Create admin user first (optional, but good for testing)
    const adminData = {
        uid: 'admin_user',
        email: 'admin@freshstl.com',
        displayName: 'Admin User',
        photoURL: faker.image.avatar(),
        role: 'admin',
        createdAt: new Date()
    };
    users.push(adminData);
    await db.collection('users').doc(adminData.uid).set(adminData);

    // Create random users
    const batch = db.batch();
    for (let i = 0; i < NUM_USERS; i++) {
        const uid = faker.string.uuid();
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const user = {
            uid: uid,
            email: faker.internet.email({ firstName, lastName }),
            displayName: `${firstName} ${lastName}`,
            photoURL: faker.image.avatar(),
            createdAt: faker.date.past(),
            role: 'customer'
        };
        users.push(user);
        batch.set(db.collection('users').doc(uid), user);
    }
    await batch.commit();
    console.log(`✅ Seeded ${users.length} users`);
    return users;
}

async function seedProducts() {
    console.log('\n📦 Seeding Products (with Storage assets)...');
    const products = [];

    for (const prodData of REAL_PRODUCTS) {
        const productId = faker.string.uuid(); // or slugify name
        console.log(`   Processing ${prodData.name}...`);

        // Upload Image
        const imagePath = `products/${productId}/image.jpg`;
        const imageUrl = await uploadDummyAsset(prodData.imageSource, imagePath, 'image/jpeg');

        // Upload Model
        const modelPath = `products/${productId}/model.stl`;
        const modelUrl = await uploadDummyAsset(prodData.modelSource, modelPath, 'model/stl');

        const product = {
            id: productId,
            name: prodData.name,
            price: prodData.price,
            description: prodData.description,
            category: prodData.category,
            tags: prodData.tags,
            imageUrl: imageUrl || prodData.imageSource, // Fallback if upload fails
            modelUrl: modelUrl,
            rating: faker.number.float({ min: 3.5, max: 5, precision: 0.1 }),
            reviewCount: faker.number.int({ min: 0, max: 50 }),
            sales: faker.number.int({ min: 0, max: 200 }),
            createdAt: faker.date.past()
        };

        await db.collection('products').doc(productId).set(product);
        products.push(product);
    }
    console.log(`✅ Seeded ${products.length} products`);
    return products;
}

async function seedOrdersAndReviews(users, products) {
    console.log('\n🛒 Seeding Orders & Reviews...');

    let orderCount = 0;
    let reviewCount = 0;
    const batchSize = 500;
    let batch = db.batch();
    let opCount = 0;

    for (const user of users) {
        // Random orders per user
        const numOrders = faker.number.int({ min: 0, max: MAX_ORDERS_PER_USER });

        for (let i = 0; i < numOrders; i++) {
            const orderId = `order_${faker.string.alphanumeric(10)}`;
            const numItems = faker.number.int({ min: 1, max: 4 });
            const orderItems = faker.helpers.arrayElements(products, numItems).map(p => ({
                id: p.id,
                name: p.name,
                price: p.price,
                imageUrl: p.imageUrl
            }));

            const subtotal = orderItems.reduce((sum, item) => sum + item.price, 0);
            const status = faker.helpers.arrayElement(['completed', 'completed', 'pending', 'processing']);
            const orderDate = faker.date.past();

            const order = {
                id: orderId,
                userId: user.uid,
                items: orderItems,
                amount: subtotal,
                status: status,
                date: orderDate,
                customerInfo: {
                    fullName: user.displayName,
                    email: user.email,
                    address: faker.location.streetAddress(),
                    city: faker.location.city(),
                    zipCode: faker.location.zipCode(),
                    country: faker.location.country()
                },
                paymentId: `pay_${faker.string.alphanumeric(10)}`
            };

            batch.set(db.collection('orders').doc(orderId), order);
            opCount++;
            orderCount++;

            // Maybe add a review for one of the items
            if (status === 'completed' && Math.random() > 0.5) {
                const reviewedProduct = orderItems[0];
                const review = {
                    productId: reviewedProduct.id,
                    userId: user.uid,
                    userName: user.displayName,
                    userAvatar: user.photoURL,
                    rating: faker.number.int({ min: 3, max: 5 }),
                    comment: faker.lorem.sentence(),
                    date: faker.date.between({ from: orderDate, to: new Date() })
                };
                batch.add(db.collection('reviews'), review);
                opCount++;
                reviewCount++;
            }

            if (opCount >= batchSize) {
                await batch.commit();
                batch = db.batch();
                opCount = 0;
            }
        }
    }

    if (opCount > 0) await batch.commit();
    console.log(`✅ Seeded ${orderCount} orders`);
    console.log(`✅ Seeded ${reviewCount} reviews`);
}

async function seedCoupons() {
    console.log('\n🎟️  Seeding Coupons...');
    const coupons = [
        { code: 'WELCOME10', discountPercent: 10, isActive: true },
        { code: 'SUMMER20', discountPercent: 20, isActive: true },
        { code: 'FRESHSTL', discountPercent: 15, isActive: true },
        { code: 'EXPIRED50', discountPercent: 50, isActive: false }
    ];

    const batch = db.batch();
    for (const c of coupons) {
        batch.set(db.collection('coupons').doc(c.code), c);
    }
    await batch.commit();
    console.log(`✅ Seeded ${coupons.length} coupons`);
}

// --- MAIN ---

async function main() {
    console.log('🚀 Starting REAL Data Seeding...');
    console.log('⚠️  WARNING: This will DELETE ALL existing data in Firestore and Storage!');

    // Add a small delay/confirmation if this were a CLI tool, but for now we just run it.

    try {
        await clearDatabase();

        const users = await seedUsers();
        const products = await seedProducts();
        await seedCoupons();
        await seedOrdersAndReviews(users, products);

        console.log('\n✨ Seeding Complete!');
    } catch (error) {
        console.error('\n❌ Seeding Failed:', error);
        process.exit(1);
    }
}

main();
