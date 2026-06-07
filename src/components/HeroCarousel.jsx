import { useState, useEffect } from 'react';
import GpImage from './shared/GpImage';

// Designed hero banners (each is a complete marketing visual with embedded text).
const SLIDES = ['/banners/banner1.jpg', '/banners/banner2.jpg', '/banners/banner3.jpg'];
const ALT = [
  'งานด่วน พร้อมส่งภายใน 7-14 วัน ของพรีเมียมพิมพ์โลโก้สำหรับองค์กร โดย GO PREMIUM',
  'AI ช่วยคิดเซ็ตของขวัญองค์กร เลือกง่าย ตรงโจทย์ โดย GO PREMIUM',
  'ของขวัญองค์กรคุณภาพพรีเมียม ตอบโจทย์ทุกโอกาส โดย GO PREMIUM',
];

export default function HeroCarousel() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || paused) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <div style={{ position: 'relative' }}
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div style={{ position: 'relative', width: '100%', height: 'min(560px,62vh)', borderRadius: 22, overflow: 'hidden', boxShadow: 'var(--gp-shadow)', background: 'var(--gp-cloud-2)' }}>
        {SLIDES.map((s, i) => (
          <GpImage key={s} src={s} alt={ALT[i]} loading={i === 0 ? 'eager' : 'lazy'}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: i === idx ? 1 : 0, transition: 'opacity .9s ease', display: 'block' }} />
        ))}
      </div>
      <div style={{ position: 'absolute', bottom: 14, left: 0, right: 0, display: 'flex', gap: 8, justifyContent: 'center', zIndex: 2 }}>
        {SLIDES.map((_, i) => (
          <button key={i} aria-label={`สไลด์ที่ ${i + 1}`} onClick={() => setIdx(i)}
            style={{ width: i === idx ? 24 : 9, height: 9, borderRadius: 99, border: 'none', cursor: 'pointer', padding: 0, background: i === idx ? 'var(--gp-mustard)' : 'rgba(255,255,255,.65)', transition: '.3s', boxShadow: '0 1px 4px rgba(0,0,0,.35)' }} />
        ))}
      </div>
    </div>
  );
}
