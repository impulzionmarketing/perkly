-- =====================================================================
-- Perkly — esquema inicial (multi-tenant, un solo proyecto de Supabase)
-- Ejecutar completo en: Supabase > SQL Editor
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Tablas
-- ---------------------------------------------------------------------

create table public.tenants (
  id                 uuid primary key default gen_random_uuid(),
  slug               text not null unique
                     check (slug ~ '^[a-z0-9]([a-z0-9-]{0,38}[a-z0-9])?$'
                            and slug not in ('admin','www','app','api','mail')),
  name               text not null,
  logo_url           text,
  primary_color      text not null default '#2563EB' check (primary_color ~ '^#[0-9A-Fa-f]{6}$'),
  reward_title       text not null default 'Premio de cortesía',
  reward_description text,
  visits_required    int  not null default 10 check (visits_required between 1 and 50),
  one_visit_per_day  boolean not null default true,
  timezone           text not null default 'America/Matamoros',
  default_country    text not null default '52' check (default_country in ('52','1')),
  active             boolean not null default true,
  created_at         timestamptz not null default now()
);

create table public.superadmins (
  user_id uuid primary key references auth.users on delete cascade
);

create table public.memberships (
  user_id      uuid not null references auth.users on delete cascade,
  tenant_id    uuid not null references public.tenants on delete cascade,
  role         text not null check (role in ('admin','staff')),
  display_name text,
  email        text,
  created_at   timestamptz not null default now(),
  primary key (user_id, tenant_id)
);

create table public.customers (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references public.tenants on delete cascade,
  name            text not null check (char_length(btrim(name)) between 2 and 80),
  phone           text not null check (phone ~ '^\+(52|1)[0-9]{10}$'),
  pin             text not null check (pin ~ '^[0-9]{4}$'),
  card_token      uuid not null unique default gen_random_uuid(),
  visit_count     int  not null default 0,   -- visitas del ciclo actual
  total_visits    int  not null default 0,   -- visitas históricas
  redemptions     int  not null default 0,   -- premios canjeados
  last_visit_at   timestamptz,
  failed_attempts int  not null default 0,
  locked_until    timestamptz,
  created_at      timestamptz not null default now(),
  unique (tenant_id, phone)
);
create index customers_tenant_name_idx on public.customers (tenant_id, lower(name));
create index customers_tenant_last_idx on public.customers (tenant_id, last_visit_at desc nulls last);

create table public.visits (
  id          bigint generated always as identity primary key,
  tenant_id   uuid not null references public.tenants on delete cascade,
  customer_id uuid not null references public.customers on delete cascade,
  kind        text not null default 'visit' check (kind in ('visit','redeem')),
  note        text,
  created_by  uuid references auth.users on delete set null,
  created_at  timestamptz not null default now()
);
create index visits_customer_idx on public.visits (customer_id, created_at desc);

-- ---------------------------------------------------------------------
-- Helpers de permisos
-- ---------------------------------------------------------------------

create or replace function public.is_superadmin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from superadmins where user_id = auth.uid());
$$;

-- 'admin' | 'staff' | null. Un superadmin cuenta como admin en cualquier negocio.
create or replace function public.tenant_role(p_tenant uuid)
returns text language sql stable security definer set search_path = public as $$
  select case
    when (select is_superadmin()) then 'admin'
    else (select role from memberships where user_id = auth.uid() and tenant_id = p_tenant)
  end;
$$;

-- ---------------------------------------------------------------------
-- RLS: lectura directa para el equipo; toda escritura pasa por funciones
-- ---------------------------------------------------------------------

alter table public.tenants     enable row level security;
alter table public.superadmins enable row level security;
alter table public.memberships enable row level security;
alter table public.customers   enable row level security;
alter table public.visits      enable row level security;

create policy tenants_read on public.tenants for select to authenticated
  using (tenant_role(id) is not null);

create policy superadmins_self on public.superadmins for select to authenticated
  using (user_id = auth.uid());

create policy memberships_read on public.memberships for select to authenticated
  using (user_id = auth.uid() or tenant_role(tenant_id) = 'admin');

create policy customers_read on public.customers for select to authenticated
  using (tenant_role(tenant_id) is not null);

create policy visits_read on public.visits for select to authenticated
  using (tenant_role(tenant_id) is not null);

-- ---------------------------------------------------------------------
-- Tiempo real: avisa a la tarjeta del cliente (canal público con token secreto)
-- ---------------------------------------------------------------------

create or replace function public._notify_card(p_token uuid, p_count int)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform realtime.send(
    jsonb_build_object('visit_count', p_count),
    'card_updated',
    'card:' || p_token::text,
    false
  );
exception when others then
  null; -- nunca bloquear la operación si Realtime no está disponible
end;
$$;

