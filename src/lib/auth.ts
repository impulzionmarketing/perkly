import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { getTenant } from "./tenant";
import type { Role } from "./types";

export async function requireStaff(slug: string) {
  const tenant = await getTenant(slug);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: role } = await supabase.rpc("tenant_role", { p_tenant: tenant.id });
  if (!role) redirect("/admin/login?e=access");
  return { supabase, user, role: role as Role, tenant };
}

export async function requireSuperadmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: ok } = await supabase.rpc("is_superadmin");
  if (!ok) redirect("/login?e=access");
  return { supabase, user };
}
