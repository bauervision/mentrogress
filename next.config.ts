import type { NextConfig } from "next";
const config: NextConfig = {
  output: "export", // enables `next export` -> static hosting
  // images: { unoptimized: true }, // uncomment if you add <Image>
};
export default config;
