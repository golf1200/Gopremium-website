// One gallery of EVERY AI-generated result this session, grouped + labelled.
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const S = join(ROOT, 'scripts', 'image-pipeline', 'staged');
const AB = join(S, 'studio-ab'), PUB = join(S, 'express-publish'), WM = join(S, 'watermark-test');
const OUT = join(ROOT, 'express-realphoto-2026', 'ALL-RESULTS.html');

const NAME = { EX001:'เสื้อยืด',EX004:'ขวดใส',EX006:'แก้วพร้อมปลอก',EX008:'หมวก',EX010:'ร่ม',EX020:'พาวเวอร์แบงก์',EX022:'พัดลม',EX044:'โปโล',EX048:'ผ้ากันเปื้อน',EX056:'กระเป๋า',EX058:'ร่มพับ' };
// SKUs whose gemini-1 is the LATEST brand-safe pilot (overwrote the older A/B gemini)
const PILOT = new Set(['EX001','EX006','EX008','EX048','EX044','EX056','EX058']);

async function thumb(p,px=300){ if(!existsSync(p))return null; const b=await sharp(p).resize(px,px,{fit:'inside'}).jpeg({quality:72}).toBuffer(); return 'data:image/jpeg;base64,'+b.toString('base64'); }
const kb = (p)=>Math.round(statSync(p).size/1024);
const fig = async (p,cap,hot)=> p&&existsSync(p)?`<figure class="${hot?'hot':''}"><img src="${await thumb(p)}"><figcaption>${cap}<br><i>${kb(p)}KB</i></figcaption></figure>`:'';

// Section 1: per-SKU latest results (gemini + flux)
const skus = readdirSync(AB).filter(d=>/^EX/.test(d)).sort();
let s1='';
for (const sku of skus) {
  const g=join(AB,sku,'gemini-1.jpg'), f=join(AB,sku,'kontext-pro-1.jpg');
  const gl = PILOT.has(sku) ? 'Gemini · brand-safe ล่าสุด' : 'Gemini';
  let cells = await fig(g, gl, PILOT.has(sku)) + await fig(f,'Flux Kontext');
  if (cells) s1 += `<div class="grp"><div class="gh">${sku} · ${NAME[sku]||''}</div><div class="strip">${cells}</div></div>`;
}
// Section 2: published
let s2='';
for (const f of (existsSync(PUB)?readdirSync(PUB).filter(x=>/^EX\d+\.jpg$/.test(x)).sort():[]))
  s2 += await fig(join(PUB,f), f.replace('.jpg',''), false);
// Section 3: watermark variants
let s3='';
for (const f of (existsSync(WM)?readdirSync(WM).filter(x=>/\.jpg$/.test(x)).sort():[]))
  s3 += await fig(join(WM,f), f.replace(/kontext-pro-1-?|\.jpg/g,'')||'original', false);

const html=`<!doctype html><meta charset=utf-8><title>GO PREMIUM — All AI Results</title><style>
 :root{--navy:#13244a;--gold:#f4b223}body{margin:0;background:#eceae4;font-family:"IBM Plex Sans Thai",system-ui;color:var(--navy)}
 header{background:var(--navy);color:#fff;padding:22px 28px}header h1{margin:0;font-size:19px}header h1 b{color:var(--gold)}header p{margin:7px 0 0;font-size:13px;opacity:.85}
 .wrap{max-width:1080px;margin:0 auto;padding:16px}
 h2{font-size:16px;margin:20px 6px 6px}h2 b{color:var(--gold)}
 .grp{background:#fff;border-radius:12px;padding:12px 14px;margin:10px 0;box-shadow:0 2px 10px rgba(19,36,74,.07)}
 .gh{font-weight:700;font-size:14px;margin-bottom:8px}
 .strip{display:flex;gap:12px;flex-wrap:wrap}.flat{display:flex;gap:12px;flex-wrap:wrap;background:#fff;border-radius:12px;padding:14px;box-shadow:0 2px 10px rgba(19,36,74,.07)}
 figure{margin:0}figure img{width:165px;height:165px;object-fit:cover;border-radius:9px;display:block;background:#f4f1ea}
 figure.hot img{outline:3px solid var(--gold)}figcaption{font-size:11px;color:#5b647a;text-align:center;margin-top:4px}figcaption i{color:#9aa1b2;font-style:normal;font-size:10px}
</style>
<header><h1>GO <b>PREMIUM</b> — รูป AI ที่ทำทั้งหมดในเซสชันนี้</h1>
<p>รวมทุก Result · กรอบทอง = เวอร์ชั่น brand-safe ล่าสุด (จาก pilot) · ใช้ไปรวม ~฿36.5</p></header>
<div class="wrap">
 <h2>1) ผลล่าสุดต่อ SKU — <b>Gemini vs Flux</b> (รวม A/B + pilot)</h2>${s1}
 <h2>2) <b>7 ตัวที่ขึ้นเว็บแล้ว</b> (Flux + ลายน้ำ V3)</h2><div class="flat">${s2}</div>
 <h2>3) ทดสอบลายน้ำ (บนขวด EX004)</h2><div class="flat">${s3}</div>
 <p style="font-size:12px;color:#5b647a;margin:16px 6px">หมายเหตุ: รูป Gemini ของ EX001/006/008/044/048/056/058 = เวอร์ชั่น brand-safe ล่าสุด (เขียนทับ A/B เดิม) · Flux = จาก A/B รอบแรก · รูป v1 ก่อน pilot รอบ 2 ถูกเขียนทับไปแล้ว (เหลือ EX001 ใน ROUNDS-ACCOUNTING.html)</p>
</div>`;
writeFileSync(OUT,html);
console.log('wrote',OUT,'('+Math.round(readFileSync(OUT).length/1024)+'KB)');
