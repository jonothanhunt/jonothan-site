import "./globals.css";
import type { Metadata } from "next";
import { Atkinson_Hyperlegible } from "next/font/google";
import Header from "./components/Header";
import Experience from "./components/Experience";
import { LightModeProvider } from "./context/LightModeContext"; // Import the provider

const atkinsonHyperlegible = Atkinson_Hyperlegible({
    weight: ["400", "700"],
    subsets: ["latin"],
    display: "swap",
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html id="root" lang="en">
            <body className={`${atkinsonHyperlegible.className} bg-amber-200 dark:bg-zinc-800`}>
                <LightModeProvider>
                    <Header />
                    <div className="relative">
                        <div className="absolute top-4 left-0 -z-10 w-full h-[min(70vw,60vh)]">
                            <Experience />
                        </div>
                    </div>
                    {children}
                </LightModeProvider>
            </body>
        </html>
    );
}
