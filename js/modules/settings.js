const user = setupAppPage('settings.html');

if (user) {
    const settingsForm = document.getElementById('settingsForm');
    const theme = document.getElementById('theme');
    const currency = document.getElementById('currency');
    const timezone = document.getElementById('timezone');
    const twofa = document.getElementById('twofa');
    const clearDataBtn = document.getElementById('clearDataBtn');
    const logoutMainBtn = document.getElementById('logoutMainBtn');
    let settings = getUserData('settings', {
        currency: 'VND',
        timezone: 'GMT+7',
        twofa: 'off'
    });

    function renderPage() {
        const currentTheme = localStorage.getItem(STORAGE_THEME) || 'light';

        theme.value = currentTheme;
        currency.value = settings.currency;
        timezone.value = settings.timezone;
        twofa.value = settings.twofa;

        renderStats([
            [currentTheme === 'dark' ? 'Dark' : 'Light', 'Giao diện'],
            [settings.currency, 'Tiền tệ'],
            [settings.timezone, 'Múi giờ'],
            [settings.twofa === 'on' ? 'Bật' : 'Tắt', '2FA']
        ]);
    }

    settingsForm.addEventListener('change', function () {
        localStorage.setItem(STORAGE_THEME, theme.value);

        settings.currency = currency.value;
        settings.timezone = timezone.value;
        settings.twofa = twofa.value;

        if (!saveUserData('settings', settings)) return;
        applyTheme();
        renderPage();
        showToast('Đã lưu cài đặt.');
    });

    clearDataBtn.addEventListener('click', function () {
        const changes = [];
        let applied = 0;
        try {
            if (!canWriteAppData() || !confirmDelete('Xóa dữ liệu nghiệp vụ của tài khoản này?') ||
                !canWriteAppData()) return;
            const shared = [
                { key: 'sw_transactions', field: 'userId' },
                { key: 'sw_goals', field: 'userId' },
                { key: 'sw_budgets', field: 'userId' },
                { key: 'sw_notifications', field: 'userId' },
                { key: 'sw_coachNotes', field: 'coachId' },
                { key: 'sw_resources', field: 'coachId' }
            ];
            // Chuẩn bị đủ thay đổi trước khi ghi; giữ dữ liệu owner khác.
            for (let i = 0; i < shared.length; i++) {
                const spec = shared[i];
                const previous = localStorage.getItem(spec.key);
                if (previous === null) continue;
                const items = JSON.parse(previous);
                if (!Array.isArray(items) || items.some(function (item) {
                    return !item || typeof item !== 'object' || Array.isArray(item);
                })) throw new Error('Dữ liệu ' + spec.key + ' không hợp lệ.');
                const remaining = items.filter(function (item) {
                    if (spec.key === 'sw_coachNotes' && !item.coachId) return item.userId !== user.id;
                    return item[spec.field] !== user.id;
                });
                if (remaining.length !== items.length) {
                    changes.push({ key: spec.key, previous: previous, next: JSON.stringify(remaining) });
                }
            }
            const legacyNames = ['transactions', 'goals', 'insights', 'goalPlans', 'notifications',
                'clients', 'reviews', 'coachNotes', 'reviewsMigrated', 'budgets', 'resources',
                'moderation', 'templates', 'aiTemplates', 'feedback', 'categories', 'services'];
            const privateKeys = ['sw_sv1_ai_' + user.id];
            legacyNames.forEach(function (name) { privateKeys.push('spendwise_' + user.id + '_' + name); });
            privateKeys.forEach(function (key) {
                const previous = localStorage.getItem(key);
                if (previous !== null) changes.push({ key: key, previous: previous, next: null });
            });
            if (!canWriteAppData()) return;
            for (let i = 0; i < changes.length; i++) {
                const change = changes[i];
                if (change.next === null) localStorage.removeItem(change.key);
                else localStorage.setItem(change.key, change.next);
                applied++;
            }
            showToast('Đã xóa dữ liệu nghiệp vụ của tài khoản này.', 'warning');
        } catch (error) {
            let restored = true;
            for (let i = applied - 1; i >= 0; i--) {
                try { localStorage.setItem(changes[i].key, changes[i].previous); }
                catch (restoreError) { restored = false; }
            }
            showToast('Không xóa được dữ liệu. ' + error.message +
                (restored ? '' : ' Chưa khôi phục đủ dữ liệu; hãy kiểm tra quyền lưu trữ.'), 'error');
        }
    });

    logoutMainBtn.addEventListener('click', logout);

    document.getElementById('globalSearch').addEventListener('input', function () {
        const keyword = this.value.trim().toLowerCase();
        const cards = document.querySelectorAll('.setting-card');

        for (let i = 0; i < cards.length; i++) {
            const text = cards[i].textContent.toLowerCase();
            cards[i].style.display = text.includes(keyword) ? 'block' : 'none';
        }
    });

    renderPage();
}