-- ---------------------------------------------------------------------
-- Funciones del equipo (admin / recepción)
-- ---------------------------------------------------------------------

create or replace function public.create_customer(p_tenant uuid, p_name text, p_phone text)
returns public.customers language plpgsql security definer set search_path = public as $$
declare c customers;
begin
  if tenant_role(p_tenant) is null then raise exception 'FORBIDDEN'; end if;
  begin
    insert into customers (tenant_id, name, phone, pin)
    values (p_tenant, btrim(p_name), p_phone, lpad((floor(random() * 10000))::int::text, 4, '0'))
    returning * into c;
  exception when unique_violation then
    raise exception 'PHONE_EXISTS';
  end;
  return c;
end;
$$;

create or replace function public.update_customer(p_customer uuid, p_name text, p_phone text)
returns public.customers language plpgsql security definer set search_path = public as $$
declare c customers;
begin
  select * into c from customers where id = p_customer;
  if c.id is null or tenant_role(c.tenant_id) is null then raise exception 'FORBIDDEN'; end if;
  begin
    update customers set name = btrim(p_name), phone = p_phone where id = p_customer returning * into c;
  exception when unique_violation then
    raise exception 'PHONE_EXISTS';
  end;
  return c;
end;
$$;

create or replace function public.add_visit(p_customer uuid)
returns public.customers language plpgsql security definer set search_path = public as $$
declare c customers; t tenants;
begin
  select * into c from customers where id = p_customer for update;
  if c.id is null or tenant_role(c.tenant_id) is null then raise exception 'FORBIDDEN'; end if;
  select * into t from tenants where id = c.tenant_id;

  if t.one_visit_per_day and c.last_visit_at is not null
     and (c.last_visit_at at time zone t.timezone)::date = (now() at time zone t.timezone)::date then
    raise exception 'ALREADY_TODAY';
  end if;

  update customers
     set visit_count = visit_count + 1,
         total_visits = total_visits + 1,
         last_visit_at = now()
   where id = p_customer
  returning * into c;

  insert into visits (tenant_id, customer_id, kind, created_by)
  values (c.tenant_id, c.id, 'visit', auth.uid());

  perform _notify_card(c.card_token, c.visit_count);
  return c;
end;
$$;

create or replace function public.redeem_reward(p_customer uuid)
returns public.customers language plpgsql security definer set search_path = public as $$
declare c customers; t tenants;
begin
  select * into c from customers where id = p_customer for update;
  if c.id is null or tenant_role(c.tenant_id) is null then raise exception 'FORBIDDEN'; end if;
  select * into t from tenants where id = c.tenant_id;

  if c.visit_count < t.visits_required then raise exception 'NOT_ENOUGH'; end if;

  update customers
     set visit_count = visit_count - t.visits_required,
         redemptions = redemptions + 1
   where id = p_customer
  returning * into c;

  insert into visits (tenant_id, customer_id, kind, note, created_by)
  values (c.tenant_id, c.id, 'redeem', t.reward_title, auth.uid());

  perform _notify_card(c.card_token, c.visit_count);
  return c;
end;
$$;

-- Solo admin: deshace la última visita (si el último movimiento fue una visita)
create or replace function public.undo_last_visit(p_customer uuid)
returns public.customers language plpgsql security definer set search_path = public as $$
declare c customers; v visits;
begin
  select * into c from customers where id = p_customer for update;
  if c.id is null or tenant_role(c.tenant_id) is distinct from 'admin' then raise exception 'FORBIDDEN'; end if;

  select * into v from visits where customer_id = p_customer order by created_at desc, id desc limit 1;
  if v.id is null or v.kind <> 'visit' or c.visit_count < 1 then raise exception 'NOTHING_TO_UNDO'; end if;

  delete from visits where id = v.id;

  update customers
     set visit_count = visit_count - 1,
         total_visits = greatest(total_visits - 1, 0),
         last_visit_at = (select max(created_at) from visits where customer_id = p_customer and kind = 'visit')
   where id = p_customer
  returning * into c;

  perform _notify_card(c.card_token, c.visit_count);
  return c;
end;
$$;

create or replace function public.regenerate_pin(p_customer uuid)
returns public.customers language plpgsql security definer set search_path = public as $$
declare c customers;
begin
  select * into c from customers where id = p_customer;
  if c.id is null or tenant_role(c.tenant_id) is null then raise exception 'FORBIDDEN'; end if;
  update customers
     set pin = lpad((floor(random() * 10000))::int::text, 4, '0'),
         failed_attempts = 0, locked_until = null
   where id = p_customer
  returning * into c;
  return c;
end;
$$;

