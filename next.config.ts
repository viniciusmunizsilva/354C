import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standard dynamic rendering: this app renders per-request data (gallery,
  // signed URLs) and reads runtime env, so we opt out of the experimental
  // component caching that the scaffold enables by default.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
