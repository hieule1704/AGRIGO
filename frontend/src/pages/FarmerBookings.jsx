import { useEffect, useState } from 'react';
import { api } from '../api';
import { StatusPill } from '../components/ProtectedRoute';
import { formatVND, formatDate } from '../components/MachineCard';

export default function FarmerBookings() {
  const [bookings, setBookings] = useState([]);
  const [reviewFor, setReviewFor] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [err, setErr] = useState('');

  function load() { api.get('/bookings/mine').then((d) => setBookings(d.bookings)); }
  useEffect(load, []);

  async function cancel(id) {
    if (!confirm('Bạn chắc chắn muốn hủy đơn này?')) return;
    try { await api.patch(`/bookings/${id}/status`, { status: 'cancelled' }); load(); }
    catch (e) { alert(e.message); }
  }

  async function submitReview(e) {
    e.preventDefault();
    setErr('');
    try {
      await api.post(`/bookings/${reviewFor}/review`, reviewForm);
      setReviewFor(null);
      setReviewForm({ rating: 5, comment: '' });
      load();
    } catch (e) { setErr(e.message); }
  }

  return (
    <div className="container" style={{ paddingTop: 30, paddingBottom: 50 }}>
      <h1 style={{ fontSize: 26 }}>Lịch thuê của tôi</h1>
      <p className="small" style={{ marginBottom: 20 }}>Theo dõi trạng thái các đơn đặt máy bạn đã gửi.</p>

      <table className="data-table">
        <thead><tr><th>Máy</th><th>Khu vực</th><th>Ngày thuê</th><th>Thanh toán</th><th>Tổng tiền</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b._id}>
              <td><b>{b.machine_id?.name}</b></td>
              <td>{b.machine_id?.district}</td>
              <td>{formatDate(b.start_date)} → {formatDate(b.end_date)} ({b.days} ngày)</td>
              <td>
                <span className="badge">
                  {b.payment_method === 'qr' ? '🏦 VietQR' : b.payment_method === 'ewallet' ? '📲 Ví điện tử' : '💵 Tiền mặt COD'}
                </span>
              </td>
              <td>{formatVND(b.total_price)}</td>
              <td><StatusPill status={b.status} /></td>
              <td>
                {(b.status === 'pending' || b.status === 'accepted') && (
                  <button className="btn btn-danger btn-sm" onClick={() => cancel(b._id)}>Hủy đơn</button>
                )}
                {b.status === 'completed' && (
                  <button className="btn btn-primary btn-sm" style={{ background: 'var(--gold)', color: 'var(--green-deep)', border: 'none', fontWeight: 'bold' }} onClick={() => setReviewFor(b._id)}>
                    ✍️ Viết Đánh Giá
                  </button>
                )}
              </td>
            </tr>
          ))}
          {bookings.length === 0 && <tr><td colSpan={7} className="small" style={{ padding: 20, textAlign: 'center' }}>Bạn chưa có đơn đặt lịch nào. <a href="/search">Tìm máy ngay →</a></td></tr>}
        </tbody>
      </table>

      {reviewFor && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', padding: 28, borderRadius: 18, maxWidth: 480, width: '100%', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            <div className="flex-between" style={{ marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>✍️ Viết Nhận Xét & Đánh Giá Máy</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setReviewFor(null)}>✖ Đóng</button>
            </div>
            {err && <div className="alert alert-error" style={{ marginBottom: 14 }}>{err}</div>}
            <form onSubmit={submitReview}>
              <div className="field">
                <label>Đánh giá số sao chất lượng:</label>
                <div style={{ display: 'flex', gap: 10, fontSize: 24, margin: '6px 0 14px', cursor: 'pointer' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      style={{ color: star <= reviewForm.rating ? '#F59E0B' : '#CBD5E1', transition: 'color 0.15s' }}
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    >
                      ★
                    </span>
                  ))}
                  <span style={{ fontSize: 14, color: 'var(--ink-soft)', alignSelf: 'center', marginLeft: 8 }}>
                    ({reviewForm.rating}/5 sao)
                  </span>
                </div>
              </div>
              <div className="field">
                <label>Ý kiến nhận xét & Cảm nhận thực tế (Comment):</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Ví dụ: Máy gặt chạy rất sạch lúa, đúng giờ, chủ máy nhiệt tình phục vụ tại đồng ruộng..."
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button className="btn btn-primary btn-block" type="submit">🚀 Gửi Đánh Giá Ngay</button>
                <button className="btn btn-outline" type="button" onClick={() => setReviewFor(null)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
