import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const startPreview = readFileSync(resolve(rootDir, 'js/ui/render-start-preview.js'), 'utf8');
const startCss = readFileSync(resolve(rootDir, 'css/screens/start.css'), 'utf8');

const failures = [];

function fail(message) {
  failures.push(message);
}

if (!startPreview.includes("import { Board }")) {
  fail('render-start-preview.js must derive the preview from the Board model.');
}

[
  'start-preview-route-band-layer',
  'start-preview-connector-layer',
  'start-preview-socket-layer',
  'start-preview-fields',
  'renderRouteSurface(fields)'
].forEach((token) => {
  if (!startPreview.includes(token)) {
    fail(`render-start-preview.js is missing field-first preview token "${token}".`);
  }
});

[
  'polyline',
  'renderPath(',
  'start-preview-route-shadow',
  'start-preview-route-earth',
  'start-preview-route-gold',
  'start-preview-hill',
  'start-preview-pond'
].forEach((token) => {
  if (startPreview.includes(token)) {
    fail(`render-start-preview.js must not render old scenic or duplicate route token "${token}".`);
  }
});

[
  '.start-preview-route-band-paper',
  '.start-preview-connector-paper',
  '.start-preview-socket-paper',
  '.start-preview-landmarks'
].forEach((token) => {
  if (!startCss.includes(token)) {
    fail(`start.css is missing field-first preview style "${token}".`);
  }
});

[
  '.start-preview-route-shadow',
  '.start-preview-route-earth',
  '.start-preview-route-gold',
  '.start-preview-hill',
  '.start-preview-pond'
].forEach((token) => {
  if (startCss.includes(token)) {
    fail(`start.css must not style old scenic or duplicate route token "${token}".`);
  }
});

if (failures.length) {
  console.error('Onboarding art validation failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Onboarding art validation passed: start preview uses field-first board geometry.');
