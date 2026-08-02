import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { categoryIcon, formatVND, formatDate, CATEGORY_PLACEHOLDERS } from '../components/MachineCard';
import MachineMap from '../components/MachineMap';

export default function MachineDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [form, setForm] = useState({ start_date: '', end_date: '', note: '' });
  const [paymentMethod, setPaymentMethod] = useState('qr'); // 'qr' | 'ewallet' | 'cash'
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [submittingBooking, setSubmittingBooking] = useState(false);

  function load() {
    api.get(`/machines/${id}`).then(setData).catch((e) => setErr(e.message));
  }
  useEffect(load, [id]);

  function calcDays(start, end) {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return 0;
    const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 0;
  }

  function handleInitiateBooking(e) {
    e.preventDefault();
    setErr(''); setOk('');
    if (new Date(form.start_date) > new Date(form.end_date)) {
      setErr('Ngày kết thúc phải từ hoặc sau ngày bắt đầu.');
      return;
    }
    if (paymentMethod === 'cash') {
      executeFinalBooking('cash', 'pending');
    } else {
      setShowPaymentModal(true);
    }
  }

  async function executeFinalBooking(pm, ps) {
    setSubmittingBooking(true);
    setErr(''); setOk('');
    try {
      await api.post('/bookings', {
        machine_id: id,
        ...form,
        payment_method: pm || paymentMethod,
        payment_status: ps || 'completed',
      });
      setShowPaymentModal(false);
      setOk('🎉 Đã gửi đơn đặt lịch & xác nhận thanh toán thành công! Vui lòng chờ chủ máy bàn giao phương tiện.');
      alert('🎉 Đặt máy thành công! Đơn hàng của bạn đã được chuyển tới Chủ máy.');
      setForm({ start_date: '', end_date: '', note: '' });
      load();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSubmittingBooking(false);
    }
  }

  if (err && !data) return <div className="container" style={{ padding: 60 }}><div className="alert alert-error">{err}</div></div>;
  if (!data) return <div className="container" style={{ padding: 60 }}>Đang tải...</div>;

  const { machine, owner, reviews } = data;
  const cat = machine.category_id || {};
  const numDays = calcDays(form.start_date, form.end_date);

  const fallbackImg = CATEGORY_PLACEHOLDERS[cat.slug] || 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=1600&auto=format&fit=crop&q=80';
  const isUnsplashDefault = machine.image_url && machine.image_url.includes('unsplash.com');
  const detailImgSrc = (!machine.image_url || isUnsplashDefault) ? fallbackImg : machine.image_url;

  return (
    <div className="container" style={{ paddingTop: 26 }}>
      <div className="detail-grid">
        <div>
          {/* 
            📸 [HƯỚNG DẪN CHỌN ẢNH DETAIL GALLERY (.detail-gallery)]:
            - Tỉ lệ khung hình: 16:9 (khuyến nghị kích thước ~1600x900px cho màn Retina 2x).
            - Định dạng: WebP / JPEG (nén dung lượng 150-300KB qua Squoosh.app).
            - Ghi chú: Ảnh chụp thực tế rõ nét nhất của máy nông nghiệp đang phục vụ ruộng lúa.
          */}
          <div className="detail-gallery">
            <img
              src={detailImgSrc}
              alt={machine.name}
              onError={(e) => { e.target.onerror = null; e.target.src = fallbackImg; }}
            />
          </div>
          <div style={{ marginTop: 20 }}>
            <div className="cat">{categoryIcon(cat.slug)} {cat.name}</div>
            <h1 style={{ fontSize: 26, margin: '6px 0' }}>{machine.name}</h1>
            <div className="loc">📍 {machine.district}{machine.address_detail ? ' · ' + machine.address_detail : ''}</div>
            <div className="rating" style={{ marginTop: 8 }}>
              {machine.rating_count > 0
                ? <><span className="star">★</span> {Number(machine.rating_avg).toFixed(1)} / 5 · {machine.rating_count} đánh giá</>
                : 'Chưa có đánh giá'}
            </div>
          </div>

          <div className="card-box" style={{ marginTop: 20 }}>
            <h3>Mô tả</h3>
            <p>{machine.description || 'Chủ máy chưa cập nhật mô tả chi tiết.'}</p>
            <div className="spec-grid">
              <div className="spec-item"><div className="k">Loại máy</div><div className="v">{cat.name}</div></div>
              <div className="spec-item"><div className="k">Thương hiệu</div><div className="v">{machine.brand || 'Không rõ'}</div></div>
              <div className="spec-item"><div className="k">Đời máy</div><div className="v">{machine.year_made || '—'}</div></div>
              <div className="spec-item"><div className="k">Khu vực</div><div className="v">{machine.district}</div></div>
            </div>
          </div>

          {machine.lat && machine.lng && (
            <div className="card-box" style={{ marginTop: 20 }}>
              <h3>🗺 Vị trí máy trên bản đồ</h3>
              <p className="small" style={{ marginBottom: 12 }}>📍 {machine.district} {machine.address_detail ? `(${machine.address_detail})` : ''} · Tọa độ: {machine.lat}, {machine.lng}</p>
              <MachineMap machines={[machine]} center={[machine.lat, machine.lng]} zoom={13} height="280px" />
            </div>
          )}

          {/* 
            📸 [HƯỚNG DẪN CHỌN ẢNH AVATAR CHỦ MÁY / USER]:
            - Tỉ lệ: 1:1 vuông (~200x200px), hiển thị crop tròn.
            - Định dạng: WebP / PNG / JPEG (<50KB).
          */}
          <div className="card-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h3 style={{ margin: 0 }}>Thông tin Chủ máy</h3>
              {owner?.is_premium && (
                <span className="badge badge-gold" style={{ fontSize: 12, padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  👑 Đối tác đáng tin cậy (VIP)
                </span>
              )}
            </div>
            {owner ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', overflow: 'hidden', background: 'var(--green-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: owner.is_premium ? '2px solid var(--gold)' : '1px solid var(--green-mid)', flexShrink: 0 }}>
                  {owner.avatar_url ? (
                    <img src={owner.avatar_url} alt={owner.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/52?text=U'; }} />
                  ) : (
                    <span style={{ fontSize: 26 }}>👤</span>
                  )}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>
                    {owner.full_name} {owner.is_premium && <span style={{ color: 'var(--gold-dark)', fontSize: 13 }}>⭐ Partner</span>}
                  </p>
                  <p className="small" style={{ margin: '2px 0 0' }}>📍 {owner.district || 'Chưa cập nhật'} · 📞 {owner.phone || 'Ẩn'}</p>
                </div>
              </div>
            ) : <p className="small">Không có thông tin chủ máy.</p>}
          </div>

          <div className="card-box">
            <h3>Đánh giá từ nông dân</h3>
            {reviews.length === 0 && <p className="small">Chưa có đánh giá nào cho máy này.</p>}
            {reviews.map((r) => (
              <div key={r._id} style={{ borderBottom: '1px solid var(--line)', padding: '12px 0' }}>
                <div className="flex-between">
                  <b>{r.farmer_id?.full_name}</b>
                  <span className="rating"><span className="star">★</span> {r.rating}/5</span>
                </div>
                <p className="small" style={{ margin: '6px 0 0' }}>{r.comment}</p>
                <p className="small" style={{ opacity: .7 }}>{formatDate(r.created_at)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="booking-box">
          <div className="price-big">{formatVND(machine.price_per_day)} <span className="small">/ {machine.price_unit}</span></div>
          <hr style={{ border: 'none', borderTop: '1px solid var(--line)', margin: '16px 0' }} />

          {machine.schedule && machine.schedule.filter((s) => s.status === 'booked' || s.status === 'blocked').length > 0 && (
            <div style={{ marginBottom: 16, background: 'var(--bg-light)', padding: 12, borderRadius: 8, fontSize: 13 }}>
              <b style={{ color: 'var(--green-deep)' }}>📅 Lịch bận đã có của máy:</b>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                {machine.schedule
                  .filter((s) => s.status === 'booked' || s.status === 'blocked')
                  .map((s, idx) => (
                    <span key={idx} style={{ background: s.status === 'blocked' ? '#718096' : 'var(--danger)', color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>
                      {s.date} {s.status === 'blocked' ? '(Khóa)' : '(Đã đặt)'}
                    </span>
                  ))}
              </div>
            </div>
          )}

          {err && <div className="alert alert-error">{err}</div>}
          {ok && <div className="alert alert-success">{ok}</div>}

          {!user && (
            <button className="btn btn-primary btn-block" onClick={() => navigate('/login')}>Đăng nhập để đặt lịch</button>
          )}
          {user && user.role !== 'farmer' && (
            <p className="small">Chỉ tài khoản Nông dân mới có thể đặt lịch thuê máy.</p>
          )}
          {user && user.role === 'farmer' && (
            <form onSubmit={handleInitiateBooking}>
              <div className="field">
                <label>Ngày bắt đầu</label>
                <input type="date" required min={new Date().toISOString().slice(0, 10)}
                  value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
              </div>
              <div className="field">
                <label>Ngày kết thúc</label>
                <input type="date" required min={new Date().toISOString().slice(0, 10)}
                  value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
              </div>

              {numDays > 0 && (
                <div style={{ margin: '14px 0', padding: 12, background: 'var(--bg-light)', borderRadius: 8, border: '1px dashed var(--green-mid)' }}>
                  <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 'bold' }}>TẠM TÍNH TỔNG TIỀN:</div>
                  <div style={{ fontSize: 16, color: 'var(--green-deep)', fontWeight: 'bold', marginTop: 4 }}>
                    {numDays} ngày × {formatVND(machine.price_per_day)} = {formatVND(numDays * machine.price_per_day)}
                  </div>
                </div>
              )}

              {/* Lựa chọn Phương Thức Thanh Toán Demo */}
              <div className="field">
                <label style={{ fontWeight: 'bold', marginBottom: 8, display: 'block' }}>💳 Chọn phương thức thanh toán</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', border: paymentMethod === 'qr' ? '2px solid var(--gold)' : '1px solid var(--line)', borderRadius: 8, cursor: 'pointer', background: paymentMethod === 'qr' ? '#FFFDF5' : '#fff' }}>
                    <input type="radio" name="pm" value="qr" checked={paymentMethod === 'qr'} onChange={() => setPaymentMethod('qr')} />
                    <span><b>🏦 VietQR Chuyển khoản Ngân hàng</b> (Khuyên dùng)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', border: paymentMethod === 'ewallet' ? '2px solid var(--gold)' : '1px solid var(--line)', borderRadius: 8, cursor: 'pointer', background: paymentMethod === 'ewallet' ? '#FFFDF5' : '#fff' }}>
                    <input type="radio" name="pm" value="ewallet" checked={paymentMethod === 'ewallet'} onChange={() => setPaymentMethod('ewallet')} />
                    <span><b>📲 Ví điện tử (Momo / ZaloPay)</b></span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', border: paymentMethod === 'cash' ? '2px solid var(--gold)' : '1px solid var(--line)', borderRadius: 8, cursor: 'pointer', background: paymentMethod === 'cash' ? '#FFFDF5' : '#fff' }}>
                    <input type="radio" name="pm" value="cash" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} />
                    <span><b>💵 Tiền mặt khi nhận bàn giao máy (COD)</b></span>
                  </label>
                </div>
              </div>

              <div className="field">
                <label>Ghi chú cho chủ máy</label>
                <textarea placeholder="VD: 3 công ruộng, cần gặt buổi sáng"
                  value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
              </div>

              <button className="btn btn-primary btn-block" type="submit" disabled={submittingBooking}>
                {submittingBooking ? '⏳ Đang gửi đơn...' : '🚀 Xác nhận & Đặt máy'}
              </button>
              <p className="small" style={{ marginTop: 8 }}>* Hoa hồng nền tảng 5% áp dụng trên tổng giá trị đơn thuê.</p>
            </form>
          )}
        </div>

        {/* Modal Thanh toán Mã QR VietQR hoặc Ví điện tử */}
        {showPaymentModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div style={{ background: '#fff', padding: 24, borderRadius: 20, maxWidth: 460, width: '100%', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: '2px solid var(--gold)', animation: 'slideDown 0.25s ease-out' }}>
              <div className="flex-between" style={{ marginBottom: 14 }}>
                <b style={{ fontSize: 16, color: 'var(--green-deep)' }}>
                  {paymentMethod === 'qr' ? '🏦 Thanh Toán Mã QR Ngân Hàng VietQR' : '📲 Thanh Toán Qua Ví Điện Tử'}
                </b>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowPaymentModal(false)}>✖ Đóng</button>
              </div>

              {paymentMethod === 'qr' ? (
                <div>
                  <p className="small" style={{ margin: '0 0 10px', color: 'var(--ink-soft)' }}>
                    Mở ứng dụng Ngân hàng (MBBank, Vietcombank, Techcombank...) quét mã QR dưới đây để hoàn tất đơn hàng.
                  </p>

                  <div style={{ background: '#FFFDF5', padding: 12, borderRadius: 12, border: '1px solid var(--gold)', marginBottom: 12 }}>
                    <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 'bold' }}>TỔNG SỐ TIỀN CẦN THANH TOÁN:</div>
                    <div style={{ fontSize: 22, color: 'var(--green-deep)', fontWeight: '800', marginTop: 2 }}>
                      {formatVND(numDays * machine.price_per_day)}
                    </div>
                  </div>

                  {/* Ảnh Mã QR Code từ Thư Mục Public (/qr_code.jpg) */}
                  <div style={{ textAlign: 'center', margin: '14px 0' }}>
                    <img
                      src="/qr_code.jpg"
                      alt="Mã QR Thanh toán VietQR"
                      style={{
                        width: 220,
                        height: 220,
                        objectFit: 'contain',
                        borderRadius: 12,
                        border: '2px solid var(--gold)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/220?text=QR+Thanh+Toán+VietQR';
                      }}
                    />
                  </div>

                  <p className="small" style={{ fontSize: 11.5, opacity: 0.8, marginBottom: 16 }}>
                    📌 Nội dung chuyển khoản tự động: <b>AGRIGO {user?.phone || 'NHANH'}</b>
                  </p>

                  <button
                    type="button"
                    className="btn btn-primary btn-block"
                    onClick={() => executeFinalBooking('qr', 'completed')}
                    disabled={submittingBooking}
                    style={{ padding: '12px', fontSize: 15 }}
                  >
                    {submittingBooking ? '⏳ Đang xác nhận...' : '✅ Tôi đã quét mã chuyển khoản thành công'}
                  </button>
                </div>
              ) : (
                <div>
                  <p className="small" style={{ margin: '0 0 16px', color: 'var(--ink-soft)' }}>
                    Ví điện tử Momo / ZaloPay đang kết nối sẵn sàng cho đơn đặt máy.
                  </p>
                  <div style={{ background: '#FFFDF5', padding: 14, borderRadius: 12, border: '1px solid var(--gold)', marginBottom: 16 }}>
                    <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 'bold' }}>TỔNG THANH TOÁN QUA VÍ:</div>
                    <div style={{ fontSize: 22, color: 'var(--green-deep)', fontWeight: '800', marginTop: 2 }}>
                      {formatVND(numDays * machine.price_per_day)}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-block"
                    onClick={() => executeFinalBooking('ewallet', 'completed')}
                    disabled={submittingBooking}
                    style={{ padding: '12px', fontSize: 15 }}
                  >
                    {submittingBooking ? '⏳ Đang xác nhận...' : '⚡ Xác nhận thanh toán qua Ví điện tử'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
