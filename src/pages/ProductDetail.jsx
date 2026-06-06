// ============================================================
// GO PREMIUM — /product/:sku  Product detail page
// ============================================================
import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProduct, getRelated, OCCASIONS, BUDGET_LABEL } from '../data/products';
import { useQuoteCtx } from '../contexts/QuoteContext';
import ProductCard from '../components/ProductCard';
import Breadcrumbs from '../components/Breadcrumbs';
import ProductGallery from '../components/ProductGallery';
import { useMeta } from '../hooks/useMeta';
import { track } from '../utils/analytics';
import { seoImage } from '../utils/images';
import { site, lineHref } from '../config';

export default function ProductDetail() {
  const { sku } = useParams();
  const navigate = useNavigate();
  const { add, remove, has } = useQuoteCtx();

  const product = getProduct(sku);

  if (!product) {
    return (
      <div style={{ paddingTop: 120, textAlign: 'center', minHeight: '60vh' }}>
        <h1 style={{ color: 'var(--gp-navy)' }}>ไม่พบสินค้า</h1>
        <p style={{ color: 'var(--gp-grey)', margin: '12px 0 24px' }}>รหัสสินค้า {sku} ไม่มีในระบบ</p>
        <Link to="/products" className="gp-btn gp-btn-primary">ดูแคตตาล็อก</Link>
      </div>
    );
  }

  const inQuote = has(product.sku);
  const related = getRelated(product, 4);

  const priceDisplay = product.price_300_thb != null
    ? `฿${product.price_300_thb.toLocaleString()}`
    : null;

  // JSON-LD for product
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    sku: product.sku,
    image: [`${site.siteUrl}${seoImage(product.images)}`],
    description: product.features,
    brand: { '@type': 'Brand', name: 'GO PREMIUM' },
    offers: product.price_300_thb != null ? {
      '@type': 'Offer',
      price: product.price_300_thb,
      priceCurrency: 'THB',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: product.price_300_thb,
        priceCurrency: 'THB',
        referenceQuantity: { '@type': 'QuantitativeValue', value: 300, unitCode: 'C62' },
      },
      availability: 'https://schema.org/InStock',
    } : { '@type': 'Offer', availability: 'https://schema.org/InStock', priceCurrency: 'THB' },
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'หน้าแรก', item: site.siteUrl },
      { '@type': 'ListItem', position: 2, name: 'แคตตาล็อกสินค้า', item: `${site.siteUrl}/products` },
      { '@type': 'ListItem', position: 3, name: product.category, item: `${site.siteUrl}/category/${product.category_slug}` },
      { '@type': 'ListItem', position: 4, name: product.name, item: `${site.siteUrl}/product/${product.slug}` },
    ],
  };

  useMeta({
    title: `${product.name} — GO PREMIUM`,
    description: `${product.features || product.name} | ของพรีเมียมพิมพ์โลโก้ ${product.category} MOQ ${product.moq || ''} ชิ้น`,
    canonical: `${site.siteUrl}/product/${product.slug}`,
    image: `${site.siteUrl}${seoImage(product.images)}`,
    jsonLd: [jsonLd, breadcrumbLd],
  });

  // view_item: fire when a product page loads / changes
  useEffect(() => {
    track('view_item', { sku: product.sku, category: product.category });
  }, [product.sku, product.category]);

  function handleQuoteToggle() {
    if (inQuote) remove(product.sku);
    else add(product);
  }

  const specsRows = [
    ['รหัสสินค้า', product.sku],
    ['ขนาด / ความจุ', product.size],
    ['วัสดุ', product.material],
    ['MOQ', product.moq ? `${product.moq} ชิ้น` : null],
    ['สี', product.color],
    ['ขนาดโลโก้สูงสุด', product.logo_max_cm ? `${product.logo_max_cm} ซม.` : null],
  ].filter((r) => r[1]);

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh' }}>
      {/* Breadcrumbs */}
      <div className="gp-wrap" style={{ paddingTop: 24, paddingBottom: 8 }}>
        <Breadcrumbs crumbs={[
          { label: 'หน้าแรก', href: '/' },
          { label: 'สินค้า', href: '/products' },
          { label: product.category, href: `/category/${product.category_slug}` },
          { label: product.name },
        ]} />
      </div>

      {/* Main content */}
      <div className="gp-wrap" style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.1fr)',
        gap: 'clamp(24px,4vw,60px)',
        paddingBottom: 60,
        alignItems: 'start',
      }} id="product-detail-grid">
        {/* Left: image */}
        <div>
          <ProductGallery
            images={product.images}
            alt={`${product.name} — ของพรีเมียมพิมพ์โลโก้ GO PREMIUM`}
          />
          {/* Category tag */}
          <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <Link to={`/category/${product.category_slug}`}
              style={{ fontSize: 12, padding: '4px 10px', borderRadius: 20, background: 'var(--gp-cloud)', color: 'var(--gp-navy)', textDecoration: 'none', border: '1px solid var(--gp-grey-200)', fontFamily: 'var(--gp-font-head)', fontWeight: 500 }}>
              {product.category}
            </Link>
            {product.budget_tier && (
              <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 20, background: 'rgba(244,189,68,.12)', color: 'var(--gp-mustard-deep)', border: '1px solid rgba(244,189,68,.3)' }}>
                {BUDGET_LABEL[product.budget_tier]}
              </span>
            )}
          </div>
        </div>

        {/* Right: details */}
        <div>
          <h1 style={{ fontSize: 'clamp(20px,2.5vw,30px)', color: 'var(--gp-navy)', lineHeight: 1.25, marginBottom: 8 }}>
            {product.name}
          </h1>

          {product.features && (
            <p style={{ fontSize: 15, color: 'var(--gp-grey)', lineHeight: 1.65, marginBottom: 20 }}>
              {product.features}
            </p>
          )}

          {/* Price block */}
          <div style={{ background: 'var(--gp-cloud)', borderRadius: 14, padding: '18px 20px', marginBottom: 20 }}>
            {priceDisplay ? (
              <>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontFamily: 'var(--gp-font-head)', fontWeight: 700, fontSize: 32, color: 'var(--gp-navy)' }}>{priceDisplay}</span>
                  <span style={{ fontSize: 14, color: 'var(--gp-grey)' }}>/ ชิ้น (ที่ 300 ชิ้น)</span>
                </div>
                {product.moq && (
                  <p style={{ fontSize: 13, color: 'var(--gp-grey)', marginTop: 4 }}>
                    สั่งขั้นต่ำ (MOQ) {product.moq} ชิ้น
                  </p>
                )}
              </>
            ) : (
              <div>
                <p style={{ fontFamily: 'var(--gp-font-head)', fontWeight: 600, fontSize: 18, color: 'var(--gp-navy)' }}>
                  ราคาตามดีไซน์ / จำนวน
                </p>
                <p style={{ fontSize: 13, color: 'var(--gp-grey)', marginTop: 4 }}>กรอกใบขอราคาด้านล่างหรือทาง LINE</p>
              </div>
            )}
          </div>

          {/* Free logo badges */}
          {product.free_logo && product.free_logo.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 13, color: 'var(--gp-grey)', fontWeight: 500, marginBottom: 8 }}>เทคนิคพิมพ์โลโก้ฟรี</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {product.free_logo.map((t) => (
                  <span key={t} style={{
                    fontSize: 13, padding: '5px 12px', borderRadius: 8,
                    background: 'rgba(244,189,68,.12)', color: 'var(--gp-mustard-deep)',
                    border: '1px solid rgba(244,189,68,.35)', fontWeight: 500,
                  }}>
                    ✓ ฟรี {t}
                  </span>
                ))}
                {product.logo_max_cm && (
                  <span style={{ fontSize: 13, color: 'var(--gp-grey)', padding: '5px 0', alignSelf: 'center' }}>
                    · โลโก้สูงสุด {product.logo_max_cm} ซม.
                  </span>
                )}
              </div>
            </div>
          )}

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
            <button
              className={`gp-btn ${inQuote ? 'gp-btn-ghost' : 'gp-btn-primary'}`}
              style={{ flex: '1 1 auto' }}
              onClick={handleQuoteToggle}
            >
              {inQuote ? (
                <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg> อยู่ในใบขอราคาแล้ว</>
              ) : (
                <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg> เพิ่มในใบขอราคา</>
              )}
            </button>
            {inQuote && (
              <Link to="/quote" className="gp-btn gp-btn-primary" style={{ flex: '1 1 auto', textAlign: 'center', textDecoration: 'none' }}>
                ดูใบขอราคา
              </Link>
            )}
          </div>

          {/* LINE / phone */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {lineHref ? (
              <a href={lineHref} target="_blank" rel="noopener noreferrer"
                style={{ flex: 1, textAlign: 'center', padding: '10px', borderRadius: 10, background: '#06C755', color: '#fff', fontSize: 13.5, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.03 2 11c0 3.25 1.87 6.1 4.71 7.79L5.5 22l3.38-1.74C9.84 20.74 10.9 21 12 21c5.523 0 10-4.03 10-9S17.523 2 12 2z"/></svg>
                LINE สอบถาม
              </a>
            ) : (
              <a href={`tel:${site.phoneIntl}`}
                style={{ flex: 1, textAlign: 'center', padding: '10px', borderRadius: 10, background: 'var(--gp-cloud)', color: 'var(--gp-navy)', fontSize: 13.5, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, border: '1px solid var(--gp-grey-200)' }}>
                📞 {site.phone}
              </a>
            )}
          </div>

          {/* Specs table */}
          {specsRows.length > 0 && (
            <div style={{ borderTop: '1px solid var(--gp-grey-200)', paddingTop: 20 }}>
              <h3 style={{ fontSize: 14, fontFamily: 'var(--gp-font-head)', fontWeight: 600, color: 'var(--gp-navy)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.5px' }}>รายละเอียดสินค้า</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
                <tbody>
                  {specsRows.map(([k, v]) => (
                    <tr key={k} style={{ borderBottom: '1px solid var(--gp-grey-200)' }}>
                      <td style={{ padding: '8px 4px', color: 'var(--gp-grey)', width: '40%', verticalAlign: 'top' }}>{k}</td>
                      <td style={{ padding: '8px 4px', color: 'var(--gp-ink)', whiteSpace: 'pre-line' }}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Occasions */}
          {product.occasions && product.occasions.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <p style={{ fontSize: 13, color: 'var(--gp-grey)', marginBottom: 8 }}>เหมาะสำหรับ</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {product.occasions.map((slug) => {
                  const occ = OCCASIONS.find((o) => o.slug === slug);
                  return occ ? (
                    <Link key={slug} to={`/occasion/${slug}`} style={{
                      fontSize: 12, padding: '4px 10px', borderRadius: 20,
                      background: 'var(--gp-cloud)', color: 'var(--gp-navy)',
                      textDecoration: 'none', border: '1px solid var(--gp-grey-200)',
                    }}>{occ.label}</Link>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div style={{ background: 'var(--gp-cloud)', padding: '48px 0' }}>
          <div className="gp-wrap">
            <h2 style={{ fontSize: 22, color: 'var(--gp-navy)', marginBottom: 24, fontFamily: 'var(--gp-font-head)' }}>
              สินค้าในหมวดเดียวกัน
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 20 }}>
              {related.map((p) => <ProductCard key={p.sku} product={p} compact />)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
