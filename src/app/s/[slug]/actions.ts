"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { toE164, type Country } from "@/lib/phone";
import { CARD_COOKIE } from "@/lib/site";

export type LoginState = { error?: "INVALID" | "LOCKED" | "PHONE" } | undefined;

export async function customerLogin(slug: string, _prev: LoginState, form: FormData): Promise<LoginState> {
  const phone = toE164(form.get("country") as Country, String(form.get("phone") || ""));
  const pin = String(form.get("pin") || "").replace(/\D/g, "");
  if (!phone) return { error: "PHONE" };
  if (pin.length !== 4) return { error: "INVALID" };

  const supabase = await createClient();
  const { data } = await supabase.rpc("customer_login", { p_slug: slug, p_phone: phone, p_pin: pin });
  const res = data as { ok: boolean; token?: string; error?: "INVALID" | "LOCKED" } | null;
  if (!res?.ok || !res.token) return { error: res?.error ?? "INVALID" };

  (await cookies()).set(CARD_COOKIE, res.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  redirect("/");
}

export async function customerLogout() {
  (await cookies()).delete(CARD_COOKIE);
  redirect("/");
}
