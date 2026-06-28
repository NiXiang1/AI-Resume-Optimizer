import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#162033",
        muted: "#64748b",
        line: "#dbe3ef",
        brand: {
          50: "#eef7ff",
          100: "#d9edff",
          500: "#2675ff",
          600: "#175fe6",
          700: "#124bb8"
        }
      },
      boxShadow: {
        soft: "0 18px 60px rgba(22, 32, 51, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
