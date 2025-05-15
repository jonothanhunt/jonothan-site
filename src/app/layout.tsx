import type { Metadata } from "next";
// import { Atkinson_Hyperlegible } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Header from "./components/Header";

const lastik = localFont({
  variable: "--font-lastik",
  src: "./fonts/Lastik.woff2",
  display: "swap",
});

// const atkinsonHyperlegible = Atkinson_Hyperlegible({
//   variable: "--font-hyperlegible",
//   weight: "400",
//   subsets: ["latin"],
//   display: "swap",
// });

const atkinsonHyperlegible = localFont({
  variable: "--font-hyperlegible",
  src: "./fonts/AtkinsonHyperlegibleNext-VariableFont_wght.ttf",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Jonothan Hunt",
  description: "Creative developer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${lastik.variable} ${atkinsonHyperlegible.variable} antialiased`}
      >
        {/* fixed background */}
        <div className="fixed -z-50 top-0 left-0 pointer-events-none w-full h-full bg-gradient-to-b from-[#ffe5fd] to-[#d2d8ec]"></div>
        <Header />
        {children}
      </body>
    </html>
  );
}
