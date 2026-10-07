import { html } from 'lit-html';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg.js';
import { ICONOS } from './iconos.js';

// Un ícono de Lucide por nombre (ver la lista en iconos.js), del tamaño
// del texto que lo rodea salvo que se pida otro. Decorativo por defecto
// (aria-hidden): si el ícono es lo único que tiene un botón, el nombre
// accesible va en el aria-label del botón. El contenido viene de
// iconos.js (generado, nunca dato de usuario): por eso unsafeSVG.
export function icono(nombre, { tam = 16, clase = '' } = {}) {
  const cuerpo = ICONOS[nombre];
  if (!cuerpo) throw new Error(`ribo-ui: no existe el ícono "${nombre}"`);
  return html`<svg class="icono ${clase}" width=${tam} height=${tam} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${unsafeSVG(cuerpo)}</svg>`;
}

// El mismo ícono como string, para las pantallas que todavía arman HTML
// a mano (login, alta de super admin).
export function iconoHtml(nombre, { tam = 16, clase = '' } = {}) {
  const cuerpo = ICONOS[nombre];
  if (!cuerpo) throw new Error(`ribo-ui: no existe el ícono "${nombre}"`);
  return `<svg class="icono ${clase}" width="${tam}" height="${tam}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${cuerpo}</svg>`;
}

export const NOMBRES_ICONOS = Object.keys(ICONOS);
