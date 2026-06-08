# GO PREMIUM — SEO Content Plan: "บทความ & ไอเดีย" (Insights / Blog)

> Planning spec for adding an editorial/blog section to the live homepage SPA
> (`public/v2.html`). All routes are **hash routes** rendered client-side by the
> `render()` function (search `===== router =====`, ~line 908). Brand: GO PREMIUM
> by PASSION GROW TRADING CO., LTD. Canonical domain (per `src/config.js` →
> `sitemap.xml`): `https://www.xn--22ck4b1ansahhp4gvdtab7n8e.com`.
>
> Status note: articles **01–03 exist** in `content/blog/` and are read from their
> frontmatter below. Articles **04–05** are still being drafted — their rows are
> marked _(frontmatter pending)_ and must be reconciled against the real frontmatter
> when the files land.

---

## 1. Content-gap analysis

### Existing routes / sections (from `render()` in `public/v2.html`)

| Hash route | View fn | Purpose | Indexable content type |
|---|---|---|---|
| `#/` | `viewHome()` | Homepage: hero, trust, services, occasions, budgets, categories, how-it-works, featured, cases, reviews, about, CTA, quote | Commercial landing |
| `#/all` | `viewCatalogue('all')` | Full catalogue grid | Product listing |
| `#/c/<cat>` | `viewCatalogue({cat})` | Category listing (drinkware, bags, stationery, giftset…) | Product listing |
| `#/o/<occ>` | `viewCatalogue({occ})` | Occasion listing (newyear, welcome, vip, event, eco, milestone) | Product listing |
| `#/b/<tier>` | `viewCatalogue({tier})` | Budget tier (value, smart, premium, executive) | Product listing |
| `#/p/<slug>` | `viewProduct(slug)` | Single product | Product detail |
| `#/about` | `viewAbout()` | Brand story | About |
| `#/portfolio` | `viewPortfolio()` | Work showcase | Social proof |
| `#/express` | `viewExpress()` | Rush / ready-to-ship 7–14 days | Commercial landing |
| `#/quote` | `viewQuote()` | RFQ form | Conversion |

### Primary gap (biggest organic-SEO opportunity)
**There is NO editorial / blog / FAQ content anywhere on the site.** Every route is
transactional (product or conversion). For a Thai B2B corporate-gifts niche, the
high-intent informational queries — "ของขวัญปีใหม่องค์กร", "พิมพ์โลโก้แบบไหนดี",
"ของขวัญองค์กรงบ 100 บาท", "ของขวัญสงกรานต์ลูกค้า", "ของชำร่วย ESG" — have **no
landing surface**. These are exactly the top-of-funnel keywords that pull HR /
marketing / procurement researchers in months before they request a quote. Adding
an Insights/Blog section is the single highest-leverage SEO move for this site.

### Secondary gaps
- **No `Article` / `BlogPosting` structured data** anywhere.
- **No FAQ content and no `FAQPage` schema** — high-value for "long-tail question"
  SERP features in Thai.
- **Thin product descriptions** on `#/p/<slug>` (no buying-guide context, no
  internal links to related occasions/budgets).
- **Sitemap ↔ router mismatch**: `generate-sitemap.js` emits **path-style** URLs
  (`/products`, `/category/<slug>`, `/occasion/<slug>`, `/product/<slug>`) but the
  live SPA serves **hash routes** (`#/all`, `#/c/<slug>`, …). Crawlers indexing the
  sitemap URLs hit the SPA shell, not pre-rendered content. The blog should be added
  in a way that improves — not worsens — this (see §7).
- **No per-route `<title>` / `<meta description>`** — the `<head>` title/description
  (lines 14–15) are static for every route, so every indexed URL shares one title.

---

## 2. Recommended content slot — "บทความ & ไอเดีย"

A new Insights/Blog section with an index listing and single-article view, plus a
homepage teaser, all matching the existing hash-router pattern.

### 2.1 Router lines to add

Insert inside `render()` (the `if/else if` chain, ~lines 912–923). Place the two
new branches **before** the catch-all `else`, immediately after the `#/express`
branch, so the more-specific `/blog/<slug>` regex is tested before the bare
`/blog`:

