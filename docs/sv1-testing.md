# Bàn giao phần SV1 – SpendWise

Ngày ghi nhận: 25/10/2026. Phạm vi: USER và các trang index/login/register/forgot-password được giao cho SV1.

## 1. Kết quả và giới hạn kiểm thử

- 28 file JavaScript trong dự án được biên dịch kiểm tra cú pháp bằng Node.js, không có lỗi.
- 69 tham chiếu CSS/JS/link local trong 7 trang SV1 đều tồn tại; không phát hiện ID trùng hoặc ID DOM được gọi trực tiếp nhưng thiếu.
- Đã chạy Chrome headless với máy chủ localhost và hồ sơ trình duyệt tạm, tách khỏi dữ liệu người dùng: 14 kiểm tra USER và 21 kiểm tra tích hợp auth/AI đạt.
- Đã kiểm tra USER và auth ở 375px, 768px, 1280px; đã xem ảnh chụp mục tiêu trên mobile, dashboard desktop và form khôi phục mobile.
- Hai lượt chạy cuối không có JavaScript exception. Các ca gồm CRUD, validation, F5, phân quyền giao diện, cô lập tài khoản, lỗi storage, JSON AI hỏng và lỗi phân tích AI có kiểm soát.
- Riêng hộp thoại native window.confirm không được xác nhận trực quan trong headless: các nhánh Đồng ý/Hủy được kiểm tra bằng phản hồi giả lập chỉ trong test. Cần thử hộp thoại thật theo mục 4.
- Chưa thử trên Safari/Firefox, chưa kiểm tra bằng Live Server extension hoặc thiết bị di động thật, chưa kiểm tra khả năng tiếp cận bằng screen reader.
- design/figma-link.txt và README hiện chưa có thiết kế Canva/Figma thật; giao diện bám phong cách đang có. Chưa thể xác nhận khớp một bản thiết kế đã duyệt.

## 2. Danh sách đầy đủ file đã tạo/sửa

Các đường dẫn trong bảng tương đối từ thư mục docs. Mỗi trang có bộ HTML/CSS/JS riêng.

| Trang | HTML | CSS riêng | JavaScript riêng |
|---|---|---|---|
| U01 Tổng quan | [user-finance-dashboard.html](../pages/user-finance-dashboard.html) | [user-finance-dashboard.css](../css/modules/user-finance-dashboard.css) | [user-finance-dashboard.js](../js/modules/user-finance-dashboard.js) |
| U02 Giao dịch | [user-transaction-management.html](../pages/user-transaction-management.html) | [user-transaction-management.css](../css/modules/user-transaction-management.css) | [user-transaction-management.js](../js/modules/user-transaction-management.js) |
| U03 Mục tiêu | [user-saving-goals.html](../pages/user-saving-goals.html) | [user-saving-goals.css](../css/modules/user-saving-goals.css) | [user-saving-goals.js](../js/modules/user-saving-goals.js) |
| Điểm vào | [index.html](../index.html) | [index.css](../css/modules/index.css) | [index.js](../js/modules/index.js) |
| Đăng nhập | [login.html](../pages/login.html) | [login.css](../css/modules/login.css) | [login.js](../js/modules/login.js) |
| Đăng ký | [register.html](../pages/register.html) | [register.css](../css/modules/register.css) | [register.js](../js/modules/register.js) |
| Khôi phục demo | [forgot-password.html](../pages/forgot-password.html) | [forgot-password.css](../css/modules/forgot-password.css) | [forgot-password.js](../js/modules/forgot-password.js) |

Năm file còn lại, tổng cộng 26 file:

- [js/modules/user-dashboard.js](../js/modules/user-dashboard.js): chuyển tiếp URL cũ sang U01.
- [js/modules/user-transactions.js](../js/modules/user-transactions.js): chuyển tiếp URL cũ sang U02.
- [js/modules/user-goals.js](../js/modules/user-goals.js): chuyển tiếp URL cũ sang U03.
- [js/modules/sv1-auth.js](../js/modules/sv1-auth.js): helper riêng cho các trang SV1, kết nối hợp đồng tài khoản mới với mã cũ.
- [docs/sv1-testing.md](sv1-testing.md): tài liệu này, gồm dữ liệu, hàm, kiểm thử, Git và bàn giao tích hợp.

