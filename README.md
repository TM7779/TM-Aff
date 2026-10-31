# Kinsley Deals – web coupon affiliate

Web tĩnh (HTML/CSS/JS thuần), không cần cài đặt gì, up thẳng lên Hostinger là chạy được.

## Cấu trúc
- `index.html` – trang chủ: ô tìm kiếm cửa hàng + danh sách tất cả cửa hàng
- `category.html?c=<slug>` – trang danh mục
- `store.html?s=<slug>` – trang cửa hàng: danh sách coupon, nút **Show code**
- `about.html`, `contact.html`, `disclaimer.html` – trang giới thiệu, liên hệ, công bố affiliate
- `assets/data.js` – **toàn bộ nội dung nằm ở đây** (tên web, email, danh mục, cửa hàng, coupon)
- `assets/styles.css`, `assets/app.js` – giao diện và logic

## Thêm cửa hàng / coupon
Mở `assets/data.js`, copy một khối trong `STORES` và sửa:
- `url`: dán **link affiliate** của anh
- `logo`: đường dẫn ảnh logo (để trống thì web tự tạo chữ viết tắt có màu)
- `coupons`: mỗi dòng là một ưu đãi; để `code: ""` nếu là deal không cần mã

Coupon hết hạn (`expires` đã qua) sẽ tự ẩn.

## Cách hoạt động khi khách bấm "Show code"
1. Mã hiện ra ngay trên trang và được copy sẵn
2. Link affiliate mở trong tab mới → cookie affiliate được ghi nhận

## Đổi tên thương hiệu
Sửa `SITE.name` trong `assets/data.js`, và thay chữ "Kinsley Deals" trong thẻ `<title>` của 6 file HTML. Mỗi lần sửa CSS/JS, tăng số `?v=` trong 6 file HTML để khách không bị dính bản cũ.

## Chạy thử trên máy
```
python3 -m http.server 8765 --directory coupon-site
```
rồi mở http://localhost:8765

## Đưa lên Hostinger (Node.js)
Cần gói Hostinger có Node.js (Business hoặc Cloud).

1. **Push lên GitHub**: tạo repo trống trên github.com (không tick README), rồi:
   `git remote add origin https://github.com/<user>/<repo>.git` → `git push -u origin main`
2. **hPanel → Websites → Add website → Node.js Apps → Import Git repository**, chọn repo vừa push.
   - Entry file: `server.js`
   - Node version: 18 trở lên
   - Start command (nếu được hỏi): `npm start`
3. **Install command**: `npm install --production` (web không có thư viện nào nên bước này chạy rất nhanh)
4. **Environment variables**: thêm `CONTACT_EMAIL` = email liên hệ của anh. `PORT` Hostinger tự cấp, không cần thêm.
5. **Trỏ domain** vào app (hPanel → Domains, hoặc đổi nameserver ở nơi mua domain sang Hostinger) → **Restart** app.

Mỗi lần sửa `assets/data.js`: commit + push, rồi bấm Redeploy/Restart trong hPanel.
