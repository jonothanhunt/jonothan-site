import { ReactNode } from "react";
import "./globals.css"; // Your global styles
import Header from "./components/Header";

export const metadata = {
  title: "Jonothan.dev",
  description: "Creative developer and technologist",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <meta name="apple-mobile-web-app-title" content="Jonothan.dev" />

      <body>
        <header className="z-10 fixed top-0 left-0">
          <Header />
        </header>
        {children}
      </body>
    </html>
  );
}
