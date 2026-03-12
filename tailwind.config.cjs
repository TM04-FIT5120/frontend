/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        page:    '#f5f7fa',
        card:    '#ffffff',
        border:  '#e4e9f0',
        brand: {
          DEFAULT: '#1d4ed8',
          light:   '#eff6ff',
          mid:     '#bfdbfe',
          dark:    '#1e40af',
        },
        /* AQI */
        'aqi-good':      '#059669',
        'aqi-moderate':  '#d97706',
        'aqi-unhealthy': '#ea580c',
        'aqi-very':      '#dc2626',
        'aqi-hazardous': '#7c3aed',
      },
      boxShadow: {
        card:  '0 1px 3px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.05)',
        hover: '0 4px 12px rgba(0,0,0,0.10), 0 8px 28px rgba(0,0,0,0.07)',
        deep:  '0 8px 32px rgba(0,0,0,0.12)',
      },
      animation: {
        'fade-up':  'fadeUp  0.55s ease-out forwards',
        'fade-in':  'fadeIn  0.4s  ease-out forwards',
        'scale-in': 'scaleIn 0.4s  ease-out forwards',
        'breathe':  'breathe 4s ease-in-out infinite',
        'float':    'floatUp 5s ease-in-out infinite',
        'progress': 'progressFill 2.5s ease-out forwards',
      },
      keyframes: {
        fadeUp:       { from:{ opacity:'0', transform:'translateY(16px)' }, to:{ opacity:'1', transform:'translateY(0)' } },
        fadeIn:       { from:{ opacity:'0' }, to:{ opacity:'1' } },
        scaleIn:      { from:{ opacity:'0', transform:'scale(0.94)' }, to:{ opacity:'1', transform:'scale(1)' } },
        breathe:      { '0%,100%':{ transform:'scale(1)' }, '50%':{ transform:'scale(1.035)' } },
        floatUp:      { '0%,100%':{ transform:'translateY(0)' }, '50%':{ transform:'translateY(-10px)' } },
        progressFill: { from:{ width:'0%' }, to:{ width:'100%' } },
      },
    },
  },
  plugins: [],
}
