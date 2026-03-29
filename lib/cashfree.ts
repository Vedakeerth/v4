import { load } from '@cashfreepayments/cashfree-js';

/**
 * Triggers a Cashfree payment using their official seamless popup checkout.
 */
export async function redirectToCashfree(paymentSessionId: string): Promise<void> {
    try {
        const env = process.env.NEXT_PUBLIC_CASHFREE_ENV || 'sandbox';
        
        const cashfree = await load({
            mode: env === 'production' ? 'production' : 'sandbox',
        });
        
        // This will open the popup on the current page
        await cashfree.checkout({
            paymentSessionId: paymentSessionId
        });
    } catch (error) {
        console.error("Cashfree SDK Error:", error);
        alert("Payment gateway failed to load. Please try again.");
    }
}

