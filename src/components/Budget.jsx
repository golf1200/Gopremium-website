import GpReveal from './shared/GpReveal';

const TIERS = [
  { label: 'เริ่มต้น', badgeClass: 'gp-badge-navy', range: 'ไม่เกิน 60 THB', desc: 'เหมาะกับของแจกงานอีเวนต์ จำนวนมาก MOQ 300+ ชิ้น', items: ['ปากกาพิมพ์โลโก้','กระเป๋าผ้าสปันบอนด์','แมสก์ปรับแต่ง','พวงกุญแจ'], highlight: false },
  { label: 'คุ้มค่า', badgeClass: 'gp-badge-navy', range: 'ไม่เกิน 200 THB', desc: 'ของพนักงาน/ลูกค้าทั่วไป ดูดีในงบที่คุมได้ MOQ 100+ ชิ้น', items: ['กระบอกน้ำสเตนเลส','กระเป๋าผ้าแคนวาส','สมุดโน้ต PU','เซ็ตเครื่องเขียน'], highlight: false },
  { label: 'ระดับกลาง', badgeClass: 'gp-badge-mustard', range: '300–800 THB', desc: 'กิฟต์เซ็ตดีไซน์เฉพาะพร้อมแพ็กเกจ MOQ 50+ ชิ้น', items: ['กิฟต์เซ็ตกระบอกน้ำ + สมุด','เซ็ตของใช้สำนักงาน','ถุงของขวัญพรีเมียม','แก้ว Borosilicate'], highlight: true },
  { label: 'ผู้บริหาร', badgeClass: 'gp-badge-mustard', range: '1,000 THB ขึ้นไป', desc: 'ของขวัญ VIP แพ็กเกจหรู สลักชื่อ MOQ ยืดหยุ่น', items: ['กล่องหนังหรูสลักชื่อ','กระเป๋าหนังพรีเมียม','เซ็ตไวน์/ชา','ของที่ระลึกพิเศษ'], highlight: false },
];

export default function Budget({ onQuote }) {
  return (
    <section id="budget" className="gp-section" style={{ background: '#fff' }}>
      <div className="gp-wrap">
        <GpReveal style={{ display: 'flex', flexDirection: 'column', gap: 13, maxWidth: '56ch', marginBottom: 36 }}>
          <span className="gp-eyebrow"><span className="dot" />เลือกตามงบ</span>
          <h2 className="gp-h2">งบเท่าไหร่<br />ก็มีของขวัญที่ใช่</h2>
          <p className="gp-lead">เราไม่ใช้คำว่า "งบน้อย" — ทุกงบมีของขวัญที่ดูดีและน่าจดจำในแบบของมัน</p>
        </GpReveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
          {TIERS.map((tier, i) => (
            <GpReveal key={i} delay={i * 70}>
              <div style={{ background: tier.highlight ? 'linear-gradient(165deg,#1F3A5F,#16293F)' : '#fff', border: tier.highlight ? 'none' : '1px solid var(--gp-grey-200)', borderRadius: 'var(--gp-radius)', padding: 20, boxShadow: tier.highlight ? 'var(--gp-shadow)' : 'var(--gp-shadow-sm)', height: '100%', display: 'flex', flexDirection: 'column', gap: 14, position: 'relative', overflow: 'hidden' }}>
                {tier.highlight && <div className="gp-dotgrid on-dark" style={{ position: 'absolute', inset: 0, opacity: .45 }} />}
                <div style={{ position: 'relative' }}>
                  <span className={`gp-badge ${tier.badgeClass}`} style={{ fontSize: 10 }}>{tier.label}</span>
                  <div style={{ fontFamily: 'var(--gp-font-head)', fontWeight: 700, fontSize: 22, color: tier.highlight ? '#fff' : 'var(--gp-navy)', marginTop: 10, lineHeight: 1.2 }}>{tier.range}</div>
                  <p style={{ fontSize: 12.5, lineHeight: 1.55, marginTop: 8, color: tier.highlight ? '#B9C6DA' : 'var(--gp-grey)' }}>{tier.desc}</p>
                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {tier.items.map((item, j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: tier.highlight ? '#CBD7E8' : 'var(--gp-ink)' }}>
                        <span style={{ width: 5, height: 5, borderRadius: 2, background: tier.highlight ? 'var(--gp-mustard)' : 'var(--gp-mustard-deep)', flexShrink: 0 }} />
                        {item}
                      </div>
                    ))}
                  </div>
                  <button className={`gp-btn gp-btn-sm ${tier.highlight ? 'gp-btn-primary' : 'gp-btn-ghost'}`} onClick={onQuote} style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}>ขอราคา</button>
                </div>
              </div>
            </GpReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
