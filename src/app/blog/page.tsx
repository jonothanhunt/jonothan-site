import fs from "fs";
import path from "path";
import Link from "next/link";
import { formatCustomDate } from "@/utils/formatDate";

// Helper function to get all blog posts with metadata
async function getBlogPosts() {
  const postsDirectory = path.join(process.cwd(), "src/content/blog");
  const filenames = fs.readdirSync(postsDirectory);

  const posts = await Promise.all(
    filenames
      .filter(
        (filename) => filename.endsWith(".mdx") || filename.endsWith(".md")
      )
      .map(async (filename) => {
        const slug = filename.replace(/\.(mdx|md)$/, "");

        try {
          // Import the metadata from each MDX file
          const { metadata } = await import(`@/content/blog/${slug}.mdx`);

          return {
            slug,
            ...metadata,
          };
        } catch (error) {
          console.error(`Error importing ${slug}:`, error);
          return {
            slug,
            title: slug,
            date: new Date().toISOString(),
            excerpt: "",
          };
        }
      })
  );

  // Sort posts by date (newest first)
  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export default async function BlogOverview() {
  const posts = await getBlogPosts();

  return (
    <div className="min-h-screen">
      <div className="h-42" />
      <div className="container max-w-3xl mx-auto py-8 px-4 font-[family-name:var(--font-hyperlegible)]">
        <div className="space-y-8">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="block">
              <div className="border-purple-200 p-5 rounded-4xl bg-gradient-to-br sm:bg-gradient-to-bl from-purple-300/20 via-purple-100 to-purple-100 transition shadow-xl shadow-purple-950/5">
                <div className="flex flex-col-reverse sm:flex-row gap-2 justify-between">
                  <h2 className="font-[family-name:var(--font-lastik)] text-3xl text-purple-950 text-pretty">
                    {post.title}
                  </h2>
                  <p className="text-purple-950 min-w-fit w-fit h-fit px-3 py-2 rounded-full bg-pink-200/70 shadow-xl shadow-purple-950/20 text-sm">
                    {formatCustomDate(post.date)}
                  </p>
                </div>
                {/* <p className="mt-2">{post.excerpt}</p> */}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
