import GpSpark from './shared/GpSpark';
import GpReveal from './shared/GpReveal';

const SVCS = [
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 9h18"/></svg>,
    title: 'Mockup ก่อนผลิต', desc: 'เห็นภาพงานจริงก่อนเริ่มผลิต ลดความเสี่ยงเรื่องสี โลโก้ และองค์ประกอบแบรนด์', ai: true,
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></svg>,
    title: 'พิมพ์โลโก้ & ปรับดีไซน์', desc: 'ปรับสีและดีไซน์ให้เข้ากับแบรนด์ลูกค้าอย่างพิถีพิถัน ใช้ AI ช่วยขึ้น Mockup ไวขึ้น', ai: false,
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16v13H4z"/><path d="M4 7l2-3h12l2 3M12 4v16"/></svg>,
    title: 'จัดเซ็ตของขวัญ (Curation)', desc: 'คัดและจัดหลายชิ้นเป็นเซ็ตเดียว เพิ่มมูลค่าและความน่าจดจำ เล่าเรื่องแบรนด์คุณ', ai: false,
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8l9-5 9 5-9 5z"/><path d="M3 8v8l9 5 9-5V8"/></svg>,
    title: 'ออกแบบกล่อง & แพ็กเกจ', desc: 'กล่อง การ์ดขอบคุณ และแท็กแบรนด์ ให้ของขวัญดูสมบูรณ์และน่าแกะ', ai: false,
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="6" width="15" height="11"/><path d="M16 10h4l3 3v4h-7M5.5 19a2 2 0 100-1M18.5 19a2 2 0 100-1"/></svg>,
    title: 'แพ็ก & จัดส่งรายคน', desc: 'Kitting & fulfillment ส่งตรงถึงพนักงานหรือลูกค้าแต่ละคน หลายสาขาก็ทำได้', ai: false,
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.4H22l-6 4.5 2.3 7.1L12 16.8 5.7 21l2.3-7.1-6-4.5h7.6z"/></svg>,
    title: 'งานด่วน 7–14 วัน', desc: 'สำหรับองค์กรที่มี deadline ชัด พร้อมผลิตและส่งมอบตรงเวลาทุกออเดอร์', ai: false,
  },
];

export default function Services({ onQuote }) {
  return (
    <section id="services" className="gp-section" style={{ background: '#fff' }}>
      <div className="gp-wrap">
        <GpReveal style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', marginBottom: 36 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13, maxWidth: '52ch' }}>
            <span className="gp-eyebrow"><span className="dot" />บริการเสริม</span>
            <h2 className="gp-h2">ครบทุกบริการ<br />จบในที่เดียว</h2>
            <p className="gp-lead">GO PREMIUM ไม่ใช่แค่ร้านขายของ — เราเป็น partner ที่ดูแลตั้งแต่ไอเดียจนถึงมือผู้รับ</p>
          </div>
          <button className="gp-btn gp-btn-primary" onClick={onQuote}>ปรึกษาฟรี</button>
        </GpReveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16 }}>
          {SVCS.map((svc, i) => (
            <GpReveal key={i} delay={i * 55}>
              <div style={{ background: 'var(--gp-cloud)', border: '1px solid var(--gp-grey-200)', borderRadius: 'var(--gp-radius)', padding: 20 }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: svc.ai ? 'var(--gp-mustard-soft)' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gp-navy)', marginBottom: 12, border: '1px solid var(--gp-grey-200)' }}>
                  {svc.icon}
                </div>
                <h4 style={{ fontSize: 15, color: 'var(--gp-navy)', display: 'flex', alignItems: 'center', gap: 7 }}>
                  {svc.title}
                  {svc.ai && <span className="gp-badge gp-badge-ai" style={{ fontSize: 9, padding: '2px 7px' }}><GpSpark size={10} /> AI</span>}
                </h4>
                <p style={{ fontSize: 13, color: 'var(--gp-grey)', marginTop: 5, lineHeight: 1.6 }}>{svc.desc}</p>
              </div>
            </GpReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
