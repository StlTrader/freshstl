import { adminDb } from '../services/firebaseAdmin';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function checkPosts() {
    if (!adminDb) {
        console.error('Admin DB not initialized');
        return;
    }

    try {
        const snapshot = await adminDb.collection('posts').get();
        console.log(`Found ${snapshot.size} posts in Firestore.`);
        snapshot.forEach(doc => {
            console.log(`- ${doc.id}: ${doc.data().title} (Published: ${doc.data().published})`);
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
    }
}

checkPosts();
