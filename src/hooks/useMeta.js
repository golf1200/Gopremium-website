// ============================================================
// GO PREMIUM — Dynamic <head> meta updater
// (no react-helmet needed — direct DOM manipulation)
// ============================================================
import { useEffect } from 'react';

export function useMeta({ title, description, canonical, image, jsonLd } = {}) {
  useEffect(() => {
    // Title
    if (title) document.title = title;

    // Description
    setMeta('description', description);
    setOg('og:title', title);
    setOg('og:description', description);
    setOg('twitter:title', title);
    setOg('twitter:description', description);

    // Canonical
    if (canonical) {
      let el = document.querySelector('link[rel="canonical"]');
      if (!el) { el = document.createElement('link'); el.rel = 'canonical'; document.head.appendChild(el); }
      el.href = canonical;
    }

    // OG image
    if (image) {
      setOg('og:image', image);
      setOg('twitter:image', image);
    }

    // JSON-LD structured data (accepts single object or array)
    if (jsonLd) {
      // Remove any previous gp-jsonld scripts
      document.querySelectorAll('[id^="gp-jsonld"]').forEach((el) => el.remove());
      const schemas = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      schemas.forEach((schema, i) => {
        const el = document.createElement('script');
        el.type = 'application/ld+json';
        el.id = `gp-jsonld-${i}`;
        el.textContent = JSON.stringify(schema);
        document.head.appendChild(el);
      });
    }

    // Cleanup JSON-LD on unmount if we set one
    return () => {
      if (jsonLd) {
        document.querySelectorAll('[id^="gp-jsonld"]').forEach((el) => el.remove());
      }
    };
  }, [title, description, canonical, image, jsonLd]);
}

function setMeta(name, content) {
  if (!content) return;
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) { el = document.createElement('meta'); el.name = name; document.head.appendChild(el); }
  el.content = content;
}

function setOg(property, content) {
  if (!content) return;
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute('property', property); document.head.appendChild(el); }
  el.content = content;
}
