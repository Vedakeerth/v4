import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ page: string }> } // Fix for Next.js 15+ async params
) {
    try {
        const { page } = await params;
        const filePath = path.join(process.cwd(), 'data', 'pages', `${page}.json`);

        try {
            const fileContent = await fs.readFile(filePath, 'utf8');
            return NextResponse.json({ success: true, content: JSON.parse(fileContent) });
        } catch (error) {
            return NextResponse.json({ success: false, message: "Page content not found" }, { status: 404 });
        }
    } catch (error) {
        return NextResponse.json({ success: false, message: "Error fetching page content" }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ page: string }> }
) {
    try {
        const { page } = await params;
        const body = await request.json();
        const filePath = path.join(process.cwd(), 'data', 'pages', `${page}.json`);

        await fs.writeFile(filePath, JSON.stringify(body, null, 4));
        return NextResponse.json({ success: true, message: "Page content updated" });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Error saving page content" }, { status: 500 });
    }
}
