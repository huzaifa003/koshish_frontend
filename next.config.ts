import type { NextConfig } from "next";
const config: NextConfig = {
  poweredByHeader: false,
  // Keeps isolated sample previews from interrupting the main development server.
  distDir: process.env.KOSHISH_BUILD_DIR || ".next",
};
export default config;
