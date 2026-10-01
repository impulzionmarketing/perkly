"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSuperadmin } from "@/lib/auth";
import { findOrCreateUser } from "@/lib/members";

export type SAState = { error?: string; ok?: boolean } | undefined;

export async function saLogin(_prev: SAState, form: FormData): Promise<SAState> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(form.get("email") || "").trim(),
    password: String(form.get("password") || ""),
  });
  if (error) return { error: "Correo o contraseña incorrectos." };
  const { data: ok } = await supabase.rpc("is_superadmin");
  if (!ok) {
    await supabase.auth.signOut();
    return { error: "Esta cuenta no es de la agencia." };
  }
  redirect("/");
}

export async function saLogout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

const SLUG = /^[a-z0-9]([a-z0-9-]{0,38}[a-z0-9])?$/;
const RESERVED = ["admin", "www", "app", "api", "mail"];

async function uploadLogo(file: File | null, tenantId: string): Promise<string | null> {
  if (!file || file.size === 0) return null;
  if (file.size > 2 * 1024 * 1024) throw new Error("El logo debe pesar menos de 2 MB.");
  if (!/^image\/(png|jpeg|webp|svg\+xml)$/.test(file.type)) throw new Error("Usa un logo PNG, JPG, WEBP o SVG.");
  const ext = file.type === "image/svg+xml" ? "svg" : file.type.split("/")[1].replace("jpeg", "jpg");
  const path = `${tenantId}/${Date.now()}.${ext}`;
  const admin = createAdminClient();
  const { error } = await admin.storage.from("logos").upload(path, file, { contentType: file.type, upsert: true });
  if (error) throw new Error(error.message);
  return admin.storage.from("logos").getPublicUrl(path).data.publicUrl;
}

function readTenantFields(form: FormData) {
  return {
    name: String(form.get("name") || "").trim(),
    slug: String(form.get("slug") || "").trim().toLowerCase(),
    primary_color: String(form.get("primary_color") || "#2563EB").toUpperCase(),
    default_country: form.get("default_country") === "1" ? "1" : "52",
    timezone: String(form.get("timezone") || "America/Matamoros"),
  };
}

function validate(f: ReturnType<typeof readTenantFields>): string | null {
  if (f.name.length < 2) return "Escribe el nombre del negocio.";
  if (!SLUG.test(f.slug) || RESERVED.includes(f.slug))
    return "El subdominio solo puede llevar minúsculas, números y guiones (sin empezar ni terminar en guion).";
  if (!/^#[0-9A-F]{6}$/.test(f.primary_color)) return "Color inválido.";
  return null;
}

export async function createTenant(_prev: SAState, form: FormData): Promise<SAState> {
  await requireSuperadmin();
  const f = readTenantFields(form);
  const invalid = validate(f);
  if (invalid) return { error: invalid };

  const adminEmail = String(form.get("admin_email") || "").trim().toLowerCase();
  const adminPassword = String(form.get("admin_password") || "");
  const adminName = String(form.get("admin_name") || "").trim();
  if (!adminEmail.includes("@") || adminPassword.length < 8)
    return { error: "Escribe el correo del administrador y una contraseña de al menos 8 caracteres." };

  const admin = createAdminClient();
  const { data: tenant, error } = await admin
    .from("tenants")
    .insert({
      ...f,
      reward_title: String(form.get("reward_title") || "").trim() || "Premio de cortesía",
      visits_required: Math.min(Math.max(Number(form.get("visits_required")) || 10, 1), 50),
    })
    .select("id")
    .single();
  if (error) return { error: error.code === "23505" ? "Ese subdominio ya existe." : error.message };

  try {
    const logo = await uploadLogo(form.get("logo") as File | null, tenant.id);
    if (logo) await admin.from("tenants").update({ logo_url: logo }).eq("id", tenant.id);
  } catch (e) {
    return { error: `Negocio creado, pero el logo falló: ${(e as Error).message}` };
  }

  const user = await findOrCreateUser(adminEmail, adminPassword);
  if (!user.id) return { error: `Negocio creado, pero el administrador falló: ${user.error}` };
  await admin.from("memberships").upsert({
    user_id: user.id,
    tenant_id: tenant.id,
    role: "admin",
    display_name: adminName || null,
    email: adminEmail,
  });

  revalidatePath("/");
  redirect(`/${tenant.id}?nuevo=1`);
}

export async function updateTenant(id: string, _prev: SAState, form: FormData): Promise<SAState> {
  await requireSuperadmin();
  const f = readTenantFields(form);
  const invalid = validate(f);
  if (invalid) return { error: invalid };

  const patch: Record<string, unknown> = { ...f, active: form.get("active") === "on" };
  try {
    const uploaded = await uploadLogo(form.get("logo") as File | null, id);
    if (uploaded) patch.logo_url = uploaded;
    else if (form.get("remove_logo") === "on") patch.logo_url = null;
  } catch (e) {
    return { error: (e as Error).message };
  }

  const { error } = await createAdminClient().from("tenants").update(patch).eq("id", id);
  if (error) return { error: error.code === "23505" ? "Ese subdominio ya existe." : error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function addTenantAdmin(id: string, _prev: SAState, form: FormData): Promise<SAState> {
  await requireSuperadmin();
  const email = String(form.get("email") || "").trim().toLowerCase();
  const password = String(form.get("password") || "");
  if (!email.includes("@") || password.length < 8) return { error: "Correo y contraseña (mín. 8) son obligatorios." };
  const user = await findOrCreateUser(email, password);
  if (!user.id) return { error: user.error };
  const { error } = await createAdminClient().from("memberships").upsert({
    user_id: user.id,
    tenant_id: id,
    role: form.get("role") === "staff" ? "staff" : "admin",
    display_name: String(form.get("display_name") || "").trim() || null,
    email,
  });
  if (error) return { error: error.message };
  revalidatePath(`/${id}`);
  return { ok: true };
}
