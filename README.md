# FisioPro

Portal de fisioterapia moderno con reservas, chat en tiempo real y ejercicios.

## 🚀 Inicio rápido

### 1. Clonar el repositorio

```bash
git clone https://github.com/juliobg6118/jrfisioterapia.git
cd jrfisioterapia
```

### 2. Instalar dependencias

```bash
npm install --legacy-peer-deps
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y rellena tus credenciales de Supabase:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus datos:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=tu_clave_publica
VITE_ADMIN_EMAIL=admin@tudominio.com
```

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

Abre: **http://localhost:5173/jrfisioterapia/docs/**

### 5. Build para producción

```bash
npm run build
```

Los archivos se generan en la carpeta `docs/`.

---

## 📋 Características

- ✅ Autenticación con email/contraseña y teléfono (OTP)
- ✅ Roles automáticos (admin / paciente) según email
- ✅ Dashboard de administrador
- ✅ Portal del paciente con citas y chat en tiempo real
- ✅ Animación 3D interactiva (Three.js)
- ✅ Personalización de branding (logo y nombre de clínica)
- ✅ Publicación de ejercicios

## 🛠️ Stack

- React 18 + Vite
- Tailwind CSS
- Supabase (Auth + Realtime + Database)
- Three.js + @react-three/fiber

## 🔐 Seguridad

- El archivo `.env` está en `.gitignore`
- Las credenciales de Supabase solo se usan en el cliente (publishable key)
- El rol de administrador se determina por email (configurable)

---

**Desarrollado con ❤️ para clínicas de fisioterapia**