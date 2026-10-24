const templateModerator = setupAppPage('moderator-ai-template-management.html', 'moderator');

if (templateModerator) {
    const searchInput = document.getElementById('globalSearch');
    const statusFilter = document.getElementById('statusFilter');
    const tableContent = document.getElementById('tableContent');
    const allowedStatuses = ['active', 'draft'];

    function renderPage() {
        const templates = getUserData('aiTemplates', []);
        const keyword = searchInput.value.trim();
        const selectedStatus = statusFilter.value;
        const rows = [];
        let activeCount = 0;

        for (let i = 0; i < templates.length; i++) {
            const item = templates[i];

            if (item.status === 'active') {
                activeCount++;
            }
            if (!searchText(item.name + ' ' + item.prompt, keyword)) {
                continue;
            }
            if (selectedStatus !== 'all' && item.status !== selectedStatus) {
                continue;
            }

            const label = item.status === 'active' ? 'Đang hoạt động' : 'Bản nháp';
            rows.push(
                '<tr><td>' + cleanText(item.name || 'Chưa đặt tên') + '</td>' +
                '<td class="template-prompt">' +
                    cleanText(item.prompt || 'Chưa có nội dung') + '</td>' +
                '<td class="version-label">v' + cleanText(item.version || 1) + '</td>' +
                '<td>' + statusLabel(label) + '</td>' +
                '<td><div class="actions">' +
                    '<button class="link-button" data-edit="' + cleanText(item.id) +
                    '" type="button">Xem / sửa</button>' +
                    '<button class="link-button" data-toggle="' + cleanText(item.id) +
                    '" type="button">' + (item.status === 'active' ? 'Tạo bản nháp' : 'Kích hoạt') +
                    '</button></div></td></tr>'
            );
        }

        renderStats([
            [templates.length, 'Tổng mẫu'],
            [activeCount, 'Đang hoạt động'],
            [templates.length - activeCount, 'Bản nháp'],
            ['Mock', 'Không gọi AI thật']
        ]);

        if (rows.length === 0) {
            tableContent.innerHTML =
                '<div class="empty-state"><strong>Chưa có mẫu phù hợp</strong>' +
                '<span>Thêm mẫu demo để bắt đầu.</span></div>';
        } else {
            tableContent.innerHTML =
                '<div class="table-wrap"><table class="data-table">' +
                '<thead><tr><th>Tên mẫu</th><th>Nội dung mẫu</th><th>Phiên bản</th>' +
                '<th>Trạng thái</th><th>Thao tác</th></tr></thead>' +
                '<tbody>' + rows.join('') + '</tbody></table></div>';
        }

        bindButtons();
    }

    function bindButtons() {
        const editButtons = document.querySelectorAll('[data-edit]');
        const toggleButtons = document.querySelectorAll('[data-toggle]');

        for (let i = 0; i < editButtons.length; i++) {
            editButtons[i].addEventListener('click', function () {
                openForm(this.dataset.edit);
            });
        }
        for (let i = 0; i < toggleButtons.length; i++) {
            toggleButtons[i].addEventListener('click', function () {
                toggleTemplate(this.dataset.toggle);
            });
        }
    }

    function openForm(id) {
        const templates = getUserData('aiTemplates', []);
        const item = id ? findItemById(templates, id) : null;

        openModal(item ? 'Xem và sửa mẫu' : 'Thêm mẫu demo',
            '<form id="templateForm">' +
                '<div class="field"><label for="templateName">Tên mẫu</label>' +
                    '<input id="templateName" maxlength="80" required></div>' +
                '<div class="field"><label for="templatePrompt">Nội dung mẫu</label>' +
                    '<textarea id="templatePrompt" rows="5" maxlength="1200" required></textarea></div>' +
                '<div class="field"><label for="templateStatus">Trạng thái</label>' +
                    '<select id="templateStatus"><option value="draft">Bản nháp</option>' +
                    '<option value="active">Đang hoạt động</option></select></div>' +
                '<p id="templateMessage" class="form-message" aria-live="polite"></p>' +
                '<div class="modal-actions">' +
                    '<button class="btn btn-outline" id="cancelTemplate" type="button">Hủy</button>' +
                    '<button class="btn btn-primary" type="submit">Lưu mẫu</button>' +
                '</div></form>'
        );

        if (item) {
            document.getElementById('templateName').value = item.name || '';
            document.getElementById('templatePrompt').value = item.prompt || '';
            document.getElementById('templateStatus').value =
                allowedStatuses.indexOf(item.status) !== -1 ? item.status : 'draft';
        }

        document.getElementById('cancelTemplate').addEventListener('click', closeModal);
        document.getElementById('templateForm').addEventListener('submit', function (event) {
            event.preventDefault();
            saveTemplate(id);
        });
    }

    function saveTemplate(id) {
        const templates = getUserData('aiTemplates', []);
        const name = document.getElementById('templateName').value.trim();
        const prompt = document.getElementById('templatePrompt').value.trim();
        const status = document.getElementById('templateStatus').value;
        const message = document.getElementById('templateMessage');

        if (name.length < 3 || prompt.length < 10) {
            message.textContent = 'Tên cần ít nhất 3 ký tự và nội dung ít nhất 10 ký tự.';
            return;
        }
        if (allowedStatuses.indexOf(status) === -1) {
            message.textContent = 'Hãy chọn trạng thái mẫu hợp lệ.';
            return;
        }

        for (let i = 0; i < templates.length; i++) {
            if (String(templates[i].name || '').toLowerCase() === name.toLowerCase() &&
                templates[i].id !== id) {
                message.textContent = 'Tên mẫu này đã tồn tại.';
                return;
            }
        }

        let item = id ? findItemById(templates, id) : null;
        const wasChanged = item &&
            (item.name !== name || item.prompt !== prompt || item.status !== status);

        if (!item) {
            item = {
                id: makeId(),
                version: 1,
                createdAt: new Date().toISOString()
            };
            templates.push(item);
        } else if (wasChanged) {
            item.version = Number(item.version || 1) + 1;
        }

        item.name = name;
        item.prompt = prompt;
        item.status = status;
        item.updatedAt = new Date().toISOString();

        saveUserData('aiTemplates', templates);
        closeModal();
        showToast('Đã lưu mẫu AI demo.');
        renderPage();
    }

    function toggleTemplate(id) {
        const templates = getUserData('aiTemplates', []);
        const item = findItemById(templates, id);

        if (!item) {
            return;
        }

        item.status = item.status === 'active' ? 'draft' : 'active';
        item.version = Number(item.version || 1) + 1;
        item.updatedAt = new Date().toISOString();

        saveUserData('aiTemplates', templates);
        showToast('Đã cập nhật trạng thái và phiên bản.');
        renderPage();
    }

    document.getElementById('addBtn').addEventListener('click', function () {
        openForm(null);
    });
    searchInput.addEventListener('input', renderPage);
    statusFilter.addEventListener('change', renderPage);
    renderPage();
}
