# ribo-ui

Base compartida de la casa RIBO: el sistema de diseño (paleta dorado/bronce,
oscuro por defecto), los helpers que todos los rubros usan y
[lit-html](https://lit.dev/docs/libraries/standalone-templates/) para dibujar
las vistas.

Cada rubro la instala **por versión** y decide cuándo actualizar: un cambio
acá no rompe a nadie hasta que ese rubro sube de versión a propósito.

## Instalar en un rubro

```bash
npm install github:oneto94/ribo-ui#v2.2.0
```

(Para probar cambios de ribo-ui antes de publicarlos: `npm install ../ribo-ui`
— nunca commitear ese `file:` en un rubro. Después de cambiar de versión,
borrar `node_modules/.vite` o Vite sigue sirviendo la anterior.)

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
| `openModal(eyebrow, título, cuerpo, grande?)`, `closeModal()`, `modalMarkup()` | El modal de la casa. `cuerpo` puede ser lit o string; devuelve el nodo del cuerpo (para actualizarlo en el lugar con `render`). Se cierra con Escape y devuelve el foco. `modalMarkup()` va una vez en el shell (`shell()` ya lo incluye). |
| `toast(msg, { tipo, duracion })` | Aviso con ícono y botón de cerrar; se apilan (máx. 3). `tipo`: `info`, `exito`, `error` o `aviso`. Sin tipo, un mensaje que empieza con "No se pudo" o "Error" sale como error. El texto nunca se interpreta como HTML. |
| `confirmar({ titulo, mensaje, boton, cancelar, peligro })` | Reemplazo de `confirm()`: devuelve una promesa con `true`/`false`. Con `peligro` el botón es rojo y el foco arranca en Cancelar. Escape no cierra el modal de abajo. |
| `shell({...})` | El armazón entero de la app: menú lateral con íconos y contadores, menú de usuario (tema, cerrar sesión y lo que sumes), header con UNA acción principal y el resto en "Más…", `#content` y el modal. Ver el comentario en `src/shell.js` y `demo/demo.js`. |
| `icono(nombre, { tam })`, `iconoHtml(...)`, `NOMBRES_ICONOS` | Íconos de Lucide (lit o string). La lista está en `src/iconos.js`; para sumar uno: `scripts/generar-iconos.mjs` + `npm run iconos` + versión nueva. |
| `vacio({ icono, titulo, texto, accion })`, `cargando(filas)` | Pantalla vacía con acción, y filas grises mientras llegan los datos. |
| `menu({ boton, etiqueta, items })` | Menú desplegable (`<details>`): se cierra con Escape, clic afuera o al elegir. |
| `LOGO_RIBO`, `logoLoginHtml()` | El isotipo de RIBO (data URI) y el `<img>` para el login. |
| `escapeHtml(s)`, `safeUrl(url)` | Para templates **string** que van a `innerHTML`. |
| `sanitizeUrl(url)` | Para un `href`/`src` en un template **de lit** (deja http(s) y data: de imagen/PDF; lo demás → `#`). |
| `conservarFoco(fn)` | Redibujado con innerHTML sin perder el foco ni el cursor (con lit no hace falta). |
| `fmt`, `fmtMonth`, `shiftMonth`, `money`, `initials` | Formatos es-AR. |
| `hoyISO()`, `mesActualISO()` | "Hoy" y "este mes" en hora de Buenos Aires (no UTC). |
| `getTheme()`, `toggleTheme()`, `THEME_BOOT_SCRIPT` | Modo claro/oscuro. El script de arranque va inline en el `<head>`, antes del CSS. |
| `leerRuta()`, `irARuta(vista, ...partes)`, `reemplazarRuta(...)`, `alCambiarRuta(fn)`, `hashRuta(...)` | Una URL por pantalla con el hash (`#/clientes`). `irA` del rubro llama a `irARuta`; `alCambiarRuta` dibuja la pantalla (así "atrás" anda igual que el menú); al arrancar, una vista inválida se corrige con `reemplazarRuta`. Ver `src/rutas.js`. |
| `mensajeError(err)`, `toastError(err, contexto)`, `codigoError(err)` | Errores en castellano: `toastError(err, 'No se pudo guardar')` → "No se pudo guardar: No tenés permiso para hacer esto…". Nunca mostrar `err.message` crudo. |
| `validar(raiz, reglas)`, `marcarError(campo, texto)`, `limpiarErrores(raiz)` | Validación con el error debajo de cada campo. Reglas por id: `requerido`, `email`, `cuit`, `telefono`, `url`, `numero: { positivo, min, max, entero }`, `validar: (v) => 'mensaje'`; `true` usa el texto de siempre, un string lo reemplaza. Formularios `<form>` con `novalidate` (si no, el navegador muestra sus propios globos). |
| `esEmail`, `esCuit`, `esTelefono`, `esUrl`, `errorDeCampo(valor, reglas)` | Los mismos chequeos sueltos. |
| `conCarga(boton, accion, { error })` | Botón deshabilitado con una rueda mientras corre `accion`; se rehabilita siempre. Guardar `e.currentTarget` antes del primer `await`. |
| `ribo-ui/ribo.css` (= `tokens.css` + `base.css`) | Tokens (colores, escala de letra con mínimo 12px, espacios, bordes, sombras, capas) y componentes. Una tabla con clase `tarjetas` y `data-label` en cada `<td>` se ve como tarjetas en el celular. |

## Pasar un rubro de v1 a v2

1. `npm install github:oneto94/ribo-ui#v2.2.0` y borrar `node_modules/.vite`.
2. En `app.js`, reemplazar el shell armado a mano por `shell({...})` (menú con íconos, acción principal sin "+ " en el texto, acciones secundarias en `mas`, Mi Cuenta/Soporte en `menuUsuario`).
3. Login: `${logoLoginHtml()}` arriba del eyebrow.
4. `index.html`: copiar `THEME_BOOT_SCRIPT` (primera visita = tema del sistema). Borrar `public/favicon.svg` e `icons.svg` si son los de la plantilla de Vite.
5. `style.css` del rubro: sacar tamaños en px y usar los tokens (`var(--fs-sm)`, `var(--sp-3)`…).
6. Vistas: `confirm()` → `await confirmar(...)`, "Todavía no hay…" → `vacio(...)`, "Cargando…" → `cargando()`, botones "+ X" → `${icono('plus')}X`, tablas grandes → `tarjetas`.
7. Verificar: sin desbordes en 1440/1024/768/375 y round-trip de "guardar sin cambios" idéntico.

## Experiencia de uso (v2.2)

1. Rutas: `irA(vista)` → `if (!irARuta(vista)) aplicarVista(vista)`; en `renderApp`, leer la ruta, validarla contra lo que el usuario puede ver y escuchar `alCambiarRuta` (cerrando el modal abierto); dejar de escuchar al cerrar sesión. `document.title` con el nombre de la pantalla.
2. Errores: `toast('No se pudo X: ' + err.message)` → `toastError(err, 'No se pudo X')`. Los avisos de éxito con `{ tipo: 'exito' }`.
3. Botones: `btn.disabled = true; try … catch … btn.disabled = false` → `await conCarga(btn, async () => …, { error: 'No se pudo X' })`.
4. Formularios: `if (!x) return;` o un aviso suelto → `if (!validar(modal, {...})) return;`. Un dato importado con otro formato no tiene que bloquear la edición: validar el formato solo si el campo cambió.
5. Carga: `cargando()` hasta el primer dato (no "Todavía no hay…" por un instante) y `<div class="arranque" aria-busy="true" aria-label="Cargando"></div>` adentro de `#app` en `index.html`.

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
npm test          # node:test — helpers, fecha AR, API, íconos, tema y el chequeo de escapado
npm run demo      # página de muestra con todos los componentes (http://localhost:5174)
npm run iconos    # regenera src/iconos.js desde Lucide
```

Versionado [semver](https://semver.org/lang/es/): un cambio visual o de API
que obligue a tocar los rubros es versión mayor. Cada versión se publica con
un tag (`git tag v1.1.0 && git push --tags`) y se anota en `CHANGELOG.md`.
