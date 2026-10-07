// Formatos de presentación (es-AR). Las fechas llegan como 'YYYY-MM-DD':
// se les agrega el mediodía para que el huso horario del navegador no las
// corra un día.

export function initials(name) {
  return String(name || '').split(' ').filter(Boolean).map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

export function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
}

// iso: 'YYYY-MM-01' (o cualquier día del mes en cuestión)
export function fmtMonth(iso) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
}

export function shiftMonth(monthStr, delta) {
  const [y, m] = monthStr.split('-').map(Number);
  const dt = new Date(y, m - 1 + delta, 1);
  return dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0');
}

export function money(n) {
  return '$' + (n || 0).toLocaleString('es-AR');
}
