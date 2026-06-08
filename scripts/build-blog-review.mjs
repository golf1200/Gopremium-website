// ============================================================
// GO PREMIUM — Build a self-contained REVIEW HTML for the Insights/Blog
// content batch (5 articles + 7 images). Images embedded as base64.
// Run: node scripts/build-blog-review.mjs
// Out: content/blog/REVIEW-blog.html
// ============================================================
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..');
const BLOG = join(REPO, 'content', 'blog');
const IMG = join(BLOG, 'images');

const b64 = (p) => existsSync(p)
  ? `data:image/jpeg;base64,${readFileSync(p).toString('base64')}`
  : '';

// ---- tiny frontmatter parser ----
function parse(raw) {
  const m = raw.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n([\s\S]*)$/);
  if (!m) return { meta: {}, body: raw };
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const mm = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!mm) continue;
    let [, k, v] = mm;
    v = v.trim();
    if (v.startsWith('[')) {
      try { meta[k] = JSON.parse(v.replace(/'/g, '"')); } catch { meta[k] = v; }
    } else {
      meta[k] = v.replace(/^["']|["']$/g, '');
    }
  }
  return { meta, body: m[2] };
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function inline(s) {
  return esc(s)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

// ---- minimal markdown -> HTML (skips the first H1, used as title) ----
function mdToHtml(md) {
  const lines = md.split(/\r?\n/);
  let html = '', i = 0, h1seen = false;
  const flushList = (tag, items) => `<${tag}>${items.map(x => `<li>${inline(x)}</li>`).join('')}</${tag}>`;
  while (i < lines.length) {
    let ln = lines[i];
    if (!ln.trim()) { i++; continue; }
    // table
    if (/^\s*\|/.test(ln) && /^\s*\|/.test(lines[i + 1] || '') && /^[\s|:-]+$/.test(lines[i + 1])) {
      const head = ln.split('|').slice(1, -1).map(c => c.trim());
      i += 2; const rows = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) {
        rows.push(lines[i].split('|').slice(1, -1).map(c => c.trim())); i++;
      }
      html += `<div class="tw"><table><thead><tr>${head.map(h => `<th>${inline(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
      continue;
    }
    // headings
    let hm = ln.match(/^(#{1,4})\s+(.*)$/);
    if (hm) {
      const lvl = hm[1].length;
      if (lvl === 1 && !h1seen) { h1seen = true; i++; continue; } // title rendered separately
      html += `<h${lvl}>${inline(hm[2])}</h${lvl}>`; i++; continue;
    }
    // blockquote
    if (/^>\s?/.test(ln)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, '')); i++; }
      html += `<blockquote>${inline(buf.join(' '))}</blockquote>`; continue;
    }
    // ordered list
    if (/^\d+\.\s+/.test(ln)) {
      const buf = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) { buf.push(lines[i].replace(/^\d+\.\s+/, '')); i++; }
      html += flushList('ol', buf); continue;
    }
    // unordered list
    if (/^[-*]\s+/.test(ln)) {
      const buf = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) { buf.push(lines[i].replace(/^[-*]\s+/, '')); i++; }
      html += flushList('ul', buf); continue;
    }
    // paragraph
    const buf = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,4}\s|>|\s*\||[-*]\s|\d+\.\s)/.test(lines[i])) { buf.push(lines[i]); i++; }
    html += `<p>${inline(buf.join(' '))}</p>`;
  }
  return html;
}

const files = readdirSync(BLOG).filter(f => /^\d+.*\.md$/.test(f)).sort();
const arts = files.map(f => {
  const { meta, body } = parse(readFileSync(join(BLOG, f), 'utf8'));
  return { meta, html: mdToHtml(body), img: b64(join(IMG, (meta.image || '').replace('images/', ''))) };
});

const hero = b64(join(IMG, 'insights-hero.jpg'));
const spare = b64(join(IMG, 'unboxing.jpg'));

const cards = arts.map((a, idx) => `
  <a class="card" href="#a${idx}">
    <div class="cimg"><img src="${a.img}" alt="${esc(a.meta.title || '')}"><span class="cat">${esc(a.meta.category || '')}</span></div>
    <div class="cbody">
      <h3>${esc(a.meta.title || '')}</h3>
      <p>${esc(a.meta.excerpt || '')}</p>
      <span class="meta">⏱ ${esc(String(a.meta.readMins || 5))} นาที · 🔑 ${esc(a.meta.keyword || '')}</span>
    </div>
  </a>`).join('');

