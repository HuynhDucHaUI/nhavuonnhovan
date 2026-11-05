# Tài khoản quản trị nội bộ

## Mục tiêu

Thay thế đăng nhập ChatGPT tại `/admin` bằng tài khoản nội bộ theo username và mật khẩu; hỗ trợ nhiều tài khoản cho nhà vườn mà không thay đổi dữ liệu cây quất, bài viết hay thông tin liên hệ hiện có.

## Vai trò và quyền

- **Chủ vườn**: quản lý toàn bộ nội dung, thông tin liên hệ và tài khoản người dùng.
- **Nhân viên**: quản lý nội dung và thông tin liên hệ; không được xem hoặc thay đổi tài khoản.
- Tài khoản `admin` được khởi tạo là Chủ vườn. Mật khẩu ban đầu chỉ đi qua biến môi trường dùng một lần, không có trong mã nguồn, cơ sở dữ liệu hay thông báo giao diện.

## Trải nghiệm

- `/admin/login` có form username và mật khẩu độc lập, thông báo lỗi chung khi không hợp lệ.
- Mọi đường dẫn quản trị yêu cầu phiên đăng nhập hợp lệ. Không có phiên thì điều hướng về `/admin/login`.
- Menu bên trái thêm **Quản lý tài khoản**, chỉ hiện với Chủ vườn.
- Màn hình quản lý tài khoản hiển thị username, tên hiển thị, vai trò, trạng thái và lần hoạt động gần nhất. Chủ vườn có thể tạo, sửa vai trò, khóa/mở khóa, đặt lại mật khẩu và xóa nhân viên.
- Không cho phép xóa hoặc khóa tài khoản Chủ vườn cuối cùng; người dùng không thể tự xóa/khóa chính mình.
- Đăng xuất xóa phiên hiện tại. Trang quản lý tài khoản có thao tác đổi mật khẩu cho chính tài khoản đang đăng nhập.

## Dữ liệu

Thêm hai bảng D1 qua migration bất biến:

- `admin_users`: `id`, `username` (duy nhất), `display_name`, `password_hash`, `password_salt`, `role` (`owner` hoặc `staff`), `status` (`active` hoặc `locked`), `failed_login_count`, `locked_until`, `last_login_at`, `created_at`, `updated_at`.
- `admin_sessions`: `id`, `user_id`, `token_hash`, `expires_at`, `last_seen_at`, `created_at`.

Tất cả dữ liệu nội dung hiện có giữ nguyên. Tài khoản `admin` chỉ seed khi bảng tài khoản chưa có bản ghi nào.

## Bảo mật

- Mật khẩu được dẫn xuất bằng Web Crypto PBKDF2-SHA-256, salt riêng cho từng người dùng và số vòng lặp cao; không bao giờ lưu mật khẩu gốc.
- Cookie phiên: token ngẫu nhiên, chỉ lưu bản băm token trong D1, `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`.
- Phiên hết hạn sau 8 giờ không hoạt động; mỗi yêu cầu quản trị hợp lệ cập nhật thời gian hoạt động.
- Sau 5 lần đăng nhập sai liên tiếp, khóa đăng nhập 15 phút; thông báo luôn chung chung để không lộ username có tồn tại hay không.
- Tất cả server action và API upload dùng cùng hàm xác thực/kiểm tra quyền nội bộ; loại bỏ phụ thuộc vào header ChatGPT.
- Các giá trị bí mật `AUTH_SESSION_SECRET` và mật khẩu seed ban đầu được cấu hình bằng biến môi trường trên Sites. Sau khi đã tạo `admin`, mật khẩu seed không còn được đọc hay hiển thị.

## Thành phần mã nguồn

- `db/schema.ts` và migration mới: định nghĩa người dùng, phiên đăng nhập.
- `app/admin/auth.ts`: xác thực phiên, kiểm tra vai trò, tạo/hủy phiên, băm và kiểm tra mật khẩu.
- `app/admin/login/*`: form đăng nhập và server action.
- `app/admin/users/*`: trang và các action quản lý người dùng.
- `app/admin/page.tsx`, `app/admin/actions.ts`, `app/api/upload/route.ts`: dùng xác thực nội bộ.
- `app/admin/entry-manager.tsx`: nhận vai trò hiện tại và hiển thị menu Quản lý tài khoản phù hợp.

## Kiểm thử và nghiệm thu

1. `admin` đăng nhập bằng username/mật khẩu riêng; không còn chuyển sang `auth.openai.com`.
2. Chủ vườn tạo nhân viên, nhân viên đăng nhập và quản lý nội dung thành công.
3. Nhân viên không truy cập được trang hay action quản lý tài khoản.
4. Khóa/xóa/reset mật khẩu có hiệu lực ngay; phiên bị thu hồi khi khóa hoặc đặt lại mật khẩu.
5. Sai mật khẩu đủ 5 lần bị khóa tạm; hết thời hạn có thể thử lại.
6. Build TypeScript và build Sites thành công trước khi xuất bản.
