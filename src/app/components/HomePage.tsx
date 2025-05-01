"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import localFont from "next/font/local";
import Model from "./Model";
import {
EffectComposer,
N8AO,
} from "@react-three/postprocessing";
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
    </EffectComposer>
  </>
);
};

// Create a global variable to track if the canvas has been initialized
// This will persist across navigation events
let canvasInitialized = false;

export default function HomePage() {
const canvasRef = useRef<HTMLDivElement>(null);
const [windowHeight, setWindowHeight] = useState(0);
const [eventSource, setEventSource] = useState<HTMLElement | null>(null);

// Add loading state
const [loadingProgress, setLoadingProgress] = useState(0);
const [isLoading, setIsLoading] = useState(!canvasInitialized);
const [modelLoaded, setModelLoaded] = useState(canvasInitialized);

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
  if (canvasInitialized) return;
  setLoadingProgress(progress);
};

// Handle loading complete
const handleLoadingComplete = () => {
  if (canvasInitialized) return;
  
  // Hide the loader
  setIsLoading(false);
  
  // Mark canvas as initialized
  canvasInitialized = true;

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

  // If canvas is already initialized, update state
  if (canvasInitialized && isLoading) {
    setIsLoading(false);
    setModelLoaded(true);
  }

  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, [isLoading]);

useEffect(() => {
  // Only set the event source if we're in the browser
  if (typeof document !== "undefined") {
    setEventSource(document.documentElement);
  }

  // Check if there's a hash in the URL
  if (window.location.hash) {
    const sectionId = window.location.hash.substring(1);
    const section = document.getElementById(sectionId);
    if (section) {
      setTimeout(() => {
        section.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }
  
  // Add an event listener for popstate to handle browser back/forward navigation
  const handlePopState = () => {
    if (window.location.hash) {
      const sectionId = window.location.hash.substring(1);
      const section = document.getElementById(sectionId);
      if (section) {
        setTimeout(() => {
          section.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } else {
      // If no hash, scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  
  window.addEventListener('popstate', handlePopState);
  return () => window.removeEventListener('popstate', handlePopState);
}, []);

// Handle smooth scrolling without full navigation
const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
  e.preventDefault();
  const sectionId = hash.substring(1);
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: "smooth" });
    // Update URL without full navigation
    window.history.pushState(null, '', hash);
  }
};

// Memoize the Canvas component to prevent unnecessary re-renders
const canvasElement = useMemo(() => (
  <Canvas
    eventSource={eventSource || undefined}
    eventPrefix="client"
    dpr={[0.8, 0.8]}
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
), [eventSource]); // Only recreate when eventSource changes

return (
  <>
    {/* Simple loading indicator */}
    <AnimatePresence>
      {isLoading && !canvasInitialized && <ModelLoader progress={loadingProgress} />}
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
        {/* Use the memoized canvas element */}
        {canvasElement}
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
            <a
              href="#hsbc-vault"
              onClick={(e) => handleSmoothScroll(e, '#hsbc-vault')}
              className="bg-orange-100 transition-all duration-150 outline-2 outline-transparent outline-offset-0 hover:outline-orange-100 hover:outline-offset-4 focus-visible:outline-orange-100 focus-visible:outline-offset-4 text-fuchsia-700 px-3 py-2 rounded-sm whitespace-nowrap"
            >
              interactive vault in Waterloo station
            </a>{" "}
            , <br /> an{" "}
            <a
              href="#waiting-to-live-organ-donation-campaign"
              onClick={(e) => handleSmoothScroll(e, '#waiting-to-live-organ-donation-campaign')}
              className="bg-orange-100 transition-all duration-150 outline-2 outline-transparent outline-offset-0 hover:outline-orange-100 hover:outline-offset-4 focus-visible:outline-orange-100 focus-visible:outline-offset-4 text-fuchsia-700 px-3 py-2 rounded-sm whitespace-nowrap"
            >
              NHS site to encourage organ donation
            </a>{" "}
            , or an{" "}
            <a
              href="#magpie-mentorship-app"
              onClick={(e) => handleSmoothScroll(e, '#magpie-mentorship-app')}
              className="bg-orange-100 transition-all duration-150 outline-2 outline-transparent outline-offset-0 hover:outline-orange-100 hover:outline-offset-4 focus-visible:outline-orange-100 focus-visible:outline-offset-4 text-fuchsia-700 px-3 py-2 rounded-sm whitespace-nowrap"
            >
              award winning mentorship app
            </a>{" "}
            or{" "}
            <a
              href="#7-billion-views-on-videos-using-ar-effects-i-made-on-tiktok"
              onClick={(e) => handleSmoothScroll(e, '#7-billion-views-on-videos-using-ar-effects-i-made-on-tiktok')}
              className="bg-orange-100 transition-all duration-150 outline-2 outline-transparent outline-offset-0 hover:outline-orange-100 hover:outline-offset-4 focus-visible:outline-orange-100 focus-visible:outline-offset-4 text-fuchsia-700 px-3 py-2 rounded-sm whitespace-nowrap"
            >
              a series of viral TikTok games
            </a>{" "}
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
              key={`project_${index}`}
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