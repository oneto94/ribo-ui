import { html, render } from 'lit-html';
import { icono } from './icono.js';

// El modal genérico de la casa. `modalMarkup()` es el HTML que va una sola vez
// en el shell de la app; openModal() lo llena y lo muestra.
export function modalMarkup() {
  return html`
    <div class="overlay" id="modalOverlay" @mousedown=${(e) => { if (e.target.id === 'modalOverlay') closeModal(); }}>
      <div class="modal" id="modalBox" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
        <div class="modal-head">
          <div><p class="eyebrow" id="modalEyebrow">DETALLE</p><h2 id="modalTitle">Detalle</h2></div>
          <button class="close" id="modalClose" type="button" aria-label="Cerrar" @click=${closeModal}>${icono('x', { tam: 20 })}</button>
        </div>
        <div id="modalBody"></div>
      </div>
    </div>`;
}

// Quién tenía el foco antes de abrir: al cerrar se lo devolvemos (el
// teclado no tiene que "perderse" al principio de la página).
let focoPrevio = null;

// `cuerpo`: template de lit (`html`...``) o, mientras dure la migración,
// un string de HTML ya escapado. `large` agranda el recuadro (fichas con
// pestañas o tablas). El título y el eyebrow van a textContent: no se
// escapan. Devuelve el nodo donde se dibujó el cuerpo, por si hay que
// actualizarlo en el lugar con render().
export function openModal(eyebrow, title, cuerpo, large = false) {
  const overlay = document.getElementById('modalOverlay');
  if (!overlay.classList.contains('show')) focoPrevio = document.activeElement;
  document.getElementById('modalEyebrow').textContent = eyebrow;
  document.getElementById('modalTitle').textContent = title;
  // Host nuevo en cada apertura: el contenido anterior (lit o string) no
  // deja estado colgado que pise al nuevo.
  const host = document.createElement('div');
  document.getElementById('modalBody').replaceChildren(host);
  if (typeof cuerpo === 'string') host.innerHTML = cuerpo;
  else render(cuerpo, host);
  const box = document.getElementById('modalBox');
  box.classList.toggle('modal-lg', !!large);
  box.scrollTop = 0;
  overlay.classList.add('show');
  // Foco al primer campo del formulario; si no hay, a la caja (para que
  // Tab arranque adentro del modal y no detrás).
  const campo = host.querySelector('input:not([type=hidden]):not([readonly]):not(.visually-hidden), select, textarea:not([readonly])');
  if (campo && window.matchMedia('(min-width: 961px)').matches) campo.focus();
  else { box.setAttribute('tabindex', '-1'); box.focus({ preventScroll: true }); }
  return host;
}

export function closeModal() {
  const overlay = document.getElementById('modalOverlay');
  if (!overlay?.classList.contains('show')) return;
  overlay.classList.remove('show');
  if (focoPrevio && focoPrevio.isConnected && typeof focoPrevio.focus === 'function') focoPrevio.focus({ preventScroll: true });
  focoPrevio = null;
}

// Cierra con Escape (accesibilidad básica: el teclado tiene que poder
// salir de un modal sin buscar la ×).
if (typeof document !== 'undefined') {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.getElementById('modalOverlay')?.classList.contains('show')) closeModal();
  });
}
