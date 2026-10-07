# Cambios

## 2.0.0 — 2026-10-06

Rediseño visual (Etapa 3). **Versión mayor:** cambia el aspecto de toda
la app (también en escritorio) y algunas APIs suman comportamiento.

- Tokens nuevos: escala de letra (cuerpo 14px, nada por debajo de 12px),
  espacios, bordes, sombras, capas y alto de controles. `base.css` reescrito
  sobre esos tokens, con las mismas clases que v1.
- Íconos: 124 de Lucide (`icono()`, `iconoHtml()`), generados con
  `npm run iconos`; Lucide es solo dependencia de desarrollo.
- `shell()`: menú lateral con íconos y contadores, menú de usuario (tema,
  cerrar sesión y extras), header con una acción principal y "Más…".
- Componentes: `menu()`, `vacio()`, `cargando()`, `confirmar()`.
- `toast()` con tipos, ícono, botón de cerrar y pila (compatible con v1).
- `openModal()` devuelve el nodo del cuerpo, enfoca el primer campo en
  escritorio y devuelve el foco al cerrar; el clic afuera se mide en
  `mousedown` (arrastrar una selección ya no cierra el modal); la × es un ícono.
- Logo de RIBO: `LOGO_RIBO`, `logoLoginHtml()`.
- Celular: tablas `.tarjetas`; calendario con puntos que no reciben toques
  (el toque va al día); acción principal del header solo con ícono.
- `fmt()` con año de 4 dígitos.
- `THEME_BOOT_SCRIPT`: en la primera visita sigue el tema del sistema.
- Foco visible con teclado (`:focus-visible`).
- `demo/` (`npm run demo`): página de muestra con datos inventados.

## 1.0.0 — 2026-10-05

Primera versión, extraída del esqueleto compartido
(`repo-base-ribo-main-arreglado`) después de las Etapas 0 y 1 de la revisión
de la casa. Sin cambios visuales respecto del esqueleto.

- CSS: `tokens.css` (paleta oscuro/claro) + `base.css` (componentes y
  responsive con los arreglos de la Etapa 1: grillas `minmax(0,1fr)`,
  `.visually-hidden` con `!important`, calendario compacto en celular).
- lit-html 3 re-exportado (`html`, `render`, `nothing`, `repeat`, `live`).
- `pintar()` para migrar vistas de string a lit de a una.
- Modal con cuerpo lit o string, cierre con Escape.
- Helpers: `escapeHtml`, `safeUrl`, `sanitizeUrl`, `conservarFoco`, `toast`,
  formatos es-AR, `hoyISO`/`mesActualISO` (hora de Buenos Aires), tema.
- `ribo-check-escape`: chequeo de escapado que entiende templates de lit.
