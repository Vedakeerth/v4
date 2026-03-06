import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { addOrder } from '@/lib/orders';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { user, order } = body;

        // In a real app, use environment variables for credentials
        // const transporter = nodemailer.createTransport({
        //     host: process.env.SMTP_HOST,
        //     port: Number(process.env.SMTP_PORT),
        //     auth: {
        //         user: process.env.SMTP_USER,
        //         pass: process.env.SMTP_PASS,
        //     },
        // });

        // For DEMO: Create a Ethereal test account (dev only) or just simulate success
        // Simulating success allows the user to see the flow without credentials.
        console.log('--- MOCK EMAIL SEND ---');
        console.log('To Customer:', user.email);
        console.log('To Company: info@vaelinsa.com'); // Mock Company Email
        console.log('Order Details:', JSON.stringify(order, null, 2));

        // Construct Email Content (HTML)
        const customerHtml = `
            <div style="font-family: Arial, sans-serif; color: #334155;">
                <h2>Quotation Received - VAELINSA</h2>
                <p>Hi ${user.name},</p>
                <p>Thank you for requesting a quote. Here is a summary of your request:</p>
                
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                    <tr style="background: #f1f5f9;">
                        <th style="padding: 10px; text-align: left;">Model</th>
                        <th style="padding: 10px; text-align: center;">Color</th>
                        <th style="padding: 10px; text-align: center;">Qty</th>
                        <th style="padding: 10px; text-align: right;">Cost</th>
                    </tr>
                    ${order.models.map((m: any) => `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${m.name}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">
                            <div style="display:inline-block; width:15px; height:15px; background-color:${m.color}; border-radius:50%; border:1px solid #ddd;"></div>
                        </td>
                        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${m.quantity}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">Included in Total</td>
                    </tr>
                    `).join('')}
                    <tr style="font-weight: bold;">
                        <td colspan="2" style="padding: 10px; border-top: 2px solid #cbd5e1;">Total Quantity</td>
                        <td style="padding: 10px; border-top: 2px solid #cbd5e1; text-align: center;">${order.totalQty}</td>
                        <td style="padding: 10px; border-top: 2px solid #cbd5e1; text-align: right;">--</td>
                    </tr>
                    <tr style="font-weight: bold; font-size: 1.2em;">
                        <td colspan="3" style="padding: 10px; border-top: 1px solid #cbd5e1;">Final Estimated Total</td>
                        <td style="padding: 10px; border-top: 1px solid #cbd5e1; text-align: right; color: #06b6d4;">₹${order.total.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                </table>

                <p><strong>Delivery Address:</strong><br>${user.address}</p>
                <p><strong>Phone:</strong> ${user.phone}</p>

                <p style="margin-top: 30px; font-size: 12px; color: #64748b;">
                    This is an automated acknowledgment. Our team will verify the files and initiate the process.
                </p>
            </div>
        `;

        // If credentials exist, actually send. Else just log.
        if (process.env.SMTP_HOST) {
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT),
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });

            // Send to Customer
            await transporter.sendMail({
                from: '"VAELINSA" <info@vaelinsa.com>',
                to: user.email,
                subject: `Your 3D Printing Quote (Ref: ${Math.floor(Math.random() * 10000)})`,
                html: customerHtml,
            });

            // Send to Company
            await transporter.sendMail({
                from: '"VAELINSA Website" <info@vaelinsa.com>',
                to: 'info@vaelinsa.com', // Internal email
                subject: `NEW ORDER: ${user.name} - ₹${order.total.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                html: `<p>New order received from website.</p><pre>${JSON.stringify(user, null, 2)}</pre><pre>${JSON.stringify(order, null, 2)}</pre>`
            });
        }

        // Step 3: Save order to data/orders.json for admin follow-up
        try {
            const formattedOrder = {
                id: order.id,
                customerName: user.name,
                email: user.email,
                phone: user.phone,
                date: new Date().toLocaleDateString('en-GB'), // dd/mm/yyyy
                totalAmount: `₹${Math.ceil(order.total.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                status: "Pending" as const,
                items: order.models.map((m: any) => ({
                    name: m.name,
                    quantity: m.quantity,
                    price: `₹${(m.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                    selectedColor: m.color,
                    driveFileId: m.driveFileId // Save the file link ID
                })),
                address: user.address,
                notes: user.message
            };
            await addOrder(formattedOrder);
        } catch (error) {
            console.error('Failed to save order to local storage:', error);
            // Don't fail the whole request if saving to file fails
        }

        // Return success always for demo
        return NextResponse.json({ success: true, message: 'Quote sent successfully' });

    } catch (error) {
        console.error('Email Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to send email' }, { status: 500 });
    }
}
