"use client";
import { useActionState, useEffect, useRef } from "react";
import { getDict, type Lang } from "@/lib/i18n";
import type { Role, Tenant } from "@/lib/types";
import { StampCard } from "@/components/StampCard";
import { addMember, removeMember, saveReward, type FormState } from "./actions";

export type Member = { user_id: string; role: Role; display_name: string | null; email: string | null };

export function Settings({
  slug,
  lang,
  tenant,
  members,
  currentUserId,
}: {
  slug: string;
  lang: Lang;
  tenant: Tenant;
  members: Member[];
  currentUserId: string;
}) {
  const t = getDict(lang);
  const [rewardState, rewardAction, rewardPending] = useActionState<FormState, FormData>(saveReward.bind(null, slug), undefined);
  const [memberState, memberAction, memberPending] = useActionState<FormState, FormData>(addMember.bind(null, slug), undefined);
  const memberForm = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (memberState?.ok) memberForm.current?.reset();
  }, [memberState]);

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6">
      <section className="rounded-2xl bg-surface p-6">
        <h1 className="text-xl font-bold tracking-tight">{t.rewardSettings}</h1>
        <p className="mt-1 text-sm text-muted">{t.rewardSettingsHelp}</p>
        <form action={rewardAction} className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto]">
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">{t.rewardTitle}</span>
              <input name="reward_title" defaultValue={tenant.reward_title} required maxLength={60} className="field" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">{t.rewardDescription}</span>
              <textarea name="reward_description" defaultValue={tenant.reward_description ?? ""} maxLength={200} rows={2} className="field" />
            </label>
            <label className="block max-w-48">
              <span className="mb-1.5 block text-sm font-medium">{t.visitsRequired}</span>
              <input name="visits_required" type="number" min={1} max={50} defaultValue={tenant.visits_required} required className="field" />
            </label>
            <label className="flex items-center gap-3 text-sm">
              <input name="one_visit_per_day" type="checkbox" defaultChecked={tenant.one_visit_per_day} className="h-5 w-5 accent-[var(--brand)]" />
              {t.onePerDay}
            </label>
            <div className="flex items-center gap-3">
              <button className="btn btn-brand" disabled={rewardPending}>{t.save}</button>
              {rewardState?.ok && <span className="text-sm text-ok">{t.saved}</span>}
              {rewardState?.error && <span className="text-sm text-danger">{t.genericError}</span>}
            </div>
          </div>
          <div className="hidden w-48 sm:block" aria-hidden>
            <StampCard count={Math.max(tenant.visits_required - 1, 0)} required={tenant.visits_required} size="sm" />
          </div>
        </form>
      </section>

      <section className="rounded-2xl bg-surface p-6">
        <h2 className="text-xl font-bold tracking-tight">{t.team}</h2>
        <p className="mt-1 text-sm text-muted">{t.teamHelp}</p>

        <ul className="mt-4 divide-y divide-line border-y border-line">
          {members.map((m) => (
            <li key={m.user_id} className="flex items-center gap-3 py-3 text-sm">
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">
                  {m.display_name || m.email} {m.user_id === currentUserId && <span className="text-muted">({t.you})</span>}
                </span>
                {m.display_name && <span className="block truncate text-muted">{m.email}</span>}
              </span>
              <span className="rounded-full bg-bg px-2.5 py-1 text-xs font-semibold text-muted">
                {m.role === "admin" ? t.roleAdmin : t.roleStaff}
              </span>
              {m.user_id !== currentUserId && (
                <button
                  className="text-sm font-medium text-danger"
                  onClick={() => removeMember(slug, m.user_id)}
                >
                  {t.remove}
                </button>
              )}
            </li>
          ))}
        </ul>

        <form ref={memberForm} action={memberAction} className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">{t.displayName}</span>
            <input name="display_name" className="field" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">{t.email}</span>
            <input name="email" type="email" required className="field" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">{t.tempPassword}</span>
            <input name="password" type="text" minLength={8} required className="field" autoComplete="new-password" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">{t.role}</span>
            <select name="role" className="field" defaultValue="staff">
              <option value="staff">{t.roleStaff}</option>
              <option value="admin">{t.roleAdmin}</option>
            </select>
          </label>
          <div className="flex items-center gap-3 sm:col-span-2">
            <button className="btn btn-brand" disabled={memberPending}>{t.addMember}</button>
            {memberState?.ok && <span className="text-sm text-ok">{t.memberAdded}</span>}
            {memberState?.error && <span className="text-sm text-danger">{memberState.error === "INVALID" ? t.genericError : memberState.error}</span>}
          </div>
        </form>
      </section>
    </main>
  );
}
