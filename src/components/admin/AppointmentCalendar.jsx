import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { formatAppointmentDate } from '../../utils/formatters';
import Alert from '../common/Alert';
import SectionHeader from '../common/SectionHeader';

const WEEK_DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function toDateKey(value) {
  if (!value) return '';
  const normalized = String(value).slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return normalized;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function makeDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getCalendarDays(activeDate) {
  const year = activeDate.getFullYear();
  const month = activeDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const totalCells = Math.ceil((mondayOffset + lastDay.getDate()) / 7) * 7;

  return Array.from({ length: totalCells }, (_, index) => {
    const date = new Date(year, month, index - mondayOffset + 1);
    return {
      date,
      key: makeDateKey(date),
      isCurrentMonth: date.getMonth() === month,
      isToday: makeDateKey(date) === makeDateKey(new Date()),
    };
  });
}

export default function AppointmentCalendar() {
  const [appointments, setAppointments] = useState([]);
  const [activeDate, setActiveDate] = useState(() => new Date());
  const [selectedDateKey, setSelectedDateKey] = useState(() => makeDateKey(new Date()));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAppointments = async () => {
    const { data, error: loadError } = await supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: true });

    if (loadError) {
      setError(loadError.message);
    } else {
      setAppointments(data || []);
      setError(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAppointments();

    const channel = supabase
      .channel('appointments-calendar-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, loadAppointments)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const appointmentsByDay = useMemo(() => {
    return appointments.reduce((acc, appointment) => {
      const key = toDateKey(appointment.date);
      if (!key) return acc;
      acc[key] = [...(acc[key] || []), appointment];
      return acc;
    }, {});
  }, [appointments]);

  const calendarDays = useMemo(() => getCalendarDays(activeDate), [activeDate]);
  const selectedAppointments = appointmentsByDay[selectedDateKey] || [];
  const monthLabel = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(activeDate);

  const moveMonth = (offset) => {
    setActiveDate((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  };

  return (
    <section className="card p-6 sm:p-8 xl:col-span-2">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <SectionHeader
          eyebrow="Agenda visual"
          title="Calendario de citas"
          description="Las reservas de pacientes se apuntan automáticamente por día y se actualizan en tiempo real."
        />
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => moveMonth(-1)} className="rounded-xl bg-slate-100 px-4 py-2 font-bold text-slate-700 hover:bg-slate-200">
            ←
          </button>
          <p className="min-w-48 text-center text-sm font-black uppercase tracking-[0.18em] text-slate-700">{monthLabel}</p>
          <button type="button" onClick={() => moveMonth(1)} className="rounded-xl bg-slate-100 px-4 py-2 font-bold text-slate-700 hover:bg-slate-200">
            →
          </button>
        </div>
      </div>

      {error && <Alert type="error">No se pudo cargar el calendario: {error}</Alert>}

      <div className="mt-4 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
          <div className="grid grid-cols-7 border-b border-slate-200 bg-white">
            {WEEK_DAYS.map((day) => (
              <div key={day} className="px-2 py-3 text-center text-xs font-black uppercase tracking-wider text-slate-500">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {calendarDays.map((day) => {
              const dayAppointments = appointmentsByDay[day.key] || [];
              const isSelected = selectedDateKey === day.key;

              return (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => setSelectedDateKey(day.key)}
                  className={`min-h-24 border-b border-r border-slate-200 p-2 text-left transition hover:bg-sky-50 ${
                    day.isCurrentMonth ? 'bg-white' : 'bg-slate-100 text-slate-400'
                  } ${isSelected ? 'ring-2 ring-inset ring-sky-500' : ''}`}
                >
                  <span
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-black ${
                      day.isToday ? 'bg-sky-600 text-white' : 'text-slate-700'
                    }`}
                  >
                    {day.date.getDate()}
                  </span>
                  <div className="mt-2 space-y-1">
                    {dayAppointments.slice(0, 3).map((appointment) => (
                      <div key={appointment.id || `${appointment.name}-${appointment.date}`} className="truncate rounded-lg bg-sky-100 px-2 py-1 text-[11px] font-bold text-sky-800">
                        {appointment.name}
                      </div>
                    ))}
                    {dayAppointments.length > 3 && <p className="text-[11px] font-bold text-slate-500">+{dayAppointments.length - 3} más</p>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <aside className="rounded-3xl border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-black text-slate-950">
            {new Intl.DateTimeFormat('es-ES', { dateStyle: 'full' }).format(new Date(`${selectedDateKey}T00:00:00`))}
          </h3>
          <div className="mt-4 space-y-3">
            {loading ? (
              <p className="text-sm text-slate-400">Cargando agenda...</p>
            ) : selectedAppointments.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-400">No hay citas para este día.</p>
            ) : (
              selectedAppointments.map((appointment) => (
                <article key={appointment.id || `${appointment.name}-${appointment.date}`} className="rounded-2xl bg-slate-50 p-4 text-sm">
                  <p className="font-black text-slate-950">{appointment.name}</p>
                  <p className="mt-1 font-semibold text-sky-700">{appointment.treatment}</p>
                  <p className="mt-2 text-slate-500">🕒 {formatAppointmentDate(appointment.date)}</p>
                  <p className="text-slate-500">📞 {appointment.phone}</p>
                </article>
              ))
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
