export const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "perkly.club";

export function tenantUrl(slug: string) {
  const local = ROOT_DOMAIN.startsWith("localhost");
  return `${local ? "http" : "https"}://${slug}.${ROOT_DOMAIN}`;
}

/** Traduce los códigos de error de las funciones SQL. */
export function errorCode(err: { message?: string } | null | undefined): string {
  const m = err?.message || "";
  for (const code of ["PHONE_EXISTS", "ALREADY_TODAY", "NOT_ENOUGH", "NOTHING_TO_UNDO", "FORBIDDEN"]) {
    if (m.includes(code)) return code;
  }
  return "UNKNOWN";
}
export const CARD_COOKIE = "perkly_card";