const articles = arts.map((a, idx) => `
  <article class="art" id="a${idx}">
    <div class="ahero"><img src="${a.img}" alt="${esc(a.meta.title || '')}"></div>
    <div class="awrap">
      <div class="seobox">
        <b>SEO META (สำหรับใส่ใน &lt;head&gt; ต่อ route)</b>
        <div><span>slug</span><code>#/blog/${esc(a.meta.slug || '')}</code></div>
        <div><span>title tag</span><code>${esc(a.meta.seoTitle || '')}</code></div>
        <div><span>meta description</span><code>${esc(a.meta.metaDescription || '')}</code></div>
        <div><span>keyword หลัก</span><code>${esc(a.meta.keyword || '')}</code></div>
        <div><span>keyword รอง</span><code>${esc((a.meta.secondaryKeywords || []).join(' · '))}</code></div>
      </div>
      <span class="eyebrow">● ${esc(a.meta.category || '')}</span>
      <h1>${esc(a.meta.title || '')}</h1>
      <div class="body">${a.html}</div>
    </div>
  </article>`).join('');

const html = `<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>GO PREMIUM · รีวิวคอนเทนต์ Insights (5 บทความ + 7 รูป)</title>
<link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&family=Sarabun:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
:root{--navy:#1F3A5F;--navy2:#2C4F7C;--gold:#F4BD44;--gold2:#F8D586;--ink:#1A2230;--grey:#5B6472;--line:#E3E7ED;--cloud:#F5F6F8;}
*{box-sizing:border-box}body{margin:0;font-family:'Sarabun',sans-serif;color:var(--ink);background:#fff;line-height:1.75}
h1,h2,h3,h4,.eyebrow{font-family:'Kanit',sans-serif;line-height:1.2;letter-spacing:-.01em}
a{color:var(--navy);text-decoration:none}.body a{color:#C28A0E;border-bottom:1px solid rgba(194,138,14,.35)}
.wrap{max-width:980px;margin:0 auto;padding:0 22px}
.topbar{background:var(--navy);color:#fff;padding:9px 0;font-size:13px;text-align:center;font-family:'Kanit'}
.topbar b{color:var(--gold)}
.hero{position:relative;color:#fff;text-align:center;padding:74px 22px 80px;background:linear-gradient(180deg,rgba(31,58,95,.86),rgba(22,41,63,.94)),url('${hero}') center/cover}
.hero .eyebrow{color:var(--gold);font-size:14px;letter-spacing:.14em;text-transform:uppercase}
.hero h1{font-size:clamp(30px,5vw,48px);margin:14px 0 12px;font-weight:700}
.hero p{max-width:60ch;margin:0 auto;color:#D8E0EC;font-size:17px}
.kpis{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-top:26px}
.kpi{background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.2);border-radius:14px;padding:12px 20px;backdrop-filter:blur(6px)}
.kpi b{display:block;font-family:'Kanit';font-size:24px;color:var(--gold)}.kpi span{font-size:12.5px;color:#cfd8e6}
.sec{padding:54px 0}.sec.alt{background:var(--cloud)}
.shead{margin-bottom:26px}.shead .eyebrow{color:#C28A0E;font-size:13px;letter-spacing:.12em;text-transform:uppercase}
.shead h2{font-size:30px;margin:8px 0 0}.shead p{color:var(--grey);margin-top:6px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:22px}
.card{background:#fff;border:1px solid var(--line);border-radius:18px;overflow:hidden;display:flex;flex-direction:column;transition:transform .18s,box-shadow .18s}
.card:hover{transform:translateY(-4px);box-shadow:0 18px 40px -18px rgba(31,58,95,.4)}
.cimg{position:relative;aspect-ratio:16/9;overflow:hidden}.cimg img{width:100%;height:100%;object-fit:cover}
.cat{position:absolute;top:10px;left:10px;background:var(--gold);color:var(--navy);font-family:'Kanit';font-size:11.5px;font-weight:600;padding:4px 11px;border-radius:999px}
.cbody{padding:16px 18px 18px}.cbody h3{font-size:18px;margin:0 0 6px}.cbody p{color:var(--grey);font-size:14px;margin:0 0 12px}
.cbody .meta{font-size:12px;color:var(--navy2);font-family:'Kanit'}
.art{border-top:8px solid var(--cloud)}
.ahero{aspect-ratio:21/8;overflow:hidden}.ahero img{width:100%;height:100%;object-fit:cover}
.awrap{max-width:760px;margin:0 auto;padding:34px 22px 56px}
.awrap .eyebrow{color:#C28A0E;font-size:13px;letter-spacing:.1em;text-transform:uppercase}
.awrap h1{font-size:clamp(26px,4vw,38px);margin:10px 0 22px;font-weight:700}
.body{font-size:16.5px}.body h2{font-size:24px;margin:34px 0 10px;color:var(--navy)}.body h3{font-size:19px;margin:24px 0 8px}
.body p{margin:0 0 16px}.body ul,.body ol{margin:0 0 18px;padding-left:22px}.body li{margin:6px 0}
.body blockquote{margin:20px 0;padding:14px 20px;background:var(--gold2);border-left:4px solid var(--gold);border-radius:0 12px 12px 0;font-size:15.5px}
.body code{background:var(--cloud);padding:1px 6px;border-radius:5px;font-size:.9em}
.tw{overflow-x:auto;margin:0 0 20px}table{border-collapse:collapse;width:100%;font-size:14.5px}
th,td{border:1px solid var(--line);padding:9px 12px;text-align:left}th{background:var(--navy);color:#fff;font-family:'Kanit';font-weight:500}
tr:nth-child(even) td{background:var(--cloud)}
.seobox{background:#FBFCFE;border:1px dashed var(--navy2);border-radius:14px;padding:16px 18px;margin-bottom:26px;font-size:13px}
.seobox>b{font-family:'Kanit';color:var(--navy);display:block;margin-bottom:10px}
.seobox>div{display:grid;grid-template-columns:130px 1fr;gap:10px;padding:5px 0;border-top:1px solid var(--line)}
.seobox span{color:var(--grey);font-family:'Kanit'}.seobox code{background:transparent;color:var(--ink)}
.foot{background:var(--navy);color:#cfd8e6;text-align:center;padding:40px 22px;font-size:13.5px}
.foot b{color:var(--gold);font-family:'Kanit'}
.gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}
.gallery figure{margin:0}.gallery img{width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:12px;border:1px solid var(--line)}
.gallery figcaption{font-size:11.5px;color:var(--grey);margin-top:5px;text-align:center;font-family:'Kanit'}
</style></head><body>
<div class="topbar">GO PREMIUM · รีวิวคอนเทนต์ชุด <b>Insights / บทความ &amp; ไอเดีย</b> — 5 บทความ SEO + 7 รูปฟรี (gen เอง) · พรีวิวก่อนขึ้นเว็บจริง</div>

<header class="hero">
  <div class="eyebrow">Content batch · มิ.ย. 2026</div>
  <h1>บทความ &amp; ไอเดีย — Insights Hub</h1>
  <p>ช่อง content ใหม่สำหรับ SEO ของ GO PREMIUM ที่เว็บยังไม่มี — รวม 5 บทความเจาะคีย์เวิร์ด B2B ของขวัญองค์กร พร้อม internal link เข้าแคตตาล็อก/โอกาส/งบ</p>
  <div class="kpis">
    <div class="kpi"><b>5</b><span>บทความ SEO</span></div>
    <div class="kpi"><b>7</b><span>รูป gen ฟรี</span></div>
    <div class="kpi"><b>~3,200</b><span>คำ (ไทย)</span></div>
    <div class="kpi"><b>#/blog</b><span>route ที่เสนอ</span></div>
  </div>
</header>

<section class="sec"><div class="wrap">
  <div class="shead"><span class="eyebrow">● บทความทั้งหมด</span><h2>5 บทความพร้อมขึ้น</h2><p>คลิกการ์ดเพื่อกระโดดไปอ่านฉบับเต็มด้านล่าง — แต่ละบทความมีกล่อง SEO META กำกับ</p></div>
  <div class="grid">${cards}</div>
</div></section>

<section class="sec alt"><div class="wrap">
  <div class="shead"><span class="eyebrow">● ภาพประกอบ</span><h2>7 รูปที่ generate (ฟรี)</h2><p>โทน navy + gold ตรง Brand Book · 1280×720 · ไม่มีตัวอักษร · พร้อมใช้เป็น header / OG image</p></div>
  <div class="gallery">
    <figure><img src="${arts[0]?.img}"><figcaption>newyear-2026</figcaption></figure>
    <figure><img src="${arts[1]?.img}"><figcaption>logo-printing</figcaption></figure>
    <figure><img src="${arts[2]?.img}"><figcaption>by-budget</figcaption></figure>
    <figure><img src="${arts[3]?.img}"><figcaption>eco-gift</figcaption></figure>
    <figure><img src="${arts[4]?.img}"><figcaption>event-souvenir</figcaption></figure>
    <figure><img src="${hero}"><figcaption>insights-hero</figcaption></figure>
    <figure><img src="${spare}"><figcaption>unboxing (สำรอง/OG)</figcaption></figure>
  </div>
</div></section>

${articles}

<div class="foot">
  จัดทำโดย <b>GO PREMIUM</b> content pipeline · ไฟล์ต้นฉบับ Markdown อยู่ที่ <b>website/content/blog/</b> · รูปที่ <b>website/content/blog/images/</b><br>
  แผน SEO + วิธีต่อ route <b>#/blog</b> เข้ากับ v2.html อยู่ที่ <b>website/docs/SEO-CONTENT-PLAN.md</b>
</div>
</body></html>`;

const out = join(BLOG, 'REVIEW-blog.html');
writeFileSync(out, html);
console.log(`OK -> ${out} (${(html.length / 1024).toFixed(0)} KB, ${arts.length} articles)`);
