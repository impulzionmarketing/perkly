"use client";
import { useEffect, useState } from "react";
import { brandVars } from "@/lib/color";
import { StampCard } from "@/components/StampCard";

const REQUIRED = 8;

/** Celular de muestra con la tarjeta de sellos llenándose sola. */
export function PhoneDemo({
  color = "#E8492A",
  business = "Café Aurora",
  reward = "Café americano gratis",
}: {
  color?: string;
  business?: string;
  reward?: string;
}) {
  const [count, setCount] = useState(5);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const id = setInterval(() => {
      setCount((c) => (c >= REQUIRED + 2 ? 3 : c + 1));
    }, 1700);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (count > REQUIRED) return;
    setToast(true);
    const id = setTimeout(() => setToast(false), 1100);
    return () => clearTimeout(id);
  }, [count]);

  const shown = Math.min(count, REQUIRED);
  const ready = shown >= REQUIRED;

  return (
    <div style={brandVars(color) as React.CSSProperties} className="relative mx-auto w-[280px] sm:w-[300px]">
      <div className="rounded-[2.6rem] bg-[#141317] p-2.5 shadow-[0_40px_80px_-30px_rgba(20,19,23,0.45)]">
        <div className="relative overflow-hidden rounded-[2.1rem] bg-[#f4f5f7] px-5 pb-6 pt-9">
          <div className="absolute left-1/2 top-2.5 h-5 w-20 -translate-x-1/2 rounded-full bg-[#141317]" aria-hidden />
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-brand-fg transition-colors duration-500">
              {business.charAt(0)}
            </span>
            <span className="text-sm font-semibold text-ink">{business}</span>
          </div>
          <p className="mt-6 text-xs text-muted">Hola, Mariana</p>
          <p className="mt-0.5 text-[1.7rem] font-bold leading-none tracking-tight text-ink">
            {shown} de {REQUIRED} visitas
          </p>
          <div className="mt-5">
            <StampCard count={shown} required={REQUIRED} highlightLast size="sm" />
          </div>
          <div
            className={`mt-5 rounded-2xl p-3.5 transition-colors duration-500 ${ready ? "bg-brand text-brand-fg" : "bg-white text-ink"}`}
          >
            <p className={`text-[11px] ${ready ? "opacity-85" : "text-muted"}`}>
              {ready ? "¡Tu premio está listo!" : `Te faltan ${REQUIRED - shown} visitas`}
            </p>
            <p className="mt-0.5 text-sm font-semibold">{reward}</p>
          </div>
          <div className="mt-4 space-y-2" aria-hidden>
            <div className="h-2 w-3/4 rounded-full bg-black/[0.06]" />
            <div className="h-2 w-1/2 rounded-full bg-black/[0.06]" />
          </div>
        </div>
      </div>

      <div
        aria-hidden
        className={`absolute -left-6 top-1/3 flex items-center gap-2 rounded-2xl bg-white px-3.5 py-2.5 text-sm font-semibold text-ink shadow-lg ring-1 ring-black/5 transition-all duration-300 sm:-left-14 ${
          toast ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand text-brand-fg">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </span>
        Visita registrada
      </div>
    </div>
  );
}
