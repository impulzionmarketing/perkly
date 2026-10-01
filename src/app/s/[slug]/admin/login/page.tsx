import { getTenant } from "@/lib/tenant";
import { getLang } from "@/lib/lang";
import { TenantMark } from "@/components/TenantMark";
import { LangToggle } from "@/components/LangToggle";
import { StaffLoginForm } from "./StaffLoginForm";

export default async function StaffLoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ e?: string }>;
}) {
  const { slug } = await params;
  const { e } = await searchParams;
  const [tenant, lang] = await Promise.all([getTenant(slug), getLang()]);
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-5">
      <div className="flex items-center justify-between">
        <TenantMark tenant={tenant} size={44} />
        <LangToggle lang={lang} />
      </div>
      <StaffLoginForm slug={slug} lang={lang} tenantName={tenant.name} initialAccessError={e === "access"} />
    </main>
  );
}
