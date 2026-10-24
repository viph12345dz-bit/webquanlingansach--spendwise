const STORAGE_USERS = 'spendwise_users';
const STORAGE_SESSION = 'spendwise_session';
const STORAGE_THEME = 'spendwise_theme';
let modalReturnFocus = null;
const CONTRACT_USERS = 'sw_users';
const CONTRACT_SESSION = 'sw_session';
const SHARED_DATA_KEYS = {
    transactions: 'sw_transactions',
    goals: 'sw_goals',
    resources: 'sw_resources',
    categories: 'sw_categories',
    coachNotes: 'sw_coachNotes',
    budgets: 'sw_budgets',
    aiTemplates: 'sw_aiTemplates',
    feedback: 'sw_feedback',
    notifications: 'sw_notifications'
};
const USER_SCOPED_DATA = ['transactions', 'goals', 'budgets', 'coachNotes', 'notifications'];

const ROLE_NAMES = {
    user: 'USER',
    coach: 'COACH',
    moderator: 'MODERATOR',
    admin: 'ADMIN'
};

const DEFAULT_PAGES = {
    user: 'user-dashboard.html',
    coach: 'coach-clients.html',
    moderator: 'moderator-resource-review.html',
    admin: 'admin-system-dashboard.html'
};

const MENU = {
    user: [
        ['user-dashboard.html', 'Tổng quan'],
        ['user-transactions.html', 'Giao dịch'],
        ['user-goals.html', 'Mục tiêu tiết kiệm'],
        ['notifications.html', 'Thông báo'],
        ['profile.html', 'Hồ sơ'],
        ['settings.html', 'Cài đặt']
    ],
    coach: [
        ['coach-clients.html', 'Khách hàng'],
        ['coach-review.html', 'Review ngân sách'],
        ['coach-resources.html', 'Tài nguyên'],
        ['notifications.html', 'Thông báo'],
        ['profile.html', 'Hồ sơ'],
        ['settings.html', 'Cài đặt']
    ],
    moderator: [
        ['moderator-resource-review.html', 'Kiểm duyệt tài nguyên'],
        ['moderator-ai-template-management.html', 'Template AI'],
        ['moderator-feedback-center.html', 'Feedback'],
        ['notifications.html', 'Thông báo'],
        ['profile.html', 'Hồ sơ'],
        ['settings.html', 'Cài đặt']
    ],
    admin: [
        ['admin-system-dashboard.html', 'Dashboard hệ thống'],
        ['admin-expense-category-management.html', 'Danh mục chi tiêu'],
        ['admin-user-management.html', 'Người dùng & quyền'],
        ['notifications.html', 'Thông báo'],
        ['profile.html', 'Hồ sơ'],
        ['settings.html', 'Cài đặt']
    ]
};

function readJSON(key, defaultValue) {
    const value = localStorage.getItem(key);

    if (!value) {
        return defaultValue;
    }

    try {
        return JSON.parse(value);
    } catch (error) {
        return defaultValue;
    }
}

function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getUsers() {
    return readJSON(STORAGE_USERS, readJSON(CONTRACT_USERS, []));
}

function saveUsers(users) {
    writeJSON(STORAGE_USERS, users);
    writeJSON(CONTRACT_USERS, users);
}

function getSession() {
    return readJSON(STORAGE_SESSION, readJSON(CONTRACT_SESSION, null));
}

function setSession(user) {
    const session = {
        userId: user.id,
        role: user.role
    };
    writeJSON(STORAGE_SESSION, session);
    writeJSON(CONTRACT_SESSION, session);
}

function clearSession() {
    localStorage.removeItem(STORAGE_SESSION);
    localStorage.removeItem(CONTRACT_SESSION);
}

function getCurrentUser() {
    const session = getSession();

    if (!session) {
        return null;
    }

    const users = getUsers();

    for (let i = 0; i < users.length; i++) {
        if (users[i].id === session.userId) {
            if (users[i].active === false) {
                return null;
            }

            return users[i];
        }
    }

    return null;
}

function makeId() {
    return Date.now().toString() + Math.floor(Math.random() * 1000).toString();
}

