import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { getLang } from "@/lib/lang";
import { getDict } from "@/lib/i18n";
import { TenantMark } from "@/components/TenantMark";
import { LangToggle } from "@/components/LangToggle";
import { staffLogout } from "../actions";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { tenant, role, user } = await requireStaff(slug);
  const lang = await getLang();
  const t = getDict(lang);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
          <TenantMark tenant={tenant} size={30} />
          <nav className="flex gap-1 text-sm font-medium">
            <Link href="/admin" className="rounded-lg px-3 py-1.5 hover:bg-black/5">
              {t.desk}
            </Link>
            {role === "admin" && (
              <Link href="/admin/ajustes" className="rounded-lg px-3 py-1.5 hover:bg-black/5">
                {t.settings}
              </Link>
            )}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden text-sm text-muted sm:inline">{user.email}</span>
            <LangToggle lang={lang} />
            <form action={staffLogout}>
              <button className="rounded-lg px-2 py-1 text-sm font-medium text-muted hover:bg-black/5">{t.signOut}</button>
            </form>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
