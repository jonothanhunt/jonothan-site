import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "../components/Header";

const lastik = localFont({
  variable: "--font-lastik",
  src: "./fonts/Lastik.woff2",
  display: "swap",
});

const atkinsonHyperlegible = localFont({
  variable: "--font-hyperlegible",
  src: "./fonts/AtkinsonHyperlegibleNext-VariableFont_wght.ttf",
  display: "swap",
});

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
        {/* <div className="fixed -z-50 top-0 left-0 pointer-events-none w-full h-full bg-gradient-to-b from-[#ffe5fd] to-[#d2d8ec]"></div> */}
        <Header />
        {children}
        <footer className="mt-24 w-full dark:bg-gray-900 text-center py-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Jonothan Hunt.
          </p>
        </footer>
      </body>
    </html>
  );
}
