import GpReveal from './shared/GpReveal';

const CATS = [
  { id: 0, label: 'ขายดี', badgeClass: 'gp-badge-mustard', name: 'แก้วน้ำ & กระบอกน้ำ', moq: 'MOQ 100', gradient: 'linear-gradient(135deg,#1F3A5F,#2C4F7C)' },
  { id: 1, label: 'พิมพ์โลโก้ได้', badgeClass: 'gp-badge-navy', name: 'กระเป๋า & ถุงผ้า', moq: 'MOQ 150', gradient: 'linear-gradient(135deg,#2C4F7C,#3E689B)' },
  { id: 2, label: 'รักษ์โลก', badgeClass: 'gp-badge-mustard', name: 'กิฟต์เซ็ต', moq: 'MOQ 50', gradient: 'linear-gradient(135deg,#2F4A3A,#3E689B)' },
  { id: 3, label: 'เหมาะกับองค์กร', badgeClass: 'gp-badge-navy', name: 'แกดเจ็ต & ไอที', moq: 'MOQ 80', gradient: 'linear-gradient(135deg,#3A4250,#566075)' },
  { id: 4, label: 'พิมพ์โลโก้ได้', badgeClass: 'gp-badge-navy', name: 'ร่มพรีเมียม', moq: 'MOQ 100', gradient: 'linear-gradient(135deg,#16293F,#244873)' },
  { id: 5, label: 'ขายดี', badgeClass: 'gp-badge-mustard', name: 'เครื่องเขียน & สำนักงาน', moq: 'MOQ 100', gradient: 'linear-gradient(135deg,#1F3A5F,#16293F)' },
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
            <GpReveal key={cat.id} delay={i * 55}>
              <div style={{ background: '#fff', border: '1px solid var(--gp-grey-200)', borderRadius: 'var(--gp-radius)', overflow: 'hidden', boxShadow: 'var(--gp-shadow-sm)', textAlign: 'center' }}>
                <div style={{ height: 110, background: cat.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <div className="gp-dotgrid on-dark" style={{ position: 'absolute', inset: 0, opacity: .35 }} />
                </div>
                <div style={{ padding: '12px 14px 16px' }}>
                  <span className={`gp-badge ${cat.badgeClass}`} style={{ fontSize: 9.5 }}>{cat.label}</span>
                  <h4 style={{ fontSize: 14.5, color: 'var(--gp-navy)', margin: '8px 0 3px' }}>{cat.name}</h4>
                  <p style={{ fontSize: 11.5, color: 'var(--gp-grey)', marginBottom: 10 }}>{cat.moq}</p>
                  <button className="gp-btn gp-btn-ghost gp-btn-sm" onClick={onQuote} style={{ width: '100%', justifyContent: 'center' }}>ดูสินค้า & ขอราคา</button>
                </div>
              </div>
            </GpReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
