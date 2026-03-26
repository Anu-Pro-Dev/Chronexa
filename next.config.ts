import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  trailingSlash: false,

  experimental: {
    optimizePackageImports: ["axios"],
  },

  async headers() {
    return [
      {
        // Never cache HTML — contains chunk references that change on every build
        source: "/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
      {
        // Cache hashed static chunks forever — safe because hash changes on rebuild
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;