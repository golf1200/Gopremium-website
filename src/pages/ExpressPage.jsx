// ============================================================
// GO PREMIUM — /express  ของพรีเมียมส่งด่วน (money page สำหรับ SEM/SEO)
// ตอบความกลัวข้อ 1 ของคนสั่ง: "กลัวมาไม่ทันงาน"
// ข้อมูลชั้นส่ง (ship_tier/ship_days_max) มาจาก scripts/express-retier.mjs
// ⚠️ ห้ามใส่คำสัญญาเวลาส่งที่ข้อมูลไม่รองรับ — ทุกตัวเลขบนหน้านี้ derive จาก data จริง
// ============================================================
import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getExpress, SHIP_TIERS } from '../data/products';
import ProductCard from '../components/ProductCard';
import Breadcrumbs from '../components/Breadcrumbs';
import { useMeta } from '../hooks/useMeta';
import { track } from '../utils/analytics';
import { buildAttributedPath } from '../utils/attribution';
import { site, lineHref } from '../config';

// ฟิลเตอร์หลักของหน้านี้ = "คุณต้องใช้ภายในกี่วัน" (ไม่ใช่หมวดสินค้า)
const DEADLINE_FILTERS = [
  { days: 14, label: 'ภายใน 14 วัน', sub: 'ด่วนที่สุด' },
  { days: 20, label: 'ภายใน 20 วัน', sub: 'ทันงานส่วนใหญ่' },
  { days: 25, label: 'ภายใน 25 วัน', sub: 'ทั้งหมด' },
];

const FAQ = [
  {
    q: 'ของพรีเมียมส่งด่วน ใช้เวลากี่วัน?',
    a: 'ขึ้นกับสินค้าแต่ละตัว — บนหน้านี้เราระบุจำนวนวันจริงไว้บนสินค้าทุกชิ้น กลุ่มเร็วที่สุดคือ 7–14 วัน กลุ่มถัดมา 15–20 วัน และ 21–25 วัน นับตั้งแต่ยืนยันแบบโลโก้และชำระมัดจำ ไม่รวมวันหยุดนักขัตฤกษ์',
  },
  {
    q: 'ทำไมบางเจ้าบอก 3 วัน แต่ที่นี่บอก 7–14 วัน?',
    a: 'เพราะเรานับรวมเวลาพิมพ์โลโก้และตรวจงานจริง ไม่ใช่แค่เวลาจัดส่งพัสดุ ตัวเลขบนหน้านี้คือเวลาที่ของถึงมือคุณพร้อมโลโก้แล้ว เราเลือกที่จะบอกตัวเลขที่ทำได้จริงมากกว่าตัวเลขที่ฟังดูดี',
  },
  {
    q: 'สั่งขั้นต่ำเท่าไร?',
    a: 'MOQ ระบุไว้บนสินค้าทุกชิ้น ส่วนใหญ่เริ่มที่ 50–300 ชิ้น กดดูที่การ์ดสินค้าได้เลยโดยไม่ต้องขอใบเสนอราคาก่อน',
  },
  {
    q: 'เห็นโลโก้บนของจริงก่อนผลิตได้ไหม?',
    a: 'ได้ เราทำ mockup โลโก้ของคุณวางบนสินค้าจริงให้ดูก่อนเริ่มผลิตทุกงาน คุณอนุมัติแล้วเราถึงเข้าไลน์ผลิต',
  },
  {
    q: 'ราคาที่แสดงคือราคาอะไร?',
    a: 'ราคาต่อชิ้นที่จำนวน 300 ชิ้น รวมพิมพ์โลโก้ในเทคนิคที่ระบุว่า "ฟรี" บนสินค้านั้นแล้ว จำนวนมากขึ้นราคาต่อชิ้นลดลง',
  },
  {
    q: 'ถ้าต้องใช้เร็วกว่า 7 วัน ทำยังไง?',
    a: `ทักมาคุยก่อนได้เลย บางรายการมีของในสต๊อกและลดเวลาพิมพ์ได้ แต่เราจะบอกตรง ๆ ถ้าทำไม่ทัน แทนที่จะรับงานแล้วให้คุณลุ้น — โทร ${site.phone} หรือทักไลน์ ${site.lineId}`,
  },
];

