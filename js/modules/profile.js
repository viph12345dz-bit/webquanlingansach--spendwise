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
            ['Tài khoản demo', 'Trạng thái']
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

        const name = displayName.value.trim();
        if (!canWriteAppData()) return;
        if (name.length < 2 || name.length > 80) {
            showToast('Tên hiển thị cần từ 2 đến 80 ký tự, không chỉ khoảng trắng.', 'error');
            return;
        }
        current.name = name;
        profile.phone = phone.value.trim();
        profile.timezone = profileTimezone.value;

        if (!saveUsers(users)) return;
        if (!saveUserData('profile', profile)) return;
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
