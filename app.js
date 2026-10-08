/* =========================================================
   SPENDWISE - app.js
   Bản Frontend SPA dễ đọc cho người mới học.
   - 1 HTML + 1 CSS + 1 JS
   - LocalStorage để lưu tài khoản và dữ liệu
   - CRUD + validation + role + AI mô phỏng
   ========================================================= */

// ========================= 1. HÀM TIỆN ÍCH =========================
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const nowISO = () => new Date().toISOString();
const todayISO = () => new Date().toISOString().slice(0, 10);
const uid = () => `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#039;');
const formatMoney = (number = 0) => `${Number(number || 0).toLocaleString('vi-VN')} đ`;
const shortMoney = (number = 0) => {
  const n = Number(number || 0);
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tr`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toLocaleString('vi-VN', { maximumFractionDigits: 0 })}k`;
  return n.toLocaleString('vi-VN');
};
const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? escapeHtml(iso) : d.toLocaleDateString('vi-VN');
};
const normalize = (value = '') => String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ========================= 2. LOCALSTORAGE =========================
const KEYS = {
  users: 'spendwise_users_v3',
  session: 'spendwise_session_v3',
  globalTheme: 'spendwise_theme_v3'
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.error('Không đọc được LocalStorage:', key, error);
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getUsers() { return readJSON(KEYS.users, []); }
function saveUsers(users) { writeJSON(KEYS.users, users); }

function userStoragePrefix() {
  return state.currentUser ? `spendwise_${state.currentUser.id}_` : 'spendwise_guest_';
}
function userKey(name) { return `${userStoragePrefix()}${name}`; }
function load(name, fallback = []) { return readJSON(userKey(name), fallback); }
function save(name, value) { writeJSON(userKey(name), value); }

// ========================= 3. STATE VÀ CẤU HÌNH =========================
const state = {
  currentUser: null,
  route: '',
  query: '',
  statusFilter: 'all',
  splashDone: false
};

const ROLE_NAMES = {
  user: 'USER',
  coach: 'COACH',
  moderator: 'MODERATOR',
  admin: 'ADMIN'
};

const ROLE_LABELS = {
  user: 'Người dùng',
  coach: 'Coach',
  moderator: 'Moderator',
  admin: 'Admin'
};

const NAV_BY_ROLE = {
  user: [
    ['dashboard', 'Tổng quan'],
    ['transactions', 'Giao dịch'],
    ['goals', 'Mục tiêu tiết kiệm'],
    ['notifications', 'Thông báo'],
    ['profile', 'Hồ sơ'],
    ['settings', 'Cài đặt']
  ],
  coach: [
    ['clients', 'Khách hàng'],
    ['reviews', 'Review ngân sách'],
    ['resources', 'Tài nguyên'],
    ['notifications', 'Thông báo'],
    ['profile', 'Hồ sơ'],
    ['settings', 'Cài đặt']
  ],
  moderator: [
    ['moderation', 'Kiểm duyệt'],
    ['templates', 'Template AI'],
    ['feedback', 'Feedback'],
    ['notifications', 'Thông báo'],
    ['profile', 'Hồ sơ'],
    ['settings', 'Cài đặt']
  ],
  admin: [
    ['system', 'Dashboard hệ thống'],
    ['categories', 'Danh mục chi tiêu'],
    ['users', 'Người dùng & quyền'],
    ['notifications', 'Thông báo'],
    ['profile', 'Hồ sơ'],
    ['settings', 'Cài đặt']
  ]
};

const ROUTE_META = {
  dashboard: ['Tổng quan', 'SW-06 • User Dashboard'],
  transactions: ['Giao dịch', 'SW-07 • Transactions'],
  goals: ['Mục tiêu tiết kiệm', 'SW-08 • Saving Goals'],
  clients: ['Khách hàng', 'SW-09 • Coach Client List'],
  reviews: ['Review ngân sách', 'SW-10 • Coach Budget Review'],
  resources: ['Tài nguyên giáo dục', 'SW-11 • Coach Resource Management'],
  moderation: ['Kiểm duyệt tài nguyên', 'SW-12 • Moderator Resource Review'],
  templates: ['Template AI', 'SW-13 • Moderator AI Template Management'],
  feedback: ['Trung tâm feedback', 'SW-14 • Moderator Feedback Center'],
  categories: ['Danh mục chi tiêu', 'SW-15 • Admin Expense Categories'],
  users: ['Người dùng & quyền', 'SW-16 • Admin User Management'],
  system: ['Dashboard hệ thống', 'SW-17 • Admin System Dashboard'],
  notifications: ['Thông báo', 'SW-18 • Notifications'],
  profile: ['Hồ sơ cá nhân', 'SW-19 • Profile'],
  settings: ['Cài đặt', 'SW-20 • Settings']
};

const ROUTE_RENDERERS = {
  dashboard: renderDashboard,
  transactions: renderTransactions,
  goals: renderGoals,
  clients: renderClients,
  reviews: renderReviews,
  resources: renderResources,
  moderation: renderModeration,
  templates: renderTemplates,
  feedback: renderFeedback,
  categories: renderCategories,
  users: renderUsers,
  system: renderSystem,
  notifications: renderNotifications,
  profile: renderProfile,
  settings: renderSettings
};

function defaultRouteForRole(role) {
  return { user: 'dashboard', coach: 'clients', moderator: 'moderation', admin: 'system' }[role] || 'dashboard';
}

// ========================= 4. THÔNG BÁO / MODAL =========================
let toastTimer;
function toast(message, type = 'success') {
  const box = $('#toast');
  box.textContent = message;
  box.className = `toast show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { box.className = 'toast'; }, 2600);
}

function setMessage(element, message, success = false) {
  element.textContent = message;
  element.classList.toggle('success', success);
}

function openModal(html, wide = false) {
  $('#modalBody').innerHTML = html;
  $('.modal-card').classList.toggle('wide', wide);
  $('#modal').classList.remove('hidden');
  setTimeout(() => $('#modalBody input, #modalBody select, #modalBody textarea')?.focus(), 30);
}
function closeModal() {
  $('#modal').classList.add('hidden');
  $('#modalBody').innerHTML = '';
  $('.modal-card').classList.remove('wide');
}

$('#closeModalBtn').addEventListener('click', closeModal);
$('#modal').addEventListener('click', (event) => {
  if (event.target === $('#modal')) closeModal();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !$('#modal').classList.contains('hidden')) closeModal();
});

// ========================= 5. SPLASH / LANDING / AUTH =========================
function showOnly(screenId) {
  ['splashScreen', 'landingScreen', 'authScreen', 'app'].forEach(id => $('#' + id).classList.add('hidden'));
  $('#' + screenId).classList.remove('hidden');
}

function showLanding() {
  state.currentUser = null;
  state.query = '';
  showOnly('landingScreen');
  history.replaceState(null, '', location.pathname);
}

function showAuth(mode = 'login') {
  showOnly('authScreen');
  switchAuth(mode);
}

function switchAuth(mode) {
  $('#loginForm').classList.toggle('hidden', mode !== 'login');
  $('#registerForm').classList.toggle('hidden', mode !== 'register');
  $('#forgotForm').classList.toggle('hidden', mode !== 'forgot');
  const codes = {
    login: 'SW-03 • Login',
    register: 'SW-04 • Register',
    forgot: 'SW-05 • Forgot Password'
  };
  $('#authScreenCode').textContent = codes[mode];
  ['loginMessage', 'registerMessage', 'forgotMessage'].forEach(id => setMessage($('#' + id), ''));
}

$$('[data-action="home"]').forEach(btn => btn.addEventListener('click', showLanding));
$('#startFreeBtn').addEventListener('click', () => showAuth('register'));
$('#landingLoginBtn').addEventListener('click', () => showAuth('login'));
$$('[data-auth]').forEach(btn => btn.addEventListener('click', () => switchAuth(btn.dataset.auth)));

$$('[data-info]').forEach(btn => btn.addEventListener('click', () => {
  const type = btn.dataset.info;
  const info = {
    features: ['Tính năng SpendWise', 'Theo dõi giao dịch, mục tiêu tiết kiệm, thông báo, hồ sơ, cài đặt và 3 trải nghiệm AI mô phỏng.'],
    how: ['Cách hoạt động', 'Đăng ký → nhập dữ liệu của chính bạn → xem thống kê → dùng AI mô phỏng → dữ liệu được lưu bằng LocalStorage.'],
    coach: ['Dành cho Coach', 'Coach có thể quản lý khách hàng, review ngân sách và tài nguyên giáo dục. Tất cả đều có thêm, sửa và xóa.']
  }[type];
  openModal(`<h2 id="modalTitle">${info[0]}</h2><p class="muted">${info[1]}</p><div class="modal-actions"><button class="btn btn-primary" onclick="closeModal()">Đã hiểu</button></div>`);
}));

