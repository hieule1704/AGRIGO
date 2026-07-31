import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div>
          <h5>🌾 AGRIGO</h5>
          <p style={{ opacity: .8, maxWidth: 260 }}>
            Nền tảng kết nối nông dân với chủ máy nông nghiệp theo thời gian thực, minh bạch giá và vị trí.
          </p>
        </div>
        <div>
          <h5>Về AGRIGO</h5>
          <Link to="/about">Giới thiệu nền tảng</Link>
          <Link to="/pricing">Bảng giá & Chính sách</Link>
          <Link to="/guide">Hướng dẫn sử dụng</Link>
        </div>
        <div>
          <h5>Dành cho nông dân</h5>
          <Link to="/search">Tìm máy gần bạn</Link>
          <Link to="/register">Đăng ký tài khoản</Link>
          <Link to="/my-bookings">Lịch thuê của tôi</Link>
        </div>
        <div>
          <h5>Dành cho chủ máy</h5>
          <Link to="/register?role=owner">Đăng ký cho thuê máy</Link>
          <Link to="/owner">Kênh quản lý</Link>
          <Link to="/pricing">Chính sách hoa hồng 5%</Link>
        </div>
        <div>
          <h5>Liên hệ Hỗ trợ</h5>
          <a href="tel:19000000">Hotline: 1900 0000</a>
          <a href="mailto:support@agrigo.vn">support@agrigo.vn</a>
          <span style={{ fontSize: 12, opacity: .7, display: 'block', marginTop: 4 }}>📍 An Giang & ĐBSCL</span>
        </div>
      </div>
      <div className="container bottom">© 2026 AGRIGO — Nền tảng kết nối cơ giới hóa nông nghiệp #1 ĐBSCL.</div>
    </footer>
  );
}
