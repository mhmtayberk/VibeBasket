import type { NextConfig } from "next";
import { getAllowedDevOrigins } from "./src/lib/dev-origins";

const nextConfig: NextConfig = {
	allowedDevOrigins: getAllowedDevOrigins(),
};

export default nextConfig;
