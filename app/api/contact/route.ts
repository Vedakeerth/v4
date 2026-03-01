import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, phone, message } = body;

        // Basic validation
        if (!name || !email || !message) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        console.log('--- MOCK CONTACT FORM SUBMISSION ---');
        console.log('From:', name, `(${email})`);
        console.log('Phone:', phone || 'Not provided');
        console.log('Message:', message);

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

            // Send to Company
            await transporter.sendMail({
                from: `"VAELINSA Contact Form" <${process.env.SMTP_USER}>`,
                to: 'info@vaelinsa.com',
                subject: `New Contact Form Submission from ${name}`,
                html: `
                    <div style="font-family: Arial, sans-serif; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                        <h2 style="color: #0891b2; border-bottom: 2px solid #0891b2; padding-bottom: 10px;">New Contact Message</h2>
                        <div style="margin-top: 20px;">
                            <p><strong>Name:</strong> ${name}</p>
                            <p><strong>Email:</strong> ${email}</p>
                            <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                            <p style="margin-top: 20px;"><strong>Message:</strong></p>
                            <div style="background: #f8fafc; padding: 15px; border-radius: 4px; border-left: 4px solid #0891b2;">
                                ${message.replace(/\n/g, '<br>')}
                            </div>
                        </div>
                        <p style="margin-top: 30px; font-size: 12px; color: #64748b; text-align: center;">
                            This message was sent from the VAELINSA website contact form.
                        </p>
                    </div>
                `,
            });
        }

        return NextResponse.json({ success: true, message: 'Message sent successfully' });

    } catch (error) {
        console.error('Contact Form Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to send message' }, { status: 500 });
    }
}