Chín file U01–U03 đã có trong workspace ở trạng thái untracked trước phiên làm việc và được hoàn thiện tiếp. Hai file được tạo thêm là sv1-auth.js và tài liệu này. Không thêm màn hình nghiệp vụ ngoài ba trang USER được giao.

Giữ nguyên js/main.js, js/api.js, css/style.css, css/responsive.css, README và các file của SV2/SV3. Các HTML/CSS USER cũ vẫn giữ nguyên; JavaScript chuyển tiếp giúp menu chung tiếp tục dùng URL hiện có.

## 3. Dữ liệu và cách tránh xung đột

| Khóa | Dữ liệu / mục đích |
|---|---|
| sw_transactions | Mảng {id,userId,date,type,category,amount,note}; type là income/expense, tiền nguyên dương, ngày YYYY-MM-DD. |
| sw_goals | Mảng {id,userId,name,target,saved,deadline}; target dương, saved từ 0 đến target. |
| sw_categories | Mảng danh mục dùng chung; USER đọc name/keywords để tạo lựa chọn và phân loại. Không tự ghi hoặc seed khóa này. |
| sw_users | Bản tài khoản theo hợp đồng {id,name,email,role,...}; mật khẩu chỉ là dữ liệu demo Frontend. |
| sw_session | {userId,role} của phiên demo. |
| sw_sv1_ai_<userId> | Trạng thái riêng của SV1 gồm insights và goalPlans; chỉ lưu lựa chọn đã chấp nhận rồi bấm Lưu. |
| spendwise_users, spendwise_session | Giữ tương thích Admin/Profile/Settings và mã chung hiện đang chạy. Adapter chỉ nằm trong các file SV1. |

ID được sinh bằng makeId() sẵn có. Giao dịch/mục tiêu được lọc theo userId. Khi ghi một record, mã đọc lại toàn bộ mảng và giữ các record của tài khoản khác. Form sửa có bản chụp dữ liệu để từ chối lưu nếu record đã được cập nhật/xóa sau khi mở form; nhờ đó không làm mất khoản góp mới.

Khi spendwise_users tồn tại, adapter dùng kho này làm nguồn tài khoản hiện hành vì Admin/Profile vẫn đang ghi vào đó; đồng bộ bản sao sw_users khi thao tác tài khoản. Đăng nhập ghi cả hai phiên; đăng xuất USER xóa cả hai. Nếu trang cũ đã xóa phiên legacy, USER yêu cầu đăng nhập lại dù sw_session còn sót.

Adapter kiểm tra JSON trước khi ghi. Các thay đổi tài khoản/phiên lưu theo một chuỗi có khôi phục giá trị cũ nếu bước ghi lỗi. Đây vẫn là localStorage mô phỏng, không phải transaction hay xác thực của backend.

Không tự chuyển/xóa các khóa giao dịch và mục tiêu spendwise_<userId>_* từ phiên bản USER cũ. Dữ liệu nghiệp vụ của ba trang mới dùng sw_* theo hợp đồng. Nếu nhóm cần chuyển dữ liệu cũ, cần thống nhất ánh xạ và cách người dùng lựa chọn trước khi thực hiện.

Không tự sinh giao dịch/mục tiêu. Danh mục và từ khóa dự phòng trên U02 là quy tắc DEMO được ghi nhãn, chỉ dùng khi chưa có từ khóa phù hợp từ danh mục chung.

## 4. Các bước thử thủ công bằng Live Server

Mở thư mục gốc bằng VS Code, chuột phải index.html → Open with Live Server. Dùng cùng địa chỉ/port và cùng trình duyệt khi thử lưu dữ liệu. Mở DevTools Console để quan sát lỗi; chỉ dùng tài khoản, mật khẩu và số liệu giả.

