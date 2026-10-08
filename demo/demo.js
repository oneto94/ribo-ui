// Página de muestra de ribo-ui: todos los componentes con datos inventados.
// `npm run demo` y abrir http://localhost:5174.
import '../src/ribo.css';
import {
  html,
  pintar,
  shell,
  icono,
  vacio,
  cargando,
  menu,
  confirmar,
  toast,
  openModal,
  closeModal,
  money,
  fmt,
  logoLoginHtml,
} from '../src/index.js';

const estado = { vista: 'inicio', menuAbierto: false, tab: 'lista' };

const NAV = [
  {
    seccion: null,
    items: [
      { key: 'inicio', label: 'Inicio', icono: 'house' },
      { key: 'calendario', label: 'Calendario', icono: 'calendar-days' },
    ],
  },
  {
    seccion: 'Cartera',
    items: [
      { key: 'clientes', label: 'Clientes', icono: 'users', contador: 128 },
      { key: 'tareas', label: 'Tareas y vencimientos', icono: 'list-todo', contador: 3 },
      { key: 'facturacion', label: 'Facturación', icono: 'receipt-text' },
      { key: 'documentacion', label: 'Documentación', icono: 'folder-open' },
    ],
  },
  {
    seccion: null,
    items: [
      { key: 'login', label: 'Pantalla de login', icono: 'lock' },
      { key: 'soporte', label: 'Soporte', icono: 'life-buoy' },
    ],
  },
];
const TITULOS = {
  inicio: 'Inicio',
  calendario: 'Calendario',
  clientes: 'Clientes',
  tareas: 'Tareas y vencimientos',
  facturacion: 'Facturación',
  documentacion: 'Documentación',
  soporte: 'Soporte',
};

const CLIENTES = [
  {
    nombre: 'Ana Pérez',
    cuit: '27-11111111-1',
    tipo: 'Monotributo',
    estado: ['sev-good', 'Al día'],
    honorario: 45000,
    alta: '2025-03-12',
  },
  {
    nombre: 'Distribuidora El Sauce SRL',
    cuit: '30-22222222-2',
    tipo: 'Responsable inscripto',
    estado: ['sev-warning', 'Pendiente'],
    honorario: 180000,
    alta: '2024-11-02',
  },
  {
    nombre: 'Juan Gómez',
    cuit: '20-33333333-3',
    tipo: 'Monotributo',
    estado: ['sev-critical', 'Vencido'],
    honorario: 38000,
    alta: '2026-01-20',
  },
];

function irA(vista) {
  if (vista === 'login') {
    dibujarLogin();
    return;
  }
  estado.vista = vista;
  estado.menuAbierto = false;
  dibujar();
}

function dibujar() {
  const v = estado.vista;
  pintar(
    document.getElementById('app'),
    shell({
      organizacion: 'Estudio Demo',
      producto: 'RIBO Estudios',
      usuario: { nombre: 'Ana Pérez', rol: 'CONTADORA · ADMIN' },
      sync: 'Sync local (muestra)',
      nav: NAV,
      vista: v,
      onIr: irA,
      kicker: 'ESTUDIO DEMO',
      titulo: TITULOS[v],
      accion:
        v === 'clientes'
          ? { label: 'Nuevo cliente', onClick: abrirModal }
          : v === 'tareas'
            ? { label: 'Nueva tarea', onClick: abrirModal }
            : null,
      mas:
        v === 'clientes'
          ? [
              { label: 'Importar Excel', icono: 'file-spreadsheet', onClick: () => toast('Importar Excel (muestra).') },
              {
                label: 'Importar sociedades (JSON)',
                icono: 'file-json',
                onClick: () => toast('Importar JSON (muestra).'),
              },
              { label: 'Exportar', icono: 'download', onClick: () => toast('Exportado.', { tipo: 'exito' }) },
            ]
          : v === 'tareas'
            ? [{ label: 'Exportar', icono: 'download', onClick: () => toast('Exportado.', { tipo: 'exito' }) }]
            : [],
      extras: html`<button class="icon-btn" type="button" aria-label="Notificaciones" @click=${() => toast('Tenés 2 notificaciones nuevas.')}>${icono('bell', { tam: 18 })}<span class="contador">2</span></button>`,
      pie: html`<button class="ghost" type="button" style="width:100%" @click=${abrirModal}>${icono('user-plus')}Invitar contador</button>`,
      menuUsuario: [{ label: 'Mi cuenta', icono: 'user', onClick: () => toast('Mi cuenta (muestra).') }],
      menuAbierto: estado.menuAbierto,
      onMenu: (a) => {
        estado.menuAbierto = a;
        dibujar();
      },
      onCerrarSesion: dibujarLogin,
      onTema: dibujar,
    }),
  );
  pintar(document.getElementById('content'), contenido(v));
}

