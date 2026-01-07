import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
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
} catch (e) {
    console.error("Failed to initialize Firebase Admin.");
    console.error(e);
    process.exit(1);
}

import { getStorage } from 'firebase-admin/storage';

// ... (imports)

const storage = getStorage();
const bucket = storage.bucket('freshstlstore-99511217-ca510.firebasestorage.app');

// Helper to upload a dummy file from a URL to Firebase Storage
async function uploadDummyAsset(url, destinationPath, contentType) {
    try {
        console.log(`   ⬇️  Downloading ${url}...`);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
        const buffer = await response.arrayBuffer();
        const file = bucket.file(destinationPath);

        console.log(`   ⬆️  Uploading to ${destinationPath}...`);
        await file.save(Buffer.from(buffer), {
            metadata: { contentType: contentType },
            public: true // Make public for easy access
        });

        // Construct public URL
        // For Firebase Storage buckets, the public URL format is usually:
        // https://storage.googleapis.com/<bucket-name>/<path>
        // Or if using the default App Engine bucket:
        // https://firebasestorage.googleapis.com/v0/b/<bucket-name>/o/<encoded-path>?alt=media

        // We'll use the signed URL approach or public URL if makePublic worked
        // But for simplicity in this seed script, let's try to get a signed URL or just construct the public one
        // Since we set public: true, we can use the public link.

        // Note: 'public: true' makes it accessible via https://storage.googleapis.com/BUCKET_NAME/FILE_PATH
        return `https://storage.googleapis.com/${bucket.name}/${destinationPath}`;
    } catch (error) {
        console.error(`   ⚠️  Failed to upload asset: ${error.message}`);
        return ''; // Return empty string on failure so we can still seed the product
    }
}

async function seedProducts() {
    console.log('\n📦 Seeding Products...');
    const batch = db.batch();

    // Use a single dummy STL for all products for now
    const DUMMY_STL_URL = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/stl/binary/colored.stl';

    for (const product of FAKE_PRODUCTS) {
        console.log(`   Processing ${product.name}...`);

        // 1. Upload Image
        const imagePath = `products/${product.id}.jpg`;
        // Use the placeholder URL from the product data as the source
        const imageUrl = await uploadDummyAsset(product.imageUrl, imagePath, 'image/jpeg');

        // 2. Upload Model
        const modelPath = `products/models/${product.id}.stl`;
        const modelUrl = await uploadDummyAsset(DUMMY_STL_URL, modelPath, 'model/stl');

        // Update product data with new URLs (if upload succeeded, otherwise keep original/empty)
        if (imageUrl) product.imageUrl = imageUrl;
        if (modelUrl) product.modelUrl = modelUrl;

        const productRef = db.collection('products').doc(product.id);
        batch.set(productRef, product);
    }

    await batch.commit();
    console.log(`✅ Seeded ${FAKE_PRODUCTS.length} products with assets`);
}

async function seedCoupons() {
    console.log('\n🎟️  Seeding Coupons...');
    const batch = db.batch();

    for (const coupon of FAKE_COUPONS) {
        const couponRef = db.collection('coupons').doc(coupon.code);
        batch.set(couponRef, coupon);
    }

    await batch.commit();
    console.log(`✅ Seeded ${FAKE_COUPONS.length} coupons`);
}

async function seedReviews(users) {
    console.log('\n⭐ Seeding Reviews...');
    const reviewComments = [
        'Amazing quality! Printed perfectly on my Ender 3.',
        'Great model, highly detailed. Worth every penny!',
        'Good design but needed some cleanup after printing.',
        'Perfect for my D&D campaign. Players loved it!',
        'Easy to print, no supports needed. Excellent!',
        'The details are incredible. Best purchase yet!',
        'Printed great, but took longer than expected.',
        'Absolutely love it! Will buy more from this seller.',
        'Good value for money. Recommended!',
        'Nice model but had some layer issues.',
        'Fantastic! Exactly as described.',
        'Very satisfied with this purchase.',
        'Could use better instructions, but great model.',
        'Printed flawlessly. 10/10 would recommend!',
        'Beautiful design, easy assembly.'
    ];

    let reviewCount = 0;

    for (const product of FAKE_PRODUCTS) {
        // Generate 3-8 random reviews per product
        const numReviews = Math.floor(Math.random() * 6) + 3;

        for (let i = 0; i < numReviews; i++) {
            const user = randomItem(users);
            const rating = Math.random() > 0.3 ? (Math.random() > 0.5 ? 5 : 4) : Math.floor(Math.random() * 3) + 3;

            const review = {
                productId: product.id,
                userId: user.uid,
                userName: user.displayName,
                rating: rating,
                comment: randomItem(reviewComments),
                date: randomDateWithinDays(90)
            };

            await db.collection('reviews').add(review);
            reviewCount++;
        }
    }

    console.log(`✅ Seeded ${reviewCount} reviews`);
}

