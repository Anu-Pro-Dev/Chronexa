import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
  i18n: {
    locales: ["en-US", "ar-AE	"],
    defaultLocale: "en-US",
  },
};

export default nextConfig;
