# AI Usage Report

Phiên kiểm tra tích hợp: **25/10/2026**, mốc đầu `dev@36d1d07`. Công cụ: Codex trong IDE; Python chuẩn để đọc/kiểm đường dẫn, chạy HTTP localhost và điều khiển Chrome headless qua CDP; V8 trong môi trường công cụ để kiểm cú pháp và một số logic với DOM/storage giả. Không dùng framework, backend hoặc AI API trong sản phẩm.

## Prompt và phạm vi đã sử dụng

1. Người dùng yêu cầu kiểm tra SpendWise sau merge: đọc quy tắc/README/screen-list; kiểm HTML/CSS/JS và link tương đối; navigation 4 role/login/session/403/404/dữ liệu rỗng; CRUD/góp tiền/search/filter/validation/duyệt/F5/cô lập; ba AI đủ trạng thái; responsive/Console; mapping task → file → nhánh → commit → PR → reviewer → OBS. Yêu cầu “Trước tiên trả về bảng lỗi” và “KHÔNG tự git merge/push/deploy”. Nội dung tương ứng PROMPT 4 trong [quy tắc dự án](../quy%2520t%25E1%25BA%25AFc%2520trong%2520b%25C3%25A0i%2520d%25E1%25BB%25B1%2520%25C3%25A1n.md).
2. Sau bảng lỗi, người dùng xác nhận nguyên văn: “Cho phép sửa các lỗi đã xác minh trong js/main.js và các module USER/COACH/MODERATOR/ADMIN, giữ cấu trúc và giao diện hiện có.”
3. Áp dụng ràng buộc PROMPT 0 trong tài liệu: đọc trước sửa, chỉ sửa đúng phạm vi, giữ cấu trúc, báo file/dữ liệu trước khi sửa, kiểm tra lại và không tự phát hành. PROMPT 1–3 tồn tại như mẫu cho từng SV; không có lịch sử chứng minh chúng đã được dùng trước phiên này. Không ghi chúng thành prompt thực tế đã chạy.

Báo cáo cũ chỉ ghi “gợi ý cấu trúc giao diện”, “kiểm tra/đơn giản hóa HTML/CSS/JS”. Không có log để suy ra prompt, công cụ/model cụ thể hoặc phần sinh viên đã tự chỉnh ở các phiên trước. [sv1-testing.md](sv1-testing.md) là tài liệu bàn giao trước; không cộng số test của tài liệu đó vào lượt này.

## Lỗi và thay đổi tích hợp

Bảng lỗi đã được gửi trước khi sửa. Mức Cao ảnh hưởng dữ liệu/luồng; Trung bình ảnh hưởng validation/trạng thái. Các dòng sau giải thích phần AI hỗ trợ sửa; sinh viên vẫn phải tự đọc, review và giải thích được.

