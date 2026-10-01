import type { Metadata } from "next";
import { salesWhatsAppUrl } from "@/lib/site";
import { PhoneDemo } from "./PhoneDemo";
import { BrandPlayground } from "./BrandPlayground";

export const metadata: Metadata = {
  title: "Perkly · Programa de recompensas para tu negocio",
  description:
    "Tarjeta de lealtad digital para restaurantes, cafeterías y tiendas. Tus clientes acumulan visitas con su teléfono y regresan por su premio. $290 MXN al mes.",
  openGraph: {
    title: "Perkly · Que tus clientes regresen",
    description: "Tarjeta de lealtad digital con tu logo y tus colores. Sin apps, sin tarjetas de cartón.",
    locale: "es_MX",
    type: "website",
  },
};

const PRICE = "$290";

const STEPS = [
  {
    title: "Registras al cliente",
    text: "Solo su nombre y su teléfono. Perkly le genera un NIP y se lo mandas por WhatsApp con un toque.",
  },
  {
    title: "Sumas su visita",
    text: "En cada compra, recepción busca al cliente por nombre o teléfono y registra la visita. Toma segundos.",
  },
  {
    title: "Regresa por su premio",
    text: "El cliente ve su tarjeta en el celular, se actualiza al instante y sabe exactamente cuánto le falta.",
  },
];

const FOR_BUSINESS = [
  "Alta de clientes con nombre y teléfono, nada más",
  "Buscador por nombre o número",
  "Registro de visita y canje de premio en un toque",
  "Máximo una visita por día, para evitar abusos",
  "Usuarios para administración y recepción",
  "Tú defines el premio y cuántas visitas pide",
];

const FOR_CUSTOMERS = [
  "Sin descargar apps: entra con su teléfono y NIP",
  "Ve sus sellos en tiempo real",
  "Recibe su NIP por WhatsApp o SMS",
  "Se instala en su pantalla de inicio con tu logo",
  "Disponible en español e inglés",
];

const INCLUDED = [
  "Tu página de recompensas en tunegocio.perkly.club",
  "Configuración con tu logo, color y premio",
  "Clientes y visitas ilimitados",
  "Usuarios para tu equipo de mostrador",
  "Soporte directo por WhatsApp",
];

const FAQ = [
  {
    q: "¿Mis clientes tienen que descargar una app?",
    a: "No. Entran a la página de tu negocio desde el celular con su teléfono y su NIP. Si quieren, la agregan a su pantalla de inicio y se ve como una app con tu logo.",
  },
  {
    q: "¿Qué necesito en mi negocio para usarlo?",
    a: "Cualquier celular, tablet o computadora con internet. No hay equipo especial ni lector de tarjetas.",
  },
  {
    q: "¿Quién configura mi cuenta?",
    a: "Nosotros. Nos mandas tu logo, tu color y el premio que quieres dar, y te entregamos tu acceso listo para usar.",
  },
  {
    q: "¿Puedo cambiar el premio después?",
    a: "Sí. Desde tu panel cambias el premio y las visitas requeridas cuando quieras.",
  },
  {
    q: "¿Cómo reciben mis clientes su NIP?",
    a: "Al registrarlos, el sistema prepara un mensaje con su NIP y el enlace a su tarjeta. Lo envías por WhatsApp o SMS desde tu celular con un toque.",
  },
];

