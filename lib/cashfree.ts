import { load } from '@cashfreepayments/cashfree-js';

/**
 * Triggers a Cashfree payment using their official seamless popup checkout.
 * This opens an onscreen modal rather than redirecting the whole page.
 */
export async function redirectToCashfree(paymentSessionId: string, orderId: string): Promise<void> {
    try {
        const env = process.env.NEXT_PUBLIC_CASHFREE_ENV || 'sandbox';
        
        console.log("Loading Cashfree SDK...");
        const cashfree = await load({ 
            mode: env === 'production' ? 'production' : 'sandbox' 
        }) as any;
        
        if (!cashfree) {
            throw new Error("Cashfree SDK failed to initialize.");
        }
        
        console.log("Opening Payment Popup...");
        
        // Popup checkout requires manual handling of the promise result
        // It does NOT automatically redirect like the full hosted page
        return cashfree.checkout({
            paymentSessionId: paymentSessionId,
            redirectTarget: "_self" // Required for popup
        }).then((result: any) => {
            console.log("Payment flow completed:", result);
            
            if (result.error) {
                // Handle SDK errors
                console.error("Cashfree SDK Error:", result.error);
                window.location.href = `/payment-status?order_id=${orderId}&error=${encodeURIComponent(result.error.message)}`;
                return;
            }

            if (result.redirect) {
                // This happens for some banks that require a full redirect
                console.log("Payment requires full redirect...");
                return; // The browser will handle the redirect
            }

            // If we reach here, it means the popup closed (success or cancelled)
            // We manually redirect to our status page to verify
            console.log("Manually redirecting to status page...");
            window.location.href = `/payment-status?order_id=${orderId}`;
        });

    } catch (error: any) {
        console.error("Cashfree Launch Error:", error);
        throw new Error(error.message || "Failed to launch payment gateway.");
    }
}

