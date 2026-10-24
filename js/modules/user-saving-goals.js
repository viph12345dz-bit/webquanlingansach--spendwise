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

    const account = startPage('user-goals.html');
    if (!account) {
        return;
    }
    let editingId = null;
    let editingSnapshot = null;

    function goalStatus(item) {
        if (Number(item.saved) >= Number(item.target)) {
            return 'Hoàn tất';
        }
        return item.deadline < today() ? 'Quá hạn' : 'Đang thực hiện';
    }

    function progress(item) {
        return item.target > 0 ? Math.min(100, Math.round(item.saved / item.target * 100)) : 0;
    }

    function goalSignature() {
        const item = findOwn('sw_goals', $('coachGoal').value);
        return JSON.stringify([item || null, $('frequency').value, today()]);
    }

    function scheduleDates(item, frequency) {
        const start = new Date(today() + 'T00:00:00Z');
        const end = new Date(item.deadline + 'T00:00:00Z');
        const dates = [];
        let step = 0;
        let next = start;
        // Lịch tháng neo theo ngày bắt đầu, chặn ngày 31 về cuối tháng ngắn.
        while (next <= end && step < 6000) {
            dates.push(next.toISOString().slice(0, 10));
            step++;
            if (frequency === 'weekly') {
                next = new Date(start.getTime() + step * 7 * 86400000);
            } else {
                const lastDay = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + step + 1, 0)).getUTCDate();
                next = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + step, Math.min(start.getUTCDate(), lastDay)));
            }
        }
        return dates;
    }

    function validateGoal() {
        const name = $('goalName').value.trim();
        const target = Number($('target').value);
        const saved = Number($('saved').value);
        if (!name || name.length > 100) {
            return 'Tên mục tiêu cần từ 1 đến 100 ký tự, không chỉ khoảng trắng.';
        }
        if (!validMoney(target, false) || $('saved').value.trim() === '' || !validMoney(saved, true)) {
            return 'Mục tiêu phải là số nguyên dương; đã góp là số nguyên từ 0. Tối đa 1.000.000.000.000 đồng.';
        }
        if (saved > target) {
            return 'Số đã góp không được vượt số tiền mục tiêu.';
        }
        if (!validDate($('deadline').value) || $('deadline').value > '2100-12-31') {
            return 'Chọn ngày hạn hợp lệ, không sau năm 2100.';
        }
        const existing = editingId ? findOwn('sw_goals', editingId) : null;
        if ($('deadline').value < today() && (!existing || existing.deadline !== $('deadline').value)) {
            return 'Hạn mới không được trước hôm nay.';
        }
        return '';
    }

    function resetForm() {
        editingId = null;
        editingSnapshot = null;
        $('goalForm').reset();
        $('saved').value = '0';
        $('formTitle').textContent = 'Tạo mục tiêu';
        $('cancelEdit').classList.add('hidden');
        say('formMessage', '');
    }

    function saveGoal() {
        // Form đang sửa phải khớp bản mới nhất, tránh làm mất cập nhật/khoản góp.
        const current = editingId ? findOwn('sw_goals', editingId) : null;
        if (editingId && (!current || JSON.stringify(current) !== editingSnapshot)) {
            say('formMessage', 'Mục tiêu đã thay đổi hoặc bị xóa. Chọn Sửa lại để lấy dữ liệu mới.');
            return;
        }
        const error = validateGoal();
        say('formMessage', error);
        if (error) {
            return;
        }
        const item = {
            id: editingId || makeId(),
            userId: account.id,
            name: $('goalName').value.trim(),
            target: Number($('target').value),
            saved: Number($('saved').value),
            deadline: $('deadline').value
        };
        if (saveRecord('sw_goals', item, editingId !== null)) {
            resetForm();
            ai.invalidate('Mục tiêu đã đổi. Hãy tính lại kế hoạch.');
            renderPage();
            showToast('Đã lưu mục tiêu.');
        }
    }

    function loadGoalChoices() {
        const items = ownItems('sw_goals');
        ['contributionGoal', 'coachGoal'].forEach(function (id) {
            const selected = $(id).value;
            $(id).innerHTML = '<option value="">Chọn mục tiêu</option>' + items.map(function (item) {
                return '<option value="' + cleanText(item.id) + '">' + cleanText(item.name) + '</option>';
            }).join('');
            if (items.some(function (item) { return item.id === selected; })) {
                $(id).value = selected;
            }
        });
    }

    function renderPlans() {
        const plans = aiState().goalPlans || [];
        const own = ownItems('sw_goals');
        if (!Array.isArray(plans)) {
            say('savedPlans', 'Trạng thái kế hoạch không hợp lệ.');
            return;
        }
        const html = plans.map(function (plan) {
            const item = own.find(function (goal) { return goal.id === plan.goalId; });
            if (!item) {
                return '';
            }
            const unchanged = plan.snapshot === JSON.stringify([item.target, item.saved, item.deadline]);
            return '<article class="saved-card"><h3>' + cleanText(item.name) + '</h3><p>' +
                formatMoney(plan.amount) + (plan.frequency === 'weekly' ? ' / tuần' : ' / tháng') +
                ' • ' + cleanText(plan.periods) + ' kỳ • Bắt đầu ' + formatDate(plan.start) +
                ' • Hạn ' + formatDate(plan.deadline) + '</p><p>' +
                (unchanged ? 'Kế hoạch đã lưu; góp tiền bằng form Góp thêm bên trên.' :
                    'Mục tiêu đã thay đổi. Kế hoạch cũ cần tính lại trước khi dùng.') +
                '</p><button class="link-button danger" type="button" data-remove-plan="' + cleanText(plan.goalId) +
                '">Xóa kế hoạch</button></article>';
        }).join('');
        $('savedPlans').innerHTML = html || '<p>Chưa lưu kế hoạch cho mục tiêu hiện có.</p>';
    }

    function renderPage() {
        say('goalDetail', '');
        loadGoalChoices();
        const all = ownItems('sw_goals');
        let saved = 0;
        let target = 0;
        let completed = 0;
        all.forEach(function (item) {
            target += Number(item.target) || 0;
            saved += Number(item.saved) || 0;
            if (goalStatus(item) === 'Hoàn tất') {
                completed++;
            }
        });
        renderStats([
            [all.length, 'Mục tiêu'],
            [formatMoney(saved), 'Đã tích lũy'],
            [(target ? Math.round(saved / target * 100) : 0) + '%', 'Tiến độ chung'],
            [completed, 'Đã hoàn tất']
        ]);
        const query = $('search').value.trim().toLowerCase();
        const items = all.filter(function (item) {
            return String(item.name).toLowerCase().includes(query) &&
                (!$('statusFilter').value || goalStatus(item) === $('statusFilter').value);
        });
        say('listMessage', items.length ? items.length + ' mục tiêu phù hợp.' : 'Chưa có mục tiêu phù hợp. Tạo mới hoặc đổi bộ lọc.');
        $('goalRows').innerHTML = items.map(function (item) {
            const buttons = [['view', 'Xem'], ['edit', 'Sửa'], ['contribute', 'Góp thêm'], ['coach', 'AI Coach'], ['delete', 'Xóa']];
            return '<tr><td>' + cleanText(item.name) + '</td><td>' + formatMoney(item.saved) +
                ' / ' + formatMoney(item.target) + '<progress max="100" value="' + progress(item) +
                '" aria-label="Tiến độ ' + cleanText(item.name) + '"></progress>' + progress(item) +
                '%</td><td>' + formatDate(item.deadline) + '</td><td>' + cleanText(goalStatus(item)) +
                '</td><td><div class="actions">' + buttons.map(function (button) {
                    return '<button class="link-button" data-action="' + button[0] + '" data-id="' +
                        cleanText(item.id) + '" type="button">' + button[1] + '</button>';
                }).join('') + '</div></td></tr>';
        }).join('');
        renderPlans();
    }

    function contribute() {
        const item = findOwn('sw_goals', $('contributionGoal').value);
        const amount = Number($('contributionAmount').value);
        if (!item) {
            say('contributionMessage', 'Chọn mục tiêu còn tồn tại của bạn.');
            return;
        }
        if (typeof item.target !== 'number' || typeof item.saved !== 'number' ||
            !validMoney(item.target, false) || !validMoney(item.saved, true) || item.saved > item.target) {
            say('contributionMessage', 'Số tiền mục tiêu không hợp lệ. Hãy sửa mục tiêu trước khi góp.');
            return;
        }
        if (!validMoney(amount, false)) {
            say('contributionMessage', 'Khoản góp phải là số nguyên dương, tối đa 1.000.000.000.000 đồng.');
            return;
        }
        if (amount > item.target - item.saved) {
            say('contributionMessage', 'Khoản góp vượt số còn thiếu: ' + formatMoney(Math.max(0, item.target - item.saved)) + '.');
            return;
        }
        item.saved = Number(item.saved) + amount;
        if (saveRecord('sw_goals', item, true)) {
            $('contributionAmount').value = '';
            say('contributionMessage', 'Đã góp thêm ' + formatMoney(amount) + '.');
            ai.invalidate('Số đã góp đã đổi; hãy tính lại gợi ý.');
            renderPage();
        }
    }

    const ai = bindAi({
        signature: goalSignature,
        validate: function () {
            const item = findOwn('sw_goals', $('coachGoal').value);
            if (!item) {
                return 'Không đủ dữ liệu: hãy tạo và chọn một mục tiêu trước.';
            }
            if (!validMoney(Number(item.target), false) || !validMoney(Number(item.saved), true) || !validDate(item.deadline)) {
                return 'Dữ liệu mục tiêu không hợp lệ. Hãy sửa mục tiêu trước.';
            }
            if (item.saved >= item.target) {
                return 'Mục tiêu đã hoàn tất, không còn khoản thiếu để chia kỳ.';
            }
            if (item.deadline < today()) {
                return 'Mục tiêu quá hạn. Hãy sửa hạn rồi tạo lại kế hoạch.';
            }
            if (!['weekly', 'monthly'].includes($('frequency').value)) {
                return 'Chọn lịch hàng tuần hoặc hàng tháng.';
            }
            return '';
        },
        create: function () {
            const item = findOwn('sw_goals', $('coachGoal').value);
            const dates = scheduleDates(item, $('frequency').value);
            if (!dates.length) {
                return null;
            }
            const remaining = item.target - item.saved;
            const amount = Math.ceil(remaining / dates.length);
            return {
                signature: goalSignature(),
                choice: amount,
                dates: dates,
                remaining: remaining,
                deadline: item.deadline,
                goalId: item.id,
                snapshot: JSON.stringify([item.target, item.saved, item.deadline]),
                explanation: 'Còn thiếu ' + formatMoney(remaining) + '. Từ hôm nay đến ' +
                    formatDate(item.deadline) + ' có ' + dates.length +
                    ' kỳ góp (kỳ đầu hôm nay). Chia số còn thiếu cho số kỳ và làm tròn lên: ' +
                    formatMoney(amount) + ' mỗi kỳ. Kỳ cuối chỉ góp phần còn thiếu. Đây là phép tính mô phỏng, không tự chuyển tiền.'
            };
        },
        checkChoice: function (value) {
            const amount = Number(value);
            const item = findOwn('sw_goals', $('coachGoal').value);
            if (!validMoney(amount, false) || !item || amount > item.target - item.saved) {
                return 'Khoản mỗi kỳ phải nguyên dương và không vượt số còn thiếu.';
            }
            const count = scheduleDates(item, $('frequency').value).length;
            return amount * count >= item.target - item.saved ? '' : 'Khoản mỗi kỳ chưa đủ đạt mục tiêu theo hạn. Hãy tăng khoản góp hoặc sửa hạn.';
        },
        apply: function () {},
        reject: function () {},
        save: function (value, draft) {
            const plans = aiState().goalPlans || [];
            if (!Array.isArray(plans)) {
                showToast('Dữ liệu kế hoạch không hợp lệ.', 'error');
                return false;
            }
            const updated = plans.filter(function (plan) { return plan.goalId !== draft.goalId; });
            updated.push({
                goalId: draft.goalId,
                amount: Number(value),
                frequency: $('frequency').value,
                periods: draft.dates.length,
                dates: draft.dates,
                start: draft.dates[0],
                deadline: draft.deadline,
                lastContributionDate: draft.dates[draft.dates.length - 1],
                snapshot: draft.snapshot
            });
            return saveAi('goalPlans', updated);
        },
        render: renderPlans
    });

    $('goalForm').addEventListener('submit', function (event) { event.preventDefault(); saveGoal(); });
    $('contributionForm').addEventListener('submit', function (event) { event.preventDefault(); contribute(); });
    $('cancelEdit').addEventListener('click', resetForm);
    ['search', 'statusFilter'].forEach(function (id) { $(id).addEventListener('input', renderPage); });
    ['coachGoal', 'frequency'].forEach(function (id) {
        $(id).addEventListener('change', function () { ai.invalidate(); });
    });
    $('clearFilters').addEventListener('click', function () {
        $('search').value = '';
        $('statusFilter').value = '';
        renderPage();
    });
    $('goalRows').addEventListener('click', function (event) {
        const button = event.target.closest('button[data-action]');
        if (!button) {
            return;
        }
        const item = findOwn('sw_goals', button.dataset.id);
        if (!item) {
            showToast('Mục tiêu đã bị xóa.', 'warning');
            renderPage();
            return;
        }
        const action = button.dataset.action;
        if (action === 'delete') {
            if (confirmDelete('Xóa mục tiêu “' + item.name + '”?') && removeRecord('sw_goals', item.id)) {
                if (editingId === item.id) {
                    resetForm();
                }
                ai.invalidate();
                renderPage();
                showToast('Đã xóa mục tiêu.');
            }
        } else if (action === 'view') {
            say('goalDetail', item.name + ': ' + formatMoney(item.saved) + ' / ' +
                formatMoney(item.target) + ', ' + progress(item) + '%, hạn ' +
                formatDate(item.deadline) + ', ' + goalStatus(item) + '.');
            $('goalDetail').focus();
        } else if (action === 'edit') {
            editingId = item.id;
            editingSnapshot = JSON.stringify(item);
            $('goalName').value = item.name;
            $('target').value = item.target;
            $('saved').value = item.saved;
            $('deadline').value = item.deadline;
            $('formTitle').textContent = 'Sửa mục tiêu';
            $('cancelEdit').classList.remove('hidden');
            say('formMessage', '');
            $('goalName').focus();
        } else if (action === 'contribute') {
            $('contributionGoal').value = item.id;
            $('contributionAmount').focus();
        } else if (action === 'coach') {
            ai.invalidate();
            $('coachGoal').value = item.id;
            $('aiGenerate').focus();
        }
    });
    $('savedPlans').addEventListener('click', function (event) {
        const button = event.target.closest('[data-remove-plan]');
        if (!button || !confirmDelete('Xóa kế hoạch góp này?')) {
            return;
        }
        const plans = aiState().goalPlans || [];
        if (Array.isArray(plans) && saveAi('goalPlans', plans.filter(function (plan) {
            return plan.goalId !== button.dataset.removePlan;
        }))) {
            renderPlans();
        }
    });
    window.addEventListener('storage', function (event) {
        if (event.key === 'sw_goals' || event.key === 'sw_sv1_ai_' + account.id) {
            ai.invalidate('Dữ liệu đã đổi ở tab khác.');
            renderPage();
        }
    });
    resetForm();
    renderPage();
})();
