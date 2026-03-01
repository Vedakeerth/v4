import { NextResponse } from 'next/server';
import { getSocials, saveSocials, SocialLink } from '@/lib/socials';
import { isAuthenticated } from '@/lib/auth';

export async function GET() {
    try {
        const socials = getSocials();
        return NextResponse.json({ success: true, socials });
    } catch (error) {
        console.error('Error fetching socials:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch socials' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const authenticated = await isAuthenticated();
        if (!authenticated) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const socials: SocialLink[] = await req.json();
        await saveSocials(socials);

        return NextResponse.json({ success: true, message: 'Social links updated successfully' });
    } catch (error) {
        console.error('Error updating socials:', error);
        return NextResponse.json({ success: false, message: 'Failed to update socials' }, { status: 500 });
    }
}
