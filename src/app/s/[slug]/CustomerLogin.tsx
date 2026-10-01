"use client";
import { useActionState, useState } from "react";
import { getDict, type Lang } from "@/lib/i18n";
import type { Country } from "@/lib/phone";
import { PhoneInput } from "@/components/PhoneInput";
import { StampCard } from "@/components/StampCard";
import { customerLogin, type LoginState } from "./actions";

export function CustomerLogin({
  slug,
  lang,
  defaultCountry,
  reward,
  required,
}: {
  slug: string;
  lang: Lang;
  defaultCountry: Country;
  reward: string;
  required: number;
}) {
  const t = getDict(lang);
  const [state, action, pending] = useActionState<LoginState, FormData>(customerLogin.bind(null, slug), undefined);
  const [country, setCountry] = useState<Country>(defaultCountry);
  const [phone, setPhone] = useState("");

  const error =
    state?.error === "LOCKED" ? t.locked : state?.error === "PHONE" ? t.invalidPhone : state?.error ? t.invalidLogin : null;

  return (
    <section className="mt-10 flex flex-1 flex-col">
      <div className="opacity-60" aria-hidden>
        <StampCard count={0} required={required} />
      </div>
      <p className="mt-4 text-sm text-muted">
        {t.yourReward}: <span className="font-semibold text-ink">{reward}</span>
      </p>

      <h1 className="mt-8 text-2xl font-bold tracking-tight">{t.portalTitle}</h1>
      <p className="mt-1.5 text-muted">{t.portalIntro}</p>

      <form action={action} className="mt-6 space-y-4">
        <input type="hidden" name="country" value={country} />
        <PhoneInput country={country} local={phone} onCountry={setCountry} onLocal={setPhone} label={t.phone} />
        <input type="hidden" name="phone" value={phone} />
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">{t.pin}</span>
          <input
            name="pin"
            className="field text-center text-2xl tracking-[0.6em]"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{4}"
            maxLength={4}
            required
            placeholder="••••"
          />
        </label>
        {error && (
          <p role="alert" className="rounded-xl bg-danger/10 px-3 py-2.5 text-sm text-danger">
            {error}
          </p>
        )}
        <button className="btn btn-brand w-full" disabled={pending}>
          {t.seeMyVisits}
        </button>
        <p className="text-center text-sm text-muted">{t.forgotPin}</p>
      </form>
    </section>
  );
}
