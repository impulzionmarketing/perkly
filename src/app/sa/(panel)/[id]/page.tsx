import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { tenantUrl } from "@/lib/site";
import type { Tenant } from "@/lib/types";
import { TenantForm } from "../TenantForm";
import { AddAdminForm } from "./AddAdminForm";

export default async function EditTenant({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ nuevo?: string }> }) {
  const { id } = await params;
  const { nuevo } = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const admin = createAdminClient();
  const [{ data: tenant }, { data: members }] = await Promise.all([
    admin.from("tenants").select("*").eq("id", id).maybeSingle(),
    admin.from("memberships").select("user_id,role,display_name,email").eq("tenant_id", id).order("created_at"),
  ]);
  if (!tenant) notFound();
  const t = tenant as Tenant;
  const url = tenantUrl(t.slug);

  return (
    <div className="space-y-6">
      {nuevo && (
        <p className="rounded-2xl bg-ok/10 px-4 py-3 text-sm text-ok">
          Negocio creado. Comparte con el administrador el enlace del panel y sus credenciales.
        </p>
      )}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">{t.name}</h1>
        <div className="flex gap-2 text-sm">
          <a className="btn btn-ghost px-3 py-2" href={url} target="_blank" rel="noreferrer">Portal de clientes</a>
          <a className="btn btn-ghost px-3 py-2" href={`${url}/admin`} target="_blank" rel="noreferrer">Panel del negocio</a>
        </div>
      </div>

      <TenantForm tenant={t} />

      <section className="rounded-2xl bg-surface p-6">
        <h2 className="text-lg font-bold tracking-tight">Accesos</h2>
        <ul className="mt-3 divide-y divide-line border-y border-line text-sm">
          {(members ?? []).map((m) => (
            <li key={m.user_id} className="flex items-center justify-between py-3">
              <span>{m.display_name ? `${m.display_name} · ` : ""}{m.email}</span>
              <span className="rounded-full bg-bg px-2.5 py-1 text-xs font-semibold text-muted">{m.role === "admin" ? "Administración" : "Recepción"}</span>
            </li>
          ))}
        </ul>
        <AddAdminForm tenantId={t.id} />
      </section>
    </div>
  );
}
