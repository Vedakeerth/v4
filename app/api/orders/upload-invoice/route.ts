import { NextResponse } from 'next/server';
import { uploadFileToR2 } from '@/lib/r2';
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

        console.log(`[API] Uploading invoice for order ${orderId} to R2 (${buffer.length} bytes)...`);

        const safeFileName = (fileName || `INVOICE-${orderId}.pdf`).replace(/[^a-zA-Z0-9.-]/g, '_');
        const r2Key = `Invoices/${orderId}/${Date.now()}-${safeFileName}`;

        await uploadFileToR2(buffer, r2Key, 'application/pdf');
        
        const url = `/api/r2-file?key=${encodeURIComponent(r2Key)}`;

        // Update order with PDF URL in Firestore
        await updateOrder(orderId, {
            pdfUrl: url,
            megaFolderUrl: url // Keep for backwards compatibility with DB schema if needed
        });

        return NextResponse.json({ 
            success: true, 
            url: url,
            folderUrl: url
        });

    } catch (error: any) {
        console.error('R2 Upload API Error:', error);
        return NextResponse.json({ 
            error: 'Failed to upload to R2', 
            details: error.message 
        }, { status: 500 });
    }
}
