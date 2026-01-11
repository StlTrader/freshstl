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

const seedBlogPosts = async () => {
    const posts = [
        {
            title: "Getting Started with 3D Printing",
            slug: "getting-started-3d-printing",
            excerpt: "Learn the basics of 3D printing, from choosing your first printer to slicing your first model.",
            content: "Full content here...",
            category: "Beginner Guide",
            published: true,
            createdAt: admin.firestore.Timestamp.now(),
            updatedAt: admin.firestore.Timestamp.now(),
            coverImage: "https://images.unsplash.com/photo-1631541909061-71e349d1f203?w=800&q=80"
        },
        {
            title: "Top 5 Filaments for 2025",
            slug: "top-5-filaments-2025",
            excerpt: "We review the best PLA, PETG, and TPU filaments available on the market this year.",
            content: "Full content here...",
            category: "Reviews",
            published: true,
            createdAt: admin.firestore.Timestamp.now(),
            updatedAt: admin.firestore.Timestamp.now(),
            coverImage: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80"
        },
        {
            title: "Advanced Slicing Techniques",
            slug: "advanced-slicing-techniques",
            excerpt: "Master your slicer settings to improve print quality and reduce print time.",
            content: "Full content here...",
            category: "Tutorial",
            published: true,
            createdAt: admin.firestore.Timestamp.now(),
            updatedAt: admin.firestore.Timestamp.now(),
            coverImage: "https://images.unsplash.com/photo-1615811361524-78849ce5297f?w=800&q=80"
        }
    ];

    for (const post of posts) {
        await db.collection('blog_posts').add(post);
        console.log(`Added post: ${post.title}`);
    }
};

seedBlogPosts().then(() => {
    console.log("Seeding complete.");
    process.exit(0);
}).catch(err => {
    console.error("Error seeding:", err);
    process.exit(1);
});
