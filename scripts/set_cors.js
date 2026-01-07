import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
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

const storage = getStorage();
const bucketName = 'freshstlstore-99511217-ca510.firebasestorage.app';
const bucket = storage.bucket(bucketName);

async function setCors() {
    console.log(`Configuring CORS for bucket: ${bucketName}...`);

    const corsConfiguration = [
        {
            origin: ["*"],
            method: ["GET"],
            maxAgeSeconds: 3600
        }
    ];

    try {
        await bucket.setCorsConfiguration(corsConfiguration);
        console.log("✅ CORS configuration updated successfully!");
        console.log("   Allowed Origins: *");
        console.log("   Allowed Methods: GET");
        console.log("   Max Age: 3600 seconds");
    } catch (error) {
        console.error("❌ Failed to set CORS configuration:", error);
    }
}

setCors();
