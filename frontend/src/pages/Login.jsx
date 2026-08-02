import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SocialLoginButtons from '../components/SocialLoginButtons';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      const next = params.get('next');
      if (next) navigate(next);
      else if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'owner') navigate('/owner');
      else navigate('/');
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function quickLogin(email) {
    setForm({ email, password: '123456' });
    setErr('');
    setLoading(true);
    try {
      const user = await login(email, '123456');
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'owner') navigate('/owner');
      else navigate('/');
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 140px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'var(--bg-light)' }}>
      <div style={{ background: '#ffffff', borderRadius: 24, boxShadow: '0 20px 50px rgba(0,0,0,0.1)', overflow: 'hidden', maxWidth: 1040, width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', border: '1px solid var(--line)' }}>
        
        {/* Left Side: Rich Agricultural Branding Visual Banner */}
        <div style={{ background: 'linear-gradient(135deg, #153A2E 0%, #1F5C45 100%)', padding: 40, color: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
          <div>
            <div style={{ display: 'inline-block', background: 'rgba(232,172,31,0.2)', border: '1px solid var(--gold)', color: 'var(--gold)', padding: '4px 14px', borderRadius: 999, fontSize: 12, fontWeight: '800', letterSpacing: 0.5, marginBottom: 20 }}>
              🌾 AGRIGO PLATFORM
            </div>
            <h2 style={{ color: '#ffffff', fontSize: 28, margin: '0 0 16px', lineHeight: 1.35, fontWeight: 800 }}>
              Kết Nối Cơ Giới Hóa Nông Nghiệp Thông Minh
            </h2>
            <p style={{ color: '#E2E8F0', fontSize: 14.5, lineHeight: 1.7, marginBottom: 24 }}>
              Hệ thống kết nối Nông dân và Chủ máy cày, máy gặt, Drone phun thuốc số 1 An Giang. Đặt lịch minh bạch, nghiệm thu 4 góc máy và bảo vệ rủi ro 100%.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14 }}>
                <span style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🤖</span>
                <span>Trợ lý AI Gemini tìm kiếm máy bằng ngôn ngữ tự nhiên</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14 }}>
                <span style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🗺️</span>
                <span>Bản đồ vệ tinh Leaflet định vị xe cơ giới gần đồng ruộng</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14 }}>
                <span style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📋</span>
                <span>Biên bản bàn giao kỹ thuật số 4 góc máy đối chứng</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14 }}>
                <span style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🛡️</span>
                <span>Bảo vệ rủi ro hư hỏng & bảo hiểm PJICO 1.5%</span>
              </div>
            </div>
          </div>

          <div style={{ paddingTop: 30, borderTop: '1px solid rgba(255,255,255,0.15)', fontSize: 12.5, color: '#CBD5E1', marginTop: 30 }}>
            © 2026 AGRIGO. Nền tảng chia sẻ xe cơ giới nông nghiệp An Giang.
          </div>
        </div>

        {/* Right Side: Authentication Form & Quick Demo Logins */}
        <div style={{ padding: 40, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ fontSize: 24, margin: '0 0 6px', color: 'var(--green-deep)' }}>Đăng nhập tài khoản</h2>
          <p style={{ color: 'var(--ink-soft)', fontSize: 14, margin: '0 0 24px' }}>Nhập thông tin để tiếp tục sử dụng hệ thống AGRIGO</p>

          {err && <div className="alert alert-error" style={{ marginBottom: 18 }}>{err}</div>}

          <form onSubmit={submit}>
            <div className="field">
              <label>Địa chỉ Email</label>
              <input
                type="email"
                required
                placeholder="VD: farmer@agrigo.vn"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Mật khẩu</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <button className="btn btn-primary btn-block" type="submit" disabled={loading} style={{ padding: '12px', fontSize: 15, fontWeight: 'bold' }}>
              {loading ? '⏳ Đang xác thực...' : '🚀 Đăng Nhập Ngay'}
            </button>
          </form>

          {/* Social Logins */}
          <SocialLoginButtons actionText="Đăng nhập" />

          {/* Quick Demo Accounts Selection */}
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px dashed var(--line)' }}>
            <span style={{ fontSize: 12, fontWeight: '800', color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 10 }}>
              ⚡ Đăng Nhập Nhanh Tài Khoản Demo (Mật khẩu: 123456):
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => quickLogin('farmer_demo@agrigo.vn')}>
                🌾 Nông Dân Demo
              </button>
              <button type="button" className="btn btn-outline btn-sm" style={{ borderColor: 'var(--gold)', color: 'var(--gold-dark)' }} onClick={() => quickLogin('owner_vip@agrigo.vn')}>
                👑 Chủ Máy VIP Demo
              </button>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => quickLogin('admin@agrigo.vn')}>
                🛡️ Admin Quản Trị
              </button>
            </div>
          </div>

          <p className="small" style={{ marginTop: 24, textAlign: 'center' }}>
            Bà con chưa có tài khoản? <Link to="/register" style={{ color: 'var(--green-deep)', fontWeight: 700 }}>Đăng ký tài khoản mới →</Link>
          </p>
        </div>

      </div>
    </div>
  );
}
