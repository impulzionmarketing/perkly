import { brandVars } from "@/lib/color";

export const metadata = { title: "Perkly · Agencia" };

export default function SALayout({ children }: { children: React.ReactNode }) {
  return <div style={brandVars("#1F2430") as React.CSSProperties}>{children}</div>;
}
