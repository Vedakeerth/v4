import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { isAuthenticated } from '@/lib/auth';
import { revalidatePath, revalidateTag } from 'next/cache';

import { QueryDocumentSnapshot, DocumentData } from 'firebase-admin/firestore';
import { generateProductCode } from '@/lib/products';

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
        const productId = generateProductCode(body.category || 'Uncategorized');

        const newProduct = {
            ...body,
            name: body.name,
            description: body.description,
            price: body.price,
            mrp: body.mrp || "",
            image: body.image,
            images: Array.isArray(body.images) && body.images.length > 0 ? body.images : [body.image],
            category: body.category || 'Uncategorized',
            inStock: body.inStock !== undefined ? body.inStock : true,
            isPopular: body.isPopular || false,
            stockCount: body.stockCount !== undefined && body.stockCount !== "" ? Number(body.stockCount) : 0,
            availabilityStatus: body.availabilityStatus || (body.inStock !== false ? 'In Stock' : 'Out of Stock'),
            colors: body.colors || [],
            defaultColor: body.defaultColor || "",
            weight: body.weight !== undefined && body.weight !== "" ? Number(body.weight) : 0,
            length: body.length !== undefined && body.length !== "" ? Number(body.length) : 0,
            width: body.width !== undefined && body.width !== "" ? Number(body.width) : 0,
            height: body.height !== undefined && body.height !== "" ? Number(body.height) : 0,
            likes: body.likes !== undefined && body.likes !== "" ? Number(body.likes) : 0,
            views: body.views !== undefined && body.views !== "" ? Number(body.views) : 0,
            createdAt: new Date().toISOString(),
        };

        // Use the generated short ID as the document ID
        await adminDb.collection('products').doc(productId).set(newProduct);

        try {
            revalidatePath('/gallery');
            revalidatePath('/products');
            revalidatePath('/');
            (revalidateTag as any)('products');
        } catch (e) {
            console.warn("Revalidation warning in POST:", e);
        }

        return NextResponse.json({
            success: true,
            product: { id: productId, ...newProduct },
            message: 'Product added successfully with tracking code ' + productId,
        });
    } catch (error) {
        console.error('Error adding product:', error);
        return NextResponse.json({ success: false, message: 'Failed to add product' }, { status: 500 });
    }
}
