import AppointmentManager from './AppointmentManager';
import ExercisePublisher from './ExercisePublisher';
import ChatModule from '../patient/ChatModule';

export default function AdminDashboard({ user }) {
  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-sky-600">Acceso exclusivo administrador</p>
            <h1 className="text-4xl font-black tracking-tight text-slate-950">Panel de Control del Fisioterapeuta</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              Gestiona solicitudes de cita, publica ejercicios terapéuticos en la nube y responde mensajes sincronizados en tiempo real.
            </p>
          </div>
          <div className="rounded-3xl bg-slate-950 px-5 py-4 text-white">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Administrador</p>
            <p className="mt-1 font-bold">{user.email}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-2">
        <AppointmentManager />
        <ExercisePublisher />
      </div>

      <ChatModule user={user} senderLabel="Fisioterapeuta" />
    </div>
  );
}
