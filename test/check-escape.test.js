import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const BIN = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'bin', 'check-escape.mjs');

function correr(archivos) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ribo-check-'));
  fs.writeFileSync(path.join(dir, 'package.json'), '{"name":"fixture","type":"module"}');
  for (const [nombre, contenido] of Object.entries(archivos)) {
    const p = path.join(dir, 'src', nombre);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, contenido);
  }
  const r = spawnSync(process.execPath, [BIN], { cwd: dir, encoding: 'utf8' });
  fs.rmSync(dir, { recursive: true, force: true });
  return { code: r.status, out: r.stdout + r.stderr };
}

test('detecta un dato sin escapar en un template string', () => {
  const r = correr({ 'ui/a.js': 'export const f = (c) => `<td>${c.nombre}</td>`;' });
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /dato sin escapar: \$\{c\.nombre\}/);
});

test('acepta el dato escapado', () => {
  const r = correr({ 'ui/a.js': 'import { escapeHtml as esc } from "x"; export const f = (c) => `<td>${esc(c.nombre)}</td>`;' });
  assert.equal(r.code, 0, r.out);
});

test('en lit-html no exige escapar texto (lit lo hace solo)', () => {
  const r = correr({ 'ui/a.js': 'import { html } from "ribo-ui"; export const f = (c) => html`<td>${c.nombre}</td><input value=${c.email}>`;' });
  assert.equal(r.code, 0, r.out);
});

test('en lit-html sí exige validar las URLs de href/src', () => {
  const mal = correr({ 'ui/a.js': 'import { html } from "ribo-ui"; export const f = (c) => html`<a href=${c.link}>ver</a>`;' });
  assert.equal(mal.code, 1, mal.out);
  assert.match(mal.out, /URL sin validar/);
  const bien = correr({ 'ui/a.js': 'import { html, sanitizeUrl } from "ribo-ui"; export const f = (c) => html`<a href=${sanitizeUrl(c.link)}>ver</a>`;' });
  assert.equal(bien.code, 0, bien.out);
});

test('ignora selectores, toasts y líneas marcadas escape-ok', () => {
  const r = correr({ 'ui/a.js': [
    'export const a = (c) => document.querySelector(`[data-id="${c.id}"]`);',
    'export const b = (c) => toast(`Cliente ${c.nombre} creado`);',
    'export const d = (c) => `<b>${c.htmlYaArmado}</b>`; // escape-ok',
  ].join('\n') });
  assert.equal(r.code, 0, r.out);
});

test('no revisa src/data (capa de datos, no arma HTML)', () => {
  const r = correr({ 'data/x.js': 'export const f = (c) => `<td>${c.nombre}</td>`;' });
  assert.equal(r.code, 0, r.out);
});
