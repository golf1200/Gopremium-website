// ============================================================
// GO PREMIUM — Pre-render the Insights/Blog to crawlable static HTML.
// Reads content/blog/*.md → writes:
//   public/blog/index.html                 (listing)
//   public/blog/<slug>/index.html          (each article, with JSON-LD + meta)
//   public/blog/<image>.jpg                (copied headers)
// Path routes are served by Vercel as real files (before the SPA rewrite),
// so crawlers get full <title>/<meta>/content. Hash links (#/..) are rewritten
// to root-absolute (/#/..) so they target the SPA at "/".
// Run: node scripts/build-blog-static.mjs
// ============================================================
import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..');
const SRC = join(REPO, 'content', 'blog');
const IMG_SRC = join(SRC, 'images');
const OUT = join(REPO, 'public', 'blog');

const DOMAIN = 'https://www.xn--22ck4b1ansahhp4gvdtab7n8e.com'; // canonical (per src/config.js siteUrl)
const GA = 'G-JTMVQM245Y';

// ---------- frontmatter + markdown ----------
function parse(raw) {
  const m = raw.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n([\s\S]*)$/);
  const meta = {};
  if (m) for (const line of m[1].split(/\r?\n/)) {
    const mm = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/); if (!mm) continue;
    let [, k, v] = mm; v = v.trim();
    if (v.startsWith('[')) { try { meta[k] = JSON.parse(v.replace(/'/g, '"')); } catch { meta[k] = v; } }
    else meta[k] = v.replace(/^["']|["']$/g, '');
  }
  return { meta, body: m ? m[2] : raw };
}
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = (s = '') => esc(s).replace(/"/g, '&quot;');
const fixUrl = (u) => u.startsWith('#/') ? '/' + u : u;          // hash link → root-absolute
function inline(s) {
  return esc(s)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, t, u) => `<a href="${escAttr(fixUrl(u))}">${t}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}
function mdToHtml(md) {
  const L = md.split(/\r?\n/); let html = '', i = 0, h1 = false;
  const list = (t, it) => `<${t}>${it.map(x => `<li>${inline(x)}</li>`).join('')}</${t}>`;
  while (i < L.length) {
    let ln = L[i];
    if (!ln.trim()) { i++; continue; }
    if (/^\s*\|/.test(ln) && /^[\s|:-]+$/.test(L[i + 1] || '') && /^\s*\|/.test(L[i + 1] || '')) {
      const head = ln.split('|').slice(1, -1).map(c => c.trim()); i += 2; const rows = [];
      while (i < L.length && /^\s*\|/.test(L[i])) { rows.push(L[i].split('|').slice(1, -1).map(c => c.trim())); i++; }
      html += `<div class="tw"><table><thead><tr>${head.map(h => `<th>${inline(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`; continue;
    }
    const hm = ln.match(/^(#{1,4})\s+(.*)$/);
    if (hm) { const lv = hm[1].length; if (lv === 1 && !h1) { h1 = true; i++; continue; } html += `<h${lv}>${inline(hm[2])}</h${lv}>`; i++; continue; }
    if (/^>\s?/.test(ln)) { const b = []; while (i < L.length && /^>\s?/.test(L[i])) { b.push(L[i].replace(/^>\s?/, '')); i++; } html += `<blockquote>${inline(b.join(' '))}</blockquote>`; continue; }
    if (/^\d+\.\s+/.test(ln)) { const b = []; while (i < L.length && /^\d+\.\s+/.test(L[i])) { b.push(L[i].replace(/^\d+\.\s+/, '')); i++; } html += list('ol', b); continue; }
    if (/^[-*]\s+/.test(ln)) { const b = []; while (i < L.length && /^[-*]\s+/.test(L[i])) { b.push(L[i].replace(/^[-*]\s+/, '')); i++; } html += list('ul', b); continue; }
    const b = []; while (i < L.length && L[i].trim() && !/^(#{1,4}\s|>|\s*\||[-*]\s|\d+\.\s)/.test(L[i])) { b.push(L[i]); i++; }
    html += `<p>${inline(b.join(' '))}</p>`;
  }
  return html;
}

// ---------- load articles ----------
const files = readdirSync(SRC).filter(f => /^\d+.*\.md$/.test(f)).sort();
const arts = files.map(f => {
  const { meta, body } = parse(readFileSync(join(SRC, f), 'utf8'));
  return { ...meta, imgName: (meta.image || '').replace('images/', ''), html: mdToHtml(body) };
});

// ---------- shared chrome ----------
const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&family=Sarabun:wght@300;400;500;600&display=swap" rel="stylesheet">`;
const GTAG = `<script async src="https://www.googletagmanager.com/gtag/js?id=${GA}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA}');</script>`;
const CSS = `<style>
:root{--navy:#1F3A5F;--navy2:#2C4F7C;--gold:#F4BD44;--gold2:#F8D586;--golddeep:#C28A0E;--ink:#1A2230;--grey:#5B6472;--line:#E3E7ED;--cloud:#F5F6F8;--maxw:1160px;--gut:clamp(20px,5vw,56px)}
*{box-sizing:border-box}body{margin:0;font-family:'Sarabun',sans-serif;color:var(--ink);background:#fff;line-height:1.75;-webkit-font-smoothing:antialiased}
h1,h2,h3,h4,.eyebrow,.btn,.brand{font-family:'Kanit',sans-serif;line-height:1.18;letter-spacing:-.01em}
img{display:block;max-width:100%}a{color:inherit;text-decoration:none}
.wrap{max-width:var(--maxw);margin:0 auto;padding:0 var(--gut)}
.hd{position:sticky;top:0;z-index:30;background:rgba(255,255,255,.92);backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}
.hd-row{display:flex;align-items:center;justify-content:space-between;gap:18px;height:64px}
.brand img{height:34px}.nav{display:flex;gap:22px}.nav a{font-family:'Kanit';font-weight:400;font-size:15px;color:var(--navy)}.nav a:hover{color:var(--golddeep)}
.btn{display:inline-flex;align-items:center;gap:7px;font-weight:500;font-size:14px;padding:10px 20px;border-radius:999px;border:1.5px solid transparent}
.btn-primary{background:var(--gold);color:var(--navy)}.btn-ghost{border-color:var(--line);color:var(--navy)}
@media(max-width:860px){.nav{display:none}}
.crumbs{font-size:13px;color:var(--grey);padding:18px 0}.crumbs a{color:var(--grey)}.crumbs a:hover{color:var(--golddeep)}
.hero{position:relative;aspect-ratio:21/9;max-height:420px;overflow:hidden;border-radius:0}
.hero img{width:100%;height:100%;object-fit:cover}
.eyebrow{color:var(--golddeep);font-size:13px;letter-spacing:.1em;text-transform:uppercase;display:inline-block;margin-bottom:8px}
.atitle{font-size:clamp(26px,4.2vw,40px);font-weight:700;margin:6px 0 10px;max-width:24ch}
.amETA{color:var(--grey);font-size:13.5px;font-family:'Kanit';margin-bottom:8px}
article.post{max-width:760px;margin:0 auto;padding:8px var(--gut) 10px}
.body{font-size:16.5px}.body h2{font-size:25px;color:var(--navy);margin:36px 0 10px}.body h3{font-size:19.5px;margin:26px 0 8px}
.body p{margin:0 0 16px}.body ul,.body ol{margin:0 0 18px;padding-left:22px}.body li{margin:6px 0}
.body a{color:var(--golddeep);border-bottom:1px solid rgba(194,138,14,.35)}.body a:hover{background:var(--gold2)}
.body blockquote{margin:22px 0;padding:14px 20px;background:var(--gold2);border-left:4px solid var(--gold);border-radius:0 12px 12px 0;font-size:15.5px}
.body code{background:var(--cloud);padding:1px 6px;border-radius:5px;font-size:.9em}
.tw{overflow-x:auto;margin:0 0 20px}table{border-collapse:collapse;width:100%;font-size:14.5px}
th,td{border:1px solid var(--line);padding:9px 12px;text-align:left}th{background:var(--navy);color:#fff;font-family:'Kanit';font-weight:500}tr:nth-child(even) td{background:var(--cloud)}
.ctaband{background:var(--navy);color:#fff;border-radius:24px;padding:34px;margin:38px auto;max-width:760px;text-align:center}
.ctaband h3{font-size:24px;margin:0 0 6px}.ctaband p{color:#cfd8e6;margin:0 0 16px}
.related{max-width:1000px;margin:46px auto 0;padding:0 var(--gut)}
.rgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:20px;margin-top:18px}
.rcard{border:1px solid var(--line);border-radius:16px;overflow:hidden;background:#fff;transition:transform .18s,box-shadow .18s}.rcard:hover{transform:translateY(-4px);box-shadow:0 18px 40px -18px rgba(31,58,95,.4)}
.rcard .im{aspect-ratio:16/9;overflow:hidden}.rcard img{width:100%;height:100%;object-fit:cover}
.rcard .bd{padding:13px 15px 16px}.rcard h4{font-size:16px;margin:0 0 4px}.rcard span{font-size:11.5px;color:var(--golddeep);font-family:'Kanit'}
.idxhero{background:linear-gradient(180deg,#fff,var(--cloud));padding:46px 0 30px;text-align:center}
.idxhero h1{font-size:clamp(28px,5vw,46px);font-weight:700;margin:8px 0 8px}.idxhero p{color:var(--grey);max-width:60ch;margin:0 auto}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:24px;padding:34px 0 60px}
.card{border:1px solid var(--line);border-radius:18px;overflow:hidden;background:#fff;display:flex;flex-direction:column;transition:transform .18s,box-shadow .18s}.card:hover{transform:translateY(-5px);box-shadow:0 20px 44px -18px rgba(31,58,95,.42)}
.card .im{position:relative;aspect-ratio:16/9;overflow:hidden}.card img{width:100%;height:100%;object-fit:cover}
.card .cat{position:absolute;top:10px;left:10px;background:var(--gold);color:var(--navy);font-family:'Kanit';font-size:11.5px;font-weight:600;padding:4px 11px;border-radius:999px}
.card .bd{padding:16px 18px 20px}.card h2{font-size:19px;margin:0 0 7px}.card p{color:var(--grey);font-size:14px;margin:0 0 12px}.card .mt{font-size:12px;color:var(--navy2);font-family:'Kanit'}
.ft{background:var(--navy);color:#cfd8e6;margin-top:50px}.ft .wrap{padding:40px var(--gut)}
.ft-grid{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:30px}.ft h4{color:#fff;font-size:15px;margin:0 0 12px}.ft a{color:#cfd8e6}.ft a:hover{color:var(--gold)}.ft ul{list-style:none;padding:0;margin:0}.ft li{margin:7px 0;font-size:14px}
.ft .bot{border-top:1px solid rgba(255,255,255,.12);padding:16px var(--gut);font-size:12.5px;text-align:center;color:#9fb0c6}
.fab{position:fixed;right:18px;bottom:18px;background:#06C755;color:#fff;border-radius:999px;padding:12px 18px;font-family:'Kanit';font-weight:500;box-shadow:0 12px 30px -8px rgba(6,199,85,.6);z-index:40}
@media(max-width:720px){.ft-grid{grid-template-columns:1fr 1fr}}
</style>`;

const header = `<header class="hd"><div class="wrap hd-row">
<a class="brand" href="/" aria-label="GO PREMIUM"><img src="/logo.png" alt="GO PREMIUM" onerror="this.onerror=null;this.src='/icon.png'"></a>
<nav class="nav"><a href="/">หน้าแรก</a><a href="/#/express">⚡ สินค้าส่งด่วน</a><a href="/#/all">สินค้าทั้งหมด</a><a href="/#/portfolio">ผลงานของเรา</a><a href="/blog" style="color:var(--golddeep)">บทความ &amp; ไอเดีย</a><a href="/#/about">เกี่ยวกับเรา</a></nav>
<a class="btn btn-primary" href="/#/quote">ขอใบเสนอราคา</a>
</div></header>`;

const footer = `<footer class="ft"><div class="wrap"><div class="ft-grid">
<div><img src="/logo-white.png" alt="GO PREMIUM" style="height:34px;margin-bottom:12px" onerror="this.onerror=null;this.src='/icon-white.png'"><p style="font-size:14px;max-width:42ch">GO PREMIUM โดย Passion Grow Trading — ออกแบบและผลิตของพรีเมียมและของขวัญองค์กร ครบตั้งแต่คอนเซ็ปต์ ดีไซน์ ผลิต ถึงส่งมอบ</p></div>
<div><h4>บริษัท</h4><ul><li><a href="/#/about">เรื่องราวแบรนด์</a></li><li><a href="/#/portfolio">ผลงานของเรา</a></li><li><a href="/blog">บทความ &amp; ไอเดีย</a></li><li><a href="/#/all">สินค้าทั้งหมด</a></li><li><a href="/#/quote">ขอใบเสนอราคา</a></li></ul></div>
<div><h4>ติดต่อเรา</h4><ul><li><a href="tel:+6620966465">โทร 02-096-6465</a></li><li><a href="tel:+66818872627">081-887-2627 (คุณแป้ง)</a></li><li><a href="mailto:info@passiongrow.co.th">info@passiongrow.co.th</a></li><li><a href="https://lin.ee/z1GT1KR" target="_blank" rel="noopener">LINE @gopremium</a></li></ul></div>
</div></div><div class="bot">© 2026 GO PREMIUM · PASSION GROW TRADING CO., LTD. (Tax ID 0105567196422) · ผลิตในกรุงเทพฯ ด้วย 💖</div></footer>
<a class="fab" href="https://lin.ee/z1GT1KR" target="_blank" rel="noopener">💬 แชทกับเรา</a>`;

const ctaBand = `<div class="ctaband"><h3>พร้อมเริ่มของขวัญชิ้นต่อไปแล้วหรือยัง</h3><p>ปรึกษาฟรี ตอบกลับพร้อมราคาใน 2 ชม. · มี Mockup ก่อนผลิตทุกออเดอร์</p><a class="btn btn-primary" href="/#/quote">ขอใบเสนอราคา →</a></div>`;

const pageUrl = (slug) => `${DOMAIN}/blog/${encodeURIComponent(slug)}`;
const imgUrl = (name) => `${DOMAIN}/blog/${name}`;

// ---------- article pages ----------
mkdirSync(OUT, { recursive: true });
for (const a of arts) {
  const related = arts.filter(x => x.slug !== a.slug).slice(0, 3);
  const kw = [a.keyword, ...(Array.isArray(a.secondaryKeywords) ? a.secondaryKeywords : [])].filter(Boolean).join(', ');
  const ld = {
    '@context': 'https://schema.org', '@type': 'BlogPosting',
    headline: a.seoTitle || a.title, description: a.metaDescription || a.excerpt,
    image: imgUrl(a.imgName), datePublished: a.date, dateModified: a.date, inLanguage: 'th-TH',
    keywords: kw, author: { '@type': 'Organization', name: 'GO PREMIUM' },
    publisher: { '@type': 'Organization', name: 'PASSION GROW TRADING CO., LTD.', logo: { '@type': 'ImageObject', url: `${DOMAIN}/logo.png` } },
    mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl(a.slug) },
  };
  const crumb = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'หน้าแรก', item: `${DOMAIN}/` },
      { '@type': 'ListItem', position: 2, name: 'บทความ & ไอเดีย', item: `${DOMAIN}/blog` },
      { '@type': 'ListItem', position: 3, name: a.title, item: pageUrl(a.slug) },
    ],
  };
  const html = `<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escAttr(a.seoTitle || a.title)}</title>
<meta name="description" content="${escAttr(a.metaDescription || a.excerpt)}">
<link rel="canonical" href="${pageUrl(a.slug)}">
<meta name="robots" content="index,follow">
<meta property="og:type" content="article"><meta property="og:title" content="${escAttr(a.seoTitle || a.title)}"><meta property="og:description" content="${escAttr(a.metaDescription || a.excerpt)}"><meta property="og:image" content="${imgUrl(a.imgName)}"><meta property="og:url" content="${pageUrl(a.slug)}"><meta property="og:locale" content="th_TH"><meta property="og:site_name" content="GO PREMIUM">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.png">${FONTS}${GTAG}${CSS}
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<script type="application/ld+json">${JSON.stringify(crumb)}</script>
</head><body>
${header}
<div class="wrap"><div class="crumbs"><a href="/">หน้าแรก</a> / <a href="/blog">บทความ &amp; ไอเดีย</a> / ${esc(a.title)}</div></div>
<div class="hero"><img src="/blog/${a.imgName}" alt="${escAttr((a.keyword || '') + ' — ' + a.title)}"></div>
<article class="post">
<span class="eyebrow">${esc(a.category || '')}</span>
<div class="amETA">📅 ${esc(a.date)} · ⏱ อ่าน ${esc(String(a.readMins || 6))} นาที</div>
<h1 class="atitle">${esc(a.title)}</h1>
<div class="body">${a.html}</div>
${ctaBand}
</article>
<section class="related"><h2 style="font-size:24px">บทความที่เกี่ยวข้อง</h2><div class="rgrid">${related.map(r => `<a class="rcard" href="/blog/${encodeURIComponent(r.slug)}"><div class="im"><img src="/blog/${r.imgName}" alt="${escAttr(r.title)}" loading="lazy"></div><div class="bd"><span>${esc(r.category || '')}</span><h4>${esc(r.title)}</h4></div></a>`).join('')}</div></section>
${footer}
</body></html>`;
  const dir = join(OUT, a.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html);
}

// ---------- index page ----------
const idxLd = {
  '@context': 'https://schema.org', '@type': 'Blog', name: 'บทความ & ไอเดีย — GO PREMIUM',
  url: `${DOMAIN}/blog`, inLanguage: 'th-TH',
  blogPost: arts.map(a => ({ '@type': 'BlogPosting', headline: a.seoTitle || a.title, url: pageUrl(a.slug), datePublished: a.date, image: imgUrl(a.imgName) })),
};
const idx = `<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>บทความ &amp; ไอเดีย ของขวัญองค์กร & ของพรีเมียม | GO PREMIUM</title>
<meta name="description" content="รวมบทความและไอเดียเรื่องของขวัญองค์กร ของพรีเมียมพิมพ์โลโก้ การเลือกของตามงบ และเทรนด์ของขวัญรักษ์โลก จากทีม GO PREMIUM">
<link rel="canonical" href="${DOMAIN}/blog">
<meta property="og:type" content="website"><meta property="og:title" content="บทความ & ไอเดีย ของขวัญองค์กร | GO PREMIUM"><meta property="og:description" content="คู่มือเลือกของขวัญองค์กร ของพรีเมียมพิมพ์โลโก้ และไอเดียจัดเซ็ตตามงบ"><meta property="og:image" content="${imgUrl('insights-hero.jpg')}"><meta property="og:url" content="${DOMAIN}/blog"><meta property="og:site_name" content="GO PREMIUM">
<link rel="icon" href="/favicon.png">${FONTS}${GTAG}${CSS}
<script type="application/ld+json">${JSON.stringify(idxLd)}</script>
</head><body>
${header}
<section class="idxhero"><div class="wrap"><span class="eyebrow">Insights · บทความ & ไอเดีย</span><h1>ไอเดีย & ความรู้เรื่องของขวัญองค์กร</h1><p>คู่มือเลือกของ เทคนิคพิมพ์โลโก้ การจัดเซ็ตตามงบ และเทรนด์ของพรีเมียม — อัปเดตจากทีม GO PREMIUM</p></div></section>
<div class="wrap"><div class="grid">${arts.map(a => `<a class="card" href="/blog/${encodeURIComponent(a.slug)}"><div class="im"><img src="/blog/${a.imgName}" alt="${escAttr(a.title)}" loading="lazy"><span class="cat">${esc(a.category || '')}</span></div><div class="bd"><h2>${esc(a.title)}</h2><p>${esc(a.excerpt || '')}</p><span class="mt">⏱ ${esc(String(a.readMins || 6))} นาที · ${esc(a.keyword || '')}</span></div></a>`).join('')}</div></div>
${footer}
</body></html>`;
writeFileSync(join(OUT, 'index.html'), idx);

// ---------- copy images ----------
let copied = 0;
for (const f of readdirSync(IMG_SRC).filter(f => /\.jpe?g$/i.test(f))) {
  copyFileSync(join(IMG_SRC, f), join(OUT, f)); copied++;
}

console.log(`OK: ${arts.length} articles + index + ${copied} images → public/blog/`);
console.log('Articles:', arts.map(a => a.slug).join(' | '));