create or replace function public.delete_customer(p_customer uuid)
returns void language plpgsql security definer set search_path = public as $$
declare c customers;
begin
  select * into c from customers where id = p_customer;
  if c.id is null or tenant_role(c.tenant_id) is distinct from 'admin' then raise exception 'FORBIDDEN'; end if;
  delete from customers where id = p_customer;
end;
$$;

create or replace function public.update_reward_settings(
  p_tenant uuid, p_title text, p_description text, p_visits int, p_one_per_day boolean
) returns public.tenants language plpgsql security definer set search_path = public as $$
declare t tenants;
begin
  if tenant_role(p_tenant) is distinct from 'admin' then raise exception 'FORBIDDEN'; end if;
  update tenants
     set reward_title = btrim(p_title),
         reward_description = nullif(btrim(coalesce(p_description, '')), ''),
         visits_required = p_visits,
         one_visit_per_day = p_one_per_day
   where id = p_tenant
  returning * into t;
  return t;
end;
$$;

-- ---------------------------------------------------------------------
-- Funciones públicas (portal del cliente, sin sesión)
-- ---------------------------------------------------------------------

create or replace function public.get_tenant_public(p_slug text)
returns json language sql stable security definer set search_path = public as $$
  select json_build_object(
    'id', id, 'slug', slug, 'name', name, 'logo_url', logo_url,
    'primary_color', primary_color, 'reward_title', reward_title,
    'reward_description', reward_description, 'visits_required', visits_required,
    'default_country', default_country
  )
  from tenants where slug = lower(p_slug) and active;
$$;

-- Devuelve {ok:true, token} o {ok:false, error:'INVALID'|'LOCKED', retry_at}
create or replace function public.customer_login(p_slug text, p_phone text, p_pin text)
returns json language plpgsql security definer set search_path = public as $$
declare c customers;
begin
  select cu.* into c
    from customers cu join tenants t on t.id = cu.tenant_id
   where t.slug = lower(p_slug) and t.active and cu.phone = p_phone
   for update of cu;

  if c.id is null then
    perform pg_sleep(0.4);
    return json_build_object('ok', false, 'error', 'INVALID');
  end if;

  if c.locked_until is not null and c.locked_until > now() then
    return json_build_object('ok', false, 'error', 'LOCKED', 'retry_at', c.locked_until);
  end if;

  if c.pin <> p_pin then
    update customers
       set failed_attempts = case when failed_attempts + 1 >= 5 then 0 else failed_attempts + 1 end,
           locked_until    = case when failed_attempts + 1 >= 5 then now() + interval '15 minutes' else null end
     where id = c.id;
    return json_build_object('ok', false, 'error', 'INVALID');
  end if;

  update customers set failed_attempts = 0, locked_until = null where id = c.id;
  return json_build_object('ok', true, 'token', c.card_token);
end;
$$;

create or replace function public.get_card(p_token uuid)
returns json language sql stable security definer set search_path = public as $$
  select json_build_object(
    'name', c.name,
    'visit_count', c.visit_count,
    'total_visits', c.total_visits,
    'redemptions', c.redemptions,
    'last_visit_at', c.last_visit_at,
    'visits_required', t.visits_required,
    'reward_title', t.reward_title,
    'reward_description', t.reward_description,
    'history', coalesce((
      select json_agg(json_build_object('kind', v.kind, 'note', v.note, 'created_at', v.created_at)
                      order by v.created_at desc)
        from (select * from visits where customer_id = c.id order by created_at desc limit 15) v
    ), '[]'::json)
  )
  from customers c join tenants t on t.id = c.tenant_id
  where c.card_token = p_token and t.active;
$$;

-- ---------------------------------------------------------------------
-- Permisos de ejecución
-- ---------------------------------------------------------------------

revoke execute on all functions in schema public from public, anon;
revoke execute on function public._notify_card(uuid, int) from authenticated;

grant execute on function public.get_tenant_public(text)             to anon, authenticated;
grant execute on function public.customer_login(text, text, text)    to anon, authenticated;
grant execute on function public.get_card(uuid)                      to anon, authenticated;

grant execute on function public.is_superadmin()                     to authenticated;
grant execute on function public.tenant_role(uuid)                   to authenticated;
grant execute on function public.create_customer(uuid, text, text)   to authenticated;
grant execute on function public.update_customer(uuid, text, text)   to authenticated;
grant execute on function public.add_visit(uuid)                     to authenticated;
grant execute on function public.redeem_reward(uuid)                 to authenticated;
grant execute on function public.undo_last_visit(uuid)               to authenticated;
grant execute on function public.regenerate_pin(uuid)                to authenticated;
grant execute on function public.delete_customer(uuid)               to authenticated;
grant execute on function public.update_reward_settings(uuid, text, text, int, boolean) to authenticated;

-- ---------------------------------------------------------------------
-- Storage: bucket público para logotipos (lo escribe el panel de agencia)
-- ---------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;
