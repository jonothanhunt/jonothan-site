"use client";
// app/page.tsx
import HomePage from "./components/HomePage";

export const dynamic = 'force-static';

export default function Home() {
    return <HomePage />;
}
