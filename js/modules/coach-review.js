const user = setupAppPage('coach-review.html', 'coach');

if (user) {
    const searchInput = document.getElementById('globalSearch');
    const statusFilter = document.getElementById('statusFilter');
    const addBtn = document.getElementById('addBtn');
    const tableContent = document.getElementById('tableContent');
    let editingSnapshot = null;
    const clientFilter = document.createElement('select');
    clientFilter.id = 'reviewClientFilter';
    clientFilter.className = 'filter-select';
    clientFilter.setAttribute('aria-label', 'Khách hàng cần review');
    const clients = getUserData('clients', []);
    clientFilter.innerHTML = '<option value="">Tất cả khách hàng</option>' + clientOptions();
    statusFilter.insertAdjacentElement('beforebegin', clientFilter);
    const requestedClient = new URLSearchParams(window.location.search).get('clientId');
    if (clients.some(function (client) { return client.id === requestedClient; })) {
        clientFilter.value = requestedClient;
    }
    const summary = document.createElement('p');
    summary.id = 'clientBudgetSummary';
    summary.className = 'note';
    tableContent.insertAdjacentElement('beforebegin', summary);
    clientFilter.addEventListener('change', renderPage);

    function clientOptions() {
        return getUserData('clients', []).map(function (client) {
            return '<option value="' + cleanText(client.id) + '">' + cleanText(client.name) + '</option>';
        }).join('');
    }

    function getNotes() {
        const notes = getUserData('coachNotes', []);
        // Giữ nhận xét cũ; chỉ chuyển một lần, không xóa kho reviews.
        if (!getUserData('reviewsMigrated', false)) {
            const legacy = getUserData('reviews', []);
            for (let i = 0; i < legacy.length; i++) {
                if (!findItemById(notes, legacy[i].id)) {
                    notes.push(Object.assign({}, legacy[i], {
                        coachId: user.id, clientId: legacy[i].clientId || '',
                        content: legacy[i].content || legacy[i].note || ''
                    }));
                }
            }
            if (legacy.length && !saveUserData('coachNotes', notes)) return notes;
            if (!saveUserData('reviewsMigrated', true)) return notes;
        }
        return notes;
    }

    function renderBudgetSummary() {
        const client = findItemById(getUserData('clients', []), clientFilter.value);
        const account = client && findItemById(getUsers(), client.accountId);
        if (!account || account.role !== 'user') {
            summary.textContent = 'Chọn khách hàng có tài khoản USER demo liên kết để xem thu/chi/ngân sách. Khách hàng chưa liên kết không có số liệu giả.';
            return;
        }
        const transactions = readJSON('sw_transactions', []).filter(function (item) {
            return item.userId === account.id;
        });
        let income = 0;
        let expense = 0;
        transactions.forEach(function (item) {
            if (item.type === 'income') income += Number(item.amount) || 0;
            if (item.type === 'expense') expense += Number(item.amount) || 0;
        });
        const budgets = readJSON('sw_budgets', []).filter(function (item) {
            return item.userId === account.id;
        });
        const limit = budgets.reduce(function (total, item) { return total + (Number(item.limit) || 0); }, 0);
        summary.textContent = account.name + ' · Tổng dữ liệu demo đã liên kết: thu ' + formatMoney(income) +
            ', chi ' + formatMoney(expense) + ', ngân sách ' + (budgets.length ? formatMoney(limit) : 'chưa nhập') + '.';
    }

    function renderPage() {
        renderBudgetSummary();
        const items = getNotes();
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

            const matchClient = !clientFilter.value || item.clientId === clientFilter.value;
            if (matchSearch && matchStatus && matchClient) {
                count++;

                rows += `
                    <tr>
                        <td>${cleanText((findItemById(getUserData('clients', []), item.clientId) || {}).name || 'Chưa gắn khách hàng')} · ${cleanText(item.category)}</td>
                        <td>${cleanText(item.actual)}%</td>
                        <td>${cleanText(item.plan)}%</td>
                        <td>${cleanText(item.content || item.note)}</td>
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
        const items = getNotes();
        const item = id ? findItemById(items, id) : null;
        editingSnapshot = item ? JSON.stringify(item) : null;

        openModal(item ? 'Sửa dữ liệu' : 'Thêm dữ liệu', `
            <form id="dataForm">
                    <div class="field">
                        <label for="reviewClient">Khách hàng</label>
                        <select id="reviewClient" required><option value="">Chọn khách hàng</option>${clientOptions()}</select>
                    </div>
                    <div class="field">
                        <label for="category">Hạng mục</label>
                        <input id="category" type="text" required>
                    </div>

                    <div class="field">
                        <label for="actual">Thực tế (%)</label>
                        <input id="actual" type="number" min="0" max="100" step="0.1" required>
                    </div>

                    <div class="field">
                        <label for="plan">Kế hoạch (%)</label>
                        <input id="plan" type="number" min="0" max="100" step="0.1" required>
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

        document.getElementById('reviewClient').value = item ? (item.clientId || '') : clientFilter.value;
        if (item) {
            document.getElementById('category').value = item.category;
            document.getElementById('actual').value = item.actual;
            document.getElementById('plan').value = item.plan;
            document.getElementById('note').value = item.content || item.note || '';
            document.getElementById('status').value = item.status;
        }

        document.getElementById('dataForm').addEventListener('submit', function (event) {
            event.preventDefault();
            saveItem(id);
        });
    }

    function saveItem(id) {
        const items = getNotes();
        let item = id ? findItemById(items, id) : null;
        const clientId = document.getElementById('reviewClient').value;
        const category = document.getElementById('category').value.trim();
        const content = document.getElementById('note').value.trim();
        const actualText = document.getElementById('actual').value;
        const planText = document.getElementById('plan').value;
        const actual = Number(actualText);
        const plan = Number(planText);
        const status = document.getElementById('status').value;
        if (!canWriteAppData()) return;
        if (id && (!item || JSON.stringify(item) !== editingSnapshot)) {
            showToast('Nhận xét đã thay đổi. Hãy mở lại form Sửa.', 'error');
            return;
        }
        if (!findItemById(getUserData('clients', []), clientId) || category.length < 2 ||
            !content || !actualText.trim() || !planText.trim() ||
            !Number.isFinite(actual) || !Number.isFinite(plan) ||
            actual < 0 || actual > 100 || plan < 0 || plan > 100 ||
            ['Hoàn tất', 'Cần sửa'].indexOf(status) === -1) {
            showToast('Chọn khách hàng, nhập nhận xét và tỷ lệ từ 0 đến 100%.', 'error');
            return;
        }

        if (!item) {
            item = { id: makeId() };
            items.push(item);
        }

        item.category = document.getElementById('category').value.trim();
        item.actual = Number(document.getElementById('actual').value);
        item.plan = Number(document.getElementById('plan').value);
        item.note = content;
        item.content = content;
        item.clientId = clientId;
        item.coachId = user.id;
        item.status = document.getElementById('status').value;

        if (!saveUserData('coachNotes', items)) return;
        closeModal();
        showToast('Đã lưu dữ liệu.');
        renderPage();
    }

    function deleteItem(id) {
        if (!confirmDelete('Bạn có muốn xóa mục này không?')) {
            return;
        }

        const items = getNotes();
        const newList = [];

        for (let i = 0; i < items.length; i++) {
            if (items[i].id !== id) {
                newList.push(items[i]);
            }
        }

        if (!saveUserData('coachNotes', newList)) return;
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
