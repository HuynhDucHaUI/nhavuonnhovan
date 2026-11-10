# Kế hoạch chuyển Cloudflare cá nhân

> Spec liên quan: `docs/superpowers/specs/2026-11-10-cloudflare-personal-migration-design.md`

## 1. Chuẩn bị source để deploy độc lập

- Thêm `wrangler.toml` bản production, tách các định danh Cloudflare khỏi source bằng `CLOUDFLARE_ACCOUNT_ID`, `D1_DATABASE_ID` và tên bucket cấu hình khi deploy.
- Thêm script chạy toàn bộ migration SQL theo thứ tự, script xuất/nhập dữ liệu và script copy ảnh từ URL nguồn sang R2 đích.
- Thêm workflow GitHub Actions chỉ chạy khi push lên `main`; build, migrate và deploy với GitHub Secrets.
- Bổ sung `.gitignore` cho các bản export cục bộ và file thông tin deploy.

## 2. Xác thực và tạo tài nguyên Cloudflare

- Chạy `wrangler login`; chủ tài khoản duyệt OAuth trong trình duyệt Cloudflare đang đăng nhập.
- Xác minh account ID của `duccusor01@gmail.com`.
- Tạo D1 `nhavuonnhovan-production`, R2 `nhavuonnhovan-images` và Worker preview.
- Cập nhật binding ID/production trong cấu hình local nhưng không commit bất kỳ token nào.

## 3. Sao lưu và chuyển dữ liệu

- Đọc dữ liệu từ D1 nguồn theo các bảng trong spec, lưu backup JSON/SQL ngoài Git.
- Xây dựng manifest ảnh từ các cột `image` và JSON `gallery`; copy mỗi key `/api/images/<key>` từ nguồn vào R2 đích.
- Khởi tạo D1 đích bằng migration rồi nhập dữ liệu nghiệp vụ; bỏ `admin_sessions`.
- Đối chiếu tổng số records và ảnh; kiểm thử đăng nhập bằng tài khoản admin hiện có.

## 4. Preview và kiểm thử

- Deploy Worker preview trên `workers.dev`.
- Kiểm tra trang chủ, danh sách/quy trình chi tiết cây, SEO, sitemap, upload, admin, lô/tồn kho và gallery.
- Ghi nhận URL preview và chỉ chuyển DNS khi toàn bộ kiểm thử đạt.

## 5. DNS và cutover

- Tạo zone Cloudflare; sao chép DNS records đang dùng, đặc biệt records xác minh Google.
- Chủ vườn đổi nameserver do Cloudflare cung cấp tại ZoneDNS.
- Khi zone active, gắn custom domain cho Worker, xác nhận HTTPS và `www`/apex redirect nếu cần.
- Theo dõi bản public mới; giữ ChatGPT Sites cũ 14 ngày.

## 6. GitHub Actions và bàn giao

- Tạo Cloudflare API token tối thiểu quyền; chủ vườn thêm token và account ID vào GitHub Secrets.
- Chạy một commit deploy thử và kiểm tra log Actions.
- Bàn giao dashboard Workers, D1, R2, log, usage và quy trình backup/rollback.

## Kiểm chứng sau từng mốc

- `npm run build` và `git diff --check` sau mọi source change.
- Không thay đổi DNS trước khi preview + migration đạt.
- Không commit tokens, export database hay ảnh khách hàng.
- Có backup nguồn trước migration và có đường trả về deployment cũ.
