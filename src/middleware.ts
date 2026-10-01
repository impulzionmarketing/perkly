import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const ROOT = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "perkly.club").split(":")[0];
const SUPERADMIN_SUB = "admin";

function subdomainOf(host: string): string | null {
  const h = host.split(":")[0].toLowerCase();
  if (h === ROOT || h === `www.${ROOT}`) return null;
  if (h.endsWith(`.${ROOT}`)) return h.slice(0, -(ROOT.length + 1));
  return null;
}

export async function middleware(req: NextRequest) {
  const sub = subdomainOf(req.headers.get("host") || "");
  const { pathname, search } = req.nextUrl;

  // Las rutas internas no se exponen directamente
  if (/^\/(s|sa|home)(\/|$)/.test(pathname)) {
    return new NextResponse(null, { status: 404 });
  }

  let target: string;
  if (!sub) target = `/home${pathname === "/" ? "" : pathname}`;
  else if (sub === SUPERADMIN_SUB) target = `/sa${pathname === "/" ? "" : pathname}`;
  else target = `/s/${sub}${pathname === "/" ? "" : pathname}`;

  const url = req.nextUrl.clone();
  url.pathname = target;
  url.search = search;
  let res = NextResponse.rewrite(url);

  // Refresca la sesión de Supabase solo en paneles con login
  const needsSession = sub === SUPERADMIN_SUB || pathname.startsWith("/admin");
  if (sub && needsSession) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => req.cookies.getAll(),
          setAll: (list) => {
            list.forEach(({ name, value }) => req.cookies.set(name, value));
            res = NextResponse.rewrite(url, { request: { headers: req.headers } });
            list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
          },
        },
      }
    );
    await supabase.auth.getUser();
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico|webp|txt)$).*)"],
};
