import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { isAuthenticated } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const authenticated = await isAuthenticated();
        if (!authenticated) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.json();
        const { file, fileName, type, context = "general" } = formData;
        // 'context' can be 'products', 'projects', 'quotations', 'blogs'

        if (!file || !fileName) {
            return NextResponse.json({ success: false, message: 'Missing file data' }, { status: 400 });
        }

        let buffer: Buffer;
        let mimeType = 'application/octet-stream';

        if (file.startsWith('data:')) {
            const matches = file.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
                mimeType = matches[1];
                buffer = Buffer.from(matches[2], 'base64');
            } else {
                buffer = Buffer.from(file.split(',')[1] || file, 'base64');
            }
        } else {
            buffer = Buffer.from(file, 'base64');
        }

        const uniqueId = Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
        const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        const r2Key = `${context}/${uniqueId}/${safeFileName}`;

        // Upload to R2
        const { uploadFileToR2 } = await import('@/lib/r2');
        await uploadFileToR2(buffer, r2Key, mimeType);

        // Return a special protocol or the API route to fetch it
        // We will store the r2Key in Firestore. But to not break UI immediately, 
        // we can also return a URL that routes through our Next.js API.
        const url = `/api/r2-file?key=${encodeURIComponent(r2Key)}`;

        return NextResponse.json({
            success: true,
            url: url,
            r2Key: r2Key,
            message: 'File uploaded successfully'
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to upload file'
        }, { status: 500 });
    }
}
