// ============================================================
// GO PREMIUM — /occasion/:slug  Occasion landing page
// ============================================================
import { useParams, Link } from 'react-router-dom';
import { getByOccasion, OCCASIONS } from '../data/products';
import ProductCard from '../components/ProductCard';
import Breadcrumbs from '../components/Breadcrumbs';
import { useMeta } from '../hooks/useMeta';
import { site } from '../config';

const OCCASION_HERO = {
  'new-year':     { emoji: '🎊', desc: 'ของขวัญปีใหม่ที่ประทับใจ พิมพ์โลโก้แบรนด์ได้ ส่งตรงถึงพนักงานและลูกค้า' },
  'songkran':     { emoji: '💦', desc: 'สินค้าสงกรานต์ที่ใช้งานได้จริง เบา พกพาง่าย พิมพ์โลโก้ได้' },
  'new-employee': { emoji: '👋', desc: 'Welcome kit สำหรับพนักงานใหม่ สร้างความประทับใจตั้งแต่วันแรก' },
  'vip':          { emoji: '⭐', desc: 'ของขวัญ VIP ระดับพรีเมียม สำหรับลูกค้าและพาร์ตเนอร์สำคัญ' },
  'event':        { emoji: '🎤', desc: 'ของแจกอีเวนต์ บูธ สัมมนา คุ้มค่า พิมพ์โลโก้ได้จำนวนมาก' },
  'milestone':    { emoji: '🏆', desc: 'ฉลองครบรอบและ Milestone สำคัญขององค์กรด้วยของขวัญระดับพรีเมียม' },
  'esg':          { emoji: '🌿', desc: 'สินค้ารักษ์โลกจากวัสดุ eco-friendly รองรับนโยบาย ESG ขององค์กร' },
  'thank-you':    { emoji: '🙏', desc: 'ของขอบคุณลูกค้าและคู่ค้า สร้างความสัมพันธ์ระยะยาว' },
  'executive':    { emoji: '👔', desc: 'ของขวัญระดับผู้บริหาร ดีไซน์เรียบหรู คุณภาพสูง' },
  'mass-staff':   { emoji: '👥', desc: 'สินค้าแจกพนักงานจำนวนมาก ราคาดี MOQ ต่ำ พิมพ์โลโก้ได้ทั้งหมด' },
};

export default function OccasionPage() {
  const { slug } = useParams();
  const products = getByOccasion(slug);
  const occ = OCCASIONS.find((o) => o.slug === slug);
  const label = occ?.label || slug;
  const hero = OCCASION_HERO[slug] || { emoji: '🎁', desc: `สินค้าพิมพ์โลโก้สำหรับ${label}` };

  useMeta({
    title: `สินค้าสำหรับ${label} — GO PREMIUM`,
    description: `${hero.desc} ${products.length} รายการ พิมพ์โลโก้ได้ B2B`,
    canonical: `${site.siteUrl}/occasion/${slug}`,
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
      <div style={{ background: 'linear-gradient(135deg, #16293F, var(--gp-navy))', padding: '36px 0 32px' }}>
        <div className="gp-wrap">
          <Breadcrumbs crumbs={[
            { label: 'หน้าแรก', href: '/' },
            { label: 'สินค้า', href: '/products' },
            { label },
          ]} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 14 }}>
            <span style={{ fontSize: 44 }}>{hero.emoji}</span>
            <div>
              <h1 style={{ color: '#fff', fontSize: 'clamp(20px,3vw,32px)', fontFamily: 'var(--gp-font-head)' }}>{label}</h1>
              <p style={{ color: '#CBD7E8', fontSize: 14, marginTop: 5, maxWidth: '52ch' }}>{hero.desc}</p>
            </div>
          </div>
          <p style={{ color: 'var(--gp-mustard)', fontSize: 13, marginTop: 12, fontWeight: 500 }}>
            {products.length} รายการที่เหมาะสำหรับโอกาสนี้
          </p>
        </div>
      </div>

      <div className="gp-wrap" style={{ paddingTop: 36, paddingBottom: 64 }}>
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--gp-grey)' }}>
            <p>ยังไม่มีสินค้าในหมวดนี้ กำลังเพิ่มเร็วๆ นี้</p>
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