```js
  else if(h==='/express'){app.innerHTML=viewExpress();}
  // ===== blog / insights =====
  else if((m=h.match(/^\/blog\/(.+)$/))){app.innerHTML=viewArticle(decodeURIComponent(m[1]));bindQuote();}
  else if(h==='/blog'){app.innerHTML=viewBlogIndex();}
  else if(h==='about'){app.innerHTML=viewHome();bindQuote();initHero();setTimeout(()=>{const a=document.getElementById('about');if(a)a.scrollIntoView();},60);return;}
  else{app.innerHTML=viewHome();bindQuote();}
```

Notes consistent with the observed code style:
- Match style mirrors the existing `^\/c\/(.+)$`, `^\/o\/(.+)$`, `^\/p\/(.+)$`
  patterns and reuse of the shared `let m`.
- `viewArticle()` calls `bindQuote()` because each article ends with an inline
  quote CTA (article 01 already links to `#/quote`); the index view does not need it.
- After both branches, the existing `window.scrollTo(0,0)` (line 925) already
  resets scroll — no extra code needed.
- Set per-route `document.title` / meta inside the two new view fns (see §5).

### 2.2 Backing data + view functions (new, additive)

Add a `BLOG` array near the other top-level data arrays (e.g. beside `OCC_FILTERS`),
one object per published article, sourced from each file's frontmatter:

```js
// ===== blog index — one entry per published article (mirror of content/blog/*.md frontmatter) =====
const BLOG=[
  {slug:'ของขวัญปีใหม่องค์กร-2026', title:'ของขวัญปีใหม่องค์กร 2026: คู่มือเลือกของพรีเมียมให้พนักงานและลูกค้า',
   excerpt:'ใกล้สิ้นปีทีไร ฝ่าย HR และการตลาดก็ต้องวุ่นกับการหาของขวัญปีใหม่องค์กร…', cat:'เทรนด์ & ไอเดีย',
   img:'blog/newyear-2026.jpg', date:'2026-06-08', mins:6},
  {slug:'ของพรีเมียมพิมพ์โลโก้', title:'ของพรีเมียมพิมพ์โลโก้: เลือกเทคนิคไหนให้แบรนด์ดูดีและคุ้มงบ',
   excerpt:'พิมพ์โลโก้บนของพรีเมียมมีหลายเทคนิค แต่ละแบบเหมาะกับวัสดุและงบไม่เหมือนกัน…', cat:'ความรู้ & เทคนิค',
   img:'blog/logo-printing.jpg', date:'2026-06-08', mins:6},
  {slug:'ของขวัญองค์กรตามงบประมาณ', title:'จัดของขวัญองค์กรตามงบ: ได้ของดูดีทุกช่วงราคา ตั้งแต่ 60 ถึง 1,000+ บาท',
   excerpt:'งบเท่าไหร่ก็มีของที่ใช่ บทความนี้แบ่งของขวัญองค์กรเป็น 4 ช่วงงบ…', cat:'เทรนด์ & ไอเดีย',
   img:'blog/by-budget.jpg', date:'2026-06-08', mins:6},
  // + articles 04, 05 when drafted
];
// article bodies: convert each .md to an HTML string (build step) keyed by slug → BLOG_HTML[slug]
```

`viewBlogIndex()` renders the `BLOG` array as cards (reuse the `.occ` / `.card`
grid markup already used by occasions/cases). `viewArticle(slug)` looks up the entry
+ body, renders H1 + content + JSON-LD (§6) + breadcrumb + the bottom quote CTA, and
falls back to `viewBlogIndex()` if the slug is unknown (mirror how `viewProduct`
handles a missing slug).

### 2.3 Nav link

Add to the desktop `<nav class="nav">` (lines 365–371), between Portfolio and About:

```html
      <a href="#/portfolio">ผลงานของเรา</a>
      <a href="#/blog">บทความ &amp; ไอเดีย</a>
      <a href="#/about">เกี่ยวกับเรา</a>
```

Add to the mobile drawer (`buildChrome()`, line 933) — insert after the portfolio link:

```js
<a href="#/portfolio">ผลงานของเรา</a><a href="#/blog">บทความ & ไอเดีย</a><a href="#/about">เกี่ยวกับเรา</a>
```

### 2.4 Footer link

