const accountAdmin = setupAppPage('admin-user-management.html', 'admin');

if (accountAdmin) {
    const searchInput = document.getElementById('globalSearch');
    const roleFilter = document.getElementById('roleFilter');
    const tableContent = document.getElementById('tableContent');
    const allowedRoles = ['user', 'coach', 'moderator', 'admin'];

    function renderPage() {
        const users = getUsers();
        const keyword = searchInput.value.trim();
        const selectedRole = roleFilter.value;
        const rows = [];
        let activeCount = 0;

        for (let i = 0; i < users.length; i++) {
            const item = users[i];
            const isActive = item.active !== false;

            if (isActive) {
                activeCount++;
            }
            if (!searchText(item.name + ' ' + item.email + ' ' + item.role, keyword)) {
                continue;
            }
            if (selectedRole !== 'all' && item.role !== selectedRole) {
                continue;
            }

            const actions = item.id === accountAdmin.id
                ? '<span class="current-account">Phiên hiện tại</span>'
                : '<div class="actions account-actions">' +
                    '<button class="link-button" data-edit="' + cleanText(item.id) +
                    '" type="button">Sửa</button>' +
                    '<button class="link-button" data-toggle="' + cleanText(item.id) +
                    '" type="button">' + (isActive ? 'Tắt' : 'Bật') + '</button></div>';
            const createdDate = item.createdAt
                ? formatDate(item.createdAt.slice(0, 10))
                : '—';

            rows.push(
                '<tr><td>' + cleanText(item.name || 'Chưa có tên') + '</td>' +
                '<td class="account-email">' + cleanText(item.email || '—') + '</td>' +
                '<td>' + cleanText(ROLE_NAMES[item.role] || item.role || '—') + '</td>' +
                '<td>' + statusLabel(isActive ? 'Hoạt động demo' : 'Đã tắt') + '</td>' +
                '<td>' + cleanText(createdDate) + '</td><td>' + actions + '</td></tr>'
            );
        }

        renderStats([
            [users.length, 'Tài khoản demo'],
            [activeCount, 'Đang hoạt động'],
            [countByField(users, 'role', 'coach'), 'Coach'],
            [countByField(users, 'role', 'admin'), 'Admin']
        ]);

        if (rows.length === 0) {
            tableContent.innerHTML =
                '<div class="empty-state"><strong>Không có tài khoản phù hợp</strong>' +
                '<span>Thêm một tài khoản demo để thử menu theo vai trò.</span></div>';
        } else {
            tableContent.innerHTML =
                '<div class="table-wrap"><table class="data-table">' +
                '<thead><tr><th>Tên</th><th>Email demo</th><th>Vai trò</th>' +
                '<th>Trạng thái</th><th>Tạo lúc</th><th>Thao tác</th></tr></thead>' +
                '<tbody>' + rows.join('') + '</tbody></table></div>';
        }

        bindButtons();
    }

    function bindButtons() {
        const editButtons = document.querySelectorAll('[data-edit]');
        const toggleButtons = document.querySelectorAll('[data-toggle]');

        for (let i = 0; i < editButtons.length; i++) {
            editButtons[i].addEventListener('click', function () {
                openForm(this.dataset.edit);
            });
        }
        for (let i = 0; i < toggleButtons.length; i++) {
            toggleButtons[i].addEventListener('click', function () {
                toggleAccount(this.dataset.toggle);
            });
        }
    }

    function buildRoleOptions(selectedRole) {
        const roleLabels = {
            user: 'USER',
            coach: 'COACH',
            moderator: 'MODERATOR',
            admin: 'ADMIN'
        };
        let options = '';

        for (let i = 0; i < allowedRoles.length; i++) {
            const role = allowedRoles[i];
            const selected = role === selectedRole ? ' selected' : '';
            options += '<option value="' + role + '"' + selected + '>' +
                roleLabels[role] + '</option>';
        }

        return options;
    }

    function openForm(id) {
        const users = getUsers();
        const item = id ? findItemById(users, id) : null;
        const role = item ? item.role : 'user';
        const passwordLabel = item
            ? 'Mật khẩu demo (để trống để giữ nguyên)'
            : 'Mật khẩu demo';

        openModal(item ? 'Sửa tài khoản demo' : 'Thêm tài khoản demo',
            '<form id="accountForm">' +
                '<div class="field"><label for="accountName">Họ và tên</label>' +
                    '<input id="accountName" maxlength="80" required></div>' +
                '<div class="field"><label for="accountEmail">Email demo</label>' +
                    '<input id="accountEmail" type="email" maxlength="120" required></div>' +
                '<div class="field"><label for="accountPassword">' + passwordLabel + '</label>' +
                    '<input id="accountPassword" type="password" minlength="6" ' +
                    (item ? '' : 'required') + ' autocomplete="new-password"></div>' +
                '<div class="field"><label for="accountRole">Vai trò demo</label>' +
                    '<select id="accountRole">' + buildRoleOptions(role) + '</select></div>' +
                '<p class="form-hint">Mật khẩu chỉ phục vụ đăng nhập mô phỏng trong trình duyệt.</p>' +
                '<p id="accountMessage" class="form-message" aria-live="polite"></p>' +
                '<div class="modal-actions">' +
                    '<button class="btn btn-outline" id="cancelAccount" type="button">Hủy</button>' +
                    '<button class="btn btn-primary" type="submit">Lưu tài khoản</button>' +
                '</div></form>'
        );

        if (item) {
            document.getElementById('accountName').value = item.name || '';
            document.getElementById('accountEmail').value = item.email || '';
        }

        document.getElementById('cancelAccount').addEventListener('click', closeModal);
        document.getElementById('accountForm').addEventListener('submit', function (event) {
            event.preventDefault();
            saveAccount(id);
        });
    }

    function saveAccount(id) {
        const users = getUsers();
        const item = id ? findItemById(users, id) : null;
        const name = document.getElementById('accountName').value.trim();
        const email = document.getElementById('accountEmail').value.trim().toLowerCase();
        const password = document.getElementById('accountPassword').value;
        const role = document.getElementById('accountRole').value;
        const message = document.getElementById('accountMessage');
        const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        if (name.length < 2 || !emailIsValid || allowedRoles.indexOf(role) === -1) {
            message.textContent = 'Nhập tên, email và vai trò hợp lệ.';
            return;
        }
        if (!item && password.length < 6) {
            message.textContent = 'Mật khẩu demo cần ít nhất 6 ký tự.';
            return;
        }
        if (item && password && password.length < 6) {
            message.textContent = 'Mật khẩu mới cần ít nhất 6 ký tự.';
            return;
        }

        for (let i = 0; i < users.length; i++) {
            const savedEmail = String(users[i].email || '').toLowerCase();

            if (savedEmail === email && users[i].id !== id) {
                message.textContent = 'Email này đã được dùng.';
                return;
            }
        }

        let savedUser = item;

        if (!savedUser) {
            savedUser = {
                id: makeId(),
                createdAt: new Date().toISOString(),
                active: true
            };
            users.push(savedUser);
        }

        savedUser.name = name;
        savedUser.email = email;
        savedUser.role = role;

        if (password) {
            savedUser.password = password;
        }

        saveUsers(users);
        closeModal();
        showToast('Đã lưu tài khoản mô phỏng.');
        renderPage();
    }

    function toggleAccount(id) {
        const users = getUsers();
        const item = findItemById(users, id);

        if (!item || item.id === accountAdmin.id) {
            return;
        }

        item.active = item.active === false;
        saveUsers(users);
        showToast(item.active ? 'Đã bật tài khoản demo.' : 'Đã tắt tài khoản demo.');
        renderPage();
    }

    document.getElementById('addBtn').addEventListener('click', function () {
        openForm(null);
    });
    searchInput.addEventListener('input', renderPage);
    roleFilter.addEventListener('change', renderPage);
    renderPage();
}
