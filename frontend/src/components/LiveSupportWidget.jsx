import { useState } from 'react';
import { useLocation } from 'react-router-dom';

const PRESET_FAQS = [
  {
    q: '🌾 Cách đặt lịch thuê máy gặt/máy cày?',
    a: 'Bà con chỉ cần truy cập trang "Tìm máy", chọn Huyện và Ngày cần thuê. Hệ thống sẽ tự động tính tổng tiền và gửi yêu cầu trực tiếp đến Chủ máy trong khu vực!',
  },
  {
    q: '👑 Làm sao nâng cấp Gói Chủ máy VIP?',
    a: 'Chủ máy truy cập vào Kênh Chủ Máy (/owner), bấm nút "Nâng cấp VIP Ngay (Demo 199.000đ)" để được ưu tiên đứng đầu danh sách tìm kiếm và mở khóa tính năng Phân tích thị trường.',
  },
  {
    q: '📞 Hotline tổng đài hỗ trợ An Giang?',
    a: 'Tổng đài chăm sóc khách hàng & hỗ trợ kỹ thuật mùa vụ AGRIGO An Giang: Hotline 1900 6868 (Nhánh 1 cho Nông dân, Nhánh 2 cho Chủ máy). Hoạt động 24/7!',
  },
];

export default function LiveSupportWidget() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: '👋 Xin chào! Tôi là Trợ lý CSKH AGRIGO An Giang (Bản thử nghiệm Beta). Rất vui được hỗ trợ bạn hôm nay!',
    },
  ]);
  const [input, setInput] = useState('');

  function handleSend(e) {
    e?.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);

    // Demo Beta auto-reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: `ℹ️ [Chế độ Demo Beta] Cảm ơn bạn đã gửi câu hỏi: "${userText}". Đội ngũ kỹ thuật viên AGRIGO khu vực An Giang đã tiếp nhận và sẽ phản hồi sớm nhất qua Hotline. Trân trọng!`,
        },
      ]);
    }, 600);
  }

  function handleFaqClick(faq) {
    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: faq.q },
      { sender: 'bot', text: faq.a },
    ]);
  }

  // Hide live support widget on Admin dashboard routes (/admin)
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      {/* Floating Trigger Button at Bottom-Right */}
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
        }}
      >
        {!open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            style={{
              background: 'linear-gradient(135deg, var(--green-deep), var(--green-mid))',
              color: '#fff',
              border: '2px solid var(--gold)',
              borderRadius: '999px',
              padding: '12px 20px',
              fontWeight: '800',
              fontSize: 14,
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(21, 58, 46, 0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'transform 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#4CAF50', display: 'inline-block', boxShadow: '0 0 8px #4CAF50' }}></span>
            💬 Hỗ trợ 24/7
          </button>
        )}
      </div>

      {/* Floating Chat Modal / Drawer */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 360,
            maxWidth: '90vw',
            height: 480,
            background: '#ffffff',
            borderRadius: 18,
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.25)',
            border: '2px solid var(--gold)',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'slideUp 0.25s ease-out',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, var(--green-deep), var(--green-mid))',
              color: '#fff',
              padding: '14px 18px',
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div>
              <div style={{ fontWeight: '800', fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4CAF50' }}></span>
                💬 Trung Tâm Hỗ Trợ AGRIGO
              </div>
              <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>Trực tuyến 24/7 · Chế độ Demo Beta</div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: 18,
                cursor: 'pointer',
                opacity: 0.8,
              }}
            >
              ✖
            </button>
          </div>

          {/* Messages Area */}
          <div
            style={{
              flex: 1,
              padding: 14,
              overflowY: 'auto',
              background: '#FBF8F1',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  background: m.sender === 'user' ? 'var(--green-mid)' : '#ffffff',
                  color: m.sender === 'user' ? '#ffffff' : 'var(--ink)',
                  padding: '10px 14px',
                  borderRadius: m.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  fontSize: 13,
                  lineHeight: 1.5,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                  border: m.sender === 'user' ? 'none' : '1px solid var(--line)',
                }}
              >
                {m.text}
              </div>
            ))}

            {/* Quick FAQs Suggestions */}
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 11, fontWeight: '700', color: 'var(--ink-soft)', marginBottom: 6 }}>
                💡 Câu hỏi phổ biến:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {PRESET_FAQS.map((f, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleFaqClick(f)}
                    style={{
                      textAlign: 'left',
                      background: '#ffffff',
                      border: '1px solid var(--line)',
                      borderRadius: 8,
                      padding: '7px 10px',
                      fontSize: 12,
                      color: 'var(--green-deep)',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                  >
                    {f.q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSend}
            style={{
              padding: 10,
              background: '#ffffff',
              borderTop: '1px solid var(--line)',
              display: 'flex',
              gap: 8,
            }}
          >
            <input
              type="text"
              placeholder="Nhập câu hỏi hỗ trợ..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 999,
                border: '1px solid var(--line)',
                fontSize: 13,
                outline: 'none',
              }}
            />
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              style={{ padding: '8px 14px', borderRadius: 999 }}
            >
              Gửi
            </button>
          </form>
        </div>
      )}
    </>
  );
}
