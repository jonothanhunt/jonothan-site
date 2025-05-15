"use client";
import {
  SparklesIcon,
  AtSymbolIcon,
  //   QuestionMarkCircleIcon,
  BookOpenIcon,
  ClipboardIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";

import { useState, useEffect } from "react";

export default function Header() {
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState("about");
  const [showContactPopup, setShowContactPopup] = useState(false);

  // Handle scroll to update active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["home", "about", "work", "blog"];
      const scrollPosition = window.scrollY;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop - 100;
          const offsetBottom = offsetTop + element.offsetHeight;

          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: "home" | "about" | "work" | "blog") => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveSection(sectionId);
    }
  };

  return (
    <header className="p-4 fixed w-full top-0 z-50">
      {/* <div className="fixed top-0 left-0 w-full h-28 pointer-events-none -z-10">
        <div className="relative h-2 w-full">
          <div
            className="absolute -top-2 left-0 h-6 w-full"
            style={{
              backdropFilter: `blur(3px)`,
            }}
          />
        </div>
        {Array.from({ length: 10 }).map((_, i) => {
          const blurMax = 3;
          const blurAmount = blurMax - (i / 10) * blurMax;

          return (
            <div key={i} className="relative h-2 w-full">
              <div
                className="absolute -top-2 left-0 h-6 w-full"
                style={{
                  backdropFilter: `blur(${blurAmount.toFixed(0)}px)`,
                  WebkitMaskImage:
                    "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 33%, rgba(0,0,0,1) 66%, rgba(0,0,0,0) 100%)",
                  maskImage:
                    "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 33%, rgba(0,0,0,1) 66%, rgba(0,0,0,0) 100%)",
                }}
              />
            </div>
          );
        })}
      </div> */}
      <ul className="mx-auto py-1 px-2 w-fit flex justify-center items-center bg-pink-200/70 backdrop-blur-3xl rounded-full font-[family-name:var(--font-lastik)] text-purple-950">
        <li
          className={`${
            activeSection === "about"
              ? "opacity-0 w-0 ml-0 mr-0"
              : "opacity-100 w-26 ml-2"
          } text-2xl overflow-clip transition-all duration-700`}
        >
          <button
            onClick={() => scrollToSection("home")}
            aria-label="Navigate to home"
            className="cursor-pointer rounded-full pr-2 py-1 transition-all"
          >
            <span>Jonothan</span>
          </button>
        </li>

        <li>
          <button
            onClick={() => scrollToSection("work")}
            className={`flex gap-1 items-center py-1 rounded-full transition-all duration-300 cursor-pointer   ${
              activeSection === "work" ? "bg-purple-100 px-3" : "px-2"
            }`}
            aria-label="Navigate to work"
          >
            <SparklesIcon
              className={`transition-all duration-300 ${
                activeSection === "work" ? "size-6" : "size-0"
              }`}
            />
            <span>Work</span>
          </button>
        </li>

        <li>
          <button
            onClick={() => scrollToSection("blog")}
            className={`flex gap-1 items-center py-1 rounded-full transition-all duration-300 cursor-pointer   ${
              activeSection === "blog" ? "bg-purple-100 px-3" : "px-2"
            }`}
            aria-label="Navigate to blog"
          >
            <BookOpenIcon
              className={`transition-all duration-300 ${
                activeSection === "blog" ? "size-6" : "size-0"
              }`}
            />
            <span>Blog</span>
          </button>
        </li>

        <li className="relative">
          <button
            onClick={() => setShowContactPopup(!showContactPopup)}
            className={`flex gap-1 items-center py-1 rounded-full transition-all duration-300 cursor-pointer   ${
              showContactPopup ? "bg-purple-100 px-3 ml-2" : "px-2 ml-0"
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
            className={`absolute mt-2 right-0 z-50 transition-all duration-300 ${
              showContactPopup
                ? "top-10 opacity-100 pointer-events-auto"
                : "top-12 opacity-0 pointer-events-none"
            }`}
          >
            <div className="flex gap-1 text-xl drop-shadow-xl drop-shadow-purple-200/50 rounded-lg overflow-hidden">
              <a
                href="mailto:hey@jonothan.dev"
                className="inline-flex items-center text-purple-950 bg-purple-50 text-base px-3 py-2 rounded-l-lg transition-all cursor-pointer  "
                aria-label="Email me at hey@jonothan.dev"
              >
                hey@jonothan.dev
              </a>
              <button
                aria-label="Copy my email"
                className="inline-flex items-center justify-center bg-purple-50 px-3 py-2 rounded-r-lg transition-all cursor-pointer  "
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
    </header>
  );
}
