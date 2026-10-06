#!/usr/bin/env node
// ribo-check-escape — falla si en src/ del proyecto aparece:
//   - un dato metido sin escapar en un template de string que arma HTML
//     (`<td>${c.nombre}</td>` → tiene que ser `${esc(c.nombre)}`), o
//   - una URL guardada en un href/src sin validar, en un template de
//     string (safeUrl/hrefSeguro) o de lit (`href=${sanitizeUrl(x)}`).
// Los templates `html`...`` de lit-html no necesitan escapado: lit escapa
// solo todo lo que se interpola.
//
// Uso (desde la raíz del rubro):  npx ribo-check-escape [carpeta]   (default: src)
// Si algo está bien a propósito, `// escape-ok` al final de la línea.
//
// Es una heurística: no ve variables sueltas (`${nombre}`) ni strings
// armados con `+`. Mira accesos a propiedades (`c.nombre`) y llamadas que
// resuelven nombres (`getClienteNombre(id)`, `xxxLabel(...)`).
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

// El parser de JS sale del proyecto que corre el chequeo (Vite trae
// rolldown desde la v7 y rollup antes): no suma ninguna dependencia.
const bases = [createRequire(path.join(process.cwd(), 'package.json')), createRequire(import.meta.url)];
let parseAst;
buscar: for (const req of bases) {
  for (const mod of ['rolldown/parseAst', 'rollup/parseAst']) {
    try { ({ parseAst } = await import(pathToFileURL(req.resolve(mod)).href)); break buscar; } catch { /* probar el siguiente */ }
  }
}
if (!parseAst) {
  console.error('ribo-check-escape: no encontré rolldown ni rollup en este proyecto (¿corriste npm install?).');
  process.exit(2);
}

const root = path.resolve(process.cwd(), process.argv[2] || 'src');
const files = [];
(function walk(d) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name);
    if (f.isDirectory()) { if (f.name !== 'data' && f.name !== 'node_modules') walk(p); }
    else if (f.name.endsWith('.js')) files.push(p);
  }
})(root);

const ESCAPERS = /^(esc|escapeHtml|safeUrl|sanitizeUrl|hrefSeguro)$/;
const URL_OK = /^(safeUrl|sanitizeUrl|hrefSeguro)$/;
const SAFE_CALLS = /^(money|fmt|fmtMonth|fmtMes|fmtFecha|fmtHora|fmtFechaHora|fechaCorta|encodeURIComponent|Number|parseInt|parseFloat|toFixed|join|hoyISO|mesActualISO)$|Badge$|^badge/;
const DATA_CALLS = /nombre|Nombre|^initials$|Label$|label$/;
const HTML_MARKUP = /<\/?[a-zA-Z!]|=\s*["']$|^\s*["']/;
const LIT_TAGS = /^(html|svg)$/;

const children = (n) => Object.keys(n).filter((k) => k !== 'parent').flatMap((k) => {
  const v = n[k];
  if (Array.isArray(v)) return v.filter((c) => c && typeof c.type === 'string');
  return v && typeof v.type === 'string' ? [v] : [];
});
const unwrap = (e) => (e.type === 'ChainExpression' ? e.expression : e);
const calleeName = (c) => {
  const f = unwrap(c.callee);
  if (f.type === 'Identifier') return f.name;
  if (f.type === 'MemberExpression' && !f.computed) return f.property.name;
  return null;
};

// ¿La expresión mete texto de datos sin escapar?
function esDato(e) {
  e = unwrap(e);
  switch (e.type) {
    case 'MemberExpression':
      if (!e.computed && e.property.name === 'length') return false;
      if (e.computed && e.object.type === 'Identifier' && /^[A-Z][A-Z0-9_]+$/.test(e.object.name)) return false; // MAPA_CONSTANTE[x]
      return true;
    case 'CallExpression': {
      const n = calleeName(e);
      if (!n || ESCAPERS.test(n) || SAFE_CALLS.test(n)) return false;
      if (/^(toUpperCase|toLowerCase|trim|slice|substring|toString|padStart|replace)$/.test(n)) return esDato(unwrap(e.callee).object);
      return DATA_CALLS.test(n);
    }
    case 'LogicalExpression': return esDato(e.left) || esDato(e.right);
    case 'ConditionalExpression': return esDato(e.consequent) || esDato(e.alternate);
    default: return false;
  }
}
const urlValidada = (e, src) => {
  const u = unwrap(e);
  if (u.type === 'CallExpression' && URL_OK.test(calleeName(u) || '')) return true;
  return /\b(safeUrl|sanitizeUrl|hrefSeguro)\(/.test(src.slice(e.start, e.end));
};

let hallazgos = 0;
for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  const lines = src.split('\n');
  const ast = parseAst(src);
  (function setParents(n, p) { n.parent = p; for (const c of children(n)) setParents(c, n); })(ast, null);
  const lineOf = (pos) => src.slice(0, pos).split('\n').length;
  const reportar = (e, msg) => {
    const linea = lineOf(e.start);
    if (/\/\/\s*escape-ok/.test(lines[linea - 1])) return;
    console.log(`${path.relative(process.cwd(), file)}:${linea}  ${msg}: \${${src.slice(e.start, e.end).replace(/\s+/g, ' ')}}`);
    hallazgos++;
  };
  const esLit = (t) => t.parent?.type === 'TaggedTemplateExpression' && t.parent.quasi === t && LIT_TAGS.test(t.parent.tag.name || '');

  const esHtmlString = (t) => {
    if (esLit(t)) return false;
    if (t.parent?.type === 'CallExpression' && /^(querySelector|querySelectorAll|closest|matches|getElementById)$/.test(calleeName(t.parent) || '')) return false;
    if (t.quasis.some((q) => HTML_MARKUP.test(q.value.raw))) return true;
    for (let p = t.parent; p; p = p.parent) {
      if (p.type === 'TemplateLiteral') return esLit(p) ? false : esHtmlString(p);
      if (p.type === 'CallExpression' && /^(toast|alert|confirm|prompt|writeText)$/.test(calleeName(p) || '')) return false;
      if (p.type === 'CallExpression' && ESCAPERS.test(calleeName(p) || '')) return false; // ya se escapa entero
      if (/Function/.test(p.type)) break;
    }
    return false;
  };

  (function visit(n) {
    if (n.type === 'TemplateLiteral') {
      const lit = esLit(n);
      if (lit || esHtmlString(n)) {
        n.expressions.forEach((e, i) => {
          const antes = n.quasis[i].value.raw;
          const enUrl = /(href|src)=["']?$/.test(antes);
          if (enUrl && esDato(e) && !urlValidada(e, src)) reportar(e, 'URL sin validar en href/src');
          else if (!lit && !enUrl && esDato(e)) reportar(e, 'dato sin escapar');
        });
      }
    }
    for (const c of children(n)) visit(c);
  })(ast);
}

if (hallazgos) {
  console.log(`\n${hallazgos} problema(s) — envolvé los datos en esc()/escapeHtml(), o las URLs en safeUrl()/sanitizeUrl().`);
  process.exit(1);
}
console.log(`ribo-check-escape OK — ${files.length} archivos revisados.`);
