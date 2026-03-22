import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.pngall.com',        // ← just the domain, no protocol or slashes
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'ipowerresale.com',         // note: no "www"
        pathname: '/cdn/shop/files/**',       // allows any file under that folder
      },
    ],
  },
};

export default nextConfig;
