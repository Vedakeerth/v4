import { NextResponse } from 'next/server';
import { uploadFileToR2 } from '@/lib/r2';
import { join } from 'path';
import { readFile } from 'fs/promises';

export const maxDuration = 60; // Set max duration for Vercel

/** Apply VAELINSA logo watermark (mid-right) to an image buffer using sharp. */
async function applyWatermark(imageBuffer: Buffer): Promise<Buffer> {
    try {
        const sharp = (await import('sharp')).default;
        const logoPath = join(process.cwd(), 'public', 'images', 'logo-v2.png');
        const logoBuffer = await readFile(logoPath);

        // Get main image dimensions
        const { width: imgW = 800, height: imgH = 800 } = await sharp(imageBuffer).metadata();

        // Scale logo to 25% of image width, max 300px, min 60px
        const logoTargetWidth = Math.min(300, Math.max(60, Math.round(imgW * 0.25)));
        const resizedLogo = await sharp(logoBuffer)
            .resize(logoTargetWidth, undefined, { fit: 'inside', withoutEnlargement: true })
            .png()
            .toBuffer();

        const { width: logoW = logoTargetWidth, height: logoH = logoTargetWidth } = await sharp(resizedLogo).metadata();

        // Position: mid-right — right edge with 2% margin, vertically centered
        const margin = Math.round(imgW * 0.02);
        const left = imgW - logoW - margin;
        const top = Math.round((imgH - logoH) / 2);

        return await sharp(imageBuffer)
            .composite([{
                input: resizedLogo,
                left: Math.max(0, left),
                top: Math.max(0, top),
                blend: 'over',
            }])
            .jpeg({ quality: 90 })
            .toBuffer();
    } catch (err) {
        console.warn('[Watermark] Failed to apply watermark, using original:', err);
        return imageBuffer; // fall back to original if watermark fails
    }
}

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

        // Apply VAELINSA watermark only for product image uploads
        const isProductUpload = rootFolder.toLowerCase() === 'products';
        const isImage = mimeType.startsWith('image/') ||
            /\.(jpe?g|png|webp|gif)$/i.test(fileName);

        if (isProductUpload && isImage) {
            file = await applyWatermark(file);
            mimeType = 'image/jpeg'; // watermark output is always JPEG
            fileName = fileName.replace(/\.[^.]+$/, '.jpg');
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
