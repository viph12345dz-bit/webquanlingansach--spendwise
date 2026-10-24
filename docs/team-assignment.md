# Team Assignment

Đối chiếu tích hợp ngày 25/10/2026 tại `dev@36d1d07`. Phân công dưới đây theo quy tắc dự án; chưa có họ tên/MSSV hoặc thẻ Trello để xác minh. Git author không thay thế bằng chứng sinh viên tự code, PR review hoặc OBS.

| SV | Phần phụ trách | Tài khoản Git quan sát được | Reviewer theo quy tắc |
|---|---|---|---|
| SV1 | USER, index/Home, login/register/forgot; responsive USER | `viph12345dz-bit` trong commit USER | SV2 |
| SV2 | COACH, profile/settings/notifications/404; phối hợp dữ liệu | `phuquyndh-star` tạo merge commit nhánh COACH; chưa chứng minh tác giả từng màn | SV3 |
| SV3 | MODERATOR, ADMIN, 403; main/API/layout/tích hợp | `n-thien` trong commit Moderator/Admin | SV1 |

## Task → file → nhánh → commit → PR → review → OBS

Quy ước bộ file: mỗi tên màn có HTML ở `pages/`, CSS ở `css/modules/`, JS ở `js/modules/`; riêng index ở gốc. Bảng [Screen List](screen-list.md) ghi đường dẫn HTML chính xác và các URL cũ. Các commit dưới đây là **mốc mã trước sửa tích hợp**; thay đổi trong phiên này chưa commit và chưa có PR/review.

