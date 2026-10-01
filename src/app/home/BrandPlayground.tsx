"use client";
import { useState } from "react";
import { PhoneDemo } from "./PhoneDemo";

const PRESETS = [
  { color: "#E8492A", business: "Café Aurora", reward: "Café americano gratis", label: "Cafetería" },
  { color: "#1F7A4D", business: "La Hortaliza", reward: "Ensalada de la casa", label: "Restaurante" },
  { color: "#2B59C3", business: "Barbería Norte", reward: "Corte de cortesía", label: "Barbería" },
  { color: "#8A3FFC", business: "Nieves Polar", reward: "Nieve doble gratis", label: "Neverías" },
  { color: "#C2410C", business: "Tacos El Güero", reward: "Orden de tacos gratis", label: "Taquería" },
  { color: "#0F766E", business: "Lavandería Clara", reward: "Lavado de cortesía", label: "Servicios" },
];

export function BrandPlayground() {
  const [i, setI] = useState(0);
  const p = PRESETS[i];
  return (
    <div className="grid items-center gap-12 lg:grid-cols-[1fr_auto]">
      <div>
        <p className="text-sm font-semibold text-[var(--accent)]">Tu marca, no la nuestra</p>
        <h2 className="mt-3 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
          Con tu logo, tus colores y tu premio.
        </h2>
        <p className="mt-4 max-w-lg text-lg text-muted">
          Tus clientes ven tu negocio, no una app genérica. Tú decides cuántas visitas pide el premio y qué regalas, y lo
          puedes cambiar cuando quieras.
        </p>
        <div className="mt-8 flex flex-wrap gap-2.5" role="radiogroup" aria-label="Ejemplos de giro">
          {PRESETS.map((x, idx) => (
            <button
              key={x.label}
              role="radio"
              aria-checked={idx === i}
              onClick={() => setI(idx)}
              className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition ${
                idx === i ? "border-[#141317] bg-[#141317] text-white" : "border-black/10 bg-white hover:border-black/25"
              }`}
            >
              <span className="h-3.5 w-3.5 rounded-full" style={{ background: x.color }} aria-hidden />
              {x.label}
            </button>
          ))}
        </div>
      </div>
      <PhoneDemo key={i} color={p.color} business={p.business} reward={p.reward} />
    </div>
  );
}
