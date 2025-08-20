/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react"],
  },
  images: { unoptimized: true },
  devIndicators: false,
  reactStrictMode: false,
};

module.exports = nextConfig;
