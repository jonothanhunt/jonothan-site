'use client';

import { useState, useEffect } from 'react';
import type { ComponentType } from 'react';

export function DynamicMDXContent({ slug }: { slug: string }) {
  const [Component, setComponent] = useState<ComponentType | null>(null);

  useEffect(() => {
    import(`@/content/blog/${slug}.mdx`).then((mod) => {
      setComponent(() => mod.default);
    });
  }, [slug]);

  if (!Component) return null;

  return (
    <div className="p-5 bg-purple-50">
      <Component />
    </div>
  );
}
