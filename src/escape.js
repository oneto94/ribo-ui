// Escapado para los templates que todavía arman HTML como string y lo
// meten con innerHTML. Con `html`...`` de lit-html no hace falta: lit
// escapa solo todo lo que se interpola.

export function escapeHtml(s) {
  return String(s == null ? '' : s).replace(
    /[&<>"']/g,
    (ch) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[ch],
  );
}

// Escapar no alcanza para una URL que va a un href: un `javascript:...`
// escapado igual se ejecuta al hacer clic. Solo pasan http(s) y los data:
// de imagen/PDF (así guardan comprobantes los modos mock); lo demás → '#'.
export function sanitizeUrl(url) {
  const s = String(url == null ? '' : url).trim();
  const ok = /^https?:\/\//i.test(s) || /^data:(image\/(png|jpe?g|gif|webp)|application\/pdf)[;,]/i.test(s);
  return ok ? s : '#';
}

// Para templates string: valida Y escapa. En un template de lit usá
// sanitizeUrl (lit ya escapa; escapar dos veces rompería los & de la URL).
export function safeUrl(url) {
  return escapeHtml(sanitizeUrl(url));
}
