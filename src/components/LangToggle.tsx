"use client";
import { useRouter } from "next/navigation";
import type { Lang } from "@/lib/i18n";

export function LangToggle({ lang }: { lang: Lang }) {
  const router = useRouter();
  const next = lang === "es" ? "en" : "es";
  return (
    <button
      type="button"
      onClick={() => {
        document.cookie = `lang=${next}; path=/; max-age=31536000; samesite=lax`;
        router.refresh();
      }}
      className="rounded-lg px-2 py-1 text-sm font-semibold text-muted hover:bg-black/5"
      aria-label={next === "en" ? "Switch to English" : "Cambiar a español"}
    >
      {next.toUpperCase()}
    </button>
  );
}
