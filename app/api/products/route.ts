import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { isAuthenticated } from '@/lib/auth';

import { QueryDocumentSnapshot, DocumentData } from 'firebase-admin/firestore';

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    images: string[];
    category: string;
    inStock: boolean;
    stockCount: number;
    availabilityStatus: string;
}

// GET all products
export async function GET() {
    try {
        const snapshot = await adminDb.collection('products').orderBy('createdAt', 'desc').get();
        const products: Product[] = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
            id: doc.id,
            ...doc.data(),
        } as Product));
        return NextResponse.json({ success: true, products });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch products' }, { status: 500 });
    }
}

// POST - Add new product (requires auth)
export async function POST(req: Request) {
    try {
        const authenticated = await isAuthenticated();
        if (!authenticated) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();

        const newProduct = {
            name: body.name,
            description: body.description,
            price: body.price,
            image: body.image,
            images: body.images || [body.image],
            category: body.category,
            inStock: body.inStock !== undefined ? body.inStock : true,
            stockCount: body.stockCount || 0,
            availabilityStatus: body.availabilityStatus || (body.inStock !== false ? 'In Stock' : 'Out of Stock'),
            createdAt: new Date().toISOString(),
        };

        const docRef = await adminDb.collection('products').add(newProduct);

        return NextResponse.json({
            success: true,
            product: { id: docRef.id, ...newProduct },
            message: 'Product added successfully',
        });
    } catch (error) {
        console.error('Error adding product:', error);
        return NextResponse.json({ success: false, message: 'Failed to add product' }, { status: 500 });
    }
}
