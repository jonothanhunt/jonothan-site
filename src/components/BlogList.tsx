"use client";

import { useState, useMemo, useEffect, useRef, Suspense, memo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ThingMetadata, ThingType } from "@/types/thing";
import { formatCustomDate, getYear } from "@/utils/formatDate";
import { DynamicMDXContent } from "@/components/DynamicMDXContent";
import { BlogListFilters } from "@/components/BlogListFilters";
import { createGlowEffect, GlowEffect } from "@/utils/glowEffect";
import { PLAYFUL_THEMES, Theme } from "@/utils/colorUtils";

interface BlogListProps {
  initialPosts: (ThingMetadata & { slug: string })[];
  selectedSlug?: string;
}

// Custom comparison function to prevent unnecessary re-renders
const arePropsEqual = (
  prevProps: {
    post: ThingMetadata & { slug: string };
    isSelected: boolean;
    selectedPostRef: React.RefObject<HTMLDivElement | null> | null;
    glowHandlers: ReturnType<typeof createGlowEffect>;
    isPriority: boolean;
    theme: Theme;
  },
  nextProps: {
    post: ThingMetadata & { slug: string };
    isSelected: boolean;
    selectedPostRef: React.RefObject<HTMLDivElement | null> | null;
    glowHandlers: ReturnType<typeof createGlowEffect>;
    isPriority: boolean;
    theme: Theme;
  }
) => {
  return (
    prevProps.post.slug === nextProps.post.slug &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.glowHandlers === nextProps.glowHandlers &&
    prevProps.isPriority === nextProps.isPriority &&
    prevProps.theme.name === nextProps.theme.name
  );
};