function getUserKey(name) {
    const user = getCurrentUser();

    if (!user) {
        return 'spendwise_guest_' + name;
    }

    return 'spendwise_' + user.id + '_' + name;
}

function getUserData(name, defaultValue) {
    const sharedKey = SHARED_DATA_KEYS[name];
    const user = getCurrentUser();

    if (sharedKey) {
        const sharedValue = localStorage.getItem(sharedKey);

        if (sharedValue !== null) {
            const allItems = readJSON(sharedKey, defaultValue);

            if (!Array.isArray(allItems)) {
                return defaultValue;
            }

            if (USER_SCOPED_DATA.indexOf(name) !== -1) {
                const ownerId = user ? user.id : 'guest';
                return allItems.filter(function (item) {
                    return item && item.userId === ownerId;
                });
            }

            return allItems;
        }

        // Read the old template key while moving it to the shared AI-template key.
        const legacyName = name === 'aiTemplates' ? 'templates' : name;
        const guestKey = 'spendwise_guest_' + legacyName;
        const guestValue = localStorage.getItem(guestKey);

        if (guestValue !== null) {
            const migratedValue = readJSON(guestKey, defaultValue);

            if (!Array.isArray(migratedValue)) {
                return defaultValue;
            }

            if (USER_SCOPED_DATA.indexOf(name) !== -1) {
                const ownerId = user ? user.id : 'guest';

                for (let i = 0; i < migratedValue.length; i++) {
                    if (migratedValue[i] && typeof migratedValue[i] === 'object') {
                        migratedValue[i].userId = ownerId;
                    }
                }
            }

            for (let i = 0; i < migratedValue.length; i++) {
                if (migratedValue[i] && typeof migratedValue[i] === 'object') {
                    migratedValue[i] = normalizeLegacySharedItem(name, migratedValue[i]);
                }
            }
            writeJSON(sharedKey, migratedValue);
            return USER_SCOPED_DATA.indexOf(name) !== -1
                ? migratedValue.filter(function (item) {
                    return item && item.userId === (user ? user.id : 'guest');
                })
                : migratedValue;
        }

        // Collect older per-account records into the shared demo contract once.
        if (sharedKey) {
            const mergedItems = [];
            const users = getUsers();
            const isUserScoped = USER_SCOPED_DATA.indexOf(name) !== -1;
            const accounts = isUserScoped ? (user ? [user] : []) : users;

            for (let i = 0; i < accounts.length; i++) {
                const accountKey = 'spendwise_' + accounts[i].id + '_' + legacyName;
                const accountItems = readJSON(accountKey, []);

                if (!Array.isArray(accountItems)) {
                    continue;
                }

                for (let j = 0; j < accountItems.length; j++) {
                    if (!accountItems[j] || typeof accountItems[j] !== 'object') {
                        continue;
                    }

                    const item = normalizeLegacySharedItem(name, accountItems[j]);

                    if (isUserScoped) {
                        item.userId = accounts[i].id;
                    }

                    if (name === 'resources' && !item.coachId) {
                        item.coachId = accounts[i].id;
                    }

                    if (!findItemById(mergedItems, item.id)) {
                        mergedItems.push(item);
                    }
                }
            }

            if (mergedItems.length > 0) {
                writeJSON(sharedKey, mergedItems);
                if (isUserScoped) {
                    const ownerId = user ? user.id : 'guest';
                    return mergedItems.filter(function (item) { return item.userId === ownerId; });
                }
                return mergedItems;
            }
        }

        return defaultValue;
    }

    return readJSON(getUserKey(name), defaultValue);
}

function normalizeLegacySharedItem(name, item) {
    if (name !== 'aiTemplates') {
        return item;
    }

    if (!item.prompt) {
        item.prompt = 'Mẫu cũ trong bản demo. Mô hình: ' + (item.model || 'chưa ghi');
    }

    item.version = Number(item.version) || 1;
    item.status = item.status === 'Stable' || item.status === 'active'
        ? 'active'
        : 'draft';

    return item;
}

