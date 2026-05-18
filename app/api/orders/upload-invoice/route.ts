import { NextResponse } from 'next/server';
import { uploadToMega } from '@/lib/mega';
import { updateOrder } from '@/lib/orders';

export async function POST(req: Request) {
    try {
        const { orderId, pdfBase64, fileName } = await req.json();

        if (!orderId || !pdfBase64) {
            return NextResponse.json({ error: 'Order ID and PDF data are required' }, { status: 400 });
        }

        // Convert data URI to buffer
        // Safer way to extract base64 from data URI
        const base64Data = pdfBase64.includes(';base64,') 
            ? pdfBase64.split(';base64,').pop() 
            : pdfBase64;
            
        const buffer = Buffer.from(base64Data, 'base64');

        console.log(`[API] Uploading invoice for order ${orderId} to MEGA (${buffer.length} bytes)...`);

        // Upload to MEGA
        const result = await uploadToMega(
            buffer,
            fileName || `INVOICE-${orderId}.pdf`,
            orderId,
            'Invoices' // Root folder
        );

        // Update order with PDF URL in Firestore
        await updateOrder(orderId, {
            pdfUrl: result.url,
            megaFolderUrl: result.folderUrl
        });

        return NextResponse.json({ 
            success: true, 
            url: result.url,
            folderUrl: result.folderUrl
        });

    } catch (error: any) {
        console.error('MEGA Upload API Error:', error);
        return NextResponse.json({ 
            error: 'Failed to upload to MEGA', 
            details: error.message 
        }, { status: 500 });
    }
}
