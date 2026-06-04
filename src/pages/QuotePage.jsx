// ============================================================
// GO PREMIUM — /quote  Quote builder + RFQ submission
// Email: info@passiongrow.co.th via Formspree
// ============================================================
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuoteCtx } from '../contexts/QuoteContext';
import { getProduct } from '../data/products';
import Breadcrumbs from '../components/Breadcrumbs';
import GpImage from '../components/shared/GpImage';
import { useMeta } from '../hooks/useMeta';
import { site } from '../config';
import { sendQuote } from '../utils/sendQuote';
import { track } from '../utils/analytics';

export default function QuotePage() {
  const { items, remove, updateQty, clear } = useQuoteCtx();
  const navigate = useNavigate();
  const [f, setF] = useState({ name: '', company: '', contact: '', date: '', message: '' });
  const [err, setErr] = useState({});
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error

  useMeta({
    title: 'ใบขอราคา — GO PREMIUM',
    description: 'ส่งใบขอราคาสินค้าพรีเมียม ทีมเราจะตอบกลับภายใน 48 ชม.',
    canonical: `${site.siteUrl}/quote`,
  });

  function setField(k, v) { setF((p) => ({ ...p, [k]: v })); if (err[k]) setErr((e) => ({ ...e, [k]: null })); }

  async function submit(e) {
    e.preventDefault();
    const errs = {};
    if (!f.name.trim())    errs.name    = 'กรุณากรอกชื่อ';
    if (!f.contact.trim()) errs.contact = 'กรุณากรอกอีเมลหรือเบอร์';
    else if (!/^[\d\s+\-()]{8,}$/.test(f.contact) && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.contact)) {
      errs.contact = 'รูปแบบไม่ถูกต้อง';
    }
    if (items.length === 0) errs.items = 'กรุณาเลือกสินค้าอย่างน้อย 1 รายการ';
    if (!consent) errs.consent = 'กรุณายอมรับนโยบายความเป็นส่วนตัวก่อนส่ง';
    setErr(errs);
    if (Object.keys(errs).length > 0) return;

    // Build product list string for email
    const productLines = items.map((it) => {
      const p = getProduct(it.sku);
      return `- ${p?.name || it.name} (SKU: ${it.sku}) x${it.qty} ชิ้น`;
    }).join('\n');

    const payload = {
      _subject: `[GO PREMIUM] ใบขอราคา — ${f.name} ${f.company ? `(${f.company})` : ''}`,
      _gotcha: '',
      ชื่อ: f.name,
      บริษัท: f.company || '-',
      ติดต่อ: f.contact,
      วันที่ต้องการ: f.date || '-',
      รายการสินค้า: productLines,
      ข้อความเพิ่มเติม: f.message || '-',
    };

    setStatus('submitting');
    const { ok } = await sendQuote(payload);
    if (ok) {
      track('generate_lead', { form: 'quote', items: items.length });
      setStatus('success');
      clear();
    } else {
      setStatus('error');
    }
  }

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh', background: 'var(--gp-cloud)' }}>
      {/* Header */}
      <div style={{ background: 'var(--gp-navy)', padding: '28px 0 24px' }}>
        <div className="gp-wrap">
          <Breadcrumbs crumbs={[{ label: 'หน้าแรก', href: '/' }, { label: 'ใบขอราคา' }]} />
          <h1 style={{ color: '#fff', fontSize: 'clamp(22px,3vw,32px)', marginTop: 12, fontFamily: 'var(--gp-font-head)' }}>ใบขอราคา</h1>
          <p style={{ color: '#CBD7E8', fontSize: 14, marginTop: 5 }}>ตอบกลับพร้อมราคาและ mockup ภายใน 48 ชม.</p>
        </div>
      </div>

      {status === 'success' ? (
        <div style={{ maxWidth: 520, margin: '80px auto', textAlign: 'center', padding: 32 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(34,197,94,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 36 }}>✅</div>
          <h2 style={{ color: 'var(--gp-navy)', fontSize: 26 }}>ส่งใบขอราคาสำเร็จ</h2>
          <p style={{ color: 'var(--gp-grey)', marginTop: 10, lineHeight: 1.65 }}>
            ทีม GO PREMIUM จะติดต่อกลับที่ <b style={{ color: 'var(--gp-navy)' }}>{f.contact}</b> พร้อมไอเดียและช่วงราคาภายใน 48 ชม.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 28 }}>
            <Link to="/" className="gp-btn gp-btn-ghost" style={{ textDecoration: 'none' }}>หน้าแรก</Link>
            <Link to="/products" className="gp-btn gp-btn-primary" style={{ textDecoration: 'none' }}>ช้อปต่อ</Link>
          </div>
        </div>
      ) : (
        <div className="gp-wrap" style={{
          paddingTop: 36, paddingBottom: 64,
          display: 'grid',
          gridTemplateColumns: '1.1fr 1fr',
          gap: 'clamp(20px,3vw,48px)',
          alignItems: 'start',
        }} id="quote-grid">
          {/* Left: product list */}
          <div>
            <div style={{ background: '#fff', borderRadius: 16, padding: '24px 24px 8px', boxShadow: 'var(--gp-shadow)', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, color: 'var(--gp-navy)', marginBottom: 16, fontFamily: 'var(--gp-font-head)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                รายการสินค้า
                <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--gp-grey)' }}>{items.length} รายการ</span>
              </h2>

              {err.items && <p style={{ color: 'var(--gp-danger)', fontSize: 13, marginBottom: 12 }}>{err.items}</p>}

              {items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--gp-grey)' }}>
                  <p style={{ marginBottom: 16 }}>ยังไม่มีสินค้าในรายการ</p>
                  <Link to="/products" className="gp-btn gp-btn-primary" style={{ textDecoration: 'none' }}>เลือกสินค้า</Link>
                </div>
              ) : (
                items.map((it) => {
                  const p = getProduct(it.sku);
                  return (
                    <div key={it.sku} style={{ display: 'flex', gap: 14, paddingBottom: 18, marginBottom: 18, borderBottom: '1px solid var(--gp-grey-200)', alignItems: 'flex-start' }}>
                      <GpImage
                        images={p?.images}
                        variant="square"
                        alt={it.name}
                        style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 10, flex: '0 0 auto', background: 'var(--gp-cloud-2)' }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14.5, color: 'var(--gp-navy)', fontWeight: 500, lineHeight: 1.3 }}>{it.name}</p>
                        <p style={{ fontSize: 12, color: 'var(--gp-grey)', marginTop: 2 }}>SKU: {it.sku}</p>
                        {p?.price_300_thb && (
                          <p style={{ fontSize: 13, color: 'var(--gp-mustard-deep)', marginTop: 2, fontWeight: 500 }}>
                            ฿{p.price_300_thb.toLocaleString()} / ชิ้น
                          </p>
                        )}
                        {/* Qty input */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                          <label style={{ fontSize: 12, color: 'var(--gp-grey)' }}>จำนวน:</label>
                          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--gp-grey-200)', borderRadius: 8, overflow: 'hidden' }}>
                            <button onClick={() => updateQty(it.sku, Math.max((p?.moq || 50), it.qty - 50))}
                              style={{ width: 28, height: 28, border: 'none', background: 'var(--gp-cloud)', cursor: 'pointer', fontSize: 16, color: 'var(--gp-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</button>
                            <input
                              type="number"
                              value={it.qty}
                              min={p?.moq || 50}
                              step={50}
                              onChange={(e) => updateQty(it.sku, Math.max(1, parseInt(e.target.value) || 1))}
                              style={{ width: 52, border: 'none', textAlign: 'center', fontSize: 13, padding: '4px 0', outline: 'none' }}
                            />
                            <button onClick={() => updateQty(it.sku, it.qty + 50)}
                              style={{ width: 28, height: 28, border: 'none', background: 'var(--gp-cloud)', cursor: 'pointer', fontSize: 16, color: 'var(--gp-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                          </div>
                          <span style={{ fontSize: 12, color: 'var(--gp-grey)' }}>ชิ้น</span>
                        </div>
                      </div>
                      <button onClick={() => remove(it.sku)}
                        aria-label="ลบ"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gp-grey)', padding: 4, flexShrink: 0, fontSize: 18 }}>×</button>
                    </div>
                  );
                })
              )}

              {items.length > 0 && (
                <div style={{ paddingBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Link to="/products" style={{ fontSize: 13, color: 'var(--gp-navy)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                    เพิ่มสินค้า
                  </Link>
                  <button onClick={clear} style={{ fontSize: 12, color: 'var(--gp-danger)', background: 'none', border: 'none', cursor: 'pointer' }}>ล้างรายการ</button>
                </div>
              )}
            </div>

            {/* Trust signals */}
            <div style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', boxShadow: 'var(--gp-shadow)' }}>
              {[
                ['🛡️', 'ปลอดภัย ไม่มีข้อผูกมัด', 'ขอราคาฟรี ไม่มีค่าใช้จ่าย'],
                ['⏱️', 'ตอบกลับ 48 ชม.', 'พร้อม mockup และช่วงราคา'],
                ['🎨', 'Mockup ก่อนผลิตทุกครั้ง', 'เห็นผลจริงก่อนตัดสินใจ'],
              ].map(([icon, t, d]) => (
                <div key={t} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
                  <div>
                    <p style={{ fontSize: 13.5, color: 'var(--gp-navy)', fontWeight: 500 }}>{t}</p>
                    <p style={{ fontSize: 12, color: 'var(--gp-grey)' }}>{d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: form */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 'clamp(20px,3vw,32px)', boxShadow: 'var(--gp-shadow)' }}>
            <h2 style={{ fontSize: 20, color: 'var(--gp-navy)', marginBottom: 20, fontFamily: 'var(--gp-font-head)' }}>ข้อมูลการติดต่อ</h2>
            <form onSubmit={submit} noValidate>
              {/* honeypot */}
              <input type="text" name="_gotcha" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

              <Field label="ชื่อ *" error={err.name}>
                <input className={`gp-input${err.name ? ' err' : ''}`} value={f.name} onChange={(e) => setField('name', e.target.value)} placeholder="ชื่อ-นามสกุล" />
              </Field>
              <Field label="บริษัท / องค์กร">
                <input className="gp-input" value={f.company} onChange={(e) => setField('company', e.target.value)} placeholder="ชื่อบริษัท (ถ้ามี)" />
              </Field>
              <Field label="อีเมล หรือ เบอร์โทร *" error={err.contact}>
                <input className={`gp-input${err.contact ? ' err' : ''}`} value={f.contact} onChange={(e) => setField('contact', e.target.value)} placeholder="you@company.com หรือ 08x-xxx-xxxx" />
              </Field>
              <Field label="วันที่ต้องการรับสินค้า">
                <input className="gp-input" type="date" value={f.date} onChange={(e) => setField('date', e.target.value)} />
              </Field>
              <Field label="ข้อความเพิ่มเติม">
                <textarea className="gp-textarea" value={f.message} onChange={(e) => setField('message', e.target.value)} placeholder="สี, ดีไซน์, ข้อกำหนดพิเศษ..." />
              </Field>

              {/* PDPA consent */}
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginBottom: 6, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => { setConsent(e.target.checked); if (err.consent) setErr((p) => ({ ...p, consent: null })); }}
                  style={{ width: 16, height: 16, marginTop: 2, accentColor: 'var(--gp-navy)', flex: '0 0 auto' }}
                />
                <span style={{ fontSize: 12.5, color: 'var(--gp-grey)', lineHeight: 1.55 }}>
                  ฉันยินยอมให้ GO PREMIUM เก็บและใช้ข้อมูลเพื่อติดต่อกลับและเสนอราคา ตาม
                  <Link to="/privacy" target="_blank" style={{ color: 'var(--gp-navy)', textDecoration: 'underline' }}>นโยบายความเป็นส่วนตัว</Link>
                </span>
              </label>
              {err.consent && <p style={{ color: 'var(--gp-danger)', fontSize: 13, marginBottom: 8 }}>{err.consent}</p>}

              {status === 'error' && (
                <p style={{ color: 'var(--gp-danger)', fontSize: 13, marginBottom: 12 }}>
                  เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง หรือติดต่อ {site.email}
                </p>
              )}

              <button
                type="submit"
                className="gp-btn gp-btn-primary gp-btn-lg"
                style={{ width: '100%', marginTop: 4 }}
                disabled={status === 'submitting' || !consent}
              >
                {status === 'submitting' ? 'กำลังส่ง...' : 'ส่งใบขอราคา'}
                {status !== 'submitting' && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 6 }}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                )}
              </button>
              <p style={{ fontSize: 12, color: 'var(--gp-grey)', textAlign: 'center', marginTop: 10 }}>
                ส่งถึง {site.email} · ปรึกษาฟรี ไม่มีข้อผูกมัด
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div className="gp-field" style={{ marginBottom: 14 }}>
      <label className="gp-label">{label}</label>
      {children}
      {error && <span className="gp-errmsg">{error}</span>}
    </div>
  );
}
