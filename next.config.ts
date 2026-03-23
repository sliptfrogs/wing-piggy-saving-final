import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.pngall.com", // ← just the domain, no protocol or slashes
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: "ipowerresale.com", // note: no "www"
        pathname: "/cdn/shop/files/**", // allows any file under that folder
      },
      {
        protocol: "https",
        hostname: "static.vecteezy.com",
        pathname: "/system/resources/**", // matches the URL path pattern
      },
      {
        protocol: "https",
        hostname: "www.bmw-m.com",
        pathname: "/content/dam/bmw/**", // matches the URL path pattern
      },
      {
        protocol: "https",
        hostname: "static.vecteezy.com",
        pathname: "/system/resources/**",
      },
      {
        protocol: "https",
        hostname: "static.vecteezy.com",
        pathname: "/system/resources/**",
      },
    ],
  },
};

export default nextConfig;
