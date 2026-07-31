# Supabase para FisioPro

La app espera estas tablas. Las citas ahora las crea solo el fisioterapeuta y cada paciente solo ve las citas asignadas a su email (`patient_email`).

## Tablas principales

```sql
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_email text not null,
  name text not null,
  phone text not null,
  treatment text not null,
  date timestamp not null,
  created_at timestamptz not null default now()
);

-- Si ya tenías creada appointments antes, ejecuta también:
alter table public.appointments
add column if not exists patient_email text;

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

## Personalización de logo

La app ya no necesita un bucket de Storage para el logo. El fisio puede:

- subir una imagen pequeña desde el ordenador, que se guardará como `data:` URL en `clinic_settings.logo_url`, o
- pegar una URL pública de imagen.

Recomendado: logo PNG/WebP cuadrado, menor de 750 KB.

## Realtime

Activa Realtime para estas tablas:

```txt
appointments
messages
exercises
clinic_settings
```

## Políticas RLS recomendadas para citas

Cambia `admin@fisiopro.com` por tu correo real de administrador si lo modificas en `VITE_ADMIN_EMAIL`.

```sql
alter table public.appointments enable row level security;

create policy "patients can read only their appointments"
on public.appointments
for select
to authenticated
using (
  lower(patient_email) = lower(auth.jwt() ->> 'email')
  or lower(auth.jwt() ->> 'email') = 'admin@fisiopro.com'
);

create policy "admin can create appointments"
on public.appointments
for insert
to authenticated
with check (lower(auth.jwt() ->> 'email') = 'admin@fisiopro.com');

create policy "admin can update appointments"
on public.appointments
for update
to authenticated
using (lower(auth.jwt() ->> 'email') = 'admin@fisiopro.com')
with check (lower(auth.jwt() ->> 'email') = 'admin@fisiopro.com');

create policy "admin can delete appointments"
on public.appointments
for delete
to authenticated
using (lower(auth.jwt() ->> 'email') = 'admin@fisiopro.com');
```

## Seguridad recomendada

El frontend ya oculta el formulario de citas al paciente y filtra por `patient_email`, pero para que sea estricto de verdad debes activar RLS en Supabase con las políticas anteriores.
