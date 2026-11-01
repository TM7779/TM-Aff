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

## Web đang chạy ở đâu
kinsleydeals.com chạy trên gói web hosting Hostinger, dạng trang web PHP/HTML (web tĩnh, không cần Node.js).

- hPanel → Trang web → kinsleydeals.com → Nâng cao → GIT: kho `TM7779/TM-Aff`, nhánh `main`, thư mục `public_html`, **Triển khai tự động** đang bật.
- Mỗi commit mới trên nhánh `main` được Hostinger tự chép vào `public_html` sau vài giây, không cần bấm gì thêm.
- `.htaccess` lo trang 404, chuyển www về kinsleydeals.com, mở link không có đuôi `.html`, giữ CSS/JS trong bộ nhớ đệm 10 phút và chặn các file không thuộc web (`server.js`, `package.json`, `README.md`, `CNAME`, `.git`).
- `server.js` và `package.json` chỉ dùng khi chạy web bằng Node.js; gói hiện tại không dùng tới.
