import { useState } from 'react';
import { Link } from 'react-router-dom';

// 📸 [HƯỚNG DẪN THAY ĐỔI ẢNH PLACEHOLDER CHO TRANG HƯỚNG DẪN]:
// Bạn chỉ cần thay đổi các đường dẫn URL bên dưới để thay hình ảnh theo nhu cầu!
const GUIDE_IMAGES = {
  farmerStepImg: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop&q=80', // Ảnh Nông dân tìm máy gặt
  ownerStepImg: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80', // Ảnh Chủ máy đăng dàn xe
};

export default function Guide() {
  const [tab, setTab] = useState('farmer');

  return (
    <>
      {/* Header Hero */}
      <section className="hero" style={{ padding: '54px 0 70px', background: 'linear-gradient(135deg, var(--green-deep) 0%, var(--green-mid) 100%)' }}>
        <div className="container hero-center">
          <div className="eyebrow" style={{ color: 'var(--gold)', background: 'rgba(232,172,31,0.15)', border: '1px solid var(--gold)', margin: '0 0 14px' }}>
            📖 CẨM NANG VẬN HÀNH DỄ DÀNG
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, margin: '0 0 14px', lineHeight: 1.25, textAlign: 'center' }}>
            Hướng Dẫn Sử Dụng Nền Tảng AGRIGO
          </h1>
          <p className="lead" style={{ fontSize: 16, opacity: 0.9, lineHeight: 1.6, margin: 0, textAlign: 'center' }}>
            Quy trình từng bước đơn giản giúp Nông dân dễ dàng thuê máy sạ gặt và giúp Chủ máy quản lý vận hành phương tiện nông nghiệp hiệu quả.
          </p>
        </div>
      </section>

      {/* Main Guide Content */}
      <section className="section" style={{ padding: '60px 0' }}>
        <div className="container">
          {/* Role Switcher Toggle */}
          <div className="role-toggle" style={{ maxWidth: 440, margin: '0 auto 40px', padding: 6, background: 'var(--green-soft)', borderRadius: 999 }}>
            <a
              href="#"
              className={tab === 'farmer' ? 'active' : ''}
              onClick={(e) => { e.preventDefault(); setTab('farmer'); }}
              style={{ padding: '10px 18px', fontSize: 14.5 }}
            >
              🌾 Dành cho Nông dân Thuê máy
            </a>
            <a
              href="#"
              className={tab === 'owner' ? 'active' : ''}
              onClick={(e) => { e.preventDefault(); setTab('owner'); }}
              style={{ padding: '10px 18px', fontSize: 14.5 }}
            >
              🚜 Dành cho Chủ máy Cơ giới
            </a>
          </div>

          {/* TAB 1: NÔNG DÂN THUÊ MÁY */}
          {tab === 'farmer' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 40 }}>
                <div className="card-box" style={{ padding: 28, position: 'relative' }}>
                  <span style={{ fontSize: 36, fontWeight: 800, color: 'var(--gold)', opacity: 0.9, display: 'block', marginBottom: 10 }}>01</span>
                  <h3 style={{ fontSize: 18, marginBottom: 10 }}>1. Tìm kiếm máy theo địa bàn</h3>
                  <p style={{ color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                    Truy cập trang <b>"Tìm máy"</b>, chọn Huyện bạn đang làm ruộng (Châu Phú, Thoại Sơn, Tri Tôn...), chọn loại phương tiện (Máy gặt, Máy cày, Drone) và ngày cần sạ gặt.
                  </p>
                </div>

                <div className="card-box" style={{ padding: 28, position: 'relative' }}>
                  <span style={{ fontSize: 36, fontWeight: 800, color: 'var(--gold)', opacity: 0.9, display: 'block', marginBottom: 10 }}>02</span>
                  <h3 style={{ fontSize: 18, marginBottom: 10 }}>2. Chọn máy & Thanh toán</h3>
                  <p style={{ color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                    Xem bản đồ định vị máy gần bạn, kiểm tra đánh giá sao của chủ máy. Lựa chọn phương thức thanh toán linh hoạt qua <b>VietQR mã QR Ngân hàng</b>, <b>Ví điện tử</b> hoặc <b>Tiền mặt COD</b>.
                  </p>
                </div>

                <div className="card-box" style={{ padding: 28, position: 'relative' }}>
                  <span style={{ fontSize: 36, fontWeight: 800, color: 'var(--gold)', opacity: 0.9, display: 'block', marginBottom: 10 }}>03</span>
                  <h3 style={{ fontSize: 18, marginBottom: 10 }}>3. Nhận máy & Đánh giá</h3>
                  <p style={{ color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                    Chủ máy đưa dàn xe đến công ruộng đúng giờ thỏa thuận. Sau khi hoàn thành vụ sạ gặt, bà con vào mục <b>"Lịch thuê của tôi"</b> để viết nhận xét và chấm điểm sao uy tín.
                  </p>
                </div>
              </div>

              {/* Showcase Banner For Farmer */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30, alignItems: 'center', background: '#ffffff', borderRadius: 20, padding: 30, border: '1px solid var(--line)', boxShadow: 'var(--shadow-card)' }}>
                <div>
                  <div className="eyebrow-label">MẸO CHO BÀ CON</div>
                  <h3 style={{ fontSize: 22, margin: '8px 0 12px' }}>Dùng Trợ lý AI Tìm máy để đặt lịch nhanh hơn</h3>
                  <p style={{ color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
                    Bà con không cần gõ bộ lọc phức tạp. Chỉ cần nhập câu bằng tiếng Việt tự nhiên tại ô tìm kiếm AI:
                    <br />
                    <i>"Cần thuê máy gặt Kubota vụ Hè Thu tại Thoại Sơn..."</i>
                    <br />
                    Hệ thống AI sẽ tự động chọn đúng huyện và hiển thị các dàn máy tốt nhất gần ruộng của bà con!
                  </p>
                  <Link to="/search" className="btn btn-primary">Try Trợ Lý AI Tìm Máy →</Link>
                </div>
                <div style={{ borderRadius: 16, overflow: 'hidden', height: 260 }}>
                  <img
                    src={GUIDE_IMAGES.farmerStepImg}
                    alt="Nông dân tìm máy nông nghiệp"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/600x400?text=Thuê+Máy+Nông+Nghiệp'; }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CHỦ MÁY CƠ GIỚI */}
          {tab === 'owner' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 40 }}>
                <div className="card-box" style={{ padding: 28, position: 'relative' }}>
                  <span style={{ fontSize: 36, fontWeight: 800, color: 'var(--gold-dark)', opacity: 0.9, display: 'block', marginBottom: 10 }}>01</span>
                  <h3 style={{ fontSize: 18, marginBottom: 10 }}>1. Tạo tài khoản Chủ máy</h3>
                  <p style={{ color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                    Đăng ký tài khoản với vai trò <b>"Chủ máy cơ giới"</b>, cập nhật Số điện thoại liên lạc và khu vực địa bàn huyện hoạt động chính tại An Giang.
                  </p>
                </div>

                <div className="card-box" style={{ padding: 28, position: 'relative' }}>
                  <span style={{ fontSize: 36, fontWeight: 800, color: 'var(--gold-dark)', opacity: 0.9, display: 'block', marginBottom: 10 }}>02</span>
                  <h3 style={{ fontSize: 18, marginBottom: 10 }}>2. Đăng máy & Upload ảnh</h3>
                  <p style={{ color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                    Vào <b>Kênh Chủ Máy (/owner)</b> ➔ Tab "Đăng máy mới". Tải ảnh thực tế từ máy tính, đặt giá thuê/ngày và dùng nút <b>✨ AI Gợi Ý Mô Tả Máy</b> để bài đăng hấp dẫn hơn.
                  </p>
                </div>

                <div className="card-box" style={{ padding: 28, position: 'relative' }}>
                  <span style={{ fontSize: 36, fontWeight: 800, color: 'var(--gold-dark)', opacity: 0.9, display: 'block', marginBottom: 10 }}>03</span>
                  <h3 style={{ fontSize: 18, marginBottom: 10 }}>3. Nhận đơn & Nâng cấp VIP</h3>
                  <p style={{ color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                    Nhận thông báo khi nông dân đặt máy. Bấm "Nhận đơn", tới công ruộng thi công và nâng cấp lên <b>Gói VIP Partner</b> để đứng top tìm kiếm & mở tính năng phân tích giá thị trường.
                  </p>
                </div>
              </div>

              {/* Showcase Banner For Owner */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30, alignItems: 'center', background: '#FFFDF5', borderRadius: 20, padding: 30, border: '2px solid var(--gold)', boxShadow: 'var(--shadow-card)' }}>
                <div>
                  <div className="eyebrow-label" style={{ color: 'var(--gold-dark)' }}>QUYỀN LỢI CHỦ MÁY VIP</div>
                  <h3 style={{ fontSize: 22, margin: '8px 0 12px' }}>Đứng đầu danh sách tìm kiếm & Đặt quảng cáo Banner</h3>
                  <p style={{ color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
                    Chỉ với gói VIP Partner 199k/tháng, tất cả phương tiện của bạn sẽ luôn hiển thị ở <b>vị trí #1</b> trên danh sách tìm kiếm của nông dân và được cấp Badge uy tín <b>"Đối tác đáng tin cậy"</b>.
                  </p>
                  <Link to="/owner" className="btn btn-primary">🚀 Khám Phá Kênh Chủ Máy →</Link>
                </div>
                <div style={{ borderRadius: 16, overflow: 'hidden', height: 260 }}>
                  <img
                    src={GUIDE_IMAGES.ownerStepImg}
                    alt="Chủ máy nông nghiệp An Giang"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/600x400?text=Chủ+Máy+Cơ+Giới'; }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* FAQ Accordion Section */}
          <div className="card-box" style={{ marginTop: 50, padding: 36, borderRadius: 20 }}>
            <h3 style={{ fontSize: 22, marginBottom: 20, textAlign: 'center' }}>❓ Các Câu Hỏi Thường Gặp (FAQs)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div style={{ background: 'var(--bg-light)', padding: 18, borderRadius: 12 }}>
                <b style={{ color: 'var(--green-deep)', fontSize: 15, display: 'block', marginBottom: 6 }}>Q: Tôi có phải trả phí khi tìm máy trên AGRIGO không?</b>
                <p style={{ fontSize: 13.5, margin: 0, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
                  Hoàn toàn miễn phí! Nông dân không mất bất kỳ khoản phí nào khi tìm kiếm hay gửi đơn đặt máy trên hệ thống.
                </p>
              </div>

              <div style={{ background: 'var(--bg-light)', padding: 18, borderRadius: 12 }}>
                <b style={{ color: 'var(--green-deep)', fontSize: 15, display: 'block', marginBottom: 6 }}>Q: Ảnh máy nông nghiệp tải lên được lưu ở đâu?</b>
                <p style={{ fontSize: 13.5, margin: 0, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
                  Ảnh tải từ máy tính được lưu trữ trực tiếp an toàn tại thư mục server `/uploads` của AGRIGO, không lo lỗi link.
                </p>
              </div>

              <div style={{ background: 'var(--bg-light)', padding: 18, borderRadius: 12 }}>
                <b style={{ color: 'var(--green-deep)', fontSize: 15, display: 'block', marginBottom: 6 }}>Q: Nếu máy hỏng đột xuất khi ra ruộng thì xử lý ra sao?</b>
                <p style={{ fontSize: 13.5, margin: 0, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
                  Chủ máy bấm từ chối đơn và thông báo cho Hotline 1900 6868. AGRIGO sẽ hỗ trợ kết nối máy khác trong cùng huyện ngay trong ngày.
                </p>
              </div>

              <div style={{ background: 'var(--bg-light)', padding: 18, borderRadius: 12 }}>
                <b style={{ color: 'var(--green-deep)', fontSize: 15, display: 'block', marginBottom: 6 }}>Q: Tôi muốn đổi hình ảnh banner trang web thì làm thế nào?</b>
                <p style={{ fontSize: 13.5, margin: 0, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
                  Mỗi trang đều có hằng số `_IMAGES` ở ngay đầu file code. Bạn chỉ cần mở file `.jsx` tương ứng và đổi đường dẫn URL hình ảnh là chạy ngay lập tức!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
