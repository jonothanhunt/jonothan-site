export interface Theme {
    name: string;
    bg: string;
    border: string;
    text: string;
    pillBg: string;
    accent: string;
    lightAccent: string; // for lighter hover states or secondary backgrounds
    linkHover: string;
    shadow: string;
    accentShadow: string;
}

export const PLAYFUL_THEMES: Theme[] = [
    {
        name: "Mint",
        bg: "bg-teal-100",
        border: "border-teal-200",
        text: "text-teal-950",
        pillBg: "bg-teal-200",
        accent: "bg-teal-600",
        lightAccent: "bg-teal-50",
        linkHover: "hover:bg-teal-200",
        shadow: "shadow-teal-600/15",
        accentShadow: "shadow-teal-600/50",
    },
    {
        name: "Peach",
        bg: "bg-orange-100",
        border: "border-orange-200",
        text: "text-orange-950",
        pillBg: "bg-orange-200",
        accent: "bg-orange-600",
        lightAccent: "bg-orange-50",
        linkHover: "hover:bg-orange-200",
        shadow: "shadow-orange-600/15",
        accentShadow: "shadow-orange-600/50",
    },
    {
        name: "Sky",
        bg: "bg-sky-100",
        border: "border-sky-200",
        text: "text-sky-950",
        pillBg: "bg-sky-200",
        accent: "bg-sky-600",
        lightAccent: "bg-sky-50",
        linkHover: "hover:bg-sky-200",
        shadow: "shadow-sky-600/15",
        accentShadow: "shadow-sky-600/50",
    },
    {
        name: "Lavender",
        bg: "bg-purple-100",
        border: "border-purple-200",
        text: "text-purple-950",
        pillBg: "bg-purple-200",
        accent: "bg-purple-600",
        lightAccent: "bg-purple-50",
        linkHover: "hover:bg-purple-200",
        shadow: "shadow-purple-600/15",
        accentShadow: "shadow-purple-600/50",
    },
    {
        name: "Lemon",
        bg: "bg-yellow-100",
        border: "border-yellow-200",
        text: "text-yellow-950",
        pillBg: "bg-yellow-200",
        accent: "bg-yellow-600",
        lightAccent: "bg-yellow-50",
        linkHover: "hover:bg-yellow-200",
        shadow: "shadow-yellow-600/15",
        accentShadow: "shadow-yellow-600/50",
    },
    {
        name: "Rose",
        bg: "bg-rose-100",
        border: "border-rose-200",
        text: "text-rose-950",
        pillBg: "bg-rose-200",
        accent: "bg-rose-600",
        lightAccent: "bg-rose-50",
        linkHover: "hover:bg-rose-200",
        shadow: "shadow-rose-600/15",
        accentShadow: "shadow-rose-600/50",
    },
];
