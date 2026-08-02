import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import MachineCard, { categoryIcon } from '../components/MachineCard';
import { useScrollReveal } from '../hooks/useScrollReveal';

const DISTRICTS = ['Long Xuyên', 'Châu Đốc', 'Châu Phú', 'Châu Thành', 'Chợ Mới', 'Phú Tân', 'Tân Châu', 'Thoại Sơn', 'Tri Tôn', 'Tịnh Biên'];

import AdBannerSlider from '../components/AdBannerSlider';

// 📸 [HƯỚNG DẪN THAY ĐỔI ẢNH PLACEHOLDER TRANG CHỦ]:
// Bạn có thể dễ dàng thay đổi đường dẫn URL bên dưới để đổi hình ảnh minh họa theo nhu cầu!
const HOME_IMAGES = {
  heroBg: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1920&auto=format&fit=crop&q=80', // Banner Cánh đồng lúa An Giang
  ctaBg: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=1600&auto=format&fit=crop&q=80', // Banner Đăng ký Chủ máy
};

export default function Home() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [form, setForm] = useState({ district: '', category: '', date: '' });

  useScrollReveal([categories, featured]);

  useEffect(() => {
    api.get('/categories').then((d) => setCategories(d.categories));
    api.get('/machines?sort=rating').then((d) => setFeatured(d.machines.slice(0, 8)));
  }, []);

  function submitSearch(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (form.district) params.set('district', form.district);
    if (form.category) params.set('category', form.category);
    if (form.date) params.set('date', form.date);
    navigate(`/search?${params.toString()}`);
  }

  const stats = {
    machineCount: featured.length ? 120 : 0,
    ownerCount: 45,
    bookingCount: 380,
  };

  return (
    <>
      <section className="hero" style={{ background: `linear-gradient(rgba(21,58,46,0.82), rgba(31,92,69,0.88)), url('${HOME_IMAGES.heroBg}') center/cover` }}>
        <div className="container hero-inner">
          <span className="eyebrow reveal">🌾 Nền tảng kết nối máy nông nghiệp #1 khu vực ĐBSCL</span>
          <h1 className="reveal reveal-delay-1">Thuê máy cày, máy gặt, drone phun thuốc — chỉ trong vài phút</h1>
          <p className="lead reveal reveal-delay-2">Tìm máy nông nghiệp gần bạn theo khu vực, xem giá công khai và đặt lịch trực tiếp với chủ máy — không qua trung gian, không phát sinh chi phí ẩn.</p>

          <form className="search-card reveal reveal-delay-3" onSubmit={submitSearch}>
            <div className="search-field">
              <label>Khu vực</label>
              <select value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })}>
                <option value="">Tất cả khu vực</option>
                {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="search-field">
              <label>Loại máy</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="">Tất cả loại máy</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div className="search-field">
              <label>Ngày cần dùng</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <button className="btn btn-primary" type="submit">🔍 Tìm máy ngay</button>
          </form>

          <div className="hero-stats reveal reveal-delay-4">
            <div><b>{stats.machineCount}+</b>Máy đang hoạt động</div>
            <div><b>{stats.ownerCount}+</b>Chủ máy tham gia</div>
            <div><b>{stats.bookingCount}+</b>Lượt đặt lịch thành công</div>
          </div>
        </div>
      </section>

      {/* Danh mục loại máy */}
      <div className="container">
        {/* 
          📸 [HƯỚNG DẪN CHỌN ICON/ẢNH DANH MỤC (.cat-card .ico)]:
          - Tỉ lệ: 1:1 vuông (khuyến nghị ~96x96px cho Retina 2x).
          - Định dạng: PNG (nền trong suốt) hoặc Emoji icon 46px.
        */}
        <div className="cat-grid">
          {categories.map((c, idx) => (
            <Link key={c._id} to={`/search?category=${c._id}`} className={`cat-card reveal reveal-zoom reveal-delay-${(idx % 4) + 1}`}>
              <div className="ico">{categoryIcon(c.slug)}</div>
              <div className="name">{c.name}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Banner Quảng Cáo Đối Tác Premium */}
      <AdBannerSlider />

      {/* Danh sách máy nổi bật */}
      <section className="section">
        <div className="container">
          <div className="section-head reveal">
            <div>
              <p className="eyebrow-label">Gợi ý cho bạn</p>
              <h2>Máy nông nghiệp nổi bật</h2>
              <p>Được đánh giá cao và sẵn sàng nhận lịch trong tuần này</p>
            </div>
            <Link to="/search" className="btn btn-outline">Xem tất cả</Link>
          </div>
          <div className="card-grid">
            {featured.length
              ? featured.map((m, idx) => (
                  <div key={m._id} className={`reveal reveal-delay-${(idx % 4) + 1}`}>
                    <MachineCard machine={m} />
                  </div>
                ))
              : <div className="empty-state"><div className="ico">🌾</div>Chưa có máy nào được duyệt.</div>}
          </div>
        </div>
      </section>

      {/* Quy trình 3 bước làm việc */}
      <section className="section" style={{ background: '#F4F7F4' }}>
        <div className="container">
          <div className="section-head reveal" style={{ marginBottom: 32 }}>
            <div>
              <p className="eyebrow-label">Quy trình đơn giản</p>
              <h2>3 bước để có máy làm ruộng đúng ngày</h2>
              <p>Hệ thống tự động hóa giúp nông dân và chủ máy dễ dàng kết nối chỉ với vài cú nhấp chuột</p>
            </div>
          </div>
          <div className="steps-grid">
            <div className="step-card reveal reveal-delay-1">
              <div className="step-num">1</div>
              <h3 style={{ margin: '0 0 8px', fontSize: 17 }}>Tìm máy gần bạn</h3>
              <p className="small" style={{ lineHeight: 1.6 }}>Chọn địa bàn huyện (Long Xuyên, Châu Đốc, Thoại Sơn...), loại máy cần thuê và ngày dự kiến làm ruộng.</p>
            </div>
            <div className="step-card reveal reveal-delay-2">
              <div className="step-num">2</div>
              <h3 style={{ margin: '0 0 8px', fontSize: 17 }}>Đặt lịch trực tuyến</h3>
              <p className="small" style={{ lineHeight: 1.6 }}>Xem trước thông số kỹ thuật, vị trí trên bản đồ, giá niêm yết công khai và gửi yêu cầu lịch thuê.</p>
            </div>
            <div className="step-card reveal reveal-delay-3">
              <div className="step-num">3</div>
              <h3 style={{ margin: '0 0 8px', fontSize: 17 }}>Nhận máy & Đánh giá</h3>
              <p className="small" style={{ lineHeight: 1.6 }}>Chủ máy đến tận công ruộng làm đúng hẹn. Nông dân nghiệm thu và để lại đánh giá uy tín chất lượng dịch vụ.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Vì sao chọn AGRIGO */}
      <section className="section">
        <div className="container">
          <div className="section-head reveal" style={{ textAlignment: 'center' }}>
            <div>
              <p className="eyebrow-label">Ưu điểm vượt trội</p>
              <h2>Tại sao bà con tin chọn AGRIGO?</h2>
            </div>
          </div>
          <div className="marketing-grid">
            <div className="feature-card reveal reveal-delay-1">
              <div className="icon">🛡️</div>
              <h3>Chủ máy xác minh 100%</h3>
              <p>Tất cả danh tính chủ máy và phương tiện đều được đội ngũ AGRIGO kiểm duyệt giấy tờ kỹ thuật trước khi cho phép nhận đơn.</p>
            </div>
            <div className="feature-card reveal reveal-delay-2">
              <div className="icon">💵</div>
              <h3>Giá công khai, không ép giá</h3>
              <p>Mọi mức giá thuê theo ngày/công ruộng đều niêm yết minh bạch. Nông dân không lo bị tăng giá đột ngột vào mùa vụ cao điểm.</p>
            </div>
            <div className="feature-card reveal reveal-delay-3">
              <div className="icon">🗺️</div>
              <h3>Bản đồ máy thông minh</h3>
              <p>Dễ dàng định vị các phương tiện cơ giới gần công ruộng của bạn, giảm chi phí vận chuyển đường bộ/đường sông.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Banner kêu gọi Chủ máy đăng ký */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          {/* 
            📸 [HƯỚNG DẪN CHỌN ẢNH CTA BANNER]:
            - Tỉ lệ: 16:9 hoặc 2.4:1 (~1600x600px).
            - Định dạng: WebP / JPEG (nén <250KB qua Squoosh.app).
          */}
          <div className="cta-banner reveal reveal-zoom" style={{ background: `linear-gradient(rgba(21,58,46,0.85), rgba(21,58,46,0.85)), url('${HOME_IMAGES.ctaBg}') center/cover` }}>
            <div>
              <h2>Bạn đang sở hữu máy cày, máy gặt hoặc drone?</h2>
              <p>Gia nhập mạng lưới AGRIGO để tăng 40% doanh thu mùa vụ và tối ưu hóa lịch làm việc cho thiết bị của bạn.</p>
            </div>
            <Link to="/register" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: 15, flexShrink: 0 }}>
              🚜 Đăng ký Chủ máy ngay
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

