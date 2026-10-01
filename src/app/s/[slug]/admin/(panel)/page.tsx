import { requireStaff } from "@/lib/auth";
import { getLang } from "@/lib/lang";
import { tenantUrl } from "@/lib/site";
import { Desk } from "./Desk";

export default async function DeskPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { tenant, role } = await requireStaff(slug);
  const lang = await getLang();
  return <Desk tenant={tenant} role={role} lang={lang} portalUrl={tenantUrl(tenant.slug)} />;
}
