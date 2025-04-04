"use client";
import { useEffect, useRef, useState } from "react";
// import { usePathname, useRouter } from "next/navigation";
import { motion, useScroll, useTransform } from "motion/react";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import localFont from "next/font/local";
import Header from "./Header";
import Model from "./Model";
import { EffectComposer, N8AO } from "@react-three/postprocessing";
import { RetroEffect } from "./RetroEffect";
import Link from "next/link";
import projects from "../data/projects";
import Card from "./Card";

const lastik = localFont({
    src: "../fonts/Lastik.woff2",
    display: "swap",
});

const Retro = () => {
    return (
        <>
            <Model />
            <EffectComposer>
                <N8AO
                    quality="performance"
                    aoRadius={100}
                    distanceFalloff={0.4}
                    intensity={2}
                    screenSpaceRadius
                    // halfRes
                    color={[0.6, 0.0, 0.8]}
                />
                <RetroEffect />
            </EffectComposer>
        </>
    );
};

export default function HomePage() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    // const pathname = usePathname();
    // const router = useRouter();
    const [eventSource, setEventSource] = useState<HTMLElement | null>(null);
    const [windowHeight, setWindowHeight] = useState(0);

    // Get raw scroll value instead of progress
    const { scrollY } = useScroll({ container: scrollRef });

    // Calculate opacity based on window height
    const opacity = useTransform(
        scrollY,
        [0, windowHeight * 0.5], // Transition starts at 0 and ends at half window height
        [1, 0.1]
    );

    // Set up event source and window height after component mounts
    useEffect(() => {
        if (scrollRef.current) {
            setEventSource(scrollRef.current);
        }

        // Set initial window height
        setWindowHeight(window.innerHeight);

        // Update window height on resize
        const handleResize = () => {
            setWindowHeight(window.innerHeight);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Handle hash-based navigation
    useEffect(() => {
        if (!scrollRef.current) return;

        // Check if there's a hash in the URL
        if (window.location.hash === "#about") {
            const aboutSection = document.getElementById("about");
            if (aboutSection) {
                setTimeout(() => {
                    scrollRef.current?.scrollTo({
                        top: aboutSection.offsetTop,
                        behavior: "smooth",
                    });
                }, 100);
            }
        }
    }, []);

    return (
        <>
            <motion.div
                ref={canvasRef}
                className="-z-10 fixed top-0 left-0 w-screen h-screen"
                style={{
                    opacity,
                }}
            >
                {eventSource && (
                    <Canvas
                        eventSource={eventSource}
                        eventPrefix="client"
                        shadows
                        dpr={[1, 1]}
                        orthographic
                        camera={{
                            zoom: 550,
                            near: 0.1,
                            far: 1000,
                            // fov: 20,
                            position: [-1.65, 1.6, 3.5],
                            rotation: [-0.4, -0.4, -0.1],
                        }}
                    >
                        <Suspense fallback="Loading">
                            <ambientLight intensity={0.1} />
                            <directionalLight
                                position={[0, 10, 5]}
                                intensity={3.2}
                            />
                            <Retro />
                        </Suspense>
                    </Canvas>
                )}
            </motion.div>
            <main
                ref={scrollRef}
                id="main-scroll-container"
                className="main-scroll-container scroll-smooth fixed top-0 left-0 h-screen w-screen overflow-y-scroll"
                style={{
                    maskImage:
                        "linear-gradient(to bottom, rgba(0,0,0,0) 5%, rgba(0,0,0,1) 20%)",
                    WebkitMaskImage:
                        "linear-gradient(to bottom, rgba(0,0,0,0) 5%, rgba(0,0,0,1) 20%)",
                }}
            >
                <div className="h-screen" />
                <div
                    id="about"
                    className="max-w-3xl mx-auto px-8 flex flex-col"
                >
                    <h2 className={`${lastik.className} text-7xl`}>
                        Hey, I&apos;m
                        <br /> Jonothan.
                    </h2>
                    <div className="h-10" />
                    <div className="text-md sm:text-lg md:text-xl flex flex-col gap-8 text-pretty">
                        <p>
                            I am a creative developer and technologist,
                            passionate about creating experiences using emerging
                            technologies for brands across a variety of mediums.
                        </p>
                        <p className="leading-[250%] md:leading-[220%]">
                            It could be an{" "}
                            <Link
                                href="#hsbc-vault"
                                className="bg-orange-100 text-fuchsia-700 px-3 py-2 rounded-sm whitespace-nowrap"
                            >
                                interactive vault in Waterloo station
                            </Link>{" "}
                            , <br /> an{" "}
                            <Link
                                href="#waiting-to-live-organ-donation-campaign"
                                className="bg-orange-100 text-fuchsia-700 px-3 py-2 rounded-sm whitespace-nowrap"
                            >
                                NHS site to encourage organ donation
                            </Link>{" "}
                            , or an{" "}
                            <Link
                                href="#magpie-mentorship-app"
                                className="bg-orange-100 text-fuchsia-700 px-3 py-2 rounded-sm whitespace-nowrap"
                            >
                                award winning mentorship app
                            </Link>{" "}
                            or{" "}
                            <Link
                                href="#tiktok-effect-house-gallery"
                                className="bg-orange-100 text-fuchsia-700 px-3 py-2 rounded-sm whitespace-nowrap"
                            >
                                a series of viral TikTok games
                            </Link>{" "}
                            .
                        </p>
                        <p>
                            I&apos;m currently in the UK, leading our Creative
                            Tech Studio at VML.
                        </p>
                        <p>
                            I&apos;m always down to chat about exciting
                            projects, especially immersive web (WebGL, shaders)
                            and augmented reality (webAR, Snap Lenses, TikTok
                            effects) or anything else that pushes the boundaries
                            of what is possible with technology!
                        </p>
                        {/* <p className={`${lastik.className} text-3xl italic`}>Jonothan</p> */}
                    </div>
                    <div className="h-20" />
                    <h2 className={`${lastik.className} text-8xl`}>Work</h2>
                    <div className="h-10" />
                </div>
                <div
                    id="work"
                    className="max-w-screen-2xl mx-auto px-8 flex flex-col"
                >
                    <div className="mt-4 mb-7 flex flex-wrap justify-center gap-8  mx-auto">
                        {projects.map((project, index) => (
                            <Card
                                key={"project_" + index}
                                tags={project.tags}
                                image={project.image}
                                title={project.title}
                                description={project.description}
                                links={project.links}
                            />
                        ))}
                    </div>
                </div>
            </main>

            <div className={`fixed top-0 left-0`}>
                <Header scrollContainerRef={scrollRef} />
            </div>
        </>
    );
}