function contenido(v) {
  if (v === 'calendario') return calendario();
  if (v === 'clientes') return clientes();
  if (v === 'tareas')
    return html`${vacio({ icono: 'list-todo', titulo: 'No hay tareas pendientes', texto: 'Cuando cargues una tarea o venza un impuesto, aparece acá.', accion: { label: 'Nueva tarea', onClick: abrirModal } })}`;
  if (v === 'facturacion')
    return html`<p class="file-hint">Así se ve una lista mientras llegan los datos:</p>${cargando(5)}`;
  if (v === 'documentacion') return componentes();
  if (v === 'soporte') return formulario();
  return inicio();
}

function inicio() {
  return html`
    <div class="banner">${icono('info', { tam: 18 })}<div>Hola <strong>Ana</strong> — tenés <strong>3 vencimientos</strong> esta semana.</div></div>
    <div class="kpi-row">
      <div class="kpi"><div class="label">Clientes activos</div><div class="value">128</div><div class="delta good">${icono('arrow-right', { tam: 14 })} 4 nuevos este mes</div></div>
      <div class="kpi"><div class="label">Tareas vencidas</div><div class="value">3</div><div class="delta critical">requieren atención</div></div>
      <div class="kpi"><div class="label">Honorarios del mes</div><div class="value">${money(1840000)}</div><div class="delta neutral">facturado</div></div>
      <div class="kpi"><div class="label">Documentación</div><div class="value">92%</div><div class="delta neutral">al día</div></div>
    </div>
    <div class="two-col">
      <div class="panel"><h3>Próximos vencimientos</h3>
        ${CLIENTES.map((c) => html`<div class="mini-row"><div><div class="t">${c.nombre}</div><div class="s">${'IVA — vence ' + fmt('2026-10-18')}</div></div><span class="badge ${c.estado[0]}">${c.estado[1]}</span></div>`)}
      </div>
      <div class="panel"><h3>Últimos movimientos</h3>${vacio({ icono: 'history', titulo: 'Sin movimientos', texto: 'Todavía no hubo cambios esta semana.' })}</div>
    </div>`;
}

function clientes() {
  return html`
    <div class="tabs">
      ${[
        ['lista', 'Lista'],
        ['tarjetas', 'Tarjetas'],
      ].map(
        ([k, l]) =>
          html`<button class="tab ${estado.tab === k ? 'active' : ''}" @click=${() => {
            estado.tab = k;
            dibujar();
          }}>${l}</button>`,
      )}
    </div>
    <div class="filters">
      <input placeholder="Buscar por nombre o CUIT…" />
      <select><option>Todos los tipos</option><option>Monotributo</option></select>
    </div>
    ${
      estado.tab === 'lista'
        ? html`
      <p class="file-hint">Tabla con la clase <code>tarjetas</code>: en el celular cada fila pasa a ser una tarjeta.</p>
      <div class="table-scroll"><table class="data-table tarjetas">
        <thead><tr><th>Cliente</th><th>CUIT</th><th>Tipo</th><th>Estado</th><th>Honorario</th><th>Alta</th><th></th></tr></thead>
        <tbody>${CLIENTES.map(
          (c) => html`<tr>
          <td data-label="Cliente">${c.nombre}</td><td data-label="CUIT">${c.cuit}</td><td data-label="Tipo">${c.tipo}</td>
          <td data-label="Estado"><span class="badge ${c.estado[0]}">${c.estado[1]}</span></td>
          <td data-label="Honorario">${money(c.honorario)}</td><td data-label="Alta">${fmt(c.alta)}</td>
          <td data-label="">${menu({
            boton: icono('ellipsis-vertical'),
            etiqueta: 'Acciones',
            claseBoton: 'icon-btn sin-borde',
            items: [
              { label: 'Editar', icono: 'pencil', onClick: abrirModal },
              { label: 'Archivar', icono: 'archive', onClick: () => toast('Cliente archivado.', { tipo: 'exito' }) },
              { separador: true },
              { label: 'Eliminar', icono: 'trash-2', peligro: true, onClick: eliminar },
            ],
          })}</td>
        </tr>`,
        )}</tbody>
      </table></div>`
        : html`
      <div class="card-list">${CLIENTES.map(
        (c) => html`<div class="item-card clickable" @click=${abrirModal}>
        <div class="item-top"><div><div class="item-title">${c.nombre}</div><div class="item-meta"><span>${c.cuit}</span><span>${c.tipo}</span></div></div>
        <div class="item-badges"><span class="badge ${c.estado[0]}">${c.estado[1]}</span></div></div></div>`,
      )}</div>`
    }`;
}

