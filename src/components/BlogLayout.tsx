import { ReactNode } from "react";

type BlogLayoutProps = {
  children: ReactNode;
  metadata: {
    title: string;
    date: string;
    excerpt: string;
  };
};

export default function BlogLayout({ children, metadata }: BlogLayoutProps) {
  return (
    <article className="prose lg:prose-xl mx-auto">
      <h1 className="font-[family-name:var(--font-lastik)] text-3xl text-purple-950 text-pretty">
        {metadata.title}
      </h1>
      <p className="text-gray-500">
        {new Date(metadata.date).toLocaleDateString()}
      </p>
      {children}
    </article>
  );
}
