"use client";
import { useActionState } from "react";
import { getDict, type Lang } from "@/lib/i18n";
import { staffLogin, type StaffLoginState } from "../actions";

export function StaffLoginForm({
  slug,
  lang,
  tenantName,
  initialAccessError,
}: {
  slug: string;
  lang: Lang;
  tenantName: string;
  initialAccessError: boolean;
}) {
  const t = getDict(lang);
  const [state, action, pending] = useActionState<StaffLoginState, FormData>(
    staffLogin.bind(null, slug),
    initialAccessError ? { error: "ACCESS" } : undefined
  );
  return (
    <form action={action} className="mt-8 space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t.staffLogin}</h1>
        <p className="mt-1 text-muted">{tenantName}</p>
      </div>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">{t.email}</span>
        <input name="email" type="email" autoComplete="email" required className="field" />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">{t.password}</span>
        <input name="password" type="password" autoComplete="current-password" required className="field" />
      </label>
      {state?.error && (
        <p role="alert" className="rounded-xl bg-danger/10 px-3 py-2.5 text-sm text-danger">
          {state.error === "ACCESS" ? t.noAccess : t.badCredentials}
        </p>
      )}
      <button className="btn btn-brand w-full" disabled={pending}>
        {t.signIn}
      </button>
    </form>
  );
}
