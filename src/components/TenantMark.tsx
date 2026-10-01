import type { TenantPublic } from "@/lib/types";

export function TenantMark({ tenant, size = 40 }: { tenant: Pick<TenantPublic, "name" | "logo_url">; size?: number }) {
  if (tenant.logo_url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={tenant.logo_url} alt={tenant.name} style={{ height: size, width: "auto", maxWidth: size * 3.2 }} className="object-contain" />;
  }
  return (
    <span
      className="inline-flex items-center justify-center rounded-xl bg-brand font-bold text-brand-fg"
      style={{ height: size, width: size, fontSize: size * 0.45 }}
      aria-label={tenant.name}
    >
      {tenant.name.trim().charAt(0).toUpperCase()}
    </span>
  );
}
