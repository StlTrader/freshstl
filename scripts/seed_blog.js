const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'freshstl-store.appspot.com' // Replace with your bucket if different
    });
}

const db = admin.firestore();

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
        createdAt: new Date(),
        updatedAt: new Date()
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
        createdAt: new Date(),
        updatedAt: new Date()
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
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

async function seedBlog() {
    console.log('Seeding blog posts...');
    const batch = db.batch();

    for (const post of samplePosts) {
        const ref = db.collection('posts').doc();
        batch.set(ref, post);
    }

    await batch.commit();
    console.log('Successfully seeded blog posts!');
}

seedBlog().catch(console.error);
