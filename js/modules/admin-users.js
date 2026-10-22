const user = setupAppPage('admin-users.html', 'admin');

if (user) {
    const searchInput = document.getElementById('globalSearch');
    const roleFilter = document.getElementById('roleFilter');
    const addBtn = document.getElementById('addBtn');
    const tableContent = document.getElementById('tableContent');

    function renderPage() {
        const users = getUsers();

        renderStats([
            [users.length, 'Tài khoản'],
            [countRole(users, 'user'), 'User'],
            [countRole(users, 'coach'), 'Coach'],
            [countRole(users, 'moderator'), 'Moderator']
        ]);

        const keyword = searchInput.value.trim();
        const selectedRole = roleFilter.value;
        let rows = '';
        let count = 0;

        for (let i = 0; i < users.length; i++) {
            const item = users[i];
            const matchSearch = searchText(item.name + ' ' + item.email + ' ' + item.role, keyword);
            const matchRole = selectedRole === 'all' || item.role === selectedRole;

            if (matchSearch && matchRole) {
                count++;

                rows += `
                    <tr>
                        <td>${cleanText(item.name)}</td>
                        <td>${cleanText(item.email)}</td>
                        <td>${cleanText(ROLE_NAMES[item.role] || item.role)}</td>
                        <td>${new Date(item.createdAt).toLocaleDateString('vi-VN')}</td>
                        <td>
                            <div class="actions">
                                <button class="link-button" data-edit="${item.id}" type="button">Sửa</button>
                                ${item.id === user.id ? '' : `<button class="link-button danger" data-delete="${item.id}" type="button">Xóa</button>`}
                            </div>
                        </td>
                    </tr>
                `;
            }
        }

        if (count === 0) {
            tableContent.innerHTML = `
                <div class="empty-state">
                    <strong>Không có tài khoản phù hợp</strong>
                </div>
            `;
        } else {
            tableContent.innerHTML = `
                <div class="table-wrap">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Người dùng</th>
                                <th>Email</th>
                                <th>Vai trò</th>
                                <th>Thành viên từ</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>
            `;
        }

        bindButtons();
    }

    function countRole(users, role) {
        let count = 0;

        for (let i = 0; i < users.length; i++) {
            if (users[i].role === role) {
                count++;
            }
        }

        return count;
    }

    function bindButtons() {
        const editButtons = document.querySelectorAll('[data-edit]');
        const deleteButtons = document.querySelectorAll('[data-delete]');

        for (let i = 0; i < editButtons.length; i++) {
            editButtons[i].addEventListener('click', function () {
                openUserForm(this.dataset.edit);
            });
        }

        for (let i = 0; i < deleteButtons.length; i++) {
            deleteButtons[i].addEventListener('click', function () {
                deleteUser(this.dataset.delete);
            });
        }
    }

    function openUserForm(id) {
        const users = getUsers();
        const item = id ? findItemById(users, id) : null;

        openModal(item ? 'Sửa tài khoản' : 'Thêm tài khoản', `
            <form id="userForm">
                <div class="field">
                    <label for="name">Họ và tên</label>
                    <input id="name" type="text" required>
                </div>

                <div class="field">
                    <label for="email">Email</label>
                    <input id="email" type="email" required>
                </div>

                <div class="field">
                    <label for="password">Mật khẩu</label>
                    <input id="password" type="password" minlength="6" ${item ? '' : 'required'}>
                </div>

                <div class="field">
                    <label for="role">Vai trò</label>
                    <select id="role">
                        <option value="user">User</option>
                        <option value="coach">Coach</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                <p id="userFormMessage" class="form-message"></p>

                <div class="modal-actions">
                    <button class="btn btn-primary" type="submit">Lưu</button>
                </div>
            </form>
        `);

        if (item) {
            document.getElementById('name').value = item.name;
            document.getElementById('email').value = item.email;
            document.getElementById('role').value = item.role;
        }

        document.getElementById('userForm').addEventListener('submit', function (event) {
            event.preventDefault();
            saveUser(id);
        });
    }

    function saveUser(id) {
        const users = getUsers();
        let item = id ? findItemById(users, id) : null;
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim().toLowerCase();
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;
        const message = document.getElementById('userFormMessage');

        for (let i = 0; i < users.length; i++) {
            if (users[i].email === email && users[i].id !== id) {
                message.textContent = 'Email đã tồn tại.';
                return;
            }
        }

        if (!item) {
            if (password.length < 6) {
                message.textContent = 'Mật khẩu phải có ít nhất 6 ký tự.';
                return;
            }

            item = {
                id: makeId(),
                createdAt: new Date().toISOString()
            };

            users.push(item);
        }

        item.name = name;
        item.email = email;
        item.role = role;

        if (password) {
            item.password = password;
        }

        saveUsers(users);
        closeModal();
        showToast('Đã lưu tài khoản.');
        renderPage();
    }

    function deleteUser(id) {
        if (!confirmDelete('Bạn có muốn xóa tài khoản này không?')) {
            return;
        }

        const users = getUsers();
        const newList = [];

        for (let i = 0; i < users.length; i++) {
            if (users[i].id !== id) {
                newList.push(users[i]);
            }
        }

        saveUsers(newList);
        renderPage();
    }

    addBtn.addEventListener('click', function () {
        openUserForm(null);
    });

    searchInput.addEventListener('input', renderPage);
    roleFilter.addEventListener('change', renderPage);

    renderPage();
}
