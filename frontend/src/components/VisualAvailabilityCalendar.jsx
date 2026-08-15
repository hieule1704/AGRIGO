import { useState } from 'react';

export default function VisualAvailabilityCalendar({ machine, interactive = false, onToggleDate }) {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const bookedDates = new Set((machine?.schedule || []).filter(s => s.status === 'booked').map(s => s.date));
  const blockedDates = new Set((machine?.schedule || []).filter(s => s.status === 'blocked').map(s => s.date));

  const startDate = machine?.available_start_date ? new Date(machine.available_start_date) : null;
  const endDate = machine?.available_end_date ? new Date(machine.available_end_date) : null;

  function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  function getFirstDayOfWeek(year, month) {
    return new Date(year, month, 1).getDay();
  }

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfWeek(currentYear, currentMonth);

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  function handlePrevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  }

  function handleNextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  }

  return (
    <div className="card-box" style={{ padding: 18, background: '#ffffff', borderRadius: 16, border: '1px solid var(--line)', boxShadow: 'var(--shadow-card)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <b style={{ fontSize: 15, color: 'var(--green-deep)', display: 'flex', alignItems: 'center', gap: 6 }}>
          📅 Lịch Rảnh & Bận Phục Vụ Mùa Vụ
        </b>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button type="button" className="btn btn-outline btn-sm" onClick={handlePrevMonth} style={{ padding: '2px 8px' }}>❮</button>
          <span style={{ fontWeight: 800, fontSize: 13.5 }}>{monthNames[currentMonth]} {currentYear}</span>
          <button type="button" className="btn btn-outline btn-sm" onClick={handleNextMonth} style={{ padding: '2px 8px' }}>❯</button>
        </div>
      </div>

      {/* Dynamic Legend */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 12, marginBottom: 12, padding: '7px 12px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: '600', color: '#065F46' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span>
          Rảnh (Sẵn sàng)
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: '600', color: '#991B1B' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444', display: 'inline-block' }}></span>
          Đã có khách thuê
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: '600', color: '#64748B' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#94A3B8', display: 'inline-block' }}></span>
          Khóa / Ngoài mùa
        </span>
      </div>

      {/* Days Grid Header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, textAlign: 'center', fontSize: 11, fontWeight: '800', color: 'var(--ink-soft)', marginBottom: 6 }}>
        <div>CN</div><div>T2</div><div>T3</div><div>T4</div><div>T5</div><div>T6</div><div>T7</div>
      </div>

      {/* Days Grid Body */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} style={{ height: 32 }} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const monthStr = String(currentMonth + 1).padStart(2, '0');
          const dayStr = String(dayNum).padStart(2, '0');
          const dateISO = `${currentYear}-${monthStr}-${dayStr}`;
          const thisDate = new Date(dateISO);

          let status = 'available'; // Default 🟢
          if (bookedDates.has(dateISO)) {
            status = 'booked'; // 🔴
          } else if (blockedDates.has(dateISO)) {
            status = 'blocked'; // ⚪
          } else if (startDate && thisDate < startDate) {
            status = 'out_of_season'; // ⚪
          } else if (endDate && thisDate > endDate) {
            status = 'out_of_season'; // ⚪
          }

          let bg = '#D1FAE5';
          let border = '1px solid #10B981';
          let textColor = '#065F46';

          if (status === 'booked') {
            bg = '#FEE2E2'; border = '1px solid #EF4444'; textColor = '#991B1B';
          } else if (status === 'blocked' || status === 'out_of_season') {
            bg = '#F1F5F9'; border = '1px solid #CBD5E1'; textColor = '#64748B';
          }

          return (
            <div
              key={dateISO}
              onClick={() => interactive && onToggleDate && onToggleDate(dateISO, status)}
              style={{
                height: 34,
                borderRadius: 8,
                background: bg,
                border: border,
                color: textColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 'bold',
                cursor: interactive ? 'pointer' : 'default',
                transition: 'transform 0.1s',
                position: 'relative',
              }}
              title={`${dateISO}: ${status === 'booked' ? 'Đã có khách thuê' : status === 'blocked' ? 'Chủ máy khóa' : status === 'out_of_season' ? 'Ngoài khoảng rảnh mùa vụ' : '🟢 Sẵn sàng phục vụ'}`}
            >
              {dayNum}
              <span
                style={{
                  position: 'absolute',
                  bottom: 2,
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: status === 'booked' ? '#EF4444' : status === 'available' ? '#10B981' : '#94A3B8',
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
