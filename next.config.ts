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
