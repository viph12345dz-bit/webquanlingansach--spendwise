# QUY TẮC TRONG BÀI DỰ ÁN

**Dự án:** SpendWise – Quản lý ngân sách và thói quen chi tiêu  
**Học phần:** Phát triển ứng dụng Web cơ bản (CSE122)  
**Số thành viên:** 03 sinh viên (SV1, SV2, SV3)  
**Tài liệu căn cứ:** `BTL-18_spendwise-quan-ly-ngan-sach-va-thoi-quen-chi-tieu(1).md`, đặc biệt **mục 14–24**, đồng thời đối chiếu mục 8–13 về giao diện, CRUD và AI.  
**Mục đích:** Phân chia việc **phải code** cho từng sinh viên, thống nhất quy tắc làm việc GitHub và cung cấp câu lệnh có thể dán vào AI trong VS Code.

> **Phân biệt:** Những nguyên tắc bắt buộc bên dưới được rút từ đề BTL. Danh sách **21 màn hình**, cách chia màn hình dùng chung, đường dẫn file, tên task và câu lệnh AI là **đề xuất triển khai của nhóm**; nhóm cần đưa bảng kiểm kê màn hình và bản thiết kế cho giảng viên duyệt trước khi coi đây là phạm vi chính thức. Đề nhấn mạnh **đủ luồng nghiệp vụ quan trọng hơn số màn hình**.

---

## 1. QUY TẮC BẮT BUỘC CHO CẢ 3 SINH VIÊN

1. **Mỗi SV đều phải tự viết HTML, CSS và JavaScript**, làm một luồng từ giao diện → dữ liệu → tương tác → responsive → kiểm thử → nhánh Git → commit/PR → OBS. **Không** chia kiểu SV1 chỉ HTML, SV2 chỉ CSS, SV3 chỉ JavaScript; **không** chỉ dùng AI tạo code rồi nộp khi bản thân không giải thích được.
2. **Cả nhóm cùng làm một website**, không tạo ba website độc lập. Phải có điều hướng xuyên suốt; các màn dùng chung phong cách giao diện, session mô phỏng và định dạng dữ liệu.
3. Giữ định dạng GitHub đã thống nhất: `index.html` ở gốc; các màn khác trong `pages/`; CSS trong `css/` và `css/modules/`; JS trong `js/` và `js/modules/`; có `assets/`, `design/`, `docs/`, `README.md`.
4. **Mỗi trang nghiệp vụ:** một file `.html`, một file `.css` và một file `.js` *riêng*; có thể nạp thêm file CSS/JS dùng chung để tránh lặp. Không đặt toàn bộ JS/CSS vào HTML và **không gộp CSS/JS thành một dòng**.
5. Viết đơn giản cho người mới: HTML semantic (`header`, `nav`, `main`, `section`, `form`, `label`, `input`, `button`, `table` khi cần); CSS Flexbox/Grid cơ bản và media query; JS `let`, `const`, `function`, `if/else`, vòng lặp, mảng, DOM, `addEventListener`, `localStorage`. Không cần React, TypeScript, backend hay AI thật để hoàn thành bản nguyên mẫu theo đề.
6. Mỗi thao tác phải thực sự làm việc: mở form/modal, kiểm tra dữ liệu, thêm/xem/sửa/xóa hoặc cập nhật trạng thái, tìm kiếm/lọc, thông báo thành công/lỗi, hiển thị dữ liệu rỗng; tuyệt đối không có nút “trang trí” mà không xử lý.
7. Dữ liệu nghiệp vụ do người dùng nhập; tránh viết cố định các số tiền/tài khoản trên giao diện thực. Chỉ dùng mock/seed có gắn nhãn **dữ liệu demo** và lưu vào `localStorage`/JSON giả lập theo yêu cầu Frontend.
8. Tối thiểu **3 trải nghiệm AI mô phỏng**: (1) Expense Categorizer, (2) Spending Pattern Insight, (3) Goal Coach. Mỗi tính năng có luồng **Nhập → kiểm tra → đang xử lý → kết quả + lý do → chấp nhận/sửa/từ chối/tạo lại → lưu hoặc bỏ qua**, cùng nhánh **không đủ dữ liệu/thất bại**. Không giới thiệu chúng là AI thật nếu chỉ là quy tắc JavaScript.
9. Thiết kế theo bản Canva/Figma nhóm đã chọn và có responsive desktop/mobile; kiểm tra bàn phím, nhãn form, độ tương phản và màn hình nhỏ.
10. **Không xóa/sửa code thành viên khác** hoặc đổi tên file/storage key dùng chung khi chưa báo và được người phụ trách tích hợp đồng ý. Trước khi sửa phải đọc code hiện có.
11. Mỗi màn phải có bằng chứng: người phụ trách, task, nhánh, commit rõ nghĩa, PR có review, kiểm thử và **01 video OBS cho mỗi giao diện thực tế đã duyệt**. Không mặc định chỉ quay 12 video nếu bảng kiểm kê cuối có nhiều hơn 12 màn.
12. Không sử dụng thông tin tài chính hoặc mật khẩu thật để thử nghiệm. `localStorage` và kiểm tra vai trò ở trình duyệt chỉ là **mô phỏng**, không phải bảo mật/thống nhất tài khoản đa thiết bị như dịch vụ Internet thật.

---

## 2. PHÂN CÔNG CHÍNH – THEO MỤC 14 CỦA ĐỀ

