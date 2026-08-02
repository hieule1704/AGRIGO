import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SocialLoginButtons from '../components/SocialLoginButtons';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const role = params.get('role') === 'owner' ? 'owner' : 'farmer';
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', district: '', password: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const user = await register({ ...form, role });
      navigate(user.role === 'owner' ? '/owner' : '/');
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 140px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'var(--bg-light)' }}>
      <div style={{ background: '#ffffff', borderRadius: 24, boxShadow: '0 20px 50px rgba(0,0,0,0.1)', overflow: 'hidden', maxWidth: 1040, width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', border: '1px solid var(--line)' }}>
        
        {/* Left Side: Rich Branding Visual Banner */}
        <div style={{ background: 'linear-gradient(135deg, #153A2E 0%, #1F5C45 100%)', padding: 40, color: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'inline-block', background: 'rgba(232,172,31,0.2)', border: '1px solid var(--gold)', color: 'var(--gold)', padding: '4px 14px', borderRadius: 999, fontSize: 12, fontWeight: '800', letterSpacing: 0.5, marginBottom: 20 }}>
              🌾 TẠO TÀI KHOẢN MỚI
            </div>
            <h2 style={{ color: '#ffffff', fontSize: 28, margin: '0 0 16px', lineHeight: 1.35, fontWeight: 800 }}>
              Gia Nhập Cộng Đồng Nông Nghiệp Số AGRIGO
            </h2>
            <p style={{ color: '#E2E8F0', fontSize: 14.5, lineHeight: 1.7, marginBottom: 24 }}>
              Chỉ mất 1 phút để tiếp cận dàn xe cơ giới hơn 500+ máy cày, máy gặt, Drone phun thuốc khắp 11 huyện An Giang.
            </p>

            <div style={{ background: 'rgba(255,255,255,0.1)', padding: 20, borderRadius: 16, border: '1px solid rgba(255,255,255,0.15)' }}>
              <b style={{ color: 'var(--gold)', fontSize: 15, display: 'block', marginBottom: 8 }}>
                {role === 'farmer' ? '🌾 Dành Cho Nông Dân Thuê Máy:' : '🚜 Dành Cho Chủ Máy Đăng Thuê:'}
              </b>
              {role === 'farmer' ? (
                <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13.5, lineHeight: 1.8, color: '#F1F5F9' }}>
                  <li>Tìm máy cày, máy gặt gần đồng ruộng trong 5 giây.</li>
                  <li>Giá niêm yết công khai, không lo chặt chém mùa cao điểm.</li>
                  <li>Nghiệm thu máy bằng Biên bản 4 góc máy đối chứng.</li>
                </ul>
              ) : (
                <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13.5, lineHeight: 1.8, color: '#F1F5F9' }}>
                  <li>Tiếp cận hơn 10.000+ nông dân An Giang đang tìm máy.</li>
                  <li>Tự động quản lý lịch làm việc & trích Quỹ Khấu Hao xe.</li>
                  <li>Gói VIP Partner ưu tiên quảng cáo banner và hiển thị top.</li>
                </ul>
              )}
            </div>
          </div>

          <div style={{ paddingTop: 30, borderTop: '1px solid rgba(255,255,255,0.15)', fontSize: 12.5, color: '#CBD5E1', marginTop: 30 }}>
            © 2026 AGRIGO Platform. Bản quyền thuộc về AGRIGO Việt Nam.
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div style={{ padding: 40, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: 20 }}>
            <span style={{ fontSize: 13, fontWeight: 'bold', color: 'var(--ink-soft)' }}>Bạn đăng ký với vai trò:</span>
            <div className="role-toggle" style={{ marginTop: 8 }}>
              <a href="#" className={role === 'farmer' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setParams({ role: 'farmer' }); }}>🌾 Nông Dân Thuê Máy</a>
              <a href="#" className={role === 'owner' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setParams({ role: 'owner' }); }}>🚜 Chủ Máy Đăng Xe</a>
            </div>
          </div>

          {err && <div className="alert alert-error" style={{ marginBottom: 18 }}>{err}</div>}

          <form onSubmit={submit}>
            <div className="field">
              <label>Họ và tên</label>
              <input required placeholder="VD: Nguyễn Văn Ba" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div className="form-grid">
              <div className="field">
                <label>Email</label>
                <input type="email" required placeholder="VD: vanba@gmail.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="field">
                <label>Số điện thoại</label>
                <input placeholder="VD: 0939123456" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div className="field">
              <label>Khu vực (Huyện An Giang)</label>
              <input placeholder="VD: Thoại Sơn / Châu Phú / Tri Tôn..." value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
            </div>
            <div className="field">
              <label>Mật khẩu đăng nhập</label>
              <input type="password" required minLength={6} placeholder="Tối thiểu 6 ký tự" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>

            <button className="btn btn-primary btn-block" type="submit" disabled={loading} style={{ padding: '12px', fontSize: 15, fontWeight: 'bold' }}>
              {loading ? '⏳ Đang tạo tài khoản...' : '🚀 Hoàn Tất Đăng Ký'}
            </button>
          </form>

          {/* Social Logins */}
          <SocialLoginButtons actionText="Đăng ký" />

          <p className="small" style={{ marginTop: 20, textAlign: 'center' }}>
            Đã có tài khoản? <Link to="/login" style={{ color: 'var(--green-deep)', fontWeight: 700 }}>Đăng nhập ngay →</Link>
          </p>
        </div>

      </div>
    </div>
  );
}
