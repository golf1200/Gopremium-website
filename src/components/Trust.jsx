const CLIENTS = ['ABC Corp', 'SiamTech', 'Bloom & Co.', 'NovaBank', 'Greenleaf', 'Orbit Agency', 'Lotus Group', 'Vela'];

export default function Trust() {
  const row = [...CLIENTS, ...CLIENTS];
  return (
    <section style={{ borderTop: '1px solid var(--gp-grey-200)', borderBottom: '1px solid var(--gp-grey-200)', background: '#fff', padding: '26px 0', overflow: 'hidden' }}>
      <div className="gp-wrap" style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 18 }}>
        <span style={{ fontFamily: 'var(--gp-font-head)', fontSize: 12.5, letterSpacing: '.08em', color: 'var(--gp-grey)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
          ได้รับความไว้วางใจจากองค์กรชั้นนำ
        </span>
        <span style={{ flex: 1, height: 1, background: 'var(--gp-grey-200)' }} />
      </div>
      <div style={{ position: 'relative', maskImage: 'linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)', WebkitMaskImage: 'linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)' }}>
        <div style={{ display: 'flex', gap: 54, width: 'max-content', animation: 'gp-marquee 26s linear infinite' }}>
          {row.map((c, i) => (
            <span key={i} style={{ fontFamily: 'var(--gp-font-head)', fontWeight: 600, fontSize: 21, color: '#AEB6C2', letterSpacing: '-.01em', whiteSpace: 'nowrap' }}>{c}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
