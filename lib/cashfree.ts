/**
 * Triggers a Cashfree payment by redirecting the current window directly.
 * Bypasses the JS SDK to guarantee true same-window navigation.
 *
 * Production URL: https://payments.cashfree.com/order/#payment_session_id={id}
 * Sandbox URL:    https://sandbox.cashfree.com/checkout/#payment_session_id={id}
 */
export function redirectToCashfree(paymentSessionId: string): void {
    const env = process.env.NEXT_PUBLIC_CASHFREE_ENV || 'sandbox';

    const checkoutUrl =
        env === 'production'
            ? `https://payments.cashfree.com/order/#payment_session_id=${paymentSessionId}`
            : `https://sandbox.cashfree.com/checkout/#payment_session_id=${paymentSessionId}`;

    // True same-window redirect — guaranteed, no SDK popup behaviour
    window.location.href = checkoutUrl;
}
