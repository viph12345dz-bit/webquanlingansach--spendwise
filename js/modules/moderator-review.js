const user = setupAppPage('moderator-review.html', 'moderator');

if (user) {
    const searchInput = document.getElementById('globalSearch');
    const statusFilter = document.getElementById('statusFilter');
    const addBtn = document.getElementById('addBtn');
    const tableContent = document.getElementById('tableContent');

    function renderPage() {
        const items = getUserData('moderation', []);
        renderStats([
            [countByField(items, 'status', 'Chờ duyệt'), 'Chờ duyệt'],
            [countByField(items, 'status', 'Đã duyệt'), 'Đã duyệt'],
            [countByField(items, 'status', 'Từ chối'), 'Từ chối'],
            [items.length, 'Tổng tài nguyên']
        ]);

        const keyword = searchInput.value.trim();
        const selectedStatus = statusFilter.value;
        let rows = '';
        let count = 0;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const matchSearch = searchText(item.title + ' ' + item.author, keyword);
            const matchStatus = selectedStatus === 'all' || item.status === selectedStatus;

            if (matchSearch && matchStatus) {
                count++;

                rows += `
                    <tr>
                        <td>${cleanText(item.title)}</td>
                        <td>${cleanText(item.author)}</td>
                        <td>${formatDate(item.submitted)}</td>
                        <td>${statusLabel(item.status)}</td>
                        <td>
                            <div class="actions">
                                <button class="link-button" data-approve="${item.id}" type="button">Duyệt</button>
                                <button class="link-button danger" data-reject="${item.id}" type="button">Từ chối</button>
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
                                <th>Tài nguyên</th>
                                <th>Tác giả</th>
                                <th>Ngày nộp</th>
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

        const approveButtons = document.querySelectorAll('[data-approve]');
        const rejectButtons = document.querySelectorAll('[data-reject]');

        for (let i = 0; i < approveButtons.length; i++) {
            approveButtons[i].addEventListener('click', function () {
                changeStatus(this.dataset.approve, 'Đã duyệt');
            });
        }

        for (let i = 0; i < rejectButtons.length; i++) {
            rejectButtons[i].addEventListener('click', function () {
                changeStatus(this.dataset.reject, 'Từ chối');
            });
        }
    }

    function openForm(id) {
        const items = getUserData('moderation', []);
        const item = id ? findItemById(items, id) : null;

        openModal(item ? 'Sửa dữ liệu' : 'Thêm dữ liệu', `
            <form id="dataForm">
                    <div class="field">
                        <label for="title">Tài nguyên</label>
                        <input id="title" type="text" required>
                    </div>

                    <div class="field">
                        <label for="author">Tác giả</label>
                        <input id="author" type="text" required>
                    </div>

                    <div class="field">
                        <label for="submitted">Ngày nộp</label>
                        <input id="submitted" type="date" required>
                    </div>

                    <div class="field">
                        <label for="status">Trạng thái</label>
                        <select id="status">
                            <option value="Chờ duyệt">Chờ duyệt</option>
                            <option value="Đã duyệt">Đã duyệt</option>
                            <option value="Từ chối">Từ chối</option>
                        </select>
                    </div>

                <div class="modal-actions">
                    <button class="btn btn-primary" type="submit">Lưu</button>
                </div>
            </form>
        `);

        if (item) {
            document.getElementById('title').value = item.title;
            document.getElementById('author').value = item.author;
            document.getElementById('submitted').value = item.submitted;
            document.getElementById('status').value = item.status;
        }

        document.getElementById('dataForm').addEventListener('submit', function (event) {
            event.preventDefault();
            saveItem(id);
        });
    }

    function saveItem(id) {
        const items = getUserData('moderation', []);
        let item = id ? findItemById(items, id) : null;

        if (!item) {
            item = { id: makeId() };
            items.push(item);
        }

        item.title = document.getElementById('title').value.trim();
        item.author = document.getElementById('author').value.trim();
        item.submitted = document.getElementById('submitted').value;
        item.status = document.getElementById('status').value;

        saveUserData('moderation', items);
        closeModal();
        showToast('Đã lưu dữ liệu.');
        renderPage();
    }

    function deleteItem(id) {
        if (!confirmDelete('Bạn có muốn xóa mục này không?')) {
            return;
        }

        const items = getUserData('moderation', []);
        const newList = [];

        for (let i = 0; i < items.length; i++) {
            if (items[i].id !== id) {
                newList.push(items[i]);
            }
        }

        saveUserData('moderation', newList);
        showToast('Đã xóa dữ liệu.');
        renderPage();
    }

    function changeStatus(id, newStatus) {
        const items = getUserData('moderation', []);
        const item = findItemById(items, id);

        if (!item) {
            return;
        }

        item.status = newStatus;
        saveUserData('moderation', items);
        showToast('Đã thay đổi trạng thái.');
        renderPage();
    }

    addBtn.addEventListener('click', function () {
        openForm(null);
    });

    searchInput.addEventListener('input', renderPage);
    statusFilter.addEventListener('change', renderPage);

    renderPage();
}
