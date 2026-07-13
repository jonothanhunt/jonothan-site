export interface Theme {
    name: string;
    bg: string;
    border: string;
    text: string;
    cardText: string;
    gradientOverlay: string;
    pillBg: string;
    accent: string;
    lightAccent: string;
    linkHover: string;
    shadow: string;
    accentShadow: string;
    accentText: string;
    bgRgb: string; // raw RGB for gradient overlays
    accentColorHex: string;
}

export const PLAYFUL_THEMES: Theme[] = [
    {
        name: "Green",
        bg: "bg-emerald-100",
        border: "border-emerald-200",
        text: "text-emerald-950",
        cardText: "text-emerald-800",
        gradientOverlay: "from-transparent via-emerald-100/60 via-50% to-emerald-100/90",
        pillBg: "bg-emerald-200",
        accent: "bg-emerald-600",
        lightAccent: "bg-emerald-50",
        linkHover: "hover:bg-emerald-200",
        shadow: "shadow-emerald-600/8",
        accentShadow: "shadow-emerald-600/25",
        accentText: "text-emerald-800",
        bgRgb: "209, 250, 229",
        accentColorHex: "#059669",
    },
    {
        name: "Peach",
        bg: "bg-orange-100",
        border: "border-orange-200",
        text: "text-orange-950",
        cardText: "text-orange-800",
        gradientOverlay: "from-transparent via-orange-100/60 via-50% to-orange-100/90",
        pillBg: "bg-orange-200",
        accent: "bg-orange-600",
        lightAccent: "bg-orange-50",
        linkHover: "hover:bg-orange-200",
        shadow: "shadow-orange-600/8",
        accentShadow: "shadow-orange-600/25",
        accentText: "text-orange-800",
        bgRgb: "255, 237, 213",
        accentColorHex: "#ea580c",
    },
    {
        name: "Sky",
        bg: "bg-sky-100",
        border: "border-sky-200",
        text: "text-sky-950",
        cardText: "text-sky-800",
        gradientOverlay: "from-transparent via-sky-100/60 via-50% to-sky-100/90",
        pillBg: "bg-sky-200",
        accent: "bg-sky-600",
        lightAccent: "bg-sky-50",
        linkHover: "hover:bg-sky-200",
        shadow: "shadow-sky-600/8",
        accentShadow: "shadow-sky-600/25",
        accentText: "text-sky-800",
        bgRgb: "224, 242, 254",
        accentColorHex: "#0284c7",
    },
    {
        name: "Lavender",
        bg: "bg-purple-100",
        border: "border-purple-200",
        text: "text-purple-950",
        cardText: "text-purple-800",
        gradientOverlay: "from-transparent via-purple-100/60 via-50% to-purple-100/90",
        pillBg: "bg-purple-200",
        accent: "bg-purple-600",
        lightAccent: "bg-purple-50",
        linkHover: "hover:bg-purple-200",
        shadow: "shadow-purple-600/8",
        accentShadow: "shadow-purple-600/25",
        accentText: "text-purple-800",
        bgRgb: "243, 232, 255",
        accentColorHex: "#9333ea",
    },
    {
        name: "Lemon",
        bg: "bg-yellow-100",
        border: "border-yellow-200",
        text: "text-yellow-950",
        cardText: "text-yellow-800",
        gradientOverlay: "from-transparent via-yellow-100/60 via-50% to-yellow-100/90",
        pillBg: "bg-yellow-200",
        accent: "bg-yellow-600",
        lightAccent: "bg-yellow-50",
        linkHover: "hover:bg-yellow-200",
        shadow: "shadow-yellow-600/8",
        accentShadow: "shadow-yellow-600/25",
        accentText: "text-yellow-800",
        bgRgb: "254, 249, 195",
        accentColorHex: "#ca8a04",
    },
    {
        name: "Rose",
        bg: "bg-rose-100",
        border: "border-rose-200",
        text: "text-rose-950",
        cardText: "text-rose-800",
        gradientOverlay: "from-transparent via-rose-100/60 via-50% to-rose-100/90",
        pillBg: "bg-rose-200",
        accent: "bg-rose-600",
        lightAccent: "bg-rose-50",
        linkHover: "hover:bg-rose-200",
        shadow: "shadow-rose-600/8",
        accentShadow: "shadow-rose-600/25",
        accentText: "text-rose-800",
        bgRgb: "255, 228, 230",
        accentColorHex: "#e11d48",
    },
];
