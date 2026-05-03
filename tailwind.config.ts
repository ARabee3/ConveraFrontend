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
        airbnb: {
          red: "#FF385C",
          "red-dark": "#E31C5F",
          "red-light": "#FF5A5F",
          dark: "#222222",
          gray: "#717171",
          "light-gray": "#DDDDDD",
          "bg-gray": "#F7F7F7",
        },
      },
      boxShadow: {
        card: "0 6px 16px rgba(0,0,0,0.12)",
        "card-hover": "0 6px 20px rgba(0,0,0,0.2)",
        navbar: "0 1px 2px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