| Ca thử | Thao tác | Kết quả mong đợi |
|---|---|---|
| Tài khoản mới | Đăng ký tên DEMO, email sv1@example.test, mật khẩu demo123, vai trò USER; đăng nhập. | Tới U01, chưa có giao dịch/mục tiêu. Không tự thêm dữ liệu. |
| Auth sai | Để rỗng, nhập toàn khoảng trắng, email sai, mật khẩu ngắn, xác nhận khác; đăng ký lại email viết HOA. | Có thông báo cụ thể, không lưu; email trùng không phân biệt hoa thường. |
| Login sai | Nhập email không có hoặc mật khẩu sai; sau đó nhập đúng. | Không tạo phiên khi sai; đúng thì tới dashboard của vai trò. |
| Reset demo | Email không có, xác nhận sai; sau đó đặt lại đúng. | Chỉ cập nhật mật khẩu trong trình duyệt; không thông báo gửi email. Mật khẩu cũ không đăng nhập được. |
| Giao dịch sai | Mô tả chỉ khoảng trắng; tiền 0/âm/lẻ hoặc trên 1.000.000.000.000; ngày tương lai. | Không lưu; thông báo lỗi, giữ form để sửa. |
| Giao dịch đúng | Nhập thu 1.000.000; chi cà phê 120.000, taxi 50.000, sách 30.000, ngày không sau hôm nay. | U01 tổng thu 1.000.000, chi 200.000, số dư 800.000; thống kê danh mục khớp dữ liệu. |
| CRUD giao dịch | Xem, sửa mô tả/số tiền, lưu; xóa rồi chọn Hủy; xóa lại chọn Đồng ý. | Chi tiết đúng; sửa cập nhật bảng; Hủy giữ dữ liệu, Đồng ý xóa. Kiểm tra hộp thoại native thật ở bước này. |
| Search/filter | Tìm từ có/không có; lọc thu/chi, danh mục, khoảng ngày; đặt Từ ngày sau Đến ngày; Xóa bộ lọc. | Bảng và số tổng đúng phạm vi; có trạng thái rỗng; ngày đảo ngược báo lỗi và thay số tổng bằng dấu —. |
| Mục tiêu sai | Tên rỗng, target 0, saved âm hoặc vượt target, hạn mới trước hôm nay. | Không lưu, có thông báo. |
| Góp tiền | Tạo mục tiêu 3.000.000, saved 0; góp 100.000; thử góp vượt phần thiếu rồi góp đủ phần còn lại. | Khoản hợp lệ làm tăng saved; khoản vượt bị chặn; đủ thì Hoàn tất, tiến độ 100%. |
| Form sửa cũ | Mở Sửa mục tiêu rồi góp thêm cho chính mục tiêu đó; bấm Lưu form sửa cũ. Thử thêm hai tab cùng sửa giao dịch. | Báo record đã thay đổi, yêu cầu chọn Sửa lại; không ghi đè khoản góp/cập nhật mới. |
| CRUD mục tiêu | Xem, sửa tên/hạn, tìm kiếm, lọc trạng thái, xóa với Hủy/Đồng ý. | Chi tiết và trạng thái đúng; xóa có xác nhận, trạng thái rỗng rõ ràng. |
| Lưu và cô lập | F5, đi U01→U02→U03, bấm menu cũ; logout rồi đăng nhập USER thứ hai. | Dữ liệu tài khoản đầu vẫn giữ; URL cũ chuyển đúng trang mới; tài khoản thứ hai không thấy dữ liệu tài khoản đầu. |
| Vai trò | Tạo tài khoản demo Coach/Moderator/Admin; đăng nhập; thử mở URL USER. | Tới dashboard theo vai trò; mở USER bằng vai trò khác tới 403. |
| Logout trang cũ | USER mở Settings rồi Đăng xuất; mở lại U01. | Phải đăng nhập lại, không dùng sw_session còn sót để tiếp tục. |
| Responsive | DevTools chọn 375px/768px/1280px; mở menu mobile, dùng Tab qua form/nút; cuộn bảng. | Thẻ/form không bị cắt, bảng cuộn trong vùng riêng, menu mở/đóng, focus nhìn thấy. |
| Lỗi lưu trữ | Dùng hồ sơ thử riêng để thử JSON sai hoặc trình duyệt chặn ghi/đầy storage. | Có thông báo, không báo lưu thành công hoặc ghi đè âm thầm dữ liệu hỏng. Khôi phục dữ liệu thử trước ca tiếp theo. |