// ========================= 6. ĐĂNG KÝ / ĐĂNG NHẬP / QUÊN MẬT KHẨU =========================
$('#registerForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const name = $('#registerName').value.trim();
  const email = $('#registerEmail').value.trim().toLowerCase();
  const password = $('#registerPassword').value;
  const confirmPassword = $('#registerConfirm').value;
  const role = $('#registerRole').value;
  const message = $('#registerMessage');

  if (name.length < 2) return setMessage(message, 'Họ và tên phải có ít nhất 2 ký tự.');
  if (!/^\S+@\S+\.\S+$/.test(email)) return setMessage(message, 'Email chưa đúng định dạng.');
  if (password.length < 6) return setMessage(message, 'Mật khẩu phải có ít nhất 6 ký tự.');
  if (password !== confirmPassword) return setMessage(message, 'Mật khẩu nhập lại không khớp.');

  const users = getUsers();
  if (users.some(user => user.email === email)) {
    return setMessage(message, 'Email này đã được đăng ký. Hãy dùng email khác hoặc đăng nhập.');
  }

  const user = {
    id: uid(),
    name,
    email,
    password, // Chỉ dùng cho BTL Frontend. Website thật phải hash mật khẩu ở server.
    role,
    status: 'active',
    phone: '',
    timezone: 'GMT+7 • Việt Nam',
    createdAt: nowISO()
  };

  users.push(user);
  saveUsers(users);
  initializeUserStorage(user);
  $('#registerForm').reset();
  setMessage(message, 'Đăng ký thành công. Bạn có thể đăng nhập ngay.', true);
  toast('Đăng ký thành công!');
  setTimeout(() => {
    switchAuth('login');
    $('#loginEmail').value = email;
  }, 700);
});

$('#loginForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const email = $('#loginEmail').value.trim().toLowerCase();
  const password = $('#loginPassword').value;
  const message = $('#loginMessage');
  const user = getUsers().find(item => item.email === email);

  if (!user) return setMessage(message, 'Không tìm thấy tài khoản với email này.');
  if (user.status === 'disabled') return setMessage(message, 'Tài khoản đã bị vô hiệu hóa. Hãy liên hệ Admin.');
  if (user.password !== password) return setMessage(message, 'Mật khẩu không đúng. Vui lòng thử lại.');

  state.currentUser = user;
  writeJSON(KEYS.session, { userId: user.id });
  initializeUserStorage(user);
  setMessage(message, 'Đăng nhập thành công.', true);
  toast('Đăng nhập thành công!');
  enterApp(defaultRouteForRole(user.role));
});

$('#forgotForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const email = $('#forgotEmail').value.trim().toLowerCase();
  const message = $('#forgotMessage');
  const user = getUsers().find(item => item.email === email);
  if (!user) return setMessage(message, 'Email này chưa có tài khoản trong SpendWise.');

  setMessage(message, '✓ Email hợp lệ. Bản Frontend sẽ mở bước đặt lại mật khẩu.', true);
  openResetPasswordModal(user.id);
});

function openResetPasswordModal(userId) {
  openModal(`
    <h2 id="modalTitle">Đặt lại mật khẩu</h2>
    <form id="resetPasswordForm" class="form-grid">
      <div class="form-group full">
        <label>Mật khẩu mới</label>
        <input id="newPassword" type="password" minlength="6" required />
      </div>
      <div class="form-group full">
        <label>Nhập lại mật khẩu mới</label>
        <input id="newPasswordConfirm" type="password" minlength="6" required />
      </div>
      <p id="resetMessage" class="form-message form-group full"></p>
      <div class="modal-actions form-group full">
        <button class="btn btn-outline" type="button" onclick="closeModal()">Hủy</button>
        <button class="btn btn-primary" type="submit">Lưu mật khẩu</button>
      </div>
    </form>`);

  $('#resetPasswordForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const pass = $('#newPassword').value;
    const confirm = $('#newPasswordConfirm').value;
    if (pass.length < 6) return setMessage($('#resetMessage'), 'Mật khẩu phải có ít nhất 6 ký tự.');
    if (pass !== confirm) return setMessage($('#resetMessage'), 'Hai mật khẩu không giống nhau.');
    const users = getUsers();
    const index = users.findIndex(user => user.id === userId);
    if (index < 0) return setMessage($('#resetMessage'), 'Không còn tìm thấy tài khoản.');
    users[index].password = pass;
    saveUsers(users);
    closeModal();
    toast('Đã đặt lại mật khẩu.');
    switchAuth('login');
  });
}

// ========================= 7. KHỞI TẠO DỮ LIỆU RỖNG CHO TÀI KHOẢN =========================
function initializeUserStorage(user = state.currentUser) {
  if (!user) return;
  const old = state.currentUser;
  state.currentUser = user;
  const defaults = {
    transactions: [], goals: [], insights: [], notifications: [],
    clients: [], reviews: [], resources: [], moderation: [], templates: [], feedback: [],
    categories: [], services: [],
    settings: {
      theme: 'light', currency: 'VND', timezone: 'GMT+7', twoFA: false,
      budgetNotifications: true, weeklyReport: false
    }
  };
  Object.entries(defaults).forEach(([name, value]) => {
    if (localStorage.getItem(userKey(name)) === null) save(name, value);
  });
  state.currentUser = old || user;
}

function addNotification(text, type = 'Cập nhật') {
  const notifications = load('notifications', []);
  notifications.unshift({ id: uid(), text, type, date: nowISO(), read: false, status: 'Hoàn tất' });
  save('notifications', notifications);
}

// ========================= 8. ROUTER / ROLE =========================
function enterApp(route) {
  showOnly('app');
  applySettingsTheme();
  renderSidebar();
  navigate(route, false);
}

function renderSidebar() {
  const role = state.currentUser.role;
  $('#sidebarRole').textContent = ROLE_NAMES[role];
  $('#sidebarNav').innerHTML = NAV_BY_ROLE[role].map(([route, label]) =>
    `<button type="button" data-route="${route}">${escapeHtml(label)}</button>`
  ).join('');

  $$('#sidebarNav [data-route]').forEach(button => button.addEventListener('click', () => {
    navigate(button.dataset.route);
    $('#sidebar').classList.remove('open');
  }));

  updateAvatar();
}

function updateAvatar() {
  const initials = state.currentUser.name
    .split(/\s+/).filter(Boolean).slice(-2).map(part => part[0]?.toUpperCase()).join('') || ROLE_NAMES[state.currentUser.role].slice(0,2);
  $('#avatarButton').textContent = initials.slice(0, 2);
}

function navigate(route, pushHash = true) {
  state.query = '';
  state.statusFilter = 'all';
  $('#globalSearch').value = '';
  state.route = route;

  if (!ROUTE_META[route]) {
    render404();
    return;
  }

  const allowedRoutes = NAV_BY_ROLE[state.currentUser.role].map(item => item[0]);
  if (!allowedRoutes.includes(route)) {
    render403();
    return;
  }

  if (pushHash) history.replaceState(null, '', `#${route}`);
  const [title, code] = ROUTE_META[route];
  $('#pageTitle').textContent = title;
  $('#currentScreenCode').textContent = code;
  $$('#sidebarNav [data-route]').forEach(btn => btn.classList.toggle('active', btn.dataset.route === route));
  ROUTE_RENDERERS[route]();
  $('#content').focus({ preventScroll: true });
}

function render403() {
  $('#pageTitle').textContent = '403';
  $('#currentScreenCode').textContent = 'SW-21 • 403 Forbidden';
  $('#content').innerHTML = `
    <div class="error-page">
      <div class="error-copy">
        <div class="code danger">403</div>
        <h2>Bạn không có quyền truy cập</h2>
        <p>Tài khoản hiện tại không được phép mở màn hình này. Hãy quay lại hoặc liên hệ quản trị viên.</p>
        <button class="btn btn-primary" onclick="navigate('${defaultRouteForRole(state.currentUser.role)}')">← Quay lại dashboard</button>
      </div>
      <div class="error-art-403">!</div>
    </div>`;
}

function render404() {
  $('#pageTitle').textContent = '404';
  $('#currentScreenCode').textContent = 'SW-22 • 404 Not Found';
  $('#content').innerHTML = `
    <div class="error-page">
      <div class="error-copy">
        <div class="code">404</div>
        <h2>Không tìm thấy trang</h2>
        <p>Đường dẫn có thể đã thay đổi hoặc không còn tồn tại. Đừng lo, dữ liệu tài chính của bạn vẫn an toàn.</p>
        <button class="btn btn-primary" onclick="navigate('${defaultRouteForRole(state.currentUser.role)}')">Về trang chủ</button>
      </div>
      <div class="error-art-404"></div>
    </div>`;
}

window.navigate = navigate;

