# Supabase para FisioPro

La app espera estas tablas y un bucket público para personalización de marca.

## Tablas principales

```sql
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  treatment text not null,
  date timestamp not null,
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender text not null,
  text text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  image text,
  created_at timestamptz not null default now()
);

create table if not exists public.clinic_settings (
  id text primary key default 'main',
  clinic_name text not null default 'FisioPro',
  logo_url text,
  updated_at timestamptz not null default now()
);

insert into public.clinic_settings (id, clinic_name)
values ('main', 'FisioPro')
on conflict (id) do nothing;
```

## Bucket para logos

Crea en Supabase Storage un bucket público llamado:

```txt
branding
```

La app sube los logos a:

```txt
branding/logos/...
```

## Realtime

Activa Realtime para estas tablas:

```txt
appointments
messages
exercises
clinic_settings
```

## Seguridad recomendada

Para producción, activa RLS y crea políticas separando pacientes y administrador. El frontend decide el panel admin por `VITE_ADMIN_EMAIL`, pero las operaciones sensibles deben reforzarse con políticas en Supabase.
