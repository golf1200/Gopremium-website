import GpReveal from './shared/GpReveal';

// Concept examples (representative set ideas, real product imagery).
// Not claimed as specific delivered client projects — see Trust section for real clients.
const CASES = [
  { t: 'เซ็ตปีใหม่องค์กร', tag: 'New Year', d: 'กล่อง + การ์ดเฉพาะแบรนด์ จัดเป็นเซ็ตพร้อมมอบ', img: 'giftset-executive.jpg' },
  { t: 'Welcome Kit พนักงานใหม่', tag: 'Onboarding', d: 'ชุดต้อนรับสาย minimal โทนสีแบรนด์', img: 'drinkware-chill.jpg' },
  { t: 'Eco Lifestyle Set', tag: 'รักษ์โลก', d: 'ของใช้คุณภาพ เล่าเรื่องความยั่งยืนขององค์กร', img: 'lifestyle-towel.jpg' },
  { t: 'VIP Gift Box', tag: 'Client gift', d: 'กล่องของขวัญพรีเมียมสำหรับลูกค้าคนสำคัญ', img: 'giftset-aroma.jpg' },
  { t: 'Event Giveaway', tag: 'Event', d: 'ของแจกพิมพ์โลโก้ ถ่ายรูปสวย พร้อมส่งทันงาน', img: 'bag-snap.jpg' },
  { t: 'Custom Drinkware', tag: 'Milestone', d: 'กระบอกน้ำดีไซน์เฉพาะวาระ สลักโลโก้แบรนด์', img: 'drinkware-milo.jpg' },
];

function CaseCard({ c }) {
  return (
    <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--gp-shadow-sm)', border: '1px solid var(--gp-grey-200)', background: '#fff', height: '100%' }}>
      <div style={{ position: 'relative', height: 236, background: 'var(--gp-cloud-2)', overflow: 'hidden' }}>
        <img src={`/images/${c.img}`} alt={`${c.t} — ตัวอย่างเซ็ตของขวัญองค์กร GO PREMIUM`} loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
  return (
    <section id="portfolio" className="gp-section" style={{ background: 'var(--gp-cloud)' }}>
      <div className="gp-wrap">
        <GpReveal style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13, maxWidth: '56ch' }}>
            <span className="gp-eyebrow"><span className="dot" />ตัวอย่างแนวงาน</span>
            <h2 className="gp-h2">ไอเดียเซ็ตของขวัญ <br />ที่เราออกแบบให้ได้</h2>
            <p className="gp-lead">ตัวอย่างแนวทางการจัดเซ็ตตามโอกาส — ปีใหม่ ต้อนรับพนักงาน อีเวนต์ และลูกค้า VIP ทุกงานผ่าน Mockup ก่อนผลิตจริง</p>
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
