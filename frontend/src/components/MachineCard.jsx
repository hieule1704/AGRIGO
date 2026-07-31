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

export default function MachineCard({ machine }) {
  const cat = machine.category_id || {};
  return (
    <Link to={`/machine/${machine._id}`} className="machine-card">
      <div className="thumb">
        {machine.rating_count > 0 && (
          <span className="badge badge-gold">★ {Number(machine.rating_avg).toFixed(1)}</span>
        )}
        {machine.image_url ? <img src={machine.image_url} alt={machine.name} /> : categoryIcon(cat.slug)}
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
