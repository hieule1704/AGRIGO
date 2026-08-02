import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { StatusPill } from '../components/ProtectedRoute';
import { formatVND, formatDate } from '../components/MachineCard';
import LocationPickerMap from '../components/LocationPickerMap';

export default function OwnerDashboard() {
  const { user, setUser } = useAuth();
  const [tab, setTab] = useState('machines');
  const [machines, setMachines] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [aiGenLoading, setAiGenLoading] = useState(false);

  async function generateAiDescription() {
    if (!form.name) {
      alert('Vui lòng nhập "Tên máy" trước khi tạo mô tả tự động bằng AI.');
      return;
    }
    setAiGenLoading(true);
    try {
      const catObj = categories.find((c) => c._id === form.category_id);
      const res = await api.post('/ai/generate-description', {
        name: form.name,
        brand: form.brand,
        year_made: form.year_made,
        district: form.district,
        category_name: catObj?.name || '',
      });
      if (res.description) {
        setForm((prev) => ({ ...prev, description: res.description }));
      }
    } catch (e) {
      alert('Lỗi tạo mô tả AI: ' + e.message);
    } finally {
      setAiGenLoading(false);
    }
  }

  const DISTRICT_COORDS = {
    'Long Xuyên': { lat: 10.3833, lng: 105.4167 },
    'Châu Đốc': { lat: 10.7000, lng: 105.1167 },
    'Châu Phú': { lat: 10.5500, lng: 105.1333 },
    'Chợ Mới': { lat: 10.4500, lng: 105.5333 },
    'Thoại Sơn': { lat: 10.2833, lng: 105.2333 },
    'Tri Tôn': { lat: 10.4167, lng: 105.0000 },
    'Phú Tân': { lat: 10.6333, lng: 105.3500 },
    'Tân Châu': { lat: 10.8000, lng: 105.2333 },
    'Tịnh Biên': { lat: 10.6000, lng: 104.9500 },
    'Châu Thành': { lat: 10.4333, lng: 105.3167 },
  };

  const [form, setForm] = useState({
    category_id: '', name: '', description: '', brand: '', year_made: '',
    price_per_day: '', price_unit: 'ngày', district: '', address_detail: '', image_url: '',
    lat: '', lng: '',
  });

  function handleDistrictChange(dist) {
    const coords = DISTRICT_COORDS[dist];
    setForm((prev) => ({
      ...prev,
      district: dist,
      lat: coords ? coords.lat : prev.lat,
      lng: coords ? coords.lng : prev.lng,
    }));
  }

  function getCurrentGpsLocation() {
    if (!navigator.geolocation) {
      alert('Trình duyệt của bạn không hỗ trợ định vị GPS.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }));
      },
      (err) => {
        alert('Không thể lấy vị trí GPS: ' + err.message);
      }
    );
  }

  function loadMachines() { api.get('/machines/mine').then((d) => setMachines(d.machines)); }
  function loadBookings() { api.get('/bookings/owner').then((d) => setBookings(d.bookings)); }

  useEffect(() => {
    api.get('/categories').then((d) => setCategories(d.categories));
    loadMachines();
    loadBookings();
  }, []);

  const [imageMode, setImageMode] = useState('file'); // 'file' | 'url'
  const [uploadingImage, setUploadingImage] = useState(false);

  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    setErr('');
    try {
      const res = await api.upload(file);
      setForm((prev) => ({ ...prev, image_url: res.url }));
      setOk('Tải ảnh thành công!');
    } catch (error) {
      setErr('Lỗi tải ảnh: ' + error.message);
    } finally {
      setUploadingImage(false);
    }
  }

  async function submitMachine(e) {
    e.preventDefault();
    setErr(''); setOk('');
    try {
      await api.post('/machines', form);
      setOk('Đã đăng máy thành công! Máy đang chờ quản trị viên duyệt.');
      setForm({ category_id: '', name: '', description: '', brand: '', year_made: '', price_per_day: '', price_unit: 'ngày', district: '', address_detail: '', image_url: '', lat: '', lng: '' });
      loadMachines();
    } catch (e) { setErr(e.message); }
  }

  async function setBookingStatus(id, status) {
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      loadBookings();
      loadMachines();
    } catch (e) { alert(e.message); }
  }

  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [myAds, setMyAds] = useState([]);
  const [adForm, setAdForm] = useState({ title: '', description: '', banner_url: '', machine_id: '', target_district: '' });
  const [adSubmitting, setAdSubmitting] = useState(false);

  const [upgradingVip, setUpgradingVip] = useState(false);

  useEffect(() => {
    if (tab === 'analytics') loadAnalytics();
    if (tab === 'ads') loadAds();
  }, [tab]);

  async function handleUpgradeVip() {
    setErr(''); setOk(''); setUpgradingVip(true);
    try {
      const res = await api.post('/owner/subscribe-premium');
      if (res.user) {
        setUser(res.user);
      }
      setOk(res.message || 'Đã kích hoạt thành công Gói VIP Partner!');
      alert('🎉 ' + (res.message || 'Chúc mừng! Bạn đã nâng cấp thành công Gói VIP Partner 30 ngày!'));
    } catch (e) {
      setErr(e.message || 'Không thể nâng cấp VIP.');
      alert('❌ Lỗi nâng cấp VIP: ' + e.message);
    } finally {
      setUpgradingVip(false);
    }
  }

  async function loadAnalytics() {
    setAnalyticsLoading(true);
    try {
      const res = await api.get('/owner/analytics');
      setAnalyticsData(res.analytics);
    } catch (e) {
      setErr(e.message);
    } finally {
      setAnalyticsLoading(false);
    }
  }

  async function loadAds() {
    try {
      const res = await api.get('/owner/advertisements');
      setMyAds(res.advertisements || []);
    } catch (e) {
      // ignore
    }
  }

  async function handleCreateAd(e) {
    e.preventDefault();
    setAdSubmitting(true);
    setErr(''); setOk('');
    try {
      await api.post('/owner/advertisements', adForm);
      setOk('Tạo bài quảng cáo thành công! Banner đã được hiển thị trên hệ thống.');
      setAdForm({ title: '', description: '', banner_url: '', machine_id: '', target_district: '' });
      loadAds();
    } catch (e) {
      setErr(e.message);
    } finally {
      setAdSubmitting(false);
    }
  }

  async function handleDeleteAd(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa bài quảng cáo này?')) return;
    try {
      await api.del(`/owner/advertisements/${id}`);
      loadAds();
    } catch (e) {
      alert(e.message);
    }
  }

  const stats = {
    total: machines.length,
    approved: machines.filter((m) => m.status === 'approved').length,
    pendingBookings: bookings.filter((b) => b.status === 'pending').length,
    revenue: bookings.filter((b) => b.status === 'completed').reduce((s, b) => s + b.total_price, 0),
  };

  return (
    <div className="dash-shell">
      <aside className="dash-side">
        <div className="who">
          Xin chào,<br />
          <b style={{ color: '#fff' }}>{user?.full_name}</b>
          {user?.is_premium && (
            <div style={{ marginTop: 6, display: 'inline-block', background: 'var(--gold)', color: 'var(--green-deep)', padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: '800' }}>
              👑 Đối tác VIP Partner
            </div>
          )}
        </div>
        <a href="#" className={tab === 'machines' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setTab('machines'); }}>🚜 Máy của tôi</a>
        <a href="#" className={tab === 'add' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setTab('add'); }}>➕ Đăng máy mới</a>
        <a href="#" className={tab === 'bookings' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setTab('bookings'); }}>📅 Đơn đặt lịch</a>
        <a href="#" className={tab === 'analytics' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setTab('analytics'); }}>📊 Phân tích thị trường {user?.is_premium ? '👑' : '🔒'}</a>
        <a href="#" className={tab === 'ads' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setTab('ads'); }}>📢 Quảng cáo dàn xe {user?.is_premium ? '👑' : '🔒'}</a>
      </aside>

      <main className="dash-main">
        {/* Banner Khách Hàng Premium VIP */}
        <div className="card-box" style={{ background: user?.is_premium ? 'linear-gradient(135deg, #153A2E 0%, #1F5C45 100%)' : 'linear-gradient(135deg, #FFFDF5 0%, #FFF8E7 100%)', border: '2px solid var(--gold)', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h3 style={{ margin: '0 0 6px', color: user?.is_premium ? 'var(--gold)' : 'var(--green-deep)', display: 'flex', alignItems: 'center', gap: 8 }}>
                {user?.is_premium ? '👑 Bạn Đang Sử Dụng Gói Chủ Máy VIP Premium' : '⭐ Nâng Cấp Gói Chủ Máy VIP Premium'}
              </h3>
              <p style={{ margin: 0, fontSize: 13.5, color: user?.is_premium ? '#fff' : 'var(--ink-soft)', maxWidth: 640 }}>
                {user?.is_premium
                  ? 'Thiết bị của bạn đang được ưu tiên hiển thị cao nhất trên Tìm kiếm & Bản đồ. Bạn có toàn quyền sử dụng Công cụ Phân tích thị trường & Đăng bài quảng cáo Banner.'
                  : 'Ưu tiên hiển thị dàn xe lên đầu kết quả tìm kiếm, có Badge "⭐ Đối tác đáng tin cậy", mở khóa Công cụ Phân tích thị trường & Đăng bài quảng cáo Banner thu hút khách.'}
              </p>
            </div>
            {!user?.is_premium && (
              <button type="button" className="btn btn-primary" onClick={handleUpgradeVip} disabled={upgradingVip} style={{ padding: '10px 20px', fontWeight: 'bold' }}>
                {upgradingVip ? '⏳ Đang kích hoạt...' : '🚀 Nâng cấp VIP Ngay (Demo 199.000đ)'}
              </button>
            )}
          </div>
        </div>

        <div className="stat-grid">
          <div className="stat-card"><div className="num">{stats.total}</div><div className="lbl">Máy đã đăng</div></div>
          <div className="stat-card"><div className="num">{stats.approved}</div><div className="lbl">Đã được duyệt</div></div>
          <div className="stat-card gold"><div className="num">{stats.pendingBookings}</div><div className="lbl">Đơn chờ xử lý</div></div>
          <div className="stat-card"><div className="num">{formatVND(stats.revenue)}</div><div className="lbl">Doanh thu đã hoàn tất</div></div>
        </div>

        {tab === 'machines' && (
          <div className="card-box">
            <h3>Danh sách máy</h3>
            <table className="data-table">
              <thead><tr><th>Hình ảnh</th><th>Tên máy</th><th>Loại</th><th>Khu vực</th><th>Giá/ngày</th><th>Trạng thái</th><th>Đánh giá</th></tr></thead>
              <tbody>
                {machines.map((m) => (
                  <tr key={m._id}>
                    <td>
                      {m.image_url ? (
                        <img src={m.image_url} alt={m.name} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6 }} />
                      ) : (
                        <span style={{ fontSize: 24 }}>🚜</span>
                      )}
                    </td>
                    <td><b>{m.name}</b></td>
                    <td>{m.category_id?.name}</td>
                    <td>{m.district}</td>
                    <td>{formatVND(m.price_per_day)}</td>
                    <td><StatusPill status={m.status} /></td>
                    <td>{m.rating_count > 0 ? `★ ${Number(m.rating_avg).toFixed(1)} (${m.rating_count})` : '—'}</td>
                  </tr>
                ))}
                {machines.length === 0 && <tr><td colSpan={7} className="small" style={{ padding: 20 }}>Bạn chưa đăng máy nào. Vào tab "Đăng máy mới" để bắt đầu.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'add' && (
          <div className="card-box">
            <h3>Đăng máy mới</h3>
            {err && <div className="alert alert-error">{err}</div>}
            {ok && <div className="alert alert-success">{ok}</div>}
            <form onSubmit={submitMachine}>
              <div className="form-grid">
                <div className="field"><label>Tên máy</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div className="field">
                  <label>Loại máy</label>
                  <select required value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                    <option value="">-- Chọn loại máy --</option>
                    {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="field"><label>Thương hiệu</label><input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} /></div>
                <div className="field"><label>Đời máy (năm)</label><input type="number" value={form.year_made} onChange={(e) => setForm({ ...form, year_made: e.target.value })} /></div>
                <div className="field"><label>Giá thuê / ngày (VNĐ)</label><input type="number" required value={form.price_per_day} onChange={(e) => setForm({ ...form, price_per_day: e.target.value })} /></div>
                <div className="field">
                  <label>Khu vực</label>
                  <select required value={form.district} onChange={(e) => handleDistrictChange(e.target.value)}>
                    <option value="">-- Chọn khu vực --</option>
                    {Object.keys(DISTRICT_COORDS).map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="field full">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <label style={{ margin: 0, fontWeight: 'bold' }}>📍 Vị trí đặt máy trên bản đồ (Nhấp vào bản đồ để ghim vị trí)</label>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      style={{ padding: '3px 10px', fontSize: 12, borderColor: 'var(--green-mid)', color: 'var(--green-deep)' }}
                      onClick={getCurrentGpsLocation}
                    >
                      📡 Lấy vị trí GPS của tôi
                    </button>
                  </div>

                  <LocationPickerMap
                    position={form.lat && form.lng ? [Number(form.lat), Number(form.lng)] : null}
                    center={form.lat && form.lng ? [Number(form.lat), Number(form.lng)] : [10.45, 105.25]}
                    onSelectLocation={(lat, lng) => setForm((prev) => ({ ...prev, lat, lng }))}
                    height="260px"
                  />

                  {form.lat && form.lng && (
                    <div className="small" style={{ marginTop: 6, color: 'var(--green-deep)', fontWeight: 'bold' }}>
                      📍 Tọa độ đã ghim: Vĩ độ (Lat): {Number(form.lat).toFixed(5)} · Kinh độ (Lng): {Number(form.lng).toFixed(5)}
                    </div>
                  )}
                </div>
                <div className="field full"><label>Địa chỉ chi tiết</label><input value={form.address_detail} onChange={(e) => setForm({ ...form, address_detail: e.target.value })} placeholder="VD: Ấp Vĩnh Phú, Xã Vĩnh Thạnh Trung" /></div>

                {/* Phần chọn và lưu ảnh Local hoặc URL */}
                <div className="field full">
                  <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Hình ảnh sản phẩm</span>
                    <span style={{ fontSize: 13, fontWeight: 'normal', color: 'var(--muted)' }}>
                      <button
                        type="button"
                        className={`btn btn-sm ${imageMode === 'file' ? 'btn-primary' : 'btn-outline'}`}
                        style={{ marginRight: 6, padding: '2px 8px' }}
                        onClick={() => setImageMode('file')}
                      >
                        📁 Tải file từ máy
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${imageMode === 'url' ? 'btn-primary' : 'btn-outline'}`}
                        style={{ padding: '2px 8px' }}
                        onClick={() => setImageMode('url')}
                      >
                        🔗 Dán đường dẫn URL
                      </button>
                    </span>
                  </label>

                  {imageMode === 'file' ? (
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 4 }}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        style={{ padding: 6 }}
                      />
                      {uploadingImage && <span className="small">Đang tải ảnh lên máy chủ local...</span>}
                    </div>
                  ) : (
                    <input
                      placeholder="Nhập đường dẫn URL (vd: https://... hoặc /uploads/...)"
                      value={form.image_url}
                      onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                      style={{ marginTop: 4 }}
                    />
                  )}

                  {/* Khung xem trước hình ảnh */}
                  {form.image_url && (
                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-light)', padding: 8, borderRadius: 8 }}>
                      <img
                        src={form.image_url}
                        alt="Xem trước"
                        style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--line)' }}
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/80?text=Lỗi+ảnh'; }}
                      />
                      <div>
                        <div className="small" style={{ wordBreak: 'break-all', marginBottom: 4 }}><b>Đường dẫn ảnh:</b> {form.image_url}</div>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => setForm({ ...form, image_url: '' })}>Xóa ảnh</button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="field full">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <label style={{ margin: 0 }}>Mô tả chi tiết</label>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      style={{ padding: '2px 10px', fontSize: 12, borderColor: 'var(--green-mid)', color: 'var(--green-deep)' }}
                      onClick={generateAiDescription}
                      disabled={aiGenLoading}
                    >
                      {aiGenLoading ? '⏳ Đang tạo mô tả...' : '✨ Viết mô tả giúp tôi (AI)'}
                    </button>
                  </div>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Nhập mô tả máy hoặc bấm nút AI ở trên để tự tạo..." />
                </div>
              </div>
              <button className="btn btn-primary" type="submit" style={{ marginTop: 8 }}>Đăng máy</button>
            </form>
          </div>
        )}

        {tab === 'bookings' && (
          <div className="card-box">
            <h3>Đơn đặt lịch</h3>
            <table className="data-table">
              <thead><tr><th>Nông dân</th><th>Máy</th><th>Ngày thuê</th><th>Tổng tiền</th><th>Trạng thái</th><th></th></tr></thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td>{b.farmer_id?.full_name}<br /><span className="small">{b.farmer_id?.phone}</span></td>
                    <td>{b.machine_id?.name}</td>
                    <td>{formatDate(b.start_date)} → {formatDate(b.end_date)} ({b.days} ngày)</td>
                    <td>{formatVND(b.total_price)}</td>
                    <td><StatusPill status={b.status} /></td>
                    <td>
                      {b.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-primary btn-sm" onClick={() => setBookingStatus(b._id, 'accepted')}>Nhận đơn</button>
                          <button className="btn btn-danger btn-sm" onClick={() => setBookingStatus(b._id, 'rejected')}>Từ chối</button>
                        </div>
                      )}
                      {b.status === 'accepted' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-outline btn-sm" onClick={() => setBookingStatus(b._id, 'completed')}>Đánh dấu hoàn tất</button>
                          <button className="btn btn-danger btn-sm" onClick={() => setBookingStatus(b._id, 'cancelled')}>Hủy đơn</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && <tr><td colSpan={6} className="small" style={{ padding: 20 }}>Chưa có đơn đặt lịch nào.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'analytics' && (
          <div className="card-box">
            <h3>📊 Phân Tích Thị Trường Cơ Giới Hóa (Dành cho Chủ máy VIP)</h3>
            {!user?.is_premium ? (
              <div className="alert alert-error" style={{ padding: 20 }}>
                <h4>🔒 Tính năng bị khóa</h4>
                <p>Công cụ phân tích thị trường chuyên sâu chỉ dành riêng cho tài khoản Chủ máy VIP Premium. Vui lòng bấm nút nâng cấp VIP ở trên để kích hoạt.</p>
                <button type="button" className="btn btn-primary btn-sm" onClick={handleUpgradeVip} style={{ marginTop: 10 }}>
                  🚀 Nâng cấp VIP Ngay (199.000đ/tháng)
                </button>
              </div>
            ) : analyticsLoading ? (
              <p className="small">⏳ Đang tải dữ liệu phân tích thị trường...</p>
            ) : analyticsData ? (
              <div>
                <div style={{ marginBottom: 24 }}>
                  <h4 style={{ color: 'var(--green-deep)', marginBottom: 10 }}>🔥 Nhu cầu Thuê máy theo Khu vực (11 Huyện An Giang)</h4>
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                        <tr><th>Khu vực / Huyện</th><th>Số đơn đặt lịch</th><th>Tổng giá trị thị trường</th><th>Mức độ hot</th></tr>
                      </thead>
                      <tbody>
                        {analyticsData.bookingsByDistrict.map((d, idx) => (
                          <tr key={d._id}>
                            <td><b>📍 {d._id}</b></td>
                            <td>{d.totalBookings} đơn</td>
                            <td>{formatVND(d.totalRevenue)}</td>
                            <td>
                              <span className={`badge ${idx === 0 ? 'badge-gold' : 'badge-green'}`}>
                                {idx === 0 ? '🔥 Rất cao' : idx < 3 ? '⚡ Cao' : '👍 Ổn định'}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {analyticsData.bookingsByDistrict.length === 0 && (
                          <tr><td colSpan={4} className="small">Chưa có đủ dữ liệu giao dịch khu vực.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h4 style={{ color: 'var(--green-deep)', marginBottom: 10 }}>💵 So sánh Giá Thuê Dàn Xe của Bạn với Giá Trung Bình Thị Trường</h4>
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                        <tr><th>Loại máy</th><th>Giá trung bình thị trường</th><th>Giá dàn máy của bạn</th><th>Đánh giá cạnh tranh</th></tr>
                      </thead>
                      <tbody>
                        {analyticsData.priceComparison.map((p) => {
                          const diff = p.myAvgPrice - p.marketAvgPrice;
                          return (
                            <tr key={p.category_slug}>
                              <td><b>{p.category_name}</b></td>
                              <td>{p.marketAvgPrice ? formatVND(p.marketAvgPrice) + '/ngày' : 'Chưa có mẫu'}</td>
                              <td>{p.myAvgPrice ? formatVND(p.myAvgPrice) + '/ngày' : 'Chưa có máy'}</td>
                              <td>
                                {!p.myAvgPrice ? (
                                  <span className="small muted">Chưa có máy loại này</span>
                                ) : diff < 0 ? (
                                  <span className="badge badge-green">👍 Rẻ hơn thị trường ({formatVND(Math.abs(diff))})</span>
                                ) : diff > 0 ? (
                                  <span className="badge badge-gold">👑 Phân khúc cao cấp (+{formatVND(diff)})</span>
                                ) : (
                                  <span className="badge">⚖️ Bằng giá trung bình</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {tab === 'ads' && (
          <div className="card-box">
            <h3>📢 Đăng & Quản Lý Bài Quảng Cáo Banner (Dành cho Chủ máy VIP)</h3>
            {!user?.is_premium ? (
              <div className="alert alert-error" style={{ padding: 20 }}>
                <h4>🔒 Tính năng bị khóa</h4>
                <p>Chỉ có Chủ máy VIP Premium mới có quyền tạo Banner quảng cáo hiển thị nổi bật ở vị trí VIP trên Trang chủ và Trang tìm kiếm.</p>
                <button type="button" className="btn btn-primary btn-sm" onClick={handleUpgradeVip} style={{ marginTop: 10 }}>
                  🚀 Nâng cấp VIP Ngay (199.000đ/tháng)
                </button>
              </div>
            ) : (
              <div>
                <form onSubmit={handleCreateAd} style={{ background: 'var(--green-soft)', padding: 18, borderRadius: 'var(--radius-md)', marginBottom: 24 }}>
                  <h4 style={{ margin: '0 0 12px', color: 'var(--green-deep)' }}>✨ Tạo Banner Quảng Cáo Mới</h4>
                  <div className="form-grid">
                    <div className="field full">
                      <label>Tiêu đề quảng cáo *</label>
                      <input required value={adForm.title} onChange={(e) => setAdForm({ ...adForm, title: e.target.value })} placeholder="VD: Nông Cơ Châu Phú - Giảm 10% giá thuê Máy Cày & Máy Gặt" />
                    </div>
                    <div className="field full">
                      <label>Mô tả ngắn</label>
                      <input value={adForm.description} onChange={(e) => setAdForm({ ...adForm, description: e.target.value })} placeholder="VD: Dàn xe cơ giới đời mới Kubota & Yanmar sẵn sàng phục vụ..." />
                    </div>
                    <div className="field full">
                      <label>Đường dẫn hình ảnh Banner (URL Image) *</label>
                      <input required value={adForm.banner_url} onChange={(e) => setAdForm({ ...adForm, banner_url: e.target.value })} placeholder="VD: https://images.unsplash.com/... hoặc /uploads/..." />
                    </div>
                    <div className="field">
                      <label>Gắn với máy nông nghiệp (Tùy chọn)</label>
                      <select value={adForm.machine_id} onChange={(e) => setAdForm({ ...adForm, machine_id: e.target.value })}>
                        <option value="">-- Chọn máy cần quảng cáo --</option>
                        {machines.map((m) => (
                          <option key={m._id} value={m._id}>{m.name} ({m.district})</option>
                        ))}
                      </select>
                    </div>
                    <div className="field">
                      <label>Huyện mục tiêu (Tùy chọn)</label>
                      <select value={adForm.target_district} onChange={(e) => setAdForm({ ...adForm, target_district: e.target.value })}>
                        <option value="">-- Tất cả các huyện --</option>
                        {['Long Xuyên', 'Châu Đốc', 'Châu Phú', 'Châu Thành', 'Chợ Mới', 'Phú Tân', 'Tân Châu', 'Thoại Sơn', 'Tri Tôn', 'Tịnh Biên'].map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ marginTop: 14 }} disabled={adSubmitting}>
                    {adSubmitting ? 'Đang tạo quảng cáo...' : '📢 Đăng Banner Quảng Cáo'}
                  </button>
                </form>

                <h4>📋 Danh sách Banner Quảng Cáo của Bạn</h4>
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr><th>Hình ảnh Banner</th><th>Tiêu đề</th><th>Huyện mục tiêu</th><th>Lượt click</th><th>Trạng thái</th><th>Thao tác</th></tr>
                    </thead>
                    <tbody>
                      {myAds.map((ad) => (
                        <tr key={ad._id}>
                          <td>
                            <img src={ad.banner_url} alt={ad.title} style={{ width: 80, height: 44, objectFit: 'cover', borderRadius: 6 }} />
                          </td>
                          <td><b>{ad.title}</b></td>
                          <td>{ad.target_district || 'Tất cả'}</td>
                          <td><b>{ad.clicks}</b> lượt click</td>
                          <td><span className="badge badge-green">Hoạt động</span></td>
                          <td>
                            <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDeleteAd(ad._id)}>Xóa</button>
                          </td>
                        </tr>
                      ))}
                      {myAds.length === 0 && (
                        <tr><td colSpan={6} className="small" style={{ padding: 16 }}>Bạn chưa đăng bài quảng cáo nào.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
