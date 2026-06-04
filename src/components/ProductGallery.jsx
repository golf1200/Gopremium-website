// ============================================================
// GO PREMIUM — ProductGallery
// Main 1:1 image + thumbnail strip. Falls back to the square
// master / placeholder when a product has no curated gallery.
// ============================================================
import { useState } from 'react';
import GpImage from './shared/GpImage';

export default function ProductGallery({ images, alt }) {
  const gallery = images?.gallery?.length ? images.gallery : null;
  const [sel, setSel] = useState(0);

  const mainSrc = gallery ? gallery[Math.min(sel, gallery.length - 1)] : null;

  return (
    <div>
      <div style={{ borderRadius: 16, overflow: 'hidden', background: 'var(--gp-cloud-2)', aspectRatio: '1/1' }}>
        {mainSrc ? (
          <GpImage src={mainSrc} alt={alt}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <GpImage images={images} variant="square" alt={alt}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        )}
      </div>

      {gallery && gallery.length > 1 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          {gallery.map((g, i) => (
            <button
              key={g}
              onClick={() => setSel(i)}
              aria-label={`รูปที่ ${i + 1}`}
              style={{
                width: 66, height: 66, borderRadius: 10, overflow: 'hidden', padding: 0,
                cursor: 'pointer', background: '#fff',
                border: i === sel ? '2px solid var(--gp-navy)' : '1px solid var(--gp-grey-200)',
                transition: 'border-color .15s',
              }}
            >
              <GpImage src={g} alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
