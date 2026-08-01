import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <>
      <div className="topbar">
        <div className="container">
          <span className="muted">🌾 Kết nối máy nông nghiệp khu vực An Giang & ĐBSCL</span>
          <Link to="/register?role=owner">Bạn có máy? Đăng ký cho thuê ngay</Link>
        </div>
      </div>
      <header className="header">
        <div className="container">
          <Link to="/" className="logo" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: 0, border: 'none', background: 'transparent' }}>
            <img
              src="/logo.png"
              alt="AGRIGO Logo"
              style={{
                height: 48,
                objectFit: 'contain',
                background: 'transparent',
              }}
            />
          </Link>
          <nav className="nav-links">
            <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Trang chủ</NavLink>
            <NavLink to="/search" className={({ isActive }) => isActive ? 'active' : ''}>Tìm máy</NavLink>
            <NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''}>Giới thiệu</NavLink>
            <NavLink to="/pricing" className={({ isActive }) => isActive ? 'active' : ''}>Bảng giá & Chính sách</NavLink>
            <NavLink to="/guide" className={({ isActive }) => isActive ? 'active' : ''}>Hướng dẫn</NavLink>
          </nav>
          <div className="header-actions">
            {!user && (
              <>
                <Link to="/login" className="btn btn-outline btn-sm">Đăng nhập</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Đăng ký</Link>
              </>
            )}
            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Link to="/profile" title="Hồ sơ cá nhân" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', background: 'var(--green-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--green-mid)' }}>
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/28?text=U'; }} />
                    ) : (
                      <span style={{ fontSize: 14 }}>👤</span>
                    )}
                  </div>
                </Link>
                {user.role === 'admin' && <Link to="/admin" className="btn btn-outline btn-sm">Trang quản trị</Link>}
                {user.role === 'owner' && <Link to="/owner" className="btn btn-outline btn-sm">Kênh chủ máy</Link>}
                {user.role === 'farmer' && <Link to="/my-bookings" className="btn btn-outline btn-sm">Lịch thuê của tôi</Link>}
                <button className="btn btn-ghost btn-sm" onClick={logout}>Đăng xuất</button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
