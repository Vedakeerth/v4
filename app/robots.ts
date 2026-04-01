import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vaelinsa.com';
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/', 
          '/admin/', 
          '/secure-management-portal/', 
          '/_next/', 
          '/orders/', // Private orders Detail
          '/quote/*', // Individual dynamic quotes
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
