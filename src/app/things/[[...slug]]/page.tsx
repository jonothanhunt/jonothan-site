import { redirect } from "next/navigation";

type Params = Promise<{ slug?: string[] }>;

export default async function ThingsRedirect({ params }: { params: Params }) {
  const { slug } = await params;
  if (slug && slug.length > 0) {
    redirect(`/blog/${slug[0]}`);
  }
  redirect("/blog");
}
