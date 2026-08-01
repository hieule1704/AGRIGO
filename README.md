# AGRIGO — Nền Tảng Kết Nối Máy Nông Nghiệp MERN Stack (Tích hợp AI & Bản Đồ)

**AGRIGO** là hệ thống MERN Stack hiện đại kết nối chủ máy nông nghiệp (máy cày, máy gặt đập liên hợp, drone phun thuốc, xe tuốt...) với bà con nông dân khu vực An Giang & Đồng bằng sông Cửu Long.

Giao diện được thiết kế theo phong cách Klook / Rentalcars (Hero Search + Trợ lý AI + Bản đồ tương tác Leaflet + Quản lý lịch chống double-booking).

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

* **Backend**: Node.js, Express.js, MongoDB (hỗ trợ In-Memory DB tự động & Atlas), Mongoose, BCrypt, JWT, Express Rate Limit, Multer.
* **Frontend**: React.js (Vite), React Router v6, Leaflet Maps (`react-leaflet`), CSS Design System tailored.
* **AI Engine**: Google AI Studio Gemini API (`gemini-1.5-flash`) tích hợp **Hệ thống Dự phòng (Fallback Mechanism)** chống quá tải token 100%.

```
agrigo-mern/
├── backend/     ← Express API Server (Routes: Auth, Machines, Bookings, Admin, Upload, AI)
└── frontend/    ← React (Vite) App (Pages: Search, Detail, Owner, Farmer, Admin, Profile)
```

---

## 🚀 1. Hướng Dẫn Cài Đặt & Khởi Chạy

### Yêu cầu hệ thống:
- **Node.js**: phiên bản ≥ 18 (khuyến nghị 20+)
- **Nguồn dữ liệu**: Mặc định bản demo dùng MongoDB In-Memory (chạy trực tiếp trong RAM, không cần cài MongoDB).

### Bước 1: Khởi chạy Backend (API Server - Cổng 5000)
```bash
cd backend
npm install
npm run seed      # Khởi tạo dữ liệu mẫu: Danh mục, Tài khoản demo, Máy nông nghiệp
npm run dev        # Chạy Backend Server tại http://localhost:5000
```
*Ghi chú*: Biến `GEMINI_API_KEY` đã được cấu hình sẵn trong `backend/.env`.

### Bước 2: Khởi chạy Frontend (Giao diện - Cổng 5173)
Mở terminal thứ hai:
```bash
cd frontend
npm install
npm run dev        # Chạy Frontend tại http://localhost:5173
```
👉 **Mở trình duyệt truy cập: http://localhost:5173**

*(Vite đã cấu hình proxy tự động cho các request `/api` và `/uploads` sang cổng 5000)*.

---

## 🔑 2. Tài Khoản Demo (Mật khẩu chung: `123456`)

| Vai trò | Email | Quyền hạn & Chức năng |
|---|---|---|
| **Nông dân** | `farmer@agrigo.vn` | Tìm máy bằng AI / Bản đồ, xem tạm tính giá, đặt lịch thuê, hủy đơn, đánh giá |
| **Chủ máy** | `owner@agrigo.vn` *(hoặc owner2@agrigo.vn)* | Đăng máy mới (Ghim vị trí bản đồ + AI viết mô tả), nhận/hủy đơn thuê, cập nhật lịch bận |
| **Quản trị viên** | `admin@agrigo.vn` | Duyệt bài đăng với **AI Check**, tóm tắt insight đánh giá, quản lý người dùng & doanh thu |

---

## 🔄 3. Workflow & Tính Năng Nổi Bật

### 🤖 1. Tích Hợp AI Agent (Google Gemini API + Smart Fallback)
- **Trợ lý Tìm máy Ngôn ngữ tự nhiên**: Nông dân gõ câu hỏi (*"Cần máy gặt ở Thoại Sơn"*), AI tự bóc tách `huyện` & `loại máy` để lọc kết quả.
- **✨ Viết mô tả bằng AI**: Chủ máy chỉ cần điền tên máy, AI tự động sinh đoạn mô tả chuyên nghiệp, thân thiện.
- **🛡️ AI Content Moderation**: Admin kiểm duyệt bài đăng mới với 1-click **"AI Check"** để chấm điểm an toàn (0-100) và nhận biết nội dung rác.
- **Tóm tắt Đánh giá**: AI tổng hợp hàng loạt nhận xét của nông dân thành ưu/nhược điểm và khuyến nghị cho Admin.
- **⚡ Chế độ Dự phòng (Fallback Mechanism)**: Khi Gemini API hết quota hoặc quá tải token, hệ thống tự động kích hoạt bộ xử lý quy tắc thông minh, đảm bảo demo 100% không bao giờ bị đứng hay treo.

