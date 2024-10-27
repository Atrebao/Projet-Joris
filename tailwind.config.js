/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,jsx,js}"],
  theme: {
    extend: {
      fontFamily :{
      
      }
    },
  },
  plugins: [
    require('daisyui'),
  ],
}

