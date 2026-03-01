import testimonialsData from '../data/testimonials.json';

export interface Testimonial {
    id: number;
    name: string;
    role: string;
    company: string;
    rating: number;
    text: string;
}

export function getTestimonials(): Testimonial[] {
    return (testimonialsData || []) as Testimonial[];
}

export async function saveTestimonials(testimonials: Testimonial[]): Promise<void> {
    if (typeof window === 'undefined') {
        const fs = await import('fs');
        const path = await import('path');
        const filePath = path.join(process.cwd(), 'data', 'testimonials.json');

        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(filePath, JSON.stringify(testimonials, null, 2), 'utf8');
    }
}

export function getNextTestimonialId(testimonials: Testimonial[]): number {
    if (testimonials.length === 0) return 1;
    return Math.max(...testimonials.map(t => t.id)) + 1;
}
