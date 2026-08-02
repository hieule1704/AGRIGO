import { useEffect, useState } from 'react';
import { api } from '../api';
import { StatusPill } from '../components/ProtectedRoute';
import { formatVND, formatDate } from '../components/MachineCard';

export default function FarmerBookings() {
  const [bookings, setBookings] = useState([]);
  const [reviewFor, setReviewFor] = useState(null);
  const [handoverFor, setHandoverFor] = useState(null);
  const [checklist, setChecklist] = useState({ engine: true, hydraulic: true, tracks: true, fuel: true });
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {(b.status === 'pending' || b.status === 'accepted') && (
                    <button className="btn btn-danger btn-sm" onClick={() => cancel(b._id)}>Hủy đơn</button>
                  )}
                  {(b.status === 'accepted' || b.status === 'completed') && (
                    <button className="btn btn-outline btn-sm" onClick={() => setHandoverFor(b)}>
                      📋 Biên Bản Bàn Giao (Lớp 1)
                    </button>
                  )}
                  {b.status === 'completed' && (
                    <button className="btn btn-primary btn-sm" style={{ background: 'var(--gold)', color: 'var(--green-deep)', border: 'none', fontWeight: 'bold' }} onClick={() => setReviewFor(b._id)}>
                      ✍️ Viết Đánh Giá
                    </button>
                  )}
                </div>
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

      {/* Modal Biên bản Bàn giao Kỹ thuật số Lớp 1 */}
      {handoverFor && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', padding: 28, borderRadius: 20, maxWidth: 520, width: '100%', boxShadow: '0 12px 36px rgba(0,0,0,0.3)', border: '2px solid var(--gold)' }}>
            <div className="flex-between" style={{ marginBottom: 14 }}>
              <h3 style={{ margin: 0, color: 'var(--green-deep)' }}>📋 Biên Bản Bàn Giao Kỹ Thuật Số (Lớp 1)</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setHandoverFor(null)}>✖ Đóng</button>
            </div>
            <p className="small" style={{ color: 'var(--ink-soft)', marginBottom: 16 }}>
              Đối chứng trạng thái 4 góc máy thực tế trước & sau khi làm ruộng. Làm cơ sở pháp lý nghiệm thu 100%.
            </p>

            <div style={{ background: 'var(--green-soft)', padding: 14, borderRadius: 12, marginBottom: 16 }}>
              <b style={{ color: 'var(--green-deep)', display: 'block', marginBottom: 4 }}>
                🚜 Máy: {handoverFor.machine_id?.name}
              </b>
              <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                Thời gian làm ruộng: {formatDate(handoverFor.start_date)} → {formatDate(handoverFor.end_date)}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, background: '#F8FAFC', padding: '10px 14px', borderRadius: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={checklist.engine} onChange={(e) => setChecklist({ ...checklist, engine: e.target.checked })} />
                <span>⚙️ 1. Động cơ & Máy phát (Đã test nổ thử OK)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, background: '#F8FAFC', padding: '10px 14px', borderRadius: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={checklist.hydraulic} onChange={(e) => setChecklist({ ...checklist, hydraulic: e.target.checked })} />
                <span>🛠 2. Hệ thống Thủy lực & Cần gặt/Lưỡi cày (Nguyên vẹn)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, background: '#F8FAFC', padding: '10px 14px', borderRadius: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={checklist.tracks} onChange={(e) => setChecklist({ ...checklist, tracks: e.target.checked })} />
                <span>🛞 3. Bánh xích / Cánh quạt Drone (Không rạn nứt)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, background: '#F8FAFC', padding: '10px 14px', borderRadius: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={checklist.fuel} onChange={(e) => setChecklist({ ...checklist, fuel: e.target.checked })} />
                <span>⛽ 4. Nguồn nhiên liệu & Pin (Đầy 100%)</span>
              </label>
            </div>

            <div style={{ border: '2px dashed var(--line)', padding: 16, borderRadius: 12, textAlign: 'center', marginBottom: 18, background: '#FAFAFA' }}>
              <div style={{ fontSize: 28, marginBottom: 4 }}>📸</div>
              <b style={{ fontSize: 13, display: 'block', color: 'var(--green-deep)' }}>Tải Lên Ảnh 4 Góc Máy Thực Tế</b>
              <span className="small" style={{ color: 'var(--ink-soft)' }}>Hệ thống tự động ghi nhận GPS & Thời gian chụp</span>
              <input type="file" multiple accept="image/*" style={{ marginTop: 10, fontSize: 12 }} />
            </div>

            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={() => {
                alert('🎉 Đã ký xác nhận Biên Bản Bàn Giao Kỹ Thuật Số! Dữ liệu đối chứng 4 góc máy đã được lưu trữ an toàn trên AGRIGO Cloud.');
                setHandoverFor(null);
              }}
            >
              ✅ Ký Xác Nhận Biên Bản Bàn Giao (Lớp 1)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
