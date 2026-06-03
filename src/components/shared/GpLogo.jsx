export default function GpLogo({ width = 168 }) {
  return (
    <img
      src="/logo.png"
      alt="GO PREMIUM"
      width={width}
      style={{ display: 'block', flexShrink: 0, objectFit: 'contain' }}
    />
  );
}
