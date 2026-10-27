const coachUser = setupAppPage('coach-review.html', 'coach');

if (coachUser) {
    const clientSelect = document.getElementById('clientSelect');
    const periodFilter = document.getElementById('periodFilter');
    const statusFilter = document.getElementById('statusFilter');
    const searchInput = document.getElementById('globalSearch');
    const addNoteBtn = document.getElementById('addNoteBtn');
    const budgetSummary = document.getElementById('budgetSummary');
    const tableContent = document.getElementById('tableContent');
    const requestedClientId = new URLSearchParams(window.location.search).get('clientId');

    function currentPeriod() {
        const now = new Date();
        return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
    }

    function getClients() {
        const users = getSharedUsers().concat(getUsers());
        const clients = [];
        const ids = [];

        for (let i = 0; i < users.length; i++) {
            const item = users[i];
            const id = String(item.id);

            if (String(item.role || '').toLowerCase() === 'user' && ids.indexOf(id) === -1) {
                clients.push(item);
                ids.push(id);
            }
        }

        return clients;
    }

    function populateClients() {
        const clients = getClients();
        const previous = clientSelect.value;
        let options = '<option value="">Chọn khách hàng</option>';

        for (let i = 0; i < clients.length; i++) {
            options += '<option value="' + cleanText(clients[i].id) + '">' +
                cleanText(clients[i].name) + ' — ' + cleanText(clients[i].email) + '</option>';
        }

        clientSelect.innerHTML = options;

        if (previous) {
            clientSelect.value = previous;
        } else if (requestedClientId) {
            clientSelect.value = requestedClientId;
        }

        if (!clientSelect.value && clients.length > 0) {
            clientSelect.value = String(clients[0].id);
        }
    }

    function getTransactions(clientId) {
        const shared = getSharedTransactions();
        const matching = [];

        for (let i = 0; i < shared.length; i++) {
            if (String(shared[i].userId) === String(clientId)) {
                matching.push(shared[i]);
            }
        }

        if (matching.length > 0) {
            return matching;
        }

        return readJSON('spendwise_' + clientId + '_transactions', []);
    }

    function renderBudgetSummary() {
        const clientId = clientSelect.value;
        const period = periodFilter.value || currentPeriod();

        if (!clientId) {
            budgetSummary.innerHTML = '<div class="empty-state"><strong>Chọn khách hàng</strong>' +
                '<span>Chọn khách hàng để xem ngân sách và giao dịch.</span></div>';
            return;
        }

        const transactions = getTransactions(clientId);
        const budgets = getSharedBudgets();
        let income = 0;
        let expense = 0;
        let limit = 0;

        for (let i = 0; i < transactions.length; i++) {
            const item = transactions[i];

            if (String(item.date || '').slice(0, 7) !== period) {
                continue;
            }

            if (item.status && item.status !== 'Hoàn tất' && item.status !== 'completed' && item.status !== 'approved') {
                continue;
            }

            if (item.type === 'income') {
                income += Number(item.amount) || 0;
            } else if (item.type === 'expense') {
                expense += Number(item.amount) || 0;
            }
        }

        for (let i = 0; i < budgets.length; i++) {
            const item = budgets[i];

            if (String(item.userId) === String(clientId) &&
                String(item.period || '').slice(0, 7) === period) {
                limit += Number(item.limit) || 0;
            }
        }

        const percent = limit === 0 ? 0 : Math.round(expense / limit * 100);
        const warning = limit > 0 && expense > limit ? ' warning' : '';

        budgetSummary.innerHTML =
            '<article class="budget-card"><span>Thu nhập tháng</span><strong>' + formatMoney(income) + '</strong></article>' +
            '<article class="budget-card"><span>Chi tiêu tháng</span><strong>' + formatMoney(expense) + '</strong></article>' +
            '<article class="budget-card"><span>Ngân sách tháng</span><strong>' + formatMoney(limit) + '</strong></article>' +
            '<article class="budget-card' + warning + '"><span>Đã dùng ngân sách</span><strong>' +
                (limit === 0 ? 'Chưa có dữ liệu' : percent + '%') + '</strong></article>';
    }

    function selectedClientName() {
        const clients = getClients();

        for (let i = 0; i < clients.length; i++) {
            if (String(clients[i].id) === String(clientSelect.value)) {
                return clients[i].name;
            }
        }

        return '—';
    }

    function getVisibleNotes() {
        const notes = getCoachNotes();
        const visible = [];
        const keyword = searchInput.value.trim();

        for (let i = 0; i < notes.length; i++) {
            const note = notes[i];
            const matchesClient = String(note.clientId) === String(clientSelect.value);
            const matchesCoach = !note.coachId || String(note.coachId) === String(coachUser.id);
            const matchesStatus = statusFilter.value === 'all' || note.status === statusFilter.value;
            const matchesSearch = searchText(note.content, keyword);

            if (clientSelect.value && matchesClient && matchesCoach && matchesStatus && matchesSearch) {
                visible.push(note);
            }
        }

        return visible;
    }

    function renderNotes() {
        const notes = getVisibleNotes();
        let rows = '';
        let drafts = 0;
        let shared = 0;

        for (let i = 0; i < notes.length; i++) {
            const note = notes[i];
            const isShared = note.status === 'shared';

            if (isShared) {
                shared++;
            } else {
                drafts++;
            }

            rows += '<tr><td><div class="note-content">' + cleanText(note.content) + '</div></td>' +
                '<td><span class="note-status' + (isShared ? '' : ' draft') + '">' +
                    (isShared ? 'Đã chia sẻ' : 'Bản nháp') + '</span></td>' +
                '<td>' + formatDate(String(note.updatedAt || note.createdAt || '').slice(0, 10)) + '</td>' +
                '<td><div class="actions">' +
                    '<button class="link-button" data-view="' + cleanText(note.id) + '" type="button">Xem</button>' +
                    '<button class="link-button" data-edit="' + cleanText(note.id) + '" type="button">Sửa</button>' +
                    '<button class="link-button danger" data-delete="' + cleanText(note.id) + '" type="button">Xóa</button>' +
                '</div></td></tr>';
        }

        if (notes.length === 0) {
            tableContent.innerHTML = '<div class="empty-state"><strong>Chưa có nhận xét</strong>' +
                '<span>Thêm nhận xét hoặc thay đổi bộ lọc.</span></div>';
        } else {
            tableContent.innerHTML = '<div class="table-wrap"><table class="data-table">' +
                '<thead><tr><th>Nhận xét</th><th>Trạng thái</th><th>Cập nhật</th><th>Thao tác</th></tr></thead>' +
                '<tbody>' + rows + '</tbody></table></div>';
        }

        renderStats([
            [notes.length, 'Nhận xét hiển thị'],
            [drafts, 'Bản nháp'],
            [shared, 'Đã chia sẻ'],
            [cleanText(selectedClientName()), 'Khách hàng']
        ]);
        bindNoteButtons();
    }

    function bindNoteButtons() {
        const viewButtons = document.querySelectorAll('[data-view]');
        const editButtons = document.querySelectorAll('[data-edit]');
        const deleteButtons = document.querySelectorAll('[data-delete]');

        for (let i = 0; i < viewButtons.length; i++) {
            viewButtons[i].addEventListener('click', function () {
                viewNote(this.dataset.view);
            });
        }
        for (let i = 0; i < editButtons.length; i++) {
            editButtons[i].addEventListener('click', function () {
                openNoteForm(this.dataset.edit);
            });
        }
        for (let i = 0; i < deleteButtons.length; i++) {
            deleteButtons[i].addEventListener('click', function () {
                deleteNote(this.dataset.delete);
            });
        }
    }

    function openNoteForm(id) {
        const notes = getCoachNotes();
        const note = id ? findItemById(notes, id) : null;

        if (id && (!note || String(note.coachId) !== String(coachUser.id))) {
            showToast('Bạn không thể sửa nhận xét này.', 'warning');
            return;
        }

        openModal(note ? 'Sửa nhận xét Coach' : 'Thêm nhận xét Coach',
            '<form id="noteForm">' +
                '<div class="field"><label for="noteContent">Nhận xét (10–1000 ký tự)</label>' +
                    '<textarea id="noteContent" rows="6" minlength="10" maxlength="1000" required></textarea></div>' +
                '<div class="field"><label for="noteStatus">Trạng thái</label><select id="noteStatus">' +
                    '<option value="draft">Bản nháp</option><option value="shared">Chia sẻ với khách hàng</option>' +
                '</select></div><div class="modal-actions">' +
                    '<button class="btn btn-primary" type="submit">Lưu nhận xét</button></div></form>'
        );

        if (note) {
            document.getElementById('noteContent').value = note.content;
            document.getElementById('noteStatus').value = note.status;
        }

        document.getElementById('noteForm').addEventListener('submit', function (event) {
            event.preventDefault();
            saveNote(id);
        });
    }

    function saveNote(id) {
        const content = document.getElementById('noteContent').value.trim();
        const notes = getCoachNotes();
        let note = id ? findItemById(notes, id) : null;

        if (!clientSelect.value) {
            showToast('Hãy chọn khách hàng trước.', 'warning');
            return;
        }

        if (content.length < 10) {
            showToast('Nhận xét cần có ít nhất 10 ký tự.', 'error');
            return;
        }

        if (id && (!note || String(note.coachId) !== String(coachUser.id))) {
            showToast('Không tìm thấy nhận xét cần sửa.', 'warning');
            return;
        }

        const previousStatus = note ? note.status : '';
        const now = new Date().toISOString();

        if (!note) {
            note = { id: makeId(), coachId: coachUser.id, createdAt: now };
            notes.push(note);
        }

        note.clientId = clientSelect.value;
        note.content = content;
        note.status = document.getElementById('noteStatus').value;
        note.updatedAt = now;

        saveCoachNotes(notes);
        if (note.status === 'shared' && previousStatus !== 'shared') {
            addSharedNotification('Coach đã chia sẻ nhận xét với khách hàng.', 'coach-note', clientSelect.value, 'user');
        }
        closeModal();
        showToast('Đã lưu nhận xét.');
        renderPage();
    }

    function viewNote(id) {
        const note = findItemById(getCoachNotes(), id);

        if (!note || (note.coachId && String(note.coachId) !== String(coachUser.id))) {
            showToast('Không tìm thấy nhận xét.', 'warning');
            return;
        }

        openModal('Chi tiết nhận xét',
            '<p class="note-detail">' + cleanText(note.content) + '</p>' +
            '<p class="muted">Trạng thái: ' +
                (note.status === 'shared' ? 'Đã chia sẻ' : 'Bản nháp') + '</p>'
        );
    }

    function deleteNote(id) {
        if (!confirmDelete('Bạn có muốn xóa nhận xét này không?')) {
            return;
        }

        const notes = getCoachNotes();
        const remaining = [];

        for (let i = 0; i < notes.length; i++) {
            if (String(notes[i].id) !== String(id) ||
                String(notes[i].coachId) !== String(coachUser.id)) {
                remaining.push(notes[i]);
            }
        }

        saveCoachNotes(remaining);
        showToast('Đã xóa nhận xét.');
        renderPage();
    }

    function renderPage() {
        const clients = getClients();
        populateClients();
        clientSelect.disabled = clients.length === 0;
        addNoteBtn.disabled = clients.length === 0;

        if (!periodFilter.value) {
            periodFilter.value = currentPeriod();
        }

        renderBudgetSummary();
        renderNotes();
    }

    clientSelect.addEventListener('change', renderPage);
    periodFilter.addEventListener('change', renderBudgetSummary);
    statusFilter.addEventListener('change', renderNotes);
    searchInput.addEventListener('input', renderNotes);
    addNoteBtn.addEventListener('click', function () {
        openNoteForm(null);
    });

    renderPage();
}
