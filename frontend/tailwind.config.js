/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'navy-900': '#0B192C',
        'glacier-700': '#1E3E62',
        'glacier-500': '#3B82F6',
        'frost-50': '#F4F8FB',
        'aurora-500': '#00B4D8',
        'ember-500': '#E76F51',
        'slate-800': '#1E293B',
        'slate-500': '#64748B',
        'line': '#D5E0EA',
      },
      fontFamily: {
        serif: ['Georgia', '"Times New Roman"', 'serif'],
        sans: ['Arial', 'Helvetica', 'sans-serif'],
        mono: ['"Courier New"', 'monospace'],
      },
      fontSize: {
        'body': ['16px', { lineHeight: '1.6' }],
        'h1': ['36px', { lineHeight: '1.2', fontWeight: '700' }],
        'h2': ['28px', { lineHeight: '1.3', fontWeight: '700' }],
        'h3': ['20px', { lineHeight: '1.4', fontWeight: '700' }],
      },
      borderRadius: {
        'card': '4px',
        'input': '2px',
        'glass': '8px',
      },
      boxShadow: {
        'hover': '0 1px 2px rgba(11, 25, 44, 0.08)',
        'glass': '0 1px 2px rgba(11, 25, 44, 0.08)',
      },
      maxWidth: {
        'container': '1200px',
      },
      spacing: {
        '1': '8px',
        '2': '16px',
        '3': '24px',
        '4': '32px',
        '5': '40px',
        '6': '48px',
      },
    },
  },
  plugins: [],
}
