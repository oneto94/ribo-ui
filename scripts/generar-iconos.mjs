// Genera src/iconos.js con el subconjunto de íconos de Lucide que usa la
// casa. Lucide es dependencia de desarrollo (pesa ~22 MB entero): a los
// rubros solo llega este archivo. Para sumar un ícono, agregalo a la lista,
// corré `npm run iconos` y publicá una versión nueva.
//
// Lucide — ISC License, Copyright (c) Lucide Contributors.
import fs from 'node:fs';
import * as lucide from 'lucide';

const NOMBRES = [
  // Interfaz
  'Menu',
  'X',
  'Plus',
  'Minus',
  'Check',
  'ChevronDown',
  'ChevronUp',
  'ChevronLeft',
  'ChevronRight',
  'ArrowLeft',
  'ArrowRight',
  'Search',
  'Bell',
  'Sun',
  'Moon',
  'Monitor',
  'LogOut',
  'UserPlus',
  'Settings',
  'LifeBuoy',
  'User',
  'Ellipsis',
  'EllipsisVertical',
  'Pencil',
  'Trash2',
  'Eye',
  'EyeOff',
  'Download',
  'Upload',
  'ExternalLink',
  'Info',
  'CircleCheck',
  'CircleAlert',
  'TriangleAlert',
  'CircleX',
  'Inbox',
  'RefreshCw',
  'Funnel',
  'Calendar',
  'CalendarDays',
  'Clock',
  'Link',
  'Copy',
  'Mail',
  'Phone',
  'FileUp',
  'FileSpreadsheet',
  'FileJson',
  'Archive',
  'ArchiveRestore',
  'Save',
  'Send',
  'Lock',
  'KeyRound',
  'Printer',
  'History',
  'Undo2',
  // Secciones de los rubros
  'House',
  'LayoutDashboard',
  'Users',
  'UsersRound',
  'Contact',
  'IdCard',
  'ListTodo',
  'ClipboardList',
  'ClipboardCheck',
  'Landmark',
  'Receipt',
  'ReceiptText',
  'FileText',
  'FolderOpen',
  'ChartColumn',
  'ChartLine',
  'ChartPie',
  'Building',
  'Building2',
  'Megaphone',
  'Wrench',
  'MessageSquareWarning',
  'Vote',
  'Wallet',
  'Gavel',
  'MailOpen',
  'CalendarCheck',
  'CalendarClock',
  'CalendarOff',
  'Waves',
  'Dumbbell',
  'DoorOpen',
  'ShieldCheck',
  'Shield',
  'Tag',
  'Store',
  'Truck',
  'BookOpen',
  'UserCog',
  'BriefcaseBusiness',
  'Package',
  'Boxes',
  'Factory',
  'CookingPot',
  'ShoppingCart',
  'Banknote',
  'Scissors',
  'Sparkles',
  'CreditCard',
  'Gift',
  'Ticket',
  'Percent',
  'Calculator',
  'Vault',
  'Trophy',
  'Medal',
  'Activity',
  'Anchor',
  'Sailboat',
  'ConciergeBell',
  'PawPrint',
  'HandCoins',
  'Coins',
  'Briefcase',
  'Volleyball',
  'Target',
  'Layers',
];

const kebab = (s) =>
  s
    .replace(/([a-zA-Z])([0-9])/g, '$1-$2')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
const attrs = (o) =>
  Object.entries(o)
    .map(([k, v]) => `${k}="${String(v).replace(/"/g, '&quot;')}"`)
    .join(' ');

const faltan = NOMBRES.filter((n) => !Array.isArray(lucide[n]));
if (faltan.length) {
  console.error('No existen en lucide:', faltan.join(', '));
  process.exit(1);
}

const entradas = NOMBRES.map((n) => {
  const cuerpo = lucide[n].map(([tag, a]) => `<${tag} ${attrs(a)}/>`).join('');
  return `  '${kebab(n)}': '${cuerpo}',`;
});

const version = JSON.parse(fs.readFileSync(new URL('../node_modules/lucide/package.json', import.meta.url))).version;
const salida = `// GENERADO por scripts/generar-iconos.mjs — no editar a mano.
// Íconos de Lucide ${version} (https://lucide.dev), ISC License,
// Copyright (c) Lucide Contributors. Cada valor es el contenido de un
// <svg viewBox="0 0 24 24"> de trazo (stroke) — ver icono() en icono.js.
export const ICONOS = {
${entradas.join('\n')}
};
`;
fs.writeFileSync(new URL('../src/iconos.js', import.meta.url), salida);
console.log(`src/iconos.js: ${NOMBRES.length} íconos (lucide ${version})`);
