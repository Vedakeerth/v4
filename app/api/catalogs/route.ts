import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { isAuthenticated } from '@/lib/auth';

export interface Catalog {
    id: string;
    name: string;
    description: string;
    productIds: string[];
    createdAt?: string;
}

// GET - Get all catalogs
export async function GET() {
    try {
        const snapshot = await adminDb.collection('catalogs').orderBy('createdAt', 'desc').get();
        const catalogs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        return NextResponse.json({ success: true, catalogs });
    } catch (error) {
        console.error('Error fetching catalogs:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch catalogs' }, { status: 500 });
    }
}

// POST - Create new catalog
export async function POST(req: Request) {
    try {
        const authenticated = await isAuthenticated();
        if (!authenticated) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { name, description, productIds } = body;

        if (!name || name.trim().length === 0) {
            return NextResponse.json({ success: false, message: 'Catalog name is required' }, { status: 400 });
        }

        const newCatalog = {
            name,
            description: description || '',
            productIds: productIds || [],
            createdAt: new Date().toISOString(),
        };

        const docRef = await adminDb.collection('catalogs').add(newCatalog);

        return NextResponse.json({
            success: true,
            catalog: { id: docRef.id, ...newCatalog },
            message: 'Catalog created successfully'
        });
    } catch (error) {
        console.error('Error creating catalog:', error);
        return NextResponse.json({ success: false, message: 'Failed to create catalog' }, { status: 500 });
    }
}
