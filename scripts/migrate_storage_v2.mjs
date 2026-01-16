import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

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
    console.log('🔥 Initialized Firebase Admin');
} catch (e) {
    console.error("Failed to initialize Firebase Admin.");
    console.error(e);
    process.exit(1);
}

const db = getFirestore();
const storage = getStorage();
const bucket = storage.bucket();

function getCategorySlug(category) {
    if (!category) return 'misc';
    return category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function getProductSlug(name) {
    return (name || 'product')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

async function uploadFileFromUrl(url, destinationPath, contentType) {
    try {
        console.log(`   ⬇️  Fetching ${url}...`);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
        const buffer = await response.arrayBuffer();
        const file = bucket.file(destinationPath);

        console.log(`   ⬆️  Uploading to ${destinationPath}...`);
        await file.save(Buffer.from(buffer), {
            metadata: { contentType: contentType },
            public: destinationPath.includes('/public/') // Make public if in public folder
        });

        if (destinationPath.includes('/public/')) {
            await file.makePublic();
            return `https://storage.googleapis.com/${bucket.name}/${destinationPath}`;
        } else {
            return destinationPath; // Return path for private files
        }
    } catch (error) {
        console.error(`   ⚠️  Failed to upload asset: ${error.message}`);
        return null;
    }
}

async function migrateProducts() {
    console.log('🚀 Starting Product Storage Migration...');

    const productsSnapshot = await db.collection('products').get();
    let migratedCount = 0;
    let errorCount = 0;

    for (const doc of productsSnapshot.docs) {
        const product = doc.data();
        const productId = doc.id;

        // Check if migration is needed
        // Criteria: Missing previewStoragePath OR sourceStoragePath, OR paths don't match new pattern (must contain /public/ or /private/)
        const hasNewPreview = product.previewStoragePath && product.previewStoragePath.includes('/public/');
        const hasNewSource = product.sourceStoragePath && product.sourceStoragePath.includes('/private/');

        const needsMigration = !hasNewPreview || !hasNewSource;

        if (!needsMigration) {
            console.log(`✅ Product ${product.name} (${productId}) already migrated.`);
            continue;
        }

        console.log(`📦 Migrating Product: ${product.name} (${productId})...`);

        const categorySlug = getCategorySlug(product.category);
        const productSlug = product.slug || getProductSlug(product.name);

        const updates = {};

        // 1. Migrate Model (Preview & Source)
        if (product.modelUrl) {
            const ext = product.modelUrl.split('.').pop().split('?')[0] || 'stl';
            const timestamp = Date.now();

            // Preview Path (Public)
            const previewFilename = `${productSlug}-model-${timestamp}.${ext}`;
            const previewPath = `products/${categorySlug}/${productSlug}/public/preview/${previewFilename}`;

            // Source Path (Private)
            const sourceFilename = `${productSlug}-source-${timestamp}.${ext}`;
            const sourcePath = `products/${categorySlug}/${productSlug}/private/3d-models/${sourceFilename}`;

            // Upload to Preview if needed
            if (!hasNewPreview) {
                const newPreviewUrl = await uploadFileFromUrl(product.modelUrl, previewPath, `model/${ext === 'stl' ? 'stl' : 'gltf-binary'}`);
                if (newPreviewUrl) {
                    updates.previewStoragePath = previewPath;
                    updates.modelUrl = newPreviewUrl; // Update modelUrl to new public URL
                }
            }

            // Upload to Source if needed
            if (!hasNewSource) {
                const newSourcePath = await uploadFileFromUrl(product.modelUrl, sourcePath, `model/${ext === 'stl' ? 'stl' : 'gltf-binary'}`);
                if (newSourcePath) {
                    updates.sourceStoragePath = sourcePath;
                }
            }
        }

        // 2. Migrate Image
        if (product.imageUrl && product.imageUrl.includes('firebasestorage')) {
            // Only migrate if it looks like an old firebase storage URL (not the new public one)
            const ext = 'jpg'; // Assume jpg or extract from URL
            const filename = `${productSlug}-image-${Date.now()}.${ext}`;
            const imagePath = `products/${categorySlug}/${productSlug}/public/images/${filename}`;

            const newImageUrl = await uploadFileFromUrl(product.imageUrl, imagePath, 'image/jpeg');
            if (newImageUrl) {
                updates.imageUrl = newImageUrl;
            }
        }

        // 3. Update Firestore
        if (Object.keys(updates).length > 0) {
            await db.collection('products').doc(productId).update(updates);
            console.log(`   ✨ Updated product ${productId} with:`, updates);
            migratedCount++;
        } else {
            console.log(`   ⚠️  No updates made for ${productId} (maybe files missing or upload failed)`);
            errorCount++;
        }
    }

    console.log(`\n🏁 Migration Complete. Migrated: ${migratedCount}, Errors/Skipped: ${errorCount}`);
}

migrateProducts();
