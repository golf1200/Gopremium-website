// ============================================================
// GO PREMIUM — /category/:slug  Category landing page
// ============================================================
import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getByCategory, CATEGORIES, OCCASIONS, BUDGET_TIERS } from '../data/products';
import { getCategoryContent } from '../data/categoryContent';
import ProductCard from '../components/ProductCard';
import Breadcrumbs from '../components/Breadcrumbs';
import { useMeta } from '../hooks/useMeta';
import { track } from '../utils/analytics';
import { site } from '../config';

const OCC_LABEL = Object.fromEntries(OCCASIONS.map((o) => [o.slug, o.label]));

export default function CategoryPage() {
  const { slug } = useParams();
  const products = getByCategory(slug);
  const catInfo = CATEGORIES.find((c) => c.slug === slug);
  const label = catInfo?.label || slug;
  const content = getCategoryContent(slug);

  useEffect(() => { if (catInfo) track('select_category', { slug }); }, [slug, catInfo]);

  const priced = products.filter((p) => p.price_300_thb != null);
  const minPrice = priced.length ? Math.min(...priced.map((p) => p.price_300_thb)) : null;
  const maxPrice = priced.length ? Math.max(...priced.map((p) => p.price_300_thb)) : null;

  const description = content?.intro
    ? (content.intro.length > 155 ? `${content.intro.slice(0, 152)}...` : content.intro)
    : `สินค้าหมวด ${label} ${products.length} รายการ พิมพ์โลโก้ได้ ราคาส่ง B2B`;

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'หน้าแรก', item: site.siteUrl },
      { '@type': 'ListItem', position: 2, name: 'สินค้า', item: `${site.siteUrl}/products` },
      { '@type': 'ListItem', position: 3, name: label, item: `${site.siteUrl}/category/${slug}` },
    ],
  };
  const faqLd = content?.faq?.length ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: content.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  } : null;

  useMeta({
    title: `${label} พิมพ์โลโก้ ราคาส่ง — GO PREMIUM`,
    description,
    canonical: `${site.siteUrl}/category/${slug}`,
    jsonLd: faqLd ? [breadcrumbLd, faqLd] : [breadcrumbLd],
  });

  if (products.length === 0) {
    return (
      <div style={{ paddingTop: 120, textAlign: 'center' }}>
        <h1>ไม่พบหมวดหมู่ {slug}</h1>
        <Link to="/products" className="gp-btn gp-btn-primary" style={{ marginTop: 20, display: 'inline-block', textDecoration: 'none' }}>ดูแคตตาล็อก</Link>
      </div>
    );
  }

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
          <h1 style={{ color: '#fff', fontSize: 'clamp(22px,3vw,34px)', marginTop: 12, fontFamily: 'var(--gp-font-head)' }}>
            {label} พิมพ์โลโก้
          </h1>
          <p style={{ color: '#CBD7E8', fontSize: 14, marginTop: 5 }}>
            {products.length} รายการ
            {minPrice != null && ` · ราคาเริ่ม ฿${minPrice.toLocaleString()}–฿${maxPrice?.toLocaleString()} / ชิ้น (300 pcs)`}
          </p>
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

        {/* Product grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))', gap: 20 }}>
          {products.map((p) => <ProductCard key={p.sku} product={p} />)}
        </div>

        {/* Internal links: related occasions + budget tiers */}
        <section style={{ marginTop: 36 }}>
          <h2 style={{ fontSize: 16, color: 'var(--gp-navy)', fontFamily: 'var(--gp-font-head)', marginBottom: 12 }}>ดูเพิ่มเติม</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {(content?.relatedOccasions || []).map((os) => (
              <Link key={os} to={`/occasion/${os}`} style={chip}>{OCC_LABEL[os] || os}</Link>
            ))}
            {BUDGET_TIERS.map((b) => (
              <Link key={b.slug} to={`/budget/${b.slug}`} style={chip}>{b.label}</Link>
            ))}
          </div>
        </section>

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
