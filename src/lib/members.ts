import "server-only";
import { createAdminClient } from "./supabase/admin";

/** Crea el usuario (correo + contraseña, ya confirmado) o reutiliza uno existente. */
export async function findOrCreateUser(email: string, password: string): Promise<{ id?: string; error?: string }> {
  const admin = createAdminClient();
  const clean = email.trim().toLowerCase();
  const { data, error } = await admin.auth.admin.createUser({ email: clean, password, email_confirm: true });
  if (data?.user) return { id: data.user.id };

  if (error && /already|registered|exists/i.test(error.message)) {
    for (let page = 1; page <= 10; page++) {
      const { data: list } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
      const found = list?.users.find((u) => u.email?.toLowerCase() === clean);
      if (found) return { id: found.id };
      if (!list || list.users.length < 1000) break;
    }
  }
  return { error: error?.message ?? "No se pudo crear el usuario" };
}
