import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir:
    process.env.ACHADMIN_OVERVIEW_PREVIEW === "1" ? ".next-overview" : ".next",
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
