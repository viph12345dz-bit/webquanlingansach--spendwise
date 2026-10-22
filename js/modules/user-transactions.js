const user = setupAppPage('user-transactions.html', 'user');

if (user) {
    const searchInput = document.getElementById('globalSearch');
    const statusFilter = document.getElementById('statusFilter');
    const addBtn = document.getElementById('addBtn');
    const tableContent = document.getElementById('tableContent');

    function suggestCategory(description) {
        const text = description.toLowerCase();

        if (text.includes('cafe') || text.includes('cà phê') || text.includes('ăn') || text.includes('siêu thị')) {
            return 'Ăn uống';
        }

        if (text.includes('taxi') || text.includes('xăng') || text.includes('xe')) {
            return 'Di chuyển';
        }

        if (text.includes('game') || text.includes('phim')) {
            return 'Giải trí';
        }

        if (text.includes('lương')) {
            return 'Thu nhập';
        }

        return 'Khác';
    }

    function renderPage() {
        const transactions = getUserData('transactions', []);
        let totalExpense = 0;
        let foodExpense = 0;
        let categorized = 0;

        for (let i = 0; i < transactions.length; i++) {
            const item = transactions[i];

            if (item.type === 'expense') {
                totalExpense += Number(item.amount) || 0;
            }

            if (item.category === 'Ăn uống') {
                foodExpense += Number(item.amount) || 0;
            }

            if (item.category && item.category !== 'Chưa phân loại') {
                categorized++;
            }
        }

        const percent = transactions.length === 0 ? 0 : Math.round((categorized / transactions.length) * 100);

        renderStats([
            [transactions.length, 'Giao dịch'],
            [formatMoney(totalExpense), 'Tổng chi'],
            [formatMoney(foodExpense), 'Ăn uống'],
            [percent + '%', 'Đã phân loại']
        ]);

        const keyword = searchInput.value.trim();
        const selectedStatus = statusFilter.value;
        let rows = '';
        let count = 0;

        for (let i = 0; i < transactions.length; i++) {
            const item = transactions[i];
            const matchSearch = searchText(item.description + ' ' + item.category, keyword);
            const matchStatus = selectedStatus === 'all' || item.status === selectedStatus;

            if (matchSearch && matchStatus) {
                count++;
                const amountClass = item.type === 'income' ? 'amount-income' : 'amount-expense';
                const sign = item.type === 'income' ? '+' : '-';

                rows += `
                    <tr>
                        <td>${cleanText(item.description)}</td>
                        <td>${cleanText(item.category)}</td>
                        <td class="${amountClass}">${sign}${formatMoney(item.amount)}</td>
                        <td>${formatDate(item.date)}</td>
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
                    <strong>Chưa có giao dịch</strong>
                    <span>Nhấn “Thêm mới” để nhập giao dịch đầu tiên.</span>
                </div>
            `;
        } else {
            tableContent.innerHTML = `
                <div class="table-wrap">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Mô tả</th>
                                <th>Danh mục</th>
                                <th>Số tiền</th>
                                <th>Ngày</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>
            `;
        }

        bindTableButtons();
    }

    function bindTableButtons() {
        const editButtons = document.querySelectorAll('[data-edit]');
        const deleteButtons = document.querySelectorAll('[data-delete]');

        for (let i = 0; i < editButtons.length; i++) {
            editButtons[i].addEventListener('click', function () {
                openTransactionForm(this.dataset.edit);
            });
        }

        for (let i = 0; i < deleteButtons.length; i++) {
            deleteButtons[i].addEventListener('click', function () {
                deleteTransaction(this.dataset.delete);
            });
        }
    }

    function openTransactionForm(id) {
        const transactions = getUserData('transactions', []);
        const item = id ? findItemById(transactions, id) : null;

        openModal(item ? 'Sửa giao dịch' : 'Thêm giao dịch', `
            <form id="transactionForm">
                <div class="form-grid">
                    <div class="field">
                        <label for="type">Loại</label>
                        <select id="type">
                            <option value="expense">Chi tiêu</option>
                            <option value="income">Thu nhập</option>
                        </select>
                    </div>

                    <div class="field">
                        <label for="date">Ngày</label>
                        <input id="date" type="date" required>
                    </div>

                    <div class="field full-width">
                        <label for="description">Mô tả</label>
                        <input id="description" type="text" required>
                    </div>

                    <div class="field">
                        <label for="category">Danh mục</label>
                        <input id="category" type="text" required>
                    </div>

                    <div class="field">
                        <label for="amount">Số tiền</label>
                        <input id="amount" type="number" min="1" required>
                    </div>

                    <div class="field">
                        <label for="status">Trạng thái</label>
                        <select id="status">
                            <option value="Hoàn tất">Hoàn tất</option>
                            <option value="Chờ duyệt">Chờ duyệt</option>
                            <option value="Từ chối">Từ chối</option>
                        </select>
                    </div>
                </div>

                <div class="modal-actions">
                    <button id="aiCategoryBtn" class="btn btn-outline" type="button">Gợi ý danh mục</button>
                    <button class="btn btn-primary" type="submit">Lưu</button>
                </div>
            </form>
        `);

        if (item) {
            document.getElementById('type').value = item.type;
            document.getElementById('date').value = item.date;
            document.getElementById('description').value = item.description;
            document.getElementById('category').value = item.category;
            document.getElementById('amount').value = item.amount;
            document.getElementById('status').value = item.status;
        } else {
            document.getElementById('date').value = new Date().toISOString().slice(0, 10);
        }

        document.getElementById('aiCategoryBtn').addEventListener('click', function () {
            const description = document.getElementById('description').value.trim();

            if (!description) {
                showToast('Hãy nhập mô tả trước.', 'warning');
                return;
            }

            document.getElementById('category').value = suggestCategory(description);
        });

        document.getElementById('transactionForm').addEventListener('submit', function (event) {
            event.preventDefault();
            saveTransaction(id);
        });
    }

    function saveTransaction(id) {
        const transactions = getUserData('transactions', []);
        let item = id ? findItemById(transactions, id) : null;

        if (!item) {
            item = { id: makeId() };
            transactions.push(item);
        }

        item.type = document.getElementById('type').value;
        item.date = document.getElementById('date').value;
        item.description = document.getElementById('description').value.trim();
        item.category = document.getElementById('category').value.trim();
        item.amount = Number(document.getElementById('amount').value);
        item.status = document.getElementById('status').value;

        saveUserData('transactions', transactions);
        addNotification('Giao dịch “' + item.description + '” đã được lưu.', 'Giao dịch');
        closeModal();
        showToast('Đã lưu giao dịch.');
        renderPage();
    }

    function deleteTransaction(id) {
        if (!confirmDelete('Bạn có muốn xóa giao dịch này không?')) {
            return;
        }

        const transactions = getUserData('transactions', []);
        const newList = [];

        for (let i = 0; i < transactions.length; i++) {
            if (transactions[i].id !== id) {
                newList.push(transactions[i]);
            }
        }

        saveUserData('transactions', newList);
        showToast('Đã xóa giao dịch.');
        renderPage();
    }

    addBtn.addEventListener('click', function () {
        openTransactionForm(null);
    });

    searchInput.addEventListener('input', renderPage);
    statusFilter.addEventListener('change', renderPage);

    renderPage();
}
