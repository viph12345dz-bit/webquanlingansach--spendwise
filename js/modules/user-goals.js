const user = setupAppPage('user-goals.html', 'user');

if (user) {
    const searchInput = document.getElementById('globalSearch');
    const statusFilter = document.getElementById('statusFilter');
    const addBtn = document.getElementById('addBtn');
    const tableContent = document.getElementById('tableContent');

    function renderPage() {
        const goals = getUserData('goals', []);
        let targetTotal = 0;
        let savedTotal = 0;

        for (let i = 0; i < goals.length; i++) {
            targetTotal += Number(goals[i].target) || 0;
            savedTotal += Number(goals[i].saved) || 0;
        }

        const percent = targetTotal === 0 ? 0 : Math.round((savedTotal / targetTotal) * 100);
        const need = Math.max(0, targetTotal - savedTotal);

        renderStats([
            [goals.length, 'Mục tiêu'],
            [formatMoney(savedTotal), 'Đã tích lũy'],
            [percent + '%', 'Tiến độ chung'],
            [formatMoney(need), 'Còn thiếu']
        ]);

        const keyword = searchInput.value.trim();
        const selectedStatus = statusFilter.value;
        let rows = '';
        let count = 0;

        for (let i = 0; i < goals.length; i++) {
            const item = goals[i];
            const matchSearch = searchText(item.name, keyword);
            const matchStatus = selectedStatus === 'all' || item.status === selectedStatus;

            if (matchSearch && matchStatus) {
                count++;
                const progress = item.target === 0 ? 0 : Math.min(100, Math.round((item.saved / item.target) * 100));

                rows += `
                    <tr>
                        <td>${cleanText(item.name)}</td>
                        <td class="goal-progress">
                            ${progress}%
                            <span class="progress">
                                <span class="progress-bar" style="width: ${progress}%"></span>
                            </span>
                        </td>
                        <td>${formatMoney(item.saved)} / ${formatMoney(item.target)}</td>
                        <td>${formatDate(item.deadline)}</td>
                        <td>${statusLabel(item.status)}</td>
                        <td>
                            <div class="actions">
                                <button class="link-button" data-add-money="${item.id}" type="button">Góp thêm</button>
                                <button class="link-button" data-coach="${item.id}" type="button">AI Coach</button>
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
                    <strong>Chưa có mục tiêu</strong>
                    <span>Nhấn “Thêm mới” để tạo mục tiêu tiết kiệm.</span>
                </div>
            `;
        } else {
            tableContent.innerHTML = `
                <div class="table-wrap">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Mục tiêu</th>
                                <th>Tiến độ</th>
                                <th>Đã góp / Mục tiêu</th>
                                <th>Kỳ hạn</th>
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
        const addMoneyButtons = document.querySelectorAll('[data-add-money]');
        const coachButtons = document.querySelectorAll('[data-coach]');

        for (let i = 0; i < editButtons.length; i++) {
            editButtons[i].addEventListener('click', function () {
                openGoalForm(this.dataset.edit);
            });
        }

        for (let i = 0; i < deleteButtons.length; i++) {
            deleteButtons[i].addEventListener('click', function () {
                deleteGoal(this.dataset.delete);
            });
        }

        for (let i = 0; i < addMoneyButtons.length; i++) {
            addMoneyButtons[i].addEventListener('click', function () {
                addMoney(this.dataset.addMoney);
            });
        }

        for (let i = 0; i < coachButtons.length; i++) {
            coachButtons[i].addEventListener('click', function () {
                showCoach(this.dataset.coach);
            });
        }
    }

    function openGoalForm(id) {
        const goals = getUserData('goals', []);
        const item = id ? findItemById(goals, id) : null;

        openModal(item ? 'Sửa mục tiêu' : 'Thêm mục tiêu', `
            <form id="goalForm">
                <div class="field">
                    <label for="goalName">Tên mục tiêu</label>
                    <input id="goalName" type="text" required>
                </div>

                <div class="form-grid">
                    <div class="field">
                        <label for="target">Số tiền mục tiêu</label>
                        <input id="target" type="number" min="1" required>
                    </div>

                    <div class="field">
                        <label for="saved">Đã tiết kiệm</label>
                        <input id="saved" type="number" min="0" required>
                    </div>

                    <div class="field">
                        <label for="deadline">Kỳ hạn</label>
                        <input id="deadline" type="date" required>
                    </div>

                    <div class="field">
                        <label for="status">Trạng thái</label>
                        <select id="status">
                            <option value="Đang thực hiện">Đang thực hiện</option>
                            <option value="Hoàn tất">Hoàn tất</option>
                        </select>
                    </div>
                </div>

                <div class="modal-actions">
                    <button class="btn btn-primary" type="submit">Lưu</button>
                </div>
            </form>
        `);

        if (item) {
            document.getElementById('goalName').value = item.name;
            document.getElementById('target').value = item.target;
            document.getElementById('saved').value = item.saved;
            document.getElementById('deadline').value = item.deadline;
            document.getElementById('status').value = item.status;
        }

        document.getElementById('goalForm').addEventListener('submit', function (event) {
            event.preventDefault();
            saveGoal(id);
        });
    }

    function saveGoal(id) {
        const goals = getUserData('goals', []);
        let item = id ? findItemById(goals, id) : null;

        if (!item) {
            item = { id: makeId() };
            goals.push(item);
        }

        item.name = document.getElementById('goalName').value.trim();
        item.target = Number(document.getElementById('target').value);
        item.saved = Number(document.getElementById('saved').value);
        item.deadline = document.getElementById('deadline').value;
        item.status = document.getElementById('status').value;

        if (item.saved >= item.target) {
            item.status = 'Hoàn tất';
        }

        saveUserData('goals', goals);
        addNotification('Mục tiêu “' + item.name + '” đã được cập nhật.', 'Mục tiêu');
        closeModal();
        showToast('Đã lưu mục tiêu.');
        renderPage();
    }

    function addMoney(id) {
        const goals = getUserData('goals', []);
        const item = findItemById(goals, id);
        const value = window.prompt('Nhập số tiền muốn góp thêm:');
        const amount = Number(value);

        if (!item || !amount || amount < 1) {
            return;
        }

        item.saved += amount;

        if (item.saved >= item.target) {
            item.status = 'Hoàn tất';
        }

        saveUserData('goals', goals);
        showToast('Đã cập nhật số tiền tiết kiệm.');
        renderPage();
    }

    function showCoach(id) {
        const goals = getUserData('goals', []);
        const item = findItemById(goals, id);

        if (!item) {
            return;
        }

        const remaining = Math.max(0, item.target - item.saved);
        const suggestion = Math.ceil(remaining / 6);

        window.alert(
            'Goal Coach mô phỏng:\n' +
            'Bạn còn thiếu ' + formatMoney(remaining) + '.\n' +
            'Nếu chia trong 6 tháng, hãy cố gắng tiết kiệm khoảng ' + formatMoney(suggestion) + ' mỗi tháng.'
        );
    }

    function deleteGoal(id) {
        if (!confirmDelete('Bạn có muốn xóa mục tiêu này không?')) {
            return;
        }

        const goals = getUserData('goals', []);
        const newList = [];

        for (let i = 0; i < goals.length; i++) {
            if (goals[i].id !== id) {
                newList.push(goals[i]);
            }
        }

        saveUserData('goals', newList);
        renderPage();
    }

    addBtn.addEventListener('click', function () {
        openGoalForm(null);
    });

    searchInput.addEventListener('input', renderPage);
    statusFilter.addEventListener('change', renderPage);

    renderPage();
}
