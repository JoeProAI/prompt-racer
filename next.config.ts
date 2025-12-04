import type { NextConfig } from "next";

// For standalone deployment at prompt-racer.vercel.app
// Remove basePath to work at root
// Add it back when integrating with joepro.ai
const nextConfig: NextConfig = {
  // basePath: '/prompt-racer',
  // assetPrefix: '/prompt-racer',
};

export default nextConfig;
