import { Link } from 'react-router-dom';

// 📸 [HƯỚNG DẪN THAY ĐỔI ẢNH PLACEHOLDER CHO TRANG BẢNG GIÁ]:
// Bạn chỉ cần thay đổi các đường dẫn URL bên dưới để đổi hình ảnh minh họa theo ý muốn!
const PRICING_IMAGES = {
  headerBanner: 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?w=1200&auto=format&fit=crop&q=80', // Ảnh Nông cơ hoạt động trên đồng ruộng
  vipBanner: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop&q=80', // Ảnh Chủ máy VIP
};

export default function PricingPolicy() {
  return (
    <>
      {/* Header Banner */}
      <section className="hero" style={{ padding: '54px 0 70px', background: 'linear-gradient(135deg, var(--green-deep) 0%, var(--green-mid) 100%)' }}>
        <div className="container hero-center">
          <div className="eyebrow" style={{ color: 'var(--gold)', background: 'rgba(232,172,31,0.15)', border: '1px solid var(--gold)', margin: '0 0 14px' }}>
            💵 MINH BẠCH CHI PHÍ — KHÔNG PHÍ ẨN
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, margin: '0 0 14px', lineHeight: 1.25, textAlign: 'center' }}>
            Bảng Giá Dịch Vụ & Chính Sách Nền Tảng AGRIGO
          </h1>
          <p className="lead" style={{ fontSize: 16, opacity: 0.9, lineHeight: 1.6, margin: 0, textAlign: 'center' }}>
            Mô hình chi phí minh bạch, giúp nông dân dễ dàng tiếp cận máy nông nghiệp và giúp chủ máy tối ưu lợi nhuận từ dàn xe cơ giới tại An Giang.
          </p>
        </div>
      </section>

      {/* Pricing Cards Section */}
      <section className="section" style={{ padding: '60px 0' }}>
        <div className="container">
          <div className="section-head text-center" style={{ textAlign: 'center', marginBottom: 44 }}>
            <div className="eyebrow-label">CÁC GÓI DỊCH VỤ</div>
            <h2>Lựa chọn gói linh hoạt cho Nông Dân & Chủ Máy</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, alignItems: 'stretch' }}>
            {/* Gói Nông Dân */}
            <div className="card-box" style={{ padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--line)' }}>
              <div>
                <span className="badge" style={{ background: 'var(--green-soft)', color: 'var(--green-deep)', marginBottom: 12 }}>🌾 DÀNH CHO NÔNG DÂN</span>
                <h3 style={{ fontSize: 22, margin: '8px 0 4px' }}>Nông Dân Thuê Máy</h3>
                <p className="small" style={{ color: 'var(--ink-soft)', marginBottom: 20 }}>Dành cho hộ nông dân cần thuê máy sạ gặt</p>
                <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--green-deep)', marginBottom: 20 }}>
                  0đ <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-soft)' }}>/ miễn phí tìm kiếm</span>
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid var(--line)', margin: '16px 0' }} />
                <ul style={{ paddingLeft: 18, lineHeight: 1.9, fontSize: 14, color: 'var(--ink)' }}>
                  <li>✅ Tìm kiếm máy & xem vị trí bản đồ <b>100% Miễn phí</b></li>
                  <li>✅ Đặt máy trực tiếp qua VietQR / Ví điện tử / COD</li>
                  <li>✅ So sánh giá minh bạch giữa các chủ máy trong huyện</li>
                  <li>✅ Trợ lý AI hỗ trợ gợi ý máy đúng lịch sạ vụ</li>
                  <li>✅ Tổng đài hỗ trợ sự cố kỹ thuật 24/7</li>
                </ul>
              </div>
              <Link to="/search" className="btn btn-outline btn-block" style={{ marginTop: 24, padding: '12px' }}>
                🌾 Tìm Máy Thuê Miễn Phí
              </Link>
            </div>

            {/* Gói Chủ Máy Cơ Bản */}
            <div className="card-box" style={{ padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--line)' }}>
              <div>
                <span className="badge" style={{ background: '#EAEAEA', color: '#333', marginBottom: 12 }}>🚜 DÀNH CHO CHỦ MÁY</span>
                <h3 style={{ fontSize: 22, margin: '8px 0 4px' }}>Chủ Máy Cơ Bản</h3>
                <p className="small" style={{ color: 'var(--ink-soft)', marginBottom: 20 }}>Dành cho chủ máy mới tham gia hệ thống</p>
                <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--green-deep)', marginBottom: 20 }}>
                  5% <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-soft)' }}>/ giá trị đơn hoàn tất</span>
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid var(--line)', margin: '16px 0' }} />
                <ul style={{ paddingLeft: 18, lineHeight: 1.9, fontSize: 14, color: 'var(--ink)' }}>
                  <li>✅ Đăng bài niêm yết dàn máy nông nghiệp (Không giới hạn)</li>
                  <li>✅ AI Kiểm duyệt mô tả & hình ảnh tự động</li>
                  <li>✅ Quản lý lịch bận & duyệt đơn đặt trực tuyến</li>
                  <li>✅ Chỉ thu hoa hồng 5% khi đơn thuê hoàn thành</li>
                  <li>❌ Chưa có ưu tiên đứng đầu tìm kiếm</li>
                </ul>
              </div>
              <Link to="/register?role=owner" className="btn btn-outline btn-block" style={{ marginTop: 24, padding: '12px' }}>
                🚜 Đăng Ký Chủ Máy Cơ Bản
              </Link>
            </div>

            {/* Gói VIP Partner Premium */}
            <div className="card-box" style={{ padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '2px solid var(--gold)', background: '#FFFDF5', boxShadow: '0 8px 24px rgba(232, 172, 31, 0.2)' }}>
              <div>
                <span className="badge badge-gold" style={{ marginBottom: 12 }}>👑 VIP PARTNER ĐỘC QUYỀN</span>
                <h3 style={{ fontSize: 22, margin: '8px 0 4px' }}>Chủ Máy VIP Partner</h3>
                <p className="small" style={{ color: 'var(--gold-dark)', fontWeight: 'bold', marginBottom: 20 }}>Đỉnh cao tối ưu công suất dàn máy cơ giới</p>
                <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--gold-dark)', marginBottom: 20 }}>
                  199.000đ <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-soft)' }}>/ tháng</span>
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid var(--gold)', margin: '16px 0' }} />
                <ul style={{ paddingLeft: 18, lineHeight: 1.9, fontSize: 14, color: 'var(--ink)' }}>
                  <li>⭐ <b>Xếp vị trí TOP #1</b> trên danh sách Tìm kiếm & Bản đồ</li>
                  <li>👑 Tự động cấp Badge <b>"Đối tác đáng tin cậy"</b></li>
                  <li>📊 Mở khóa <b>Phân tích thị trường</b> nhu cầu & giá 11 huyện</li>
                  <li>📢 Quyền tạo <b>Banner Quảng Cáo Tiếp Thị</b> nổi bật</li>
                  <li>📞 Ưu tiên hỗ trợ từ đội ngũ tổng đài kỹ thuật AGRIGO</li>
                </ul>
              </div>
              <Link to="/owner" className="btn btn-primary btn-block" style={{ marginTop: 24, padding: '12px', fontSize: 15 }}>
                🚀 Nâng Cấp VIP Partner Ngay
              </Link>
            </div>
          </div>

          {/* Policy Overview Grid */}
          <div className="card-box" style={{ marginTop: 44, padding: 36, borderRadius: 20 }}>
            <h3 style={{ fontSize: 22, marginBottom: 20, textAlign: 'center' }}>🛡️ Chính Sách Hủy Đơn & Đảm Bảo Quyền Lợi</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30 }}>
              <div style={{ background: 'var(--bg-light)', padding: 22, borderRadius: 14, border: '1px solid #cfe3d1' }}>
                <h4 style={{ margin: '0 0 10px', color: 'var(--green-deep)', fontSize: 16 }}>🌾 Dành cho Nông dân thuê máy:</h4>
                <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0, color: 'var(--ink)' }}>
                  Nông dân được quyền hủy đơn miễn phí trước 24 giờ kể từ thời điểm nhận máy. Trường hợp thời tiết bất lợi (mưa bão, bão lũ lớn), AGRIGO hỗ trợ bảo lưu tiền cọc và hoãn lịch gặt sạ không tính thêm bất kỳ khoản phí phạt nào.
                </p>
              </div>

              <div style={{ background: '#FFF8E7', padding: 22, borderRadius: 14, border: '1px solid #f2ddb0' }}>
                <h4 style={{ margin: '0 0 10px', color: 'var(--gold-dark)', fontSize: 16 }}>🚜 Dành cho Chủ máy cơ giới:</h4>
                <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0, color: 'var(--ink)' }}>
                  Chủ máy cam kết đưa máy đến đúng địa điểm và đúng giờ như thỏa thuận. Trường hợp sự cố hỏng hóc hộc máy đột xuất, Chủ máy cần thông báo gấp cho tổng đài để AGRIGO hỗ trợ điều máy thay thế trong cùng huyện.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