| Sinh viên | Mảng chịu trách nhiệm chính (theo đề) | Trách nhiệm phối hợp (theo đề và cách nhóm triển khai) | Người review chéo |
|---|---|---|---|
| **SV1** | **USER**: giao dịch, mục tiêu, dashboard | Một phần màn chung: trang đầu, đăng nhập/đăng ký; **responsive và kiểm thử giao diện USER** | **SV2** review PR SV1 |
| **SV2** | **COACH**: khách hàng, review ngân sách, tài nguyên | Màn chung hồ sơ/thông báo/cài đặt; **dữ liệu giả lập, tương tác JavaScript, kiểm thử liên thông** | **SV3** review PR SV2; SV2 review SV1 |
| **SV3** | **MODERATOR + ADMIN** | **Tích hợp bố cục/điều hướng/chia quyền, màn 403, build & phát hành; kiểm tra tính nhất quán** | **SV1** review PR SV3; SV3 review SV2 |

**Lưu ý cân đối:** SV3 có nhiều nghiệp vụ vận hành, nên SV1 và SV2 nhận thêm màn dùng chung và hỗ trợ test/tích hợp. Nhóm có thể điều chỉnh theo độ khó thực tế nhưng **không** để ai chỉ lo Git/thiết kế/tài liệu mà không code HTML+CSS+JS. Mỗi bạn phải có phần hoạt động độc lập để trình diễn.

### 2.1. Bảng giao diện, người code và bộ 3 file

Quy ước: đường dẫn mỗi dòng là **file HTML**; CSS tương ứng là `css/modules/<tên>.css`, JS là `js/modules/<tên>.js`, trừ `index.html` dùng `css/modules/index.css` và `js/modules/index.js`.

| Mã | SV | Trang HTML phải code | Nhiệm vụ chính | Liên quan AI |
|---|---|---|---|---|
| U01 | SV1 | `pages/user-finance-dashboard.html` | 4 thẻ/tổng quan giao dịch-mục tiêu; số liệu thật tính từ mock/LocalStorage, bộ lọc và bảng/biểu đồ | **AI-2 Spending Pattern Insight** |
| U02 | SV1 | `pages/user-transaction-management.html` | Thêm/xem/sửa giao dịch, tìm kiếm/lọc, validation, lưu dữ liệu; khuyến khích thêm xóa để hoàn thiện CRUD | **AI-1 Expense Categorizer** |
| U03 | SV1 | `pages/user-saving-goals.html` | Thêm/xem/sửa/xóa mục tiêu, góp tiền, tính %, kỳ hạn/trạng thái, tìm kiếm/lọc, lưu dữ liệu | **AI-3 Goal Coach** |
| C01 | SV2 | `pages/coach-client-list.html` | Xem/tìm/lọc danh sách khách hàng demo; mở xem chi tiết, trạng thái rỗng | — |
| C02 | SV2 | `pages/coach-budget-review.html` | Tạo/xem/sửa nhận xét `coachNotes`, xem thu/chi/budget giả lập, validation | — |
| C03 | SV2 | `pages/coach-resource-management.html` | Tạo/xem/sửa/xóa/lưu trữ tài nguyên; lưu trạng thái nháp/chờ duyệt/đã duyệt | Gắn với duyệt nội dung |
| M01 | SV3 | `pages/moderator-resource-review.html` | Danh sách tài nguyên từ Coach, xem, duyệt/từ chối/yêu cầu sửa, có lý do | — |
| M02 | SV3 | `pages/moderator-ai-template-management.html` | Tạo/xem/sửa mẫu prompt AI, phiên bản/trạng thái, tìm/lọc | Kiểm duyệt mẫu AI |
| M03 | SV3 | `pages/moderator-feedback-center.html` | Tạo/xem/sửa/xóa/lưu trữ feedback; thay trạng thái xử lý và mức độ | — |
| A01 | SV3 | `pages/admin-expense-category-management.html` | Xem/tìm/lọc danh mục + quy tắc; có thể bổ sung CRUD nếu nhóm thống nhất mở rộng | Dữ liệu danh mục dùng cho U02 |
| A02 | SV3 | `pages/admin-user-management.html` | Tạo/xem/sửa người dùng mẫu hoặc đổi/vô hiệu hóa vai trò mô phỏng; validation | — |
| A03 | SV3 | `pages/admin-system-dashboard.html` | Bảng trạng thái/tình trạng hệ thống mô phỏng; cập nhật/sửa/xóa mục cấu hình hoặc sự cố khi cần để thể hiện nghiệp vụ | — |

**12 màn trên là danh sách nền tảng của mục 8**; chức năng CRUD tối thiểu lấy từ bảng đó, các thao tác bổ sung trong mô tả là **đề xuất của nhóm**.

### 2.2. Các màn dùng chung được giao thêm (ĐỀ XUẤT, phải duyệt)

| SV | Trang | Việc phải làm |
|---|---|---|
| SV1 | `index.html` | Trang giới thiệu/điểm vào website; có liên kết đi đăng nhập/đăng ký |
| SV1 | `pages/login.html` | Form đăng nhập giả lập; báo lỗi đúng/sai; điều hướng theo role |
| SV1 | `pages/register.html` | Form đăng ký demo; báo trùng email, thiếu thông tin, xác nhận mật khẩu |
| SV1 | `pages/forgot-password.html` | Giao diện khôi phục demo; **không tuyên bố gửi email thật** nếu không có dịch vụ mail |
| SV2 | `pages/profile.html` | Xem/sửa hồ sơ giả lập |
| SV2 | `pages/settings.html` | Lưu lựa chọn giao diện; đăng xuất mô phỏng; không làm nút 2FA “thật” giả |
| SV2 | `pages/notifications.html` | Xem/lọc/đánh dấu đã đọc thông báo |
| SV2 | `pages/404.html` | Trang lỗi không tìm thấy + nút quay về |
| SV3 | `pages/403.html` | Trang không đủ quyền + nút quay về dashboard đúng role |

