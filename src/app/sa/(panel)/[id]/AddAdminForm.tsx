"use client";
import { useActionState } from "react";
import { addTenantAdmin, type SAState } from "../../actions";

export function AddAdminForm({ tenantId }: { tenantId: string }) {
  const [state, action, pending] = useActionState<SAState, FormData>(addTenantAdmin.bind(null, tenantId), undefined);
  return (
    <form action={action} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto_auto]">
      <input name="display_name" placeholder="Nombre" className="field" />
      <input name="email" type="email" placeholder="Correo" required className="field" />
      <input name="password" type="text" placeholder="Contraseña (mín. 8)" minLength={8} required className="field" autoComplete="new-password" />
      <select name="role" className="field" defaultValue="admin">
        <option value="admin">Administración</option>
        <option value="staff">Recepción</option>
      </select>
      <button className="btn btn-brand" disabled={pending}>Agregar</button>
      {state?.error && <p className="text-sm text-danger sm:col-span-5">{state.error}</p>}
      {state?.ok && <p className="text-sm text-ok sm:col-span-5">Acceso agregado.</p>}
    </form>
  );
}
