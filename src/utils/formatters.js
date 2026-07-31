export function formatAppointmentDate(value) {
  if (!value) return 'Sin fecha asignada';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).replace('T', ' ');

  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function getInitials(email = '') {
  return email.slice(0, 2).toUpperCase() || 'FP';
}
