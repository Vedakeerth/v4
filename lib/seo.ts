import seoData from '../data/seo.json';

export interface PageSEO {
    title: string;
    description: string;
    keywords: string;
}

export interface SEOData {
    [page: string]: PageSEO;
}

export function getSEOData(): SEOData {
    return (seoData || {}) as SEOData;
}

export async function saveSEOData(data: SEOData) {
    if (typeof window === 'undefined') {
        const fs = await import('fs');
        const path = await import('path');
        const seoFilePath = path.join(process.cwd(), 'data', 'seo.json');

        fs.writeFileSync(seoFilePath, JSON.stringify(data, null, 2));
    }
}
