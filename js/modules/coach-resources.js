const user = setupAppPage('coach-resources.html', 'coach');

if (user) {
    const searchInput = document.getElementById('globalSearch');
    const statusFilter = document.getElementById('statusFilter');
    const addBtn = document.getElementById('addBtn');
    const tableContent = document.getElementById('tableContent');
    let editingSnapshot = null;
    statusFilter.innerHTML = '<option value="all">Tất cả trạng thái</option>' +
        '<option value="draft">Bản nháp</option><option value="pending">Chờ duyệt</option>' +
        '<option value="approved">Đã duyệt</option><option value="rejected">Từ chối</option>' +
        '<option value="needs-revision">Yêu cầu sửa</option>';

    function reviewStatus(item) {
        if (item.moderationStatus) return item.moderationStatus;
        if (item.status === 'Đã xuất bản') return 'pending';
        if (item.status === 'Bản nháp') return 'draft';
        return item.status;
    }

    function reviewLabel(item) {
        const labels = { draft: 'Bản nháp', pending: 'Chờ duyệt', approved: 'Đã duyệt',
            rejected: 'Từ chối', 'needs-revision': 'Yêu cầu sửa' };
        return labels[reviewStatus(item)] || item.status;
    }

    function renderPage() {
        const allResources = getUserData('resources', []);
        const items = allResources.filter(function (item) { return item.coachId === user.id; });
        renderStats([
            [items.filter(function (item) { return reviewStatus(item) === 'approved'; }).length, 'Đã duyệt'],
            [items.filter(function (item) { return reviewStatus(item) === 'draft'; }).length, 'Bản nháp'],
            [items.length, 'Tổng tài nguyên'],
            [countUnique(items, 'format'), 'Định dạng']
        ]);

        const keyword = searchInput.value.trim();
        const selectedStatus = statusFilter.value;
        let rows = '';
        let count = 0;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const matchSearch = searchText(item.title + ' ' + item.format, keyword);
            const matchStatus = selectedStatus === 'all' || reviewStatus(item) === selectedStatus;

            if (matchSearch && matchStatus) {
                count++;

                rows += `
                    <tr>
                        <td>${cleanText(item.title)}<p class="muted">${cleanText(item.content || '')}</p><p>${cleanText(item.reviewNote ? 'Kết quả kiểm duyệt: ' + item.reviewNote : '')}</p></td>
                        <td>${cleanText(item.format)}</td>
                        <td>${formatDate(item.updated)}</td>
                        <td>${statusLabel(reviewLabel(item))}</td>
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
                                <th>Tài nguyên</th>
                                <th>Định dạng</th>
                                <th>Cập nhật</th>
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
        const items = getUserData('resources', []);
        const item = id ? findItemById(items, id) : null;
        if (id && (!item || item.coachId !== user.id)) {
            showToast('Không được sửa tài nguyên của Coach khác.', 'error');
            return;
        }
        editingSnapshot = item ? JSON.stringify(item) : null;

        openModal(item ? 'Sửa dữ liệu' : 'Thêm dữ liệu', `
            <form id="dataForm">
                    <div class="field">
                        <label for="title">Tài nguyên</label>
                        <input id="title" type="text" required>
                    </div>

                    <div class="field">
                        <label for="resourceContent">Nội dung tài nguyên</label>
                        <textarea id="resourceContent" rows="4" maxlength="5000" required></textarea>
                    </div>
                    <div class="field">
                        <label for="format">Định dạng</label>
                        <select id="format">
                            <option value="Bài viết">Bài viết</option>
                            <option value="PDF">PDF</option>
                            <option value="Worksheet">Worksheet</option>
                        </select>
                    </div>

                    <div class="field">
                        <label for="updated">Cập nhật</label>
                        <input id="updated" type="date" required>
                    </div>

                    <div class="field">
                        <label for="status">Trạng thái</label>
                        <select id="status">
                            <option value="draft">Bản nháp</option>
                            <option value="pending">Gửi duyệt</option>
                        </select>
                    </div>

                <div class="modal-actions">
                    <button class="btn btn-primary" type="submit">Lưu</button>
                </div>
            </form>
        `);

        if (item) {
            document.getElementById('title').value = item.title;
            document.getElementById('format').value = item.format;
            document.getElementById('updated').value = item.updated;
            document.getElementById('status').value = reviewStatus(item) === 'pending' ? 'pending' : 'draft';
            document.getElementById('resourceContent').value = item.content || '';
        }

        document.getElementById('dataForm').addEventListener('submit', function (event) {
            event.preventDefault();
            saveItem(id);
        });
    }

    function saveItem(id) {
        const items = getUserData('resources', []);
        let item = id ? findItemById(items, id) : null;
        if (!canWriteAppData()) return;
        if (id && (!item || item.coachId !== user.id || JSON.stringify(item) !== editingSnapshot)) {
            showToast('Tài nguyên hoặc kết quả duyệt đã thay đổi. Hãy mở lại form Sửa.', 'error');
            return;
        }
        const title = document.getElementById('title').value.trim();
        const content = document.getElementById('resourceContent').value.trim();
        const status = document.getElementById('status').value;
        const format = document.getElementById('format').value;
        const date = document.getElementById('updated').value;
        if (title.length < 2 || title.length > 150 || !content ||
            ['draft', 'pending'].indexOf(status) === -1 ||
            ['Bài viết', 'PDF', 'Worksheet'].indexOf(format) === -1 ||
            !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date))) {
            showToast('Nhập tiêu đề, nội dung, ngày và trạng thái hợp lệ.', 'error');
            return;
        }

        if (!item) {
            item = { id: makeId() };
            items.push(item);
        }

        item.title = document.getElementById('title').value.trim();
        item.format = document.getElementById('format').value;
        item.updated = document.getElementById('updated').value;
        item.status = status;
        item.moderationStatus = status;
        item.coachId = user.id;
        item.coachName = user.name;
        item.content = content;
        item.reviewNote = '';
        delete item.reviewSnapshot;
        delete item.reviewedAt;
        delete item.reviewedBy;

        if (!saveUserData('resources', items)) return;
        closeModal();
        showToast('Đã lưu dữ liệu.');
        renderPage();
    }

    function deleteItem(id) {
        if (!confirmDelete('Bạn có muốn xóa mục này không?')) {
            return;
        }

        const items = getUserData('resources', []);
        const target = findItemById(items, id);
        if (!target || target.coachId !== user.id || !canWriteAppData()) return;
        const newList = [];

        for (let i = 0; i < items.length; i++) {
            if (items[i].id !== id) {
                newList.push(items[i]);
            }
        }

        if (!saveUserData('resources', newList)) return;
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
