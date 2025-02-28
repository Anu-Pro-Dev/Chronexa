import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./forms/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}", 
  ],
  theme: {
    extend: {
      fontFamily: {
        nunito: ["Nunito_Sans", "sans-serif"],
      },
      colors: {
        content: "var(--content)",
        backdrop: "var(--backdrop)",
        tablebackdrop: "var(--table-backdrop)",
        destructive: "var(--destructive)",
        success: "var(--success)",
        btnoutline: "var(--btn-outline)",
        background: {
          DEFAULT: "var(--background)",
          transparent: "var(--background-transparent)",
        },
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
        },
        "primary-50": {
          DEFAULT: "var(--primary-50)",
        },
        "primary-100": {
          DEFAULT: "var(--primary-100)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          content: "var(--text-content)",
        },
        border: {
          DEFAULT: "var(--border)",
          accent: "var(--border-accent)",
          grey: "var(--border-grey)",
        },
      },
      boxShadow: {
        popup: "2px 2px 10px 5px rgba(0,0,0,0.05)",
        button: "2px 2px 10px 0px rgba(0,0,0,0.05)",
        card: "2px 2px 10px 0px rgba(0,0,0,0.03)",
        searchbar: "2px 2px 5px rgba(0, 0, 0, 0.03)",
        dropdown: "2px 2px 5px rgba(0, 0, 0, 0.05)",
        sidebar: "0px 16px 44px 0px rgba(0, 0, 0, 0.07)",
        inner: '-2px -2px 10px 0 rgba(0, 0, 0, 0.03)',
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
