"use client";

import { useState, useEffect } from "react";
import type { ComponentType } from "react";

type LoadState = "idle" | "loading" | "ready" | "error";

export function DynamicMDXContent({ slug }: { slug: string }) {
  const [Component, setComponent] = useState<ComponentType | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [isMounted, setIsMounted] = useState(false);
  const [isUnmounting, setIsUnmounting] = useState(false);

  useEffect(() => {
    setIsMounted(false);
    setIsUnmounting(false);
    setComponent(null);
    setLoadState("loading");

    import(`@/content/things/${slug}.mdx`)
      .then((mod) => {
        if (typeof mod.default !== "function" && typeof mod.default !== "object") {
          setLoadState("error");
          return;
        }
        setComponent(() => mod.default);
        setLoadState("ready");
      })
      .catch(() => {
        setLoadState("error");
      });

    return () => {
      setIsUnmounting(true);
    };
  }, [slug]);

  useEffect(() => {
    if (loadState === "ready") {
      const timer = setTimeout(() => {
        setIsMounted(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loadState]);

  if (loadState === "error") {
    return (
      <div className="px-5 py-4 text-purple-700 text-sm">
        This post couldn&apos;t be loaded. Please try refreshing the page.
      </div>
    );
  }

  return (
    <div
      className={`px-5 transition-all duration-1000 ease-in-out ${
        Component && isMounted && !isUnmounting
          ? "max-h-[20000px] opacity-100"
          : "max-h-0 opacity-0 overflow-hidden"
      }`}
    >
      <div className="pt-5">{Component && <Component />}</div>
    </div>
  );
}
