import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            keyframes: {
                moveMask: {
                    "0%": { left: "-2em" },
                    "100%": { left: "0em" },
                },
            },
            animation: {
                moveMask: "moveMask 2s linear infinite",
            },
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                primary: "#3c0037",
                secondary: "#ffffff",
            },
        },
    },
    plugins: [require("tailwind-gradient-mask-image")],
    future: {
        hoverOnlyWhenSupported: true,
    },
};
export default config;
