// Una URL por pantalla, con el hash: `#/clientes`, `#/deportes/futbol`.
// Recargar deja al usuario donde estaba y el botón "atrás" del navegador
// vuelve a la pantalla anterior. Se usa el hash (y no rutas de verdad)
// porque anda igual en Firebase Hosting, en el mock y abriendo el build
// local, sin reglas de reescritura.
//
// Uso en el rubro:
//   irA(vista)        → irARuta(vista)                (deja entrada en el historial)
//   al arrancar       → const { vista } = leerRuta(); si no es válida para el
//                       usuario: reemplazarRuta(porDefecto)
//   atrás / adelante  → const quitar = alCambiarRuta(({ vista, partes }) => …)
//                       (llamar quitar() al cerrar sesión)

function partir(hash) {
  return String(hash || '').replace(/^#\/?/, '').split('/').filter(Boolean).map((p) => {
    try { return decodeURIComponent(p); } catch { return p; }
  });
}

// La pantalla actual según la URL. `vista` es '' si no hay ninguna.
export function leerRuta(hash = typeof location !== 'undefined' ? location.hash : '') {
  const [vista = '', ...partes] = partir(hash);
  return { vista, partes };
}

// El hash de una pantalla: hashRuta('deportes', 'futbol') → '#/deportes/futbol'.
export function hashRuta(vista, ...partes) {
  return '#/' + [vista, ...partes].filter((p) => p != null && p !== '').map((p) => encodeURIComponent(String(p))).join('/');
}

// Navega a una pantalla nueva (queda en el historial). Si ya es la actual
// no hace nada: así un redibujo no llena el historial de entradas iguales.
// Devuelve true si cambió la URL (y por lo tanto va a llegar un aviso a
// alCambiarRuta).
export function irARuta(vista, ...partes) {
  const nuevo = hashRuta(vista, ...partes);
  if (location.hash === nuevo) return false;
  location.hash = nuevo;
  return true;
}

// Cambia la URL sin dejar entrada en el historial y sin avisar a
// alCambiarRuta: para corregir una URL inválida al arrancar (una vista
// que no existe o a la que el usuario no tiene acceso).
export function reemplazarRuta(vista, ...partes) {
  const nuevo = hashRuta(vista, ...partes);
  if (location.hash === nuevo) return;
  history.replaceState(history.state, '', location.pathname + location.search + nuevo);
}

// Avisa cada vez que la URL cambia (atrás, adelante, un link o irARuta).
// Devuelve la función para dejar de escuchar.
export function alCambiarRuta(fn) {
  const oyente = () => fn(leerRuta());
  window.addEventListener('hashchange', oyente);
  return () => window.removeEventListener('hashchange', oyente);
}
