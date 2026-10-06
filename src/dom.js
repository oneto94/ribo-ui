import { render } from 'lit-html';

// Contenedor intermedio por vista: lit-html guarda su estado en el nodo
// donde renderiza, y un innerHTML posterior lo dejaría apuntando a nodos
// que ya no existen. Con un host propio, una vista puede pasar de string a
// lit (o al revés) sin romper nada — es lo que permite migrar de a una.
const HOST = Symbol('ribo-ui:host');

function hostDe(container, nuevo) {
  let host = container[HOST];
  if (nuevo || !host || host.parentNode !== container) {
    host = document.createElement('div');
    host.style.display = 'contents'; // no agrega una caja: el layout queda igual
    container.replaceChildren(host);
    container[HOST] = host;
  }
  return host;
}

// Dibuja una vista. `contenido` puede ser un template de lit (`html`...``)
// o, mientras dure la migración, un string de HTML ya escapado.
export function pintar(container, contenido) {
  if (typeof contenido === 'string' || contenido == null) {
    conservarFoco(() => { hostDe(container, true).innerHTML = contenido || ''; });
    container[HOST] = null; // un string no se puede actualizar en el lugar
    return;
  }
  render(contenido, hostDe(container, false));
}

// Redibujar con innerHTML destruye el <input> que tenía el foco (un
// buscador que filtra al tipear se cortaba en la primera letra). Guarda el
// campo enfocado y el cursor, redibuja, y los devuelve. Con lit no hace
// falta: lit actualiza el DOM en el lugar y el input no se recrea.
export function conservarFoco(redibujar) {
  const activo = document.activeElement;
  const id = activo && activo.id;
  let ini = null, fin = null;
  try { ini = activo.selectionStart; fin = activo.selectionEnd; } catch { /* date, checkbox: sin selección */ }
  redibujar();
  if (!id) return;
  const nuevo = document.getElementById(id);
  if (!nuevo || nuevo === activo) return;
  nuevo.focus();
  if (ini != null) { try { nuevo.setSelectionRange(ini, fin); } catch { /* idem */ } }
}

// Aviso breve abajo a la derecha. Usa textContent: el mensaje nunca se
// interpreta como HTML, así que no hay que escaparlo.
export function toast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('show'), 2600);
}
