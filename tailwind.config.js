const defaultTheme = require("tailwindcss/defaultTheme")

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        cal: ["var(--font-cal)", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
}
