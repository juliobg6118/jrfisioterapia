# Supabase para FisioPro

La app espera estas tablas. Las citas ahora las crea solo el fisioterapeuta y cada paciente solo ve las citas asignadas a su email (`patient_email`). Los ejercicios también son personalizados por paciente.

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
  patient_email text,
  created_at timestamptz not null default now()
);

-- Si ya tenías creada exercises antes, ejecuta también:
alter table public.exercises
add column if not exists patient_email text;

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

## Ejercicios personalizados por paciente

La columna `patient_email` en la tabla `exercises` permite:

- **`patient_email = NULL`**: ejercicio general, visible para todos los pacientes.
- **`patient_email = 'paciente@email.com'`**: ejercicio personalizado, solo visible para ese paciente.

El fisioterapeuta puede asignar ejercicios a pacientes específicos desde el panel de administración. Los pacientes solo ven los ejercicios generales y los asignados a su email.

## Autenticación por correo o teléfono

La app soporta dos métodos de inicio de sesión:

1. **Correo electrónico + contraseña**: método clásico de Supabase Auth.
2. **Teléfono móvil + OTP**: el usuario introduce su número de teléfono y recibe un código SMS para verificar su identidad.

Para habilitar el login por teléfono en Supabase:

1. Ve a **Authentication → Providers → Phone** en el panel de Supabase y actívalo.
2. Configura un proveedor de SMS (Twilio, MessageBird, etc.) en **Authentication → Providers → Phone → SMS Provider**.
3. Asegúrate de que el formato de teléfono incluya el código de país (ej. `+34611223344` para España).

> **Nota sobre roles**: el rol de administrador se determina por el correo electrónico. Si un usuario se registra solo con teléfono, será paciente. Para que sea admin, debe tener asociado el correo de administrador.

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

## Políticas RLS recomendadas

### Citas

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

### Ejercicios

```sql
alter table public.exercises enable row level security;

create policy "patients can read their exercises and general exercises"
on public.exercises
for select
to authenticated
using (
  patient_email is null
  or lower(patient_email) = lower(auth.jwt() ->> 'email')
  or lower(auth.jwt() ->> 'email') = 'admin@fisiopro.com'
);

create policy "admin can create exercises"
on public.exercises
for insert
to authenticated
with check (lower(auth.jwt() ->> 'email') = 'admin@fisiopro.com');

create policy "admin can update exercises"
on public.exercises
for update
to authenticated
using (lower(auth.jwt() ->> 'email') = 'admin@fisiopro.com')
with check (lower(auth.jwt() ->> 'email') = 'admin@fisiopro.com');

create policy "admin can delete exercises"
on public.exercises
for delete
to authenticated
using (lower(auth.jwt() ->> 'email') = 'admin@fisiopro.com');
```

## Seguridad recomendada

El frontend ya oculta el formulario de citas y ejercicios al paciente y filtra por `patient_email`, pero para que sea estricto de verdad debes activar RLS en Supabase con las políticas anteriores.
