# Screen List

Kiểm kê tích hợp ngày 25/10/2026, nhánh `dev`, mốc gốc `36d1d07`. Có **31 HTML vật lý: 22 màn chức năng và 9 URL cũ tương ứng**. Đây là kiểm kê mã hiện có, không phải xác nhận 22 màn đã được giảng viên duyệt. Quy tắc đề xuất 21 màn; repo tách Splash và Home nên có thêm một màn chung. Chưa tìm thấy quyết định duyệt hoặc link thiết kế thật; tất cả trạng thái duyệt dưới đây cần nhóm bổ sung.

Mỗi file HTML trong bảng nạp `css/modules/<tên>.css` và `js/modules/<tên>.js` riêng; `index.html` dùng tên `index`. Đường dẫn tính từ gốc repo. Bằng chứng nhánh → commit → PR → reviewer → OBS của **từng màn** nằm trong [Team Assignment](team-assignment.md). Tên task là quy ước mục 4.3 của quy tắc, chưa có URL thẻ Trello để xác minh đã giao thực tế.

| Mã | Vai trò | Mục tiêu / màn hình | Task | File HTML | CRUD / trạng thái | AI | SV phụ trách | Duyệt |
|---|---|---|---|---|---|---|---|---|
| SW-01 | Chung | Điểm vào / Splash | SV1-04 | `index.html` | Điều hướng theo phiên | — | SV1 | Chưa có minh chứng |
| SW-02 | Chung | Giới thiệu | SV1-04 | `pages/home.html` | Liên kết login/register | — | SV1 | Chưa có minh chứng |
| SW-03 | Chung | Đăng nhập demo | SV1-04 | `pages/login.html` | Validation / phiên / 4 role | — | SV1 | Chưa có minh chứng |
| SW-04 | Chung | Đăng ký demo | SV1-04 | `pages/register.html` | Tạo tài khoản / email trùng | — | SV1 | Chưa có minh chứng |
| SW-05 | Chung | Khôi phục demo | SV1-04 | `pages/forgot-password.html` | Đổi mật khẩu cục bộ | — | SV1 | Chưa có minh chứng |
| U01 / SW-06 | USER | Tổng quan tài chính | SV1-01 | `pages/user-finance-dashboard.html` | Tổng thu/chi, kỳ, bảng, ngưỡng | AI-2 | SV1 | Chưa có minh chứng |
| U02 / SW-07 | USER | Giao dịch | SV1-02 | `pages/user-transaction-management.html` | CRUD / tìm-lọc / validation | AI-1 | SV1 | Chưa có minh chứng |
| U03 / SW-08 | USER | Mục tiêu tiết kiệm | SV1-03 | `pages/user-saving-goals.html` | CRUD / góp tiền / tiến độ | AI-3 | SV1 | Chưa có minh chứng |
| C01 / SW-09 | COACH | Khách hàng | SV2-01 | `pages/coach-clients.html` | Xem / tìm-lọc / CRUD demo | — | SV2 | Chưa có minh chứng |
| C02 / SW-10 | COACH | Review ngân sách | SV2-01 | `pages/coach-review.html` | Nhận xét theo khách hàng / validation | — | SV2 | Chưa có minh chứng |
| C03 / SW-11 | COACH | Tài nguyên | SV2-02 | `pages/coach-resources.html` | CRUD / gửi duyệt / kết quả | — | SV2 | Chưa có minh chứng |
| M01 / SW-12 | MODERATOR | Duyệt tài nguyên | SV3-01 | `pages/moderator-resource-review.html` | Xem / duyệt / từ chối / yêu cầu sửa | — | SV3 | Chưa có minh chứng |
| M02 / SW-13 | MODERATOR | Mẫu AI | SV3-01 | `pages/moderator-ai-template-management.html` | Tạo / sửa / phiên bản / trạng thái | — | SV3 | Chưa có minh chứng |
| M03 / SW-14 | MODERATOR | Feedback | SV3-01 | `pages/moderator-feedback-center.html` | CRUD / mức độ / trạng thái / lưu trữ | — | SV3 | Chưa có minh chứng |
| A01 / SW-15 | ADMIN | Danh mục chi tiêu | SV3-02 | `pages/admin-expense-category-management.html` | Tìm-lọc / thêm-sửa / quy tắc / tạm ẩn | Dữ liệu AI-1 | SV3 | Chưa có minh chứng |
| A02 / SW-16 | ADMIN | Tài khoản / quyền | SV3-02 | `pages/admin-user-management.html` | Tạo / sửa / đổi role / bật-tắt | — | SV3 | Chưa có minh chứng |
| A03 / SW-17 | ADMIN | Hệ thống demo | SV3-02 | `pages/admin-system-dashboard.html` | Sự cố / dịch vụ / trạng thái | — | SV3 | Chưa có minh chứng |
| SW-18 | 4 role | Thông báo | SV2-03 | `pages/notifications.html` | Tìm-lọc / đã đọc / xóa | — | SV2 | Chưa có minh chứng |
| SW-19 | 4 role | Hồ sơ | SV2-03 | `pages/profile.html` | Xem / sửa / validation | — | SV2 | Chưa có minh chứng |
| SW-20 | 4 role | Cài đặt | SV2-03 | `pages/settings.html` | Lưu / xóa dữ liệu đúng owner / logout | — | SV2 | Chưa có minh chứng |
| SW-21 | Chung | Không đủ quyền | SV3-03 | `pages/403.html` | Quay về dashboard đúng role | — | SV3 | Chưa có minh chứng |
| SW-22 | Chung | Không tìm thấy | SV2-03 | `pages/404.html` | Quay về Home | — | SV2 | Chưa có minh chứng |

