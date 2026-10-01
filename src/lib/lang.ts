import { cookies } from "next/headers";
import type { Lang } from "./i18n";

export async function getLang(): Promise<Lang> {
  const v = (await cookies()).get("lang")?.value;
  return v === "en" ? "en" : "es";
}
