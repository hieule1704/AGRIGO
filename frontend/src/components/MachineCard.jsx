import { Link } from 'react-router-dom';

const CATEGORY_ICONS = {
  'may-cay': '🚜', 'may-gat': '🌾', 'may-cay-lua': '🌱', 'drone-phun-thuoc': '🚁',
  'may-say': '🔥', 'may-xoi-dat': '⚙️',
};

export function categoryIcon(slug) {
  return CATEGORY_ICONS[slug] || '🧰';
}

export function formatVND(n) {
  return Number(n || 0).toLocaleString('vi-VN') + 'đ';
}

export function formatDate(d) {
  if (!d) return '';
  const dt = new Date(d);
  if (isNaN(dt)) return d;
  return dt.toLocaleDateString('vi-VN');
}

export const CATEGORY_PLACEHOLDERS = {
  'may-cay': 'https://img.websosanh.vn/v10/users/keydes/images/hhctben04tx32/may-cay-trung-quoc.jpg?w=800&auto=format&fit=crop&q=80',
  'may-gat': 'https://www.kubota.com/innovation/evolution/agriculture/detail/img/img_2010_main.jpg?w=800&auto=format&fit=crop&q=80',
  'may-cay-lua': 'https://down-vn.img.susercontent.com/file/vn-11134207-7qukw-lff8yrb3qiroc8?w=800&auto=format&fit=crop&q=80',
  'drone-phun-thuoc': 'https://thapxanh.com/images/thumbs/0038133_drone-phun-thuoc-sau-xlp450-may-bay-phun-thuoc-sau-dieu-khien-tu-xa_510.jpeg?w=800&auto=format&fit=crop&q=80',
  'may-say': 'https://i.ytimg.com/vi/4vP1ykKNG60/maxresdefault.jpg?w=800&auto=format&fit=crop&q=80',
  'may-xoi-dat': 'https://www.thietbim5s.vn/upload/images/may-xoi-dat-mini.jpg?w=800&auto=format&fit=crop&q=80',
};

export default function MachineCard({ machine }) {
  const cat = machine.category_id || {};
  const fallbackImg = CATEGORY_PLACEHOLDERS[cat.slug] || 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop&q=80';
  const isUnsplashDefault = machine.image_url && machine.image_url.includes('unsplash.com');
  const imgSrc = (!machine.image_url || isUnsplashDefault) ? fallbackImg : machine.image_url;

  return (
    <Link to={`/machine/${machine._id}`} className="machine-card">
      <div className="thumb" style={{ position: 'relative' }}>
        {/* Category Icon Badge Overlay */}
        <span style={{
          position: 'absolute',
          top: 10,
          left: 10,
          background: 'rgba(21, 58, 46, 0.85)',
          color: '#fff',
          padding: '4px 10px',
          borderRadius: '999px',
          fontSize: 12,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          backdropFilter: 'blur(4px)',
          fontWeight: 'bold',
          zIndex: 2,
        }}>
          {categoryIcon(cat.slug)} {cat.name || 'Nông nghiệp'}
        </span>

        {machine.rating_count > 0 && (
          <span className="badge badge-gold">★ {Number(machine.rating_avg).toFixed(1)}</span>
        )}
        {/* 
          📸 [HƯỚNG DẪN CHỌN ẢNH MACHINE CARD]:
          - Tỉ lệ khung hình: 4:3 (khuyến nghị ~800x600px cho màn Retina 2x).
          - Định dạng: WebP / JPEG (nén dung lượng 80-150KB qua Squoosh.app hoặc TinyPNG).
          - Chú ý: Dùng loading="lazy" để tối ưu tốc độ tải trang khi hiển thị nhiều danh sách card.
        */}
        <img
          src={imgSrc}
          alt={machine.name}
          loading="lazy"
          onError={(e) => { e.target.onerror = null; e.target.src = fallbackImg; }}
        />
      </div>
      <div className="body">
        <div className="cat">{categoryIcon(cat.slug)} {cat.name}</div>
        <h3>{machine.name}</h3>
        <div className="loc">📍 {machine.district}</div>
        <div className="price-row">
          <div className="price">{formatVND(machine.price_per_day)} <small>/ {machine.price_unit}</small></div>
          <div className="rating">
            {machine.rating_count > 0
              ? <><span className="star">★</span> {Number(machine.rating_avg).toFixed(1)} ({machine.rating_count})</>
              : <span className="small">Chưa có đánh giá</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}
