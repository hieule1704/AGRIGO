import { useEffect, useState } from 'react';
import { api } from '../api';

export default function BackendHealthBanner() {
  const [status, setStatus] = useState('checking'); // 'checking' | 'online' | 'waking' | 'offline'

  useEffect(() => {
    let timer = setTimeout(() => {
      // If health check hasn't finished in 3 seconds, backend is probably cold starting on Render
      setStatus((s) => (s === 'checking' ? 'waking' : s));
    }, 3000);

    api.get('/health')
      .then(() => setStatus('online'))
      .catch(() => setStatus('offline'))
      .finally(() => clearTimeout(timer));
  }, []);

  if (status === 'online' || status === 'checking') return null;

  return (
    <div style={{
      background: status === 'waking' ? '#FFF8E7' : '#FDE8E8',
      color: status === 'waking' ? '#8A5D00' : '#9B1C1C',
      borderBottom: `1px solid ${status === 'waking' ? '#F2DDB0' : '#F8B4B4'}`,
      padding: '8px 16px',
      fontSize: 13,
      fontWeight: 500,
      textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      justify: 'center',
      gap: 10,
      zIndex: 9999,
      position: 'relative',
    }}>
      {status === 'waking' ? (
        <>
          <span>⚡ <b>Máy chủ Backend (Render Free-Tier) đang khởi động lạnh...</b> Dữ liệu sẽ tự động nạp hoàn tất sau vài giây.</span>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '2px 8px', fontSize: 12, borderRadius: 4, border: '1px solid #8A5D00', background: '#fff', cursor: 'pointer' }}
          >
            🔄 Tải lại
          </button>
        </>
      ) : (
        <>
          <span>🔌 <b>Chưa thể kết nối tới Server Backend.</b> Kiểm tra kết nối mạng hoặc đường dẫn API (VITE_API_URL).</span>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '2px 8px', fontSize: 12, borderRadius: 4, border: '1px solid #9B1C1C', background: '#fff', cursor: 'pointer' }}
          >
            🔄 Thử lại
          </button>
        </>
      )}
    </div>
  );
}
