import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "var(--brand)",
        "brand-hover": "var(--brand-hover)",
        "brand-soft": "var(--brand-soft)",
        "brand-softer": "var(--brand-softer)",
        success: "var(--success)",
        warn: "var(--warn)",
        caution: "var(--caution)",
        danger: "var(--danger)",
        info: "var(--info)",
        ink: {
          900: "var(--grey-900)",
          800: "var(--grey-800)",
          700: "var(--grey-700)",
          600: "var(--grey-600)",
          500: "var(--grey-500)",
          400: "var(--grey-400)",
          300: "var(--grey-300)",
          200: "var(--grey-200)",
          100: "var(--grey-100)",
          50: "var(--grey-50)",
        },
      },
      borderRadius: {
        sm: "var(--r-sm)",
        md: "var(--r-md)",
        lg: "var(--r-lg)",
        xl: "var(--r-xl)",
        pill: "var(--r-pill)",
      },
      boxShadow: {
        1: "var(--shadow-1)",
        2: "var(--shadow-2)",
        3: "var(--shadow-3)",
        4: "var(--shadow-4)",
      },
      fontFamily: {
        sans: ["Pretendard", "system-ui", "sans-serif"],
        num: ["Pretendard", "SF Pro Display", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
