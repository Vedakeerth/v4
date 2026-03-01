import { NextResponse } from 'next/server';
import { getCatalogById, updateCatalog, deleteCatalog } from '@/lib/catalogs';
import { isAuthenticated } from '@/lib/auth';

// GET - Get catalog by ID
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const catalog = getCatalogById(id);
        if (!catalog) {
            return NextResponse.json({
                success: false,
                message: 'Catalog not found'
            }, { status: 404 });
        }
        return NextResponse.json({
            success: true,
            catalog
        });
    } catch (error) {
        console.error('Error fetching catalog:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch catalog'
        }, { status: 500 });
    }
}

// PUT - Update catalog (requires auth)
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
        const body = await req.json();
        const updated = await updateCatalog(id, body);

        if (!updated) {
            return NextResponse.json({
                success: false,
                message: 'Catalog not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            catalog: updated,
            message: 'Catalog updated successfully'
        });
    } catch (error) {
        console.error('Error updating catalog:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to update catalog'
        }, { status: 500 });
    }
}

// DELETE - Delete catalog (requires auth)
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
        const deleted = await deleteCatalog(id);

        if (!deleted) {
            return NextResponse.json({
                success: false,
                message: 'Catalog not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Catalog deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting catalog:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to delete catalog'
        }, { status: 500 });
    }
}