// ========================= 9. COMPONENT HTML DÙNG LẠI =========================
function statCard(value, label) {
  return `<div class="stat-card"><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></div>`;
}
function statsGrid(items) {
  return `<div class="stats-grid">${items.map(([value, label]) => statCard(value, label)).join('')}</div>`;
}
function statusClass(status = '') {
  const s = normalize(status);
  if (s.includes('tu choi') || s.includes('vo hieu') || s.includes('can sua')) return 'rejected';
  if (s.includes('cho') || s.includes('dang xu ly') || s.includes('theo doi')) return 'pending';
  if (s.includes('nhap') || s.includes('inactive')) return 'neutral';
  return '';
}
function statusPill(status) {
  return `<span class="status-pill ${statusClass(status)}">${escapeHtml(status || 'Hoàn tất')}</span>`;
}
function panelHeader(title, addLabel, addAction, statusOptions = true, extra = '') {
  return `<div class="panel-header">
    <h2>${escapeHtml(title)}</h2>
    <div class="panel-tools">
      ${extra}
      ${statusOptions ? `<select id="pageStatusFilter" class="filter-select">
        <option value="all">Tất cả trạng thái</option>
        <option value="Hoàn tất">Hoàn tất</option>
        <option value="Chờ duyệt">Chờ duyệt</option>
        <option value="Từ chối">Từ chối</option>
      </select>` : ''}
      ${addLabel ? `<button class="btn btn-primary" type="button" onclick="${addAction}">+ ${escapeHtml(addLabel)}</button>` : ''}
    </div>
  </div>`;
}
function emptyState(title, text, buttonLabel = '', onclick = '') {
  return `<div class="empty-state"><div class="empty-state-inner">
    <div class="empty-state-icon">◇</div>
    <h3>${escapeHtml(title)}</h3>
    <p>${escapeHtml(text)}</p>
    ${buttonLabel ? `<button class="btn btn-primary" onclick="${onclick}">${escapeHtml(buttonLabel)}</button>` : ''}
  </div></div>`;
}
function applyPageFilter(items, fields, statusField = 'status') {
  const q = normalize(state.query);
  return items.filter(item => {
    const matchesSearch = !q || fields.some(field => normalize(item[field] ?? '').includes(q));
    const matchesStatus = state.statusFilter === 'all' || item[statusField] === state.statusFilter;
    return matchesSearch && matchesStatus;
  });
}
function wireStatusFilter() {
  const select = $('#pageStatusFilter');
  if (!select) return;
  select.value = state.statusFilter;
  select.addEventListener('change', () => {
    state.statusFilter = select.value;
    ROUTE_RENDERERS[state.route]?.();
  });
}
function actionButtons(editCall, deleteCall, extra = '') {
  return `<div class="actions-cell">${extra}<button class="icon-action" onclick="${editCall}">Sửa</button><button class="icon-action danger" onclick="${deleteCall}">Xóa</button></div>`;
}
function confirmDelete(message, callback) {
  openModal(`<h2 id="modalTitle">Xác nhận xóa</h2><p class="muted">${escapeHtml(message)}</p>
    <div class="modal-actions"><button class="btn btn-outline" onclick="closeModal()">Hủy</button><button id="confirmDeleteBtn" class="btn btn-danger">Xóa</button></div>`);
  $('#confirmDeleteBtn').addEventListener('click', () => { closeModal(); callback(); });
}
window.closeModal = closeModal;

// ========================= 10. USER - DASHBOARD =========================
function calculateFinance() {
  const tx = load('transactions');
  const income = tx.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
  const expense = tx.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
  const balance = income - expense;
  const budgetProgress = income > 0 ? Math.min(100, Math.round((expense / income) * 100)) : 0;
  return { tx, income, expense, balance, budgetProgress };
}

function renderDashboard() {
  const { expense, balance, budgetProgress } = calculateFinance();
  const insights = applyPageFilter(load('insights'), ['finding', 'detail', 'impact']);
  const previousComparison = expense === 0 ? '0%' : `${budgetProgress > 70 ? '+' : '-'}${Math.abs(budgetProgress - 70)}%`;

  $('#content').innerHTML = `
    ${statsGrid([
      [shortMoney(expense), 'Đã chi tiêu'],
      [shortMoney(balance), 'Còn lại'],
      [`${budgetProgress}%`, 'Tiến độ ngân sách'],
      [previousComparison, 'So với mốc 70%']
    ])}
    <section class="panel">
      ${panelHeader('AI Spending Pattern Insight', 'Phân tích mới', 'openSpendingInsightModal()')}
      ${insights.length ? `<div class="table-wrap"><table class="data-table">
        <thead><tr><th>Phát hiện</th><th>Chi tiết</th><th>Tác động</th><th>Trạng thái</th><th></th></tr></thead>
        <tbody>${insights.map(i => `<tr>
          <td>${escapeHtml(i.finding)}</td><td>${escapeHtml(i.detail)}</td><td>${escapeHtml(i.impact)}</td><td>${statusPill(i.status)}</td>
          <td>${actionButtons(`editInsight('${i.id}')`, `deleteInsight('${i.id}')`)}</td>
        </tr>`).join('')}</tbody></table></div>` : emptyState('Chưa có insight', 'Nhập giao dịch của bạn rồi dùng AI Spending Pattern Insight để tạo phân tích.', 'Phân tích ngay', 'openSpendingInsightModal()')}
    </section>`;
  wireStatusFilter();
}

window.openSpendingInsightModal = function() {
  const expenses = load('transactions').filter(t => t.type === 'expense');
  openModal(`<h2 id="modalTitle">AI Spending Pattern Insight</h2>
    <p class="muted">AI mô phỏng sẽ đọc các giao dịch chi tiêu bạn đã tự nhập trong trình duyệt.</p>
    <div id="aiInsightResult" class="ai-box">Nhấn “Phân tích” để bắt đầu.</div>
    <div class="modal-actions"><button class="btn btn-outline" onclick="closeModal()">Đóng</button><button id="runInsightBtn" class="btn btn-primary">Phân tích</button></div>`);

  $('#runInsightBtn').addEventListener('click', async () => {
    const result = $('#aiInsightResult');
    if (!expenses.length) {
      result.innerHTML = `<strong>Không đủ dữ liệu để đưa ra đề xuất.</strong><p class="muted">Hãy thêm ít nhất một giao dịch chi tiêu rồi thử lại.</p>`;
      return;
    }
    result.innerHTML = `<div class="ai-loader"><i></i><i></i><i></i> AI đang phân tích dữ liệu...</div>`;
    $('#runInsightBtn').disabled = true;
    await sleep(700);

    const byCategory = {};
    expenses.forEach(t => byCategory[t.category || 'Chưa phân loại'] = (byCategory[t.category || 'Chưa phân loại'] || 0) + Number(t.amount));
    const [category, amount] = Object.entries(byCategory).sort((a,b) => b[1] - a[1])[0];
    const total = expenses.reduce((sum,t) => sum + Number(t.amount),0);
    const percent = total ? Math.round(amount / total * 100) : 0;
    const candidate = {
      finding: `Chi tiêu tập trung vào ${category}`,
      detail: `${percent}% tổng chi tiêu hiện tại`,
      impact: `-${formatMoney(amount)}`,
      reason: `Danh mục “${category}” có tổng giá trị lớn nhất trong ${expenses.length} giao dịch chi tiêu bạn đã nhập.`
    };
    result.innerHTML = `<strong>${escapeHtml(candidate.finding)}</strong><p>${escapeHtml(candidate.detail)} • ${escapeHtml(candidate.impact)}</p><p class="muted"><b>Vì sao?</b> ${escapeHtml(candidate.reason)}</p>`;
    $('.modal-actions').innerHTML = `
      <button class="btn btn-outline" id="rejectInsightBtn">Từ chối</button>
      <button class="btn btn-outline" id="rerunInsightBtn">Tạo lại</button>
      <button class="btn btn-primary" id="saveInsightBtn">Chấp nhận & lưu</button>`;

    $('#saveInsightBtn').onclick = () => {
      const items = load('insights');
      items.unshift({ id: uid(), ...candidate, status: 'Hoàn tất', createdAt: nowISO() });
      save('insights', items); addNotification('AI đã tạo một Spending Pattern Insight mới.', 'AI');
      closeModal(); renderDashboard(); toast('Đã lưu insight.');
    };
    $('#rejectInsightBtn').onclick = () => {
      const items = load('insights');
      items.unshift({ id: uid(), ...candidate, status: 'Từ chối', createdAt: nowISO() });
      save('insights', items); closeModal(); renderDashboard(); toast('Đã lưu trạng thái từ chối.', 'warning');
    };
    $('#rerunInsightBtn').onclick = () => { closeModal(); window.openSpendingInsightModal(); };
  });
};

window.editInsight = function(id) {
  const items = load('insights'); const item = items.find(x => x.id === id); if (!item) return;
  openSimpleEdit('Sửa insight', [
    ['finding','Phát hiện',item.finding], ['detail','Chi tiết',item.detail], ['impact','Tác động',item.impact]
  ], values => { Object.assign(item, values); save('insights', items); renderDashboard(); toast('Đã sửa insight.'); });
};
window.deleteInsight = id => confirmDelete('Bạn muốn xóa insight này?', () => { save('insights', load('insights').filter(x => x.id !== id)); renderDashboard(); toast('Đã xóa insight.'); });

