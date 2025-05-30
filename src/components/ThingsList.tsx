"use client";

import { useState, useMemo, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
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
            behavior: 'smooth'
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
                className="border border-white/5 bg-purple-50 rounded-4xl overflow-clip shadow-xl shadow-purple-900/10 transition-[background-color,box-shadow] duration-300"
              >
                <Link
                  href={`${isSelected ? "/things" : `/things/${post.slug}`}${typeof window !== 'undefined' ? window.location.search : ''}`}
                  aria-label={`${isSelected ? "Close" : "Open"} blog post: ${
                    post.title
                  }`}
                >
                  <div
                    className={`flex flex-col-reverse p-5 sm:flex-row gap-2 justify-between bg-gradient-to-bl from-purple-200 via-transparent to-transparent transition-[background-color] duration-300 ${
                      isSelected
                        ? "rounded-t-4xl rounded-b-none"
                        : "rounded-t-4xl rounded-b-4xl"
                    }`}
                  >
                    <h2
                      className="font-[family-name:var(--font-lastik)] text-3xl text-purple-950 text-pretty"
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
                    <div
                      className="z-10 flex min-w-fit gap-2 "
                      aria-label="Post metadata"
                    >
                      {post.type.map((type) => (
                        <span
                          key={type}
                          role="tag"
                          className="text-purple-950 min-w-fit w-fit h-fit px-3 py-2 rounded-full bg-pink-200/70  text-sm"
                        >
                          {type}
                        </span>
                      ))}
                      <time
                        dateTime={post.date}
                        className="text-purple-950 min-w-fit w-fit h-fit px-3 py-2 rounded-full bg-purple-50 text-sm"
                      >
                        {formatCustomDate(post.date)}
                      </time>
                    </div>
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