**Tổng đề xuất:** 12 màn nền tảng + 9 màn dùng chung = **21 trang HTML**, phân bổ **SV1: 7, SV2: 7, SV3: 7** (không đồng nghĩa khối lượng ngang nhau); số thực tế do **bảng kiểm kê cuối được giảng viên duyệt** quyết định. Splash/Loading có thể là trạng thái trong `index.html`, không nhất thiết phải tách một HTML chỉ để tăng số trang.

### 2.3. Mỗi người phải code gì cụ thể?

**SV1 – USER (việc nhất định phải xong)**

- Viết HTML/CSS/JS riêng cho 3 trang U01–U03, có thể mang sang web bản Goal đã làm để tái sử dụng **sau khi tự đọc hiểu và chỉnh lại tên file/đường dẫn**.
- Làm login/register/forgot/index; liên kết được màn USER sau đăng nhập; dữ liệu USER rỗng lúc bắt đầu, không tự xuất hiện giao dịch/mục tiêu giả.
- Viết bộ hàm JS cơ bản: thêm/sửa/xóa giao dịch, lưu/đọc `localStorage`, tính tổng thu/chi, % tiết kiệm, trạng thái quá hạn, hiển thị bảng, search/filter.
- Triển khai 3 AI mô phỏng đầy đủ trạng thái tương tác, **không chỉ in ra lời khuyên rồi thôi**.
- Test responsive 375px/768px/desktop; chuyển trang và F5 vẫn giữ dữ liệu trong cùng trình duyệt.
- Đầu ra để nghiệm thu: 7 bộ trang (nếu danh sách chung được duyệt), demo U01→U02→U03; ít nhất 1 PR được SV2 review.

**SV2 – COACH + DATA (việc nhất định phải xong)**

- Viết HTML/CSS/JS riêng cho C01–C03; form review/notes và CRUD tài nguyên có dữ liệu thật (mock/LocalStorage).
- Làm profile, settings, notifications, 404; không tạo menu dẫn đến trang chưa tồn tại.
- Chịu trách nhiệm phối hợp `js/api.js` với SV3: thống nhất cách đọc/ghi dữ liệu dùng chung; thêm ghi chú Coach phải hiện sau reload.
- Đảm bảo tài nguyên “gửi duyệt” có thể xuất hiện ở danh sách của Moderator **trong cùng trình duyệt**, và thay đổi duyệt sẽ hiển thị lại bên Coach.
- Review PR của SV1: chạy lại test U01–U03, đặc biệt validation, dữ liệu rỗng, AI có nút chấp nhận/từ chối.
- Đầu ra nghiệm thu: 7 bộ trang dự kiến, demo C01→C02→C03, ít nhất 1 PR được SV3 review.

**SV3 – MODERATOR + ADMIN + INTEGRATION (việc nhất định phải xong)**

- Viết HTML/CSS/JS riêng cho M01–M03, A01–A03; làm `pages/403.html`.
- Tạo **bố cục chung**: header, sidebar theo role, topbar, hệ màu/spacing của `css/style.css`, responsive chung; thống nhất với hai bạn trước khi cả nhóm code.
- Chịu trách nhiệm `js/main.js` (menu/điều hướng/session/role, hàm chung) và phối hợp API mô phỏng `js/api.js` với SV2; chặn UI không đúng role **chỉ ở mức demo**.
- Duyệt tài nguyên của Coach, quản trị danh mục, quản lý người dùng demo, bảng theo dõi trạng thái hệ thống; báo lỗi/đang chờ/hoàn thành khi phù hợp.
- Tích hợp từ `dev`, sửa link tương đối để GitHub Pages chạy từ tên repo (không hardcode `/pages/...` tính từ domain root).
- Review PR SV2 và tổng kiểm tra tất cả 4 role sau khi merge.
- Đầu ra nghiệm thu: 7 bộ trang dự kiến, demo C03→M01 và A01→U02, merge/dev→main theo PR.

---

## 3. CẤU TRÚC THƯ MỤC CHUNG – GIỮ ĐỊNH DẠNG GITHUB

```text
cse122-spendwise-teamXX/
├── index.html
├── README.md
├── .gitignore
├── quy tắc trong bài dự án.md       <-- FILE NÀY
├── docs/
│   ├── project-proposal.md
│   ├── roles-and-features.md
│   ├── screen-list.md
│   ├── team-assignment.md
│   └── ai-usage-report.md
├── design/
│   ├── figma-link.txt
│   └── mockups/
├── pages/
│   ├── user-finance-dashboard.html
│   ├── user-transaction-management.html
│   ├── user-saving-goals.html
│   ├── coach-client-list.html
│   ├── coach-budget-review.html
│   ├── coach-resource-management.html
│   ├── moderator-resource-review.html
│   ├── moderator-ai-template-management.html
│   ├── moderator-feedback-center.html
│   ├── admin-expense-category-management.html
│   ├── admin-user-management.html
│   ├── admin-system-dashboard.html
│   └── ... (màn chung nếu được duyệt)
├── css/
│   ├── style.css                  <-- phần dùng chung, SV3 quản lý
│   ├── responsive.css             <-- chung, SV3 quản lý; SV1 hỗ trợ test
│   └── modules/
│       ├── user-saving-goals.css  <-- mỗi trang có CSS riêng
│       ├── coach-resource-management.css
│       └── ...
├── js/
│   ├── main.js                    <-- chung, SV3 quản lý
│   ├── api.js                     <-- giao ước dữ liệu, SV2 + SV3
│   └── modules/
│       ├── user-saving-goals.js   <-- mỗi trang có JS riêng
│       ├── coach-resource-management.js
│       └── ...
└── assets/
    ├── images/
    ├── icons/
    └── data/
        └── seed-data.json         <-- dữ liệu DEMO tùy chọn
```

