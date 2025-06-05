import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Initialize Cloudflare bindings for local development
if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev();
}

const nextConfig: NextConfig = {
  // Disable image optimization (not supported on Edge Runtime)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
