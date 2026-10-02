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

        // Extract and delete images from R2
        try {
            const { deleteFileFromR2 } = await import('@/lib/r2');
            
            const extractR2Key = (url: string) => {
                if (!url || !url.includes('/api/r2-file?key=')) return null;
                try {
                    const keyParam = url.split('key=')[1]?.split('&')[0];
                    return keyParam ? decodeURIComponent(keyParam) : null;
                } catch { return null; }
            };

            const keysToDelete: string[] = [];
            
            if (productData.image) {
                const key = extractR2Key(productData.image);
                if (key) keysToDelete.push(key);
            }
            
            if (productData.images && Array.isArray(productData.images)) {
                for (const imgUrl of productData.images) {
                    const key = extractR2Key(imgUrl);
                    if (key) keysToDelete.push(key);
                }
            }
            
            // Delete all collected keys
            for (const key of keysToDelete) {
                await deleteFileFromR2(key).catch(e => console.error("Failed to delete R2 file:", key, e));
            }
        } catch (e) {
            console.error("Error cleaning up R2 files:", e);
        }

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
