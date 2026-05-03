import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const srcPath = path.join(root, 'assets/icons/lolalogo2.svg');
const dstPath = path.join(root, 'assets/icons/lolalogo2inverted.svg');
const text = fs.readFileSync(srcPath, 'utf8');
const svgOpen = text.indexOf('<svg');
if (svgOpen === -1) throw new Error('no <svg');
const i = text.indexOf('>', svgOpen) + 1;
const defs = `
  <defs>
    <filter id="lola-invert" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feColorMatrix type="matrix" values="-1 0 0 0 1  0 -1 0 0 1  0 0 -1 0 1  0 0 0 1 0"/>
    </filter>
  </defs>
  <g filter="url(#lola-invert)">
`;
const close = '\n  </g>\n';
const li = text.lastIndexOf('</svg>');
const out = text.slice(0, i) + defs + text.slice(i, li) + close + text.slice(li);
fs.writeFileSync(dstPath, out);
console.log('wrote', dstPath);
