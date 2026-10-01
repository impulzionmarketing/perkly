"use server";
import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { findOrCreateUser } from "@/lib/members";

export type FormState = { ok?: boolean; error?: string } | undefined;

export async function saveReward(slug: string, _prev: FormState, form: FormData): Promise<FormState> {
  const { supabase, tenant, role } = await requireStaff(slug);
  if (role !== "admin") return { error: "FORBIDDEN" };
  const visits = Number(form.get("visits_required"));
  const title = String(form.get("reward_title") || "").trim();
  if (!title || !Number.isInteger(visits) || visits < 1 || visits > 50) return { error: "INVALID" };

  const { error } = await supabase.rpc("update_reward_settings", {
    p_tenant: tenant.id,
    p_title: title,
    p_description: String(form.get("reward_description") || ""),
    p_visits: visits,
    p_one_per_day: form.get("one_visit_per_day") === "on",
  });
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function addMember(slug: string, _prev: FormState, form: FormData): Promise<FormState> {
  const { tenant, role } = await requireStaff(slug);
  if (role !== "admin") return { error: "FORBIDDEN" };

  const email = String(form.get("email") || "").trim().toLowerCase();
  const password = String(form.get("password") || "");
  const name = String(form.get("display_name") || "").trim();
  const memberRole = form.get("role") === "admin" ? "admin" : "staff";
  if (!email.includes("@") || password.length < 8) return { error: "INVALID" };

  const user = await findOrCreateUser(email, password);
  if (!user.id) return { error: user.error };

  const admin = createAdminClient();
  const { error } = await admin.from("memberships").upsert({
    user_id: user.id,
    tenant_id: tenant.id,
    role: memberRole,
    display_name: name || null,
    email,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/ajustes");
  return { ok: true };
}

export async function removeMember(slug: string, userId: string) {
  const { tenant, role, user } = await requireStaff(slug);
  if (role !== "admin" || userId === user.id) return;
  await createAdminClient().from("memberships").delete().eq("tenant_id", tenant.id).eq("user_id", userId);
  revalidatePath("/admin/ajustes");
}
