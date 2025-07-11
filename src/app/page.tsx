"use client";
import { Canvas } from "@react-three/fiber";
import { Suspense, useRef, useState, useEffect } from "react";
import Model from "../components/Model";
import SplashCursor from "../components/SplashCursor";
import ErrorBoundary from "../components/ErrorBoundary";
import {
  ClipboardIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { EffectComposer, N8AO } from "@react-three/postprocessing";
import Image from "next/image";
import Link from "next/link";

// GSAP imports
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import InfiniteScrollingLogosAnimation from "@/components/InfiniteScrollingLogosAnimation";
import { createGlowEffect } from "@/utils/glowEffect";

// Register the plugins
gsap.registerPlugin(ScrollTrigger, SplitText);

// WebGL detection utility
const isWebGLAvailable = () => {
  try {
    if (typeof window === 'undefined') return true; // SSR check
    
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
};

// Fallback component for 3D section
const WebGL3DFallback = () => (
  <div className="w-full h-[500px] flex items-center justify-center text-center p-4 bg-purple-50 rounded-lg">
    <div className="max-w-md">
      <h2 className="text-xl font-semibold mb-2">3D Experience Not Available</h2>
      <p className="mb-3">Your browser or device doesn&apos;t support WebGL, which is required for the 3D experience.</p>
      <p>Try updating your graphics drivers or using a different browser like Chrome or Edge.</p>
    </div>
  </div>
);

export default function Home() {
  const [copied, setCopied] = useState(false);
  const [webGLSupported, setWebGLSupported] = useState(true);
  const glowHandlers = createGlowEffect();

  useEffect(() => {
    // Check WebGL support on client-side only
    if (typeof window !== 'undefined') {
      setWebGLSupported(isWebGLAvailable());
    }
  }, []);

  // Create refs for all the elements you want to animate
  const canvasRef = useRef(null);
  const campaignRef = useRef(null);
  const hsbcRef = useRef(null);
  const tiktokRef = useRef(null);
  const supermarketRef = useRef(null);
  const magpieRef = useRef(null);
  const awardsRef = useRef(null);

  // Ref for the text container to prevent FOUC
  const textContainerRef = useRef(null);

  // Main container ref for scoping animations
  const mainRef = useRef(null);

  useGSAP(
    () => {
      // First set the container to be visible with GSAP
      gsap.set(textContainerRef.current, { autoAlpha: 1 });

      // Text animations with SplitText using the cleaner onSplit approach
      /* SplitText.create("#heading1", {
        type: "words, chars",
        aria: "auto",
        onSplit(self) {
          gsap.from(self.words, {
            duration: 0.7,
            y: 50,
            opacity: 0,
            rotation: "random(-30, 30)",
            // filter: "blur(4px)",
            stagger: 0.15,
            ease: "back",
            delay: 0.1,
          });
        },
      });

      SplitText.create("#heading2", {
        type: "words, chars",
        aria: "auto",
        onSplit(self) {
          gsap.from(self.words, {
            duration: 0.7,
            y: 50,
            opacity: 0,
            rotation: "random(-30, 30)",
            // filter: "blur(4px)",
            stagger: 0.15,
            ease: "back",
            delay: 0.4,
          });
        },
      });

      SplitText.create("#paragraph", {
        type: "words",
        aria: "auto",
        onSplit(self) {
          gsap.from(self.words, {
            duration: 0.5,
            y: 30,
            opacity: 0,
            // filter: "blur(2px)",
            stagger: 0.03,
            ease: "power2.out",
            delay: 0.8,
          });
        },
      }); */

      // Animate awards
      /* if (awardsRef.current) {
        const awardsLinks = (awardsRef.current as HTMLElement).children;
        gsap.set(awardsRef.current, { autoAlpha: 1 }); // Make visible but still transparent
        gsap.from(awardsLinks, {
          duration: 0.5,
          scale: 0.8,
          opacity: 0,
          y: 20,
          stagger: 0.15,
          ease: "back.out(1.7)",
          delay: 1.6, // Start after paragraph animation
        });
      } */

      // Set initial state for scroll elements
      const elements = [
        canvasRef.current,
        campaignRef.current,
        hsbcRef.current,
        tiktokRef.current,
        supermarketRef.current,
        magpieRef.current,
      ].filter(Boolean);

      gsap.set(elements, {
        y: 50,
        opacity: 0,
        // filter: "blur(4px)",
      });

      // Create animations for each element
      elements.forEach((element) => {
        // Create the ScrollTrigger animation
        gsap.to(element, {
          y: 0,
          opacity: 1,
          // filter: "blur(0px)",
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: element,
            start: "top bottom-=100",
            end: "bottom top+=100",
            toggleActions: "play none none reverse",
            markers: false,
          },
        });
      });
    },
    { scope: mainRef }
  );

  return (
    <>
      <div className="relative font-[family-name:var(--font-hyperlegible)] text-purple-950">
        <div
          className="absolute top-0 left-0 pointer-events-none w-full h-screen crosses"
          aria-hidden="true"
        ></div>
        <SplashCursor />
        <main ref={mainRef}>
          {/* About section */}
          
          <section
            id="about"
            className="relative min-h-[calc(100vh-250px)] w-full flex flex-col items-center py-20 justify-center"
          >
            <div className="h-12"/>
            <div
              ref={textContainerRef}
              className="max-w-xl mx-6 flex flex-col gap-4 invisible"
            >
              <h1 className="font-[family-name:var(--font-lastik)] text-7xl flex flex-col">
                <span id="heading1">Hey, I&apos;m</span>
                <span className="whitespace-nowrap" id="heading2">
                  Jonothan.
                </span>
              </h1>
              <p
                id="paragraph"
                className="text-2xl pr-0 md:pr-12 font-[family-name:var(--font-hyperlegible)] text-pretty"
              >
                I&apos;m a creative developer creating innovative, award-winning
                experiences for brands like HSBC and the NHS, leading our
                Creative Tech Studio at VML in London, UK.
              </p>
              <div
                ref={awardsRef}
                className="w-full flex justify-start items-center gap-4 mt-4"
              >
                <Link href="https://www.lovethework.com/directory/individuals/jono-hunt-750043">
                  <Image
                    src="/images/logos/cannes_lions_logo.svg"
                    alt="Cannes Lions logo"
                    width={200}
                    height={200}
                    className="w-8"
                  />
                </Link>
                <Link
                  href="https://www.dandad.org/profiles/person/202333/jonothan-hunt/"
                  className="relative w-8 mr-2"
                >
                  <Image
                    src="/images/logos/newblood_white_pencil.svg"
                    alt="D&AD New Blood White Pencil"
                    width={200}
                    height={200}
                    className="w-7"
                  />
                  <Image
                    src="/images/logos/dad_logo.svg"
                    alt="D&AD logo"
                    width={200}
                    height={200}
                    className="absolute -bottom-2 -right-2 w-6 z-10"
                  />
                </Link>
                <Link href="https://www.thedrum.com/awards-case-study/inside-wunderman-thompsons-plan-spark-interest-workplace-mentoring-with-magpie">
                  <Image
                    src="/images/logos/the_drum_logo.jpeg"
                    alt="The Drum logo"
                    width={200}
                    height={200}
                    className="w-8"
                  />
                </Link>
              </div>
            </div>
          </section>

          <section
            id="work"
            className="px-4 scroll-mt-20"
            aria-labelledby="work-heading"
          >
            <h2 id="work-heading" className="sr-only">
              My Work
            </h2>
            <div className="relative max-w-6xl mx-auto">
              {/* Logos */}
              <InfiniteScrollingLogosAnimation />
              <div className="h-8" />
              {/* Work with me section */}
              <div className="h-72 bg-purple-50 rounded-4xl relative p-10 flex flex-col justify-center overflow-clip">
                <div className="inset-0 w-full h-full">
                  <Image
                    src="/images/home/work_with_me.webp"
                    alt="Decorative background for contact section"
                    fill
                    priority
                    style={{ objectFit: "cover", objectPosition: "right" }}
                  />
                </div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-purple-950/80 via-purple-950/80 to-transparent bg-cover bg-center" />
                <div className="z-10 flex flex-col gap-4">
                  <h3 className="font-[family-name:var(--font-lastik)] text-4xl text-white">
                    Let&apos;s chat!
                  </h3>
                  <p className="text-white text-lg max-w-96 text-pretty">
                    Book me for a talk or I&apos;m always down to chat about
                    exciting projects, especially immersive web (WebGL, shaders)
                    and mixed reality!
                  </p>
                  <div className="flex items-center">
                    <div className="flex rounded-lg overflow-hidden font-[family-name:var(--font-hyperlegible)]">
                      <Link
                        href="mailto:hey@jonothan.dev"
                        className="inline-flex items-center text-purple-950 bg-purple-50/90 hover:bg-purple-50 active:bg-purple-50 backdrop-blur-[2px] text-base px-3 py-2 transition-all cursor-pointer"
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
                        className="inline-flex items-center justify-center bg-purple-50/90 backdrop-blur-[2px] px-3 py-2 transition-all cursor-pointer hover:bg-purple-50 active:bg-purple-50"
                        onClick={() => {
                          navigator.clipboard.writeText("hey@jonothan.dev");
                          setCopied(true);
                          setTimeout(() => {
                            setCopied(false);
                          }, 1000);
                        }}
                      >
                        {copied ? (
                          <ClipboardDocumentCheckIcon
                            className="h-5 w-5 text-purple-950"
                            aria-hidden="true"
                          />
                        ) : (
                          <ClipboardIcon
                            className="h-5 w-5 text-purple-950"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-4" />

              <div className="relative grid grid-cols-1 md:grid-cols-[1fr_minmax(0,_2fr)_minmax(0,_2fr)_1fr] md:grid-rows-4 gap-4 h-full w-full">
                {/* Canvas */}
                <div
                  ref={canvasRef}
                  className="aspect-square md:aspect-auto col-span-1 md:col-span-3 md:row-span-2 bg-gradient-to-b from-purple-900/50 to-blue-800/50 backdrop-blur-xl rounded-4xl overflow-clip"
                  aria-label="Desk scene in 3D!"
                  role="img"
                >
                  {webGLSupported ? (
                    <ErrorBoundary fallback={<WebGL3DFallback />}>
                      <Canvas
                        onCreated={({ gl }) => {
                          // Add enhanced WebGL error handling
                          const canvas = gl.domElement;
                          canvas.addEventListener('webglcontextlost', (e: Event) => {
                            e.preventDefault();
                            // console.error('WebGL context lost');
                            setWebGLSupported(false);
                          });
                        }}
                        dpr={[1, 1]}
                        orthographic
                        camera={{
                          zoom: 350,
                          near: 0.1,
                          far: 1000,
                          position: [-1.65, 1.6, 3.5],
                          rotation: [-0.42, -0.4, -0.1],
                        }}
                        gl={{
                          alpha: true,
                          antialias: true,
                          premultipliedAlpha: false,
                          failIfMajorPerformanceCaveat: false, // Try to render even with performance issues
                          powerPreference: 'default', // Let browser decide best GPU
                        }}
                        style={{ background: "transparent" }}
                        aria-hidden="true"
                      >
                        <Suspense fallback={null}>
                          <color attach="background" args={["black"]} />
                          <ambientLight intensity={0.1} />
                          <directionalLight position={[0, 10, 5]} intensity={3.2} />
                          <Model canvasRef={canvasRef} />
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
                        </Suspense>
                      </Canvas>
                    </ErrorBoundary>
                  ) : (
                    <WebGL3DFallback />
                  )}
                </div>

                {/* Campaign */}
                <div ref={campaignRef} className="col-span-1 md:col-start-4">
                  <Link
                    href="https://waitingtolive.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="max-h-96 min-h-80 bg-purple-50 rounded-4xl md:aspect-square relative p-4 flex flex-col justify-between overflow-clip transition-all outline-2 outline-transparent outline-offset-0 focus-visible:outline-purple-950 focus-visible:outline-offset-4 hover:cursor-pointer"
                    aria-labelledby="waiting-to-live-title"
                    {...glowHandlers}
                  >
                    <div 
                      className="glow-effect absolute inset-0 rounded-xl pointer-events-none opacity-0 transition-opacity duration-300 z-20"
                      style={{
                        background: 'radial-gradient(circle var(--glow-size, 400px) at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 40%, transparent 70%)'
                      }}
                    />
                    <Image
                      src="/images/home/waiting_to_live.webp"
                      alt="The doll of Ralph sitting on a bench, waiting."
                      fill
                      style={{ objectFit: "cover", objectPosition: "center" }}
                      className="z-0"
                    />
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-purple-950/50 to-purple-950 z-10" />
                    <div className="w-fit px-4 py-2 bg-purple-100/90 backdrop-blur-md rounded-2xl">
                      Campaign
                    </div>
                    <div className="z-10 flex flex-col gap-2">
                      <p
                        id="waiting-to-live-title"
                        className="font-[family-name:var(--font-lastik)] text-2xl text-white"
                      >
                        Waiting to Live
                      </p>
                      <p className="text-white text-md">
                        Our campaign is raising awareness of organ donation for
                        the NHS.
                      </p>
                    </div>
                  </Link>
                </div>

                {/* HSBC Vault */}
                <div
                  ref={hsbcRef}
                  className="col-span-1 md:col-start-4 md:row-start-2"
                >
                  <Link
                    href="https://creative.salon/articles/work/hsbc-vml-everything-s-premier"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="max-h-96 min-h-80 bg-purple-50 rounded-4xl md:aspect-square relative p-4 flex flex-col justify-between overflow-clip transition-all outline-2 outline-transparent outline-offset-0 focus-visible:outline-purple-950 focus-visible:outline-offset-4 hover:cursor-pointer  "
                    aria-labelledby="hsbc-vault-title"
                    {...glowHandlers}
                  >
                    <div 
                      className="glow-effect absolute inset-0 rounded-xl pointer-events-none opacity-0 transition-opacity duration-300 z-20"
                      style={{
                        background: 'radial-gradient(circle var(--glow-size, 400px) at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 40%, transparent 70%)'
                      }}
                    />
                    <Image
                      src="/images/home/hsbc_vault.webp"
                      alt="The HSBC Vault installation in waterloo station."
                      fill
                      style={{ objectFit: "cover", objectPosition: "center" }}
                      className="z-0"
                    />
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-orange-950/50 to-orange-950 z-10" />
                    <div className="w-fit px-4 py-2 bg-purple-100/90 backdrop-blur-md rounded-2xl">
                      Installation
                    </div>
                    <div className="z-10 flex flex-col gap-2">
                      <p
                        id="hsbc-vault-title"
                        className="font-[family-name:var(--font-lastik)] text-2xl text-white"
                      >
                        HSBC Vault
                      </p>
                      <p className="text-white text-md">
                        My team and I created the software running HSBC&apos;s
                        Vault experience.
                      </p>
                    </div>
                  </Link>
                </div>

                {/* TikTok Views Highlight */}
                <div
                  ref={tiktokRef}
                  className="col-span-1 md:col-span-3 md:col-start-2 md:row-span-2 md:row-start-3"
                >
                  <Link
                    href="https://vm.tiktok.com/ZNdr68mku/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-full min-h-80 bg-purple-950 rounded-4xl relative flex p-4 flex-col justify-center items-center overflow-clip transition-all outline-2 outline-transparent outline-offset-0 focus-visible:outline-purple-950 focus-visible:outline-offset-4 hover:cursor-pointer "
                    aria-labelledby="tiktok-views-title"
                    {...glowHandlers}
                  >
                    <div 
                      className="glow-effect absolute inset-0 rounded-xl pointer-events-none opacity-0 transition-opacity duration-300 z-20"
                      style={{
                        background: 'radial-gradient(circle var(--glow-size, 400px) at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 40%, transparent 70%)'
                      }}
                    />
                    <Image
                      src="/images/home/effects.jpeg"
                      alt="Background showing TikTok effects"
                      fill
                      style={{
                        objectFit: "cover",
                        objectPosition: "center",
                        opacity: 0.2,
                      }}
                    />
                    <div className="absolute top-4 left-4 px-4 py-2 bg-purple-100/90 backdrop-blur-md rounded-2xl">
                      Latest
                    </div>
                    <p
                      id="tiktok-views-title"
                      className="z-10 max-w-xl text-3xl md:text-6xl text-white font-[family-name:var(--font-lastik)]"
                    >
                      Views of TikTok videos using my camera effects have
                      reached{" "}
                      <span className="inline-block font-bold mt-2 text-purple-950 bg-purple-50 rounded-md px-2 py-2">
                        8,773,773,403
                      </span>
                      !
                    </p>
                  </Link>
                </div>

                {/* Supermarket Scan */}
                <div
                  ref={supermarketRef}
                  className="col-span-1 md:col-start-1 md:row-start-3"
                >
                  <Link
                    href="https://www.youtube.com/live/6vYkZmNvDEg?si=Ts9xPxF03xS6G0ao"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="max-h-96 min-h-80 bg-purple-50 rounded-4xl md:aspect-square relative flex p-4 flex-col justify-between items-start overflow-clip transition-all outline-2 outline-transparent outline-offset-0 focus-visible:outline-purple-950 focus-visible:outline-offset-4 hover:cursor-pointer "
                    aria-labelledby="supermarket-scan-title"
                    {...glowHandlers}
                  >
                    <div 
                      className="glow-effect absolute inset-0 rounded-xl pointer-events-none opacity-0 transition-opacity duration-300 z-20"
                      style={{
                        background: 'radial-gradient(circle var(--glow-size, 400px) at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 40%, transparent 70%)'
                      }}
                    />
                    <Image
                      src="/images/home/tiktok_live_supermarket_scan.webp"
                      alt="YouTube thumbnail for the live stream showing my face and the title."
                      fill
                      style={{ objectFit: "cover", objectPosition: "top" }}
                      className="z-0"
                    />
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-purple-950/80 to-purple-950 z-10" />
                    <div className="w-fit px-4 py-2 bg-purple-100/90 backdrop-blur-md rounded-2xl">
                      Tutorial
                    </div>
                    <div className="z-10 flex flex-col gap-2">
                      <p
                        id="supermarket-scan-title"
                        className="font-[family-name:var(--font-lastik)] text-2xl text-white"
                      >
                        How I made the viral Supermarket Scan effect
                      </p>
                      <p className="text-white text-md text-pretty">
                        Coding live with Celine on Effect House&apos;s YouTube
                      </p>
                    </div>
                  </Link>
                </div>

                {/* Magpie App */}
                <div ref={magpieRef} className="col-span-1 md:row-start-4">
                  <Link
                    href="https://www.thedrum.com/news/2022/12/05/inside-wunderman-thompsons-plan-spark-interest-workplace-mentoring-with-magpie"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="max-h-96 min-h-80 bg-purple-50 rounded-4xl md:aspect-square relative flex p-4 flex-col justify-between items-start overflow-clip transition-all outline-2 outline-transparent outline-offset-0 focus-visible:outline-purple-950 focus-visible:outline-offset-4 hover:cursor-pointer "
                    aria-labelledby="magpie-app-title"
                    {...glowHandlers}
                  >
                    <div 
                      className="glow-effect absolute inset-0 rounded-xl pointer-events-none opacity-0 transition-opacity duration-300 z-20"
                      style={{
                        background: 'radial-gradient(circle var(--glow-size, 400px) at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 40%, transparent 70%)'
                      }}
                    />
                    <Image
                      src="/images/home/magpie_app.webp"
                      alt="Screenshot of the Magpie app showing mentor profiles."
                      fill
                      style={{ objectFit: "cover", objectPosition: "top" }}
                      className="z-0"
                    />
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-purple-950/80 to-purple-950 z-10" />
                    <div className="w-fit px-4 py-2 bg-purple-100/90 backdrop-blur-md rounded-2xl">
                      App
                    </div>
                    <div className="z-10 flex flex-col gap-2">
                      <p
                        id="magpie-app-title"
                        className="font-[family-name:var(--font-lastik)] text-2xl text-white"
                      >
                        Magpie: VML&apos;s award-winning mentorship app
                      </p>
                      <p className="text-white text-md text-pretty">
                        I developed our mentorship app built for Microsoft
                        Teams.
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* <section
          id="blog"
          className="h-lvh scroll-mt-20"
          aria-labelledby="blog-heading"
        >
          <h2 id="blog-heading" className="sr-only">
            Things
          </h2>
          <div className="flex flex-col items-center justify-center h-full">
            <p className="max-w-96 text-4xl">Coming soon!</p>
          </div>
        </section> */}
        </main>
      </div>
    </>
  );
}
