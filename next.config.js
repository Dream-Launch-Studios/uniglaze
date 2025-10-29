/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  experimental: {
    serverActions: {
      // Gmail max = 25 MB, we set slightly higher to be safe
      bodySizeLimit: "26mb",
    },
  },
  images: {
    domains: [
      "images.unsplash.com",
      "s3.ap-south-1.amazonaws.com",
      "uniglaze-dev-testing.s3.ap-south-1.amazonaws.com",
      "firebasestorage.googleapis.com",
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: "standalone",
};

export default config;
