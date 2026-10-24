const user = setupAppPage('notifications.html');

if (user) {
    const searchInput = document.getElementById('globalSearch');
    const readFilter = document.getElementById('readFilter');
    const addBtn = document.getElementById('addBtn');
    const tableContent = document.getElementById('tableContent');

    function renderPage() {
        const items = getUserData('notifications', []);
        let unread = 0;
        let budget = 0;
        let goal = 0;

        for (let i = 0; i < items.length; i++) {
            if (!items[i].read) {
                unread++;
            }

            if (items[i].type === 'Ngân sách') {
                budget++;
            }

            if (items[i].type === 'Mục tiêu') {
                goal++;
            }
        }

        renderStats([
            [unread, 'Chưa đọc'],
            [budget, 'Ngân sách'],
            [goal, 'Mục tiêu'],
            [items.length, 'Tổng thông báo']
        ]);

        const keyword = searchInput.value.trim();
        const selected = readFilter.value;
        let rows = '';
        let count = 0;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const matchSearch = searchText(item.text + ' ' + item.type, keyword);
            let matchRead = true;

            if (selected === 'unread') {
                matchRead = !item.read;
            }

            if (selected === 'read') {
                matchRead = item.read;
            }

            if (matchSearch && matchRead) {
                count++;
                const rowClass = item.read ? '' : 'notification-unread';

                rows += `
                    <tr class="${rowClass}">
                        <td>${cleanText(item.text)}</td>
                        <td>${cleanText(item.type)}</td>
                        <td>${new Date(item.time).toLocaleString('vi-VN')}</td>
                        <td>${item.read ? 'Đã đọc' : 'Chưa đọc'}</td>
                        <td>
                            <div class="actions">
                                <button class="link-button" data-toggle="${item.id}" type="button">${item.read ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'}</button>
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
                    <strong>Chưa có thông báo</strong>
                </div>
            `;
        } else {
            tableContent.innerHTML = `
                <div class="table-wrap">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Thông báo</th>
                                <th>Loại</th>
                                <th>Thời gian</th>
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
        const toggleButtons = document.querySelectorAll('[data-toggle]');
        const editButtons = document.querySelectorAll('[data-edit]');
        const deleteButtons = document.querySelectorAll('[data-delete]');

        for (let i = 0; i < toggleButtons.length; i++) {
            toggleButtons[i].addEventListener('click', function () {
                toggleRead(this.dataset.toggle);
            });
        }

        for (let i = 0; i < editButtons.length; i++) {
            editButtons[i].addEventListener('click', function () {
                openNotificationForm(this.dataset.edit);
            });
        }

        for (let i = 0; i < deleteButtons.length; i++) {
            deleteButtons[i].addEventListener('click', function () {
                deleteNotification(this.dataset.delete);
            });
        }
    }

    function openNotificationForm(id) {
        const items = getUserData('notifications', []);
        const item = id ? findItemById(items, id) : null;

        openModal(item ? 'Sửa thông báo' : 'Thêm thông báo', `
            <form id="notificationForm">
                <div class="field">
                    <label for="text">Nội dung</label>
                    <input id="text" type="text" maxlength="500" required>
                </div>

                <div class="field">
                    <label for="type">Loại</label>
                    <select id="type">
                        <option value="Hệ thống">Hệ thống</option>
                        <option value="Ngân sách">Ngân sách</option>
                        <option value="Mục tiêu">Mục tiêu</option>
                        <option value="Cập nhật">Cập nhật</option>
                    </select>
                </div>

                <div class="modal-actions">
                    <button class="btn btn-primary" type="submit">Lưu</button>
                </div>
            </form>
        `);

        if (item) {
            document.getElementById('text').value = item.text;
            document.getElementById('type').value = item.type;
        }

        document.getElementById('notificationForm').addEventListener('submit', function (event) {
            event.preventDefault();
            saveNotification(id);
        });
    }

    function saveNotification(id) {
        const items = getUserData('notifications', []);
        let item = id ? findItemById(items, id) : null;
        const text = document.getElementById('text').value.trim();
        const type = document.getElementById('type').value;
        if (!canWriteAppData()) return;
        if (id && !item) {
            showToast('Thông báo đã bị xóa. Hãy tải lại danh sách.', 'error');
            return;
        }
        if (!text || text.length > 500 || ['Hệ thống', 'Ngân sách', 'Mục tiêu', 'Cập nhật'].indexOf(type) === -1) {
            showToast('Nhập nội dung thông báo và loại hợp lệ.', 'error');
            return;
        }

        if (!item) {
            item = {
                id: makeId(),
                time: new Date().toISOString(),
                read: false
            };

            items.unshift(item);
        }

        item.text = document.getElementById('text').value.trim();
        item.type = document.getElementById('type').value;

        if (!saveUserData('notifications', items)) return;
        closeModal();
        renderPage();
    }

    function toggleRead(id) {
        const items = getUserData('notifications', []);
        const item = findItemById(items, id);

        if (item) {
            item.read = !item.read;
            if (!saveUserData('notifications', items)) return;
            renderPage();
        }
    }

    function deleteNotification(id) {
        if (!confirmDelete('Bạn có muốn xóa thông báo này không?')) {
            return;
        }

        const items = getUserData('notifications', []);
        const newList = [];

        for (let i = 0; i < items.length; i++) {
            if (items[i].id !== id) {
                newList.push(items[i]);
            }
        }

        if (!saveUserData('notifications', newList)) return;
        renderPage();
    }

    addBtn.addEventListener('click', function () {
        openNotificationForm(null);
    });

    searchInput.addEventListener('input', renderPage);
    readFilter.addEventListener('change', renderPage);

    renderPage();
}
