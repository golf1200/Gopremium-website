import GpIcon from './shared/GpIcon';
import GpReveal from './shared/GpReveal';
import GpSpark from './shared/GpSpark';

const STEPS = [
  { n: '01', icon: 'chat', t: 'ปรึกษา', d: 'บอกโจทย์ โอกาส งบ และจำนวน ทีมเราตอบไวภายใน 48 ชม.' },
  { n: '02', icon: 'palette', t: 'ดีไซน์ + AI Mockup', d: 'เห็นภาพงานจริงก่อนตัดสินใจ ใช้ AI ขึ้น Mockup โลโก้บนสินค้าให้ดูทันที', ai: true },
  { n: '03', icon: 'box', t: 'ผลิต', d: 'ควบคุมคุณภาพทุกชิ้น วัสดุที่สัมผัสได้ถึงความพรีเมียม' },
  { n: '04', icon: 'truck', t: 'ส่งมอบ', d: 'ตรงเวลา ทันงาน พร้อมบริการจัดส่งรายคน (kitting) ถ้าต้องการ' },
];

export default function HowItWorks() {
  return (
    <section id="how" className="gp-section" style={{ background: 'var(--gp-cloud)' }}>
      <div className="gp-wrap">
        <GpReveal style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <span className="gp-eyebrow"><span className="dot" />วิธีการทำงาน</span>
          <h2 className="gp-h2" style={{ maxWidth: '20ch' }}>ครบ จบในที่เดียว — ไม่ต้องกลัวงานพลาด</h2>
          <p className="gp-lead" style={{ textAlign: 'center' }}>4 ขั้นตอนที่โปร่งใส ออกแบบมาเพื่อให้ลูกค้า B2B มั่นใจตั้งแต่ทักครั้งแรกจนของถึงมือ</p>
        </GpReveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 18, marginTop: 46 }}>
          {STEPS.map((s, i) => (
            <GpReveal key={i} delay={i * 90}>
              <div className="gp-card" style={{ height: '100%', position: 'relative', overflow: 'hidden', background: s.ai ? 'linear-gradient(165deg,#1F3A5F,#16293F)' : '#fff', color: s.ai ? '#fff' : undefined, border: s.ai ? 'none' : undefined }}>
                {s.ai && <div className="gp-dotgrid on-dark" style={{ position: 'absolute', inset: 0, opacity: .5 }} />}
                <div style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', background: s.ai ? 'rgba(244,189,68,.16)' : 'var(--gp-mustard-soft)', color: s.ai ? 'var(--gp-mustard)' : 'var(--gp-navy)' }}>
                      <GpIcon name={s.icon} size={23} />
                    </div>
                    <span style={{ fontFamily: 'var(--gp-font-head)', fontWeight: 700, fontSize: 26, color: s.ai ? 'rgba(255,255,255,.22)' : 'var(--gp-grey-200)' }}>{s.n}</span>
                  </div>
                  <h4 style={{ fontSize: 18, marginTop: 16, color: s.ai ? '#fff' : 'var(--gp-navy)', display: 'flex', alignItems: 'center', gap: 7 }}>
                    {s.t}
                    {s.ai && <span className="gp-badge gp-badge-ai" style={{ fontSize: 9.5, padding: '3px 8px' }}><GpSpark size={10} />AI</span>}
                  </h4>
                  <p style={{ fontSize: 13.5, marginTop: 8, lineHeight: 1.6, color: s.ai ? '#B9C6DA' : 'var(--gp-grey)' }}>{s.d}</p>
                </div>
              </div>
            </GpReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
