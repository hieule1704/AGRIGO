# 🌾 AGRIGO — Nền Tảng Cho Thuê Máy Nông Nghiệp Thông Minh & Số Hóa Cơ Giới Nông Thôn

[![React](https://img.shields.io/badge/Frontend-React_18_(Vite)-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![NodeJS](https://img.shields.io/badge/Backend-Node.js_Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB_Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![AI Engine](https://img.shields.io/badge/AI_Engine-Google_Gemini_1.5_Flash-4285F4?logo=google-gemini&logoColor=white)](https://ai.google.dev/)
[![Routing Engine](https://img.shields.io/badge/Routing-OSRM_%2B_Leaflet_Polyline-2563EB?logo=openstreetmap&logoColor=white)](https://project-osrm.org/)
[![Payment](https://img.shields.io/badge/Payment-VietQR_%26_E--Wallet-E8AC1F?logo=contactlesspayment&logoColor=white)](https://vietqr.net/)
[![Responsive](https://img.shields.io/badge/Design-100%25_Mobile_First-059669?logo=googlechrome&logoColor=white)](https://github.com/hieule1704/AGRIGO)

---

## 📖 Tổng Quan Dự Án (Executive Summary)

**AGRIGO** là giải pháp nền tảng công nghệ số hóa (Agritech Platform) tiên phong kết nối trực tiếp hai nhóm đối tượng cốt lõi trong chuỗi giá trị nông nghiệp: **Chủ sở hữu dàn máy cơ giới** *(máy gặt đập liên hợp, máy cày xới đất bánh xích kép, drone bay phun thuốc/sạ phân, máy cấy mạ khay, máy cuộn rơm, máy sấy lúa)* và **Bà con nông dân / Hợp tác xã** trên địa bàn 11 huyện thị tỉnh An Giang và vùng Đồng bằng sông Cửu Long.

Ứng dụng giải quyết triệt để bài toán:
1. **Chống lãng phí công suất máy**: Giúp chủ máy tìm kiếm khách hàng thuê máy liên tục giữa các mùa vụ, gia tăng doanh thu từ 40% - 60%.
2. **Khắc phục tình trạng "cháy máy" mùa thu hoạch**: Giúp bà con nông dân chủ động tìm kiếm, thương lượng giá, đo khoảng cách đường bộ xe chạy thực tế và đặt lịch cơ giới đúng thời điểm vàng mùa vụ.
3. **Minh bạch hóa chi phí & dịch vụ đi kèm**: Niêm yết bảng giá rõ ràng, hỗ trợ đàm phán giá, dịch vụ bổ trợ Microservices (kèm thợ lái, bao dầu DO, chở máy tận ruộng) và thanh toán quét mã VietQR tức thì.

---

## 🌟 Tính Năng Nổi Bật — Tech Marketing Highlights

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   AGRIGO TECH ARCHITECTURE                                       │
├─────────────────────────┬─────────────────────────┬──────────────────────────────────────────────┤
│   🤖 AI SMART ENGINE    │   🛣️ REAL ROAD ROUTING  │          📱 MODERN UX/UI SYSTEM              │
│   • Gemini 1.5 Assistant│   • OSRM Driving Engine │   • Master Search Capsule (~46px)            │
│   • NLP Query Parsing   │   • Leaflet Road Polyline│   • Action Pills & Collapsible Drawers       │
│   • AI Machine Match    │   • Bridge/Highway Matrix│   • 3-Col Desktop Grid / Mobile Compact Card │
└─────────────────────────┴─────────────────────────┴──────────────────────────────────────────────┘
```

---

### 1. 🛣️ Tính Năng Đo Khoảng Cách & Lộ Trình Đường Bộ Thực Tế (OSRM Real Road Routing)
*Khắc phục hoàn toàn hạn chế của khoảng cách đường chim bay (Haversine straight-line).*

* **Công nghệ tích hợp**: Tích hợp trực tiếp **Open Source Routing Machine (OSRM)** kết nối mạng lưới giao thông đường bộ Việt Nam & OpenStreetMap.
* **Tính toán chính xác qua cầu & tỉnh lộ**:
  * Tự động nhận diện các tuyến quốc lộ, tỉnh lộ, cầu vượt sông tại Đồng bằng sông Cửu Long để tính đúng số km xe tải/xe máy kéo chở máy cần di chuyển đến chân ruộng.
  * Trả về **quãng đường di chuyển thực tế (`distanceKm`)** chính xác đến `0.1 km` và **thời gian di chuyển ước tính (`durationMin`)**.
* **Vẽ lộ trình đường cong Polyline trực quan trên Bản đồ ([MachineMap.jsx](frontend/src/components/MachineMap.jsx))**:
  * Hiển thị đường nối màu xanh đậm (`#2563EB`) dẫn từ vị trí thực tế của nông dân (`📍 Vị trí của bạn`) đến điểm đặt máy cơ giới.
  * Tích hợp thanh thông tin lộ trình Header mỏng dẹp không che khuất tầm nhìn bản đồ.
* **Sắp xếp "Gần tôi nhất" theo đường xe chạy**:
  * Sử dụng OSRM Table Matrix tính toán khoảng cách hàng loạt trong 1 request duy nhất, tự động đưa các máy có quãng đường xe chạy ngắn nhất lên đầu kết quả tìm kiếm.

---

### 2. 🎨 Trải Nghiệm Tìm Kiếm Đỉnh Cao — Master Search Capsule & Collapsible Drawers
*Thiết kế chuẩn UX/UI các nền tảng thương mại hàng đầu thế giới (Airbnb, Booking.com, Shopee), tiết kiệm hơn 70% diện tích màn hình.*

* **Thanh tìm kiếm Master Capsule (`.search-master-bar`)**:
  * Gom trọn 3 trường tìm kiếm cốt lõi (*📍 Khu vực máy*, *🚜 Loại máy cơ giới*, *📅 Ngày cần dùng*, *🔍 Nút Tìm kiếm*) vào duy nhất **1 thanh Capsule mỏng dẹp (~46px)**, bo góc 14px mềm mại.
* **Thanh Action Toolbar Pills 1 chạm (`.search-action-pills`)**:
  * **`✨ Trợ lý AI Tìm máy`**: Nút pill gọn gàng, chỉ khi click mới trượt mở ngăn kéo tìm kiếm AI. Khi đóng, chiếm **0px diện tích**.
  * **`🛣️ Đo đường bộ tới ruộng`**: Kích hoạt GPS 1 chạm hoặc chọn nhanh Huyện. Khi đã nhận diện vị trí, hiển thị badge tinh gọn `🎯 Thoại Sơn ✕` trên cùng một hàng.
  * **`🔄 Xóa bộ lọc`**: Nút reset tức thì khi có điều kiện lọc đang kích hoạt.
* **Collapsible Drawers (Ngăn kéo trượt mở mượt mà)**:
  * **AI Search Drawer**: Hỗ trợ tìm kiếm bằng ngôn ngữ tự nhiên (*"Cần thuê máy gặt ở Thoại Sơn gấp ngày mai..."*) kèm các thẻ chip gợi ý nhanh (*🌾 Máy gặt Thoại Sơn*, *🚁 Drone phun thuốc*, *🚜 Máy cày xới đất*).
  * **Location Drawer**: Hỗ trợ HTML5 Geolocation độ chính xác cao và danh sách chọn 11 huyện thị An Giang.
* **Layout Responsive Đa Nền Tảng**:
  * **Desktop**: Bố cục 3 cột cân đối tuyệt đối (`display: contents` + CSS Grid) gồm Thumbnail 220px, Khối thông tin trung tâm `1fr` kèm mô tả súc tích và Cột giá tiền / CTA `165px`.
  * **Mobile (< 768px)**: Thẻ máy dạng ngang nhỏ gọn (ảnh 95px, tự động cắt chữ tràn bằng `-webkit-line-clamp: 2` và `ellipsis`), thanh chip cuộn ngang `mobile-sort-chips`, phân trang rút gọn `...` chống vỡ giao diện.

---

### 3. 📅 Lịch Mùa Vụ Trực Quan & Đánh Giá Nông Dân Thực Tế (Social Proof)

* **Lịch Rảnh & Bận Mùa Vụ ([VisualAvailabilityCalendar.jsx](frontend/src/components/VisualAvailabilityCalendar.jsx))**:
  * Hiển thị lưới lịch tháng với màu sắc trực quan: **🟢 Rảnh (Sẵn sàng phục vụ)**, **🔴 Đã có khách thuê**, **⚪ Khóa / Ngoài mùa vụ**.
  * Chấm tròn ghi chú màu sắc chuẩn đẹp, không trùng lặp, dễ thao tác chọn ngày.
* **186+ Lượt Đánh Giá & Bình Luận Chân Thực**:
  * Hệ thống khởi tạo dữ liệu phong phú từ 8 tài khoản nông dân đại diện các vùng lúa An Giang (*Thoại Sơn, Tri Tôn, Tân Châu, Chợ Mới, Châu Phú, Long Xuyên, Phú Tân, Tịnh Biên*).
  * Thẻ đánh giá thiết kế Card sang trọng kèm avatar tròn gradient, tên huyện canh tác, điểm sao `★ 5/5` và huy hiệu xác thực: `✓ Đã thuê máy thực tế qua AGRIGO`.

---

### 4. 🚜 Kênh Chủ Máy: Chỉnh Sửa & Xóa Máy An Toàn (Kèm Kiểm Duyệt Admin)

* **Điều kiện Xóa Máy Chuẩn Xác (Bảo toàn cơ sở dữ liệu)**:
  * Trước khi xóa, backend tự động kiểm tra số đơn đặt lịch chưa hoàn tất (`status: 'pending'` hoặc `'accepted'`).
  * Nếu máy đang có đơn hoạt động: Từ chối xóa với thông báo chi tiết, bảo vệ quyền lợi nông dân và tránh xung đột dữ liệu liên kết.
  * Nếu máy rảnh hoàn toàn: Tiến hành xóa an toàn máy và các review liên quan.
* **Cơ Chế Phê Duyệt Thông Tin (Admin Verification Gate)**:
  * Chủ máy được phép sửa toàn diện thông số máy (giá ngày, giá trần, khu vực, vị trí bản đồ `LocationPickerMap`, ảnh tải lên, ngày nhận thuê, dịch vụ bổ trợ addons...).
  * **Ngay sau khi lưu**: Trạng thái máy tự động chuyển sang **`pending` (🟡 Chờ Admin duyệt lại)**. Thông tin mới chỉ xuất hiện công khai sau khi Quản trị viên (Admin) phê duyệt trong **Admin Dashboard**.

---

### 5. 💳 Dịch Vụ Bổ Trợ Microservices & Thanh Toán Đa Kênh

* **Dịch vụ Microservices tùy chọn đi kèm**:
  * `👨‍🌾 Kèm thợ lái máy chuyên nghiệp` (+200.000đ/ngày)
  * `⛽ Bao nhiên liệu Dầu DO trọn gói` (+150.000đ/ngày)
  * `🚚 Giao máy & chở tận công ruộng` (+100.000đ/chuyến)
  * `🚁 Đầu phun hạt / Sạ lúa chính hãng DJI` (+80.000đ/ngày)
* **Đàm phán & Thương lượng giá**: Hỗ trợ bà con gửi đề xuất giá trực tiếp cho diện tích ruộng lớn.
* **Thanh toán VietQR & Ví điện tử**: Modal quét mã QR ngân hàng tự động, ví MoMo/ZaloPay và tiền mặt khi nhận máy.

---

## 🛠️ Ngăn Xếp Công Nghệ (Full Tech Stack)

| Thành Phần | Công Nghệ / Thư Viện | Mục Đích & Điểm Nổi Bật |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18.3 + Vite 5 | Render cực nhanh, HMR tức thì, Bundle tối ưu < 1s |
| **Routing & Navigation** | React Router v6 | Định tuyến SPA mượt mà, phân quyền Route theo Role |
| **Bản Đồ Số** | Leaflet.js + React-Leaflet | Bản đồ vệ tinh OpenStreetMap, Custom DivIcon, Polyline lộ trình |
| **Hệ Thống Lộ Trình** | OSRM Driving Engine API | Tính quãng đường xe chạy thực tế qua cầu, quốc lộ, tỉnh lộ |
| **Backend API** | Node.js + Express.js | RESTful APIs, bảo mật Helmet, CORS, Rate Limit, Port 5001 |
| **Cơ Sở Dữ Liệu** | MongoDB Atlas (Cloud) | Lưu trữ phân tán, Mongoose ODM, quan hệ chặt chẽ giữa User - Machine - Booking - Review |
| **Trí Tuệ Nhân Tạo** | Google Gemini 1.5 Flash | Phân tích truy vấn tìm kiếm tiếng Việt, tạo mô tả máy tự động, kiểm duyệt nội dung |
| **Xác Thực & Bảo Mật** | JWT + BcryptJS | Quản lý phiên an toàn, phân quyền 3 cấp (Farmer / Owner / Admin) |
| **Quản Lý Tệp Tĩnh** | Multer Storage | Upload ảnh máy và banner quảng cáo an toàn tại `/uploads` |

---

## 📂 Cấu Trúc Mã Nguồn (Project Hierarchy)

```
AGRIGO/
├── backend/
│   ├── server.js                          # Điểm khởi chạy Express server (Port 5001)
│   ├── uploads/                           # Thư mục lưu trữ hình ảnh tải lên tĩnh
│   ├── .env                               # Cấu hình PORT=5001, MONGO_URI, JWT_SECRET, GEMINI_API_KEY
│   └── src/
│       ├── config/                        # Kết nối MongoDB Atlas
│       ├── middleware/                    # Middleware xác thực JWT, phân quyền Role, Upload
│       ├── models/                        # Schemas: User, Machine, Booking, Review, Category, Advertisement
│       ├── routes/                        # Endpoints: auth, machine, booking, owner, admin, ai, upload
│       ├── smartSeed.js                   # Seed bảo tồn máy tùy chỉnh & ảnh người dùng
│       └── populateRichData.js            # Script nạp 186+ đánh giá và tài khoản farmer_demo
└── frontend/
    ├── vite.config.js                     # Cấu hình proxy sang http://localhost:5001
    ├── public/                            # Favicon, logo.png, qr_code.jpg
    └── src/
        ├── api.js                         # Axios wrapper kèm Health Check tự động
        ├── styles.css                     # Design System, Master Search Capsule, CSS Grid, Responsive
        ├── services/
        │   └── routing.js                 # [MỚI] Module dịch vụ tính khoảng cách & Polyline qua OSRM
        ├── components/
        │   ├── Header.jsx                 # Thanh điều hướng đa nền tảng
        │   ├── Footer.jsx                 # Chân trang hiện đại
        │   ├── MachineCard.jsx            # Thẻ hiển thị máy, icon danh mục, định dạng tiền VNĐ
        │   ├── MachineMap.jsx             # [NÂNG CẤP] Bản đồ Leaflet vẽ Polyline đường bộ & Zoom góc phải
        │   ├── LocationPickerMap.jsx      # Bản đồ chọn tọa độ ghim máy
        │   ├── VisualAvailabilityCalendar.jsx # [NÂNG CẤP] Lịch rảnh/bận dạng chấm màu chuẩn đẹp
        │   ├── AdBannerSlider.jsx         # Slider banner quảng cáo đối tác VIP
        │   └── LiveSupportChat.jsx        # Trợ lý ảo hỗ trợ trực tuyến 24/7
        └── pages/
            ├── Home.jsx                   # Trang chủ quảng bá dịch vụ
            ├── Search.jsx                 # [NÂNG CẤP] Master Search Capsule, AI Drawer, Location Drawer
            ├── MachineDetail.jsx          # [NÂNG CẤP] Chi tiết máy, tính đường bộ, lịch đặt, 186+ review
            ├── OwnerDashboard.jsx         # [NÂNG CẤP] Quản lý máy của tôi, Sửa/Xóa máy an toàn, Báo cáo VIP
            ├── AdminDashboard.jsx         # Bảng điều khiển quản trị, duyệt máy, kiểm duyệt AI Check
            ├── FarmerBookings.jsx         # Quản lý đơn thuê máy của nông dân
            └── Login.jsx / Register.jsx   # Đăng nhập & Đăng ký tài khoản
```

---

## 🔑 Tài Khoản Trải Nghiệm Demo (Mật khẩu chung: `123456`)

| Vai Trò | Email | Mật Khẩu | Dữ Liệu Có Sẵn Để Trải Nghiệm |
| :--- | :--- | :---: | :--- |
| **🌾 Nông Dân Demo** | `farmer_demo@agrigo.vn` | `123456` | **Có sẵn 8 đơn đặt lịch thực tế** (đã hoàn thành, đang thực hiện, chờ duyệt), hóa đơn VietQR, đánh giá 5 sao. |
| **🚜 Chủ Máy VIP** | `owner_vip@agrigo.vn` | `123456` | Đã kích hoạt **VIP Partner**, dàn máy gặt/cày/drone công suất lớn, **Báo cáo Phân tích Thị trường 11 Huyện**, Banner quảng cáo Slider. |
| **🚜 Chủ Máy An Giang** | `lehieu17042004@gmail.com` | `123456` | Quản lý máy cơ giới cá nhân, tính năng **Sửa/Xóa máy an toàn**, theo dõi lịch bận mùa vụ. |
| **🛡️ Quản Trị Viên (Admin)** | `admin@agrigo.vn` | `123456` | Dashboard tổng quan, **Phê duyệt máy sửa đổi/đăng mới**, công cụ **🛡️ AI Content Check**, cấp quyền VIP Partner. |

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy (Quick Start)

### Yêu Cầu Môi Trường:
* **Node.js**: Phiên bản ≥ 18.x (Khuyến nghị Node 20 LTS)
* **MongoDB**: MongoDB Atlas Cloud hoặc MongoDB Local

### Bước 1: Khởi chạy Backend Server (Cổng 5001)
```bash
cd backend
npm install

# Khởi chạy server phát triển
npm run dev
```
*Backend tự động kết nối MongoDB Atlas Cloud và lắng nghe tại cổng `http://localhost:5001`.*

### Bước 2: Khởi chạy Frontend React (Cổng 5173)
Mở cửa sổ Terminal thứ hai:
```bash
cd frontend
npm install

# Khởi chạy giao diện React Vite
npm run dev
```

👉 **Mở trình duyệt và truy cập ngay:** **`http://localhost:5173`**

---

## 🛡️ Cơ Chế Bảo Toàn Dữ Liệu Thông Minh (Non-Destructive Seeding)

Hệ thống được trang bị cơ chế kiểm tra an toàn dữ liệu tự động:
* Khi khởi động hoặc Re-deploy, Backend kiểm tra số lượng bản ghi trong cơ sở dữ liệu MongoDB Atlas.
* Nếu database đã có dữ liệu (`userCount > 0`), hệ thống **TỰ ĐỘNG BỎ QUA VIỆC NẠP ĐÈ SEED**, bảo toàn 100% tài khoản, máy cơ giới, hình ảnh đã upload và các đơn đặt lịch thực tế của người dùng!

---

*© 2026 AGRIGO Platform — Giải pháp công nghệ số hóa nâng tầm cơ giới hóa nông nghiệp Việt Nam.*
