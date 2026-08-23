import type { NextConfig } from "next";
const nextConfig: NextConfig = { transpilePackages: ["@mytownapp/core", "@mytownapp/design", "@mytownapp/types"] };
export default nextConfig;
