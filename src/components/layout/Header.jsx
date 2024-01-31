import { Link, useLocation } from "react-router-dom";

import { SparklesIcon } from "@heroicons/react/24/solid";

const Header = (titleVisible) => {
    return (
        <header className="min-w-[350px] max-w-screen-xl flex flex-wrap justify-between items-center top-[20px] xl:mx-auto left-[20px] right-[20px] sticky z-20">
            <nav className="mx-[20px] px-4 py-4 md:px-6 md:py-4 pt-3 md:pt-4 w-full rounded-xl bg-[rgba(255,_182,_254,_0.8)] backdrop-blur-2xl [transition:0.4s_background-color_ease]">
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
                        <h1
                            className="text-primary inline-block font-bold text-[1.4rem] uppercase tracking-[.2rem] opacity-0 [transition:0.4s_all_ease]"
                            style={{ opacity: titleVisible ? "1.0" : "0.0" }}
                        >
                            Jonothan
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
                                    to={"/"}
                                    className={`px-4 py-2 w-full rounded-lg text-lg whitespace-nowrap transition-all outline outline-2 outline-transparent outline-offset-0 hover:outline-primary hover:outline-offset-4 focus-visible:outline-primary focus-visible:outline-offset-4
                                    ${
                                        location.pathname == "/"
                                            ? "bg-primary/70 text-secondary font-bold"
                                            : "bg-secondary/70 text-primary"
                                    }     
                                    `}
                                    aria-label="Navigate to my latest work"
                                >
                                    <div
                                        className={`inline-block h-3 rounded-full animate-pulse transition-all ${
                                            location.pathname == "/"
                                                ? "bg-secondary mr-2 w-3"
                                                : "bg-transparent mr-0 w-0"
                                        }     `}
                                    />
                                    <span>Latest</span>
                                </Link>
                            </li>
                            <li className={`flex-1 text-center my-auto flex`}>
                                <Link
                                    to={"/make"}
                                    className={`relative px-4 py-2 w-full rounded-lg text-lg whitespace-nowrap transition-all outline outline-2 outline-transparent outline-offset-0 hover:outline-primary hover:outline-offset-4  focus-visible:outline-primary focus-visible:outline-offset-4
                                    ${
                                        location.pathname == "/make"
                                            ? "bg-primary/70 text-secondary font-bold"
                                            : "bg-secondary/70 text-primary"
                                    }     
                                    `}
                                    aria-label="Navigate to AR Effects"
                                >
                                    <SparklesIcon
                                        className={`inline-block text-secondary mb-1 transition-all
                                    ${
                                        location.pathname == "/make"
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
                        md:col-start-3 md:my-auto md:pb-2
                    
                    "
                    >
                        <ul>
                            <li className="hidden min-[450px]:inline">
                                <a
                                    href="mailto:hey@jonothan.dev"
                                    className="text-lg py-4 text-primary underline decoration-primary decoration-1 hover:decoration-2 underline-offset-8"
                                    aria-label="Email me at hey@jonothan.dev"
                                >
                                    hey@jonothan.dev
                                </a>
                            </li>

                            <li className="min-[450px]:hidden w-[2rem] padding-0 text-lg text-primary ">
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
            alt="hey@jonothan.dev"
            viewBox="0 0 24 24"
        >
            <path d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z" />
        </svg>
    );
}

function MobileGitHubIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            alt="GitHub"
            viewBox="0 0 24 24"
        >
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
    );
}

export default Header;