In the footer "บริษัท" column (lines 393–400), add a list item:

```html
      <li><a href="#/portfolio">ผลงานของเรา</a></li>
      <li><a href="#/blog">บทความ &amp; ไอเดีย</a></li>
      <li><a href="#/all">สินค้าทั้งหมด</a></li>
```

### 2.5 Homepage teaser block (3 latest articles)

Add a new `<section>` in `viewHome()` (the big template literal, ~lines 588–659).
**Recommended placement: immediately before `${ctaBand()}`** (line 658) — i.e. after
the "ทำไมต้อง GO PREMIUM" reviews section and the about section, and just before the
final CTA band + quote form. Rationale: keeps all transactional/trust content above,
and lets the editorial teaser act as a soft "learn more / not ready to buy yet"
off-ramp right before the closing CTA, without disturbing the existing conversion
flow. It is also the lowest-risk insertion point (single append, no reflow of the
funnel sections).

```js
  <section class="sec" style="background:#fff"><div class="wrap">
    <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex-wrap:wrap;margin-bottom:38px">
      <div class="shead" style="margin-bottom:0"><span class="eyebrow"><span class="dot"></span>บทความ & ไอเดีย</span><h2 class="h2">ไอเดีย & ความรู้เรื่องของขวัญองค์กร</h2><p class="lead">คู่มือเลือกของ เทคนิคพิมพ์โลโก้ และไอเดียจัดเซ็ตตามงบ — อัปเดตจากทีม GO PREMIUM</p></div>
      <a class="btn btn-ghost" href="#/blog">ดูบทความทั้งหมด</a></div>
    <div class="g-auto occ-grid">${BLOG.slice(0,3).map(b=>`<a class="occ" href="#/blog/${encodeURIComponent(b.slug)}"><div class="im"><img src="${b.img}" alt="${esc(b.title)}" loading="lazy"></div><div class="bd"><span style="font-family:var(--head);font-size:12px;color:var(--mustard-deep)">${esc(b.cat)} · ${b.mins} นาที</span><h4>${esc(b.title)}</h4><p>${esc(b.excerpt)}</p></div></a>`).join('')}</div>
  </div></section>

  ${ctaBand()}
```

(`esc()` and `.occ`/`.g-auto`/`.shead` classes already exist and are reused here.)

---

## 3. The 5 articles

| # | Slug | SEO title (`seoTitle`) | Primary keyword | Search intent | Internal-link targets |
|---|---|---|---|---|---|
| 01 | `ของขวัญปีใหม่องค์กร-2026` | ของขวัญปีใหม่องค์กร 2026 เลือกอย่างไรให้ปัง \| GO PREMIUM | ของขวัญปีใหม่องค์กร | Informational → commercial (seasonal buying guide) | `#/b/smart`, `#/b/executive`, `#/c/giftset`, `#/c/drinkware`, `#/o/eco`, `#/c/stationery`, `#/o/vip`, `#/express`, `#/quote` |
| 02 | `ของพรีเมียมพิมพ์โลโก้` | ของพรีเมียมพิมพ์โลโก้ เลือกเทคนิคไหนให้แบรนด์ดูดีและคุ้มงบ \| GO PREMIUM | ของพรีเมียมพิมพ์โลโก้ | Informational (how-to / technique comparison) | (confirm in body) `#/c/drinkware`, `#/c/stationery`, `#/all`, `#/quote` + cross-link to 01 & 03 |
| 03 | `ของขวัญองค์กรตามงบประมาณ` | ของขวัญองค์กรตามงบ เลือกให้ดูดีทุกช่วงราคา 60–1,000 บาท \| GO PREMIUM | ของขวัญองค์กรตามงบประมาณ | Commercial investigation (budget buying guide) | `#/b/value`, `#/b/smart`, `#/b/premium`, `#/b/executive`, `#/quote` + cross-link to 01 & 02 |
| 04 | _(frontmatter pending)_ — proposed: seasonal e.g. ของขวัญสงกรานต์ / ของชำร่วยองค์กร | _(pending)_ | _(pending — proposed: ของขวัญสงกรานต์องค์กร)_ | Informational → commercial (seasonal) | proposed `#/o/event`, `#/c/umbrella`, `#/c/fan`, `#/quote` |
| 05 | _(frontmatter pending)_ — proposed: ESG/eco or Welcome Kit | _(pending)_ | _(pending — proposed: ของขวัญองค์กรรักษ์โลก ESG / Welcome Kit พนักงานใหม่)_ | Informational → commercial | proposed `#/o/eco`, `#/o/welcome`, `#/c/lifestyle`, `#/c/bags`, `#/quote` |

