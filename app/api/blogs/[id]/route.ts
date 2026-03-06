import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { isAuthenticated } from '@/lib/auth';

// GET single blog
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const doc = await adminDb.collection('blogs').doc(id).get();

        if (!doc.exists) {
            return NextResponse.json({ success: false, message: 'Blog not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, blog: { id: doc.id, ...doc.data() } });
    } catch (error) {
        console.error('Error fetching blog:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch blog' }, { status: 500 });
    }
}

// PUT - Update blog (requires auth)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const authenticated = await isAuthenticated();
        if (!authenticated) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const docRef = adminDb.collection('blogs').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return NextResponse.json({ success: false, message: 'Blog not found' }, { status: 404 });
        }

        const updateData = {
            ...body,
            updatedAt: new Date().toISOString(),
        };
        delete updateData.id;

        await docRef.set(updateData, { merge: true });

        return NextResponse.json({
            success: true,
            blog: { id, ...doc.data(), ...updateData }
        });
    } catch (error) {
        console.error('Error updating blog:', error);
        return NextResponse.json({ success: false, message: 'Failed to update blog' }, { status: 500 });
    }
}

// DELETE - Delete blog (requires auth)
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const authenticated = await isAuthenticated();
        if (!authenticated) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const docRef = adminDb.collection('blogs').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return NextResponse.json({ success: false, message: 'Blog not found' }, { status: 404 });
        }

        await docRef.delete();
        return NextResponse.json({ success: true, message: 'Blog deleted successfully' });
    } catch (error) {
        console.error('Error deleting blog:', error);
        return NextResponse.json({ success: false, message: 'Failed to delete blog' }, { status: 500 });
    }
}
