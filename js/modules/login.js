(function () {
    'use strict';

    const form = document.getElementById('loginForm');
    const message = document.getElementById('message');
    const submitButton = form.querySelector('[type="submit"]');

    function showMessage(text, success) {
        message.textContent = text;
        message.classList.toggle('success', Boolean(success));
    }

    function signIn(event) {
        event.preventDefault();
        const email = document.getElementById('email').value.trim().toLowerCase();
        const password = document.getElementById('password').value;
        const error = SV1Auth.emailError(email) || (!password.trim() ? 'Nhập mật khẩu demo của tài khoản.' : '');
        showMessage(error, false);
        if (error) {
            return;
        }

        try {
            const user = SV1Auth.findByEmail(email);
            if (!user || user.password !== password) {
                showMessage('Email hoặc mật khẩu demo không đúng.', false);
                return;
            }
            SV1Auth.signIn(user);
            submitButton.disabled = true;
            showMessage('Đăng nhập demo thành công. Đang chuyển trang...', true);
            setTimeout(function () {
                window.location.href = SV1Auth.destination(user);
            }, 400);
        } catch (error) {
            showMessage(error.message, false);
        }
    }

    form.addEventListener('submit', signIn);
    form.addEventListener('input', function () { showMessage('', false); });
})();
