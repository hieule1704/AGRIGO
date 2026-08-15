import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api, resolveImageUrl } from '../api';
import { categoryIcon, formatVND, CATEGORY_PLACEHOLDERS } from '../components/MachineCard';
import MachineMap from '../components/MachineMap';
import { useScrollReveal } from '../hooks/useScrollReveal';
import AdBannerSlider from '../components/AdBannerSlider';

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

const ITEMS_PER_PAGE = 6;

export default function Search() {
  const [params, setParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'split' | 'map'
  const [page, setPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  const district = params.get('district') || '';
  const category = params.get('category') || '';
  const date = params.get('date') || '';
  const sort = params.get('sort') || 'newest';

  // Lắng nghe kích thước màn hình để tự động điều chỉnh chế độ xem an toàn
  useEffect(() => {
    function handleResize() {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile && viewMode === 'split') {
        setViewMode('list');
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);

  useEffect(() => {
    api.get('/categories').then((d) => setCategories(d.categories || []));
  }, []);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    const q = new URLSearchParams();
    if (district) q.set('district', district);
    if (category) q.set('category', category);
    if (date) q.set('date', date);
    if (sort) q.set('sort', sort);
    api.get(`/machines?${q.toString()}`)
      .then((d) => setMachines(d.machines || []))
      .finally(() => setLoading(false));
  }, [district, category, date, sort]);

  const totalPages = Math.ceil(machines.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const paginatedMachines = machines.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useScrollReveal([paginatedMachines, viewMode, page]);

  function updateParam(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next);
  }

  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiNote, setAiNote] = useState('');

  async function handleAiSearch(e) {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiNote('');
    try {
      const res = await api.post('/ai/search-assistant', { query: aiQuery });
      if (res.result) {
        setAiNote(res.result.summary || 'Đã phân tích yêu cầu bằng AI.');
        const next = new URLSearchParams(params);
        if (res.result.district) next.set('district', res.result.district);
        if (res.result.category_keyword) {
          const kw = res.result.category_keyword.toLowerCase();
          const matchedCat = categories.find((c) => c.name.toLowerCase().includes(kw) || c.slug.includes(kw));
          if (matchedCat) next.set('category', matchedCat._id);
        }
        setParams(next);
      }
    } catch (err) {
      setAiNote('Lỗi trợ lý AI: ' + err.message);
    } finally {
      setAiLoading(false);
    }
  }

  const mapCenter = DISTRICT_CENTERS[district] || null;

  return (
    <div className="container" style={{ paddingTop: 20, paddingBottom: 40 }}>

      {/* Sponsored Banner Quảng cáo Đối tác VIP */}
      <AdBannerSlider district={district} />

      {/* Bộ lọc tìm kiếm nhanh */}
      <form className="search-card" style={{ marginBottom: 16 }} onSubmit={(e) => e.preventDefault()}>
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
        <button className="btn btn-primary" type="button" onClick={() => { }}>🔍 Tìm kiếm</button>
      </form>

      {/* AI Search Assistant */}
      <div className="ai-search-box">
        <form onSubmit={handleAiSearch} className="ai-search-form">
          <div className="ai-search-input-group">
            <label>
              🤖 Trợ lý AI Tìm máy nông nghiệp (Ngôn ngữ tự nhiên)
            </label>
            <input
              type="text"
              placeholder="VD: Cần thuê máy gặt ở Thoại Sơn gấp ngày mai..."
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              className="ai-search-input"
            />
          </div>
          <button type="submit" className="btn btn-primary ai-search-btn" disabled={aiLoading}>
            {aiLoading ? 'Đang phân tích...' : '✨ Tìm bằng AI'}
          </button>
        </form>
        {aiNote && (
          <div className="ai-note-box">
            💡 {aiNote}
          </div>
        )}
      </div>

      {/* Thanh chọn nhanh Sắp xếp dành cho Mobile (Sort Chips) */}
      <div className="mobile-sort-chips">
        <button
          type="button"
          className={`sort-chip ${sort === 'newest' ? 'active' : ''}`}
          onClick={() => updateParam('sort', 'newest')}
        >
          ⚡ Mới nhất
        </button>
        <button
          type="button"
          className={`sort-chip ${sort === 'price_asc' ? 'active' : ''}`}
          onClick={() => updateParam('sort', 'price_asc')}
        >
          💰 Giá thấp → cao
        </button>
        <button
          type="button"
          className={`sort-chip ${sort === 'rating' ? 'active' : ''}`}
          onClick={() => updateParam('sort', 'rating')}
        >
          ⭐ Đánh giá cao
        </button>
      </div>

      {/* Thanh điều khiển Chế độ xem: Danh sách / Bản đồ / Song song */}
      <div className="view-control-bar">
        <div className="count-info">
          Tìm thấy <b>{machines.length}</b> máy nông nghiệp · Trang <b>{page}</b>/<b>{totalPages}</b>
        </div>
        <div className="view-mode-buttons">
          <button
            type="button"
            className={`view-mode-btn btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setViewMode('list')}
            title="Xem danh sách dạng thẻ"
          >
            📋 Danh sách
          </button>
          {!isMobile && (
            <button
              type="button"
              className={`view-mode-btn btn btn-sm ${viewMode === 'split' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setViewMode('split')}
              title="Xem bản đồ và danh sách song song"
            >
              ⚖️ Song song
            </button>
          )}
          <button
            type="button"
            className={`view-mode-btn btn btn-sm ${viewMode === 'map' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setViewMode('map')}
            title="Xem vị trí máy trên bản đồ"
          >
            🗺 Bản đồ
          </button>
        </div>
      </div>

      <div className="search-layout">
        {/* Sidebar Sắp xếp trên Desktop */}
        <aside className="filter-box">
          <h4>Sắp xếp</h4>
          <div className="filter-group">
            <a
              href="#"
              className="opt small"
              style={{ display: 'block', padding: '6px 0', fontWeight: sort === 'newest' ? 700 : 400, color: sort === 'newest' ? 'var(--green-deep)' : 'var(--ink-soft)' }}
              onClick={(e) => { e.preventDefault(); updateParam('sort', 'newest'); }}
            >
              ⚡ Mới nhất
            </a>
            <a
              href="#"
              className="opt small"
              style={{ display: 'block', padding: '6px 0', fontWeight: sort === 'price_asc' ? 700 : 400, color: sort === 'price_asc' ? 'var(--green-deep)' : 'var(--ink-soft)' }}
              onClick={(e) => { e.preventDefault(); updateParam('sort', 'price_asc'); }}
            >
              💰 Giá thấp → cao
            </a>
            <a
              href="#"
              className="opt small"
              style={{ display: 'block', padding: '6px 0', fontWeight: sort === 'rating' ? 700 : 400, color: sort === 'rating' ? 'var(--green-deep)' : 'var(--ink-soft)' }}
              onClick={(e) => { e.preventDefault(); updateParam('sort', 'rating'); }}
            >
              ⭐ Đánh giá cao nhất
            </a>
          </div>
        </aside>

        <div style={{ flex: 1, minWidth: 0 }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--ink-soft)' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>⏳</div>
              <p>Đang tìm kiếm dữ liệu máy nông nghiệp...</p>
            </div>
          )}

          {!loading && (
            <>
              {/* CHẾ ĐỘ XEM 1: CHỈ BẢN ĐỒ */}
              {viewMode === 'map' && (
                <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--line)' }}>
                  <MachineMap machines={machines} center={mapCenter} zoom={district ? 12 : 10} height={isMobile ? '450px' : '600px'} />
                </div>
              )}

              {/* CHẾ ĐỘ XEM 2: SONG SONG (Bản đồ + Danh sách trên Desktop) */}
              {viewMode === 'split' && !isMobile && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ position: 'sticky', top: 80, height: 'calc(100vh - 120px)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                    <MachineMap machines={paginatedMachines} center={mapCenter} zoom={district ? 12 : 10} height="100%" />
                  </div>
                  <div className="results-list" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 120px)', paddingRight: 4 }}>
                    {machines.length === 0 ? (
                      <div className="empty-state"><div className="ico">🔍</div>Không tìm thấy máy phù hợp.</div>
                    ) : (
                      paginatedMachines.map((m) => <MachineRow key={m._id} machine={m} compact={true} />)
                    )}
                  </div>
                </div>
              )}

              {/* CHẾ ĐỘ XEM 3: DANH SÁCH */}
              {(viewMode === 'list' || (viewMode === 'split' && isMobile)) && (
                <div className="results-list">
                  {machines.length === 0 ? (
                    <div className="empty-state" style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', padding: 40, textAlign: 'center' }}>
                      <div className="ico" style={{ fontSize: 36, marginBottom: 10 }}>🔍</div>
                      <h4 style={{ margin: '0 0 6px' }}>Không tìm thấy máy phù hợp</h4>
                      <p className="small" style={{ color: 'var(--ink-soft)', margin: '0 0 16px' }}>Hãy thử chọn khu vực khác hoặc tìm bằng Trợ lý AI.</p>
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => setParams(new URLSearchParams())}>Xóa tất cả bộ lọc</button>
                    </div>
                  ) : (
                    paginatedMachines.map((m) => <MachineRow key={m._id} machine={m} />)
                  )}
                </div>
              )}

              {/* Thanh Phân Trang - Chỉ hiển thị khi có trên 1 trang và KHÔNG ở chế độ Chỉ Bản Đồ */}
              {totalPages > 1 && viewMode !== 'map' && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  marginTop: 20,
                  padding: '14px 16px',
                  background: 'var(--bg-card)',
                  borderRadius: 14,
                  border: '1px solid var(--line)',
                }}>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      style={{ padding: '6px 12px', fontSize: 13, height: 36 }}
                      disabled={page === 1}
                      onClick={() => {
                        setPage((p) => Math.max(1, p - 1));
                        window.scrollTo({ top: 250, behavior: 'smooth' });
                      }}
                    >
                      « Trước
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((pNum) => {
                        if (totalPages <= 6) return true;
                        return pNum === 1 || pNum === totalPages || Math.abs(pNum - page) <= 1;
                      })
                      .map((pageNum, idx, arr) => {
                        const prev = arr[idx - 1];
                        const hasGap = prev && pageNum - prev > 1;
                        return (
                          <span key={pageNum} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            {hasGap && <span style={{ padding: '0 4px', color: 'var(--muted)', fontSize: 12 }}>...</span>}
                            <button
                              type="button"
                              className={`btn btn-sm ${page === pageNum ? 'btn-primary' : 'btn-outline'}`}
                              style={{
                                minWidth: 36,
                                height: 36,
                                padding: '0 6px',
                                borderRadius: 8,
                                fontSize: 13.5,
                                fontWeight: page === pageNum ? 'bold' : 'normal',
                                boxShadow: page === pageNum ? '0 3px 8px rgba(232, 172, 31, 0.35)' : 'none',
                              }}
                              onClick={() => {
                                setPage(pageNum);
                                window.scrollTo({ top: 250, behavior: 'smooth' });
                              }}
                            >
                              {pageNum}
                            </button>
                          </span>
                        );
                      })}

                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      style={{ padding: '6px 12px', fontSize: 13, height: 36 }}
                      disabled={page === totalPages}
                      onClick={() => {
                        setPage((p) => Math.min(totalPages, p + 1));
                        window.scrollTo({ top: 250, behavior: 'smooth' });
                      }}
                    >
                      Sau »
                    </button>
                  </div>

                  <span className="small" style={{ opacity: 0.85, color: 'var(--muted)', fontSize: 12 }}>
                    Hiển thị <b>{startIndex + 1}</b> - <b>{Math.min(startIndex + ITEMS_PER_PAGE, machines.length)}</b> trong <b>{machines.length}</b> máy nông nghiệp
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Component render 1 dòng máy nông nghiệp tối ưu chống vỡ layout trên mọi thiết bị
function MachineRow({ machine: m, compact = false }) {
  const cat = m.category_id || {};
  const fallbackImg = CATEGORY_PLACEHOLDERS[cat.slug] || 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop&q=80';
  const isUnsplashDefault = m.image_url && m.image_url.includes('unsplash.com');
  const imgSrc = (!m.image_url || isUnsplashDefault) ? fallbackImg : resolveImageUrl(m.image_url);

  return (
    <Link to={`/machine/${m._id}`} className={`result-row ${compact ? 'compact' : ''} reveal`}>
      <div className="result-row-body-mobile">
        <div className="thumb">
          <img
            src={imgSrc}
            alt={m.name}
            loading="lazy"
            onError={(e) => { e.target.onerror = null; e.target.src = fallbackImg; }}
          />
          {m.owner_id?.is_premium && (
            <span style={{
              position: 'absolute',
              top: 5,
              left: 5,
              background: 'linear-gradient(135deg, #B9840C, #E8AC1F)',
              color: '#153A2E',
              padding: '2px 6px',
              borderRadius: '999px',
              fontSize: 9.5,
              fontWeight: '800',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
              zIndex: 2,
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 2,
            }}>
              ⭐ Đối tác
            </span>
          )}
        </div>
        <div className="mid">
          <div className="cat">
            <span className="cat-icon">{categoryIcon(cat.slug)}</span>
            <span>{cat.name || 'Máy nông nghiệp'}</span>
          </div>
          <h3 title={m.name}>{m.name}</h3>
          <div className="loc">
            <span className="loc-icon">📍</span>
            <span className="loc-text">{m.district}{m.address_detail ? ` · ${m.address_detail}` : ''}</span>
          </div>
          {!compact && (
            <div className="desc">
              {(m.description || 'Phương tiện nông nghiệp sẵn sàng phục vụ bà con mùa vụ an toàn, chu đáo.').slice(0, 100)}...
              <span className="desc-more-hint">Xem chi tiết →</span>
            </div>
          )}
          <div className="tag-row">
            {m.brand && <span className="tag">{m.brand}</span>}
            {m.year_made && <span className="tag">Đời {m.year_made}</span>}
          </div>
        </div>
      </div>
      <div className="right">
        <div className="rating">
          {m.rating_count > 0
            ? <><span className="star" style={{ color: 'var(--gold-dark)' }}>★</span> {Number(m.rating_avg).toFixed(1)} <span style={{ opacity: 0.7, fontWeight: 'normal', fontSize: 11.5 }}>({m.rating_count})</span></>
            : <span className="small" style={{ color: 'var(--ink-soft)' }}>Chưa đánh giá</span>}
        </div>
        <div className="price-wrap">
          <div className="price">{formatVND(m.price_per_day)} <small>/ {m.price_unit}</small></div>
        </div>
        <span className="btn btn-primary btn-sm cta-btn">Xem & đặt</span>
      </div>
    </Link>
  );
}