### 🗺️ 2. Bản Đồ Tương Tác & Ghim Vị Trí Máy (Leaflet Maps)
- **Click-to-Pin Location Picker**: Khi đăng máy mới, chủ máy chỉ cần **click vào bất kỳ điểm nào trên bản đồ** để chọn tọa độ chính xác.
- **Tự động đặt vị trí theo Huyện/Thị**: Khi chọn khu vực (VD: Long Xuyên, Châu Đốc...), bản đồ tự xoay đến trung tâm khu vực đó.
- **📡 Định vị GPS hiện tại**: Tích hợp Geolocation API cho phép lấy vị trí thiết bị hiện tại chỉ với 1 click.

### 📅 3. Đặt Lịch Chống Trùng Lịch (Anti-Double Booking) & Tính Tiền Realtime
- **Trực quan Lịch bận**: Hiển thị các ngày máy đã có lịch bận (`booked`/`blocked`) ngay trên trang chi tiết máy.
- **Tạm tính tiền tự động**: Tự động tính toán số ngày thuê và hiển thị tổng tiền `(Số ngày × Giá/ngày)` theo thời gian thực.
- **Kiểm soát Xung đột**: Chặn double-booking ở cả Frontend lẫn Backend khi chủ máy bấm "Nhận đơn".
- **Hủy đơn & Giải phóng Lịch**: Cho phép Hủy đơn cả khi đơn ở trạng thái `accepted`, tự động giải phóng các ngày bận khỏi lịch máy.

### 👤 4. Hồ Sơ Cá Nhân & Bảo Mật Nâng Cao
- **Quản lý Hồ sơ (`/profile`)**: Cập nhật thông tin cá nhân và ảnh đại diện Avatar (hỗ trợ file upload local hoặc đường dẫn URL Cloud).
- **Chống Brute-force**: Giới hạn số lần thử đăng nhập sai (`express-rate-limit`) bảo vệ hệ thống.
- **Chặn khóa Admin**: Backend tự động chặn các hành vi khóa tài khoản Quản trị viên qua API.

---

## 🗄️ 4. Cấu Trúc Dữ Liệu Chính (Mongoose Schema)

- **User**: `full_name, email, password_hash, phone, role(farmer/owner/admin), district, address, avatar_url, status(active/locked)`
- **Category**: `name, slug, icon`
- **Machine**: `owner_id, category_id, name, description, brand, year_made, price_per_day, price_unit, district, address_detail, lat, lng, image_url, status(pending/approved/rejected/hidden), rating_avg, rating_count, schedule[{date, status}]`
- **Booking**: `machine_id, farmer_id, owner_id, start_date, end_date, days, price_per_day, total_price, commission_rate, commission_amount, status(pending/accepted/rejected/completed/cancelled)`
- **Review**: `booking_id, machine_id, farmer_id, rating, comment`

---

## 🖼️ 5. Quản Lý Hình Ảnh (Dev & Production)

- **Môi trường Dev/Local**: Ảnh upload qua Multer lưu tại `backend/uploads/` và được phục vụ qua đường dẫn tĩnh `/uploads/filename.jpg`. Vite Frontend đã proxy sẵn `/uploads` → backend port 5000.
- **Môi trường Production (Render/Railway/Vercel)**: Hệ thống đã sẵn sàng hỗ trợ Cloudinary / Direct URL giúp lưu trữ vĩnh viễn không bị xóa khi server tái khởi động.

---

*AGRIGO MERN Stack — Dự án Demo Nền Tảng Cho Thuê Máy Nông Nghiệp Thông Minh.*
