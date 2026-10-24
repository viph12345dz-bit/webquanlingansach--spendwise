(function () {
    'use strict';

    const form = document.getElementById('resetForm');
    const message = document.getElementById('message');

    function showMessage(text, success) {
        message.textContent = text;
        message.classList.toggle('success', Boolean(success));
    }

    function resetPassword(event) {
        event.preventDefault();
        const email = document.getElementById('email').value.trim().toLowerCase();
        const password = document.getElementById('newPassword').value;
        const confirmation = document.getElementById('confirmPassword').value;
        let error = SV1Auth.emailError(email) || SV1Auth.passwordError(password);
        if (!error && password !== confirmation) {
            error = 'Hai mật khẩu không giống nhau.';
        }
        showMessage(error, false);
        if (error) {
            return;
        }

        try {
            const user = SV1Auth.findByEmail(email);
            if (!user) {
                showMessage('Email này chưa có tài khoản demo trong trình duyệt.', false);
                return;
            }
            SV1Auth.resetPassword(user, password);
            form.reset();
            showMessage('Đã đổi mật khẩu DEMO trên trình duyệt này. Không gửi email. Bạn có thể quay lại đăng nhập.', true);
        } catch (error) {
            showMessage(error.message, false);
        }
    }

    form.addEventListener('submit', resetPassword);
    form.addEventListener('input', function () { showMessage('', false); });
})();
