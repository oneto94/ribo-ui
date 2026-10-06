# ribo-ui

Base compartida de la casa RIBO: el sistema de diseño (paleta dorado/bronce,
oscuro por defecto), los helpers que todos los rubros usan y
[lit-html](https://lit.dev/docs/libraries/standalone-templates/) para dibujar
las vistas.

Cada rubro la instala **por versión** y decide cuándo actualizar: un cambio
acá no rompe a nadie hasta que ese rubro sube de versión a propósito.

## Instalar en un rubro

```bash
npm install github:oneto94/ribo-ui#v1.0.0
```

(Mientras el repo no esté en GitHub, para probar en local:
`npm install ../ribo-ui`.)

En el CSS del rubro, como primera línea:

```css
@import 'ribo-ui/ribo.css';
/* reglas propias del rubro, si hace falta */
```

En `package.json` del rubro, el chequeo de escapado (corre también en el
deploy, antes del build):

```json
"check:escape": "ribo-check-escape"
```

## Qué trae

| Import | Para qué |
|---|---|
| `html`, `render`, `nothing`, `repeat`, `live` | lit-html. **Importalos siempre desde `ribo-ui`**, nunca de `lit-html` directo: así todos usan la misma copia. |
| `pintar(contenedor, contenido)` | Dibuja una vista. Acepta un template de lit o, mientras se migra, un string de HTML ya escapado. |
| `openModal(eyebrow, título, cuerpo, grande?)`, `closeModal()`, `modalMarkup()` | El modal de la casa. `cuerpo` puede ser lit o string. Se cierra con Escape. `modalMarkup()` va una vez en el shell. |
| `toast(msg)` | Aviso breve. Usa `textContent`: no hace falta escapar. |
| `escapeHtml(s)`, `safeUrl(url)` | Para templates **string** que van a `innerHTML`. |
| `sanitizeUrl(url)` | Para un `href`/`src` en un template **de lit** (deja http(s) y data: de imagen/PDF; lo demás → `#`). |
| `conservarFoco(fn)` | Redibujado con innerHTML sin perder el foco ni el cursor (con lit no hace falta). |
| `fmt`, `fmtMonth`, `shiftMonth`, `money`, `initials` | Formatos es-AR. |
| `hoyISO()`, `mesActualISO()` | "Hoy" y "este mes" en hora de Buenos Aires (no UTC). |
| `getTheme()`, `toggleTheme()`, `THEME_BOOT_SCRIPT` | Modo claro/oscuro. El script de arranque va inline en el `<head>`, antes del CSS. |
| `ribo-ui/ribo.css` (= `tokens.css` + `base.css`) | Tokens (colores, tipografía) y componentes (shell, sidebar, botones, paneles, tablas, modales, calendario, responsive). |

## Por qué lit-html

- **Escapa solo.** Todo lo que se interpola en `` html`...` `` es texto: un
  nombre de cliente con `<img onerror=...>` se ve como texto, sin acordarse
  de `esc()` en cada campo. (Los `href`/`src` igual van con `sanitizeUrl`.)
- **Actualiza en el lugar.** Redibujar una vista no recrea los `<input>`: un
  buscador que filtra mientras tipeás no pierde el foco.
- **Eventos en el template.** `@click=${() => abrir(c)}` en vez de buscar
  elementos por id o `data-id` después de dibujar.
- Son ~3 KB y no cambian cómo se arma el HTML: las vistas se migran de a una.

## Migrar una vista (de string a lit)

Antes:

```js
container.innerHTML = `<tr data-id="${esc(c.id)}"><td>${esc(c.nombre)}</td></tr>`;
container.querySelectorAll('[data-id]').forEach((tr) =>
  tr.addEventListener('click', () => abrir(tr.dataset.id)));
```

Después:

```js
import { html, pintar } from 'ribo-ui';
pintar(container, html`<tr @click=${() => abrir(c.id)}><td>${c.nombre}</td></tr>`);
```

Reglas que muerden:

- **`<textarea>`**: lit no deja interpolar adentro. Usá
  `<textarea .value=${x}></textarea>`.
- **Valores de formularios**: `.value=${x}` (propiedad) en vez de
  `value="${x}"`; `?selected=${cond}`, `?checked=${cond}`, `?disabled=${cond}`.
- **Clases**: `class="badge ${cls}"` funciona; si la clase viene de un dato,
  pasala por una lista fija (`ESTADO_BADGE[x]`), nunca el dato crudo.
- **`href`/`src` con datos**: `href=${sanitizeUrl(link)}`.
- **No mezcles** `innerHTML` y `render` sobre el mismo nodo: usá `pintar`,
  que maneja los dos casos.

RIBO Ops es el primer rubro migrado entero (2026-10-05): es la referencia.

## Desarrollo

```bash
npm install
npm test          # node:test — helpers, fecha AR, API, y el chequeo de escapado
```

Versionado [semver](https://semver.org/lang/es/): un cambio visual o de API
que obligue a tocar los rubros es versión mayor. Cada versión se publica con
un tag (`git tag v1.1.0 && git push --tags`) y se anota en `CHANGELOG.md`.
