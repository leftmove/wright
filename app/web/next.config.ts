import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: { externalDir: true },
  webpack: (config) => {
    config.experiments = {
      ...(config.experiments || {}),
      asyncWebAssembly: true,
    };
    return config;
  },
};

export default nextConfig;
