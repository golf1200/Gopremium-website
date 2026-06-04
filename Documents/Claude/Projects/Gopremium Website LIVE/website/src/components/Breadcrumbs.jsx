import { Link } from 'react-router-dom';

export default function Breadcrumbs({ crumbs }) {
  // crumbs: [{ label, href }, ...] — last item has no href (current page)
  return (
    <nav aria-label="breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 0 }}>
      {crumbs.map((c, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {i > 0 && <span style={{ color: 'var(--gp-grey-400)', fontSize: 13 }}>/</span>}
          {c.href ? (
            <Link to={c.href} style={{ fontSize: 13, color: 'var(--gp-grey)', textDecoration: 'none', transition: '.15s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--gp-navy)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--gp-grey)'}>
              {c.label}
            </Link>
          ) : (
            <span style={{ fontSize: 13, color: 'var(--gp-navy)', fontWeight: 500 }}>{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