async function eliminar() {
  const ok = await confirmar({
    titulo: '¿Eliminar a Juan Gómez?',
    mensaje: 'Se borran también sus tareas y documentos. No se puede deshacer.',
    boton: 'Eliminar',
    peligro: true,
  });
  toast(ok ? 'Cliente eliminado.' : 'No se eliminó nada.', { tipo: ok ? 'exito' : 'info' });
}

function calendario() {
  const dias = Array.from({ length: 31 }, (_, i) => i + 1);
  const eventos = { 3: ['done'], 9: ['pending', 'late'], 18: ['pending', 'pending', 'done'], 24: ['late'] };
  return html`
    <div class="cal-nav"><button class="icon-btn" aria-label="Mes anterior">${icono('chevron-left')}</button><h3>octubre de 2026</h3><button class="icon-btn" aria-label="Mes siguiente">${icono('chevron-right')}</button></div>
    <div class="cal-grid cal-head">${['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => html`<div class="cal-weekday">${d}</div>`)}</div>
    <div class="cal-grid">
      ${[0, 1, 2].map(() => html`<div class="cal-cell cal-empty"></div>`)}
      ${dias.map(
        (
          d,
        ) => html`<div class="cal-cell cal-clickable ${d === 6 ? 'cal-today' : ''} ${d === 18 ? 'cal-sel' : ''}"><span class="cal-daynum">${d}</span>
        <div class="cal-chips">${(eventos[d] || []).map((e) => html`<button class="cal-chip ${e}">${e === 'late' ? 'IVA vencido' : e === 'done' ? 'Ganancias' : 'Monotributo'}</button>`)}</div></div>`,
      )}
    </div>
    <div class="agenda"><div class="agenda-dia">sábado 18 de octubre</div>
      <div class="card-list">${['Monotributo — Ana Pérez', 'Monotributo — Juan Gómez', 'Ganancias — El Sauce SRL'].map((t, i) => html`<div class="item-card"><div class="item-top"><div class="item-title">${t}</div><span class="badge ${i === 2 ? 'sev-good' : 'st-open'}">${i === 2 ? 'Presentado' : 'Pendiente'}</span></div></div>`)}</div>
    </div>`;
}

function componentes() {
  return html`
    <div class="panel" style="margin-bottom:16px"><h3>Botones</h3>
      <div class="item-actions">
        <button class="primary">${icono('plus', { tam: 18 })}Primario</button>
        <button class="secondary">${icono('save')}Secundario</button>
        <button class="ghost">${icono('pencil')}Fantasma</button>
        <button class="ghost danger">${icono('trash-2')}Peligro</button>
        <button class="icon-btn" aria-label="Buscar">${icono('search', { tam: 18 })}</button>
        <button class="primary" disabled>Deshabilitado</button>
        <button class="linklike">Enlace</button>
      </div>
    </div>
    <div class="panel" style="margin-bottom:16px"><h3>Avisos y confirmación</h3>
      <div class="item-actions">
        <button class="ghost" @click=${() => toast('Cliente guardado.', { tipo: 'exito' })}>${icono('circle-check')}Éxito</button>
        <button class="ghost" @click=${() => toast('No se pudo guardar: sin conexión.')}>${icono('circle-alert')}Error</button>
        <button class="ghost" @click=${() => toast('Faltan 3 días para el vencimiento.', { tipo: 'aviso' })}>${icono('triangle-alert')}Aviso</button>
        <button class="ghost" @click=${() => toast('Sincronizado.')}>${icono('info')}Info</button>
        <button class="ghost" @click=${async () => toast((await confirmar({ titulo: '¿Marcar como presentado?', mensaje: 'Se registra con la fecha de hoy.', boton: 'Marcar' })) ? 'Marcado.' : 'Cancelado.')}>Confirmar</button>
        <button class="ghost danger" @click=${eliminar}>Confirmar peligroso</button>
        <button class="ghost" @click=${abrirModal}>Abrir modal</button>
      </div>
    </div>
    <div class="panel" style="margin-bottom:16px"><h3>Badges y pestañas</h3>
      <div class="item-actions" style="margin-bottom:12px">
        <span class="badge sev-good">Al día</span><span class="badge sev-warning">Pendiente</span><span class="badge sev-critical">Vencido</span>
        <span class="badge st-open">Abierto</span><span class="badge st-progress">En curso</span><span class="badge st-done">Resuelto</span>
      </div>
      <div class="tabs"><button class="tab active">Ficha</button><button class="tab">Socios</button><button class="tab">Impuestos</button></div>
      <div class="checklist-actions"><button class="chip-toggle on">${icono('check', { tam: 14 })}Enero</button><button class="chip-toggle">Febrero</button></div>
    </div>
    <div class="panel"><h3>Íconos</h3><p class="file-hint">Todos los del set (Lucide).</p>
      <div style="display:flex;flex-wrap:wrap;gap:14px;color:var(--text-secondary)">${ICONOS_DEMO.map((n) => html`<span title=${n}>${icono(n, { tam: 20 })}</span>`)}</div>
    </div>`;
}

