import { NextResponse } from 'next/server';
import { uploadToMega } from '@/lib/mega';

export async function POST(req: Request) {
    try {
        const contentType = req.headers.get('content-type') || '';
        
        let file: Buffer;
        let fileName: string;
        let rootFolder = 'Quotations';
        let quotationID: string;
        if (contentType.includes('multipart/form-data')) {
            const data = await req.formData();
            const fileEntry = data.get('file') as File;
            quotationID = data.get('quotationID') as string;
            rootFolder = (data.get('rootFolder') as string) || 'Quotations';
            
            console.log(`[API][MEGA] FormData Request - Root: ${rootFolder}, Quote: ${quotationID}`);

            if (!fileEntry || !quotationID) {
                return NextResponse.json({ success: false, error: "Missing file or quotationID" }, { status: 400 });
            }

            const bytes = await fileEntry.arrayBuffer();
            file = Buffer.from(bytes);
            fileName = fileEntry.name;
            console.log(`[API][MEGA] Received file: ${fileName} (${(file.length / 1024 / 1024).toFixed(2)} MB)`);
        } else {
            // Fallback for JSON if they send base64
            const body = await req.json();
            const { fileBase64, name, quoteID, rootFolder: rf } = body;
            
            if (!fileBase64 || !quoteID) {
                return NextResponse.json({ success: false, error: "Missing file data or quoteID" }, { status: 400 });
            }

            file = Buffer.from(fileBase64, 'base64');
            fileName = name || `file_${Date.now()}.stl`;
            quotationID = quoteID;
            rootFolder = rf || 'Quotations';
        }

        const result = await uploadToMega(file, fileName, quotationID, rootFolder);

        console.log(`[API][MEGA] Upload success for ${fileName}. URL: ${result.url}`);

        return NextResponse.json({
            success: true,
            data: result
        });

    } catch (error: any) {
        console.error('[API][MEGA] Detailed Error:', {
            message: error.message,
            stack: error.stack,
            cause: error.cause
        });
        return NextResponse.json({ 
            success: false, 
            error: error.message || "Failed to upload" 
        }, { status: 500 });
    }
}
