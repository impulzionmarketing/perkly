"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/browser";
import { getDict, type Lang } from "@/lib/i18n";
import type { Customer, Role, TenantPublic, VisitEvent } from "@/lib/types";
import { formatPhone, onlyDigits, splitE164, toE164, type Country } from "@/lib/phone";
import { errorCode } from "@/lib/site";
import { smsLink, whatsappLink } from "@/lib/share";
import { StampCard } from "@/components/StampCard";
import { PhoneInput } from "@/components/PhoneInput";

type Props = { tenant: TenantPublic; role: Role; lang: Lang; portalUrl: string };
type Toast = { kind: "ok" | "error"; text: string } | null;

const COLS = "id,tenant_id,name,phone,pin,card_token,visit_count,total_visits,redemptions,last_visit_at,created_at";

export function Desk({ tenant, role, lang, portalUrl }: Props) {
  const t = getDict(lang);
  const supabase = getBrowserClient();
  const [q, setQ] = useState("");
  const [list, setList] = useState<Customer[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [selected, setSelected] = useState<Customer | null>(null);
  const [events, setEvents] = useState<VisitEvent[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [busy, setBusy] = useState(false);
  const [justStamped, setJustStamped] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const notify = useCallback((kind: "ok" | "error", text: string) => {
    setToast({ kind, text });
    setTimeout(() => setToast(null), 3200);
  }, []);

  const messageFor = useCallback(
    (err: { message?: string } | null) => {
      const code = errorCode(err);
      if (code === "ALREADY_TODAY") return t.alreadyToday;
      if (code === "PHONE_EXISTS") return t.phoneExists;
      if (code === "FORBIDDEN") return t.forbidden;
      return t.genericError;
    },
    [t]
  );

  // Búsqueda con debounce
  useEffect(() => {
    let cancelled = false;
    const id = setTimeout(async () => {
      setLoadingList(true);
      let query = supabase
        .from("customers")
        .select(COLS)
        .eq("tenant_id", tenant.id)
        .order("last_visit_at", { ascending: false, nullsFirst: false })
        .limit(60);
      const term = q.trim().replace(/[,()%*\\]/g, " ").trim();
      if (term) {
        const digits = onlyDigits(term);
        query =
          digits.length >= 3
            ? query.ilike("phone", `%${digits}%`)
            : query.ilike("name", `%${term.replace(/\s+/g, "%")}%`);
      }
      const { data } = await query;
      if (!cancelled) {
        setList((data as Customer[]) ?? []);
        setLoadingList(false);
      }
    }, 180);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [q, supabase, tenant.id]);

  const loadEvents = useCallback(
    async (customerId: string) => {
      const { data } = await supabase
        .from("visits")
        .select("id,kind,note,created_at")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false })
        .limit(30);
      setEvents((data as VisitEvent[]) ?? []);
    },
    [supabase]
  );

  const select = (c: Customer) => {
    setSelected(c);
    setJustStamped(false);
    setEvents([]);
    loadEvents(c.id);
  };

  const applyUpdate = (c: Customer) => {
    setSelected(c);
    setList((prev) => {
      const rest = prev.filter((x) => x.id !== c.id);
      return [c, ...rest];
    });
  };

  const run = async (fn: string, args: Record<string, unknown>, okText?: string) => {
    if (!selected) return null;
    setBusy(true);
    const { data, error } = await supabase.rpc(fn, args);
    setBusy(false);
    if (error) {
      notify("error", messageFor(error));
      return null;
    }
    if (okText) notify("ok", okText);
    return data as Customer;
  };

  const addVisit = async () => {
    const c = await run("add_visit", { p_customer: selected!.id }, t.visitAdded);
    if (c) {
      applyUpdate(c);
      setJustStamped(true);
      loadEvents(c.id);
    }
  };

  const redeem = async () => {
    if (!confirm(t.redeemConfirm)) return;
    const c = await run("redeem_reward", { p_customer: selected!.id }, t.redeemDone);
    if (c) {
      applyUpdate(c);
      setJustStamped(false);
      loadEvents(c.id);
    }
  };

  const undo = async () => {
    if (!confirm(t.undoConfirm)) return;
    const c = await run("undo_last_visit", { p_customer: selected!.id }, t.saved);
    if (c) {
      applyUpdate(c);
      setJustStamped(false);
      loadEvents(c.id);
    }
  };

  const newPin = async () => {
    if (!confirm(t.newPinConfirm)) return;
    const c = await run("regenerate_pin", { p_customer: selected!.id }, t.saved);
    if (c) applyUpdate(c);
  };

  const remove = async () => {
    if (!selected || !confirm(t.deleteConfirm)) return;
    setBusy(true);
    const { error } = await supabase.rpc("delete_customer", { p_customer: selected.id });
    setBusy(false);
    if (error) return notify("error", messageFor(error));
    setList((prev) => prev.filter((x) => x.id !== selected.id));
    setSelected(null);
  };

  return (
    <main className="mx-auto grid w-full max-w-6xl flex-1 gap-6 px-4 py-5 md:grid-cols-[minmax(300px,380px)_1fr]">
      {/* Lista */}
      <section className={`${selected ? "hidden md:flex" : "flex"} min-h-0 flex-col`}>
        <div className="flex gap-2">
          <input
            ref={searchRef}
            className="field"
            type="search"
            placeholder={t.searchPlaceholder}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoFocus
          />
          <button className="btn btn-brand shrink-0 px-4" onClick={() => setShowNew(true)} aria-label={t.newCustomer}>
            <span className="text-xl leading-none">+</span>
            <span className="hidden lg:inline">{t.newCustomer}</span>
          </button>
        </div>

        <ul className="mt-3 flex-1 overflow-y-auto rounded-2xl bg-surface md:max-h-[calc(100dvh-10rem)]">
          {!loadingList && list.length === 0 && (
            <li className="p-5 text-sm text-muted">{q ? t.noResults : t.emptyList}</li>
          )}
          {list.map((c) => {
            const ready = c.visit_count >= tenant.visits_required;
            const active = selected?.id === c.id;
            return (
              <li key={c.id}>
                <button
                  onClick={() => select(c)}
                  className={`flex w-full items-center gap-3 border-b border-line px-4 py-3 text-left last:border-0 ${
                    active ? "bg-brand-soft" : "hover:bg-black/[0.02]"
                  }`}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{c.name}</span>
                    <span className="block text-sm text-muted">{formatPhone(c.phone)}</span>
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      ready ? "bg-brand text-brand-fg" : "bg-bg text-muted"
                    }`}
                  >
                    {Math.min(c.visit_count, tenant.visits_required)}/{tenant.visits_required}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Detalle */}
      <section className={`${selected ? "block" : "hidden md:block"}`}>
        {!selected ? (
          <div className="flex h-full min-h-64 items-center justify-center rounded-2xl border-2 border-dashed border-line p-8 text-center text-muted">
            {t.selectCustomer}
          </div>
        ) : (
          <CustomerDetail
            key={selected.id}
            c={selected}
            events={events}
            tenant={tenant}
            role={role}
            lang={lang}
            busy={busy}
            justStamped={justStamped}
            portalUrl={portalUrl}
            onBack={() => {
              setSelected(null);
              setTimeout(() => searchRef.current?.focus(), 50);
            }}
            onVisit={addVisit}
            onRedeem={redeem}
            onUndo={undo}
            onNewPin={newPin}
            onDelete={remove}
            onEdited={(c) => {
              applyUpdate(c);
              notify("ok", t.saved);
            }}
            onError={(e) => notify("error", messageFor(e))}
          />
        )}
      </section>

      {showNew && (
        <NewCustomer
          tenant={tenant}
          lang={lang}
          portalUrl={portalUrl}
          onClose={() => setShowNew(false)}
          onCreated={(c) => {
            setList((prev) => [c, ...prev]);
            select(c);
          }}
          onError={(e) => notify("error", messageFor(e))}
        />
      )}

      {toast && (
        <div
          role="status"
          className={`fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg ${
            toast.kind === "ok" ? "bg-ink" : "bg-danger"
          }`}
        >
          {toast.text}
        </div>
      )}
    </main>
  );
}

/* ------------------------------------------------------------------ */

function CustomerDetail({
  c,
  events,
  tenant,
  role,
  lang,
  busy,
  justStamped,
  portalUrl,
  onBack,
  onVisit,
  onRedeem,
  onUndo,
  onNewPin,
  onDelete,
  onEdited,
  onError,
}: {
  c: Customer;
  events: VisitEvent[];
  tenant: TenantPublic;
  role: Role;
  lang: Lang;
  busy: boolean;
  justStamped: boolean;
  portalUrl: string;
  onBack: () => void;
  onVisit: () => void;
  onRedeem: () => void;
  onUndo: () => void;
  onNewPin: () => void;
  onDelete: () => void;
  onEdited: (c: Customer) => void;
  onError: (e: { message?: string }) => void;
}) {
  const t = getDict(lang);
  const [editing, setEditing] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const ready = c.visit_count >= tenant.visits_required;
  const fmt = useMemo(
    () =>
      new Intl.DateTimeFormat(lang === "es" ? "es-MX" : "en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
    [lang]
  );
  const first = c.name.split(" ")[0];
  const resendText = t.waResend(first, tenant.name, c.pin, portalUrl);

  return (
    <div className="rounded-2xl bg-surface p-5 sm:p-7">
      <button onClick={onBack} className="mb-4 text-sm font-medium text-muted md:hidden">
        ← {t.desk}
      </button>

      {editing ? (
        <EditCustomer c={c} lang={lang} onCancel={() => setEditing(false)} onSaved={(n) => { setEditing(false); onEdited(n); }} onError={onError} />
      ) : (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{c.name}</h2>
            <p className="mt-0.5 text-muted">{formatPhone(c.phone)}</p>
          </div>
          <button className="btn btn-ghost px-3 py-2 text-sm" onClick={() => setEditing(true)}>
            {t.edit}
          </button>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[auto_1fr] lg:items-center">
        <StampCard count={c.visit_count} required={tenant.visits_required} highlightLast={justStamped} />
        <div>
          <p className="text-4xl font-bold tracking-tight">
            {Math.min(c.visit_count, tenant.visits_required)}
            <span className="text-muted">/{tenant.visits_required}</span>
          </p>
          <p className="mt-1 text-sm text-muted">
            {ready ? (
              <span className="font-semibold text-brand">{t.readyToRedeem}: {tenant.reward_title}</span>
            ) : (
              t.toGo(tenant.visits_required - c.visit_count)
            )}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <button className="btn btn-brand flex-1 py-4 text-base" onClick={onVisit} disabled={busy}>
          {t.addVisit}
        </button>
        {ready && (
          <button className="btn btn-ghost flex-1 py-4 text-base" onClick={onRedeem} disabled={busy}>
            {t.redeem}
          </button>
        )}
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-muted">{t.pin}</dt>
          <dd className="mt-0.5 font-semibold">
            <button onClick={() => setShowPin((v) => !v)} className="tracking-[0.3em]">
              {showPin ? c.pin : "••••"}
            </button>
          </dd>
        </div>
        <div>
          <dt className="text-muted">{t.lastVisit}</dt>
          <dd className="mt-0.5 font-semibold">{c.last_visit_at ? fmt.format(new Date(c.last_visit_at)).split(",")[0] : t.never}</dd>
        </div>
        <div>
          <dt className="text-muted">{t.totalVisits}</dt>
          <dd className="mt-0.5 font-semibold">{c.total_visits}</dd>
        </div>
        <div>
          <dt className="text-muted">{t.rewardsWon}</dt>
          <dd className="mt-0.5 font-semibold">{c.redemptions}</dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-wrap gap-2 text-sm">
        <a className="btn btn-ghost px-3 py-2" href={whatsappLink(c.phone, resendText)} target="_blank" rel="noreferrer">
          {t.resendPin} · WhatsApp
        </a>
        <button className="btn btn-ghost px-3 py-2" onClick={onNewPin} disabled={busy}>
          {t.newPin}
        </button>
        {role === "admin" && (
          <>
            <button className="btn btn-ghost px-3 py-2" onClick={onUndo} disabled={busy || c.visit_count < 1}>
              {t.undo}
            </button>
            <button className="btn btn-ghost btn-danger px-3 py-2" onClick={onDelete} disabled={busy}>
              {t.delete}
            </button>
          </>
        )}
      </div>

      <h3 className="mt-8 text-sm font-semibold text-muted">{t.history}</h3>
      {events.length === 0 ? (
        <p className="mt-2 text-sm text-muted">{t.noHistory}</p>
      ) : (
        <ul className="mt-2 divide-y divide-line border-y border-line">
          {events.map((e) => (
            <li key={e.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <span className={e.kind === "redeem" ? "font-semibold text-brand" : ""}>
                {e.kind === "redeem" ? `${t.redeemed}: ${e.note ?? ""}` : t.visit}
              </span>
              <span className="text-muted">{fmt.format(new Date(e.created_at))}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-xs text-muted">
        {t.memberSince} {fmt.format(new Date(c.created_at)).split(",")[0]}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function EditCustomer({
  c,
  lang,
  onCancel,
  onSaved,
  onError,
}: {
  c: Customer;
  lang: Lang;
  onCancel: () => void;
  onSaved: (c: Customer) => void;
  onError: (e: { message?: string }) => void;
}) {
  const t = getDict(lang);
  const parts = splitE164(c.phone);
  const [name, setName] = useState(c.name);
  const [country, setCountry] = useState<Country>(parts.country);
  const [local, setLocal] = useState(parts.local);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const phone = toE164(country, local);
    if (name.trim().length < 2) return setErr(t.invalidName);
    if (!phone) return setErr(t.invalidPhone);
    setBusy(true);
    const { data, error } = await getBrowserClient().rpc("update_customer", { p_customer: c.id, p_name: name, p_phone: phone });
    setBusy(false);
    if (error) return onError(error);
    onSaved(data as Customer);
  };

  return (
    <form onSubmit={save} className="space-y-3">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">{t.fullName}</span>
        <input className="field" value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <PhoneInput country={country} local={local} onCountry={setCountry} onLocal={setLocal} label={t.phone} />
      {err && <p className="text-sm text-danger">{err}</p>}
      <div className="flex gap-2">
        <button className="btn btn-brand" disabled={busy}>{t.save}</button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>{t.cancel}</button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */

function NewCustomer({
  tenant,
  lang,
  portalUrl,
  onClose,
  onCreated,
  onError,
}: {
  tenant: TenantPublic;
  lang: Lang;
  portalUrl: string;
  onClose: () => void;
  onCreated: (c: Customer) => void;
  onError: (e: { message?: string }) => void;
}) {
  const t = getDict(lang);
  const [name, setName] = useState("");
  const [country, setCountry] = useState<Country>(tenant.default_country);
  const [local, setLocal] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<Customer | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const phone = toE164(country, local);
    if (name.trim().length < 2) return setErr(t.invalidName);
    if (!phone) return setErr(t.invalidPhone);
    setBusy(true);
    const { data, error } = await getBrowserClient().rpc("create_customer", {
      p_tenant: tenant.id,
      p_name: name,
      p_phone: phone,
    });
    setBusy(false);
    if (error) {
      if (errorCode(error) === "PHONE_EXISTS") return setErr(t.phoneExists);
      return onError(error);
    }
    const c = data as Customer;
    setCreated(c);
    onCreated(c);
  };

  const welcome = created ? t.waWelcome(created.name.split(" ")[0], tenant.name, created.pin, portalUrl) : "";

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/30 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-customer-title"
        className="w-full max-w-md rounded-t-3xl bg-surface p-6 shadow-xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {!created ? (
          <form onSubmit={submit} className="space-y-4">
            <h2 id="new-customer-title" className="text-xl font-bold tracking-tight">
              {t.newCustomer}
            </h2>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">{t.fullName}</span>
              <input className="field" value={name} onChange={(e) => setName(e.target.value)} autoFocus autoComplete="off" />
            </label>
            <PhoneInput country={country} local={local} onCountry={setCountry} onLocal={setLocal} label={t.phone} />
            {err && <p className="text-sm text-danger">{err}</p>}
            <div className="flex gap-2 pt-1">
              <button className="btn btn-brand flex-1" disabled={busy}>
                {t.register}
              </button>
              <button type="button" className="btn btn-ghost" onClick={onClose}>
                {t.cancel}
              </button>
            </div>
          </form>
        ) : (
          <div>
            <h2 id="new-customer-title" className="text-xl font-bold tracking-tight">
              {t.registered}
            </h2>
            <p className="mt-1 text-muted">{created.name}</p>
            <p className="mt-5 text-sm text-muted">{t.givePin}</p>
            <p className="mt-2 rounded-2xl bg-brand-soft py-4 text-center text-5xl font-bold tracking-[0.35em] text-brand">
              {created.pin}
            </p>
            <div className="mt-5 grid gap-2">
              <a className="btn btn-brand" href={whatsappLink(created.phone, welcome)} target="_blank" rel="noreferrer">
                {t.sendWhatsApp}
              </a>
              <a className="btn btn-ghost" href={smsLink(created.phone, welcome)}>
                {t.sendSms}
              </a>
              <button className="btn btn-ghost" onClick={onClose}>
                {t.close}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
