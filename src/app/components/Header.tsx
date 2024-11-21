"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { SparklesIcon } from "@heroicons/react/24/solid";
import { ClipboardIcon } from "@heroicons/react/24/outline";
import { ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline";

const Header = () => {
    const pathname = usePathname();
    const [copied, setCopied] = useState(false);
    return (
        <header className="min-w-[350px] max-w-screen-xl flex flex-wrap justify-between items-center top-[20px] xl:mx-auto left-[20px] right-[20px] sticky z-20">
            <nav className="mx-[20px] px-4 py-4 md:px-4 md:py-4 pt-3 md:pt-4 w-full rounded-xl bg-amber-600/40 dark:bg-yellow-900/40 backdrop-blur-2xl [transition:0.4s_background-color_ease]">
                <ul
                    className="
                    w-full grid grid-cols-auto grid-rows-2
                    md:grid md:grid-cols-[160px_300px_auto] md:grid-rows-1 md:gap-4
                "
                >
                    {/* grid grid-cols-3 grid-rows-1 gap-4 */}
                    <li
                        className="
                        col-start-1 row-start-1
                        md:my-auto
                    "
                    >
                        {/* <h1 className="text-zinc-800 inline-block font-bold text-[1.4rem] uppercase tracking-[.2rem] [transition:0.4s_all_ease]">
                            Jonothan
                        </h1> */}
                        <h1 className="text-zinc-800 dark:text-amber-200 inline-block font-bold text-[1.4rem] [transition:0.4s_all_ease]">
                            Jonothan.dev
                        </h1>
                    </li>
                    <li
                        className="
                        col-span-2 col-start-1 row-start-2
                        md:col-span-1 md:col-start-2 md:row-start-1
                    
                    "
                    >
                        <ul className="flex gap-4 h-full">
                            <li className={`flex-1 text-center my-auto flex`}>
                                <Link
                                    href={"/"}
                                    className={`px-4 py-2 w-full rounded-lg text-lg whitespace-nowrap transition-all outline outline-2 outline-transparent outline-offset-0 hover:outline-zinc-800 dark:hover:outline-amber-200 hover:outline-offset-4 focus-visible:outline-zinc-800 dark:focus-visible:outline-amber-200 focus-visible:outline-offset-4
                                    ${
                                        pathname == "/"
                                            ? "bg-zinc-800 text-amber-200 dark:bg-amber-200 dark:text-zinc-800 font-bold"
                                            : "bg-amber-200 text-zinc-800 dark:bg-zinc-800 dark:text-amber-200"
                                    }     
                                    `}
                                    aria-label="Navigate to my latest work"
                                >
                                    <div
                                        className={`inline-block h-3 rounded-full animate-pulse transition-all ${
                                            pathname == "/"
                                                ? "bg-amber-200 dark:bg-zinc-800 mr-2 w-3"
                                                : "bg-transparent mr-0 w-0"
                                        }     `}
                                    />
                                    <span>Latest</span>
                                </Link>
                            </li>
                            <li className={`flex-1 text-center my-auto flex`}>
                                <Link
                                    href={"/make"}
                                    className={`relative px-4 py-2 w-full rounded-lg text-lg whitespace-nowrap transition-all outline outline-2 outline-transparent outline-offset-0 hover:outline-zinc-800 dark:hover:outline-amber-200 hover:outline-offset-4 focus-visible:outline-zinc-800 dark:focus-visible:outline-amber-200 focus-visible:outline-offset-4
                                    ${
                                        pathname == "/make"
                                            ? "bg-zinc-800 text-amber-200 dark:bg-amber-200 dark:text-zinc-800 font-bold"
                                            : "bg-amber-200 text-zinc-800 dark:bg-zinc-800 dark:text-amber-200"
                                    }     
                                    `}
                                    aria-label="Navigate to AR Effects"
                                >
                                    <SparklesIcon
                                        className={`inline-block text-amber-200 dark:text-zinc-800 mb-1 transition-all
                                    ${
                                        pathname == "/make"
                                            ? "h-5 w-5 mr-2"
                                            : "h-0 w-0 mr-0"
                                    }
                                    `}
                                    />
                                    <span>AR effects</span>
                                </Link>
                            </li>
                        </ul>
                    </li>
                    <li
                        className="
                        col-start-2 row-start-1 ml-auto
                        md:col-start-3 md:my-auto
                    
                    "
                    >
                        <ul className="h-full">
                            <li className="hidden my-auto min-[830px]:inline">
                                <div className="flex gap-1">
                                    <a
                                        href="mailto:hey@jonothan.dev"
                                        className="inline-block text-zinc-800 bg-amber-200 text-lg px-4 py-2 rounded-l-lg transition-all outline outline-2 outline-transparent outline-offset-0 hover:outline-zinc-800 dark:hover:outline-amber-200 hover:outline-offset-4 focus-visible:outline-zinc-800 dark:focus-visible:outline-amber-200 focus-visible:outline-offset-4 hover:z-10"
                                        aria-label="Email me at hey@jonothan.dev"
                                    >
                                        hey@jonothan.dev
                                    </a>
                                    <button
                                        aria-label="Copy my email"
                                        className="inline-block bg-amber-200 text-xl px-4 py-auto rounded-r-lg transition-all outline outline-2 outline-transparent outline-offset-0 hover:outline-zinc-800 dark:hover:outline-amber-200 hover:outline-offset-4 focus-visible:outline-zinc-800 dark:focus-visible:outline-amber-200 focus-visible:outline-offset-4"
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
                                            <ClipboardDocumentCheckIcon className="h-6 w-6 text-zinc-800" />
                                        ) : (
                                            <ClipboardIcon className="h-6 w-6 text-zinc-800" />
                                        )}
                                    </button>
                                </div>
                            </li>

                            <li className="min-[830px]:hidden w-[2rem] padding-0 text-lg text-zinc-800">
                                <a
                                    href="mailto:hey@jonothan.dev"
                                    aria-label="Email me at hey@jonothan.dev"
                                >
                                    <MobileEmailIcon />
                                </a>
                            </li>
                        </ul>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

function MobileEmailIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            // alt="hey@jonothan.dev"
            viewBox="0 0 24 24"
            className="fill-zinc-800 dark:fill-amber-200"
        >
            <path d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z" />
        </svg>
    );
}

export default Header;
