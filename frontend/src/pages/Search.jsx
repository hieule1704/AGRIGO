import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api, resolveImageUrl } from '../api';
import { categoryIcon, formatVND, CATEGORY_PLACEHOLDERS } from '../components/MachineCard';
import MachineMap from '../components/MachineMap';
import { useScrollReveal } from '../hooks/useScrollReveal';
import AdBannerSlider from '../components/AdBannerSlider';
import { getBatchRoadDistances, calculateHaversineKm } from '../services/routing';

export const DISTRICTS = ['Long Xuyên', 'Châu Đốc', 'Châu Phú', 'Châu Thành', 'Chợ Mới', 'Phú Tân', 'Tân Châu', 'Thoại Sơn', 'Tri Tôn', 'Tịnh Biên'];

export const DISTRICT_CENTERS = {
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

// Lấy tọa độ máy (nếu không có lat/lng riêng thì lấy tâm huyện)
export function getMachineCoords(m) {
  if (m.lat && m.lng) return [m.lat, m.lng];
  if (m.district && DISTRICT_CENTERS[m.district]) return DISTRICT_CENTERS[m.district];
  return null;
}

const ITEMS_PER_PAGE = 6;

export default function Search() {
  const [params, setParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'split' | 'map'
  const [page, setPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  // Vị trí thực tế của nông dân để ước lượng khoảng cách
  const [userLocation, setUserLocation] = useState(null); // { lat: number, lng: number, name: string }
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState('');

  // Lưu trữ khoảng cách đường bộ thực tế của từng máy
  const [roadDistances, setRoadDistances] = useState({});

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
    if (sort && sort !== 'nearest') q.set('sort', sort);
    api.get(`/machines?${q.toString()}`)
      .then((d) => setMachines(d.machines || []))
      .finally(() => setLoading(false));
  }, [district, category, date, sort]);

  // Tự động tính khoảng cách đường bộ thực tế qua OSRM khi có vị trí nông dân
  useEffect(() => {
    if (userLocation && machines.length > 0) {
      getBatchRoadDistances(userLocation, machines).then((dists) => {
        setRoadDistances(dists || {});
      });
    } else {
      setRoadDistances({});
    }
  }, [userLocation, machines]);

  function updateParam(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next);
  }

  // Định vị GPS lấy vị trí thực tế của nông dân
  function handleGetMyLocation() {
    if (!navigator.geolocation) {
      setLocError('Trình duyệt của bạn không hỗ trợ định vị GPS.');
      return;
    }
    setLocating(true);
    setLocError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          name: 'Vị trí GPS của bạn',
        });
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        if (err.code === 1) {
          setLocError('Bạn chưa cấp quyền truy cập vị trí. Bạn có thể chọn nhanh Huyện của mình ở danh sách bên dưới.');
        } else {
          setLocError('Không thể lấy tọa độ GPS lúc này. Vui lòng chọn vị trí thủ công.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  // Chọn thủ công huyện nông dân đang ở
  function handleManualLocation(distName) {
    if (!distName) {
      setUserLocation(null);
      if (sort === 'nearest') updateParam('sort', 'newest');
      return;
    }
    const coords = DISTRICT_CENTERS[distName];
    if (coords) {
      setUserLocation({
        lat: coords[0],
        lng: coords[1],
        name: `Huyện ${distName}`,
      });
      setLocError('');
    }
  }

  // Sắp xếp danh sách máy (Hỗ trợ sắp xếp theo khoảng cách đường bộ gần nhất)
  let sortedMachines = [...machines];
  if (sort === 'nearest' && userLocation) {
    sortedMachines.sort((a, b) => {
      const infoA = roadDistances[a._id];
      const infoB = roadDistances[b._id];
      const distA = infoA?.distanceKm ?? (a.lat && a.lng ? calculateHaversineKm(userLocation.lat, userLocation.lng, a.lat, a.lng) * 1.35 : 999999);
      const distB = infoB?.distanceKm ?? (b.lat && b.lng ? calculateHaversineKm(userLocation.lat, userLocation.lng, b.lat, b.lng) * 1.35 : 999999);
      return (distA || 999999) - (distB || 999999);
    });
  }

  const totalPages = Math.ceil(sortedMachines.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const paginatedMachines = sortedMachines.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useScrollReveal([paginatedMachines, viewMode, page, userLocation]);

  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiNote, setAiNote] = useState('');
  const [showAiDrawer, setShowAiDrawer] = useState(false);
  const [showLocDrawer, setShowLocDrawer] = useState(false);

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

      {/* Master Search Bar (Capsule Tinh Gọn Hiện Đại) */}
      <div className="search-master-wrapper">
        <form className="search-master-bar" onSubmit={(e) => e.preventDefault()}>
          <div className="search-col">
            <label className="search-col-label">📍 Khu vực máy</label>
            <select
              value={district}
              onChange={(e) => updateParam('district', e.target.value)}
              className="search-col-select"
            >
              <option value="">Tất cả khu vực (An Giang)</option>
              {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="search-divider" />

          <div className="search-col">
            <label className="search-col-label">🚜 Loại máy cơ giới</label>
            <select
              value={category}
              onChange={(e) => updateParam('category', e.target.value)}
              className="search-col-select"
            >
              <option value="">Tất cả loại máy</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>

          <div className="search-divider" />

          <div className="search-col">
            <label className="search-col-label">📅 Ngày cần dùng</label>
            <input
              type="date"
              value={date}
              onChange={(e) => updateParam('date', e.target.value)}
              className="search-col-input"
            />
          </div>

          <button className="btn btn-primary search-submit-btn" type="button">
            🔍 Tìm kiếm
          </button>
        </form>

        {/* Thanh Action Toolbar Pills (Mở rộng tính năng 1 chạm - Trợ lý AI, Đo đường bộ) */}
        <div className="search-action-pills">
          <button
            type="button"
            className={`action-pill ${showAiDrawer ? 'active' : ''}`}
            onClick={() => {
              setShowAiDrawer(!showAiDrawer);
              setShowLocDrawer(false);
            }}
          >
            ✨ Trợ lý AI Tìm máy {showAiDrawer ? '▲' : '▾'}
          </button>

          <button
            type="button"
            className={`action-pill ${userLocation || showLocDrawer ? 'active' : ''}`}
            onClick={() => {
              setShowLocDrawer(!showLocDrawer);
              setShowAiDrawer(false);
            }}
          >
            🛣️ {userLocation ? `Đang đo từ: ${userLocation.name}` : 'Đo đường bộ tới ruộng'} {showLocDrawer ? '▲' : '▾'}
          </button>

          {userLocation && (
            <span className="user-loc-badge">
              <span>🎯 {userLocation.name}</span>
              <button
                type="button"
                className="btn-loc-clear"
                onClick={() => {
                  setUserLocation(null);
                  if (sort === 'nearest') updateParam('sort', 'newest');
                }}
                title="Tắt đo đường bộ"
              >
                ✕
              </button>
            </span>
          )}

          {(district || category || date) && (
            <button
              type="button"
              className="action-pill-reset"
              onClick={() => {
                const next = new URLSearchParams();
                if (sort) next.set('sort', sort);
                setParams(next);
              }}
            >
              🔄 Xóa bộ lọc
            </button>
          )}
        </div>

        {/* Collapsible Drawer 1: Trợ lý AI Tìm kiếm Thông minh */}
        {showAiDrawer && (
          <div className="ai-drawer-expand reveal-fast">
            <form onSubmit={handleAiSearch} className="ai-drawer-form">
              <div className="ai-drawer-input-wrapper">
                <span className="ai-drawer-icon">🤖</span>
                <input
                  type="text"
                  placeholder="Mô tả bằng tiếng Việt: Cần thuê máy gặt ở Thoại Sơn gấp ngày mai, giá rẻ..."
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  className="ai-drawer-input"
                  autoFocus
                />
                <button type="submit" className="btn btn-primary btn-sm ai-drawer-submit" disabled={aiLoading}>
                  {aiLoading ? 'Đang phân tích...' : '✨ Tìm ngay'}
                </button>
              </div>

              <div className="ai-suggestion-chips">
                <span className="ai-suggestion-label">💡 Gợi ý nhanh:</span>
                {['🌾 Máy gặt đập Thoại Sơn', '🚁 Drone phun thuốc rầy nâu', '🚜 Máy cày xới đất Châu Phú', '🌱 Máy cấy mạ khay Chợ Mới'].map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    className="ai-chip-tag"
                    onClick={() => {
                      setAiQuery(sug.slice(2));
                    }}
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </form>
            {aiNote && (
              <div className="ai-drawer-note">
                💡 {aiNote}
              </div>
            )}
          </div>
        )}

        {/* Collapsible Drawer 2: Công cụ Đo Khoảng cách & Lộ trình Đường bộ Thực tế */}
        {showLocDrawer && (
          <div className="loc-drawer-expand reveal-fast">
            <div className="loc-drawer-content">
              <div className="loc-drawer-info">
                <span style={{ fontSize: 20 }}>📍</span>
                <div>
                  <b style={{ fontSize: 13, color: '#15803D' }}>Đo khoảng cách đường bộ thực tế qua mạng lưới giao thông:</b>
                  <div style={{ fontSize: 12, color: '#166534', marginTop: 2 }}>
                    Tự động tính quãng đường xe chạy qua cầu, quốc lộ và thời gian lái xe để đưa máy đến ruộng của bạn.
                  </div>
                </div>
              </div>

              <div className="loc-drawer-actions">
                <button
                  type="button"
                  className={`btn btn-sm ${userLocation ? 'btn-primary' : 'btn-outline'}`}
                  onClick={handleGetMyLocation}
                  disabled={locating}
                  style={{ height: 34, fontSize: 12.5, fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  {locating ? '📡 Đang dò GPS...' : userLocation ? '🔄 Cập nhật vị trí GPS' : '📍 Lấy vị trí GPS của bạn'}
                </button>

                <select
                  value={userLocation && userLocation.name.startsWith('Huyện ') ? userLocation.name.replace('Huyện ', '') : ''}
                  onChange={(e) => handleManualLocation(e.target.value)}
                  className="loc-drawer-select"
                >
                  <option value="">Hoặc chọn Huyện của bạn</option>
                  {DISTRICTS.map((d) => <option key={d} value={d}>Huyện {d}</option>)}
                </select>

                {userLocation && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      setUserLocation(null);
                      if (sort === 'nearest') updateParam('sort', 'newest');
                    }}
                    style={{ color: 'var(--danger)', height: 34, fontSize: 12 }}
                  >
                    ✖ Tắt đo
                  </button>
                )}
              </div>
            </div>
            {locError && (
              <div className="loc-drawer-error">
                ⚠️ {locError}
              </div>
            )}
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
          className={`sort-chip ${sort === 'nearest' ? 'active' : ''}`}
          onClick={() => {
            if (!userLocation) handleGetMyLocation();
            updateParam('sort', 'nearest');
          }}
          style={{ borderColor: userLocation ? 'var(--green-mid)' : 'var(--line)' }}
        >
          🛣️ Gần tôi nhất {userLocation ? '✓' : ''}
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
          Tìm thấy <b>{sortedMachines.length}</b> máy nông nghiệp · Trang <b>{page}</b>/<b>{totalPages}</b>
          {userLocation && <span style={{ marginLeft: 8, color: 'var(--green-mid)', fontWeight: 'bold' }}>(Đang tính đường bộ từ vị trí của bạn)</span>}
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
              style={{ display: 'block', padding: '6px 0', fontWeight: sort === 'nearest' ? 700 : 400, color: sort === 'nearest' ? 'var(--green-deep)' : 'var(--ink-soft)' }}
              onClick={(e) => {
                e.preventDefault();
                if (!userLocation) handleGetMyLocation();
                updateParam('sort', 'nearest');
              }}
            >
              🛣️ Gần tôi nhất {userLocation ? '✓' : ''}
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

          {/* Hộp thông tin định vị trong sidebar */}
          <div style={{ borderTop: '1px solid var(--line)', paddingTop: 14, marginTop: 10 }}>
            <h4 style={{ margin: '0 0 8px' }}>Vị trí của bạn</h4>
            {userLocation ? (
              <div style={{ fontSize: 12, background: '#E6F4EA', color: '#137333', padding: '8px 10px', borderRadius: 8, lineHeight: 1.4 }}>
                <b>✅ Đang kích hoạt:</b><br />
                {userLocation.name}
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-outline btn-sm btn-block"
                onClick={handleGetMyLocation}
                style={{ fontSize: 12, padding: '6px 10px', height: 'auto' }}
              >
                📍 Bật GPS đo đường bộ
              </button>
            )}
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
                  <MachineMap
                    machines={sortedMachines}
                    center={mapCenter}
                    zoom={district ? 12 : 10}
                    height={isMobile ? '450px' : '600px'}
                    userLocation={userLocation}
                  />
                </div>
              )}

              {/* CHẾ ĐỘ XEM 2: SONG SONG (Bản đồ + Danh sách trên Desktop) */}
              {viewMode === 'split' && !isMobile && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ position: 'sticky', top: 80, height: 'calc(100vh - 120px)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                    <MachineMap
                      machines={paginatedMachines}
                      center={mapCenter}
                      zoom={district ? 12 : 10}
                      height="100%"
                      userLocation={userLocation}
                    />
                  </div>
                  <div className="results-list" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 120px)', paddingRight: 4 }}>
                    {sortedMachines.length === 0 ? (
                      <div className="empty-state"><div className="ico">🔍</div>Không tìm thấy máy phù hợp.</div>
                    ) : (
                      paginatedMachines.map((m) => (
                        <MachineRow
                          key={m._id}
                          machine={m}
                          compact={true}
                          userLocation={userLocation}
                          roadDistanceInfo={roadDistances[m._id]}
                        />
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* CHẾ ĐỘ XEM 3: DANH SÁCH */}
              {(viewMode === 'list' || (viewMode === 'split' && isMobile)) && (
                <div className="results-list">
                  {sortedMachines.length === 0 ? (
                    <div className="empty-state" style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', padding: 40, textAlign: 'center' }}>
                      <div className="ico" style={{ fontSize: 36, marginBottom: 10 }}>🔍</div>
                      <h4 style={{ margin: '0 0 6px' }}>Không tìm thấy máy phù hợp</h4>
                      <p className="small" style={{ color: 'var(--ink-soft)', margin: '0 0 16px' }}>Hãy thử chọn khu vực khác hoặc tìm bằng Trợ lý AI.</p>
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => setParams(new URLSearchParams())}>Xóa tất cả bộ lọc</button>
                    </div>
                  ) : (
                    paginatedMachines.map((m) => (
                      <MachineRow
                        key={m._id}
                        machine={m}
                        userLocation={userLocation}
                        roadDistanceInfo={roadDistances[m._id]}
                      />
                    ))
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
                    Hiển thị <b>{startIndex + 1}</b> - <b>{Math.min(startIndex + ITEMS_PER_PAGE, sortedMachines.length)}</b> trong <b>{sortedMachines.length}</b> máy nông nghiệp
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

// Component render 1 dòng máy nông nghiệp tối ưu chống vỡ layout trên mọi thiết bị và tích hợp khoảng cách đường bộ
function MachineRow({ machine: m, compact = false, userLocation = null, roadDistanceInfo = null }) {
  const cat = m.category_id || {};
  const fallbackImg = CATEGORY_PLACEHOLDERS[cat.slug] || 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop&q=80';
  const isUnsplashDefault = m.image_url && m.image_url.includes('unsplash.com');
  const imgSrc = (!m.image_url || isUnsplashDefault) ? fallbackImg : resolveImageUrl(m.image_url);

  // Lấy thông tin khoảng cách đường bộ thực tế
  const info = roadDistanceInfo || (userLocation && m.lat && m.lng ? {
    distanceKm: Math.round(calculateHaversineKm(userLocation.lat, userLocation.lng, m.lat, m.lng) * 1.35 * 10) / 10,
    durationMin: Math.round(calculateHaversineKm(userLocation.lat, userLocation.lng, m.lat, m.lng) * 1.35 * 1.8),
    isRealRoad: false,
  } : null);

  const distanceKm = info?.distanceKm ?? null;
  const durationMin = info?.durationMin ?? null;

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
          
          <div className="loc" style={{ flexWrap: 'wrap', gap: 6 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span className="loc-icon">📍</span>
              <span className="loc-text">{m.district}{m.address_detail ? ` · ${m.address_detail}` : ''}</span>
            </span>

            {/* Badge Khoảng cách Đường bộ Thực tế */}
            {distanceKm !== null && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                background: distanceKm <= 12 ? '#E6F4EA' : distanceKm <= 35 ? '#FEF7E0' : '#F1F3F4',
                color: distanceKm <= 12 ? '#137333' : distanceKm <= 35 ? '#B06000' : '#3C4043',
                border: `1px solid ${distanceKm <= 12 ? '#CEEAD6' : distanceKm <= 35 ? '#FEEFC3' : '#DADCE0'}`,
                padding: '2px 8px',
                borderRadius: 999,
                fontSize: 11,
                fontWeight: '700',
                whiteSpace: 'nowrap',
              }}>
                🛣️ Đường bộ: ~{distanceKm} km
              </span>
            )}
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
            {durationMin !== null && (
              <span className="tag" style={{ background: '#E0F2FE', color: '#0369A1', fontWeight: 'bold' }}>
                🚗 ~{durationMin} phút di chuyển
              </span>
            )}
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


