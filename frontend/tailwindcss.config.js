/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
      "./public/index.html"
    ],
    theme: {
      extend: {
        colors: {
          'primary': {
            50: '#eef7ff',
            100: '#d9edff',
            200: '#bce0ff',
            300: '#8ecdff',
            400: '#59b0ff',
            500: '#3b8fff',
            600: '#2161ff',
            700: '#1a4ff0',
            800: '#1d3dd1',
            900: '#1e39a5',
          },
          'waste2earn': {
            100: '#e6f7ea',
            500: '#34c759',
            900: '#1d623a',
          },
        },
        fontFamily: {
          sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        },
      },
    },
    plugins: [],
  }