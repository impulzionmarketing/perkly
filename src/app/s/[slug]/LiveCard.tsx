"use client";
import { useEffect, useRef, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/browser";
import { getDict, type Lang } from "@/lib/i18n";
import type { Card } from "@/lib/types";
import { StampCard } from "@/components/StampCard";
import { customerLogout } from "./actions";

export function LiveCard({ initial, token, lang }: { initial: Card; token: string; lang: Lang }) {
  const t = getDict(lang);
  const [card, setCard] = useState(initial);
  const [pulse, setPulse] = useState(false);
  const prevCount = useRef(initial.visit_count);

  useEffect(() => {
    const supabase = getBrowserClient();
    const refresh = async () => {
      const { data } = await supabase.rpc("get_card", { p_token: token });
      if (data) setCard(data as Card);
    };
    const channel = supabase
      .channel(`card:${token}`)
      .on("broadcast", { event: "card_updated" }, () => refresh())
      .subscribe();
    const onVisible = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      supabase.removeChannel(channel);
    };
  }, [token]);

  useEffect(() => {
    if (card.visit_count > prevCount.current) {
      setPulse(true);
      const id = setTimeout(() => setPulse(false), 900);
      prevCount.current = card.visit_count;
      return () => clearTimeout(id);
    }
    prevCount.current = card.visit_count;
  }, [card.visit_count]);

  const shown = Math.min(card.visit_count, card.visits_required);
  const left = Math.max(card.visits_required - card.visit_count, 0);
  const ready = left === 0;
  const first = card.name.split(" ")[0];
  const fmt = new Intl.DateTimeFormat(lang === "es" ? "es-MX" : "en-US", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

  return (
    <section className="mt-8 flex flex-1 flex-col">
      <p className="text-muted">
        {t.hello}, {first}
      </p>
      <h1 className="mt-1 text-[2.6rem] font-bold leading-none tracking-tight" aria-live="polite">
        {t.visitsOf(shown, card.visits_required)}
      </h1>

      <div className="mt-7">
        <StampCard count={card.visit_count} required={card.visits_required} highlightLast={pulse} />
      </div>

      <div className={`mt-7 rounded-2xl p-4 ${ready ? "bg-brand text-brand-fg" : "bg-surface"}`}>
        <p className={`text-sm ${ready ? "opacity-85" : "text-muted"}`}>{ready ? t.rewardReady : t.toGo(left)}</p>
        <p className="mt-1 text-lg font-semibold">{card.reward_title}</p>
        {card.reward_description && <p className={`mt-0.5 text-sm ${ready ? "opacity-85" : "text-muted"}`}>{card.reward_description}</p>}
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl bg-surface p-4">
          <dt className="text-muted">{t.totalVisits}</dt>
          <dd className="mt-1 text-xl font-semibold">{card.total_visits}</dd>
        </div>
        <div className="rounded-2xl bg-surface p-4">
          <dt className="text-muted">{t.rewardsWon}</dt>
          <dd className="mt-1 text-xl font-semibold">{card.redemptions}</dd>
        </div>
      </dl>

      <h2 className="mt-8 text-sm font-semibold text-muted">{t.history}</h2>
      {card.history.length === 0 ? (
        <p className="mt-2 text-sm text-muted">{t.noHistory}</p>
      ) : (
        <ul className="mt-2 divide-y divide-line border-y border-line">
          {card.history.map((h, i) => (
            <li key={i} className="flex items-center justify-between py-3 text-sm">
              <span className={h.kind === "redeem" ? "font-semibold" : ""}>
                {h.kind === "redeem" ? `${t.redeemed}: ${h.note ?? ""}` : t.visit}
              </span>
              <span className="text-muted">{fmt.format(new Date(h.created_at))}</span>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-8 text-center text-xs text-muted">{t.installHint}</p>
      <form action={customerLogout} className="mt-3 text-center">
        <button className="text-sm font-medium text-muted underline underline-offset-4">{t.signOut}</button>
      </form>
    </section>
  );
}