Ba AI đều có nhãn mô phỏng JavaScript. Thử đủ các hành động bên dưới:

| AI | Input và trường hợp thiếu/sai | Chu trình đúng và kết quả lưu |
|---|---|---|
| Expense Categorizer | Form giao dịch hợp lệ, mô tả như “cà phê DEMO”; thử mô tả dưới 3 ký tự hoặc không khớp từ khóa. | Tạo → đang xử lý → lý do → Sửa danh mục → Chấp nhận → Lưu. Giao dịch được lưu với category đã chọn. Từ chối không ghi giao dịch. |
| Spending Pattern Insight | Ít nhất 3 khoản chi trong kỳ; mức giảm nguyên 1–80%. Thử kỳ không có đủ chi, mức giảm 0, ngưỡng sửa 0. | Lý do chỉ ra danh mục chi nhiều nhất; Chấp nhận/Sửa rồi Lưu tạo ngưỡng theo dõi, hiển thị chi thực tế và vượt/còn trong ngưỡng. Có nút xóa ngưỡng. |
| Goal Coach | Chọn mục tiêu chưa đủ tiền, chưa quá hạn và lịch tuần/tháng. Thử không có mục tiêu, mục tiêu hoàn tất, quá hạn hoặc khoản mỗi kỳ quá thấp. | Tính số kỳ từ hôm nay đến hạn, kỳ đầu hôm nay; Chấp nhận/Sửa rồi Lưu tạo kế hoạch. Kỳ cuối chỉ góp phần còn thiếu; kế hoạch không tự chuyển tiền. Có nút xóa kế hoạch. |

Với mỗi AI, thử Từ chối và Tạo lại; sửa input trong lúc đang xử lý để chắc kết quả cũ bị bỏ. Cùng input và dữ liệu thì quy tắc mô phỏng có thể tạo lại cùng kết quả. Chấp nhận chỉ cập nhật bản nháp; cần Lưu để ghi dữ liệu. Sau khi sửa lựa chọn phải Chấp nhận lại. F5 kiểm tra lựa chọn đã lưu. Khi mục tiêu thay đổi, kế hoạch cũ có cảnh báo cần tính lại.

Kiểm tra biên lịch tháng thủ công khi có điều kiện: bắt đầu ngày 31, chuyển qua tháng ngắn; lịch phải dùng ngày cuối tháng đó rồi trở lại ngày neo ở tháng dài. Ca ngày 31 này chưa nằm trong kết quả Chrome tự động nêu ở mục 1.

## 5. Giải thích các hàm JavaScript quan trọng

