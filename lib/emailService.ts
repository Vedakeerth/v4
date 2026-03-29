import nodemailer from 'nodemailer';

// Email configuration from environment variables
const isConfigured = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const DEFAULT_FROM = process.env.EMAIL_FROM || '"VAELINSA Order Support" <noreply@vaelinsa.com>';

/**
 * Send a premium HTML order confirmation email
 */
export async function sendOrderConfirmation(order: any) {
    if (!isConfigured) {
        console.warn('Email service not configured. Skipping order confirmation email.');
        return;
    }

    if (!order.email) {
        console.error('No email address provided for order confirmation.');
        return;
    }

    const htmlContent = `
        <div style="background-color: #020617; color: #f8fafc; font-family: 'Inter', sans-serif; padding: 40px; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #1e293b; border-top: 4px solid #06b6d4; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #06b6d4; font-size: 28px; font-weight: 900; text-transform: uppercase; font-style: italic; letter-spacing: -0.05em; margin: 0;">Order Confirmed!</h1>
                <p style="color: #94a3b8; font-size: 14px; margin-top: 10px;">Thank you for your business, ${order.customerName}</p>
            </div>
            
            <div style="background-color: #0f172a; border-radius: 20px; padding: 25px; margin-bottom: 30px; border: 1px solid #1e293b;">
                <div style="margin-bottom: 20px;">
                    <span style="color: #64748b; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 5px;">Tracking ID</span>
                    <strong style="color: #06b6d4; font-size: 20px; letter-spacing: 0.1em;">${order.trackingId}</strong>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <span style="color: #64748b; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 5px;">Total Amount</span>
                    <strong style="color: #fff; font-size: 18px;">₹${order.totalAmount}</strong>
                </div>

                <div style="border-top: 1px solid #1e293b; padding-top: 20px;">
                    <span style="color: #64748b; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 10px;">Items Ordered</span>
                    ${order.items.map((item: any) => `
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="color: #cbd5e1; font-size: 13px; font-weight: 600;">${item.name} x ${item.quantity}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div style="text-align: center; padding: 20px; border-radius: 20px; border: 1px dashed #334155; margin-bottom: 30px;">
                <p style="color: #cbd5e1; font-size: 14px; margin-bottom: 15px;">You will receive real-time notifications for every status update.</p>
                <div style="display: flex; justify-content: center; gap: 20px;">
                    <a href="https://wa.me/919876543210" style="color: #22c55e; text-decoration: none; font-size: 12px; font-weight: bold; text-transform: uppercase;">WhatsApp Support</a>
                </div>
            </div>

            <div style="text-align: center; color: #64748b; font-size: 12px; font-family: sans-serif;">
                <p>© ${new Date().getFullYear()} VAELINSA Engineering. All rights reserved.</p>
                <p>Support: vaelinsa@gmail.com</p>
            </div>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: DEFAULT_FROM,
            to: order.email,
            subject: `Order Confirmed: ${order.trackingId}`,
            html: htmlContent,
        });
        return { success: true };
    } catch (error) {
        console.error('Error sending confirmation email:', error);
        return { success: false, error };
    }
}

/**
 * Send a notification for status update
 */
export async function sendOrderStatusUpdate(order: any, newStatus: string) {
    if (!isConfigured) return;
    if (!order.email) return;

    const statusColors: any = {
        'Pending': '#fbbf24',
        'Processing': '#60a5fa',
        'Shipped': '#a78bfa',
        'Delivered': '#34d399',
        'Completed': '#34d399',
        'Cancelled': '#ef4444'
    };

    const currentColor = statusColors[newStatus] || '#06b6d4';

    const htmlContent = `
        <div style="background-color: #020617; color: #f8fafc; font-family: 'Inter', sans-serif; padding: 40px; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #1e293b; border-top: 4px solid ${currentColor}; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: ${currentColor}; font-size: 24px; font-weight: 900; text-transform: uppercase; font-style: italic; letter-spacing: -0.05em; margin: 0;">Order ${newStatus}!</h1>
                <p style="color: #94a3b8; font-size: 14px; margin-top: 10px;">Your order ${order.trackingId} has been updated.</p>
            </div>
            
            <div style="background-color: #0f172a; border-radius: 20px; padding: 25px; margin-bottom: 30px; border: 1px solid #1e293b; text-align: center;">
                <span style="color: #64748b; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 10px;">Current Status</span>
                <div style="display: inline-block; padding: 8px 16px; background-color: ${currentColor}1a; color: ${currentColor}; border-radius: 100px; font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; border: 1px solid ${currentColor}33;">
                    ${newStatus}
                </div>
            </div>

            <div style="text-align: center; padding: 20px; border-radius: 20px; border: 1px dashed #334155; margin-bottom: 30px;">
                <p style="color: #cbd5e1; font-size: 14px; margin-bottom: 15px;">You can track your order live on our website.</p>
                <div style="display: flex; justify-content: center; gap: 20px;">
                    <a href="${process.env.NEXT_PUBLIC_BASE_URL}/track-order" style="color: #06b6d4; text-decoration: none; font-size: 12px; font-weight: bold; text-transform: uppercase;">Track Live</a>
                    <span style="color: #334155;">|</span>
                    <a href="https://wa.me/919876543210" style="color: #22c55e; text-decoration: none; font-size: 12px; font-weight: bold; text-transform: uppercase;">WhatsApp</a>
                </div>
            </div>

            <div style="text-align: center; color: #64748b; font-size: 12px; font-family: sans-serif;">
                <p>© ${new Date().getFullYear()} VAELINSA Engineering. All rights reserved.</p>
                <p>Support: vaelinsa@gmail.com</p>
            </div>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: DEFAULT_FROM,
            to: order.email,
            subject: `Order Update: ${order.trackingId} is now ${newStatus}`,
            html: htmlContent,
        });
        return { success: true };
    } catch (error) {
        console.error('Error sending status update email:', error);
        return { success: false, error };
    }
}
