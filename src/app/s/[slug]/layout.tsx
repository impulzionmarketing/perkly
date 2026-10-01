import type { Metadata } from "next";
import { getTenant } from "@/lib/tenant";
import { brandVars } from "@/lib/color";

type Props = { children: React.ReactNode; params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const t = await getTenant(slug);
  return {
    title: `${t.name} · Club de lealtad`,
    manifest: "/manifest.webmanifest",
    icons: t.logo_url ? { icon: t.logo_url, apple: t.logo_url } : undefined,
    appleWebApp: { capable: true, title: t.name, statusBarStyle: "default" },
  };
}

export default async function TenantLayout({ children, params }: Props) {
  const { slug } = await params;
  const t = await getTenant(slug);
  return (
    <div style={brandVars(t.primary_color) as React.CSSProperties} className="min-h-dvh">
      {children}
    </div>
  );
}
