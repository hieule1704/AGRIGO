import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { categoryIcon, formatVND, formatDate } from '../components/MachineCard';
import MachineMap from '../components/MachineMap';

export default function MachineDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [form, setForm] = useState({ start_date: '', end_date: '', note: '' });

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

  async function submitBooking(e) {
    e.preventDefault();
    setErr(''); setOk('');
    if (new Date(form.start_date) > new Date(form.end_date)) {
      setErr('Ngày kết thúc phải từ hoặc sau ngày bắt đầu.');
      return;
    }
    try {
      await api.post('/bookings', { machine_id: id, ...form });
      setOk('Đã gửi yêu cầu đặt lịch! Vui lòng chờ chủ máy xác nhận.');
      setForm({ start_date: '', end_date: '', note: '' });
      load();
    } catch (e) {
      setErr(e.message);
    }
  }

  if (err && !data) return <div className="container" style={{ padding: 60 }}><div className="alert alert-error">{err}</div></div>;
  if (!data) return <div className="container" style={{ padding: 60 }}>Đang tải...</div>;

  const { machine, owner, reviews } = data;
  const cat = machine.category_id || {};
  const numDays = calcDays(form.start_date, form.end_date);

  return (
    <div className="container" style={{ paddingTop: 26 }}>
      <div className="detail-grid">
        <div>
          <div className="detail-gallery">
            {machine.image_url ? <img src={machine.image_url} /> : categoryIcon(cat.slug)}
          </div>
          <div style={{ marginTop: 20 }}>
            <div className="cat">{cat.name}</div>
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

          <div className="card-box">
            <h3>Chủ máy</h3>
            {owner ? (
              <>
                <p><b>{owner.full_name}</b></p>
                <p className="small">📍 {owner.district || 'Chưa cập nhật'} · 📞 {owner.phone || 'Ẩn'}</p>
              </>
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
            <form onSubmit={submitBooking}>
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

              <div className="field">
                <label>Ghi chú cho chủ máy</label>
                <textarea placeholder="VD: 3 công ruộng, cần gặt buổi sáng"
                  value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
              </div>
              <button className="btn btn-primary btn-block" type="submit">Gửi yêu cầu đặt lịch</button>
              <p className="small" style={{ marginTop: 8 }}>* Hoa hồng nền tảng 5% áp dụng trên tổng giá trị đơn thuê.</p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
