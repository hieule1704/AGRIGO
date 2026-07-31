# AGRIGO — Demo MERN Stack

Nền tảng kết nối máy nông nghiệp (máy cày, máy gặt, drone phun thuốc...) giữa nông dân và chủ máy.
Giao diện lấy cảm hứng bố cục kiểu **Klook/Rentalcars** (hero search + danh sách + trang chi tiết + đặt lịch).

Stack: **MongoDB (in-memory cho demo) + Express + React (Vite) + Node.js**

```
agrigo-mern/
├── backend/     ← Express API + Mongoose models
└── frontend/    ← React (Vite) — giao diện Nông dân/Chủ máy + trang Admin
```

## 0. Yêu cầu

- Node.js **≥ 18** (khuyến nghị 20+) đã cài trên máy bạn
- Có kết nối Internet **1 lần duy nhất** để `npm install` (tải Express, React, MongoDB in-memory server...)
- Không cần cài MongoDB — bản demo tự chạy MongoDB tạm trong RAM

## 1. Cài đặt & chạy Backend (API)

```bash
cd backend
npm install
cp .env.example .env
npm run seed      # tạo dữ liệu mẫu: danh mục, tài khoản, máy nông nghiệp...
npm run dev        # chạy API tại http://localhost:5000
```

Bạn sẽ thấy log dạng:
```
⚡ Đang dùng MongoDB In-Memory (chỉ để demo, dữ liệu sẽ mất khi tắt server).
✅ Đã kết nối MongoDB: ...
🚀 AGRIGO API đang chạy tại http://localhost:5000
```

> Lưu ý: vì dùng MongoDB In-Memory, **mỗi lần tắt server dữ liệu sẽ mất** — chạy lại `npm run seed` rồi `npm run dev`.
> Muốn dữ liệu lưu lại lâu dài: tạo cluster free tại [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register), dán connection string vào biến `MONGO_URI` trong file `.env`, rồi chạy lại `npm run seed` + `npm run dev`.

## 2. Cài đặt & chạy Frontend (giao diện)

Mở terminal thứ 2:

```bash
cd frontend
npm install
npm run dev         # chạy giao diện tại http://localhost:5173
```

Mở trình duyệt: **http://localhost:5173**

Frontend đã cấu hình sẵn proxy `/api` → `http://localhost:5000` (xem `vite.config.js`), nên không cần chỉnh gì thêm.

## 3. Tài khoản demo (mật khẩu chung: `123456`)

| Vai trò | Email |
|---|---|
| Nông dân | farmer@agrigo.vn |
| Chủ máy | owner@agrigo.vn (hoặc owner2@agrigo.vn) |
| Quản trị viên | admin@agrigo.vn |

## 4. Luồng demo gợi ý

1. Vào trang chủ → tìm máy theo khu vực/loại máy → xem chi tiết máy.
2. Đăng nhập bằng `farmer@agrigo.vn` → đặt lịch thuê 1 máy.
3. Đăng nhập bằng `owner@agrigo.vn` → vào **Kênh chủ máy** → tab **Đơn đặt lịch** → **Nhận đơn** → **Đánh dấu hoàn tất**.
4. Quay lại tài khoản farmer → **Lịch thuê của tôi** → **Đánh giá** đơn đã hoàn tất.
5. Đăng nhập bằng `admin@agrigo.vn` → vào **Trang quản trị**:
   - Tab **Duyệt máy**: duyệt/từ chối máy mới đăng (có sẵn 1 máy "chờ duyệt" trong dữ liệu mẫu).
   - Tab **Người dùng**: khóa/mở khóa tài khoản.
   - Tab **Đơn đặt lịch**: xem toàn bộ giao dịch + hoa hồng nền tảng (5%).

## 5. Cấu trúc dữ liệu (MongoDB, dễ tùy biến sau này)

- **User**: `full_name, email, password_hash, phone, role(farmer/owner/admin), district, status`
- **Category**: `name, slug, icon` — danh mục loại máy
- **Machine**: `owner_id, category_id, name, price_per_day, district, status(pending/approved/rejected/hidden), rating_avg, schedule[]`
- **Booking**: `machine_id, farmer_id, owner_id, start_date, end_date, total_price, commission_amount, status`
- **Review**: `booking_id, machine_id, farmer_id, rating, comment`

Muốn thêm trường (VD: ảnh nhiều tấm, loại nhiên liệu, diện tích tối thiểu...) chỉ cần sửa file model tương ứng trong `backend/src/models/` — không cần đụng vào phần còn lại.

## 6. Lưu trữ & Quản lý Hình ảnh (Local Storage & Direct URL)

Hệ thống được thiết kế lưu trữ hình ảnh hoàn toàn linh hoạt mà **không bắt buộc dùng dịch vụ Cloud bên thứ 3**:

- **📁 Tải ảnh Local (Multer)**: Khi Chủ máy (Owner) chọn file từ máy tính, ảnh sẽ được tự động lưu vào thư mục `backend/uploads/` và được Express phục vụ qua đường dẫn tĩnh `/uploads/filename.jpg`.
- **🔗 Dán đường dẫn trực tiếp (Direct URL)**: Hỗ trợ dán link ảnh từ bất kỳ nguồn online nào (hoặc link ảnh máy tính).
- **👁 Xem trước ảnh (Image Preview)**: Giao diện hiển thị tức thì xem trước hình ảnh trước khi lưu.
- **🛡 Admin xem duyệt**: Trang Quản trị (Admin) hiển thị ảnh thu nhỏ của các máy đang chờ duyệt giúp công tác kiểm duyệt trực quan.

## 7. Các bước mở rộng tiếp theo

- Thêm bản đồ (Leaflet/OpenStreetMap) vào trang tìm kiếm bằng cách dùng field `lat/lng` đã có sẵn trong model `Machine`.
- Deploy miễn phí gợi ý: **Backend** → Render.com / Railway (free tier) + MongoDB Atlas free; **Frontend** → Vercel/Netlify (build lệnh `npm run build`, thư mục `dist`).

---
*Đây là sản phẩm demo phục vụ trình bày nội bộ — dữ liệu, thanh toán là mô phỏng.*
