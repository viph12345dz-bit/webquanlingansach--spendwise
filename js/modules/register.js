const registerForm = document.getElementById('registerForm');
const message = document.getElementById('message');

registerForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const role = document.getElementById('role').value;
    const users = getUsers();

    if (name.length < 2) {
        message.textContent = 'Họ và tên phải có ít nhất 2 ký tự.';
        return;
    }

    if (password.length < 6) {
        message.textContent = 'Mật khẩu phải có ít nhất 6 ký tự.';
        return;
    }

    if (password !== confirmPassword) {
        message.textContent = 'Hai mật khẩu không giống nhau.';
        return;
    }

    for (let i = 0; i < users.length; i++) {
        if (users[i].email === email) {
            message.textContent = 'Email này đã được đăng ký.';
            return;
        }
    }

    const newUser = {
        id: makeId(),
        name: name,
        email: email,
        password: password,
        role: role,
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    message.textContent = 'Đăng ký thành công. Đang chuyển tới đăng nhập...';
    message.classList.add('success');

    setTimeout(function () {
        window.location.href = 'login.html';
    }, 700);
});