> **Action when 04/05 land:** copy `slug`, `seoTitle`, `keyword`,
> `secondaryKeywords` from their frontmatter into this table, the `BLOG` array (§2.2)
> and the keyword map (§4), and replace the proposed values.

---

## 4. Keyword map

| # | Primary keyword | Secondary keywords (from `secondaryKeywords`) |
|---|---|---|
| 01 | ของขวัญปีใหม่องค์กร | ของขวัญปีใหม่พนักงาน · ของขวัญปีใหม่ลูกค้า · ของพรีเมียมปีใหม่ 2026 · กิฟต์เซ็ตปีใหม่องค์กร |
| 02 | ของพรีเมียมพิมพ์โลโก้ | พิมพ์โลโก้บนกระบอกน้ำ · สกรีนโลโก้ของพรีเมียม · เลเซอร์สลักโลโก้ · ของแจกพิมพ์โลโก้องค์กร |
| 03 | ของขวัญองค์กรตามงบประมาณ | ของขวัญองค์กรงบน้อย · ของพรีเมียมงบ 100 บาท · ของขวัญลูกค้างบ 300 บาท · ของขวัญผู้บริหารงบสูง |
| 04 | _(pending — proposed: ของขวัญสงกรานต์องค์กร)_ | _(pending)_ |
| 05 | _(pending — proposed: ของขวัญองค์กรรักษ์โลก / ESG)_ | _(pending)_ |

### Cannibalization notes
- **01 vs 03** both touch budget ("ของขวัญปีใหม่ตามงบ" vs "ของขวัญองค์กรตามงบประมาณ").
  Keep them distinct by intent: **01 = seasonal/new-year framing** (timeline, occasion,
  recipient groups); **03 = evergreen budget framing** (price tiers across all
  occasions). 01 should link to 03 for the deep budget breakdown rather than
  re-ranking the budget tiers itself. Do **not** target the bare "ของขวัญองค์กรตามงบ"
  head term in 01 — reserve it for 03.
- **03 vs budget routes `#/b/<tier>`** — the article targets the informational query;
  the `#/b/*` routes target the transactional/product-listing query. Article links
  *down* to the tier routes (it is the guide; the routes are the inventory). Avoid
  duplicating the same H2 wording the budget listing pages use.
- **02 vs product pages** — 02 owns the "พิมพ์โลโก้ / เทคนิค" informational space;
  product pages own "[product] พิมพ์โลโก้" transactional space. No overlap if 02 stays
  technique-focused and links out to category routes for inventory.
- **04 (seasonal) vs 01** — keep 04 to its own season (e.g. สงกรานต์) so it does not
  compete with 01's "ปีใหม่" cluster.

---

## 5. On-page SEO checklist (per article)

Apply to every article. Targets follow Thai-SERP norms (Thai chars count toward the
pixel/length budget, so keep titles tight).

- [ ] **Title tag ≤ ~60 chars** — use the frontmatter `seoTitle` (already includes
      `| GO PREMIUM`). Verify each is ≤60; trim the brand suffix first if over.
- [ ] **Meta description ≤ ~155 chars** — use frontmatter `metaDescription`; front-load
      the primary keyword; include one benefit + soft CTA. Check 01–03 lengths and trim.
- [ ] **Single `<h1>`** — the article H1 = frontmatter `title` (article body already
      opens with `# …`). The site header must NOT render a competing H1 on this route.
- [ ] **H2/H3 carry keywords** — primary keyword in the first H2; secondary keywords
      distributed across remaining H2/H3 (01 already does this: "…มีกี่กลุ่ม",
      "เลือก…ตามงบประมาณ", "5 ไอเดีย…ที่มาแรงปี 2026", "ไทม์ไลน์สั่งผลิต…").
