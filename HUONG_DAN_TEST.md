# 🌾 AGRIGO — Hướng Dẫn Trải Nghiệm & Kiểm Thử Hệ Thống

Chào mừng bạn đến với **AGRIGO** — Nền tảng kết nối máy nông nghiệp (Máy cày, Máy gặt đập liên hợp, Drone phun thuốc, Máy cấy...) tại khu vực An Giang & Đồng bằng sông Cửu Long.

Tài liệu này hướng dẫn chi tiết các tính năng chính và danh sách tài khoản demo để bạn dễ dàng trải nghiệm và gửi góp ý.

---

## 🔑 1. Danh Sách Tài Khoản Demo

Mất mật khẩu chung cho tất cả tài khoản bên dưới là: **`123456`**

| Vai trò | Email đăng nhập | Mật khẩu | Mô tả nhiệm vụ |
| :--- | :--- | :--- | :--- |
| 🌾 **Nông dân** | `farmer@agrigo.vn` | `123456` | Đặt lịch thuê máy, xem vị trí bản đồ, xem tổng tiền realtime, viết đánh giá. |
| 🚜 **Chủ máy 1** | `owner@agrigo.vn` | `123456` | Đăng máy mới (có AI hỗ trợ mô tả), duyệt/từ chối đơn đặt lịch, xem doanh thu. |
| 🚜 **Chủ máy 2** | `owner2@agrigo.vn` | `123456` | Quản lý phương tiện máy cấy, drone tại Tri Tôn. |
| 🛡️ **Quản trị viên** | `admin@agrigo.vn` | `123456` | Duyệt bài đăng máy mới (có AI Moderation kiểm duyệt nội dung), khóa bài. |

---

## 🚀 2. Kịch Bản & Luồng Kiểm Thử Trải Nghiệm (Workflow)

### 🤖 Luồng 1: Trợ lý AI Tìm Máy bằng Ngôn Ngữ Tự Nhiên
1. Truy cập trang **Tìm máy** (`/search`).
2. Tại ô **🤖 Trợ lý AI Tìm máy**, hãy gõ câu hỏi bằng ngôn ngữ tự nhiên bất kỳ. Ví dụ:
   * *"Tôi cần thuê máy gặt ở Thoại Sơn tuần sau"*
   * *"Tìm giúp tôi drone phun thuốc ở Châu Phú"*
3. Bấm **✨ Tìm bằng AI**: Trợ lý Gemini AI sẽ tự động phân tích ý định của bạn và kích hoạt lọc huyện/loại máy tương ứng.

---

### 🗺️ Luồng 2: Tìm Kiếm & Xem Bản Đồ Cơ Giới Vùng
1. Tại trang **Tìm máy**, thử lọc theo các huyện: *Long Xuyên, Châu Đốc, Thoại Sơn, Chợ Mới...*
2. Chuyển đổi giữa 3 chế độ xem: **⚖️ Song song**, **📋 Danh sách**, **🗺 Bản đồ Leaflet**.
3. Thử bấm vào các con số phân trang `[1] [2] [3]` ở cuối trang để xem hiệu ứng cuộn trang tự động.

---

### 📅 Luồng 3: Đặt Lịch Thuê Máy & Tính Tiền Realtime
1. Đăng nhập bằng tài khoản **Nông dân** (`farmer@agrigo.vn` / `123456`).
2. Bấm xem chi tiết 1 máy bất kỳ (Ví dụ: *Máy cày Kubota* hoặc *Máy gặt đập*).
3. Chọn **Ngày bắt đầu** và **Ngày kết thúc**:
   * Hệ thống sẽ tự động kiểm tra lịch bận.
   * Tính toán và hiển thị **Tổng tiền realtime** (`Số ngày × Giá/ngày = Tổng tiền`).
4. Bấm **🚀 Gửi yêu cầu đặt lịch**.
5. Vào trang **Đơn đặt của tôi** để xem trạng thái đơn.

---

### 🚜 Luồng 4: Đăng Máy Nông Nghiệp Mới (Dành cho Chủ máy)
1. Đăng xuất và Đăng nhập bằng tài khoản **Chủ máy** (`owner@agrigo.vn` / `123456`).
2. Vào **Quản lý máy** (Owner Dashboard).
3. Thử nghiệm các tính năng độc đáo:
   * **✨ Viết mô tả giúp tôi (AI)**: Nhập tên máy và bấm nút AI để Gemini tự viết mô tả hấp dẫn.
   * **🗺 Chọn vị trí trên bản đồ**: Nhấp chuột trực tiếp lên bản đồ Leaflet hoặc bấm **📡 Lấy vị trí GPS của tôi** để tự động ghim tọa độ máy.
4. Bấm **Đăng máy mới**: Bài đăng sẽ chuyển sang trạng thái *Chờ admin duyệt*.

---

### 🛡️ Luồng 5: Duyệt Bài Đăng Với AI Moderation (Dành cho Admin)
1. Đăng nhập bằng tài khoản **Quản trị viên** (`admin@agrigo.vn` / `123456`).
2. Vào **Quản trị hệ thống** (Admin Dashboard).
3. Tại danh sách máy chờ duyệt, bấm nút **🛡️ AI Check**:
   * AI sẽ phân tích nội dung bài đăng, chấm điểm độ an toàn (Safety Score 0-100) và đưa ra gợi ý duyệt.
4. Bấm **Duyệt bài** hoặc **Khóa bài**.

---

### 👤 Luồng 6: Quản Lý Hồ Sơ & Đổi Avatar
1. Bấm vào **Hồ sơ cá nhân** (nằm ở góc trên bên phải màn hình).
2. Thử thay đổi số điện thoại, khu vực sinh sống hoặc dán link **Ảnh đại diện Avatar**.
3. Bấm **Lưu thay đổi**.

---

## 💬 3. Gửi Góp Ý & Báo Lỗi

Nếu bạn gặp bất kỳ vấn đề gì hoặc có ý tưởng cải tiến giao diện/tính năng, vui lòng chụp màn hình và nhắn tin lại cho mình nhé!

**Cảm ơn bạn rất nhiều vì đã dành thời gian trải nghiệm AGRIGO!** 🌾🚜