| Màn / lỗi | Mức | File / thay đổi đơn giản | Cách test lại / kết quả |
|---|---|---|---|
| Kho chung: migration chỉ lấy tài khoản hiện hành, có thể gán dữ liệu guest sai owner; ghi không chặn session đổi/JSON hỏng | Cao | `js/main.js`: chuyển lần đầu từ khóa cũ của tất cả tài khoản; giữ owner guest; `canWriteAppData()` đối chiếu danh tính trang; `saveUserData()` kiểm JSON trước ghi và trả boolean; `saveUsers()` khôi phục hai bản tài khoản nếu ghi lỗi | V8: A/B cùng giữ record sau migration; session đổi và JSON hỏng bị từ chối. Chrome xác nhận guard/JSON hỏng. |
| Settings xóa khóa cũ, bỏ kho USER mới | Cao | `settings.js`: lọc đúng userId/coachId trong kho chung, xóa AI/khóa legacy đúng tài khoản; chuẩn bị trước, khôi phục khi ghi lỗi | Chrome: Hủy giữ nguyên, Đồng ý xóa đúng owner, giữ owner khác/global; lỗi ghi bước hai khôi phục bước một. |
| Danh mục “Tạm ẩn” vẫn được dùng trong giao dịch mới/AI | Trung bình | `user-transaction-management.js`: tách danh mục đang dùng và danh mục lịch sử; kiểm lựa chọn AI lại trước lưu | Chrome không còn chọn danh mục ẩn cho giao dịch mới; V8 giữ category cũ để xem/lọc/sửa record lịch sử. |
| Coach thiếu liên kết khách hàng, notes sai kho, validation yếu | Cao | `coach-clients.js`: link review theo clientId, chọn liên kết tài khoản USER demo, kiểm tên/tỷ lệ/ngày. `coach-review.js`: dùng sw_coachNotes có coachId/clientId/content; giữ nhận xét reviews cũ bằng chuyển một lần; hiển thị tổng thu/chi/budget khi có accountId rõ ràng | Chrome: tỷ lệ sai/tên rỗng bị chặn, notes tạo/sửa/tải lại còn đúng khách hàng. Không tự suy tài khoản từ tên. |
| Coach chia sẻ thao tác sửa/xóa tài nguyên; chưa thấy kết quả duyệt hoặc nội dung | Cao | `coach-resources.js`: gắn/lọc coachId; kiểm owner trước sửa/xóa; thêm nội dung vào form sẵn có; pending/draft/approved/rejected/needs-revision và lý do hiển thị nhất quán | Chrome: hai Coach giữ dữ liệu riêng, gửi và sửa lại tài nguyên; kết quả từ Moderator quay về đúng Coach. |
| Quyết định duyệt từ form/danh sách cũ có thể ghi đè thay đổi mới | Cao | `moderator-resource-review.js`: so snapshot trước ghi, kiểm trạng thái hiện hành, lưu status thống nhất và nội dung trong snapshot | Chrome: sửa tài nguyên sau khi mở từ chối → form cũ không ghi đè; duyệt/từ chối/yêu cầu sửa/đưa về chờ đều chạy. |
| Danh mục và dashboard hệ thống tự có demo | Trung bình | `admin-expense-category-management.js`, `admin-system-dashboard.js`: bắt đầu rỗng; nút “Nạp dữ liệu demo” có lựa chọn, không ghi đè danh sách đang có | Chrome: không tự seed, bấm nút mới nạp và F5 giữ dữ liệu. |
| Feedback thiếu mức độ/lưu trữ trong màn hiện hành | Trung bình | `moderator-feedback-center.js`: trường mức độ, lưu trữ/khôi phục, bộ lọc lưu trữ trong giao diện sẵn có | Chrome: mức Cao lưu được, lưu trữ rồi lọc/khôi phục đúng record. |
| Profile/Thông báo lưu chuỗi trắng; các module vẫn báo thành công khi ghi thất bại | Trung bình | `profile.js` kiểm tên sau trim và ghi nhãn tài khoản demo; `notifications.js` chặn nội dung trắng/loại sai và record đã bị xóa; các module kiểm boolean lưu thành công trước đóng form/thông báo | Chrome: tên trắng bị chặn; guard/storage có thông báo lỗi và giữ dữ liệu. |
| Sáu URL Moderator/Admin cũ chạy bộ CRUD độc lập | Cao | `admin-categories/admin-users/admin-dashboard/moderator-review/moderator-templates/moderator-feedback.js`: chuyển tiếp sang module hiện hành, giữ URL/file HTML/CSS và query/hash | Chrome mở cả 31 URL dưới thư mục con; URL cũ tới đúng nghiệp vụ hiện hành. |
| Bảng màn hình/phân công/AI chưa đủ mapping | Cao với nghiệm thu | Cập nhật đúng ba tài liệu được yêu cầu; đánh dấu chưa xác minh reviewer/duyệt/OBS | Đối chiếu [Screen List](screen-list.md) và [Team Assignment](team-assignment.md); không tự điền bằng chứng giả. |

