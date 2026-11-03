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

## Tốc độ
- Trang hiện ngay từ bản dữ liệu cửa hàng có sẵn (`assets/snapshot.js`, hoặc bản trình duyệt đã lưu lần trước), rồi mới kiểm tra Google Sheet ở phía sau; có gì khác thì trang tự cập nhật.
- Làm mới bản có sẵn sau khi sửa Sheet: `node tools/snapshot.mjs` (không đổi gì thì file giữ nguyên), rồi commit `assets/snapshot.js`.
- Phông chữ nằm trong `assets/fonts`, không tải từ Google Fonts. Ảnh Shopify có `srcset` để mỗi màn hình tải đúng cỡ.
- Phần đầu trang (logo, menu) và chữ lớn đầu trang chủ nằm sẵn trong HTML để trang không bị giật khi script chạy. Đổi tên web, menu hoặc `SITE.tagline` thì sửa `tools/static-header.py` cho khớp rồi chạy `python3 tools/static-header.py`.

## SEO (Google và khung trả lời AI của Google)
- Mỗi bài Saving Tips có: mục lục "On this page" ngay dưới ô mã, khoảng 10 câu "Questions people ask" (có câu hỏi về từng sản phẩm), mục "Sources" ghi nguồn và ngày kiểm tra, khung "Written by" ở cuối, và ngày "Updated" ở đầu bài.
- Trang chủ có mục "Questions people ask" nằm sẵn trong `index.html` (đánh dấu `data-keep` để `app.js` giữ lại).
- Sau khi sửa bài, câu hỏi hoặc mã giảm giá, chạy `python3 tools/article-seo.py`: công cụ tự viết lại mục lục, khung "Written by" và phần dữ liệu ẩn cho Google (FAQPage, BlogPosting) cho khớp với nội dung trên trang. Nhớ đổi ngày "Updated" và `<lastmod>` trong `sitemap.xml` khi sửa nội dung bài.
- Kiểm tra dữ liệu ẩn: dán link bài vào https://validator.schema.org/ hoặc https://search.google.com/test/rich-results.

## Bài Saving Tips cho cửa hàng mới
- Khi Sheet có cửa hàng mới, lịch kiểm tra hằng ngày tự viết bài mã giảm giá và bài review cho cửa hàng đó, trừ thương hiệu mà bài viết phải nói về tác dụng chữa bệnh (cai thuốc, hormone, giảm mỡ...).
- Công cụ: `python3 tools/new-article.py <file.json>`. Mã, mức giảm và link affiliate lấy từ `assets/snapshot.js` (chạy `node tools/snapshot.mjs` trước), nên luôn khớp với Sheet. Công cụ tự thêm bài vào `assets/posts.js`, `sitemap.xml`, link chéo trong các bài khác và trang About, rồi chạy `tools/static-header.py` và `tools/article-seo.py`.
- Mẫu file JSON: `tools/article-examples/` (bài Niepce). Nhớ đổi `?v=` của `posts.js` trên mọi trang sau khi thêm bài.
