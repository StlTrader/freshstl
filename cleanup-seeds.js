const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'freshstlstore-99511217';
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!admin.apps.length) {
    try {
        if (clientEmail && privateKey) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey: privateKey.replace(/\\n/g, '\n'),
                })
            });
        } else {
            admin.initializeApp({ projectId: projectId });
        }
    } catch (e) {
        console.log("Failed to init, error:", e);
    }
}

const db = admin.firestore();

const cleanupSeededPosts = async () => {
    const slugsToDelete = [
        "getting-started-3d-printing",
        "top-5-filaments-2025",
        "advanced-slicing-techniques"
    ];

    console.log("Starting cleanup...");

    const snapshot = await db.collection('blog_posts').get();

    let deletedCount = 0;
    const batch = db.batch();

    snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (slugsToDelete.includes(data.slug)) {
            console.log(`Deleting post: ${data.title} (${doc.id})`);
            batch.delete(doc.ref);
            deletedCount++;
        }
    });

    if (deletedCount > 0) {
        await batch.commit();
        console.log(`Successfully deleted ${deletedCount} seeded posts.`);
    } else {
        console.log("No seeded posts found to delete.");
    }
};

cleanupSeededPosts().then(() => {
    console.log("Cleanup complete.");
    process.exit(0);
}).catch(err => {
    console.error("Error cleaning up:", err);
    process.exit(1);
});
