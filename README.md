# Perkly — tarjetas de lealtad por visitas

Una sola app multi-tenant para todos los clientes de la agencia. Cada negocio vive en su subdominio y solo cambia su logo, color principal, premio y accesos.

| URL | Quién la usa | Qué hace |
|---|---|---|
| `admin.perkly.club` | Agencia (superadmin) | Crear negocios, subir logo, elegir color, dar accesos |
| `negocio.perkly.club/admin` | Administración y recepción del negocio | Registrar clientes, registrar visitas, canjear premios, ajustes |
| `negocio.perkly.club` | Clientes finales | Consultar sus visitas con teléfono + NIP (en tiempo real) |

**Stack:** Next.js 15 (App Router) · Supabase (Postgres, Auth, Realtime, Storage) · Tailwind 4 · Vercel.

---

## 1. Supabase

1. Crea un proyecto (plan Free para pruebas, Pro al salir a producción).
2. Abre **SQL Editor**, pega el contenido de `supabase/migrations/0001_init.sql` y ejecútalo completo. Crea tablas, reglas de seguridad (RLS), funciones y el bucket público `logos`.
3. **Authentication → Users → Add user**: crea tu usuario de agencia con correo y contraseña y marca *Auto confirm*.
4. En SQL Editor, conviértelo en superadmin:
   ```sql
   insert into superadmins (user_id)
   select id from auth.users where email = 'tu-correo@impulzionmarketing.com';
   ```
5. **Authentication → Providers → Email**: desactiva *Allow new users to sign up* (los usuarios solo los crea la agencia o el admin de cada negocio).
6. **Realtime → Settings**: verifica que esté permitido el acceso a canales públicos (viene activado por defecto). La tarjeta del cliente escucha un canal cuyo nombre es un token secreto, sin datos personales.
7. **Project Settings → API**: copia `URL`, `anon key` y `service_role key`.

## 2. Variables de entorno

Copia `.env.example` a `.env.local` (local) y configura las mismas en Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...        # solo servidor
NEXT_PUBLIC_ROOT_DOMAIN=perkly.club  # en local: localhost:3000
```

## 3. Probar en local

```bash
npm install
npm run dev
```

Los navegadores resuelven `*.localhost` solos, así que no hay que tocar el archivo hosts:

- `http://admin.localhost:3000` → panel de agencia
- `http://tacos.localhost:3000/admin` → panel del negocio con subdominio `tacos`
- `http://tacos.localhost:3000` → portal de clientes

## 4. Despliegue en Vercel + dominio

1. Sube el repo a GitHub (org `impulzionmarketing`) e impórtalo en Vercel. Agrega las variables de entorno.
2. **Settings → Domains**: agrega `perkly.club` y `*.perkly.club`.
3. En el registrador del dominio, cambia los nameservers a los de Vercel (`ns1.vercel-dns.com`, `ns2.vercel-dns.com`). El comodín `*.perkly.club` solo funciona con este método. Vercel emite los certificados SSL de cada subdominio automáticamente.
4. Si el correo de `perkly.club` vive en otro proveedor, recrea sus registros MX/TXT en **Vercel → Domains → DNS Records** antes de cambiar los nameservers.

## 5. Dar de alta un negocio nuevo (2 minutos)

1. Entra a `admin.perkly.club` → **Nuevo negocio**.
2. Llena nombre, subdominio, color, logo, lada predeterminada, zona horaria, premio inicial y el correo/contraseña del administrador.
3. Comparte con el negocio: `https://subdominio.perkly.club/admin` + credenciales. Desde **Ajustes**, el admin puede agregar a su recepción.
4. Para el mostrador, imprime un QR que apunte a `https://subdominio.perkly.club` para que los clientes consulten sus visitas.

No hay que desplegar nada ni copiar código: el subdominio funciona en cuanto se guarda.

---

## Reglas de negocio

- **Registro:** nombre completo + teléfono (+52 o +1, 10 dígitos). El teléfono es único por negocio. El NIP de 4 dígitos se genera solo y se muestra en pantalla con botones para enviarlo por WhatsApp o SMS con el mensaje ya escrito.
- **Visitas:** máximo una por día por cliente según la zona horaria del negocio (desactivable en Ajustes).
- **Canje:** disponible al llegar a la meta. Resta la meta del contador, así que las visitas sobrantes se conservan.
- **Cambio de meta:** aplica a todos desde ese momento. Quien ya la supere queda listo para canjear.
- **Roles:**
  - *Recepción*: buscar, registrar clientes y visitas, canjear, reenviar o regenerar NIP, editar datos.
  - *Administración*: además deshace la última visita, elimina clientes, cambia el premio y gestiona al equipo.
  - *Superadmin (agencia)*: entra como administración a cualquier negocio.
- **Seguridad del portal:** 5 NIP incorrectos bloquean ese teléfono 15 minutos. La sesión del cliente se guarda en una cookie httpOnly por un año. Si alguien pierde su NIP, recepción genera uno nuevo y lo reenvía.
- **Bilingüe:** español / inglés con el botón ES/EN (portal y panel del negocio).
- **App instalable:** cada negocio tiene su propio manifiesto, así que el cliente puede "Agregar a pantalla de inicio" y ver el logo del negocio.

## Estructura

```
supabase/migrations/0001_init.sql   Esquema, RLS, funciones (toda escritura pasa por funciones SQL)
src/middleware.ts                   Subdominio → ruta interna (/s/[slug], /sa, /home)
src/app/s/[slug]/                   Portal del cliente + panel del negocio (/admin)
src/app/sa/                         Panel de agencia
src/lib/                            Supabase, i18n, teléfonos, colores
src/components/StampCard.tsx        Tarjeta de sellos (pieza visual principal)
```

## Siguientes pasos sugeridos

- SMS/WhatsApp automático al registrar (Twilio o WhatsApp Business API) cuando se defina proveedor.
- QR imprimible por negocio desde el panel de agencia.
- Búsqueda sin acentos (extensión `unaccent`).
- Reporte mensual por negocio: clientes nuevos, visitas y canjes.
