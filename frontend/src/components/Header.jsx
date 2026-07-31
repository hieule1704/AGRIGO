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
          <Link to="/" className="logo"><span className="mark">A</span>AGRIGO</Link>
          <nav className="nav-links">
            <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Trang chủ</NavLink>
            <NavLink to="/search" className={({ isActive }) => isActive ? 'active' : ''}>Tìm máy nông nghiệp</NavLink>
          </nav>
          <div className="header-actions">
            {!user && (
              <>
                <Link to="/login" className="btn btn-outline btn-sm">Đăng nhập</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Đăng ký</Link>
              </>
            )}
            {user && user.role === 'admin' && (
              <>
                <Link to="/admin" className="btn btn-outline btn-sm">Trang quản trị</Link>
                <button className="btn btn-ghost btn-sm" onClick={logout}>Đăng xuất</button>
              </>
            )}
            {user && user.role === 'owner' && (
              <>
                <Link to="/owner" className="btn btn-outline btn-sm">Kênh chủ máy</Link>
                <button className="btn btn-ghost btn-sm" onClick={logout}>Đăng xuất ({user.full_name})</button>
              </>
            )}
            {user && user.role === 'farmer' && (
              <>
                <Link to="/my-bookings" className="btn btn-outline btn-sm">Lịch thuê của tôi</Link>
                <button className="btn btn-ghost btn-sm" onClick={logout}>Đăng xuất ({user.full_name})</button>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
