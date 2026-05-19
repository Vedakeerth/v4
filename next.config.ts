import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
// Force reload: 2026-04-28
const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'scontent.xx.fbcdn.net',
      },
      {
        protocol: 'https',
        hostname: '*.fbcdn.net',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
    ],
  },
  compress: true,
  poweredByHeader: false,
  async redirects() {
    return [
      // Legacy Bad URL / Slug Redirects (301 Permanent - Task 1 & 2)
      {
        source: '/introduction-to-industrial-3d-printing-printing',
        destination: '/blog/intro-to-industrial-3d-printing',
        permanent: true,
      },
      {
        source: '/blog/introduction-to-industrial-3d-printing-printing',
        destination: '/blog/intro-to-industrial-3d-printing',
        permanent: true,
      },
      {
        source: '/toothless-dragen-keychain-KE7726',
        destination: '/gallery/toothless-dragon-keychain',
        permanent: true,
      },
      {
        source: '/gallery/toothless-dragen-keychain-KE7726',
        destination: '/gallery/toothless-dragon-keychain',
        permanent: true,
      },
      {
        source: '/3d-pen-with-morden-feature-52967925',
        destination: '/projects/advanced-3d-printing-pen',
        permanent: true,
      },
      {
        source: '/projects/3d-pen-with-morden-feature-52967925',
        destination: '/projects/advanced-3d-printing-pen',
        permanent: true,
      },
      {
        source: '/projects/3d-pen-with-morden-feature-1770352967925',
        destination: '/projects/advanced-3d-printing-pen',
        permanent: true,
      },
      {
        source: '/ece-stencile-ET3875',
        destination: '/gallery/ece-stencil',
        permanent: true,
      },
      {
        source: '/gallery/ece-stencile-ET3875',
        destination: '/gallery/ece-stencil',
        permanent: true,
      },
      // Old HTML Page Redirects (301 Permanent)
      {
        source: '/index.html',
        destination: '/',
        permanent: true,
      },
      {
        source: '/services.html',
        destination: '/services',
        permanent: true,
      },
      {
        source: '/contact.html',
        destination: '/contact',
        permanent: true,
      },
      {
        source: '/about.html',
        destination: '/',
        permanent: true,
      },
      {
        source: '/gallery.html',
        destination: '/gallery',
        permanent: true,
      },
      {
        source: '/projects.html',
        destination: '/projects',
        permanent: true,
      },
      {
        source: '/faq.html',
        destination: '/faq',
        permanent: true,
      },
      {
        source: '/terms.html',
        destination: '/terms',
        permanent: true,
      },
      {
        source: '/privacy.html',
        destination: '/privacy',
        permanent: true,
      },
      // Admin redirects
      {
        source: '/admin/login',
        destination: '/secure-management-portal/login',
        permanent: false,
      },
      {
        source: '/admin/dashboard',
        destination: '/secure-management-portal/admin',
        permanent: false,
      },
      {
        source: '/admin',
        destination: '/secure-management-portal/login',
        permanent: false,
      },
      // Other legacy redirects
      {
        source: '/features',
        destination: '/gallery',
        permanent: true,
      },
      {
        source: '/catalog',
        destination: '/gallery',
        permanent: true,
      },
      {
        source: '/products',
        destination: '/gallery',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/secure-management-portal/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow, noarchive, nosnippet',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'no-referrer',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
