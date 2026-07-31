import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../api';
import { categoryIcon, formatVND } from '../components/MachineCard';

const DISTRICTS = ['Long Xuyên', 'Châu Đốc', 'Châu Phú', 'Châu Thành', 'Chợ Mới', 'Phú Tân', 'Tân Châu', 'Thoại Sơn', 'Tri Tôn', 'Tịnh Biên'];

export default function Search() {
  const [params, setParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);

  const district = params.get('district') || '';
  const category = params.get('category') || '';
  const date = params.get('date') || '';
  const sort = params.get('sort') || 'newest';

  useEffect(() => {
    api.get('/categories').then((d) => setCategories(d.categories));
  }, []);

  useEffect(() => {
    setLoading(true);
    const q = new URLSearchParams();
    if (district) q.set('district', district);
    if (category) q.set('category', category);
    if (date) q.set('date', date);
    if (sort) q.set('sort', sort);
    api.get(`/machines?${q.toString()}`)
      .then((d) => setMachines(d.machines))
      .finally(() => setLoading(false));
  }, [district, category, date, sort]);

  function updateParam(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next);
  }

  return (
    <div className="container" style={{ paddingTop: 26 }}>
      <form className="search-card" style={{ marginBottom: 26 }} onSubmit={(e) => e.preventDefault()}>
        <div className="search-field">
          <label>Khu vực</label>
          <select value={district} onChange={(e) => updateParam('district', e.target.value)}>
            <option value="">Tất cả khu vực</option>
            {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="search-field">
          <label>Loại máy</label>
          <select value={category} onChange={(e) => updateParam('category', e.target.value)}>
            <option value="">Tất cả loại máy</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div className="search-field">
          <label>Ngày cần dùng</label>
          <input type="date" value={date} onChange={(e) => updateParam('date', e.target.value)} />
        </div>
        <button className="btn btn-primary" type="button" onClick={() => {}}>🔍 Đã lọc</button>
      </form>

      <div className="search-layout">
        <aside className="filter-box">
          <h4>Sắp xếp</h4>
          <div className="filter-group">
            <a href="#" className="opt small" style={{ display: 'block', padding: '6px 0', fontWeight: sort === 'newest' ? 700 : 400 }} onClick={(e) => { e.preventDefault(); updateParam('sort', 'newest'); }}>Mới nhất</a>
            <a href="#" className="opt small" style={{ display: 'block', padding: '6px 0', fontWeight: sort === 'price_asc' ? 700 : 400 }} onClick={(e) => { e.preventDefault(); updateParam('sort', 'price_asc'); }}>Giá thấp → cao</a>
            <a href="#" className="opt small" style={{ display: 'block', padding: '6px 0', fontWeight: sort === 'rating' ? 700 : 400 }} onClick={(e) => { e.preventDefault(); updateParam('sort', 'rating'); }}>Đánh giá cao nhất</a>
          </div>
          <h4>Kết quả</h4>
          <p className="small">Tìm thấy <b>{machines.length}</b> máy phù hợp</p>
        </aside>

        <div className="results-list">
          {loading && <p>Đang tải...</p>}
          {!loading && machines.length === 0 && (
            <div className="empty-state"><div className="ico">🔍</div>Không tìm thấy máy phù hợp. Hãy thử đổi bộ lọc.</div>
          )}
          {!loading && machines.map((m) => {
            const cat = m.category_id || {};
            return (
              <Link key={m._id} to={`/machine/${m._id}`} className="result-row">
                <div className="thumb" style={{ borderRadius: 12 }}>
                  {m.image_url ? <img src={m.image_url} /> : categoryIcon(cat.slug)}
                </div>
                <div className="mid">
                  <div className="cat">{cat.name}</div>
                  <h3>{m.name}</h3>
                  <div className="loc">📍 {m.district}{m.address_detail ? ' · ' + m.address_detail : ''}</div>
                  <div className="desc">{(m.description || '').slice(0, 120)}</div>
                  <div className="tag-row">
                    {m.brand && <span className="tag">{m.brand}</span>}
                    {m.year_made && <span className="tag">Đời {m.year_made}</span>}
                  </div>
                </div>
                <div className="right">
                  <div className="rating">
                    {m.rating_count > 0
                      ? <><span className="star">★</span> {Number(m.rating_avg).toFixed(1)} ({m.rating_count} đánh giá)</>
                      : <span className="small">Chưa có đánh giá</span>}
                  </div>
                  <div>
                    <div className="price">{formatVND(m.price_per_day)}</div>
                    <div className="small">/ {m.price_unit}</div>
                  </div>
                  <span className="btn btn-primary btn-sm">Xem & đặt lịch</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
