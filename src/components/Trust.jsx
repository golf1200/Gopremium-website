// Real GO PREMIUM client logos (transparent-bg), shown in an auto-scrolling trust bar.
const LOGOS = ['c1.png','c10.png','c11.png','c12.png','c13.png','c14.png','c15.png','c16.png','c17.png','c18.png','c19.png','c2.png','c20.png','c3.png','c4.png','c5.png','c6.png','c7.png','c8.png','c9.png'];

export default function Trust() {
  const row = [...LOGOS, ...LOGOS];
  return (
    <section style={{ borderTop: '1px solid var(--gp-grey-200)', borderBottom: '1px solid var(--gp-grey-200)', background: '#fff', padding: '26px 0', overflow: 'hidden' }}>
      <div className="gp-wrap" style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 18 }}>
        <span style={{ fontFamily: 'var(--gp-font-head)', fontSize: 12.5, letterSpacing: '.08em', color: 'var(--gp-grey)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
          ได้รับความไว้วางใจจากองค์กรชั้นนำ
        </span>
        <span style={{ flex: 1, height: 1, background: 'var(--gp-grey-200)' }} />
      </div>
      <div style={{ position: 'relative', maskImage: 'linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)', WebkitMaskImage: 'linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 54, width: 'max-content', animation: 'gp-marquee 42s linear infinite' }}>
          {row.map((src, i) => (
            <img key={i} src={`/clients/${src}`} alt="โลโก้ลูกค้าองค์กรของ GO PREMIUM" loading="lazy"
              style={{ height: 48, width: 'auto', objectFit: 'contain', flex: '0 0 auto', filter: 'grayscale(1)', opacity: .8, transition: 'filter .2s, opacity .2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.opacity = '1'; }}
              onMouseLeave={(e) => { e.currentTarget.style.filter = 'grayscale(1)'; e.currentTarget.style.opacity = '.7'; }} />
          ))}
        </div>
      </div>
    </section>
  );
}
