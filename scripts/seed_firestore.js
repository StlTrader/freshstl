import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
try {
    initializeApp({
        credential: applicationDefault(),
        projectId: 'freshstlstore-99511217-ca510'
    });
} catch (e) {
    console.error("Failed to initialize Firebase Admin. Make sure you are logged in with 'gcloud auth application-default login' or have GOOGLE_APPLICATION_CREDENTIALS set.");
    console.error(e);
    process.exit(1);
}

const db = getFirestore();

const DEFAULT_MOCK_PRODUCTS = [
    {
        id: '1',
        name: 'Cyberpunk Oni Mask',
        price: 1500,
        description: 'High-detail mask for cosplay. Features separated parts for easy printing and assembly. Optimized for FDM printers.',
        imageUrl: 'https://placehold.co/400x400/1f2937/white?text=Oni+Mask',
        modelUrl: '',
        category: 'Cosplay',
        sales: 12,
        rating: 4.8,
        reviewCount: 5,
        tags: ['cyberpunk', 'mask', 'wearable']
    },
    {
        id: '2',
        name: 'Ancient Red Dragon',
        price: 2500,
        description: 'Colossal dragon miniature. Standing 200mm tall, this model comes pre-supported and hollowed.',
        imageUrl: 'https://placehold.co/400x400/1f2937/white?text=Dragon',
        modelUrl: '',
        category: 'Miniatures',
        sales: 45,
        rating: 5.0,
        reviewCount: 12,
        tags: ['fantasy', 'dragon', 'dnd']
    },
    {
        id: '3',
        name: 'Voronoi Planter',
        price: 500,
        description: 'Modern geometric planter with Voronoi pattern. Perfect for succulents. Prints without supports.',
        imageUrl: 'https://placehold.co/400x400/1f2937/white?text=Planter',
        modelUrl: '',
        category: 'Home Decor',
        sales: 8,
        rating: 4.2,
        reviewCount: 3,
        tags: ['home', 'modern', 'vase']
    },
    {
        id: '4',
        name: 'Mandalorian Helmet',
        price: 3500,
        description: 'Screen-accurate Mandalorian helmet. Full size wearable replica with separate visor piece.',
        imageUrl: 'https://placehold.co/400x400/374151/white?text=Mando+Helmet',
        modelUrl: '',
        category: 'Cosplay',
        sales: 28,
        rating: 4.9,
        reviewCount: 15,
        tags: ['starwars', 'helmet', 'cosplay']
    },
    {
        id: '5',
        name: 'Articulated Crystal Dragon',
        price: 1200,
        description: 'Print-in-place articulated dragon. No assembly required. Flexible joints for posing.',
        imageUrl: 'https://placehold.co/400x400/4b5563/white?text=Flexi+Dragon',
        modelUrl: '',
        category: 'Toys',
        sales: 89,
        rating: 4.7,
        reviewCount: 32,
        tags: ['articulated', 'dragon', 'fidget']
    },
    {
        id: '6',
        name: 'Geometric Desk Organizer',
        price: 800,
        description: 'Modular honeycomb desk organizer. Stack and combine pieces to fit your workspace.',
        imageUrl: 'https://placehold.co/400x400/6b7280/white?text=Organizer',
        modelUrl: '',
        category: 'Home Decor',
        sales: 34,
        rating: 4.5,
        reviewCount: 8,
        tags: ['office', 'organization', 'modular']
    },
    {
        id: '7',
        name: 'Goblin King Miniature',
        price: 600,
        description: '32mm scale tabletop miniature. Highly detailed with ornate throne base.',
        imageUrl: 'https://placehold.co/400x400/1f2937/white?text=Goblin+King',
        modelUrl: '',
        category: 'Miniatures',
        sales: 56,
        rating: 4.8,
        reviewCount: 18,
        tags: ['goblin', 'dnd', 'tabletop']
    },
    {
        id: '8',
        name: 'Mechanical Keyboard Keycaps Set',
        price: 2000,
        description: 'Full set of 104 artisan keycaps with custom legends. Cherry MX compatible.',
        imageUrl: 'https://placehold.co/400x400/374151/white?text=Keycaps',
        modelUrl: '',
        category: 'Tech',
        sales: 22,
        rating: 4.6,
        reviewCount: 9,
        tags: ['keyboard', 'tech', 'gaming']
    },
    {
        id: '9',
        name: 'Low Poly Wolf Sculpture',
        price: 900,
        description: 'Elegant low-poly wolf sculpture. Perfect centerpiece for your desk or shelf.',
        imageUrl: 'https://placehold.co/400x400/4b5563/white?text=Wolf',
        modelUrl: '',
        category: 'Art',
        sales: 41,
        rating: 4.4,
        reviewCount: 11,
        tags: ['lowpoly', 'animal', 'sculpture']
    },
    {
        id: '10',
        name: 'Phone Stand - Samurai',
        price: 700,
        description: 'Samurai warrior themed phone stand. Holds phones up to 7 inches.',
        imageUrl: 'https://placehold.co/400x400/6b7280/white?text=Phone+Stand',
        modelUrl: '',
        category: 'Tech',
        sales: 67,
        rating: 4.3,
        reviewCount: 21,
        tags: ['phone', 'stand', 'samurai']
    },
    {
        id: '11',
        name: 'Baby Yoda / Grogu',
        price: 1100,
        description: 'Adorable Grogu figure with floating pod. Multi-part assembly for easy painting.',
        imageUrl: 'https://placehold.co/400x400/1f2937/white?text=Grogu',
        modelUrl: '',
        category: 'Toys',
        sales: 112,
        rating: 5.0,
        reviewCount: 45,
        tags: ['starwars', 'grogu', 'baby yoda']
    },
    {
        id: '12',
        name: 'Dungeon Terrain Set',
        price: 4500,
        description: 'Complete modular dungeon terrain set. Includes walls, floors, doors, and props.',
        imageUrl: 'https://placehold.co/400x400/374151/white?text=Dungeon+Set',
        modelUrl: '',
        category: 'Miniatures',
        sales: 19,
        rating: 4.9,
        reviewCount: 7,
        tags: ['terrain', 'dnd', 'modular']
    }
];

