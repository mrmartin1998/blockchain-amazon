/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {

    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        mytheme: {
          "primary": "#0070ff",
          "secondary": "#0078ef",
          "accent": "#60d100",
          "neutral": "#04191f",
          "base-100": "#ffffff",
          "info": "#0060ff",
          "success": "#0ea500",
          "warning": "#a56700",
          "error": "#f9002b",
        },
      },
    ],
  },
}
