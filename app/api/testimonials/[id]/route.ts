import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { isAuthenticated } from '@/lib/auth';

// GET single testimonial
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const doc = await adminDb.collection('testimonials').doc(id).get();

        if (!doc.exists) {
            return NextResponse.json({
                success: false,
                message: 'Testimonial not found'
            }, { status: 404 });
        }

        return NextResponse.json({ success: true, testimonial: { id: doc.id, ...doc.data() } });
    } catch (error) {
        console.error('Error fetching testimonial:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch testimonial'
        }, { status: 500 });
    }
}

// PUT - Update testimonial (requires auth)
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

        const docRef = adminDb.collection('testimonials').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return NextResponse.json({
                success: false,
                message: 'Testimonial not found'
            }, { status: 404 });
        }

        const updateData = {
            ...body,
            updatedAt: new Date().toISOString(),
        };
        delete updateData.id;

        if (updateData.rating !== undefined) {
            updateData.rating = Math.min(5, Math.max(1, parseInt(updateData.rating.toString()) || 5));
        }

        await docRef.set(updateData, { merge: true });

        return NextResponse.json({
            success: true,
            testimonial: { id, ...doc.data(), ...updateData },
            message: 'Testimonial updated successfully'
        });
    } catch (error) {
        console.error('Error updating testimonial:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to update testimonial'
        }, { status: 500 });
    }
}

// DELETE - Delete testimonial (requires auth)
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
        const docRef = adminDb.collection('testimonials').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return NextResponse.json({
                success: false,
                message: 'Testimonial not found'
            }, { status: 404 });
        }

        const testimonialData = doc.data();
        await docRef.delete();

        return NextResponse.json({
            success: true,
            message: 'Testimonial deleted successfully',
            testimonial: { id, ...testimonialData }
        });
    } catch (error) {
        console.error('Error deleting testimonial:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to delete testimonial'
        }, { status: 500 });
    }
}
