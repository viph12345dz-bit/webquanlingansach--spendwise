const loginForm = document.getElementById('loginForm');
const message = document.getElementById('message');

loginForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    const users = getUsers();
    let foundUser = null;

    for (let i = 0; i < users.length; i++) {
        if (users[i].email === email) {
            foundUser = users[i];
            break;
        }
    }

    if (!foundUser) {
        message.textContent = 'Không tìm thấy tài khoản với email này.';
        return;
    }

    if (foundUser.password !== password) {
        message.textContent = 'Mật khẩu không đúng.';
        return;
    }

    message.textContent = 'Đăng nhập thành công!';
    message.classList.add('success');
    setSession(foundUser);

    setTimeout(function () {
        goToDashboard(foundUser);
    }, 500);
});
