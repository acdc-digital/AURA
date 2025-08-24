import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  webpack: (config, { dev, isServer }) => {
    // For Tailwind CSS v4 compatibility - disable problematic CSS extraction
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
      
      // Handle CSS modules more explicitly
      if (!dev) {
        config.optimization = {
          ...config.optimization,
          splitChunks: {
            ...config.optimization.splitChunks,
            cacheGroups: {
              ...config.optimization.splitChunks?.cacheGroups,
              styles: false, // Disable CSS extraction that conflicts with Tailwind v4
            },
          },
        };
      }
    }
    
    return config;
  },
};

export default nextConfig;
