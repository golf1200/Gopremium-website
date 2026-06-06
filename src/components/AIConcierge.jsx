import { useState, useRef, useEffect } from 'react';
import GpSpark from './shared/GpSpark';
import { track } from '../utils/analytics';

const EXAMPLES = [
  'ของขวัญปีใหม่พนักงาน 200 คน งบ 300฿/ชิ้น สายรักษ์โลก',
  'ของขวัญลูกค้า VIP ดูหรู พรีเมียม 50 ชุด',
  'ชุดต้อนรับพนักงานใหม่ (onboarding) สาย minimal',
  'ของแจกงานอีเวนต์เปิดตัวสินค้า ถ่ายรูปสวย งบประหยัด',
];

const TINTS = [
  ['#1F3A5F','#2C4F7C'],['#2C4F7C','#3E689B'],['#16293F','#1F3A5F'],
  ['#5B6472','#7A8497'],['#E0A92B','#F4BD44'],['#3A4250','#566075'],
];

function ProductMock({ label, tint }) {
  return (
    <div style={{ position: 'relative', height: 74, borderRadius: 11, overflow: 'hidden', background: `linear-gradient(135deg, ${tint[0]}, ${tint[1]})`, display: 'flex', alignItems: 'flex-end', padding: '9px 10px', border: '1px solid rgba(255,255,255,.18)' }}>
      <div style={{ position: 'absolute', top: 8, right: 8, fontFamily: 'var(--gp-font-head)', fontSize: 8.5, fontWeight: 600, letterSpacing: '.06em', color: 'rgba(255,255,255,.92)', background: 'rgba(0,0,0,.22)', borderRadius: 99, padding: '3px 7px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <GpSpark size={9} /> โลโก้คุณ
      </div>
      <span style={{ fontFamily: 'var(--gp-font-head)', fontSize: 11.5, fontWeight: 500, color: '#fff', lineHeight: 1.25 }}>{label}</span>
    </div>
  );
}

function gpFallback(brief) {
  const b = (brief || '').toLowerCase();
  const eco = /(รักษ์โลก|eco|green|ยั่งยืน|รีไซเคิล)/.test(b);
  const vip = /(vip|หรู|พรีเมียม|ผู้บริหาร|ลูกค้าคนสำคัญ|luxury)/.test(b);
  const onboard = /(onboard|พนักงานใหม่|ต้อนรับ|welcome)/.test(b);
  const event = /(อีเวนต์|event|เปิดตัว|บูธ|งานแสดง|สัมมนา)/.test(b);
  const m = b.match(/(\d{2,4})\s*(฿|บาท|baht)?\s*\/?\s*(ชิ้น|คน|ชุด)?/);
  const budget = m ? parseInt(m[1], 10) : 0;
  const lo = budget ? Math.max(120, Math.round(budget * 0.85)) : 180;
  const hi = budget ? Math.round(budget * 1.35) : 520;

  let sets = [
    { name: 'เซ็ตรักษ์โลก Everyday', concept: 'ของใช้ประจำวันสายกรีน ใช้ได้จริงทุกวัน สะท้อนภาพองค์กรใส่ใจสิ่งแวดล้อม', items: ['กระบอกน้ำสเตนเลส','กระเป๋าผ้าแคนวาส','สมุดกระดาษรีไซเคิล','ปากกาไม้'], tags: ['รักษ์โลก','ใช้ได้จริง'] },
    { name: 'Minimal Desk Set', concept: 'เซ็ตของใช้บนโต๊ะทำงานดีไซน์มินิมอล โทนแบรนด์ ดูเรียบแต่พรีเมียม', items: ['สมุดปกหนัง PU','ปากกาโลหะ','ที่รองแก้วไม้','แท็กแบรนด์'], tags: ['มินิมอล','ดูแพง'] },
    { name: 'Cozy Welcome Kit', concept: 'ชุดต้อนรับอบอุ่น สร้างความประทับใจตั้งแต่วันแรก เหมาะเป็นของขวัญสายสัมพันธ์', items: ['แก้วเซรามิก','ผ้าห่มนาโน','ขนม/ชาพรีเมียม','การ์ดต้อนรับ'], tags: ['อบอุ่น','ขายดี'] },
  ];

  if (vip) sets = [
    { name: 'Signature VIP Box', concept: 'กล่องของขวัญหรูสำหรับลูกค้าคนสำคัญ วัสดุพรีเมียม จับแล้วรู้สึกถึงคุณค่า', items: ['กระเป๋าหนังแท้','ปากกาโลหะสลักชื่อ','ไดอารี่ปกหนัง','กล่องแม่เหล็กพรีเมียม'], tags: ['VIP','หรูหรา'] },
    { name: 'Executive Tea Ritual', concept: 'เซ็ตชา/กาแฟระดับผู้บริหาร พร้อมแก้วและกล่องไม้ ดูมีรสนิยม', items: ['แก้วดับเบิลวอลล์','ชา/กาแฟพรีเมียม','กล่องไม้ฝาสไลด์','การ์ดเขียนมือ'], tags: ['VIP','มีรสนิยม'] },
    { name: 'Tech Premium Set', concept: 'แก็ดเจ็ตพรีเมียมที่ผู้บริหารได้ใช้จริง สลักโลโก้ดูเนียนกับแบรนด์', items: ['พาวเวอร์แบงก์','แท่นชาร์จไร้สาย','กระเป๋าใส่อุปกรณ์','สาย USB ถัก'], tags: ['VIP','ใช้ได้จริง'] },
  ];
  else if (onboard) sets = [
    { name: 'Day-One Welcome Kit', concept: 'ทุกอย่างที่พนักงานใหม่ต้องใช้วันแรก จัดเป็นเซ็ตเดียวดูตั้งใจ', items: ['กระบอกน้ำ','สมุด+ปากกา','สายคล้องบัตร','การ์ดต้อนรับ'], tags: ['onboarding','มินิมอล'] },
    { name: 'Remote Starter Set', concept: 'ชุดสำหรับทีม hybrid/remote ทำงานที่ไหนก็ดูโปร', items: ['กระเป๋าแล็ปท็อป','เมาส์แพด','แก้วเก็บอุณหภูมิ','สติกเกอร์แบรนด์'], tags: ['onboarding','ใช้ได้จริง'] },
    { name: 'Culture Box', concept: 'กล่องที่เล่าวัฒนธรรมองค์กร สร้าง belonging ตั้งแต่วันแรก', items: ['เสื้อยืดแบรนด์','สมุด','ขนมพรีเมียม','คู่มือดีไซน์สวย'], tags: ['onboarding','อบอุ่น'] },
  ];
  else if (event) sets = [
    { name: 'Booth Hero Giveaway', concept: 'ของแจกงานอีเวนต์ที่คนอยากเก็บ ถ่ายรูปสวย ต้นทุนคุมได้', items: ['กระเป๋าผ้าพิมพ์ลาย','พัดลมพกพา','สติกเกอร์เซ็ต','ลูกอม/ขนม'], tags: ['อีเวนต์','ถ่ายรูปสวย'] },
    { name: 'Launch Press Kit', concept: 'ชุดสื่อมวลชน/แขก VIP สำหรับงานเปิดตัว ดูพรีเมียมสมงาน', items: ['กล่องพรีเมียม','สมุด+ปากกา','ของที่ระลึกธีมงาน','การ์ดเชิญ'], tags: ['อีเวนต์','พรีเมียม'] },
    { name: 'Seminar Smart Pack', concept: 'เซ็ตสำหรับผู้เข้าร่วมสัมมนา ใช้ระหว่างงานได้จริง', items: ['กระเป๋าเอกสาร','สมุดโน้ต','ปากกา','สายคล้องบัตร'], tags: ['อีเวนต์','ใช้ได้จริง'] },
  ];

  return sets.map((s, i) => ({ ...s, priceFrom: lo + i * 40, priceTo: hi + i * 60, tags: s.tags.slice(0, 3) }));
}

async function askAI(brief) {
  await new Promise((r) => setTimeout(r, 900));
  return gpFallback(brief);
}

export default function AIConcierge({ onRequestQuote }) {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('idle');
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);

  async function run(text) {
    const brief = (text != null ? text : q).trim();
    if (!brief) { inputRef.current && inputRef.current.focus(); return; }
    track('ai_concierge_run', { brief });
    setQ(brief);
    setStatus('loading');
    setResults([]);
    const sets = await askAI(brief);
    setResults(sets);
    setStatus('done');
  }

  useEffect(() => {
    const h = (e) => { const t = (e.detail && e.detail.query) || ''; if (t) run(t); };
    window.addEventListener('gp-ai-run', h);
    return () => window.removeEventListener('gp-ai-run', h);
  }, []);

  return (
    <div className="gp-wrap">
      <div style={{ position: 'relative', borderRadius: 'var(--gp-radius-lg)', overflow: 'hidden', background: 'linear-gradient(160deg,#16293F 0%, #1F3A5F 55%, #244873 100%)', boxShadow: 'var(--gp-shadow)', color: '#fff' }}>
        <div className="gp-dotgrid on-dark" style={{ position: 'absolute', inset: 0, opacity: .5 }} />
        <div style={{ position: 'absolute', right: -120, top: -120, width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle at 32% 32%, rgba(244,189,68,.55), transparent 62%)', opacity: .5, pointerEvents: 'none' }} />
        <div style={{ position: 'relative', padding: 'clamp(26px,4vw,46px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span className="gp-badge gp-badge-ai"><GpSpark size={13} /> AI Gift Concierge</span>
            <span style={{ fontSize: 13, color: '#9FB2CC' }}>ขับเคลื่อนด้วย AI · ตอบทันที</span>
          </div>
          <h2 className="gp-h2 on-dark" style={{ marginTop: 16, maxWidth: '18ch' }}>
            บอกโจทย์ของคุณ <br />ให้ AI คัดเซ็ตของขวัญที่ใช่
          </h2>
          <p className="gp-lead on-dark" style={{ marginTop: 12, maxWidth: '52ch' }}>
            พิมพ์โอกาส จำนวน งบ และสไตล์ที่ต้องการ — AI จะเสนอชุดของขวัญที่ออกแบบมาเพื่อแบรนด์คุณ พร้อมช่วงราคา ในไม่กี่วินาที
          </p>
          <div style={{ marginTop: 22, display: 'flex', gap: 10, flexWrap: 'wrap', background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.16)', borderRadius: 16, padding: 10, backdropFilter: 'blur(8px)' }}>
            <input ref={inputRef} className="gp-input" value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') run(); }}
              placeholder="เช่น ของขวัญปีใหม่พนักงาน 200 คน งบ 300฿/ชิ้น สายรักษ์โลก"
              style={{ flex: '1 1 320px', minWidth: 0, background: 'rgba(255,255,255,.96)', border: 'none', fontSize: 15.5 }} />
            <button className="gp-btn gp-btn-primary gp-btn-lg" onClick={() => run()} disabled={status === 'loading'} style={{ flex: '0 0 auto', opacity: status === 'loading' ? .85 : 1 }}>
              {status === 'loading'
                ? (<><span className="gp-spin" style={{ width: 16, height: 16, border: '2.5px solid rgba(31,58,95,.35)', borderTopColor: 'var(--gp-navy)', borderRadius: '50%', display: 'inline-block' }} /> กำลังคิด…</>)
                : (<><GpSpark size={16} /> ให้ AI ช่วยคิด</>)}
            </button>
          </div>

          {status === 'idle' && (
            <div style={{ marginTop: 14, display: 'flex', gap: 9, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 12.5, color: '#8FA3BE', fontFamily: 'var(--gp-font-head)' }}>ลองเลย:</span>
              {EXAMPLES.map((ex, i) => (
                <button key={i} onClick={() => run(ex)} style={{ fontFamily: 'var(--gp-font-body)', fontSize: 12.5, color: '#D8E2F0', cursor: 'pointer', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.16)', borderRadius: 99, padding: '7px 13px', transition: '.15s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(244,189,68,.16)'; e.currentTarget.style.borderColor = 'rgba(244,189,68,.5)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.16)'; }}>
                  {ex}
                </button>
              ))}
            </div>
          )}

          {status === 'loading' && (
            <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16 }}>
              {[0,1,2].map((i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 16, padding: 18, minHeight: 230 }}>
                  <div style={{ height: 74, borderRadius: 11, background: 'rgba(255,255,255,.08)' }} />
                  <div style={{ height: 14, width: '60%', background: 'rgba(255,255,255,.12)', borderRadius: 7, marginTop: 16 }} />
                  <div style={{ height: 10, width: '90%', background: 'rgba(255,255,255,.07)', borderRadius: 6, marginTop: 12 }} />
                  <div style={{ height: 10, width: '80%', background: 'rgba(255,255,255,.07)', borderRadius: 6, marginTop: 8 }} />
                  <div className="gp-typing" style={{ marginTop: 18 }}><i /><i /><i /></div>
                </div>
              ))}
            </div>
          )}

          {status === 'done' && (
            <div style={{ marginTop: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, color: '#CBD7E8', fontSize: 13.5 }}>
                <GpSpark size={14} style={{ color: 'var(--gp-mustard)' }} />
                AI เสนอ 3 ชุดสำหรับ "<span style={{ color: '#fff' }}>{q}</span>"
                <button onClick={() => { setStatus('idle'); setResults([]); }} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#9FB2CC', fontSize: 12.5, cursor: 'pointer', textDecoration: 'underline', fontFamily: 'var(--gp-font-body)' }}>เริ่มใหม่</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(248px,1fr))', gap: 16 }}>
                {results.map((r, i) => (
                  <div key={i} style={{ background: '#fff', color: 'var(--gp-ink)', borderRadius: 16, padding: 18, display: 'flex', flexDirection: 'column', boxShadow: '0 16px 40px -18px rgba(0,0,0,.5)' }}>
                    <ProductMock label={r.items[0] || r.name} tint={TINTS[i * 2 % TINTS.length]} />
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 13 }}>
                      {r.tags.map((t, j) => (<span key={j} className="gp-badge gp-badge-mustard" style={{ fontSize: 10.5, padding: '4px 9px' }}>{t}</span>))}
                    </div>
                    <h4 style={{ fontSize: 18, color: 'var(--gp-navy)', marginTop: 10 }}>{r.name}</h4>
                    <p style={{ fontSize: 13, color: 'var(--gp-grey)', marginTop: 6, lineHeight: 1.55 }}>{r.concept}</p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0', display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {r.items.map((it, j) => (
                        <li key={j} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12.5, color: 'var(--gp-ink)' }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--gp-mustard-deep)" strokeWidth="3" style={{ flex: '0 0 auto', marginTop: 2 }}><path d="M20 6 9 17l-5-5" /></svg>
                          {it}
                        </li>
                      ))}
                    </ul>
                    <div style={{ marginTop: 'auto', paddingTop: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 11 }}>
                        <span style={{ fontSize: 11.5, color: 'var(--gp-grey)' }}>ประมาณ</span>
                        <span style={{ fontFamily: 'var(--gp-font-head)', fontWeight: 600, fontSize: 19, color: 'var(--gp-navy)' }}>฿{r.priceFrom}–{r.priceTo}</span>
                        <span style={{ fontSize: 11.5, color: 'var(--gp-grey)' }}>/ชุด</span>
                      </div>
                      <button className="gp-btn gp-btn-primary" style={{ width: '100%' }}
                        onClick={() => onRequestQuote && onRequestQuote(`${r.name} — ${q}`)}>
                        ขอใบเสนอราคาเซ็ตนี้
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <p style={{ marginTop: 16, fontSize: 12, color: '#8FA3BE', display: 'flex', alignItems: 'center', gap: 7 }}>
                <GpSpark size={12} /> เป็นไอเดียเริ่มต้นจาก AI · ทีมดีไซน์จะทำ Mockup จริงให้ดูก่อนผลิตเสมอ
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
