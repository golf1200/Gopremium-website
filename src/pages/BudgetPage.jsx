// ============================================================
// GO PREMIUM — /budget/:slug  Budget landing page
// ============================================================
import { useParams, Link } from 'react-router-dom';
import { getByBudget, BUDGET_TIERS } from '../data/products';
import ProductCard from '../components/ProductCard';
import Breadcrumbs from '../components/Breadcrumbs';
import { useMeta } from '../hooks/useMeta';
import { site } from '../config';

const TIER_HERO = {
  value:     { emoji: '💡', desc: 'สินค้าคุ้มค่า ไม่เกิน ฿60/ชิ้น เหมาะสำหรับแจกจำนวนมาก' },
  smart:     { emoji: '✅', desc: 'สินค้า Smart ฿61–150/ชิ้น ราคาพอเหมาะ ได้งานชัดเจน' },
  premium:   { emoji: '✨', desc: 'สินค้า Premium ฿151–300/ชิ้น คุณภาพสูง สร้าง impression ได้' },
  executive: { emoji: '🏅', desc: 'สินค้า Executive ฿300+/ชิ้น สำหรับลูกค้า VIP และผู้บริหาร' },
};

export default function BudgetPage() {
  const { slug } = useParams();
  const products = getByBudget(slug);
  const tier = BUDGET_TIERS.find((b) => b.slug === slug);
  const label = tier?.label || slug;
  const hero = TIER_HERO[slug] || { emoji: '🎁', desc: '' };

  useMeta({
    title: `ของขวัญ ${label} — GO PREMIUM`,
    description: `${hero.desc} · ${products.length} รายการ พิมพ์โลโก้ได้`,
    canonical: `${site.siteUrl}/budget/${slug}`,
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

      <div className="gp-wrap" style={{ paddingTop: 36, paddingBottom: 64 }}>
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
        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <Link to="/products" className="gp-btn gp-btn-ghost" style={{ textDecoration: 'none' }}>ดูสินค้าทั้งหมด</Link>
        </div>
      </div>
    </div>
  );
}
