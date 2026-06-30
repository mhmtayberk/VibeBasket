import type { NextConfig } from "next";
import { getAllowedDevOrigins } from "./src/lib/dev-origins";
import { DEFAULT_SECURITY_HEADERS } from "./src/lib/security-headers";

const nextConfig: NextConfig = {
  // Required for the Docker standalone image (generates apps/web/.next/standalone/server.js)
  output: process.env.NODE_ENV === "production" ? "standalone" : undefined,
  productionBrowserSourceMaps: false,
  experimental: {
    authInterrupts: true,
  },
  allowedDevOrigins: getAllowedDevOrigins(),
  serverExternalPackages: ["@libsql/client", "libsql"],
  outputFileTracingIncludes: {
    "/*": [
      "../../node_modules/.pnpm/@libsql+client@*/node_modules/**/*",
      "../../node_modules/.pnpm/@libsql+core@*/node_modules/**/*",
      "../../node_modules/.pnpm/libsql@*/node_modules/**/*",
    ],
  },
  webpack(config, { isServer }) {
    if (isServer) {
      config.externals = config.externals ?? [];
      config.externals.push("libsql", "@libsql/client", /^@libsql\/.+$/);
    }

    return config;
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: Object.entries(DEFAULT_SECURITY_HEADERS)
          .filter(([, value]) => Boolean(value))
          .map(([key, value]) => ({
            key,
            value,
          })),
      },
    ];
  },
};

export default nextConfig;
