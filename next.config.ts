import type { NextConfig } from "next";

// Configure Next.js for static export and optional GitHub Pages base path
const nextConfig: NextConfig = {
  // Enable static HTML export to the `out` directory
  output: "export",

  // If you ever use next/image, disable optimization for static hosting
  images: { unoptimized: true },

  // Helpful for GitHub Pages and many static hosts
  trailingSlash: true,

  // Allow setting basePath/assetPrefix via env for GitHub Pages project sites
  // e.g. NEXT_PUBLIC_BASE_PATH=/your-repo-name
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH
    ? `${process.env.NEXT_PUBLIC_BASE_PATH}/`
    : undefined,
};

export default nextConfig;
