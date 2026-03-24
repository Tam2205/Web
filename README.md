# LacaFood - Hệ thống đặt đồ ăn trực tuyến

LacaFood là ứng dụng web full-stack cho phép khách hàng đặt món ăn, thanh toán, theo dõi đơn hàng và shipper giao hàng theo thời gian thực với bản đồ như Grab.

## Tính năng chính

### Khách hàng
- Đăng ký, đăng nhập, cập nhật thông tin cá nhân
- Xem thực đơn, chi tiết món ăn, thêm vào giỏ hàng
- Đặt hàng, chọn phương thức thanh toán (COD hoặc QR Code)
- Tự động tính phí giao hàng dựa trên địa chỉ (tích hợp bản đồ, không cần nhập km)
- Xem trạng thái đơn hàng, theo dõi shipper trên bản đồ khi đang giao

### Quản trị viên
- Quản lý món ăn (thêm, sửa, xóa)
- Quản lý đơn hàng, cập nhật trạng thái
- Quản lý nhân viên giao hàng (thêm, xóa, xem thống kê)

### Shipper
- Xem danh sách đơn hàng được giao
- Xác nhận hoàn thành giao hàng
- Xem lộ trình giao hàng trên bản đồ

## Công nghệ sử dụng
- **Frontend:** React (CRA), React Router, Context API, Axios, Leaflet (bản đồ), qrcode.react
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT Auth
- **Map & Geocoding:** OpenStreetMap, Nominatim, OSRM Routing

## Cài đặt & chạy thử

### 1. Clone dự án
```bash
git clone https://github.com/Tam2205/Web.git
cd Web/lacafood
```

### 2. Cài đặt backend
```bash
cd backend
npm install
# Tạo file .env với biến MONGO_URI
node seed.js # (Tùy chọn) Tạo dữ liệu mẫu
npm start
```

### 3. Cài đặt frontend
```bash
cd ../frontend
npm install
npm start
```

### 4. Tài khoản mẫu
- Admin: `admin@lacafood.com` / `admin123`
- User: `user@lacafood.com` / `user123`
- Shipper: `shipper@lacafood.com` / `shipper123`

## Ghi chú
- Địa chỉ cửa hàng mặc định: Quận 1, TP.HCM
- Khi nhập địa chỉ giao hàng, hệ thống sẽ tự động tìm tọa độ và tính phí ship, hiển thị bản đồ lộ trình
- Demo QR code chuyển khoản: VpBank, Vũ Xuân Tâm, 0397203124

## Ảnh minh họa
![LacaFood UI](https://i.imgur.com/2Qw1QwB.png)

---

© 2026 LacaFood. Dự án mẫu học tập, không dùng cho mục đích thương mại.
