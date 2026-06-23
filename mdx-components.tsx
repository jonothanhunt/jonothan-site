import type { MDXComponents } from "mdx/types";
import Image from "next/image";



import React from "react";
import Gif from "./src/components/Gif";
import YouTube from "./src/components/YouTube";
import TikTok from "./src/components/TikTok";
import { SandpackEmbed } from "./src/components/SandpackEmbed";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Override HTML elements
    h1: ({ children }) => (
      <h1 className="font-[family-name:var(--font-lastik)] text-3xl text-black text-pretty pt-4 pb-5">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="font-bold text-2xl text-black text-pretty pb-5 pt-4">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl text-black text-pretty pb-5">{children}</h3>
    ),
    p: ({ children }) => <p className="text-pretty text-lg pb-5">{children}</p>,
    a: ({ children, href }) => (
      <a
        className="text-black text-pretty hover:text-purple-700 underline underline-offset-4"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    ul: ({ children }) => (
      <ul className="list-disc pl-8 pb-5 leading-relaxed space-y-1 text-lg">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal pl-8 pb-5 leading-relaxed space-y-1 text-lg">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="pl-1 text-lg">{children}</li>,
    img: (props) => {
      if (typeof props.src === 'string' && props.src.endsWith('.gif')) {
        return <Gif src={props.src} alt={props.alt || ""} />;
      }
      return (
        <Image
          width={1200}
          height={0}
          sizes="100vw"
          style={{ width: "100%", height: "auto" }}
          alt={props.alt || ""}
          {...props}
        />
      );
    },
    pre: ({ children }) => (
      <pre className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md overflow-auto">
        {children}
      </pre>
    ),
    blockquote: ({ children }) => (
      <blockquote 
        className="border-l-[6px] pl-6 py-2 italic my-6 text-gray-700 font-medium text-xl" 
        style={{ borderColor: 'var(--article-accent, #6b7280)' }}
      >
        {children}
      </blockquote>
    ),
    // Custom MDX component for Sandpack embeds
    SandpackEmbed,
    Gif,
    YouTube,
    TikTok,
    ...components,
  };
}
