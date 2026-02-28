/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                gold: '#d4af37',
                bronze: '#bf953f'
            },
            fontFamily: {
                inter: ['Inter', 'sans-serif'],
                vietnam: ['Be Vietnam Pro', 'sans-serif'],
            },
            keyframes: {
                ticker: {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-50%)' },
                },
                shimmer: {
                    '0%': { transform: 'translateX(-150%) skewX(-20deg)' },
                    '100%': { transform: 'translateX(200%) skewX(-20deg)' },
                }
            },
            animation: {
                ticker: 'ticker 20s linear infinite',
                shimmer: 'shimmer 4s ease-in-out infinite'
            }
        },
    },
    plugins: [],
}
