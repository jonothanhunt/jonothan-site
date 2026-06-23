"use client";

import { useState, useMemo, useEffect, useRef, Suspense, memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ThingMetadata, ThingType } from "@/types/thing";
import { formatCustomDate } from "@/utils/formatDate";
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
          ariaLabel={`${isSelected ? "Close" : "Open"} blog post: ${post.title
            }`}
          className={
            post.image
              ? `relative block rounded-xl cursor-pointer group shadow-xl ${theme.shadow} hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ${theme.bg} ${theme.border} border`
              : `block rounded-xl cursor-pointer group shadow-xl ${theme.shadow} hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ${theme.bg} ${theme.border} border`
          }
          {...glowHandlers}
        >
          <div
            className={`relative flex flex-col p-6 ${post.image ? "min-h-42" : ""
              }`}
          >
            {post.image ? (
              <Image
                src={post.image}
                alt=""
                aria-hidden="true"
                fill
                className="absolute inset-0 rounded-xl object-cover opacity-60 mix-blend-overlay"
                sizes="(max-width: 640px) 100vw, 512px"
                priority={isPriority}
              />
            ) : null}

            {/* Cursor Glow Effect - now above background but below content */}
            <GlowEffect className="absolute inset-0 z-10 pointer-events-none" />

            {/* Metadata tags and date - always top left */}
            <div
              className="z-10 w-full relative flex flex-wrap gap-2 self-start"
              aria-label="Post metadata"
            >
              <div
                className="z-10 relative flex flex-wrap justify-start items-start gap-2 w-full"
                aria-label="Post metadata"
              >
                {/* Left: tags and date */}
                {post.type.map((type) => (
                  <span
                    key={type}
                    role="tag"
                    className={`${theme.text} w-fit px-4 py-2 rounded-2xl text-sm font-normal uppercase flex items-center ${theme.pillBg} backdrop-blur-md`}
                  >
                    {type}
                  </span>
                ))}
                <time
                  dateTime={post.date}
                  className={`${theme.text} w-fit px-4 py-2 rounded-2xl text-sm font-normal uppercase flex items-center ${theme.pillBg} backdrop-blur-md`}
                >
                  {formatCustomDate(post.date)}
                </time>

                <div className="flex-1" />

                {/* Right: links */}
                {post.links &&
                  post.links.length > 0 &&
                  post.links.map((link) => (
                    <Link
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-1 px-4 py-2 rounded-2xl text-sm font-normal uppercase text-white ${theme.accent} backdrop-blur-md hover:-translate-y-0.5 transition-all duration-200 shadow-md ${theme.accentShadow}`}
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
            </div>

            {/* Title - always after metadata with guaranteed gap */}
            <h2
              className={`relative z-10 font-[family-name:var(--font-lastik)] font-w-70 text-3xl ${theme.text} text-balance ${post.image ? "mt-12" : "mt-6"
                }`}
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
          <section 
            aria-label="Blog post content"
            style={{ '--article-accent': theme.accentColorHex } as React.CSSProperties}
          >
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
        if (e.key === "Enter" || e.key === " ")
          handleClick(e as unknown as React.MouseEvent);
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

export function BlogList({ initialPosts, selectedSlug }: BlogListProps) {
  const selectedPostRef = useRef<HTMLDivElement>(null);
  const [selectedTypes, setSelectedTypes] = useState<ThingType[]>([]);
  const glowHandlersRef = useRef<ReturnType<typeof createGlowEffect> | null>(
    null
  );

  if (!glowHandlersRef.current) {
    glowHandlersRef.current = createGlowEffect();
  }

  const glowHandlers = glowHandlersRef.current;

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
      <div className="h-24" />
      <Suspense>
        <BlogListFilters
          availableTypes={availableTypes}
          onFiltersChange={setSelectedTypes}
        />
      </Suspense>
      <div className="container max-w-3xl mx-auto pb-8 px-4 font-[family-name:var(--font-hyperlegible)]">
        <div className="space-y-8" role="feed" aria-label="Blog posts list">
          {filteredPosts.map((post, idx) => {
            const isSelected = post.slug === selectedSlug;
            const isPriority = idx < 5; // prioritize above-the-fold images
            const theme = PLAYFUL_THEMES[idx % PLAYFUL_THEMES.length];

            return (
              <ArticleItem
                key={post.slug}
                post={post}
                isSelected={isSelected}
                selectedPostRef={isSelected ? selectedPostRef : null}
                glowHandlers={glowHandlers}
                isPriority={isPriority}
                theme={theme}
              />
            );
          })}
        </div>
      </div>
    </main>
  );
}
