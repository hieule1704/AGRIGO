import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

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
    <div className="container" style={{ paddingTop: 30, paddingBottom: 60, maxWidth: 640 }}>
      <h1 style={{ fontSize: 26, marginBottom: 8 }}>Hồ sơ cá nhân</h1>
      <p className="small" style={{ marginBottom: 24 }}>Cập nhật thông tin tài khoản và ảnh đại diện của bạn.</p>

      <div className="card-box">
        {err && <div className="alert alert-error">{err}</div>}
        {ok && <div className="alert alert-success">{ok}</div>}

        {/* 
          📸 [HƯỚNG DẪN CHỌN ẢNH AVATAR USER]:
          - Tỉ lệ: 1:1 vuông (khuyến nghị ~200x200px cho Retina 2x).
          - Định dạng: WebP / JPEG / PNG (<50KB), hiển thị crop tròn.
        */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--line)' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', background: 'var(--green-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--green-mid)', flexShrink: 0 }}>
            {form.avatar_url ? (
              <img src={form.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/80?text=Avatar'; }} />
            ) : (
              <span style={{ fontSize: 32 }}>👤</span>
            )}
          </div>
          <div>
            <h3 style={{ margin: 0 }}>{user?.full_name}</h3>
            <span className="cat" style={{ marginTop: 4 }}>
              {user?.role === 'owner' ? '🚜 Chủ máy' : user?.role === 'admin' ? '🛡️ Quản trị viên' : '🌾 Nông dân'}
            </span>
            <p className="small" style={{ margin: '4px 0 0', opacity: 0.8 }}>{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Họ và tên</label>
            <input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          </div>

          <div className="field">
            <label>Số điện thoại</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="090XXXXXXX" />
          </div>

          <div className="field">
            <label>Khu vực (Huyện/Thị)</label>
            <select value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })}>
              <option value="">-- Chọn khu vực --</option>
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Địa chỉ chi tiết</label>
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Số nhà, tên đường, xã/phường" />
          </div>

          <div className="field">
            <label>Ảnh đại diện (Avatar)</label>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
              <input type="file" accept="image/*" onChange={handleFileUpload} style={{ padding: 4 }} />
              {uploading && <span className="small">Đang tải...</span>}
            </div>
            <input
              placeholder="Hoặc nhập đường dẫn URL ảnh (https://...)"
              value={form.avatar_url}
              onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
            />
          </div>

          <button className="btn btn-primary" type="submit" style={{ marginTop: 12 }}>Lưu thay đổi</button>
        </form>
      </div>
    </div>
  );
}
