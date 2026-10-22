const user = setupAppPage('coach-review.html', 'coach');

if (user) {
    const searchInput = document.getElementById('globalSearch');
    const statusFilter = document.getElementById('statusFilter');
    const addBtn = document.getElementById('addBtn');
    const tableContent = document.getElementById('tableContent');

    function renderPage() {
        const items = getUserData('reviews', []);
        renderStats([
            [items.length, 'Hạng mục'],
            [countByField(items, 'status', 'Hoàn tất'), 'Hoàn tất'],
            [countByField(items, 'status', 'Cần sửa'), 'Cần sửa'],
            [averageNumber(items, 'actual') + '%', 'Thực tế TB']
        ]);

        const keyword = searchInput.value.trim();
        const selectedStatus = statusFilter.value;
        let rows = '';
        let count = 0;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const matchSearch = searchText(item.category + ' ' + item.note, keyword);
            const matchStatus = selectedStatus === 'all' || item.status === selectedStatus;

            if (matchSearch && matchStatus) {
                count++;

                rows += `
                    <tr>
                        <td>${cleanText(item.category)}</td>
                        <td>${cleanText(item.actual)}%</td>
                        <td>${cleanText(item.plan)}%</td>
                        <td>${cleanText(item.note)}</td>
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
                                <th>Hạng mục</th>
                                <th>Thực tế (%)</th>
                                <th>Kế hoạch (%)</th>
                                <th>Nhận xét</th>
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
        const items = getUserData('reviews', []);
        const item = id ? findItemById(items, id) : null;

        openModal(item ? 'Sửa dữ liệu' : 'Thêm dữ liệu', `
            <form id="dataForm">
                    <div class="field">
                        <label for="category">Hạng mục</label>
                        <input id="category" type="text" required>
                    </div>

                    <div class="field">
                        <label for="actual">Thực tế (%)</label>
                        <input id="actual" type="number" min="0" required>
                    </div>

                    <div class="field">
                        <label for="plan">Kế hoạch (%)</label>
                        <input id="plan" type="number" min="0" required>
                    </div>

                    <div class="field">
                        <label for="note">Nhận xét</label>
                        <input id="note" type="text" required>
                    </div>

                    <div class="field">
                        <label for="status">Trạng thái</label>
                        <select id="status">
                            <option value="Hoàn tất">Hoàn tất</option>
                            <option value="Cần sửa">Cần sửa</option>
                        </select>
                    </div>

                <div class="modal-actions">
                    <button class="btn btn-primary" type="submit">Lưu</button>
                </div>
            </form>
        `);

        if (item) {
            document.getElementById('category').value = item.category;
            document.getElementById('actual').value = item.actual;
            document.getElementById('plan').value = item.plan;
            document.getElementById('note').value = item.note;
            document.getElementById('status').value = item.status;
        }

        document.getElementById('dataForm').addEventListener('submit', function (event) {
            event.preventDefault();
            saveItem(id);
        });
    }

    function saveItem(id) {
        const items = getUserData('reviews', []);
        let item = id ? findItemById(items, id) : null;

        if (!item) {
            item = { id: makeId() };
            items.push(item);
        }

        item.category = document.getElementById('category').value.trim();
        item.actual = Number(document.getElementById('actual').value);
        item.plan = Number(document.getElementById('plan').value);
        item.note = document.getElementById('note').value.trim();
        item.status = document.getElementById('status').value;

        saveUserData('reviews', items);
        closeModal();
        showToast('Đã lưu dữ liệu.');
        renderPage();
    }

    function deleteItem(id) {
        if (!confirmDelete('Bạn có muốn xóa mục này không?')) {
            return;
        }

        const items = getUserData('reviews', []);
        const newList = [];

        for (let i = 0; i < items.length; i++) {
            if (items[i].id !== id) {
                newList.push(items[i]);
            }
        }

        saveUserData('reviews', newList);
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