const MOCK_COUPONS = [
    { code: 'FRESH10', discountPercent: 10, isActive: true },
    { code: 'MAKER20', discountPercent: 20, isActive: true },
    { code: 'WELCOME15', discountPercent: 15, isActive: true },
    { code: 'ADMIN100', discountPercent: 100, isActive: true }
];

const MOCK_USERS = [
    {
        id: 'user_john_doe',
        email: 'john.doe@example.com',
        displayName: 'John Doe',
        createdAt: '2024-01-15T10:30:00Z'
    },
    {
        id: 'user_jane_smith',
        email: 'jane.smith@example.com',
        displayName: 'Jane Smith',
        createdAt: '2024-02-20T14:45:00Z'
    },
    {
        id: 'user_mike_wilson',
        email: 'mike.wilson@example.com',
        displayName: 'Mike Wilson',
        createdAt: '2024-03-10T09:15:00Z'
    }
];

const MOCK_ORDERS = [
    {
        id: 'order_001',
        userId: 'user_john_doe',
        transactionId: 'txn_abc123xyz',
        amount: 4000,
        discountApplied: 0,
        items: [
            { id: '1', name: 'Cyberpunk Oni Mask', price: 1500 },
            { id: '2', name: 'Ancient Red Dragon', price: 2500 }
        ],
        date: '2024-11-01T14:30:00Z',
        status: 'completed',
        customerInfo: {
            fullName: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+1 555-0101',
            address: '123 Main Street',
            city: 'New York',
            zipCode: '10001',
            country: 'United States'
        },
        paymentId: 'pay_001'
    },
    {
        id: 'order_002',
        userId: 'user_jane_smith',
        transactionId: 'txn_def456uvw',
        amount: 3500,
        discountApplied: 350,
        items: [
            { id: '4', name: 'Mandalorian Helmet', price: 3500 }
        ],
        date: '2024-11-05T09:15:00Z',
        status: 'completed',
        customerInfo: {
            fullName: 'Jane Smith',
            email: 'jane.smith@example.com',
            phone: '+1 555-0202',
            address: '456 Oak Avenue',
            city: 'Los Angeles',
            zipCode: '90001',
            country: 'United States'
        },
        paymentId: 'pay_002'
    },
    {
        id: 'order_003',
        userId: 'user_mike_wilson',
        transactionId: 'txn_ghi789rst',
        amount: 2000,
        discountApplied: 0,
        items: [
            { id: '5', name: 'Articulated Crystal Dragon', price: 1200 },
            { id: '6', name: 'Geometric Desk Organizer', price: 800 }
        ],
        date: '2024-11-10T16:45:00Z',
        status: 'completed',
        customerInfo: {
            fullName: 'Mike Wilson',
            email: 'mike.wilson@example.com',
            phone: '+1 555-0303',
            address: '789 Pine Road',
            city: 'Chicago',
            zipCode: '60601',
            country: 'United States'
        },
        paymentId: 'pay_003'
    },
    {
        id: 'order_004',
        userId: 'user_john_doe',
        transactionId: 'txn_jkl012mno',
        amount: 1100,
        discountApplied: 0,
        items: [
            { id: '11', name: 'Baby Yoda / Grogu', price: 1100 }
        ],
        date: '2024-11-15T11:20:00Z',
        status: 'completed',
        customerInfo: {
            fullName: 'John Doe',
            email: 'john.doe@example.com',
            address: '123 Main Street',
            city: 'New York',
            zipCode: '10001',
            country: 'United States'
        },
        paymentId: 'pay_004'
    },
    {
        id: 'order_005',
        userId: 'user_jane_smith',
        transactionId: 'txn_pqr345stu',
        amount: 4500,
        discountApplied: 900,
        items: [
            { id: '12', name: 'Dungeon Terrain Set', price: 4500 }
        ],
        date: '2024-11-20T13:00:00Z',
        status: 'completed',
        customerInfo: {
            fullName: 'Jane Smith',
            email: 'jane.smith@example.com',
            phone: '+1 555-0202',
            address: '456 Oak Avenue',
            city: 'Los Angeles',
            zipCode: '90001',
            country: 'United States'
        },
        paymentId: 'pay_005'
    }
];

