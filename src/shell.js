import { html, nothing } from 'lit-html';
import { icono } from './icono.js';
import { menu } from './componentes.js';
import { modalMarkup } from './modal.js';
import { getTheme, toggleTheme } from './theme.js';
import { initials } from './format.js';
import { LOGO_RIBO } from './logo.js';

// El armazón de la app, igual en todos los rubros: menú lateral (con
// íconos y contadores), menú de usuario (modo claro/oscuro y cerrar
// sesión), header con UNA acción principal y el resto en "Más…", el
// contenedor #content donde dibuja cada vista y el modal genérico.
//
//   pintar(root, shell({
//     organizacion: 'Estudio Pérez',            // el tenant: va arriba del menú
//     producto: 'RIBO Estudios',                // la marca: va al pie, con el logo
//     usuario: { nombre: 'Ana Pérez', rol: 'CONTADORA · ADMIN' },
//     sync: 'Sync con Firestore en vivo',
//     nav: [{ seccion: null, items: [{ key: 'inicio', label: 'Inicio', icono: 'house', contador: 0 }] }],
//     vista: 'inicio', onIr: (key) => …,
//     kicker: 'ESTUDIO PÉREZ', titulo: 'Inicio',
//     accion: { label: 'Nuevo cliente', icono: 'plus', onClick: … } | null,
//     mas: [{ label: 'Importar Excel', icono: 'file-spreadsheet', onClick: …, oculto: false }],
//     extras: html`…`,                          // antes de las acciones (ej. campanita)
//     pie: html`…`,                             // arriba del menú de usuario (ej. "Invitar")
//     menuUsuario: [{ label: 'Mi cuenta', icono: 'user', onClick: … }],
//     menuAbierto: false, onMenu: (abierto) => …,
//     onCerrarSesion: …, onTema: () => …,       // onTema: redibujar después de cambiar el tema
//     marcaLogo: false,                         // true: el isotipo de RIBO en vez de la inicial (apps internas)
//   Sin onCerrarSesion (app sin login), el menú de usuario no muestra "Cerrar sesión".
//   }))
export function shell(c) {
  const oscuro = getTheme() === 'dark';
  const org = c.organizacion || '';
  const mas = (c.mas || []).filter((m) => m && !m.oculto);
  return html`
    <div class="shell">
      <div class="sidebar-backdrop ${c.menuAbierto ? 'show' : ''}" id="sidebarBackdrop" @click=${() => c.onMenu?.(false)}></div>
      <aside class="sidebar ${c.menuAbierto ? 'open' : ''}" id="sidebar" aria-label="Menú principal">
        <a class="brand" href="#" @click=${(e) => {
          e.preventDefault();
          c.onIr?.(c.inicio || 'inicio');
        }}>${c.marcaLogo ? html`<img class="brand-logo" src=${LOGO_RIBO} alt="" />` : html`<span class="brand-mark">${(org[0] || 'R').toUpperCase()}</span>`}<span class="brand-nombre">${org.toUpperCase()}</span></a>
        <nav id="navLinks">${(c.nav || []).map(
          (g) => html`
          ${g.seccion ? html`<div class="nav-section">${g.seccion}</div>` : nothing}
          ${g.items.map(
            (it) => html`
            <button class="nav-link ${c.vista === it.key ? 'active' : ''}" data-view=${it.key} aria-current=${c.vista === it.key ? 'page' : nothing} @click=${() => c.onIr(it.key)}>
              ${it.icono ? icono(it.icono, { tam: 18 }) : nothing}<span>${it.label}</span> ${it.contador > 0 ? html`<b>${it.contador}</b>` : nothing}
            </button>`,
          )}
        `,
        )}</nav>
        <div class="sidebar-pie">
          ${c.pie || nothing}
          <details class="menu arriba">
            <summary class="identity" aria-label="Menú de usuario">
              <div class="avatar">${initials(c.usuario?.nombre)}</div>
              <div><small>${c.usuario?.rol || ''}</small><strong>${c.usuario?.nombre || ''}</strong></div>
              ${icono('chevron-up', { tam: 16 })}
            </summary>
            <div class="menu-panel" role="menu">
              ${(c.menuUsuario || []).map(
                (it) =>
                  html`<button class="menu-item" type="button" role="menuitem" @click=${(e) => {
                    e.currentTarget.closest('details').open = false;
                    it.onClick();
                  }}>${icono(it.icono || 'user')}${it.label}</button>`,
              )}
              <button class="menu-item" type="button" role="menuitem" id="btnThemeToggle" @click=${(e) => {
                e.currentTarget.closest('details').open = false;
                toggleTheme();
                c.onTema?.();
              }}>${icono(oscuro ? 'sun' : 'moon')}${oscuro ? 'Modo claro' : 'Modo oscuro'}</button>
              ${
                c.onCerrarSesion
                  ? html`<div class="menu-sep" role="separator"></div>
              <button class="menu-item danger" type="button" role="menuitem" id="btnSignOut" @click=${() => c.onCerrarSesion()}>${icono('log-out')}Cerrar sesión</button>`
                  : nothing
              }
            </div>
          </details>
          ${c.sync ? html`<span class="sync-pill"><span class="dot"></span>${c.sync}</span>` : nothing}
          <div class="marca-producto"><img src=${LOGO_RIBO} alt="" />${c.producto || 'RIBO'}</div>
        </div>
      </aside>
      <main>
        <header class="pagehead">
          <div class="pagehead-titulo">
            <button class="mobile-menu-btn" type="button" id="btnMenuToggle" aria-label="Abrir menú" @click=${() => c.onMenu?.(true)}>${icono('menu', { tam: 20 })}</button>
            <div style="min-width:0"><p class="eyebrow" id="viewKicker">${c.kicker || ''}</p><h1 id="viewTitle">${c.titulo || ''}</h1></div>
          </div>
          <div class="header-actions">
            ${c.extras || nothing}
            ${
              mas.length === 1
                ? html`<button class="ghost" type="button" @click=${mas[0].onClick}>${mas[0].icono ? icono(mas[0].icono) : nothing}${mas[0].label}</button>`
                : menu({ boton: icono('ellipsis', { tam: 18 }), etiqueta: 'Más acciones', items: mas })
            }
            ${c.accion ? html`<button class="primary" id="primaryActionBtn" type="button" aria-label=${c.accion.label} @click=${c.accion.onClick}>${icono(c.accion.icono || 'plus', { tam: 18 })}<span class="accion-label">${c.accion.label}</span></button>` : nothing}
          </div>
        </header>
        <div id="content"></div>
      </main>
    </div>
    ${modalMarkup()}`;
}

// Login: el isotipo de RIBO arriba de la caja (para las pantallas que
// todavía arman el login como string).
export function logoLoginHtml() {
  return `<img class="login-logo" src="${LOGO_RIBO}" alt="RIBO" />`;
}
