export function gpScrollTo(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - 74;
  window.scrollTo({ top: y, behavior: 'smooth' });
}
