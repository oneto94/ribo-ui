import { toastError } from './errores.js';

// Un botón mientras guarda: queda deshabilitado (un doble clic no guarda
// dos veces), muestra una rueda girando en el lugar del texto, y vuelve a
// la normalidad al terminar, haya salido bien o mal. lit reutiliza los
// botones al redibujar: por eso se rehabilita siempre en el `finally`.
//
//   await conCarga(e.currentTarget, async () => {
//     await guardarCliente(datos);
//     closeModal();
//     toast('Cliente guardado.', { tipo: 'exito' });
//   }, { error: 'No se pudo guardar el cliente' });
//
// Con `error`, una falla se muestra con toastError(err, error) y conCarga
// devuelve false; sin `error`, la falla se propaga a quien llamó. Si salió
// bien devuelve lo que devolvió la acción. Guardá e.currentTarget antes de
// cualquier await: después del primer await vale null.
export async function conCarga(boton, accion, { error } = {}) {
  const b = boton && boton.nodeType === 1 ? boton : null;
  if (b && b.classList.contains('ocupado')) return false; // ya está trabajando
  const estabaDeshabilitado = b ? b.disabled : false;
  if (b) {
    b.disabled = true;
    b.classList.add('ocupado');
    b.setAttribute('aria-busy', 'true');
  }
  try {
    return await accion();
  } catch (err) {
    if (error === undefined) throw err;
    toastError(err, error);
    return false;
  } finally {
    if (b) {
      b.classList.remove('ocupado');
      b.removeAttribute('aria-busy');
      b.disabled = estabaDeshabilitado;
    }
  }
}
