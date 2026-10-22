const resetForm = document.getElementById('resetForm');
const message = document.getElementById('message');

resetForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const email = document.getElementById('email').value.trim().toLowerCase();
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const users = getUsers();
    let user = null;

    if (newPassword.length < 6) {
        message.textContent = 'Mật khẩu mới phải có ít nhất 6 ký tự.';
        return;
    }

    if (newPassword !== confirmPassword) {
        message.textContent = 'Hai mật khẩu không giống nhau.';
        return;
    }

    for (let i = 0; i < users.length; i++) {
        if (users[i].email === email) {
            user = users[i];
            break;
        }
    }

    if (!user) {
        message.textContent = 'Email này chưa có tài khoản.';
        return;
    }

    user.password = newPassword;
    saveUsers(users);

    message.textContent = 'Đã đổi mật khẩu. Bạn có thể đăng nhập lại.';
    message.classList.add('success');
});
