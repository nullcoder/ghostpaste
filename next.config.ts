import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable image optimization (not supported on Edge Runtime)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