// ========================= 11. USER - TRANSACTIONS =========================
function renderTransactions() {
  const { tx, expense } = calculateFinance();
  const food = tx.filter(t => t.type === 'expense' && normalize(t.category).includes('an')).reduce((s,t)=>s+Number(t.amount),0);
  const categorized = tx.length ? Math.round(tx.filter(t => t.category?.trim()).length / tx.length * 100) : 0;
  const items = applyPageFilter(tx, ['description','category','type','date']);

  $('#content').innerHTML = `
    ${statsGrid([[String(tx.length),'Giao dịch'],[shortMoney(expense),'Tổng chi'],[shortMoney(food),'Ăn uống'],[`${categorized}%`,'Đã phân loại']])}
    <section class="panel">
      ${panelHeader('Giao dịch gần đây • AI Categorizer', 'Thêm mới', 'openTransactionModal()')}
      ${items.length ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>Mô tả</th><th>Danh mục</th><th>Số tiền</th><th>Ngày</th><th>Trạng thái</th><th></th></tr></thead><tbody>
        ${items.map(t => `<tr><td>${escapeHtml(t.description)}</td><td>${escapeHtml(t.category || 'Chưa phân loại')}</td><td class="${t.type==='income'?'positive':'negative'}">${t.type==='income'?'+':'-'}${formatMoney(t.amount)}</td><td>${formatDate(t.date)}</td><td>${statusPill(t.status)}</td><td>${actionButtons(`openTransactionModal('${t.id}')`,`deleteTransaction('${t.id}')`)}</td></tr>`).join('')}
      </tbody></table></div>` : emptyState('Chưa có giao dịch', 'Trang này không dùng dữ liệu cố định. Hãy tự nhập giao dịch đầu tiên của bạn.', 'Thêm giao dịch', 'openTransactionModal()')}
    </section>`;
  wireStatusFilter();
}

window.openTransactionModal = function(id = '') {
  const transactions = load('transactions');
  const item = transactions.find(t => t.id === id) || { type:'expense', date:todayISO(), status:'Hoàn tất' };
  const categories = [...new Set(transactions.map(t=>t.category).filter(Boolean))];
  openModal(`<h2 id="modalTitle">${id ? 'Sửa' : 'Thêm'} giao dịch</h2>
    <form id="transactionForm" class="form-grid">
      <div class="form-group"><label>Loại giao dịch</label><select id="txType"><option value="expense">Chi tiêu</option><option value="income">Thu nhập</option></select></div>
      <div class="form-group"><label>Ngày</label><input id="txDate" type="date" value="${escapeHtml(item.date || todayISO())}" required></div>
      <div class="form-group full"><label>Mô tả</label><input id="txDescription" value="${escapeHtml(item.description || '')}" placeholder="Ví dụ: Cà phê sáng" required></div>
      <div class="form-group"><label>Danh mục</label><input id="txCategory" list="categorySuggestions" value="${escapeHtml(item.category || '')}" placeholder="Tự nhập hoặc dùng AI"><datalist id="categorySuggestions">${categories.map(c=>`<option value="${escapeHtml(c)}">`).join('')}</datalist></div>
      <div class="form-group"><label>Số tiền</label><input id="txAmount" type="number" min="1" value="${item.amount || ''}" required></div>
      <div class="form-group"><label>Trạng thái</label><select id="txStatus"><option>Hoàn tất</option><option>Chờ duyệt</option><option>Từ chối</option></select></div>
      <div class="form-group"><label>AI phân loại</label><button id="categorizeBtn" class="btn btn-outline" type="button">Gợi ý danh mục</button></div>
      <div id="categorizeResult" class="ai-box form-group full hidden"></div>
      <p id="txMessage" class="form-message form-group full"></p>
      <div class="modal-actions form-group full"><button class="btn btn-outline" type="button" onclick="closeModal()">Hủy</button><button class="btn btn-primary" type="submit">Lưu giao dịch</button></div>
    </form>`);
  $('#txType').value = item.type || 'expense'; $('#txStatus').value = item.status || 'Hoàn tất';

  $('#categorizeBtn').onclick = async () => {
    const description = $('#txDescription').value.trim();
    if (!description) return setMessage($('#txMessage'), 'Hãy nhập mô tả trước khi dùng AI.');
    $('#categorizeResult').classList.remove('hidden');
    $('#categorizeResult').innerHTML = `<div class="ai-loader"><i></i><i></i><i></i> AI đang phân loại...</div>`;
    $('#categorizeBtn').disabled = true;
    await sleep(650);
    const suggestion = suggestCategory(description);
    $('#categorizeResult').innerHTML = `<strong>Gợi ý: ${escapeHtml(suggestion.category)}</strong><p class="muted">${escapeHtml(suggestion.reason)}</p><div class="modal-actions"><button id="acceptCategoryBtn" class="btn btn-primary btn-small" type="button">Chấp nhận</button><button id="rejectCategoryBtn" class="btn btn-outline btn-small" type="button">Từ chối</button></div>`;
    $('#categorizeBtn').disabled = false;
    $('#acceptCategoryBtn').onclick = () => { $('#txCategory').value = suggestion.category; $('#categorizeResult').innerHTML = '<strong>Đã áp dụng gợi ý.</strong>'; };
    $('#rejectCategoryBtn').onclick = () => { $('#categorizeResult').innerHTML = '<span class="muted">Đã từ chối. Bạn có thể tự nhập danh mục.</span>'; };
  };

  $('#transactionForm').onsubmit = (event) => {
    event.preventDefault();
    const obj = {
      id: item.id || uid(), type: $('#txType').value, date: $('#txDate').value,
      description: $('#txDescription').value.trim(), category: $('#txCategory').value.trim(),
      amount: Number($('#txAmount').value), status: $('#txStatus').value, updatedAt: nowISO()
    };
    if (!obj.description) return setMessage($('#txMessage'), 'Mô tả không được để trống.');
    if (!obj.date) return setMessage($('#txMessage'), 'Bạn chưa chọn ngày.');
    if (!obj.amount || obj.amount <= 0) return setMessage($('#txMessage'), 'Số tiền phải lớn hơn 0.');
    if (!obj.category) return setMessage($('#txMessage'), 'Hãy nhập danh mục hoặc dùng AI gợi ý.');
    const index = transactions.findIndex(t => t.id === obj.id);
    if (index >= 0) transactions[index] = obj; else transactions.unshift(obj);
    save('transactions', transactions); addNotification(`${id?'Đã cập nhật':'Đã thêm'} giao dịch “${obj.description}”.`, 'Giao dịch');
    closeModal(); renderTransactions(); toast(id ? 'Đã cập nhật giao dịch.' : 'Đã thêm giao dịch.');
  };
};

function suggestCategory(description) {
  const text = normalize(description);
  const rules = [
    [['cafe','ca phe','tra sua','an','com','pho','bun','nha hang','sieu thi','market'], 'Ăn uống'],
    [['grab','taxi','xang','xe','bus','gui xe'], 'Di chuyển'],
    [['luong','salary','thuong','freelance'], 'Thu nhập'],
    [['game','phim','cinema','netflix','spotify'], 'Giải trí'],
    [['ao','quan','giay','shop','mua'], 'Mua sắm'],
    [['hoc phi','sach','khoa hoc'], 'Học tập'],
    [['dien','nuoc','internet','wifi','nha'], 'Hóa đơn']
  ];
  const hit = rules.find(([keywords]) => keywords.some(k => text.includes(k)));
  return hit ? { category: hit[1], reason: `Mô tả có từ khóa phù hợp với nhóm “${hit[1]}”.` } : { category: 'Khác', reason: 'AI chưa chắc chắn nên gợi ý nhóm “Khác”. Bạn có thể sửa thủ công.' };
}

window.deleteTransaction = id => confirmDelete('Xóa giao dịch này? Dữ liệu đã xóa không thể khôi phục.', () => {
  save('transactions', load('transactions').filter(t => t.id !== id)); renderTransactions(); toast('Đã xóa giao dịch.');
});

// ========================= 12. USER - GOALS =========================
function renderGoals() {
  const goals = load('goals');
  const saved = goals.reduce((s,g)=>s+Number(g.current),0);
  const target = goals.reduce((s,g)=>s+Number(g.target),0);
  const overall = target ? Math.round(saved/target*100) : 0;
  const needThisMonth = goals.reduce((sum,g)=> sum + Math.max(0, Number(g.target)-Number(g.current)),0);
  const items = applyPageFilter(goals, ['name','deadline','coachPlan']);

  $('#content').innerHTML = `
    ${statsGrid([[String(goals.length),'Mục tiêu'],[shortMoney(saved),'Đã tích lũy'],[`${overall}%`,'Tiến độ chung'],[shortMoney(needThisMonth),'Còn cần tích lũy']])}
    <section class="panel">
      ${panelHeader('AI Goal Coach • Lộ trình đề xuất', 'Thêm mới', 'openGoalModal()')}
      ${items.length ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>Mục tiêu</th><th>Tiến độ</th><th>Kỳ hạn</th><th>AI Coach</th><th>Trạng thái</th><th></th></tr></thead><tbody>
      ${items.map(g => { const pct = g.target ? Math.min(100,Math.round(g.current/g.target*100)):0; return `<tr>
        <td>${escapeHtml(g.name)}</td><td>${pct}% <span class="progress-line"><span style="width:${pct}%"></span></span></td><td>${formatDate(g.deadline)}</td><td>${g.coachPlan ? 'Đã có lộ trình' : 'Chưa tạo'}</td><td>${statusPill(g.status)}</td>
        <td class="actions-cell"><button class="icon-action" onclick="openGoalCoach('${g.id}')">AI Coach</button><button class="icon-action" onclick="openContribution('${g.id}')">Góp thêm</button><button class="icon-action" onclick="openGoalModal('${g.id}')">Sửa</button><button class="icon-action danger" onclick="deleteGoal('${g.id}')">Xóa</button></td>
      </tr>`}).join('')}</tbody></table></div>` : emptyState('Chưa có mục tiêu', 'Hãy tự tạo mục tiêu tiết kiệm đầu tiên, sau đó dùng AI Goal Coach để lập lộ trình.', 'Tạo mục tiêu', 'openGoalModal()')}
    </section>`;
  wireStatusFilter();
}