| Hàm / nhóm hàm | Cách giải thích bằng JS cơ bản |
|---|---|
| readStore(), readList() | Đọc JSON từ localStorage; kiểm tra kiểu mảng/record và báo lỗi nếu dữ liệu hỏng. Không âm thầm ghi đè dữ liệu hỏng bằng mảng rỗng. |
| startPage(), identityMatches() | Đọc tài khoản hiện hành, kiểm tra vai trò USER, dựng menu từ cấu hình MENU của SV3; kiểm tra lại danh tính trước mỗi lần ghi. |
| ownItems(), findOwn() | Dùng filter/find để chỉ lấy record có userId bằng ID tài khoản đang đăng nhập. |
| saveRecord(), removeRecord(), writeStore() | Đọc lại mảng, thêm/thay/xóa đúng record của người dùng, giữ dữ liệu tài khoản khác; bắt lỗi khi setItem không thành công. |
| aiState(), saveAi() | Đọc/ghi lựa chọn AI riêng từng userId; kiểm tra các mảng insights/goalPlans trước khi dùng. |
| bindAi() | Quản lý bản nháp và cờ đã chấp nhận. Tăng token khi input đổi để bỏ callback cũ; dùng setTimeout mô phỏng loading; kiểm tra trước Chấp nhận và Lưu; catch lỗi phân tích. |
| validateTransaction(), saveTransaction() | Kiểm tra mô tả, loại, ngày, tiền và danh mục. Khi sửa, so bản chụp với record mới nhất rồi mới lưu sw_transactions. |
| categoryNames(), loadCategories() | Kết hợp danh mục chung, danh mục DEMO và tên danh mục của giao dịch đã có; dựng các option tìm/lọc và lựa chọn AI. |
| filteredItems(), renderPage() của U02 | Lọc theo từ khóa/loại/danh mục/ngày, sắp xếp ngày, cộng tổng và tạo các hàng bảng; đóng chi tiết cũ khi dữ liệu thay đổi. |
| periodItems(), rangeError(), totals() | U01 lấy giao dịch theo kỳ, phát hiện khoảng ngày sai, cộng income/expense để tính số dư và tỷ lệ còn lại. |
| renderPage(), renderSavedInsights() của U01 | Dựng thẻ tổng, bảng, cơ cấu danh mục và tiến độ mục tiêu; so chi thực tế với ngưỡng AI đã lưu. Tìm kiếm/loại chỉ lọc bảng, kỳ lọc cả thống kê chi. |
| validateGoal(), saveGoal() | Kiểm tra tên, target/saved và hạn; chặn form sửa cũ ghi đè dữ liệu mới; lưu sw_goals. |
| goalStatus(), progress() | So saved với target để tính Hoàn tất; nếu chưa đủ và qua hạn thì Quá hạn; tính phần trăm và chặn hiển thị quá 100%. |
| contribute() | Đọc mục tiêu mới nhất, kiểm tra tiền hợp lệ và không vượt phần thiếu, cộng saved rồi lưu lại. |
| scheduleDates(), goalSignature() | Tạo lịch tuần/tháng từ hôm nay đến hạn; tháng ngắn chặn ngày neo về ngày cuối tháng. Chữ ký dữ liệu giúp nhận ra mục tiêu/input đã đổi. |
| loadGoalChoices(), renderPlans() | Cập nhật danh sách mục tiêu trong các select; hiển thị kế hoạch của mục tiêu còn tồn tại và cảnh báo khi bản chụp target/saved/deadline đã cũ. |
| SV1Auth.accounts(), findByEmail(), currentUser() | Đọc kho tài khoản phù hợp phiên bản; so email đã chuẩn hóa; lấy tài khoản theo phiên, kiểm tra trạng thái và nhận diện logout từ mã cũ. |
| accountChanges(), commit() trong helper | Chuẩn bị hai mảng tài khoản theo ID; đồng bộ bản sao bị cũ sau thao tác Admin. Lưu nhiều khóa với giá trị cũ dự phòng để khôi phục khi ghi thất bại. |
| SV1Auth.register(), signIn(), resetPassword(), signOut() | Kiểm tra trùng email/vai trò, lưu tài khoản, tạo/xóa phiên demo và đổi mật khẩu cục bộ; giữ nguyên dữ liệu nghiệp vụ và thông báo của người dùng. |
| emailError(), passwordError(), destination() | Kiểm tra input cho form mới và chọn URL dashboard. Login vẫn chấp nhận mật khẩu dài của tài khoản Admin cũ. |
| signIn(), registerAccount(), resetPassword() trong các form | Lắng nghe submit, đọc và kiểm tra input, gọi helper, thông báo lỗi/thành công rồi điều hướng khi phù hợp. |
| index.js và ba JS chuyển tiếp | Điểm vào có thanh tiến độ, link bắt đầu và điều hướng theo phiên; ba URL USER cũ dùng location.replace để tới trang tương ứng. |

