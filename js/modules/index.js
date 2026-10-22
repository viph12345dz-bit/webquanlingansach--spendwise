const loadingBar = document.getElementById('loadingBar');
let progress = 0;

const loadingTimer = setInterval(function () {
    progress += 20;
    loadingBar.style.width = progress + '%';

    if (progress >= 100) {
        clearInterval(loadingTimer);

        const user = getCurrentUser();

        setTimeout(function () {
            if (user) {
                goToDashboard(user);
            } else {
                window.location.href = 'pages/home.html';
            }
        }, 250);
    }
}, 180);
