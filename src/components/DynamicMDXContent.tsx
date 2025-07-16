"use client";

import { useState, useEffect } from "react";
import type { ComponentType } from "react";

export function DynamicMDXContent({ slug }: { slug: string }) {
  const [Component, setComponent] = useState<ComponentType | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isUnmounting, setIsUnmounting] = useState(false);

  // Handle component loading
  useEffect(() => {
    setIsMounted(false);
    setIsUnmounting(false);
    setComponent(null);

    import(`@/content/things/${slug}.mdx`).then((mod) => {
      setComponent(() => mod.default);
    });

    return () => {
      setIsUnmounting(true);
    };
  }, [slug]);

  // Handle mounting after component is loaded
  useEffect(() => {
    if (Component) {
      const timer = setTimeout(() => {
        setIsMounted(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [Component]);

  return (
    <div
      className={`px-5  transition-all duration-1000 ease-in-out ${
        Component && isMounted && !isUnmounting
          ? "max-h-[20000px] opacity-100"
          : "max-h-0 opacity-0 overflow-hidden"
      }`}
    >
      <div className="pt-5">{Component && <Component />}</div>
    </div>
  );
}
