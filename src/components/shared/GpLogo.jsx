export default function GpLogo({ width = 168, tone = 'navy' }) {
  const h = Math.round(width * 44 / 230);
  const color = tone === 'light' ? '#fff' : 'var(--gp-navy)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, flexShrink: 0,
      fontFamily: 'var(--gp-font-head)', fontWeight: 800,
      fontSize: Math.round(h * 0.56) + 'px', letterSpacing: '-.03em', color }}>
      <span style={{
        background: 'var(--gp-mustard)', color: 'var(--gp-navy)',
        borderRadius: 6, padding: '0 7px', marginRight: 7, lineHeight: 1.4
      }}>GO</span>
      <span>PREMIUM</span>
    </div>
  );
}
