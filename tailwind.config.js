/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        page: '#F8FAFC',
        ink: {
          DEFAULT: '#0F172A',
          body: '#475569',
          muted: '#64748B',
        },
        primary: {
          DEFAULT: '#4F46E5',
          hover: '#4338CA',
          light: '#6366F1',
          tint: '#EEF2FF',
          border: '#C7D2FE',
        },
        border: {
          card: '#E2E8F0',
          input: '#CBD5E1',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        button: '12px',
        tile: '16px',
        card: '24px',
        featured: '28px',
        banner: '36px',
        pill: '100px',
      },
      boxShadow: {
        primary: '0 8px 20px -4px rgba(79, 70, 229, 0.3)',
      },
    },
  },
  plugins: [],
}
