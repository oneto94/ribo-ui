// Configuración de ESLint de la casa RIBO (ESLint 9+, "flat config").
// En el eslint.config.js del rubro:
//
//   import ribo from 'ribo-ui/eslint';
//   export default [...ribo, { ignores: ['functions/**'] }];   // + lo propio del rubro
//
// El rubro instala como devDependencies: eslint, @eslint/js y globals.
// Las reglas apuntan a errores reales (variables sin usar, imports que no
// existen, comparaciones raras), no a gustos de formato: el formato es
// cosa de Prettier (ver config/prettier.json).
import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'playwright-report/**', 'test-results/**', '**/*.min.js'],
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser },
    },
    rules: {
      // Un import o una variable que no se usa casi siempre es un resto de
      // un cambio a medias. Los parámetros de callbacks no se miran (es
      // normal recibir (e, i) y usar uno solo), ni los `catch (err)`.
      'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none', ignoreRestSiblings: true }],
      'no-var': 'error',
      'prefer-const': ['error', { destructuring: 'all' }],
      eqeqeq: ['error', 'smart'],
      // alert/confirm/prompt del navegador: la casa usa toast() y confirmar().
      'no-restricted-globals': [
        'error',
        { name: 'alert', message: 'Usá toast() de ribo-ui.' },
        { name: 'confirm', message: 'Usá confirmar() de ribo-ui.' },
        { name: 'prompt', message: 'Usá un modal con openModal() de ribo-ui.' },
      ],
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    },
  },
  {
    // Scripts de Node (servidor mock, scripts de alta, configs, pruebas).
    files: ['server/**', 'scripts/**', '*.config.{js,mjs}', 'bin/**', 'test/**', 'tests/**', '**/*.test.{js,mjs}'],
    languageOptions: { globals: { ...globals.node } },
    rules: { 'no-console': 'off' },
  },
];
