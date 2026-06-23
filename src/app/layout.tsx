import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "../components/Header";
import { Analytics } from "@vercel/analytics/next";

const lastik = localFont({
  variable: "--font-lastik",
  src: "./fonts/LastikVariable-Variable.woff2",
  display: "block",
  weight: "50 100",
});

const atkinsonHyperlegible = localFont({
  variable: "--font-hyperlegible",
  src: "./fonts/AtkinsonHyperlegibleNext-VariableFont_wght.ttf",
  display: "block",
  weight: "100 1000",
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
  alternates: {
    canonical: "https://jonothan.dev",
  },
  openGraph: {
    title: "Jonothan Hunt",
    description: "Creative developer creating innovative experiences for brands",
    url: "https://jonothan.dev",
    siteName: "Jonothan Hunt",
    images: [
      {
        url: "https://jonothan.dev/images/jonothan_profile.jpeg",
        width: 1200,
        height: 630,
        alt: "Jonothan Hunt",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jonothan Hunt",
    description: "Creative developer creating innovative experiences for brands",
    images: ["https://jonothan.dev/images/jonothan_profile.jpeg"],
    creator: "@jonothan",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="site.standard.publication" href={`at://${process.env.ATPROTO_DID || 'did:plc:3su63qgei4gylhflvwqj54lw'}/site.standard.publication/main`} />
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

  {/* Removed SVG filter for performance; CSS backdrop-blur is used instead */}
        <Analytics />
      </body>
    </html>
  );
}
