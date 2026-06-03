import GpReveal from './shared/GpReveal';

const OCCASIONS = [
  { id: 0, title: 'ของขวัญปีใหม่', desc: 'กิฟต์เซ็ตและของพรีเมียมสำหรับมอบพนักงาน ลูกค้า และคู่ค้าช่วงปลายปี', from: '120', gradient: 'linear-gradient(135deg,#1F3A5F,#2C4F7C)', badge: 'พีคสุด' },
  { id: 1, title: 'ชุดต้อนรับพนักงานใหม่', desc: 'Welcome kit สร้างความประทับใจวันแรก เสริมภาพลักษณ์องค์กร', from: '250', gradient: 'linear-gradient(135deg,#2C4F7C,#3E689B)', badge: null },
  { id: 2, title: 'ของขวัญลูกค้า VIP', desc: 'ของพรีเมียมระดับผู้บริหาร แพ็กเกจหรู สื่อถึงความใส่ใจ', from: '1,000', gradient: 'linear-gradient(135deg,#16293F,#1F3A5F)', badge: 'Exclusive' },
  { id: 3, title: 'งานอีเวนต์ & สัมมนา', desc: 'ของแจกพิมพ์โลโก้ พร้อมส่งทันงาน เหมาะกับงานจำนวนมาก', from: '35', gradient: 'linear-gradient(135deg,#244873,#1F3A5F)', badge: null },
  { id: 4, title: 'ครบรอบ & Milestone', desc: 'ของที่ระลึกพิเศษเฉพาะวาระ ดีไซน์สั่งทำ สะท้อนความสำเร็จ', from: '500', gradient: 'linear-gradient(135deg,#1F3A5F,#16293F)', badge: 'Custom' },
  { id: 5, title: 'ของขวัญรักษ์โลก', desc: 'วัสดุรีไซเคิล เล่าเรื่อง ESG ขององค์กร เทรนด์ 2026', from: '120', gradient: 'linear-gradient(135deg,#2F4A3A,#3E689B)', badge: 'Eco' },
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
            <GpReveal key={occ.id} delay={i * 60}>
              <div style={{ background: '#fff', border: '1px solid var(--gp-grey-200)', borderRadius: 'var(--gp-radius)', overflow: 'hidden', boxShadow: 'var(--gp-shadow-sm)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative', height: 120, background: occ.gradient }}>
                  <div className="gp-dotgrid on-dark" style={{ position: 'absolute', inset: 0, opacity: .4 }} />
                  {occ.badge && (
                    <span className="gp-badge gp-badge-glass" style={{ position: 'absolute', top: 10, left: 12, zIndex: 2, fontSize: 10, padding: '3px 9px' }}>{occ.badge}</span>
                  )}
                </div>
                <div style={{ padding: '14px 16px 18px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <h4 style={{ fontSize: 16, color: 'var(--gp-navy)' }}>{occ.title}</h4>
                  <p style={{ fontSize: 12.5, color: 'var(--gp-grey)', lineHeight: 1.55, flex: 1 }}>{occ.desc}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                    <span style={{ fontFamily: 'var(--gp-font-head)', fontWeight: 600, fontSize: 13.5, color: 'var(--gp-navy)' }}>
                      เริ่ม ฿{occ.from} <span style={{ fontWeight: 400, fontSize: 11, color: 'var(--gp-grey)' }}>/ชิ้น</span>
                    </span>
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
