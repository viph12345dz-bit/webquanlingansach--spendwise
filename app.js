const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const money = (n) => Number(n || 0).toLocaleString('vi-VN') + ' ₫';
const today = () => new Date().toISOString().slice(0, 10);

const KEYS = { users:'sw_users', session:'sw_session', theme:'sw_theme' };
const roleNames = { user:'Người dùng', coach:'Huấn luyện viên', moderator:'Kiểm duyệt viên', admin:'Quản trị viên' };
const state = { currentUser:null, currentPage:'dashboard', aiTimer:null };

function getUsers(){ return JSON.parse(localStorage.getItem(KEYS.users) || '[]'); }
function saveUsers(users){ localStorage.setItem(KEYS.users, JSON.stringify(users)); }
function userKey(type){ return `sw_${state.currentUser.username}_${type}`; }
function load(type, fallback=[]){ return JSON.parse(localStorage.getItem(userKey(type)) || JSON.stringify(fallback)); }
function save(type, value){ localStorage.setItem(userKey(type), JSON.stringify(value)); }
function escapeHtml(v=''){ return String(v).replace(/[&<>'"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,7); }

function seedDemo(){
  let users=getUsers();
  if(!users.some(u=>u.username==='demo')){
    users.push({id:uid(),name:'Người dùng Demo',username:'demo',password:'123456',role:'user'}); saveUsers(users);
  }
}
seedDemo();

function initializeUserData(){
  const defaults={
    transactions:[], goals:[], resources:[], coachNotes:[], categories:['Ăn uống','Di chuyển','Mua sắm','Học tập','Giải trí','Hóa đơn','Khác'],
    notifications:[{id:uid(),text:'Chào mừng bạn đến với SpendWise!',read:false,date:today()}], aiHistory:[]
  };
  Object.entries(defaults).forEach(([k,v])=>{ if(localStorage.getItem(userKey(k))===null) save(k,v); });
}

function showMessage(el, text, type='error'){ el.textContent=text; el.className=`form-message ${type}`; }
function toast(text,type='success'){ const t=$('#toast'); t.textContent=text; t.className=`toast show ${type}`; setTimeout(()=>t.className='toast',2600); }

$$('.auth-tab').forEach(btn=>btn.onclick=()=>{
  $$('.auth-tab').forEach(b=>b.classList.remove('active')); btn.classList.add('active');
  $('#loginForm').classList.toggle('hidden',btn.dataset.auth!=='login');
  $('#registerForm').classList.toggle('hidden',btn.dataset.auth!=='register');
});

$('#registerForm').onsubmit=(e)=>{
  e.preventDefault();
  const name=$('#registerName').value.trim(), username=$('#registerUsername').value.trim().toLowerCase();
  const password=$('#registerPassword').value, confirm=$('#registerConfirm').value, role=$('#registerRole').value;
  if(name.length<2) return showMessage($('#registerMessage'),'Họ tên phải có ít nhất 2 ký tự.');
  if(username.length<4) return showMessage($('#registerMessage'),'Tên đăng nhập phải có ít nhất 4 ký tự.');
  if(!/^[a-z0-9_]+$/.test(username)) return showMessage($('#registerMessage'),'Tên đăng nhập chỉ dùng chữ thường, số và dấu _.');
  if(password.length<6) return showMessage($('#registerMessage'),'Mật khẩu phải có ít nhất 6 ký tự.');
  if(password!==confirm) return showMessage($('#registerMessage'),'Mật khẩu nhập lại không khớp.');
  const users=getUsers();
  if(users.some(u=>u.username===username)) return showMessage($('#registerMessage'),'Tên đăng nhập đã tồn tại. Hãy chọn tên khác.');
  users.push({id:uid(),name,username,password,role}); saveUsers(users);
  showMessage($('#registerMessage'),'Đăng ký thành công! Bạn có thể đăng nhập ngay.','success');
  $('#registerForm').reset();
};

$('#loginForm').onsubmit=(e)=>{ e.preventDefault(); login($('#loginUsername').value.trim().toLowerCase(),$('#loginPassword').value); };
$('#demoBtn').onclick=()=>login('demo','123456');
function login(username,password){
  if(!username||!password) return showMessage($('#loginMessage'),'Vui lòng nhập đủ tên đăng nhập và mật khẩu.');
  const user=getUsers().find(u=>u.username===username);
  if(!user) return showMessage($('#loginMessage'),'Tài khoản không tồn tại.');
  if(user.password!==password) return showMessage($('#loginMessage'),'Mật khẩu không đúng.');
  localStorage.setItem(KEYS.session,user.username); state.currentUser=user; initializeUserData(); showApp(); toast('Đăng nhập thành công!');
}

function restoreSession(){
  const username=localStorage.getItem(KEYS.session); if(!username) return;
  const user=getUsers().find(u=>u.username===username); if(!user){localStorage.removeItem(KEYS.session);return;}
  state.currentUser=user; initializeUserData(); showApp();
}

const menus={
  user:[['dashboard','▦','Tổng quan'],['transactions','⇄','Giao dịch'],['goals','◎','Mục tiêu tiết kiệm'],['ai','✦','AI hỗ trợ'],['settings','⚙','Cài đặt']],
  coach:[['dashboard','▦','Tổng quan'],['clients','👥','Khách hàng'],['reviews','📝','Đánh giá ngân sách'],['resources','📚','Tài nguyên'],['settings','⚙','Cài đặt']],
  moderator:[['dashboard','▦','Tổng quan'],['resourceReview','✓','Duyệt tài nguyên'],['templates','✦','Mẫu AI'],['feedback','💬','Phản hồi'],['settings','⚙','Cài đặt']],
  admin:[['dashboard','▦','Tổng quan'],['categories','🏷','Danh mục chi tiêu'],['users','👤','Quản lý tài khoản'],['system','📊','Hệ thống'],['settings','⚙','Cài đặt']]
};

function showApp(){
  $('#authScreen').classList.add('hidden'); $('#app').classList.remove('hidden');
  $('#miniUserName').textContent=state.currentUser.name; $('#miniUserRole').textContent=roleNames[state.currentUser.role];
  $('#avatar').textContent=(state.currentUser.name[0]||'U').toUpperCase();
  buildNav(); state.currentPage='dashboard'; render(); updateNotificationDot();
}
function buildNav(){
  $('#sidebarNav').innerHTML=menus[state.currentUser.role].map(([id,ico,name])=>`<button class="nav-btn ${id==='dashboard'?'active':''}" data-page="${id}"><span>${ico}</span>${name}</button>`).join('');
  $$('.nav-btn').forEach(b=>b.onclick=()=>navigate(b.dataset.page));
}
function navigate(page){ state.currentPage=page; $$('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.page===page)); document.querySelector('.sidebar').classList.remove('open'); render(); }
function render(){
  const titles={dashboard:'Tổng quan',transactions:'Quản lý giao dịch',goals:'Mục tiêu tiết kiệm',ai:'AI hỗ trợ',settings:'Cài đặt',clients:'Danh sách khách hàng',reviews:'Đánh giá ngân sách',resources:'Quản lý tài nguyên',resourceReview:'Duyệt tài nguyên',templates:'Quản lý mẫu AI',feedback:'Trung tâm phản hồi',categories:'Quản lý danh mục',users:'Quản lý người dùng',system:'Bảng điều khiển hệ thống'};
  $('#pageTitle').textContent=titles[state.currentPage]||'SpendWise';
  const renderers={dashboard:renderDashboard,transactions:renderTransactions,goals:renderGoals,ai:renderAI,settings:renderSettings,clients:renderClients,reviews:renderReviews,resources:renderResources,resourceReview:renderResourceReview,templates:renderTemplates,feedback:renderFeedback,categories:renderCategories,users:renderUsers,system:renderSystem};
  (renderers[state.currentPage]||renderDashboard)();
}

function renderDashboard(){
  if(state.currentUser.role!=='user') return renderRoleDashboard();
  const tx=load('transactions'), goals=load('goals');
  const income=tx.filter(x=>x.type==='income').reduce((s,x)=>s+Number(x.amount),0);
  const expense=tx.filter(x=>x.type==='expense').reduce((s,x)=>s+Number(x.amount),0);
  const balance=income-expense;
  const monthData=[0,0,0,0,0,0]; tx.filter(x=>x.type==='expense').forEach(x=>{ const d=new Date(x.date); const diff=(new Date().getMonth()-d.getMonth()+12)%12; if(diff<6) monthData[5-diff]+=Number(x.amount); });
  $('#content').innerHTML=`
    <div class="role-banner"><strong>Xin chào ${escapeHtml(state.currentUser.name)} 👋</strong><div class="muted">Mọi dữ liệu bạn nhập được lưu bằng LocalStorage trên trình duyệt này.</div></div>
    <div class="grid grid-4">
      ${stat('Số dư hiện tại',money(balance),balance>=0?'positive':'negative','Thu nhập - Chi tiêu')}
      ${stat('Tổng thu nhập',money(income),'positive',`${tx.filter(x=>x.type==='income').length} giao dịch`)}
      ${stat('Tổng chi tiêu',money(expense),'negative',`${tx.filter(x=>x.type==='expense').length} giao dịch`)}
      ${stat('Mục tiêu tiết kiệm',String(goals.length),'',`${goals.filter(g=>Number(g.saved)>=Number(g.target)&&g.target>0).length} đã hoàn thành`)}
    </div>
    <div class="grid grid-2" style="margin-top:18px">
      <div class="card"><div class="section-head"><h3>Chi tiêu 6 tháng gần đây</h3><button class="small-btn" onclick="navigate('transactions')">Xem giao dịch</button></div>${bars(monthData)}</div>
      <div class="card"><div class="section-head"><h3>Giao dịch gần đây</h3><button class="small-btn" onclick="openTransactionModal()">+ Thêm mới</button></div>${recentTransactions(tx)}</div>
    </div>
    <div class="card" style="margin-top:18px"><div class="section-head"><h3>Tiến độ mục tiêu</h3><button class="small-btn" onclick="navigate('goals')">Quản lý mục tiêu</button></div>${goalPreview(goals)}</div>`;
}
function stat(label,value,cls='',sub=''){return `<div class="card stat-card"><div class="stat-label">${label}</div><div class="stat-value ${cls}">${value}</div><div class="stat-sub">${sub}</div></div>`}
function bars(data){ const max=Math.max(...data,1); const labels=['T-5','T-4','T-3','T-2','T-1','Tháng này']; return `<div class="chart-bars">${data.map((v,i)=>`<div class="bar-wrap"><div title="${money(v)}" class="bar" style="height:${Math.max(5,(v/max)*180)}px"></div><span class="bar-label">${labels[i]}</span></div>`).join('')}</div>`; }
function recentTransactions(tx){ if(!tx.length)return empty('💸','Chưa có giao dịch','Hãy thêm giao dịch đầu tiên của bạn.'); return `<div class="list">${tx.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5).map(x=>`<div class="list-item"><div><strong>${escapeHtml(x.note||x.category)}</strong><small>${escapeHtml(x.category)} • ${x.date}</small></div><strong class="${x.type==='income'?'positive':'negative'}">${x.type==='income'?'+':'-'}${money(x.amount)}</strong></div>`).join('')}</div>`; }
function goalPreview(goals){ if(!goals.length)return empty('🎯','Chưa có mục tiêu','Tạo mục tiêu để theo dõi tiến độ tiết kiệm.'); return `<div class="grid grid-3">${goals.slice(0,3).map(goalCard).join('')}</div>`; }
function empty(emoji,title,desc){return `<div class="empty"><div class="emoji">${emoji}</div><strong>${title}</strong><p>${desc}</p></div>`}

function renderTransactions(){
  const tx=load('transactions'); const categories=load('categories');
  $('#content').innerHTML=`<div class="card"><div class="section-head"><div><h3>Danh sách giao dịch</h3><div class="muted">Thêm, tìm kiếm, lọc, sửa và xóa giao dịch.</div></div><button class="primary-btn" onclick="openTransactionModal()">+ Thêm giao dịch</button></div>
  <div class="toolbar"><input id="txSearch" placeholder="Tìm theo ghi chú hoặc danh mục"><select id="txType"><option value="all">Tất cả loại</option><option value="income">Thu nhập</option><option value="expense">Chi tiêu</option></select><select id="txCategory"><option value="all">Tất cả danh mục</option>${categories.map(c=>`<option>${escapeHtml(c)}</option>`).join('')}</select></div><div id="txTable"></div></div>`;
  const draw=()=>{ const q=$('#txSearch').value.toLowerCase(),type=$('#txType').value,cat=$('#txCategory').value; const filtered=tx.filter(x=>(x.note+' '+x.category).toLowerCase().includes(q)&&(type==='all'||x.type===type)&&(cat==='all'||x.category===cat)); $('#txTable').innerHTML=transactionTable(filtered); };
  ['#txSearch','#txType','#txCategory'].forEach(s=>$(s).addEventListener('input',draw)); draw();
}
function transactionTable(tx){ if(!tx.length)return empty('🔎','Không có dữ liệu phù hợp','Thử đổi bộ lọc hoặc thêm giao dịch mới.'); return `<div class="table-wrap"><table><thead><tr><th>Ngày</th><th>Loại</th><th>Danh mục</th><th>Ghi chú</th><th>Số tiền</th><th>Thao tác</th></tr></thead><tbody>${tx.slice().sort((a,b)=>b.date.localeCompare(a.date)).map(x=>`<tr><td>${x.date}</td><td><span class="badge ${x.type}">${x.type==='income'?'Thu nhập':'Chi tiêu'}</span></td><td>${escapeHtml(x.category)}</td><td>${escapeHtml(x.note||'—')}</td><td class="${x.type==='income'?'positive':'negative'}">${money(x.amount)}</td><td><div class="actions"><button class="small-btn" onclick="openTransactionModal('${x.id}')">Sửa</button><button class="small-btn" onclick="deleteTransaction('${x.id}')">Xóa</button></div></td></tr>`).join('')}</tbody></table></div>`; }
function openTransactionModal(id=''){
  const tx=load('transactions'), item=tx.find(x=>x.id===id)||{}; const cats=load('categories');
  openModal(`<h3>${id?'Sửa':'Thêm'} giao dịch</h3><form id="txForm" class="form-grid"><label class="field">Loại<select id="mTxType"><option value="expense" ${item.type==='expense'?'selected':''}>Chi tiêu</option><option value="income" ${item.type==='income'?'selected':''}>Thu nhập</option></select></label><label class="field">Ngày<input id="mTxDate" type="date" value="${item.date||today()}"></label><label class="field">Danh mục<select id="mTxCategory">${cats.map(c=>`<option ${item.category===c?'selected':''}>${escapeHtml(c)}</option>`).join('')}</select></label><label class="field">Số tiền<input id="mTxAmount" type="number" min="1" value="${item.amount||''}" placeholder="Ví dụ 50000"></label><label class="field full">Ghi chú<input id="mTxNote" value="${escapeHtml(item.note||'')}" placeholder="Ví dụ: Ăn trưa cùng bạn"></label><p id="mTxMsg" class="form-message full"></p><div class="actions full"><button class="primary-btn" type="submit">Lưu giao dịch</button><button class="secondary-btn" type="button" onclick="closeModal()">Hủy</button></div></form>`);
  $('#txForm').onsubmit=(e)=>{e.preventDefault(); const amount=Number($('#mTxAmount').value),date=$('#mTxDate').value;if(!date||amount<=0)return showMessage($('#mTxMsg'),'Ngày và số tiền phải hợp lệ.'); const obj={id:id||uid(),type:$('#mTxType').value,date,category:$('#mTxCategory').value,amount,note:$('#mTxNote').value.trim()}; const arr=load('transactions'); const idx=arr.findIndex(x=>x.id===id); if(idx>=0)arr[idx]=obj;else arr.push(obj);save('transactions',arr);closeModal();render();toast(id?'Đã cập nhật giao dịch.':'Đã thêm giao dịch.');};
}
function deleteTransaction(id){ if(!confirm('Bạn chắc chắn muốn xóa giao dịch này?'))return; save('transactions',load('transactions').filter(x=>x.id!==id)); render(); toast('Đã xóa giao dịch.'); }

function renderGoals(){ const goals=load('goals'); $('#content').innerHTML=`<div class="section-head"><div><h3>Mục tiêu tiết kiệm</h3><div class="muted">Bạn tự tạo dữ liệu, không có nội dung cố định.</div></div><button class="primary-btn" onclick="openGoalModal()">+ Tạo mục tiêu</button></div>${goals.length?`<div class="grid grid-3">${goals.map(g=>`<div class="card goal-card">${goalCard(g)}<div class="actions"><button class="small-btn" onclick="openGoalModal('${g.id}')">Sửa</button><button class="small-btn" onclick="addGoalMoney('${g.id}')">+ Tiết kiệm</button><button class="small-btn" onclick="deleteGoal('${g.id}')">Xóa</button></div></div>`).join('')}</div>`:empty('🎯','Chưa có mục tiêu','Nhấn “Tạo mục tiêu” để bắt đầu.')}`; }
function goalCard(g){const p=g.target?Math.min(100,Math.round((g.saved/g.target)*100)):0;return `<div class="goal-row"><div><div class="goal-title">${escapeHtml(g.name)}</div><small class="muted">Hạn: ${g.deadline||'Chưa đặt'}</small></div><strong>${p}%</strong></div><div class="progress"><span style="width:${p}%"></span></div><div class="goal-row"><span>${money(g.saved)} đã có</span><strong>${money(g.target)}</strong></div>`;}
function openGoalModal(id=''){const arr=load('goals'),g=arr.find(x=>x.id===id)||{};openModal(`<h3>${id?'Sửa':'Tạo'} mục tiêu</h3><form id="goalForm" class="form-grid"><label class="field full">Tên mục tiêu<input id="gName" value="${escapeHtml(g.name||'')}" placeholder="Ví dụ: Mua laptop"></label><label class="field">Số tiền mục tiêu<input id="gTarget" type="number" min="1" value="${g.target||''}"></label><label class="field">Đã tiết kiệm<input id="gSaved" type="number" min="0" value="${g.saved||0}"></label><label class="field full">Hạn hoàn thành<input id="gDeadline" type="date" value="${g.deadline||''}"></label><p id="gMsg" class="form-message full"></p><div class="actions full"><button class="primary-btn">Lưu mục tiêu</button><button type="button" class="secondary-btn" onclick="closeModal()">Hủy</button></div></form>`);$('#goalForm').onsubmit=e=>{e.preventDefault();const name=$('#gName').value.trim(),target=Number($('#gTarget').value),saved=Number($('#gSaved').value);if(!name||target<=0||saved<0)return showMessage($('#gMsg'),'Hãy nhập tên và số tiền hợp lệ.');const obj={id:id||uid(),name,target,saved,deadline:$('#gDeadline').value};const a=load('goals'),i=a.findIndex(x=>x.id===id);if(i>=0)a[i]=obj;else a.push(obj);save('goals',a);closeModal();render();toast('Đã lưu mục tiêu.');};}
function addGoalMoney(id){const g=load('goals').find(x=>x.id===id);if(!g)return;openModal(`<h3>Thêm tiền tiết kiệm</h3><p>${escapeHtml(g.name)}</p><label class="field">Số tiền<input id="goalAdd" type="number" min="1"></label><p id="goalAddMsg" class="form-message"></p><div class="actions" style="margin-top:14px"><button id="goalAddBtn" class="primary-btn">Cập nhật</button></div>`);$('#goalAddBtn').onclick=()=>{const n=Number($('#goalAdd').value);if(n<=0)return showMessage($('#goalAddMsg'),'Số tiền phải lớn hơn 0.');const a=load('goals'),i=a.findIndex(x=>x.id===id);a[i].saved=Number(a[i].saved)+n;save('goals',a);closeModal();render();toast('Đã cập nhật tiến độ.');};}
function deleteGoal(id){if(confirm('Xóa mục tiêu này?')){save('goals',load('goals').filter(x=>x.id!==id));render();toast('Đã xóa mục tiêu.');}}

function renderAI(){
  $('#content').innerHTML=`<div class="grid grid-3"><div class="card"><h3>AI-1 • Expense Categorizer</h3><p class="muted">Nhập mô tả giao dịch để AI mô phỏng gợi ý danh mục.</p><div class="ai-box"><input id="aiExpenseInput" placeholder="Ví dụ: mua trà sữa 45k"><button class="primary-btn" style="margin-top:10px" onclick="runExpenseAI()">Phân loại</button><div id="aiExpenseResult"></div></div></div><div class="card"><h3>AI-2 • Spending Pattern Insight</h3><p class="muted">Phân tích dữ liệu giao dịch bạn đã nhập.</p><div class="ai-box"><button class="primary-btn" onclick="runPatternAI()">Phân tích chi tiêu</button><div id="aiPatternResult"></div></div></div><div class="card"><h3>AI-3 • Goal Coach</h3><p class="muted">Tạo các bước tiết kiệm mang tính giáo dục.</p><div class="ai-box"><input id="aiGoalInput" placeholder="Ví dụ: tiết kiệm 10 triệu"><button class="primary-btn" style="margin-top:10px" onclick="runGoalAI()">Tạo kế hoạch</button><div id="aiGoalResult"></div></div></div></div><div class="card" style="margin-top:18px"><h3>Lưu ý</h3><p class="muted">Đây là AI mô phỏng bằng JavaScript theo quy tắc, phù hợp bài Frontend và không phải tư vấn đầu tư.</p></div>`;
}
function aiLoading(el){el.innerHTML='<div class="ai-result">⏳ AI đang xử lý...</div>';}
function runExpenseAI(){const input=$('#aiExpenseInput').value.trim();const el=$('#aiExpenseResult');if(!input)return el.innerHTML='<div class="ai-result negative">Không đủ dữ liệu để đưa ra đề xuất.</div>';aiLoading(el);setTimeout(()=>{const s=input.toLowerCase();let cat='Khác',why='Không tìm thấy từ khóa rõ ràng.';const rules=[['Ăn uống',['ăn','cơm','trà','cafe','cà phê','bánh']],['Di chuyển',['xăng','grab','xe','bus','taxi']],['Mua sắm',['mua','áo','quần','shop']],['Học tập',['sách','học','khóa','photo']],['Giải trí',['game','phim','netflix','karaoke']],['Hóa đơn',['điện','nước','wifi','internet']]];for(const [c,keys] of rules){const k=keys.find(k=>s.includes(k));if(k){cat=c;why=`Phát hiện từ khóa “${k}”.`;break;}}el.innerHTML=`<div class="ai-result"><strong>Gợi ý: ${cat}</strong><p>${why}</p><div class="actions"><button class="success-btn" onclick="saveAIHistory('Expense Categorizer','${escapeHtml(cat)}')">Chấp nhận & lưu</button><button class="secondary-btn" onclick="$('#aiExpenseInput').focus()">Sửa</button><button class="danger-btn" onclick="this.closest('.ai-result').remove()">Từ chối</button></div></div>`;},650);}
function runPatternAI(){const el=$('#aiPatternResult'),tx=load('transactions').filter(x=>x.type==='expense');aiLoading(el);setTimeout(()=>{if(tx.length<2)return el.innerHTML='<div class="ai-result negative">Không đủ dữ liệu để đưa ra đề xuất. Hãy thêm ít nhất 2 khoản chi.</div>';const sums={};tx.forEach(x=>sums[x.category]=(sums[x.category]||0)+Number(x.amount));const top=Object.entries(sums).sort((a,b)=>b[1]-a[1])[0];el.innerHTML=`<div class="ai-result"><strong>Pattern nổi bật</strong><p>Bạn chi nhiều nhất cho <b>${escapeHtml(top[0])}</b>: ${money(top[1])}.</p><p class="muted">Giải thích: AI cộng tổng các giao dịch theo danh mục và chọn nhóm cao nhất.</p><button class="success-btn" onclick="saveAIHistory('Spending Pattern','${escapeHtml(top[0])}')">Lưu insight</button></div>`;},650);}
function runGoalAI(){const input=$('#aiGoalInput').value.trim(),el=$('#aiGoalResult');if(!input)return el.innerHTML='<div class="ai-result negative">Vui lòng nhập mục tiêu trước.</div>';aiLoading(el);setTimeout(()=>{const num=Number((input.match(/[\d.,]+/)||['0'])[0].replace(/[.,]/g,''));const estimate=num>0?money(num):'mục tiêu của bạn';el.innerHTML=`<div class="ai-result"><strong>Kế hoạch gợi ý</strong><ol><li>Xác định thời hạn rõ ràng.</li><li>Chia ${estimate} thành khoản nhỏ theo tuần/tháng.</li><li>Theo dõi chi tiêu không thiết yếu.</li><li>Cập nhật tiến độ trong mục “Mục tiêu tiết kiệm”.</li></ol><div class="actions"><button class="success-btn" onclick="saveAIHistory('Goal Coach','${escapeHtml(input)}')">Chấp nhận & lưu</button><button class="secondary-btn" onclick="runGoalAI()">Tạo lại</button></div></div>`;},650);}
function saveAIHistory(feature,result){const h=load('aiHistory');h.unshift({id:uid(),feature,result,date:new Date().toLocaleString('vi-VN')});save('aiHistory',h);toast('Đã lưu kết quả AI.');}

function renderSettings(){ $('#content').innerHTML=`<div class="grid grid-2"><div class="card"><h3>Thông tin tài khoản</h3><form id="profileForm" class="auth-form"><label>Họ và tên<input id="profileName" value="${escapeHtml(state.currentUser.name)}"></label><label>Tên đăng nhập<input value="${escapeHtml(state.currentUser.username)}" disabled></label><label>Vai trò<input value="${roleNames[state.currentUser.role]}" disabled></label><button class="primary-btn">Lưu thay đổi</button></form></div><div class="card"><h3>Tùy chọn</h3><div class="settings-list"><div class="setting-item"><div><strong>Giao diện sáng/tối</strong><small class="muted">Đổi theme toàn trang</small></div><button class="secondary-btn" onclick="toggleTheme()">Đổi theme</button></div><div class="setting-item"><div><strong>Xóa dữ liệu nghiệp vụ</strong><small class="muted">Không xóa tài khoản</small></div><button class="danger-btn" onclick="clearMyData()">Xóa dữ liệu</button></div><div class="setting-item"><div><strong>Đăng xuất</strong><small class="muted">Đăng nhập bằng tài khoản khác</small></div><button class="danger-btn" onclick="logout()">Đăng xuất</button></div></div></div></div>`;$('#profileForm').onsubmit=e=>{e.preventDefault();const name=$('#profileName').value.trim();if(name.length<2)return toast('Tên quá ngắn.','error');const users=getUsers(),i=users.findIndex(u=>u.username===state.currentUser.username);users[i].name=name;saveUsers(users);state.currentUser=users[i];$('#miniUserName').textContent=name;toast('Đã cập nhật hồ sơ.');}; }
function clearMyData(){if(!confirm('Xóa toàn bộ giao dịch, mục tiêu và dữ liệu của tài khoản này?'))return;['transactions','goals','resources','coachNotes','notifications','aiHistory','feedback','templates'].forEach(k=>localStorage.removeItem(userKey(k)));initializeUserData();toast('Đã xóa dữ liệu cá nhân.');render();}
function logout(){localStorage.removeItem(KEYS.session);state.currentUser=null;$('#app').classList.add('hidden');$('#authScreen').classList.remove('hidden');$('#loginForm').reset();$('#loginMessage').textContent='';toast('Đã đăng xuất.');}

function renderRoleDashboard(){const role=state.currentUser.role;const cfg={coach:['Khách hàng','Đánh giá','Tài nguyên'],moderator:['Chờ duyệt','Mẫu AI','Phản hồi'],admin:['Tài khoản','Danh mục','Dữ liệu hệ thống']}[role];const counts=role==='admin'?[getUsers().length,load('categories').length,storageCount()]:role==='coach'?[load('clients').length,load('coachNotes').length,load('resources').length]:[load('resources').length,load('templates').length,load('feedback').length];$('#content').innerHTML=`<div class="role-banner"><strong>${roleNames[role]}</strong><div class="muted">Bảng điều khiển dành riêng cho vai trò hiện tại.</div></div><div class="grid grid-3">${cfg.map((x,i)=>stat(x,counts[i]||0,'','Dữ liệu được lưu cục bộ')).join('')}</div><div class="card" style="margin-top:18px"><h3>Hướng dẫn</h3><p class="muted">Dùng menu bên trái để thực hiện các tác vụ CRUD của vai trò này.</p></div>`;}
function storageCount(){let n=0;for(let i=0;i<localStorage.length;i++)if(localStorage.key(i).startsWith('sw_'))n++;return n;}

function renderClients(){let clients=load('clients');$('#content').innerHTML=`<div class="card"><div class="section-head"><div><h3>Khách hàng</h3><div class="muted">Coach có thể tạo dữ liệu khách hàng mô phỏng để review.</div></div><button class="primary-btn" onclick="genericAdd('clients','Khách hàng')">+ Thêm khách hàng</button></div>${genericList(clients,'clients')}</div>`;}
function renderReviews(){let notes=load('coachNotes');$('#content').innerHTML=`<div class="card"><div class="section-head"><h3>Đánh giá ngân sách</h3><button class="primary-btn" onclick="genericAdd('coachNotes','Đánh giá ngân sách')">+ Tạo đánh giá</button></div>${genericList(notes,'coachNotes')}</div>`;}
function renderResources(){let a=load('resources');$('#content').innerHTML=`<div class="card"><div class="section-head"><h3>Tài nguyên giáo dục</h3><button class="primary-btn" onclick="genericAdd('resources','Tài nguyên')">+ Thêm tài nguyên</button></div>${genericList(a,'resources')}</div>`;}
function renderResourceReview(){let a=load('resources');$('#content').innerHTML=`<div class="card"><div class="section-head"><h3>Duyệt tài nguyên</h3><button class="primary-btn" onclick="genericAdd('resources','Tài nguyên chờ duyệt')">+ Tạo mẫu</button></div>${a.length?`<div class="list">${a.map(x=>`<div class="list-item"><div><strong>${escapeHtml(x.title)}</strong><small>${escapeHtml(x.description||'')}</small></div><div class="actions"><button class="success-btn" onclick="setStatus('resources','${x.id}','Đã duyệt')">Duyệt</button><button class="danger-btn" onclick="setStatus('resources','${x.id}','Từ chối')">Từ chối</button></div></div>`).join('')}</div>`:empty('📚','Chưa có tài nguyên','Tạo dữ liệu mới để thử quy trình duyệt.')}</div>`;}
function renderTemplates(){let a=load('templates');$('#content').innerHTML=`<div class="card"><div class="section-head"><h3>Mẫu AI</h3><button class="primary-btn" onclick="genericAdd('templates','Mẫu AI')">+ Thêm mẫu</button></div>${genericList(a,'templates')}</div>`;}
function renderFeedback(){let a=load('feedback');$('#content').innerHTML=`<div class="card"><div class="section-head"><h3>Phản hồi</h3><button class="primary-btn" onclick="genericAdd('feedback','Phản hồi')">+ Tạo phản hồi</button></div>${genericList(a,'feedback')}</div>`;}
function renderCategories(){const cats=load('categories');$('#content').innerHTML=`<div class="card"><div class="section-head"><h3>Danh mục chi tiêu</h3><button class="primary-btn" onclick="addCategory()">+ Thêm danh mục</button></div><div class="list">${cats.map(c=>`<div class="list-item"><strong>${escapeHtml(c)}</strong><button class="small-btn" onclick="deleteCategory('${encodeURIComponent(c)}')">Xóa</button></div>`).join('')}</div></div>`;}
function renderUsers(){const users=getUsers();$('#content').innerHTML=`<div class="card"><div class="section-head"><h3>Tài khoản hệ thống</h3></div><div class="table-wrap"><table><thead><tr><th>Họ tên</th><th>Username</th><th>Vai trò</th><th>Thao tác</th></tr></thead><tbody>${users.map(u=>`<tr><td>${escapeHtml(u.name)}</td><td>${escapeHtml(u.username)}</td><td>${roleNames[u.role]}</td><td>${u.username===state.currentUser.username?'<span class="badge">Đang dùng</span>':`<button class="small-btn" onclick="deleteUser('${u.username}')">Xóa</button>`}</td></tr>`).join('')}</tbody></table></div></div>`;}
function renderSystem(){const users=getUsers(),cats=load('categories');$('#content').innerHTML=`<div class="grid grid-4">${stat('Tài khoản',users.length)}${stat('Danh mục',cats.length)}${stat('LocalStorage keys',storageCount())}${stat('Vai trò',4)}</div><div class="card" style="margin-top:18px"><h3>Trạng thái hệ thống</h3><div class="list"><div class="list-item"><strong>LocalStorage</strong><span class="badge done">Hoạt động</span></div><div class="list-item"><strong>JavaScript DOM</strong><span class="badge done">Hoạt động</span></div><div class="list-item"><strong>AI mô phỏng</strong><span class="badge done">Hoạt động</span></div></div></div>`;}
function genericList(a,type){if(!a.length)return empty('🗂','Chưa có dữ liệu','Nhấn nút thêm mới để tạo dữ liệu.');return `<div class="list">${a.map(x=>`<div class="list-item"><div><strong>${escapeHtml(x.title)}</strong><small>${escapeHtml(x.description||'')}${x.status?' • '+escapeHtml(x.status):''}</small></div><div class="actions"><button class="small-btn" onclick="genericAdd('${type}','Dữ liệu','${x.id}')">Sửa</button><button class="small-btn" onclick="genericDelete('${type}','${x.id}')">Xóa</button></div></div>`).join('')}</div>`;}
function genericAdd(type,label,id=''){const arr=load(type),it=arr.find(x=>x.id===id)||{};openModal(`<h3>${id?'Sửa':'Thêm'} ${label}</h3><form id="genericForm" class="auth-form"><label>Tiêu đề<input id="genTitle" value="${escapeHtml(it.title||'')}"></label><label>Mô tả<textarea id="genDesc" rows="4">${escapeHtml(it.description||'')}</textarea></label><p id="genMsg" class="form-message"></p><button class="primary-btn">Lưu</button></form>`);$('#genericForm').onsubmit=e=>{e.preventDefault();const title=$('#genTitle').value.trim();if(!title)return showMessage($('#genMsg'),'Tiêu đề không được để trống.');const obj={...it,id:id||uid(),title,description:$('#genDesc').value.trim(),status:it.status||'Đang chờ'};const a=load(type),i=a.findIndex(x=>x.id===id);if(i>=0)a[i]=obj;else a.push(obj);save(type,a);closeModal();render();toast('Đã lưu dữ liệu.');};}
function genericDelete(type,id){if(confirm('Bạn muốn xóa mục này?')){save(type,load(type).filter(x=>x.id!==id));render();toast('Đã xóa dữ liệu.');}}
function setStatus(type,id,status){const a=load(type),i=a.findIndex(x=>x.id===id);if(i>=0){a[i].status=status;save(type,a);render();toast(`Đã cập nhật: ${status}`);}}
function addCategory(){openModal(`<h3>Thêm danh mục</h3><label class="field">Tên danh mục<input id="catName"></label><p id="catMsg" class="form-message"></p><button id="catBtn" class="primary-btn" style="margin-top:12px">Thêm</button>`);$('#catBtn').onclick=()=>{const name=$('#catName').value.trim(),a=load('categories');if(!name)return showMessage($('#catMsg'),'Tên không được để trống.');if(a.some(x=>x.toLowerCase()===name.toLowerCase()))return showMessage($('#catMsg'),'Danh mục đã tồn tại.');a.push(name);save('categories',a);closeModal();render();toast('Đã thêm danh mục.');};}
function deleteCategory(encoded){const c=decodeURIComponent(encoded);if(confirm(`Xóa danh mục “${c}”?`)){save('categories',load('categories').filter(x=>x!==c));render();toast('Đã xóa danh mục.');}}
function deleteUser(username){if(username==='demo')return toast('Giữ lại tài khoản demo để kiểm thử.','error');if(confirm(`Xóa tài khoản ${username}?`)){saveUsers(getUsers().filter(u=>u.username!==username));render();toast('Đã xóa tài khoản.');}}

function openModal(html){$('#modalBody').innerHTML=html;$('#modal').classList.remove('hidden');}
function closeModal(){$('#modal').classList.add('hidden');$('#modalBody').innerHTML='';}
$('#closeModal').onclick=closeModal;$('#modal').onclick=e=>{if(e.target===$('#modal'))closeModal();};
$('#menuBtn').onclick=()=>document.querySelector('.sidebar').classList.toggle('open');
$('#themeBtn').onclick=toggleTheme;function toggleTheme(){document.body.classList.toggle('dark');localStorage.setItem(KEYS.theme,document.body.classList.contains('dark')?'dark':'light');}
if(localStorage.getItem(KEYS.theme)==='dark')document.body.classList.add('dark');
$('#notificationBtn').onclick=()=>{const a=load('notifications');openModal(`<h3>Thông báo</h3>${a.length?`<div class="list">${a.map(n=>`<div class="list-item"><div><strong>${escapeHtml(n.text)}</strong><small>${n.date}</small></div></div>`).join('')}</div>`:empty('🔔','Chưa có thông báo','Thông báo mới sẽ xuất hiện tại đây.')}`);a.forEach(n=>n.read=true);save('notifications',a);updateNotificationDot();};
function updateNotificationDot(){const has=state.currentUser&&load('notifications').some(n=>!n.read);$('#notificationDot').style.display=has?'block':'none';}

restoreSession();
