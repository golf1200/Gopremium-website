# 3D Product Customizer — Architecture Plan

> Source: analyzed from reference video (Instagram ad, mobile t-shirt design app, 2026-07-12).
> Goal: let a GoPremium customer upload their logo, position it on a 3D product, spin it 360°, change colour, and send the design as a quote request (RFQ) — directly on the website.

---

## 1. What the reference app does (frame-by-frame analysis)

| Feature seen in video | Detail |
|---|---|
| 3D garment viewer | T-shirt rendered in real-time 3D, drag to rotate 360°, smooth cloth-like model |
| Colour switching | Instant recolour of the shirt (green → red) — material tint, not separate models |
| "Position Graphics" panel | 2D grid sheet at the bottom; user drags graphic thumbnails on the grid → placement updates live on the 3D shirt (front + back independently) |
| Add Photo | Upload own image/graphic onto the garment |
| Background presets | Solid / Studio / Sunset / Outdoor / Night environment behind the model |
| Garment selector | "Regular T-Shirt" label → multiple garment types supported |

## 2. Feasibility verdict

**YES — 100% possible on the current GoPremium static site, with zero backend changes for the MVP.**
This is a well-trodden pattern (Three.js t-shirt configurators). Everything runs client-side in the browser; the only server touchpoint is the existing quote-form submission.

- Works on the current stack: static HTML pages on Vercel (same pattern as `public/exclusive.html`).
- No paid services required. Three.js is MIT/free, models can be CC0 or one-time commissioned.
- Mobile OK: Three.js WebGL runs fine on phones; touch-drag rotate is native OrbitControls.

## 3. Recommended architecture (MVP)

```
public/studio.html                ← standalone page (like exclusive.html), route /studio
public/studio/
  studio.js                       ← Three.js app (ES modules via import map, no build step)
  studio.css
  models/
    tshirt.glb                    ← rigged-UV garment model (~1–3 MB, draco-compressed)
    (later: polo.glb, mug.glb, tote.glb, bottle.glb, cap.glb)
  env/                            ← background presets (small HDR or gradient canvases)
```

### Rendering pipeline
1. **Viewer**: Three.js + GLTFLoader + OrbitControls. `renderer.setClearColor` / equirect env per background preset.
2. **Colour**: single material on the garment; `material.color.set(hex)` → instant recolour (exactly what the video does).
3. **Logo placement — canvas-texture approach** (simplest + most reliable):
   - The GLB has clean UVs. We keep an offscreen `<canvas>` 2048×2048 as the shirt's `map` texture.
   - Base layer = white/neutral fabric texture tinted by material colour.
   - User's uploaded PNG is drawn onto the canvas at (x, y, scale, rotation) → `texture.needsUpdate = true` → live update on the 3D model.
   - The "Position Graphics" grid from the video = a simple 2D div-grid mapped 1:1 to the UV front/back print areas. Drag thumbnail on grid → redraw canvas. (We already know the standard print zones per product from the logo-placement skill: chest-left, full-front, full-back, etc.)
4. **Print-area presets**: snap positions (อกซ้าย / กลางอก / หลังเต็ม) as one-tap chips — faster than free drag for B2B users, and matches real screen-print positions we actually offer.
5. **Snapshot → RFQ**: `renderer.domElement.toDataURL()` captures the current 3D view (front + back auto-shots). Attach these PNGs + design JSON (product, colour, logo file, position, qty) to the existing quote form flow → lands in the same lead pipeline (GA4 event + Pipedrive follow-up).

### Why canvas-texture and not 3D decals
Decal projection (raycast DecalGeometry) looks cool but distorts on curved cloth and is harder to convert into a real print spec. Canvas-on-UV gives us **exact print coordinates** we can hand to the factory — placement on screen = placement on the real shirt.

## 4. Integration points with existing site

| Existing asset | How it plugs in |
|---|---|
| `v2.html` nav + product pages | "🎨 ออกแบบเลย / Design It" button on relevant product pages (`/product/<slug>`) → `/studio?sku=TS001&color=navy` deep link |
| Quote form (already live, submits real leads) | Studio's "ขอใบเสนอราคา" reuses the same endpoint, adds mockup PNGs + design JSON |
| Logo-placement knowledge (61 real decisions) | Becomes the preset print-position chips per product type |
| Catalog master (481 SKU) | `customizable: true` flag + `modelKey: "tshirt"` per SKU decides which products show the Design button |
| GA4 | Events: `studio_open`, `studio_upload_logo`, `studio_snapshot`, `studio_rfq_submit` |

## 5. Phased rollout

- **Phase 1 (MVP, ~1–2 days)**: `/studio` page, 1 t-shirt GLB, rotate + colour picker + logo upload + preset positions + snapshot → quote form. Ship behind a nav-less URL first, verify on mobile, then link from product pages.
- **Phase 2**: more garment/product models (polo, tote, mug — mug/bottle use cylindrical UV wrap which is even easier than cloth), front/back grid editor like the video, background presets.
- **Phase 3 (optional)**: save/share designs (Supabase table `studio_designs` + short URL), text tool (customer types name/slogan with Thai fonts), AI-assist (auto-remove logo background with the free rembg pipeline we already have).

## 6. Costs & risks

- **Cost**: ฿0 recurring. One-time: sourcing a good t-shirt GLB (free CC0 options exist; a commissioned clean-UV model ~$20–60 if needed).
- **Model quality is the whole game** — a cheap-looking GLB kills the premium feel. Budget time to light it well (soft studio HDRI, contact shadow) to match the GoPremium catalogue look.
- **Old devices**: WebGL fallback = show static mockup generator (we already have print-your-logo.cjs stamping logic) — graceful degrade.
- **Don't expose costs**: studio is public-facing → prices shown must be the public web prices only (same rule as the rest of the site).

## 7. Decision needed from Golf

1. Which product first? (แนะนำ: เสื้อยืด/โปโล — ตรงกับวิดีโอ และเป็นสินค้าที่ลูกค้าอยากเห็นโลโก้ตัวเองมากที่สุด; ทางเลือก: กระบอกน้ำ ซึ่งเป็นสินค้าหลักของเรา และ UV ทรงกระบอกทำง่ายกว่า)
2. Free-drag placement (เหมือนในวิดีโอ) หรือ preset positions ก่อน (เร็วกว่า ตรงตำแหน่งสกรีนจริง) — แนะนำ preset ก่อนใน MVP
