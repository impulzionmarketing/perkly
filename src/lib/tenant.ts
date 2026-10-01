import { cache } from "react";
import { notFound } from "next/navigation";
import { createClient } from "./supabase/server";
import type { TenantPublic } from "./types";

export const getTenant = cache(async (slug: string): Promise<TenantPublic> => {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_tenant_public", { p_slug: slug });
  if (!data) notFound();
  return data as TenantPublic;
});
