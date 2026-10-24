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
            if (config.save($('aiChoice').value, draft)) {
                invalidate('Đã lưu lựa chọn vào dữ liệu của bạn.');
                config.render();
            }
        });
        return { invalidate: invalidate };
    }

    const account = startPage('user-dashboard.html');
    if (!account) {
        return;
    }

    function periodItems() {
        return ownItems('sw_transactions').filter(function (item) {
            return (!$('fromDate').value || item.date >= $('fromDate').value) &&
                (!$('toDate').value || item.date <= $('toDate').value);
        });
    }

    function rangeError() {
        if (($('fromDate').value && !validDate($('fromDate').value)) ||
            ($('toDate').value && !validDate($('toDate').value))) {
            return 'Chọn ngày lọc hợp lệ.';
        }
        if ($('fromDate').value && $('toDate').value && $('fromDate').value > $('toDate').value) {
            return 'Ngày bắt đầu không được sau ngày kết thúc.';
        }
        return '';
    }

    function totals(items) {
        let income = 0;
        let expense = 0;
        items.forEach(function (item) {
            if (item.type === 'income') {
                income += Number(item.amount) || 0;
            } else if (item.type === 'expense') {
                expense += Number(item.amount) || 0;
            }
        });
        return { income: income, expense: expense };
    }

    function signature() {
        return JSON.stringify([
            $('fromDate').value, $('toDate').value, $('cutPercent').value,
            periodItems()
        ]);
    }

    function renderSavedInsights() {
        const insights = aiState().insights || [];
        if (!Array.isArray(insights)) {
            say('savedInsights', 'Dữ liệu phân tích đã lưu không hợp lệ.');
            return;
        }
        $('savedInsights').innerHTML = insights.length ? insights.map(function (item) {
            const current = ownItems('sw_transactions').filter(function (transaction) {
                return transaction.type === 'expense' && transaction.category === item.category &&
                    (!item.from || transaction.date >= item.from) && (!item.to || transaction.date <= item.to);
            });
            const spent = current.reduce(function (sum, transaction) { return sum + Number(transaction.amount); }, 0);
            return '<article class="saved-card"><h3>Ngưỡng theo dõi: ' + cleanText(item.category) +
                '</h3><p>Kỳ: ' + (item.from ? formatDate(item.from) : 'Từ đầu') + ' → ' +
                (item.to ? formatDate(item.to) : 'Không giới hạn') +
                '. Ngưỡng đã chọn: ' + formatMoney(item.cap) + '.</p><p>Chi hiện tại trong kỳ: ' +
                formatMoney(spent) + '. ' + (spent > item.cap ? 'Vượt ngưỡng theo dõi ' + formatMoney(spent - item.cap) :
                    'Còn trong ngưỡng theo dõi.') + '</p><p>' + cleanText(item.explanation) +
                '</p><button class="link-button danger" data-remove-insight="' + cleanText(item.id) +
                '" type="button">Xóa ngưỡng</button></article>';
        }).join('') : '<p>Chưa lưu ngưỡng theo dõi chi tiêu.</p>';
    }

    function renderPage() {
        const error = rangeError();
        say('filterMessage', error);
        if (error) {
            renderStats([['—', 'Tổng thu'], ['—', 'Tổng chi'], ['—', 'Số dư'], ['—', 'Mục tiêu']]);
            say('savingRate', 'Sửa khoảng ngày để tính tỷ lệ tiết kiệm.');
            $('transactionRows').innerHTML = '';
            $('categorySummary').textContent = 'Sửa khoảng ngày để xem dữ liệu.';
            say('listMessage', 'Khoảng ngày không hợp lệ.');
            return;
        }
        const items = periodItems();
        const summary = totals(items);
        const goals = ownItems('sw_goals');
        const done = goals.filter(function (item) { return item.saved >= item.target; }).length;
        renderStats([
            [formatMoney(summary.income), 'Tổng thu trong kỳ'],
            [formatMoney(summary.expense), 'Tổng chi trong kỳ'],
            [formatMoney(summary.income - summary.expense), 'Số dư thu trừ chi trong kỳ'],
            [goals.length + ' (' + done + ' xong)', 'Mục tiêu của bạn • mọi kỳ']
        ]);
        const savingRate = summary.income > 0 ? Math.round((summary.income - summary.expense) / summary.income * 100) : null;
        say('savingRate', savingRate === null ? 'Chưa có thu nhập trong kỳ để tính tỷ lệ tiết kiệm.' :
            'Tỷ lệ thu còn lại trong kỳ: ' + savingRate + '%. Tỷ lệ có thể âm khi chi vượt thu.');
        const query = $('search').value.trim().toLowerCase();
        const visible = items.filter(function (item) {
            return (String(item.note) + ' ' + item.category).toLowerCase().includes(query) &&
                (!$('typeFilter').value || item.type === $('typeFilter').value);
        }).sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
        say('listMessage', visible.length ? visible.length + ' giao dịch phù hợp.' : 'Chưa có giao dịch phù hợp. Nhập giao dịch hoặc đổi bộ lọc.');
        $('transactionRows').innerHTML = visible.map(function (item) {
            return '<tr><td>' + formatDate(item.date) + '</td><td>' + cleanText(item.note) +
                '</td><td>' + cleanText(item.category) + '</td><td>' +
                (item.type === 'income' ? 'Thu' : 'Chi') + '</td><td>' + formatMoney(item.amount) + '</td></tr>';
        }).join('');
        const grouped = Object.create(null);
        items.forEach(function (item) {
            if (item.type === 'expense') {
                const name = String(item.category);
                grouped[name] = (Object.prototype.hasOwnProperty.call(grouped, name) ? grouped[name] : 0) + Number(item.amount);
            }
        });
        $('categorySummary').innerHTML = Object.keys(grouped).length ? Object.keys(grouped).map(function (category) {
            return '<p><strong>' + cleanText(category) + '</strong>: ' + formatMoney(grouped[category]) +
                ' (' + Math.round(grouped[category] / summary.expense * 100) + '% tổng chi)</p>';
        }).join('') : '<p>Chưa có khoản chi để thống kê danh mục.</p>';
        $('goalSummary').innerHTML = goals.length ? goals.map(function (item) {
            const percentage = item.target > 0 ? Math.min(100, Math.round(item.saved / item.target * 100)) : 0;
            const status = item.saved >= item.target ? 'Hoàn tất' : item.deadline < today() ? 'Quá hạn' : 'Đang thực hiện';
            return '<article class="saved-card"><h3>' + cleanText(item.name) + '</h3><p>' +
                formatMoney(item.saved) + ' / ' + formatMoney(item.target) + ' • ' + percentage +
                '% • ' + status + ' • Hạn ' + formatDate(item.deadline) + '</p><progress max="100" value="' +
                percentage + '" aria-label="Tiến độ ' + cleanText(item.name) + '"></progress></article>';
        }).join('') : '<p>Chưa có mục tiêu. Tạo mục tiêu tại trang Mục tiêu tiết kiệm.</p>';
        renderSavedInsights();
    }

    const ai = bindAi({
        signature: signature,
        validate: function () {
            const error = rangeError();
            if (error) {
                return error;
            }
            const percent = Number($('cutPercent').value);
            if (!Number.isInteger(percent) || percent < 1 || percent > 80) {
                return 'Mức giảm mục tiêu cần là số nguyên từ 1 đến 80%.';
            }
            const expenses = periodItems().filter(function (item) {
                return item.type === 'expense' && Number(item.amount) > 0;
            });
            return expenses.length >= 3 ? '' : 'Không đủ dữ liệu: cần ít nhất 3 khoản chi trong kỳ đã chọn. Không tự sinh dữ liệu.';
        },
        create: function () {
            const expenses = periodItems().filter(function (item) { return item.type === 'expense'; });
            const grouped = new Map();
            let total = 0;
            expenses.forEach(function (item) {
                total += Number(item.amount);
                grouped.set(item.category, (grouped.get(item.category) || 0) + Number(item.amount));
            });
            let category = '';
            let amount = 0;
            grouped.forEach(function (value, name) {
                if (value > amount) {
                    category = name;
                    amount = value;
                }
            });
            if (!category || !amount) {
                return null;
            }
            const cap = Math.max(1, Math.floor(amount * (100 - Number($('cutPercent').value)) / 100));
            return {
                signature: signature(),
                category: category,
                amount: amount,
                choice: cap,
                explanation: 'Trong kỳ có ' + expenses.length + ' khoản chi. “' + category +
                    '” chiếm ' + Math.round(amount / total * 100) + '% tổng chi (' + formatMoney(amount) +
                    '). Theo mức giảm bạn nhập ' + $('cutPercent').value + '%, ngưỡng tham khảo là ' +
                    formatMoney(cap) + '. Đây là phép tổng hợp mô phỏng; không suy luận thu nhập hay khả năng tài chính ngoài dữ liệu đã nhập.'
            };
        },
        checkChoice: function (value) {
            return Number.isSafeInteger(Number(value)) && Number(value) > 0 ? '' : 'Ngưỡng cần là số nguyên dương trong giới hạn số nguyên an toàn của JavaScript.';
        },
        apply: function () {},
        reject: function () {},
        save: function (value, draft) {
            const insights = aiState().insights || [];
            if (!Array.isArray(insights)) {
                showToast('Dữ liệu ngưỡng theo dõi không hợp lệ.', 'error');
                return false;
            }
            insights.unshift({
                id: makeId(),
                category: draft.category,
                cap: Number(value),
                from: $('fromDate').value,
                to: $('toDate').value,
                explanation: draft.explanation,
                createdAt: new Date().toISOString()
            });
            return saveAi('insights', insights);
        },
        render: renderSavedInsights
    });

    ['fromDate', 'toDate', 'cutPercent'].forEach(function (id) {
        $(id).addEventListener('input', function () { ai.invalidate(); renderPage(); });
    });
    ['search', 'typeFilter'].forEach(function (id) {
        $(id).addEventListener('input', renderPage);
    });
    $('clearFilters').addEventListener('click', function () {
        ['fromDate', 'toDate', 'search', 'typeFilter'].forEach(function (id) { $(id).value = ''; });
        ai.invalidate();
        renderPage();
    });
    $('savedInsights').addEventListener('click', function (event) {
        const button = event.target.closest('[data-remove-insight]');
        if (!button || !confirmDelete('Xóa ngưỡng theo dõi này?')) {
            return;
        }
        const insights = aiState().insights || [];
        if (Array.isArray(insights) && saveAi('insights', insights.filter(function (item) {
            return item.id !== button.dataset.removeInsight;
        }))) {
            renderSavedInsights();
        }
    });
    window.addEventListener('storage', function (event) {
        if (['sw_transactions', 'sw_goals', 'sw_sv1_ai_' + account.id].includes(event.key)) {
            ai.invalidate('Dữ liệu đã đổi ở tab khác. Hãy tạo lại phân tích.');
            renderPage();
        }
    });
    renderPage();
})();
