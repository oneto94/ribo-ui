import { html, render } from 'lit-html';

// El modal genérico de la casa. `modalMarkup()` es el HTML que va una sola vez
// en el shell de la app; openModal() lo llena y lo muestra.
export function modalMarkup() {
  return html`
    <div class="overlay" id="modalOverlay" @click=${(e) => { if (e.target.id === 'modalOverlay') closeModal(); }}>
      <div class="modal" id="modalBox">
        <div class="modal-head">
          <div><p class="eyebrow" id="modalEyebrow">DETALLE</p><h2 id="modalTitle">Detalle</h2></div>
          <button class="close" id="modalClose" aria-label="Cerrar" @click=${closeModal}>×</button>
        </div>
        <div id="modalBody"></div>
      </div>
    </div>`;
}

// `cuerpo`: template de lit (`html`...``) o, mientras dure la migración,
// un string de HTML ya escapado. `large` agranda el recuadro (fichas con
// pestañas o tablas). El título y el eyebrow van a textContent: no se
// escapan.
export function openModal(eyebrow, title, cuerpo, large = false) {
  document.getElementById('modalEyebrow').textContent = eyebrow;
  document.getElementById('modalTitle').textContent = title;
  // Host nuevo en cada apertura: el contenido anterior (lit o string) no
  // deja estado colgado que pise al nuevo.
  const host = document.createElement('div');
  document.getElementById('modalBody').replaceChildren(host);
  if (typeof cuerpo === 'string') host.innerHTML = cuerpo;
  else render(cuerpo, host);
  document.getElementById('modalBox').classList.toggle('modal-lg', !!large);
  document.getElementById('modalOverlay').classList.add('show');
}

export function closeModal() {
  document.getElementById('modalOverlay')?.classList.remove('show');
}

// Cierra con Escape (accesibilidad básica: el teclado tiene que poder
// salir de un modal sin buscar la ×).
if (typeof document !== 'undefined') {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.getElementById('modalOverlay')?.classList.contains('show')) closeModal();
  });
}
