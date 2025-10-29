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
  			nunito: [
  				'Nunito_Sans',
  				'sans-serif'
  			]
  		},
  		colors: {
  			content: 'var(--content)',
  			backdrop: 'var(--backdrop)',
  			tablebackdrop: 'var(--table-backdrop)',
  			btnoutline: 'var(--btn-outline)',
  			background: {
  				DEFAULT: 'var(--background)',
  				transparent: 'var(--background-transparent)'
  			},
  			foreground: 'var(--foreground)',
			fullpage: 'var(--fullpage)',
  			accent: 'var(--accent)',
  			primary: {
  				'100': 'var(--primary-100)',
  				DEFAULT: 'var(--primary)'
  			},
  			secondary: {
  				DEFAULT: 'var(--secondary)'
  			},
  			success: {
  				'100': 'var(--success-100)',
  				DEFAULT: 'var(--success)'
  			},
  			destructive: {
  				'100': 'var(--destructive-100)',
  				DEFAULT: 'var(--destructive)'
  			},
  			text: {
  				primary: 'var(--text-primary)',
  				secondary: 'var(--text-secondary)',
  				content: 'var(--text-content)'
  			},
  			border: {
  				DEFAULT: 'var(--border)',
  				accent: 'var(--border-accent)',
  				grey: 'var(--border-grey)'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		boxShadow: {
  			popup: '2px 2px 10px 5px rgba(0,0,0,0.05)',
  			button: '2px 2px 10px 0px rgba(0,0,0,0.05)',
  			card: '2px 2px 10px 0px rgba(0,0,0,0.03)',
  			searchbar: '2px 2px 5px rgba(0, 0, 0, 0.03)',
  			dropdown: '2px 2px 5px rgba(0, 0, 0, 0.05)',
  			sidebar: '0px 16px 44px 0px rgba(0, 0, 0, 0.07)',
  			inner: '-2px -2px 10px 0 rgba(0, 0, 0, 0.03)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			'dots-bounce': {
  				'0%, 80%, 100%': {
  					transform: 'scale(0)'
  				},
  				'40%': {
  					transform: 'scale(1)'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'dots-bounce': 'dots-bounce 1.4s infinite ease-in-out both'
  		}
  	}
  },
  plugins: [
    require("tailwindcss-animate"),
    require("tailwind-scrollbar-hide")
  ],
} satisfies Config;