export default function ExpressPage() {
  const [maxDays, setMaxDays] = useState(25);
  const all = useMemo(() => getExpress(), []);

  useEffect(() => { track('view_express'); }, []);

  const shown = all.filter((p) => p.ship_days_max <= maxDays);
  const rushCount = all.filter((p) => p.ship_tier === 'rush').length;
  const priced = all.filter((p) => p.price_300_thb != null);
  const minPrice = priced.length ? Math.min(...priced.map((p) => p.price_300_thb)) : null;
  const fastest = all.length ? Math.min(...all.map((p) => p.ship_days_min)) : null;
  const quoteHref = buildAttributedPath('/quote');

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'หน้าแรก', item: site.siteUrl },
      { '@type': 'ListItem', position: 2, name: 'ของพรีเมียมส่งด่วน', item: `${site.siteUrl}/express` },
    ],
  };
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((f) => ({
      '@type': 'Question', name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  useMeta({
    title: `ของพรีเมียมส่งด่วน พิมพ์โลโก้ ${fastest ? `เร็วสุด ${fastest} วัน` : ''} — GO PREMIUM`,
    description: `ของขวัญองค์กรพิมพ์โลโก้ที่ระบุวันส่งชัดเจน ${all.length} รายการ เร็วสุด ${fastest}–14 วัน เห็นราคาและ MOQ ทุกชิ้นก่อนขอใบเสนอราคา`,
    canonical: `${site.siteUrl}/express`,
    jsonLd: [breadcrumbLd, faqLd],
  });

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh' }}>
      {/* ---------- Hero: คำสัญญาเดียว ชัด ---------- */}
      <div style={{ background: 'var(--gp-navy)', padding: '32px 0 34px' }}>
        <div className="gp-wrap">
          <Breadcrumbs crumbs={[{ label: 'หน้าแรก', href: '/' }, { label: 'ของส่งด่วน' }]} />
          <h1 style={{ color: '#fff', fontSize: 'clamp(24px,3.4vw,38px)', marginTop: 12, fontFamily: 'var(--gp-font-head)', lineHeight: 1.25 }}>
            ของพรีเมียมส่งด่วน — <span style={{ color: 'var(--gp-mustard)' }}>รู้วันส่งก่อนสั่ง</span>
          </h1>
          <p style={{ color: '#CBD7E8', fontSize: 15.5, marginTop: 10, maxWidth: '58ch', lineHeight: 1.7 }}>
            ไม่ต้องอีเมลไปถามว่า “ทันไหม” — สินค้าทุกชิ้นในหน้านี้ระบุจำนวนวันจริงไว้แล้ว
            พร้อมราคาและ MOQ ให้เทียบเองได้ทันที
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 22, marginTop: 20 }}>
            <Stat value={all.length} unit="รายการ" caption="ระบุวันส่งชัดเจน" />
            <Stat value={rushCount} unit="รายการ" caption="กลุ่มเร็วสุด 7–14 วัน" highlight />
            {minPrice != null && <Stat value={`฿${minPrice.toLocaleString()}`} unit="" caption="เริ่มต้น / ชิ้น (300 ชิ้น)" />}
          </div>
        </div>
      </div>

      <div className="gp-wrap" style={{ paddingTop: 26, paddingBottom: 64 }}>
        {/* ---------- ฟิลเตอร์ตามเดดไลน์ ---------- */}
        <section style={{ marginBottom: 26 }}>
          <p style={{ fontSize: 14, color: 'var(--gp-navy)', fontFamily: 'var(--gp-font-head)', fontWeight: 600, marginBottom: 10 }}>
            คุณต้องใช้ของภายในกี่วัน?
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
            {DEADLINE_FILTERS.map((f) => {
              const on = maxDays === f.days;
              const n = all.filter((p) => p.ship_days_max <= f.days).length;
              return (
                <button
                  key={f.days}
                  onClick={() => { setMaxDays(f.days); track('filter_express_deadline', { days: f.days }); }}
                  style={{
                    padding: '9px 16px', borderRadius: 10, cursor: 'pointer',
                    fontFamily: 'var(--gp-font-head)', fontSize: 14, fontWeight: 600, textAlign: 'left',
                    background: on ? 'var(--gp-navy)' : '#fff',
                    color: on ? '#fff' : 'var(--gp-navy)',
                    border: `1px solid ${on ? 'var(--gp-navy)' : 'var(--gp-grey-200)'}`,
                  }}
                >
                  {f.label}
                  <span style={{ display: 'block', fontSize: 11.5, fontWeight: 400, opacity: .75, marginTop: 2 }}>
                    {f.sub} · {n} รายการ
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ---------- คำอธิบายชั้นส่ง (โปร่งใส ไม่ขายฝัน) ---------- */}
        <section style={{
          background: 'var(--gp-cloud)', borderRadius: 12, padding: '16px 18px',
          marginBottom: 28, maxWidth: '80ch',
        }}>
          <p style={{ fontSize: 13.5, color: 'var(--gp-grey)', lineHeight: 1.8 }}>
            <strong style={{ color: 'var(--gp-navy)' }}>จำนวนวันนับยังไง:</strong>{' '}
            นับตั้งแต่คุณอนุมัติ mockup โลโก้และชำระมัดจำ จนของถึงมือพร้อมโลโก้แล้ว
            (ไม่รวมวันหยุดนักขัตฤกษ์) — เราไม่นับแค่เวลาส่งพัสดุเหมือนที่หลายเจ้าทำ
            สินค้าที่ผลิตนานกว่า 25 วันเราไม่เอามาไว้ในหน้านี้
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            {SHIP_TIERS.map((t) => {
              const n = all.filter((p) => p.ship_tier === t.slug).length;
              if (!n) return null;
              return (
                <span key={t.slug} style={{
                  fontSize: 12.5, padding: '5px 11px', borderRadius: 20,
                  background: '#fff', color: 'var(--gp-navy)',
                  border: '1px solid var(--gp-grey-200)', fontFamily: 'var(--gp-font-head)',
                }}>{t.label} · {n}</span>
              );
            })}
          </div>
        </section>

        {/* ---------- Grid ---------- */}
        <p style={{ fontSize: 13, color: 'var(--gp-grey)', marginBottom: 14 }}>
          แสดง {shown.length} รายการ · เรียงจากส่งเร็วสุด
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))', gap: 20 }}>
          {shown.map((p) => <ProductCard key={p.sku} product={p} />)}
        </div>

        {/* ---------- CTA เดียว ---------- */}
        <section style={{
          marginTop: 44, background: 'var(--gp-navy)', borderRadius: 16,
          padding: '30px 26px', textAlign: 'center',
        }}>
          <h2 style={{ color: '#fff', fontSize: 'clamp(19px,2.4vw,26px)', fontFamily: 'var(--gp-font-head)', marginBottom: 8 }}>
            มีเดดไลน์อยู่ในใจแล้วใช่ไหม
          </h2>
          <p style={{ color: '#CBD7E8', fontSize: 14.5, marginBottom: 20, lineHeight: 1.7 }}>
            บอกวันที่ต้องใช้มา เราตอบกลับว่าทันหรือไม่ทัน พร้อมราคา — ถ้าไม่ทันเราจะบอกตรง ๆ
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to={quoteHref}
              data-express-rfq="hero"
              onClick={() => track('express_rfq_click', { placement: 'hero' })}
              className="gp-btn gp-btn-primary"
              style={{ textDecoration: 'none' }}
            >ขอใบเสนอราคา</Link>
            {lineHref && (
              <a
                href={lineHref} target="_blank" rel="noopener noreferrer"
                onClick={() => track('cta_line', { from: 'express' })}
                className="gp-btn gp-btn-ghost"
                style={{ textDecoration: 'none', background: 'transparent', color: '#fff', borderColor: 'rgba(255,255,255,.35)' }}
              >ทักไลน์ {site.lineId}</a>
            )}
          </div>
        </section>

        {/* ---------- FAQ (มี FAQPage schema) ---------- */}
        <section style={{ marginTop: 44, maxWidth: '75ch' }}>
          <h2 style={{ fontSize: 22, color: 'var(--gp-navy)', fontFamily: 'var(--gp-font-head)', marginBottom: 16 }}>
            คำถามที่พบบ่อยเรื่องของส่งด่วน
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {FAQ.map((f, i) => (
              <div key={i} style={{ background: 'var(--gp-cloud)', borderRadius: 12, padding: '16px 18px' }}>
                <p style={{ fontSize: 15, color: 'var(--gp-navy)', fontWeight: 600, marginBottom: 6 }}>{f.q}</p>
                <p style={{ fontSize: 14, color: 'var(--gp-grey)', lineHeight: 1.7 }}>{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <div style={{ marginTop: 36, textAlign: 'center' }}>
          <Link to="/products" className="gp-btn gp-btn-ghost" style={{ textDecoration: 'none' }}>ดูสินค้าทั้งหมด</Link>
        </div>
      </div>
    </div>
  );
}

function Stat({ value, unit, caption, highlight }) {
  return (
    <div>
      <div style={{
        fontFamily: 'var(--gp-font-head)', fontWeight: 700, fontSize: 26,
        color: highlight ? 'var(--gp-mustard)' : '#fff', lineHeight: 1.1,
      }}>
        {value}<span style={{ fontSize: 14, fontWeight: 500, marginLeft: 4 }}>{unit}</span>
      </div>
      <div style={{ color: '#9FB3CE', fontSize: 12, marginTop: 3 }}>{caption}</div>
    </div>
  );
}
