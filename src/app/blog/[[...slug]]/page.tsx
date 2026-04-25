import fs from "fs";
import path from "path";
import { redirect } from "next/navigation";

function findPostWithSlugVariations(posts: { slug: string; [key: string]: unknown }[], requestedSlug: string) {
  let post = posts.find((post) => post.slug === requestedSlug);
  if (post) return { post, shouldRedirect: false };

  if (requestedSlug.includes('_')) {
    const dashSlug = requestedSlug.replace(/_/g, '-');
    post = posts.find((post) => post.slug === dashSlug);
    if (post) return { post, shouldRedirect: true, redirectSlug: dashSlug };
  }

  return { post: null, shouldRedirect: false };
}

async function getBlogPosts() {
  const postsDirectory = path.join(process.cwd(), "src/content/things");
  const filenames = fs.readdirSync(postsDirectory);

  const posts = await Promise.all(
    filenames
      .filter((filename) => filename.endsWith(".mdx") || filename.endsWith(".md"))
      .map(async (filename) => {
        const slug = filename.replace(/\.(mdx|md)$/, "");
        try {
          const { metadata } = await import(`@/content/things/${slug}.mdx`);
          return { slug, ...metadata };
        } catch (error) {
          console.error(`Error importing ${slug}:`, error);
          return { slug, title: slug, date: new Date().toISOString(), excerpt: "", type: "Post" };
        }
      })
  );

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
    return { title: "Blog", description: "My blog." };
  }

  const currentSlug = slug[0];
  try {
    const { metadata } = await import(`@/content/things/${currentSlug}.mdx`);
    const description = metadata.excerpt || "";
    const ogImage = metadata.image
      ? `https://jonothan.dev${metadata.image}`
      : "https://jonothan.dev/images/jonothan_profile.jpeg";
    return {
      title: `${metadata.title} — Jonothan Hunt`,
      description,
      keywords: ["Jonothan Hunt Blog", "Jonathan Hunt Blog"],
      alternates: { canonical: `https://jonothan.dev/blog/${currentSlug}` },
      openGraph: {
        title: metadata.title,
        description,
        url: `https://jonothan.dev/blog/${currentSlug}`,
        siteName: "Jonothan Hunt",
        images: [{ url: ogImage, width: 1200, height: 630 }],
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: metadata.title,
        description,
        images: [ogImage],
        creator: "@jonothan",
      },
    };
  } catch {
    if (currentSlug.includes('_')) {
      const dashSlug = currentSlug.replace(/_/g, '-');
      try {
        await import(`@/content/things/${dashSlug}.mdx`);
        redirect(`/blog/${dashSlug}`);
      } catch {
        redirect("/blog");
      }
    } else {
      redirect("/blog");
    }
  }
}

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;
  const selectedSlug = slug?.[0];
  const posts = await getBlogPosts();

  if (selectedSlug) {
    const { post, shouldRedirect, redirectSlug } = findPostWithSlugVariations(posts, selectedSlug);
    if (!post) redirect("/blog");
    else if (shouldRedirect && redirectSlug) redirect(`/blog/${redirectSlug}`);
  }

  return null;
}
