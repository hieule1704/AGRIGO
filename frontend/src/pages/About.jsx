import { Link } from 'react-router-dom';

export default function About() {
  return (
    <>
      <section className="marketing-hero">
        <div className="container">
          <h1>Sứ mệnh số hóa cơ giới hóa nông nghiệp ĐBSCL</h1>
          <p className="lead">AGRIGO ra đời với tiêu chí kết nối trực tiếp Nông dân và Chủ máy cơ giới, giúp nâng cao năng suất mùa vụ và tối ưu hiệu suất thiết bị nông nghiệp.</p>
        </div>
      </section>

      <section className="marketing-section">
        <div className="container">
          <div className="marketing-grid" style={{ marginBottom: 40 }}>
            <div className="feature-card">
              <div className="icon">🌱</div>
              <h3>Đồng hành cùng Nông dân</h3>
              <p>Giúp bà con tiếp cận nhanh chóng với các dòng máy tiên tiến (dòng máy gặt Kubota, Yanmar, Drone phun thuốc DJI) đúng ngày vụ sạ, giảm thất thoát nông sản.</p>
            </div>
            <div className="feature-card">
              <div className="icon">🚜</div>
              <h3>Tối ưu hóa tài sản Chủ máy</h3>
              <p>Chủ máy dễ dàng quản lý lịch làm việc của dàn xe, nhận đơn hàng tự động từ nông dân trong khu vực mà không lo bị trống máy vào vụ.</p>
            </div>
            <div className="feature-card">
              <div className="icon">🤝</div>
              <h3>Minh bạch & Tin cậy</h3>
              <p>Mọi giao dịch đặt lịch và giá cả đều minh bạch. Đội ngũ AGRIGO hỗ trợ giải quyết sự cố kỹ thuật và đảm bảo quyền lợi tối đa cho cả hai bên.</p>
            </div>
          </div>

          <div className="card-box" style={{ padding: 36, textAlign: 'center', background: '#F8FAF8' }}>
            <h2 style={{ fontSize: 24, margin: '0 0 12px' }}>Trải nghiệm dịch vụ ngay hôm nay</h2>
            <p style={{ maxWidth: 600, margin: '0 auto 20px', color: 'var(--ink-soft)' }}>Hơn 380+ lượt thuê máy thành công tại An Giang và các tỉnh ĐBSCL.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Link to="/search" className="btn btn-primary">🔍 Tìm máy nông nghiệp</Link>
              <Link to="/register" className="btn btn-outline">🚜 Đăng ký Chủ máy</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
