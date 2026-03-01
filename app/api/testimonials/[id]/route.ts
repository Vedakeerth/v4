import { NextResponse } from 'next/server';
import { getTestimonials, saveTestimonials, Testimonial } from '@/lib/testimonials';
import { isAuthenticated } from '@/lib/auth';

// GET single testimonial
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const testimonials = getTestimonials();
        const testimonial = testimonials.find(t => t.id === parseInt(id));

        if (!testimonial) {
            return NextResponse.json({
                success: false,
                message: 'Testimonial not found'
            }, { status: 404 });
        }

        return NextResponse.json({ success: true, testimonial });
    } catch (error) {
        console.error('Error fetching testimonial:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch testimonial'
        }, { status: 500 });
    }
}

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
        const testimonialId = parseInt(id);

        if (isNaN(testimonialId)) {
            return NextResponse.json({
                success: false,
                message: 'Invalid testimonial ID'
            }, { status: 400 });
        }

        const body = await req.json();
        const testimonials = getTestimonials();
        const testimonialIndex = testimonials.findIndex(t => t.id === testimonialId);

        if (testimonialIndex === -1) {
            return NextResponse.json({
                success: false,
                message: 'Testimonial not found'
            }, { status: 404 });
        }

        // Update testimonial
        testimonials[testimonialIndex] = {
            ...testimonials[testimonialIndex],
            ...body,
            id: testimonialId, // Ensure ID doesn't change
            rating: Math.min(5, Math.max(1, parseInt(body.rating?.toString() || testimonials[testimonialIndex].rating.toString()) || 5)),
        };

        await saveTestimonials(testimonials);

        return NextResponse.json({
            success: true,
            testimonial: testimonials[testimonialIndex],
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
        const testimonialId = parseInt(id);

        if (isNaN(testimonialId)) {
            return NextResponse.json({
                success: false,
                message: 'Invalid testimonial ID'
            }, { status: 400 });
        }

        const testimonials = getTestimonials();
        const testimonialIndex = testimonials.findIndex(t => t.id === testimonialId);

        if (testimonialIndex === -1) {
            return NextResponse.json({
                success: false,
                message: 'Testimonial not found'
            }, { status: 404 });
        }

        const deletedTestimonial = testimonials.splice(testimonialIndex, 1)[0];
        await saveTestimonials(testimonials);

        return NextResponse.json({
            success: true,
            message: 'Testimonial deleted successfully',
            testimonial: deletedTestimonial
        });
    } catch (error) {
        console.error('Error deleting testimonial:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to delete testimonial'
        }, { status: 500 });
    }
}
