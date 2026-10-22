const user = setupAppPage('admin-categories.html', 'admin');

if (user) {
    const searchInput = document.getElementById('globalSearch');
    const statusFilter = document.getElementById('statusFilter');
    const addBtn = document.getElementById('addBtn');
    const tableContent = document.getElementById('tableContent');

    function renderPage() {
        const items = getUserData('categories', []);
        renderStats([
            [items.length, 'Danh mục'],
            [countUnique(items, 'group'), 'Nhóm chính'],
            [countFilled(items, 'rules'), 'Rule tự động'],
            [countByField(items, 'status', 'Cần rà soát'), 'Cần rà soát']
        ]);

        const keyword = searchInput.value.trim();
        const selectedStatus = statusFilter.value;
        let rows = '';
        let count = 0;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const matchSearch = searchText(item.name + ' ' + item.group + ' ' + item.rules, keyword);
            const matchStatus = selectedStatus === 'all' || item.status === selectedStatus;

            if (matchSearch && matchStatus) {
                count++;

                rows += `
                    <tr>
                        <td>${cleanText(item.name)}</td>
                        <td>${cleanText(item.group)}</td>
                        <td>${cleanText(item.rules)}</td>
                        <td>${statusLabel(item.status)}</td>
                        <td>
                            <div class="actions">
                                <button class="link-button" data-edit="${item.id}" type="button">Sửa</button>
                                <button class="link-button danger" data-delete="${item.id}" type="button">Xóa</button>
                            </div>
                        </td>
                    </tr>
                `;
            }
        }

        if (count === 0) {
            tableContent.innerHTML = `
                <div class="empty-state">
                    <strong>Chưa có dữ liệu</strong>
                    <span>Nhấn “Thêm mới” để tạo dữ liệu đầu tiên.</span>
                </div>
            `;
        } else {
            tableContent.innerHTML = `
                <div class="table-wrap">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Danh mục</th>
                                <th>Nhóm</th>
                                <th>Quy tắc AI</th>
                                <th>Trạng thái</th>
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

    function bindButtons() {
        const editButtons = document.querySelectorAll('[data-edit]');
        const deleteButtons = document.querySelectorAll('[data-delete]');

        for (let i = 0; i < editButtons.length; i++) {
            editButtons[i].addEventListener('click', function () {
                openForm(this.dataset.edit);
            });
        }

        for (let i = 0; i < deleteButtons.length; i++) {
            deleteButtons[i].addEventListener('click', function () {
                deleteItem(this.dataset.delete);
            });
        }

    }

    function openForm(id) {
        const items = getUserData('categories', []);
        const item = id ? findItemById(items, id) : null;

        openModal(item ? 'Sửa dữ liệu' : 'Thêm dữ liệu', `
            <form id="dataForm">
                    <div class="field">
                        <label for="name">Danh mục</label>
                        <input id="name" type="text" required>
                    </div>

                    <div class="field">
                        <label for="group">Nhóm</label>
                        <select id="group">
                            <option value="Thiết yếu">Thiết yếu</option>
                            <option value="Mong muốn">Mong muốn</option>
                            <option value="Khác">Khác</option>
                        </select>
                    </div>

                    <div class="field">
                        <label for="rules">Quy tắc AI</label>
                        <input id="rules" type="text" required>
                    </div>

                    <div class="field">
                        <label for="status">Trạng thái</label>
                        <select id="status">
                            <option value="Hoàn tất">Hoàn tất</option>
                            <option value="Cần rà soát">Cần rà soát</option>
                        </select>
                    </div>

                <div class="modal-actions">
                    <button class="btn btn-primary" type="submit">Lưu</button>
                </div>
            </form>
        `);

        if (item) {
            document.getElementById('name').value = item.name;
            document.getElementById('group').value = item.group;
            document.getElementById('rules').value = item.rules;
            document.getElementById('status').value = item.status;
        }

        document.getElementById('dataForm').addEventListener('submit', function (event) {
            event.preventDefault();
            saveItem(id);
        });
    }

    function saveItem(id) {
        const items = getUserData('categories', []);
        let item = id ? findItemById(items, id) : null;

        if (!item) {
            item = { id: makeId() };
            items.push(item);
        }

        item.name = document.getElementById('name').value.trim();
        item.group = document.getElementById('group').value;
        item.rules = document.getElementById('rules').value.trim();
        item.status = document.getElementById('status').value;

        saveUserData('categories', items);
        closeModal();
        showToast('Đã lưu dữ liệu.');
        renderPage();
    }

    function deleteItem(id) {
        if (!confirmDelete('Bạn có muốn xóa mục này không?')) {
            return;
        }

        const items = getUserData('categories', []);
        const newList = [];

        for (let i = 0; i < items.length; i++) {
            if (items[i].id !== id) {
                newList.push(items[i]);
            }
        }

        saveUserData('categories', newList);
        showToast('Đã xóa dữ liệu.');
        renderPage();
    }

    addBtn.addEventListener('click', function () {
        openForm(null);
    });

    searchInput.addEventListener('input', renderPage);
    statusFilter.addEventListener('change', renderPage);

    renderPage();
}
