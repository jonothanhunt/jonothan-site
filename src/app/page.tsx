"use client";
import { Canvas } from "@react-three/fiber";
import { Suspense, useRef, useState } from "react";
import Model from "./components/Model";
import SplashCursor from "./components/SplashCursor";
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

// Register the plugins
gsap.registerPlugin(ScrollTrigger, SplitText);

export default function Home() {
  const [copied, setCopied] = useState(false);

  // Create refs for all the elements you want to animate
  const canvasRef = useRef(null);
  const campaignRef = useRef(null);
  const hsbcRef = useRef(null);
  const tiktokRef = useRef(null);
  const supermarketRef = useRef(null);
  const magpieRef = useRef(null);

  // Ref for the text container to prevent FOUC
  const textContainerRef = useRef(null);

  // Main container ref for scoping animations
  const mainRef = useRef(null);

  useGSAP(
    () => {
      // First set the container to be visible with GSAP
      gsap.set(textContainerRef.current, { autoAlpha: 1 });

      // Text animations with SplitText using the cleaner onSplit approach
      SplitText.create("#heading1", {
        type: "words, chars",
        onSplit(self) {
          gsap.from(self.words, {
            duration: 0.7,
            y: 50,
            opacity: 0,
            rotation: "random(-30, 30)",
            filter: "blur(4px)",
            stagger: 0.15,
            ease: "back",
            delay: 0.2,
          });
        },
      });

      SplitText.create("#heading2", {
        type: "words, chars",
        onSplit(self) {
          gsap.from(self.words, {
            duration: 0.7,
            y: 50,
            opacity: 0,
            rotation: "random(-30, 30)",
            filter: "blur(4px)",
            stagger: 0.15,
            ease: "back",
            delay: 0.8,
          });
        },
      });

      SplitText.create("#paragraph", {
        type: "words",
        onSplit(self) {
          gsap.from(self.words, {
            duration: 0.5,
            y: 30,
            opacity: 0,
            filter: "blur(2px)",
            stagger: 0.03,
            ease: "power2.out",
            delay: 1.5,
          });
        },
      });

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
        filter: "blur(4px)",
      });

      // Create animations for each element
      elements.forEach((element) => {
        // Create the ScrollTrigger animation
        gsap.to(element, {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
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
    <div className="relative font-[family-name:var(--font-hyperlegible)] text-purple-950">
      <div className="absolute top-0 left-0 pointer-events-none w-full h-screen crosses"></div>
      <SplashCursor />
      <main ref={mainRef}>
        {/* About section */}
        <section
          id="about"
          className="relative min-h-[calc(100vh-180px)] w-full flex flex-col items-center py-20 justify-center"
        >
          <div
            ref={textContainerRef}
            className="max-w-xl mx-6 flex flex-col gap-4 invisible"
          >
            <h2
              id="heading1"
              className="font-[family-name:var(--font-lastik)] text-7xl"
            >
              Hey, I&apos;m
            </h2>
            <h2
              id="heading2"
              className="font-[family-name:var(--font-lastik)] text-7xl"
            >
              Jonothan.
            </h2>
            <p
              id="paragraph"
              className="text-2xl font-[family-name:var(--font-hyperlegible)] text-pretty"
            >
              I&apos;m a creative developer creating innovative experiences for
              brands like HSBC and the NHS, leading our Creative Tech Studio at
              VML in the UK.
            </p>
          </div>
        </section>

        <section id="work" className="px-4">
          <div className="relative max-w-6xl mx-auto">
            {/* Work with me section */}
            <div className="h-72 bg-purple-50 rounded-4xl relative p-10 flex flex-col justify-center overflow-clip ">
              <div className="absolute top-0 left-0 w-full h-full">
                <Image
                  src="/images/work_with_me.webp"
                  alt="Let's work together"
                  fill
                  style={{ objectFit: "cover", objectPosition: "right" }}
                />
              </div>
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-purple-950/80 via-purple-950/80 to-transparent bg-cover bg-center" />
              <div className="z-10 flex flex-col gap-4">
                <p className="font-[family-name:var(--font-lastik)] text-4xl text-white">
                  Let&apos;s chat!
                </p>
                <p className="text-white text-lg max-w-96 text-pretty">
                  Book me for a talk or I&apos;m always down to chat about
                  exciting projects, especially immersive web (WebGL, shaders)
                  and mixed reality!
                </p>
                <div className={`flex gap-1 text-xl h-full`}>
                  <Link
                    href="mailto:hey@jonothan.dev"
                    className="inline-flex items-center text-purple-950 bg-purple-50 text-base px-3 py-2 rounded-l-lg transition-all cursor-pointer  "
                    aria-label="Email me at hey@jonothan.dev"
                  >
                    hey@jonothan.dev
                  </Link>
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
            </div>

            <div className="h-4" />

            <div className="relative grid grid-cols-1 md:grid-cols-[1fr_minmax(0,_2fr)_minmax(0,_2fr)_1fr] md:grid-rows-4 gap-4 h-full w-full">
              {/* Canvas */}
              <div
                ref={canvasRef}
                className="aspect-square md:aspect-auto col-span-1 md:col-span-3 md:row-span-2 bg-purple-50 rounded-4xl overflow-clip"
              >
                <Canvas
                  eventPrefix="client"
                  dpr={[1, 1]}
                  orthographic
                  camera={{
                    zoom: 300,
                    near: 0.1,
                    far: 1000,
                    position: [-1.65, 1.6, 3.5],
                    rotation: [-0.42, -0.4, -0.1],
                  }}
                >
                  <Suspense fallback={null}>
                    <ambientLight intensity={0.1} />
                    <directionalLight position={[0, 10, 5]} intensity={3.2} />
                    <Model />
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
              </div>

              {/* Rest of your content remains the same */}
              {/* Campaign */}
              <div ref={campaignRef} className="col-span-1 md:col-start-4">
                <Link
                  href="https://waitingtolive.org/"
                  target="_blank"
                  className="max-h-96 min-h-80 bg-purple-50 rounded-4xl md:aspect-square relative p-4 flex flex-col justify-between overflow-clip transition-all outline-2 outline-transparent outline-offset-0 hover:outline-purple-950 hover:outline-offset-4 focus-visible:outline-purple-950 focus-visible:outline-offset-4 hover:cursor-pointer"
                >
                  <Image
                    src="/images/waiting_to_live.webp"
                    alt="Waiting to Live Campaign"
                    fill
                    style={{ objectFit: "cover", objectPosition: "center" }}
                  />
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-purple-950/50 to-purple-950" />
                  <div className="w-fit px-4 py-2 bg-purple-100/90 backdrop-blur-md rounded-2xl">
                    Campaign
                  </div>
                  <div className="z-10 flex flex-col gap-2">
                    <p className="font-[family-name:var(--font-lastik)] text-2xl text-white">
                      Waiting to Live
                    </p>
                    <p className="text-white text-md">
                      Our campaign is increasing organ donation for the NHS.
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
                  className="max-h-96 min-h-80 bg-purple-50 rounded-4xl md:aspect-square relative p-4 flex flex-col justify-between overflow-clip transition-all outline-2 outline-transparent outline-offset-0 hover:outline-purple-950 hover:outline-offset-4 focus-visible:outline-purple-950 focus-visible:outline-offset-4 hover:cursor-pointer"
                >
                  <Image
                    src="/images/hsbc_vault.webp"
                    alt="HSBC Vault"
                    fill
                    style={{ objectFit: "cover", objectPosition: "center" }}
                  />
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-orange-950/50 to-orange-950" />
                  <div className="w-fit px-4 py-2 bg-purple-100/90 backdrop-blur-md rounded-2xl">
                    Installation
                  </div>
                  <div className="z-10 flex flex-col gap-2">
                    <p className="font-[family-name:var(--font-lastik)] text-2xl text-white">
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
                  className="h-full min-h-80 bg-purple-950 rounded-4xl relative flex p-4 flex-col justify-center items-center overflow-clip transition-all outline-2 outline-transparent outline-offset-0 hover:outline-purple-950 hover:outline-offset-4 focus-visible:outline-purple-950 focus-visible:outline-offset-4 hover:cursor-pointer"
                >
                  <Image
                    src="/images/effects.jpeg"
                    alt="TikTok Effects"
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
                  <p className="z-10 max-w-xl text-3xl md:text-6xl text-white font-[family-name:var(--font-lastik)]">
                    Views of TikTok videos using my camera effects have reached{" "}
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
                  className="max-h-96 min-h-80 bg-purple-50 rounded-4xl md:aspect-square relative flex p-4 flex-col justify-between items-start overflow-clip transition-all outline-2 outline-transparent outline-offset-0 hover:outline-purple-950 hover:outline-offset-4 focus-visible:outline-purple-950 focus-visible:outline-offset-4 hover:cursor-pointer"
                >
                  <Image
                    src="/images/tiktok_live_supermarket_scan.webp"
                    alt="Supermarket Scan"
                    fill
                    style={{ objectFit: "cover", objectPosition: "top" }}
                  />
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-purple-950/80 to-purple-950" />
                  <div className="w-fit px-4 py-2 bg-purple-100/90 backdrop-blur-md rounded-2xl">
                    Tutorial
                  </div>
                  <div className="z-10 flex flex-col gap-2">
                    <p className="font-[family-name:var(--font-lastik)] text-2xl text-white">
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
                  className="max-h-96 min-h-80 bg-purple-50 rounded-4xl md:aspect-square relative flex p-4 flex-col justify-between items-start overflow-clip transition-all outline-2 outline-transparent outline-offset-0 hover:outline-purple-950 hover:outline-offset-4 focus-visible:outline-purple-950 focus-visible:outline-offset-4 hover:cursor-pointer"
                >
                  <Image
                    src="/images/magpie_app.webp"
                    alt="Magpie App"
                    fill
                    style={{ objectFit: "cover", objectPosition: "top" }}
                  />
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-purple-950/80 to-purple-950" />
                  <div className="w-fit px-4 py-2 bg-purple-100/90 backdrop-blur-md rounded-2xl">
                    App
                  </div>
                  <div className="z-10 flex flex-col gap-2">
                    <p className="font-[family-name:var(--font-lastik)] text-2xl text-white">
                      Magpie: VML&apos;s award-winning mentorship app
                    </p>
                    <p className="text-white text-md text-pretty">
                      I developed our mentorship app built for Microsoft Teams.
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="blog" className="h-screen">
          <div className="flex flex-col items-center justify-center h-full">
            <p className="max-w-96 text-4xl">Coming soon!</p>
          </div>
        </section>
      </main>
    </div>
  );
}