- Ví dụ 1 trang chuẩn: `pages/user-saving-goals.html` + `css/modules/user-saving-goals.css` + `js/modules/user-saving-goals.js`.
- Trong HTML ở `pages/`, dẫn file theo đường dẫn tương đối: `../css/style.css`, `../css/modules/user-saving-goals.css`, `../js/main.js`, `../js/api.js`, `../js/modules/user-saving-goals.js`. `index.html` ở gốc dùng `css/...` và `js/...`.
- **Thứ tự script:** `main.js` → `api.js` → file JS riêng, đều có `defer` để DOM tải xong mới chạy; tránh gọi hàm trước khi định nghĩa hoặc viết tên hàm trùng nhau.
- **Mặc định không đổi tên** các 12 trang có trong mục 8. Nếu repo đã có cách đặt tên khác, lập bảng ánh xạ và thống nhất trước khi dùng AI đổi tên tất cả.
- Các thư mục rỗng nên có `.gitkeep` để GitHub ghi nhận. Giữ README và assets dù hiện chưa có ảnh.

### 3.1. Hợp đồng dữ liệu dùng chung – phải thống nhất TRƯỚC khi code

Đề yêu cầu các thực thể ít nhất gồm `transactions`, `categories`, `budgets`, `goals`, `coachNotes`, `resources`. Nhóm **đề xuất** thêm `users`, `feedback`, `notifications`, `aiTemplates`, `session` để đáp ứng luồng được duyệt.

| Khóa localStorage đề xuất | Kiểu | Người cập nhật chính | Trang đọc |
|---|---|---|---|
| `sw_transactions` | Mảng `{id,userId,date,type,category,amount,note}` | SV1 | Dashboard, giao dịch, Coach review (nếu được phép) |
| `sw_goals` | Mảng `{id,userId,name,target,saved,deadline}` | SV1 | Mục tiêu, dashboard, Goal Coach |
| `sw_categories` | Mảng `{id,name,group,keywords}` | SV3 | Admin danh mục, USER giao dịch |
| `sw_budgets` | Mảng `{id,userId,period,limit}` | SV2 thống nhất cùng SV1 | Coach review, dashboard nếu có |
| `sw_coachNotes` | Mảng `{id,clientId,coachId,content,status}` | SV2 | Coach review |
| `sw_resources` | Mảng `{id,coachId,title,content,status,reviewNote}` | SV2 tạo, SV3 duyệt | Coach tài nguyên, Moderator review |
| `sw_users` | Mảng tài khoản **demo** có `{id,name,email,role}` và thông tin giả lập nếu cần | SV1/SV3 | Auth demo, Admin người dùng, profile |
| `sw_session` | Object `{userId,role}` hoặc `null` | SV1/SV3 | Các màn theo role |
| `sw_aiTemplates`, `sw_feedback`, `sw_notifications` | Mảng record demo có ID | SV3/SV2 | Các trang liên quan |

**Quy định dữ liệu:** thống nhất key và tên trường trước khi sinh code; không để mỗi SV tự phát minh cấu trúc khác nhau. Các thao tác ghi xong phải render lại màn và giữ khi F5 trong **cùng origin/trình duyệt**. Nếu thử trực tiếp bằng `file://` có thể gặp vấn đề, dùng VS Code Live Server. Không viết trực tiếp `localStorage.clear()` vì sẽ xóa luôn dữ liệu phần khác.

**Quy trình dùng chung tài khoản:** bản Frontend không có backend; một tài khoản demo không tự đồng bộ giữa máy người A và máy người B. Chỉ quảng bá là mô phỏng nhiều role. Nếu sau này muốn tài khoản online xuyên thiết bị, phải bổ sung backend/database và chính sách bảo mật riêng.

---

## 4. GITHUB, REVIEW, GHÉP CODE – THEO MỤC 15–17

### 4.1. Nhánh và người phụ trách

| Loại | Tên nhánh ví dụ | Người phụ trách |
|---|---|---|
| Phát hành | `main` | SV3 tích hợp sau khi đã test và có review |
| Tích hợp | `dev` | Cả nhóm qua PR; không push thẳng |
| USER | `feature/user-saving-goals` | SV1 |
| USER | `feature/user-transaction-management` | SV1 |
| COACH | `feature/coach-resource-management` | SV2 |
| COACH | `feature/coach-budget-review` | SV2 |
| MODERATOR | `feature/moderator-resource-review` | SV3 |
| ADMIN | `feature/admin-user-management` | SV3 |
| Sửa lỗi | `fix/<ten-loi>` | Người được giao |
| Tài liệu | `docs/<ten-tai-lieu>` | Người được giao |

