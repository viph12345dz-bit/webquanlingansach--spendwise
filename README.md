# SpendWise – Quản lý ngân sách và thói quen chi tiêu

## 1. Tên đề tài
**SpendWise – Quản lý ngân sách và thói quen chi tiêu**

## 2. Trang đã thực hiện
Dự án gồm các màn hình User, Coach, Moderator, Admin và các trang dùng chung.

**Trang chính cá nhân:** `[Điền tên trang bạn phụ trách]`

## 3. Mục đích
SpendWise giúp người dùng nhập và theo dõi giao dịch, tạo mục tiêu tiết kiệm và xem các gợi ý tài chính mô phỏng. Các vai trò Coach, Moderator và Admin có những màn hình quản lý riêng.

## 4. Chức năng chính
- Đăng ký, đăng nhập, đặt lại mật khẩu ở mức Frontend mô phỏng.
- Form validation cơ bản.
- Thêm, xem, sửa, xóa dữ liệu.
- Tìm kiếm và lọc dữ liệu.
- Thay đổi trạng thái.
- Render dữ liệu bằng JavaScript.
- Lưu dữ liệu bằng LocalStorage.
- Responsive cơ bản trên Desktop và Mobile.
- Expense Categorizer, Spending Insight và Goal Coach được mô phỏng bằng JavaScript đơn giản, không dùng AI API thật.

## 5. Công nghệ sử dụng
- HTML5 semantic: `header`, `nav`, `main`, `section`, `article`, `form`...
- CSS3: Flexbox, Grid cơ bản, hover, media query, responsive.
- JavaScript cơ bản: `let`, `const`, function, array, object, `if/else`, loop, DOM, event, validation và render dữ liệu.
- LocalStorage cho dữ liệu mô phỏng trên trình duyệt.

## 6. Chạy dự án
1. Clone hoặc tải repository.
2. Mở thư mục bằng VS Code.
3. Cài extension **Live Server**.
4. Chuột phải `index.html` → **Open with Live Server**.

## 7. Cấu trúc repository

```text
project-root/
├── index.html
├── README.md
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
├── assets/
│   ├── images/
│   ├── icons/
│   └── data/
├── css/
│   ├── style.css
│   ├── responsive.css
│   └── modules/
│       ├── index.css
│       ├── home.css
│       ├── login.css
│       └── ...
└── js/
    ├── main.js
    ├── api.js
    └── modules/
        ├── index.js
        ├── home.js
        ├── login.js
        └── ...
```

Mỗi màn hình có một file HTML riêng trong `pages/`, một file CSS riêng trong `css/modules/` và một file JavaScript riêng trong `js/modules/`. Các đoạn dùng chung được đặt trong `css/style.css`, `css/responsive.css` và `js/main.js` để tránh lặp code.

## 8. Liên kết
- **Figma/Canva:** `[Dán link thiết kế tại đây]`
- **Video:** `[Dán link video tại đây]`
- **GitHub:** `[Dán link repository tại đây]`

## Lưu ý
Dự án này là Frontend phục vụ học phần CSE122. Không sử dụng Backend, Database, Framework, API phức tạp, Authentication thật, Machine Learning hoặc AI API thật. Tài khoản và dữ liệu hiện được mô phỏng bằng LocalStorage nên chỉ tồn tại trên trình duyệt đang sử dụng.
