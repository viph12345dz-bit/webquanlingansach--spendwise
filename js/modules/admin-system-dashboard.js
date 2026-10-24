const systemAdmin = setupAppPage('admin-system-dashboard.html', 'admin');

if (systemAdmin) {
    const searchInput = document.getElementById('globalSearch');
    const tableContent = document.getElementById('tableContent');
    const allowedStatuses = ['Ổn định', 'Theo dõi', 'Gián đoạn'];
    const demoServices = [
        {
            id: 'demo-auth',
            name: 'Đăng nhập demo',
            status: 'Ổn định',
            load: 32,
            note: 'Dữ liệu mô phỏng',
            source: 'demo'
        },
        {
            id: 'demo-storage',
            name: 'LocalStorage',
            status: 'Theo dõi',
            load: 68,
            note: 'Dữ liệu mô phỏng',
            source: 'demo'
        },
        {
            id: 'demo-pages',
            name: 'Điều hướng trang',
            status: 'Ổn định',
            load: 18,
            note: 'Dữ liệu mô phỏng',
            source: 'demo'
        }
    ];

    function getServices() {
        return getUserData('systemServices', []);
    }

    function renderPage() {
        const services = getServices();
        const keyword = searchInput.value.trim();
        const rows = [];

        for (let i = 0; i < services.length; i++) {
            const item = services[i];

            if (!searchText(item.name + ' ' + item.status + ' ' + item.note, keyword)) {
                continue;
            }

            const sourceLabel = item.source === 'demo'
                ? '<small class="demo-label">Demo</small>'
                : '';
            rows.push(
                '<tr><td><span class="system-name">' + cleanText(item.name) +
                    '</span><span class="system-description">' +
                    cleanText(item.note || '') + ' ' + sourceLabel + '</span></td>' +
                '<td>' + statusLabel(item.status) + '</td>' +
                '<td class="system-load">' + cleanText(item.load) + '%</td>' +
                '<td><div class="actions">' +
                    '<button class="link-button" data-edit="' + cleanText(item.id) +
                    '" type="button">Xem / sửa</button>' +
                    '<button class="link-button danger" data-delete="' + cleanText(item.id) +
                    '" type="button">Xóa</button></div></td></tr>'
            );
        }

        renderStats([
            [services.length, 'Thành phần demo'],
            [countByField(services, 'status', 'Ổn định'), 'Ổn định'],
            [countByField(services, 'status', 'Theo dõi'), 'Cần theo dõi'],
            [averageNumber(services, 'load') + '%', 'Tải mô phỏng trung bình']
        ]);

        if (rows.length === 0) {
            tableContent.innerHTML =
                '<div class="empty-state"><strong>Chưa có dữ liệu phù hợp</strong>' +
                '<span>Thêm cấu hình demo để theo dõi trạng thái.</span></div>';
        } else {
            tableContent.innerHTML =
                '<div class="table-wrap"><table class="data-table">' +
                '<thead><tr><th>Thành phần</th><th>Trạng thái</th>' +
                '<th>Tải mô phỏng</th><th>Thao tác</th></tr></thead>' +
                '<tbody>' + rows.join('') + '</tbody></table></div>';
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
                deleteService(this.dataset.delete);
            });
        }
    }

    function buildStatusOptions(selectedStatus) {
        let options = '';

        for (let i = 0; i < allowedStatuses.length; i++) {
            const status = allowedStatuses[i];
            const selected = status === selectedStatus ? ' selected' : '';
            options += '<option value="' + cleanText(status) + '"' + selected + '>' +
                cleanText(status) + '</option>';
        }

        return options;
    }

    function openForm(id) {
        const services = getServices();
        const item = id ? findItemById(services, id) : null;

        openModal(item ? 'Xem / sửa cấu hình demo' : 'Thêm cấu hình demo',
            '<form id="serviceForm">' +
                '<div class="field"><label for="serviceName">Tên thành phần</label>' +
                    '<input id="serviceName" maxlength="80" required></div>' +
                '<div class="field"><label for="serviceStatus">Trạng thái mô phỏng</label>' +
                    '<select id="serviceStatus">' +
                        buildStatusOptions(item ? item.status : 'Ổn định') +
                    '</select></div>' +
                '<div class="field"><label for="serviceLoad">Tải mô phỏng (%)</label>' +
                    '<input id="serviceLoad" type="number" min="0" max="100" step="1" required></div>' +
                '<div class="field"><label for="serviceNote">Ghi chú</label>' +
                    '<textarea id="serviceNote" rows="3" maxlength="300"></textarea></div>' +
                '<p id="serviceMessage" class="form-message" aria-live="polite"></p>' +
                '<div class="modal-actions">' +
                    '<button class="btn btn-outline" id="cancelService" type="button">Hủy</button>' +
                    '<button class="btn btn-primary" type="submit">Lưu</button>' +
                '</div></form>'
        );

        if (item) {
            document.getElementById('serviceName').value = item.name || '';
            document.getElementById('serviceLoad').value = item.load;
            document.getElementById('serviceNote').value = item.note || '';
        }

        document.getElementById('cancelService').addEventListener('click', closeModal);
        document.getElementById('serviceForm').addEventListener('submit', function (event) {
            event.preventDefault();
            saveService(id);
        });
    }

    function saveService(id) {
        const services = getServices();
        const name = document.getElementById('serviceName').value.trim();
        const status = document.getElementById('serviceStatus').value;
        const loadValue = document.getElementById('serviceLoad').value;
        const load = Number(loadValue);
        const note = document.getElementById('serviceNote').value.trim();
        const message = document.getElementById('serviceMessage');

        if (name.length < 2 || loadValue === '' || !Number.isFinite(load) ||
            load < 0 || load > 100 || Math.floor(load) !== load) {
            message.textContent = 'Nhập tên và tải là số nguyên từ 0 đến 100.';
            return;
        }
        if (allowedStatuses.indexOf(status) === -1) {
            message.textContent = 'Hãy chọn trạng thái hợp lệ.';
            return;
        }

        for (let i = 0; i < services.length; i++) {
            if (services[i].name.toLowerCase() === name.toLowerCase() &&
                services[i].id !== id) {
                message.textContent = 'Tên thành phần đã tồn tại.';
                return;
            }
        }

        let item = id ? findItemById(services, id) : null;

        if (!item) {
            item = { id: makeId(), source: 'admin' };
            services.push(item);
        }

        item.name = name;
        item.status = status;
        item.load = load;
        item.note = note;
        item.updatedAt = new Date().toISOString();

        if (!saveUserData('systemServices', services)) return;
        closeModal();
        showToast('Đã lưu cấu hình mô phỏng.');
        renderPage();
    }

    function deleteService(id) {
        if (!confirmDelete('Xóa cấu hình demo này?')) {
            return;
        }

        const services = getServices().filter(function (item) {
            return item.id !== id;
        });
        if (!saveUserData('systemServices', services)) return;
        showToast('Đã xóa cấu hình demo.');
        renderPage();
    }

    document.getElementById('addBtn').addEventListener('click', function () {
        openForm(null);
    });
    const loadDemoButton = document.createElement('button');
    loadDemoButton.id = 'loadDemoBtn';
    loadDemoButton.className = 'btn btn-outline';
    loadDemoButton.type = 'button';
    loadDemoButton.textContent = 'Nạp dữ liệu demo';
    const demoTools = document.createElement('div');
    demoTools.className = 'panel-tools';
    const addButton = document.getElementById('addBtn');
    addButton.insertAdjacentElement('beforebegin', demoTools);
    demoTools.append(addButton, loadDemoButton);
    loadDemoButton.addEventListener('click', function () {
        if (!canWriteAppData()) return;
        if (getServices().length > 0) {
            showToast('Chỉ nạp demo vào danh sách dịch vụ rỗng để tránh ghi đè dữ liệu.', 'warning');
            return;
        }
        const demoItems = demoServices.map(function (item) { return Object.assign({}, item); });
        if (!saveUserData('systemServices', demoItems)) return;
        renderPage();
        showToast('Đã nạp dữ liệu DEMO theo lựa chọn của bạn.');
    });
    searchInput.addEventListener('input', renderPage);
    renderPage();
}
