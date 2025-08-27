/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react"],
  },
  images: { unoptimized: true },
  devIndicators: false
};

module.exports = nextConfig;
