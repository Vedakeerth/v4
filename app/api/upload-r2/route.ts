import { NextResponse } from 'next/server';
import { uploadFileToR2 } from '@/lib/r2';

export const maxDuration = 60; // Set max duration for Vercel

export async function POST(req: Request) {
    try {
        const contentType = req.headers.get('content-type') || '';
        
        let file: Buffer;
        let fileName: string;
        let rootFolder = 'Quotations';
        let quotationID: string;
        let mimeType = 'application/octet-stream';

        if (contentType.includes('multipart/form-data')) {
            const data = await req.formData();
            const fileEntry = data.get('file') as File;
            quotationID = data.get('quotationID') as string;
            rootFolder = (data.get('rootFolder') as string) || 'Quotations';
            
            if (!fileEntry || !quotationID) {
                return NextResponse.json({ success: false, error: "Missing file or quotationID" }, { status: 400 });
            }

            const bytes = await fileEntry.arrayBuffer();
            file = Buffer.from(bytes);
            fileName = fileEntry.name;
            mimeType = fileEntry.type || mimeType;
        } else {
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

        const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        const r2Key = `${rootFolder}/${quotationID}/${Date.now()}-${safeFileName}`;

        await uploadFileToR2(file, r2Key, mimeType);
        const url = `/api/r2-file?key=${encodeURIComponent(r2Key)}`;

        return NextResponse.json({
            success: true,
            data: {
                name: fileName,
                size: file.length,
                url: url,
                folderUrl: url,
                r2Key: r2Key
            }
        });

    } catch (error: any) {
        console.error('[API][R2] Detailed Error:', {
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
