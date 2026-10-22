const user = setupAppPage('user-dashboard.html', 'user');

if (user) {
    const searchInput = document.getElementById('globalSearch');
    const statusFilter = document.getElementById('statusFilter');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const insightContent = document.getElementById('insightContent');

    function renderPage() {
        const transactions = getUserData('transactions', []);
        const goals = getUserData('goals', []);
        const insights = getUserData('insights', []);
        let income = 0;
        let expense = 0;

        for (let i = 0; i < transactions.length; i++) {
            if (transactions[i].type === 'income') {
                income += Number(transactions[i].amount) || 0;
            } else {
                expense += Number(transactions[i].amount) || 0;
            }
        }

        renderStats([
            [formatMoney(expense), 'Đã chi tiêu'],
            [formatMoney(income), 'Thu nhập'],
            [formatMoney(income - expense), 'Còn lại'],
            [goals.length, 'Mục tiêu']
        ]);

        const keyword = searchInput.value.trim();
        const selectedStatus = statusFilter.value;
        let html = '';
        let count = 0;

        for (let i = 0; i < insights.length; i++) {
            const item = insights[i];
            const matchSearch = searchText(item.title + ' ' + item.detail, keyword);
            const matchStatus = selectedStatus === 'all' || item.status === selectedStatus;

            if (matchSearch && matchStatus) {
                count++;
                html += `
                    <article class="insight-card">
                        <h3>${cleanText(item.title)}</h3>
                        <p>${cleanText(item.detail)}</p>
                        <p><strong>Tác động:</strong> ${cleanText(item.impact)}</p>
                        ${statusLabel(item.status)}
                        <button class="link-button danger" data-delete="${item.id}" type="button">Xóa</button>
                    </article>
                `;
            }
        }

        if (count === 0) {
            html = `
                <div class="empty-state">
                    <strong>Chưa có phân tích</strong>
                    <span>Nhấn “Phân tích mới” sau khi bạn đã nhập giao dịch.</span>
                </div>
            `;
        }

        insightContent.innerHTML = html;

        const deleteButtons = document.querySelectorAll('[data-delete]');

        for (let i = 0; i < deleteButtons.length; i++) {
            deleteButtons[i].addEventListener('click', function () {
                deleteInsight(this.dataset.delete);
            });
        }
    }

    function createInsight() {
        const transactions = getUserData('transactions', []);
        let expenseByCategory = {};
        let totalExpense = 0;

        for (let i = 0; i < transactions.length; i++) {
            const item = transactions[i];

            if (item.type === 'expense') {
                const amount = Number(item.amount) || 0;
                totalExpense += amount;

                if (!expenseByCategory[item.category]) {
                    expenseByCategory[item.category] = 0;
                }

                expenseByCategory[item.category] += amount;
            }
        }

        if (totalExpense === 0) {
            showToast('Không đủ dữ liệu để phân tích.', 'warning');
            return;
        }

        let topCategory = '';
        let topAmount = 0;

        for (const category in expenseByCategory) {
            if (expenseByCategory[category] > topAmount) {
                topCategory = category;
                topAmount = expenseByCategory[category];
            }
        }

        const percent = Math.round((topAmount / totalExpense) * 100);
        const insights = getUserData('insights', []);

        insights.unshift({
            id: makeId(),
            title: 'Chi tiêu tập trung vào ' + topCategory,
            detail: topCategory + ' chiếm khoảng ' + percent + '% tổng chi tiêu hiện tại.',
            impact: formatMoney(topAmount),
            status: 'Hoàn tất'
        });

        saveUserData('insights', insights);
        addNotification('Đã tạo một phân tích chi tiêu mới.', 'AI');
        showToast('Đã tạo phân tích mới.');
        renderPage();
    }

    function deleteInsight(id) {
        if (!confirmDelete('Bạn có muốn xóa phân tích này không?')) {
            return;
        }

        const insights = getUserData('insights', []);
        const newList = [];

        for (let i = 0; i < insights.length; i++) {
            if (insights[i].id !== id) {
                newList.push(insights[i]);
            }
        }

        saveUserData('insights', newList);
        renderPage();
    }

    analyzeBtn.addEventListener('click', createInsight);
    searchInput.addEventListener('input', renderPage);
    statusFilter.addEventListener('change', renderPage);

    renderPage();
}
