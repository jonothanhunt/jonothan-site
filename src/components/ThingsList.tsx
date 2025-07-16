"use client";

import { useState, useMemo, useEffect, useRef, Suspense, memo } from "react";
import Link from "next/link";
import { ThingMetadata, ThingType } from "@/types/thing";
import { formatCustomDate } from "@/utils/formatDate";
import { DynamicMDXContent } from "@/components/DynamicMDXContent";
import { ThingsListFilters } from "@/components/ThingsListFilters";
import { createGlowEffect, GlowEffect } from "@/utils/glowEffect";

interface ThingsListProps {
  initialPosts: (ThingMetadata & { slug: string })[];
  selectedSlug?: string;
}

// Custom comparison function to prevent unnecessary re-renders
const arePropsEqual = (
  prevProps: { post: ThingMetadata & { slug: string }; isSelected: boolean; selectedPostRef: React.RefObject<HTMLDivElement | null> | null; glowHandlers: ReturnType<typeof createGlowEffect> },
  nextProps: { post: ThingMetadata & { slug: string }; isSelected: boolean; selectedPostRef: React.RefObject<HTMLDivElement | null> | null; glowHandlers: ReturnType<typeof createGlowEffect> }
) => {
  return (
    prevProps.post.slug === nextProps.post.slug &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.glowHandlers === nextProps.glowHandlers
  );
};

// Memoized article component to prevent unnecessary re-renders
const ArticleItem = memo(({ 
  post, 
  isSelected, 
  selectedPostRef, 
  glowHandlers 
}: {
  post: ThingMetadata & { slug: string };
  isSelected: boolean;
  selectedPostRef: React.RefObject<HTMLDivElement | null> | null;
  glowHandlers: ReturnType<typeof createGlowEffect>;
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
        className={post.image ? "relative block rounded-xl cursor-pointer group shadow-2xl shadow-pink-900/10" : "block rounded-xl cursor-pointer group shadow-2xl shadow-pink-900/10"}
        style={post.image ? {
          backgroundImage: `url(${post.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        } : undefined}
        {...glowHandlers}
      >
        <div className={`relative flex flex-col p-5 ${post.image ? "min-h-42" : ""}`}>
          {/* Combined background overlay for images */}
          {post.image ? (
            <div 
              className="absolute inset-0 rounded-xl border border-white z-0"
              style={{
                background: 'linear-gradient(25deg, rgb(243 232 255) 0%, rgb(243 232 255 / 1.0) 30%, rgb(243 232 255 / 0.95) 60%, rgb(243 232 255 / 0.9) 85%)'
              }}
            />
          ) : (
            <div className="absolute inset-0 rounded-xl border border-white bg-white/20 -z-10" />
          )}

          {/* Cursor Glow Effect - now above background but below content */}
          <GlowEffect className="absolute inset-0 z-10 pointer-events-none" />
          {/* Metadata tags and date - always top left */}
          <div className="z-10 relative flex flex-wrap gap-2 self-start" aria-label="Post metadata">
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

          {/* Links chips - top right */}
          {post.links && post.links.length > 0 && (
            <div className="absolute top-5 right-5 z-20 flex flex-wrap gap-1 self-end">
              {post.links.map((link) => (
                <Link
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm font-normal text-purple-950 bg-blue-100/80 hover:bg-blue-50 shadow-xl shadow-blue-900/10 transition-colors duration-200 border border-white/50`}
                  style={{ textDecoration: 'none' }}
                  aria-label={`External link: ${link.title}`}
                >
                  {link.title}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="ml-1"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M7 7h10v10" />
                  </svg>
                </Link>
              ))}
            </div>
          )}

          {/* Title - always after metadata with guaranteed gap */}
          <h2
            className={`relative z-10 font-[family-name:var(--font-lastik)] font-w-70 text-3xl text-purple-950 text-balance ${
              post.image ? "mt-12" : "mt-4"
            }`}
            tabIndex={isSelected ? 0 : -1}
            ref={(node) => {
              if (node && isSelected) {
                node.setAttribute("tabindex", "0");
                if (
                  window.location.pathname.includes(
                    post.slug || ""
                  )
                ) {
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
}, arePropsEqual);


ArticleItem.displayName = 'ArticleItem';

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
function CardDiv({ post, isSelected, ariaLabel, className, style, children, ...rest }: CardDivProps) {
  const router = useRouter();
  const handleClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking a link inside the card
    if ((e.target as HTMLElement).closest('a')) return;
    router.push(isSelected ? "/things" : `/things/${post.slug}` + (typeof window !== "undefined" ? window.location.search : ""), { scroll: false });
  };
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      className={className}
      style={style}
      onClick={handleClick}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") handleClick(e as unknown as React.MouseEvent);
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

export function ThingsList({ initialPosts, selectedSlug }: ThingsListProps) {
  const selectedPostRef = useRef<HTMLDivElement>(null);
  const [selectedTypes, setSelectedTypes] = useState<ThingType[]>([]);
  const glowHandlersRef = useRef<ReturnType<typeof createGlowEffect> | null>(null);
  
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
              <ArticleItem
                key={post.slug}
                post={post}
                isSelected={isSelected}
                selectedPostRef={isSelected ? selectedPostRef : null}
                glowHandlers={glowHandlers}
              />
            );
          })}
        </div>
      </div>
    </main>
  );
}
