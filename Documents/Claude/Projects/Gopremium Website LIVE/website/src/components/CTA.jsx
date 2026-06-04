import GpSpark from './shared/GpSpark';
import { gpScrollTo } from '../utils/scroll';

export default function CTA({ onQuote }) {
  return (
    <section className="gp-section" style={{ background: 'var(--gp-cloud)', paddingTop: 'clamp(48px,7vw,80px)', paddingBottom: 'clamp(48px,7vw,80px)' }}>
      <div className="gp-wrap">
        <div style={{ background: 'var(--gp-mustard)', borderRadius: 'var(--gp-radius-lg)', padding: 'clamp(30px,4.5vw,56px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -60, top: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,.22)' }} />
          <div style={{ position: 'relative', maxWidth: '30ch' }}>
            <h2 style={{ fontSize: 'clamp(26px,3.2vw,40px)', color: 'var(--gp-navy)', letterSpacing: '-.02em' }}>พร้อมเริ่มของขวัญชิ้นต่อไปแล้วหรือยัง</h2>
            <p style={{ color: '#6B4E08', fontSize: 16, marginTop: 10 }}>ปรึกษาฟรี พร้อม Mockup ก่อนผลิต — หรือให้ AI ช่วยคิดเซ็ตให้ก่อนก็ได้</p>
          </div>
          <div style={{ position: 'relative', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="gp-btn gp-btn-secondary gp-btn-lg" onClick={onQuote}>คุยกับเราเลย</button>
            <button className="gp-btn gp-btn-ghost gp-btn-lg" style={{ borderColor: 'rgba(31,58,95,.3)', color: 'var(--gp-navy)' }} onClick={() => gpScrollTo('ai')}>
              <GpSpark size={16} /> ลอง AI Concierge
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
