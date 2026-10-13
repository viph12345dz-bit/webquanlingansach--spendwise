# SpendWise – Quản lý ngân sách và thói quen chi tiêu

SpendWise là bài tập lớn Frontend cho học phần Phát triển ứng dụng Web cơ bản. Dự án có nhiều vai trò, CRUD, responsive, LocalStorage và các trải nghiệm AI mô phỏng.

## Chạy dự án
1. Clone hoặc tải repository.
2. Mở thư mục bằng VS Code.
3. Dùng extension **Live Server**.
4. Mở `index.html` → **Open with Live Server**.

## Cấu trúc repository
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
│   └── responsive.css
└── js/
    ├── main.js
    ├── api.js
    └── modules/
```

## Ghi chú dữ liệu
Phiên bản hiện tại dùng LocalStorage. Vì vậy dữ liệu được lưu theo trình duyệt/máy đang sử dụng. Khi cần tài khoản dùng chung trên nhiều thiết bị, hãy thay lớp dữ liệu bằng backend/database như Supabase hoặc Firebase.
