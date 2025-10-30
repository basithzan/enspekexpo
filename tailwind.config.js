/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Enspek brand colors
        'enspek-bg': '#0B0B0C',
        'enspek-surface': '#121214',
        'enspek-elevated': '#16181A',
        'enspek-border': '#2A2D30',
        'enspek-text': '#F5F7FA',
        'enspek-muted': '#A8B0B9',
        'enspek-primary': '#3B82F6',
        'enspek-success': '#10B981',
        'enspek-warning': '#F59E0B',
        'enspek-danger': '#EF4444',
      },
      borderRadius: {
        'lg': '16px',
        'xl': '24px',
      },
    },
  },
  plugins: [],
}
