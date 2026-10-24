const feedbackModerator = setupAppPage('moderator-feedback-center.html', 'moderator');

if (feedbackModerator) {
    const searchInput = document.getElementById('globalSearch');
    const statusFilter = document.getElementById('statusFilter');
    const tableContent = document.getElementById('tableContent');
    const statusOptions = ['Mới', 'Đang xử lý', 'Đã giải quyết'];

    function renderPage() {
        const feedbackItems = getUserData('feedback', []);
        const keyword = searchInput.value.trim();
        const selectedStatus = statusFilter.value;
        const rows = [];

        for (let i = 0; i < feedbackItems.length; i++) {
            const item = feedbackItems[i];
            const searchableText = [item.title, item.message, item.email].join(' ');

            if (!searchText(searchableText, keyword)) {
                continue;
            }
            if (selectedStatus !== 'all' && item.status !== selectedStatus) {
                continue;
            }

            let options = '';

            for (let j = 0; j < statusOptions.length; j++) {
                const selected = item.status === statusOptions[j] ? ' selected' : '';
                options += '<option value="' + cleanText(statusOptions[j]) + '"' +
                    selected + '>' + cleanText(statusOptions[j]) + '</option>';
            }

            rows.push(
                '<tr><td>' + cleanText(item.title || 'Chưa có tiêu đề') + '</td>' +
                '<td class="feedback-text">' + cleanText(item.message || '—') + '</td>' +
                '<td>' + cleanText(item.email || '—') + '</td>' +
                '<td><label class="visually-hidden" for="status-' + cleanText(item.id) +
                    '">Trạng thái của ' + cleanText(item.title || 'phản hồi') + '</label>' +
                    '<select id="status-' + cleanText(item.id) + '" data-status="' +
                    cleanText(item.id) + '">' + options + '</select></td>' +
                '<td><div class="actions">' +
                    '<button class="link-button" data-edit="' + cleanText(item.id) +
                    '" type="button">Sửa</button>' +
                    '<button class="link-button danger" data-delete="' + cleanText(item.id) +
                    '" type="button">Xóa</button></div></td></tr>'
            );
        }

        renderStats([
            [feedbackItems.length, 'Tổng phản hồi'],
            [countByField(feedbackItems, 'status', 'Mới'), 'Mới'],
            [countByField(feedbackItems, 'status', 'Đang xử lý'), 'Đang xử lý'],
            [countByField(feedbackItems, 'status', 'Đã giải quyết'), 'Đã giải quyết']
        ]);

        if (rows.length === 0) {
            tableContent.innerHTML =
                '<div class="empty-state"><strong>Chưa có phản hồi phù hợp</strong>' +
                '<span>Thêm phản hồi demo để trình bày luồng xử lý.</span></div>';
        } else {
            tableContent.innerHTML =
                '<div class="table-wrap"><table class="data-table">' +
                '<thead><tr><th>Tiêu đề</th><th>Nội dung</th><th>Email demo</th>' +
                '<th>Trạng thái</th><th>Thao tác</th></tr></thead>' +
                '<tbody>' + rows.join('') + '</tbody></table></div>';
        }

        bindButtons();
    }

    function bindButtons() {
        const editButtons = document.querySelectorAll('[data-edit]');
        const deleteButtons = document.querySelectorAll('[data-delete]');
        const statusInputs = document.querySelectorAll('[data-status]');

        for (let i = 0; i < editButtons.length; i++) {
            editButtons[i].addEventListener('click', function () {
                openForm(this.dataset.edit);
            });
        }
        for (let i = 0; i < deleteButtons.length; i++) {
            deleteButtons[i].addEventListener('click', function () {
                deleteFeedback(this.dataset.delete);
            });
        }
        for (let i = 0; i < statusInputs.length; i++) {
            statusInputs[i].addEventListener('change', function () {
                changeStatus(this.dataset.status, this.value);
            });
        }
    }

    function openForm(id) {
        const feedbackItems = getUserData('feedback', []);
        const item = id ? findItemById(feedbackItems, id) : null;
        let statusMarkup = '';

        for (let i = 0; i < statusOptions.length; i++) {
            const selected = item && item.status === statusOptions[i] ? ' selected' : '';
            statusMarkup += '<option value="' + cleanText(statusOptions[i]) + '"' +
                selected + '>' + cleanText(statusOptions[i]) + '</option>';
        }

        openModal(item ? 'Sửa phản hồi demo' : 'Thêm phản hồi demo',
            '<form id="feedbackForm">' +
                '<div class="field"><label for="feedbackTitle">Tiêu đề</label>' +
                    '<input id="feedbackTitle" maxlength="100" required></div>' +
                '<div class="field"><label for="feedbackMessage">Nội dung</label>' +
                    '<textarea id="feedbackMessage" rows="5" maxlength="1000" required></textarea></div>' +
                '<div class="field"><label for="feedbackEmail">Email demo (không bắt buộc)</label>' +
                    '<input id="feedbackEmail" type="email" maxlength="120"></div>' +
                '<div class="field"><label for="feedbackStatus">Trạng thái</label>' +
                    '<select id="feedbackStatus">' + statusMarkup + '</select></div>' +
                '<p id="feedbackFormMessage" class="form-message" aria-live="polite"></p>' +
                '<div class="modal-actions">' +
                    '<button class="btn btn-outline" id="cancelFeedback" type="button">Hủy</button>' +
                    '<button class="btn btn-primary" type="submit">Lưu phản hồi</button>' +
                '</div></form>'
        );

        if (item) {
            document.getElementById('feedbackTitle').value = item.title || '';
            document.getElementById('feedbackMessage').value = item.message || '';
            document.getElementById('feedbackEmail').value = item.email || '';
        }

        document.getElementById('cancelFeedback').addEventListener('click', closeModal);
        document.getElementById('feedbackForm').addEventListener('submit', function (event) {
            event.preventDefault();
            saveFeedback(id);
        });
    }

    function saveFeedback(id) {
        const feedbackItems = getUserData('feedback', []);
        const title = document.getElementById('feedbackTitle').value.trim();
        const message = document.getElementById('feedbackMessage').value.trim();
        const email = document.getElementById('feedbackEmail').value.trim();
        const status = document.getElementById('feedbackStatus').value;
        const formMessage = document.getElementById('feedbackFormMessage');

        if (title.length < 3 || message.length < 5) {
            formMessage.textContent =
                'Nhập tiêu đề (ít nhất 3 ký tự) và nội dung (ít nhất 5 ký tự).';
            return;
        }
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            formMessage.textContent = 'Email demo chưa đúng định dạng.';
            return;
        }
        if (statusOptions.indexOf(status) === -1) {
            formMessage.textContent = 'Hãy chọn trạng thái hợp lệ.';
            return;
        }

        let item = id ? findItemById(feedbackItems, id) : null;

        if (!item) {
            item = {
                id: makeId(),
                createdAt: new Date().toISOString(),
                source: 'demo'
            };
            feedbackItems.push(item);
        }

        item.title = title;
        item.message = message;
        item.email = email;
        item.status = status;
        item.updatedAt = new Date().toISOString();

        saveUserData('feedback', feedbackItems);
        closeModal();
        showToast('Đã lưu phản hồi demo.');
        renderPage();
    }

    function changeStatus(id, status) {
        if (statusOptions.indexOf(status) === -1) {
            showToast('Trạng thái không hợp lệ.', 'error');
            return;
        }

        const feedbackItems = getUserData('feedback', []);
        const item = findItemById(feedbackItems, id);

        if (!item) {
            return;
        }

        item.status = status;
        item.updatedAt = new Date().toISOString();
        saveUserData('feedback', feedbackItems);
        showToast('Đã cập nhật trạng thái.');
        renderPage();
    }

    function deleteFeedback(id) {
        if (!confirmDelete('Xóa phản hồi demo này?')) {
            return;
        }

        const feedbackItems = getUserData('feedback', []);
        const remaining = feedbackItems.filter(function (item) {
            return item.id !== id;
        });

        saveUserData('feedback', remaining);
        showToast('Đã xóa phản hồi.');
        renderPage();
    }

    document.getElementById('addBtn').addEventListener('click', function () {
        openForm(null);
    });
    searchInput.addEventListener('input', renderPage);
    statusFilter.addEventListener('change', renderPage);
    renderPage();
}
