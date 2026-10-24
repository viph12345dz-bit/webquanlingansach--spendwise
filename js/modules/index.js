(function () {
    'use strict';

    const loadingBar = document.getElementById('loadingBar');
    const progressBar = document.getElementById('loadingProgress');
    const message = document.getElementById('indexMessage');
    let progress = 0;

    const timer = setInterval(function () {
        progress += 20;
        loadingBar.style.width = progress + '%';
        progressBar.setAttribute('aria-valuenow', progress);

        if (progress >= 100) {
            clearInterval(timer);
            try {
                const user = SV1Auth.currentUser();
                message.textContent = user ? 'Đang mở không gian của bạn...' : 'Đang mở trang giới thiệu...';
                window.location.href = user ? SV1Auth.destination(user) : 'pages/home.html';
            } catch (error) {
                message.textContent = 'Không đọc được phiên demo. Bạn có thể dùng các liên kết bên dưới. ' + error.message;
            }
        }
    }, 180);
})();
