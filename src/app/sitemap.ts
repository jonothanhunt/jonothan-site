import type { MetadataRoute } from "next";
import fs from "fs";
import path from "path";

async function getBlogSlugs(): Promise<string[]> {
  const postsDirectory = path.join(process.cwd(), "src/content/blog");
  try {
    const filenames = fs.readdirSync(postsDirectory);
    return filenames
      .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
      .map((f) => f.replace(/\.(mdx|md)$/, ""));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getBlogSlugs();

  const blogPosts: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `https://jonothan.dev/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    {
      url: "https://jonothan.dev",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
    {
      url: "https://jonothan.dev/blog",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    ...blogPosts,
  ];
}
