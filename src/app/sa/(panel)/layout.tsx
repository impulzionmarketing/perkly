import Link from "next/link";
import { requireSuperadmin } from "@/lib/auth";
import { saLogout } from "../actions";

export const dynamic = "force-dynamic";

export default async function SAPanel({ children }: { children: React.ReactNode }) {
  const { user } = await requireSuperadmin();
  return (
    <div className="min-h-dvh">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-4">
          <Link href="/" className="text-lg font-bold tracking-tight">perkly</Link>
          <nav className="flex gap-1 text-sm font-medium">
            <Link href="/" className="rounded-lg px-3 py-1.5 hover:bg-black/5">Negocios</Link>
            <Link href="/nuevo" className="rounded-lg px-3 py-1.5 hover:bg-black/5">Nuevo negocio</Link>
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="hidden text-muted sm:inline">{user.email}</span>
            <form action={saLogout}><button className="font-medium text-muted">Salir</button></form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
