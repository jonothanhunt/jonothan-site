import fs from "fs";
import path from "path";
import { redirect } from "next/navigation";
// import { Suspense } from "react";
import { ThingsList } from "@/components/ThingsList";
import Head from "next/head";

// Helper function to find posts with slug variations (underscore vs dash)
function findPostWithSlugVariations(posts: { slug: string; [key: string]: unknown }[], requestedSlug: string) {
  // First try exact match (current behavior)
  let post = posts.find((post) => post.slug === requestedSlug);
  if (post) return { post, shouldRedirect: false };

  // If no exact match and slug contains underscores, try dash version
  if (requestedSlug.includes('_')) {
    const dashSlug = requestedSlug.replace(/_/g, '-');
    post = posts.find((post) => post.slug === dashSlug);
    if (post) return { post, shouldRedirect: true, redirectSlug: dashSlug };
  }

  return { post: null, shouldRedirect: false };
}

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
            type: "Post", // Default type
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

type Params = Promise<{ slug?: string[] }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  if (!slug) {
    return {
      title: "Things",
      description: "Things I've made.",
    };
  }

  const currentSlug = slug[0];
  try {
    const { metadata } = await import(`@/content/things/${currentSlug}.mdx`);
    return {
      title: metadata.title,
      description: metadata.excerpt || "",
      keywords: [
        "Jonothan Hunt Blog",
        "Jonathan Hunt Blog",
      ],
    };
  } catch {
    // Try to find if there's a dash version of this underscore slug
    if (currentSlug.includes('_')) {
      const dashSlug = currentSlug.replace(/_/g, '-');
      try {
        await import(`@/content/things/${dashSlug}.mdx`);
        redirect(`/things/${dashSlug}`);
      } catch {
        redirect("/things");
      }
    } else {
      redirect("/things");
    }
  }
}

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;
  const selectedSlug = slug?.[0];
  const posts = await getThings();

  if (selectedSlug) {
    const { post, shouldRedirect, redirectSlug } = findPostWithSlugVariations(posts, selectedSlug);
    
    if (!post) {
      redirect("/things"); // No post found with any variation
    } else if (shouldRedirect && redirectSlug) {
      redirect(`/things/${redirectSlug}`); // 301 redirect to dash version
    }
    // If post found with exact match, continue normally
  }

  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Things I've Made",
    description: "Things I've made.",
    url: "https://jonothan.dev/things",
    author: {
      "@type": "Person",
      name: "Jonothan Hunt",
      url: "https://jonothan.dev",
    },
  };

  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
        />
      </Head>
      <div>
        <ThingsList initialPosts={posts} selectedSlug={selectedSlug} />
      </div>
    </>
  );
}
