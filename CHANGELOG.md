# Cambios

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
