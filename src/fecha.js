// "Hoy" y "este mes" siempre en la zona horaria de Buenos Aires, sin
// importar dónde corra el navegador o el servidor: `toISOString()` da la
// fecha en UTC, que después de las 21:00 en Argentina ya es "mañana".
// Funciona igual en el navegador y en Node (los dos traen ICU completo).
const TZ_AR = 'America/Argentina/Buenos_Aires';
const fmtFechaAR = new Intl.DateTimeFormat('en-CA', { timeZone: TZ_AR }); // -> 'YYYY-MM-DD'

export function hoyISO(base = new Date()) {
  return fmtFechaAR.format(base);
}

export function mesActualISO(base = new Date()) {
  return hoyISO(base).slice(0, 7);
}
