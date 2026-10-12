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

const user=setupShell('admin-categories.html','admin');if(user){
const STORE='categories';
const COLS=[["name", "Danh mục"], ["group", "Nhóm"], ["rules", "Quy tắc AI"]];
const FIELDS=[["name", "Tên danh mục", "text", "required"], ["group", "Nhóm", "select", ["Thiết yếu", "Mong muốn", "Tiết kiệm", "Thu nhập"]], ["rules", "Quy tắc AI", "text", "required"]];
const STAT_LABELS=["Danh mục", "Chờ rà soát", "Hoàn tất", "Từ chối"];

function render(){const all=load(STORE);const stats=[String(all.length),String(all.filter(x=>x.status==='Chờ duyệt').length),String(all.filter(x=>x.status==='Hoàn tất').length),String(all.filter(x=>x.status==='Từ chối').length)];$('#stats').innerHTML=STAT_LABELS.map((l,i)=>`<div class="stat-card"><strong>${stats[i]??'0'}</strong><span>${l}</span></div>`).join('');let arr=applySearch(all,COLS.map(x=>x[0]),$('#globalSearch').value).filter(x=>$('#statusFilter').value==='all'||x.status===$('#statusFilter').value);$('#tableContent').innerHTML=arr.length?`<div class="table-wrap"><table class="data-table"><thead><tr>${COLS.map(c=>`<th>${esc(c[1])}</th>`).join('')}<th>Trạng thái</th><th></th></tr></thead><tbody>${arr.map(x=>`<tr>${COLS.map(c=>`<td>${esc(x[c[0]]??'—')}</td>`).join('')}<td>${statusPill(x.status)}</td><td><div class="actions"><button class="link-btn" data-edit="${x.id}">Sửa</button><button class="link-btn danger" data-del="${x.id}">Xóa</button></div></td></tr>`).join('')}</tbody></table></div>`:`<div class="empty"><strong>Chưa có dữ liệu</strong>Bấm “+ Thêm mới” để bắt đầu.</div>`;$$('[data-edit]').forEach(b=>b.onclick=()=>openForm(b.dataset.edit));$$('[data-del]').forEach(b=>b.onclick=()=>confirmDelete('Bạn chắc chắn muốn xóa mục này?',()=>{save(STORE,load(STORE).filter(x=>x.id!==b.dataset.del));render();toast('Đã xóa.')}));wireExtras()}
function inputFor(f,item){const [key,label,type,opt]=f,val=item[key]??'';if(type==='select'){return `<div class="field"><label>${esc(label)}</label><select id="f_${key}">${(opt||[]).map(o=>`<option ${o===val?'selected':''}>${esc(o)}</option>`).join('')}</select></div>`}if(type==='textarea')return `<div class="field full"><label>${esc(label)}</label><textarea id="f_${key}" rows="4">${esc(val)}</textarea></div>`;return `<div class="field"><label>${esc(label)}</label><input id="f_${key}" type="${type||'text'}" value="${esc(val)}" ${opt==='required'?'required':''}></div>`}
function openForm(id=''){const all=load(STORE),item=all.find(x=>x.id===id)||{status:'Hoàn tất'};openModal(`<h2>${id?'Sửa':'Thêm'} dữ liệu</h2><form id="crudForm" class="form-grid">${FIELDS.map(f=>inputFor(f,item)).join('')}<div class="field"><label>Trạng thái</label><select id="f_status"><option>Hoàn tất</option><option>Chờ duyệt</option><option>Từ chối</option></select></div><p id="msg" class="form-message full"></p><div class="modal-actions full"><button type="button" class="btn btn-outline" onclick="closeModal()">Hủy</button><button class="btn btn-primary">Lưu</button></div></form>`);$('#f_status').value=item.status||'Hoàn tất';$('#crudForm').onsubmit=e=>{e.preventDefault();const obj={...item,id:item.id||uid(),status:$('#f_status').value,updatedAt:nowISO()};for(const f of FIELDS){obj[f[0]]=$(`#f_${f[0]}`).value.trim()}if(FIELDS.some(f=>f[3]==='required'&&!obj[f[0]])){ $('#msg').textContent='Hãy nhập đầy đủ các trường bắt buộc.';return}const i=all.findIndex(x=>x.id===obj.id);i>=0?all[i]=obj:all.unshift(obj);save(STORE,all);addNotification('Dữ liệu đã được cập nhật.','Cập nhật');closeModal();render();toast('Đã lưu dữ liệu.')}}
function wireExtras(){}
$('#addBtn').onclick=()=>openForm();$('#globalSearch').oninput=render;$('#statusFilter').onchange=render;render();}
