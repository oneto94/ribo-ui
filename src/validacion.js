// Validación de formularios con el error debajo de cada campo (y no un
// aviso suelto que hay que leer y después buscar a qué campo se refiere).
//
//   if (!validar(modal, {
//     cliNombre: { requerido: 'Poné el nombre del cliente' },
//     cliCuit:   { cuit: true },                 // opcional: se valida solo si tiene algo
//     cliEmail:  { requerido: true, email: true },
//     cliMonto:  { requerido: true, numero: { positivo: true } },   // también: min, max, entero
//   })) return;
//
// Las claves son ids de campos dentro de `raiz`. `true` usa el mensaje de
// siempre; un string lo reemplaza. Marca cada campo con error
// (aria-invalid + un texto debajo, ligado con aria-describedby), lleva el
// foco al primero, y el error de un campo se borra apenas se lo corrige.

const DIGITOS = (v) => String(v || '').replace(/\D/g, '');

export function esEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || '').trim());
}

// CUIT/CUIL: 11 números (con o sin guiones) y dígito verificador válido.
export function esCuit(v) {
  const d = DIGITOS(v);
  if (d.length !== 11 || /[^\d\s.-]/.test(String(v).trim())) return false;
  const pesos = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const suma = pesos.reduce((s, p, i) => s + p * Number(d[i]), 0);
  let dv = 11 - (suma % 11);
  if (dv === 11) dv = 0;
  if (dv === 10) dv = 9; // casos especiales que AFIP asigna con 9
  return dv === Number(d[10]);
}

// Teléfono: entre 6 y 15 números, con +, espacios, guiones o paréntesis.
export function esTelefono(v) {
  const s = String(v || '').trim();
  return /^\+?[\d\s()-]+$/.test(s) && DIGITOS(s).length >= 6 && DIGITOS(s).length <= 15;
}

export function esUrl(v) {
  try {
    const u = new URL(String(v || '').trim());
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

const MENSAJES = {
  requerido: 'Completá este campo.',
  email: 'Revisá el email (por ejemplo: nombre@dominio.com).',
  cuit: 'El CUIT no es válido: son 11 números y el último es el verificador.',
  telefono: 'Revisá el teléfono: tiene que tener entre 6 y 15 números.',
  url: 'Tiene que ser un link que empiece con http:// o https://.',
  numero: 'Tiene que ser un número.',
};

const msg = (regla, valor) => (typeof valor === 'string' ? valor : MENSAJES[regla]);

function valorDe(campo) {
  if (campo.type === 'checkbox') return campo.checked ? 'si' : '';
  return String(campo.value ?? '').trim();
}

function numero(v) {
  // Acepta coma decimal ("1234,50") además del punto.
  const n = Number(String(v).replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : NaN;
}

// El primer error de un valor según sus reglas, o '' si está bien.
export function errorDeCampo(valor, reglas = {}) {
  const v = String(valor ?? '').trim();
  if (!v) return reglas.requerido ? msg('requerido', reglas.requerido) : '';
  if (reglas.email && !esEmail(v)) return msg('email', reglas.email);
  if (reglas.cuit && !esCuit(v)) return msg('cuit', reglas.cuit);
  if (reglas.telefono && !esTelefono(v)) return msg('telefono', reglas.telefono);
  if (reglas.url && !esUrl(v)) return msg('url', reglas.url);
  if (reglas.numero) {
    const n = numero(v);
    const r = typeof reglas.numero === 'object' ? reglas.numero : {};
    if (Number.isNaN(n)) return r.mensaje || msg('numero', reglas.numero);
    if (r.entero && !Number.isInteger(n)) return r.mensaje || 'Tiene que ser un número entero.';
    if (r.positivo && n <= 0) return r.mensaje || 'Tiene que ser mayor que cero.';
    if (r.min != null && n < r.min) return r.mensaje || `Tiene que ser ${r.min} o más.`;
    if (r.max != null && n > r.max) return r.mensaje || `Tiene que ser ${r.max} o menos.`;
  }
  if (typeof reglas.validar === 'function') return reglas.validar(v) || '';
  return '';
}

// Dónde va el texto del error: debajo del campo, dentro de su <label> si
// lo tiene (así queda en la misma celda de la grilla del formulario).
function contenedorDe(campo) {
  return campo.closest('label') || campo.parentElement;
}

export function limpiarError(campo) {
  if (!campo) return;
  campo.removeAttribute('aria-invalid');
  const id = campo.id && `${campo.id}-error`;
  const viejo = id && document.getElementById(id);
  if (viejo) viejo.remove();
  const desc = (campo.getAttribute('aria-describedby') || '').split(/\s+/).filter((x) => x && x !== id);
  if (desc.length) campo.setAttribute('aria-describedby', desc.join(' '));
  else campo.removeAttribute('aria-describedby');
}

export function marcarError(campo, texto) {
  if (!campo) return;
  limpiarError(campo);
  campo.setAttribute('aria-invalid', 'true');
  const nota = document.createElement('small');
  nota.className = 'campo-error';
  nota.id = `${campo.id || 'campo'}-error`;
  nota.textContent = texto;
  contenedorDe(campo).appendChild(nota);
  const desc = (campo.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
  campo.setAttribute('aria-describedby', [...desc, nota.id].join(' '));
  // Se borra apenas se corrige (o se vuelve a tocar), sin esperar a guardar.
  const alCorregir = () => { limpiarError(campo); campo.removeEventListener('input', alCorregir); campo.removeEventListener('change', alCorregir); };
  campo.addEventListener('input', alCorregir);
  campo.addEventListener('change', alCorregir);
}

export function limpiarErrores(raiz = document) {
  raiz.querySelectorAll('[aria-invalid="true"]').forEach(limpiarError);
  raiz.querySelectorAll('.campo-error').forEach((n) => n.remove());
}

// Valida todos los campos de `reglas` dentro de `raiz` y devuelve true si
// están bien. Un id que no existe en el formulario se ignora (campos que
// solo aparecen en algunos casos).
export function validar(raiz, reglas) {
  const base = raiz || document;
  limpiarErrores(base);
  let primero = null;
  for (const [id, r] of Object.entries(reglas || {})) {
    const campo = base.querySelector(`#${CSS.escape(id)}`);
    if (!campo || campo.disabled) continue;
    const error = errorDeCampo(valorDe(campo), r);
    if (!error) continue;
    marcarError(campo, error);
    // El foco va al primero en pantalla, no al primero de la lista de reglas.
    if (!primero || (campo.compareDocumentPosition(primero) & Node.DOCUMENT_POSITION_FOLLOWING)) primero = campo;
  }
  if (primero) {
    primero.focus({ preventScroll: true });
    primero.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
  return !primero;
}