| Màn / Task | Bộ file (stem) | Nhánh có mã | Commit bộ HTML/CSS/JS | PR / merge vào dev | Reviewer thực tế / yêu cầu | OBS |
|---|---|---|---|---|---|---|
| SW-01 / SV1-04 | `index` | `feature/user-SV1` | [1bba8a1](https://github.com/viph12345dz-bit/webquanlingansach--spendwise/commit/1bba8a1) | [#1](https://github.com/viph12345dz-bit/webquanlingansach--spendwise/pull/1) / `e0966d5` | Chưa xác minh / SV2 | Chưa cung cấp |
| SW-02 / SV1-04 | `home` | `Nền chung trước nhánh` | [8ba2805](https://github.com/viph12345dz-bit/webquanlingansach--spendwise/commit/8ba2805) | Chưa tách PR riêng | Chưa xác minh / SV2 | Chưa cung cấp |
| SW-03 / SV1-04 | `login` | `feature/user-SV1` | [1bba8a1](https://github.com/viph12345dz-bit/webquanlingansach--spendwise/commit/1bba8a1) | [#1](https://github.com/viph12345dz-bit/webquanlingansach--spendwise/pull/1) / `e0966d5` | Chưa xác minh / SV2 | Chưa cung cấp |
| SW-04 / SV1-04 | `register` | `feature/user-SV1` | [1bba8a1](https://github.com/viph12345dz-bit/webquanlingansach--spendwise/commit/1bba8a1) | [#1](https://github.com/viph12345dz-bit/webquanlingansach--spendwise/pull/1) / `e0966d5` | Chưa xác minh / SV2 | Chưa cung cấp |
| SW-05 / SV1-04 | `forgot-password` | `feature/user-SV1` | [1bba8a1](https://github.com/viph12345dz-bit/webquanlingansach--spendwise/commit/1bba8a1) | [#1](https://github.com/viph12345dz-bit/webquanlingansach--spendwise/pull/1) / `e0966d5` | Chưa xác minh / SV2 | Chưa cung cấp |
| U01 / SW-06 / SV1-01 | `user-finance-dashboard` | `feature/user-SV1` | [1bba8a1](https://github.com/viph12345dz-bit/webquanlingansach--spendwise/commit/1bba8a1) | [#1](https://github.com/viph12345dz-bit/webquanlingansach--spendwise/pull/1) / `e0966d5` | Chưa xác minh / SV2 | Chưa cung cấp |
| U02 / SW-07 / SV1-02 | `user-transaction-management` | `feature/user-SV1` | [1bba8a1](https://github.com/viph12345dz-bit/webquanlingansach--spendwise/commit/1bba8a1) | [#1](https://github.com/viph12345dz-bit/webquanlingansach--spendwise/pull/1) / `e0966d5` | Chưa xác minh / SV2 | Chưa cung cấp |
| U03 / SW-08 / SV1-03 | `user-saving-goals` | `feature/user-SV1` | [1bba8a1](https://github.com/viph12345dz-bit/webquanlingansach--spendwise/commit/1bba8a1) | [#1](https://github.com/viph12345dz-bit/webquanlingansach--spendwise/pull/1) / `e0966d5` | Chưa xác minh / SV2 | Chưa cung cấp |
| C01 / SW-09 / SV2-01 | `coach-clients` | `feature/coach-SV2 (kế thừa)` | [8ba2805](https://github.com/viph12345dz-bit/webquanlingansach--spendwise/commit/8ba2805) | [#4](https://github.com/viph12345dz-bit/webquanlingansach--spendwise/pull/4) / `36d1d07` | Chưa xác minh / SV3 | Chưa cung cấp |
| C02 / SW-10 / SV2-01 | `coach-review` | `feature/coach-SV2 (kế thừa)` | [8ba2805](https://github.com/viph12345dz-bit/webquanlingansach--spendwise/commit/8ba2805) | [#4](https://github.com/viph12345dz-bit/webquanlingansach--spendwise/pull/4) / `36d1d07` | Chưa xác minh / SV3 | Chưa cung cấp |
| C03 / SW-11 / SV2-02 | `coach-resources` | `feature/coach-SV2 (kế thừa)` | [8ba2805](https://github.com/viph12345dz-bit/webquanlingansach--spendwise/commit/8ba2805) | [#4](https://github.com/viph12345dz-bit/webquanlingansach--spendwise/pull/4) / `36d1d07` | Chưa xác minh / SV3 | Chưa cung cấp |
| M01 / SW-12 / SV3-01 | `moderator-resource-review` | `feature/moderator-SV3` | [5b9e12c](https://github.com/viph12345dz-bit/webquanlingansach--spendwise/commit/5b9e12c) | [#3](https://github.com/viph12345dz-bit/webquanlingansach--spendwise/pull/3) / `8c314ac` | Chưa xác minh / SV1 | Chưa cung cấp |
| M02 / SW-13 / SV3-01 | `moderator-ai-template-management` | `feature/moderator-SV3` | [5b9e12c](https://github.com/viph12345dz-bit/webquanlingansach--spendwise/commit/5b9e12c) | [#3](https://github.com/viph12345dz-bit/webquanlingansach--spendwise/pull/3) / `8c314ac` | Chưa xác minh / SV1 | Chưa cung cấp |
| M03 / SW-14 / SV3-01 | `moderator-feedback-center` | `feature/moderator-SV3` | [5b9e12c](https://github.com/viph12345dz-bit/webquanlingansach--spendwise/commit/5b9e12c) | [#3](https://github.com/viph12345dz-bit/webquanlingansach--spendwise/pull/3) / `8c314ac` | Chưa xác minh / SV1 | Chưa cung cấp |
| A01 / SW-15 / SV3-02 | `admin-expense-category-management` | `feature/moderator-SV3` | [5b9e12c](https://github.com/viph12345dz-bit/webquanlingansach--spendwise/commit/5b9e12c) | [#3](https://github.com/viph12345dz-bit/webquanlingansach--spendwise/pull/3) / `8c314ac` | Chưa xác minh / SV1 | Chưa cung cấp |
| A02 / SW-16 / SV3-02 | `admin-user-management` | `feature/moderator-SV3` | [5b9e12c](https://github.com/viph12345dz-bit/webquanlingansach--spendwise/commit/5b9e12c) | [#3](https://github.com/viph12345dz-bit/webquanlingansach--spendwise/pull/3) / `8c314ac` | Chưa xác minh / SV1 | Chưa cung cấp |
| A03 / SW-17 / SV3-02 | `admin-system-dashboard` | `feature/moderator-SV3` | [5b9e12c](https://github.com/viph12345dz-bit/webquanlingansach--spendwise/commit/5b9e12c) | [#3](https://github.com/viph12345dz-bit/webquanlingansach--spendwise/pull/3) / `8c314ac` | Chưa xác minh / SV1 | Chưa cung cấp |
| SW-18 / SV2-03 | `notifications` | `feature/coach-SV2 (kế thừa)` | [8ba2805](https://github.com/viph12345dz-bit/webquanlingansach--spendwise/commit/8ba2805) | [#4](https://github.com/viph12345dz-bit/webquanlingansach--spendwise/pull/4) / `36d1d07` | Chưa xác minh / SV3 | Chưa cung cấp |
| SW-19 / SV2-03 | `profile` | `feature/coach-SV2 (kế thừa)` | [8ba2805](https://github.com/viph12345dz-bit/webquanlingansach--spendwise/commit/8ba2805) | [#4](https://github.com/viph12345dz-bit/webquanlingansach--spendwise/pull/4) / `36d1d07` | Chưa xác minh / SV3 | Chưa cung cấp |
| SW-20 / SV2-03 | `settings` | `feature/coach-SV2 (kế thừa)` | [8ba2805](https://github.com/viph12345dz-bit/webquanlingansach--spendwise/commit/8ba2805) | [#4](https://github.com/viph12345dz-bit/webquanlingansach--spendwise/pull/4) / `36d1d07` | Chưa xác minh / SV3 | Chưa cung cấp |
| SW-21 / SV3-03 | `403` | `feature/moderator-SV3` | [5b9e12c](https://github.com/viph12345dz-bit/webquanlingansach--spendwise/commit/5b9e12c) | [#3](https://github.com/viph12345dz-bit/webquanlingansach--spendwise/pull/3) / `8c314ac` | Chưa xác minh / SV1 | Chưa cung cấp |
| SW-22 / SV2-03 | `404` | `feature/coach-SV2 (kế thừa)` | [8ba2805](https://github.com/viph12345dz-bit/webquanlingansach--spendwise/commit/8ba2805) | [#4](https://github.com/viph12345dz-bit/webquanlingansach--spendwise/pull/4) / `36d1d07` | Chưa xác minh / SV3 | Chưa cung cấp |

**Giới hạn bằng chứng Git:** `1bba8a1` sửa 26 file USER, qua PR #1 / merge `e0966d5`; `5b9e12c` sửa 25 file Moderator/Admin/shared, qua PR #3 / merge `8c314ac`. Các bộ COACH và phần chung của SV2 có lần đổi gần nhất `8ba2805` (upload nền chung), không có commit feature riêng thể hiện code mới trong nhánh COACH. `git diff 36d1d07^1 36d1d07` và `git diff dd65179^1 dd65179` đều rỗng; PR #4 ghi nhận merge, **không chứng minh có thay đổi COACH mới**. Home cũng thuộc upload nền chung. URL PR lấy từ merge message tại local, chưa truy cập GitHub để xác minh trạng thái approval hoặc người review; người merge không mặc nhiên là reviewer.

Với mỗi màn đã được duyệt, nhóm cần thêm: URL task thật, quyết định/link thiết kế được duyệt, commit đúng phần tự làm, nhận xét review thực tế và URL video OBS. Chưa đủ cơ sở ghi màn nào DONE.

## Phạm vi sửa trong phiên tích hợp

Yêu cầu đầu tiên chỉ cho phép sửa các file nhóm đã cho phép. Trong phiên, người dùng xác nhận: “Cho phép sửa các lỗi đã xác minh trong js/main.js và các module USER/COACH/MODERATOR/ADMIN, giữ cấu trúc và giao diện hiện có.” Ba tài liệu screen-list/team-assignment/ai-usage-report được yêu cầu cập nhật ngay từ đầu.

Giữ file HTML/CSS và cấu trúc website. Chỉ sửa module liên quan lỗi tích hợp; không git merge/push/deploy, không tự tạo commit/PR, không thay sinh viên quay OBS. Thay đổi mã và kiểm thử cuối phiên được ghi trong [AI Usage Report](ai-usage-report.md).

## Việc nhóm còn phải xác nhận

- SV2 review USER; SV3 review COACH; SV1 review Moderator/Admin bằng nhận xét có nội dung. Điền danh tính reviewer thực tế sau khi xác minh PR, không sao chép “reviewer theo quy tắc” sang “đã review”.
- Chốt 21 hay 22 màn chức năng và ánh xạ tên COACH/URL cũ với giảng viên. Không tính các trang chuyển tiếp thành màn riêng để tăng số video.
- Cung cấp thiết kế thật; `design/figma-link.txt`, mockups và các liên kết trong README vẫn là placeholder. README không nằm trong ba tài liệu được chỉ định cập nhật ở phiên này.
- Chạy lại trên Live Server/thiết bị thật, xác nhận native confirm và khả năng dùng bàn phím; kiểm tra fallback 404 trên hosting khi nhóm triển khai.
