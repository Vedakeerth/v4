import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { isAuthenticated } from '@/lib/auth';

// GET single product
export async function GET(
    req: Request,
    { params }: any
) {
    try {
        const { id } = await params;
        const doc = await adminDb.collection('products').doc(id).get();

        if (!doc.exists) {
            return NextResponse.json({
                success: false,
                message: 'Product not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            product: { id: doc.id, ...doc.data() }
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch product'
        }, { status: 500 });
    }
}

// PUT - Update product (requires auth)
export async function PUT(
    req: Request,
    { params }: any
) {
    try {
        const authenticated = await isAuthenticated();
        if (!authenticated) {
            return NextResponse.json({
                success: false,
                message: 'Unauthorized'
            }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();

        const docRef = adminDb.collection('products').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return NextResponse.json({
                success: false,
                message: 'Product not found'
            }, { status: 404 });
        }

        const updateData = {
            ...body,
            updatedAt: new Date().toISOString(),
        };

        // Remove ID from body if it exists to avoid re-writing it into the document fields
        delete updateData.id;

        await docRef.set(updateData, { merge: true });

        return NextResponse.json({
            success: true,
            product: { id, ...doc.data(), ...updateData },
            message: 'Product updated successfully'
        });
    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to update product'
        }, { status: 500 });
    }
}

// DELETE - Delete product (requires auth)
export async function DELETE(
    req: Request,
    { params }: any
) {
    try {
        const authenticated = await isAuthenticated();
        if (!authenticated) {
            return NextResponse.json({
                success: false,
                message: 'Unauthorized'
            }, { status: 401 });
        }

        const { id } = await params;
        const docRef = adminDb.collection('products').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return NextResponse.json({
                success: false,
                message: 'Product not found'
            }, { status: 404 });
        }

        const productData = doc.data();
        await docRef.delete();

        return NextResponse.json({
            success: true,
            message: 'Product deleted successfully',
            product: { id, ...productData }
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to delete product'
        }, { status: 500 });
    }
}
