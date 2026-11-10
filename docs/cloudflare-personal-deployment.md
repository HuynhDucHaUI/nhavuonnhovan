# Triển khai Cloudflare cá nhân

Website được triển khai thành một Cloudflare Worker tên `nhavuonnhovan`, với:

- D1: `nhavuonnhovan-production` (binding `DB`)
- R2: `nhavuonnhovan-images` (binding `BUCKET`)
- Domain sản xuất: `nhavuonnhovan.io.vn` sau khi hoàn tất kiểm thử bản preview.

## Biến bí mật GitHub

Trong GitHub repository, vào **Settings → Secrets and variables → Actions** và tạo các repository secrets sau:

| Secret | Giá trị |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | API Token có quyền Worker Scripts, D1, R2 và Zone DNS cần thiết |
| `CLOUDFLARE_ACCOUNT_ID` | Account ID của tài khoản Cloudflare cá nhân |
| `CLOUDFLARE_D1_DATABASE_ID` | ID của D1 `nhavuonnhovan-production` |

Không đưa ba giá trị này vào mã nguồn, `.env`, ảnh chụp màn hình hoặc commit.

## Quy trình an toàn

1. Đăng nhập Wrangler bằng Cloudflare OAuth rồi tạo Worker, D1 và R2.
2. Áp các migration trong `drizzle/` với `npm run cloudflare:migrate`.
3. Sao chép dữ liệu và ảnh từ hệ thống hiện tại, rồi kiểm tra URL `workers.dev`.
4. Tạo GitHub secrets bên trên và chạy workflow **Deploy personal Cloudflare Worker** thủ công một lần.
5. Chỉ sau khi xác nhận quản trị, ảnh và nội dung chạy đúng trên preview mới chuyển nameserver/domain sang Cloudflare.

GitHub Actions tự triển khai lại khi có commit mới trên nhánh `main`; workflow tự bỏ qua nếu secrets chưa được cấu hình.
