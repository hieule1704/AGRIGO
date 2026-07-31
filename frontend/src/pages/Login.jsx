import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');

  async function submit(e) {
    e.preventDefault();
    setErr('');
    try {
      const user = await login(form.email, form.password);
      const next = params.get('next');
      if (next) navigate(next);
      else if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'owner') navigate('/owner');
      else navigate('/');
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="auth-shell">
      <h1>Đăng nhập</h1>
      <p className="sub">Chào mừng quay lại AGRIGO.</p>
      {err && <div className="alert alert-error">{err}</div>}
      <form onSubmit={submit}>
        <div className="field">
          <label>Email</label>
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="field">
          <label>Mật khẩu</label>
          <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <button className="btn btn-primary btn-block" type="submit">Đăng nhập</button>
      </form>
      <p className="small" style={{ marginTop: 16, textAlign: 'center' }}>
        Chưa có tài khoản? <Link to="/register" style={{ color: 'var(--green-deep)', fontWeight: 700 }}>Đăng ký ngay</Link>
      </p>
      <p className="small" style={{ marginTop: 10, textAlign: 'center', opacity: .7 }}>
        Tài khoản demo: farmer@agrigo.vn / owner@agrigo.vn / admin@agrigo.vn — mật khẩu: <b>123456</b>
      </p>
    </div>
  );
}
