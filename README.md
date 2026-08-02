# 🌾 AGRIGO — Nền Tảng Cho Thuê Máy Nông Nghiệp Thông Minh (MERN Stack + AI + Leaflet Maps)

[![React](https://img.shields.io/badge/Frontend-React_18_(Vite)-61DAFB?logo=react)](https://reactjs.org/)
[![NodeJS](https://img.shields.io/badge/Backend-Node.js_Express-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB_Atlas-47A248?logo=mongodb)](https://www.mongodb.com/)
[![AI Engine](https://img.shields.io/badge/AI_Engine-Google_Gemini_1.5_Flash-4285F4?logo=google-gemini)](https://ai.google.dev/)
[![Leaflet](https://img.shields.io/badge/Maps-Leaflet.js-199900?logo=leaflet)](https://leafletjs.com/)
[![Deploy Status](https://img.shields.io/badge/Deployment-Vercel_%2B_Render-000000?logo=vercel)](https://vercel.com/)

**AGRIGO** là nền tảng thương mại điện tử kết nối số hóa trực tiếp giữa **Chủ máy cơ giới** (máy cày, máy gặt đập liên hợp, drone phun thuốc, máy sấy lúa, máy cấy) và **Bà con nông dân** khu vực 11 huyện thị An Giang và Đồng bằng sông Cửu Long.

Dự án được xây dựng theo tiêu chuẩn Web hiện đại, sở hữu giao diện tinh tế phong cách **Klook / Rentalcars**, tối ưu 100% Responsive, tích hợp **Trợ lý AI Gemini**, **Thanh toán VietQR**, **Bản đồ vệ tinh Leaflet.js**, **Chủ máy VIP Partner Analytics**, và **Cơ chế Bảo toàn Dữ liệu Khỏi Reset**.

---

## 📸 Giao Diện & Trải Nghiệm Người Dùng (UI/UX Showcase)

- **Trang chủ & Hero Search**: Tìm máy theo địa bàn huyện, ngày làm ruộng và loại máy với hiệu ứng mượt mà.
- **Trợ lý AI Ngôn ngữ Tự nhiên**: Gõ nhu cầu tự do *(VD: "Cần thuê máy gặt ở Thoại Sơn...")*, AI tự chọn đúng huyện và lọc kết quả.
- **Bản đồ Leaflet.js**: Định vị GPS, hiển thị khoảng cách và ghim vị trí dàn máy trên bản đồ vệ tinh.
- **Thanh toán Demo VietQR & Ví điện tử**: Modal quét mã QR Ngân hàng (`qr_code.jpg`), ví điện tử và COD tiền mặt tức thì.
- **Bảng điều khiển Admin Chuyên sâu**: AI Content Moderation (`🛡️ AI Check`), quản lý máy, phân quyền VIP Partner và đơn hàng.
- **Chủ máy VIP Partner**: Báo cáo phân tích giá & nhu cầu mùa vụ 11 huyện, đăng banner tiếp thị slider nổi bật.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

### Backend (API Server)
* **Framework**: Node.js & Express.js
* **Database**: MongoDB Atlas Cloud (với fallback tự động sang MongoDB Memory Server khi offline)
* **Authentication**: JSON Web Token (JWT) & BcryptJS Hashing
* **File Upload**: Multer (Lưu tĩnh an toàn tại `/uploads`)
* **AI Engine**: Google Generative AI Studio (Gemini 1.5 Flash) + **Smart Fallback Engine**
* **Security**: CORS, Helmet, Mongo Sanitize, Express Rate Limit

### Frontend (User Interface)
* **Core**: React 18 & Vite
* **Routing**: React Router v6
* **Maps**: Leaflet & React-Leaflet
* **Styling**: Tailored CSS Design System (Custom variables, glassmorphism, responsive grid)
* **Widgets**: Live Support Chatbot Widget 24/7, VietQR Payment Modal, Ad Banner Slider

---

## 📂 Cấu Trúc Thư Mục Dự Án (Project Structure)

```
agrigo-mern/
├── backend/
│   ├── server.js                      # Main Express server entry point
│   ├── uploads/                       # Thư mục chứa ảnh upload tĩnh
│   └── src/
│       ├── config/                    # Cấu hình kết nối MongoDB & Cloud
│       ├── middleware/                # Middleware Auth, Role, Rate Limit
│       ├── models/                    # Mongoose Schemas (User, Machine, Booking, Review, Ad)
│       ├── routes/                    # API Routes (Auth, Admin, Owner, Machine, Booking, AI, Upload)
│       └── utils/                     # Smart Non-Destructive Seed Data & AI Helpers
└── frontend/
    ├── public/                        # Static assets (logo.png, qr_code.jpg)
    └── src/
        ├── api.js                     # API Client wrapper với Backend Health Check
        ├── components/                # Reusable UI (Header, Footer, MachineCard, LiveSupport, AdBanner)
        ├── context/                   # AuthContext (Quản lý state đăng nhập JWT)
        └── pages/                     # App Pages (Home, Search, MachineDetail, Owner, Farmer, Admin, Profile)
```

---

## 🔑 Tài Khoản Demo Hệ Thống (Mật khẩu chung: `123456`)

| Vai Trò | Email | Quyền Hạn & Tính Năng Độc Quyền |
| :--- | :--- | :--- |
| **🌾 Nông Dân** | `farmer@agrigo.vn` | Tìm máy bằng AI / Bản đồ, Đặt lịch thuê, Thanh toán VietQR, Viết đánh giá sao |
| **🚜 Chủ Máy VIP** | `owner_vip@agrigo.vn` | Kênh Chủ máy, Đăng bài ghim bản đồ, **Nâng cấp VIP Partner**, **Báo cáo Phân tích Thị trường 11 Huyện**, **Bài đăng Banner Quảng cáo** |
| **🚜 Chủ Máy Thường** | `owner@agrigo.vn` | Đăng thiết bị, quản lý lịch bận, nhận/từ chối đơn thuê của nông dân |
| **🛡️ Quản Trị Viên** | `admin@agrigo.vn` | Dashboard tổng quan, **Duyệt máy với 🛡️ AI Check**, Gán quyền VIP, Sửa/Xóa tài khoản & máy chuyên sâu |

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy Local (Quick Start)

### Yêu Cầu Tiền Đề:
* **Node.js**: phiên bản ≥ 18.x (khuyến nghị Node 20 LTS)
* **MongoDB**: Cấu hình MongoDB Atlas Cloud URI hoặc dùng tự động In-Memory RAM.

### Bước 1: Khởi chạy Backend Server (Cổng 5000)
```bash
cd backend
npm install

# (Tùy chọn) Cấu hình biến môi trường tại file backend/.env
# MONGO_URI=mongodb+srv://...
# GEMINI_API_KEY=AIzaSy...

# Nạp dữ liệu mẫu ban đầu (Nếu DB trống)
npm run seed

# Khởi chạy server phát triển
npm run dev
```

### Bước 2: Khởi chạy Frontend React (Cổng 5173)
Mở cửa sổ terminal thứ hai:
```bash
cd frontend
npm install

# Khởi chạy giao diện React Vite
npm run dev
```

👉 Truy cập ngay trên trình duyệt: **`http://localhost:5173`**

---

## ⚙️ Cấu Hinh Biến Môi Trường (Environment Variables)

### Backend (`backend/.env`)
```env
PORT=5000
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/agrigo?retryWrites=true&w=majority
JWT_SECRET=agrigo_secret_key_2026_super_secure
GEMINI_API_KEY=AIzaSy_YOUR_GEMINI_API_KEY_HERE
CLIENT_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🌐 Triển Khai Lên Cloud (Deploy to Production)

### 1. Frontend trên Vercel:
* Thêm file `vercel.json` hỗ trợ SPA Route rewrite.
* Cấu hình Environment Variable: `VITE_API_URL = https://your-backend-service.onrender.com/api`

### 2. Backend trên Render (Free-Tier):
* Build Command: `npm install`
* Start Command: `node server.js`
* Cấu hình Environment Variables: `MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`.
* Tích hợp sẵn **`BackendHealthBanner.jsx`** tự động nhận diện và cảnh báo khởi động lạnh (Cold-Start 15-30s) trên Render Free-Tier.

---

## 🛡️ Cơ Chế Bảo Toàn Dữ Liệu (Non-Destructive Seeding)

Hệ thống được trang bị cơ chế kiểm tra dữ liệu thông minh:
* Khi Re-deploy hoặc khởi động lại Server, backend sẽ tự động truy vấn MongoDB.
* Nếu đã có sẵn người dùng hoặc máy nông nghiệp (`userCount > 0`), hệ thống sẽ **TỰ ĐỘNG BỎ QUA LỆNH SEED** để bảo toàn 100% các tài khoản mới tạo, dàn máy mới đăng, đơn hàng và hình ảnh của bạn!

---

*AGRIGO MERN Stack — Giải pháp số hóa nâng tầm nông nghiệp Việt Nam.*
