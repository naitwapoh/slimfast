/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          forest: '#2E6F24', // Deep Herbal Forest Green (Primary)
          leaf: '#8CB83E',   // Fresh Leaf Lime Green (Secondary Accent)
          surface: '#F4F8F2',// Soft Botanical Cream/Mint
          charcoal: '#1A2E19',// Dark Botanical Charcoal
          cream: '#FAFCF8',
          accent: '#E5A93C', // Golden accent
          muted: '#5F755E',
          card: '#FFFFFF'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      boxShadow: {
        'herbal': '0 10px 30px -10px rgba(46, 111, 36, 0.15)',
        'herbal-lg': '0 20px 40px -15px rgba(46, 111, 36, 0.22)',
      }
    },
  },
  plugins: [],
}

