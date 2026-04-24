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

  useEffect(() => {
    if (pathname === "/") {
      updateActiveSection();
    } else if (pathname.startsWith("/blog")) {
      setActiveSection("blog");
    }
  }, [pathname]);

  useEffect(() => {
    if (!showContactPopup) return;

    let clickHandler: (e: MouseEvent) => void;

    const timeoutId = setTimeout(() => {
      clickHandler = (e: MouseEvent) => {
        const target = e.target as Element;
        const isCopyButton =
          target.closest('button[aria-label="Email copied to clipboard"]') ||
          target.closest('button[aria-label="Copy my email to clipboard"]');

        if (
          !target.closest('button[aria-label="Contact"]') &&
          !target.closest('div[class*="fixed mt-2 right-4"]')
        ) {
          if (!isCopyButton && !copied) {
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

  useEffect(() => {
    if (pathname === "/" && window.location.hash) {
      const id = window.location.hash.substring(1);
      const element = document.getElementById(id);

      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
          setActiveSection(id as "home" | "about" | "work");
        }, 10);
      }
    }
  }, [pathname]);

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

    setActiveSection("about");
  };

  useEffect(() => {
    if (pathname !== "/") return;

    window.addEventListener("scroll", updateActiveSection);
    updateActiveSection();

    return () => window.removeEventListener("scroll", updateActiveSection);
  }, [pathname]);

  const handleSectionClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    sectionId: "home" | "about" | "work"
  ) => {
    if (pathname === "/") {
      e.preventDefault();
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        setActiveSection(sectionId);
        window.history.pushState(null, "", `/#${sectionId}`);
      }
    }
  };

  return (
    <header className="p-4 fixed w-full top-0 z-50" role="banner">
      <nav aria-label="Main navigation" className="relative">
        <div className="relative flex items-center rounded-full mx-auto w-fit bg-purple-50/90 backdrop-blur-md shadow-2xl shadow-purple-900/50 text-purple-950">
          <ul className="flex flex-1 items-center mx-auto py-2 px-2 w-fit justify-center font-[family-name:var(--font-lastik)] font-w-70 text-purple-950 align-middle">
            <li
              className={`overflow-hidden transition-[width,margin] duration-700 text-2xl ${
                activeSection === "about" ? "w-0 ml-0 mr-0" : "w-26 ml-2"
              }`}
              style={{ minWidth: 0 }}
            >
              <Link
                href="/#about"
                onClick={(e) => handleSectionClick(e, "about")}
                aria-label="Navigate to home"
                className="cursor-pointer rounded-full pr-2 py-1 transition-colors flex items-center hover:text-emerald-800 text-emerald-600"
              >
                <span
                  className={`leading-[1.1] align-middle relative top-[2px] transition-opacity duration-700 ${
                    activeSection === "about" ? "opacity-10" : "opacity-100"
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
                className={`flex gap-1 items-center py-1 rounded-full transition-all duration-300 cursor-pointer h-9 hover:text-orange-800 ${
                  activeSection === "work"
                    ? "bg-orange-50 px-4 shadow-lg shadow-orange-900/10 text-orange-800"
                    : "px-3 text-orange-600"
                }`}
                aria-label="Navigate to work"
              >
                {/* <CodeBracketIcon
                  className={`transition-all duration-300 ${
                    activeSection === "work" ? "size-6" : "size-0"
                  }`}
                /> */}
                <span className="align-middle relative top-[2px]">Work</span>
              </Link>
            </li>

            <li>
              <Link
                href="/blog"
                className={`flex gap-1 items-center py-1 rounded-full transition-all duration-300 cursor-pointer h-9 hover:text-sky-800 ${
                  activeSection === "blog"
                    ? "bg-sky-50 px-4 shadow-lg shadow-sky-900/10 text-sky-800"
                    : "px-3 text-sky-600"
                }`}
                aria-label="Navigate to blog"
              >
                {/* <SparklesIcon
                  className={`transition-all duration-300 ${
                    activeSection === "blog" ? "size-6" : "size-0"
                  }`}
                /> */}
                <span className="align-middle relative top-[2px]">Blog</span>
              </Link>
            </li>

            <li className="relative">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowContactPopup(!showContactPopup);
                }}
                className={`flex gap-1 items-center py-1 rounded-full transition-all duration-300 cursor-pointer h-9 hover:text-rose-800 ${
                  showContactPopup
                    ? "bg-rose-50 px-4 ml-2 shadow-lg shadow-rose-900/10 text-rose-800"
                    : "px-3 ml-0 text-rose-600"
                }`}
                aria-label="Contact"
              >
                {/* <AtSymbolIcon
                  className={`transition-all duration-300 ${
                    showContactPopup ? "size-6" : "size-0"
                  }`}
                /> */}
                <span className="align-middle relative top-[2px]">Contact</span>
              </button>

              <div
                className={`absolute right-0 z-[100] flex items-center bg-rose-50 rounded-lg overflow-visible shadow-xl shadow-rose-900/20 transition-all duration-300 ${
                  showContactPopup
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
                      e.stopPropagation();
                      navigator.clipboard.writeText("hey@jonothan.dev");
                      setCopied(true);

                      setTimeout(() => {
                        setCopied(false);
                        setShowContactPopup(false);
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
