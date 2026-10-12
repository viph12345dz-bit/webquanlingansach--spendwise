const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const uid = () => `${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
const nowISO = () => new Date().toISOString();
const todayISO = () => new Date().toISOString().slice(0,10);
const esc = (v='') => String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
const norm = (v='') => String(v).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const money = (n=0) => `${Number(n||0).toLocaleString('vi-VN')} đ`;
const shortMoney = (n=0) => { n=Number(n||0); if(Math.abs(n)>=1000000)return `${(n/1000000).toLocaleString('vi-VN',{maximumFractionDigits:1})} tr`; if(Math.abs(n)>=1000)return `${Math.round(n/1000).toLocaleString('vi-VN')}k`; return n.toLocaleString('vi-VN'); };
const fmtDate = iso => { if(!iso)return '—'; const d=new Date(`${iso}T00:00:00`); return Number.isNaN(d.getTime())?esc(iso):d.toLocaleDateString('vi-VN'); };
const sleep = ms => new Promise(r=>setTimeout(r,ms));
const KEYS={users:'spendwise_users_v3',session:'spendwise_session_v3',theme:'spendwise_theme_v3'};
function readJSON(k,f){try{const r=localStorage.getItem(k);return r?JSON.parse(r):f}catch(e){return f}}
function writeJSON(k,v){localStorage.setItem(k,JSON.stringify(v))}
function getUsers(){return readJSON(KEYS.users,[])} function saveUsers(v){writeJSON(KEYS.users,v)}
function session(){return readJSON(KEYS.session,null)}
function currentUser(){const s=session(); return s?getUsers().find(u=>u.id===s.userId)||null:null}
function setSession(user){writeJSON(KEYS.session,{userId:user.id,loginAt:nowISO()})}
function clearSession(){localStorage.removeItem(KEYS.session)}
function userKey(name){const u=currentUser();return `spendwise_${u?u.id:'guest'}_${name}`}
function load(name,f=[]){return readJSON(userKey(name),f)} function save(name,v){writeJSON(userKey(name),v)}
function toast(msg,type=''){const el=$('#toast');if(!el)return;el.textContent=msg;el.className=`toast show ${type}`;clearTimeout(window.__toast);window.__toast=setTimeout(()=>el.className='toast',2600)}
function openModal(html){const o=$('#modalOverlay');if(!o)return;o.innerHTML=`<div class="modal" role="dialog" aria-modal="true">${html}</div>`;o.classList.remove('hidden')}
function closeModal(){const o=$('#modalOverlay');if(o){o.classList.add('hidden');o.innerHTML=''}}
window.closeModal=closeModal;
function statusClass(s=''){s=norm(s); if(s.includes('tu choi')||s.includes('can sua')||s.includes('vo hieu'))return'rejected'; if(s.includes('cho')||s.includes('dang xu ly')||s.includes('theo doi'))return'pending'; if(s.includes('nhap'))return'neutral'; return''}
function statusPill(s='Hoàn tất'){return `<span class="status ${statusClass(s)}">${esc(s)}</span>`}
function ensureUserStorage(){['transactions','goals','insights','notifications','clients','reviews','resources','moderation','templates','feedback','categories','services'].forEach(k=>{if(localStorage.getItem(userKey(k))===null)save(k,[])})}
function addNotification(text,type='Hệ thống'){const n=load('notifications');n.unshift({id:uid(),text,type,time:nowISO(),read:false,status:'Hoàn tất'});save('notifications',n)}
function initials(name='US'){return name.trim().split(/\s+/).slice(-2).map(x=>x[0]?.toUpperCase()||'').join('')||'US'}
const ROLE_LABEL={user:'USER',coach:'COACH',moderator:'MODERATOR',admin:'ADMIN'};
const DEFAULT_PAGE={user:'user-dashboard.html',coach:'coach-clients.html',moderator:'moderator-review.html',admin:'admin-dashboard.html'};
const NAV={
 user:[['user-dashboard.html','Tổng quan'],['user-transactions.html','Giao dịch'],['user-goals.html','Mục tiêu tiết kiệm'],['notifications.html','Thông báo'],['profile.html','Hồ sơ'],['settings.html','Cài đặt']],
 coach:[['coach-clients.html','Khách hàng'],['coach-review.html','Review ngân sách'],['coach-resources.html','Tài nguyên'],['notifications.html','Thông báo'],['profile.html','Hồ sơ'],['settings.html','Cài đặt']],
 moderator:[['moderator-review.html','Kiểm duyệt'],['moderator-templates.html','Template AI'],['moderator-feedback.html','Feedback'],['notifications.html','Thông báo'],['profile.html','Hồ sơ'],['settings.html','Cài đặt']],
 admin:[['admin-dashboard.html','Dashboard hệ thống'],['admin-categories.html','Danh mục chi tiêu'],['admin-users.html','Người dùng & quyền'],['notifications.html','Thông báo'],['profile.html','Hồ sơ'],['settings.html','Cài đặt']]
};
function requireAuth(role=null){const u=currentUser(); if(!u){location.replace('login.html');return null} if(role&&u.role!==role){location.replace('403.html');return null} ensureUserStorage();return u}
function setupShell(active,role=null){const u=requireAuth(role);if(!u)return null;const theme=localStorage.getItem(KEYS.theme)||'light';document.body.classList.toggle('dark',theme==='dark');$('#roleBadge').textContent=ROLE_LABEL[u.role]||u.role.toUpperCase();$('#userInitials').textContent=initials(u.name);$('#sidebarNav').innerHTML=(NAV[u.role]||[]).map(([href,label])=>`<a class="nav-link ${href===active?'active':''}" href="${href}">${label}</a>`).join('');$('#logoutBtn')?.addEventListener('click',()=>{clearSession();location.href='login.html'});$('#mobileMenu')?.addEventListener('click',()=>$('#sidebar').classList.toggle('open'));return u}
function applySearch(items,fields,q){q=norm(q);return !q?items:items.filter(x=>fields.some(f=>norm(x[f]??'').includes(q)))}
function confirmDelete(message,fn){openModal(`<h2>Xác nhận xóa</h2><p class="muted">${esc(message)}</p><div class="modal-actions"><button class="btn btn-outline" onclick="closeModal()">Hủy</button><button id="confirmDelete" class="btn btn-danger">Xóa</button></div>`);$('#confirmDelete').onclick=()=>{closeModal();fn()}}

const user=setupShell('user-dashboard.html','user');if(user){
function finance(){const t=load('transactions');const income=t.filter(x=>x.type==='income').reduce((s,x)=>s+Number(x.amount),0),expense=t.filter(x=>x.type==='expense').reduce((s,x)=>s+Number(x.amount),0);return{t,income,expense,balance:income-expense,progress:income?Math.min(100,Math.round(expense/income*100)):0}}
function render(){const f=finance();$('#stats').innerHTML=[[shortMoney(f.expense),'Đã chi tiêu'],[shortMoney(f.balance),'Còn lại'],[`${f.progress}%`,'Tiến độ ngân sách'],[String(f.t.length),'Giao dịch']].map(x=>`<div class="stat-card"><strong>${x[0]}</strong><span>${x[1]}</span></div>`).join('');let arr=load('insights');const q=$('#globalSearch').value,st=$('#statusFilter').value;arr=applySearch(arr,['finding','detail','impact'],q).filter(x=>st==='all'||x.status===st);$('#insightContent').innerHTML=arr.length?`<div class="table-wrap"><table class="data-table"><thead><tr><th>Phát hiện</th><th>Chi tiết</th><th>Tác động</th><th>Trạng thái</th><th></th></tr></thead><tbody>${arr.map(x=>`<tr><td>${esc(x.finding)}</td><td>${esc(x.detail)}</td><td>${esc(x.impact)}</td><td>${statusPill(x.status)}</td><td><div class="actions"><button class="link-btn danger" data-del="${x.id}">Xóa</button></div></td></tr>`).join('')}</tbody></table></div>`:`<div class="empty"><strong>Chưa có insight</strong>Hãy thêm giao dịch rồi bấm “Phân tích mới”.</div>`;$$('[data-del]').forEach(b=>b.onclick=()=>confirmDelete('Xóa insight này?',()=>{save('insights',load('insights').filter(x=>x.id!==b.dataset.del));render()}))}
$('#analyzeBtn').onclick=async()=>{const ex=load('transactions').filter(x=>x.type==='expense');if(!ex.length){openModal('<h2>AI Spending Pattern Insight</h2><div class="ai-box"><strong>Không đủ dữ liệu để đưa ra đề xuất.</strong><p>Hãy thêm ít nhất một giao dịch chi tiêu rồi thử lại.</p></div><div class="modal-actions"><button class="btn btn-primary" onclick="closeModal()">Đóng</button></div>');return}openModal('<h2>AI Spending Pattern Insight</h2><div id="aiResult" class="ai-box"><span class="ai-loader">AI đang phân tích</span></div>');await sleep(650);const by={};ex.forEach(t=>by[t.category||'Khác']=(by[t.category||'Khác']||0)+Number(t.amount));const [cat,amt]=Object.entries(by).sort((a,b)=>b[1]-a[1])[0],total=ex.reduce((s,x)=>s+Number(x.amount),0),pct=Math.round(amt/total*100);$('#aiResult').innerHTML=`<strong>Chi tiêu tập trung vào ${esc(cat)}</strong><p>${pct}% tổng chi hiện tại (${money(amt)}).</p><p class="muted">Vì sao? Đây là danh mục có tổng chi lớn nhất trong dữ liệu bạn đã nhập.</p><div class="modal-actions"><button id="rejectAI" class="btn btn-outline">Từ chối</button><button id="saveAI" class="btn btn-primary">Chấp nhận & lưu</button></div>`;$('#rejectAI').onclick=closeModal;$('#saveAI').onclick=()=>{const a=load('insights');a.unshift({id:uid(),finding:`Chi tiêu tập trung vào ${cat}`,detail:`${pct}% tổng chi hiện tại`,impact:`-${money(amt)}`,status:'Hoàn tất'});save('insights',a);addNotification('Đã lưu một AI Spending Pattern Insight mới.','AI');closeModal();render();toast('Đã lưu insight.')}};
$('#globalSearch').oninput=render;$('#statusFilter').onchange=render;render();}
