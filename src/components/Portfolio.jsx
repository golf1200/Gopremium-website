import { useRef } from 'react';
import GpIcon from './shared/GpIcon';
import GpReveal from './shared/GpReveal';

const CASES = [
  { t: 'เซ็ตปีใหม่ บริษัท ABC', tag: 'Case study · 500 ชุด', d: 'ออกแบบกล่อง + การ์ดเฉพาะแบรนด์ ส่งทันปีใหม่', tint: ['#1F3A5F','#2C4F7C'] },
  { t: 'Welcome Kit · SiamTech', tag: 'Onboarding · 120 ชุด', d: 'ชุดต้อนรับพนักงานใหม่ สาย minimal สีแบรนด์', tint: ['#2C4F7C','#3E689B'] },
  { t: 'Press Kit เปิดตัวสินค้า', tag: 'Event · 80 ชุด', d: 'กล่องสื่อมวลชนพรีเมียม ถ่ายรูปลงสื่อสวย', tint: ['#16293F','#244873'] },
  { t: 'VIP Box · NovaBank', tag: 'Client gift · 60 ชุด', d: 'กล่องหนังหรู สลักชื่อลูกค้าคนสำคัญรายบุคคล', tint: ['#3A4250','#566075'] },
  { t: 'Eco Set · Greenleaf', tag: 'รักษ์โลก · 300 ชุด', d: 'วัสดุรีไซเคิล 100% เล่าเรื่องความยั่งยืน', tint: ['#2F4A3A','#3E689B'] },
  { t: 'ครบรอบ 10 ปี Lotus', tag: 'Milestone · 250 ชุด', d: 'ของที่ระลึกครบรอบ ดีไซน์พิเศษเฉพาะวาระ', tint: ['#1F3A5F','#16293F'] },
];

function CaseCard({ c, h = 236 }) {
  return (
    <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--gp-shadow-sm)', border: '1px solid var(--gp-grey-200)', background: '#fff' }}>
      <div style={{ position: 'relative' }}>
        <div style={{ width: '100%', height: h, background: `linear-gradient(135deg,${c.tint[0]},${c.tint[1]})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="gp-dotgrid on-dark" style={{ position: 'absolute', inset: 0, opacity: .4 }} />
          <GpIcon name="box" size={36} stroke="rgba(255,255,255,.25)" />
        </div>
        <span className="gp-badge gp-badge-glass" style={{ position: 'absolute', top: 12, left: 12, fontSize: 11 }}>{c.tag}</span>
      </div>
      <div style={{ padding: '15px 17px 18px' }}>
        <h4 style={{ fontSize: 17, color: 'var(--gp-navy)' }}>{c.t}</h4>
        <p style={{ fontSize: 13, color: 'var(--gp-grey)', marginTop: 6, lineHeight: 1.55 }}>{c.d}</p>
      </div>
    </div>
  );
}

export default function Portfolio() {
  const scroller = useRef(null);
  const nudge = (dir) => {
    const el = scroller.current;
    if (el) el.scrollBy({ left: dir * Math.min(380, el.clientWidth * .8), behavior: 'smooth' });
  };

  return (
    <section id="portfolio" className="gp-section" style={{ background: 'var(--gp-cloud)' }}>
      <div className="gp-wrap">
        <GpReveal style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13, maxWidth: '56ch' }}>
            <span className="gp-eyebrow"><span className="dot" />ผลงานจริง</span>
            <h2 className="gp-h2">งานที่ส่งมอบแล้ว <br />คือคำสัญญาที่จับต้องได้</h2>
            <p className="gp-lead">เลือกดูตามโอกาส — ปีใหม่ ต้อนรับพนักงาน อีเวนต์ และลูกค้า VIP ทุกชิ้นผ่าน Mockup ก่อนผลิตจริง</p>
          </div>
        </GpReveal>
        <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: 20 }}>
          {CASES.map((c, i) => (
            <GpReveal key={i} delay={(i % 3) * 80}><CaseCard c={c} /></GpReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
