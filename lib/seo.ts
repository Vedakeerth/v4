import type { Metadata } from 'next';
import { PageSEO, SEOData } from '@/types';
export type { PageSEO, SEOData } from '@/types';

export async function getSEOData(): Promise<SEOData> {
    if (typeof window === 'undefined') {
        const { adminDb } = await import('./firebaseAdmin');
        try {
            const doc = await adminDb.collection('config').doc('seo').get();
            return (doc.data() as SEOData) || {};
        } catch (error) {
            console.error('Error fetching SEO data from Firestore:', error);
            return {};
        }
    } else {
        const res = await fetch('/api/seo');
        const data = await res.json();
        return data.seoData || {};
    }
}

export async function saveSEOData(data: SEOData) {
    if (typeof window === 'undefined') {
        const { adminDb } = await import('./firebaseAdmin');
        await adminDb.collection('config').doc('seo').set({
            ...data,
            updatedAt: new Date().toISOString()
        }, { merge: true });
    } else {
        await fetch('/api/seo', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
}

const DEFAULT_PAGE_SEO: Record<string, { title: string; description: string; keywords: string }> = {
    Home: {
        title: "VAELINSA | 3D Printing & Engineering Solutions India",
        description: "Premium 3D printing, rapid prototyping, and CAD engineering services. Upload 3D files for an instant AI quotation.",
        keywords: "3D printing India, FDM printing, SLA resin printing, rapid prototyping, CAD design, online 3D printing, VAELINSA"
    },
    Services: {
        title: "Industrial 3D Printing Services | VAELINSA",
        description: "Industrial-grade FDM 3D printing, high-resolution resin printing, product design, and rapid prototyping services.",
        keywords: "FDM printing services, SLA resin printing, rapid prototyping India, product design, CAD modeling, additive manufacturing"
    },
    Projects: {
        title: "Engineering Case Studies | VAELINSA",
        description: "Explore our successful product design, mechanical engineering, and additive manufacturing projects.",
        keywords: "engineering design portfolio, 3D printing projects, rapid prototyping portfolio, additive manufacturing case studies"
    },
    Gallery: {
        title: "3D Printing Project Gallery | VAELINSA",
        description: "Browse our gallery of high-precision 3D prints, functional prototypes, architectural models, and custom mechanical parts.",
        keywords: "3D print gallery, custom parts catalog, FDM prints showcase, resin printing examples, industrial rapid prototyping"
    },
    Contact: {
        title: "Contact Our Engineering & Design Team | VAELINSA",
        description: "Get in touch with VAELINSA for custom 3D printing, bulk manufacturing quotes, or mechanical product design queries.",
        keywords: "contact 3D printing lab, Coimbatore 3D printing, talk to engineers, custom manufacturing quote"
    },
    FAQ: {
        title: "Frequently Asked Questions (FAQ) | VAELINSA 3D Printing",
        description: "Find answers to all your questions about 3D printing materials, lead times, instant quoting, shipping, and design.",
        keywords: "3D printing FAQ, instant quote help, FDM vs SLA, shipping delivery times, design support"
    },
    Terms: {
        title: "Terms of Service | VAELINSA",
        description: "Read the terms, conditions, and 7-day warranty/refund policies governing our 3D printing and CAD engineering services.",
        keywords: "terms and conditions, 3D printing warranty, return refund policies VAELINSA"
    },
    Privacy: {
        title: "Privacy Policy & Confidentiality | VAELINSA",
        description: "Learn how we protect your personal information, design models, and CAD files. Strict 10-20 day automatic file deletion policy.",
        keywords: "privacy policy, 3D file security, CAD model confidentiality, data retention"
    },
    About: {
        title: "About Us | VAELINSA 3D Printing & Engineering India",
        description: "Learn about VAELINSA - Coimbatore's premier industrial 3D printing and rapid prototyping lab turning complex CAD concepts into physical engineering realities.",
        keywords: "about VAELINSA, 3D printing lab Coimbatore, rapid prototyping history India, mechanical engineers team"
    }
};

export async function getPageMetadata(
    pageName: string,
    path: string = '',
    customMeta?: Partial<Metadata>
): Promise<Metadata> {
    const seoData = await getSEOData();
    const pageSEO = seoData[pageName] || seoData[pageName.toLowerCase()] || DEFAULT_PAGE_SEO[pageName] || DEFAULT_PAGE_SEO['Home'];

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vaelinsa.com';
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const canonicalUrl = `${baseUrl}${cleanPath === '/' ? '' : cleanPath}`;
    const socialImage = `${baseUrl}/images/social-preview.png`;

    const baseMetadata: Metadata = {
        title: pageSEO.title,
        description: pageSEO.description,
        keywords: pageSEO.keywords,
        metadataBase: new URL(baseUrl),
        alternates: {
            canonical: canonicalUrl,
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
        openGraph: {
            title: pageSEO.title,
            description: pageSEO.description,
            url: canonicalUrl,
            siteName: 'VAELINSA',
            locale: 'en_IN',
            type: 'website',
            images: [
                {
                    url: socialImage,
                    width: 1200,
                    height: 630,
                    alt: pageSEO.title || 'VAELINSA 3D Printing',
                }
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: pageSEO.title,
            description: pageSEO.description,
            images: [socialImage],
            creator: '@vaelinsa',
            site: '@vaelinsa',
        },
    };

    if (customMeta) {
        return {
            ...baseMetadata,
            ...customMeta,
            openGraph: {
                ...baseMetadata.openGraph,
                ...customMeta.openGraph,
                images: customMeta.openGraph?.images || baseMetadata.openGraph?.images,
            },
            twitter: {
                ...baseMetadata.twitter,
                ...customMeta.twitter,
                images: customMeta.twitter?.images || baseMetadata.twitter?.images,
            },
            alternates: {
                ...baseMetadata.alternates,
                ...customMeta.alternates,
            },
            robots: (typeof baseMetadata.robots === 'object' && typeof customMeta.robots === 'object')
                ? { ...(baseMetadata.robots as any), ...(customMeta.robots as any) }
                : (customMeta.robots || baseMetadata.robots)
        };
    }

    return baseMetadata;
}
