(function () {
    'use strict';

    const $ = function (id) {
        return document.getElementById(id);
    };
    let storageFailed = false;

    // Không ghi đè JSON hỏng: thông báo lỗi và chặn thao tác ghi.
    function readStore(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw === null ? fallback : JSON.parse(raw);
        } catch (error) {
            storageFailed = true;
            $('pageMessage').textContent = 'Không đọc được dữ liệu lưu trữ. Hãy kiểm tra quyền lưu trữ/JSON trước khi thử lại.';
            return fallback;
        }
    }

    function readList(key) {
        const list = readStore(key, []);
        if (!Array.isArray(list)) {
            storageFailed = true;
            $('pageMessage').textContent = key + ' phải là một mảng. Chưa ghi đè dữ liệu.';
            return [];
        }
        if (list.some(function (item) { return !item || typeof item !== 'object'; })) {
            storageFailed = true;
            $('pageMessage').textContent = key + ' chứa record không hợp lệ. Chưa ghi đè dữ liệu.';
            return [];
        }
        return list;
    }


    function identityMatches() {
        try {
            const current = SV1Auth.currentUser();
            return current && current.id === account.id && current.role === 'user';
        } catch (error) {
            storageFailed = true;
            $('pageMessage').textContent = error.message;
            return false;
        }
    }

    function writeStore(key, data) {
        if (!identityMatches()) {
            showToast('Phiên đăng nhập đã đổi. Hãy đăng nhập lại.', 'warning');
            window.location.replace('login.html');
            return false;
        }
        if (storageFailed) {
            showToast('Chưa thể lưu do lỗi dữ liệu. Sửa lỗi lưu trữ rồi tải lại trang.', 'error');
            return false;
        }
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            $('pageMessage').textContent = 'Không lưu được: bộ nhớ đầy hoặc trình duyệt chặn localStorage.';
            showToast('Lưu thất bại; dữ liệu trên form vẫn được giữ.', 'error');
            return false;
        }
    }

    // Dùng dữ liệu/session theo hợp đồng và giữ nguyên cấu hình menu của SV3.
    function startPage(oldRoute) {
        let current = null;
        try {
            current = SV1Auth.currentUser();
            if (!current) {
                window.location.replace('login.html');
                return null;
            }
            if (current.role !== 'user') {
                window.location.replace('403.html');
                return null;
            }
            applyTheme();
        } catch (error) {
            $('pageMessage').textContent = 'Không đọc được dữ liệu tài khoản: ' + error.message;
            return null;
        }
        $('roleBadge').textContent = ROLE_NAMES[current.role];
        $('userInitials').textContent = makeInitials(current.name);
        $('sidebarNav').innerHTML = MENU.user.map(function (item) {
            const active = item[0] === oldRoute;
            return '<a class="nav-link' + (active ? ' active' : '') + '" href="' +
                cleanText(item[0]) + '"' + (active ? ' aria-current="page"' : '') + '>' +
                cleanText(item[1]) + '</a>';
        }).join('');
        $('mobileMenu').addEventListener('click', function () {
            $('sidebar').classList.toggle('open');
            this.setAttribute('aria-expanded', $('sidebar').classList.contains('open'));
        });
        $('logoutBtn').addEventListener('click', function () {
            try {
                SV1Auth.signOut();
                window.location.href = 'login.html';
            } catch (error) {
                $('pageMessage').textContent = error.message;
            }
        });
        window.addEventListener('storage', function (event) {
            if (event.key === null || ['sw_session', 'sw_users', 'spendwise_session', 'spendwise_users'].includes(event.key)) {
                window.location.reload();
            }
        });
        window.addEventListener('pageshow', function (event) {
            if (event.persisted) {
                window.location.reload();
            }
        });
        return current;
    }

    function today() {
        const now = new Date();
        return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') +
            '-' + String(now.getDate()).padStart(2, '0');
    }

    function validDate(value) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return false;
        }
        const date = new Date(value + 'T00:00:00Z');
        return !isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
    }

    function validMoney(amount, allowZero) {
        return Number.isSafeInteger(amount) && amount >= (allowZero ? 0 : 1) &&
            amount <= 1000000000000;
    }

    function ownItems(key) {
        return readList(key).filter(function (item) {
            return item.userId === account.id;
        });
    }

    function findOwn(key, id) {
        return ownItems(key).find(function (item) {
            return item.id === id;
        });
    }

    // Đọc lại toàn mảng trước khi ghi, giữ nguyên record của tài khoản khác.
    function saveRecord(key, record, editing) {
        const all = readList(key);
        const index = all.findIndex(function (item) {
            return item.id === record.id && item.userId === account.id;
        });
        if (editing && index === -1) {
            showToast('Record đã bị xóa ở tab khác. Hãy tải lại danh sách.', 'warning');
            return false;
        }
        if (index === -1) {
            all.push(record);
        } else {
            all[index] = record;
        }
        return writeStore(key, all);
    }

    function removeRecord(key, id) {
        const all = readList(key);
        return writeStore(key, all.filter(function (item) {
            return !(item.id === id && item.userId === account.id);
        }));
    }

    function aiState() {
        const state = readStore('sw_sv1_ai_' + account.id, {});
        if (!state || typeof state !== 'object' || Array.isArray(state)) {
            storageFailed = true;
            $('pageMessage').textContent = 'Trạng thái AI không hợp lệ. Chưa ghi đè dữ liệu.';
            return {};
        }
        // Kiểm tra các mảng con trước khi render để JSON hỏng không làm trang dừng chạy.
        const names = ['insights', 'goalPlans'];
        for (let i = 0; i < names.length; i++) {
            const list = state[names[i]];
            if (list !== undefined && (!Array.isArray(list) || list.some(function (item) {
                return !item || typeof item !== 'object' || Array.isArray(item) ||
                    (names[i] === 'insights' ? !item.id : !item.goalId);
            }))) {
                storageFailed = true;
                $('pageMessage').textContent = 'Danh sách AI đã lưu không hợp lệ. Chưa ghi đè dữ liệu.';
                return {};
            }
        }
        return state;
    }

    function saveAi(name, value) {
        const state = aiState();
        state[name] = value;
        return writeStore('sw_sv1_ai_' + account.id, state);
    }

    function say(id, message) {
        $(id).textContent = message;
    }

    function htmlOptions(items) {
        return items.map(function (value) {
            return '<option value="' + cleanText(value) + '">' + cleanText(value) + '</option>';
        }).join('');
    }

    // Mỗi lần input đổi tăng token: bỏ kết quả của lượt xử lý cũ.
    function bindAi(config) {
        let token = 0;
        let draft = null;
        let approved = false;

        function invalidate(message) {
            token++;
            draft = null;
            approved = false;
            $('aiResult').classList.add('hidden');
            $('aiActions').classList.add('hidden');
            $('aiBox').setAttribute('aria-busy', 'false');
            $('aiGenerate').disabled = false;
            $('aiAgain').disabled = false;
            $('aiSave').disabled = true;
            say('aiMessage', message || 'AI mô phỏng bằng quy tắc JavaScript. Chưa có kết quả mới.');
        }

        function generate() {
            const error = config.validate();
            invalidate(error || 'Đang xử lý mô phỏng...');
            if (error) {
                return;
            }
            const currentToken = token;
            const signature = config.signature();
            $('aiBox').setAttribute('aria-busy', 'true');
            $('aiGenerate').disabled = true;
            $('aiAgain').disabled = true;
            setTimeout(function () {
                if (currentToken !== token) {
                    return;
                }
                if (signature !== config.signature()) {
                    invalidate('Dữ liệu đã đổi. Hãy tạo lại kết quả.');
                    return;
                }
                try {
                    draft = config.create();
                    if (!draft) {
                        invalidate('Không đủ dữ liệu phù hợp để tạo gợi ý.');
                        return;
                    }
                    say('aiExplanation', draft.explanation);
                    $('aiChoice').value = draft.choice;
                    $('aiChoice').disabled = true;
                    $('aiResult').classList.remove('hidden');
                    $('aiActions').classList.remove('hidden');
                    say('aiMessage', 'Đã có kết quả mô phỏng. Xem lý do và chọn hành động.');
                } catch (error) {
                    invalidate('Phân tích thất bại. Kiểm tra dữ liệu và thử lại.');
                }
                $('aiBox').setAttribute('aria-busy', 'false');
                $('aiGenerate').disabled = false;
                $('aiAgain').disabled = false;
            }, 450);
        }

        $('aiGenerate').addEventListener('click', generate);
        $('aiAgain').addEventListener('click', generate);
        $('aiAccept').addEventListener('click', function () {
            if (!draft || config.signature() !== draft.signature) {
                invalidate('Dữ liệu đã đổi. Hãy tạo lại kết quả.');
                return;
            }
            const error = config.checkChoice($('aiChoice').value);
            if (error) {
                say('aiMessage', error);
                return;
            }
            config.apply($('aiChoice').value);
            approved = true;
            $('aiChoice').disabled = true;
            $('aiSave').disabled = false;
            say('aiMessage', 'Đã chấp nhận vào bản nháp. Nhấn Lưu để lưu lựa chọn.');
        });
        $('aiEdit').addEventListener('click', function () {
            approved = false;
            $('aiSave').disabled = true;
            $('aiChoice').disabled = false;
            $('aiChoice').focus();
            say('aiMessage', 'Sửa lựa chọn rồi nhấn Chấp nhận lại.');
        });
        $('aiChoice').addEventListener('input', function () {
            approved = false;
            $('aiSave').disabled = true;
        });
        $('aiReject').addEventListener('click', function () {
            config.reject();
            invalidate('Đã từ chối. Không lưu gợi ý này.');
        });
        $('aiSave').addEventListener('click', function () {
            if (!draft || !approved || config.signature() !== draft.signature) {
                invalidate('Bản nháp đã đổi; cần tạo và chấp nhận lại.');
                return;
            }
            const choiceError = config.checkChoice($('aiChoice').value);
            if (choiceError) {
                approved = false;
                $('aiSave').disabled = true;
                say('aiMessage', choiceError);
                return;
            }
            if (config.save($('aiChoice').value, draft)) {
                invalidate('Đã lưu lựa chọn vào dữ liệu của bạn.');
                config.render();
            }
        });
        return { invalidate: invalidate };
    }

    const account = startPage('user-transactions.html');
    if (!account) {
        return;
    }
    let editingId = null;
    let editingSnapshot = null;
    let previousCategory = '';
    const defaultCategories = ['Ăn uống', 'Di chuyển', 'Giải trí', 'Học tập', 'Thu nhập', 'Khác'];
    // Chỉ là quy tắc DEMO, không tự thêm dữ liệu giao dịch hoặc danh mục vào storage.
    const demoRules = [
        { name: 'Ăn uống', words: ['cà phê', 'cafe', 'cơm', 'ăn', 'siêu thị'] },
        { name: 'Di chuyển', words: ['taxi', 'xăng', 'xe buýt', 'grab'] },
        { name: 'Giải trí', words: ['phim', 'game', 'vé nhạc'] },
        { name: 'Học tập', words: ['sách', 'học phí', 'khóa học'] },
        { name: 'Thu nhập', words: ['lương', 'thưởng', 'thu nhập'] }
    ];

    function categoryNames() {
        const names = defaultCategories.slice();
        readList('sw_categories').forEach(function (item) {
            if (typeof item.name === 'string' && item.name.trim() && !names.includes(item.name)) {
                names.push(item.name);
            }
        });
        ownItems('sw_transactions').forEach(function (item) {
            if (typeof item.category === 'string' && item.category && !names.includes(item.category)) {
                names.push(item.category);
            }
        });
        return names;
    }

    function availableCategoryNames() {
        const hiddenNames = readList('sw_categories').filter(function (item) {
            return item.status === 'Tạm ẩn';
        }).map(function (item) {
            return String(item.name || '').trim().toLowerCase();
        });
        return categoryNames().filter(function (name) {
            return !hiddenNames.includes(name.trim().toLowerCase());
        });
    }

    function formCategoryNames() {
        const names = availableCategoryNames();
        const existing = editingId ? findOwn('sw_transactions', editingId) : null;
        // Khi sửa, giữ danh mục lịch sử của chính giao dịch đang mở.
        if (existing && typeof existing.category === 'string' && !names.includes(existing.category)) {
            names.push(existing.category);
        }
        return names;
    }

    function loadCategories() {
        const names = categoryNames();
        const formNames = formCategoryNames();
        const selected = $('category').value;
        const filter = $('categoryFilter').value;
        $('category').innerHTML = htmlOptions(formNames);
        $('aiChoice').innerHTML = htmlOptions(availableCategoryNames());
        $('categoryFilter').innerHTML = '<option value="">Tất cả danh mục</option>' + htmlOptions(names);
        if (formNames.includes(selected)) {
            $('category').value = selected;
        }
        if (names.includes(filter)) {
            $('categoryFilter').value = filter;
        }
    }

    function signature() {
        return JSON.stringify([
            $('note').value.trim(), $('type').value,
            $('date').value, $('amount').value, editingId,
            readList('sw_categories')
        ]);
    }

    function validateTransaction() {
        if (!$('note').value.trim() || $('note').value.trim().length > 240) {
            return 'Mô tả cần từ 1 đến 240 ký tự, không chỉ gồm khoảng trắng.';
        }
        if (!['income', 'expense'].includes($('type').value)) {
            return 'Chọn loại thu hoặc chi hợp lệ.';
        }
        if (!validDate($('date').value) || $('date').value > today()) {
            return 'Ngày giao dịch phải hợp lệ và không sau hôm nay.';
        }
        if (!validMoney(Number($('amount').value), false)) {
            return 'Số tiền phải là số nguyên từ 1 đến 1.000.000.000.000 đồng.';
        }
        if (!formCategoryNames().includes($('category').value)) {
            return 'Hãy chọn danh mục hợp lệ.';
        }
        return '';
    }

    function resetForm() {
        editingId = null;
        editingSnapshot = null;
        loadCategories();
        $('transactionForm').reset();
        $('date').value = today();
        $('formTitle').textContent = 'Thêm giao dịch';
        $('cancelEdit').classList.add('hidden');
        say('formMessage', '');
        ai.invalidate();
    }

    function saveTransaction() {
        // Form đang sửa phải khớp bản mới nhất, tránh làm mất cập nhật/khoản góp.
        const current = editingId ? findOwn('sw_transactions', editingId) : null;
        if (editingId && (!current || JSON.stringify(current) !== editingSnapshot)) {
            say('formMessage', 'Giao dịch đã thay đổi hoặc bị xóa. Chọn Sửa lại để lấy dữ liệu mới.');
            return false;
        }
        const error = validateTransaction();
        say('formMessage', error);
        if (error) {
            return false;
        }
        const record = {
            id: editingId || makeId(),
            userId: account.id,
            date: $('date').value,
            type: $('type').value,
            category: $('category').value,
            amount: Number($('amount').value),
            note: $('note').value.trim()
        };
        if (!saveRecord('sw_transactions', record, editingId !== null)) {
            return false;
        }
        resetForm();
        renderPage();
        showToast('Đã lưu giao dịch.');
        return true;
    }

    function filteredItems() {
        const query = $('search').value.trim().toLowerCase();
        return ownItems('sw_transactions').filter(function (item) {
            return (String(item.note) + ' ' + item.category).toLowerCase().includes(query) &&
                (!$('typeFilter').value || item.type === $('typeFilter').value) &&
                (!$('categoryFilter').value || item.category === $('categoryFilter').value) &&
                (!$('fromDate').value || item.date >= $('fromDate').value) &&
                (!$('toDate').value || item.date <= $('toDate').value);
        }).sort(function (a, b) {
            return String(b.date).localeCompare(String(a.date));
        });
    }

    function renderPage() {
        $('transactionDetail').classList.add('hidden');
        say('detailContent', '');
        if ($('fromDate').value && $('toDate').value && $('fromDate').value > $('toDate').value) {
            say('filterMessage', 'Ngày bắt đầu không được sau ngày kết thúc.');
            $('transactionRows').innerHTML = '';
            renderStats([
                ['—', 'Giao dịch theo bộ lọc'],
                ['—', 'Tổng thu theo bộ lọc'],
                ['—', 'Tổng chi theo bộ lọc'],
                ['—', 'Chênh lệch thu/chi']
            ]);
            say('listMessage', 'Sửa khoảng ngày để xem kết quả.');
            return;
        }
        say('filterMessage', '');
        const items = filteredItems();
        let income = 0;
        let expense = 0;
        items.forEach(function (item) {
            if (item.type === 'income') {
                income += Number(item.amount) || 0;
            } else if (item.type === 'expense') {
                expense += Number(item.amount) || 0;
            }
        });
        renderStats([
            [items.length, 'Giao dịch theo bộ lọc'],
            [formatMoney(income), 'Tổng thu theo bộ lọc'],
            [formatMoney(expense), 'Tổng chi theo bộ lọc'],
            [formatMoney(income - expense), 'Chênh lệch thu/chi']
        ]);
        say('listMessage', items.length ? items.length + ' giao dịch phù hợp.' : 'Chưa có giao dịch phù hợp. Thêm giao dịch hoặc đổi bộ lọc.');
        $('transactionRows').innerHTML = items.map(function (item) {
            return '<tr><td>' + formatDate(item.date) + '</td><td>' + cleanText(item.note) +
                '</td><td>' + (item.type === 'income' ? 'Thu' : 'Chi') +
                '</td><td>' + cleanText(item.category) + '</td><td>' + formatMoney(item.amount) +
                '</td><td class="actions"><button class="link-button" data-action="view" data-id="' +
                cleanText(item.id) + '" type="button">Xem</button><button class="link-button" data-action="edit" data-id="' +
                cleanText(item.id) + '" type="button">Sửa</button><button class="link-button danger" data-action="delete" data-id="' +
                cleanText(item.id) + '" type="button">Xóa</button></td></tr>';
        }).join('');
    }

    const ai = bindAi({
        signature: signature,
        validate: function () {
            const error = validateTransaction();
            if (error) {
                return error;
            }
            if ($('note').value.trim().length < 3) {
                return 'Không đủ dữ liệu: mô tả cần ít nhất 3 ký tự để phân loại.';
            }
            return '';
        },
        create: function () {
            const text = $('note').value.trim().toLowerCase();
            const categories = readList('sw_categories');
            const available = availableCategoryNames();
            let found = null;
            let keyword = '';
            let source = 'danh mục dùng chung';
            categories.forEach(function (item) {
                const words = Array.isArray(item.keywords) ? item.keywords : String(item.keywords || '').split(',');
                words.forEach(function (word) {
                    const term = String(word).trim().toLowerCase();
                    if (!found && term && text.includes(term) && available.includes(item.name)) {
                        found = item.name;
                        keyword = term;
                    }
                });
            });
            if (!found) {
                source = 'quy tắc DEMO của trang USER';
                demoRules.forEach(function (rule) {
                    rule.words.forEach(function (word) {
                        if (!found && text.includes(word) && available.includes(rule.name)) {
                            found = rule.name;
                            keyword = word;
                        }
                    });
                });
            }
            if (!found) {
                return null;
            }
            if ($('type').value === 'income') {
                found = 'Thu nhập';
            } else if (found === 'Thu nhập') {
                return null;
            }
            if (!available.includes(found)) {
                return null;
            }
            previousCategory = $('category').value;
            return {
                signature: signature(),
                choice: found,
                explanation: 'Gợi ý “' + found + '” vì mô tả có từ khóa “' + keyword +
                    '”, theo ' + source + '. Loại giao dịch: ' +
                    ($('type').value === 'income' ? 'thu nhập' : 'chi tiêu') +
                    '. Hãy kiểm tra lại; đây không phải AI thật.'
            };
        },
        checkChoice: function (value) {
            return availableCategoryNames().includes(value) ? '' : 'Danh mục không hợp lệ hoặc đã tạm ẩn.';
        },
        apply: function (value) {
            $('category').value = value;
        },
        reject: function () {
            if (previousCategory) {
                $('category').value = previousCategory;
            }
        },
        save: saveTransaction,
        render: renderPage
    });

    $('transactionForm').addEventListener('submit', function (event) {
        event.preventDefault();
        saveTransaction();
    });
    $('cancelEdit').addEventListener('click', resetForm);
    ['note', 'type', 'date', 'amount', 'category'].forEach(function (id) {
        $(id).addEventListener('input', function () { ai.invalidate(); });
    });
    ['search', 'typeFilter', 'categoryFilter', 'fromDate', 'toDate'].forEach(function (id) {
        $(id).addEventListener('input', renderPage);
    });
    $('clearFilters').addEventListener('click', function () {
        ['search', 'typeFilter', 'categoryFilter', 'fromDate', 'toDate'].forEach(function (id) {
            $(id).value = '';
        });
        renderPage();
    });
    $('transactionRows').addEventListener('click', function (event) {
        const button = event.target.closest('button[data-action]');
        if (!button) {
            return;
        }
        const item = findOwn('sw_transactions', button.dataset.id);
        if (!item) {
            showToast('Không còn giao dịch này.', 'warning');
            renderPage();
            return;
        }
        if (button.dataset.action === 'delete') {
            if (confirmDelete('Xóa giao dịch “' + item.note + '”?')) {
                if (removeRecord('sw_transactions', item.id)) {
                    if (editingId === item.id) {
                        resetForm();
                    }
                    renderPage();
                    showToast('Đã xóa giao dịch.');
                }
            }
        } else if (button.dataset.action === 'view') {
            $('transactionDetail').classList.remove('hidden');
            say('detailContent', formatDate(item.date) + ' • ' + item.note + ' • ' +
                item.category + ' • ' + formatMoney(item.amount) + ' • ' +
                (item.type === 'income' ? 'Thu nhập' : 'Chi tiêu'));
            $('closeDetail').focus();
        } else {
            ai.invalidate();
            editingId = item.id;
            editingSnapshot = JSON.stringify(item);
            $('type').value = item.type;
            $('date').value = item.date;
            $('note').value = item.note;
            $('amount').value = item.amount;
            loadCategories();
            $('category').value = item.category;
            $('formTitle').textContent = 'Sửa giao dịch';
            $('cancelEdit').classList.remove('hidden');
            say('formMessage', '');
            $('note').focus();
        }
    });
    $('closeDetail').addEventListener('click', function () {
        $('transactionDetail').classList.add('hidden');
    });
    window.addEventListener('storage', function (event) {
        if (['sw_transactions', 'sw_categories'].includes(event.key)) {
            ai.invalidate('Dữ liệu đổi ở tab khác. Hãy tạo lại gợi ý.');
            loadCategories();
            renderPage();
        }
    });
    loadCategories();
    resetForm();
    renderPage();
})();
