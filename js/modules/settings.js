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

        saveUserData('settings', settings);
        applyTheme();
        renderPage();
        showToast('Đã lưu cài đặt.');
    });

    clearDataBtn.addEventListener('click', function () {
        if (!confirmDelete('Xóa dữ liệu nghiệp vụ của tài khoản này?')) {
            return;
        }

        const keys = [
            'transactions',
            'goals',
            'insights',
            'notifications',
            'clients',
            'reviews',
            'resources',
            'moderation',
            'templates',
            'feedback',
            'categories',
            'services'
        ];

        for (let i = 0; i < keys.length; i++) {
            localStorage.removeItem(getUserKey(keys[i]));
        }

        showToast('Đã xóa dữ liệu.', 'warning');
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
