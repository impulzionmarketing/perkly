import { SALoginForm } from "./SALoginForm";

export default async function SALogin({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const { e } = await searchParams;
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-5">
      <p className="text-2xl font-bold tracking-tight">perkly</p>
      <p className="text-muted">Panel de agencia</p>
      <SALoginForm accessError={e === "access"} />
    </main>
  );
}
