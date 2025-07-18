import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "../components/Header";
import { Analytics } from "@vercel/analytics/next";

const lastik = localFont({
  variable: "--font-lastik",
  src: "./fonts/LastikVariable-Variable.woff2",
  display: "swap",
});

const atkinsonHyperlegible = localFont({
  variable: "--font-hyperlegible",
  src: "./fonts/AtkinsonHyperlegibleNext-VariableFont_wght.ttf",
  display: "swap",
});

// JSON-LD structured data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Jonothan Hunt",
  alternateName: "Jonathan Hunt",
  url: "https://jonothan.dev",
  image: "https://jonothan.dev/images/jonothan_profile.jpeg",
  jobTitle: "Creative Developer",
  worksFor: {
    "@type": "Organization",
    name: "VML",
  },
  sameAs: ["https://www.linkedin.com/in/jonothan"],
};

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
  // Add alternates for canonical URL
  alternates: {
    canonical: "https://jonothan.dev",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Add JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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

        {/* SVG Filter for glass effect */}
        <svg xmlns="http://www.w3.org/2000/svg" style={{ display: "none" }}>
          <filter
            id="lensFilter"
            x="0%"
            y="0%"
            width="100%"
            height="100%"
            filterUnits="objectBoundingBox"
          >
            <feComponentTransfer in="SourceAlpha" result="alpha">
              <feFuncA type="identity" />
            </feComponentTransfer>
            <feGaussianBlur in="alpha" stdDeviation="50" result="blur" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="blur"
              scale="25"
              xChannelSelector="A"
              yChannelSelector="A"
            />
          </filter>
        </svg>
        <Analytics />
      </body>
    </html>
  );
}
