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
          <h5>Dành cho nông dân</h5>
          <Link to="/search">Tìm máy gần bạn</Link>
          <Link to="/register">Đăng ký tài khoản</Link>
          <Link to="/my-bookings">Lịch thuê của tôi</Link>
        </div>
        <div>
          <h5>Dành cho chủ máy</h5>
          <Link to="/register?role=owner">Đăng ký cho thuê máy</Link>
          <Link to="/owner">Kênh quản lý</Link>
        </div>
        <div>
          <h5>Liên hệ</h5>
          <a href="#">Hotline: 1900 0000</a>
          <a href="#">support@agrigo.vn</a>
        </div>
      </div>
      <div className="container bottom">© 2026 AGRIGO — Bản demo nội bộ, chỉ dùng để trình bày sản phẩm.</div>
    </footer>
  );
}