// Memoized article component to prevent unnecessary re-renders
const ArticleItem = memo(
  ({
    post,
    isSelected,
    selectedPostRef,
    glowHandlers,
    isPriority,
    theme,
  }: {
    post: ThingMetadata & { slug: string };
    isSelected: boolean;
    selectedPostRef: React.RefObject<HTMLDivElement | null> | null;
    glowHandlers: ReturnType<typeof createGlowEffect>;
    isPriority: boolean;
    theme: Theme;
  }) => {
    return (
      <article
        key={post.slug}
        ref={isSelected ? selectedPostRef : undefined}
        className={`${post.image ? "min-h-42" : ""}`}
      >
        <CardDiv
          post={post}
          isSelected={isSelected}
          ariaLabel={`${isSelected ? "Close" : "Open"} blog post: ${post.title}`}
          className={`relative block rounded-4xl cursor-pointer group overflow-clip transition-all duration-300 ${theme.bg} hover:brightness-95 ${post.image ? "min-h-48" : ""}`}
          {...glowHandlers}
        >
          {/* Background image with gradient overlay, matching bento style */}
          {post.image && (
            <>
              <Image
                src={post.image}
                alt=""
                aria-hidden="true"
                fill
                className="absolute inset-0 object-cover z-0"
                sizes="(max-width: 640px) 100vw, 512px"
                quality={30}
                priority={isPriority}
              />
              <div className="absolute inset-0 z-10" style={{ background: `linear-gradient(to bottom, transparent 0%, rgba(${theme.bgRgb}, 0.5) 35%, rgba(${theme.bgRgb}, 0.85) 60%, rgb(${theme.bgRgb}) 100%)` }} />
            </>
          )}

          <GlowEffect className="absolute inset-0 z-20 pointer-events-none" />

          <div className={`relative z-30 flex flex-col justify-between p-4 ${post.image ? "min-h-48" : ""}`}>
            {/* Top: date pill + links */}
            <div className="flex flex-wrap justify-start items-start gap-2 w-full" aria-label="Post metadata">
              <time
                dateTime={post.date}
                className={`${theme.text} w-fit px-4 py-2 rounded-2xl text-sm font-normal uppercase flex items-center ${theme.pillBg} backdrop-blur-md`}
              >
                {formatCustomDate(post.date)}
              </time>

              <div className="flex-1" />

              {post.links && post.links.length > 0 && post.links.map((link) => (
                <Link
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-1 px-4 py-2 rounded-2xl text-sm font-normal uppercase text-white ${theme.accent} backdrop-blur-md hover:-translate-y-0.5 transition-all duration-200`}
                  style={{ textDecoration: "none" }}
                  aria-label={`External link: ${link.title}`}
                >
                  <span>{link.title}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" className="ml-1" style={{ display: "block" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M7 7h10v10" />
                  </svg>
                </Link>
              ))}
            </div>

            {/* Bottom: title */}
            <h2
              className={`font-[family-name:var(--font-lastik)] font-w-70 text-2xl ${theme.text} text-balance mt-6`}
              tabIndex={isSelected ? 0 : -1}
              ref={(node) => {
                if (node && isSelected) {
                  node.setAttribute("tabindex", "0");
                  if (window.location.pathname.includes(post.slug || "")) {
                    requestAnimationFrame(() => {
                      node.focus({ preventScroll: true });
                      node.blur();
                    });
                  }
                }
              }}
            >
              {post.title}
            </h2>
          </div>
        </CardDiv>
        {isSelected && (
          <section aria-label="Blog post content">
            <DynamicMDXContent slug={post.slug} />
          </section>
        )}
      </article>
    );
  },
  arePropsEqual
);

ArticleItem.displayName = "ArticleItem";

// CardDiv: a div that acts as a clickable card for navigation
import { useRouter } from "next/navigation";
import { ReactNode, HTMLAttributes } from "react";
interface CardDivProps extends HTMLAttributes<HTMLDivElement> {
  post: ThingMetadata & { slug: string };
  isSelected: boolean;
  ariaLabel: string;
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
}
function CardDiv({
  post,
  isSelected,
  ariaLabel,
  className,
  style,
  children,
  ...rest
}: CardDivProps) {
  const router = useRouter();
  const handleClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking a link inside the card
    if ((e.target as HTMLElement).closest("a")) return;
    router.push(
      isSelected
        ? "/blog"
        : `/blog/${post.slug}` +
        (typeof window !== "undefined" ? window.location.search : ""),
      { scroll: false }
    );
  };
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      className={className}
      style={style}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(
            isSelected
              ? "/blog"
              : `/blog/${post.slug}` +
              (typeof window !== "undefined" ? window.location.search : ""),
            { scroll: false }
          );
        }
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

export function BlogList({ initialPosts }: BlogListProps) {
  const pathname = usePathname();
  const selectedSlug = pathname.startsWith("/blog/") ? pathname.slice("/blog/".length) : undefined;
  const selectedPostRef = useRef<HTMLDivElement>(null);
  const [selectedTypes, setSelectedTypes] = useState<ThingType[]>([]);
  const glowHandlersRef = useRef<ReturnType<typeof createGlowEffect> | null>(
    null
  );

  if (!glowHandlersRef.current) {
    glowHandlersRef.current = createGlowEffect();
  }

  const glowHandlers = glowHandlersRef.current;

  const listRef = useRef<HTMLDivElement>(null);

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

  const revealedElements = useRef<Set<Element>>(new Set());

  useEffect(() => {
    const elements = listRef.current?.querySelectorAll(".reveal-on-scroll");
    if (!elements) return;

    // Restore revealed state for already-seen elements, pre-mark visible ones
    elements.forEach((el) => {
      if (revealedElements.current.has(el)) {
        el.classList.add("revealed");
        el.classList.remove("exit-up");
        return;
      }
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add("revealed");
        revealedElements.current.add(el);
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            entry.target.classList.remove("exit-up");
            revealedElements.current.add(entry.target);
          } else {
            entry.target.classList.remove("revealed");
            if (entry.boundingClientRect.top < 0) {
              entry.target.classList.add("exit-up");
            } else {
              entry.target.classList.remove("exit-up");
            }
          }
        });
      },
      { rootMargin: "0px 0px -60px 0px" },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [filteredPosts]);

  return (
    <main ref={listRef} className="blog-list" role="main" aria-label="Blog posts">
      <div className="h-24" />
      <Suspense fallback={<div className="h-12" />}>
        <div className="reveal-on-scroll" suppressHydrationWarning>
          <BlogListFilters
            availableTypes={availableTypes}
            onFiltersChange={setSelectedTypes}
          />
        </div>
      </Suspense>
      <div className="container max-w-3xl mx-auto pb-8 px-4 font-[family-name:var(--font-hyperlegible)]">
        <div className="space-y-8" role="feed" aria-label="Blog posts list">
          {filteredPosts.map((post, idx) => {
            const isSelected = post.slug === selectedSlug;
            const isPriority = idx < 5;
            const theme = PLAYFUL_THEMES[idx % PLAYFUL_THEMES.length];
            const year = getYear(post.date);
            const prevYear = idx > 0 ? getYear(filteredPosts[idx - 1].date) : null;
            const showYearDivider = prevYear !== null && year !== prevYear;

            const showTopYear = idx === 0;

            return (
              <div key={post.slug} className="reveal-on-scroll" suppressHydrationWarning>
                {(showTopYear || showYearDivider) && (
                  <div className="pt-4 pb-8 flex items-center gap-4">
                    <svg className={`flex-1 ${theme.accentText} opacity-50`} height="24" xmlns="http://www.w3.org/2000/svg" style={{ transform: "scaleX(-1)" }}>
                      <defs>
                        <pattern id={`squiggle-l-${year}-${idx}`} x="0" y="0" width="28" height="24" patternUnits="userSpaceOnUse">
                          <path d="M0 12 Q7 3 14 12 Q21 21 28 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="24" fill={`url(#squiggle-l-${year}-${idx})`} />
                    </svg>
                    <span className={`${theme.accentText} text-xl font-medium uppercase shrink-0`}>{year}</span>
                    <svg className={`flex-1 ${theme.accentText} opacity-50`} height="24" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id={`squiggle-r-${year}-${idx}`} x="0" y="0" width="28" height="24" patternUnits="userSpaceOnUse">
                          <path d="M0 12 Q7 3 14 12 Q21 21 28 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="24" fill={`url(#squiggle-r-${year}-${idx})`} />
                    </svg>
                  </div>
                )}
                <ArticleItem
                  post={post}
                  isSelected={isSelected}
                  selectedPostRef={isSelected ? selectedPostRef : null}
                  glowHandlers={glowHandlers}
                  isPriority={isPriority}
                  theme={theme}
                />
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
