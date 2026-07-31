import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { StatusPill } from '../components/ProtectedRoute';
import { formatVND, formatDate } from '../components/MachineCard';

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('machines');
  const [machines, setMachines] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [form, setForm] = useState({
    category_id: '', name: '', description: '', brand: '', year_made: '',
    price_per_day: '', price_unit: 'ngày', district: '', address_detail: '', image_url: '',
  });

  function loadMachines() { api.get('/machines/mine').then((d) => setMachines(d.machines)); }
  function loadBookings() { api.get('/bookings/owner').then((d) => setBookings(d.bookings)); }

  useEffect(() => {
    api.get('/categories').then((d) => setCategories(d.categories));
    loadMachines();
    loadBookings();
  }, []);

  async function submitMachine(e) {
    e.preventDefault();
    setErr(''); setOk('');
    try {
      await api.post('/machines', form);
      setOk('Đã đăng máy thành công! Máy đang chờ quản trị viên duyệt.');
      setForm({ category_id: '', name: '', description: '', brand: '', year_made: '', price_per_day: '', price_unit: 'ngày', district: '', address_detail: '', image_url: '' });
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

  const stats = {
    total: machines.length,
    approved: machines.filter((m) => m.status === 'approved').length,
    pendingBookings: bookings.filter((b) => b.status === 'pending').length,
    revenue: bookings.filter((b) => b.status === 'completed').reduce((s, b) => s + b.total_price, 0),
  };

  return (
    <div className="dash-shell">
      <aside className="dash-side">
        <div className="who">Xin chào,<br /><b style={{ color: '#fff' }}>{user?.full_name}</b></div>
        <a href="#" className={tab === 'machines' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setTab('machines'); }}>🚜 Máy của tôi</a>
        <a href="#" className={tab === 'add' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setTab('add'); }}>➕ Đăng máy mới</a>
        <a href="#" className={tab === 'bookings' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setTab('bookings'); }}>📅 Đơn đặt lịch</a>
      </aside>

      <main className="dash-main">
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
              <thead><tr><th>Tên máy</th><th>Loại</th><th>Khu vực</th><th>Giá/ngày</th><th>Trạng thái</th><th>Đánh giá</th></tr></thead>
              <tbody>
                {machines.map((m) => (
                  <tr key={m._id}>
                    <td>{m.name}</td>
                    <td>{m.category_id?.name}</td>
                    <td>{m.district}</td>
                    <td>{formatVND(m.price_per_day)}</td>
                    <td><StatusPill status={m.status} /></td>
                    <td>{m.rating_count > 0 ? `★ ${Number(m.rating_avg).toFixed(1)} (${m.rating_count})` : '—'}</td>
                  </tr>
                ))}
                {machines.length === 0 && <tr><td colSpan={6} className="small" style={{ padding: 20 }}>Bạn chưa đăng máy nào. Vào tab "Đăng máy mới" để bắt đầu.</td></tr>}
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
                <div className="field"><label>Khu vực</label><input required placeholder="VD: Thoại Sơn" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} /></div>
                <div className="field full"><label>Địa chỉ chi tiết</label><input value={form.address_detail} onChange={(e) => setForm({ ...form, address_detail: e.target.value })} /></div>
                <div className="field full"><label>Link hình ảnh (URL, tuỳ chọn)</label><input placeholder="https://..." value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} /></div>
                <div className="field full"><label>Mô tả</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
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
                        <button className="btn btn-outline btn-sm" onClick={() => setBookingStatus(b._id, 'completed')}>Đánh dấu hoàn tất</button>
                      )}
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && <tr><td colSpan={6} className="small" style={{ padding: 20 }}>Chưa có đơn đặt lịch nào.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
