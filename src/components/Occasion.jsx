import GpReveal from './shared/GpReveal';

const OCCASIONS = [
  { title: 'ของขวัญปีใหม่', desc: 'กิฟต์เซ็ตและของพรีเมียมสำหรับมอบพนักงาน ลูกค้า และคู่ค้าช่วงปลายปี', img: 'giftset-executive.jpg', badge: 'พีคสุด' },
  { title: 'ชุดต้อนรับพนักงานใหม่', desc: 'Welcome kit สร้างความประทับใจวันแรก เสริมภาพลักษณ์องค์กร', img: 'drinkware-chill.jpg', badge: null },
  { title: 'ของขวัญลูกค้า VIP', desc: 'ของพรีเมียมระดับผู้บริหาร แพ็กเกจหรู สื่อถึงความใส่ใจ', img: 'giftset-aroma.jpg', badge: 'Exclusive' },
  { title: 'งานอีเวนต์ & สัมมนา', desc: 'ของแจกพิมพ์โลโก้ พร้อมส่งทันงาน เหมาะกับงานจำนวนมาก', img: 'bag-snap.jpg', badge: null },
  { title: 'ครบรอบ & Milestone', desc: 'ของที่ระลึกพิเศษเฉพาะวาระ ดีไซน์สั่งทำ สะท้อนความสำเร็จ', img: 'drinkware-milo.jpg', badge: 'Custom' },
  { title: 'ของขวัญรักษ์โลก', desc: 'วัสดุคุณภาพ เล่าเรื่อง ESG ขององค์กร เทรนด์ 2026', img: 'lifestyle-towel.jpg', badge: 'Eco' },
];

export default function Occasion({ onQuote }) {
  return (
    <section id="occasion" className="gp-section" style={{ background: 'var(--gp-cloud)' }}>
      <div className="gp-wrap">
        <GpReveal style={{ display: 'flex', flexDirection: 'column', gap: 13, maxWidth: '56ch', marginBottom: 36 }}>
          <span className="gp-eyebrow"><span className="dot" />เลือกตามโอกาส</span>
          <h2 className="gp-h2">ของขวัญที่ใช่<br />สำหรับทุกโอกาส</h2>
          <p className="gp-lead">ไม่รู้จะเริ่มจากไหน? เลือกโอกาสของคุณ — เราแนะนำสินค้าและดีไซน์ที่เหมาะสมให้ทันที</p>
        </GpReveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 18 }}>
          {OCCASIONS.map((occ, i) => (
            <GpReveal key={i} delay={i * 60}>
              <div style={{ background: '#fff', border: '1px solid var(--gp-grey-200)', borderRadius: 'var(--gp-radius)', overflow: 'hidden', boxShadow: 'var(--gp-shadow-sm)', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ position: 'relative', height: 150, background: 'var(--gp-cloud-2)', overflow: 'hidden' }}>
                  <img src={`/images/${occ.img}`} alt={`${occ.title} — ของขวัญองค์กร GO PREMIUM`} loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {occ.badge && (
                    <span className="gp-badge gp-badge-glass" style={{ position: 'absolute', top: 10, left: 12, zIndex: 2, fontSize: 10, padding: '3px 9px' }}>{occ.badge}</span>
                  )}
                </div>
                <div style={{ padding: '14px 16px 18px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <h4 style={{ fontSize: 16, color: 'var(--gp-navy)' }}>{occ.title}</h4>
                  <p style={{ fontSize: 12.5, color: 'var(--gp-grey)', lineHeight: 1.55, flex: 1 }}>{occ.desc}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                    <span style={{ fontFamily: 'var(--gp-font-head)', fontWeight: 500, fontSize: 12.5, color: 'var(--gp-grey)' }}>ปรับตามงบ & จำนวน</span>
                    <button className="gp-btn gp-btn-ghost gp-btn-sm" onClick={onQuote}>ดูไอเดีย</button>
                  </div>
                </div>
              </div>
            </GpReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
