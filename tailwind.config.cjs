/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: "#0f172a",
        card: "rgba(30, 41, 59, 0.7)",
        primary: "#6366f1",
      }
    },
  },
  plugins: [],
}
