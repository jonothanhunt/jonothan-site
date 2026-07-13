"use client";

import { useState, useMemo, useEffect, useRef, Suspense, memo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ThingMetadata, ThingType } from "@/types/thing";
import { formatCustomDate } from "@/utils/formatDate";
import { DynamicMDXContent } from "@/components/DynamicMDXContent";
import { BlogListFilters } from "@/components/BlogListFilters";
import { createGlowEffect, GlowEffect } from "@/utils/glowEffect";
import { PLAYFUL_THEMES, Theme } from "@/utils/colorUtils";
import { ProgressiveBlur } from "@/components/ProgressiveBlur";

interface BlogListProps {
  initialPosts: (ThingMetadata & { slug: string })[];
  selectedSlug?: string;
}

const areCardHeaderPropsEqual = (
  prevProps: {
    post: ThingMetadata & { slug: string };
    glowHandlers: ReturnType<typeof createGlowEffect>;
    isPriority: boolean;
    theme: Theme;
    onTogglePost: (slug: string) => void;
  },
  nextProps: {
    post: ThingMetadata & { slug: string };
    glowHandlers: ReturnType<typeof createGlowEffect>;
    isPriority: boolean;
    theme: Theme;
    onTogglePost: (slug: string) => void;
  }
) => {
  return (
    prevProps.post.slug === nextProps.post.slug &&
    prevProps.glowHandlers === nextProps.glowHandlers &&
    prevProps.isPriority === nextProps.isPriority &&
    prevProps.theme.name === nextProps.theme.name &&
    prevProps.onTogglePost === nextProps.onTogglePost
  );
};

const CardHeader = memo(
  ({
    post,
    glowHandlers,
    isPriority,
    theme,
    onTogglePost,
  }: {
    post: ThingMetadata & { slug: string };
    glowHandlers: ReturnType<typeof createGlowEffect>;
    isPriority: boolean;
    theme: Theme;
    onTogglePost: (slug: string) => void;
  }) => {
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (cardRef.current && cardRef.current.dataset.hovered === "true") {
        const glowElement = cardRef.current.querySelector(".glow-effect") as HTMLElement;
        if (glowElement && glowElement.style.opacity !== "1") {
          glowElement.style.opacity = "1";
        }
      }
    });

    const handleClick = (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest("a")) return;
      if (cardRef.current) {
        cardRef.current.dataset.clicking = "true";
        cardRef.current.dataset.hovered = "true";
        const glowElement = cardRef.current.querySelector(".glow-effect") as HTMLElement;
        if (glowElement) {
          glowElement.style.opacity = "1";
        }
        setTimeout(() => {
          if (cardRef.current) {
            delete cardRef.current.dataset.clicking;
          }
        }, 1500);
      }
      onTogglePost(post.slug);
    };

    return (
      <div
        ref={cardRef}
        role="button"
        tabIndex={0}
        aria-label={`Blog post: ${post.title}`}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ")
            handleClick(e as unknown as React.MouseEvent);
        }}
        className={
          post.image
            ? `relative block rounded-4xl cursor-pointer group overflow-hidden transition-all duration-300 ${theme.bg}`
            : `relative block rounded-4xl cursor-pointer group overflow-hidden transition-all duration-300 ${theme.bg}`
        }
        {...glowHandlers}
      >
        <div
          className={`relative flex flex-col justify-end p-4 ${
            post.image ? "min-h-60" : "min-h-48"
          }`}
        >
          {post.image ? (
            <>
              <Image
                src={post.image}
                alt=""
                aria-hidden="true"
                fill
                style={{ objectFit: "cover", objectPosition: "center" }}
                className="z-0"
                sizes="(max-width: 640px) 100vw, 512px"
                priority={isPriority}
              />
              <ProgressiveBlur />
              <div
                className={`absolute top-0 left-0 w-full h-full bg-gradient-to-b ${theme.gradientOverlay} z-10 pointer-events-none`}
              />
            </>
          ) : null}

          {/* Cursor Glow Effect - now above background but below content */}
          <GlowEffect className="absolute inset-0 z-10 pointer-events-none rounded-4xl" />

          {/* Top right: links if present (temporarily commented out)
          {post.links && post.links.length > 0 ? (
            <div className="z-10 w-full relative flex justify-end gap-2 self-start mb-4">
              {post.links.map((link) => (
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="ml-1"
                    style={{ display: "block" }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7 17L17 7M7 7h10v10"
                    />
                  </svg>
                </Link>
              ))}
            </div>
          ) : null}
          */}

          {/* Bottom: tags + title right above, exactly matching Bento card style */}
          <div className="relative z-10 mt-auto flex flex-col gap-1.5 font-w-70">
            <div className={`flex flex-wrap items-center gap-2 text-sm font-normal uppercase ${theme.cardText}`}>
              {post.type.map((type) => (
                <span key={type} className="flex items-center gap-2">
                  <span>{type}</span>
                  <span>•</span>
                </span>
              ))}
              <time dateTime={post.date}>{formatCustomDate(post.date)}</time>
            </div>
            <h2 className={`font-[family-name:var(--font-lastik)] font-w-70 text-3xl ${theme.cardText} text-balance`}>
              {post.title}
            </h2>
          </div>
        </div>
      </div>
    );
  },
  areCardHeaderPropsEqual
);

