import { getTenant } from "@/lib/tenant";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = await getTenant(slug);
  const icons = t.logo_url ? [{ src: t.logo_url, sizes: "any", purpose: "any" }] : [];
  return Response.json(
    {
      name: `${t.name} · Club de lealtad`,
      short_name: t.name.slice(0, 12),
      start_url: "/",
      scope: "/",
      display: "standalone",
      background_color: "#f4f5f7",
      theme_color: t.primary_color,
      icons,
    },
    { headers: { "content-type": "application/manifest+json", "cache-control": "public, max-age=3600" } }
  );
}
