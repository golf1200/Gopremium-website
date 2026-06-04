import GpReveal from './shared/GpReveal';
import GpImage from './shared/GpImage';
import { variantSet } from '../utils/images';

// 7 real GO PREMIUM categories. Counts reflect the actual product catalogue.
// img = base image name (resolved to the 16:9 landscape master).
const CATS = [
  { label: 'ขายดี', badgeClass: 'gp-badge-mustard', name: 'แก้ว & กระบอกน้ำ', sub: '10+ รุ่น', img: 'drinkware-milo' },
  { label: 'พิมพ์โลโก้ได้', badgeClass: 'gp-badge-navy', name: 'กระเป๋า & ถุงผ้า', sub: '16+ รุ่น', img: 'bag-moov' },
  { label: 'ออฟฟิศ', badgeClass: 'gp-badge-navy', name: 'เครื่องเขียน & สำนักงาน', sub: '15+ รุ่น', img: 'stationery-notebook' },
  { label: 'ไอที & แกดเจ็ต', badgeClass: 'gp-badge-navy', name: 'พัดลมพกพา & แกดเจ็ต', sub: '11+ รุ่น', img: 'minifan-haru' },
  { label: 'พิมพ์โลโก้ได้', badgeClass: 'gp-badge-navy', name: 'ร่มพรีเมียม', sub: '6 รุ่น', img: 'umbrella-classic' },
  { label: 'รักษ์โลก', badgeClass: 'gp-badge-mustard', name: 'ไลฟ์สไตล์ & ของใช้', sub: '16+ รุ่น', img: 'lifestyle-towel' },
  { label: 'พรีเมียม', badgeClass: 'gp-badge-mustard', name: 'กิฟต์เซ็ต', sub: '5+ เซ็ต', img: 'giftset-aroma' },
];

export default function Category({ onQuote }) {
  return (
    <section id="category" className="gp-section" style={{ background: 'var(--gp-cloud)' }}>
      <div className="gp-wrap">
        <GpReveal style={{ display: 'flex', flexDirection: 'column', gap: 13, maxWidth: '56ch', marginBottom: 36 }}>
          <span className="gp-eyebrow"><span className="dot" />ประเภทสินค้า</span>
          <h2 className="gp-h2">รู้ว่าอยากได้อะไร?<br />เลือกเลย</h2>
          <p className="gp-lead">สินค้าทุกชิ้นพิมพ์โลโก้ได้ ปรับสีตามแบรนด์ และมี Mockup ให้ดูก่อนผลิตทุกออเดอร์</p>
        </GpReveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16 }}>
          {CATS.map((cat, i) => (
            <GpReveal key={i} delay={i * 55}>
              <div style={{ background: '#fff', border: '1px solid var(--gp-grey-200)', borderRadius: 'var(--gp-radius)', overflow: 'hidden', boxShadow: 'var(--gp-shadow-sm)', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: 150, background: 'var(--gp-cloud-2)', position: 'relative', overflow: 'hidden' }}>
                  <GpImage images={variantSet(cat.img)} variant="landscape" alt={`${cat.name} ของพรีเมียมองค์กร GO PREMIUM`} loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '12px 14px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span className={`gp-badge ${cat.badgeClass}`} style={{ fontSize: 9.5, alignSelf: 'center' }}>{cat.label}</span>
                  <h4 style={{ fontSize: 14.5, color: 'var(--gp-navy)', margin: '8px 0 3px' }}>{cat.name}</h4>
                  <p style={{ fontSize: 11.5, color: 'var(--gp-grey)', marginBottom: 12 }}>{cat.sub}</p>
                  <button className="gp-btn gp-btn-ghost gp-btn-sm" onClick={onQuote} style={{ width: '100%', justifyContent: 'center', marginTop: 'auto' }}>ดูสินค้า & ขอราคา</button>
                </div>
              </div>
            </GpReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
