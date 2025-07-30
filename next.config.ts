import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  // output: "export",
  eslint: {
    ignoreDuringBuilds: true,
  },
  trailingSlash: true,
};

export default nextConfig;
