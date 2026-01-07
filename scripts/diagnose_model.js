import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';

// Initialize Firebase Admin
try {
    let credential = applicationDefault();
    if (existsSync('./service-account.json')) {
        const serviceAccount = JSON.parse(readFileSync('./service-account.json', 'utf8'));
        credential = cert(serviceAccount);
    }
    initializeApp({
        credential: credential,
        projectId: 'freshstlstore-99511217-ca510'
    });
} catch (e) {
    console.error("Failed to initialize Firebase Admin:", e);
    process.exit(1);
}

const db = getFirestore();

async function diagnose() {
    console.log("🔍 Starting Diagnosis...");

    // 1. Get a product with a modelUrl
    const productsSnapshot = await db.collection('products').where('modelUrl', '!=', '').limit(1).get();

    if (productsSnapshot.empty) {
        console.error("❌ No products found with a modelUrl.");
        return;
    }

    const product = productsSnapshot.docs[0].data();
    const productId = productsSnapshot.docs[0].id;
    console.log(`\n📦 Found Product: ${product.name} (${productId})`);
    console.log(`🔗 Model URL: ${product.modelUrl}`);

    if (!product.modelUrl) {
        console.error("❌ Model URL is empty.");
        return;
    }

    // 2. Check URL accessibility
    try {
        console.log(`\n🌐 Testing URL accessibility...`);
        const response = await fetch(product.modelUrl);

        console.log(`   Status: ${response.status} ${response.statusText}`);
        console.log(`   Content-Type: ${response.headers.get('content-type')}`);
        console.log(`   Content-Length: ${response.headers.get('content-length')}`);
        console.log(`   Access-Control-Allow-Origin: ${response.headers.get('access-control-allow-origin')}`);

        if (!response.ok) {
            console.error(`❌ Failed to fetch model: ${response.statusText}`);
        } else {
            console.log(`✅ URL is accessible.`);

            // Check content type
            const contentType = response.headers.get('content-type');
            if (!contentType || (!contentType.includes('stl') && !contentType.includes('application/octet-stream'))) {
                console.warn(`⚠️  Warning: Content-Type '${contentType}' might not be recognized as STL.`);
            }

            // Check CORS
            const corsHeader = response.headers.get('access-control-allow-origin');
            if (!corsHeader) {
                console.warn(`⚠️  Warning: 'Access-Control-Allow-Origin' header is missing. Browser might block this.`);
            } else if (corsHeader !== '*' && corsHeader !== 'http://localhost:3000') {
                console.warn(`⚠️  Warning: CORS header '${corsHeader}' might be too restrictive.`);
            } else {
                console.log(`✅ CORS header looks good: ${corsHeader}`);
            }
        }

    } catch (error) {
        console.error(`❌ Fetch error:`, error.message);
    }
}

diagnose();
