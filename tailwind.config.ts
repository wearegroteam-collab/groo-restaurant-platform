import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f7fee7",
          100: "#ecfccb",
          500: "#84cc16",
          600: "#65a30d",
          900: "#365314",
        },
        ink: "#172018",
      },
      boxShadow: {
        soft: "0 18px 60px rgba(23, 32, 24, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
