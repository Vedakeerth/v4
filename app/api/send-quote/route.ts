import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { addOrder } from '@/lib/orders';
import { verifyRecaptchaEnterprise } from '@/lib/recaptcha';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { user, order, recaptchaToken } = body;

        if (!recaptchaToken) {
            return NextResponse.json({ success: false, error: 'reCAPTCHA token is required' }, { status: 400 });
        }

        const isValidRecaptcha = await verifyRecaptchaEnterprise(recaptchaToken, 'SUBMIT');
        if (!isValidRecaptcha) {
            return NextResponse.json({ success: false, error: "reCAPTCHA verification failed. Please try again." }, { status: 400 });
        }

        // In a real app, use environment variables for credentials
        // const transporter = nodemailer.createTransport({
        //     host: process.env.SMTP_HOST,
        //     port: Number(process.env.SMTP_PORT),
        //     auth: {
        //         user: process.env.SMTP_USER,
        //         pass: process.env.SMTP_PASS,
        //     },
        // });

        // Use the new Resend-based email service
        const { sendInstantQuotation } = await import('@/lib/emailService');
        
        const formattedOrderForEmail = {
            id: order.id,
            email: user.email,
            customerName: user.name,
            totalAmount: order.total.grandTotal,
            subtotal: order.total.subtotal,
            shipping: order.total.shipping,
            discount: order.total.discount || 0,
            pdfUrl: order.pdfUrl,
            items: order.models.map((m: any) => ({
                id: m.id,
                name: m.name,
                quantity: m.quantity,
                price: m.price || 0,
                total: m.total || (m.price * m.quantity) || 0,
                color: m.color
            }))
        };

        const emailResult = await sendInstantQuotation(formattedOrderForEmail);
        if (!emailResult.success) {
            console.error('Resend Quotation Email Failed:', emailResult.error);
        }

        // Step 3: Save order to data/orders.json for admin follow-up
        try {
            const formattedOrder = {
                id: order.id,
                customerName: user.name,
                email: user.email,
                phone: user.phone,
                date: new Date().toLocaleDateString('en-GB'), // dd/mm/yyyy
                totalAmount: order.total.grandTotal,
                subtotal: order.total.subtotal,
                shipping: order.total.shipping,
                status: "Pending" as const,
                items: order.models.map((m: any) => ({
                    id: m.id,
                    name: m.name,
                    quantity: m.quantity,
                    price: m.price || 0,
                    total: m.total || (m.price * m.quantity) || 0,
                    selectedColor: m.color,
                    fileUrl: m.fileUrl,
                    dimensions: m.dimensions,
                    scale: m.scale
                })),
                address: user.address,
                notes: user.message,
                material: order.material,
                infillPercent: order.infillPercent,
                infillPattern: order.infillPattern,
                pdfUrl: order.pdfUrl,
                megaFolderUrl: order.megaFolderUrl,
                quotationId: order.id
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
