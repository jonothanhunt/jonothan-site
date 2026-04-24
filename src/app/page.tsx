"use client";
import { Canvas } from "@react-three/fiber";
import VariableProximity from "../components/VariableProximity";
import { Suspense, useRef, useState, useEffect } from "react";
import Model from "../components/Model";
import LiveTicker from "../components/LiveTicker";
import ErrorBoundary from "../components/ErrorBoundary";
import {
  ClipboardIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { EffectComposer, N8AO } from "@react-three/postprocessing";
import Image from "next/image";
import Link from "next/link";
import InfiniteScrollingLogosAnimation from "@/components/InfiniteScrollingLogosAnimation";
import { createGlowEffect } from "@/utils/glowEffect";

// WebGL detection utility
const isWebGLAvailable = () => {
  try {
    if (typeof window === "undefined") return true; // SSR check

    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
};

// Fallback component for 3D section
const WebGL3DFallback = () => (
  <div className="w-full h-[500px] flex items-center justify-center text-center p-4 bg-purple-50 rounded-lg">
    <div className="max-w-md">
      <h2 className="text-xl font-semibold mb-2">
        3D Experience Not Available
      </h2>
      <p className="mb-3">
        Your browser or device doesn&apos;t support WebGL, which is required for
        the 3D experience.
      </p>
      <p>
        Try updating your graphics drivers or using a different browser like
        Chrome or Edge.
      </p>
    </div>
  </div>
);

export default function Home() {
  const [copied, setCopied] = useState(false);
  const [webGLSupported, setWebGLSupported] = useState(true);
  const [sceneReady, setSceneReady] = useState(false);
  const glowHandlers = createGlowEffect();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWebGLSupported(isWebGLAvailable());
    }
    // Defer 3D scene mount by 300ms so route transition paints first
    const id = setTimeout(() => setSceneReady(true), 300);
    return () => clearTimeout(id);
  }, []);

  // Ref for the 3D canvas container (used by Model for scroll-based rotation)
  const canvasRef = useRef<HTMLDivElement>(null);

  // Ref for the text container to prevent FOUC
  const textContainerRef = useRef<HTMLDivElement>(null);

  // Main container ref for scoping animations
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Scroll-reveal for work cards via IntersectionObserver
    const elements = mainRef.current?.querySelectorAll(".reveal-on-scroll");
    if (!elements) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          } else {
            entry.target.classList.remove("revealed");
          }
        });
      },
      { rootMargin: "0px 0px -100px 0px" },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div className="relative font-[family-name:var(--font-hyperlegible)] text-purple-950 font-w-70">
        <div
          className="absolute top-0 left-0 pointer-events-none w-full h-[80vh] overflow-hidden"
          aria-hidden="true"
        >
          <Image
            src="/header.jpg"
            alt=""
            fill
            priority
            style={{ objectFit: "cover", objectPosition: "right" }}
          />
          <div className="dot-grid absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#fdf8f6]/95 from-40% via-[#fdf8f6]/75 via-60% to-transparent" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 50%, rgba(253,248,246,0.1) 60%, rgba(253,248,246,0.35) 70%, rgba(253,248,246,0.7) 82%, rgba(253,248,246,0.92) 92%, #fdf8f6 100%)" }} />
        </div>
        <main ref={mainRef}>
          {/* About section */}

          <section
            id="about"
            className="relative min-h-[calc(100vh-250px)] w-full flex flex-col items-center py-20 justify-center px-4"
          >
            <div className="h-12" />
            <div className="relative max-w-6xl w-full mx-auto">
            <div
              ref={textContainerRef}
              className="max-w-[25rem] flex flex-col gap-4 pl-2"
            >
              <h1 className="font-[family-name:var(--font-lastik)] text-7xl flex flex-col text-emerald-600">
                <VariableProximity
                  label={"Hey, I'm"}
                  className="inline-block cursor-default select-none"
                  fromFontVariationSettings="'wght' 50"
                  toFontVariationSettings="'wght' 100"
                  containerRef={textContainerRef}
                  radius={100}
                  falloff="linear"
                />
                <VariableProximity
                  label={"Jonothan."}
                  className="inline-block whitespace-nowrap cursor-default select-none"
                  fromFontVariationSettings="'wght' 50"
                  toFontVariationSettings="'wght' 100"
                  containerRef={textContainerRef}
                  radius={100}
                  falloff="linear"
                />
              </h1>
              <p
                id="paragraph"
                className="text-2xl text-balance pr-0 font-[family-name:var(--font-hyperlegible)] font-normal text-sky-600"
              >
                I&apos;m a creative technologist and developer. I lead Creative
                Innovation at VML. Part of WPP Innovation.
              </p>
              <div className="w-full flex justify-start items-center gap-4 mt-4 font-w-70">
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
                <div className="z-10 flex flex-col gap-4 font-w-70">
                  <h3 className="font-[family-name:var(--font-lastik)] text-4xl text-white font-w-70">
                    Let&apos;s chat!
                  </h3>
                  <p className="text-white text-lg max-w-96 text-pretty font-normal">
                    Book me for a talk or I&apos;m always down to chat about
                    exciting projects, especially immersive web (WebGL,
                    shaders), webAR and social effects
                  </p>
                  <div className="flex items-center">
                    <div className="flex rounded-lg overflow-hidden font-[family-name:var(--font-hyperlegible)]">
                      <Link
                        href="mailto:hey@jonothan.dev"
                        className="inline-flex items-center text-purple-950 bg-purple-50/90 hover:bg-purple-50 active:bg-purple-50 backdrop-blur-[2px] text-base px-3 py-2 transition-all cursor-pointer font-normal"
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
                        className="inline-flex items-center justify-center bg-purple-50/90 backdrop-blur-[2px] px-3 py-2 transition-all cursor-pointer hover:bg-purple-50 active:bg-purple-50 font-w-70"
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

              <div className="relative grid grid-cols-1 md:grid-cols-[1fr_minmax(0,_2fr)_minmax(0,_2fr)_1fr] md:grid-rows-4 gap-4 h-full w-full font-w-70">
                {/* Canvas */}
                <div
                  ref={canvasRef}
                  className="reveal-on-scroll md:h-auto min-h-80 max-h-96 md:min-h-0 md:max-h-none col-span-1 md:col-span-3 md:row-span-2 bg-gradient-to-b from-purple-900/50 to-blue-800/50 backdrop-blur-xl rounded-4xl overflow-clip font-w-70"
                  aria-label="Desk scene in 3D!"
                  role="img"
                >
                  <div
                    className="w-full h-full transition-opacity duration-700"
                    style={{ opacity: sceneReady ? 1 : 0 }}
                  >
                    {sceneReady &&
                      (webGLSupported ? (
                        <ErrorBoundary fallback={<WebGL3DFallback />}>
                          <Canvas
                            onCreated={({ gl }) => {
                              const canvas = gl.domElement;
                              canvas.addEventListener(
                                "webglcontextlost",
                                (e: Event) => {
                                  e.preventDefault();
                                  setWebGLSupported(false);
                                },
                              );
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
                              failIfMajorPerformanceCaveat: false,
                              powerPreference: "default",
                            }}
                            style={{ background: "transparent" }}
                            aria-hidden="true"
                          >
                            <Suspense fallback={null}>
                              <color attach="background" args={["black"]} />
                              <ambientLight intensity={0.1} />
                              <directionalLight
                                position={[0, 10, 5]}
                                intensity={3.2}
                              />
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
                      ))}
                  </div>
                </div>

                {/* Campaign (Now Creative Tech Stack) */}
                <div className="reveal-on-scroll col-span-1 md:col-start-4 font-w-70">
                  <Link
                    href="/blog/creative-tech-stack"
                    className="max-h-96 min-h-80 bg-purple-50 rounded-4xl md:aspect-square relative p-4 flex flex-col justify-between overflow-clip transition-all outline-2 outline-transparent outline-offset-0 focus-visible:outline-purple-950 focus-visible:outline-offset-4 hover:cursor-pointer"
                    aria-labelledby="creative-tech-stack-title"
                    {...glowHandlers}
                  >
                    <div
                      className="glow-effect absolute inset-0 rounded-xl pointer-events-none opacity-0 transition-opacity duration-300 z-20"
                      style={{
                        background:
                          "radial-gradient(circle var(--glow-size, 400px) at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 40%, transparent 70%)",
                      }}
                    />
                    <Image
                      src="/things-content/creative-tech-stack/images/creative-tech-stack.png"
                      alt="Creative Tech Stack website screenshot"
                      fill
                      style={{ objectFit: "cover", objectPosition: "center" }}
                      className="z-0"
                    />
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-emerald-100 via-70% to-emerald-100 z-10" />
                    <div className="w-fit px-4 py-2 bg-emerald-600 text-white backdrop-blur-md rounded-2xl font-normal">
                      Web
                    </div>
                    <div className="z-10 flex flex-col gap-2 font-w-70">
                      <p
                        id="creative-tech-stack-title"
                        className="font-[family-name:var(--font-lastik)] text-2xl text-emerald-800 font-w-70"
                      >
                        Creative Tech Stack
                      </p>
                      <p className="text-emerald-800 text-md font-normal leading-tight">
                        A tools database & blog for creative technologists.
                      </p>
                    </div>
                  </Link>
                </div>

                {/* HSBC Vault (Now Waiting to Live) */}
                <div className="reveal-on-scroll col-span-1 md:col-start-4 md:row-start-2 font-w-70">
                  <Link
                    href="https://waitingtolive.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="max-h-96 min-h-80 bg-purple-50 rounded-4xl md:aspect-square relative p-4 flex flex-col justify-between overflow-clip transition-all outline-2 outline-transparent outline-offset-0 focus-visible:outline-purple-950 focus-visible:outline-offset-4 hover:cursor-pointer  "
                    aria-labelledby="waiting-to-live-title"
                    {...glowHandlers}
                  >
                    <div
                      className="glow-effect absolute inset-0 rounded-xl pointer-events-none opacity-0 transition-opacity duration-300 z-20"
                      style={{
                        background:
                          "radial-gradient(circle var(--glow-size, 400px) at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 40%, transparent 70%)",
                      }}
                    />
                    <Image
                      src="/images/home/waiting_to_live.webp"
                      alt="The doll of Ralph sitting on a bench, waiting."
                      fill
                      style={{ objectFit: "cover", objectPosition: "center" }}
                      className="z-0"
                    />
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-orange-100 via-70% to-orange-100 z-10" />
                    <div className="w-fit px-4 py-2 bg-orange-600 text-white backdrop-blur-md rounded-2xl font-normal">
                      Campaign
                    </div>
                    <div className="z-10 flex flex-col gap-2 font-w-70">
                      <p
                        id="waiting-to-live-title"
                        className="font-[family-name:var(--font-lastik)] text-2xl text-orange-800 font-w-70"
                      >
                        Waiting to Live
                      </p>
                      <p className="text-orange-800 text-md font-normal leading-tight">
                        Our campaign is raising awareness of organ donation for
                        the NHS.
                      </p>
                    </div>
                  </Link>
                </div>

                {/* TikTok Views Highlight */}
                <div className="reveal-on-scroll md:h-auto min-h-80 max-h-96 md:min-h-0 md:max-h-none col-span-1 md:col-span-3 md:col-start-2 md:row-span-2 md:row-start-3 font-w-70">
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
                        background:
                          "radial-gradient(circle var(--glow-size, 400px) at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 40%, transparent 70%)",
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
                    <div className="absolute top-4 left-4 px-4 py-2 bg-purple-100/90 backdrop-blur-md rounded-2xl font-normal">
                      Latest
                    </div>
                    <p
                      id="tiktok-views-title"
                      className="z-10 max-w-xl text-3xl md:text-5xl text-white font-[family-name:var(--font-lastik)] font-w-60"
                    >
                      Views of TikTok videos using my camera effects have
                      reached{" "}
                      <span className="inline-block">
                        <LiveTicker
                          initialValue={9987883874}
                          className="inline-flex font-bold mt-2 text-purple-950 bg-purple-50 rounded-md px-2"
                        />
                      </span>
                    </p>
                  </Link>
                </div>

                {/* Supermarket Scan (Now HSBC Vault) */}
                <div className="reveal-on-scroll col-span-1 md:col-start-1 md:row-start-3 font-w-70">
                  <Link
                    href="https://creative.salon/articles/work/hsbc-vml-everything-s-premier"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="max-h-96 min-h-80 bg-purple-50 rounded-4xl md:aspect-square relative flex p-4 flex-col justify-between items-start overflow-clip transition-all outline-2 outline-transparent outline-offset-0 focus-visible:outline-purple-950 focus-visible:outline-offset-4 hover:cursor-pointer "
                    aria-labelledby="hsbc-vault-title"
                    {...glowHandlers}
                  >
                    <div
                      className="glow-effect absolute inset-0 rounded-xl pointer-events-none opacity-0 transition-opacity duration-300 z-20"
                      style={{
                        background:
                          "radial-gradient(circle var(--glow-size, 400px) at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 40%, transparent 70%)",
                      }}
                    />
                    <Image
                      src="/images/home/hsbc_vault.webp"
                      alt="The HSBC Vault installation in waterloo station."
                      fill
                      style={{ objectFit: "cover", objectPosition: "center" }}
                      className="z-0"
                    />
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-sky-100 via-70% to-sky-100 z-10" />
                    <div className="w-fit px-4 py-2 bg-sky-600 text-white backdrop-blur-md rounded-2xl font-normal">
                      Installation
                    </div>
                    <div className="z-10 flex flex-col gap-2 font-w-70">
                      <p
                        id="hsbc-vault-title"
                        className="font-[family-name:var(--font-lastik)] text-2xl text-sky-800 font-w-70"
                      >
                        HSBC Vault
                      </p>
                      <p className="text-sky-800 text-md text-pretty font-normal leading-tight">
                        My team and I created the software running HSBC&apos;s
                        Vault experience.
                      </p>
                    </div>
                  </Link>
                </div>

                {/* Magpie App */}
                <div className="reveal-on-scroll col-span-1 md:row-start-4 font-w-70">
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
                        background:
                          "radial-gradient(circle var(--glow-size, 400px) at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 40%, transparent 70%)",
                      }}
                    />
                    <Image
                      src="/images/home/magpie_app.webp"
                      alt="Screenshot of the Magpie app showing mentor profiles."
                      fill
                      style={{ objectFit: "cover", objectPosition: "top" }}
                      className="z-0"
                    />
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-rose-100 via-70% to-rose-100 z-10" />
                    <div className="w-fit px-4 py-2 bg-rose-600 text-white backdrop-blur-md rounded-2xl font-normal">
                      App
                    </div>
                    <div className="z-10 flex flex-col gap-2 font-w-70">
                      <p
                        id="magpie-app-title"
                        className="font-[family-name:var(--font-lastik)] text-2xl text-rose-800 font-w-70"
                      >
                        Magpie: VML&apos;s award-winning mentorship app
                      </p>
                      <p className="text-rose-800 text-md text-pretty font-normal leading-tight">
                        I developed our mentorship app built for Microsoft
                        Teams.
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
