/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 主色：墨绿
        ink: {
          50: '#EDF3E8',
          100: '#D8E5CF',
          200: '#B2CBA0',
          300: '#7FA856',
          400: '#4A7C23',
          500: '#2D5016',
          600: '#1A3308',
          700: '#122405',
          800: '#0C1703',
          900: '#060C02',
        },
        // 背景色：米白
        paper: {
          50: '#FDFCFA',
          100: '#F5F0EB',
          200: '#ECE5DD',
          300: '#E0D7CC',
          400: '#D0C5B7',
          500: '#B8AB9A',
        },
        // 辅助灰
        stone: {
          50: '#F7F6F4',
          100: '#F0EDE8',
          150: '#E8E5E0',
          200: '#D1CDC7',
          300: '#B8B5B0',
          400: '#9C9A96',
          500: '#6B6A66',
          600: '#4A4946',
          700: '#3A3936',
          800: '#1A1A18',
          900: '#0E0E0D',
        },
        // 语义色
        success:  { 50: '#EDF3E8', 500: '#3B7A1E', 600: '#2D5E16' },
        danger:   { 50: '#FDF0F0', 500: '#B33A3A', 600: '#8F2E2E' },
        warning:  { 50: '#FFF5EB', 500: '#C4701A', 600: '#9E5A14' },
        info:     { 50: '#EBF3FA', 500: '#2B6A9E', 600: '#1F5280' },
      },
      fontFamily: {
        sans: ['"Inter"', '"Noto Sans SC"', '-apple-system', '"PingFang SC"', '"Microsoft YaHei"', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
