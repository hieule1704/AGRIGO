import { useEffect, useState } from 'react';
import { api } from '../api';
import { StatusPill } from '../components/ProtectedRoute';
import { formatVND, formatDate } from '../components/MachineCard';

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [machines, setMachines] = useState([]);
  const [machineFilter, setMachineFilter] = useState('pending');
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);

  function loadStats() { api.get('/admin/stats').then(setStats); }
  function loadMachines(status) { api.get(`/admin/machines${status ? `?status=${status}` : ''}`).then((d) => setMachines(d.machines)); }
  function loadUsers() { api.get('/admin/users').then((d) => setUsers(d.users)); }
  function loadBookings() { api.get('/admin/bookings').then((d) => setBookings(d.bookings)); }

  useEffect(() => { loadStats(); }, []);
  useEffect(() => { if (tab === 'machines') loadMachines(machineFilter); }, [tab, machineFilter]);
  useEffect(() => { if (tab === 'users') loadUsers(); }, [tab]);
  useEffect(() => { if (tab === 'bookings') loadBookings(); }, [tab]);

  async function setMachineStatus(id, status) {
    await api.patch(`/admin/machines/${id}/status`, { status });
    loadMachines(machineFilter);
    loadStats();
  }
  async function toggleUserStatus(u) {
    const status = u.status === 'active' ? 'locked' : 'active';
    await api.patch(`/admin/users/${u._id}/status`, { status });
    loadUsers();
  }

  const [aiModResult, setAiModResult] = useState(null);
  const [modLoadingId, setModLoadingId] = useState(null);

  async function checkAiModerate(machine) {
    setModLoadingId(machine._id);
    try {
      const res = await api.post('/ai/moderate-content', { name: machine.name, description: machine.description });
      setAiModResult({ machineName: machine.name, ...res.result });
    } catch (e) {
      alert('Lỗi kiểm duyệt AI: ' + e.message);
    } finally {
      setModLoadingId(null);
    }
  }

  return (
    <div className="dash-shell">
      <aside className="dash-side">
        <div className="who">Trang quản trị<br /><b style={{ color: '#fff' }}>AGRIGO Admin</b></div>
        <a href="#" className={tab === 'overview' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setTab('overview'); }}>📊 Tổng quan</a>
        <a href="#" className={tab === 'machines' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setTab('machines'); }}>🚜 Duyệt máy</a>
        <a href="#" className={tab === 'users' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setTab('users'); }}>👤 Người dùng</a>
        <a href="#" className={tab === 'bookings' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setTab('bookings'); }}>📅 Đơn đặt lịch</a>
      </aside>

      <main className="dash-main">
        {tab === 'overview' && stats && (
          <>
            <div className="stat-grid">
              <div className="stat-card"><div className="num">{stats.userCount}</div><div className="lbl">Tổng người dùng ({stats.farmerCount} nông dân · {stats.ownerCount} chủ máy)</div></div>
              <div className="stat-card"><div className="num">{stats.machineCount}</div><div className="lbl">Máy đã đăng</div></div>
              <div className="stat-card gold"><div className="num">{stats.pendingMachines}</div><div className="lbl">Máy chờ duyệt</div></div>
              <div className="stat-card"><div className="num">{stats.bookingCount}</div><div className="lbl">Tổng đơn đặt lịch</div></div>
              <div className="stat-card"><div className="num">{formatVND(stats.revenue)}</div><div className="lbl">Tổng giá trị GD hoàn tất</div></div>
              <div className="stat-card gold"><div className="num">{formatVND(stats.commission)}</div><div className="lbl">Hoa hồng nền tảng (5%)</div></div>
            </div>
            {stats.pendingMachines > 0 && (
              <div className="alert alert-error" style={{ background: '#FCEFD1', color: '#8A5D00', borderColor: '#f2ddb0' }}>
                Có {stats.pendingMachines} máy đang chờ duyệt. Vào tab "Duyệt máy" để xử lý.
              </div>
            )}
          </>
        )}

        {tab === 'machines' && (
          <div className="card-box">
            <div className="flex-between" style={{ marginBottom: 14 }}>
              <h3 style={{ margin: 0 }}>Danh sách máy</h3>
              <select value={machineFilter} onChange={(e) => setMachineFilter(e.target.value)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--line)' }}>
                <option value="pending">Chờ duyệt</option>
                <option value="approved">Đã duyệt</option>
                <option value="rejected">Từ chối</option>
                <option value="">Tất cả</option>
              </select>
            </div>
            <table className="data-table">
              <thead><tr><th>Hình ảnh</th><th>Tên máy</th><th>Chủ máy</th><th>Khu vực</th><th>Giá/ngày</th><th>Trạng thái</th><th></th></tr></thead>
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
                    <td><b>{m.name}</b><br /><span className="small">{m.category_id?.name}</span></td>
                    <td>{m.owner_id?.full_name}<br /><span className="small">{m.owner_id?.phone}</span></td>
                    <td>{m.district}</td>
                    <td>{formatVND(m.price_per_day)}</td>
                    <td><StatusPill status={m.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {m.status !== 'approved' && <button className="btn btn-primary btn-sm" onClick={() => setMachineStatus(m._id, 'approved')}>Duyệt</button>}
                        {m.status !== 'rejected' && <button className="btn btn-danger btn-sm" onClick={() => setMachineStatus(m._id, 'rejected')}>Từ chối</button>}
                        {m.status === 'approved' && <button className="btn btn-outline btn-sm" onClick={() => setMachineStatus(m._id, 'hidden')}>Ẩn</button>}
                        <button className="btn btn-outline btn-sm" style={{ borderColor: 'var(--teal)', color: 'var(--teal)' }} onClick={() => checkAiModerate(m)} disabled={modLoadingId === m._id}>
                          {modLoadingId === m._id ? '...' : '🛡️ AI Check'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {machines.length === 0 && <tr><td colSpan={7} className="small" style={{ padding: 20 }}>Không có máy nào.</td></tr>}
              </tbody>
            </table>

            {aiModResult && (
              <div style={{ marginTop: 20, padding: 16, background: 'var(--bg-light)', borderRadius: 12, border: '1px solid var(--green-mid)' }}>
                <div className="flex-between" style={{ marginBottom: 8 }}>
                  <b style={{ color: 'var(--green-deep)', fontSize: 16 }}>🛡️ Kết quả AI Kiểm duyệt: {aiModResult.machineName}</b>
                  <button className="btn btn-ghost btn-sm" onClick={() => setAiModResult(null)}>✖ Đóng</button>
                </div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 'bold', color: aiModResult.safe ? 'green' : 'var(--danger)' }}>
                    Trạng thái: {aiModResult.safe ? '✅ An toàn (Cho phép đăng)' : '⚠️ Cảnh báo nghi vấn'}
                  </span>
                  <span className="small">Điểm an toàn: <b>{aiModResult.score}/100</b></span>
                  {aiModResult.is_fallback && <span className="small" style={{ opacity: 0.7 }}>(Chế độ dự phòng offline)</span>}
                </div>
                <p className="small" style={{ margin: 0 }}><b>Khuyên dùng cho Admin:</b> {aiModResult.note}</p>
              </div>
            )}
          </div>
        )}

        {tab === 'users' && (
          <div className="card-box">
            <h3>Người dùng</h3>
            <table className="data-table">
              <thead><tr><th>Họ tên</th><th>Email</th><th>Vai trò</th><th>Khu vực</th><th>Trạng thái</th><th></th></tr></thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>{u.full_name}</td>
                    <td>{u.email}</td>
                    <td>{{ farmer: 'Nông dân', owner: 'Chủ máy', admin: 'Quản trị' }[u.role]}</td>
                    <td>{u.district || '—'}</td>
                    <td><StatusPill status={u.status} /></td>
                    <td>
                      {u.role !== 'admin' && (
                        <button className={u.status === 'active' ? 'btn btn-danger btn-sm' : 'btn btn-outline btn-sm'} onClick={() => toggleUserStatus(u)}>
                          {u.status === 'active' ? 'Khóa' : 'Mở khóa'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'bookings' && (
          <div className="card-box">
            <h3>Tất cả đơn đặt lịch</h3>
            <table className="data-table">
              <thead><tr><th>Máy</th><th>Nông dân</th><th>Chủ máy</th><th>Ngày thuê</th><th>Tổng tiền</th><th>Hoa hồng</th><th>Trạng thái</th></tr></thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td>{b.machine_id?.name}</td>
                    <td>{b.farmer_id?.full_name}</td>
                    <td>{b.owner_id?.full_name}</td>
                    <td>{formatDate(b.start_date)} → {formatDate(b.end_date)}</td>
                    <td>{formatVND(b.total_price)}</td>
                    <td>{formatVND(b.commission_amount)}</td>
                    <td><StatusPill status={b.status} /></td>
                  </tr>
                ))}
                {bookings.length === 0 && <tr><td colSpan={7} className="small" style={{ padding: 20 }}>Chưa có đơn đặt lịch nào.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
