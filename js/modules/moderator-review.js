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

const user=setupShell('moderator-review.html','moderator');if(user){
function render(){const all=load('moderation');$('#stats').innerHTML=[[all.length,'Tổng'],[all.filter(x=>x.status==='Chờ duyệt').length,'Chờ duyệt'],[all.filter(x=>x.status==='Hoàn tất').length,'Đã duyệt'],[all.filter(x=>x.status==='Từ chối').length,'Từ chối']].map(x=>`<div class="stat-card"><strong>${x[0]}</strong><span>${x[1]}</span></div>`).join('');let arr=applySearch(all,['title','author','submitted'],$('#globalSearch').value).filter(x=>$('#statusFilter').value==='all'||x.status===$('#statusFilter').value);$('#tableContent').innerHTML=arr.length?`<div class="table-wrap"><table class="data-table"><thead><tr><th>Tài nguyên</th><th>Tác giả</th><th>Nộp lúc</th><th>Trạng thái</th><th></th></tr></thead><tbody>${arr.map(x=>`<tr><td>${esc(x.title)}</td><td>${esc(x.author)}</td><td>${esc(x.submitted)}</td><td>${statusPill(x.status)}</td><td><div class="actions"><button class="link-btn" data-status="${x.id}|Hoàn tất">Duyệt</button><button class="link-btn danger" data-status="${x.id}|Từ chối">Từ chối</button><button class="link-btn" data-edit="${x.id}">Sửa</button><button class="link-btn danger" data-del="${x.id}">Xóa</button></div></td></tr>`).join('')}</tbody></table></div>`:'<div class="empty"><strong>Hàng đợi đang trống</strong>Không có tài nguyên cần xử lý.</div>';$$('[data-status]').forEach(b=>b.onclick=()=>{const [id,s]=b.dataset.status.split('|'),a=load('moderation'),x=a.find(v=>v.id===id);x.status=s;save('moderation',a);render();toast('Đã cập nhật trạng thái.')} );$$('[data-edit]').forEach(b=>b.onclick=()=>openForm(b.dataset.edit));$$('[data-del]').forEach(b=>b.onclick=()=>confirmDelete('Xóa tài nguyên này?',()=>{save('moderation',load('moderation').filter(x=>x.id!==b.dataset.del));render()}))}
function openForm(id=''){const a=load('moderation'),x=a.find(v=>v.id===id)||{status:'Chờ duyệt'};openModal(`<h2>${id?'Sửa':'Thêm'} tài nguyên kiểm duyệt</h2><form id="form" class="form-grid"><div class="field full"><label>Tên tài nguyên</label><input id="title" value="${esc(x.title||'')}" required></div><div class="field"><label>Tác giả</label><input id="author" value="${esc(x.author||'')}" required></div><div class="field"><label>Nộp lúc</label><input id="submitted" value="${esc(x.submitted||'')}" placeholder="Ví dụ: Hôm nay 09:24" required></div><div class="field"><label>Trạng thái</label><select id="status"><option>Chờ duyệt</option><option>Hoàn tất</option><option>Từ chối</option></select></div><div class="modal-actions full"><button type="button" class="btn btn-outline" onclick="closeModal()">Hủy</button><button class="btn btn-primary">Lưu</button></div></form>`);$('#status').value=x.status||'Chờ duyệt';$('#form').onsubmit=e=>{e.preventDefault();const o={...x,id:x.id||uid(),title:$('#title').value.trim(),author:$('#author').value.trim(),submitted:$('#submitted').value.trim(),status:$('#status').value};const i=a.findIndex(v=>v.id===o.id);i>=0?a[i]=o:a.unshift(o);save('moderation',a);closeModal();render()}}
$('#addBtn').onclick=()=>openForm();$('#globalSearch').oninput=render;$('#statusFilter').onchange=render;render();}
