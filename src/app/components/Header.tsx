"use client";
import { useState, RefObject, useEffect } from "react";
import Link from "next/link";

import { SparklesIcon } from "@heroicons/react/24/solid";
import { AtSymbolIcon, HomeIcon } from "@heroicons/react/24/outline";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

import { ClipboardIcon } from "@heroicons/react/24/outline";
import { ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline";

import localFont from "next/font/local";

const lastik = localFont({
    src: "../fonts/Lastik.woff2",
    display: "swap",
});

interface HeaderProps {
    scrollContainerRef?: RefObject<HTMLElement | HTMLDivElement | null>;
}

const Header = ({ scrollContainerRef }: HeaderProps) => {
    const [copied, setCopied] = useState(false);
    const [activeSection, setActiveSection] = useState("/");
    const [userScrolling, setUserScrolling] = useState(false);

    useEffect(() => {
        let scrollTimeout: NodeJS.Timeout;

        const handleScroll = () => {
            clearTimeout(scrollTimeout);

            scrollTimeout = setTimeout(() => {
                const aboutSection = document.getElementById("about");
                const workSection = document.getElementById("work");

                if (aboutSection && workSection) {
                    const aboutRect = aboutSection.getBoundingClientRect();
                    const workRect = workSection.getBoundingClientRect();

                    if (workRect.top <= 300 && workRect.bottom >= 100) {
                        setActiveSection("/work");
                        if (userScrolling && window.location.hash !== "#work") {
                            window.history.replaceState(null, "", "/#work");
                        }
                    } else if (
                        aboutRect.top <= 300 &&
                        aboutRect.bottom >= 100
                    ) {
                        setActiveSection("/about");
                        if (
                            userScrolling &&
                            window.location.hash !== "#about"
                        ) {
                            window.history.replaceState(null, "", "/#about");
                        }
                    } else {
                        setActiveSection("/");
                        if (userScrolling && window.location.hash) {
                            window.history.replaceState(null, "", "/");
                        }
                    }
                }

                setUserScrolling(true);
            }, 100);
        };

        if (window.location.hash === "#about") {
            setActiveSection("/about");
        } else if (window.location.hash === "#work") {
            setActiveSection("/work");
        }

        const scrollContainer = scrollContainerRef?.current || window;
        scrollContainer.addEventListener("scroll", handleScroll);

        return () => {
            scrollContainer.removeEventListener("scroll", handleScroll);
            clearTimeout(scrollTimeout);
        };
    }, [scrollContainerRef, userScrolling]);

    const navigateToHome = (e: React.MouseEvent) => {
        e.preventDefault();
        setUserScrolling(false);
        setActiveSection("/");
        window.history.pushState(null, "", "/");

        if (scrollContainerRef?.current) {
            const container = scrollContainerRef.current;
            if ("scrollTo" in container) {
                container.scrollTo({ top: 0, behavior: "smooth" });
            }
        } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const navigateToAbout = (e: React.MouseEvent) => {
        e.preventDefault();
        setUserScrolling(false);
        setActiveSection("/about");
        window.history.pushState(null, "", "/#about");

        const aboutSection = document.getElementById("about");
        if (aboutSection) {
            if (scrollContainerRef?.current) {
                const container = scrollContainerRef.current;
                if ("scrollTo" in container) {
                    container.scrollTo({
                        top: aboutSection.offsetTop - 300,
                        behavior: "smooth",
                    });
                }
            } else {
                aboutSection.scrollIntoView({ behavior: "smooth" });
            }
        }
    };

    const navigateToWorkSection = (e: React.MouseEvent) => {
        e.preventDefault();
        setUserScrolling(false);
        setActiveSection("/work");
        window.history.pushState(null, "", "/#work");

        const workSection = document.getElementById("work");
        if (workSection) {
            if (scrollContainerRef?.current) {
                const container = scrollContainerRef.current;
                if ("scrollTo" in container) {
                    container.scrollTo({
                        top: workSection.offsetTop - 300,
                        behavior: "smooth",
                    });
                }
            } else {
                workSection.scrollIntoView({ behavior: "smooth" });
            }
        }
    };

    return (
        <header className="w-screen flex flex-wrap justify-between items-center sticky z-20">
            <nav className="w-full p-4">
                <ul className="flex justify-between items-center gap-6 md:p-0">
                    <li className="col-start-1 row-start-1">
                        <h1
                            className={`text-2xl min-[1000px]:text-4xl tracking-tight flex relative ${lastik.className}`}
                        >
                            <span className="">J</span>
                            <span className="hidden min-[1000px]:inline">
                                onothan.dev
                            </span>
                        </h1>
                    </li>
                    <li className="col-span-2 col-start-1 row-start-2 md:col-span-1 md:col-start-2 md:row-start-1">
                        <ul className="flex gap-0 md:gap-3 h-full">
                            <li className="flex-1 text-center my-auto flex">
                                <Link
                                    href="/"
                                    onClick={navigateToHome}
                                    className={`${
                                        lastik.className
                                    } font-bold text-sm md:text-base italic px-3 py-1.5 w-full rounded-l-lg md:rounded-r-lg whitespace-nowrap transition-all outline-2 outline-transparent outline-offset-0 hover:outline-orange-100 hover:outline-offset-4 focus-visible:outline-orange-100 focus-visible:outline-offset-4 ${
                                        activeSection === "/"
                                            ? "bg-orange-100/90 backdrop-blur-lg text-fuchsia-700"
                                            : "bg-fuchsia-700 text-orange-100"
                                    }`}
                                    aria-label="Navigate to home"
                                >
                                    <HomeIcon
                                        className={`inline-block text-fuchsia-700 mb-1 transition-all ${
                                            activeSection === "/"
                                                ? "h-4 w-4 mr-2"
                                                : "h-0 w-0 mr-0"
                                        }`}
                                    />
                                    <span>Home</span>
                                </Link>
                            </li>
                            <li className="flex-1 text-center my-auto flex">
                                <Link
                                    href="/#about"
                                    onClick={navigateToAbout}
                                    className={`${
                                        lastik.className
                                    } font-bold text-sm md:text-base italic relative px-3 py-1.5 w-full rounded-none md:rounded-lg whitespace-nowrap transition-all outline-2 outline-transparent outline-offset-0 hover:outline-orange-100 hover:outline-offset-4 focus-visible:outline-orange-100 focus-visible:outline-offset-4 ${
                                        activeSection === "/about"
                                            ? "bg-orange-100 text-fuchsia-700"
                                            : "bg-fuchsia-700 text-orange-100"
                                    }`}
                                    aria-label="Navigate to About section"
                                >
                                    <QuestionMarkCircleIcon
                                        className={`inline-block text-fuchsia-700 mb-1 transition-all ${
                                            activeSection === "/about"
                                                ? "h-4 w-4 mr-2"
                                                : "h-0 w-0 mr-0"
                                        }`}
                                    />
                                    <span>About</span>
                                </Link>
                            </li>
                            <li className="flex-1 text-center my-auto flex">
                                <Link
                                    href="/#work"
                                    onClick={navigateToWorkSection}
                                    className={`${
                                        lastik.className
                                    } font-bold text-sm md:text-base italic relative px-3 py-1.5 w-full rounded-r-lg md:rounded-l-lg whitespace-nowrap transition-all outline-2 outline-transparent outline-offset-0 hover:outline-orange-100 hover:outline-offset-4 focus-visible:outline-orange-100 focus-visible:outline-offset-4 ${
                                        activeSection === "/work"
                                            ? "bg-orange-100 text-fuchsia-700"
                                            : "bg-fuchsia-700 text-orange-100"
                                    }`}
                                    aria-label="Navigate to Work section"
                                >
                                    <SparklesIcon
                                        className={`inline-block text-fuchsia-700 mb-1 transition-all ${
                                            activeSection === "/work"
                                                ? "h-4 w-4 mr-2"
                                                : "h-0 w-0 mr-0"
                                        }`}
                                    />
                                    <span>Work</span>
                                </Link>
                            </li>
                        </ul>
                    </li>
                    <li className="col-start-2 row-start-1 min-[600px]:ml-auto md:col-start-3 md:my-auto">
                        <ul className="h-full">
                            <li className="hidden my-auto min-[600px]:inline">
                                <div
                                    className={`flex gap-1 ${lastik.className} text-xl font-bold`}
                                >
                                    <a
                                        href="mailto:hey@jonothan.dev"
                                        className="inline-block text-fuchsia-700 bg-orange-100 text-base px-3 py-1.5 rounded-l-lg transition-all outline outline-2 outline-transparent outline-offset-0 hover:outline-orange-100 hover:outline-offset-4 focus-visible:outline-orange-100 focus-visible:outline-offset-4 hover:z-10"
                                        aria-label="Email me at hey@jonothan.dev"
                                    >
                                        hey@jonothan.dev
                                    </a>
                                    <button
                                        aria-label="Copy my email"
                                        className="inline-block bg-orange-100 text-lg px-3 py-auto rounded-r-lg transition-all outline outline-2 outline-transparent outline-offset-0 hover:outline-orange-100 hover:outline-offset-4 focus-visible:outline-orange-100 focus-visible:outline-offset-4"
                                        onClick={() => {
                                            navigator.clipboard.writeText(
                                                "hey@jonothan.dev"
                                            );
                                            setCopied(true);
                                            setTimeout(() => {
                                                setCopied(false);
                                            }, 5000);
                                        }}
                                    >
                                        {copied ? (
                                            <ClipboardDocumentCheckIcon className="h-5 w-5 text-fuchsia-700" />
                                        ) : (
                                            <ClipboardIcon className="h-5 w-5 text-fuchsia-700" />
                                        )}
                                    </button>
                                </div>
                            </li>
                            <li className="min-[600px]:hidden p-2 text-base bg-orange-100 text-fuchsia-700 rounded-lg">
                                <a
                                    href="mailto:hey@jonothan.dev"
                                    aria-label="Email me at hey@jonothan.dev"
                                >
                                    <AtSymbolIcon className="h-6 w-6 text-fuchsia-700" />
                                </a>
                            </li>
                        </ul>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;
