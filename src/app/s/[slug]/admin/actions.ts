"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTenant } from "@/lib/tenant";

export type StaffLoginState = { error?: "CREDENTIALS" | "ACCESS" } | undefined;

export async function staffLogin(slug: string, _prev: StaffLoginState, form: FormData): Promise<StaffLoginState> {
  const tenant = await getTenant(slug);
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(form.get("email") || "").trim(),
    password: String(form.get("password") || ""),
  });
  if (error) return { error: "CREDENTIALS" };

  const { data: role } = await supabase.rpc("tenant_role", { p_tenant: tenant.id });
  if (!role) {
    await supabase.auth.signOut();
    return { error: "ACCESS" };
  }
  redirect("/admin");
}

export async function staffLogout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
