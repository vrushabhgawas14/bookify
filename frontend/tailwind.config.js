/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#f5ebe0", // Body Background Color // Good
        backgroundDull: "#e7bc91", // Dull Background Color
        secondary_900: "#461220", // Aesthetic Brown // Good
        secondary_950: "#71011d", // Slightly LightBrown
        backgroundBright: "#f9f7f3", // Extra bg White // Good
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
