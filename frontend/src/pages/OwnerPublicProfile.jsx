import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, resolveImageUrl } from '../api';
import MachineCard from '../components/MachineCard';

export default function OwnerPublicProfile() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get(`/machines/owner-public/${id}`)
      .then((d) => setData(d))
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container" style={{ padding: 60, textAlign: 'center' }}>Đang nạp hồ sơ chủ máy...</div>;
  if (err || !data) return <div className="container" style={{ padding: 60 }}><div className="alert alert-error">{err || 'Không tìm thấy chủ máy.'}</div></div>;

  const { owner, machines } = data;

  return (
    <div className="container" style={{ paddingTop: 30, paddingBottom: 60 }}>
      {/* Header Hồ Sơ Chủ Máy */}
      <div className="card-box" style={{ padding: 32, background: owner.is_premium ? 'linear-gradient(135deg, #153A2E 0%, #1F5C45 100%)' : '#ffffff', color: owner.is_premium ? '#ffffff' : 'var(--ink)', borderRadius: 20, marginBottom: 30, border: owner.is_premium ? '2px solid var(--gold)' : '1px solid var(--line)', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ width: 84, height: 84, borderRadius: '50%', overflow: 'hidden', background: 'var(--green-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: owner.is_premium ? '3px solid var(--gold)' : '2px solid var(--green-mid)', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            {owner.avatar_url ? (
              <img src={resolveImageUrl(owner.avatar_url)} alt={owner.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/84?text=U'; }} />
            ) : (
              <span style={{ fontSize: 40 }}>🚜</span>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
              <h1 style={{ fontSize: 26, margin: 0, color: owner.is_premium ? '#ffffff' : 'var(--ink)', fontWeight: 800 }}>{owner.full_name}</h1>
              {owner.is_premium && (
                <span className="badge badge-gold" style={{ fontSize: 12, padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  👑 ⭐ Đối tác đáng tin cậy (VIP)
                </span>
              )}
            </div>
            <div style={{ fontSize: 14, opacity: 0.9, display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 6 }}>
              <span>📍 Khu vực: <b>{owner.district || 'An Giang'}</b></span>
              <span>📞 SĐT liên hệ: <b>{owner.phone || 'Đã xác minh'}</b></span>
              <span>🚜 Tổng dàn máy: <b>{machines.length} thiết bị</b></span>
            </div>
          </div>

          <div>
            <a href={`tel:${owner.phone}`} className="btn btn-primary" style={{ padding: '12px 24px', fontSize: 15 }}>
              📞 Gọi Điện Trực Tiếp
            </a>
          </div>
        </div>
      </div>

      {/* Danh sách máy thuộc chủ sở hữu */}
      <div className="section-head" style={{ marginBottom: 24 }}>
        <div>
          <p className="eyebrow-label">DANH MỤC THIẾT BỊ</p>
          <h2 style={{ margin: 0 }}>Tất cả phương tiện của chủ máy {owner.full_name} ({machines.length})</h2>
        </div>
      </div>

      {machines.length === 0 ? (
        <div className="empty-state"><div className="ico">🚜</div>Chủ máy này hiện chưa có bài đăng máy nào được duyệt.</div>
      ) : (
        <div className="card-grid">
          {machines.map((m) => (
            <MachineCard key={m._id} machine={m} />
          ))}
        </div>
      )}
    </div>
  );
}
