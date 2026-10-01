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

/** Número de WhatsApp de ventas (solo dígitos, con lada; ej. 528781234567). */
export const SALES_WHATSAPP = (process.env.NEXT_PUBLIC_SALES_WHATSAPP || "").replace(/\D/g, "");

export const SALES_MESSAGE =
  "Hola, quiero el programa de recompensas Perkly para mi negocio.\n\nNombre del negocio: \nGiro (restaurante, café, tienda...): \nCiudad: ";

export function salesWhatsAppUrl(text = SALES_MESSAGE) {
  return `https://wa.me/${SALES_WHATSAPP}?text=${encodeURIComponent(text)}`;
}
