"use client";
import type { Country } from "@/lib/phone";

export function PhoneInput({
  country,
  local,
  onCountry,
  onLocal,
  label,
  autoFocus,
}: {
  country: Country;
  local: string;
  onCountry: (c: Country) => void;
  onLocal: (v: string) => void;
  label: string;
  autoFocus?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <div className="flex gap-2">
        <select
          className="field w-[6.5rem] shrink-0"
          value={country}
          onChange={(e) => onCountry(e.target.value as Country)}
          aria-label="Lada"
        >
          <option value="52">🇲🇽 +52</option>
          <option value="1">🇺🇸 +1</option>
        </select>
        <input
          className="field"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="10 dígitos"
          value={local}
          autoFocus={autoFocus}
          onChange={(e) => onLocal(e.target.value.replace(/[^\d\s()-]/g, "").slice(0, 16))}
        />
      </div>
    </label>
  );
}
