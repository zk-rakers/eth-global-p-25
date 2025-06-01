/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "rgb(var(--color-primary))",
        "primary-content": "rgb(var(--color-primary-content))",
        secondary: "rgb(var(--color-secondary))",
        "secondary-content": "rgb(var(--color-secondary-content))",
        accent: "rgb(var(--color-accent))",
        "accent-content": "rgb(var(--color-accent-content))",
        neutral: "rgb(var(--color-neutral))",
        "neutral-content": "rgb(var(--color-neutral-content))",
        "base-100": "rgb(var(--color-base-100))",
        "base-200": "rgb(var(--color-base-200))",
        "base-300": "rgb(var(--color-base-300))",
        "base-content": "rgb(var(--color-base-content))",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["dark"],
    darkTheme: "dark",
    base: true,
    styled: true,
    utils: true,
    prefix: "",
    logs: true,
    themeRoot: ":root",
  },
}; 