window.openGoalModal = function(id='') {
  const goals = load('goals'); const item = goals.find(g=>g.id===id) || { status:'Hoàn tất' };
  openModal(`<h2 id="modalTitle">${id?'Sửa':'Thêm'} mục tiêu tiết kiệm</h2><form id="goalForm" class="form-grid">
    <div class="form-group full"><label>Tên mục tiêu</label><input id="goalName" value="${escapeHtml(item.name||'')}" placeholder="Ví dụ: Mua laptop" required></div>
    <div class="form-group"><label>Số tiền mục tiêu</label><input id="goalTarget" type="number" min="1" value="${item.target||''}" required></div>
    <div class="form-group"><label>Đã tích lũy</label><input id="goalCurrent" type="number" min="0" value="${item.current||0}" required></div>
    <div class="form-group"><label>Kỳ hạn</label><input id="goalDeadline" type="date" value="${escapeHtml(item.deadline||'')}" required></div>
    <div class="form-group"><label>Trạng thái</label><select id="goalStatus"><option>Hoàn tất</option><option>Chờ duyệt</option><option>Từ chối</option></select></div>
    <p id="goalMessage" class="form-message form-group full"></p>
    <div class="modal-actions form-group full"><button class="btn btn-outline" type="button" onclick="closeModal()">Hủy</button><button class="btn btn-primary">Lưu mục tiêu</button></div>
  </form>`);
  $('#goalStatus').value = item.status || 'Hoàn tất';
  $('#goalForm').onsubmit = event => {
    event.preventDefault();
    const obj = { ...item, id:item.id||uid(), name:$('#goalName').value.trim(), target:Number($('#goalTarget').value), current:Number($('#goalCurrent').value), deadline:$('#goalDeadline').value, status:$('#goalStatus').value };
    if (!obj.name) return setMessage($('#goalMessage'),'Tên mục tiêu không được để trống.');
    if (obj.target <= 0) return setMessage($('#goalMessage'),'Số tiền mục tiêu phải lớn hơn 0.');
    if (obj.current < 0) return setMessage($('#goalMessage'),'Số tiền đã tích lũy không được âm.');
    if (obj.current > obj.target) return setMessage($('#goalMessage'),'Số tiền đã tích lũy không nên lớn hơn mục tiêu.');
    if (!obj.deadline) return setMessage($('#goalMessage'),'Hãy chọn kỳ hạn.');
    const index = goals.findIndex(g=>g.id===obj.id); if(index>=0) goals[index]=obj; else goals.unshift(obj);
    save('goals',goals); addNotification(`${id?'Đã cập nhật':'Đã tạo'} mục tiêu “${obj.name}”.`,'Mục tiêu'); closeModal(); renderGoals(); toast('Đã lưu mục tiêu.');
  };
};
window.deleteGoal = id => confirmDelete('Bạn muốn xóa mục tiêu này?',()=>{save('goals',load('goals').filter(g=>g.id!==id));renderGoals();toast('Đã xóa mục tiêu.');});
window.openContribution = function(id){
  const goals=load('goals'),g=goals.find(x=>x.id===id); if(!g)return;
  openModal(`<h2 id="modalTitle">Góp thêm vào ${escapeHtml(g.name)}</h2><div class="form-group"><label>Số tiền góp thêm</label><input id="contributionAmount" type="number" min="1"></div><p id="contributionMessage" class="form-message"></p><div class="modal-actions"><button class="btn btn-outline" onclick="closeModal()">Hủy</button><button id="saveContributionBtn" class="btn btn-primary">Lưu</button></div>`);
  $('#saveContributionBtn').onclick=()=>{const amount=Number($('#contributionAmount').value);if(!amount||amount<=0)return setMessage($('#contributionMessage'),'Số tiền phải lớn hơn 0.');g.current=Math.min(Number(g.target),Number(g.current)+amount);save('goals',goals);addNotification(`Bạn đã góp thêm ${formatMoney(amount)} vào mục tiêu “${g.name}”.`,'Mục tiêu');closeModal();renderGoals();toast('Đã cập nhật tiến độ.');};
};
window.openGoalCoach = function(id){
  const goals=load('goals'),g=goals.find(x=>x.id===id);if(!g)return;
  openModal(`<h2 id="modalTitle">AI Goal Coach</h2><p class="muted">Mục tiêu: <b>${escapeHtml(g.name)}</b></p><div id="goalCoachResult" class="ai-box"><div class="ai-loader"><i></i><i></i><i></i> AI đang tạo lộ trình...</div></div><div class="modal-actions"><button class="btn btn-outline" onclick="closeModal()">Đóng</button></div>`);
  setTimeout(()=>{
    const remain=Math.max(0,Number(g.target)-Number(g.current));
    const deadline=new Date(`${g.deadline}T00:00:00`); const now=new Date();
    const months=Math.max(1,Math.ceil((deadline-now)/(1000*60*60*24*30)));
    const monthly=Math.ceil(remain/months);
    const plan=`Còn ${formatMoney(remain)} trong khoảng ${months} tháng. Mức góp gợi ý: khoảng ${formatMoney(monthly)}/tháng.`;
    $('#goalCoachResult').innerHTML=`<strong>Lộ trình đề xuất</strong><p>${escapeHtml(plan)}</p><p class="muted"><b>Vì sao?</b> AI lấy số tiền còn thiếu chia cho số tháng còn lại đến kỳ hạn. Đây là gợi ý giáo dục, không phải tư vấn đầu tư.</p>`;
    $('.modal-actions').innerHTML=`<button id="rejectGoalCoach" class="btn btn-outline">Từ chối</button><button id="regenerateGoalCoach" class="btn btn-outline">Tạo lại</button><button id="acceptGoalCoach" class="btn btn-primary">Chấp nhận & lưu</button>`;
    $('#acceptGoalCoach').onclick=()=>{g.coachPlan=plan;save('goals',goals);closeModal();renderGoals();toast('Đã lưu lộ trình AI.');};
    $('#rejectGoalCoach').onclick=()=>{closeModal();toast('Đã từ chối gợi ý AI.','warning');};
    $('#regenerateGoalCoach').onclick=()=>{closeModal();window.openGoalCoach(id);};
  },700);
};

// ========================= 13. COACH =========================
function renderClients(){
  const clients=applyPageFilter(load('clients'),['name','plan','lastReview']);
  const all=load('clients'); const need=all.filter(c=>c.status==='Chờ duyệt').length; const ok=all.length?Math.round(all.filter(c=>c.status==='Hoàn tất').length/all.length*100):0; const alert=all.filter(c=>c.status==='Từ chối').length;
  renderGenericRoleTable({stats:[[String(all.length),'Đang theo dõi'],[String(need),'Cần review'],[`${ok}%`,'Đúng kế hoạch'],[String(alert),'Cảnh báo']],title:'Danh sách khách hàng',addLabel:'Thêm mới',addAction:'openClientModal()',items:clients,headers:['Khách hàng','Kế hoạch','Review gần nhất','Trạng thái',''],row:c=>`<tr><td>${escapeHtml(c.name)}</td><td>${escapeHtml(c.plan)}</td><td>${formatDate(c.lastReview)}</td><td>${statusPill(c.status)}</td><td>${actionButtons(`openClientModal('${c.id}')`,`deleteGeneric('clients','${c.id}','Khách hàng')`)}</td></tr>`,emptyTitle:'Chưa có khách hàng',emptyText:'Coach hãy tự thêm khách hàng để bắt đầu review.',emptyAction:'openClientModal()'});
}
window.openClientModal=(id='')=>openGenericModal('clients','Khách hàng',id,[
  ['name','Tên khách hàng','text',true],['plan','Kế hoạch','text',true],['lastReview','Review gần nhất','date',true],['status','Trạng thái','status',true]
],renderClients);

function renderReviews(){
  const reviews=applyPageFilter(load('reviews'),['client','category','note']); const all=load('reviews');
  const totalIncome=all.reduce((s,r)=>s+Number(r.income||0),0),totalExpense=all.reduce((s,r)=>s+Number(r.expense||0),0),surplus=totalIncome-totalExpense;
  renderGenericRoleTable({stats:[[shortMoney(totalIncome),'Thu nhập'],[shortMoney(totalExpense),'Chi tiêu'],[shortMoney(surplus),'Thặng dư'],[all.length?'B+':'—','Sức khỏe tài chính']],title:'Phân bổ & ghi chú Coach',addLabel:'Thêm mới',addAction:'openReviewModal()',items:reviews,headers:['Khách hàng','Hạng mục','Thực tế / Kế hoạch','Nhận xét','Trạng thái',''],row:r=>`<tr><td>${escapeHtml(r.client)}</td><td>${escapeHtml(r.category)}</td><td>${escapeHtml(r.actual)} / ${escapeHtml(r.plan)}</td><td>${escapeHtml(r.note)}</td><td>${statusPill(r.status)}</td><td>${actionButtons(`openReviewModal('${r.id}')`,`deleteGeneric('reviews','${r.id}','Review')`)}</td></tr>`,emptyTitle:'Chưa có review',emptyText:'Tạo review ngân sách đầu tiên cho khách hàng.',emptyAction:'openReviewModal()'});
}
window.openReviewModal=(id='')=>openGenericModal('reviews','Review ngân sách',id,[
  ['client','Khách hàng','text',true],['category','Hạng mục','text',true],['actual','Thực tế','text',true],['plan','Kế hoạch','text',true],['income','Thu nhập','number',false],['expense','Chi tiêu','number',false],['note','Nhận xét','textarea',true],['status','Trạng thái','status',true]
],renderReviews);

function renderResources(){
  const resources=applyPageFilter(load('resources'),['title','format','description']); const all=load('resources');
  const published=all.filter(r=>r.status==='Hoàn tất').length,draft=all.filter(r=>r.status==='Chờ duyệt').length;
  renderGenericRoleTable({stats:[[String(published),'Đã xuất bản'],[String(draft),'Bản nháp'],[String(all.length),'Tổng tài nguyên'],[all.length?'—':'0','Đánh giá']],title:'Thư viện của tôi',addLabel:'Thêm mới',addAction:'openResourceModal()',items:resources,headers:['Tài nguyên','Định dạng','Cập nhật','Trạng thái',''],row:r=>`<tr><td>${escapeHtml(r.title)}</td><td>${escapeHtml(r.format)}</td><td>${formatDate(r.updated)}</td><td>${statusPill(r.status)}</td><td>${actionButtons(`openResourceModal('${r.id}')`,`deleteGeneric('resources','${r.id}','Tài nguyên')`)}</td></tr>`,emptyTitle:'Thư viện đang trống',emptyText:'Tạo tài nguyên giáo dục đầu tiên của bạn.',emptyAction:'openResourceModal()'});
}
window.openResourceModal=(id='')=>openGenericModal('resources','Tài nguyên',id,[
  ['title','Tên tài nguyên','text',true],['format','Định dạng','text',true],['updated','Ngày cập nhật','date',true],['description','Mô tả','textarea',false],['status','Trạng thái','status',true]
],renderResources);

