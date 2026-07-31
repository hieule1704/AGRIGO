import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import MachineCard, { categoryIcon } from '../components/MachineCard';

const DISTRICTS = ['Long Xuyên', 'Châu Đốc', 'Châu Phú', 'Châu Thành', 'Chợ Mới', 'Phú Tân', 'Tân Châu', 'Thoại Sơn', 'Tri Tôn', 'Tịnh Biên'];

export default function Home() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [form, setForm] = useState({ district: '', category: '', date: '' });

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
    machineCount: featured.length ? 20 : 0,
    ownerCount: 12,
    bookingCount: 45,
  };

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <span className="eyebrow">🌾 Nền tảng kết nối máy nông nghiệp #1 khu vực ĐBSCL</span>
          <h1>Thuê máy cày, máy gặt, drone phun thuốc — chỉ trong vài phút</h1>
          <p className="lead">Tìm máy nông nghiệp gần bạn theo khu vực, xem giá công khai và đặt lịch trực tiếp với chủ máy — không qua trung gian, không phát sinh chi phí ẩn.</p>

          <form className="search-card" onSubmit={submitSearch}>
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

          <div className="hero-stats">
            <div><b>{stats.machineCount}+</b>Máy đang hoạt động</div>
            <div><b>{stats.ownerCount}+</b>Chủ máy tham gia</div>
            <div><b>{stats.bookingCount}+</b>Lượt đặt lịch thành công</div>
          </div>
        </div>
      </section>

      <div className="container">
        <div className="cat-grid">
          {categories.map((c) => (
            <a key={c._id} href={`/search?category=${c._id}`} className="cat-card">
              <div className="ico">{categoryIcon(c.slug)}</div>
              <div className="name">{c.name}</div>
            </a>
          ))}
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow-label">Gợi ý cho bạn</p>
              <h2>Máy nông nghiệp nổi bật</h2>
              <p>Được đánh giá cao và sẵn sàng nhận lịch trong tuần này</p>
            </div>
            <a href="/search" className="btn btn-outline">Xem tất cả</a>
          </div>
          <div className="card-grid">
            {featured.length
              ? featured.map((m) => <MachineCard key={m._id} machine={m} />)
              : <div className="empty-state"><div className="ico">🌾</div>Chưa có máy nào được duyệt.</div>}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--green-soft)' }}>
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow-label">Cách vận hành</p>
              <h2>3 bước để có máy làm ruộng đúng ngày</h2>
            </div>
          </div>
          <div className="cat-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
            <div className="cat-card" style={{ textAlign: 'left', padding: 22 }}>
              <div className="ico">📍</div>
              <h3 style={{ margin: '6px 0', fontSize: 16 }}>1. Tìm máy gần bạn</h3>
              <p className="small">Chọn khu vực, loại máy và ngày cần dùng.</p>
            </div>
            <div className="cat-card" style={{ textAlign: 'left', padding: 22 }}>
              <div className="ico">📅</div>
              <h3 style={{ margin: '6px 0', fontSize: 16 }}>2. Đặt lịch trực tuyến</h3>
              <p className="small">Xem giá công khai, gửi yêu cầu đặt lịch.</p>
            </div>
            <div className="cat-card" style={{ textAlign: 'left', padding: 22 }}>
              <div className="ico">✅</div>
              <h3 style={{ margin: '6px 0', fontSize: 16 }}>3. Nhận máy & đánh giá</h3>
              <p className="small">Máy đến đúng hẹn, đánh giá sau khi hoàn tất.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
