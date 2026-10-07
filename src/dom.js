import { html, render } from 'lit-html';
import { icono } from './icono.js';

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

// Aviso breve abajo a la derecha, con ícono según el tipo y botón para
// cerrarlo. `tipo`: 'info' | 'exito' | 'error' | 'aviso'. Sin tipo, un
// mensaje que empieza con "No se pudo" o "Error" se muestra como error
// (así las llamadas de antes de v2 ya salen bien). Los errores duran más:
// hay que poder leerlos. El texto va con lit, nunca como HTML.
const ICONO_TOAST = { info: 'info', exito: 'circle-check', error: 'circle-alert', aviso: 'triangle-alert' };
const MAX_TOASTS = 3;

function contenedorToasts() {
  let c = document.querySelector('.toasts');
  if (!c) {
    c = document.createElement('div');
    c.className = 'toasts';
    c.setAttribute('role', 'status');
    c.setAttribute('aria-live', 'polite');
    document.body.appendChild(c);
  }
  return c;
}

export function toast(msg, { tipo, duracion } = {}) {
  if (typeof document === 'undefined') return;
  const t = tipo || (/^\s*(no se pudo|error)/i.test(String(msg)) ? 'error' : 'info');
  const c = contenedorToasts();
  const item = document.createElement('div');
  item.className = `toast-item ${t}`;
  const cerrar = () => { clearTimeout(item._t); item.remove(); };
  render(html`${icono(ICONO_TOAST[t] || 'info', { tam: 18 })}<div class="toast-texto">${String(msg)}</div><button class="toast-cerrar" type="button" aria-label="Cerrar aviso" @click=${cerrar}>${icono('x', { tam: 16 })}</button>`, item);
  c.appendChild(item);
  while (c.children.length > MAX_TOASTS) c.firstElementChild.remove();
  item._t = setTimeout(cerrar, duracion || (t === 'error' ? 7000 : 3500));
}
