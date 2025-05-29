import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
// import { Suspense } from "react";
import { ThingsList } from "@/components/ThingsList";

// Helper function to get all blog posts with metadata
async function getThings() {
  const postsDirectory = path.join(process.cwd(), "src/content/things");
  const filenames = fs.readdirSync(postsDirectory);

  const posts = await Promise.all(
    filenames
      .filter(
        (filename) => filename.endsWith(".mdx") || filename.endsWith(".md")
      )
      .map(async (filename) => {
        const slug = filename.replace(/\.(mdx|md)$/, "");

        try {
          const { metadata } = await import(`@/content/things/${slug}.mdx`);
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
            type: "Post" // Default type
          };
        }
      })
  );

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function generateStaticParams() {
  const postsDirectory = path.join(process.cwd(), "src/content/things");
  const filenames = fs.readdirSync(postsDirectory);

  return filenames
    .filter((filename) => filename.endsWith(".mdx") || filename.endsWith(".md"))
    .map((filename) => ({
      slug: [filename.replace(/\.(mdx|md)$/, "")],
    }));
}

type ThingsParams = { slug?: string[] };

interface PageProps {
  params: Promise<ThingsParams>;
}

export async function generateMetadata({ params }: PageProps) {
  const awaitedParams = await params;
  if (!awaitedParams.slug) {
    return {
      title: "Things",
      description: "Things I've made.",
    };
  }

  const slug = awaitedParams.slug[0];
  try {
    const { metadata } = await import(`@/content/things/${slug}.mdx`);
    return {
      title: metadata.title,
      description: metadata.excerpt || "",
    };
  } catch {
    return notFound();
  }
}

export default async function Page({ params }: { params: { slug?: string[] } }) {
  const selectedSlug = params.slug?.[0];
  const posts = await getThings();

  if (selectedSlug && !posts.find((post) => post.slug === selectedSlug)) {
    notFound();
  }

  return (
    <div>
      <ThingsList 
        initialPosts={posts} 
        selectedSlug={selectedSlug} 
      />
    </div>
  );
}
