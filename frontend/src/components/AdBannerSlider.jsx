import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function AdBannerSlider({ district }) {
  const [ads, setAds] = useState([]);

  useEffect(() => {
    const q = district ? `?district=${encodeURIComponent(district)}` : '';
    api.get(`/advertisements${q}`)
      .then((d) => setAds(d.advertisements || []))
      .catch(() => setAds([]));
  }, [district]);

  if (!ads || ads.length === 0) return null;

  const ad = ads[0]; // Active top sponsored banner

  function handleAdClick() {
    api.post(`/advertisements/${ad._id}/click`).catch(() => {});
  }

  const targetLink = ad.machine_id ? `/machine/${ad.machine_id._id}` : '/search';

  return (
    <div className="container" style={{ marginBottom: 24 }}>
      <div
        className="card-box reveal reveal-zoom"
        style={{
          background: `linear-gradient(135deg, rgba(21, 58, 46, 0.92), rgba(31, 92, 69, 0.95)), url('${ad.banner_url}') center/cover`,
          color: '#fff',
          padding: '24px 30px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-pop)',
          position: 'relative',
          overflow: 'hidden',
          border: '2px solid var(--gold)',
        }}
      >
        <div style={{ position: 'absolute', top: 12, right: 16, background: 'var(--gold)', color: 'var(--green-deep)', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          ⭐ Quảng cáo Đối tác VIP
        </div>
        <div style={{ maxWidth: 720 }}>
          <h3 style={{ fontSize: 22, fontWeight: '800', margin: '0 0 8px', color: '#fff' }}>
            {ad.title}
          </h3>
          <p style={{ margin: '0 0 16px', opacity: 0.92, fontSize: 14, lineHeight: 1.6 }}>
            {ad.description || 'Phương tiện nông nghiệp đời mới, hoạt động uy tín, phục vụ bà con tận tình.'}
          </p>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <Link
              to={targetLink}
              onClick={handleAdClick}
              className="btn btn-primary"
              style={{ padding: '8px 20px', fontSize: 14 }}
            >
              🚜 Xem ngay & Đặt lịch
            </Link>
            {ad.owner_id && (
              <span className="small" style={{ opacity: 0.85, background: 'rgba(255,255,255,0.15)', padding: '6px 12px', borderRadius: 8 }}>
                📞 Chủ máy: {ad.owner_id.full_name} ({ad.owner_id.phone || 'Đã xác minh'})
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