- [ ] **Image alt text** — descriptive Thai alt on the hero/inline images including
      the primary keyword (e.g. `alt="ของขวัญปีใหม่องค์กร 2026 กิฟต์เซ็ตพิมพ์โลโก้"`),
      not a filename.
- [ ] **Internal links 3–6** — to catalogue/occasion/budget/express/quote + at least
      one cross-link to a sibling article. (01 already has ~9 — that is fine for a long
      pillar; ensure 02–05 hit at least 3.)
- [ ] **Slug** = frontmatter `slug` (Thai, keyword-matching). Route = `#/blog/<slug>`.
      Ensure `encodeURIComponent` is applied when building/href-ing Thai slugs.
- [ ] **Excerpt/`<meta>` uniqueness** — no two articles share a description.

### Per-route head update (SPA requirement)

Because every route currently shares the static `<head>` `<title>` (line 14) and
`<meta name="description">` (line 15), add a tiny helper and call it from the new view
functions so each blog URL has a unique, crawlable title/description. Define once
(e.g. near `render()`):

```js
// ===== per-route <head> SEO (SPA) =====
function setMeta(title, desc){
  document.title=title;
  let m=document.querySelector('meta[name="description"]');
  if(!m){m=document.createElement('meta');m.name='description';document.head.appendChild(m);}
  m.setAttribute('content', desc);
  // keep canonical in sync (see §7)
  let c=document.querySelector('link[rel="canonical"]');
  if(!c){c=document.createElement('link');c.rel='canonical';document.head.appendChild(c);}
  c.href=location.href;
}
```

Call it at the top of each blog view (and ideally back-fill the other routes later):

```js
function viewBlogIndex(){
  setMeta('บทความ & ไอเดีย ของขวัญองค์กร | GO PREMIUM',
          'รวมบทความและไอเดียเรื่องของขวัญองค์กร ของพรีเมียมพิมพ์โลโก้ และการเลือกของตามงบ จากทีม GO PREMIUM');
  /* …render cards from BLOG… */
}
function viewArticle(slug){
  const b=BLOG.find(x=>x.slug===slug);
  if(!b){ return viewBlogIndex(); }
  setMeta(b.seoTitle || b.title, b.metaDescription || b.excerpt);
  /* …render H1 + body + JSON-LD + breadcrumb + quote CTA… */
}
```

(Store `seoTitle` / `metaDescription` in the `BLOG` objects so `setMeta` can use them.)
On leaving a blog route, reset to the homepage defaults inside the `#/` branch with the
same helper so the title doesn't "stick".

---

## 6. Structured data (JSON-LD)

Inject per article inside `viewArticle()` as a `<script type="application/ld+json">`
string appended to the rendered HTML. Two graphs: `BlogPosting` + `BreadcrumbList`.

### 6.1 BlogPosting template

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "{{seoTitle}}",
  "description": "{{metaDescription}}",
  "image": "https://www.xn--22ck4b1ansahhp4gvdtab7n8e.com/{{image}}",
  "datePublished": "{{date}}",
  "dateModified": "{{date}}",
  "inLanguage": "th-TH",
  "keywords": "{{keyword}}, {{secondaryKeywords joined}}",
  "author":    { "@type": "Organization", "name": "GO PREMIUM" },
  "publisher": {
    "@type": "Organization",
    "name": "PASSION GROW TRADING CO., LTD.",
    "logo": { "@type": "ImageObject", "url": "https://www.xn--22ck4b1ansahhp4gvdtab7n8e.com/logo.png" }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://www.xn--22ck4b1ansahhp4gvdtab7n8e.com/#/blog/{{slug}}"
  }
}
</script>
```

### 6.2 BreadcrumbList template

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "หน้าแรก",
      "item": "https://www.xn--22ck4b1ansahhp4gvdtab7n8e.com/" },
    { "@type": "ListItem", "position": 2, "name": "บทความ & ไอเดีย",
      "item": "https://www.xn--22ck4b1ansahhp4gvdtab7n8e.com/#/blog" },
    { "@type": "ListItem", "position": 3, "name": "{{title}}",
      "item": "https://www.xn--22ck4b1ansahhp4gvdtab7n8e.com/#/blog/{{slug}}" }
  ]
}
</script>
```

