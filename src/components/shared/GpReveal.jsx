import { useRef, useEffect } from 'react';

export default function GpReveal({ children, delay = 0, as: Tag = 'div', className = '', style }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { el.classList.add('in'); io.unobserve(el); }
      });
    }, { threshold: .14 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={`gp-reveal ${className}`} style={{ transitionDelay: delay + 'ms', ...style }}>
      {children}
    </Tag>
  );
}
