// ribo-ui — base compartida de la casa RIBO. Importá todo desde acá
// (nunca de 'lit-html' directo): así todos los rubros usan la misma copia
// de lit y las mismas reglas.
//
//   import { html, pintar, money, toast } from 'ribo-ui';
//   import 'ribo-ui/ribo.css';   // o @import 'ribo-ui/ribo.css'; en el CSS del rubro

export { html, svg, render, nothing } from 'lit-html';
export { repeat } from 'lit-html/directives/repeat.js';
export { live } from 'lit-html/directives/live.js';

export { escapeHtml, sanitizeUrl, safeUrl } from './escape.js';
export { initials, fmt, fmtMonth, shiftMonth, money } from './format.js';
export { hoyISO, mesActualISO } from './fecha.js';
export { pintar, conservarFoco, toast } from './dom.js';
export { getTheme, toggleTheme, THEME_BOOT_SCRIPT } from './theme.js';
export { modalMarkup, openModal, closeModal } from './modal.js';
export { icono, iconoHtml, NOMBRES_ICONOS } from './icono.js';
export { vacio, cargando, menu } from './componentes.js';
export { confirmar } from './confirmar.js';
export { shell, logoLoginHtml } from './shell.js';
export { LOGO_RIBO } from './logo.js';
