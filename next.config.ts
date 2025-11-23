import type { NextConfig } from "next";
const config: NextConfig = {
  output: "export", // enables `next export` -> static hosting
  trailingSlash: true,
};
export default config;