// ========================= 14. MODERATOR =========================
function renderModeration(){
  const items=applyPageFilter(load('moderation'),['title','author','submitted']); const all=load('moderation');
  renderGenericRoleTable({stats:[[String(all.filter(x=>x.status==='Chờ duyệt').length),'Chờ duyệt'],[String(all.filter(x=>x.status==='Hoàn tất').length),'Đã duyệt'],[String(all.filter(x=>x.status==='Từ chối').length),'Cần sửa'],[all.length?'100%':'0%','SLA đúng hạn']],title:'Hàng đợi kiểm duyệt',addLabel:'Thêm mới',addAction:'openModerationModal()',items,headers:['Tài nguyên','Tác giả','Nộp lúc','Trạng thái',''],row:x=>`<tr><td>${escapeHtml(x.title)}</td><td>${escapeHtml(x.author)}</td><td>${escapeHtml(x.submitted)}</td><td>${statusPill(x.status)}</td><td class="actions-cell"><button class="icon-action" onclick="setGenericStatus('moderation','${x.id}','Hoàn tất',renderModeration)">Duyệt</button><button class="icon-action danger" onclick="setGenericStatus('moderation','${x.id}','Từ chối',renderModeration)">Từ chối</button><button class="icon-action" onclick="openModerationModal('${x.id}')">Sửa</button><button class="icon-action danger" onclick="deleteGeneric('moderation','${x.id}','Mục kiểm duyệt')">Xóa</button></td></tr>`,emptyTitle:'Không có tài nguyên chờ duyệt',emptyText:'Bạn có thể thêm dữ liệu kiểm duyệt để thử luồng Moderator.',emptyAction:'openModerationModal()'});
}
window.openModerationModal=(id='')=>openGenericModal('moderation','Tài nguyên kiểm duyệt',id,[['title','Tài nguyên','text',true],['author','Tác giả','text',true],['submitted','Nộp lúc','text',true],['status','Trạng thái','status',true]],renderModeration,'Chờ duyệt');

function renderTemplates(){
  const items=applyPageFilter(load('templates'),['title','version','model']); const all=load('templates');
  renderGenericRoleTable({stats:[[String(all.filter(x=>x.status==='Hoàn tất').length),'Template active'],[String(all.filter(x=>x.model?.includes('A/B')).length),'Thử nghiệm'],[all.length?'100%':'0%','Phản hồi hợp lệ'],[all.length?'1,4s':'0s','Độ trễ TB']],title:'Quản lý prompt & guardrail',addLabel:'Thêm mới',addAction:'openTemplateModal()',items,headers:['Template','Phiên bản','Mô hình','Trạng thái',''],row:x=>`<tr><td>${escapeHtml(x.title)}</td><td>${escapeHtml(x.version)}</td><td>${escapeHtml(x.model)}</td><td>${statusPill(x.status)}</td><td>${actionButtons(`openTemplateModal('${x.id}')`,`deleteGeneric('templates','${x.id}','Template')`)}</td></tr>`,emptyTitle:'Chưa có template AI',emptyText:'Tạo template mô phỏng để quản lý prompt & guardrail.',emptyAction:'openTemplateModal()'});
}
window.openTemplateModal=(id='')=>openGenericModal('templates','Template AI',id,[['title','Tên template','text',true],['version','Phiên bản','text',true],['model','Mô hình / trạng thái thử nghiệm','text',true],['status','Trạng thái','status',true]],renderTemplates);

function renderFeedback(){
  const items=applyPageFilter(load('feedback'),['sender','subject','severity']); const all=load('feedback');
  renderGenericRoleTable({stats:[[String(all.length),'Mới'],[String(all.filter(x=>x.status==='Chờ duyệt').length),'Đang xử lý'],[all.length?'—':'0','CSAT'],[all.length?'—':'0','Thời gian phản hồi']],title:'Feedback cần xử lý',addLabel:'Thêm mới',addAction:'openFeedbackModal()',items,headers:['Người gửi','Chủ đề','Mức độ','Trạng thái',''],row:x=>`<tr><td>${escapeHtml(x.sender)}</td><td>${escapeHtml(x.subject)}</td><td>${escapeHtml(x.severity)}</td><td>${statusPill(x.status)}</td><td>${actionButtons(`openFeedbackModal('${x.id}')`,`deleteGeneric('feedback','${x.id}','Feedback')`)}</td></tr>`,emptyTitle:'Chưa có feedback',emptyText:'Feedback do bạn tạo hoặc nhập sẽ xuất hiện tại đây.',emptyAction:'openFeedbackModal()'});
}
window.openFeedbackModal=(id='')=>openGenericModal('feedback','Feedback',id,[['sender','Người gửi','text',true],['subject','Chủ đề','text',true],['severity','Mức độ','select:Thấp|Trung bình|Cao',true],['status','Trạng thái','status',true]],renderFeedback,'Chờ duyệt');

// ========================= 15. ADMIN =========================
function renderCategories(){
  const items=applyPageFilter(load('categories'),['name','group','rules']); const all=load('categories');
  renderGenericRoleTable({stats:[[String(all.length),'Danh mục'],[String(new Set(all.map(x=>x.group)).size),'Nhóm chính'],[String(all.filter(x=>x.rules?.trim()).length),'Rule tự động'],[String(all.filter(x=>x.status==='Chờ duyệt').length),'Cần rà soát']],title:'Cấu hình danh mục',addLabel:'Thêm mới',addAction:'openCategoryModal()',items,headers:['Danh mục','Nhóm','Quy tắc AI','Trạng thái',''],row:x=>`<tr><td>${escapeHtml(x.name)}</td><td>${escapeHtml(x.group)}</td><td>${escapeHtml(x.rules)}</td><td>${statusPill(x.status)}</td><td>${actionButtons(`openCategoryModal('${x.id}')`,`deleteGeneric('categories','${x.id}','Danh mục')`)}</td></tr>`,emptyTitle:'Chưa có danh mục',emptyText:'Admin có thể tự tạo danh mục và quy tắc AI.',emptyAction:'openCategoryModal()'});
}
window.openCategoryModal=(id='')=>openGenericModal('categories','Danh mục chi tiêu',id,[['name','Danh mục','text',true],['group','Nhóm','text',true],['rules','Quy tắc AI (từ khóa)','text',false],['status','Trạng thái','status',true]],renderCategories);

function renderUsers(){
  const all=getUsers(); const q=normalize(state.query); const users=all.filter(u=>!q || [u.name,u.email,u.role,u.status].some(v=>normalize(v).includes(q)));
  const usersCount=all.filter(u=>u.role==='user').length,coachCount=all.filter(u=>u.role==='coach').length,modCount=all.filter(u=>u.role==='moderator').length;
  $('#content').innerHTML=`${statsGrid([[String(all.length),'Tài khoản'],[String(usersCount),'User'],[String(coachCount),'Coach'],[String(modCount),'Moderator']])}<section class="panel">${panelHeader('Quản lý truy cập','Thêm mới','openAdminUserModal()',false)}
  ${users.length?`<div class="table-wrap"><table class="data-table"><thead><tr><th>Người dùng</th><th>Email</th><th>Vai trò</th><th>Trạng thái</th><th></th></tr></thead><tbody>${users.map(u=>`<tr><td>${escapeHtml(u.name)}</td><td>${escapeHtml(u.email)}</td><td>${escapeHtml(ROLE_LABELS[u.role])}</td><td>${statusPill(u.status==='disabled'?'Vô hiệu hóa':'Hoàn tất')}</td><td class="actions-cell">${u.id===state.currentUser.id?'<span class="muted">Đang đăng nhập</span>':`<button class="icon-action" onclick="openAdminUserModal('${u.id}')">Sửa</button><button class="icon-action danger" onclick="deleteAdminUser('${u.id}')">Xóa</button>`}</td></tr>`).join('')}</tbody></table></div>`:emptyState('Chưa có tài khoản','Không có tài khoản phù hợp với tìm kiếm hiện tại.')}</section>`;
}
window.openAdminUserModal=function(id=''){
  const users=getUsers(); const item=users.find(u=>u.id===id)||{role:'user',status:'active'};
  openModal(`<h2 id="modalTitle">${id?'Sửa':'Thêm'} tài khoản</h2><form id="adminUserForm" class="form-grid">
    <div class="form-group full"><label>Họ tên</label><input id="adminName" value="${escapeHtml(item.name||'')}" required></div>
    <div class="form-group full"><label>Email</label><input id="adminEmail" type="email" value="${escapeHtml(item.email||'')}" required></div>
    <div class="form-group"><label>Vai trò</label><select id="adminRole"><option value="user">User</option><option value="coach">Coach</option><option value="moderator">Moderator</option><option value="admin">Admin</option></select></div>
    <div class="form-group"><label>Trạng thái</label><select id="adminStatus"><option value="active">Hoạt động</option><option value="disabled">Vô hiệu hóa</option></select></div>
    ${id?'':`<div class="form-group full"><label>Mật khẩu tạm</label><input id="adminPassword" type="password" minlength="6" required></div>`}
    <p id="adminUserMessage" class="form-message form-group full"></p>
    <div class="modal-actions form-group full"><button class="btn btn-outline" type="button" onclick="closeModal()">Hủy</button><button class="btn btn-primary">Lưu</button></div></form>`);
  $('#adminRole').value=item.role;$('#adminStatus').value=item.status||'active';
  $('#adminUserForm').onsubmit=e=>{e.preventDefault();const name=$('#adminName').value.trim(),email=$('#adminEmail').value.trim().toLowerCase(),role=$('#adminRole').value,status=$('#adminStatus').value,password=id?item.password:$('#adminPassword').value;
    if(name.length<2)return setMessage($('#adminUserMessage'),'Tên quá ngắn.');if(!/^\S+@\S+\.\S+$/.test(email))return setMessage($('#adminUserMessage'),'Email chưa đúng.');if(!id&&password.length<6)return setMessage($('#adminUserMessage'),'Mật khẩu ít nhất 6 ký tự.');if(users.some(u=>u.email===email&&u.id!==id))return setMessage($('#adminUserMessage'),'Email đã tồn tại.');
    const obj={...item,id:item.id||uid(),name,email,role,status,password,createdAt:item.createdAt||nowISO(),phone:item.phone||'',timezone:item.timezone||'GMT+7 • Việt Nam'};const index=users.findIndex(u=>u.id===obj.id);if(index>=0)users[index]=obj;else users.push(obj);saveUsers(users);if(!id)initializeUserStorage(obj);closeModal();renderUsers();toast('Đã lưu tài khoản.');};
};
window.deleteAdminUser=id=>confirmDelete('Xóa tài khoản này và quyền truy cập của họ?',()=>{const user=getUsers().find(u=>u.id===id);saveUsers(getUsers().filter(u=>u.id!==id));if(user){Object.keys(localStorage).filter(k=>k.startsWith(`spendwise_${user.id}_`)).forEach(k=>localStorage.removeItem(k));}renderUsers();toast('Đã xóa tài khoản.');});

