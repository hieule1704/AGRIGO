import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  function closeMobile() {
    setMobileOpen(false);
  }

  return (
    <>
      <div className="topbar">
        <div className="container">
          <span className="muted">🌾 Kết nối máy nông nghiệp khu vực An Giang & ĐBSCL</span>
          {!user ? (
            <Link to="/register?role=owner">Bạn có máy? Đăng ký chủ máy ngay →</Link>
          ) : user.role === 'owner' ? (
            <Link to="/owner" style={{ color: 'var(--gold)', fontWeight: 'bold' }}>
              {user.is_premium ? '👑 VIP Partner Chủ máy' : '🚜 Kênh Chủ Máy'} ({user.full_name})
            </Link>
          ) : user.role === 'farmer' ? (
            <span style={{ color: '#fff' }}>🌾 Nông dân: <b>{user.full_name}</b> ({user.phone || '0909123456'})</span>
          ) : (
            <span style={{ color: 'var(--gold)', fontWeight: 'bold' }}>🛡️ Quản trị viên: {user.full_name}</span>
          )}
        </div>
      </div>
      <header className="header">
        <div className="container" style={{ position: 'relative' }}>
          <Link to="/" className="logo" onClick={closeMobile} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: 0, border: 'none', background: 'transparent' }}>
            <img
              src="/logo.png"
              alt="AGRIGO Logo"
              style={{
                height: 42,
                objectFit: 'contain',
                background: 'transparent',
              }}
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className={`nav-links ${mobileOpen ? 'mobile-show' : ''}`}>
            <NavLink to="/" end onClick={closeMobile} className={({ isActive }) => isActive ? 'active' : ''}>Trang chủ</NavLink>
            <NavLink to="/search" onClick={closeMobile} className={({ isActive }) => isActive ? 'active' : ''}>Tìm máy</NavLink>
            <NavLink to="/about" onClick={closeMobile} className={({ isActive }) => isActive ? 'active' : ''}>Giới thiệu</NavLink>
            <NavLink to="/pricing" onClick={closeMobile} className={({ isActive }) => isActive ? 'active' : ''}>Bảng giá</NavLink>
            <NavLink to="/guide" onClick={closeMobile} className={({ isActive }) => isActive ? 'active' : ''}>Hướng dẫn</NavLink>
          </nav>

          <div className="header-actions">
            {!user && (
              <div className="desktop-actions" style={{ display: 'flex', gap: 8 }}>
                <Link to="/login" className="btn btn-outline btn-sm">Đăng nhập</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Đăng ký</Link>
              </div>
            )}
            {user && (
              <div className="desktop-actions" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Link to="/profile" title="Hồ sơ cá nhân" onClick={closeMobile} style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', overflow: 'hidden', background: 'var(--green-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--green-mid)', flexShrink: 0 }}>
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/30?text=U'; }} />
                    ) : (
                      <span style={{ fontSize: 14 }}>👤</span>
                    )}
                  </div>
                </Link>
                {user.role === 'admin' && <Link to="/admin" onClick={closeMobile} className="btn btn-outline btn-sm">Quản trị</Link>}
                {user.role === 'owner' && <Link to="/owner" onClick={closeMobile} className="btn btn-outline btn-sm">Kênh chủ máy</Link>}
                {user.role === 'farmer' && <Link to="/my-bookings" onClick={closeMobile} className="btn btn-outline btn-sm">Đơn hàng</Link>}
                <button className="btn btn-ghost btn-sm" onClick={() => { logout(); closeMobile(); }}>Thoát</button>
              </div>
            )}

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              className="mobile-toggle-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? '✖' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileOpen && (
          <div className="mobile-drawer">
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <NavLink to="/" end onClick={closeMobile} className={({ isActive }) => isActive ? 'active' : ''}>🌾 Trang chủ</NavLink>
              <NavLink to="/search" onClick={closeMobile} className={({ isActive }) => isActive ? 'active' : ''}>🔍 Tìm máy nông nghiệp</NavLink>
              <NavLink to="/about" onClick={closeMobile} className={({ isActive }) => isActive ? 'active' : ''}>ℹ️ Giới thiệu</NavLink>
              <NavLink to="/pricing" onClick={closeMobile} className={({ isActive }) => isActive ? 'active' : ''}>💵 Bảng giá & Chính sách</NavLink>
              <NavLink to="/guide" onClick={closeMobile} className={({ isActive }) => isActive ? 'active' : ''}>📖 Hướng dẫn sử dụng</NavLink>
              <hr style={{ border: 'none', borderTop: '1px solid var(--line)', margin: '8px 0' }} />
              {!user ? (
                <div style={{ display: 'flex', gap: 10 }}>
                  <Link to="/login" onClick={closeMobile} className="btn btn-outline btn-block">Đăng nhập</Link>
                  <Link to="/register" onClick={closeMobile} className="btn btn-primary btn-block">Đăng ký</Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <Link to="/profile" onClick={closeMobile} className="btn btn-outline btn-block">👤 Hồ sơ cá nhân ({user.full_name})</Link>
                  {user.role === 'admin' && <Link to="/admin" onClick={closeMobile} className="btn btn-primary btn-block">🛡️ Trang Quản trị</Link>}
                  {user.role === 'owner' && <Link to="/owner" onClick={closeMobile} className="btn btn-primary btn-block">🚜 Quản lý Kênh Chủ máy</Link>}
                  {user.role === 'farmer' && <Link to="/my-bookings" onClick={closeMobile} className="btn btn-primary btn-block">📋 Lịch thuê của tôi</Link>}
                  <button className="btn btn-danger btn-block" onClick={() => { logout(); closeMobile(); }}>Đăng xuất</button>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
