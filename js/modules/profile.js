const user = setupAppPage('profile.html');

if (user) {
    const profileForm = document.getElementById('profileForm');
    const displayName = document.getElementById('displayName');
    const profileEmail = document.getElementById('profileEmail');
    const phone = document.getElementById('phone');
    const profileTimezone = document.getElementById('profileTimezone');
    let profile = getUserData('profile', {
        phone: '',
        timezone: 'GMT+7'
    });

    function renderPage() {
        renderStats([
            [cleanText(user.name), 'Tên hiển thị'],
            [ROLE_NAMES[user.role] || user.role, 'Vai trò'],
            [new Date(user.createdAt).toLocaleDateString('vi-VN'), 'Thành viên từ'],
            ['Đã xác minh', 'Trạng thái']
        ]);

        displayName.value = user.name;
        profileEmail.value = user.email;
        phone.value = profile.phone || '';
        profileTimezone.value = profile.timezone || 'GMT+7';
    }

    profileForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const users = getUsers();
        const current = findItemById(users, user.id);

        if (!current) {
            return;
        }

        current.name = displayName.value.trim();
        profile.phone = phone.value.trim();
        profile.timezone = profileTimezone.value;

        saveUsers(users);
        saveUserData('profile', profile);
        user.name = current.name;

        showToast('Đã lưu hồ sơ.');
        renderPage();
    });

    document.getElementById('globalSearch').addEventListener('input', function () {
        const keyword = this.value.trim();
        const form = document.getElementById('profileForm');
        const text = user.name + ' ' + user.email + ' ' + profile.phone;

        form.style.display = searchText(text, keyword) ? 'block' : 'none';
    });

    renderPage();
}
