import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api, resolveImageUrl } from '../api';
import { useAuth } from '../context/AuthContext';
import { categoryIcon, formatVND, formatDate, CATEGORY_PLACEHOLDERS } from '../components/MachineCard';
import MachineMap from '../components/MachineMap';
import VisualAvailabilityCalendar from '../components/VisualAvailabilityCalendar';

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

  const [selectedAddons, setSelectedAddons] = useState([]);
  const [showNegotiateModal, setShowNegotiateModal] = useState(false);
  const [negotiateForm, setNegotiateForm] = useState({ targetPrice: '', note: '' });

  async function executeFinalBooking(pm, ps, isNeg = false, customPrice = 0) {
    setSubmittingBooking(true);
    setErr(''); setOk('');
    try {
      await api.post('/bookings', {
        machine_id: id,
        ...form,
        payment_method: pm || paymentMethod,
        payment_status: ps || 'completed',
        selected_addons: selectedAddons,
        discount_amount: totalDiscount,
        is_negotiated: isNeg,
        negotiated_price: customPrice,
        custom_total_price: customPrice > 0 ? customPrice : undefined,
      });
      setShowPaymentModal(false);
      setShowNegotiateModal(false);
      setOk('🎉 Đã gửi đơn đặt lịch & đề xuất giá thành công! Vui lòng chờ chủ máy phản hồi.');
      alert('🎉 Đặt máy thành công! Đơn hàng của bạn đã được chuyển tới Chủ máy.');
      setForm({ start_date: '', end_date: '', note: '' });
      setSelectedAddons([]);
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

  const baseRental = numDays * (machine.price_per_day || 0);
  let addonsTotal = 0;
  selectedAddons.forEach((a) => {
    addonsTotal += (a.price || 0) * numDays;
  });

  let longTermDiscount = 0;
  if (numDays >= (machine.min_days_for_discount || 3) && machine.discount_long_term > 0) {
    longTermDiscount = Math.round(baseRental * (machine.discount_long_term / 100));
  }

  let comboDiscount = 0;
  if (selectedAddons.length >= 2 && machine.discount_combo > 0) {
    comboDiscount = Math.round(addonsTotal * (machine.discount_combo / 100));
  }

  const totalDiscount = longTermDiscount + comboDiscount;

  const fallbackImg = CATEGORY_PLACEHOLDERS[cat.slug] || 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=1600&auto=format&fit=crop&q=80';
  const isUnsplashDefault = machine.image_url && machine.image_url.includes('unsplash.com');
  const detailImgSrc = (!machine.image_url || isUnsplashDefault) ? fallbackImg : resolveImageUrl(machine.image_url);

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
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <Link to={`/owner-profile/${owner._id}`} title="Xem hồ sơ tất cả máy của chủ sở hữu này" style={{ width: 52, height: 52, borderRadius: '50%', overflow: 'hidden', background: 'var(--green-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: owner.is_premium ? '2px solid var(--gold)' : '1px solid var(--green-mid)', flexShrink: 0, cursor: 'pointer' }}>
                    {owner.avatar_url ? (
                      <img src={resolveImageUrl(owner.avatar_url)} alt={owner.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/52?text=U'; }} />
                    ) : (
                      <span style={{ fontSize: 26 }}>👤</span>
                    )}
                  </Link>
                  <div>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>
                      <Link to={`/owner-profile/${owner._id}`} style={{ color: 'var(--green-deep)', textDecoration: 'none' }}>
                        {owner.full_name}
                      </Link>
                      {owner.is_premium && <span style={{ color: 'var(--gold-dark)', fontSize: 13, marginLeft: 6 }}>⭐ Partner</span>}
                    </p>
                    <p className="small" style={{ margin: '2px 0 0' }}>📍 {owner.district || 'Chưa cập nhật'} · 📞 {owner.phone || 'Ẩn'}</p>
                  </div>
                </div>
                <div style={{ marginTop: 12 }}>
                  <Link to={`/owner-profile/${owner._id}`} className="btn btn-outline btn-sm" style={{ width: '100%', textAlign: 'center' }}>
                    🚜 Xem tất cả máy đang đăng của chủ này →
                  </Link>
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
          <div className="price-big">
            {machine.price_max > machine.price_per_day ? (
              <div>
                <span style={{ fontSize: 13, color: 'var(--muted)', display: 'block', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 'normal' }}>Khoảng giá ước lượng:</span>
                <span style={{ fontSize: 20, color: 'var(--green-deep)' }}>{formatVND(machine.price_per_day)} ~ {formatVND(machine.price_max)}</span>
                <span className="small"> / {machine.price_unit}</span>
              </div>
            ) : (
              <div>
                {formatVND(machine.price_per_day)} <span className="small">/ {machine.price_unit}</span>
              </div>
            )}
          </div>

          {machine.allow_negotiation && (
            <button
              type="button"
              className="btn btn-outline btn-block"
              style={{ marginTop: 10, borderColor: 'var(--gold)', color: 'var(--gold-dark)', fontWeight: 'bold', background: '#FFFDF5' }}
              onClick={() => setShowNegotiateModal(true)}
            >
              💬 Thương Lượng / Đàm Phán Giá Trực Tiếp
            </button>
          )}

          <hr style={{ border: 'none', borderTop: '1px solid var(--line)', margin: '16px 0' }} />

          {/* Lịch Rảnh / Bận Trực Quan Dạng Chấm Xanh Đỏ */}
          <div style={{ marginBottom: 16 }}>
            <VisualAvailabilityCalendar machine={machine} />
          </div>

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

              {/* Dịch vụ Microservices bổ trợ tùy chọn */}
              {machine.addons && machine.addons.length > 0 && (
                <div className="field" style={{ background: '#F8FAFC', padding: 12, borderRadius: 10, border: '1px solid var(--line)' }}>
                  <label style={{ fontWeight: 'bold', color: 'var(--green-deep)', marginBottom: 8, display: 'block' }}>
                    🛠️ Dịch Vụ Bổ Trợ Microservices Đi Kèm (Tùy chọn):
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {machine.addons.map((addon, idx) => {
                      const isChecked = selectedAddons.some(a => a.name === addon.name);
                      return (
                        <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, cursor: 'pointer', background: isChecked ? '#FFFDF5' : '#fff', padding: '6px 10px', borderRadius: 6, border: isChecked ? '1px solid var(--gold)' : '1px solid var(--line)' }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedAddons([...selectedAddons, addon]);
                              } else {
                                setSelectedAddons(selectedAddons.filter(a => a.name !== addon.name));
                              }
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <b>{addon.name}</b>
                            <div style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>
                              +{formatVND(addon.price)} / {addon.unit} {addon.description && `(${addon.description})`}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Ưu đãi giảm giá tự động Smart Discounts */}
              {(longTermDiscount > 0 || comboDiscount > 0) && (
                <div style={{ background: '#ECFDF5', border: '1px solid #10B981', padding: 10, borderRadius: 8, margin: '12px 0', fontSize: 12, color: '#065F46' }}>
                  <b style={{ display: 'block', marginBottom: 4 }}>🎉 Bạn Được Tự Động Áp Dụng Ưu Đãi Giảm Giá:</b>
                  {longTermDiscount > 0 && (
                    <div>• 🎁 Thuê dài hạn ({machine.discount_long_term}%): -{formatVND(longTermDiscount)}</div>
                  )}
                  {comboDiscount > 0 && (
                    <div>• ⚡ Combo Microservice ({machine.discount_combo}%): -{formatVND(comboDiscount)}</div>
                  )}
                </div>
              )}

              {/* Lựa chọn Phương Thức Thanh Toán Demo */}
              <div className="field">
                <label style={{ fontWeight: 'bold', marginBottom: 8, display: 'block' }}>💳 Chọn phương thức thanh toán</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <label
                    className="payment-option-label"
                    style={{
                      border: paymentMethod === 'qr' ? '2px solid var(--gold)' : '1px solid var(--line)',
                      background: paymentMethod === 'qr' ? '#FFFDF5' : '#ffffff',
                      boxShadow: paymentMethod === 'qr' ? '0 2px 8px rgba(232,172,31,0.15)' : 'none',
                    }}
                  >
                    <input type="radio" name="pm" value="qr" checked={paymentMethod === 'qr'} onChange={() => setPaymentMethod('qr')} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '700', fontSize: 13.5, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>🏦</span> VietQR Chuyển khoản Ngân hàng
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--gold-dark)', fontWeight: '600', marginTop: 2 }}>
                        ⚡ Khuyên dùng · Quét mã tức thì
                      </div>
                    </div>
                  </label>

                  <label
                    className="payment-option-label"
                    style={{
                      border: paymentMethod === 'ewallet' ? '2px solid var(--gold)' : '1px solid var(--line)',
                      background: paymentMethod === 'ewallet' ? '#FFFDF5' : '#ffffff',
                      boxShadow: paymentMethod === 'ewallet' ? '0 2px 8px rgba(232,172,31,0.15)' : 'none',
                    }}
                  >
                    <input type="radio" name="pm" value="ewallet" checked={paymentMethod === 'ewallet'} onChange={() => setPaymentMethod('ewallet')} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '700', fontSize: 13.5, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>📲</span> Ví điện tử (Momo / ZaloPay)
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--ink-soft)', marginTop: 2 }}>
                        Thanh toán tự động qua App
                      </div>
                    </div>
                  </label>

                  <label
                    className="payment-option-label"
                    style={{
                      border: paymentMethod === 'cash' ? '2px solid var(--gold)' : '1px solid var(--line)',
                      background: paymentMethod === 'cash' ? '#FFFDF5' : '#ffffff',
                      boxShadow: paymentMethod === 'cash' ? '0 2px 8px rgba(232,172,31,0.15)' : 'none',
                    }}
                  >
                    <input type="radio" name="pm" value="cash" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '700', fontSize: 13.5, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>💵</span> Tiền mặt khi nhận máy (COD)
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--ink-soft)', marginTop: 2 }}>
                        Thanh toán trực tiếp cho chủ máy
                      </div>
                    </div>
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

                  {/* Ảnh Mã QR Code Căn Giữa Hoàn Hảo & Kích Thước Chuẩn */}
                  <div className="qr-modal-container">
                    <img
                      src="/qr_code.jpg"
                      alt="Mã QR Thanh toán VietQR"
                      className="qr-modal-img"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/240?text=QR+Thanh+Toán+VietQR';
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
                  {numDays > 0 && (
                    <div style={{ background: '#FFFDF5', padding: 14, borderRadius: 12, border: '1px solid var(--gold)', margin: '14px 0', fontSize: 13 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span>Phí thuê máy ({numDays} ngày):</span>
                        <b>{formatVND(numDays * machine.price_per_day)}</b>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, color: '#059669' }}>
                        <span>🛡️ Tiền thế chân rủi ro (Lớp 2):</span>
                        <b>+500.000đ</b>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginBottom: 8, fontStyle: 'italic' }}>
                        * (Sẽ hoàn lại 100% ngay khi nghiệm thu trả máy không hỏng hóc)
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: '#B9840C' }}>
                        <span>⚡ Bảo hiểm chuyến thuê PJICO (1.5%):</span>
                        <b>+{formatVND(Math.round(numDays * machine.price_per_day * 0.015))}</b>
                      </div>
                      <div style={{ borderTop: '1px dashed var(--gold)', paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: '800', color: 'var(--green-deep)' }}>
                        <span>TỔNG CỌC & THANH TOÁN:</span>
                        <span>{formatVND((numDays * machine.price_per_day) + 500000 + Math.round(numDays * machine.price_per_day * 0.015))}</span>
                      </div>
                    </div>
                  )}
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

        {/* Modal Thương Lượng / Đàm Phán Giá Trực Tiếp */}
        {showNegotiateModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div style={{ background: '#fff', padding: 26, borderRadius: 20, maxWidth: 480, width: '100%', boxShadow: '0 12px 36px rgba(0,0,0,0.3)', border: '2px solid var(--gold)' }}>
              <div className="flex-between" style={{ marginBottom: 14 }}>
                <h3 style={{ margin: 0, color: 'var(--green-deep)' }}>💬 Đề Xuất Thương Lượng / Đàm Phán Giá Mùa Vụ</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowNegotiateModal(false)}>✖ Đóng</button>
              </div>
              <p className="small" style={{ color: 'var(--ink-soft)', marginBottom: 16 }}>
                Bà con có thể đề xuất mức giá thuê mong muốn cho diện tích ruộng hoặc địa hình đặc thù. Chủ máy <b>{owner?.full_name}</b> sẽ xem xét và phản hồi tức thì.
              </p>

              <div style={{ background: '#FFFDF5', padding: 12, borderRadius: 10, border: '1px solid var(--gold)', marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 'bold' }}>KHOẢNG GIÁ NIÊM YẾT ƯỚC LƯỢNG CỦA CHỦ MÁY:</div>
                <div style={{ fontSize: 18, color: 'var(--green-deep)', fontWeight: '800', marginTop: 2 }}>
                  {formatVND(machine.price_per_day)} {machine.price_max > machine.price_per_day ? `~ ${formatVND(machine.price_max)}` : ''} / {machine.price_unit}
                </div>
              </div>

              <div className="field" style={{ marginBottom: 12 }}>
                <label style={{ fontWeight: 'bold' }}>Mức giá mong muốn đề xuất (VNĐ / {machine.price_unit}):</label>
                <input
                  type="number"
                  required
                  placeholder="VD: 1200000"
                  value={negotiateForm.targetPrice}
                  onChange={(e) => setNegotiateForm({ ...negotiateForm, targetPrice: e.target.value })}
                />
              </div>

              <div className="field" style={{ marginBottom: 16 }}>
                <label style={{ fontWeight: 'bold' }}>Ghi chú đàm phán (Địa hình, diện tích ruộng...):</label>
                <textarea
                  rows={3}
                  placeholder="VD: Ruộng nhà tôi 5 công ở Thoại Sơn lầy nhẹ, gặt liên tục 2 ngày..."
                  value={negotiateForm.note}
                  onChange={(e) => setNegotiateForm({ ...negotiateForm, note: e.target.value })}
                />
              </div>

              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={() => {
                  if (!negotiateForm.targetPrice) {
                    alert('Vui lòng nhập mức giá đề xuất!');
                    return;
                  }
                  executeFinalBooking('cash', 'pending', true, Number(negotiateForm.targetPrice));
                }}
                disabled={submittingBooking}
              >
                {submittingBooking ? '⏳ Đang gửi đề xuất...' : '🚀 Gửi Đề Xuất Đàm Phán Ngay'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
