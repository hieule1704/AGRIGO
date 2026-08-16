import { useState, useRef, useEffect } from 'react';
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
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: '👋 Xin chào bà con & quý khách! Tôi là Trợ lý CSKH AGRIGO An Giang (Bản thử nghiệm Beta). Bạn cần hỗ trợ gì hôm nay?',
    },
  ]);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

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
          text: `ℹ️ [Chế độ Demo Beta] Cảm ơn bạn đã gửi câu hỏi: "${userText}". Đội ngũ kỹ thuật viên AGRIGO khu vực An Giang đã tiếp nhận và sẽ phản hồi sớm nhất qua Hotline 1900 6868. Trân trọng!`,
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
      <div className="chat-trigger-wrapper">
        {!open && (
          <button
            type="button"
            className="chat-trigger-btn"
            onClick={() => setOpen(true)}
            aria-label="Mở cửa sổ hỗ trợ trực tuyến"
          >
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22C55E', display: 'inline-block', boxShadow: '0 0 8px #22C55E' }}></span>
            <span>💬 Hỗ trợ 24/7</span>
          </button>
        )}
      </div>

      {/* Floating Chat Modal / Drawer */}
      {open && (
        <div className="chat-widget-window">
          {/* Header */}
          <div className="chat-widget-header">
            <div className="chat-header-info">
              <div className="chat-header-title">
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 6px #22C55E' }}></span>
                💬 Hỗ Trợ AGRIGO An Giang
              </div>
              <div className="chat-header-status">
                <span>● Trực tuyến 24/7</span> · <span>Bản Demo Beta</span>
              </div>
            </div>

            <div className="chat-header-actions">
              {/* Nút Đóng (✕) Siêu Tương Phản - Nền Trắng Sáng / Viền Rõ / Hover Đỏ Rõ Ràng */}
              <button
                type="button"
                className="chat-action-close-btn"
                onClick={() => setOpen(false)}
                title="Đóng cửa sổ hỗ trợ"
                aria-label="Đóng cửa sổ hỗ trợ"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div
            style={{
              flex: 1,
              padding: '14px 14px 8px',
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
                  maxWidth: '86%',
                  background: m.sender === 'user' ? 'var(--green-mid)' : '#ffffff',
                  color: m.sender === 'user' ? '#ffffff' : 'var(--ink)',
                  padding: '10px 14px',
                  borderRadius: m.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  fontSize: 13,
                  lineHeight: 1.55,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                  border: m.sender === 'user' ? 'none' : '1px solid var(--line)',
                  wordBreak: 'break-word',
                }}
              >
                {m.text}
              </div>
            ))}

            {/* Quick FAQs Suggestions */}
            <div style={{ marginTop: 8, paddingBottom: 6 }}>
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
                      transition: 'background 0.15s, border-color 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.background = '#FFFDF5'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.background = '#ffffff'; }}
                  >
                    {f.q}
                  </button>
                ))}
              </div>
            </div>

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSend}
            style={{
              padding: '10px 12px',
              background: '#ffffff',
              borderTop: '1px solid var(--line)',
              display: 'flex',
              gap: 8,
              alignItems: 'center',
            }}
          >
            <input
              type="text"
              placeholder="Nhập câu hỏi hỗ trợ..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{
                flex: 1,
                padding: '9px 14px',
                borderRadius: 999,
                border: '1.5px solid var(--line)',
                fontSize: 13,
                outline: 'none',
                background: '#F8FAFC',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--green-mid)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--line)')}
            />
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              style={{ padding: '8px 16px', borderRadius: 999, fontWeight: 'bold' }}
            >
              Gửi
            </button>
          </form>
        </div>
      )}
    </>
  );
}
