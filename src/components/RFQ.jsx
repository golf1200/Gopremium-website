import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import GpIcon from './shared/GpIcon';
import { site } from '../config';
import { sendQuote } from '../utils/sendQuote';
import { track } from '../utils/analytics';

export default function RFQ({ prefill }) {
  const [f, setF] = useState({ name: '', contact: '', occasion: 'ของขวัญปีใหม่พนักงาน', qty: '', date: '', budget: '', details: '' });
  const [err, setErr] = useState({});
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | submitting | error
  const [sent, setSent] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (prefill && prefill.text) {
      setF((p) => ({ ...p, details: prefill.text }));
      setSent(false);
      if (prefill.occasion) setF((p) => ({ ...p, occasion: prefill.occasion, details: prefill.text }));
    }
  }, [prefill]);

  function set(k, v) { setF((p) => ({ ...p, [k]: v })); if (err[k]) setErr((e) => ({ ...e, [k]: null })); }

  async function submit() {
    const e = {};
    if (!f.name.trim()) e.name = 'กรุณากรอกชื่อ-บริษัท';
    if (!f.contact.trim()) e.contact = 'กรุณากรอกอีเมลหรือเบอร์โทร';
    else if (!/^[\d\s+\-()]{8,}$/.test(f.contact) && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.contact)) e.contact = 'รูปแบบอีเมล/เบอร์ไม่ถูกต้อง';
    if (!consent) e.consent = 'กรุณายอมรับนโยบายความเป็นส่วนตัวก่อนส่ง';
    setErr(e);
    if (Object.keys(e).length > 0) return;

    const payload = {
      _subject: `[GO PREMIUM] ขอใบเสนอราคา — ${f.name}`,
      _gotcha: '',
      ชื่อ_บริษัท: f.name,
      ติดต่อ: f.contact,
      โอกาส_งาน: f.occasion,
      จำนวน: f.qty || '-',
      ต้องการรับงาน: f.date || '-',
      งบต่อชิ้น: f.budget || '-',
      รายละเอียด: f.details || '-',
    };

    setStatus('submitting');
    const { ok } = await sendQuote(payload);
    if (ok) {
      track('generate_lead', { form: 'rfq', occasion: f.occasion });
      setStatus('idle');
      setSent(true);
    } else {
      setStatus('error');
    }
  }

  return (
    <section id="rfq" ref={ref} className="gp-section" style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(165deg,#16293F,#1F3A5F)', color: '#fff' }}>
      <div className="gp-dotgrid on-dark" style={{ position: 'absolute', inset: 0, opacity: .5 }} />
      <div style={{ position: 'absolute', left: '-6%', bottom: '-20%', width: 460, height: 460, borderRadius: '50%', background: 'radial-gradient(circle at 40% 40%, rgba(244,189,68,.28), transparent 62%)', pointerEvents: 'none' }} />
      <div className="gp-wrap gp-rfq-grid" style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 'clamp(28px,4.5vw,72px)', alignItems: 'center' }}>
        <div>
          <span className="gp-eyebrow on-dark"><span className="dot" />ขอใบเสนอราคา · ปรึกษาฟรี</span>
          <h2 className="gp-h2 on-dark" style={{ marginTop: 16, maxWidth: '15ch' }}>เริ่มของขวัญชิ้นต่อไปของคุณ</h2>
          <p className="gp-lead on-dark" style={{ marginTop: 14, maxWidth: '42ch' }}>กรอกข้อมูลสั้นๆ ทีมเราจะตอบกลับพร้อมไอเดียและช่วงราคาภายใน 48 ชม. ปรึกษาฟรี ไม่มีข้อผูกมัด</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 26 }}>
            {[['shield','นิติบุคคลจดทะเบียน เชื่อถือได้'],['clock','ตอบกลับ + เสนอราคาใน 48 ชม.'],['palette','Mockup ก่อนผลิตเสมอ']].map((x, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, color: '#CBD7E8', fontSize: 14 }}>
                <span style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(244,189,68,.15)', color: 'var(--gp-mustard)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
                  <GpIcon name={x[0]} size={18} />
                </span>
                {x[1]}
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: '#fff', borderRadius: 'var(--gp-radius-lg)', padding: 'clamp(22px,3vw,34px)', boxShadow: 'var(--gp-shadow)', color: 'var(--gp-ink)' }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '24px 8px' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--gp-mustard-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                <GpIcon name="check" size={34} stroke="var(--gp-navy)" sw={2.4} />
              </div>
              <h3 style={{ fontSize: 23, color: 'var(--gp-navy)' }}>ได้รับคำขอแล้ว ขอบคุณค่ะ</h3>
              <p style={{ fontSize: 14, color: 'var(--gp-grey)', marginTop: 10, maxWidth: '36ch', marginLeft: 'auto', marginRight: 'auto' }}>
                ทีม GO PREMIUM จะติดต่อกลับที่ <b style={{ color: 'var(--gp-navy)' }}>{f.contact}</b> พร้อมไอเดียและช่วงราคาภายใน 48 ชม.
              </p>
              <button className="gp-btn gp-btn-ghost" style={{ marginTop: 22 }}
                onClick={() => { setSent(false); setF({ name:'', contact:'', occasion:'ของขวัญปีใหม่พนักงาน', qty:'', date:'', budget:'', details:'' }); }}>
                ส่งคำขอใหม่
              </button>
            </div>
          ) : (
            <div>
              <h3 style={{ fontSize: 21, color: 'var(--gp-navy)', marginBottom: 4 }}>แบบฟอร์มขอใบเสนอราคา</h3>
              <p style={{ fontSize: 12.5, color: 'var(--gp-grey)', marginBottom: 18 }}>ใช้เวลาไม่ถึง 1 นาที · <span style={{ color: 'var(--gp-danger)' }}>*</span> จำเป็น</p>
              <div className="gp-field" style={{ marginBottom: 13 }}>
                <label className="gp-label">ชื่อ-บริษัท <span style={{ color: 'var(--gp-danger)' }}>*</span></label>
                <input className={`gp-input${err.name ? ' err' : ''}`} value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="เช่น คุณแป้ง · บริษัท ABC" />
                {err.name && <span className="gp-errmsg">{err.name}</span>}
              </div>
              <div className="gp-field" style={{ marginBottom: 13 }}>
                <label className="gp-label">อีเมล หรือ เบอร์โทร <span style={{ color: 'var(--gp-danger)' }}>*</span></label>
                <input className={`gp-input${err.contact ? ' err' : ''}`} value={f.contact} onChange={(e) => set('contact', e.target.value)} placeholder="you@company.com หรือ 08x-xxx-xxxx" />
                {err.contact && <span className="gp-errmsg">{err.contact}</span>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13, marginBottom: 13 }}>
                <div className="gp-field">
                  <label className="gp-label">โอกาส / งาน</label>
                  <select className="gp-select" value={f.occasion} onChange={(e) => set('occasion', e.target.value)}>
                    <option>ของขวัญปีใหม่พนักงาน</option>
                    <option>ของขวัญลูกค้า / คู่ค้า</option>
                    <option>อีเวนต์ / แคมเปญ</option>
                    <option>ต้อนรับพนักงานใหม่</option>
                    <option>อื่น ๆ</option>
                  </select>
                </div>
                <div className="gp-field">
                  <label className="gp-label">จำนวน (ชิ้น)</label>
                  <input className="gp-input" value={f.qty} onChange={(e) => set('qty', e.target.value)} placeholder="เช่น 200" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13, marginBottom: 13 }}>
                <div className="gp-field">
                  <label className="gp-label">ต้องการรับงาน</label>
                  <input className="gp-input" type="date" value={f.date} onChange={(e) => set('date', e.target.value)} />
                </div>
                <div className="gp-field">
                  <label className="gp-label">งบ/ชิ้น (฿)</label>
                  <input className="gp-input" value={f.budget} onChange={(e) => set('budget', e.target.value)} placeholder="เช่น 300" />
                </div>
              </div>
              <div className="gp-field" style={{ marginBottom: 18 }}>
                <label className="gp-label">รายละเอียดเพิ่มเติม</label>
                <textarea className="gp-textarea" value={f.details} onChange={(e) => set('details', e.target.value)} placeholder="บอกคอนเซ็ปต์หรือสินค้าที่สนใจ" />
              </div>

              {/* honeypot — hidden from users, traps bots */}
              <input type="text" name="_gotcha" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

              {/* PDPA consent */}
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginBottom: 6, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(ev) => { setConsent(ev.target.checked); if (err.consent) setErr((p) => ({ ...p, consent: null })); }}
                  style={{ width: 16, height: 16, marginTop: 2, accentColor: 'var(--gp-navy)', flex: '0 0 auto' }}
                />
                <span style={{ fontSize: 12.5, color: 'var(--gp-grey)', lineHeight: 1.55 }}>
                  ฉันยินยอมให้ GO PREMIUM เก็บและใช้ข้อมูลเพื่อติดต่อกลับและเสนอราคา ตาม
                  <Link to="/privacy" target="_blank" style={{ color: 'var(--gp-navy)', textDecoration: 'underline' }}>นโยบายความเป็นส่วนตัว</Link>
                </span>
              </label>
              {err.consent && <span className="gp-errmsg" style={{ display: 'block', marginBottom: 8 }}>{err.consent}</span>}

              {status === 'error' && (
                <p style={{ color: 'var(--gp-danger)', fontSize: 13, marginBottom: 12 }}>
                  เกิดข้อผิดพลาด กรุณาลองใหม่ หรือติดต่อ {site.email}
                </p>
              )}

              <button className="gp-btn gp-btn-primary gp-btn-lg" style={{ width: '100%' }} onClick={submit}
                disabled={status === 'submitting' || !consent}>
                {status === 'submitting' ? 'กำลังส่ง...' : <>ส่งขอใบเสนอราคา <GpIcon name="arrow" size={17} /></>}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
