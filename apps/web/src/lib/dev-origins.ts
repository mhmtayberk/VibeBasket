import os from "node:os";

export function getAllowedDevOrigins() {
  const origins = new Set<string>([
    "localhost",
    "*.localhost",
    "127.0.0.1",
    "127.*.*.*",
    "::1",
  ]);

  for (const addresses of Object.values(os.networkInterfaces())) {
    for (const address of addresses ?? []) {
      if (address.family === "IPv4" && !address.internal) {
        origins.add(address.address);
      }
    }
  }

  return Array.from(origins);
}
