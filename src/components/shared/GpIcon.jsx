const PATHS = {
  chat: 'M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5Z',
  palette: 'M12 21a9 9 0 1 1 0-18c4.97 0 9 3.58 9 8 0 2.5-2 4-4 4h-2a2 2 0 0 0-1.5 3.3A1.5 1.5 0 0 1 12 21Z',
  box: 'M21 8 12 3 3 8l9 5 9-5Zm0 0v8l-9 5-9-5V8',
  truck: 'M3 7h11v8H3V7Zm11 3h4l3 3v2h-7v-5ZM7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
  shield: 'M12 3 5 6v5c0 4.2 2.9 8 7 9 4.1-1 7-4.8 7-9V6l-7-3Z',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-14v5l3 2',
  star: 'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9L12 3.5Z',
  check: 'M20 6 9 17l-5-5',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  bulb: 'M9 18h6m-5 3h4M12 3a6 6 0 0 1 4 10.5c-.7.6-1 1.2-1 2.5H9c0-1.3-.3-1.9-1-2.5A6 6 0 0 1 12 3Z',
  leaf: 'M5 21c0-9 5-14 14-14 0 9-5 14-14 14Zm0 0c2.5-5 5.5-7 9-8.5',
  layers: 'M12 3 3 8l9 5 9-5-9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5',
};

export default function GpIcon({ name, size = 22, stroke = 'currentColor', sw = 1.8 }) {
  const d = PATHS[name] || '';
  const fill = name === 'star' ? 'currentColor' : 'none';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
      stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}
