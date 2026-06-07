// ============================================================
// GO PREMIUM — /occasion/:slug  Occasion SEO landing page
// ============================================================
import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getByCategory, getByOccasion, OCCASIONS, CATEGORIES } from '../data/products';
import { getOccasionContent } from '../data/occasionContent';
import ProductCard from '../components/ProductCard';
import Breadcrumbs from '../components/Breadcrumbs';
import { useMeta } from '../hooks/useMeta';
import { track } from '../utils/analytics';
import { site } from '../config';

const CAT_LABEL = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c.label]));

// Build a de-duped recommended product list from a set of category slugs.
function recommendedProducts(categorySlugs, limit = 12) {
  const seen = new Set();
  const out = [];
  for (const slug of categorySlugs) {
    for (const p of getByCategory(slug)) {
      if (seen.has(p.sku)) continue;
      seen.add(p.sku);
      out.push(p);
      if (out.length >= limit) return out;
    }
  }
  return out;
}

export default function OccasionPage() {
  const { slug } = useParams();
  const occ = OCCASIONS.find((o) => o.slug === slug);
  const content = getOccasionContent(slug);
  const label = occ?.label || slug;

  useEffect(() => { if (occ) track('select_occasion', { slug }); }, [slug, occ]);

  const h1 = content?.h1 || `สินค้าพิมพ์โลโก้สำหรับ${label}`;
  const intro = content?.intro || `สินค้าพรีเมียมพิมพ์โลโก้สำหรับ${label} เลือกได้ตามงบและจำนวน`;

  // Products: prefer curated category recommendations; fall back to tagged occasion.
  let items = content ? recommendedProducts(content.recommendedCategories) : [];
  if (items.length === 0) items = getByOccasion(slug).slice(0, 12);

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'หน้าแรก', item: site.siteUrl },
      { '@type': 'ListItem', position: 2, name: 'สินค้า', item: `${site.siteUrl}/products` },
      { '@type': 'ListItem', position: 3, name: label, item: `${site.siteUrl}/occasion/${slug}` },
    ],
  };
  const faqLd = content?.faq?.length ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: content.faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  } : null;

  useMeta({
    title: `${h1} — GO PREMIUM`,
    description: intro.length > 155 ? `${intro.slice(0, 152)}...` : intro,
    canonical: `${site.siteUrl}/occasion/${slug}`,
    jsonLd: faqLd ? [breadcrumbLd, faqLd] : [breadcrumbLd],
  });

  if (!occ) {
    return (
      <div style={{ paddingTop: 120, textAlign: 'center' }}>
        <h1>ไม่พบโอกาส {slug}</h1>
        <Link to="/products" className="gp-btn gp-btn-primary" style={{ marginTop: 20, display: 'inline-block', textDecoration: 'none' }}>ดูแคตตาล็อก</Link>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #16293F, var(--gp-navy))', padding: '36px 0 34px' }}>
        <div className="gp-wrap">
          <Breadcrumbs crumbs={[
            { label: 'หน้าแรก', href: '/' },
            { label: 'สินค้า', href: '/products' },
            { label },
          ]} />
          <h1 style={{ color: '#fff', fontSize: 'clamp(22px,3.2vw,34px)', marginTop: 14, fontFamily: 'var(--gp-font-head)', maxWidth: '24ch', lineHeight: 1.25 }}>{h1}</h1>
          <p style={{ color: '#CBD7E8', fontSize: 15, marginTop: 12, maxWidth: '60ch', lineHeight: 1.7 }}>{intro}</p>
        </div>
      </div>

      <div className="gp-wrap" style={{ paddingTop: 36, paddingBottom: 64 }}>
        {/* Why it matters */}
        {content?.whyItMatters && (
          <section style={{ maxWidth: '70ch', marginBottom: 30 }}>
            <h2 style={{ fontSize: 20, color: 'var(--gp-navy)', fontFamily: 'var(--gp-font-head)', marginBottom: 10 }}>
              ทำไม{label}จึงสำคัญต่อองค์กร
            </h2>
            <p style={{ fontSize: 15, color: 'var(--gp-grey)', lineHeight: 1.8 }}>{content.whyItMatters}</p>
          </section>
        )}

        {/* Tips */}
        {content?.tips?.length > 0 && (
          <section style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 20, color: 'var(--gp-navy)', fontFamily: 'var(--gp-font-head)', marginBottom: 14 }}>
              เคล็ดลับเลือกของสำหรับ{label}
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 12 }}>
              {content.tips.map((t, i) => (
                <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14.5, color: 'var(--gp-ink)', lineHeight: 1.6 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gp-mustard-deep)" strokeWidth="3" style={{ flex: '0 0 auto', marginTop: 3 }}><path d="M20 6 9 17l-5-5" /></svg>
                  {t}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Recommended products */}
        <section>
          <h2 style={{ fontSize: 22, color: 'var(--gp-navy)', fontFamily: 'var(--gp-font-head)', marginBottom: 18 }}>
            สินค้าแนะนำสำหรับโอกาสนี้
          </h2>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 48, color: 'var(--gp-grey)' }}>
              <p>กำลังเพิ่มสินค้าเร็วๆ นี้</p>
              <Link to="/products" className="gp-btn gp-btn-ghost" style={{ marginTop: 16, textDecoration: 'none', display: 'inline-block' }}>ดูทั้งหมด</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))', gap: 20 }}>
              {items.map((p) => <ProductCard key={p.sku} product={p} />)}
            </div>
          )}
        </section>

        {/* Internal links: related categories */}
        {content?.recommendedCategories?.length > 0 && (
          <section style={{ marginTop: 36 }}>
            <h2 style={{ fontSize: 16, color: 'var(--gp-navy)', fontFamily: 'var(--gp-font-head)', marginBottom: 12 }}>ดูเพิ่มเติมตามหมวดสินค้า</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {content.recommendedCategories.map((cs) => (
                <Link key={cs} to={`/category/${cs}`} style={{
                  fontSize: 13.5, padding: '7px 14px', borderRadius: 20,
                  background: 'var(--gp-cloud)', color: 'var(--gp-navy)', textDecoration: 'none',
                  border: '1px solid var(--gp-grey-200)', fontFamily: 'var(--gp-font-head)', fontWeight: 500,
                }}>{CAT_LABEL[cs] || cs}</Link>
              ))}
            </div>
          </section>
        )}

        {/* FAQ */}
        {content?.faq?.length > 0 && (
          <section style={{ marginTop: 44, maxWidth: '75ch' }}>
            <h2 style={{ fontSize: 22, color: 'var(--gp-navy)', fontFamily: 'var(--gp-font-head)', marginBottom: 16 }}>คำถามที่พบบ่อย</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {content.faq.map((f, i) => (
                <div key={i} style={{ background: 'var(--gp-cloud)', borderRadius: 12, padding: '16px 18px' }}>
                  <p style={{ fontSize: 15, color: 'var(--gp-navy)', fontWeight: 600, marginBottom: 6 }}>{f.q}</p>
                  <p style={{ fontSize: 14, color: 'var(--gp-grey)', lineHeight: 1.7 }}>{f.a}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section style={{ marginTop: 48, textAlign: 'center', background: 'linear-gradient(135deg,#16293F,var(--gp-navy))', borderRadius: 'var(--gp-radius-lg)', padding: 'clamp(28px,4vw,44px)' }}>
          <h2 style={{ color: '#fff', fontSize: 'clamp(20px,2.5vw,26px)', fontFamily: 'var(--gp-font-head)' }}>พร้อมเริ่มของขวัญสำหรับ{label}แล้วหรือยัง?</h2>
          <p style={{ color: '#CBD7E8', fontSize: 14.5, marginTop: 10, maxWidth: '50ch', marginInline: 'auto' }}>ให้ AI ช่วยคิดเซ็ตที่ใช่ หรือขอใบเสนอราคาฟรี ทีมงานตอบกลับภายใน 2 ชม.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 22, flexWrap: 'wrap' }}>
            <Link to="/#ai" className="gp-btn gp-btn-primary gp-btn-lg" style={{ textDecoration: 'none' }}>ให้ AI ช่วยคิด</Link>
            <Link to="/quote" className="gp-btn gp-btn-ghost gp-btn-lg" style={{ textDecoration: 'none', color: '#fff', borderColor: 'rgba(255,255,255,.4)' }}>ขอใบเสนอราคา</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
