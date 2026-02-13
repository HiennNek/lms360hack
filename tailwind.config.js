/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./src/**/*.{html,js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#197fe6",
                "background-light": "#f6f7f8",
                "background-dark": "#0f172a",
                "accent-purple": "#8b5cf6",
                "accent-gold": "#f59e0b",
            },
            fontFamily: {
                "display": ["Lexend", "sans-serif"],
            },
            borderRadius: {
                "DEFAULT": "var(--r-mid)",
                "lg": "var(--r-mid)",
                "xl": "var(--r-mid)",
                "full": "9999px",
            },

        },
    },
    plugins: [],
};
