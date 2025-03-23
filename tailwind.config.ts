
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
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
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				'fade-out': {
					'0%': { opacity: '1' },
					'100%': { opacity: '0' }
				},
				pulse: {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.5' }
				},
				bounce: {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-20px)' }
				},
				'card-float': {
					'0%': { transform: 'translateY(0) rotate(0deg)' },
					'50%': { transform: 'translateY(-10px) rotate(2deg)' },
					'100%': { transform: 'translateY(0) rotate(0deg)' }
				},
				scanner: {
					'0%': { transform: 'translateY(-100vh)', opacity: '0.7' },
					'50%': { opacity: '0.3' },
					'100%': { transform: 'translateY(100vh)', opacity: '0.7' }
				},
				'slide-in-right': {
					'0%': { transform: 'translateX(0)' },
					'100%': { transform: 'translateX(150vw)' }
				},
				float: {
					'0%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-15px)' },
					'100%': { transform: 'translateY(0)' }
				},
				glow: {
					'0%, 100%': { 
						textShadow: '0 0 5px rgba(45, 212, 191, 0.5), 0 0 15px rgba(45, 212, 191, 0.3)' 
					},
					'50%': { 
						textShadow: '0 0 10px rgba(45, 212, 191, 0.8), 0 0 30px rgba(45, 212, 191, 0.5)' 
					}
				},
				'confetti-slow': {
					'0%': { transform: 'translate3d(0,0,0) rotateX(0) rotateY(0)' },
					'100%': { transform: 'translate3d(25px,105vh,0) rotateX(360deg) rotateY(180deg)' }
				},
				'confetti-medium': {
					'0%': { transform: 'translate3d(0,0,0) rotateX(0) rotateY(0)' },
					'100%': { transform: 'translate3d(100px,105vh,0) rotateX(100deg) rotateY(360deg)' }
				},
				'confetti-fast': {
					'0%': { transform: 'translate3d(0,0,0) rotateX(0) rotateY(0)' },
					'100%': { transform: 'translate3d(-50px,105vh,0) rotateX(10deg) rotateY(250deg)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-out': 'fade-out 0.3s ease-out',
				pulse: 'pulse 1.5s ease-in-out infinite',
				bounce: 'bounce 1s ease-in-out infinite',
				'card-float': 'card-float 3s ease-in-out infinite',
				scanner: 'scanner 8s linear infinite',
				'slide-in-right': 'slide-in-right 15s linear infinite',
				float: 'float 3s ease-in-out infinite',
				glow: 'glow 4s ease-in-out infinite',
				'confetti-slow': 'confetti-slow 2.5s linear infinite',
				'confetti-medium': 'confetti-medium 2s linear infinite',
				'confetti-fast': 'confetti-fast 1.5s linear infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
