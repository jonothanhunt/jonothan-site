"use client";
import {
  SparklesIcon,
  AtSymbolIcon,
  ClipboardIcon,
  ClipboardDocumentCheckIcon,
  CodeBracketIcon,
} from "@heroicons/react/24/outline";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Header() {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState("about");
  const [showContactPopup, setShowContactPopup] = useState(false);

  /* 
   * Hardcoded vibrant colors for nav items:
   * Home: Teal
   * Work: Orange
   * Things: Sky
   * Contact: Rose
   */

  // When the pathname changes, update the active section.
  useEffect(() => {
    if (pathname === "/") {
      // When returning to home page, set initial section based on scroll position
      updateActiveSection();
    } else if (pathname.startsWith("/things")) {
      setActiveSection("blog");
    }
  }, [pathname]);

  // Close the contact popup when the user clicks outside of it.
  useEffect(() => {
    if (!showContactPopup) return;

    let clickHandler: (e: MouseEvent) => void;

    // Wait a bit before adding the click handler to avoid immediate closing
    const timeoutId = setTimeout(() => {
      clickHandler = (e: MouseEvent) => {
        const target = e.target as Element;
        const isCopyButton =
          target.closest('button[aria-label="Email copied to clipboard"]') ||
          target.closest('button[aria-label="Copy my email to clipboard"]');

        // Only proceed if the click is outside both contact button and popup
        if (
          !target.closest('button[aria-label="Contact"]') &&
          !target.closest('div[class*="fixed mt-2 right-4"]')
        ) {
          // For clicks on copy button, the button's onClick handler will manage the timing
          if (!isCopyButton && !copied) {
            // For other clicks (and not during copy feedback period), close immediately
            setShowContactPopup(false);
          }
        }
      };

      document.addEventListener("click", clickHandler);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (clickHandler) {
        document.removeEventListener("click", clickHandler);
      }
    };
  }, [showContactPopup, copied]);

  // When the component mounts or the pathname changes, scroll to the section specified in the URL hash.
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

  const handleSectionClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    sectionId: "home" | "about" | "work"
  ) => {
    if (pathname === "/") {
      // If already on home page, prevent default navigation and smooth scroll
      e.preventDefault();
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        setActiveSection(sectionId);
        window.history.pushState(null, "", `/#${sectionId}`);
      }
    }
    // If not on home page, let Link handle the navigation
  };

  return (
    <header className="p-4 fixed w-full top-0 z-50" role="banner">
      <nav aria-label="Main navigation" className="relative">
        {/* Glass Container */}
        <div className="relative flex items-center bg-transparent rounded-full overflow-visible flex-1 shadow-2xl shadow-purple-900/40 text-purple-950 transition-all duration-500 ease-[cubic-bezier(0.175,0.885,0.32,2.2)] mx-auto w-fit">
          {/* Glass Blur - CSS-only backdrop blur (removed SVG filter for performance) */}
          <div className="absolute inset-0 rounded-full z-0 backdrop-blur-[3px]"></div>
          {/* Glass Overlay - Semi-transparent background */}
          <div className="absolute inset-0 rounded-full z-[1] bg-purple-50/95"></div>
          {/* Glass Specular - Edge highlight effect */}
          <div className="absolute inset-0 rounded-full z-[2] shadow-[inset_1px_1px_0_rgba(255,255,255,0.40),inset_0_0_5px_rgba(255,255,255,0.40)]"></div>
          {/* Cursor Glow Effect */}
          <div
            className="absolute inset-0 rounded-full z-[1.5] pointer-events-none opacity-0 transition-opacity duration-300"
            style={{
              background: 'radial-gradient(circle 160px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 1.0) 25%, rgba(255, 255, 255, 0.5) 50%, transparent 80%)'
            }}
          ></div>
          {/* Glass Content - Actual nav items */}
          <ul className="relative z-[3] flex flex-1 items-center mx-auto py-1 px-2 w-fit h-12 justify-center font-[family-name:var(--font-lastik)] font-w-70 text-purple-950 align-middle"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * 100;
              const y = ((e.clientY - rect.top) / rect.height) * 100;
              const glowElement = e.currentTarget.parentElement?.querySelector('.absolute.inset-0.rounded-full.z-\\[1\\.5\\]') as HTMLElement;
              if (glowElement) {
                glowElement.style.setProperty('--mouse-x', `${x}%`);
                glowElement.style.setProperty('--mouse-y', `${y}%`);
                glowElement.style.opacity = '1';
              }
            }}
            onMouseLeave={(e) => {
              const glowElement = e.currentTarget.parentElement?.querySelector('.absolute.inset-0.rounded-full.z-\\[1\\.5\\]') as HTMLElement;
              if (glowElement) {
                glowElement.style.opacity = '0';
              }
            }}
          >
            <li
              className={`overflow-hidden transition-[width,margin] duration-700 text-2xl ${activeSection === "about"
                ? "w-0 ml-0 mr-0"
                : "w-26 ml-2"
                }`}
              style={{ minWidth: 0 }}
            >
              <Link
                href="/#about"
                onClick={(e) => handleSectionClick(e, "about")}
                aria-label="Navigate to home"
                className="cursor-pointer rounded-full pr-2 py-1 transition-all h-8 flex items-center hover:text-emerald-800 text-emerald-600"
              >
                <span
                  className={`leading-[1.1] align-middle relative top-[2px] transition-opacity duration-700 ${activeSection === "about" ? "opacity-10" : "opacity-100"
                    }`}
                  style={{ display: "inline-block", whiteSpace: "nowrap" }}
                >
                  Jonothan
                </span>
              </Link>
            </li>

            <li>
              <Link
                href="/#work"
                onClick={(e) => handleSectionClick(e, "work")}
                className={`flex gap-1 items-center py-1 rounded-full transition-all duration-300 cursor-pointer border-white/20 h-8 hover:text-orange-800 text-orange-600 ${activeSection === "work"
                  ? "bg-orange-200/60 border px-3 shadow-lg shadow-orange-900/10"
                  : "px-2"
                  }`}
                aria-label="Navigate to work"
              >
                <CodeBracketIcon
                  className={`transition-all duration-300 ${activeSection === "work" ? "size-6" : "size-0"
                    }`}
                />
                <span className="align-middle relative top-[2px]">Work</span>
              </Link>
            </li>

            <li>
              <Link
                href="/things"
                className={`flex gap-1 items-center py-1 rounded-full transition-all duration-300 cursor-pointer h-8 hover:text-sky-800 text-sky-600 ${activeSection === "blog"
                  ? "bg-sky-200/60 px-3 shadow-lg shadow-sky-900/10"
                  : "px-2"
                  }`}
                aria-label="Navigate to blog"
              >
                <SparklesIcon
                  className={`transition-all duration-300 ${activeSection === "blog" ? "size-6" : "size-0"
                    }`}
                />
                <span className="align-middle relative top-[2px]">Things</span>
              </Link>
            </li>

            <li className="relative">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation(); // Prevent event bubbling
                  setShowContactPopup(!showContactPopup);
                  console.log(
                    "Contact button clicked, popup state:",
                    !showContactPopup
                  ); // Debug log
                }}
                className={`flex gap-1 items-center py-1 rounded-full transition-all duration-300 cursor-pointer h-8 hover:text-rose-800 text-rose-600 ${showContactPopup
                  ? "bg-rose-200/60 px-3 ml-2 shadow-lg shadow-rose-900/10"
                  : "px-2 ml-0"
                  }`}
                aria-label="Contact"
              >
                <AtSymbolIcon
                  className={`transition-all duration-300 ${showContactPopup ? "size-6" : "size-0"
                    }`}
                />
                <span className="align-middle relative top-[2px]">Contact</span>
              </button>

              <div
                className={`absolute right-0 z-[100] flex items-center bg-rose-100 backdrop-blur-[6px] rounded-lg overflow-visible shadow-xl shadow-rose-900/20 transition-all duration-300 ${showContactPopup
                  ? "top-12 opacity-100 pointer-events-auto translate-y-0"
                  : "top-16 opacity-0 pointer-events-none translate-y-1"
                  }`}
              >
                <div className="relative z-[3] flex gap-1 text-xl rounded-lg overflow-hidden font-[family-name:var(--font-hyperlegible)] font-normal">
                  <Link
                    href="mailto:hey@jonothan.dev"
                    className="inline-flex items-center text-rose-800 text-base px-3 py-2 transition-all hover:brightness-105 active:brightness-95 cursor-pointer"
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
                    className="inline-flex items-center justify-center px-3 py-2 transition-all hover:brightness-105 active:brightness-95 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent closing popup when clicking copy button
                      navigator.clipboard.writeText("hey@jonothan.dev");
                      setCopied(true);

                      // Set a timeout to clear the copied state and close the popup after 1 second
                      setTimeout(() => {
                        setCopied(false);
                        setShowContactPopup(false); // Actually close the popup
                      }, 1000);
                    }}
                  >
                    {copied ? (
                      <ClipboardDocumentCheckIcon className="h-5 w-5 text-rose-800" />
                    ) : (
                      <ClipboardIcon className="h-5 w-5 text-rose-800" />
                    )}
                  </button>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
