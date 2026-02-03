/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0D9488', // teal-600
          light: '#2DD4BF',   // teal-400
          dark: '#0F766E',    // teal-700
        },
        secondary: {
          DEFAULT: '#DB2777', // pink-600
          light: '#F472B6',   // pink-400
        }
      }
    },
  },
  plugins: [],
}
