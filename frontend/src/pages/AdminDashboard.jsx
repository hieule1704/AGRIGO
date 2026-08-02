import { useEffect, useState } from 'react';
import { api } from '../api';
import { StatusPill } from '../components/ProtectedRoute';
import { formatVND, formatDate } from '../components/MachineCard';

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [machines, setMachines] = useState([]);
  const [machineFilter, setMachineFilter] = useState('pending');
  const [machineSearch, setMachineSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  // States for Machine Editing Modal & AI Moderator
  const [editMachine, setEditMachine] = useState(null);
  const [aiModResult, setAiModResult] = useState(null);
  const [modLoadingId, setModLoadingId] = useState(null);

  function loadStats() {
    api.get('/admin/stats').then(setStats).catch(console.error);
  }

  function loadMachines(status) {
    setLoading(true);
    api.get(`/admin/machines${status ? `?status=${status}` : ''}`)
      .then((d) => setMachines(d.machines || []))
      .catch((e) => alert('Lỗi tải danh sách máy: ' + e.message))
      .finally(() => setLoading(false));
  }

  function loadUsers() {
    setLoading(true);
    api.get('/admin/users')
      .then((d) => setUsers(d.users || []))
      .catch((e) => alert('Lỗi tải danh sách người dùng: ' + e.message))
      .finally(() => setLoading(false));
  }

  function loadBookings() {
    setLoading(true);
    api.get('/admin/bookings')
      .then((d) => setBookings(d.bookings || []))
      .catch((e) => alert('Lỗi tải đơn hàng: ' + e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadStats(); }, []);
  useEffect(() => { if (tab === 'machines') loadMachines(machineFilter); }, [tab, machineFilter]);
  useEffect(() => { if (tab === 'users') loadUsers(); }, [tab]);
  useEffect(() => { if (tab === 'bookings') loadBookings(); }, [tab]);

  // AI Moderation function handler
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

  async function setMachineStatus(id, status) {
    try {
      await api.patch(`/admin/machines/${id}/status`, { status });
      loadMachines(machineFilter);
      loadStats();
    } catch (e) {
      alert('Lỗi đổi trạng thái máy: ' + e.message);
    }
  }

  async function handleUpdateMachine(e) {
    e.preventDefault();
    try {
      await api.put(`/admin/machines/${editMachine._id}`, editMachine);
      setEditMachine(null);
      loadMachines(machineFilter);
      alert('Đã cập nhật thông tin máy thành công!');
    } catch (e) {
      alert('Lỗi cập nhật máy: ' + e.message);
    }
  }

  async function handleDeleteMachine(id) {
    if (!confirm('Bạn có chắc chắn muốn XÓA máy này khỏi hệ thống? (Hành động này không thể hoàn tác)')) return;
    try {
      await api.del(`/admin/machines/${id}`);
      loadMachines(machineFilter);
      loadStats();
      alert('Đã xóa máy thành công!');
    } catch (e) {
      alert('Lỗi xóa máy: ' + e.message);
    }
  }

  async function toggleUserStatus(u) {
    const status = u.status === 'active' ? 'locked' : 'active';
    try {
      await api.patch(`/admin/users/${u._id}/status`, { status });
      loadUsers();
    } catch (e) {
      alert('Lỗi cập nhật trạng thái người dùng: ' + e.message);
    }
  }

  async function toggleUserVip(u) {
    try {
      const is_premium = !u.is_premium;
      await api.put(`/admin/users/${u._id}`, { is_premium });
      loadUsers();
      alert(`Đã ${is_premium ? 'GÁN' : 'HỦY'} quyền VIP Premium cho tài khoản ${u.full_name}!`);
    } catch (e) {
      alert('Lỗi cập nhật VIP: ' + e.message);
    }
  }

  async function handleDeleteUser(id) {
    if (!confirm('Bạn có chắc chắn muốn XÓA tài khoản người dùng này?')) return;
    try {
      await api.del(`/admin/users/${id}`);
      loadUsers();
      loadStats();
      alert('Đã xóa người dùng thành công!');
    } catch (e) {
      alert('Lỗi xóa người dùng: ' + e.message);
    }
  }

  async function handleBookingStatusChange(id, status) {
    try {
      await api.patch(`/admin/bookings/${id}/status`, { status });
      loadBookings();
    } catch (e) {
      alert('Lỗi cập nhật đơn hàng: ' + e.message);
    }
  }

  async function handleDeleteBooking(id) {
    if (!confirm('Bạn có chắc chắn muốn XÓA đơn hàng này?')) return;
    try {
      await api.del(`/admin/bookings/${id}`);
      loadBookings();
      loadStats();
      alert('Đã xóa đơn hàng!');
    } catch (e) {
      alert('Lỗi xóa đơn hàng: ' + e.message);
    }
  }

  // Client-side search filters
  const filteredMachines = machines.filter((m) => {
    if (!machineSearch.trim()) return true;
    const q = machineSearch.toLowerCase();
    return (
      (m.name && m.name.toLowerCase().includes(q)) ||
      (m.district && m.district.toLowerCase().includes(q)) ||
      (m.owner_id?.full_name && m.owner_id.full_name.toLowerCase().includes(q))
    );
  });

  const filteredUsers = users.filter((u) => {
    if (userRoleFilter && u.role !== userRoleFilter) return false;
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return (
      (u.full_name && u.full_name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.phone && u.phone.includes(q))
    );
  });

  return (
    <div className="dash-shell">
      <aside className="dash-side">
        <div className="who">Trang quản trị<br /><b style={{ color: '#fff' }}>AGRIGO Admin</b></div>
        <a href="#" className={tab === 'overview' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setTab('overview'); }}>📊 Tổng quan</a>
        <a href="#" className={tab === 'machines' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setTab('machines'); }}>🚜 Quản lý máy</a>
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
              <div className="alert alert-error" style={{ background: '#FCEFD1', color: '#8A5D00', borderColor: '#f2ddb0', cursor: 'pointer' }} onClick={() => setTab('machines')}>
                ⚠️ Có <b>{stats.pendingMachines}</b> máy đang chờ duyệt. Click vào đây để xử lý duyệt máy ngay!
              </div>
            )}
          </>
        )}

        {tab === 'machines' && (
          <div className="card-box">
            <div className="flex-between" style={{ marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <h3 style={{ margin: 0 }}>Quản lý & Chỉnh sửa Chuyên sâu Máy Nông Nghiệp</h3>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="🔎 Tìm theo tên máy / chủ máy / huyện..."
                  value={machineSearch}
                  onChange={(e) => setMachineSearch(e.target.value)}
                  style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--line)', fontSize: 13, width: 240 }}
                />
                <select value={machineFilter} onChange={(e) => setMachineFilter(e.target.value)} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--line)', fontSize: 13 }}>
                  <option value="pending">Chờ duyệt (pending)</option>
                  <option value="approved">Đã duyệt (approved)</option>
                  <option value="rejected">Từ chối (rejected)</option>
                  <option value="">Tất cả trạng thái</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: 30, textAlign: 'center' }}>Đang tải danh sách máy...</div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead><tr><th>Hình ảnh</th><th>Tên máy & Loại</th><th>Chủ máy</th><th>Khu vực</th><th>Giá/ngày</th><th>Trạng thái</th><th>Thao tác Admin</th></tr></thead>
                  <tbody>
                    {filteredMachines.map((m) => (
                      <tr key={m._id}>
                        <td>
                          {m.image_url ? (
                            <img src={m.image_url} alt={m.name} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6 }} onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/44?text=🚜'; }} />
                          ) : (
                            <span style={{ fontSize: 24 }}>🚜</span>
                          )}
                        </td>
                        <td>
                          <b>{m.name}</b><br />
                          <span className="small">{m.category_id?.name || 'Nông nghiệp'}</span>
                        </td>
                        <td>
                          {m.owner_id?.full_name || 'Ẩn danh'}<br />
                          <span className="small">📞 {m.owner_id?.phone || 'Chưa có'}</span>
                        </td>
                        <td>{m.district || 'Chưa xác định'}</td>
                        <td>{formatVND(m.price_per_day)}</td>
                        <td><StatusPill status={m.status} /></td>
                        <td>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            <button className="btn btn-outline btn-sm" onClick={() => setEditMachine(m)}>✏️ Sửa máy</button>
                            {m.status !== 'approved' && <button className="btn btn-primary btn-sm" onClick={() => setMachineStatus(m._id, 'approved')}>Duyệt</button>}
                            {m.status !== 'rejected' && <button className="btn btn-danger btn-sm" onClick={() => setMachineStatus(m._id, 'rejected')}>Từ chối</button>}
                            <button className="btn btn-outline btn-sm" style={{ borderColor: 'var(--teal)', color: 'var(--teal)' }} onClick={() => checkAiModerate(m)} disabled={modLoadingId === m._id}>
                              {modLoadingId === m._id ? '...' : '🛡️ AI Check'}
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteMachine(m._id)}>🗑️ Xóa</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredMachines.length === 0 && <tr><td colSpan={7} className="small" style={{ padding: 20, textAlign: 'center' }}>Không tìm thấy máy nào phù hợp.</td></tr>}
                  </tbody>
                </table>
              </div>
            )}

            {/* Modal chỉnh sửa máy chuyên sâu cho Admin */}
            {editMachine && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                <div style={{ background: '#fff', padding: 24, borderRadius: 16, maxWidth: 600, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
                  <div className="flex-between" style={{ marginBottom: 16 }}>
                    <h3 style={{ margin: 0 }}>🛠️ Chỉnh Sửa Máy (Admin Full Control)</h3>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditMachine(null)}>✖ Đóng</button>
                  </div>
                  <form onSubmit={handleUpdateMachine}>
                    <div className="form-grid">
                      <div className="field full">
                        <label>Tên máy (Sửa tên chuẩn, xóa ký tự thừa)</label>
                        <input required value={editMachine.name} onChange={(e) => setEditMachine({ ...editMachine, name: e.target.value })} />
                      </div>
                      <div className="field">
                        <label>Giá thuê / ngày (VNĐ)</label>
                        <input type="number" required value={editMachine.price_per_day} onChange={(e) => setEditMachine({ ...editMachine, price_per_day: Number(e.target.value) })} />
                      </div>
                      <div className="field">
                        <label>Khu vực (Huyện)</label>
                        <input required value={editMachine.district} onChange={(e) => setEditMachine({ ...editMachine, district: e.target.value })} />
                      </div>
                      <div className="field">
                        <label>Thương hiệu</label>
                        <input value={editMachine.brand || ''} onChange={(e) => setEditMachine({ ...editMachine, brand: e.target.value })} />
                      </div>
                      <div className="field">
                        <label>Trạng thái duyệt</label>
                        <select value={editMachine.status} onChange={(e) => setEditMachine({ ...editMachine, status: e.target.value })}>
                          <option value="pending">Chờ duyệt (pending)</option>
                          <option value="approved">Đã duyệt (approved)</option>
                          <option value="rejected">Từ chối (rejected)</option>
                          <option value="hidden">Ẩn (hidden)</option>
                        </select>
                      </div>
                      <div className="field full">
                        <label>Mô tả chi tiết</label>
                        <textarea value={editMachine.description || ''} onChange={(e) => setEditMachine({ ...editMachine, description: e.target.value })} rows={4} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                      <button type="submit" className="btn btn-primary btn-block">Lưu thay đổi máy</button>
                      <button type="button" className="btn btn-outline" onClick={() => setEditMachine(null)}>Hủy</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* AI Moderate Result Display */}
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
            <div className="flex-between" style={{ marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <h3 style={{ margin: 0 }}>Quản Lý Người Dùng & Gán Quyền VIP Premium</h3>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="🔎 Tìm theo họ tên / email / SĐT..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--line)', fontSize: 13, width: 240 }}
                />
                <select value={userRoleFilter} onChange={(e) => setUserRoleFilter(e.target.value)} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--line)', fontSize: 13 }}>
                  <option value="">Tất cả vai trò</option>
                  <option value="farmer">🌾 Nông dân</option>
                  <option value="owner">🚜 Chủ máy</option>
                  <option value="admin">🛡️ Quản trị viên</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: 30, textAlign: 'center' }}>Đang tải người dùng...</div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead><tr><th>Họ tên</th><th>Email & SĐT</th><th>Vai trò</th><th>Khu vực</th><th>Gói VIP</th><th>Trạng thái</th><th>Thao tác Admin</th></tr></thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u._id}>
                        <td><b>{u.full_name}</b></td>
                        <td>{u.email}<br /><span className="small">📞 {u.phone || 'Chưa có'}</span></td>
                        <td>
                          <span className="badge">
                            {{ farmer: '🌾 Nông dân', owner: '🚜 Chủ máy', admin: '🛡️ Quản trị' }[u.role] || u.role}
                          </span>
                        </td>
                        <td>{u.district || '—'}</td>
                        <td>
                          {u.is_premium ? (
                            <span className="badge badge-gold">👑 VIP Partner</span>
                          ) : (
                            <span className="small muted">Cơ bản</span>
                          )}
                        </td>
                        <td><StatusPill status={u.status} /></td>
                        <td>
                          {u.role !== 'admin' && (
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              <button
                                className={`btn btn-sm ${u.is_premium ? 'btn-outline' : 'btn-primary'}`}
                                onClick={() => toggleUserVip(u)}
                              >
                                {u.is_premium ? '❌ Hủy VIP' : '⭐ Gán VIP'}
                              </button>
                              <button className={u.status === 'active' ? 'btn btn-danger btn-sm' : 'btn btn-outline btn-sm'} onClick={() => toggleUserStatus(u)}>
                                {u.status === 'active' ? 'Khóa' : 'Mở khóa'}
                              </button>
                              <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(u._id)}>🗑️ Xóa</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && <tr><td colSpan={7} className="small" style={{ padding: 20, textAlign: 'center' }}>Không tìm thấy người dùng nào.</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === 'bookings' && (
          <div className="card-box">
            <h3>Tất cả đơn đặt lịch</h3>
            {loading ? (
              <div style={{ padding: 30, textAlign: 'center' }}>Đang tải đơn hàng...</div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead><tr><th>Máy</th><th>Nông dân</th><th>Chủ máy</th><th>Ngày thuê</th><th>Tổng tiền</th><th>Trạng thái</th><th>Thao tác Admin</th></tr></thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b._id}>
                        <td><b>{b.machine_id?.name || 'Máy nông nghiệp'}</b></td>
                        <td>{b.farmer_id?.full_name || 'Nông dân'}</td>
                        <td>{b.owner_id?.full_name || 'Chủ máy'}</td>
                        <td>{formatDate(b.start_date)} → {formatDate(b.end_date)}</td>
                        <td>{formatVND(b.total_price)}</td>
                        <td><StatusPill status={b.status} /></td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <select
                              value={b.status}
                              onChange={(e) => handleBookingStatusChange(b._id, e.target.value)}
                              style={{ padding: '4px 8px', borderRadius: 6, fontSize: 12 }}
                            >
                              <option value="pending">Chờ nhận</option>
                              <option value="accepted">Đã nhận</option>
                              <option value="completed">Hoàn tất</option>
                              <option value="rejected">Từ chối</option>
                              <option value="cancelled">Đã hủy</option>
                            </select>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteBooking(b._id)}>🗑️ Xóa</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {bookings.length === 0 && <tr><td colSpan={7} className="small" style={{ padding: 20, textAlign: 'center' }}>Chưa có đơn đặt lịch nào.</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

