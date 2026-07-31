import { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { ADMIN_EMAIL } from '../../config/constants';
import Alert from '../common/Alert';

const initialForm = {
  email: '',
  password: '',
};

export default function AuthScreen() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const isLogin = mode === 'login';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const credentials = {
      email: form.email.trim().toLowerCase(),
      password: form.password,
    };

    const { error } = isLogin
      ? await supabase.auth.signInWithPassword(credentials)
      : await supabase.auth.signUp(credentials);

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else if (isLogin) {
      setMessage({ type: 'success', text: 'Sesión iniciada correctamente.' });
    } else {
      setMessage({
        type: 'success',
        text: 'Cuenta creada. Si Supabase requiere confirmación, revisa tu correo antes de iniciar sesión.',
      });
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 opacity-40 [background:radial-gradient(circle_at_top_left,#0ea5e9,transparent_35%),radial-gradient(circle_at_bottom_right,#14b8a6,transparent_30%)]" />
      <div className="relative mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-4 py-10 lg:grid-cols-[1.1fr_0.9fr]">
        <section>
          <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-sky-100 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Plataforma clínica conectada a Supabase
          </div>
          <h1 className="max-w-3xl text-5xl font-black tracking-tight sm:text-6xl">
            FisioPro para pacientes y fisioterapeutas.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Reserva citas online, chatea en tiempo real y consulta ejercicios terapéuticos desde un portal moderno y seguro.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {['Supabase Auth', 'Realtime', 'Roles por email'].map((item) => (
              <div key={item} className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="text-sm font-bold text-white">{item}</p>
                <p className="mt-2 text-xs leading-5 text-slate-300">Integrado en componentes React modulares.</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white p-6 text-slate-950 shadow-2xl sm:p-8">
          <div className="mb-6 flex rounded-2xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold transition ${
                isLogin ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold transition ${
                !isLogin ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Registrarse
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-3xl font-black tracking-tight">{isLogin ? 'Bienvenido/a' : 'Crear cuenta'}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              El rol se decide estrictamente por el correo autenticado. El administrador configurado es{' '}
              <span className="font-bold text-slate-700">{ADMIN_EMAIL}</span>.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Correo electrónico</label>
              <input
                className="input"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="paciente@email.com"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Contraseña</label>
              <input
                className="input"
                type="password"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                minLength={6}
                required
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            {message && <Alert type={message.type}>{message.text}</Alert>}

            <button className="btn-primary w-full" type="submit" disabled={loading}>
              {loading ? 'Procesando...' : isLogin ? 'Entrar a FisioPro' : 'Crear cuenta segura'}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
