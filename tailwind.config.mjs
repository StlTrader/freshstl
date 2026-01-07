/** @type {import('tailwindcss').Config} */
export default {
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
                // Luxury Black Dark Mode Palette (Zinc-based)
                dark: {
                    bg: '#09090b',      // Zinc 950 - Rich, deep black
                    surface: '#18181b', // Zinc 900 - Subtle contrast for cards
                    border: '#27272a',  // Zinc 800 - Refined borders
                    text: {
                        primary: '#fafafa',   // Zinc 50 - Crisp white
                        secondary: '#a1a1aa', // Zinc 400 - Muted gray
                    }
                }
            }
        },
    },
    plugins: [],
    darkMode: 'class',
}
