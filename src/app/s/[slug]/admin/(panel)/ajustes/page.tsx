import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { getLang } from "@/lib/lang";
import type { Tenant } from "@/lib/types";
import { Settings, type Member } from "./Settings";

export default async function SettingsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { supabase, tenant, role, user } = await requireStaff(slug);
  if (role !== "admin") redirect("/admin");
  const lang = await getLang();

  const [{ data: full }, { data: members }] = await Promise.all([
    supabase.from("tenants").select("*").eq("id", tenant.id).single(),
    supabase.from("memberships").select("user_id,role,display_name,email").eq("tenant_id", tenant.id).order("created_at"),
  ]);

  return (
    <Settings
      slug={slug}
      lang={lang}
      tenant={full as Tenant}
      members={(members as Member[]) ?? []}
      currentUserId={user.id}
    />
  );
}