**Mỗi màn một nhánh tính năng/PR khi phù hợp;** không cố tạo commit vụn vô nghĩa. Review chéo theo vòng: **SV1 → SV2 → SV3 → SV1**. PR phải mô tả mục đích, ảnh màn hình, cách test và file đã thay đổi.

### 4.2. Các lệnh Git đơn giản để cả 3 SV dùng

> Chạy trong **Terminal của VS Code**, tại thư mục repo đã được clone. `origin` do nhóm thiết lập một lần, không phải ai cũng chạy `git init` lại.

```bash
git clone <LINK_REPO_CUA_NHOM>
cd cse122-spendwise-teamXX
git switch dev
git pull origin dev
git switch -c feature/user-saving-goals
# Viết và test code trong VS Code
git status
git add pages/user-saving-goals.html css/modules/user-saving-goals.css js/modules/user-saving-goals.js
git commit -m "feat: implement saving goals CRUD"
git push -u origin feature/user-saving-goals
```

Sau đó **tạo Pull Request trên GitHub: `feature/...` → `dev`**, đợi bạn khác review, sửa lỗi rồi mới merge. Sau khi tất cả feature đã vào `dev` và test tích hợp xong, mở PR `dev` → `main`. **AI trong VS Code không được tự push/merge/xóa nhánh nếu người làm chưa kiểm tra.**

### 4.3. Trello/Jira/Notion cần có

Các cột: **TỒN ĐỌNG → CẦN LÀM → ĐANG LÀM → CHỜ DUYỆT → HOÀN THÀNH**. Mỗi task ghi: **mã, SV phụ trách, trang/file, mô tả + điều kiện xong, hạn, nhánh, PR/commit, link OBS**.

| Mã gợi ý | Người | Công việc có thể giao ngay |
|---|---|---|
| SV1-01 | SV1 | USER Dashboard + Spending Insight |
| SV1-02 | SV1 | USER Transaction + Expense Categorizer |
| SV1-03 | SV1 | USER Saving Goals + Goal Coach |
| SV1-04 | SV1 | Landing/Auth demo + responsive USER |
| SV2-01 | SV2 | Coach Client List + Budget Review |
| SV2-02 | SV2 | Coach Resource CRUD + luồng gửi duyệt |
| SV2-03 | SV2 | Profile/Settings/Notifications/404 + API mock |
| SV3-01 | SV3 | Moderator Review/Template/Feedback |
| SV3-02 | SV3 | Admin Categories/Users/System Dashboard |
| SV3-03 | SV3 | Shared layout, navigation, 403, integration và phát hành |
| TEAM-01 | Cả nhóm | Bảng màn hình và luồng được giảng viên duyệt |
| TEAM-02 | Cả nhóm | Test liên thông, PR review chéo, cập nhật minh chứng |

### 4.4. Checklist trước khi đánh dấu một màn DONE

- [ ] Có mockup/luồng được duyệt và đúng file/role phụ trách.
- [ ] Có HTML semantic, CSS đẹp gần thiết kế, JS riêng **đọc được và tự giải thích được**.
- [ ] Có responsive mobile, không vỡ bảng/form; có nhãn form và tương tác bàn phím cơ bản.
- [ ] CRUD/trạng thái nghiệp vụ chạy thật; tìm/lọc, validation, rỗng/lỗi/thành công nếu phù hợp.
- [ ] Dữ liệu lưu/đọc lại đúng khi F5; không xóa nhầm dữ liệu của màn khác.
- [ ] AI (nếu có) có kết quả giải thích, loading, thất bại và quyền chấp nhận/sửa/từ chối/lưu.
- [ ] Chạy với Live Server, kiểm tra Console, nút/link, điều hướng, quyền của 4 role.
- [ ] Có task, commit tên rõ nghĩa, PR review và merge vào `dev`.
- [ ] Có video OBS **tương ứng mỗi màn đã duyệt**, README/screen-list và `docs/ai-usage-report.md` cập nhật.

---

## 5. CÂU LỆNH DÁN VÀO AI TRONG VS CODE

> **Cách dùng:** mở **thư mục repository gốc** trong VS Code, đặt file `quy tắc trong bài dự án.md` ở gốc repo và bảo đảm AI (GitHub Copilot Chat, trợ lý mã trong VS Code hoặc công cụ tương tự) đang ở chế độ **có quyền đọc/sửa workspace**. Mỗi sinh viên chọn đúng **câu lệnh của mình**. Nếu AI chỉ có chế độ chat không chỉnh file, yêu cầu nó trả về code đầy đủ của đúng các file để bạn tự lưu. **Không** dán cả 3 lệnh vào cùng một nhánh.

### PROMPT 0 – QUY TẮC ÁP DỤNG CHUNG (dán trước mỗi lần nhờ AI sửa nhiều file)

