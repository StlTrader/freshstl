/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#bae6fd',
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e',
                },
                social: {
                    'light-hover': '#f2f2f2',
                    'dark-hover': '#272727',
                    'black': '#0f0f0f', // Soft black for text
                    'surface': '#ffffff',
                    'dark-surface': '#1f1f1f', // YouTube style dark surface
                },
                // Luxury Black Dark Mode Palette (Refined for Social Look)
                dark: {
                    bg: '#0f0f0f',      // Deep black/gray
                    surface: '#1f1f1f', // Slightly lighter for cards
                    border: '#3f3f3f',  // Subtle border
                    text: {
                        primary: '#f1f1f1',   // Soft white
                        secondary: '#aaaaaa', // Muted gray
                    }
                }
            }
        },
    },
    plugins: [],
    darkMode: 'class',
}
