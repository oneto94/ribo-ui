// Modo claro/oscuro: preferencia por dispositivo (localStorage), no por
// usuario. El valor inicial lo aplica un script inline en index.html ANTES
// de cargar el CSS (si no, quien eligió claro ve un flash oscuro al
// abrir); este módulo solo maneja el cambio en caliente.
const KEY = 'tema';

export function getTheme() {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

export function toggleTheme() {
  const nuevo = getTheme() === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', nuevo);
  try {
    localStorage.setItem(KEY, nuevo);
  } catch {
    /* modo incógnito: vale solo para esta sesión */
  }
  return nuevo;
}

// El script que va inline en el <head> de index.html, antes del CSS.
// Se exporta para documentarlo en un solo lugar; no se puede importar
// desde ahí porque tiene que correr antes que cualquier módulo.
export const THEME_BOOT_SCRIPT = `(function () {
  try {
    var g = localStorage.getItem('tema');
    // Primera visita (nada guardado): el tema del sistema operativo.
    var t = g === 'light' || g === 'dark' ? g : (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    document.documentElement.setAttribute('data-theme', t);
  } catch (e) {}
})();`;
