// app/about/page.tsx
import { redirect } from "next/navigation";

export default function Work() {
    // This redirects to the home page with a hash for the about section
    redirect("/#work");
}
