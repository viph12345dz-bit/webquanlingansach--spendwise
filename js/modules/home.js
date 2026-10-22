const user = getCurrentUser();
const memberAction = document.getElementById('memberAction');

if (user) {
    const button = document.createElement('button');
    button.className = 'btn btn-primary';
    button.textContent = 'Vào dashboard';

    button.addEventListener('click', function () {
        goToDashboard(user);
    });

    memberAction.appendChild(button);
}