```text
Bạn là trợ lý lập trình cho dự án nhóm SpendWise (CSE122) trong workspace VS Code hiện tại.

1. Đọc kỹ file "quy tắc trong bài dự án.md", README, cấu trúc folders và các file mã nguồn sẵn có TRƯỚC khi sửa.
2. Chỉ sửa file thuộc phần việc tôi giao; không xóa, đổi tên, ghi đè file của sinh viên khác hoặc tự sửa file chung nếu chưa được chỉ định. Nếu cần đổi cấu trúc dữ liệu/đường dẫn dùng chung, hãy báo trước.
3. Giữ đúng folder GitHub: index.html ở gốc, pages/*.html, css/style.css, css/responsive.css, css/modules/*.css, js/main.js, js/api.js, js/modules/*.js, assets/, docs/, design/, README.md.
4. Mỗi trang có HTML/CSS/JS riêng và dùng CSS/JS chung khi cần; HTML semantic; responsive mobile/desktop. Code cho người mới: dùng function, if/else, Array, DOM, addEventListener, localStorage. Không dùng framework hay thư viện phức tạp. Không minify: JS và CSS phải xuống dòng rõ ràng, có bình luận ngắn ở hàm khó.
5. Bám theo Canva/Figma và mục 8–13, 14–24 của đề. Chỉ dùng dữ liệu người dùng nhập hoặc dữ liệu mock có nhãn demo; tất cả nút phải hoạt động. Xử lý form sai/rỗng, search/filter, CRUD và các trạng thái nghiệp vụ cần thiết.
6. Trước khi viết, cho tôi biết: (a) file nào sẽ tạo/sửa, (b) dữ liệu và hàm dùng chung đang được sử dụng, (c) cách tránh xung đột với người khác.
7. Sau khi viết, kiểm tra lỗi cú pháp JS, đường dẫn CSS/JS, link điều hướng; mô tả các bước thử thủ công trong Live Server và các tình huống rỗng/sai/đúng. Không được tuyên bố đã browser-test nếu bạn chưa thực sự chạy trình duyệt.
8. Không tự chạy git push, git merge, xóa branch, triển khai production hoặc làm thay phần chứng minh của sinh viên. Hãy đưa lệnh Git để tôi tự chạy.
9. Cuối cùng, liệt kê file đã sửa và giải thích ngắn gọn từng hàm JavaScript quan trọng để tôi có thể trình bày với giảng viên.
```

### PROMPT 1 – SV1: USER + ĐĂNG NHẬP/ĐĂNG KÝ + 3 AI

```text
Tôi là SV1, phụ trách USER của dự án SpendWise. Hãy thực hiện TRỰC TIẾP TRONG WORKSPACE các phần của SV1 theo file "quy tắc trong bài dự án.md" (đặc biệt mục 2.3), áp dụng PROMPT 0.

Trang chính cần code, MỖI trang có HTML ở pages/, CSS ở css/modules/, JS ở js/modules/ với cùng tên:
- user-finance-dashboard: tổng thu, tổng chi, số dư, mục tiêu, bảng dữ liệu tính từ localStorage; AI Spending Pattern Insight.
- user-transaction-management: thêm/xem/sửa/xóa giao dịch, form validation, search/filter; AI Expense Categorizer cho mô tả giao dịch.
- user-saving-goals: thêm/xem/sửa/xóa mục tiêu, góp thêm, hạn, %, trạng thái, search/filter; AI Goal Coach tính khoản góp định kỳ.

Phần chung tôi được giao (nếu đã duyệt): index.html + login + register + forgot-password (mỗi màn có CSS/JS riêng). Đăng nhập/đăng ký chỉ là MOCK Frontend: kiểm tra email trùng, mật khẩu sai, báo kết quả và điều hướng theo role; không ghi là đã gửi email thật, không dùng tài khoản/mật khẩu thật.

BẮT BUỘC 3 AI mock theo chu trình: nhập → validation → loading → kết quả + giải thích → Chấp nhận / Sửa / Từ chối / Tạo lại / Lưu; thêm trường hợp không đủ dữ liệu. Lưu lựa chọn có ý nghĩa vào trạng thái người dùng, không chỉ hiện một ô text.

Phải dùng hợp đồng dữ liệu mục 3.1, giữ nguyên role/menu/style chung do SV3 quản lý, không tự viết lại js/main.js hoặc css/style.css. Nếu cần hàm/chức năng chung thì đề xuất thay đổi để nhóm duyệt trước. Hãy ưu tiên tạo hoặc sửa lần lượt 3 trang USER trước, chạy thử, sau đó mới làm các màn chung; không đẻ thêm trang ngoài bảng kiểm kê.

Kết quả cần: source HTML/CSS/JS hoàn chỉnh, có xuống dòng rõ, các link đúng, không có nút chết, kịch bản test từng chức năng và ví dụ commit/PR feature/user-... để tôi tự thực hiện. Hãy giải thích code với kiến thức JS cơ bản.
```

### PROMPT 2 – SV2: COACH + DATA / TƯƠNG TÁC

