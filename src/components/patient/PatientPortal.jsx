import AppointmentForm from './AppointmentForm';
import ChatModule from './ChatModule';
import ExerciseList from './ExerciseList';

export default function PatientPortal({ user, branding }) {
  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-sky-600 via-cyan-600 to-teal-500 p-8 text-white shadow-soft">
        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-sky-100">Portal del paciente</p>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">{branding?.clinicName || 'FisioPro'}: tu recuperación, siempre conectada.</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-sky-50">
            Agenda una cita, resuelve dudas con el equipo de fisioterapia y consulta ejercicios publicados en tiempo real.
          </p>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-8">
          <AppointmentForm user={user} />
          <ChatModule user={user} senderLabel="Paciente" />
        </div>
        <ExerciseList />
      </div>
    </div>
  );
}