Chi tiết hàm mới: `clientOptions()` dựng danh sách khách hàng; `getNotes()` giữ nhận xét cũ và chuyển sang kho hợp đồng; `renderBudgetSummary()` chỉ tính dữ liệu accountId đã liên kết; `reviewStatus()/reviewLabel()` thống nhất trạng thái hai role; `toggleArchive()` lưu/khôi phục feedback. Các hàm `availableCategoryNames()/formCategoryNames()` giữ lịch sử nhưng chặn category tạm ẩn cho thao tác mới.

Danh sách file JavaScript sửa trong phiên:

- `js/main.js`
- `js/modules/admin-categories.js`
- `js/modules/admin-dashboard.js`
- `js/modules/admin-expense-category-management.js`
- `js/modules/admin-system-dashboard.js`
- `js/modules/admin-user-management.js`
- `js/modules/admin-users.js`
- `js/modules/coach-clients.js`
- `js/modules/coach-resources.js`
- `js/modules/coach-review.js`
- `js/modules/moderator-ai-template-management.js`
- `js/modules/moderator-feedback-center.js`
- `js/modules/moderator-feedback.js`
- `js/modules/moderator-resource-review.js`
- `js/modules/moderator-review.js`
- `js/modules/moderator-templates.js`
- `js/modules/notifications.js`
- `js/modules/profile.js`
- `js/modules/settings.js`
- `js/modules/user-transaction-management.js`

Không sửa HTML/CSS/README, không xóa file website hoặc đổi tên trang/storage key hiện hữu. Sáu module URL cũ nay chỉ chuyển tiếp; mã nghiệp vụ chạy ở module hiện hành. Thay đổi hiện còn trong working tree, chưa có commit/PR/review mới.

## Ba AI trong sản phẩm

| AI mock | Input / kiểm tra | Luồng quyết định / dữ liệu lưu | Kiểm chứng phiên này |
|---|---|---|---|
| Expense Categorizer, U02 | Mô tả, loại, ngày, số tiền; quy tắc từ sw_categories hoặc quy tắc DEMO | Loading → danh mục + lý do → accept/edit/reject/regenerate → save mới ghi giao dịch; bỏ danh mục ẩn | Chrome thử thiếu input và toàn bộ thao tác quyết định/lưu/tải lại; fault injection String.includes trên Chrome xác nhận nhánh failure |
| Spending Pattern Insight, U01 | Giao dịch trong kỳ, tối thiểu 3 khoản chi, % giảm hợp lệ | Loading → danh mục chi cao + lý do → sửa ngưỡng/chấp nhận/từ chối/tạo lại/lưu; kho sw_sv1_ai_<userId> | Chrome thử các quyết định, lưu/tải lại và fault injection Map để xác nhận failure + kết thúc loading |
| Goal Coach, U03 | Mục tiêu chưa đủ tiền/còn hạn, chu kỳ tuần/tháng, số góp mỗi kỳ | Loading → lịch góp + lý do → sửa/chấp nhận/từ chối/tạo lại/lưu; không tự chuyển tiền | Chrome thử thiếu mục tiêu, số góp quá thấp, các quyết định/lưu/tải lại; fault injection Date.toISOString xác nhận failure |

Đây là quy tắc JavaScript, không phải AI thật hoặc API thật. Cùng input có thể tạo cùng kết quả. Accept chỉ xác nhận bản nháp, Save mới ghi dữ liệu. Fault injection chỉ thực hiện trong hồ sơ/page Chrome DEMO tạm và khôi phục hàm gốc; không đưa vào mã sản phẩm.

## Kiểm thử đã chạy và giới hạn

