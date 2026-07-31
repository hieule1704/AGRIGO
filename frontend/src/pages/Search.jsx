import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../api';
import { categoryIcon, formatVND } from '../components/MachineCard';
import MachineMap from '../components/MachineMap';

const DISTRICTS = ['Long Xuyên', 'Châu Đốc', 'Châu Phú', 'Châu Thành', 'Chợ Mới', 'Phú Tân', 'Tân Châu', 'Thoại Sơn', 'Tri Tôn', 'Tịnh Biên'];

const DISTRICT_CENTERS = {
  'Long Xuyên': [10.3833, 105.4167],
  'Châu Đốc': [10.7000, 105.1167],
  'Châu Phú': [10.5500, 105.1333],
  'Chợ Mới': [10.4500, 105.5333],
  'Thoại Sơn': [10.2833, 105.2333],
  'Tri Tôn': [10.4167, 105.0000],
  'Phú Tân': [10.6333, 105.3500],
  'Tân Châu': [10.8000, 105.2333],
  'Tịnh Biên': [10.6000, 104.9500],
  'Châu Thành': [10.4333, 105.3167],
};

export default function Search() {
  const [params, setParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'list' | 'map'

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

  const mapCenter = DISTRICT_CENTERS[district] || null;

  return (
    <div className="container" style={{ paddingTop: 26, paddingBottom: 40 }}>
      <form className="search-card" style={{ marginBottom: 20 }} onSubmit={(e) => e.preventDefault()}>
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
        <button className="btn btn-primary" type="button" onClick={() => {}}>🔍 Tìm kiếm</button>
      </form>

      {/* Thanh điều khiển Chế độ xem: Danh sách / Bản đồ / Song song */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, background: 'var(--bg-card)', padding: '10px 16px', borderRadius: 12, border: '1px solid var(--line)' }}>
        <div>
          <span className="small" style={{ color: 'var(--muted)' }}>Tìm thấy <b>{machines.length}</b> máy nông nghiệp</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            type="button"
            className={`btn btn-sm ${viewMode === 'split' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setViewMode('split')}
          >
            ⚖️ Song song
          </button>
          <button
            type="button"
            className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setViewMode('list')}
          >
            📋 Danh sách
          </button>
          <button
            type="button"
            className={`btn btn-sm ${viewMode === 'map' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setViewMode('map')}
          >
            🗺 Bản đồ Leaflet
          </button>
        </div>
      </div>

      <div className="search-layout">
        <aside className="filter-box">
          <h4>Sắp xếp</h4>
          <div className="filter-group">
            <a href="#" className="opt small" style={{ display: 'block', padding: '6px 0', fontWeight: sort === 'newest' ? 700 : 400 }} onClick={(e) => { e.preventDefault(); updateParam('sort', 'newest'); }}>Mới nhất</a>
            <a href="#" className="opt small" style={{ display: 'block', padding: '6px 0', fontWeight: sort === 'price_asc' ? 700 : 400 }} onClick={(e) => { e.preventDefault(); updateParam('sort', 'price_asc'); }}>Giá thấp → cao</a>
            <a href="#" className="opt small" style={{ display: 'block', padding: '6px 0', fontWeight: sort === 'rating' ? 700 : 400 }} onClick={(e) => { e.preventDefault(); updateParam('sort', 'rating'); }}>Đánh giá cao nhất</a>
          </div>
        </aside>

        <div style={{ flex: 1, minWidth: 0 }}>
          {loading && <p>Đang tải dữ liệu máy...</p>}

          {!loading && (
            <>
              {/* CHẾ ĐỘ XEM 1: CHỈ BẢN ĐỒ */}
              {viewMode === 'map' && (
                <div>
                  <MachineMap machines={machines} center={mapCenter} zoom={district ? 12 : 10} height="600px" />
                </div>
              )}

              {/* CHẾ ĐỘ XEM 2: SONG SONG (Bản đồ + Danh sách) */}
              {viewMode === 'split' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ position: 'sticky', top: 80, height: 'calc(100vh - 120px)' }}>
                    <MachineMap machines={machines} center={mapCenter} zoom={district ? 12 : 10} height="100%" />
                  </div>
                  <div className="results-list" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 120px)', paddingRight: 4 }}>
                    {machines.length === 0 ? (
                      <div className="empty-state"><div className="ico">🔍</div>Không tìm thấy máy phù hợp.</div>
                    ) : (
                      machines.map((m) => <MachineRow key={m._id} machine={m} compact={true} />)
                    )}
                  </div>
                </div>
              )}

              {/* CHẾ ĐỘ XEM 3: CHỈ DANH SÁCH */}
              {viewMode === 'list' && (
                <div className="results-list">
                  {machines.length === 0 ? (
                    <div className="empty-state"><div className="ico">🔍</div>Không tìm thấy máy phù hợp. Hãy thử đổi bộ lọc.</div>
                  ) : (
                    machines.map((m) => <MachineRow key={m._id} machine={m} />)
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Component render 1 dòng máy nông nghiệp
function MachineRow({ machine: m, compact = false }) {
  const cat = m.category_id || {};
  return (
    <Link to={`/machine/${m._id}`} className={`result-row ${compact ? 'compact' : ''}`}>
      <div className="thumb">
        {m.image_url ? <img src={m.image_url} alt={m.name} /> : categoryIcon(cat.slug)}
      </div>
      <div className="mid">
        <div className="cat">{cat.name}</div>
        <h3>{m.name}</h3>
        <div className="loc">📍 {m.district}{m.address_detail ? ' · ' + m.address_detail : ''}</div>
        {!compact && <div className="desc">{(m.description || '').slice(0, 110)}...</div>}
        <div className="tag-row">
          {m.brand && <span className="tag">{m.brand}</span>}
          {m.year_made && <span className="tag">Đời {m.year_made}</span>}
        </div>
      </div>
      <div className="right">
        <div className="rating">
          {m.rating_count > 0
            ? <><span className="star">★</span> {Number(m.rating_avg).toFixed(1)} ({m.rating_count})</>
            : <span className="small">Chưa đánh giá</span>}
        </div>
        <div>
          <div className="price">{formatVND(m.price_per_day)} <span className="small">/ {m.price_unit}</span></div>
        </div>
        <span className="btn btn-primary btn-sm">Xem & đặt</span>
      </div>
    </Link>
  );
}
