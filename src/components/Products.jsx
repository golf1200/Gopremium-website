import GpIcon from './shared/GpIcon';
import GpReveal from './shared/GpReveal';

const PRIME = [
  { t: 'กระบอกน้ำเก็บอุณหภูมิ', moq: 'MOQ 100', from: 180, badge: 'ขายดี' },
  { t: 'กระเป๋าผ้าแคนวาส', moq: 'MOQ 150', from: 120, badge: 'รักษ์โลก' },
  { t: 'สมุดโน้ตปกหนัง PU', moq: 'MOQ 100', from: 95, badge: null },
  { t: 'เซ็ตของใช้สำนักงาน', moq: 'MOQ 80', from: 240, badge: 'นิยม' },
];
const UPSELL = [
  { icon: 'palette', t: 'บริการออกแบบเฉพาะ', d: 'คอนเซ็ปต์ & ดีไซน์เฉพาะแบรนด์ ไม่ใช่ของโหล' },
  { icon: 'box', t: 'แพ็กเกจ & กล่องพรีเมียม', d: 'กล่อง การ์ด และแท็กแบรนด์ ยกระดับการแกะกล่อง' },
  { icon: 'layers', t: 'จัดกิฟต์เซ็ต (Curation)', d: 'หลายชิ้นในเซ็ตเดียว เล่าเรื่องแบรนด์คุณ' },
  { icon: 'clock', t: 'งานด่วน (Rush)', d: 'ดีลกระชั้นก็ทันงาน วางแผนการผลิตให้' },
  { icon: 'truck', t: 'คลังสินค้า & จัดส่งรายคน', d: 'Kitting & fulfillment ส่งตรงถึงพนักงานแต่ละคน' },
];

const GRAD = [
  ['#1F3A5F','#2C4F7C'],['#2C4F7C','#3E689B'],['#16293F','#1F3A5F'],['#3A4250','#566075'],
];

export default function Products({ onQuote }) {
  return (
    <section id="products" className="gp-section" style={{ background: '#fff' }}>
      <div className="gp-wrap">
        <GpReveal style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: '60ch' }}>
          <span className="gp-eyebrow"><span className="dot" />สินค้า & บริการ</span>
          <h2 className="gp-h2">เริ่มจากสินค้าที่ใช่ <br />แล้วยกระดับให้เป็นประสบการณ์</h2>
          <p className="gp-lead">สินค้าหลักราคาเข้าถึงได้เป็นจุดเริ่ม — บริการเสริมคือสิ่งที่เปลี่ยน "ของแจก" ให้กลายเป็น "ของที่อยากเก็บ"</p>
        </GpReveal>
        <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: 'clamp(24px,3.5vw,52px)', marginTop: 46, alignItems: 'start' }} className="gp-prod-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <span className="gp-badge gp-badge-solid">PRIME</span>
              <span style={{ fontFamily: 'var(--gp-font-head)', fontSize: 15, color: 'var(--gp-navy)', fontWeight: 500 }}>สินค้ายอดนิยม</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 16 }}>
              {PRIME.map((p, i) => (
                <GpReveal key={i} delay={i * 70}>
                  <div className="gp-card" style={{ padding: 14, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{ width: '100%', height: 128, borderRadius: 11, background: `linear-gradient(135deg,${GRAD[i][0]},${GRAD[i][1]})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <GpIcon name="box" size={32} stroke="rgba(255,255,255,.3)" />
                      </div>
                      {p.badge && <span className="gp-badge gp-badge-mustard" style={{ position: 'absolute', top: 9, left: 9, fontSize: 10.5, padding: '4px 9px' }}>{p.badge}</span>}
                    </div>
                    <h4 style={{ fontSize: 15.5, color: 'var(--gp-navy)', marginTop: 13 }}>{p.t}</h4>
                    <p style={{ fontSize: 12, color: 'var(--gp-grey)', marginTop: 3 }}>พิมพ์โลโก้ · {p.moq}</p>
                    <div style={{ marginTop: 'auto', paddingTop: 13, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: 'var(--gp-font-head)', fontWeight: 600, fontSize: 14.5, color: 'var(--gp-navy)' }}>เริ่ม ฿{p.from}</span>
                      <button className="gp-btn gp-btn-ghost gp-btn-sm" onClick={onQuote}>ขอราคา</button>
                    </div>
                  </div>
                </GpReveal>
              ))}
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <span className="gp-badge gp-badge-mustard">UPSELL</span>
              <span style={{ fontFamily: 'var(--gp-font-head)', fontSize: 15, color: 'var(--gp-navy)', fontWeight: 500 }}>บริการเพิ่มมูลค่า</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {UPSELL.map((u, i) => (
                <GpReveal key={i} delay={i * 60}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', background: 'var(--gp-cloud)', borderRadius: 14, padding: '15px 16px', border: '1px solid var(--gp-grey-200)' }}>
                    <div style={{ flex: '0 0 auto', width: 42, height: 42, borderRadius: 11, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gp-navy)', border: '1px solid var(--gp-grey-200)' }}>
                      <GpIcon name={u.icon} size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: 14.5, color: 'var(--gp-navy)' }}>{u.t}</h4>
                      <p style={{ fontSize: 12.5, color: 'var(--gp-grey)', marginTop: 2, lineHeight: 1.5 }}>{u.d}</p>
                    </div>
                  </div>
                </GpReveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
