import { useState } from 'react';
import HeroCarousel from './HeroCarousel';
import GpIcon from './shared/GpIcon';
import GpSpark from './shared/GpSpark';
import GpImage from './shared/GpImage';
import { variantSet } from '../utils/images';
import { gpScrollTo } from '../utils/scroll';

function ImgPanel() {
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ width: '100%', height: 'min(560px,62vh)', borderRadius: 22, boxShadow: 'var(--gp-shadow)', overflow: 'hidden', background: 'var(--gp-cloud-2)' }}>
        <GpImage images={variantSet('giftset-aroma')} variant="hero" alt="กิฟต์เซ็ตพรีเมียมองค์กร ออกแบบเฉพาะแบรนด์ โดย GO PREMIUM"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
      <div style={{ position: 'absolute', left: -18, bottom: 34, background: '#fff', borderRadius: 16, padding: '13px 15px', boxShadow: 'var(--gp-shadow-md)', width: 212, border: '1px solid var(--gp-grey-200)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11.5, color: 'var(--gp-mustard-deep)', fontFamily: 'var(--gp-font-head)', fontWeight: 600, whiteSpace: 'nowrap' }}>
          <GpSpark size={12} /> AI แนะนำ
        </div>
        <div style={{ fontFamily: 'var(--gp-font-head)', fontWeight: 600, fontSize: 14.5, color: 'var(--gp-navy)', marginTop: 5 }}>เซ็ตรักษ์โลก Everyday</div>
        <div style={{ fontSize: 11.5, color: 'var(--gp-grey)', marginTop: 2 }}>กระบอกน้ำ · กระเป๋าผ้า · สมุดรีไซเคิล</div>
        <div style={{ fontFamily: 'var(--gp-font-head)', fontWeight: 600, fontSize: 12.5, color: 'var(--gp-navy)', marginTop: 7 }}>งบยืดหยุ่น <span style={{ fontWeight: 400, color: 'var(--gp-grey)', fontSize: 11 }}>· ปรับตามจำนวน</span></div>
      </div>
      <div style={{ position: 'absolute', right: -12, top: 26, background: 'var(--gp-navy)', color: '#fff', borderRadius: 14, padding: '11px 14px', boxShadow: 'var(--gp-shadow-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11.5, fontFamily: 'var(--gp-font-head)', fontWeight: 600, color: 'var(--gp-mustard)' }}>
          <GpIcon name="check" size={13} stroke="var(--gp-mustard)" sw={2.6} /> Mockup ก่อนผลิต
        </div>
        <div style={{ fontSize: 11, color: '#C7D4E6', marginTop: 4 }}>เห็นงานจริงก่อนตัดสินใจ</div>
      </div>
    </div>
  );
}

export default function Hero({ onQuote }) {
  const [hq, setHq] = useState('');

  function runAI() {
    const t = hq.trim() || 'ของขวัญปีใหม่พนักงาน 200 คน งบ 300฿ สายมินิมอล';
    gpScrollTo('ai');
    setTimeout(() => window.dispatchEvent(new CustomEvent('gp-ai-run', { detail: { query: t } })), 480);
  }

  return (
    <section id="top" style={{ position: 'relative', overflow: 'hidden', paddingTop: 118, paddingBottom: 'clamp(48px,7vw,88px)', background: 'linear-gradient(180deg,#FBFCFD 0%, var(--gp-cloud) 100%)' }}>
      <div className="gp-dotgrid" style={{ position: 'absolute', inset: 0, opacity: .5, maskImage: 'radial-gradient(120% 90% at 70% 0%, #000 30%, transparent 75%)', WebkitMaskImage: 'radial-gradient(120% 90% at 70% 0%, #000 30%, transparent 75%)' }} />
      <div style={{ position: 'absolute', right: '-8%', top: '-12%', width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, rgba(244,189,68,.30), transparent 60%)', pointerEvents: 'none' }} />
      <div className="gp-wrap" style={{ position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.04fr .96fr', gap: 'clamp(28px,4vw,64px)', alignItems: 'center' }} className="gp-hero-split">
          <div>
            <span className="gp-eyebrow"><span className="dot" />ของขวัญองค์กร · ดีไซน์เฉพาะแบรนด์คุณ</span>
            <h1 style={{ fontSize: 'clamp(34px,5.2vw,66px)', color: 'var(--gp-navy)', letterSpacing: '-.03em', marginTop: 18, fontWeight: 800, textWrap: 'balance', lineHeight: 1 }}>
              มากกว่าของขวัญ<br />
              คือ<span style={{ position: 'relative', whiteSpace: 'nowrap' }}>
                <span style={{ color: 'var(--gp-mustard-deep)' }}>ประสบการณ์</span>
              </span>ที่น่าจดจำ
            </h1>
            <p className="gp-lead" style={{ marginTop: 18, maxWidth: '46ch' }}>
              เราออกแบบและผลิตของพรีเมียมที่สะท้อนแบรนด์คุณ ครบตั้งแต่คอนเซ็ปต์ ดีไซน์ ผลิต ถึงส่งมอบ — และตอนนี้มี <b style={{ color: 'var(--gp-navy)' }}>AI ช่วยคิดเซ็ตของขวัญ</b> ให้คุณในไม่กี่วินาที
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 26, alignItems: 'center' }}>
              <button className="gp-btn gp-btn-primary gp-btn-lg" onClick={onQuote}>ขอใบเสนอราคา <GpIcon name="arrow" size={17} /></button>
              <button className="gp-btn gp-btn-ghost gp-btn-lg" onClick={() => gpScrollTo('portfolio')}>ดูผลงานจริง</button>
            </div>
            <div style={{ marginTop: 26, maxWidth: 560 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8, fontSize: 12.5, color: 'var(--gp-grey)', fontFamily: 'var(--gp-font-head)' }}>
                <GpSpark size={13} style={{ color: 'var(--gp-mustard-deep)' }} /> ลองให้ AI ช่วยคิดของขวัญ — พิมพ์โจทย์ของคุณ
              </div>
              <div style={{ display: 'flex', gap: 8, background: '#fff', border: '1.5px solid var(--gp-grey-200)', borderRadius: 14, padding: 7, boxShadow: 'var(--gp-shadow-sm)' }}>
                <input className="gp-input" value={hq} onChange={(e) => setHq(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') runAI(); }}
                  placeholder="เช่น ของขวัญลูกค้า VIP 50 ชุด ดูหรู"
                  style={{ border: 'none', boxShadow: 'none', flex: 1, minWidth: 0 }} />
                <button className="gp-btn gp-btn-secondary" onClick={runAI} style={{ flex: '0 0 auto' }}><GpSpark size={15} /> ถาม AI</button>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 26, flexWrap: 'wrap', marginTop: 34 }}>
              {[['7–14 วัน', 'งานพร้อมส่ง'], ['2 ชม.', 'ตอบกลับ + เสนอราคา'], ['100%', 'Mockup ก่อนผลิต']].map((s, i) => (
                <div key={i}>
                  <div style={{ fontFamily: 'var(--gp-font-head)', fontWeight: 700, fontSize: 24, color: 'var(--gp-navy)' }}>{s[0]}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--gp-grey)' }}>{s[1]}</div>
                </div>
              ))}
            </div>
          </div>
          <div><HeroCarousel /></div>
        </div>
      </div>
    </section>
  );
}
