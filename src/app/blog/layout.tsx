import fs from "fs";
import path from "path";
import { BlogList } from "@/components/BlogList";

async function getBlogPosts() {
  const postsDirectory = path.join(process.cwd(), "src/content/blog");
  const filenames = fs.readdirSync(postsDirectory);

  const posts = await Promise.all(
    filenames
      .filter((filename) => filename.endsWith(".mdx") || filename.endsWith(".md"))
      .map(async (filename) => {
        const slug = filename.replace(/\.(mdx|md)$/, "");
        try {
          const { metadata } = await import(`@/content/blog/${slug}.mdx`);
          return { slug, ...metadata };
        } catch {
          return { slug, title: slug, date: new Date().toISOString(), excerpt: "", type: "Post" };
        }
      })
  );

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export default async function BlogLayout({ children }: { children: React.ReactNode }) {
  const posts = await getBlogPosts();
  const lcpImage = posts[0]?.image as string | undefined;

  return (
    <>
      <BlogList initialPosts={posts} />
      <div className="hidden">{children}</div>
    </>
  );
}
