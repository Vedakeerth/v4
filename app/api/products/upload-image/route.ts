import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { isAuthenticated } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        // Check authentication
        const authenticated = await isAuthenticated();
        if (!authenticated) {
            return NextResponse.json({ 
                success: false, 
                message: 'Unauthorized' 
            }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('image') as File;

        if (!file) {
            return NextResponse.json({ 
                success: false, 
                message: 'No file provided' 
            }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ 
                success: false, 
                message: 'Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed.' 
            }, { status: 400 });
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return NextResponse.json({ 
                success: false, 
                message: 'File size too large. Maximum size is 5MB.' 
            }, { status: 400 });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const fileExtension = file.name.split('.').pop() || 'jpg';
        const fileName = `product_${timestamp}_${randomStr}.${fileExtension}`;

        // Ensure images directory exists
        const imagesDir = join(process.cwd(), 'public', 'images');
        if (!existsSync(imagesDir)) {
            await mkdir(imagesDir, { recursive: true });
        }

        // Convert file to buffer and save
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filePath = join(imagesDir, fileName);
        
        await writeFile(filePath, buffer);

        // Return the public URL
        const imageUrl = `/images/${fileName}`;

        return NextResponse.json({ 
            success: true, 
            url: imageUrl,
            message: 'Image uploaded successfully' 
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Failed to upload image: ' + (error instanceof Error ? error.message : 'Unknown error')
        }, { status: 500 });
    }
}
