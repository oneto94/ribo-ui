import { test } from 'node:test';
import assert from 'node:assert/strict';
import { escapeHtml, sanitizeUrl, safeUrl } from '../src/escape.js';
import { initials, fmt, shiftMonth, money } from '../src/format.js';
import { hoyISO, mesActualISO } from '../src/fecha.js';

test('escapeHtml neutraliza markup y comillas', () => {
  assert.equal(escapeHtml('<img src=x onerror="a()">'), '&lt;img src=x onerror=&quot;a()&quot;&gt;');
  assert.equal(escapeHtml(`O'Brien & Hijos`), 'O&#39;Brien &amp; Hijos');
  assert.equal(escapeHtml(null), '');
  assert.equal(escapeHtml(undefined), '');
  assert.equal(escapeHtml(0), '0');
});

test('sanitizeUrl deja pasar http(s) y data: de imagen/PDF, bloquea el resto', () => {
  assert.equal(sanitizeUrl('https://drive.google.com/x?a=1&b=2'), 'https://drive.google.com/x?a=1&b=2');
  assert.equal(sanitizeUrl('  http://ejemplo.com  '), 'http://ejemplo.com');
  assert.equal(sanitizeUrl('data:image/png;base64,AAAA'), 'data:image/png;base64,AAAA');
  assert.equal(sanitizeUrl('data:application/pdf;base64,AAAA'), 'data:application/pdf;base64,AAAA');
  for (const malo of ['javascript:alert(1)', 'JavaScript:alert(1)', ' javascript:x', 'data:text/html,<script>', 'vbscript:x', '//evil.com', '', null]) {
    assert.equal(sanitizeUrl(malo), '#', String(malo));
  }
});

test('safeUrl valida y además escapa (para templates string)', () => {
  assert.equal(safeUrl('https://x.com/?a=1&b="2"'), 'https://x.com/?a=1&amp;b=&quot;2&quot;');
  assert.equal(safeUrl('javascript:alert(1)'), '#');
});

test('formatos es-AR', () => {
  assert.equal(initials('Ana Pérez'), 'AP');
  assert.equal(initials('  ana  '), 'A');
  assert.equal(initials(''), '');
  assert.equal(shiftMonth('2026-01', -1), '2025-12');
  assert.equal(shiftMonth('2026-12', 1), '2027-01');
  assert.equal(money(1234567), '$1.234.567');
  assert.equal(money(null), '$0');
  assert.equal(fmt(''), '—');
  assert.match(fmt('2026-10-05'), /5.*oct.*26/);
});

test('hoyISO usa la hora de Buenos Aires, no UTC', () => {
  // 02:30 UTC del 6/10 son las 23:30 del 5/10 en Buenos Aires (UTC-3).
  const base = new Date('2026-10-06T02:30:00Z');
  assert.equal(hoyISO(base), '2026-10-05');
  assert.equal(mesActualISO(base), '2026-10');
});

test('el módulo principal carga en Node (sin DOM) y exporta la API', async () => {
  const api = await import('../src/index.js');
  for (const k of ['html', 'render', 'nothing', 'repeat', 'live', 'escapeHtml', 'sanitizeUrl', 'safeUrl', 'fmt', 'money', 'hoyISO', 'pintar', 'conservarFoco', 'toast', 'getTheme', 'toggleTheme', 'modalMarkup', 'openModal', 'closeModal']) {
    assert.ok(api[k], `falta export ${k}`);
  }
});
