import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function AdBannerSlider({ district }) {
  const [ads, setAds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const q = district ? `?district=${encodeURIComponent(district)}` : '';
    api.get(`/advertisements${q}`)
      .then((d) => {
        const list = d.advertisements || [];
        setAds(list);
        setCurrentIndex(0);
      })
      .catch(() => setAds([]));
  }, [district]);

  // Tu dong chuyen slide sau 6 giay (Auto rotation timer)
  useEffect(() => {
    if (ads.length <= 1 || isHovered) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 6000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [ads.length, isHovered]);

  if (!ads || ads.length === 0) return null;

  const currentAd = ads[currentIndex] || ads[0];

  function handleNext() {
    setCurrentIndex((prev) => (prev + 1) % ads.length);
  }

  function handlePrev() {
    setCurrentIndex((prev) => (prev - 1 + ads.length) % ads.length);
  }

  function handleAdClick(adId) {
    api.post(`/advertisements/${adId}/click`).catch(() => {});
  }

  const targetLink = currentAd.machine_id ? `/machine/${currentAd.machine_id._id}` : '/search';

  return (
    <div style={{ marginBottom: 20 }}>
      <div
        className="card-box reveal reveal-zoom"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          background: `linear-gradient(135deg, rgba(16, 45, 36, 0.94), rgba(28, 80, 60, 0.96)), url('${currentAd.banner_url || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1600&auto=format&fit=crop&q=80'}') center/cover`,
          color: '#fff',
          padding: '20px 24px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-pop)',
          position: 'relative',
          overflow: 'hidden',
          border: '2px solid var(--gold)',
          transition: 'background 0.5s ease-in-out',
          minHeight: 160,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {/* Badge Quảng cáo VIP */}
        <div style={{
          position: 'absolute',
          top: 10,
          right: 12,
          background: 'var(--gold)',
          color: 'var(--green-deep)',
          padding: '3px 10px',
          borderRadius: 999,
          fontSize: 10,
          fontWeight: '800',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          zIndex: 3,
          whiteSpace: 'nowrap',
        }}>
          ⭐ ĐỐI TÁC VIP
        </div>

        {/* Dynamic Slide Content */}
        <div style={{ maxWidth: 700, zIndex: 2, transition: 'all 0.3s ease', paddingRight: 60 }}>
          <h3 style={{
            fontSize: 'clamp(16px, 3.2vw, 21px)',
            fontWeight: '800',
            margin: '0 0 6px',
            color: '#fff',
            textShadow: '0 2px 4px rgba(0,0,0,0.4)',
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {currentAd.title}
          </h3>
          <p style={{
            margin: '0 0 12px',
            opacity: 0.95,
            fontSize: 13,
            lineHeight: 1.5,
            textShadow: '0 1px 2px rgba(0,0,0,0.4)',
            maxWidth: 620,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {currentAd.description || 'Phương tiện nông nghiệp đời mới, hoạt động uy tín, phục vụ bà con An Giang tận tình.'}
          </p>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <Link
              to={targetLink}
              onClick={() => handleAdClick(currentAd._id)}
              className="btn btn-primary"
              style={{ padding: '7px 16px', fontSize: 13, fontWeight: 'bold' }}
            >
              🚜 Xem & Đặt lịch
            </Link>
            {currentAd.owner_id && (
              <span className="small" style={{
                color: '#ffffff',
                fontWeight: '600',
                fontSize: 12,
                background: 'rgba(255,255,255,0.2)',
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.35)',
                backdropFilter: 'blur(4px)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
              }}>
                📞 {currentAd.owner_id.full_name} ({currentAd.owner_id.phone || 'Đã xác minh'})
              </span>
            )}
          </div>
        </div>

        {/* Arrows controls (Hiển thị khi có từ 2 quảng cáo trở lên) */}
        {ads.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Banner trước"
              style={{
                position: 'absolute',
                left: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0, 0, 0, 0.45)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                width: 30,
                height: 30,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                cursor: 'pointer',
                zIndex: 4,
                transition: 'background 0.2s, transform 0.2s',
                backdropFilter: 'blur(4px)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--green-deep)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0, 0, 0, 0.45)')}
            >
              ❮
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Banner kế tiếp"
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0, 0, 0, 0.45)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                width: 30,
                height: 30,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                cursor: 'pointer',
                zIndex: 4,
                transition: 'background 0.2s, transform 0.2s',
                backdropFilter: 'blur(4px)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--green-deep)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0, 0, 0, 0.45)')}
            >
              ❯
            </button>

            {/* Pagination Dots */}
            <div
              style={{
                position: 'absolute',
                bottom: 8,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 6,
                zIndex: 4,
              }}
            >
              {ads.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  style={{
                    width: idx === currentIndex ? 20 : 6,
                    height: 6,
                    borderRadius: 999,
                    background: idx === currentIndex ? 'var(--gold)' : 'rgba(255,255,255,0.45)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    padding: 0,
                  }}
                  title={`Chuyển đến banner ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