Placeholders map 1:1 to frontmatter keys (`seoTitle`, `metaDescription`, `image`,
`date`, `keyword`, `secondaryKeywords`, `slug`, `title`). Build the
`secondaryKeywords` join with `.join(', ')`.

### 6.3 FAQ (recommended)
If/when an FAQ block is added (a strong fit for this niche — "ผลิตขั้นต่ำกี่ชิ้น",
"ใช้เวลาผลิตกี่วัน", "ขอ Mockup ก่อนผลิตได้ไหม", "พิมพ์โลโก้ราคาเริ่มต้นเท่าไหร่"),
emit `FAQPage` with `mainEntity` `Question`/`acceptedAnswer` pairs — either on a
dedicated `#/faq` route or appended to the most relevant article (02 for printing FAQs).

```html
<script type="application/ld+json">
{ "@context":"https://schema.org","@type":"FAQPage","mainEntity":[
  {"@type":"Question","name":"…","acceptedAnswer":{"@type":"Answer","text":"…"}}
]}
</script>
```

---

## 7. Sitemap & robots

### New URLs to add
The blog index plus one URL per published article. With the SPA's hash routing the
canonical/listed forms are:

```
https://www.xn--22ck4b1ansahhp4gvdtab7n8e.com/#/blog
https://www.xn--22ck4b1ansahhp4gvdtab7n8e.com/#/blog/ของขวัญปีใหม่องค์กร-2026
https://www.xn--22ck4b1ansahhp4gvdtab7n8e.com/#/blog/ของพรีเมียมพิมพ์โลโก้
https://www.xn--22ck4b1ansahhp4gvdtab7n8e.com/#/blog/ของขวัญองค์กรตามงบประมาณ
   (+ 04, 05 when published)
```

### Important caveat — hash URLs are not first-class for crawlers
`generate-sitemap.js` currently emits **path-style** URLs (`/products`,
`/category/<slug>`, `/product/<slug>`) that do **not** match the SPA's hash routes —
a pre-existing mismatch. Google generally ignores the `#fragment` for indexing, so
hash-only blog URLs will be weak. **Recommended approach, best → acceptable:**

1. **Best — pre-render the blog to static HTML.** Generate
   `public/blog/index.html` and `public/blog/<slug>/index.html` at build time from
   `content/blog/*.md` (the `BLOG` data + body HTML), each with its own real
   `<title>`, `<meta description>`, canonical, and the §6 JSON-LD baked in. Then list
   the **path** URLs (`/blog`, `/blog/<slug>`) in the sitemap. These are fully
   crawlable and decouple SEO from client-side rendering. Add a small redirect/boot so
   the SPA hash route and the static path render the same content.
2. **Acceptable interim** — extend `generate-sitemap.js` to append the `/blog` and
   `/blog/<slug>` **path** URLs (consistent with how it already lists `/products`,
   `/category/*`) and ensure the SPA can resolve those paths (or 200-serve the shell).

### Wiring into `generate-sitemap.js`
Mirror the existing arrays/`url()` helper. Add an `ARTICLES` constant sourced from
`content/blog` (slug + lastmod from `date`) and splice blog URLs into `lines`:

```js
const ARTICLES = ['ของขวัญปีใหม่องค์กร-2026','ของพรีเมียมพิมพ์โลโก้','ของขวัญองค์กรตามงบประมาณ'];
// …inside `lines`, after the /quote line:
url('/blog', '0.8', 'weekly'),
'',
'  <!-- Blog / Insights -->',
...ARTICLES.map((s) => url(`/blog/${s}`, '0.7', 'monthly')),
```

`robots.txt` is auto-generated by the same script and already `Allow: /` + points at
`/sitemap.xml`; no change needed beyond re-running the script. (URL-encode Thai slugs
in `<loc>` per sitemap spec.)

---

## 8. Internal-linking plan

### Blog → money pages (down-funnel)
Each article links to the catalogue/occasion/budget/express/quote routes relevant to
its topic (already true in 01). Mapping:

