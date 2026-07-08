import { redirect } from "next/navigation";

export default async function LoginRedirectPage({
  searchParams,
}: {
  searchParams?: Promise<{
    callbackUrl?: string;
  }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();

  if (params?.callbackUrl) {
    query.set("callbackUrl", params.callbackUrl);
  }

  redirect(query.size > 0 ? `/en/login?${query.toString()}` : "/en/login");
}
