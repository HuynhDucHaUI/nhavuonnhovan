# SEO toàn quốc và hiệu năng website Nhà vườn Nho Văn

## Mục tiêu

- Giảm thời gian phản hồi của website public và khu quản trị khi số cây, lô hàng và bài viết tăng.
- Giúp Google tìm thấy, thu thập và hiểu đúng website `https://nhavuonnhovan.io.vn`.
- Ưu tiên khách mua sỉ trên toàn quốc, nhưng vẫn nêu rõ địa chỉ vườn tại Văn Giang, Hưng Yên.
- Không để cache làm khách thấy một lô đã hết hàng vẫn còn được chào bán.

## Phạm vi

### Public website

- Thay thế các truy vấn đọc toàn bộ nội dung rồi lọc trong bộ nhớ bằng các truy vấn D1 có điều kiện, giới hạn và phân trang.
- Trang chủ chỉ đọc các bản ghi mới nhất cần để hiển thị; danh sách cây, bài viết và lô sỉ truy vấn một trang dữ liệu tại một thời điểm.
- Thêm các chỉ mục D1 cho nội dung/lô công khai và thứ tự ngày tạo để phục vụ danh sách, sitemap và metadata.
- Áp dụng cache phía máy chủ ngắn hạn cho dữ liệu công khai. Các Server Action tạo, sửa, xuất bản, bán hoặc điều chỉnh tồn phải xóa cache/tag liên quan ngay lập tức.
- Ảnh thẻ danh sách sử dụng `loading="lazy"`, `decoding="async"`, `sizes` phù hợp; ảnh đầu trang và ảnh chi tiết vẫn có thể tải ưu tiên khi cần.

### Admin

- Danh sách nội dung và lô dùng tìm kiếm, lọc, phân trang trên D1 thay vì gửi toàn bộ bản ghi vào Client Component.
- Dashboard chỉ lấy số đếm tổng hợp cần thiết; không tải mô tả hoặc ảnh của mọi bản ghi.
- Giữ nguyên quyền hiện có: chỉ tài khoản hợp lệ mới đọc dữ liệu quản trị; thao tác thay đổi tồn kho luôn qua Server Action.

## SEO kỹ thuật

- Khai báo `metadataBase` là `https://nhavuonnhovan.io.vn`, title template, mô tả tiếng Việt, canonical URL và metadata Open Graph/Twitter ở layout gốc.
- Mỗi trang cây, bài viết và lô sỉ có metadata động: tiêu đề, mô tả ngắn, canonical, ảnh đại diện nếu có và trạng thái indexable chỉ khi bản ghi được công khai.
- Tạo `/robots.txt`: cho phép crawler public, chặn `/admin` và `/api`, đồng thời công bố đường dẫn sitemap.
- Tạo `/sitemap.xml` gồm trang chủ, danh sách public và toàn bộ cây/bài viết/lô sỉ đang được công khai, có `lastModified` từ ngày tạo/cập nhật.
- Nhúng JSON-LD `LocalBusiness` cho Nhà vườn Nho Văn: tên, URL, số điện thoại, địa chỉ tại Văn Giang/Hưng Yên, toạ độ/chỉ đường khi có và mô tả bán quất cảnh/bán sỉ toàn quốc.
- Nội dung hiển thị trên trang chủ và trang lô sỉ dùng tự nhiên các cụm: `quất cảnh Văn Giang`, `nhà vườn quất Nho Văn`, `bán sỉ quất cảnh toàn quốc`. Không chèn lặp từ khóa hoặc hứa hẹn giao hàng ngoài khả năng của nhà vườn.

## Dữ liệu và cache

```
Admin thay đổi dữ liệu
        │
        ├─ ghi D1 + lịch sử tồn kho
        └─ revalidate cache/tag public liên quan
                                      │
Googlebot / khách truy cập ──> trang SSR + dữ liệu giới hạn ──> D1/index
                                      │
                                      └─ sitemap + canonical + structured data
```

- Dữ liệu lô public chỉ bao gồm trường được phép công khai, không bao gồm số tồn chính xác.
- Lô có tồn bằng 0 hoặc không công khai bị loại khỏi truy vấn public, sitemap và metadata indexable.
- Cache hết hạn ngắn và bị vô hiệu khi thay đổi để bảo đảm tốc độ nhưng không làm sai trạng thái lô.

## Kiểm thử nghiệm thu

1. Trang chủ, danh sách cây, bài viết, lô sỉ trả về đúng dữ liệu công khai khi có nhiều bản ghi; phân trang không tải toàn bộ danh sách.
2. Bán hết một lô khiến lô biến mất khỏi `/lo-si`, sitemap và metadata public sau khi action hoàn tất.
3. Trang admin vẫn yêu cầu đăng nhập; tìm kiếm/lọc không đưa dữ liệu private ra HTML public.
4. `/robots.txt` và `/sitemap.xml` trả về 200; sitemap chỉ có URL của tên miền chính thức.
5. HTML của trang công khai có title, description, canonical và JSON-LD phù hợp; một URL lô/bài đã xuất bản có metadata riêng.
6. Kiểm tra lại response và build trước khi xuất bản; sau đó gửi sitemap trên Google Search Console.

## Ngoài phạm vi

- Không bảo đảm thứ hạng hoặc thời gian Google hiển thị kết quả.
- Không thêm thanh toán trực tuyến, theo dõi quảng cáo, hay tự động đăng Google Business Profile.
- Xác minh Search Console và gửi sitemap là thao tác cần chủ sở hữu tên miền thực hiện trong tài khoản Google của mình.