| Article topic | Links into |
|---|---|
| New Year (01) | `#/c/giftset`, `#/c/drinkware`, `#/c/stationery`, `#/o/eco`, `#/o/vip`, `#/b/smart`, `#/b/executive`, `#/express`, `#/quote` |
| Logo printing (02) | `#/c/drinkware`, `#/c/stationery`, `#/all`, `#/quote` |
| By budget (03) | `#/b/value`, `#/b/smart`, `#/b/premium`, `#/b/executive`, `#/quote` |
| Seasonal (04, pending) | `#/o/event`, `#/c/umbrella`, `#/c/fan`, `#/quote` |
| ESG / Welcome (05, pending) | `#/o/eco`, `#/o/welcome`, `#/c/lifestyle`, `#/c/bags`, `#/quote` |

Every article ends with a quote CTA (`#/blog/<slug>` → `#/quote`), which is why
`viewArticle()` calls `bindQuote()`.

### Blog ↔ blog (cluster links)
Cross-link siblings to build a topic cluster: 01 ↔ 03 (new-year ↔ budget),
01 → 02 (printing on the gifts), 02 ↔ 03 (technique vs budget). Add a "บทความที่
เกี่ยวข้อง" block at the foot of `viewArticle()` showing 2–3 other `BLOG` entries.

### Money pages → blog (up the funnel / distribute authority)
- **Homepage** — the 3-article teaser (§2.5) + nav + footer links.
- **Catalogue / occasion / budget pages** (`viewCatalogue`) — add a contextual
  "อ่านไอเดียเพิ่มเติม" link to the matching article (e.g. budget listing → 03;
  giftset/occasion → 01). One link near the listing header is enough.
- **Product pages** (`viewProduct`) — link "พิมพ์โลโก้แบบไหนดี?" → article 02.
- **Express page** — link to 01's production-timeline section.
- **Global nav + footer** — `#/blog` present on every route (§2.3–2.4).

---

## 9. Rollout checklist (ordered)

> Single-writer rule: `public/v2.html`, `generate-sitemap.js`/`sitemap.xml`/`robots.txt`
> are owned by different agents (frontend-react / seo-performance per `CLAUDE.md`).
> Sequence the edits — never edit `v2.html` from two agents at once.

1. **Finish content** — confirm articles 04 & 05 are written; reconcile their
   frontmatter into §3, §4, the `BLOG` array, and `ARTICLES` in `generate-sitemap.js`.
2. **Convert MD → HTML** — produce sanitized article body HTML keyed by slug (build
   step or inlined), plus the `BLOG` metadata array. Confirm Thai slugs are
   `encodeURIComponent`-safe.
3. **Edit `public/v2.html`** (one writer):
   - add `BLOG` data + body lookup;
   - add `viewBlogIndex()`, `viewArticle()`, and the `setMeta()` helper (§5);
   - add the two router branches (§2.1);
   - add JSON-LD injection (§6) in `viewArticle()`;
   - add nav link, drawer link, footer link (§2.3–2.4);
   - add homepage teaser section before `${ctaBand()}` (§2.5);
   - add up-funnel links from catalogue/product/express views (§8).
4. **(Recommended) Pre-render** `public/blog/**` static HTML with per-page
   title/meta/canonical/JSON-LD (§7 option 1).
5. **Build** — `npm run build`.
6. **Run verifiers** — `node scripts/verify-seo.mjs` (plus `verify-p0`/`verify-p1` and
   the Playwright suite with Formspree mocked, per the ship workflow). Confirm:
   unique `<title>`/description per blog route, valid JSON-LD, single H1, internal
   links resolve, no console errors.
7. **Update sitemap** — `node generate-sitemap.js` (regenerates `sitemap.xml` +
   `robots.txt` with the new `/blog` + `/blog/<slug>` URLs). Skim `sitemap.xml` to
   confirm blog URLs and correct canonical domain.
8. **Manual smoke test** — `#/blog`, each `#/blog/<slug>`, teaser links, nav/footer
   links, unknown-slug fallback, mobile drawer link, back/forward + scroll reset.
9. **Ship** — only if all verifiers pass: `git add -A && git commit && git push
   origin main` → Vercel auto-deploys and re-aliases the live domains. If anything
   fails, stop and report (do not push).
10. **Post-deploy** — submit updated `sitemap.xml` in Google Search Console; request
    indexing for `/blog` and the article URLs; watch GA4 (`G-JTMVQM245Y`) for blog
    pageviews and blog→quote click-through.
