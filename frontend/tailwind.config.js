/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#171717", // Body Background Color- Darker
        backgroundDull: "#212121", // Lighter Dark Background Color

        textColor_primary: "#d4d4d8", // stone-300
        textColor_secondary: "#a8a29e", // stone-400

        borderColor_primary: "#d4d4d833", // textColor_primary/15
        borderColor_secondary: "#a8a29e26", // textColor_secondary/20

        message: "#323232d9", // Prompt

        backgroundBright: "#f9f7f3", // Extra bg White
      },
      screens: {
        sm: { max: "900px" },
        md: { min: "901px", max: "1024px" },
        lg: "1025px",
      },
    },
  },
  plugins: [],
};
