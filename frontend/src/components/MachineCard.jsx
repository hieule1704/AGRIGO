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
  'may-cay': 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop&q=80',
  'may-gat': 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&auto=format&fit=crop&q=80',
  'may-cay-lua': 'https://images.unsplash.com/photo-1530507629858-e4977d30e9e0?w=800&auto=format&fit=crop&q=80',
  'drone-phun-thuoc': 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80',
  'may-say': 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?w=800&auto=format&fit=crop&q=80',
  'may-xoi-dat': 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80',
};

export default function MachineCard({ machine }) {
  const cat = machine.category_id || {};
  const imgSrc = machine.image_url || CATEGORY_PLACEHOLDERS[cat.slug] || 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop&q=80';

  return (
    <Link to={`/machine/${machine._id}`} className="machine-card">
      <div className="thumb">
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
          onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop&q=80'; }}
        />
      </div>
      <div className="body">
        <div className="cat">{cat.name}</div>
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
