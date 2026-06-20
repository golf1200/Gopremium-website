/**
 * Client for the GO PREMIUM sheet-sync Web App (Apps Script).
 * Claude uses this via Bash to read/update the "Gopremium Dev Master" Google Sheet.
 *
 * Config: scripts/.sheet-config.json  →  { "url": "<web app /exec url>", "token": "<secret>" }
 *
 * Usage:
 *   node scripts/sheet.mjs getSheets
 *   node scripts/sheet.mjs read '{"sheet":"TO-DO"}'
 *   node scripts/sheet.mjs setCell '{"sheet":"TO-DO","cell":"E5","value":"✅"}'
 *   node scripts/sheet.mjs update '{"sheet":"TO-DO","matchCol":"งาน","matchVal":"เติมราคาสินค้า","setCol":"สถานะ (ติ๊กเอง)","setVal":"✅ ทำแล้ว"}'
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const cfgPath = path.join(dir, '.sheet-config.json');
if (!fs.existsSync(cfgPath)) {
  console.error('Missing scripts/.sheet-config.json — set { url, token } first.');
  process.exit(1);
}
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
if (!cfg.url) { console.error('config.url is empty — paste the Web App /exec URL.'); process.exit(1); }

const action = process.argv[2];
const params = process.argv[3] ? JSON.parse(process.argv[3]) : {};
if (!action) { console.error('usage: node scripts/sheet.mjs <action> \'{json}\''); process.exit(1); }

const res = await fetch(cfg.url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token: cfg.token, action, ...params }),
  redirect: 'follow',
});
const text = await res.text();
try { console.log(JSON.stringify(JSON.parse(text), null, 2)); }
catch { console.log('HTTP', res.status, '\n', text.slice(0, 800)); }
