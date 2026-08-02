import { Link } from 'react-router-dom';

export default function PricingPolicy() {
  return (
    <>
      <section className="marketing-hero">
        <div className="container">
          <h1>Bảng giá & Chính sách nền tảng</h1>
          <p className="lead">Mô hình chi phí minh bạch, không phí ẩn. Đảm bảo giao dịch công bằng cho cả Nông dân và Chủ máy cơ giới.</p>
        </div>
      </section>

      <section className="marketing-section">
        <div className="container">
          <h2 style={{ textAlign: 'center', margin: '0 0 30px' }}>Bảng phí dịch vụ AGRIGO</h2>
          <div className="pricing-table">
            <div className="pricing-card">
              <h3>Dành cho Nông dân</h3>
              <p className="small">Người tìm kiếm và thuê máy nông nghiệp</p>
              <div className="price-tag">0đ <span>/ giao dịch</span></div>
              <ul style={{ paddingLeft: 20, lineHeight: 1.8, fontSize: 14, color: 'var(--ink-soft)' }}>
                <li>Tìm kiếm máy & xem vị trí bản đồ miễn phí</li>
                <li>Đặt lịch thuê trực tiếp với chủ máy</li>
                <li>Xem giá công khai niêm yết</li>
                <li>Đánh giá chất lượng sau khi hoàn tất</li>
              </ul>
              <Link to="/search" className="btn btn-outline btn-block" style={{ marginTop: 24 }}>Tìm máy ngay</Link>
            </div>

            <div className="pricing-card featured" style={{ border: '2px solid var(--gold)' }}>
              <span className="badge-plan" style={{ background: 'var(--gold)', color: 'var(--green-deep)' }}>👑 VIP Partner</span>
              <h3>Gói Chủ Máy VIP Premium</h3>
              <p className="small">Ưu tiên tối đa cho Chủ máy chuyên nghiệp</p>
              <div className="price-tag">199.000đ <span>/ tháng</span></div>
              <ul style={{ paddingLeft: 20, lineHeight: 1.8, fontSize: 14, color: 'var(--ink-soft)' }}>
                <li><b>Ưu tiên hiển thị cao nhất</b> trên Tìm kiếm & Bản đồ</li>
                <li>Badge <b>"⭐ Đối tác đáng tin cậy"</b> uy tín</li>
                <li><b>Công cụ Phân tích thị trường</b> nhu cầu & giá 11 huyện</li>
                <li><b>Đăng bài quảng cáo Banner</b> nổi bật tiếp thị dàn xe</li>
              </ul>
              <Link to="/owner" className="btn btn-primary btn-block" style={{ marginTop: 24 }}>Nâng cấp ngay</Link>
            </div>
          </div>

          <div className="card-box" style={{ marginTop: 40, padding: 30 }}>
            <h3 style={{ fontSize: 20, marginBottom: 16 }}>🛡️ Chính sách hủy đơn & Hoàn tiền</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <h4 style={{ margin: '0 0 6px', color: 'var(--green-deep)' }}>Đối với Nông dân:</h4>
                <p className="small" style={{ lineHeight: 1.6 }}>Hủy miễn phí trước 24 giờ kể từ thời điểm nhận máy. Nếu hủy gấp trong vòng 24 giờ do lý do thời tiết bất lợi (mưa bão, lũ lụt), AGRIGO hỗ trợ đổi lịch không tính phí phát sinh.</p>
              </div>
              <div>
                <h4 style={{ margin: '0 0 6px', color: 'var(--green-deep)' }}>Đối với Chủ máy:</h4>
                <p className="small" style={{ lineHeight: 1.6 }}>Chủ máy cần đảm bảo thiết bị đúng hẹn. Trường hợp sự cố hỏng hóc đột xuất, Chủ máy có trách nhiệm thông báo trước cho Nông dân để hệ thống hỗ trợ điều máy thay thế.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