const MOCK_PAYMENTS = [
    {
        id: 'pay_001',
        orderId: 'order_001',
        userId: 'user_john_doe',
        amount: 4000,
        currency: 'usd',
        status: 'succeeded',
        paymentMethod: 'card',
        stripePaymentIntentId: 'pi_1abc123xyz',
        cardBrand: 'visa',
        cardLast4: '4242',
        createdAt: '2024-11-01T14:30:00Z'
    },
    {
        id: 'pay_002',
        orderId: 'order_002',
        userId: 'user_jane_smith',
        amount: 3150,
        currency: 'usd',
        status: 'succeeded',
        paymentMethod: 'card',
        stripePaymentIntentId: 'pi_2def456uvw',
        cardBrand: 'mastercard',
        cardLast4: '5555',
        createdAt: '2024-11-05T09:15:00Z'
    },
    {
        id: 'pay_003',
        orderId: 'order_003',
        userId: 'user_mike_wilson',
        amount: 2000,
        currency: 'usd',
        status: 'succeeded',
        paymentMethod: 'card',
        stripePaymentIntentId: 'pi_3ghi789rst',
        cardBrand: 'amex',
        cardLast4: '1234',
        createdAt: '2024-11-10T16:45:00Z'
    }
];

async function seedCollection(collectionPath, data, idField = 'id') {
    console.log(`Seeding ${collectionPath}...`);
    const batch = db.batch();
    let count = 0;

    for (const item of data) {
        let ref;
        if (item[idField]) {
            ref = db.doc(`${collectionPath}/${item[idField]}`);
        } else {
            ref = db.collection(collectionPath).doc();
        }
        batch.set(ref, item, { merge: true });
        count++;
    }

    await batch.commit();
    console.log(`Seeded ${count} documents to ${collectionPath}`);
}

async function main() {
    try {
        // Products
        await seedCollection('products', DEFAULT_MOCK_PRODUCTS);

        // Coupons
        await seedCollection('coupons', MOCK_COUPONS, 'code');

        // Users
        await seedCollection('users', MOCK_USERS);

        // Orders
        await seedCollection('orders', MOCK_ORDERS);

        // Payments
        await seedCollection('payments', MOCK_PAYMENTS);

        console.log("Seeding complete!");
    } catch (error) {
        console.error("Error seeding data:", error);
    }
}

main();
