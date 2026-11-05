# Quản lý bán sỉ theo lô/luống và tồn kho

## Mục tiêu

Cho phép nhà vườn quản lý khoảng 2.000 cây theo lô hoặc luống thay vì tạo một bản ghi cho từng cây. Hệ thống phải ghi nhận số lượng nhập, bán và điều chỉnh; website công khai giới thiệu các lô đang chào bán sỉ để khách liên hệ.

## Phạm vi và nguyên tắc

- Một **lô/luống** là đơn vị tồn kho và chào bán chính. Ví dụ: `LUONG-A01 – Quất chum 1,2–1,5 m` có 180 cây.
- Bản ghi **Cây quất** hiện tại tiếp tục dùng cho cây tiêu biểu/bán lẻ hoặc hình ảnh nổi bật. Nó không đại diện cho từng cây trong kho sỉ.
- Không xây dựng thanh toán trực tuyến hay giỏ hàng. Khách xem lô và liên hệ bằng điện thoại/Zalo để chốt đơn.
- Chỉ hiển thị trạng thái còn hàng và số lượng mua tối thiểu trên website công khai; số lượng tồn chính xác chỉ hiện trong quản trị.

## Dữ liệu

Thêm bảng `inventory_lots`:

- Mã lô duy nhất, tên lô, loại/dáng cây, kích thước hoặc độ tuổi, vị trí luống.
- Số lượng ban đầu, số lượng còn lại, số lượng mua tối thiểu, đơn vị (mặc định `cây`).
- Giá sỉ hoặc thông tin giá, ảnh, mô tả, trạng thái công khai/còn hàng/tạm hết hàng, ngày tạo/cập nhật.

Thêm bảng `inventory_movements`:

- Lô liên quan, loại giao dịch (`nhập`, `bán`, `điều chỉnh`), số lượng, ghi chú, thời điểm và tài khoản thao tác.
- Mỗi lần bán sẽ giảm tồn kho; nhập/điều chỉnh tăng hoặc giảm theo lý do. Không cho phép tồn kho âm.
- Khi tồn kho bằng 0, lô chuyển sang hết hàng và không còn nằm trong danh sách chào bán công khai.

## Quản trị

- Thêm menu **Lô/luống & tồn kho** cho Chủ vườn và Nhân viên.
- Trang danh sách có tìm kiếm theo mã/tên/vị trí, lọc trạng thái, phân trang và cảnh báo lô sắp hết hàng.
- Form tạo/sửa lô có ảnh, mô tả, số lượng ban đầu và mức mua tối thiểu.
- Mỗi lô có trang chi tiết, số tồn hiện tại và lịch sử giao dịch. Tạo giao dịch bán phải nhập số lượng và ghi chú tùy chọn (ví dụ tên khách/đơn hàng).
- Chủ vườn mới có quyền xóa lô; Nhân viên có thể thêm/sửa lô và ghi nhận giao dịch tồn kho.

## Website công khai

- Menu thêm **Bán sỉ theo lô** dẫn tới trang danh sách lô, có phân trang và lọc loại cây/trạng thái.
- Mỗi thẻ lô hiển thị ảnh, tên/mã, loại/kích thước, giá sỉ hoặc “Liên hệ báo giá”, mức mua tối thiểu và nút gọi/Zalo.
- Trang chi tiết lô hiển thị mô tả, vị trí tham khảo và lời mời liên hệ. Không hiển thị con số tồn chính xác.
- Trang chủ thêm phần một số lô chào bán sỉ mới nhất, tách biệt với cây quất tiêu biểu và bài viết.

## An toàn dữ liệu

- Dùng transaction/batch D1 để ghi giao dịch và cập nhật tồn kho như một thao tác nguyên tử.
- Kiểm tra quyền ở mọi server action. Không cho tồn kho âm hoặc sửa trực tiếp số lượng còn lại ngoài giao dịch điều chỉnh.
- Migration chỉ tạo bảng/chỉ mục; không thay đổi dữ liệu cây quất và bài viết hiện có.

## Kiểm thử nghiệm thu

1. Tạo lô mới 180 cây và lô xuất hiện trong quản trị, website công khai khi được xuất bản.
2. Ghi nhận bán 30 cây, tồn trong quản trị còn 150 và có dòng lịch sử bán.
3. Không thể bán vượt tồn; thao tác bị từ chối và tồn kho giữ nguyên.
4. Khi bán hết, lô không còn trong danh sách bán sỉ công khai.
5. Nhân viên không thể xóa lô; Chủ vườn có thể xóa lô chưa có giao dịch.
6. Danh sách lô công khai và quản trị có phân trang, hoạt động tốt với hàng nghìn cây được gộp theo lô.
