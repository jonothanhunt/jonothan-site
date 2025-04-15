"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import localFont from "next/font/local";
// import Header from "./Header";
import Model from "./Model";
import {
  EffectComposer,
  N8AO,
} from "@react-three/postprocessing";
// import { RetroEffect } from "./RetroEffect";
import Link from "next/link";
import projects from "../data/projects";
import Card from "./Card";
import ModelLoader from "./ModelLoader";

const lastik = localFont({
  src: "../fonts/Lastik.woff2",
  display: "swap",
});

interface RetroProps {
  onLoadingProgress: (progress: number) => void;
  onLoadingComplete: () => void;
}

const Retro: React.FC<RetroProps> = ({
  onLoadingProgress,
  onLoadingComplete,
}) => {
  return (
    <>
      <Model
        onLoadingProgress={onLoadingProgress}
        onLoadingComplete={onLoadingComplete}
      />
      <EffectComposer>
        <N8AO
          quality="performance"
          aoRadius={100}
          distanceFalloff={0.4}
          intensity={4}
          screenSpaceRadius
          color={[0.6, 0.0, 0.8]}
        />
        {/* <ChromaticAberration
          offset={[0.001, 0.00002]} // color offset
        /> */}
        {/* <RetroEffect /> */}
      </EffectComposer>
    </>
  );
};

export default function HomePage() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [windowHeight, setWindowHeight] = useState(0);
  const [eventSource, setEventSource] = useState<HTMLElement | null>(null);

  // Add loading state
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [modelLoaded, setModelLoaded] = useState(false);

  // Use the document/window as the scroll container instead of a ref
  const { scrollY } = useScroll();

  // Calculate opacity based on window height
  const opacity = useTransform(scrollY, [0, windowHeight * 0.5], [1, 0.1]);

  const blur = useTransform(
    scrollY,
    [windowHeight * 0.5, windowHeight],
    ["blur(0px)", "blur(10px)"]
  );

  // Handle loading progress
  const handleLoadingProgress = (progress: number) => {
    setLoadingProgress(progress);
  };

  // Handle loading complete
  const handleLoadingComplete = () => {
    // Hide the loader
    setIsLoading(false);

    // Set modelLoaded to true to trigger the animation
    setTimeout(() => {
      setModelLoaded(true);
    }, 100); // Small delay to ensure the loader is gone first
  };

  // Set up window height after component mounts
  useEffect(() => {
    // Set initial window height
    setWindowHeight(window.innerHeight);

    // Update window height on resize
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Only set the event source if we're in the browser
    if (typeof document !== "undefined") {
      setEventSource(document.documentElement);
    }

    // Check if there's a hash in the URL
    if (window.location.hash === "#about") {
      const aboutSection = document.getElementById("about");
      if (aboutSection) {
        setTimeout(() => {
          aboutSection.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, []);

  return (
    <>
      {/* Simple loading indicator */}
      <AnimatePresence>
        {isLoading && <ModelLoader progress={loadingProgress} />}
      </AnimatePresence>

      <motion.div
        ref={canvasRef}
        className="-z-10 fixed top-0 left-0 w-screen h-screen"
        initial={{ opacity: 0 }}
        animate={{
          opacity: modelLoaded ? 1 : 0,
        }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <motion.div
          style={{
            opacity,
            width: "100%",
            height: "100%",
            filter: blur,
          }}
        >
          <Canvas
            eventSource={eventSource || undefined}
            eventPrefix="client"
            dpr={[1.0, 1.0]}
            orthographic
            camera={{
              zoom: 550,
              near: 0.1,
              far: 1000,
              position: [-1.65, 1.6, 3.5],
              rotation: [-0.4, -0.408, -0.1],
            }}
          >
            <Suspense fallback={null}>
              <ambientLight intensity={0.1} />
              <directionalLight position={[0, 10, 5]} intensity={3.2} />
              <Retro
                onLoadingProgress={handleLoadingProgress}
                onLoadingComplete={handleLoadingComplete}
              />
            </Suspense>
          </Canvas>
        </motion.div>
      </motion.div>

      <div className="scroll-smooth">
        <div className="h-screen" />
        <div id="about" className="max-w-3xl mx-auto px-8 flex flex-col">
          <h2 className={`${lastik.className} text-7xl`}>
            Hey, I&apos;m
            <br /> Jonothan.
          </h2>
          <div className="h-10" />
          <div className="text-md sm:text-lg md:text-xl flex flex-col gap-8 text-pretty">
            <p>
              I am a creative developer and technologist, passionate about
              creating experiences using emerging technologies for brands across
              a variety of mediums.
            </p>
            <p className="leading-[250%] md:leading-[240%]">
              It could be an{" "}
              <Link
                href="#hsbc-vault"
                className="bg-orange-100 transition-all duration-150 outline-2 outline-transparent outline-offset-0 hover:outline-orange-100 hover:outline-offset-4 focus-visible:outline-orange-100 focus-visible:outline-offset-4 text-fuchsia-700 px-3 py-2 rounded-sm whitespace-nowrap"
              >
                interactive vault in Waterloo station
              </Link>{" "}
              , <br /> an{" "}
              <Link
                href="#waiting-to-live-organ-donation-campaign"
                className="bg-orange-100 transition-all duration-150 outline-2 outline-transparent outline-offset-0 hover:outline-orange-100 hover:outline-offset-4 focus-visible:outline-orange-100 focus-visible:outline-offset-4 text-fuchsia-700 px-3 py-2 rounded-sm whitespace-nowrap"
              >
                NHS site to encourage organ donation
              </Link>{" "}
              , or an{" "}
              <Link
                href="#magpie-mentorship-app"
                className="bg-orange-100 transition-all duration-150 outline-2 outline-transparent outline-offset-0 hover:outline-orange-100 hover:outline-offset-4 focus-visible:outline-orange-100 focus-visible:outline-offset-4 text-fuchsia-700 px-3 py-2 rounded-sm whitespace-nowrap"
              >
                award winning mentorship app
              </Link>{" "}
              or{" "}
              <Link
                href="#7-billion-views-on-videos-using-ar-effects-i-made-on-tiktok"
                className="bg-orange-100 transition-all duration-150 outline-2 outline-transparent outline-offset-0 hover:outline-orange-100 hover:outline-offset-4 focus-visible:outline-orange-100 focus-visible:outline-offset-4 text-fuchsia-700 px-3 py-2 rounded-sm whitespace-nowrap"
              >
                a series of viral TikTok games
              </Link>{" "}
              .
            </p>
            <p>
              I&apos;m currently in the UK, leading our Creative Tech Studio at
              VML.
            </p>
            <p>
              I&apos;m always down to chat about exciting projects, especially
              immersive web (WebGL, shaders) and augmented reality (webAR, Snap
              Lenses, TikTok effects) or anything else that pushes the
              boundaries of what is possible with technology!
            </p>
          </div>
          <div className="h-20" />
          <h2 id="work" className={`${lastik.className} text-8xl`}>
            Work
          </h2>
          <div className="h-10" />
        </div>
        <div className="max-w-screen-xl mx-auto px-8 flex flex-col">
          <div className="w-full mt-4 mb-7 flex flex-wrap justify-center gap-8 mx-auto">
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
      </div>

      <footer className="h-30" />
    </>
  );
}
