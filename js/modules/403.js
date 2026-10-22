const backDashboard = document.getElementById('backDashboard');

backDashboard.addEventListener('click', function () {
    const user = getCurrentUser();

    if (user) {
        goToDashboard(user);
    } else {
        window.location.href = 'login.html';
    }
});
