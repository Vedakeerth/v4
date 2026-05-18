import { Resend } from 'resend';
import { getColorName } from './utils';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_build');
const FROM_EMAIL = 'Vaelinsa <sales@vaelinsa.com>';

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


interface EmailOrder {
    id: string;
    trackingId?: string;
    customerName: string;
    email: string;
    phone: string;
    address: string;
    totalAmount: number | string;
    items: any[];
    status: string;
    pdfUrl?: string;
    paymentId?: string;
    shippingDetails?: {
        trackingId?: string;
        partner?: string;
        estimatedDelivery?: string;
    };
    carrierTrackingId?: string;
    shippingPartner?: string;
}

export async function sendOrderConfirmationEmail(order: EmailOrder) {
    try {
        const itemsHtml = order.items.map(item => {
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
                    <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${displayPrice.toLocaleString()}</td>
                </tr>
            `;
        }).join('');

        // Try to get PDF buffer if it's a MEGA link
        let attachments: any[] = [];
        if (order.pdfUrl) {
            try {
                if (order.pdfUrl.includes('mega.nz')) {
                    // Add delay to allow MEGA to propagate the link
                    console.log(`[EMAIL] Waiting 5s for MEGA propagation before order confirmation download...`);
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
                        <!-- Header -->
                        <div style="background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); padding: 40px 20px; text-align: center; color: #ffffff;">
                            <h1 style="margin: 0; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Order Confirmed</h1>
                            <p style="margin: 10px 0 0; opacity: 0.9; font-weight: 600;">Thank you for your purchase!</p>
                        </div>

                        <!-- Main Content -->
                        <div style="padding: 30px;">
                            <div style="margin-bottom: 30px; padding: 20px; background-color: #f1f5f9; border-radius: 12px;">
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td style="font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 8px;">Order ID</td>
                                        <td style="text-align: right; font-size: 14px; font-weight: 800; color: #0f172a; padding-bottom: 8px;">#${order.trackingId || order.id}</td>
                                    </tr>
                                    <tr>
                                        <td style="font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Status</td>
                                        <td style="text-align: right; font-size: 12px; font-weight: 800; color: #10b981; text-transform: uppercase; letter-spacing: 1px;">Payment Success</td>
                                    </tr>
                                </table>
                            </div>

                            <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">Payload Manifest</h3>
                            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                                <thead>
                                    <tr style="background-color: #f8fafc;">
                                        <th style="padding: 12px; text-align: left; font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase;">Item</th>
                                        <th style="padding: 12px; text-align: center; font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase;">Qty</th>
                                        <th style="padding: 12px; text-align: right; font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase;">Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${itemsHtml}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colspan="2" style="padding: 20px 12px 0; text-align: right; font-weight: 800; color: #64748b; text-transform: uppercase; font-size: 12px;">Total Aggregated Net</td>
                                        <td style="padding: 20px 12px 0; text-align: right; font-size: 20px; font-weight: 900; color: #0f172a;">₹${Number(order.totalAmount).toLocaleString()}</td>
                                    </tr>
                                </tfoot>
                            </table>

                            <div style="display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
                                <div style="padding: 15px; border: 1px solid #e2e8f0; border-radius: 12px;">
                                    <h4 style="margin: 0 0 10px; font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase;">Logistics Node</h4>
                                    <p style="margin: 0; font-size: 12px; color: #1e293b; line-height: 1.6;">${order.address}</p>
                                </div>
                                <div style="padding: 15px; border: 1px solid #e2e8f0; border-radius: 12px;">
                                    <h4 style="margin: 0 0 10px; font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase;">Payment Details</h4>
                                    <p style="margin: 0; font-size: 12px; color: #1e293b; line-height: 1.6;">
                                        ID: ${order.paymentId || 'N/A'}<br>
                                        Verified: <span style="color: #10b981; font-weight: bold;">Yes</span>
                                    </p>
                                </div>
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
                                <a href="https://www.vaelinsa.com/track-order?id=${order.trackingId || order.id}" style="background-color: #06b6d4; color: #ffffff; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 800; font-size: 11px; text-transform: uppercase; display: inline-block; box-shadow: 0 4px 6px -1px rgba(6, 182, 212, 0.3);">Track Your Product</a>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div style="background-color: #0f172a; padding: 30px; text-align: center; color: #94a3b8; font-size: 11px;">
                            <p style="margin: 0 0 10px; font-weight: 800; color: #ffffff; text-transform: uppercase; letter-spacing: 1px;">Vaelinsa Industrial Solutions</p>
                            <p style="margin: 0;">support@vaelinsa.com | WhatsApp: +91 89035 95542 | www.vaelinsa.com</p>
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
        return data;
    } catch (err) {
        console.error('[EMAIL] Failed to send confirmation:', err);
        throw err;
    }
}

export async function sendOrderStatusUpdateEmail(order: EmailOrder) {
    try {
        let statusTitle = '';
        let statusMessage = '';
        let statusColor = '#06b6d4';

        switch (order.status) {
            case 'Processing':
                statusTitle = 'Order Processing';
                statusMessage = 'Your payload is currently being initialized and processed in our systems.';
                statusColor = '#06b6d4';
                break;
            case 'Ready to Delivery':
                statusTitle = 'Ready to Shipped';
                statusMessage = 'Your components have passed inspection and are ready for logistics transfer.<br><br>• Your order will be transmitted within 2 working days.<br>• You will get email updates in real-time.';
                statusColor = '#3b82f6';
                break;
            case 'Delivered':
                statusTitle = 'Order Shipped';
                statusMessage = 'Your package has been shipped and is currently in transit.';
                statusColor = '#10b981';
                break;
            default:
                statusTitle = `Order Status: ${order.status}`;
                statusMessage = `Your order status has been updated to ${order.status}.`;
        }

        const trackingUrl = (order.shippingPartner && TRACKING_MAP[order.shippingPartner as keyof typeof TRACKING_MAP]) 
            ? TRACKING_MAP[order.shippingPartner as keyof typeof TRACKING_MAP] 
            : `https://www.vaelinsa.com/track-order?id=${order.trackingId || order.id}`;


        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: [order.email],
            subject: `Update: ${statusTitle} #${order.trackingId || order.id}`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 20px;">
                    <div style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                        <!-- Header -->
                        <div style="background: ${statusColor}; padding: 40px 20px; text-align: center; color: #ffffff;">
                            <h1 style="margin: 0; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">${statusTitle}</h1>
                            <p style="margin: 10px 0 0; opacity: 0.9; font-weight: 600;">ID: #${order.trackingId || order.id}</p>
                        </div>

                        <!-- Main Content -->
                        <div style="padding: 30px;">
                            <p style="font-size: 14px; color: #1e293b; line-height: 1.6; margin-bottom: 25px;">
                                Hello ${order.customerName},<br><br>
                                ${statusMessage}
                            </p>

                            ${(order.shippingDetails || order.carrierTrackingId || order.shippingPartner) ? `
                                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
                                    <h3 style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 15px;">Shipping Logistics</h3>
                                    <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                                        <tr>
                                            <td style="color: #64748b; padding-bottom: 10px;">Carrier Tracking ID</td>
                                            <td style="text-align: right; font-weight: 800; color: #10b981; padding-bottom: 10px;">${order.carrierTrackingId || order.shippingDetails?.trackingId || 'Pending'}</td>
                                        </tr>
                                        <tr>
                                            <td style="color: #64748b; padding-bottom: 10px;">Delivery Partner</td>
                                            <td style="text-align: right; font-weight: 800; color: #0f172a; padding-bottom: 10px;">${order.shippingPartner || order.shippingDetails?.partner || 'Internal Logistics'}</td>
                                        </tr>
                                        ${(order.shippingDetails?.estimatedDelivery) ? `
                                        <tr>
                                            <td style="color: #64748b;">Est. Delivery</td>
                                            <td style="text-align: right; font-weight: 800; color: #0f172a;">${order.shippingDetails.estimatedDelivery}</td>
                                        </tr>
                                        ` : ''}
                                    </table>
                                </div>
                            ` : ''}

                            <div style="text-align: center; margin-top: 30px;">
                                <a href="${trackingUrl}" style="background-color: ${statusColor}; color: #ffffff; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 12px; text-transform: uppercase; display: inline-block;">Track Live Node</a>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div style="background-color: #0f172a; padding: 30px; text-align: center; color: #94a3b8; font-size: 11px;">
                            <p style="margin: 0 0 10px; font-weight: 800; color: #ffffff; text-transform: uppercase; letter-spacing: 1px;">Vaelinsa Industrial Solutions</p>
                            <p style="margin: 0;">Need assistance? WhatsApp: +91 89035 95542 | Reply to this mail.</p>
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
        return data;
    } catch (err) {
        console.error('[EMAIL] Failed to send status update:', err);
        throw err;
    }
}
