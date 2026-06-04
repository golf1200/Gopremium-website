// Post-build: make GO PREMIUM v2 the production homepage.
// Vercel serves the build's index.html for "/" before any rewrite, so the only
// reliable way to put v2 at "/" is to make it the actual index.html.
// The original React app is preserved at /old.html (served at /old via vercel.json).
import fs from 'node:fs';

const d = 'dist';
const idx = `${d}/index.html`;
const v2 = `${d}/v2.html`;

if (!fs.existsSync(idx)) throw new Error('dist/index.html missing — run `vite build` first');
if (!fs.existsSync(v2)) throw new Error('dist/v2.html missing — is public/v2.html present?');

fs.copyFileSync(idx, `${d}/old.html`); // preserve the old React app
fs.copyFileSync(v2, idx);              // v2 becomes the homepage at /
console.log('postbuild: homepage = v2.html  ·  old React app preserved at /old.html');
