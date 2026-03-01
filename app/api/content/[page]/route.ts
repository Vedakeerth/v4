import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ page: string }> }
) {
    const { page } = await params;
    const filePath = path.join(process.cwd(), 'data', 'pages', `${page}.json`);

    try {
        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: 'Page not found' }, { status: 404 });
        }

        const fileContents = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(fileContents);

        return NextResponse.json(data);
    } catch (error) {
        console.error(`Error reading ${page}.json:`, error);
        return NextResponse.json({ error: 'Failed to load content' }, { status: 500 });
    }
}
