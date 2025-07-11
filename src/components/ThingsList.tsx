"use client";

import { useState, useMemo, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { ThingMetadata, ThingType } from "@/types/thing";
import { formatCustomDate } from "@/utils/formatDate";
import { DynamicMDXContent } from "@/components/DynamicMDXContent";
import { ThingsListFilters } from "@/components/ThingsListFilters";

interface ThingsListProps {
  initialPosts: (ThingMetadata & { slug: string })[];
  selectedSlug?: string;
}

export function ThingsList({ initialPosts, selectedSlug }: ThingsListProps) {
  const selectedPostRef = useRef<HTMLDivElement>(null);
  const [selectedTypes, setSelectedTypes] = useState<ThingType[]>([]);

  useEffect(() => {
    if (selectedSlug && selectedPostRef.current) {
      // Add a small delay to ensure content is fully rendered
      const timeoutId = setTimeout(() => {
        const element = selectedPostRef.current;
        if (element) {
          // Get the element's position relative to the viewport
          const rect = element.getBoundingClientRect();
          const absoluteElementTop = rect.top + window.pageYOffset;

          // Scroll to the element with offset
          window.scrollTo({
            top: absoluteElementTop - 80, // 80px offset from top
            behavior: "smooth",
          });
        }
      }, 300); // Small delay to ensure content is rendered

      return () => clearTimeout(timeoutId);
    }
  }, [selectedSlug]);

  // Get unique types from all posts
  const availableTypes = useMemo(() => {
    const types = new Set(initialPosts.flatMap((post) => post.type));
    return Array.from(types).sort() as ThingType[];
  }, [initialPosts]);

  const filteredPosts =
    selectedTypes.length > 0
      ? initialPosts.filter((post) =>
          selectedTypes.some((type) => post.type.includes(type))
        )
      : initialPosts;

  return (
    <main className="blog-list" role="main" aria-label="Blog posts">
      <div className="h-42" />
      <Suspense>
        <ThingsListFilters
          availableTypes={availableTypes}
          onFiltersChange={setSelectedTypes}
        />
      </Suspense>
      <div className="container max-w-3xl mx-auto pb-8 px-4 font-[family-name:var(--font-hyperlegible)]">
        <div className="space-y-8" role="feed" aria-label="Blog posts list">
          {filteredPosts.map((post) => {
            const isSelected = post.slug === selectedSlug;

            return (
              <article
                key={post.slug}
                ref={isSelected ? selectedPostRef : null}
                className={`border border-white/10 ${
                  post.image ? "min-h-42" : ""
                }
                  
                  `}
              >
                <Link
                  href={`${isSelected ? "/things" : `/things/${post.slug}`}${
                    typeof window !== "undefined" ? window.location.search : ""
                  }`}
                  aria-label={`${isSelected ? "Close" : "Open"} blog post: ${
                    post.title
                  }`}
                >
                  <div
                    className={`relative flex flex-col p-5 ${
                      post.image ? "min-h-42 gap-4" : "gap-4"
                    }`}
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = ((e.clientX - rect.left) / rect.width) * 100;
                      const y = ((e.clientY - rect.top) / rect.height) * 100;
                      const glowElement = e.currentTarget.querySelector('.absolute.inset-0.rounded-xl.z-\\[1\\.5\\]') as HTMLElement;
                      if (glowElement) {
                        glowElement.style.setProperty('--mouse-x', `${x}%`);
                        glowElement.style.setProperty('--mouse-y', `${y}%`);
                        glowElement.style.opacity = '1';
                      }
                    }}
                    onMouseLeave={(e) => {
                      const glowElement = e.currentTarget.querySelector('.absolute.inset-0.rounded-xl.z-\\[1\\.5\\]') as HTMLElement;
                      if (glowElement) {
                        glowElement.style.opacity = '0';
                      }
                    }}
                  >
                    {/* Cursor Glow Effect */}
                    <div 
                      className="absolute inset-0 rounded-xl z-[1.5] pointer-events-none opacity-0 transition-opacity duration-300"
                      style={{
                        background: 'radial-gradient(circle 480px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.4) 25%, rgba(255, 255, 255, 0.15) 50%, transparent 80%)'
                      }}
                    ></div>
                    {/* Metadata tags and date - always top left */}
                    <div
                      className="z-10 flex flex-wrap gap-2 self-start"
                      aria-label="Post metadata"
                    >
                      {post.type.map((type) => (
                        <span
                          key={type}
                          role="tag"
                          className={`text-purple-950 min-w-fit w-fit h-fit px-3 py-2 rounded-full text-sm ${
                            post.image
                              ? "bg-pink-200/80 backdrop-blur-sm"
                              : "bg-pink-200/70"
                          }`}
                        >
                          {type}
                        </span>
                      ))}
                      <time
                        dateTime={post.date}
                        className={`text-purple-950 min-w-fit w-fit h-fit px-3 py-2 rounded-full text-sm ${
                          post.image
                            ? "bg-purple-50/80 backdrop-blur-sm"
                            : "bg-purple-50"
                        }`}
                      >
                        {formatCustomDate(post.date)}
                      </time>
                    </div>

                    {/* Title - always after metadata with guaranteed gap */}
                    <h2
                      className={`relative z-[3] font-[family-name:var(--font-lastik)] text-3xl text-purple-950 text-balance ${
                        post.image ? "z-10 mt-auto" : ""
                      }`}
                      tabIndex={isSelected ? 0 : -1}
                      ref={(node) => {
                        if (node && isSelected) {
                          // Make element programmatically focusable without visible focus ring
                          node.setAttribute("tabindex", "0");
                          // Move focus to the element without visual indication
                          if (
                            window.location.pathname.includes(
                              selectedSlug || ""
                            )
                          ) {
                            requestAnimationFrame(() => {
                              node.focus({ preventScroll: true });
                              // Remove focus immediately
                              node.blur();
                            });
                          }
                        }
                      }}
                    >
                      {post.title}
                    </h2>

                    {/* Background image with overlay */}
                    <div className="absolute -z-10 inset-0 rounded-xl border border-white bg-white/20" />
                    {post.image ? (
                      <div className="absolute -z-10 -inset-8 blur-2xl opacity-80">
                        <div className="absolute inset-8 rounded-xl overflow-hidden">
                          <Image
                            src={post.image}
                            alt=""
                            fill
                            sizes="(max-width: 768px) 100vw, 768px"
                            quality={1}
                            className="object-cover"
                            priority={false}
                          />
                          <div
                            className="absolute inset-0"
                            style={{
                              background:
                                "linear-gradient(to top, rgba(243, 232, 255, 0.95) 0%, rgba(243, 232, 255, 0.8) 40%, rgba(243, 232, 255, 0.3) 70%, transparent 90%), linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1))",
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                </Link>
                {isSelected && (
                  <section aria-label="Blog post content">
                    <DynamicMDXContent slug={post.slug} />
                  </section>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
