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
  description: "Creative developer creating innovative experiences for brands",
  keywords: [
    "Jonothan Hunt",
    "Jonathan Hunt",
    "Jonothan Hunt website",
    "Jonathan Hunt website",
    "Jono Creative Technologist",
    "Jono Hunt",
    "Jono VML",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${lastik.variable} ${atkinsonHyperlegible.variable} antialiased min-h-screen h-full flex flex-col`}
      >
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="mt-24 w-full text-center py-4">
          <p className="text-sm text-purple-950/50">
            &copy; {new Date().getFullYear()} Jonothan Hunt
          </p>
        </footer>
      </body>
    </html>
  );
}
