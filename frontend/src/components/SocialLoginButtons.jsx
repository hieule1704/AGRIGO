import { useState } from 'react';

export default function SocialLoginButtons({ actionText = 'Đăng nhập' }) {
  const [notice, setNotice] = useState('');

  function handleSocialClick(provider) {
    setNotice(`ℹ️ Phương thức ${actionText} qua ${provider} đang trong quá trình thử nghiệm. Vui lòng ${actionText.toLowerCase()} bằng Email & Mật khẩu bên dưới để trải nghiệm hệ thống.`);
  }

  return (
    <div style={{ marginTop: 18, marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', margin: '14px 0' }}>
        <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--line)' }} />
        <span style={{ padding: '0 10px', fontSize: 12, color: 'var(--ink-soft)', fontWeight: '600', letterSpacing: '0.03em' }}>
          HOẶC {actionText.toUpperCase()} BẰNG
        </span>
        <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--line)' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        <button
          type="button"
          onClick={() => handleSocialClick('Google')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '9px 10px',
            borderRadius: 10,
            border: '1px solid #e0e0e0',
            background: '#ffffff',
            color: '#333333',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          Google
        </button>

        <button
          type="button"
          onClick={() => handleSocialClick('Facebook')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '9px 10px',
            borderRadius: 10,
            border: '1px solid #1877F2',
            background: '#1877F2',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: '0 2px 5px rgba(0,0,0,0.08)',
          }}
        >
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Facebook
        </button>

        <button
          type="button"
          onClick={() => handleSocialClick('Zalo')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '9px 10px',
            borderRadius: 10,
            border: '1px solid #0068FF',
            background: '#0068FF',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: '0 2px 5px rgba(0,0,0,0.08)',
          }}
        >
          <span style={{ background: '#fff', color: '#0068FF', borderRadius: 4, padding: '1px 5px', fontWeight: '900', fontSize: 11 }}>Z</span>
          Zalo
        </button>
      </div>

      {notice && (
        <div style={{ marginTop: 12, padding: '10px 14px', background: '#FFF8E7', border: '1px solid #E8AC1F', color: '#B9840C', borderRadius: 8, fontSize: 13, lineHeight: 1.5 }}>
          {notice}
        </div>
      )}
    </div>
  );
}
