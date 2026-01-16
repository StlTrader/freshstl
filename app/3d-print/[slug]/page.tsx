import { permanentRedirect } from 'next/navigation';
import { adminDb } from '../../../services/firebaseAdmin';
import { getProductUrl } from '../../../utils/urlHelpers';

interface Props {
    params: Promise<{ slug: string }>;
}

export default async function Page({ params }: Props) {
    const { slug } = await params;

    if (adminDb) {
        const snapshot = await adminDb.collection('products').where('slug', '==', slug).limit(1).get();
        if (!snapshot.empty) {
            const data = snapshot.docs[0].data();
            const url = getProductUrl({ category: data.category || 'misc', slug: data.slug });
            permanentRedirect(url);
        }
    }

    // Fallback if product not found
    permanentRedirect('/');
}
