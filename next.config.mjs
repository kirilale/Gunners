/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'arsenal-fan-platform.s3.amazonaws.com',
      'media.api-sports.io',
      'lh3.googleusercontent.com',
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
