/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  // Remove the static export for full Next.js deployment
  trailingSlash: true,
  // Add base path if needed
  // basePath: '/frontend',
};

module.exports = nextConfig;
