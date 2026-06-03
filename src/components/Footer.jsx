import GpLogo from './shared/GpLogo';
import GpSpark from './shared/GpSpark';
import { gpScrollTo } from '../utils/scroll';

const COLS = [
  { h: 'สำรวจ', links: [['AI Concierge','ai'],['ผลงาน','portfolio'],['สินค้า & บริการ','products'],['วิธีสั่งทำ','how']] },
  { h: 'บริษัท', links: [['รีวิวลูกค้า','reviews'],['ขอใบเสนอราคา','rfq']] },
];

export default function Footer() {
  return (
    <footer style={{ background: 'var(--gp-navy-900)', color: '#C7D4E6' }}>
      <div className="gp-wrap" style={{ paddingTop: 54, paddingBottom: 30 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 32 }} className="gp-foot-grid">
          <div>
            <GpLogo width={166} tone="light" />
            <p style={{ fontSize: 13.5, marginTop: 16, maxWidth: '30ch', lineHeight: 1.7, color: '#9FB2CC' }}>มากกว่าของขวัญ คือประสบการณ์ที่น่าจดจำ — ผู้ออกแบบและผลิตของพรีเมียมสำหรับองค์กร</p>
          </div>
          {COLS.map((col, i) => (
            <div key={i}>
              <div style={{ fontFamily: 'var(--gp-font-head)', fontWeight: 500, color: '#fff', fontSize: 14, marginBottom: 13 }}>{col.h}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {col.links.map((l, j) => (
                  <a key={j} href={`#${l[1]}`} onClick={(e) => { e.preventDefault(); gpScrollTo(l[1]); }}
                    style={{ fontSize: 13.5, color: '#9FB2CC', cursor: 'pointer' }}>{l[0]}</a>
                ))}
              </div>
            </div>
          ))}
          <div>
            <div style={{ fontFamily: 'var(--gp-font-head)', fontWeight: 500, color: '#fff', fontSize: 14, marginBottom: 13 }}>ติดต่อ</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, fontSize: 13.5, color: '#9FB2CC' }}>
              <span>02-096-6465</span>
              <span>info@passiongrow.co.th</span>
              <span>@gopremium</span>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,.12)', marginTop: 34, paddingTop: 20, display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', fontSize: 12, color: '#7E92AE' }}>
          <span>© 2026 PASSION GROW TRADING CO., LTD. · All rights reserved.</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><GpSpark size={12} /> ขับเคลื่อนประสบการณ์ด้วย AI</span>
        </div>
      </div>
    </footer>
  );
}
