import { NextResponse, NextRequest } from 'next/server';
import { getCatalogById, updateCatalog } from '@/lib/catalogs';
import { getProducts } from '@/lib/products';
import { isAuthenticated } from '@/lib/auth';

// GET - Get products in a catalog
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const catalog = await getCatalogById(id);
        if (!catalog) {
            return NextResponse.json({
                success: false,
                message: 'Catalog not found'
            }, { status: 404 });
        }

        const allProducts = await getProducts();
        const catalogProducts = allProducts.filter(p => catalog.productIds.includes(p.id));

        return NextResponse.json({
            success: true,
            products: catalogProducts,
            catalog
        });
    } catch (error) {
        console.error('Error fetching catalog products:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch catalog products'
        }, { status: 500 });
    }
}

// POST - Add products to catalog (requires auth)
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const authenticated = await isAuthenticated();
        if (!authenticated) {
            return NextResponse.json({
                success: false,
                message: 'Unauthorized'
            }, { status: 401 });
        }

        const body = await request.json();
        const { productIds } = body;

        if (!Array.isArray(productIds)) {
            return NextResponse.json({
                success: false,
                message: 'productIds must be an array'
            }, { status: 400 });
        }

        const { id } = await params;
        const catalog = await getCatalogById(id);
        if (!catalog) {
            return NextResponse.json({
                success: false,
                message: 'Catalog not found'
            }, { status: 404 });
        }

        // Merge product IDs, avoiding duplicates
        const updatedProductIds = [...new Set([...catalog.productIds, ...productIds])];
        const updated = await updateCatalog(id, { productIds: updatedProductIds });

        return NextResponse.json({
            success: true,
            catalog: updated,
            message: 'Products added to catalog successfully'
        });
    } catch (error) {
        console.error('Error adding products to catalog:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to add products to catalog'
        }, { status: 500 });
    }
}
