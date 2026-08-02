import { Link } from 'react';
import { Link as RouterLink } from 'react-router-dom';

// 📸 [HƯỚNG DẪN THAY ĐỔI ẢNH PLACEHOLDER CHO TRANG GIỚI THIỆU]:
// Bạn chỉ cần thay đổi các đường dẫn URL bên dưới để thay đổi hình ảnh theo ý thích!
const ABOUT_IMAGES = {
  heroBanner: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=1200&auto=format&fit=crop&q=80', // Ảnh Banner Cánh đồng lúa & Máy cơ giới
  missionThumb: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80', // Ảnh Máy gặt Kubota hiện đại
  impactThumb: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=800&auto=format&fit=crop&q=80', // Ảnh Nông dân & Kỹ thuật viên đồng ruộng
};

export default function About() {
  return (
    <>
      {/* Hero Banner Section */}
      <section className="hero" style={{ padding: '60px 0 80px', background: 'linear-gradient(135deg, var(--green-deep) 0%, var(--green-mid) 100%)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 40, alignItems: 'center' }}>
          <div>
            <div className="eyebrow" style={{ color: 'var(--gold)', background: 'rgba(232,172,31,0.15)', border: '1px solid var(--gold)' }}>
              🌾 HỆ THỐNG KẾT NỐI MÁY NÔNG NGHIỆP AN GIANG
            </div>
            <h1 style={{ fontSize: 38, fontWeight: 800, margin: '14px 0', lineHeight: 1.25 }}>
              Sứ mệnh số hóa cơ giới hóa & đồng hành cùng vụ mùa ĐBSCL
            </h1>
            <p className="lead" style={{ fontSize: 16, opacity: 0.9, lineHeight: 1.6, marginBottom: 26 }}>
              AGRIGO ra đời với tiêu chí kết nối trực tiếp Nông dân và Chủ máy cơ giới, giúp nâng cao năng suất mùa vụ, minh bạch chi phí thuê máy và tối ưu 100% công suất phương tiện nông nghiệp tại 11 huyện thị An Giang.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <RouterLink to="/search" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: 15 }}>
                🔍 Khám phá 35+ Máy nông nghiệp
              </RouterLink>
              <RouterLink to="/guide" className="btn" style={{ color: 'var(--green-deep)', background: '#ffffff', border: '1px solid #ffffff', fontWeight: 'bold', padding: '12px 24px', fontSize: 15 }}>
                📖 Xem Hướng Dẫn Vận Hành
              </RouterLink>
            </div>
          </div>

          <div style={{ borderRadius: 20, overflow: 'hidden', border: '3px solid var(--gold)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
            <img
              src={ABOUT_IMAGES.heroBanner}
              alt="AGRIGO Nông nghiệp An Giang"
              style={{ width: '100%', height: 340, objectFit: 'cover' }}
              onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/800x500?text=AGRIGO+An+Giang'; }}
            />
          </div>
        </div>
      </section>

      {/* Stat Strip Section */}
      <section style={{ background: '#FFFDF5', borderBottom: '1px solid var(--line)', padding: '30px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, textAlign: 'center' }}>
            <div className="card-box" style={{ margin: 0, padding: 20, border: '1px solid var(--line)' }}>
              <b style={{ fontSize: 32, color: 'var(--green-deep)', display: 'block', fontWeight: 800 }}>35+</b>
              <span style={{ fontSize: 13, color: 'var(--ink-soft)', fontWeight: 600 }}>Phương tiện cơ giới có sẵn</span>
            </div>
            <div className="card-box" style={{ margin: 0, padding: 20, border: '1px solid var(--line)' }}>
              <b style={{ fontSize: 32, color: 'var(--gold-dark)', display: 'block', fontWeight: 800 }}>11/11</b>
              <span style={{ fontSize: 13, color: 'var(--ink-soft)', fontWeight: 600 }}>Huyện/Thị phủ sóng An Giang</span>
            </div>
            <div className="card-box" style={{ margin: 0, padding: 20, border: '1px solid var(--line)' }}>
              <b style={{ fontSize: 32, color: 'var(--green-deep)', display: 'block', fontWeight: 800 }}>99.2%</b>
              <span style={{ fontSize: 13, color: 'var(--ink-soft)', fontWeight: 600 }}>Tỉ lệ nông dân hài lòng</span>
            </div>
            <div className="card-box" style={{ margin: 0, padding: 20, border: '1px solid var(--line)' }}>
              <b style={{ fontSize: 32, color: 'var(--gold-dark)', display: 'block', fontWeight: 800 }}>5.200+</b>
              <span style={{ fontSize: 13, color: 'var(--ink-soft)', fontWeight: 600 }}>Héc-ta diện tích gặt sạ</span>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition Grid */}
      <section className="section" style={{ padding: '60px 0' }}>
        <div className="container">
          <div className="section-head text-center" style={{ textAlign: 'center', marginBottom: 44 }}>
            <div className="eyebrow-label">GIÁ TRỊ CỐT LÕI</div>
            <h2>Tại sao bà con tin chọn nền tảng AGRIGO?</h2>
            <p style={{ maxWidth: 640, margin: '8px auto 0' }}>AGRIGO giải quyết bài toán thiếu hụt máy móc mùa vụ và nâng cao hiệu quả kinh tế nông nghiệp.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 50 }}>
            <div className="card-box" style={{ padding: 28 }}>
              <div style={{ width: 54, height: 54, borderRadius: 14, background: 'var(--green-soft)', color: 'var(--green-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 18 }}>🌱</div>
              <h3 style={{ fontSize: 18, marginBottom: 10 }}>Đồng Hành Cùng Nông Dân</h3>
              <p style={{ color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                Giúp bà con tìm đúng loại máy cày, máy gặt Kubota, Yanmar, Drone phun thuốc phù hợp với thổ nhưỡng của từng huyện, đảm bảo tiến độ sạ gặt đúng lịch nông vụ.
              </p>
            </div>

            <div className="card-box" style={{ padding: 28 }}>
              <div style={{ width: 54, height: 54, borderRadius: 14, background: '#FFF8E7', color: 'var(--gold-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 18 }}>🚜</div>
              <h3 style={{ fontSize: 18, marginBottom: 10 }}>Tối Ưu Tài Sản Chủ Máy</h3>
              <p style={{ color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                Chủ máy chủ động quản lý danh sách dàn xe, tiếp nhận đơn thuê trực tiếp từ nông dân quanh vùng và theo dõi doanh thu realtime mà không lo máy nằm bãi mùa sạ.
              </p>
            </div>

            <div className="card-box" style={{ padding: 28 }}>
              <div style={{ width: 54, height: 54, borderRadius: 14, background: 'var(--green-soft)', color: 'var(--green-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 18 }}>🛡️</div>
              <h3 style={{ fontSize: 18, marginBottom: 10 }}>Minh Bạch & Tin Cậy</h3>
              <p style={{ color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                Bảng giá niêm yết rõ ràng theo công ruộng hoặc ngày thuê. Đội ngũ hỗ trợ kỹ thuật viên và tổng đài 24/7 luôn sẵn sàng xử lý sự cố trực tiếp tại đồng ruộng.
              </p>
            </div>
          </div>

          {/* Two-Column Image Showcase Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36, alignItems: 'center', background: '#ffffff', borderRadius: 20, padding: 30, border: '1px solid var(--line)', boxShadow: 'var(--shadow-card)' }}>
            <div>
              <div className="eyebrow-label">TẦM NHÌN NÔNG NGHIỆP SỐ</div>
              <h3 style={{ fontSize: 24, margin: '8px 0 14px' }}>Ứng dụng AI & Bản đồ định vị thông minh</h3>
              <p style={{ color: 'var(--ink-soft)', fontSize: 14.5, lineHeight: 1.75, marginBottom: 16 }}>
                Hệ thống AGRIGO tích hợp <b>Trợ lý AI tìm kiếm ngôn ngữ tự nhiên</b> và <b>Bản đồ định vị vệ tinh Leaflet</b> giúp xác định vị trí máy gặt gần ruộng nhất, tiết kiệm tối đa chi phí vận chuyển xe cơ giới giữa các khu vực Châu Phú, Thoại Sơn, Tri Tôn hay Tịnh Biên.
              </p>
              <ul style={{ paddingLeft: 20, color: 'var(--ink)', fontSize: 14, lineHeight: 1.8 }}>
                <li>Tự động tính tổng chi phí thuê ruộng và tiền cọc tức thì.</li>
                <li>Hệ thống đánh giá sao và nhận xét từ Nông dân thực tế.</li>
                <li>Gói đối tác VIP ưu tiên quảng cáo banner và hiển thị top đầu.</li>
              </ul>
            </div>
            <div style={{ borderRadius: 16, overflow: 'hidden', height: 320 }}>
              <img
                src={ABOUT_IMAGES.missionThumb}
                alt="Thiết bị nông cơ hiện đại"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/600x400?text=Máy+Nông+Nghiệp+An+Giang'; }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Box */}
      <section style={{ padding: '0 0 60px' }}>
        <div className="container">
          <div className="card-box text-center" style={{ padding: 44, textAlign: 'center', background: 'linear-gradient(135deg, #153A2E 0%, #1F5C45 100%)', color: '#fff', borderRadius: 24 }}>
            <h2 style={{ fontSize: 28, margin: '0 0 12px', color: '#fff' }}>Sẵn sàng trải nghiệm dịch vụ nông nghiệp số?</h2>
            <p style={{ maxWidth: 620, margin: '0 auto 24px', opacity: 0.9, fontSize: 15 }}>
              Tham gia cùng hàng trăm bà con nông dân và chủ máy An Giang để tối ưu hóa năng suất mùa vụ ngay hôm nay!
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <RouterLink to="/search" className="btn btn-primary" style={{ padding: '12px 26px', fontSize: 15 }}>
                🌾 Tìm Máy Thuê Ngay
              </RouterLink>
              <RouterLink to="/register?role=owner" className="btn btn-outline" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)', padding: '12px 26px', fontSize: 15 }}>
                🚜 Đăng Ký Chủ Máy Cơ Giới
              </RouterLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
