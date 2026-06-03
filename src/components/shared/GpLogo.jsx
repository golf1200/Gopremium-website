export default function GpLogo({ width = 168, tone = 'color' }) {
  const src = tone === 'light' ? '/logo-white.png' : '/logo.png';
  return (
    <img
      src={src}
      alt="GO PREMIUM"
      width={width}
      style={{ display: 'block', flexShrink: 0, objectFit: 'contain', height: 'auto' }}
    />
  );
}
