import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#db4c3f",
          dark: "#b4372b",
        },
      },
    },
  },
  plugins: [],
};

export default config;