async function seedOrdersAndPayments(users) {
    console.log('\n🛒 Seeding Orders and Payments...');

    const statuses = ['completed', 'completed', 'completed', 'pending', 'failed'];
    const paymentStatuses = ['succeeded', 'succeeded', 'succeeded', 'pending', 'failed'];
    const cardBrands = ['visa', 'mastercard', 'amex', 'discover'];

    let orderCount = 0;
    let paymentCount = 0;

    // Generate 3-7 orders per user
    for (const user of users) {
        const numOrders = Math.floor(Math.random() * 5) + 3;

        for (let i = 0; i < numOrders; i++) {
            const orderId = `order_${user.uid}_${Date.now()}_${i}`;
            const paymentId = `pay_${user.uid}_${Date.now()}_${i}`;

            // Random 1-3 items per order
            const numItems = Math.floor(Math.random() * 3) + 1;
            const orderItems = randomItems(FAKE_PRODUCTS, numItems).map(p => ({
                id: p.id,
                name: p.name,
                price: p.price
            }));

            const subtotal = orderItems.reduce((sum, item) => sum + item.price, 0);
            const discountApplied = Math.random() > 0.7 ? Math.floor(subtotal * 0.1) : 0;
            const total = subtotal - discountApplied;

            const orderDate = randomDateWithinDays(120);
            const status = randomItem(statuses);
            const paymentStatus = randomItem(paymentStatuses);

            // Create Order
            const order = {
                userId: user.uid,
                transactionId: `txn_${Math.random().toString(36).substr(2, 9)}`,
                amount: subtotal,
                discountApplied: discountApplied,
                items: orderItems,
                date: orderDate,
                status: status,
                customerInfo: {
                    fullName: user.displayName,
                    email: user.email,
                    phone: `+1 555-${Math.floor(Math.random() * 9000) + 1000}`,
                    address: `${Math.floor(Math.random() * 9999) + 1} Main Street`,
                    city: randomItem(['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia']),
                    zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
                    country: 'United States'
                },
                paymentId: paymentId
            };

            await db.collection('orders').doc(orderId).set(order);
            orderCount++;

            // Create Payment
            const payment = {
                orderId: orderId,
                userId: user.uid,
                amount: total,
                currency: 'usd',
                status: paymentStatus,
                paymentMethod: 'card',
                stripePaymentIntentId: `pi_${Math.random().toString(36).substr(2, 16)}`,
                cardBrand: randomItem(cardBrands),
                cardLast4: `${Math.floor(Math.random() * 9000) + 1000}`,
                createdAt: orderDate,
                updatedAt: orderDate
            };

            await db.collection('payments').doc(paymentId).set(payment);
            paymentCount++;
        }
    }

    console.log(`✅ Seeded ${orderCount} orders`);
    console.log(`✅ Seeded ${paymentCount} payments`);
}

async function seedWishlists(users) {
    console.log('\n❤️  Seeding Wishlists...');

    let wishlistCount = 0;

    for (const user of users) {
        // Random 2-5 products in wishlist
        const numWishlistItems = Math.floor(Math.random() * 4) + 2;
        const wishlistProducts = randomItems(FAKE_PRODUCTS, numWishlistItems);

        for (const product of wishlistProducts) {
            await db.collection('users').doc(user.uid)
                .collection('wishlist').doc(product.id).set({
                    addedAt: randomDateWithinDays(60)
                });

            wishlistCount++;
        }
    }

    console.log(`✅ Seeded ${wishlistCount} wishlist items`);
}

// ========== MAIN EXECUTION ==========

async function main() {
    console.log('🚀 Starting Firebase Data Seeding (Official Schema)...');

    try {
        // Seed in order (users first, then data that depends on users)
        const users = await seedUsers();
        await seedProducts();
        await seedCoupons();
        await seedReviews(users);
        await seedOrdersAndPayments(users);
        await seedWishlists(users);

        console.log('\n✨ All data seeded successfully!');

    } catch (error) {
        console.error('\n❌ Error during seeding:', error);
        process.exit(1);
    }

    process.exit(0);
}

// Run the seeding
main();
