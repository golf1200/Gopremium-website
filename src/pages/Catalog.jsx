// ============================================================
// GO PREMIUM — /products  Catalog listing page
// ============================================================
import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { products, CATEGORIES, OCCASIONS, BUDGET_TIERS } from '../data/products';
import ProductCard from '../components/ProductCard';
import Breadcrumbs from '../components/Breadcrumbs';
import { useMeta } from '../hooks/useMeta';
import { site } from '../config';

const PRINT_OPTIONS = ['เลเซอร์', 'สกรีน', 'UV', 'UV DTF', 'พิมพ์โลโก้', 'DTF'];
const SORT_OPTIONS = [
  { value: 'default',   label: 'แนะนำ' },
  { value: 'price_asc', label: 'ราคา: น้อยไปมาก' },
  { value: 'price_desc',label: 'ราคา: มากไปน้อย' },
  { value: 'name',      label: 'ชื่อ A-Z' },
];

export default function Catalog() {
  const [params, setParams] = useSearchParams();

  // Read filters from URL
  const urlCat     = params.get('cat') || '';
  const urlOcc     = params.get('occ') || '';
  const urlBudget  = params.get('budget') || '';
  const urlPrint   = params.get('print') || '';
  const urlPriced  = params.get('priced') === '1';
  const urlSearch  = params.get('q') || '';
  const urlSort    = params.get('sort') || 'default';

  const [filterOpen, setFilterOpen] = useState(false);

  useMeta({
    title: `แคตตาล็อกสินค้า GO PREMIUM — ${products.length} รายการ`,
    description: `ของพรีเมียมพิมพ์โลโก้ ${products.length} รายการ หลากหลายหมวด พร้อมกรองตามงบ โอกาส และการพิมพ์`,
    canonical: `${site.siteUrl}/products`,
  });

  function setFilter(key, value) {
    const p = new URLSearchParams(params);
    if (value) p.set(key, value); else p.delete(key);
    setParams(p, { replace: true });
  }

  // Filter + search + sort
  const filtered = useMemo(() => {
    let list = products;
    if (urlCat)    list = list.filter((p) => p.category_slug === urlCat);
    if (urlOcc)    list = list.filter((p) => p.occasions.includes(urlOcc));
    if (urlBudget) list = list.filter((p) => p.budget_tier === urlBudget);
    if (urlPrint)  list = list.filter((p) => p.free_logo?.includes(urlPrint));
    if (urlPriced) list = list.filter((p) => p.price_300_thb != null);
    if (urlSearch) {
      const q = urlSearch.toLowerCase();
      list = list.filter((p) =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.features || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q) ||
        (p.sku || '').toLowerCase().includes(q)
      );
    }
    // Sort
    if (urlSort === 'price_asc')  list = [...list].sort((a, b) => (a.price_300_thb ?? 9999) - (b.price_300_thb ?? 9999));
    if (urlSort === 'price_desc') list = [...list].sort((a, b) => (b.price_300_thb ?? 0) - (a.price_300_thb ?? 0));
    if (urlSort === 'name')       list = [...list].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'th'));
    return list;
  }, [urlCat, urlOcc, urlBudget, urlPrint, urlPriced, urlSearch, urlSort]);

  const activeCount = [urlCat, urlOcc, urlBudget, urlPrint, urlPriced ? '1' : '', urlSearch]
    .filter(Boolean).length;

  function clearAll() {
    setParams({}, { replace: true });
  }

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh' }}>
      {/* Hero bar */}
      <div style={{ background: 'var(--gp-navy)', padding: '28px 0 24px' }}>
        <div className="gp-wrap">
          <Breadcrumbs crumbs={[{ label: 'หน้าแรก', href: '/' }, { label: 'แคตตาล็อกสินค้า' }]} />
          <h1 style={{ color: '#fff', fontSize: 'clamp(22px,3vw,34px)', marginTop: 10, fontFamily: 'var(--gp-font-head)' }}>
            แคตตาล็อกสินค้า
          </h1>
          <p style={{ color: '#CBD7E8', fontSize: 14, marginTop: 4 }}>
            {products.length} รายการ · {CATEGORIES.length} หมวดหมู่ · พิมพ์โลโก้ได้ทุกชิ้น
          </p>
        </div>
      </div>

      {/* Search bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid var(--gp-grey-200)', padding: '14px 0' }}>
        <div className="gp-wrap" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 260px', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--gp-cloud)', borderRadius: 10, padding: '9px 14px', border: '1px solid var(--gp-grey-200)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gp-grey)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input
              value={urlSearch}
              onChange={(e) => setFilter('q', e.target.value)}
              placeholder="ค้นหาสินค้า เช่น กระบอกน้ำ, โน้ตบุ๊ก..."
              style={{ border: 'none', background: 'none', flex: 1, fontSize: 14, color: 'var(--gp-ink)', outline: 'none' }}
            />
            {urlSearch && <button onClick={() => setFilter('q', '')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--gp-grey)', padding: 0 }}>×</button>}
          </div>

          {/* Sort */}
          <select value={urlSort} onChange={(e) => setFilter('sort', e.target.value)}
            style={{ padding: '9px 12px', borderRadius: 10, border: '1px solid var(--gp-grey-200)', background: '#fff', fontSize: 13.5, color: 'var(--gp-ink)', cursor: 'pointer' }}>
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          {/* Filter toggle (mobile) */}
          <button onClick={() => setFilterOpen((o) => !o)}
            className="gp-filter-toggle"
            style={{ display: 'none', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 10, border: '1px solid var(--gp-grey-200)', background: '#fff', fontSize: 13.5, cursor: 'pointer', color: 'var(--gp-navy)' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
            กรอง {activeCount > 0 && <span style={{ background: 'var(--gp-navy)', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{activeCount}</span>}
          </button>
        </div>
      </div>

      {/* Quick-pick filter bar — sticky, always reachable */}
      <div className="gp-quick-bar" style={{ position: 'sticky', top: 80, zIndex: 20, background: '#fff', borderBottom: '1px solid var(--gp-grey-200)', boxShadow: '0 4px 10px rgba(31,58,95,.05)' }}>
        <div className="gp-wrap" style={{ display: 'flex', flexDirection: 'column', gap: 9, padding: '12px 0' }}>
          {/* Occasion pills */}
          <div className="gp-quick-row">
            <span className="gp-quick-label">🎁 โอกาส</span>
            {OCCASIONS.map((o) => (
              <QuickPill key={o.slug} label={o.label}
                active={urlOcc === o.slug}
                onClick={() => setFilter('occ', urlOcc === o.slug ? '' : o.slug)} />
            ))}
          </div>
          {/* Budget pills */}
          <div className="gp-quick-row">
            <span className="gp-quick-label">💰 งบ/ชิ้น</span>
            {BUDGET_TIERS.map((b) => (
              <QuickPill key={b.slug} label={b.label}
                active={urlBudget === b.slug}
                onClick={() => setFilter('budget', urlBudget === b.slug ? '' : b.slug)} />
            ))}
          </div>
        </div>
      </div>

      {/* Active filter chips */}
      {activeCount > 0 && (
        <div style={{ background: 'var(--gp-cloud)', padding: '10px 0', borderBottom: '1px solid var(--gp-grey-200)' }}>
          <div className="gp-wrap" style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12.5, color: 'var(--gp-grey)', marginRight: 2 }}>กรองแล้ว:</span>
            {urlCat    && <FilterChip label={CATEGORIES.find((c) => c.slug === urlCat)?.label || urlCat} onRemove={() => setFilter('cat', '')} />}
            {urlOcc    && <FilterChip label={OCCASIONS.find((o) => o.slug === urlOcc)?.label || urlOcc} onRemove={() => setFilter('occ', '')} />}
            {urlBudget && <FilterChip label={BUDGET_TIERS.find((b) => b.slug === urlBudget)?.label || urlBudget} onRemove={() => setFilter('budget', '')} />}
            {urlPrint  && <FilterChip label={`ฟรี ${urlPrint}`} onRemove={() => setFilter('print', '')} />}
            {urlPriced && <FilterChip label="มีราคา" onRemove={() => setFilter('priced', '')} />}
            {urlSearch && <FilterChip label={`"${urlSearch}"`} onRemove={() => setFilter('q', '')} />}
            <button onClick={clearAll} style={{ fontSize: 12, color: 'var(--gp-danger)', background: 'none', border: 'none', cursor: 'pointer', marginLeft: 4 }}>ล้างทั้งหมด</button>
          </div>
        </div>
      )}

      {/* Main layout */}
      <div className="gp-wrap" style={{ paddingTop: 32, paddingBottom: 64, display: 'grid', gridTemplateColumns: '220px 1fr', gap: 32, alignItems: 'start' }} id="catalog-main">
        {/* Sidebar filter */}
        <aside className={`gp-catalog-sidebar${filterOpen ? ' open' : ''}`}
          style={{ position: 'sticky', top: 176 }}>
          <FilterSection title="หมวดหมู่">
            {CATEGORIES.map((c) => (
              <FilterItem key={c.slug} label={`${c.label} (${c.count})`}
                active={urlCat === c.slug}
                onClick={() => setFilter('cat', urlCat === c.slug ? '' : c.slug)} />
            ))}
          </FilterSection>

          <FilterSection title="เลือกตามโอกาส">
            {OCCASIONS.map((o) => (
              <FilterItem key={o.slug} label={o.label}
                active={urlOcc === o.slug}
                onClick={() => setFilter('occ', urlOcc === o.slug ? '' : o.slug)} />
            ))}
          </FilterSection>

          <FilterSection title="งบต่อชิ้น (300 pcs)">
            {BUDGET_TIERS.map((b) => (
              <FilterItem key={b.slug} label={b.label}
                active={urlBudget === b.slug}
                onClick={() => setFilter('budget', urlBudget === b.slug ? '' : b.slug)} />
            ))}
          </FilterSection>

          <FilterSection title="เทคนิคพิมพ์">
            {PRINT_OPTIONS.map((t) => (
              <FilterItem key={t} label={`ฟรี ${t}`}
                active={urlPrint === t}
                onClick={() => setFilter('print', urlPrint === t ? '' : t)} />
            ))}
          </FilterSection>

          <FilterSection title="ราคา">
            <FilterItem label="แสดงเฉพาะสินค้าที่มีราคา"
              active={urlPriced}
              onClick={() => setFilter('priced', urlPriced ? '' : '1')} />
          </FilterSection>
        </aside>

        {/* Product grid */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <p style={{ fontSize: 14, color: 'var(--gp-grey)' }}>
              <b style={{ color: 'var(--gp-navy)' }}>{filtered.length}</b> รายการ
              {activeCount > 0 && ` (จาก ${products.length})`}
            </p>
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 16px', color: 'var(--gp-grey)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <p style={{ fontSize: 16, marginBottom: 8 }}>ไม่พบสินค้าที่ตรงเงื่อนไข</p>
              <button className="gp-btn gp-btn-ghost" onClick={clearAll}>ล้างตัวกรอง</button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
              gap: 20,
            }}>
              {filtered.map((p) => (
                <ProductCard key={p.sku} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function FilterSection({ title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ marginBottom: 20 }}>
      <button onClick={() => setOpen((o) => !o)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', marginBottom: 8 }}>
        <span style={{ fontFamily: 'var(--gp-font-head)', fontSize: 13, fontWeight: 600, color: 'var(--gp-navy)', textTransform: 'uppercase', letterSpacing: '.5px' }}>{title}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--gp-grey)" strokeWidth="2" style={{ transform: open ? 'none' : 'rotate(-90deg)', transition: '.2s' }}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>{children}</div>}
    </div>
  );
}

function FilterItem({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: 'none', border: 'none', cursor: 'pointer',
      padding: '6px 4px', borderRadius: 6, textAlign: 'left', width: '100%',
      color: active ? 'var(--gp-navy)' : 'var(--gp-grey)',
      fontWeight: active ? 600 : 400,
      fontSize: 13.5,
      transition: '.15s',
    }}>
      <span style={{
        width: 16, height: 16, borderRadius: 4, flex: '0 0 auto',
        border: `1.5px solid ${active ? 'var(--gp-navy)' : 'var(--gp-grey-300)'}`,
        background: active ? 'var(--gp-navy)' : '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: '.15s',
      }}>
        {active && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
      </span>
      {label}
    </button>
  );
}

function QuickPill({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      flex: '0 0 auto',
      padding: '7px 14px',
      borderRadius: 20,
      border: `1.5px solid ${active ? 'var(--gp-navy)' : 'var(--gp-grey-200)'}`,
      background: active ? 'var(--gp-navy)' : '#fff',
      color: active ? '#fff' : 'var(--gp-navy)',
      fontSize: 13,
      fontWeight: active ? 600 : 500,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      transition: '.15s',
    }}>
      {label}
    </button>
  );
}

function FilterChip({ label, onRemove }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 20,
      background: 'var(--gp-navy)', color: '#fff',
      fontSize: 12.5, fontWeight: 500,
    }}>
      {label}
      <button onClick={onRemove} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0, lineHeight: 1, fontSize: 14 }}>×</button>
    </span>
  );
}
