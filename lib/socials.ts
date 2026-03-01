import socialsData from '../data/socials.json';

export interface SocialLink {
    id: string;
    name: string;
    url: string;
    icon: string;
}

export function getSocials(): SocialLink[] {
    return socialsData as SocialLink[];
}

export async function saveSocials(socials: SocialLink[]) {
    if (typeof window === 'undefined') {
        const fs = await import('fs');
        const path = await import('path');
        const filePath = path.join(process.cwd(), 'data', 'socials.json');
        fs.writeFileSync(filePath, JSON.stringify(socials, null, 2));
    }
}
