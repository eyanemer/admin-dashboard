/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1E40AF", // Deep Navy Blue
          light: "#DBEAFE",
          hover: "#1E3A8A",
        },
        blue: {
          50: '#E8EFF9',
          100: '#C4D6EE',
          200: '#96B3DD',
          300: '#6D8FBF',
          400: '#4E6E9F',
          500: '#33557D',
          600: '#293F62',
          700: '#20334E',
          800: '#172839',
          900: '#101C28',
        },
        success: "#10B981",
        danger: "#EF4444",
        warning: "#F59E0B",
        main: "#F9FAFB",
        text: {
          DEFAULT: "#111827",
          muted: "#6B7280",
          dim: "#9CA3AF",
        },
        border: "#E5E7EB",
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
