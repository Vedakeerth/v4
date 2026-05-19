import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vaelinsa.com';
  
  return {
    rules: [
      // 1. General Web Search Engines (Googlebot, Bingbot, DuckDuckBot, Slurp)
      {
        userAgent: '*',
        allow: [
          '/',
          '/_next/static/js/', // Ensure search engines can fetch critical React bundles
          '/_next/static/css/', // Ensure search engines can render CSS layouts
          '/images/', // Ensure high-precision images are indexable
        ],
        disallow: [
          '/api/', // Block server backend routes
          '/admin/', // Block administrative control panel
          '/secure-management-portal/', // Block secure credentials routes
          '/checkout/', // Block active payment checkout
          '/orders/', // Block confidential client invoice orders
          '/quote/', // Block dynamic pricing calculators
          '/payment-status/', // Block post-payment verification pages
          '/payment-success/', // Block secure success details
        ],
      },
      // 2. AI & LLM Search Crawlers (ChatGPT-User, GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended)
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'ClaudeBot',
          'PerplexityBot',
          'Google-Extended',
          'Applebot-Extended'
        ],
        allow: [
          '/',
          '/services',
          '/products',
          '/projects',
          '/gallery',
          '/blog',
          '/llms.txt', // Direct entry point for LLM context files
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/secure-management-portal/',
          '/checkout/',
          '/orders/',
          '/quote/',
          '/payment-status/',
          '/payment-success/',
        ],
      }
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/sitemap-images.xml`,
    ],
  };
}
