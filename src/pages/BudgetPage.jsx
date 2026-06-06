// ============================================================
// GO PREMIUM — /budget/:slug  Budget landing page
// ============================================================
import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getByBudget, BUDGET_TIERS, CATEGORIES } from '../data/products';
import { getBudgetContent } from '../data/budgetContent';
import ProductCard from '../components/ProductCard';
import Breadcrumbs from '../components/Breadcrumbs';
import { useMeta } from '../hooks/useMeta';
import { track } from '../utils/analytics';
import { site } from '../config';

const TIER_HERO = {
  value:     { emoji: '💡', desc: 'สินค้าคุ้มค่า ไม่เกิน ฿60/ชิ้น เหมาะสำหรับแจกจำนวนมาก' },
  smart:     { emoji: '✅', desc: 'สินค้า Smart ฿61–150/ชิ้น ราคาพอเหมาะ ได้งานชัดเจน' },
  premium:   { emoji: '✨', desc: 'สินค้า Premium ฿151–300/ชิ้น คุณภาพสูง สร้าง impression ได้' },
  executive: { emoji: '🏅', desc: 'สินค้า Executive ฿300+/ชิ้น สำหรับลูกค้า VIP และผู้บริหาร' },
};

const CAT_LABEL = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c.label]));

export default function BudgetPage() {
  const { slug } = useParams();
  const products = getByBudget(slug);
  const tier = BUDGET_TIERS.find((b) => b.slug === slug);
  const label = tier?.label || slug;
  const hero = TIER_HERO[slug] || { emoji: '🎁', desc: '' };
  const content = getBudgetContent(slug);

  useEffect(() => { if (tier) track('select_budget', { slug }); }, [slug, tier]);

  const description = content?.intro
    ? (content.intro.length > 155 ? `${content.intro.slice(0, 152)}...` : content.intro)
    : `${hero.desc} · ${products.length} รายการ พิมพ์โลโก้ได้`;

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'หน้าแรก', item: site.siteUrl },
      { '@type': 'ListItem', position: 2, name: 'สินค้า', item: `${site.siteUrl}/products` },
      { '@type': 'ListItem', position: 3, name: label, item: `${site.siteUrl}/budget/${slug}` },
    ],
  };
  const faqLd = content?.faq?.length ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: content.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  } : null;

  useMeta({
    title: `ของขวัญองค์กร ${label} พิมพ์โลโก้ — GO PREMIUM`,
    description,
    canonical: `${site.siteUrl}/budget/${slug}`,
    jsonLd: faqLd ? [breadcrumbLd, faqLd] : [breadcrumbLd],
  });

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{ background: 'var(--gp-navy)', padding: '32px 0 28px' }}>
        <div className="gp-wrap">
          <Breadcrumbs crumbs={[
            { label: 'หน้าแรก', href: '/' },
            { label: 'สินค้า', href: '/products' },
            { label },
          ]} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 14 }}>
            <span style={{ fontSize: 40 }}>{hero.emoji}</span>
            <div>
              <h1 style={{ color: '#fff', fontSize: 'clamp(20px,3vw,30px)', fontFamily: 'var(--gp-font-head)' }}>{label}</h1>
              <p style={{ color: '#CBD7E8', fontSize: 13.5, marginTop: 5 }}>{hero.desc} · {products.length} รายการ</p>
            </div>
          </div>
        </div>
      </div>

      <div className="gp-wrap" style={{ paddingTop: 32, paddingBottom: 64 }}>
        {/* Intro + why it matters */}
        {content && (
          <section style={{ maxWidth: '72ch', marginBottom: 28 }}>
            <p style={{ fontSize: 15, color: 'var(--gp-grey)', lineHeight: 1.8 }}>{content.intro}</p>
            {content.whyItMatters && (
              <p style={{ fontSize: 14.5, color: 'var(--gp-grey)', lineHeight: 1.8, marginTop: 14 }}>{content.whyItMatters}</p>
            )}
          </section>
        )}

        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--gp-grey)' }}>
            <p>ไม่พบสินค้าในช่วงงบนี้</p>
            <Link to="/products" className="gp-btn gp-btn-ghost" style={{ marginTop: 16, textDecoration: 'none', display: 'inline-block' }}>ดูทั้งหมด</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))', gap: 20 }}>
            {products.map((p) => <ProductCard key={p.sku} product={p} />)}
          </div>
        )}

        {/* Internal links: related categories */}
        {content?.relatedCategories?.length > 0 && (
          <section style={{ marginTop: 36 }}>
            <h2 style={{ fontSize: 16, color: 'var(--gp-navy)', fontFamily: 'var(--gp-font-head)', marginBottom: 12 }}>ดูเพิ่มเติมตามหมวดสินค้า</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {content.relatedCategories.map((cs) => (
                <Link key={cs} to={`/category/${cs}`} style={chip}>{CAT_LABEL[cs] || cs}</Link>
              ))}
            </div>
          </section>
        )}

        {/* FAQ */}
        {content?.faq?.length > 0 && (
          <section style={{ marginTop: 40, maxWidth: '75ch' }}>
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

        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <Link to="/products" className="gp-btn gp-btn-ghost" style={{ textDecoration: 'none' }}>ดูสินค้าทั้งหมด</Link>
        </div>
      </div>
    </div>
  );
}

const chip = {
  fontSize: 13.5, padding: '7px 14px', borderRadius: 20,
  background: 'var(--gp-cloud)', color: 'var(--gp-navy)', textDecoration: 'none',
  border: '1px solid var(--gp-grey-200)', fontFamily: 'var(--gp-font-head)', fontWeight: 500,
};
