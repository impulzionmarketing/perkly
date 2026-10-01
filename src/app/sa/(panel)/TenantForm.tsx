"use client";
import { useActionState, useState } from "react";
import { brandVars } from "@/lib/color";
import { StampCard } from "@/components/StampCard";
import type { Tenant } from "@/lib/types";
import { createTenant, updateTenant, type SAState } from "../actions";

const ZONES = [
  ["America/Matamoros", "Piedras Negras / Eagle Pass / Laredo (Centro)"],
  ["America/Monterrey", "Monterrey / Saltillo"],
  ["America/Mexico_City", "Ciudad de México / Querétaro"],
  ["America/Chicago", "Texas (Centro)"],
  ["America/Chihuahua", "Chihuahua"],
  ["America/Tijuana", "Tijuana"],
];

export function TenantForm({ tenant }: { tenant?: Tenant }) {
  const editing = !!tenant;
  const [state, action, pending] = useActionState<SAState, FormData>(
    editing ? updateTenant.bind(null, tenant.id) : createTenant,
    undefined
  );
  const [color, setColor] = useState(tenant?.primary_color ?? "#2563EB");
  const [name, setName] = useState(tenant?.name ?? "");
  const [slug, setSlug] = useState(tenant?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(editing);
  const [preview, setPreview] = useState<string | null>(tenant?.logo_url ?? null);

  const autoSlug = (v: string) =>
    v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);

  return (
    <form action={action} className="grid gap-6 md:grid-cols-[1fr_300px]">
      <div className="space-y-4 rounded-2xl bg-surface p-6">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Nombre del negocio</span>
          <input
            name="name" required className="field" value={name}
            onChange={(e) => { setName(e.target.value); if (!slugTouched) setSlug(autoSlug(e.target.value)); }}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Subdominio</span>
          <div className="flex items-center gap-2">
            <input
              name="slug" required className="field" value={slug}
              onChange={(e) => { setSlugTouched(true); setSlug(e.target.value.toLowerCase()); }}
            />
            <span className="shrink-0 text-sm text-muted">.{process.env.NEXT_PUBLIC_ROOT_DOMAIN || "perkly.club"}</span>
          </div>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Color principal</span>
            <div className="flex gap-2">
              <input type="color" value={color} onChange={(e) => setColor(e.target.value.toUpperCase())} className="h-[46px] w-14 cursor-pointer rounded-xl border border-line bg-surface p-1" aria-label="Selector de color" />
              <input name="primary_color" value={color} onChange={(e) => setColor(e.target.value.toUpperCase())} className="field font-mono" maxLength={7} />
            </div>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Logotipo (PNG, SVG, JPG · máx. 2 MB)</span>
            <input
              name="logo" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="field py-2 text-sm"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) setPreview(URL.createObjectURL(f)); }}
            />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Lada predeterminada</span>
            <select name="default_country" defaultValue={tenant?.default_country ?? "52"} className="field">
              <option value="52">México (+52)</option>
              <option value="1">Estados Unidos (+1)</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Zona horaria</span>
            <select name="timezone" defaultValue={tenant?.timezone ?? "America/Matamoros"} className="field">
              {ZONES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
        </div>

        {!editing && (
          <>
            <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">Premio inicial</span>
                <input name="reward_title" placeholder="Ej. Postre gratis" className="field" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">Visitas</span>
                <input name="visits_required" type="number" min={1} max={50} defaultValue={10} className="field" />
              </label>
            </div>
            <fieldset className="space-y-3 rounded-xl border border-line p-4">
              <legend className="px-1 text-sm font-semibold">Administrador del negocio</legend>
              <input name="admin_name" placeholder="Nombre" className="field" />
              <input name="admin_email" type="email" placeholder="Correo" required className="field" />
              <input name="admin_password" type="text" placeholder="Contraseña temporal (mín. 8)" minLength={8} required className="field" autoComplete="new-password" />
            </fieldset>
          </>
        )}

        {editing && (
          <div className="flex flex-wrap gap-6 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" name="active" defaultChecked={tenant.active} className="h-5 w-5" /> Activo</label>
            {tenant.logo_url && <label className="flex items-center gap-2"><input type="checkbox" name="remove_logo" className="h-5 w-5" /> Quitar logotipo</label>}
          </div>
        )}

        {state?.error && <p role="alert" className="rounded-xl bg-danger/10 px-3 py-2.5 text-sm text-danger">{state.error}</p>}
        {state?.ok && <p className="text-sm text-ok">Cambios guardados.</p>}
        <button className="btn btn-brand" disabled={pending}>{editing ? "Guardar cambios" : "Crear negocio"}</button>
      </div>

      {/* Vista previa */}
      <aside style={brandVars(/^#[0-9A-F]{6}$/i.test(color) ? color : "#2563EB") as React.CSSProperties} className="h-fit rounded-2xl bg-bg p-5 ring-1 ring-line md:sticky md:top-6">
        <p className="text-xs font-medium text-muted">Vista previa</p>
        <div className="mt-3 rounded-2xl bg-surface p-4">
          {preview
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={preview} alt="" className="h-9 w-auto max-w-[140px] object-contain" />
            : <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand font-bold text-brand-fg">{(name || "N").charAt(0).toUpperCase()}</span>}
          <p className="mt-4 text-2xl font-bold tracking-tight">3 de 8 visitas</p>
          <div className="mt-3"><StampCard count={3} required={8} size="sm" /></div>
          <span className="btn btn-brand mt-4 w-full">Registrar visita</span>
        </div>
      </aside>
    </form>
  );
}
