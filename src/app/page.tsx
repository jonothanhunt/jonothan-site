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

export default function Home() {
  const [copied, setCopied] = useState(false);
  const [webGLSupported, setWebGLSupported] = useState(true);
  const [sceneReady, setSceneReady] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [tiktokViews, setTiktokViews] = useState(10282156685);
  const glowHandlers = createGlowEffect();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWebGLSupported(isWebGLAvailable());
    }
    const BASE_COUNT = 10282156685;
    const BASE_DATE = new Date("2026-04-25T00:00:00Z").getTime();
    const VIEWS_PER_MINUTE = 1496355 / 1440;
    const minutesElapsed = (Date.now() - BASE_DATE) / 60000;
    setTiktokViews(Math.round(BASE_COUNT + minutesElapsed * VIEWS_PER_MINUTE));
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
          } else if (entry.boundingClientRect.top > 0) {
            // Only reset when element is below the viewport (not yet scrolled to)
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
          className="hidden md:block absolute top-0 left-0 pointer-events-none w-full h-[80vh] overflow-hidden"
          aria-hidden="true"
        >
          <Image
            src="/header.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            style={{ objectFit: "cover", objectPosition: "right" }}
          />
          <div className="dot-grid absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#fdfcfb]/95 from-40% via-[#fdfcfb]/75 via-60% to-transparent" />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, transparent 50%, rgba(253,252,251,0.1) 60%, rgba(253,252,251,0.35) 70%, rgba(253,252,251,0.7) 82%, rgba(253,252,251,0.92) 92%, #fdfcfb 100%)",
            }}
          />
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
                className="max-w-[25rem] flex flex-col gap-4 pl-8 md:pl-10"
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
                  I&apos;m a creative technologist and developer. I lead
                  Creative Innovation at VML UK. Part of WPP Innovation
                </p>
                <div className="w-full flex justify-start items-center gap-4 mt-4 font-w-70">
                  <Link href="https://www.lovethework.com/directory/individuals/jono-hunt-750043">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/logos/cannes_lions_logo.svg" alt="Cannes Lions logo" className="w-8 h-auto" />
                  </Link>
                  <Link
                    href="https://www.dandad.org/profiles/person/202333/jonothan-hunt/"
                    className="relative w-8 mr-2"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/logos/newblood_white_pencil.svg" alt="D&AD New Blood White Pencil" className="w-7 h-auto" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/logos/dad_logo.svg" alt="D&AD logo" className="absolute -bottom-2 -right-2 w-6 h-auto z-10" />
                  </Link>
                  <Link href="https://www.thedrum.com/awards-case-study/inside-wunderman-thompsons-plan-spark-interest-workplace-mentoring-with-magpie">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/logos/the_drum_logo.jpeg" alt="The Drum logo" className="w-8 h-auto" />
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
              <div className="h-72 bg-purple-50 md:bg-gradient-to-b md:from-purple-900/50 md:to-blue-800/50 rounded-4xl relative flex flex-row overflow-clip">
                {/* Mobile background image (hidden on md+) */}
                <div className="md:hidden absolute inset-0">
                  <Image src="/images/home/work_with_me.webp" alt="" fill style={{ objectFit: "cover", objectPosition: "right" }} />
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-950/80 via-purple-950/80 to-transparent" />
                </div>
                <div className={`relative z-10 flex flex-col justify-center font-w-70 p-8 md:py-10 md:pl-10 shrink-0 w-full md:w-auto ${webGLSupported ? 'md:pr-0' : 'md:pr-10'}`}>
                  <h3 className="font-[family-name:var(--font-lastik)] text-4xl text-white font-w-70 mb-2">
                    Let&apos;s chat!
                  </h3>
                  <p className="text-white text-lg max-w-96 text-pretty font-normal w-full mb-6">
                    Book me for a talk, reach out for creative tech career advice, or let&apos;s chat about creative tech installations for museums and galleries
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
                          navigator.clipboard.writeText("hey@jonothan.dev").catch(() => { });
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
                <div
                  ref={canvasRef}
                  className="hidden md:flex flex-1 min-w-0 h-full transition-opacity duration-[1500ms]"
                  style={{ opacity: modelLoaded ? 1 : 0 }}
                >
                  {sceneReady &&
                    (webGLSupported ? (
                      <ErrorBoundary fallback={null}>
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
                            near: 0.1,
                            far: 1000,
                            position: [-1.8, 1.6, 3.5],
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
                            <ambientLight intensity={0.1} />
                            <directionalLight
                              position={[0, 10, 5]}
                              intensity={3.2}
                            />
                            <Model canvasRef={canvasRef} onLoadingComplete={() => setModelLoaded(true)} />
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
                    ) : null)}
                </div>
              </div>

              <div className="h-4" />

              <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4 w-full min-w-0 font-w-70">

                {/* TikTok Views — large, cols 1–2, rows 1–2 */}
                <div className="reveal-on-scroll md:h-auto min-h-80 max-h-96 md:min-h-0 md:max-h-none col-span-1 md:col-span-2 md:row-span-2 md:row-start-1 font-w-70">
                  <Link
                    href="https://vm.tiktok.com/ZNdr68mku/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-full min-h-80 bg-purple-950 rounded-4xl relative flex p-4 flex-col justify-center items-center overflow-clip transition-all outline-2 outline-transparent outline-offset-0 focus-visible:outline-purple-950 focus-visible:outline-offset-4 hover:cursor-pointer"
                    aria-labelledby="tiktok-views-title"
                    {...glowHandlers}
                  >
                    <div className="glow-effect absolute inset-0 rounded-xl pointer-events-none opacity-0 transition-opacity duration-300 z-20" style={{ background: "radial-gradient(circle var(--glow-size, 400px) at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 40%, transparent 70%)" }} />
                    <Image src="/images/home/effects.jpeg" alt="Background showing TikTok effects" fill sizes="(max-width: 768px) 100vw, 66vw" style={{ objectFit: "cover", objectPosition: "center", opacity: 0.2 }} />
                    <div className="absolute top-4 left-4 px-4 py-2 bg-purple-100/90 backdrop-blur-md rounded-2xl text-sm font-normal uppercase">LATEST</div>
                    <p id="tiktok-views-title" className="z-10 max-w-xl text-3xl md:text-5xl text-white font-[family-name:var(--font-lastik)] font-w-60">
                      Views of TikTok videos using my camera effects have reached{" "}
                      <LiveTicker initialValue={tiktokViews} className="inline-flex font-bold text-purple-950 bg-purple-50 rounded-md px-2 align-baseline" />
                    </p>
                  </Link>
                </div>

                {/* KitKat Tracker — col 3, row 1 */}
                <div className="reveal-on-scroll col-span-1 md:col-start-3 md:row-start-1 font-w-70" style={{ ["--stagger-offset" as string]: "30px" }}>
                  <Link
                    href="https://www.famouscampaigns.com/2026/04/case-study-how-kitkat-turned-a-theft-into-a-chocolate-hunt/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full min-h-80 bg-red-50 rounded-4xl relative p-4 flex flex-col justify-between overflow-clip transition-all outline-2 outline-transparent outline-offset-0 focus-visible:outline-red-950 focus-visible:outline-offset-4 hover:cursor-pointer"
                    aria-labelledby="kitkat-tracker-title"
                    {...glowHandlers}
                  >
                    <div className="glow-effect absolute inset-0 rounded-xl pointer-events-none opacity-0 transition-opacity duration-300 z-20" style={{ background: "radial-gradient(circle var(--glow-size, 400px) at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 40%, transparent 70%)" }} />
                    <Image src="/images/home/kitkat_tracker.webp" alt="The Stolen KitKat Tracker" fill sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: "cover", objectPosition: "center" }} className="z-0" />
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-red-100 via-70% to-red-100 z-10" />
                    <div className="w-fit px-4 py-2 bg-red-600 text-white backdrop-blur-md rounded-2xl text-sm font-normal uppercase">CAMPAIGN</div>
                    <div className="z-10 flex flex-col gap-2 font-w-70">
                      <p id="kitkat-tracker-title" className="font-[family-name:var(--font-lastik)] text-2xl text-balance text-red-800 font-w-70">The Stolen KitKat Tracker</p>
                      <p className="text-red-800 text-md font-normal leading-tight text-balance">Turning Sweet Disaster into Global Triumph</p>
                    </div>
                  </Link>
                </div>

                {/* Magpie — col 3, row 2 */}
                <div className="reveal-on-scroll col-span-1 md:col-start-3 md:row-start-2 font-w-70">
                  <Link
                    href="https://www.thedrum.com/news/2022/12/05/inside-wunderman-thompsons-plan-spark-interest-workplace-mentoring-with-magpie"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full min-h-80 bg-purple-50 rounded-4xl relative flex p-4 flex-col justify-between items-start overflow-clip transition-all outline-2 outline-transparent outline-offset-0 focus-visible:outline-purple-950 focus-visible:outline-offset-4 hover:cursor-pointer"
                    aria-labelledby="magpie-app-title"
                    {...glowHandlers}
                  >
                    <div className="glow-effect absolute inset-0 rounded-xl pointer-events-none opacity-0 transition-opacity duration-300 z-20" style={{ background: "radial-gradient(circle var(--glow-size, 400px) at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 40%, transparent 70%)" }} />
                    <Image src="/images/home/magpie_app.webp" alt="Screenshot of the Magpie app showing mentor profiles." fill sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: "cover", objectPosition: "top" }} className="z-0" />
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-purple-100 via-70% to-purple-100 z-10" />
                    <div className="w-fit px-4 py-2 bg-purple-600 text-white backdrop-blur-md rounded-2xl text-sm font-normal uppercase">APP</div>
                    <div className="z-10 flex flex-col gap-2 font-w-70">
                      <p id="magpie-app-title" className="font-[family-name:var(--font-lastik)] text-2xl text-balance text-purple-800 font-w-70">Magpie: VML&apos;s award-winning mentorship app</p>
                      <p className="text-purple-800 text-md font-normal leading-tight text-balance">Mentorship app built for Microsoft Teams</p>
                    </div>
                  </Link>
                </div>

                {/* Creative Tech Stack */}
                <div className="reveal-on-scroll">
                  <Link
                    href="/blog/creative-tech-stack"
                    className="min-h-80 bg-purple-50 rounded-4xl relative p-4 flex flex-col justify-between overflow-clip transition-all outline-2 outline-transparent outline-offset-0 focus-visible:outline-purple-950 focus-visible:outline-offset-4 hover:cursor-pointer"
                    aria-labelledby="creative-tech-stack-title"
                    {...glowHandlers}
                  >
                    <div className="glow-effect absolute inset-0 rounded-xl pointer-events-none opacity-0 transition-opacity duration-300 z-20" style={{ background: "radial-gradient(circle var(--glow-size, 400px) at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 40%, transparent 70%)" }} />
                    <Image src="/things-content/creative-tech-stack/images/creative-tech-stack.png" alt="Creative Tech Stack website screenshot" fill sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: "cover", objectPosition: "center" }} className="z-0" />
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-emerald-100 via-70% to-emerald-100 z-10" />
                    <div className="w-fit px-4 py-2 bg-emerald-600 text-white backdrop-blur-md rounded-2xl text-sm font-normal uppercase">SITE</div>
                    <div className="z-10 flex flex-col gap-2 font-w-70">
                      <p id="creative-tech-stack-title" className="font-[family-name:var(--font-lastik)] text-2xl text-balance text-emerald-800 font-w-70">Creative Tech Stack</p>
                      <p className="text-emerald-800 text-md font-normal leading-tight text-balance">A tools database & blog for creative technologists</p>
                    </div>
                  </Link>
                </div>

                {/* Waiting to Live */}
                <div className="reveal-on-scroll" style={{ ["--stagger-offset" as string]: "30px" }}>
                  <Link
                    href="https://www.nhsbt.nhs.uk/news/more-than-half-the-children-transformed-into-dolls-as-part-of-an-award-winning-national-organ-donation-campaign-have-now-received-a-lifesaving-transplant-in-time-for-christmas/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-80 bg-purple-50 rounded-4xl relative p-4 flex flex-col justify-between overflow-clip transition-all outline-2 outline-transparent outline-offset-0 focus-visible:outline-purple-950 focus-visible:outline-offset-4 hover:cursor-pointer"
                    aria-labelledby="waiting-to-live-title"
                    {...glowHandlers}
                  >
                    <div className="glow-effect absolute inset-0 rounded-xl pointer-events-none opacity-0 transition-opacity duration-300 z-20" style={{ background: "radial-gradient(circle var(--glow-size, 400px) at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 40%, transparent 70%)" }} />
                    <Image src="/images/home/waiting_to_live.webp" alt="The doll of Ralph sitting on a bench, waiting." fill sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: "cover", objectPosition: "center" }} className="z-0" />
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-orange-100 via-70% to-orange-100 z-10" />
                    <div className="w-fit px-4 py-2 bg-orange-600 text-white backdrop-blur-md rounded-2xl text-sm font-normal uppercase">CAMPAIGN</div>
                    <div className="z-10 flex flex-col gap-2 font-w-70">
                      <p id="waiting-to-live-title" className="font-[family-name:var(--font-lastik)] text-2xl text-balance text-orange-800 font-w-70">Waiting to Live</p>
                      <p className="text-orange-800 text-md font-normal leading-tight text-balance">Our campaign is raising awareness of organ donation for the NHS</p>
                    </div>
                  </Link>
                </div>

                {/* HSBC Vault */}
                <div className="reveal-on-scroll" style={{ ["--stagger-offset" as string]: "60px" }}>
                  <Link
                    href="https://creative.salon/articles/work/hsbc-vml-everything-s-premier"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-80 bg-purple-50 rounded-4xl relative flex p-4 flex-col justify-between items-start overflow-clip transition-all outline-2 outline-transparent outline-offset-0 focus-visible:outline-purple-950 focus-visible:outline-offset-4 hover:cursor-pointer"
                    aria-labelledby="hsbc-vault-title"
                    {...glowHandlers}
                  >
                    <div className="glow-effect absolute inset-0 rounded-xl pointer-events-none opacity-0 transition-opacity duration-300 z-20" style={{ background: "radial-gradient(circle var(--glow-size, 400px) at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 40%, transparent 70%)" }} />
                    <Image src="/images/home/hsbc_vault.webp" alt="The HSBC Vault installation in waterloo station." fill sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: "cover", objectPosition: "center" }} className="z-0" />
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-sky-100 via-70% to-sky-100 z-10" />
                    <div className="w-fit px-4 py-2 bg-sky-600 text-white backdrop-blur-md rounded-2xl text-sm font-normal uppercase">INSTALLATION</div>
                    <div className="z-10 flex flex-col gap-2 font-w-70">
                      <p id="hsbc-vault-title" className="font-[family-name:var(--font-lastik)] text-2xl text-balance text-sky-800 font-w-70">HSBC Vault</p>
                      <p className="text-sky-800 text-md font-normal leading-tight text-balance">My team and I created the software running HSBC&apos;s Vault experience</p>
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