function renderSystem(){
  const services=applyPageFilter(load('services'),['name','status','load']); const all=load('services'); const users=getUsers();
  renderGenericRoleTable({stats:[['100%','Frontend uptime'],['Local','Độ trễ dữ liệu'],[String(users.filter(u=>u.status!=='disabled').length),'Active users'],['0%','JS error rate']],title:'Sức khỏe dịch vụ',addLabel:'Thêm mới',addAction:'openServiceModal()',items:services,headers:['Dịch vụ','Trạng thái','Tải hiện tại',''],row:x=>`<tr><td>${escapeHtml(x.name)}</td><td>${statusPill(x.status)}</td><td>${escapeHtml(x.load)}</td><td>${actionButtons(`openServiceModal('${x.id}')`,`deleteGeneric('services','${x.id}','Dịch vụ')`)}</td></tr>`,emptyTitle:'Chưa có dịch vụ theo dõi',emptyText:'Admin có thể tự thêm dịch vụ để mô phỏng bảng sức khỏe hệ thống.',emptyAction:'openServiceModal()'});
}
window.openServiceModal=(id='')=>openGenericModal('services','Dịch vụ hệ thống',id,[['name','Tên dịch vụ','text',true],['status','Trạng thái','select:Ổn định|Theo dõi|Từ chối',true],['load','Tải hiện tại','text',true]],renderSystem,'Ổn định');

// ========================= 16. NOTIFICATIONS =========================
function renderNotifications(){
  const all=load('notifications'); const items=applyPageFilter(all,['text','type','date']);
  const unread=all.filter(n=>!n.read).length,budget=all.filter(n=>normalize(n.type).includes('ngan sach')).length,goals=all.filter(n=>normalize(n.type).includes('muc tieu')).length,system=all.length-budget-goals;
  $('#content').innerHTML=`${statsGrid([[String(unread),'Chưa đọc'],[String(budget),'Ngân sách'],[String(goals),'Mục tiêu'],[String(system),'Hệ thống']])}<section class="panel">${panelHeader('Trung tâm thông báo','Thêm mới','openNotificationModal()')}
  ${items.length?`<div class="table-wrap"><table class="data-table"><thead><tr><th>Thông báo</th><th>Loại</th><th>Thời gian</th><th>Trạng thái</th><th></th></tr></thead><tbody>${items.map(n=>`<tr><td>${n.read?'':'<b>• </b>'}${escapeHtml(n.text)}</td><td>${escapeHtml(n.type)}</td><td>${new Date(n.date).toLocaleString('vi-VN')}</td><td>${statusPill(n.read?'Hoàn tất':'Chờ duyệt')}</td><td class="actions-cell"><button class="icon-action" onclick="toggleNotificationRead('${n.id}')">${n.read?'Chưa đọc':'Đã đọc'}</button><button class="icon-action danger" onclick="deleteNotification('${n.id}')">Xóa</button></td></tr>`).join('')}</tbody></table></div>`:emptyState('Chưa có thông báo','Thông báo sẽ được tạo từ các hành động của bạn hoặc bạn có thể thêm thủ công.','Thêm thông báo','openNotificationModal()')}</section>`;wireStatusFilter();
}
window.openNotificationModal=function(){openModal(`<h2 id="modalTitle">Thêm thông báo</h2><form id="notificationForm" class="form-grid"><div class="form-group full"><label>Nội dung</label><input id="notificationText" required></div><div class="form-group full"><label>Loại</label><input id="notificationType" placeholder="Ví dụ: Ngân sách" required></div><p id="notificationMessage" class="form-message form-group full"></p><div class="modal-actions form-group full"><button class="btn btn-outline" type="button" onclick="closeModal()">Hủy</button><button class="btn btn-primary">Lưu</button></div></form>`);$('#notificationForm').onsubmit=e=>{e.preventDefault();const text=$('#notificationText').value.trim(),type=$('#notificationType').value.trim();if(!text||!type)return setMessage($('#notificationMessage'),'Hãy nhập đủ nội dung và loại.');addNotification(text,type);closeModal();renderNotifications();toast('Đã thêm thông báo.');};};
window.toggleNotificationRead=id=>{const a=load('notifications'),n=a.find(x=>x.id===id);if(n)n.read=!n.read;save('notifications',a);renderNotifications();};
window.deleteNotification=id=>confirmDelete('Xóa thông báo này?',()=>{save('notifications',load('notifications').filter(n=>n.id!==id));renderNotifications();toast('Đã xóa thông báo.');});

// ========================= 17. PROFILE =========================
function renderProfile(){
  const u=state.currentUser; const memberDate=new Date(u.createdAt).toLocaleDateString('vi-VN',{month:'2-digit',year:'numeric'});
  $('#content').innerHTML=`${statsGrid([[u.name,'Tên hiển thị'],[ROLE_LABELS[u.role],'Vai trò'],[memberDate,'Thành viên từ'],[u.status==='disabled'?'Vô hiệu hóa':'Đã xác minh','Trạng thái']])}
  <section class="panel">${panelHeader('Thông tin cá nhân','Chỉnh sửa','openProfileModal()',false)}<div class="table-wrap"><table class="data-table"><thead><tr><th>Trường thông tin</th><th>Giá trị</th><th>Quyền riêng tư</th></tr></thead><tbody>
  <tr><td>Email</td><td>${escapeHtml(u.email)}</td><td>Riêng tư</td></tr><tr><td>Số điện thoại</td><td>${escapeHtml(u.phone||'Chưa cập nhật')}</td><td>Riêng tư</td></tr><tr><td>Múi giờ</td><td>${escapeHtml(u.timezone||'GMT+7 • Việt Nam')}</td><td>Công khai</td></tr></tbody></table></div></section>`;
}
window.openProfileModal=function(){const u=state.currentUser;openModal(`<h2 id="modalTitle">Chỉnh sửa hồ sơ</h2><form id="profileForm" class="form-grid"><div class="form-group full"><label>Họ tên</label><input id="profileName" value="${escapeHtml(u.name)}" required></div><div class="form-group"><label>Số điện thoại</label><input id="profilePhone" value="${escapeHtml(u.phone||'')}"></div><div class="form-group"><label>Múi giờ</label><input id="profileTimezone" value="${escapeHtml(u.timezone||'GMT+7 • Việt Nam')}"></div><p id="profileMessage" class="form-message form-group full"></p><div class="modal-actions form-group full"><button class="btn btn-outline" type="button" onclick="closeModal()">Hủy</button><button class="btn btn-primary">Lưu</button></div></form>`);$('#profileForm').onsubmit=e=>{e.preventDefault();const name=$('#profileName').value.trim();if(name.length<2)return setMessage($('#profileMessage'),'Tên quá ngắn.');const users=getUsers(),idx=users.findIndex(x=>x.id===u.id);users[idx]={...users[idx],name,phone:$('#profilePhone').value.trim(),timezone:$('#profileTimezone').value.trim()||'GMT+7 • Việt Nam'};saveUsers(users);state.currentUser=users[idx];updateAvatar();closeModal();renderProfile();toast('Đã cập nhật hồ sơ.');};};

