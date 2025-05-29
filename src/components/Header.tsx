"use client";
import {
  SparklesIcon,
  AtSymbolIcon,
  ClipboardIcon,
  ClipboardDocumentCheckIcon,
  CodeBracketIcon,
} from "@heroicons/react/24/outline";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState("about");
  const [showContactPopup, setShowContactPopup] = useState(false);

  // Reset active section when navigating to home page
  useEffect(() => {
    if (pathname === "/") {
      // When returning to home page, set initial section based on scroll position
      updateActiveSection();
    } else if (pathname.startsWith("/things")) {
      setActiveSection("blog");
    }
  }, [pathname]);

  // Handle URL hash for scrolling when the component mounts or URL changes
  useEffect(() => {
    // Check if there's a hash in the URL
    if (pathname === "/" && window.location.hash) {
      const id = window.location.hash.substring(1); // Remove the # character
      const element = document.getElementById(id);

      if (element) {
        // Use a small delay to ensure the page is fully loaded
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
          setActiveSection(id as "home" | "about" | "work");
        }, 10);
      }
    }
  }, [pathname]);

  // Function to determine active section based on scroll position
  const updateActiveSection = () => {
    const sections = ["home", "about", "work"];
    const scrollPosition = window.scrollY;

    for (const section of sections) {
      const element = document.getElementById(section);
      if (element) {
        const offsetTop = element.offsetTop - 100;
        const offsetBottom = offsetTop + element.offsetHeight;

        if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
          setActiveSection(section);
          return;
        }
      }
    }

    // Default to "about" if no section is matched
    setActiveSection("about");
  };

  // Handle scroll to update active section
  useEffect(() => {
    // Only track scroll on home page
    if (pathname !== "/") return;

    const handleScroll = () => {
      updateActiveSection();
    };

    window.addEventListener("scroll", handleScroll);

    // Initial check when component mounts or pathname changes
    updateActiveSection();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const scrollToSection = (sectionId: "home" | "about" | "work") => {
    // If we're not on the home page, navigate there with hash
    if (pathname !== "/") {
      // Navigate to home page with hash fragment
      router.push(`/#${sectionId}`);
    } else {
      // If already on home page, just scroll and update URL without reload
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        setActiveSection(sectionId);
        window.history.pushState(null, "", `/#${sectionId}`);
      }
    }
  };

  const handleThingsClick = () => {
    router.push("/things");
  };

  return (
    <header className="p-4 fixed w-full top-0 z-50" role="banner">
      <nav aria-label="Main navigation">
        <ul className="mx-auto py-1 px-2 w-fit flex justify-center items-center border border-white/20 bg-pink-200/80 backdrop-saturate-200 backdrop-blur-md rounded-full font-[family-name:var(--font-lastik)] text-purple-950 shadow-2xl shadow-pink-900/50">
          <li
            className={`${
              activeSection === "about"
                ? "opacity-0 w-0 ml-0 mr-0"
                : "opacity-100 w-26 ml-2"
            } text-2xl overflow-clip transition-all duration-700`}
          >
            <button
              onClick={() => scrollToSection("about")}
              aria-label="Navigate to home"
              className="cursor-pointer rounded-full pr-2 py-1 transition-all"
            >
              <span>Jonothan</span>
            </button>
          </li>

          <li>
            <button
              onClick={() => scrollToSection("work")}
              className={`flex gap-1 items-center py-1 rounded-full transition-all duration-300 cursor-pointer border-white/20 ${
                activeSection === "work" ? "bg-purple-100 border  px-3 shadow-xl shadow-purple-950/20" : "px-2"
              }`}
              aria-label="Navigate to work"
            >
              <CodeBracketIcon
                className={`transition-all duration-300 ${
                  activeSection === "work" ? "size-6" : "size-0"
                }`}
              />
              <span>Work</span>
            </button>
          </li>

          <li>
            <button
              onClick={handleThingsClick}
              className={`flex gap-1 items-center py-1 rounded-full transition-all duration-300 cursor-pointer ${
                activeSection === "blog" ? "bg-purple-100 px-3 shadow-xl shadow-purple-950/20" : "px-2"
              }`}
              aria-label="Navigate to blog"
            >
              <SparklesIcon
                className={`transition-all duration-300 ${
                  activeSection === "blog" ? "size-6" : "size-0"
                }`}
              />
              <span>Things</span>
            </button>
          </li>

          <li className="relative">
            <button
              onClick={() => setShowContactPopup(!showContactPopup)}
              className={`flex gap-1 items-center py-1 rounded-full transition-all duration-300 cursor-pointer ${
                showContactPopup ? "bg-purple-100 px-3 ml-2 shadow-xl shadow-purple-950/20" : "px-2 ml-0"
              }`}
              aria-label="Contact"
            >
              <AtSymbolIcon
                className={`transition-all duration-300 ${
                  showContactPopup ? "size-6" : "size-0"
                }`}
              />
              <span>Contact</span>
            </button>

            <div
              className={`absolute mt-2 right-0 z-50 transition-all duration-300 drop-shadow-purple-900/20 ${
                showContactPopup
                  ? "top-10 opacity-100 pointer-events-auto drop-shadow-2xl"
                  : "top-12 opacity-0 pointer-events-none drop-shadow-sm"
              }`}
            >
              <div className="flex gap-1 text-xl drop-shadow-xl rounded-lg overflow-hidden font-[family-name:var(--font-hyperlegible)]">
                <Link
                  href="mailto:hey@jonothan.dev"
                  className="inline-flex items-center text-purple-950 bg-purple-50 text-base px-3 py-2 rounded-l-lg transition-all cursor-pointer"
                  aria-label="Email me at hey@jonothan.dev"
                >
                  hey@jonothan.dev
                </Link>
                <button
                  aria-label={
                    copied
                      ? "Email copied to clipboard"
                      : "Copy my email to clipboard"
                  }
                  className="inline-flex items-center justify-center bg-purple-50  px-3 py-2 rounded-r-lg transition-all cursor-pointer"
                  onClick={() => {
                    navigator.clipboard.writeText("hey@jonothan.dev");
                    setCopied(true);
                    setTimeout(() => {
                      setCopied(false);
                    }, 5000);
                  }}
                >
                  {copied ? (
                    <ClipboardDocumentCheckIcon className="h-5 w-5 text-purple-950" />
                  ) : (
                    <ClipboardIcon className="h-5 w-5 text-purple-950" />
                  )}
                </button>
              </div>
            </div>
          </li>
        </ul>
      </nav>
    </header>
  );
}
