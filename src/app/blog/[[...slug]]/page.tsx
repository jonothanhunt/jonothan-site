import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";

import Link from "next/link";
import { formatCustomDate } from "@/utils/formatDate";
import { DynamicMDXContent } from "@/components/DynamicMDXContent";

// Helper function to get all blog posts with metadata
async function getThings() {
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

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function generateStaticParams() {
  const postsDirectory = path.join(process.cwd(), "src/content/blog");
  const filenames = fs.readdirSync(postsDirectory);

  return filenames
    .filter((filename) => filename.endsWith(".mdx") || filename.endsWith(".md"))
    .map((filename) => ({
      slug: [filename.replace(/\.(mdx|md)$/, "")],
    }));
}

type ThingsParams = { slug?: string[] };

export async function generateMetadata({ params }: { params: ThingsParams }) {
  const awaitedParams = await params;
  if (!awaitedParams.slug) {
    return {
      title: "Things",
      description: "Things I've made.",
    };
  }

  const slug = awaitedParams.slug[0];
  try {
    const { metadata } = await import(`@/content/blog/${slug}.mdx`);
    return {
      title: metadata.title,
      description: metadata.excerpt || "",
    };
  } catch {
    return notFound();
  }
}

export default async function Thing({ params }: { params: ThingsParams }) {
  const posts = await getThings();
  const awaitedParams = await params;
  const selectedSlug = awaitedParams.slug?.[0];

  return (
    <div className="">
      <div className="h-42" />
      <div className="container max-w-3xl mx-auto py-8 px-4 font-[family-name:var(--font-hyperlegible)]">
        <div className="space-y-8">
          {posts.map((post) => {
            const isSelected = post.slug === selectedSlug;

            return (
              <div
                key={post.slug}
              >
                <div>
                  <Link
                    href={isSelected ? "/blog" : `/blog/${post.slug}`}
                    className="block"
                  >
                    <div className="border-purple-200 rounded-4xl overflow-clip shadow-xl shadow-purple-950/10 transition-all duration-1000">
                      <div
                        className={`flex flex-col-reverse p-5 sm:flex-row gap-2 justify-between bg-gradient-to-br sm:bg-gradient-to-bl from-purple-300/20 via-purple-100 to-purple-100 transition-all duration-1000 ${
                          isSelected
                            ? "rounded-t-4xl rounded-b-none"
                            : "rounded-t-4xl rounded-b-4xl"
                        }`}
                      >
                        <h2 className="font-[family-name:var(--font-lastik)] text-3xl text-purple-950 text-pretty">
                          {post.title}
                        </h2>
                        <p className="text-purple-950 min-w-fit w-fit h-fit px-3 py-2 rounded-full bg-pink-200/70 shadow-xl shadow-purple-950/20 text-sm">
                          {formatCustomDate(post.date)}
                        </p>
                      </div>
                      {isSelected && <DynamicMDXContent slug={post.slug} />}
                    </div>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
