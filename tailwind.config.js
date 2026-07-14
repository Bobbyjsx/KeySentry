module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // KeySentry Design Language tokens
        canvas: "#0a0a0a",
        "canvas-soft": "#1a1c20",
        "canvas-card": "#191919",
        "canvas-mid": "#363a3f",
        hairline: "#212327",
        "accent-sunset": "#ff7a17",
        "accent-sunset-soft": "#ffc285",
        "accent-dusk": "#7c3aed",
        "accent-twilight": "#c4b5fd",
        "accent-breeze": "#a0c3ec",
        "accent-midnight": "#0d1726",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "8px",
        pill: "9999px",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      letterSpacing: {
        "display-xl": "-2.4px",
        "display-lg": "-1.8px",
        "display-md": "-1.2px",
        "display-sm": "-0.6px",
        "caption-mono": "1.4px",
        "caption-mono-sm": "1.2px",
      },
      fontSize: {
        "display-xl": ["96px", { lineHeight: "96px", letterSpacing: "-2.4px", fontWeight: "400" }],
        "display-lg": ["72px", { lineHeight: "72px", letterSpacing: "-1.8px", fontWeight: "400" }],
        "display-md": ["48px", { lineHeight: "48px", letterSpacing: "-1.2px", fontWeight: "400" }],
        "display-sm": ["32px", { lineHeight: "36px", letterSpacing: "-0.6px", fontWeight: "400" }],
        "display-xs": ["20px", { lineHeight: "28px", fontWeight: "400" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "caption-mono": ["14px", { lineHeight: "20px", letterSpacing: "1.4px", fontWeight: "400" }],
        "caption-mono-sm": ["12px", { lineHeight: "16px", letterSpacing: "1.2px", fontWeight: "400" }],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
