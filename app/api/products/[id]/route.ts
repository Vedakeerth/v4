import { NextResponse } from 'next/server';
import { getProducts, saveProducts, Product } from '@/lib/products';
import { isAuthenticated } from '@/lib/auth';

// GET single product
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const products = getProducts();
        const product = products.find(p => p.id === parseInt(id));

        if (!product) {
            return NextResponse.json({
                success: false,
                message: 'Product not found'
            }, { status: 404 });
        }

        return NextResponse.json({ success: true, product });
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
    { params }: { params: Promise<{ id: string }> }
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
        const productId = parseInt(id);

        if (isNaN(productId)) {
            return NextResponse.json({
                success: false,
                message: 'Invalid product ID'
            }, { status: 400 });
        }

        const body = await req.json();
        const products = getProducts();
        const productIndex = products.findIndex(p => p.id === productId);

        if (productIndex === -1) {
            return NextResponse.json({
                success: false,
                message: 'Product not found'
            }, { status: 404 });
        }

        // Update product
        products[productIndex] = {
            ...products[productIndex],
            ...body,
            id: productId, // Ensure ID doesn't change
        };

        await saveProducts(products);

        return NextResponse.json({
            success: true,
            product: products[productIndex],
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
    { params }: { params: Promise<{ id: string }> }
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
        const productId = parseInt(id);

        if (isNaN(productId)) {
            return NextResponse.json({
                success: false,
                message: 'Invalid product ID'
            }, { status: 400 });
        }

        const products = getProducts();
        const productIndex = products.findIndex(p => p.id === productId);

        if (productIndex === -1) {
            return NextResponse.json({
                success: false,
                message: 'Product not found'
            }, { status: 404 });
        }

        const deletedProduct = products.splice(productIndex, 1)[0];
        await saveProducts(products);

        return NextResponse.json({
            success: true,
            message: 'Product deleted successfully',
            product: deletedProduct
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to delete product: ' + (error instanceof Error ? error.message : 'Unknown error')
        }, { status: 500 });
    }
}
