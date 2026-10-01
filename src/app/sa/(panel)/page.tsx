import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { tenantUrl } from "@/lib/site";
import { TenantMark } from "@/components/TenantMark";

type Row = {
  id: string; slug: string; name: string; logo_url: string | null; primary_color: string;
  active: boolean; visits_required: number; reward_title: string; customers: { count: number }[];
};

export default async function Tenants() {
  const { data } = await createAdminClient()
    .from("tenants")
    .select("id,slug,name,logo_url,primary_color,active,visits_required,reward_title,customers(count)")
    .order("created_at", { ascending: false });
  const rows = (data as Row[]) ?? [];

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-line p-10 text-center">
        <p className="text-muted">Todavía no hay negocios.</p>
        <Link href="/nuevo" className="btn btn-brand mt-4">Crear el primero</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Negocios</h1>
      <ul className="mt-4 divide-y divide-line overflow-hidden rounded-2xl bg-surface">
        {rows.map((t) => (
          <li key={t.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
            <span className="h-8 w-1.5 rounded-full" style={{ background: t.primary_color }} aria-hidden />
            <TenantMark tenant={t} size={36} />
            <div className="min-w-0 flex-1">
              <Link href={`/${t.id}`} className="font-semibold hover:underline">{t.name}</Link>
              <p className="truncate text-sm text-muted">
                {t.slug}.{process.env.NEXT_PUBLIC_ROOT_DOMAIN || "perkly.club"} · {t.visits_required} visitas → {t.reward_title}
              </p>
            </div>
            <span className="text-sm text-muted">{t.customers?.[0]?.count ?? 0} clientes</span>
            {!t.active && <span className="rounded-full bg-danger/10 px-2.5 py-1 text-xs font-semibold text-danger">Pausado</span>}
            <a href={`${tenantUrl(t.slug)}/admin`} target="_blank" rel="noreferrer" className="btn btn-ghost px-3 py-2 text-sm">Abrir panel</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
