/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        discord: {
          sidebar: 'rgba(6, 11, 20, 0.4)', // Ultra deep space blue (Glass)
          chat: 'rgba(13, 20, 36, 0.3)',    // Rich dark slate (Glass)
          header: 'rgba(10, 16, 29, 0.5)',  // Subtle transition header (Glass)
          hover: 'rgba(23, 34, 59, 0.6)',   // Smooth hover state
          active: 'rgba(33, 48, 84, 0.8)',  // Distinct active state
          text: '#F1F5F9',    // Soft slate white
          muted: '#64748B',   // Slate muted
          accent: '#00F0FF',  // Neon Cyan accent for absolute WOW factor
        }
      }
    },
  },
  plugins: [],
}

