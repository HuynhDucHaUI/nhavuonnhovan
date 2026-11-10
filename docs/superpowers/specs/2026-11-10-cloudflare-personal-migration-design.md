# Chuyển Nhà vườn Nho Văn sang Cloudflare cá nhân

## Mục tiêu

Chuyển website `nhavuonnhovan.io.vn` khỏi hạ tầng ChatGPT Sites sang tài khoản Cloudflare cá nhân `duccusor01@gmail.com`, nhưng giữ nguyên giao diện, URL công khai, SEO, dữ liệu quản trị và khả năng đăng ảnh. Sau chuyển đổi, mỗi commit vào nhánh `main` của GitHub sẽ tự triển khai qua GitHub Actions.

## Trạng thái nguồn

- Website hiện chạy bằng Worker serverless, D1 và R2 do ChatGPT Sites quản lý.
- Mã nguồn có tại `HuynhDucHaUI/nhavuonnhovan`, nhánh phát hành `main`.
- D1 đang chứa `entries`, `settings`, `admin_users`, `admin_sessions`, `inventory_lots` và `inventory_movements`.
- R2 đang chứa ảnh được tham chiếu qua `/api/images/<key>`.
- DNS hiện được quản lý tại ZoneDNS; trang đang hoạt động tại `https://nhavuonnhovan.io.vn`.

## Kiến trúc đích

Tại tài khoản Cloudflare của chủ vườn sẽ tạo:

- Worker `nhavuonnhovan` chạy bundle do Vinext tạo ra.
- D1 database `nhavuonnhovan-production` với binding `DB`.
- R2 bucket `nhavuonnhovan-images` với binding `BUCKET`.
- Zone Cloudflare cho `nhavuonnhovan.io.vn`; ZoneDNS vẫn là nơi đăng ký/gia hạn tên miền, nhưng nameserver được chuyển sang Cloudflare.
- GitHub Actions workflow trên `main`, dùng `CLOUDFLARE_API_TOKEN` và `CLOUDFLARE_ACCOUNT_ID` trong GitHub Secrets.

Website vẫn chạy serverless. Khách truy cập không thấy URL, giao diện hay luồng mua hàng thay đổi.

## Quy trình chuyển dữ liệu

1. Xuất dữ liệu D1 nguồn vào tệp sao lưu cục bộ, gồm toàn bộ bảng nghiệp vụ.
2. Liệt kê các image key nội bộ được tham chiếu bởi bài viết, gallery cây quất và lô hàng.
3. Tải các ảnh công khai từ website nguồn và ghi lại cùng key vào R2 mới. Liên kết ảnh HTTPS bên ngoài giữ nguyên, không sao chép.
4. Áp các migration Drizzle vào D1 mới, sau đó nạp `entries`, `settings`, `admin_users`, `inventory_lots` và `inventory_movements`.
5. Không chuyển `admin_sessions`: mọi người dùng đăng nhập lại trên môi trường mới để tránh giữ phiên từ hạ tầng cũ.
6. Kiểm tra số bản ghi, mã lô, số lượng tồn, ảnh và tài khoản quản trị giữa nguồn/đích.

## Triển khai và kiểm thử

1. Thêm cấu hình Wrangler, script migration/import và GitHub Actions vào repository.
2. Xác thực Wrangler với tài khoản Cloudflare của chủ vườn; không ghi token vào source code hoặc chat.
3. Tạo Worker, D1 và R2 mới; deploy thử lên `*.workers.dev`.
4. Kiểm thử trên môi trường thử: public pages, sitemap/robots, đăng nhập admin, upload ảnh, bài viết, lô/tồn kho và cập nhật tồn kho.
5. Đặt giới hạn chi tiêu/quyền token tối thiểu trong Cloudflare/GitHub.

## Chuyển DNS và rollback

1. Tạo zone Cloudflare và ghi nhận nameserver do Cloudflare cấp.
2. Sao chép toàn bộ DNS record đang cần dùng, bao gồm record xác minh Google Search Console trước khi đổi nameserver.
3. Chủ vườn đổi nameserver tại ZoneDNS sang Cloudflare sau khi preview đạt.
4. Sau khi Cloudflare nhận zone hoạt động, gắn custom domain `nhavuonnhovan.io.vn` vào Worker.
5. Chỉ thực hiện cutover khi HTTPS, website, API ảnh, sitemap và đăng nhập admin đều đạt.
6. Giữ deployment ChatGPT Sites cũ không thay đổi trong ít nhất 14 ngày. Nếu có lỗi nghiêm trọng, khôi phục DNS về record/hạ tầng cũ.

## Bảo mật và vận hành

- Cloudflare API token giới hạn quyền tạo/sửa Worker, D1, R2 và deploy; lưu dưới GitHub Secret.
- Không đưa mật khẩu admin, API token hoặc dữ liệu phiên vào Git.
- Sao lưu dữ liệu D1 và R2 trước mỗi chuyển đổi lớn; giữ ít nhất một bản ngoài Cloudflare.
- GitHub Actions là luồng triển khai chuẩn. Triển khai thủ công chỉ dùng khi phục hồi khẩn cấp.

## Tiêu chí hoàn thành

- `https://nhavuonnhovan.io.vn` chạy từ Cloudflare cá nhân, với HTTPS hợp lệ.
- Dữ liệu, ảnh và chức năng công khai/quản trị trùng khớp với website hiện tại.
- Một commit thử nghiệm lên GitHub `main` tự triển khai thành công.
- Owner có thể xem Workers, D1, R2, logs và deployments trong dashboard Cloudflare cá nhân.
