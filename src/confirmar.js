import { html, render, nothing } from 'lit-html';
import { icono } from './icono.js';

// Reemplazo de confirm(): una ventana propia, con el estilo de la casa,
// que devuelve una promesa con true (confirmó) o false (canceló, Escape o
// clic afuera). Se puede abrir encima de un modal abierto sin cerrarlo.
//
//   if (!(await confirmar({ titulo: '¿Eliminar este cliente?', mensaje: 'No se puede deshacer.', boton: 'Eliminar', peligro: true }))) return;
//
// Con `peligro` el botón es rojo y el foco arranca en "Cancelar", para que
// un Enter apurado no borre nada.
export function confirmar({ titulo, mensaje = '', boton = 'Confirmar', cancelar = 'Cancelar', peligro = false } = {}) {
  return new Promise((resolver) => {
    const previo = document.activeElement;
    const capa = document.createElement('div');
    capa.className = 'confirm-overlay';
    let hecho = false;
    const terminar = (valor) => {
      if (hecho) return;
      hecho = true;
      window.removeEventListener('keydown', alTeclado, true);
      capa.remove();
      if (previo && typeof previo.focus === 'function') previo.focus();
      resolver(valor);
    };
    // En fase de captura y frenando la propagación: Escape cierra esta
    // ventana y no el modal que quedó abajo.
    function alTeclado(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopImmediatePropagation();
        terminar(false);
      }
    }
    capa.addEventListener('mousedown', (e) => {
      if (e.target === capa) terminar(false);
    });
    render(
      html`
      <div class="confirm-box ${peligro ? 'peligro' : ''}" role="alertdialog" aria-modal="true" aria-labelledby="confirmTitulo" aria-describedby="confirmMensaje">
        <h2 id="confirmTitulo">${peligro ? icono('triangle-alert', { tam: 20 }) : nothing}${titulo}</h2>
        ${mensaje ? html`<p id="confirmMensaje">${mensaje}</p>` : nothing}
        <div class="modal-actions">
          <button class="ghost" type="button" data-confirm="no" @click=${() => terminar(false)}>${cancelar}</button>
          <button class=${peligro ? 'primary danger' : 'primary'} type="button" data-confirm="si" @click=${() => terminar(true)}>${boton}</button>
        </div>
      </div>`,
      capa,
    );
    document.body.appendChild(capa);
    window.addEventListener('keydown', alTeclado, true);
    capa.querySelector(`[data-confirm="${peligro ? 'no' : 'si'}"]`).focus();
  });
}
