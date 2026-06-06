import GpIcon from './shared/GpIcon';
import GpReveal from './shared/GpReveal';

// NOTE: representative value statements with generic attribution (no fabricated
// company/person names). Replace with real, verified testimonials when available.
const ITEMS = [
  { q: 'งานดีไซน์เนี้ยบ ส่งตรงเวลา คุยง่าย ทำให้มั่นใจที่จะสั่งต่อในปีถัดไป', r: 'ผู้จัดการฝ่าย HR · องค์กรเอกชน · Q4 2025', a: 'H' },
  { q: 'AI ช่วยร่นเวลาเลือกของได้เยอะ ได้ไอเดียเซ็ตที่ตรงโจทย์เร็วขึ้นมาก', r: 'ฝ่ายการตลาด · เอเจนซีโฆษณา · Q1 2026', a: 'M' },
  { q: 'เห็น Mockup ก่อนผลิตทำให้ตัดสินใจได้สบายใจ ไม่ต้องลุ้นว่างานจะพลาด', r: 'ฝ่ายจัดซื้อ · บริษัทในตลาดหลักทรัพย์ · Q4 2025', a: 'P' },
];

export default function Reviews() {
  return (
    <section id="reviews" className="gp-section" style={{ background: '#fff' }}>
      <div className="gp-wrap">
        <GpReveal style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 13 }}>
          <span className="gp-eyebrow"><span className="dot" />ทำไมต้อง GO PREMIUM</span>
          <h2 className="gp-h2" style={{ maxWidth: '18ch' }}>ลูกค้า B2B กลัวงานพลาด เราจึงทำให้ไว้ใจได้</h2>
        </GpReveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 18, marginTop: 42 }}>
          {ITEMS.map((it, i) => (
            <GpReveal key={i} delay={i * 90}>
              <div className="gp-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', background: i === 1 ? 'linear-gradient(165deg,#1F3A5F,#16293F)' : '#fff', color: i === 1 ? '#fff' : undefined, border: i === 1 ? 'none' : undefined, position: 'relative', overflow: 'hidden' }}>
                {i === 1 && <div className="gp-dotgrid on-dark" style={{ position: 'absolute', inset: 0, opacity: .4 }} />}
                <div style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', gap: 3, color: 'var(--gp-mustard)', marginBottom: 13 }}>
                    {[0,1,2,3,4].map((s) => <GpIcon key={s} name="star" size={16} stroke="none" />)}
                  </div>
                  <p style={{ fontSize: 16, lineHeight: 1.6, color: i === 1 ? '#E6EDF6' : 'var(--gp-ink)', fontFamily: 'var(--gp-font-head)', fontWeight: 400 }}>"{it.q}"</p>
                  <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 11 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: i === 1 ? 'rgba(244,189,68,.2)' : 'var(--gp-mustard-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--gp-font-head)', fontWeight: 700, color: i === 1 ? 'var(--gp-mustard)' : 'var(--gp-navy)' }}>{it.a}</div>
                    <div>
                      <div style={{ fontSize: 12.5, color: i === 1 ? '#9FB2CC' : 'var(--gp-grey)' }}>{it.r}</div>
                    </div>
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
