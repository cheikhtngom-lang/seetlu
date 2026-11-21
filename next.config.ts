import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // La racine mène à l'application ; la future landing page (phase 4) prendra sa place.
  async redirects() {
    return [{ source: "/", destination: "/app", permanent: false }];
  },
  cacheComponents: true,
  partialPrefetching: true,
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
