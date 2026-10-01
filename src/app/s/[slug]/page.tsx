import { cookies } from "next/headers";
import { getTenant } from "@/lib/tenant";
import { getLang } from "@/lib/lang";
import { createClient } from "@/lib/supabase/server";
import type { Card } from "@/lib/types";
import { TenantMark } from "@/components/TenantMark";
import { LangToggle } from "@/components/LangToggle";
import { CustomerLogin } from "./CustomerLogin";
import { LiveCard } from "./LiveCard";
import { CARD_COOKIE } from "@/lib/site";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f-]{36}$/i;

export default async function CustomerPortal({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [tenant, lang] = await Promise.all([getTenant(slug), getLang()]);

  const token = (await cookies()).get(CARD_COOKIE)?.value;
  let card: Card | null = null;
  if (token && UUID.test(token)) {
    const supabase = await createClient();
    const { data } = await supabase.rpc("get_card", { p_token: token });
    card = (data as Card) ?? null;
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-10 pt-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TenantMark tenant={tenant} size={40} />
          {!tenant.logo_url && <span className="font-semibold">{tenant.name}</span>}
        </div>
        <LangToggle lang={lang} />
      </header>

      {card && token ? (
        <LiveCard initial={card} token={token} lang={lang} />
      ) : (
        <CustomerLogin slug={slug} lang={lang} defaultCountry={tenant.default_country} reward={tenant.reward_title} required={tenant.visits_required} />
      )}
    </main>
  );
}
