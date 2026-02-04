import { FlouciConfig } from '../types';

export const initiateFlouciPayment = async (
    amount: number,
    customerInfo: { email: string; fullName: string },
    items: any[]
): Promise<{ url: string; payment_id: string } | null> => {
    try {
        const response = await fetch('/api/flouci/init', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount, // millimes
                email: customerInfo.email,
                fullName: customerInfo.fullName,
                items
            })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Failed to initiate Flouci payment');
        }

        return {
            url: data.result.link,
            payment_id: data.result.payment_id
        };
    } catch (error) {
        console.error('[FlouciService] Initiation Error:', error);
        throw error;
    }
};

export const verifyFlouciPayment = async (paymentId: string): Promise<boolean> => {
    try {
        const response = await fetch(`/api/flouci/verify?paymentId=${paymentId}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to verify Flouci payment');
        }

        return data.success && data.status === 'SUCCESS';
    } catch (error) {
        console.error('[FlouciService] Verification Error:', error);
        return false;
    }
};
