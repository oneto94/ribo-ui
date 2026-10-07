import { test } from 'node:test';
import assert from 'node:assert/strict';
import { leerRuta, hashRuta } from '../src/rutas.js';
import { mensajeError, codigoError, MENSAJE_INESPERADO } from '../src/errores.js';
import { errorDeCampo, esEmail, esCuit, esTelefono, esUrl } from '../src/validacion.js';

test('rutas: leer y armar el hash', () => {
  assert.deepEqual(leerRuta(''), { vista: '', partes: [] });
  assert.deepEqual(leerRuta('#'), { vista: '', partes: [] });
  assert.deepEqual(leerRuta('#/clientes'), { vista: 'clientes', partes: [] });
  assert.deepEqual(leerRuta('#/deportes/futbol/sub-12'), { vista: 'deportes', partes: ['futbol', 'sub-12'] });
  assert.deepEqual(leerRuta('#clientes/'), { vista: 'clientes', partes: [] });
  assert.deepEqual(leerRuta('#/clientes/Ana%20P%C3%A9rez'), { vista: 'clientes', partes: ['Ana Pérez'] });
  assert.deepEqual(leerRuta('#/x/%E0%A4%A'), { vista: 'x', partes: ['%E0%A4%A'] }); // escape roto: tal cual
  assert.equal(hashRuta('clientes'), '#/clientes');
  assert.equal(hashRuta('deportes', 'futbol', null, ''), '#/deportes/futbol');
  assert.equal(hashRuta('clientes', 'Ana Pérez/2'), '#/clientes/Ana%20P%C3%A9rez%2F2');
});

test('errores de Firebase en castellano', () => {
  const auth = { code: 'auth/invalid-credential', message: 'Firebase: Error (auth/invalid-credential).' };
  assert.equal(mensajeError(auth), 'El email o la contraseña no son correctos.');
  assert.equal(mensajeError({ code: 'auth/wrong-password' }), 'El email o la contraseña no son correctos.');
  assert.match(mensajeError({ code: 'permission-denied', message: 'Missing or insufficient permissions.' }), /^No tenés permiso/);
  assert.match(mensajeError({ code: 'firestore/unavailable' }), /^No hay conexión/);
  // Sin code, pero con el código o el texto de Firebase adentro del mensaje.
  assert.match(mensajeError(new Error('Firebase: Error (auth/too-many-requests).')), /demasiados intentos/);
  assert.match(mensajeError(new Error('No se pudo invitar (sin código): Missing or insufficient permissions.')), /^No tenés permiso/);
  assert.match(mensajeError(new TypeError('Failed to fetch')), /^No hay conexión/);
  assert.equal(codigoError({ code: 'firestore/permission-denied' }), 'permission-denied');
  assert.equal(codigoError(new Error('algo (auth/weak-password)')), 'auth/weak-password');
});

test('errores: lo nuestro pasa tal cual, el inglés no', () => {
  assert.equal(mensajeError(new Error('Tu email no tiene una invitación activa.')), 'Tu email no tiene una invitación activa.');
  assert.equal(mensajeError(new Error('Falta el nombre del cliente')), 'Falta el nombre del cliente');
  assert.equal(mensajeError('Ya existe un estudio con ese ID'), 'Ya existe un estudio con ese ID');
  assert.equal(mensajeError(new TypeError("Cannot read properties of undefined (reading 'id')")), MENSAJE_INESPERADO);
  assert.equal(mensajeError(new Error('Firebase: Error.')), MENSAJE_INESPERADO);
  assert.equal(mensajeError({ code: 'internal', message: 'internal' }), `${MENSAJE_INESPERADO} (código: internal)`);
  assert.equal(mensajeError(null), MENSAJE_INESPERADO);
  assert.equal(mensajeError(undefined), MENSAJE_INESPERADO);
});

test('validadores de formato', () => {
  assert.ok(esEmail('ana@ejemplo.com'));
  assert.ok(esEmail('  ana.perez+x@sub.ejemplo.com.ar '));
  for (const malo of ['ana', 'ana@', 'ana@ejemplo', 'ana @ejemplo.com', '@ejemplo.com', '']) assert.ok(!esEmail(malo), malo);
  assert.ok(esCuit('20-12345678-6'));
  assert.ok(esCuit('20123456786'));
  assert.ok(esCuit('27-11111111-7'));
  for (const malo of ['20-12345678-5', '2012345678', '201234567861', '20-1234567a-6', '']) assert.ok(!esCuit(malo), malo);
  assert.ok(esTelefono('+54 9 11 1234-5678'));
  assert.ok(esTelefono('(011) 4444-5555'));
  for (const malo of ['12345', 'llamame', '11-2222-3333 int 4', '1234567890123456']) assert.ok(!esTelefono(malo), malo);
  assert.ok(esUrl('https://drive.google.com/x'));
  assert.ok(esUrl('http://ejemplo.com'));
  for (const malo of ['javascript:alert(1)', 'drive.google.com', '#', '']) assert.ok(!esUrl(malo), malo);
});

test('errorDeCampo: reglas y mensajes', () => {
  assert.equal(errorDeCampo('', { requerido: true }), 'Completá este campo.');
  assert.equal(errorDeCampo('   ', { requerido: 'Poné el nombre' }), 'Poné el nombre');
  assert.equal(errorDeCampo('', { email: true }), ''); // opcional y vacío: bien
  assert.match(errorDeCampo('ana@', { email: true }), /email/);
  assert.match(errorDeCampo('20-12345678-5', { cuit: true }), /CUIT/);
  assert.equal(errorDeCampo('1234,50', { numero: { positivo: true } }), '');
  assert.equal(errorDeCampo('0', { numero: { positivo: true } }), 'Tiene que ser mayor que cero.');
  assert.equal(errorDeCampo('abc', { numero: true }), 'Tiene que ser un número.');
  assert.equal(errorDeCampo('2.5', { numero: { entero: true } }), 'Tiene que ser un número entero.');
  assert.equal(errorDeCampo('11', { numero: { max: 10 } }), 'Tiene que ser 10 o menos.');
  assert.equal(errorDeCampo('-1', { numero: { min: 0 } }), 'Tiene que ser 0 o más.');
  assert.equal(errorDeCampo('x', { validar: (v) => (v === 'x' ? 'No puede ser x' : '') }), 'No puede ser x');
});
