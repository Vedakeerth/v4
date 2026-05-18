import { Resend } from 'resend';
import { decrypt } from './crypto';
import { getColorName } from './utils';

const TRACKING_MAP: Record<string, string> = {
    "Blue Dart": "https://www.bluedart.com/tracking",
    "DTDC": "https://www.dtdc.in/tracking/shipment-tracking.asp",
    "India Post": "https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx",
    "ST Courier": "https://www.stcourier.com/track/shipment",
    "The Professional Couriers": "https://www.tpcindia.com/Tracking.aspx",
    "Delhivery": "https://www.delhivery.com/tracking",
    "Xpressbees": "https://www.xpressbees.com/track",
    "Ekart Logistics": "https://ekartlogistics.com/shipmenttrack",
    "Ecom Express": "https://ecomexpress.in/tracking/",
    "Shadowfax": "https://www.shadowfax.in/track-order",
    "FedEx India": "https://www.fedex.com/fedextrack/",
    "DHL Express India": "https://www.dhl.com/in-en/home/tracking.html",
    "UPS India": "https://www.ups.com/track",
    "Shiprocket": "https://shiprocket.co/tracking/"
};


const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = 'Vaelinsa <sales@vaelinsa.com>';

// Local getColorName removed in favor of import

/**
 * Send a premium HTML order confirmation email using Resend
 */
