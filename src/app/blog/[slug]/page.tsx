import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { formatCustomDate } from "@/utils/formatDate";

export async function generateStaticParams() {
  const postsDirectory = path.join(process.cwd(), "src/content/blog");
  const filenames = fs.readdirSync(postsDirectory);

  return filenames
    .filter((filename) => filename.endsWith(".mdx") || filename.endsWith(".md"))
    .map((filename) => ({
      slug: filename.replace(/\.(mdx|md)$/, ""),
    }));
}

type ThingsParams = Promise<{ slug: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export async function generateMetadata({
  params,
}: {
  params: ThingsParams;
}) {
  const { slug } = await params;

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

export default async function Thing({
  params,
  searchParams,
}: {
  params: ThingsParams;
  searchParams?: SearchParams;
}) {
  const { slug } = await params;
  if (searchParams) {
    await searchParams;
  }

  let metadata;
  try {
    const imported = await import(`@/content/blog/${slug}.mdx`);
    metadata = imported.metadata;
  } catch (error) {
    console.error(`Error loading metadata for slug ${slug}:`, error);
    return notFound();
  }

  const MDXContent = dynamic(() => import(`@/content/blog/${slug}.mdx`), {
    loading: () => <p></p>,
  });

  return (
    <div className="min-h-screen container mx-auto px-4 pt-8 max-w-3xl font-[family-name:var(--font-hyperlegible)]">
      <div className="h-42" />
      <div className="border-purple-200 p-5 mb-8 rounded-4xl bg-gradient-to-br sm:bg-gradient-to-bl from-purple-300/20 via-purple-100 to-purple-100 transition shadow-xl shadow-purple-950/5">
        <div className="flex flex-col-reverse sm:flex-row gap-2 justify-between">
          <h1 className="font-[family-name:var(--font-lastik)] text-3xl text-purple-950 text-pretty">
            {metadata.title}
          </h1>
          <p className="text-purple-950 min-w-fit w-fit h-fit px-3 py-2 rounded-full bg-pink-200/70 shadow-xl shadow-purple-950/20 text-sm">
            {formatCustomDate(metadata.date)}
          </p>
        </div>
      </div>
      <div className="w-full px-3">
        {/* <p className="text-pretty text-lg text-purple-700">{metadata.excerpt}</p> */}
        <MDXContent />
      </div>
    </div>
  );
}