```text
Tôi là SV2, phụ trách COACH và phối hợp dữ liệu JavaScript của SpendWise. Hãy đọc "quy tắc trong bài dự án.md" và áp dụng PROMPT 0. Chỉ tạo/sửa những file thuộc SV2 hoặc file dùng chung được SV3 đồng ý.

Mỗi màn tạo đủ 3 file .html, .css, .js theo quy tắc thư mục:
1) coach-client-list: render từ dữ liệu demo/hợp lệ, tìm kiếm/lọc khách hàng, trạng thái rỗng, xem thông tin để chuyển qua review.
2) coach-budget-review: hiển thị bảng ngân sách/thu chi demo theo khách hàng, thêm/xem/sửa nhận xét coachNotes; validation, lưu/reload được.
3) coach-resource-management: tạo/xem/sửa/xóa hoặc lưu trữ tài nguyên (bài viết/checklist), trạng thái nháp/chờ duyệt/đã duyệt/từ chối, nút gửi duyệt và phản hồi hợp lệ.

Các màn chung được giao nếu duyệt: profile, settings, notifications, 404; riêng mỗi trang đều có CSS/JS, nút có công dụng thật. Settings có theme/đăng xuất mô phỏng; notifications đánh dấu đã đọc.

Dùng cùng dữ liệu sw_coachNotes, sw_resources và các key trong mục 3.1. Phối hợp xây js/api.js kiểu đơn giản với SV3: chỉ một nơi định nghĩa thao tác đọc/ghi mock cho resources/notes/notifications. KHÔNG đổi key chung khi chưa thống nhất.

Tạo luồng chạy: Coach tạo resource → chọn "Gửi duyệt" → status pending → Moderator có thể xem/duyệt → Coach thấy kết quả khi tải lại trang trong cùng browser. Chỉ code phần Coach ở nhánh của tôi; nếu phần Moderator chưa có, ghi rõ giao diện dữ liệu cần SV3 nhận, không tự sửa file của SV3.

Trước khi kết thúc, đưa checklist test, trường hợp rỗng/sai/đúng, kiểm tra console/syntax và hướng dẫn review PR SV1. JS/CSS phải viết dễ hiểu, xuống dòng rõ, không có framework/AI thật.
```

### PROMPT 3 – SV3: MODERATOR + ADMIN + TÍCH HỢP

```text
Tôi là SV3, phụ trách MODERATOR + ADMIN và tích hợp dự án nhóm SpendWise. Hãy đọc "quy tắc trong bài dự án.md" và áp dụng PROMPT 0. Không ghi đè code USER/COACH của SV1/SV2.

Tạo đủ HTML/CSS/JS riêng cho 6 màn theo đúng tên trong mục 2.1:
- moderator-resource-review: đọc resource từ Coach, lọc pending/approved/rejected, duyệt/từ chối/yêu cầu sửa và lưu reviewNote.
- moderator-ai-template-management: thêm/xem/sửa mẫu AI, trạng thái active/draft, version và validation.
- moderator-feedback-center: thêm/xem/sửa/xóa feedback, lọc, thay trạng thái xử lý.
- admin-expense-category-management: hiển thị/tìm/lọc danh mục từ mock dữ liệu, cho phép thao tác bổ sung nếu được nhóm duyệt, phối hợp danh mục cho trang Giao dịch USER.
- admin-user-management: thêm/xem/sửa/tắt tài khoản/role DEMO, validation; không tuyên bố bảo mật thật.
- admin-system-dashboard: các thẻ trạng thái và bảng theo dõi mô phỏng, cập nhật/xem/sửa/xóa dữ liệu cấu hình/sự cố nếu phù hợp.

Tạo trang chung pages/403.html với CSS/JS riêng. Chịu trách nhiệm css/style.css, css/responsive.css, js/main.js về giao diện đồng bộ, responsive, sidebar/menu theo role, session demo, điều hướng. Phối hợp với SV2 (không làm riêng hai bộ API) thống nhất js/api.js và toàn bộ localStorage keys mục 3.1.

Hãy làm theo thứ tự:
1. Kiểm tra cấu trúc repo và các trang đã tồn tại, lên danh sách file sẽ tạo/sửa.
2. Tạo/hoàn thiện shared layout và hợp đồng dữ liệu, nhưng giữ tương thích với phần SV1/SV2 đã làm.
3. Code 6 trang Moderator/Admin và 403, test từng màn.
4. Test liên thông: Coach gửi resource → Moderator duyệt → Coach thấy kết quả; Admin sửa danh mục → USER thấy danh mục (nếu tính năng này được duyệt); menu theo role và 403 khi sai role.
5. Rà soát tất cả đường dẫn cho GitHub Pages (dùng link tương đối), kiểm tra JS syntax/Console/responsive, mô tả checklist tích hợp vào dev và phát hành main QUA PR.

Yêu cầu dễ học: HTML semantic, CSS/JS riêng có khoảng trắng và xuống dòng, function thường, DOM/addEventListener/Array/localStorage, không framework. Không tự động git push/merge hoặc deploy. Ghi rõ chỗ còn cần SV1/SV2 sửa trước khi merge.
```

### PROMPT 4 – CẢ NHÓM: KIỂM TRA VÀ GHÉP 3 PHẦN SAU KHI TẠO PR

```text
Bạn đang kiểm tra tích hợp SpendWise trên nhánh dev sau khi nhóm đã merge các PR được review.
Hãy đọc "quy tắc trong bài dự án.md", docs/screen-list.md, README và toàn bộ file liên quan.

KHÔNG tự xóa hay viết lại website. Hãy kiểm tra:
1. Mọi HTML đã duyệt có CSS/JS riêng, link tương đối đúng ở cả index.html lẫn pages/*.html.
2. Navigation 4 role, login/session demo, 403/404, không link chết; màn mới bắt đầu dữ liệu rỗng nếu không chọn demo.
3. Các thao tác CRUD, thêm tiền mục tiêu, search/filter, validation, các nút duyệt/từ chối, F5 còn dữ liệu, dữ liệu không ghi đè chéo.
4. Ba AI mock có input/loading/giải thích/accept/edit/reject/regenerate/save/failure phù hợp.
5. Responsive desktop/tablet/mobile và Console JavaScript; nếu chưa chạy browser thật, nói rõ kiểm tra nào mới chỉ là kiểm tra tĩnh.
6. Mapping task → file → nhánh → commit → PR → người review → video OBS (cho mỗi màn đã duyệt); update docs/screen-list.md, docs/team-assignment.md và docs/ai-usage-report.md.

Trước tiên trả về bảng lỗi với cột: Màn hình / Mô tả lỗi / Mức độ / File / Người nên sửa / Cách test lại. Chỉ sửa lỗi thuộc các file đã được nhóm cho phép và giải thích từng thay đổi đơn giản; KHÔNG tự git merge/push/deploy.
```