function saveUserData(name, value) {
    const sharedKey = SHARED_DATA_KEYS[name];

    if (sharedKey) {
        if (!Array.isArray(value)) {
            return;
        }

        if (USER_SCOPED_DATA.indexOf(name) !== -1) {
            const user = getCurrentUser();
            const ownerId = user ? user.id : 'guest';
            const allItems = readJSON(sharedKey, []);
            const otherUsers = allItems.filter(function (item) {
                return !item || item.userId !== ownerId;
            });

            for (let i = 0; i < value.length; i++) value[i].userId = ownerId;
            writeJSON(sharedKey, otherUsers.concat(value));
        } else {
            writeJSON(sharedKey, value);
        }
        return;
    }

    writeJSON(getUserKey(name), value);
}

function formatMoney(value) {
    const number = Number(value) || 0;
    return number.toLocaleString('vi-VN') + ' đ';
}

function formatDate(value) {
    if (!value) {
        return '—';
    }

    const date = new Date(value + 'T00:00:00');

    if (isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString('vi-VN');
}

function cleanText(value) {
    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function showToast(message, type) {
    const toast = document.getElementById('toast');

    if (!toast) {
        return;
    }

    toast.textContent = message;
    toast.className = 'toast show';

    if (type) {
        toast.classList.add(type);
    }

    setTimeout(function () {
        toast.className = 'toast';
    }, 2200);
}

function openModal(title, content) {
    const overlay = document.getElementById('modalOverlay');

    if (!overlay) {
        return;
    }

    overlay.innerHTML = `
        <section class="modal" aria-modal="true" role="dialog">
            <header class="modal-header">
                <h2>${cleanText(title)}</h2>
                <button id="closeModalBtn" class="icon-button" type="button">×</button>
            </header>
            ${content}
        </section>
    `;

    modalReturnFocus = document.activeElement;
    overlay.classList.remove('hidden');

    const modal = overlay.querySelector('.modal');
    const modalTitle = overlay.querySelector('.modal-header h2');
    const closeButton = document.getElementById('closeModalBtn');
    modalTitle.id = 'modalTitle';
    modal.setAttribute('aria-labelledby', 'modalTitle');
    closeButton.setAttribute('aria-label', 'Đóng hộp thoại');
    closeButton.addEventListener('click', closeModal);
    overlay.onclick = function (event) {
        if (event.target === overlay) {
            closeModal();
        }
    };
    overlay.onkeydown = function (event) {
        if (event.key === 'Escape') {
            closeModal();
        }
    };

    const firstField = overlay.querySelector(
        'input:not([type="hidden"]), select, textarea, button:not(#closeModalBtn)'
    );

    if (firstField) {
        firstField.focus();
    }
}

function closeModal() {
    const overlay = document.getElementById('modalOverlay');

    if (!overlay) {
        return;
    }

    overlay.classList.add('hidden');
    overlay.innerHTML = '';
    overlay.onclick = null;
    overlay.onkeydown = null;

    if (modalReturnFocus && typeof modalReturnFocus.focus === 'function') {
        modalReturnFocus.focus();
    }

    modalReturnFocus = null;
}

function statusClass(status) {
    const text = String(status || '').toLowerCase();

    if (text.includes('từ chối') || text.includes('cần sửa') ||
        text.includes('đã tắt') || text.includes('gián đoạn')) {
        return 'status-danger';
    }

    if (text.includes('chờ') || text.includes('đang') ||
        text.includes('theo dõi') || text.includes('tạm ẩn')) {
        return 'status-warning';
    }

    return 'status-success';
}

function statusLabel(status) {
    return `<span class="status ${statusClass(status)}">${cleanText(status)}</span>`;
}

function pageUrl(fileName) {
    const inPagesFolder = window.location.pathname.includes('/pages/');

    if (inPagesFolder) {
        return fileName;
    }

    return 'pages/' + fileName;
}

function goToDashboard(user) {
    const page = DEFAULT_PAGES[user.role] || 'home.html';
    window.location.href = pageUrl(page);
}

function logout() {
    clearSession();
    window.location.href = pageUrl('login.html');
}

function makeInitials(name) {
    const words = String(name || 'US').trim().split(' ');
    let result = '';

    for (let i = Math.max(0, words.length - 2); i < words.length; i++) {
        if (words[i]) {
            result += words[i][0].toUpperCase();
        }
    }

    return result || 'US';
}

function applyTheme() {
    const theme = localStorage.getItem(STORAGE_THEME) || 'light';

    if (theme === 'dark') {
        document.body.classList.add('dark');
    } else {
        document.body.classList.remove('dark');
    }
}

function setupAppPage(activePage, requiredRole) {
    const user = getCurrentUser();

    if (!user) {
        window.location.replace('login.html');
        return null;
    }

    if (requiredRole && user.role !== requiredRole) {
        window.location.replace('403.html');
        return null;
    }

    applyTheme();

    const roleBadge = document.getElementById('roleBadge');
    const userInitials = document.getElementById('userInitials');
    const sidebarNav = document.getElementById('sidebarNav');
    const logoutButton = document.getElementById('logoutBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const sidebar = document.getElementById('sidebar');

    if (roleBadge) {
        roleBadge.textContent = ROLE_NAMES[user.role] || user.role.toUpperCase();
    }

    if (userInitials) {
        userInitials.textContent = makeInitials(user.name);
    }

    if (sidebarNav) {
        const items = MENU[user.role] || [];
        let html = '';

        for (let i = 0; i < items.length; i++) {
            const file = items[i][0];
            const label = items[i][1];
            const activeClass = file === activePage ? ' active' : '';

            html += `
                <a class="nav-link${activeClass}" href="${file}">
                    ${label}
                </a>
            `;
        }

        sidebarNav.innerHTML = html;
        const activeLink = sidebarNav.querySelector('.nav-link.active');

        if (activeLink) {
            activeLink.setAttribute('aria-current', 'page');
        }
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }

    if (mobileMenu && sidebar) {
        mobileMenu.addEventListener('click', function () {
            const isOpen = sidebar.classList.toggle('open');
            mobileMenu.setAttribute('aria-expanded', String(isOpen));
        });
    }

    if (sidebarNav && mobileMenu && sidebar) {
        sidebarNav.addEventListener('click', function (event) {
            if (event.target.closest('a')) {
                sidebar.classList.remove('open');
                mobileMenu.setAttribute('aria-expanded', 'false');
            }
        });
    }

    return user;
}

function addNotification(text, type) {
    const notifications = getUserData('notifications', []);

    notifications.unshift({
        id: makeId(),
        text: text,
        type: type || 'Hệ thống',
        time: new Date().toISOString(),
        read: false
    });

    saveUserData('notifications', notifications);
}

function searchText(value, keyword) {
    const text = String(value || '').toLowerCase();
    const query = String(keyword || '').toLowerCase();

    return text.includes(query);
}

function confirmDelete(message) {
    return window.confirm(message);
}

function renderStats(items) {
    const container = document.getElementById('stats');

    if (!container) {
        return;
    }

    let html = '';

    for (let i = 0; i < items.length; i++) {
        html += `
            <article class="stat-card">
                <strong>${items[i][0]}</strong>
                <span>${items[i][1]}</span>
            </article>
        `;
    }

    container.innerHTML = html;
}

function findItemById(items, id) {
    for (let i = 0; i < items.length; i++) {
        if (items[i].id === id) {
            return items[i];
        }
    }

    return null;
}

function countByField(items, field, value) {
    let count = 0;

    for (let i = 0; i < items.length; i++) {
        if (items[i][field] === value) {
            count++;
        }
    }

    return count;
}

function countFilled(items, field) {
    let count = 0;

    for (let i = 0; i < items.length; i++) {
        if (items[i][field]) {
            count++;
        }
    }

    return count;
}

function countUnique(items, field) {
    const values = [];

    for (let i = 0; i < items.length; i++) {
        const value = items[i][field];

        if (value && values.indexOf(value) === -1) {
            values.push(value);
        }
    }

    return values.length;
}

function averageNumber(items, field) {
    if (items.length === 0) {
        return 0;
    }

    let total = 0;

    for (let i = 0; i < items.length; i++) {
        total += Number(items[i][field]) || 0;
    }

    return Math.round(total / items.length);
}
