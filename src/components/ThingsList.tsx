"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { ThingMetadata, ThingType } from "@/types/thing";
import { formatCustomDate } from "@/utils/formatDate";
import { DynamicMDXContent } from "@/components/DynamicMDXContent";
import FilterChips from "@/components/FilterChips";

interface ThingsListProps {
  initialPosts: (ThingMetadata & { slug: string })[];
  selectedSlug?: string;
}

export function ThingsList({ initialPosts, selectedSlug }: ThingsListProps) {
  const [selectedTypes, setSelectedTypes] = useState<ThingType[]>([]);
  const selectedPostRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     // Only scroll if it's the initial load (URL navigation)
//     const isInitialLoad = window.location.pathname.includes(selectedSlug || '');
//     if (selectedSlug && selectedPostRef.current && isInitialLoad) {
//       // Add a small delay to ensure content is rendered
//       setTimeout(() => {
//         const element = selectedPostRef.current;
//         if (element) {
//           const elementPosition = element.getBoundingClientRect().top;
//           const offsetPosition = elementPosition + window.pageYOffset - 80; // 20 tailwind units = 80px
//           window.scrollTo({
//             top: offsetPosition,
//             behavior: "smooth"
//           });
//         }
//       }, 300);
//     }
//   }, [selectedSlug]);

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

  const handleTypeSelect = (type: ThingType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleClearFilters = () => {
    setSelectedTypes([]);
  };

  return (
    <main className="blog-list" role="main" aria-label="Blog posts">
      <div className="h-42" />
      <div className="container max-w-3xl mx-auto py-8 px-4 font-[family-name:var(--font-hyperlegible)]">
        <FilterChips
          selectedTypes={selectedTypes}
          availableTypes={availableTypes}
          onTypeSelect={handleTypeSelect}
          onClearFilters={handleClearFilters}
        />
        <div className="space-y-8" role="feed" aria-label="Blog posts list">
          {filteredPosts.map((post) => {
            const isSelected = post.slug === selectedSlug;

            return (
              <article
                key={post.slug}
                ref={isSelected ? selectedPostRef : null}
                className="border-purple-200 bg-purple-50 rounded-4xl overflow-clip shadow-xl shadow-purple-900/10 transition-[background-color,box-shadow] duration-300"
                aria-expanded={isSelected}
              >
                <Link 
                  href={isSelected ? "/blog" : `/blog/${post.slug}`}
                  aria-label={`${isSelected ? 'Close' : 'Open'} blog post: ${post.title}`}
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
                      ref={node => {
                        if (node && isSelected) {
                          // Make element programmatically focusable without visible focus ring
                          node.setAttribute('tabindex', '0');
                          // Move focus to the element without visual indication
                          if (window.location.pathname.includes(selectedSlug || '')) {
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
                    <div className="z-10 flex min-w-fit gap-2 " aria-label="Post metadata">
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
