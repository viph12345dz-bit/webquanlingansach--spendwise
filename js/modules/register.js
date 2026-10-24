(function () {
    'use strict';

    const form = document.getElementById('registerForm');
    const message = document.getElementById('message');

    function showMessage(text, success) {
        message.textContent = text;
        message.classList.toggle('success', Boolean(success));
    }

    function registerAccount(event) {
        event.preventDefault();
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim().toLowerCase();
        const password = document.getElementById('password').value;
        const confirmation = document.getElementById('confirmPassword').value;
        const role = document.getElementById('role').value;
        let error = '';
        if (name.length < 2 || name.length > 80) {
            error = 'Họ tên demo cần từ 2 đến 80 ký tự, không chỉ gồm khoảng trắng.';
        } else {
            error = SV1Auth.emailError(email) || SV1Auth.passwordError(password);
        }
        if (!error && password !== confirmation) {
            error = 'Hai mật khẩu không giống nhau.';
        }
        showMessage(error, false);
        if (error) {
            return;
        }

        try {
            SV1Auth.register({
                id: makeId(),
                name: name,
                email: email,
                password: password,
                role: role,
                createdAt: new Date().toISOString()
            });
            form.querySelector('[type="submit"]').disabled = true;
            showMessage('Đã tạo tài khoản demo trong trình duyệt này. Đang tới đăng nhập...', true);
            setTimeout(function () { window.location.href = 'login.html'; }, 500);
        } catch (error) {
            showMessage(error.message, false);
        }
    }

    form.addEventListener('submit', registerAccount);
    form.addEventListener('input', function () { showMessage('', false); });
})();