CardHeader.displayName = "CardHeader";

// Custom comparison function to prevent unnecessary re-renders of ArticleItem
const arePropsEqual = (
  prevProps: {
    post: ThingMetadata & { slug: string };
    isSelected: boolean;
    selectedPostRef: React.RefObject<HTMLElement | null> | null;
    glowHandlers: ReturnType<typeof createGlowEffect>;
    isPriority: boolean;
    theme: Theme;
    onTogglePost: (slug: string) => void;
  },
  nextProps: {
    post: ThingMetadata & { slug: string };
    isSelected: boolean;
    selectedPostRef: React.RefObject<HTMLElement | null> | null;
    glowHandlers: ReturnType<typeof createGlowEffect>;
    isPriority: boolean;
    theme: Theme;
    onTogglePost: (slug: string) => void;
  }
) => {
  return (
    prevProps.post.slug === nextProps.post.slug &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.glowHandlers === nextProps.glowHandlers &&
    prevProps.isPriority === nextProps.isPriority &&
    prevProps.theme.name === nextProps.theme.name &&
    prevProps.onTogglePost === nextProps.onTogglePost
  );
};

// Memoized article component
const ArticleItem = memo(
  ({
    post,
    isSelected,
    selectedPostRef,
    glowHandlers,
    isPriority,
    theme,
    onTogglePost,
  }: {
    post: ThingMetadata & { slug: string };
    isSelected: boolean;
    selectedPostRef: React.RefObject<HTMLElement | null> | null;
    glowHandlers: ReturnType<typeof createGlowEffect>;
    isPriority: boolean;
    theme: Theme;
    onTogglePost: (slug: string) => void;
  }) => {
    const articleRef = useRef<HTMLElement>(null);

    useEffect(() => {
      if (articleRef.current) {
        const cardEl = articleRef.current.querySelector('[role="button"]') as HTMLElement;
        if (cardEl && (cardEl.dataset.hovered === "true" || cardEl.dataset.clicking === "true")) {
          const glowElement = cardEl.querySelector(".glow-effect") as HTMLElement;
          if (glowElement && glowElement.style.opacity !== "1") {
            glowElement.style.opacity = "1";
          }
        }
      }
    }, [isSelected]);

    return (
      <article
        key={post.slug}
        ref={(el) => {
          articleRef.current = el;
          if (isSelected && selectedPostRef) {
            (selectedPostRef as React.MutableRefObject<HTMLElement | null>).current = el;
          }
        }}
      >
        <CardHeader
          post={post}
          glowHandlers={glowHandlers}
          isPriority={isPriority}
          theme={theme}
          onTogglePost={onTogglePost}
        />
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

export function BlogList({ initialPosts, selectedSlug }: BlogListProps) {
  const router = useRouter();
  const selectedPostRef = useRef<HTMLElement>(null);
  const [selectedTypes, setSelectedTypes] = useState<ThingType[]>([]);
  const glowHandlersRef = useRef<ReturnType<typeof createGlowEffect> | null>(
    null
  );

  if (!glowHandlersRef.current) {
    glowHandlersRef.current = createGlowEffect();
  }

  const glowHandlers = glowHandlersRef.current;

  const handleTogglePost = useCallback(
    (slug: string) => {
      const isCurrentlySelected =
        typeof window !== "undefined" &&
        window.location.pathname.includes(`/blog/${slug}`);
      router.push(
        isCurrentlySelected
          ? "/blog"
          : `/blog/${slug}` +
            (typeof window !== "undefined" ? window.location.search : ""),
        { scroll: false }
      );
    },
    [router]
  );

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
                onTogglePost={handleTogglePost}
              />
            );
          })}
        </div>
      </div>
    </main>
  );
}