---

## 6. BÀN GIAO VÀ KIỂM THỬ BẮT BUỘC

### 6.1. Luồng kiểm thử end-to-end cho từng SV

**SV1:** vào web → đăng ký/đăng nhập mô phỏng → nhập giao dịch → dashboard cập nhật → AI phân loại → tạo mục tiêu → góp thêm → Goal Coach → F5 dữ liệu vẫn còn → kiểm tra lỗi nhập sai và dữ liệu rỗng.

**SV2:** xem danh sách khách hàng → tạo/sửa nhận xét ngân sách → tạo tài nguyên → gửi duyệt → chuyển trang Moderator trên cùng browser (tài khoản demo có quyền) → trở lại Coach xem kết quả → thử tài nguyên bị từ chối.

**SV3:** vào Moderator, xem tài nguyên chờ và xử lý → quản lý template/feedback → vào Admin, quản lý danh mục/tài khoản và dashboard → thử USER mở trang Admin để thấy 403 → kiểm tra các link không tồn tại hiển thị 404.

### 6.2. Phân công kiểm tra chéo và hỗ trợ khi trễ tiến độ

- **SV2** phải đọc thử tối thiểu 1 PR USER của SV1 và phản hồi bằng nhận xét có nội dung, không chỉ bấm Approve.
- **SV3** đọc thử tối thiểu 1 PR COACH của SV2; kiểm tra trùng storage key và đường dẫn.
- **SV1** đọc thử tối thiểu 1 PR MODERATOR/ADMIN của SV3; kiểm tra responsive, 403 và các nút thao tác.
- Khi một người chậm, nhóm chuyển **một task trọn bộ HTML+CSS+JS** cho người hỗ trợ; ghi lại trong `docs/team-assignment.md` và Trello. Không tách HTML cho người này, CSS cho người khác chỉ để “đủ tên”.

### 6.3. Hồ sơ minh chứng theo mục 17–20

- `docs/screen-list.md`: bảng **Vai trò | Mục tiêu | Nhiệm vụ | Màn hình | File | CRUD/Trạng thái | AI | SV phụ trách | Trạng thái duyệt**.
- `docs/team-assignment.md`: bảng phân công thực tế và phần SV đã tự code (cập nhật nếu đổi nhiệm vụ).
- `docs/ai-usage-report.md`: công cụ AI, từng prompt đã dùng (bao gồm 4 PROMPT trong tài liệu này), code AI tạo, phần sinh viên sửa, lỗi AI, cách tự kiểm chứng, AI mock hay API thật.
- `README.md`: mục đích SpendWise, role, tính năng, công nghệ, hướng dẫn chạy Live Server, cấu trúc repo, link thiết kế, link GitHub, link video OBS và ghi chú bảo mật/dữ liệu demo.
- `design/` chứa link bản thiết kế + mockup, **không** chỉ ảnh do AI tạo; cần xác nhận từ giảng viên trước khi tính màn hình DONE.
- Mỗi video OBS phải có mặt SV thực hiện, hiển thị thiết kế, file HTML/CSS/JS, chỉnh sửa trực tiếp, chạy thử, commit và mã task/nhánh. Tên gợi ý `SV1-01-screen-name.mp4`, `SV2-01-screen-name.mp4`, `SV3-01-screen-name.mp4`.
- Quá trình theo trình tự: **Thiết kế → Screen list duyệt → Trello → Branch → Code → Test → Commit → PR/Review → Merge dev → Test tích hợp → Merge main → OBS/README** (OBS cần thể hiện cả quá trình code/commit theo đề, không chỉ quay bản cuối).

---

## 7. CÁC VIỆC NHÓM PHẢI CHỐT TRƯỚC KHI AI VIẾT CODE

1. Tên GitHub repo, ai có quyền tạo PR/merge, tên 3 SV thực tế.
2. Bảng kiểm kê màn hình và thiết kế Canva/Figma **đã được giảng viên duyệt** hay mới là dự thảo.
3. Tên file trong repo hiện tại có giống mục 8 hay cần bảng ánh xạ từ phiên bản cũ; **không tự xóa bản đang chạy**.
4. Mẫu `localStorage` của 6 entity chính và các entity phụ, cách đặt ID/trạng thái (`draft`, `pending`, `approved`, `rejected`).
5. Hệ màu, font, sidebar, header và responsive chung: ai sửa file dùng chung, ai review.
6. Cách demo các vai trò: tài khoản demo/toggle role có giới hạn ở bản Frontend, không cho người dùng thường tự nâng lên Admin trong một ứng dụng thật.
7. Lịch checkpoint để tích hợp dần sau mỗi nhóm màn, tránh chờ đến cuối mới ghép ba phần.

**Quy tắc cuối:** AI trong VS Code là công cụ hỗ trợ, **không thay thế công việc tự làm của SV1–SV3**. Mỗi SV phải tự chạy, chỉnh sửa, hiểu và giải thích được mã HTML/CSS/JS mà mình nộp. Chỉ tuyên bố một chức năng “đã chạy” sau khi đã test trực tiếp.