Các hàm giao diện dùng lại từ js/main.js gồm makeId(), cleanText(), formatMoney(), formatDate(), applyTheme(), makeInitials(), renderStats(), showToast(), confirmDelete() và cấu hình ROLE_NAMES/MENU/DEFAULT_PAGES. Không sửa các định nghĩa dùng chung này.

## 6. Điểm bàn giao cần phối hợp

- SV2: Settings hiện xóa các khóa USER cũ; cần thống nhất cách chỉ xóa record userId hiện hành trong sw_transactions/sw_goals và khóa sw_sv1_ai_<userId>. Chưa sửa Settings, chưa xác nhận nút này xóa dữ liệu USER mới.
- SV3: trang danh mục Admin hiện vẫn dùng dữ liệu phiên bản cũ; cần công bố danh mục/quy tắc vào sw_categories theo hợp đồng để U02 nhận được. USER đã đọc sẵn khóa này và có quy tắc DEMO dự phòng.
- SV2/SV3: thống nhất thời điểm chuyển hẳn tài khoản/phiên sang sw_users/sw_session trong mã chung. Adapter hiện giúp phần SV1 chạy cùng phiên bản cũ; không thay các hàm main.js của nhóm.
- SV3: cập nhật bảng kiểm kê màn hình theo ánh xạ USER cũ → U01/U02/U03 sau khi nhóm duyệt. Hiện menu cũ vẫn hoạt động qua chuyển tiếp, không cần sửa MENU.
- Nhóm: bổ sung link/mockup Canva/Figma thật để đối chiếu thiết kế. Tài liệu này không thay cho review của SV2, quyết định duyệt màn hình hoặc video OBS của sinh viên.

## 7. Lệnh Git và mẫu PR để sinh viên tự thực hiện

Kiểm tra nhánh hiện tại và thay đổi trước. Các lệnh dưới đây chưa được trợ lý chạy để commit/push/merge.

```powershell
git status --short
git branch --show-current
git switch -c feature/user-finance-workflow

git add -- pages/user-finance-dashboard.html css/modules/user-finance-dashboard.css js/modules/user-finance-dashboard.js
git add -- pages/user-transaction-management.html css/modules/user-transaction-management.css js/modules/user-transaction-management.js
git add -- pages/user-saving-goals.html css/modules/user-saving-goals.css js/modules/user-saving-goals.js
git add -- js/modules/user-dashboard.js js/modules/user-transactions.js js/modules/user-goals.js js/modules/sv1-auth.js
git add -- index.html css/modules/index.css js/modules/index.js
git add -- pages/login.html css/modules/login.css js/modules/login.js
git add -- pages/register.html css/modules/register.css js/modules/register.js
git add -- pages/forgot-password.html css/modules/forgot-password.css js/modules/forgot-password.js
git add -- docs/sv1-testing.md

git diff --cached --check
git diff --cached --stat
git diff --cached
git commit -m "feat: complete user finance workflows and mock AI"
git push -u origin feature/user-finance-workflow
```

Nếu đang ở nhánh feature phù hợp thì tiếp tục trên nhánh đó, không cần tạo lại. Không tự switch/pull sang dev khi workspace còn thay đổi chưa bảo toàn.

Mẫu PR (base dev, head feature/user-finance-workflow):

- Tiêu đề: Hoàn thiện USER, ba AI mô phỏng và auth demo.
- Mục đích: quản lý giao dịch/mục tiêu theo userId, tổng quan tính từ sw_*, ba AI có bản nháp và quyền quyết định, auth demo điều hướng đúng role.
- Phạm vi: 26 file SV1 trong mục 2; giữ nguyên mã chung và phần SV2/SV3.
- Kiểm thử: 28 JS không lỗi cú pháp, 69 link local hợp lệ; Chrome 14 USER + 21 tích hợp; native confirm cần thử thủ công; ghi rõ các điểm tích hợp ở mục 6.
- Đính kèm: ảnh chụp của sinh viên, kết quả Live Server, mã task, link thiết kế thật và video OBS do sinh viên tự thực hiện.
- Reviewer: SV2 theo vòng review của nhóm. Sau review mới tích hợp vào dev bằng quy trình nhóm.
