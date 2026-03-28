import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { isAuthenticated } from '@/lib/auth';

// GET - Get catalog by ID
export async function GET(
    req: Request,
    { params }: any
) {
    try {
        const { id } = await params;
        const doc = await adminDb.collection('catalogs').doc(id).get();
        if (!doc.exists) {
            return NextResponse.json({
                success: false,
                message: 'Catalog not found'
            }, { status: 404 });
        }
        return NextResponse.json({
            success: true,
            catalog: { id: doc.id, ...doc.data() }
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

        const docRef = adminDb.collection('catalogs').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return NextResponse.json({
                success: false,
                message: 'Catalog not found'
            }, { status: 404 });
        }

        const updateData = {
            ...body,
            updatedAt: new Date().toISOString(),
        };
        delete updateData.id;

        await docRef.set(updateData, { merge: true });

        return NextResponse.json({
            success: true,
            catalog: { id, ...doc.data(), ...updateData },
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
        const docRef = adminDb.collection('catalogs').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return NextResponse.json({
                success: false,
                message: 'Catalog not found'
            }, { status: 404 });
        }

        await docRef.delete();

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
