const STORAGE_KEY='doh-incidents-v1';
const $=s=>document.querySelector(s);
const form=$('#incident-form');
const list=$('#incident-list');
const empty=$('#empty-state');
const status=$('#form-status');

function load(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]')}catch{return[]}}
function save(items){localStorage.setItem(STORAGE_KEY,JSON.stringify(items))}
function esc(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function formatDate(date,time){try{return new Intl.DateTimeFormat(undefined,{dateStyle:'medium',timeStyle:'short'}).format(new Date(`${date}T${time}`))}catch{return `${date} ${time}`}}
function render(){const items=load().sort((a,b)=>`${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`));list.innerHTML='';empty.hidden=items.length>0;for(const item of items){const el=document.createElement('article');el.className='incident-card';el.innerHTML=`<div class="incident-meta"><span>${esc(formatDate(item.date,item.time))}</span><span class="incident-type">${esc(item.type)}</span></div><h3>${esc(item.description.split(/\n/)[0].slice(0,100) || 'Incident')}</h3><p>${esc(item.description).replace(/\n/g,'<br>')}</p>${item.witnesses?`<p><strong>Witnesses:</strong> ${esc(item.witnesses)}</p>`:''}${item.evidence?`<p><strong>Evidence:</strong> ${esc(item.evidence)}</p>`:''}${item.action?`<p><strong>Action taken:</strong> ${esc(item.action).replace(/\n/g,'<br>')}</p>`:''}<div class="incident-actions"><button class="link-button" data-delete="${esc(item.id)}" type="button">Delete entry</button></div>`;list.appendChild(el)}}
function setNow(){const d=new Date();$('#date').value=d.toISOString().slice(0,10);$('#time').value=d.toTimeString().slice(0,5)}
form.addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(form);const item={id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),date:fd.get('date'),time:fd.get('time'),type:fd.get('type'),description:fd.get('description').trim(),witnesses:fd.get('witnesses').trim(),evidence:fd.get('evidence').trim(),action:fd.get('action').trim(),createdAt:new Date().toISOString()};const items=load();items.push(item);save(items);form.reset();setNow();status.textContent='Incident saved in this browser.';render()});
$('#clear-form').addEventListener('click',()=>{form.reset();setNow();status.textContent='Form cleared.'});
list.addEventListener('click',e=>{const id=e.target?.dataset?.delete;if(!id)return;if(confirm('Delete this incident entry from this browser?')){save(load().filter(x=>x.id!==id));render()}});
function download(name,type,text){const blob=new Blob([text],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),500)}
$('#export-json').addEventListener('click',()=>{download(`doh-incidents-${new Date().toISOString().slice(0,10)}.json`,'application/json',JSON.stringify(load(),null,2))});
$('#export-csv').addEventListener('click',()=>{const items=load();const cols=['date','time','type','description','witnesses','evidence','action','createdAt'];const q=v=>`"${String(v??'').replace(/"/g,'""')}"`;const csv=[cols.join(','),...items.map(i=>cols.map(c=>q(i[c])).join(','))].join('\n');download(`doh-incidents-${new Date().toISOString().slice(0,10)}.csv`,'text/csv;charset=utf-8',csv)});
setNow();render();
