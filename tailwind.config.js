/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./advanced.html",
        "./js/**/*.js"
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
                "display": ["Lexend", "sans-serif"]
            },
            borderRadius: {
                "DEFAULT": "1rem",
                "lg": "1rem",
                "xl": "1rem",
                "full": "1rem"
            },
        },
    },
    plugins: [],
}
