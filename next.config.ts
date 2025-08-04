// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   images: {
//     unoptimized: true,
//   },
//   // output: "export",
//   eslint: {
//     ignoreDuringBuilds: true,
//   },
//   trailingSlash: true,
// };

// export default nextConfig;
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
  
  // Additional helpful configurations for hydration issues
  experimental: {
    // This can help with hydration issues in some cases
    optimizePackageImports: ['axios'],
  },
  
  // Ensure environment variables are available
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  
  // Optional: Add webpack configuration if needed
  webpack: (config, { isServer }) => {
    // Handle client-side only modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

export default nextConfig;
