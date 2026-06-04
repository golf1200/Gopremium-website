export default function GpSpark({ size = 13, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"
      className="gp-spark" style={style} aria-hidden="true">
      <path d="M12 0c.5 5.2 1.6 6.3 6.8 6.8C13.6 7.3 12.5 8.4 12 13.6 11.5 8.4 10.4 7.3 5.2 6.8 10.4 6.3 11.5 5.2 12 0Z" />
      <path d="M19 13c.3 2.8.9 3.4 3.7 3.7-2.8.3-3.4.9-3.7 3.7-.3-2.8-.9-3.4-3.7-3.7 2.8-.3 3.4-.9 3.7-3.7Z" opacity=".7" />
    </svg>
  );
}
