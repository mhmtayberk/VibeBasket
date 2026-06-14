import type { NextConfig } from "next";
import { getAllowedDevOrigins } from "./src/lib/dev-origins";
import { DEFAULT_SECURITY_HEADERS } from "./src/lib/security-headers";

const nextConfig: NextConfig = {
  // Required for the Docker standalone image (generates apps/web/.next/standalone/server.js)
  output: process.env.NODE_ENV === "production" ? "standalone" : undefined,
  allowedDevOrigins: getAllowedDevOrigins(),
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: Object.entries(DEFAULT_SECURITY_HEADERS).map(([key, value]) => ({
          key,
          value,
        })),
      },
    ];
  },
};

export default nextConfig;
