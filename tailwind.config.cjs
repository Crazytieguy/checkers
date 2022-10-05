/* eslint-env node */
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    colors: {
      white: "white",
      red: "#CC2936",
      black: "#02040F",
      blue: {
        medium: "#336580",
        light: "#7fb1cc",
        dark: "#162b37",
      },
      grey: {
        medium: "#48A9A6",
        light: "#E4DFDA",
        dark: "#3b332b",
      },
    },
    extend: {
      dropShadow: {
        highlight: "0 0 3px hsl(60, 80%, 50%)",
      },
    },
  },
  plugins: [],
};