export default function Landing() {
  const wa = salesWhatsAppUrl();

  return (
    <div
      className="min-h-dvh overflow-x-clip bg-[#F6F5F2] text-[#141317]"
      style={{ ["--accent" as string]: "#E8492A" } as React.CSSProperties}
    >
      {/* Navegación */}
      <header className="sticky top-0 z-30 border-b border-black/5 bg-[#F6F5F2]/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5">
          <Logo />
          <nav className="ml-auto hidden items-center gap-6 text-sm font-medium text-black/70 md:flex">
            <a href="#como-funciona" className="hover:text-black">Cómo funciona</a>
            <a href="#funciones" className="hover:text-black">Funciones</a>
            <a href="#precio" className="hover:text-black">Precio</a>
            <a href="#preguntas" className="hover:text-black">Preguntas</a>
          </nav>
          <a href={wa} target="_blank" rel="noreferrer" className="ml-auto hidden rounded-full bg-[#141317] px-4 py-2 text-sm font-semibold text-white hover:bg-black md:ml-0 md:inline-flex">
            Lo quiero
          </a>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-12 md:pt-20 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-medium ring-1 ring-black/5">
              <span className="h-2 w-2 rounded-full bg-[var(--accent)]" aria-hidden />
              Programa de recompensas para restaurantes y tiendas
            </p>
            <h1 className="mt-6 font-display text-[2.9rem] font-extrabold leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
              Que tus clientes <span className="text-[var(--accent)]">regresen.</span> Una y otra vez.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-black/65 sm:text-xl">
              Cambia la tarjeta de cartón por una tarjeta de sellos digital con tu logo. Tus clientes acumulan visitas
              con su teléfono y vuelven por su premio.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <CTA href={wa}>Quiero mi programa de recompensas</CTA>
              <a href="#como-funciona" className="px-2 py-3 text-center font-semibold text-black/70 underline-offset-4 hover:underline">
                Ver cómo funciona
              </a>
            </div>
            <p className="mt-6 text-sm text-black/55">Sin apps que descargar · Sin tarjetas que se pierden · {PRICE} MXN al mes</p>
          </div>
          <div className="py-4">
            <PhoneDemo />
          </div>
        </section>

        {/* Problema */}
        <section className="border-y border-black/5 bg-white">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 md:grid-cols-3">
            {[
              ["La tarjeta de cartón se pierde", "Y con ella, la razón de tu cliente para regresar contigo."],
              ["Las apps nadie las descarga", "Pedirle a un cliente que instale algo en la caja es perderlo."],
              ["No sabes quién vuelve", "Sin registro, no sabes quiénes son tus clientes más fieles."],
            ].map(([t, d]) => (
              <div key={t}>
                <p className="font-display text-xl font-extrabold tracking-tight">{t}</p>
                <p className="mt-2 text-black/60">{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Cómo funciona */}
        <section id="como-funciona" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-24">
          <p className="text-sm font-semibold text-[var(--accent)]">Cómo funciona</p>
          <h2 className="mt-3 max-w-2xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
            Tres pasos. Cero complicaciones en el mostrador.
          </h2>
          <ol className="mt-12 grid gap-5 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="rounded-3xl bg-white p-7 ring-1 ring-black/5">
                <span className="font-display text-5xl font-extrabold text-[var(--accent)]">{i + 1}</span>
                <h3 className="mt-5 text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-black/60">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Marca */}
        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-5 py-24">
            <BrandPlayground />
          </div>
        </section>

        {/* Funciones */}
        <section id="funciones" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-24">
          <p className="text-sm font-semibold text-[var(--accent)]">Funciones</p>
          <h2 className="mt-3 max-w-2xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
            Lo necesario para que funcione. Nada que estorbe.
          </h2>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            <FeatureList title="Para tu mostrador" items={FOR_BUSINESS} />
            <FeatureList title="Para tus clientes" items={FOR_CUSTOMERS} />
          </div>
        </section>

        {/* Precio */}
        <section id="precio" className="scroll-mt-20 bg-[#141317] text-white">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-24 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-[var(--accent)]">Precio</p>
              <h2 className="mt-3 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
                Un solo plan. Todo incluido.
              </h2>
              <p className="mt-4 max-w-md text-lg text-white/65">
                Escríbenos por WhatsApp, cuéntanos de tu negocio y te entregamos tu programa de recompensas listo para
                usar.
              </p>
            </div>
            <div className="rounded-3xl bg-white p-8 text-[#141317] sm:p-10">
              <p className="font-semibold">Plan Perkly</p>
              <p className="mt-4 flex items-end gap-2">
                <span className="font-display text-6xl font-extrabold tracking-tight">{PRICE}</span>
                <span className="pb-2 text-black/55">MXN / mes</span>
              </p>
              <ul className="mt-7 space-y-3">
                {INCLUDED.map((x) => (
                  <li key={x} className="flex gap-3">
                    <Check />
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <CTA href={wa} full>Quiero mi programa de recompensas</CTA>
              </div>
            </div>
          </div>
        </section>

        {/* Preguntas */}
        <section id="preguntas" className="mx-auto max-w-3xl scroll-mt-20 px-5 py-24">
          <h2 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">Preguntas frecuentes</h2>
          <div className="mt-10 divide-y divide-black/10 border-y border-black/10">
            {FAQ.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
                  {f.q}
                  <span className="text-2xl leading-none text-black/40 transition group-open:rotate-45" aria-hidden>+</span>
                </summary>
                <p className="mt-3 text-black/65">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA final */}
        <section className="px-5 pb-28 md:pb-20">
          <div className="mx-auto max-w-6xl rounded-[2rem] bg-[var(--accent)] px-7 py-14 text-center text-white sm:px-12">
            <h2 className="mx-auto max-w-2xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
              Tu próximo cliente fiel está a una visita de distancia.
            </h2>
            <div className="mt-8 flex justify-center">
              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2.5 rounded-full bg-white px-7 py-4 text-base font-semibold text-[#141317] hover:bg-white/90"
              >
                <ChatIcon />
                Escríbenos por WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/5 pb-20 md:pb-0">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-black/55 sm:flex-row">
          <Logo small />
          <p>Un producto de Impulzion Marketing</p>
        </div>
      </footer>

      {/* Botón fijo en celular */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/5 bg-[#F6F5F2]/95 p-3 backdrop-blur md:hidden" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
        <CTA href={wa} full>Quiero mi programa · {PRICE}/mes</CTA>
      </div>
    </div>
  );
}

function Logo({ small = false }: { small?: boolean }) {
  return (
    <span className="flex items-center gap-2" aria-label="Perkly">
      <span className={`inline-flex items-center justify-center rounded-full bg-[var(--accent)] text-white ${small ? "h-6 w-6" : "h-7 w-7"}`} aria-hidden>
        <svg viewBox="0 0 24 24" className="h-1/2 w-1/2" fill="none" stroke="currentColor" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </span>
      <span className={`font-display font-extrabold tracking-tight ${small ? "text-lg" : "text-xl"}`}>perkly</span>
    </span>
  );
}

function CTA({ href, children, full = false }: { href: string; children: React.ReactNode; full?: boolean }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center justify-center gap-2.5 rounded-full bg-[var(--accent)] px-7 py-4 text-base font-semibold text-white shadow-[0_10px_30px_-10px_rgba(232,73,42,0.7)] transition hover:brightness-95 active:scale-[0.98] ${
        full ? "w-full" : ""
      }`}
    >
      <ChatIcon />
      {children}
    </a>
  );
}

function FeatureList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-3xl bg-white p-8 ring-1 ring-black/5">
      <h3 className="font-display text-2xl font-extrabold tracking-tight">{title}</h3>
      <ul className="mt-6 space-y-3.5">
        {items.map((x) => (
          <li key={x} className="flex gap-3">
            <Check />
            <span className="text-black/75">{x}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Check() {
  return (
    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-white" aria-hidden>
      <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </span>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 11.5a8 8 0 0 1-11.6 7.1L4 20l1.4-4.2A8 8 0 1 1 20 11.5z" />
    </svg>
  );
}
