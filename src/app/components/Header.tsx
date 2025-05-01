"use client";
import { useState, useLayoutEffect, useEffect } from "react";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { AtSymbolIcon, HomeIcon } from "@heroicons/react/24/outline";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import {
  ClipboardIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import localFont from "next/font/local";

const lastik = localFont({
  src: "../fonts/Lastik.woff2",
  display: "swap",
});

type Section = "home" | "about" | "work" | "blog";

const Header = () => {
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState<Section | undefined>(
    undefined
  );
  const [lastPushedSection, setLastPushedSection] = useState<Section | undefined>(undefined);
  const [isSubdomain, setIsSubdomain] = useState(false);
  const [mainDomain, setMainDomain] = useState("");
  const [blogDomain, setBlogDomain] = useState("");
  const [currentSubdomain, setCurrentSubdomain] = useState("");

  // Add debounce function with proper typing
  const debounce = <T extends (...args: never[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void => {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: Parameters<T>) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  useLayoutEffect(() => {
    const host = window.location.host; // This includes port if present
    const hostWithoutPort = host.split(":")[0]; // Just the hostname without port
    const hostParts = hostWithoutPort.split(".");
    const port = window.location.port ? `:${window.location.port}` : "";

    // Determine if we're on a subdomain
    const isOnSubdomain =
      hostParts.length > 2 ||
      (hostParts.length === 2 &&
        !["com", "net", "org", "io", "dev"].includes(hostParts[1])) ||
      (hostParts.length === 2 && hostParts[0] !== "www");

    setIsSubdomain(isOnSubdomain);

    // Extract the current subdomain if any
    if (isOnSubdomain) {
      setCurrentSubdomain(hostParts[0]);
    }

    // Determine the main domain and blog domain with proper port handling
    if (hostParts.includes("lvh") || hostParts.includes("localhost")) {
      // Local development with lvh.me or localhost
      if (hostParts.includes("lvh")) {
        // For lvh.me
        setMainDomain(`${window.location.protocol}//lvh.me${port}`);
        setBlogDomain(`${window.location.protocol}//blog.lvh.me${port}`);
      } else {
        // For localhost
        setMainDomain(`${window.location.protocol}//localhost${port}`);
        setBlogDomain(`${window.location.protocol}//blog.localhost${port}`);
      }
    } else {
      // Production environment
      // Get the last two parts of the domain (e.g., "jonothan.dev")
      const mainDomainParts = hostParts.slice(-2);
      const domain = mainDomainParts.join(".");
      setMainDomain(`${window.location.protocol}//${domain}${port}`);
      setBlogDomain(`${window.location.protocol}//blog.${domain}${port}`);
    }

    // Determine the active section based on the subdomain
    if (isOnSubdomain && hostParts[0] === "blog") {
      setActiveSection("blog");
      return;
    }

    // Handle hash-based navigation for main site
    if (window.location.hash === "#about") {
      setActiveSection("about");
    } else if (window.location.hash === "#work") {
      setActiveSection("work");
    } else {
      setActiveSection("home");
    }
  }, []); // Empty dependency array ensures this runs only on mount

  // Handle scroll behavior for home site (not affecting blog)
  useEffect(() => {
    if (isSubdomain) return; // Don't apply scroll behavior on subdomains

    const handleScroll = debounce(() => {
      const scrollY = window.scrollY;
      const offset = 100;

      const aboutSection = document.getElementById("about");
      const workSection = document.getElementById("work");

      if (aboutSection && workSection) {
        const aboutTop = aboutSection.offsetTop - offset;
        const workTop = workSection.offsetTop - offset;

        let newSection: Section;
        if (scrollY >= workTop) {
          newSection = "work";
        } else if (scrollY >= aboutTop) {
          newSection = "about";
        } else {
          newSection = "home";
        }

        setActiveSection(newSection);
        
        // Only update URL if the section has changed
        if (newSection !== lastPushedSection) {
          setLastPushedSection(newSection);
          const path = newSection === "home" ? "/" : `/#${newSection}`;
          window.history.pushState(null, '', path);
        }
      }
    }, 100); // Debounce for 100ms

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isSubdomain, lastPushedSection]);

  // Handle smooth scrolling navigation
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string, section: Section) => {
    // If we're not on the main page, let the normal navigation happen
    if (window.location.pathname !== '/') {
      return;
    }

    e.preventDefault();
    setActiveSection(section);
    setLastPushedSection(section);

    // Update URL and let browser handle scrolling
    if (targetId) {
      window.history.pushState(null, '', `#${targetId}`);
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.history.pushState(null, '', '/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Helper function to determine button styling based on section
  const getButtonStyles = (section: Section) => {
    if (activeSection === undefined) {
      return "bg-fuchsia-700 text-orange-100";
    }

    return activeSection === section
      ? "bg-orange-100/90 backdrop-blur-lg text-fuchsia-700"
      : "bg-fuchsia-700 text-orange-100";
  };

  // Helper function for icon visibility
  const getIconStyles = (section: Section) => {
    if (activeSection === undefined) {
      return "h-0 w-0 mr-0";
    }

    return activeSection === section ? "h-4 w-4 mr-2" : "h-0 w-0 mr-0";
  };

  // For debugging in development
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("Current subdomain:", currentSubdomain);
      console.log("Main domain:", mainDomain);
      console.log("Blog domain:", blogDomain);
    }
  }, [currentSubdomain, mainDomain, blogDomain]);

  return (
    <header className="w-screen flex flex-wrap justify-between items-center sticky top-0 z-20">
      {/* Header background and styling remains the same */}
      <div
        className="fixed top-0 left-0 w-full h-screen pointer-events-none -z-10"
        style={{
          background: "linear-gradient(100deg, #731f96, #ad452b)",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,1) 20px, rgba(0,0,0,0) 200px)",
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,1) 20px, rgba(0,0,0,0) 200px)",
        }}
      />
      <div className="fixed top-0 left-0 w-full h-28 pointer-events-none -z-10">
        {Array.from({ length: 15 }).map((_, i) => {
          const blurMax = 15;
          const blurAmount = blurMax - (i / 15) * blurMax;

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
      </div>
      <nav className="w-full p-4">
        <ul className="flex justify-between items-center gap-6 md:p-0">
          <li className="col-start-1 row-start-1">
            <h1
              className={`text-4xl tracking-tight flex relative ${lastik.className} min-w-[40px] justify-center md:justify-start`}
            >
              <span className="">J</span>
              <span className="hidden min-[1000px]:inline">onothan.dev</span>
            </h1>
          </li>
          <li className="col-span-2 col-start-1 row-start-2 md:col-span-1 md:col-start-2 md:row-start-1">
            {/* Navigation menu */}
            <ul className="flex gap-0 md:gap-3 h-full">
              <li className="flex-1 text-center flex">
                <a
                  href={isSubdomain ? mainDomain : "/"}
                  onClick={(e) => handleSmoothScroll(e, "", "home")}
                  className={`${
                    lastik.className
                  } h-10 font-bold text-sm md:text-base italic px-6 md:px-3 py-2 w-full rounded-l-lg md:rounded-r-lg whitespace-nowrap transition-all outline-2 outline-transparent outline-offset-0 hover:outline-orange-100 hover:outline-offset-4 focus-visible:outline-orange-100 focus-visible:outline-offset-4 flex items-center justify-center ${getButtonStyles(
                    "home"
                  )}`}
                  aria-label="Navigate to home"
                >
                  <HomeIcon
                    className={`text-fuchsia-700 transition-all ${getIconStyles(
                      "home"
                    )}`}
                  />
                  <span>Home</span>
                </a>
              </li>
              <li className="flex-1 text-center flex">
                <a
                  href={isSubdomain ? `${mainDomain}/#about` : "/#about"}
                  onClick={(e) => handleSmoothScroll(e, "about", "about")}
                  className={`${
                    lastik.className
                  } h-10 font-bold text-sm md:text-base italic relative px-6 md:px-3 py-2 w-full rounded-none md:rounded-lg whitespace-nowrap transition-all outline-2 outline-transparent outline-offset-0 hover:outline-orange-100 hover:outline-offset-4 focus-visible:outline-orange-100 focus-visible:outline-offset-4 flex items-center justify-center ${getButtonStyles(
                    "about"
                  )}`}
                  aria-label="Navigate to About section"
                >
                  <QuestionMarkCircleIcon
                    className={`text-fuchsia-700 transition-all ${getIconStyles(
                      "about"
                    )}`}
                  />
                  <span>About</span>
                </a>
              </li>
              <li className="flex-1 text-center flex">
                <a
                  href={isSubdomain ? `${mainDomain}/#work` : "/#work"}
                  onClick={(e) => handleSmoothScroll(e, "work", "work")}
                  className={`${
                    lastik.className
                  } h-10 font-bold text-sm md:text-base italic relative px-6 md:px-3 py-2 w-full rounded-r-lg md:rounded-l-lg whitespace-nowrap transition-all outline-2 outline-transparent outline-offset-0 hover:outline-orange-100 hover:outline-offset-4 focus-visible:outline-orange-100 focus-visible:outline-offset-4 flex items-center justify-center ${getButtonStyles(
                    "work"
                  )}`}
                  aria-label="Navigate to Work section"
                >
                  <SparklesIcon
                    className={`text-fuchsia-700 transition-all ${getIconStyles(
                      "work"
                    )}`}
                  />
                  <span>Work</span>
                </a>
              </li>
            </ul>
          </li>
          <li className="col-start-2 row-start-1 min-[600px]:ml-auto md:col-start-3 md:my-auto">
            <ul className="h-full">
              <li className="hidden my-auto min-[600px]:inline">
                <div
                  className={`flex gap-1 ${lastik.className} text-xl font-bold h-full`}
                >
                  <a
                    href="mailto:hey@jonothan.dev"
                    className="inline-flex items-center text-fuchsia-700 bg-orange-100 text-base px-3 py-2 rounded-l-lg transition-all outline outline-2 outline-transparent outline-offset-0 hover:outline-orange-100 hover:outline-offset-4 focus-visible:outline-orange-100 focus-visible:outline-offset-4 hover:z-10"
                    aria-label="Email me at hey@jonothan.dev"
                  >
                    hey@jonothan.dev
                  </a>
                  <button
                    aria-label="Copy my email"
                    className="inline-flex items-center justify-center bg-orange-100 px-3 py-2 rounded-r-lg transition-all outline outline-2 outline-transparent outline-offset-0 hover:outline-orange-100 hover:outline-offset-4 focus-visible:outline-orange-100 focus-visible:outline-offset-4"
                    onClick={() => {
                      navigator.clipboard.writeText("hey@jonothan.dev");
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
              <li className="min-[600px]:hidden">
                <a
                  href="mailto:hey@jonothan.dev"
                  className="inline-flex items-center justify-center p-2 bg-orange-100 text-fuchsia-700 rounded-lg h-full"
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
