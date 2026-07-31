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
        <thead><tr><th>Máy</th><th>Khu vực</th><th>Ngày thuê</th><th>Tổng tiền</th><th>Trạng thái</th><th></th></tr></thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b._id}>
              <td>{b.machine_id?.name}</td>
              <td>{b.machine_id?.district}</td>
              <td>{formatDate(b.start_date)} → {formatDate(b.end_date)} ({b.days} ngày)</td>
              <td>{formatVND(b.total_price)}</td>
              <td><StatusPill status={b.status} /></td>
              <td>
                {b.status === 'pending' && <button className="btn btn-danger btn-sm" onClick={() => cancel(b._id)}>Hủy đơn</button>}
                {b.status === 'completed' && <button className="btn btn-outline btn-sm" onClick={() => setReviewFor(b._id)}>Đánh giá</button>}
              </td>
            </tr>
          ))}
          {bookings.length === 0 && <tr><td colSpan={6} className="small" style={{ padding: 20 }}>Bạn chưa có đơn đặt lịch nào. <a href="/search">Tìm máy ngay →</a></td></tr>}
        </tbody>
      </table>

      {reviewFor && (
        <div className="card-box" style={{ marginTop: 24, maxWidth: 420 }}>
          <h3>Đánh giá máy đã thuê</h3>
          {err && <div className="alert alert-error">{err}</div>}
          <form onSubmit={submitReview}>
            <div className="field">
              <label>Số sao (1-5)</label>
              <input type="number" min={1} max={5} required value={reviewForm.rating}
                onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })} />
            </div>
            <div className="field">
              <label>Nhận xét</label>
              <textarea value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" type="submit">Gửi đánh giá</button>
              <button className="btn btn-outline" type="button" onClick={() => setReviewFor(null)}>Hủy</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
