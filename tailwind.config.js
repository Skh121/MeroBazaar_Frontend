/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        outfit: ["Outfit"],
      },

      colors: {
        primary: {
          DEFAULT: "#00A63E",
        },
        secondary: {},
        success: "#16A34A",
        danger: "#DC2626",
        warning: "#F59E0B",
        info: "#3B82F6",

        // Neutral colors
        dark: "#0F172A",
        light: "#F8FAFC",
        muted: "#94A3B8",
      },

      // Optional radius, spacing etc
      //   borderRadius: {
      //     xl: "1rem",
      //     "2xl": "1.5rem",
      //   },
    },
  },
  plugins: [],
};