// ========================= 18. SETTINGS + LOGOUT =========================
function renderSettings(){
  const settings=load('settings',{});
  $('#content').innerHTML=`${statsGrid([[settings.theme==='dark'?'Dark':'Light','Giao diện'],[settings.currency||'VND','Tiền tệ'],[settings.timezone||'GMT+7','Múi giờ'],[settings.twoFA?'Bật':'Tắt','2FA']])}
  <div class="two-column-grid">
    <section class="form-panel"><h2>Tùy chọn tài khoản</h2>
      ${settingSwitch('budgetNotifications','Thông báo ngân sách','Nhận cảnh báo ngân sách trong ứng dụng',settings.budgetNotifications)}
      ${settingSwitch('weeklyReport','Báo cáo hàng tuần','Bật/tắt báo cáo mô phỏng',settings.weeklyReport)}
      ${settingSwitch('twoFA','Xác thực hai lớp','Mô phỏng trạng thái OTP Frontend',settings.twoFA)}
      <div class="setting-row"><div><strong>Giao diện</strong><small>Light / Dark</small></div><select id="themeSetting" class="filter-select"><option value="light">Light</option><option value="dark">Dark</option></select></div>
      <div class="setting-row"><div><strong>Tiền tệ</strong><small>Đơn vị hiển thị</small></div><select id="currencySetting" class="filter-select"><option>VND</option><option>USD</option></select></div>
      <div class="setting-row"><div><strong>Múi giờ</strong><small>Múi giờ ưu tiên</small></div><select id="timezoneSetting" class="filter-select"><option>GMT+7</option><option>GMT+0</option><option>GMT+8</option></select></div>
      <div class="modal-actions"><button id="saveSettingsBtn" class="btn btn-primary">Lưu cài đặt</button></div>
    </section>
    <section class="form-panel"><h2>Tài khoản</h2><p class="muted">Bạn đang đăng nhập bằng <b>${escapeHtml(state.currentUser.email)}</b>.</p>
      <div class="danger-zone"><h3>Đăng xuất</h3><p class="muted">Đăng xuất để chuyển sang tài khoản khác. Dữ liệu LocalStorage của tài khoản này vẫn được giữ lại.</p><button class="btn btn-outline" onclick="logout()">Đăng xuất</button></div>
      <div class="danger-zone"><h3>Xóa dữ liệu nghiệp vụ</h3><p class="muted">Xóa giao dịch, mục tiêu và dữ liệu CRUD của riêng tài khoản này. Tài khoản đăng nhập vẫn còn.</p><button class="btn btn-danger-soft" onclick="clearCurrentUserData()">Xóa dữ liệu của tôi</button></div>
    </section>
  </div>`;
  $('#themeSetting').value=settings.theme||'light';$('#currencySetting').value=settings.currency||'VND';$('#timezoneSetting').value=settings.timezone||'GMT+7';
  $('#saveSettingsBtn').onclick=()=>{const next={...settings,theme:$('#themeSetting').value,currency:$('#currencySetting').value,timezone:$('#timezoneSetting').value,budgetNotifications:$('#setting_budgetNotifications').checked,weeklyReport:$('#setting_weeklyReport').checked,twoFA:$('#setting_twoFA').checked};save('settings',next);applySettingsTheme();renderSettings();toast('Đã lưu cài đặt.');};
}
function settingSwitch(id,title,desc,checked){return `<div class="setting-row"><div><strong>${escapeHtml(title)}</strong><small>${escapeHtml(desc)}</small></div><label class="switch"><input id="setting_${id}" type="checkbox" ${checked?'checked':''}><span></span></label></div>`;}
function applySettingsTheme(){if(!state.currentUser)return;const settings=load('settings',{});document.body.classList.toggle('dark',settings.theme==='dark');}
window.logout=function(){localStorage.removeItem(KEYS.session);state.currentUser=null;document.body.classList.remove('dark');$('#loginForm').reset();$('#registerForm').reset();showLanding();toast('Đã đăng xuất.');};
window.clearCurrentUserData=function(){openModal(`<h2 id="modalTitle">Xóa dữ liệu của tôi?</h2><p class="muted">Hành động này sẽ xóa dữ liệu nghiệp vụ nhưng không xóa tài khoản đăng nhập.</p><div class="modal-actions"><button class="btn btn-outline" onclick="closeModal()">Hủy</button><button id="clearDataConfirmBtn" class="btn btn-danger">Xóa dữ liệu</button></div>`);$('#clearDataConfirmBtn').onclick=()=>{['transactions','goals','insights','notifications','clients','reviews','resources','moderation','templates','feedback','categories','services'].forEach(k=>localStorage.removeItem(userKey(k)));initializeUserStorage();closeModal();renderSettings();toast('Đã xóa dữ liệu nghiệp vụ.','warning');};};

// ========================= 19. CRUD GENERIC CHO COACH/MOD/ADMIN =========================
function renderGenericRoleTable({stats,title,addLabel,addAction,items,headers,row,emptyTitle,emptyText,emptyAction}){
  $('#content').innerHTML=`${statsGrid(stats)}<section class="panel">${panelHeader(title,addLabel,addAction)}${items.length?`<div class="table-wrap"><table class="data-table"><thead><tr>${headers.map(h=>`<th>${escapeHtml(h)}</th>`).join('')}</tr></thead><tbody>${items.map(row).join('')}</tbody></table></div>`:emptyState(emptyTitle,emptyText,addLabel,emptyAction)}</section>`;wireStatusFilter();
}
function openGenericModal(store,label,id,fields,onDone,defaultStatus='Hoàn tất'){
  const items=load(store);const item=items.find(x=>x.id===id)||{};
  const controls=fields.map(([key,text,type,required])=>{
    const value=item[key]??(key==='status'?defaultStatus:'');
    let control='';
    if(type==='textarea')control=`<textarea id="field_${key}" ${required?'required':''}>${escapeHtml(value)}</textarea>`;
    else if(type==='status')control=`<select id="field_${key}"><option>Hoàn tất</option><option>Chờ duyệt</option><option>Từ chối</option></select>`;
    else if(type.startsWith('select:'))control=`<select id="field_${key}">${type.slice(7).split('|').map(v=>`<option>${escapeHtml(v)}</option>`).join('')}</select>`;
    else control=`<input id="field_${key}" type="${type}" value="${escapeHtml(value)}" ${required?'required':''}>`;
    return `<div class="form-group ${type==='textarea'?'full':''}"><label>${escapeHtml(text)}</label>${control}</div>`;
  }).join('');
  openModal(`<h2 id="modalTitle">${id?'Sửa':'Thêm'} ${escapeHtml(label)}</h2><form id="genericForm" class="form-grid">${controls}<p id="genericMessage" class="form-message form-group full"></p><div class="modal-actions form-group full"><button class="btn btn-outline" type="button" onclick="closeModal()">Hủy</button><button class="btn btn-primary">Lưu</button></div></form>`);
  fields.forEach(([key,,type])=>{if((type==='status'||type.startsWith('select:'))&&$(`#field_${key}`))$(`#field_${key}`).value=item[key]??(key==='status'?defaultStatus:'');});
  $('#genericForm').onsubmit=e=>{e.preventDefault();const obj={...item,id:item.id||uid()};for(const [key,text,type,required]of fields){let v=$(`#field_${key}`).value;if(type==='number')v=Number(v);else v=v.trim();if(required&&(v===''||v===null))return setMessage($('#genericMessage'),`${text} không được để trống.`);obj[key]=v;}const idx=items.findIndex(x=>x.id===obj.id);if(idx>=0)items[idx]=obj;else items.unshift(obj);save(store,items);closeModal();onDone();toast('Đã lưu dữ liệu.');};
}
window.deleteGeneric=function(store,id,label){confirmDelete(`Bạn muốn xóa ${label.toLowerCase()} này?`,()=>{save(store,load(store).filter(x=>x.id!==id));ROUTE_RENDERERS[state.route]?.();toast('Đã xóa dữ liệu.');});};
window.setGenericStatus=function(store,id,status,renderer){const items=load(store),item=items.find(x=>x.id===id);if(!item)return;item.status=status;save(store,items);renderer();toast(`Đã cập nhật trạng thái: ${status}`);};
function openSimpleEdit(title,fields,onSave){openModal(`<h2 id="modalTitle">${escapeHtml(title)}</h2><form id="simpleEditForm" class="form-grid">${fields.map(([key,label,value])=>`<div class="form-group full"><label>${escapeHtml(label)}</label><input id="simple_${key}" value="${escapeHtml(value)}" required></div>`).join('')}<div class="modal-actions form-group full"><button class="btn btn-outline" type="button" onclick="closeModal()">Hủy</button><button class="btn btn-primary">Lưu</button></div></form>`);$('#simpleEditForm').onsubmit=e=>{e.preventDefault();const values={};for(const[key]of fields)values[key]=$(`#simple_${key}`).value.trim();closeModal();onSave(values);};}

// ========================= 20. GLOBAL SEARCH / MENU / AVATAR =========================
$('#globalSearch').addEventListener('input', (event) => {
  state.query = event.target.value;
  if (ROUTE_RENDERERS[state.route]) ROUTE_RENDERERS[state.route]();
});
$('#menuBtn').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
$('#avatarButton').addEventListener('click', () => navigate('profile'));
$('#sidebarLogoutBtn').addEventListener('click', () => logout());

// ========================= 21. KHỞI ĐỘNG ỨNG DỤNG =========================
function restoreSession() {
  const session = readJSON(KEYS.session, null);
  if (!session?.userId) return false;
  const user = getUsers().find(item => item.id === session.userId && item.status !== 'disabled');
  if (!user) { localStorage.removeItem(KEYS.session); return false; }
  state.currentUser = user;
  initializeUserStorage(user);
  return true;
}

async function boot() {
  showOnly('splashScreen');
  await sleep(900);
  state.splashDone = true;
  if (restoreSession()) {
    const hashRoute = location.hash.replace('#','');
    enterApp(hashRoute || defaultRouteForRole(state.currentUser.role));
  } else {
    showLanding();
  }
}

boot();
