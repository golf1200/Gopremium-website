// ============================================================
// GO PREMIUM — /category/:slug  Category landing page
// ============================================================
import { useParams, Link } from 'react-router-dom';
import { getByCategory, CATEGORIES } from '../data/products';
import ProductCard from '../components/ProductCard';
import Breadcrumbs from '../components/Breadcrumbs';
import { useMeta } from '../hooks/useMeta';
import { site } from '../config';

export default function CategoryPage() {
  const { slug } = useParams();
  const products = getByCategory(slug);
  const catInfo = CATEGORIES.find((c) => c.slug === slug);
  const label = catInfo?.label || slug;

  useMeta({
    title: `${label} — ของพรีเมียมพิมพ์โลโก้ GO PREMIUM`,
    description: `สินค้าหมวด ${label} ${products.length} รายการ พิมพ์โลโก้ได้ ราคาส่ง B2B`,
    canonical: `${site.siteUrl}/category/${slug}`,
  });

  if (products.length === 0) {
    return (
      <div style={{ paddingTop: 120, textAlign: 'center' }}>
        <h1>ไม่พบหมวดหมู่ {slug}</h1>
        <Link to="/products" className="gp-btn gp-btn-primary" style={{ marginTop: 20, display: 'inline-block', textDecoration: 'none' }}>ดูแคตตาล็อก</Link>
      </div>
    );
  }

  const priced = products.filter((p) => p.price_300_thb != null);
  const minPrice = priced.length ? Math.min(...priced.map((p) => p.price_300_thb)) : null;
  const maxPrice = priced.length ? Math.max(...priced.map((p) => p.price_300_thb)) : null;

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
            {label}
          </h1>
          <p style={{ color: '#CBD7E8', fontSize: 14, marginTop: 5 }}>
            {products.length} รายการ
            {minPrice != null && ` · ราคาเริ่ม ฿${minPrice.toLocaleString()}–฿${maxPrice?.toLocaleString()} / ชิ้น (300 pcs)`}
          </p>
        </div>
      </div>

      <div className="gp-wrap" style={{ paddingTop: 36, paddingBottom: 64 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))', gap: 20 }}>
          {products.map((p) => <ProductCard key={p.sku} product={p} />)}
        </div>
        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <Link to="/products" className="gp-btn gp-btn-ghost" style={{ textDecoration: 'none' }}>ดูสินค้าทั้งหมด</Link>
        </div>
      </div>
    </div>
  );
}
