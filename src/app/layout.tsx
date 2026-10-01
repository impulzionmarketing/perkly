import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getLang } from "@/lib/lang";

export const metadata: Metadata = {
  title: "Perkly",
  description: "Programa de lealtad por visitas",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f4f5f7",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  return (
    <html lang={lang}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700&display=swap"
        />
      </head>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
