/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Manter em sincronia com constants/Colors.ts
        primary: {
          DEFAULT: '#E37C96',
          light: '#F9DCE4',
          dark: '#C85A77',
        },
        accent: {
          DEFAULT: '#14B8A6',
          light: '#CCF2EC',
          dark: '#0F766E',
        },
        secondary: {
          DEFAULT: '#DB2777', // pink-600
          light: '#F472B6',   // pink-400
        },
        background: '#f6f3f4',
        ink: '#111813',
        muted: '#7f7f7f',
        line: '#e0e0e0',
      }
    },
  },
  plugins: [],
}
