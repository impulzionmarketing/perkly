"use client";
import { useActionState } from "react";
import { saLogin, type SAState } from "../actions";

export function SALoginForm({ accessError }: { accessError: boolean }) {
  const [state, action, pending] = useActionState<SAState, FormData>(
    saLogin,
    accessError ? { error: "Esta cuenta no es de la agencia." } : undefined
  );
  return (
    <form action={action} className="mt-8 space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">Correo</span>
        <input name="email" type="email" required autoComplete="email" className="field" />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">Contraseña</span>
        <input name="password" type="password" required autoComplete="current-password" className="field" />
      </label>
      {state?.error && <p role="alert" className="rounded-xl bg-danger/10 px-3 py-2.5 text-sm text-danger">{state.error}</p>}
      <button className="btn btn-brand w-full" disabled={pending}>Entrar</button>
    </form>
  );
}
