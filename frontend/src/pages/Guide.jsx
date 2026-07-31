import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Guide() {
  const [tab, setTab] = useState('farmer');

  return (
    <>
      <section className="marketing-hero">
        <div className="container">
          <h1>Hướng dẫn sử dụng AGRIGO</h1>
          <p className="lead">Cẩm nang chi tiết từng bước giúp Nông dân thuê máy và Chủ máy vận hành hiệu quả trên nền tảng.</p>
        </div>
      </section>

      <section className="marketing-section">
        <div className="container">
          <div className="role-toggle" style={{ maxWidth: 400, margin: '0 auto 30px' }}>
            <a href="#" className={tab === 'farmer' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setTab('farmer'); }}>🌾 Dành cho Nông dân</a>
            <a href="#" className={tab === 'owner' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setTab('owner'); }}>🚜 Dành cho Chủ máy</a>
          </div>

          {tab === 'farmer' && (
            <div className="marketing-grid">
              <div className="feature-card">
                <div className="icon">1️⃣</div>
                <h3>Tìm kiếm & Lọc vị trí</h3>
                <p>Nhập địa bàn huyện (Long Xuyên, Châu Đốc, Thoại Sơn...), chọn loại máy cần thuê (máy cày, máy gặt, drone) và ngày dự kiến làm ruộng.</p>
              </div>
              <div className="feature-card">
                <div className="icon">2️⃣</div>
                <h3>Kiểm tra vị trí & Giá</h3>
                <p>Xem vị trí máy trên bản đồ tương tác Leaflet, xem thông số năm sản xuất, hình ảnh thực tế và giá thuê niêm yết theo ngày.</p>
              </div>
              <div className="feature-card">
                <div className="icon">3️⃣</div>
                <h3>Gửi yêu cầu & Nghiệm thu</h3>
                <p>Gửi yêu cầu đặt lịch cho chủ máy. Khi máy đến công ruộng làm xong, vào mục "Lịch thuê của tôi" để hoàn tất và viết đánh giá.</p>
              </div>
            </div>
          )}

          {tab === 'owner' && (
            <div className="marketing-grid">
              <div className="feature-card">
                <div className="icon">1️⃣</div>
                <h3>Đăng ký Tài khoản Chủ máy</h3>
                <p>Tạo tài khoản với vai trò "Chủ máy cơ giới", cập nhật số điện thoại liên lạc và địa bàn hoạt động chính của bạn.</p>
              </div>
              <div className="feature-card">
                <div className="icon">2️⃣</div>
                <h3>Đăng thiết bị & Upload ảnh</h3>
                <p>Vào tab "Đăng máy mới", chọn loại máy, giá thuê/ngày, tải ảnh thực tế từ máy tính (hoặc dán URL) và thiết lập vị trí tọa độ.</p>
              </div>
              <div className="feature-card">
                <div className="icon">3️⃣</div>
                <h3>Nhận đơn & Xác nhận</h3>
                <p>Nhận thông báo khi có nông dân gửi yêu cầu thuê máy. Bấm "Nhận đơn", đến công ruộng đúng hẹn và đánh dấu "Hoàn tất".</p>
              </div>
            </div>
          )}

          <div className="card-box" style={{ marginTop: 40, padding: 30 }}>
            <h3 style={{ fontSize: 20, marginBottom: 16 }}>❓ Câu hỏi thường gặp</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <b>Q: Tôi có phải trả phí khi tìm máy trên AGRIGO không?</b>
                <p className="small" style={{ margin: '4px 0 0' }}>Hoàn toàn miễn phí! Nông dân không mất bất kỳ khoản phí nào khi tìm kiếm hay gửi đơn đặt lịch.</p>
              </div>
              <div>
                <b>Q: Ảnh máy nông nghiệp tải lên được lưu trữ ở đâu?</b>
                <p className="small" style={{ margin: '4px 0 0' }}>Ảnh tải từ máy tính được lưu an toàn trực tiếp trong hệ thống local của server AGRIGO (`/uploads`), không cần qua dịch vụ cloud trung gian.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
