import { NextResponse } from 'next/server';
import { getCatalogs, createCatalog, Catalog } from '@/lib/catalogs';
import { isAuthenticated } from '@/lib/auth';

// GET - Get all catalogs
export async function GET() {
    try {
        const catalogs = getCatalogs();
        return NextResponse.json({ 
            success: true, 
            catalogs 
        });
    } catch (error) {
        console.error('Error fetching catalogs:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Failed to fetch catalogs' 
        }, { status: 500 });
    }
}

// POST - Create new catalog
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, description, productIds } = body;

        if (!name || name.trim().length === 0) {
            return NextResponse.json({ 
                success: false, 
                message: 'Catalog name is required' 
            }, { status: 400 });
        }

        const newCatalog = createCatalog(name, description || '', productIds || []);
        
        return NextResponse.json({ 
            success: true, 
            catalog: newCatalog,
            message: 'Catalog created successfully' 
        });
    } catch (error) {
        console.error('Error creating catalog:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Failed to create catalog' 
        }, { status: 500 });
    }
}
