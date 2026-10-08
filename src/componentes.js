import { html, nothing } from 'lit-html';
import { icono } from './icono.js';

// Pantalla vacía: ícono, título, una línea de ayuda y (opcional) la acción
// que la resuelve. Reemplaza al "Todavía no hay…" suelto.
//
//   vacio({ icono: 'users', titulo: 'Todavía no hay clientes', texto: 'Cargá el primero o importá un Excel.', accion: { label: 'Nuevo cliente', onClick: abrirAlta } })
export function vacio({ icono: ic = 'inbox', titulo, texto = '', accion = null } = {}) {
  return html`<div class="vacio">
    <div class="vacio-icono">${icono(ic, { tam: 24 })}</div>
    ${titulo ? html`<h3>${titulo}</h3>` : nothing}
    ${texto ? html`<p>${texto}</p>` : nothing}
    ${accion ? html`<button class="primary vacio-accion" type="button" @click=${accion.onClick}>${icono(accion.icono || 'plus')}${accion.label}</button>` : nothing}
  </div>`;
}

// Mientras llegan los datos: filas grises con la forma de una lista, en vez
// de un "Todavía no cargaste…" que dura un instante y confunde.
export function cargando(filas = 4) {
  return html`<div class="esqueleto" aria-busy="true" aria-label="Cargando">${Array.from({ length: filas }, () => html`<div class="esqueleto-fila"></div>`)}</div>`;
}

// Menú desplegable sobre <details>: abre y cierra solo, funciona con
// teclado, y lit no lo pisa al redibujar (el atributo `open` no está
// enlazado). Un clic afuera, Escape o elegir un ítem lo cierra.
//
//   menu({ boton: html`${icono('ellipsis')}`, etiqueta: 'Más acciones', items: [{ label, icono, onClick, peligro }] })
export function menu({ boton, etiqueta, items, clase = '', claseBoton = 'icon-btn' }) {
  const visibles = items.filter((it) => it && !it.oculto);
  if (!visibles.length) return nothing;
  return html`<details class="menu ${clase}">
    <summary class=${claseBoton} aria-label=${etiqueta || nothing} title=${etiqueta || nothing}>${boton}</summary>
    <div class="menu-panel" role="menu">
      ${visibles.map((it) =>
        it.separador
          ? html`<div class="menu-sep" role="separator"></div>`
          : html`<button class="menu-item ${it.peligro ? 'danger' : ''}" type="button" role="menuitem" @click=${(e) => {
              e.currentTarget.closest('details').open = false;
              it.onClick();
            }}>${it.icono ? icono(it.icono) : nothing}${it.label}</button>`,
      )}
    </div>
  </details>`;
}

if (typeof document !== 'undefined') {
  const cerrarMenus = (salvo) =>
    document.querySelectorAll('details.menu[open]').forEach((d) => {
      if (d !== salvo) d.open = false;
    });
  document.addEventListener('click', (e) => cerrarMenus(e.target.closest?.('details.menu')));
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const abierto = document.querySelector('details.menu[open]');
    if (!abierto) return;
    abierto.open = false;
    abierto.querySelector('summary')?.focus();
  });
}
