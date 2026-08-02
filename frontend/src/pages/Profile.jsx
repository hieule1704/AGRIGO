import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, resolveImageUrl } from '../api';
import { Link } from 'react-router-dom';

const DISTRICTS = [
  'Long Xuyên', 'Châu Đốc', 'Châu Phú', 'Chợ Mới',
  'Thoại Sơn', 'Tri Tôn', 'Phú Tân', 'Tân Châu',
  'Tịnh Biên', 'Châu Thành', 'An Phú'
];

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    district: user?.district || '',
    address: user?.address || '',
    avatar_url: user?.avatar_url || '',
  });
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [uploading, setUploading] = useState(false);

  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setErr('');
    try {
      const res = await api.upload(file);
      setForm((prev) => ({ ...prev, avatar_url: res.url }));
    } catch (err) {
      setErr('Lỗi khi tải ảnh avatar: ' + err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErr(''); setOk('');
    try {
      const res = await api.put('/auth/profile', form);
      setUser(res.user);
      setOk('Cập nhật thông tin hồ sơ thành công!');
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="container" style={{ paddingTop: 30, paddingBottom: 60, maxWidth: 1040 }}>
      {/* User Banner Card */}
      <div style={{ background: 'linear-gradient(135deg, #153A2E 0%, #1F5C45 100%)', borderRadius: 24, padding: 30, color: '#fff', marginBottom: 26, boxShadow: 'var(--shadow-card)', border: '2px solid var(--gold)', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ width: 90, height: 90, borderRadius: '50%', overflow: 'hidden', background: '#fff', border: '3px solid var(--gold)', flexShrink: 0, boxShadow: '0 6px 16px rgba(0,0,0,0.2)' }}>
            {form.avatar_url ? (
              <img src={resolveImageUrl(form.avatar_url)} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/90?text=Avatar'; }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, background: 'var(--green-soft)' }}>👤</div>
            )}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, color: '#ffffff', fontSize: 24 }}>{user?.full_name}</h2>
              {user?.is_premium && (
                <span className="badge badge-gold" style={{ fontSize: 12, padding: '4px 10px' }}>👑 Đối tác VIP Partner</span>
              )}
            </div>
            <p style={{ margin: '6px 0 0', color: '#E2E8F0', fontSize: 14 }}>
              📧 {user?.email} · 📞 {user?.phone || 'Chưa cập nhật SĐT'} · 📍 {user?.district || 'Chưa chọn huyện'}
            </p>
          </div>

          <div>
            {user?.role === 'owner' ? (
              <Link to="/owner" className="btn btn-primary" style={{ background: 'var(--gold)', color: 'var(--green-deep)', fontWeight: 'bold', border: 'none' }}>
                🚜 Mở Dashboard Quản Lý Dàn Xe
              </Link>
            ) : user?.role === 'admin' ? (
              <Link to="/admin" className="btn btn-primary" style={{ background: 'var(--gold)', color: 'var(--green-deep)', fontWeight: 'bold', border: 'none' }}>
                🛡️ Trang Quản Trị Admin
              </Link>
            ) : (
              <Link to="/farmer-bookings" className="btn btn-primary" style={{ background: 'var(--gold)', color: 'var(--green-deep)', fontWeight: 'bold', border: 'none' }}>
                📅 Xem Đơn Đặt Lịch Thuê Lúa
              </Link>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, alignItems: 'start' }}>
        {/* Left Column: Form Edit */}
        <div className="card-box" style={{ margin: 0 }}>
          <h3 style={{ marginTop: 0, marginBottom: 16, color: 'var(--green-deep)', fontSize: 18 }}>✏️ Chỉnh Sửa Thông Tin Cá Nhân</h3>

          {err && <div className="alert alert-error" style={{ marginBottom: 16 }}>{err}</div>}
          {ok && <div className="alert alert-success" style={{ marginBottom: 16 }}>{ok}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Họ và tên</label>
              <input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            </div>

            <div className="form-grid">
              <div className="field">
                <label>Số điện thoại liên hệ</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="090XXXXXXX" />
              </div>
              <div className="field">
                <label>Khu vực (Huyện An Giang)</label>
                <select value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })}>
                  <option value="">-- Chọn khu vực --</option>
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field">
              <label>Địa chỉ chi tiết (Ấp/Xã/Thị trấn)</label>
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="VD: Ấp Hòa Thạnh, Xã Định Thành" />
            </div>

            <div className="field">
              <label>Ảnh đại diện Avatar</label>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                <input type="file" accept="image/*" onChange={handleFileUpload} style={{ padding: 4, fontSize: 13 }} />
                {uploading && <span className="small">⏳ Đang tải...</span>}
              </div>
              <input
                placeholder="Hoặc dán URL ảnh trực tiếp (https://...)"
                value={form.avatar_url}
                onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
              />
            </div>

            <button className="btn btn-primary btn-block" type="submit" style={{ marginTop: 16, padding: 12, fontWeight: 'bold' }}>
              💾 Lưu Cập Nhật Hồ Sơ
            </button>
          </form>
        </div>

        {/* Right Column: Account Privileges & Wallet Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card-box" style={{ margin: 0 }}>
            <h3 style={{ marginTop: 0, marginBottom: 12, color: 'var(--green-deep)', fontSize: 17 }}>🛡️ Quyền Lợi & Hạn Mức An Toàn</h3>
            <div style={{ fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.7 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
                <span>Vai trò tài khoản:</span>
                <b>{{ farmer: '🌾 Nông dân', owner: '🚜 Chủ máy cơ giới', admin: '🛡️ Quản trị viên' }[user?.role] || user?.role}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
                <span>Gói dịch vụ:</span>
                <b>{user?.is_premium ? '👑 VIP Premium (Ưu tiên top 1)' : '⭐ Tài khoản Cơ bản'}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
                <span>Hạn mức bảo vệ tiền cọc:</span>
                <b style={{ color: 'var(--green-deep)' }}>500.000đ / chuyến thuê</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                <span>Biên bản bàn giao 4 góc máy:</span>
                <b style={{ color: '#059669' }}>✅ Đã kích hoạt 100%</b>
              </div>
            </div>
          </div>

          <div className="card-box" style={{ margin: 0, background: '#FFFDF5', border: '1px solid var(--gold)' }}>
            <b style={{ fontSize: 15, color: 'var(--green-deep)', display: 'block', marginBottom: 6 }}>💡 Cần hỗ trợ khẩn cấp?</b>
            <p className="small" style={{ color: 'var(--ink-soft)', marginBottom: 12 }}>
              Tổng đài trực đường dây nóng cứu hộ máy móc 24/7 luôn sẵn sàng hỗ trợ bạn tại mọi đồng ruộng An Giang.
            </p>
            <a href="tel:19006868" className="btn btn-outline btn-block" style={{ textAlignment: 'center', borderColor: 'var(--gold)', color: 'var(--gold-dark)', fontWeight: 'bold' }}>
              📞 Gọi Tổng Đài 1900 6868
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
