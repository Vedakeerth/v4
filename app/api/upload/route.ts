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
        const { file, fileName, type } = formData;

        if (!file || !fileName) {
            return NextResponse.json({ success: false, message: 'Missing file data' }, { status: 400 });
        }

        // Buffer from base64
        const buffer = Buffer.from(file.split(',')[1], 'base64');
        const uploadDir = join(process.cwd(), 'public', 'uploads');

        // Ensure directory exists
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) {
            // Directory might already exist
        }

        const relativePath = `/uploads/${Date.now()}-${fileName}`;
        const fullPath = join(process.cwd(), 'public', relativePath);

        await writeFile(fullPath, buffer);

        return NextResponse.json({
            success: true,
            url: relativePath,
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
