/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://vaelinsa.com',
  generateRobotsTxt: true,
  exclude: [
    '/api/*',
    '/admin/*',
    '/secure-management-portal/*',
    '/orders/*',
    '/quote/*',
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/secure-management-portal/',
          '/_next/',
          '/orders/',
          '/quote/*',
        ],
      },
    ],
  },
};
