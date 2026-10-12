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

const me=setupShell('admin-users.html','admin');if(me){
function render(){const all=getUsers();$('#stats').innerHTML=[[all.length,'Tài khoản'],[all.filter(x=>x.role==='user').length,'User'],[all.filter(x=>x.role==='coach').length,'Coach'],[all.filter(x=>x.role==='moderator').length,'Moderator']].map(x=>`<div class="stat-card"><strong>${x[0]}</strong><span>${x[1]}</span></div>`).join('');let arr=applySearch(all,['name','email','role'],$('#globalSearch').value).filter(x=>$('#roleFilter').value==='all'||x.role===$('#roleFilter').value);$('#tableContent').innerHTML=arr.length?`<div class="table-wrap"><table class="data-table"><thead><tr><th>Người dùng</th><th>Email</th><th>Vai trò</th><th>Thành viên từ</th><th></th></tr></thead><tbody>${arr.map(x=>`<tr><td>${esc(x.name)}</td><td>${esc(x.email)}</td><td>${esc(ROLE_LABEL[x.role]||x.role)}</td><td>${new Date(x.createdAt).toLocaleDateString('vi-VN')}</td><td><div class="actions"><button class="link-btn" data-edit="${x.id}">Đổi vai trò</button>${x.id!==me.id?`<button class="link-btn danger" data-del="${x.id}">Xóa</button>`:''}</div></td></tr>`).join('')}</tbody></table></div>`:'<div class="empty"><strong>Chưa có tài khoản</strong></div>';$$('[data-edit]').forEach(b=>b.onclick=()=>editRole(b.dataset.edit));$$('[data-del]').forEach(b=>b.onclick=()=>confirmDelete('Xóa tài khoản này khỏi trình duyệt?',()=>{saveUsers(getUsers().filter(x=>x.id!==b.dataset.del));render();toast('Đã xóa tài khoản.')}))}
function editRole(id){const users=getUsers(),u=users.find(x=>x.id===id);openModal(`<h2>Đổi vai trò</h2><p>${esc(u.email)}</p><div class="field"><label>Vai trò</label><select id="newRole"><option value="user">User</option><option value="coach">Coach</option><option value="moderator">Moderator</option><option value="admin">Admin</option></select></div><div class="modal-actions"><button class="btn btn-outline" onclick="closeModal()">Hủy</button><button id="saveRole" class="btn btn-primary">Lưu</button></div>`);$('#newRole').value=u.role;$('#saveRole').onclick=()=>{u.role=$('#newRole').value;saveUsers(users);closeModal();render();toast('Đã đổi vai trò.')}}
$('#globalSearch').oninput=render;$('#roleFilter').onchange=render;render();}
