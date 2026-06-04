import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ paddingTop: 120, textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: 56 }}>🎁</span>
      <h1 style={{ color: 'var(--gp-navy)', fontSize: 32, marginTop: 16 }}>ไม่พบหน้านี้</h1>
      <p style={{ color: 'var(--gp-grey)', marginTop: 8, marginBottom: 28 }}>หน้าที่คุณค้นหาไม่มีในระบบ หรืออาจถูกย้าย</p>
      <div style={{ display: 'flex', gap: 10 }}>
        <Link to="/" className="gp-btn gp-btn-ghost" style={{ textDecoration: 'none' }}>หน้าแรก</Link>
        <Link to="/products" className="gp-btn gp-btn-primary" style={{ textDecoration: 'none' }}>ดูแคตตาล็อก</Link>
      </div>
    </div>
  );
}
