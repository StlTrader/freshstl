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
                    'dark-hover': '#333333',
                    'black': '#111111', // Pinterest Black
                    'surface': '#ffffff',
                    'dark-surface': '#212121', // Pinterest Surface
                },
                // Luxury Black Dark Mode Palette (Refined for Social Look)
                dark: {
                    bg: '#111111',      // Pinterest Dark BG
                    surface: '#212121', // Pinterest Card Surface
                    border: '#3f3f3f',  // Subtle border
                    text: {
                        primary: '#ffffff',   // Pure white
                        secondary: '#e9e9e9', // Soft gray
                    }
                }
            }
        },
    },
    plugins: [],
    darkMode: 'class',
}
