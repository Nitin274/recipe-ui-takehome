/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./client/index.html", "./client/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "rgb(var(--tw-canvas) / <alpha-value>)",
        surface: "rgb(var(--tw-surface) / <alpha-value>)",
        ink: "rgb(var(--tw-ink) / <alpha-value>)",
        muted: "rgb(var(--tw-muted) / <alpha-value>)",
        brand: "rgb(var(--tw-brand) / <alpha-value>)",
      },
      borderRadius: {
        product: "8px",
      },
      boxShadow: {
        product: "var(--shadow)",
      },
    },
  },
  plugins: [],
};
