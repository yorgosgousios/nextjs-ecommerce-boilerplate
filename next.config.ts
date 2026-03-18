import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "envieshoes-backend.rkpt.dev",
      },
      {
        protocol: "https",
        hostname: "backend.envieshoes.gr",
      },
    ],
  },
};

export default nextConfig;
