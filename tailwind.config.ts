import type { Config } from "tailwindcss";

const config: any = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  corePlugins: {
    preflight: false, // Disable Tailwind's CSS reset to avoid breaking existing styles
  },
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;
