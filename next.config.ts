import type { NextConfig } from "next";
import { normalizeApiBaseUrl } from "./services/api-url";

const nextConfig: NextConfig = {
  distDir: process.env.PLAYWRIGHT_TEST_DIST_DIR || ".next",
  async rewrites() {
    const backend = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_URL);
    return backend
      ? [{ source: "/backend/api/:path*", destination: `${backend}/api/:path*` }]
      : [];
  },
  experimental: {
    serverActions: { bodySizeLimit: "5mb" },
  },
};

export default nextConfig;