- Tĩnh: 31 HTML có bộ CSS/JS riêng, không trùng ID; 224 tham chiếu local có đích, bao gồm 172 CSS/JS và 3 fragment. 24 menu / 15 URL riêng và 4 dashboard mặc định có file đích; không inline event handler.
- 34 JS kiểm cú pháp V8 đạt; `git diff --check` đạt.
- Browser thật: Chrome headless với HTTP localhost dưới `/spendwise/`, hồ sơ DEMO riêng. Mở 31 trang × 3 kích thước 375/768/1280px; lượt cuối không tràn ngang toàn trang, không JavaScript exception hoặc console.error.
- **130 kiểm tra đạt**: 44 USER, 14 auth, 51 tích hợp, 21 bổ sung. Trong 51 có 33 ca tích hợp cơ bản và 18 ca bổ sung (reset Hủy/lỗi/Đồng ý và 15 kiểm tra page/modal có dữ liệu theo 3 kích thước). Không cộng lại 33 thành tổng mới.
- 21 ca bổ sung kiểm failure Categorizer; CRUD/validation/filter thông báo; sửa/xóa khách hàng, notes, tài nguyên; template toggle/search; feedback trạng thái/xóa; hệ thống sửa/xóa/validation; tắt tài khoản/chặn login/đổi role và Profile lưu/tải lại.
- USER kiểm CRUD, validation số/ngày, xem/sửa/xóa, search/type filter, góp tiền, tải lại, giữ owner khác, ba AI. Auth kiểm form sai/đúng, trùng email, bốn role, khôi phục demo, USER mới rỗng và logout.
- Tích hợp kiểm notes đúng contract/client, hai Coach, toàn bộ quyết định duyệt và lý do, stale review, template phiên bản, feedback mức độ/lưu trữ, Admin sửa danh mục/tạo account, demo có lựa chọn, Profile, đổi session/JSON hỏng và reset có khôi phục.
- 403/404: USER mở ADMIN tới 403, chưa có phiên mở USER tới login, 403 về dashboard Coach; trang 404 về Home. Chưa xác minh URL bất kỳ sai tự dùng trang 404 trên hosting.
- Một số logic migration/danh mục lịch sử được chạy riêng bằng V8 + DOM/storage giả; đó không phải browser test.
- Chưa đối chiếu hình ảnh với thiết kế thật, chưa kiểm bằng mắt trên thiết bị thật/Firefox/Safari, chưa kiểm screen reader/toàn bộ hành trình bàn phím, toàn bộ biên đồng thời cho từng form Admin/Moderator, hoặc lỗi hết dung lượng trên thiết bị thật. Native confirm được trả lời bằng CDP, chưa quan sát trực quan.
- Không có backend: cô lập/role/localStorage vẫn là demo trong cùng origin/trình duyệt, không đồng bộ nhiều thiết bị.

## Lỗi trong quá trình AI hỗ trợ và cách tự kiểm chứng

AI ban đầu gắn nút demo Dashboard Admin vào selector `.panel-tools` không tồn tại trên HTML này. Chrome phát hiện TypeError khi mở trang; đã sửa tạo vùng nút quanh nút Thêm sẵn có, rồi chạy lại 31 × 3 cùng 51 kiểm tra tích hợp, không còn exception. Bộ điều khiển CDP ban đầu cũng đọc nhầm frame độ dài 127 byte; đã sửa trước khi dùng kết quả browser hoàn chỉnh. Không lấy lượt test bị gián đoạn làm kết quả đạt.

Hai agent hỗ trợ COACH/Moderator không hoàn thành lượt đọc do tool bị hủy; không tính chúng thành kiểm thử độc lập hoặc review đã xác nhận. Các bản sửa và kết quả trên do phiên chính kiểm lại. Sinh viên chưa xác nhận phần tự chỉnh/giải thích sau hỗ trợ AI; cần bổ sung bằng chứng cá nhân, reviewer thật và OBS trước nghiệm thu.

Resources cũ trong sw_resources thiếu coachId được giữ nguyên, không tự gán cho Coach đang đăng nhập; Moderator vẫn xem được, nhóm cần xác nhận owner trước khi cho Coach sửa. Nếu kho sw_* đã tồn tại từ migration cũ không đầy đủ, dữ liệu legacy vẫn giữ nguyên; không tự nhập lại để tránh khôi phục cả record người dùng đã chủ động xóa. Nhóm cần đối chiếu và chọn phục hồi có chủ đích nếu gặp trường hợp này.
