// ============================================================
// GO PREMIUM — GpImage
// <img> with automatic variant fallback for the 3-master system.
//
// Usage:
//   <GpImage images={product.images} variant="square" alt="…" />
//   <GpImage src="/images/foo.jpg" alt="…" />        // direct src
//
// On a 404 (or any load error) it advances down the candidate
// chain produced by imageCandidates():
//   <variant> -> … -> square -> original -> placeholder.svg
// ============================================================
import { useEffect, useMemo, useState } from 'react';
import { imageCandidates, PLACEHOLDER } from '../../utils/images';

export default function GpImage({
  images,
  variant = 'square',
  src,
  alt = '',
  loading,
  className,
  style,
  onMouseEnter,
  onMouseLeave,
}) {
  const candidates = useMemo(
    () => (src ? [src, PLACEHOLDER] : imageCandidates(images, variant)),
    [src, images, variant],
  );
  const key = candidates.join('|');

  const [idx, setIdx] = useState(0);
  // Reset when the candidate set changes (e.g. a list item is reused).
  useEffect(() => { setIdx(0); }, [key]);

  const current = candidates[Math.min(idx, candidates.length - 1)] || PLACEHOLDER;

  return (
    <img
      src={current}
      alt={alt}
      loading={loading}
      className={className}
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onError={() => setIdx((i) => (i < candidates.length - 1 ? i + 1 : i))}
    />
  );
}
