// ============================================================
// GO PREMIUM — ProductCard
// ============================================================
import { Link } from 'react-router-dom';
import { useQuoteCtx } from '../contexts/QuoteContext';
import GpImage from './shared/GpImage';

export default function ProductCard({ product, compact = false }) {
  const { add, remove, has } = useQuoteCtx();
  const inQuote = has(product.sku);

  const priceDisplay = product.price_300_thb != null
    ? `฿${product.price_300_thb.toLocaleString()} / ชิ้น`
    : null;

  const budget_label = {
    value:     'Value',
    smart:     'Smart',
    premium:   'Premium',
    executive: 'Executive',
  }[product.budget_tier] || null;

  const budget_color = {
    value:     '#6b7280',
    smart:     'var(--gp-navy)',
    premium:   'var(--gp-mustard-deep)',
    executive: '#9c4d0b',
  }[product.budget_tier] || 'var(--gp-grey)';

  function toggleQuote(e) {
    e.preventDefault();
    e.stopPropagation();
    if (inQuote) remove(product.sku);
    else add(product);
  }

  return (
    <Link
      to={`/product/${product.slug}`}
      style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      <div className="gp-card gp-product-card" style={{
        padding: 0,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'box-shadow .2s, transform .2s',
        cursor: 'pointer',
      }}
        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--gp-shadow-lg)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--gp-shadow-sm)'; e.currentTarget.style.transform = 'none'; }}
      >
        {/* Image */}
        <div style={{ position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
          <GpImage
            images={product.images}
            variant="square"
            alt={`${product.name} — ของพรีเมียมพิมพ์โลโก้ GO PREMIUM`}
            loading="lazy"
            style={{ width: '100%', aspectRatio: '4 / 3', height: compact ? 185 : 'auto', minHeight: compact ? undefined : 230, objectFit: 'cover', display: 'block', background: 'var(--gp-cloud-2)', transition: 'transform .35s' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.04)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          />
          {/* Budget badge */}
          {budget_label && (
            <span style={{
              position: 'absolute', top: 9, left: 9,
              background: '#fff', borderRadius: 6,
              padding: '3px 8px', fontSize: 11, fontWeight: 600,
              color: budget_color, border: `1px solid ${budget_color}33`,
              fontFamily: 'var(--gp-font-head)',
            }}>{budget_label}</span>
          )}
          {/* Quote toggle */}
          <button
            onClick={toggleQuote}
            aria-label={inQuote ? 'ลบออกจากใบขอราคา' : 'เพิ่มในใบขอราคา'}
            style={{
              position: 'absolute', top: 9, right: 9,
              width: 34, height: 34, borderRadius: '50%',
              border: 'none', cursor: 'pointer',
              background: inQuote ? 'var(--gp-navy)' : 'rgba(255,255,255,.9)',
              color: inQuote ? '#fff' : 'var(--gp-navy)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,.15)',
              transition: '.2s',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={inQuote ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              {inQuote
                ? <path d="M20 6L9 17l-5-5" />
                : <path d="M12 5v14M5 12h14" />}
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
          {/* Category */}
          <span style={{ fontSize: 11, color: 'var(--gp-grey)', fontFamily: 'var(--gp-font-head)', marginBottom: 4 }}>
            {product.category}
          </span>

          {/* Name */}
          <h3 style={{ fontSize: compact ? 14.5 : 15.5, color: 'var(--gp-navy)', fontWeight: 600, lineHeight: 1.35, flex: 1 }}>
            {product.name}
          </h3>

          {/* Free logo badges */}
          {product.free_logo && product.free_logo.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
              {product.free_logo.map((t) => (
                <span key={t} style={{
                  fontSize: 10.5, padding: '2px 7px', borderRadius: 5,
                  background: 'rgba(244,189,68,.15)', color: 'var(--gp-mustard-deep)',
                  border: '1px solid rgba(244,189,68,.3)', fontWeight: 500,
                }}>ฟรี {t}</span>
              ))}
            </div>
          )}

          {/* Footer: price + MOQ */}
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              {priceDisplay ? (
                <div style={{ fontFamily: 'var(--gp-font-head)', fontWeight: 700, fontSize: 16, color: 'var(--gp-navy)' }}>
                  {priceDisplay}
                  <span style={{ fontSize: 11, color: 'var(--gp-grey)', fontWeight: 400, marginLeft: 3 }}>(300 ชิ้น)</span>
                </div>
              ) : (
                <div style={{ fontSize: 13, color: 'var(--gp-grey)', fontFamily: 'var(--gp-font-head)' }}>ขอใบเสนอราคา</div>
              )}
              {product.moq && (
                <div style={{ fontSize: 11, color: 'var(--gp-grey)', marginTop: 1 }}>MOQ {product.moq} ชิ้น</div>
              )}
            </div>
            <span style={{
              fontSize: 12, color: 'var(--gp-navy)', background: 'var(--gp-cloud)',
              borderRadius: 7, padding: '5px 10px', fontFamily: 'var(--gp-font-head)', fontWeight: 500,
            }}>ดูรายละเอียด</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
