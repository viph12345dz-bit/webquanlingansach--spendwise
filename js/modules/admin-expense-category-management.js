const categoryAdmin = setupAppPage('admin-expense-category-management.html', 'admin');

if (categoryAdmin) {
    const searchInput = document.getElementById('globalSearch');
    const groupFilter = document.getElementById('groupFilter');
    const tableContent = document.getElementById('tableContent');
    const allowedStatuses = ['Hoạt động', 'Tạm ẩn'];
    const demoCategories = [
        {
            id: 'demo-food',
            name: 'Ăn uống',
            group: 'Chi tiêu',
            keywords: 'ăn, nhà hàng, cà phê',
            rules: 'ăn, nhà hàng, cà phê',
            status: 'Hoạt động',
            source: 'demo'
        },
        {
            id: 'demo-transport',
            name: 'Di chuyển',
            group: 'Chi tiêu',
            keywords: 'xe, xăng, taxi',
            rules: 'xe, xăng, taxi',
            status: 'Hoạt động',
            source: 'demo'
        },
        {
            id: 'demo-income',
            name: 'Lương',
            group: 'Thu nhập',
            keywords: 'lương, thưởng',
            rules: 'lương, thưởng',
            status: 'Hoạt động',
            source: 'demo'
        }
    ];

    function getCategories() {
        return getUserData('categories', []);
    }

    function updateGroupFilter(categories) {
        const selectedGroup = groupFilter.value;
        const groups = [];

        for (let i = 0; i < categories.length; i++) {
            const group = categories[i].group;

            if (group && groups.indexOf(group) === -1) {
                groups.push(group);
            }
        }

        let options = '<option value="all">Tất cả nhóm</option>';

        for (let i = 0; i < groups.length; i++) {
            options += '<option value="' + cleanText(groups[i]) + '">' +
                cleanText(groups[i]) + '</option>';
        }

        groupFilter.innerHTML = options;
        groupFilter.value = groups.indexOf(selectedGroup) !== -1 ? selectedGroup : 'all';
    }

    function renderPage() {
        const categories = getCategories();
        const keyword = searchInput.value.trim();
        const selectedGroup = groupFilter.value;
        const rows = [];

        updateGroupFilter(categories);

        for (let i = 0; i < categories.length; i++) {
            const item = categories[i];
            const searchableText = item.name + ' ' + item.group + ' ' +
                (item.keywords || item.rules || '');

            if (!searchText(searchableText, keyword)) {
                continue;
            }
            if (selectedGroup !== 'all' && item.group !== selectedGroup) {
                continue;
            }

            const demoLabel = item.source === 'demo'
                ? '<small class="demo-label">Dữ liệu demo</small>'
                : '';

            rows.push(
                '<tr><td><span class="category-name">' + cleanText(item.name) +
                    '</span>' + demoLabel + '</td>' +
                '<td>' + cleanText(item.group || '—') + '</td>' +
                '<td class="category-keywords">' +
                    cleanText(item.keywords || item.rules || '—') + '</td>' +
                '<td>' + statusLabel(item.status || 'Hoạt động') + '</td>' +
                '<td><button class="link-button" data-edit="' + cleanText(item.id) +
                    '" type="button">Sửa</button></td></tr>'
            );
        }

        renderStats([
            [categories.length, 'Danh mục'],
            [countByField(categories, 'group', 'Chi tiêu'), 'Chi tiêu'],
            [countByField(categories, 'group', 'Thu nhập'), 'Thu nhập'],
            [countUnique(categories, 'group'), 'Nhóm']
        ]);

        if (rows.length === 0) {
            tableContent.innerHTML =
                '<div class="empty-state"><strong>Chưa có danh mục phù hợp</strong>' +
                '<span>Thay bộ lọc hoặc thêm danh mục demo mới.</span></div>';
        } else {
            tableContent.innerHTML =
                '<div class="table-wrap"><table class="data-table">' +
                '<thead><tr><th>Tên danh mục</th><th>Nhóm</th><th>Từ khóa</th>' +
                '<th>Trạng thái</th><th>Thao tác</th></tr></thead>' +
                '<tbody>' + rows.join('') + '</tbody></table></div>';
        }

        bindEditButtons();
    }

    function bindEditButtons() {
        const buttons = document.querySelectorAll('[data-edit]');

        for (let i = 0; i < buttons.length; i++) {
            buttons[i].addEventListener('click', function () {
                openForm(this.dataset.edit);
            });
        }
    }

    function buildGroupOptions(categories, selectedGroup) {
        const standardGroups = ['Chi tiêu', 'Thu nhập'];
        const groups = standardGroups.slice();

        for (let i = 0; i < categories.length; i++) {
            const group = categories[i].group;

            if (group && groups.indexOf(group) === -1) {
                groups.push(group);
            }
        }

        if (selectedGroup && groups.indexOf(selectedGroup) === -1) {
            groups.push(selectedGroup);
        }

        let options = '';

        for (let i = 0; i < groups.length; i++) {
            const selected = groups[i] === selectedGroup ? ' selected' : '';
            options += '<option value="' + cleanText(groups[i]) + '"' + selected + '>' +
                cleanText(groups[i]) + '</option>';
        }

        return options;
    }

    function openForm(id) {
        const categories = getCategories();
        const item = id ? findItemById(categories, id) : null;
        const selectedGroup = item ? item.group : 'Chi tiêu';
        const statusOptions = allowedStatuses.map(function (status) {
            const selected = item && item.status === status ? ' selected' : '';
            return '<option value="' + cleanText(status) + '"' + selected + '>' +
                cleanText(status) + '</option>';
        }).join('');

        openModal(item ? 'Sửa danh mục' : 'Thêm danh mục demo',
            '<form id="categoryForm">' +
                '<div class="field"><label for="categoryName">Tên danh mục</label>' +
                    '<input id="categoryName" maxlength="60" required></div>' +
                '<div class="field"><label for="categoryGroup">Nhóm</label>' +
                    '<select id="categoryGroup">' +
                        buildGroupOptions(categories, selectedGroup) +
                    '</select></div>' +
                '<div class="field"><label for="categoryKeywords">' +
                    'Từ khóa, phân tách bằng dấu phẩy</label>' +
                    '<textarea id="categoryKeywords" rows="3" maxlength="300"></textarea></div>' +
                '<div class="field"><label for="categoryStatus">Trạng thái</label>' +
                    '<select id="categoryStatus">' + statusOptions + '</select></div>' +
                '<p id="categoryMessage" class="form-message" aria-live="polite"></p>' +
                '<div class="modal-actions">' +
                    '<button class="btn btn-outline" id="cancelCategory" type="button">Hủy</button>' +
                    '<button class="btn btn-primary" type="submit">Lưu danh mục</button>' +
                '</div></form>'
        );

        if (item) {
            document.getElementById('categoryName').value = item.name || '';
            document.getElementById('categoryKeywords').value = item.keywords || item.rules || '';
        }

        document.getElementById('cancelCategory').addEventListener('click', closeModal);
        document.getElementById('categoryForm').addEventListener('submit', function (event) {
            event.preventDefault();
            saveCategory(id);
        });
    }

    function saveCategory(id) {
        const categories = getCategories();
        const name = document.getElementById('categoryName').value.trim();
        const group = document.getElementById('categoryGroup').value;
        const keywords = document.getElementById('categoryKeywords').value.trim();
        const status = document.getElementById('categoryStatus').value;
        const message = document.getElementById('categoryMessage');

        if (name.length < 2) {
            message.textContent = 'Tên danh mục cần có ít nhất 2 ký tự.';
            return;
        }
        if (!group || allowedStatuses.indexOf(status) === -1) {
            message.textContent = 'Hãy chọn nhóm và trạng thái hợp lệ.';
            return;
        }

        for (let i = 0; i < categories.length; i++) {
            if (categories[i].name.toLowerCase() === name.toLowerCase() &&
                categories[i].id !== id) {
                message.textContent = 'Tên danh mục đã tồn tại.';
                return;
            }
        }

        let item = id ? findItemById(categories, id) : null;

        if (!item) {
            item = { id: makeId(), source: 'admin' };
            categories.push(item);
        }

        item.name = name;
        item.group = group;
        item.keywords = keywords;
        item.rules = keywords;
        item.status = status;
        item.updatedAt = new Date().toISOString();

        if (!saveUserData('categories', categories)) return;
        closeModal();
        showToast('Đã lưu danh mục dùng chung.');
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
    document.querySelector('.panel-tools').appendChild(loadDemoButton);
    loadDemoButton.addEventListener('click', function () {
        if (!canWriteAppData()) return;
        if (getCategories().length > 0) {
            showToast('Chỉ nạp demo vào danh sách danh mục rỗng để tránh ghi đè dữ liệu.', 'warning');
            return;
        }
        const demoItems = demoCategories.map(function (item) { return Object.assign({}, item); });
        if (!saveUserData('categories', demoItems)) return;
        renderPage();
        showToast('Đã nạp dữ liệu DEMO theo lựa chọn của bạn.');
    });
    searchInput.addEventListener('input', renderPage);
    groupFilter.addEventListener('change', renderPage);
    renderPage();
}
