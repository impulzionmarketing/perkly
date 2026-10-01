export type Country = "52" | "1";

export const onlyDigits = (s: string) => s.replace(/\D/g, "");

/** 10 dígitos locales + lada → E.164 (+52XXXXXXXXXX / +1XXXXXXXXXX), o null si no es válido. */
export function toE164(country: Country, local: string): string | null {
  let d = onlyDigits(local);
  // Si pegaron el número con lada, la quitamos
  if (d.length === 12 && d.startsWith("52")) d = d.slice(2);
  if (d.length === 13 && d.startsWith("521")) d = d.slice(3);
  if (d.length === 11 && d.startsWith("1")) d = d.slice(1);
  return d.length === 10 ? `+${country}${d}` : null;
}

export function splitE164(phone: string): { country: Country; local: string } {
  if (phone.startsWith("+52")) return { country: "52", local: phone.slice(3) };
  return { country: "1", local: phone.slice(2) };
}

export function formatPhone(phone: string): string {
  const { country, local } = splitE164(phone);
  const pretty =
    country === "1"
      ? `(${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6)}`
      : `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
  return `+${country} ${pretty}`;
}
