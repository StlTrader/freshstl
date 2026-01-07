import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

// Firebase configuration (same as in your app)
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const samplePosts = [
    {
        title: "The Future of 3D Printing in Cosplay",
        slug: "future-of-3d-printing-cosplay",
        excerpt: "Discover how 3D printing is revolutionizing the cosplay industry, from intricate armor to lightweight props.",
        content: `# The Future of 3D Printing in Cosplay

Cosplay has always been about creativity and craftsmanship. But with the advent of 3D printing, the possibilities have exploded.

## Why 3D Printing?

- **Precision**: Create details impossible by hand.
- **Weight**: Print with low infill for lightweight props.
- **Replicability**: Share files and print again if it breaks.

![Cosplay Armor](https://images.unsplash.com/photo-1615818499660-30356690c534?q=80&w=2070&auto=format&fit=crop)

## Getting Started

1.  **Find a Model**: Sites like Thingiverse or our own store.
2.  **Slice It**: Use Cura or PrusaSlicer.
3.  **Print**: PLA is great for beginners.

> "3D printing allows me to bring my favorite characters to life in ways I never thought possible." - Pro Cosplayer

Stay tuned for more tutorials!`,
        coverImage: "https://images.unsplash.com/photo-1615818499660-30356690c534?q=80&w=2070&auto=format&fit=crop",
        tags: ["cosplay", "3d-printing", "tutorial"],
        category: "Cosplay",
        authorName: "Alex Maker",
        authorId: "admin",
        published: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
    },
    {
        title: "Top 5 Filaments for Miniatures",
        slug: "top-5-filaments-miniatures",
        excerpt: "Not all filaments are created equal. Here are the best ones for printing high-detail miniatures.",
        content: `# Top 5 Filaments for Miniatures

Printing miniatures requires precision. Here are our top picks:

1.  **PLA+**: Stronger than standard PLA.
2.  **Resin**: The gold standard for detail.
3.  **PETG**: Durable but harder to print small details.

## Tips for Success

- Use a smaller nozzle (0.2mm).
- Slow down your print speed.
- Use tree supports.

![Miniatures](https://images.unsplash.com/photo-1596727147705-54a7d0820370?q=80&w=1974&auto=format&fit=crop)

Happy printing!`,
        coverImage: "https://images.unsplash.com/photo-1596727147705-54a7d0820370?q=80&w=1974&auto=format&fit=crop",
        tags: ["miniatures", "filament", "guide"],
        category: "Miniatures",
        authorName: "Sarah Print",
        authorId: "admin",
        published: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
    },
    {
        title: "Designing Functional Parts",
        slug: "designing-functional-parts",
        excerpt: "Learn the engineering principles behind designing 3D printed parts that can withstand real-world use.",
        content: `# Designing Functional Parts

3D printing isn't just for toys. You can make real, useful parts.

## Key Considerations

### Orientation
Print orientation affects strength. Layers are the weak point.

### Wall Thickness
More walls = more strength. Infill matters less.

### Material Choice
- **PLA**: Brittle, low heat resistance.
- **PETG**: Flexible, tough.
- **ASA/ABS**: UV resistant, strong.

![Gears](https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop)

Start designing today!`,
        coverImage: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop",
        tags: ["engineering", "design", "functional"],
        category: "Gadgets",
        authorName: "Mike Engineer",
        authorId: "admin",
        published: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
    },
    {
        title: "Beginner's Guide to 3D Printing",
        slug: "beginners-guide-3d-printing",
        excerpt: "New to 3D printing? Start here with our comprehensive guide covering everything from choosing a printer to your first successful print.",
        content: `# Beginner's Guide to 3D Printing

Welcome to the exciting world of 3D printing!

## Choosing Your First Printer

### Budget Options ($200-$400)
- Creality Ender 3
- Anycubic Kobra

### Mid-Range ($400-$800)
- Prusa Mini
- Bambu Lab A1

## Your First Print

1. Level your bed
2. Load filament
3. Download a test file
4. Slice and print!

![3D Printer](https://images.unsplash.com/photo-1562814644-25a34fe1d9e9?q=80&w=2070&auto=format&fit=crop)

Don't give up after failed prints - it's all part of the learning process!`,
        coverImage: "https://images.unsplash.com/photo-1562814644-25a34fe1d9e9?q=80&w=2070&auto=format&fit=crop",
        tags: ["beginner", "tutorial", "guide"],
        category: "Decorations",
        authorName: "Tutorial Team",
        authorId: "admin",
        published: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
    }
];

async function seedBlog() {
    console.log('🌱 Seeding blog posts...');

    try {
        for (const post of samplePosts) {
            const docRef = await addDoc(collection(db, 'posts'), post);
            console.log(`✅ Added post: "${post.title}" (ID: ${docRef.id})`);
        }

        console.log('🎉 Successfully seeded all blog posts!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding blog posts:', error);
        process.exit(1);
    }
}

seedBlog();
