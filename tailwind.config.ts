import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // The Dark Brown background from your image
        background: '#2B1C13', 
        // The Light Beige from your Figma (#FFE9D9)
        beige: '#FFE9D9',
      },
      fontFamily: {
        // Matches "Times New Normal" (Times New Roman)
        serif: ['"Times New Roman"', 'Times', 'serif'],
      },
    },
  },
  plugins: [],
};
export default config;