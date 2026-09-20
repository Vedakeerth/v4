'use client';

import { Toaster, toast } from 'sonner';

/**
 * Renders the Sonner <Toaster /> container.
 * Include this ONCE in the root layout.
 */
export function ToastProvider() {
    return (
        <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
                style: {
                    fontFamily: 'var(--font-ibm-plex-sans, sans-serif)',
                    borderRadius: '0.875rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                },
                duration: 4000,
            }}
        />
    );
}

/**
 * Utility to show a toast notification from anywhere in the app.
 * Import this function directly — do NOT import the ToastProvider component.
 *
 * @param message  The message to display.
 * @param type     'error' | 'success' | 'info' | 'warning' (default 'error')
 */
export function showToast(
    message: string,
    type: 'error' | 'success' | 'info' | 'warning' = 'error'
) {
    toast[type](message);
}

// Also export toast directly for advanced usage
export { toast };
