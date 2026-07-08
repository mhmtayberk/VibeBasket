import { redirect } from "next/navigation";

export default async function DocsRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();

  if (params.tab) {
    query.set("tab", params.tab);
  }

  if (params.q) {
    query.set("q", params.q);
  }

  redirect(query.size > 0 ? `/en/docs?${query.toString()}` : "/en/docs");
}
