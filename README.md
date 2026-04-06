# 🌿 Thực Phẩm Sạch - E-commerce Website

Website bán thực phẩm sạch, rau củ quả hữu cơ đạt chuẩn VietGAP.

## 🛠️ Tech Stack

**Backend:**
- Java 25 + Spring Boot 4.1.0
- MS SQL Server
- JWT Authentication + OAuth2 Google
- Spring Security

**Frontend:**
- ReactJS + Vite
- Tailwind CSS v4
- Axios + React Router v6

## 📁 Cấu trúc dự án
```
thucphamsach-fullstack/
├── backend/          # Spring Boot API
├── frontend/         # ReactJS App
└── README.md
```

## ⚙️ Cài đặt và chạy

### Yêu cầu
- Java 25+
- Node.js 18+
- MS SQL Server
- Maven

### Backend
```bash
cd backend

# Tạo database
# Mở SSMS → tạo database tên: ecommerce_db

# Cấu hình application.properties
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=ecommerce_db;encrypt=true;trustServerCertificate=true;
spring.datasource.username=sa
spring.datasource.password=123456

# Chạy backend
./mvnw spring-boot:run
```

Backend chạy tại: `http://localhost:8080`

### Frontend
```bash
cd frontend

# Cài dependencies
npm install

# Chạy frontend
npm run dev
```

Frontend chạy tại: `http://localhost:5173`

## 🔑 Tài khoản mặc định

| Role  | Email                    | Password  |
|-------|--------------------------|-----------|
| Admin | admin@thucphamsach.vn    | Admin@123 |

## ✨ Tính năng

### Khách hàng
- Đăng ký / Đăng nhập JWT + Google OAuth2
- Xem sản phẩm, tìm kiếm, lọc theo danh mục
- Giỏ hàng, đặt hàng, mã giảm giá
- Lịch sử đơn hàng, hủy đơn
- Cập nhật thông tin cá nhân

### Admin
- Dashboard thống kê
- Quản lý sản phẩm (CRUD + upload ảnh)
- Quản lý danh mục (sắp xếp thứ tự)
- Quản lý đơn hàng (cập nhật trạng thái)
- Quản lý người dùng (khóa/mở tài khoản)
- Quản lý mã giảm giá
- Quản lý banner trang chủ
- Quản lý đánh giá sản phẩm

## 📸 Giao diện

### Trang chủ
- Banner slider tự động
- Danh mục sản phẩm
- Sản phẩm nổi bật

### Admin Panel
- Dashboard với thống kê doanh thu
- Quản lý toàn bộ hệ thống

## 🌐 API Endpoints chính

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | /api/auth/register | Đăng ký |
| POST | /api/auth/login | Đăng nhập |
| GET | /api/products | Danh sách sản phẩm |
| GET | /api/categories | Danh sách danh mục |
| POST | /api/orders | Đặt hàng |
| GET | /api/admin/dashboard | Dashboard admin |

## 👨‍💻 Tác giả

- **Họ tên:** Võ Công Tuyền
- **GitHub:** [nezuko76](https://github.com/nezuko76)
- **Trường:** [Tên trường của bạn]
- **Môn:** J2EE - Lập trình Java Web

## 📄 License

MIT License