function formulario() {
  return html`<div class="panel" style="max-width:620px">
    <h3>¿Necesitás ayuda con la app?</h3>
    <div class="form-grid">
      <label><span>Nombre</span><input placeholder="Ana Pérez" /></label>
      <label><span>Email</span><input type="email" placeholder="ana@ejemplo.com" /></label>
    </div>
    <label><span>Tipo de consulta</span><select><option>Error técnico</option><option>Duda de uso</option></select></label>
    <label><span>Contanos qué pasó</span><textarea class="textarea-lg" placeholder="Describí el problema…"></textarea></label>
    <div class="settings-row"><div><div class="settings-label">Avisarme por email</div><div class="settings-desc">Te escribimos cuando haya respuesta.</div></div><label class="switch" style="margin:0"><input type="checkbox" checked /><span class="slider"></span></label></div>
    <div class="modal-actions"><button class="primary" @click=${() => toast('Enviado.', { tipo: 'exito' })}>${icono('send')}Enviar</button></div>
  </div>`;
}

function abrirModal() {
  openModal(
    'CLIENTES',
    'Nuevo cliente',
    html`
    <div class="form-grid">
      <label><span>Nombre o razón social</span><input placeholder="Ej. Ana Pérez" /></label>
      <label><span>CUIT</span><input placeholder="27-11111111-1" /></label>
    </div>
    <label><span>Tipo</span><select><option>Monotributo</option><option>Responsable inscripto</option></select></label>
    <p class="file-hint">Los datos se pueden completar después desde la ficha.</p>
    <div class="modal-actions"><button class="ghost" @click=${closeModal}>Cancelar</button><button class="primary" @click=${() => {
      closeModal();
      toast('Cliente creado.', { tipo: 'exito' });
    }}>Crear cliente</button></div>`,
  );
}

function dibujarLogin() {
  document.getElementById('app').innerHTML = `
    <div class="login-shell"><div class="login-box">
      ${logoLoginHtml()}
      <p class="eyebrow">RIBO ESTUDIOS</p>
      <h1>La gestión de tu estudio, en un solo lugar</h1>
      <p>Entrá con tu cuenta.</p>
      <label><span>Email</span><input type="email" placeholder="ana@ejemplo.com" /></label>
      <label><span>Contraseña</span><input type="password" /></label>
      <button class="primary" id="entrar">Entrar</button>
    </div></div>`;
  document.getElementById('entrar').addEventListener('click', () => {
    estado.vista = 'inicio';
    dibujar();
  });
}

const ICONOS_DEMO = [
  'house',
  'calendar-days',
  'users',
  'list-todo',
  'receipt-text',
  'folder-open',
  'chart-column',
  'building-2',
  'megaphone',
  'wrench',
  'vote',
  'wallet',
  'gavel',
  'mail-open',
  'calendar-check',
  'door-open',
  'tag',
  'truck',
  'book-open',
  'user-cog',
  'briefcase-business',
  'package',
  'boxes',
  'factory',
  'shopping-cart',
  'banknote',
  'scissors',
  'credit-card',
  'gift',
  'percent',
  'calculator',
  'trophy',
  'dumbbell',
  'shield',
  'anchor',
  'concierge-bell',
  'paw-print',
  'id-card',
  'life-buoy',
  'settings',
];

dibujar();
