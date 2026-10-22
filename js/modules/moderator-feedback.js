const user = setupAppPage('moderator-feedback.html', 'moderator');

if (user) {
    const searchInput = document.getElementById('globalSearch');
    const statusFilter = document.getElementById('statusFilter');
    const addBtn = document.getElementById('addBtn');
    const tableContent = document.getElementById('tableContent');

    function renderPage() {
        const items = getUserData('feedback', []);
        renderStats([
            [items.length, 'Tổng feedback'],
            [countByField(items, 'status', 'Mới'), 'Mới'],
            [countByField(items, 'status', 'Đang xử lý'), 'Đang xử lý'],
            [countByField(items, 'status', 'Hoàn tất'), 'Hoàn tất']
        ]);

        const keyword = searchInput.value.trim();
        const selectedStatus = statusFilter.value;
        let rows = '';
        let count = 0;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const matchSearch = searchText(item.sender + ' ' + item.subject + ' ' + item.level, keyword);
            const matchStatus = selectedStatus === 'all' || item.status === selectedStatus;

            if (matchSearch && matchStatus) {
                count++;

                rows += `
                    <tr>
                        <td>${cleanText(item.sender)}</td>
                        <td>${cleanText(item.subject)}</td>
                        <td>${cleanText(item.level)}</td>
                        <td>${statusLabel(item.status)}</td>
                        <td>
                            <div class="actions">
                                <button class="link-button" data-done="${item.id}" type="button">Hoàn tất</button>
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
                                <th>Người gửi</th>
                                <th>Chủ đề</th>
                                <th>Mức độ</th>
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

        const doneButtons = document.querySelectorAll('[data-done]');

        for (let i = 0; i < doneButtons.length; i++) {
            doneButtons[i].addEventListener('click', function () {
                changeStatus(this.dataset.done, 'Hoàn tất');
            });
        }
    }

    function openForm(id) {
        const items = getUserData('feedback', []);
        const item = id ? findItemById(items, id) : null;

        openModal(item ? 'Sửa dữ liệu' : 'Thêm dữ liệu', `
            <form id="dataForm">
                    <div class="field">
                        <label for="sender">Người gửi</label>
                        <input id="sender" type="text" required>
                    </div>

                    <div class="field">
                        <label for="subject">Chủ đề</label>
                        <input id="subject" type="text" required>
                    </div>

                    <div class="field">
                        <label for="level">Mức độ</label>
                        <select id="level">
                            <option value="Thấp">Thấp</option>
                            <option value="Trung bình">Trung bình</option>
                            <option value="Cao">Cao</option>
                        </select>
                    </div>

                    <div class="field">
                        <label for="status">Trạng thái</label>
                        <select id="status">
                            <option value="Mới">Mới</option>
                            <option value="Đang xử lý">Đang xử lý</option>
                            <option value="Hoàn tất">Hoàn tất</option>
                        </select>
                    </div>

                <div class="modal-actions">
                    <button class="btn btn-primary" type="submit">Lưu</button>
                </div>
            </form>
        `);

        if (item) {
            document.getElementById('sender').value = item.sender;
            document.getElementById('subject').value = item.subject;
            document.getElementById('level').value = item.level;
            document.getElementById('status').value = item.status;
        }

        document.getElementById('dataForm').addEventListener('submit', function (event) {
            event.preventDefault();
            saveItem(id);
        });
    }

    function saveItem(id) {
        const items = getUserData('feedback', []);
        let item = id ? findItemById(items, id) : null;

        if (!item) {
            item = { id: makeId() };
            items.push(item);
        }

        item.sender = document.getElementById('sender').value.trim();
        item.subject = document.getElementById('subject').value.trim();
        item.level = document.getElementById('level').value;
        item.status = document.getElementById('status').value;

        saveUserData('feedback', items);
        closeModal();
        showToast('Đã lưu dữ liệu.');
        renderPage();
    }

    function deleteItem(id) {
        if (!confirmDelete('Bạn có muốn xóa mục này không?')) {
            return;
        }

        const items = getUserData('feedback', []);
        const newList = [];

        for (let i = 0; i < items.length; i++) {
            if (items[i].id !== id) {
                newList.push(items[i]);
            }
        }

        saveUserData('feedback', newList);
        showToast('Đã xóa dữ liệu.');
        renderPage();
    }

    function changeStatus(id, newStatus) {
        const items = getUserData('feedback', []);
        const item = findItemById(items, id);

        if (!item) {
            return;
        }

        item.status = newStatus;
        saveUserData('feedback', items);
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
