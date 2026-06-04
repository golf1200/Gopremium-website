import GpIcon from './shared/GpIcon';
import GpReveal from './shared/GpReveal';

// Real GO PREMIUM product lines (from catalog). Prices intentionally omitted
// until confirmed — CTA routes to a real quotation instead of a placeholder number.
const PRIME = [
  { t: 'กระบอกน้ำสุญญากาศ รุ่น Milo', moq: 'MOQ 100', img: 'drinkware-milo.jpg', badge: 'ขายดี' },
  { t: 'กระเป๋าผ้า รุ่น Moov', moq: 'MOQ 150', img: 'bag-moov.jpg', badge: 'รักษ์โลก' },
  { t: 'สมุดโน้ต รุ่น Idea', moq: 'MOQ 100', img: 'stationery-notebook.jpg', badge: null },
  { t: 'กิฟต์เซ็ตธุรกิจ Executive', moq: 'MOQ 50', img: 'giftset-executive.jpg', badge: 'นิยม' },
];
const UPSELL = [
  { icon: 'palette', t: 'บริการออกแบบเฉพาะ', d: 'คอนเซ็ปต์ & ดีไซน์เฉพาะแบรนด์ ไม่ใช่ของโหล' },
  { icon: 'box', t: 'แพ็กเกจ & กล่องพรีเมียม', d: 'กล่อง การ์ด และแท็กแบรนด์ ยกระดับการแกะกล่อง' },
  { icon: 'layers', t: 'จัดกิฟต์เซ็ต (Curation)', d: 'หลายชิ้นในเซ็ตเดียว เล่าเรื่องแบรนด์คุณ' },
  { icon: 'clock', t: 'งานด่วน (Rush)', d: 'ดีลกระชั้นก็ทันงาน วางแผนการผลิตให้' },
  { icon: 'truck', t: 'คลังสินค้า & จัดส่งรายคน', d: 'Kitting & fulfillment ส่งตรงถึงพนักงานแต่ละคน' },
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
                      <img
                        src={`/images/${p.img}`}
                        alt={`${p.t} — ของพรีเมียมพิมพ์โลโก้สำหรับองค์กร โดย GO PREMIUM`}
                        loading="lazy"
                        style={{ width: '100%', height: 150, borderRadius: 11, objectFit: 'cover', display: 'block', background: 'var(--gp-cloud-2)' }}
                      />
                      {p.badge && <span className="gp-badge gp-badge-mustard" style={{ position: 'absolute', top: 9, left: 9, fontSize: 10.5, padding: '4px 9px' }}>{p.badge}</span>}
                    </div>
                    <h4 style={{ fontSize: 15.5, color: 'var(--gp-navy)', marginTop: 13 }}>{p.t}</h4>
                    <p style={{ fontSize: 12, color: 'var(--gp-grey)', marginTop: 3 }}>พิมพ์โลโก้ได้ · {p.moq}</p>
                    <div style={{ marginTop: 'auto', paddingTop: 13, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: 'var(--gp-font-head)', fontWeight: 500, fontSize: 13, color: 'var(--gp-grey)' }}>ราคาตามดีไซน์</span>
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
