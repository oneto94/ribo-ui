import { toast } from './dom.js';

// Errores en castellano. Firebase devuelve textos en inglés con un código
// ("Firebase: Error (auth/invalid-credential).", "Missing or insufficient
// permissions.") que no le sirven a quien usa la app. mensajeError() busca
// el código (en err.code o adentro del texto) y devuelve qué pasó y qué
// hacer. Un mensaje que ya escribimos nosotros en castellano ("Tu email no
// tiene una invitación activa…") pasa tal cual.

const SIN_CONEXION = 'No hay conexión con el servidor. Revisá internet y probá de nuevo.';
const CREDENCIALES = 'El email o la contraseña no son correctos.';
const SIN_PERMISO = 'No tenés permiso para hacer esto. Si te parece un error, hablá con quien administra la cuenta.';
const LIMITE = 'Se alcanzó el límite de uso por hoy. Probá de nuevo más tarde.';
export const MENSAJE_INESPERADO = 'Ocurrió un error inesperado. Probá de nuevo y, si sigue pasando, avisá a soporte.';

const MENSAJES = {
  // Inicio de sesión y cuentas (Firebase Auth)
  'auth/invalid-credential': CREDENCIALES,
  'auth/invalid-login-credentials': CREDENCIALES,
  'auth/wrong-password': CREDENCIALES,
  'auth/user-not-found': CREDENCIALES,
  'auth/invalid-email': 'El email no es válido. Revisá que esté bien escrito.',
  'auth/missing-email': 'Escribí el email.',
  'auth/missing-password': 'Escribí la contraseña.',
  'auth/user-disabled': 'Esta cuenta está deshabilitada. Hablá con quien administra la cuenta.',
  'auth/too-many-requests': 'Hubo demasiados intentos seguidos. Esperá unos minutos y probá de nuevo.',
  'auth/network-request-failed': SIN_CONEXION,
  'auth/email-already-in-use': 'Ya hay una cuenta con ese email. Probá iniciar sesión.',
  'auth/weak-password': 'La contraseña es muy corta: tiene que tener al menos 6 caracteres.',
  'auth/requires-recent-login': 'Por seguridad, cerrá sesión y volvé a entrar antes de hacer este cambio.',
  'auth/expired-action-code': 'El link venció. Pedí uno nuevo.',
  'auth/invalid-action-code': 'El link no es válido o ya se usó. Pedí uno nuevo.',
  'auth/operation-not-allowed': 'Esta forma de entrar no está habilitada.',
  'auth/popup-closed-by-user': 'Se cerró la ventana antes de terminar.',
  'auth/quota-exceeded': LIMITE,
  // Base de datos y funciones (Firestore, Cloud Functions, Storage)
  'permission-denied': SIN_PERMISO,
  unauthenticated: 'Tu sesión venció. Volvé a iniciar sesión.',
  unavailable: SIN_CONEXION,
  'deadline-exceeded': 'El servidor tardó demasiado en responder. Probá de nuevo.',
  'not-found': 'Ese dato ya no existe: puede que otra persona lo haya borrado.',
  'already-exists': 'Ya existe un registro con esos datos.',
  'resource-exhausted': LIMITE,
  aborted: 'Otra persona cambió el mismo dato a la vez. Probá de nuevo.',
  'failed-precondition': 'No se pudo hacer en este momento. Probá de nuevo en unos segundos.',
  'invalid-argument': 'Algún dato no tiene el formato correcto. Revisá lo que cargaste.',
  cancelled: 'Se canceló la operación.',
  'storage/unauthorized': SIN_PERMISO,
  'storage/quota-exceeded': LIMITE,
  'storage/retry-limit-exceeded': SIN_CONEXION,
  'storage/canceled': 'Se canceló la subida.',
};

// Textos de Firebase sin código a la vista.
const TEXTOS = [
  [/missing or insufficient permissions/i, 'permission-denied'],
  [/client is offline|failed to fetch|network ?error|networkerror/i, 'unavailable'],
  [/quota exceeded/i, 'resource-exhausted'],
];

const CODIGO_EN_TEXTO =
  /\b((?:auth|storage)\/[a-z-]+|permission-denied|unauthenticated|unavailable|deadline-exceeded|not-found|already-exists|resource-exhausted|failed-precondition|invalid-argument)\b/;
// Un texto en inglés (de Firebase, del navegador o de JavaScript) no se le
// muestra a nadie: se reemplaza por el mensaje genérico.
const INGLES =
  /^firebase\b|\b(the|is|are|was|failed|missing|invalid|cannot|could|unable|permissions?|network|undefined|null|function|property|reading|not)\b/i;
const CASTELLANO = /[áéíóúñ¿¡]/i;

// El código de Firebase de un error, sin el prefijo de servicio
// ('firestore/permission-denied' → 'permission-denied'), o '' si no tiene.
export function codigoError(err) {
  const crudo = err && typeof err === 'object' ? String(err.code || '') : '';
  const codigo = crudo.replace(/^(firestore|functions)\//, '');
  if (codigo) return codigo;
  const texto = err && typeof err === 'object' ? String(err.message || '') : String(err || '');
  const m = texto.match(CODIGO_EN_TEXTO);
  if (m) return m[1];
  const t = TEXTOS.find(([re]) => re.test(texto));
  return t ? t[1] : '';
}

// Qué pasó, en castellano, para mostrárselo a quien usa la app.
export function mensajeError(err) {
  const texto = (err && typeof err === 'object' ? String(err.message || '') : String(err || '')).trim();
  // Un mensaje nuestro en castellano gana aunque traiga el código técnico
  // entre paréntesis al final ("Tu email no tiene una invitación activa…
  // (permission-denied)"): explica mejor que el genérico de ese código.
  // Se muestra sin el código. Solo si el error no trae `code` propio (los
  // de Firebase siempre lo traen, y en inglés).
  const sinCodigos = texto.replace(/\s*\((?:[a-z]+\/)?[a-z]+(?:-[a-z]+)*\)/g, '').trim();
  const tieneCodigoPropio = !!(err && typeof err === 'object' && err.code);
  if (!tieneCodigoPropio && sinCodigos && CASTELLANO.test(sinCodigos) && !INGLES.test(sinCodigos)) return sinCodigos;
  const codigo = codigoError(err);
  if (MENSAJES[codigo]) return MENSAJES[codigo];
  if (texto && !codigo && (CASTELLANO.test(texto) || !INGLES.test(texto))) return texto;
  return codigo ? `${MENSAJE_INESPERADO} (código: ${codigo})` : MENSAJE_INESPERADO;
}

// Aviso de error: "No se pudo guardar: No tenés permiso para hacer esto."
// `contexto` es qué se estaba haciendo (con o sin ":" al final). El error
// original queda en la consola para poder diagnosticarlo.
export function toastError(err, contexto = 'No se pudo completar la acción') {
  if (err && typeof console !== 'undefined') console.error(err);
  const inicio = String(contexto || '').replace(/[\s:.]+$/, '');
  toast(inicio ? `${inicio}: ${mensajeError(err)}` : mensajeError(err), { tipo: 'error' });
}