export async function sendOrderConfirmation(order: any) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY not configured. Skipping email.');
        return { success: false, error: 'Not configured' };
    }

    try {
        const subtotal = Number(order.subtotal) || Number(order.totalAmount) || 0;
        const discount = Number(order.discount) || 0;
        const shipping = Number(order.shipping) || 0;
        const netTotalBeforeRound = subtotal - discount + shipping;
        const finalTotal = Math.round(netTotalBeforeRound) || Number(order.totalAmount) || 0;
        const roundOff = finalTotal - netTotalBeforeRound;

        const itemsHtml = (order.items || []).map((item: any) => {
            const rawPrice = item.price || 0;
            const price = typeof rawPrice === 'string' ? parseFloat(rawPrice.replace(/[^0-9.-]+/g, "")) : Number(rawPrice);
            const displayPrice = isNaN(price) ? 0 : price;

            return `
                <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">
                        <div style="font-weight: bold; color: #1e293b;">${item.name}</div>
                        <div style="font-size: 11px; color: #64748b;">
                            (${getColorName(item.selectedColor || item.color)}) / ${item.id || 'N/A'}
                        </div>
                    </td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${displayPrice.toLocaleString('en-IN')}</td>
                </tr>
            `;
        }).join('');

        // Try to get PDF buffer if it's a MEGA link
        let attachments: any[] = [];
        if (order.pdfUrl) {
            try {
                if (order.pdfUrl.includes('mega.nz')) {
                    // Add delay to allow MEGA to propagate the link
                    console.log(`[EMAIL] Waiting 5s for MEGA propagation before attachment download...`);
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    
                    const { getFileBufferFromMega } = await import('./mega');
                    const buffer = await getFileBufferFromMega(order.pdfUrl);
                    attachments.push({
                        content: buffer,
                        filename: `Invoice_${order.trackingId || order.id}.pdf`
                    });
                } else {
                    attachments.push({
                        path: order.pdfUrl,
                        filename: `Invoice_${order.trackingId || order.id}.pdf`
                    });
                }
            } catch (err) {
                console.warn('[EMAIL] Could not attach PDF from URL:', err);
            }
        }

        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: [order.email],
            subject: `Order Confirmed! #${order.trackingId || order.id}`,
            attachments,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 20px;">
                    <div style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                        <div style="background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); border-top-left-radius: 16px; border-top-right-radius: 16px; padding: 45px 20px; text-align: center; color: #ffffff;">
                            <img src="https://www.vaelinsa.com/images/logo-v2.png" alt="VAELINSA" style="height: 40px; margin-bottom: 20px;">
                            <h1 style="margin: 0; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Order Confirmed</h1>
                            <p style="margin: 10px 0 0; opacity: 0.9; font-weight: 600;">Thank you for your purchase!</p>
                        </div>
                        <div style="padding: 30px;">
                            <div style="margin-bottom: 30px; padding: 20px; background-color: #f1f5f9; border-radius: 12px;">
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; padding-bottom: 8px;">Order ID</td>
                                        <td style="text-align: right; font-size: 14px; font-weight: 800; color: #0f172a; padding-bottom: 8px;">#${order.trackingId || order.id || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase;">Status</td>
                                        <td style="text-align: right; font-size: 10px; font-weight: 800; color: #10b981; text-transform: uppercase;">Payment Success</td>
                                    </tr>
                                </table>
                            </div>
                            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                                <thead>
                                    <tr style="background-color: #f8fafc;">
                                        <th style="padding: 12px; text-align: left; font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase;">Item</th>
                                        <th style="padding: 12px; text-align: center; font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase;">Qty</th>
                                        <th style="padding: 12px; text-align: right; font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase;">Price</th>
                                    </tr>
                                </thead>
                                <tbody>${itemsHtml}</tbody>
                                <tfoot>
                                    <tr>
                                        <td colspan="2" style="padding: 15px 12px 0; text-align: right; font-weight: bold; color: #64748b; font-size: 11px; text-transform: uppercase;">Subtotal</td>
                                        <td style="padding: 15px 12px 0; text-align: right; font-size: 13px; font-weight: bold; color: #0f172a;">₹${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    </tr>
                                    ${discount > 0 ? `
                                    <tr>
                                        <td colspan="2" style="padding: 5px 12px 0; text-align: right; font-weight: bold; color: #22c55e; font-size: 11px; text-transform: uppercase;">Discount</td>
                                        <td style="padding: 5px 12px 0; text-align: right; font-size: 13px; font-weight: bold; color: #22c55e;">- ₹${discount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    </tr>
                                    ` : ''}
                                    ${shipping > 0 ? `
                                    <tr>
                                        <td colspan="2" style="padding: 5px 12px 0; text-align: right; font-weight: bold; color: #64748b; font-size: 11px; text-transform: uppercase;">Handling</td>
                                        <td style="padding: 5px 12px 0; text-align: right; font-size: 13px; font-weight: bold; color: #0f172a;">₹${shipping.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    </tr>
                                    ` : ''}
                                    ${roundOff !== 0 ? `
                                    <tr>
                                        <td colspan="2" style="padding: 5px 12px 0; text-align: right; font-weight: bold; color: #64748b; font-size: 11px; text-transform: uppercase;">Round off</td>
                                        <td style="padding: 5px 12px 0; text-align: right; font-size: 13px; font-weight: bold; color: #0f172a;">${roundOff >= 0 ? '+' : '-'} ₹${Math.abs(roundOff).toFixed(2)}</td>
                                    </tr>
                                    ` : ''}
                                    <tr>
                                        <td colspan="2" style="padding: 15px 12px 0; text-align: right; font-weight: 800; color: #64748b; text-transform: uppercase; font-size: 11px; border-top: 2px solid #0f172a;">Total Net</td>
                                        <td style="padding: 15px 12px 0; text-align: right; font-size: 20px; font-weight: 900; color: #0f172a; border-top: 2px solid #0f172a;">₹${finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    </tr>
                                </tfoot>
                            </table>
                            <div style="padding: 15px; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 25px;">
                                <h4 style="margin: 0 0 10px; font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase;">Delivery Node</h4>
                                <p style="margin: 0; font-size: 12px; color: #1e293b; line-height: 1.6;">${order.address || 'Address details on file'}</p>
                            </div>

                            <div style="margin-bottom: 30px; padding: 20px; background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px;">
                                <h4 style="margin: 0 0 12px; font-size: 10px; font-weight: 800; color: #0369a1; text-transform: uppercase;">Logistics & Timeline</h4>
                                <ul style="margin: 0; padding: 0; list-style: none; font-size: 12px; color: #0c4a6e; line-height: 1.8;">
                                    <li style="margin-bottom: 5px;">• Your order will be confirmed within 24 hours.</li>
                                    <li style="margin-bottom: 5px;">• Kindly give us 10 to 15 working days to process your order.</li>
                                    <li style="margin-bottom: 5px;">• Shipping may take time depending on your location.</li>
                                    <li>• We assure you your order will reach you as soon as possible.</li>
                                </ul>
                            </div>
                            
                            <div style="text-align: center;">
                                <a href="https://www.vaelinsa.com/track-order?id=${order.trackingId || order.id}" style="background-color: #0B2339; color: #ffffff; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 800; font-size: 11px; text-transform: uppercase; display: inline-block;">Track Your Product</a>
                            </div>
                        </div>
                        <div style="background-color: #0B2339; padding: 30px; text-align: center; color: #94a3b8; font-size: 11px;">
                            <p style="margin: 0; font-weight: 800; color: #ffffff; text-transform: uppercase;">Vaelinsa Industrial Solutions</p>
                            <p style="margin: 5px 0 0;">support@vaelinsa.com | WhatsApp: +91 89035 95542</p>
                            <p style="margin: 5px 0 0;">www.vaelinsa.com</p>
                            <div style="margin-top: 20px; text-align: center;">
                                <a href="https://wa.me/918903595542" style="text-decoration: none; margin: 0 10px;">
                                    <img src="https://img.icons8.com/color/48/whatsapp--v1.png" width="24" height="24" alt="WhatsApp">
                                </a>
                                <a href="https://instagram.com/vaelinsa_official" style="text-decoration: none; margin: 0 10px;">
                                    <img src="https://img.icons8.com/color/48/instagram-new--v1.png" width="24" height="24" alt="Instagram">
                                </a>
                                <a href="https://facebook.com/vaelinsa_official" style="text-decoration: none; margin: 0 10px;">
                                    <img src="https://img.icons8.com/color/48/facebook-new.png" width="24" height="24" alt="Facebook">
                                </a>
                                <a href="https://linkedin.com/company/vaelinsa" style="text-decoration: none; margin: 0 10px;">
                                    <img src="https://img.icons8.com/color/48/linkedin.png" width="24" height="24" alt="LinkedIn">
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `
        });

        if (error) throw error;
        return { success: true, data };
    } catch (err) {
        console.error('[RESEND] Failed:', err);
        return { success: false, error: err };
    }
}

/**
 * Send an instant quotation email using Resend
 */
export async function sendInstantQuotation(quote: any) {
    if (!process.env.RESEND_API_KEY) return { success: false, error: 'Not configured' };

    try {
        const subtotal = Number(quote.subtotal) || 0;
        const discount = Number(quote.discount) || 0;
        const shipping = Number(quote.shipping) || 0;
        const netTotalBeforeRound = subtotal - discount + shipping;
        const finalTotal = Math.round(netTotalBeforeRound);
        const roundOff = finalTotal - netTotalBeforeRound;

        const itemsHtml = (quote.items || []).map((item: any) => {
            const rawPrice = item.price || 0;
            const price = typeof rawPrice === 'string' ? parseFloat(rawPrice.replace(/[^0-9.-]+/g, "")) : Number(rawPrice);
            const displayPrice = isNaN(price) ? 0 : price;
            
            return `
                <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">
                        <div style="font-weight: bold; color: #1e293b;">${item.name}</div>
                        <div style="font-size: 11px; color: #64748b;">
                            (${getColorName(item.color)}) / ${item.id || 'N/A'}
                        </div>
                    </td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${displayPrice.toLocaleString('en-IN')}</td>
                </tr>
            `;
        }).join('');

        // Try to get PDF buffer if it's a MEGA link
        let attachments: any[] = [];
        if (quote.pdfUrl) {
            try {
                if (quote.pdfUrl.includes('mega.nz')) {
                    // Add delay to allow MEGA to propagate the link
                    console.log(`[EMAIL] Waiting 5s for MEGA propagation before quotation download...`);
                    await new Promise(resolve => setTimeout(resolve, 5000));

                    const { getFileBufferFromMega } = await import('./mega');
                    const buffer = await getFileBufferFromMega(quote.pdfUrl);
                    attachments.push({
                        content: buffer,
                        filename: `Quotation_${quote.id}.pdf`
                    });
                } else {
                    attachments.push({
                        path: quote.pdfUrl,
                        filename: `Quotation_${quote.id}.pdf`
                    });
                }
            } catch (err) {
                console.warn('[EMAIL] Could not attach Quotation PDF from URL:', err);
            }
        }

        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: [quote.email],
            subject: `Your Industrial Quotation - #${quote.id}`,
            attachments,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 20px;">
                    <div style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                        <div style="background-color: #0B2339; border-top-left-radius: 16px; border-top-right-radius: 16px; padding: 45px 20px; text-align: center; color: #ffffff;">
                            <img src="https://www.vaelinsa.com/images/logo-v2.png" alt="VAELINSA" style="height: 40px; margin-bottom: 20px;">
                            <h1 style="margin: 0; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Instant Quotation</h1>
                            <p style="margin: 10px 0 0; opacity: 0.95; font-weight: bold; border: 1px solid rgba(255, 255, 255, 0.4); background-color: rgba(255, 255, 255, 0.08); display: inline-block; padding: 6px 16px; border-radius: 50px; font-size: 11px; letter-spacing: 0.5px; text-transform: uppercase;">Valid for 10 days</p>
                        </div>
                        <div style="padding: 30px;">
                            <div style="margin-bottom: 30px; padding: 20px; background-color: #f1f5f9; border-radius: 12px;">
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Quotation ID</td>
                                        <td style="text-align: right; font-size: 15px; font-weight: 800; color: #0f172a;">#${quote.id || 'N/A'}</td>
                                    </tr>
                                </table>
                            </div>
                            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                                <thead>
                                    <tr style="background-color: #f8fafc;">
                                        <th style="padding: 12px; text-align: left; font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase;">Item</th>
                                        <th style="padding: 12px; text-align: center; font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase;">Qty</th>
                                        <th style="padding: 12px; text-align: right; font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase;">Price</th>
                                    </tr>
                                </thead>
                                <tbody>${itemsHtml}</tbody>
                                <tfoot>
                                    <tr>
                                        <td colspan="2" style="padding: 15px 12px 0; text-align: right; font-weight: bold; color: #64748b; font-size: 11px; text-transform: uppercase;">Subtotal</td>
                                        <td style="padding: 15px 12px 0; text-align: right; font-size: 13px; font-weight: bold; color: #0f172a;">₹${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    </tr>
                                    ${discount > 0 ? `
                                    <tr>
                                        <td colspan="2" style="padding: 5px 12px 0; text-align: right; font-weight: bold; color: #22c55e; font-size: 11px; text-transform: uppercase;">Discount</td>
                                        <td style="padding: 5px 12px 0; text-align: right; font-size: 13px; font-weight: bold; color: #22c55e;">- ₹${discount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    </tr>
                                    ` : ''}
                                    ${shipping > 0 ? `
                                    <tr>
                                        <td colspan="2" style="padding: 5px 12px 0; text-align: right; font-weight: bold; color: #64748b; font-size: 11px; text-transform: uppercase;">Handling</td>
                                        <td style="padding: 5px 12px 0; text-align: right; font-size: 13px; font-weight: bold; color: #0f172a;">₹${shipping.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    </tr>
                                    ` : ''}
                                    ${roundOff !== 0 ? `
                                    <tr>
                                        <td colspan="2" style="padding: 5px 12px 0; text-align: right; font-weight: bold; color: #64748b; font-size: 11px; text-transform: uppercase;">Round off</td>
                                        <td style="padding: 5px 12px 0; text-align: right; font-size: 13px; font-weight: bold; color: #0f172a;">${roundOff >= 0 ? '+' : '-'} ₹${Math.abs(roundOff).toFixed(2)}</td>
                                    </tr>
                                    ` : ''}
                                    <tr>
                                        <td colspan="2" style="padding: 15px 12px 0; text-align: right; font-weight: 800; color: #64748b; text-transform: uppercase; font-size: 11px; border-top: 2px solid #0f172a;">Quoted Amount</td>
                                        <td style="padding: 15px 12px 0; text-align: right; font-size: 20px; font-weight: 900; color: #0B2339; border-top: 2px solid #0B2339;">₹${finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    </tr>
                                </tfoot>
                            </table>

                            <div style="margin-bottom: 30px; padding: 25px; background-color: #f0f9ff; border: 1.5px solid #bae6fd; border-radius: 16px;">
                                <h4 style="margin: 0 0 15px; font-size: 11px; font-weight: 800; color: #0369a1; text-transform: uppercase; letter-spacing: 0.5px;">Logistics & Timeline</h4>
                                <ul style="margin: 0; padding: 0; list-style: none; font-size: 13px; color: #0c4a6e; line-height: 2;">
                                    <li style="margin-bottom: 10px;">• Your order will be confirmed within 24 hours of payment.</li>
                                    <li style="margin-bottom: 10px;">• Kindly give us 10 to 15 working days to process your order after payment.</li>
                                    <li style="margin-bottom: 10px;">• Shipping may take time depending on your location.</li>
                                    <li>• We assure you your order will reach you as soon as possible.</li>
                                </ul>
                            </div>
                            
                            <div style="text-align: center;">
                                <a href="https://www.vaelinsa.com/checkout?quoteId=${quote.id}" style="background-color: #0B2339; color: #ffffff; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 11px; text-transform: uppercase; display: inline-block;">Proceed to Checkout</a>
                            </div>
                        </div>
                        <div style="background-color: #0B2339; padding: 30px; text-align: center; color: #94a3b8; font-size: 11px;">
                            <p style="margin: 0; font-weight: 800; color: #ffffff; text-transform: uppercase;">Vaelinsa Industrial Solutions</p>
                            <p style="margin: 5px 0 0;">sales@vaelinsa.com | WhatsApp: +91 89035 95542</p>
                            <p style="margin: 5px 0 0;">www.vaelinsa.com</p>
                            <div style="margin-top: 20px; text-align: center;">
                                <a href="https://wa.me/918903595542" style="text-decoration: none; margin: 0 10px;">
                                    <img src="https://img.icons8.com/color/48/whatsapp--v1.png" width="24" height="24" alt="WhatsApp">
                                </a>
                                <a href="https://instagram.com/vaelinsa_official" style="text-decoration: none; margin: 0 10px;">
                                    <img src="https://img.icons8.com/color/48/instagram-new--v1.png" width="24" height="24" alt="Instagram">
                                </a>
                                <a href="https://facebook.com/vaelinsa_official" style="text-decoration: none; margin: 0 10px;">
                                    <img src="https://img.icons8.com/color/48/facebook-new.png" width="24" height="24" alt="Facebook">
                                </a>
                                <a href="https://linkedin.com/company/vaelinsa" style="text-decoration: none; margin: 0 10px;">
                                    <img src="https://img.icons8.com/color/48/linkedin.png" width="24" height="24" alt="LinkedIn">
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `
        });

        if (error) throw error;
        return { success: true, data };
    } catch (err) {
        console.error('[RESEND] Quotation Failed:', err);
        return { success: false, error: err };
    }
}

/**
 * Send a notification for status update using Resend
 */
export async function sendOrderStatusUpdate(order: any, newStatus: string) {
    if (!process.env.RESEND_API_KEY) return { success: false, error: 'Not configured' };

    try {
        let statusTitle = '';
        let statusMessage = '';
        let statusColor = '#06b6d4';

        switch (newStatus) {
            case 'Processing':
                statusTitle = 'Order Processing';
                statusMessage = 'Your components are now being initialized in our production pipeline.';
                statusColor = '#06b6d4';
                break;
            case 'Ready to Delivery':
                statusTitle = 'Ready to Shipped';
                statusMessage = 'Quality control complete. Your package is staged for logistics pickup.<br><br>• Your order will be transmitted within 2 working days.<br>• You will get email updates in real-time.';
                statusColor = '#3b82f6';
                break;
            case 'Delivered':
                statusTitle = 'Order Shipped';
                statusMessage = 'Your order has been shipped and is currently in transit to your node.';
                statusColor = '#10b981';
                break;
            case 'Cancelled':
                statusTitle = 'Order Cancelled';
                statusMessage = 'Your order has been voided and cancelled in our systems.';
                statusColor = '#ef4444';
                break;
            default:
                statusTitle = `Order ${newStatus}`;
                statusMessage = `Your order status has been modulated to ${newStatus}.`;
        }

        const trackingUrl = (order.shippingPartner && TRACKING_MAP[order.shippingPartner]) 
            ? TRACKING_MAP[order.shippingPartner] 
            : `https://www.vaelinsa.com/track-order?id=${order.trackingId || order.id}`;

        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: [order.email],
            subject: `Update: ${statusTitle} #${order.trackingId || order.id}`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 20px;">
                    <div style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                        <div style="background: ${statusColor}; padding: 40px 20px; text-align: center; color: #ffffff;">
                            <img src="https://www.vaelinsa.com/images/logo.png" alt="VAELINSA" style="height: 40px; margin-bottom: 20px;">
                            <h1 style="margin: 0; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">${statusTitle}</h1>
                            <p style="margin: 10px 0 0; opacity: 0.9; font-weight: 600;">#${order.trackingId || order.id}</p>
                        </div>
                        <div style="padding: 30px;">
                            <p style="font-size: 14px; color: #1e293b; line-height: 1.6; margin-bottom: 25px;">Hello ${order.customerName},<br><br>${statusMessage}</p>
                            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
                                <h3 style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; margin: 0 0 15px;">Logistics Data</h3>
                                <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #1e293b;">
                                    <tr>
                                        <td style="color: #64748b; padding-bottom: 8px;">Carrier Status</td>
                                        <td style="text-align: right; font-weight: 800; color: ${statusColor}; padding-bottom: 8px;">${newStatus}</td>
                                    </tr>
                                    ${order.trackingId ? `<tr><td style="color: #64748b; padding-bottom: 8px;">Internal ID</td><td style="text-align: right; font-weight: 800; padding-bottom: 8px;">${order.trackingId}</td></tr>` : ''}
                                    ${order.shippingPartner ? `<tr><td style="color: #64748b; padding-bottom: 8px;">Shipping Partner</td><td style="text-align: right; font-weight: 800; padding-bottom: 8px;">${order.shippingPartner}</td></tr>` : ''}
                                    ${order.carrierTrackingId ? `<tr><td style="color: #64748b; padding-bottom: 8px;">Tracking ID</td><td style="text-align: right; font-weight: 800; color: #10b981; padding-bottom: 8px;">${order.carrierTrackingId}</td></tr>` : ''}
                                </table>
                            </div>
                            <div style="text-align: center; margin-top: 30px;">
                                <a href="${trackingUrl}" style="background-color: ${statusColor}; color: #ffffff; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 800; font-size: 11px; text-transform: uppercase; display: inline-block;">Track Live Node</a>
                            </div>
                        </div>
                        <div style="background-color: #0f172a; padding: 30px; text-align: center; color: #94a3b8; font-size: 11px;">
                            <p style="margin: 0; font-weight: 800; color: #ffffff; text-transform: uppercase;">Vaelinsa Industrial Solutions</p>
                            <p style="margin: 5px 0 0;">support@vaelinsa.com | WhatsApp: +91 89035 95542</p>
                            <div style="margin-top: 20px; text-align: center;">
                                <a href="https://wa.me/918903595542" style="text-decoration: none; margin: 0 10px;">
                                    <img src="https://img.icons8.com/color/48/whatsapp--v1.png" width="24" height="24" alt="WhatsApp">
                                </a>
                                <a href="https://instagram.com/vaelinsa_official" style="text-decoration: none; margin: 0 10px;">
                                    <img src="https://img.icons8.com/color/48/instagram-new--v1.png" width="24" height="24" alt="Instagram">
                                </a>
                                <a href="https://facebook.com/vaelinsa_official" style="text-decoration: none; margin: 0 10px;">
                                    <img src="https://img.icons8.com/color/48/facebook-new.png" width="24" height="24" alt="Facebook">
                                </a>
                                <a href="https://linkedin.com/company/vaelinsa" style="text-decoration: none; margin: 0 10px;">
                                    <img src="https://img.icons8.com/color/48/linkedin.png" width="24" height="24" alt="LinkedIn">
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `
        });

        if (error) throw error;
        return { success: true, data };
    } catch (err) {
        console.error('[RESEND] Update Failed:', err);
        return { success: false, error: err };
    }
}