## Ánh xạ giữ tương thích

Không tạo lại hoặc xóa các trang cũ. Các URL sau cùng một nghiệp vụ, không được tự tính thành hai màn OBS.

| URL cũ trong pages/ | URL nghiệp vụ trong pages/ | Trạng thái |
|---|---|---|
| `user-dashboard.html` | `user-finance-dashboard.html` | Chuyển tiếp JS |
| `user-transactions.html` | `user-transaction-management.html` | Chuyển tiếp JS |
| `user-goals.html` | `user-saving-goals.html` | Chuyển tiếp JS |
| `moderator-review.html` | `moderator-resource-review.html` | Chuyển tiếp JS |
| `moderator-templates.html` | `moderator-ai-template-management.html` | Chuyển tiếp JS |
| `moderator-feedback.html` | `moderator-feedback-center.html` | Chuyển tiếp JS |
| `admin-categories.html` | `admin-expense-category-management.html` | Chuyển tiếp JS |
| `admin-users.html` | `admin-user-management.html` | Chuyển tiếp JS |
| `admin-dashboard.html` | `admin-system-dashboard.html` | Chuyển tiếp JS |

Ba tên COACH đề xuất trong quy tắc chưa có file vật lý: `coach-client-list.html` → `coach-clients.html`, `coach-budget-review.html` → `coach-review.html`, `coach-resource-management.html` → `coach-resources.html`. Menu hiện dùng các file bên phải và không có link chết. Đây là bảng ánh xạ hiện trạng; chưa tự đổi tên hoặc tạo thêm trang.

## Kiểm tra tích hợp

- Kiểm tra tĩnh: 31/31 HTML có CSS/JS riêng, viewport và không trùng ID; 224 tham chiếu local gồm 172 CSS/JS và 3 fragment đều có đích. MENU có 24 mục / 15 URL khác nhau, 4 dashboard mặc định đều tồn tại.
- Chrome headless thật, hồ sơ DEMO tạm, localhost dưới `/spendwise/`: đã mở 31 trang × 3 chiều rộng 375/768/1280px; không thấy tràn ngang toàn trang ở lượt kiểm tra trạng thái ban đầu. Đã biên dịch 34 JS, không lỗi cú pháp.
- Đã thử USER mở ADMIN → 403; chưa đăng nhập mở USER → login; nút 403 về đúng dashboard Coach; trang 404 có link về Home. Việc URL bất kỳ không tồn tại tự vào 404 còn phụ thuộc cấu hình hosting, chưa kiểm tra trên hosting.
- Regression Chrome sau sửa: **44 kiểm tra USER + 14 auth + 51 tích hợp + 21 bổ sung = 130 kiểm tra đạt**. Trong 51 có 15 kiểm tra chiều rộng trang đã có dữ liệu/modal; con số 33 ở lượt tích hợp cơ bản là tập con, không cộng thêm lần nữa.
- USER: CRUD giao dịch/mục tiêu, validation, search/filter, góp tiền, tải lại, giữ dữ liệu owner khác; ba AI thử loading/lý do/edit/accept/reject/regenerate/save. Đã gây lỗi có kiểm soát riêng cho cả ba AI để xác nhận nhánh failure và kết thúc loading.
- 21 ca bổ sung: failure Categorizer; CRUD/validation/filter thông báo; sửa/xóa khách hàng, notes, tài nguyên; template toggle/search; feedback trạng thái/xóa; dashboard sửa/xóa/validation; tắt tài khoản/chặn login/đổi role và Profile lưu/tải lại.
- Auth: đăng ký sai/đúng/trùng email, đăng nhập sai/đúng cho 4 role, đổi mật khẩu demo, tài khoản mới rỗng, logout xóa hai phiên.
- Liên thông: notes gắn clientId/coachId trong sw_coachNotes, dữ liệu USER được liên kết rõ; hai Coach không sửa danh sách của nhau; pending/rejected/approved/needs-revision và ghi chú quay lại Coach; chặn form duyệt cũ; template phiên bản, feedback mức độ/lưu trữ; demo danh mục/hệ thống chỉ nạp khi chọn.
- Reset: thử native confirm Hủy/Đồng ý qua CDP, giữ dữ liệu tài khoản khác, giữ danh mục/template dùng chung; giả lập lỗi ghi thứ hai và xác nhận khôi phục phần đã ghi. Đây là tương tác browser tự động, chưa quan sát trực quan hộp thoại.
- Lượt cuối mở lại 31 × 3 kích thước và kiểm tra thêm modal 375/768/1280px: không tràn ngang toàn trang; không JavaScript exception hoặc console.error. Kiểm tra chiều rộng DOM không thay thế đối chiếu hình ảnh với thiết kế.
- V8 trong bộ nhớ: xác nhận chuyển dữ liệu legacy của hai tài khoản khi bắt đầu migration, chặn tab có session đổi và không ghi đè JSON hỏng. Các kết quả này được tách khỏi Chrome thật.
- Chưa xác nhận thiết kế đã duyệt, trải nghiệm bàn phím/screen reader, giao diện bằng mắt trên thiết bị thật, Firefox/Safari hoặc hosting production. Không lấy kết quả Chrome trong báo cáo SV1 cũ làm kết quả phiên này.

Không đánh dấu DONE hoặc tạo link reviewer/OBS giả. Mỗi màn được duyệt cuối cùng cần video riêng và review theo vòng SV1 → SV2 → SV3 → SV1.
