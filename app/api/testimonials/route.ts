import { NextResponse } from 'next/server';
import { getTestimonials, saveTestimonials, getNextTestimonialId, Testimonial } from '@/lib/testimonials';
import { isAuthenticated } from '@/lib/auth';

// GET all testimonials
export async function GET() {
    try {
        const testimonials = getTestimonials();
        return NextResponse.json({ success: true, testimonials });
    } catch (error) {
        console.error('Error fetching testimonials:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Failed to fetch testimonials' 
        }, { status: 500 });
    }
}

// POST - Add new testimonial (requires auth)
export async function POST(req: Request) {
    try {
        const authenticated = await isAuthenticated();
        if (!authenticated) {
            return NextResponse.json({ 
                success: false, 
                message: 'Unauthorized' 
            }, { status: 401 });
        }

        const body = await req.json();
        const testimonials = getTestimonials();
        
        const newTestimonial: Testimonial = {
            id: getNextTestimonialId(testimonials),
            name: body.name,
            role: body.role,
            company: body.company,
            rating: Math.min(5, Math.max(1, parseInt(body.rating.toString()) || 5)),
            text: body.text,
        };

        testimonials.push(newTestimonial);
        saveTestimonials(testimonials);

        return NextResponse.json({ 
            success: true, 
            testimonial: newTestimonial,
            message: 'Testimonial added successfully' 
        });
    } catch (error) {
        console.error('Error adding testimonial:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Failed to add testimonial' 
        }, { status: 500 });
    }
}
