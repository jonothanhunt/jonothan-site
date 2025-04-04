// app/about/page.tsx
import { redirect } from "next/navigation";

export default function About() {
    // This redirects to the home page with a hash for the about section
    redirect("/#about");
}
