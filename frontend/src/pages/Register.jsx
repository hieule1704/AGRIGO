import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const role = params.get('role') === 'owner' ? 'owner' : 'farmer';
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', district: '', password: '' });
  const [err, setErr] = useState('');

  async function submit(e) {
    e.preventDefault();
    setErr('');
    try {
      const user = await register({ ...form, role });
      navigate(user.role === 'owner' ? '/owner' : '/');
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="auth-shell">
      <h1>Tạo tài khoản</h1>
      <p className="sub">Tham gia AGRIGO chỉ trong 1 phút.</p>
      <div className="role-toggle">
        <a href="#" className={role === 'farmer' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setParams({ role: 'farmer' }); }}>Tôi là Nông dân</a>
        <a href="#" className={role === 'owner' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setParams({ role: 'owner' }); }}>Tôi là Chủ máy</a>
      </div>
      {err && <div className="alert alert-error">{err}</div>}
      <form onSubmit={submit}>
        <div className="field"><label>Họ và tên</label><input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
        <div className="field"><label>Email</label><input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <div className="field"><label>Số điện thoại</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
        <div className="field"><label>Khu vực (huyện/thị xã)</label><input placeholder="VD: Thoại Sơn" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} /></div>
        <div className="field"><label>Mật khẩu</label><input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
        <button className="btn btn-primary btn-block" type="submit">Đăng ký</button>
      </form>
      <p className="small" style={{ marginTop: 16, textAlign: 'center' }}>
        Đã có tài khoản? <Link to="/login" style={{ color: 'var(--green-deep)', fontWeight: 700 }}>Đăng nhập</Link>
      </p>
    </div>
  );
}
