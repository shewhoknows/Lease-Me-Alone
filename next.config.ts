import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const basePath = isGitHubPages ? "/Lease-Me-Alone" : "";
const assetPrefix = isGitHubPages ? "https://shewhoknows.github.io/Lease-Me-Alone" : "";

const nextConfig: NextConfig = {
  output: isGitHubPages ? "export" : undefined,
  assetPrefix,
  trailingSlash: isGitHubPages,
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
