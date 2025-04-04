import { ReactNode } from "react";
import "./globals.css"; // Your global styles

export const metadata = {
  title: "Jonothan.dev",
  description: "Creative developer and technologist",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <meta name="apple-mobile-web-app-title" content="Jonothan.dev" />
      <body>{children}</body>
    </html>
  );
}
