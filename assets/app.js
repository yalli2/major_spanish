const $=(s,r=document)=>r.querySelector(s),el=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e};
const store={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
let cur=null;
function play(h,btn){if(!h)return;try{if(cur){cur.pause();cur.btn&&cur.btn.classList.remove('pl')}}catch(e){}
 const a=new Audio('audio/'+h+'.mp3');a.btn=btn;btn&&btn.classList.add('pl');a.onended=()=>btn&&btn.classList.remove('pl');a.onerror=()=>{btn&&btn.classList.remove('pl');btn&&(btn.title='음성 파일이 아직 없습니다')};cur=a;a.play().catch(()=>{})}
const pbtn=(h,dis)=>{const b=el('button','pb','▶');b.type='button';b.setAttribute('aria-label','듣기');if(!h)b.style.display='none';b.disabled=!!dis;b.onclick=()=>play(h,b);return b};
const strip=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/ñ/g,'n');
const norm=s=>s.toLowerCase().replace(/[¿?¡!.,;:"“”()]/g,' ').replace(/\s+/g,' ').trim();
const nn=s=>norm(s).normalize('NFC');
// returns 2 exact, 1 accent-lenient, 0 wrong
function cmp(u,alts){const x=nn(u);if(!x)return 0;let r=0;for(const a of alts){const y=nn(a);if(x===y)return 2;if(strip(x)===strip(y))r=1}return r}
function shuffle(a,seed){let s=seed*9301+49297;const r=()=>(s=(s*9301+49297)%233280)/233280;a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function renderLesson(n){const L=window.LESSONS[n];document.title='Lección '+n+' · '+L.es;
 $('#hd').innerHTML=`<div class="num serif" style="color:var(--acc)">LECCIÓN ${n}</div><h1>${L.es}</h1><div class="ko">${L.ko}</div>`;
 const tabs=[['study','학습'],['ex','연습문제'],['vocab','어휘']];if(L.culture)tabs.push(['cul','문화']);
 const tb=$('#tabs');tabs.forEach(([id,t],i)=>{const b=el('button',i?'':'on',t);b.onclick=()=>{[...tb.children].forEach(x=>x.classList.remove('on'));b.classList.add('on');document.querySelectorAll('section.pane').forEach(p=>p.classList.toggle('on',p.id==='p-'+id));scrollTo(0,0)};tb.append(b)});
 // study
 const st=$('#p-study');st.append(el('div','card','<b>핵심 학습 목표</b><ul class="goals">'+L.goals.map(g=>`<li>${g}</li>`).join('')+'</ul>'));
 L.dialogs.forEach(d=>{const c=el('div','card dl','<h3>Diálogo · '+d.title+'</h3>');d.lines.forEach(l=>{const r=el('div','ln');r.append(pbtn(l.au),el('span','sp',l.sp),el('span','',l.es));c.append(r)});st.append(c)});
 L.readings.forEach(r=>{const c=el('div','card','<h3>'+r.title+'</h3>');const t=el('div','rd',r.text);c.append(pbtn(r.au),t);st.append(c)});
 L.grammar.forEach(g=>{const c=el('div','card','<h3>'+g.h+'</h3><div class="tw">'+g.html+'</div>');st.append(c)});
 // vocab
 const vg=el('div','vg');L.vocab.forEach(w=>{const d=el('div');d.append(pbtn(w.au),el('b','',w.es),el('span','',w.ko));vg.append(d)});{const vc=el('div','card');vc.append(vg);$('#p-vocab').append(vc)}
 if(L.culture)$('#p-cul').append(el('div','card','<h3>Cultura</h3><p>'+L.culture+'</p>'));
 // exercises
 const exp=$('#p-ex');const saved=store.get('sp-'+n,{});
 const total=el('div','card score');total.id='tot';exp.append(total);
 const upd=()=>{let c=0,t=0,done=0;L.exercises.forEach(e=>{t+=e.items.length;if(saved[e.id]){c+=saved[e.id].c;done++}});total.innerHTML=`📊 레슨 전체 점수: <span class="ok">${c}</span> / ${t} (${t?Math.round(c/t*100):0}점) · 완료한 연습문제 ${done}/${L.exercises.length}`;
  const all=store.get('sp-all',{});all[n]={c,t,done,tot:L.exercises.length};store.set('sp-all',all)};
 L.exercises.forEach(e=>exp.append(buildEx(n,e,saved,upd)));upd();
}
function buildEx(n,e,saved,upd){const box=el('div','card ex','<h3>'+e.title+'</h3><p class="inst">'+e.inst+'</p>');const rows=[];
 e.items.forEach((it,i)=>{const row=el('div','it');const q=el('div','q');const pb=pbtn(it.au,e.audio==='after');q.append(pb,el('span','qn',(i+1)+'.'));const body=el('div');body.style.flex='1';q.append(body);row.append(q);
  const res=el('div','res');let get;
  if(it.t==='fill'){const parts=it.q.split('____');const ins=[];const sp=el('span');parts.forEach((p,k)=>{sp.append(document.createTextNode(p));if(k<parts.length-1){const inp=el('input','bl');inp.autocomplete='off';inp.autocapitalize='off';inp.spellcheck=false;inp.size=Math.max(8,(it.a[k]||'').split('|')[0].length+2);ins.push(inp);sp.append(inp)}});body.append(sp);
   get=()=>{let all=2;ins.forEach((inp,k)=>{const r=cmp(inp.value,(it.a[k]||'').split('|'));all=Math.min(all,r)});return all};it._ins=ins;it._ans=()=>it.a.map(a=>a.split('|')[0]).join(' / ')}
  else if(it.t==='free'){body.append(el('span','',it.q));const inp=el('input','fr');inp.placeholder='답을 스페인어로 쓰세요';inp.autocomplete='off';inp.spellcheck=false;body.append(inp);it._ins=[inp];
   get=()=>{const v=inp.value;let r=cmp(v,it.a.flatMap(a=>a.split('|')));if(r)return r;if(it.kw&&it.kw.length){const x=strip(nn(v));if(x&&it.kw.every(g=>g.some(k=>x.includes(strip(nn(k))))))return 2}return 0};it._ans=()=>it.model}
  else if(it.t==='tf'){body.append(el('span','',it.q));const o=el('div','opts');['V (참)','F (거짓)'].forEach((t,k)=>{const l=el('label');const r=el('input');r.type='radio';r.name=e.id+i;r.value=k?'0':'1';l.append(r,document.createTextNode(t));o.append(l)});body.append(o);it._ins=[...o.querySelectorAll('input')];
   get=()=>{const c=it._ins.find(x=>x.checked);return c?(c.value==(it.a?'1':'0')?2:0):0};it._ans=()=>it.a?'V (참)':'F (거짓)'}
  else{body.append(el('span','',it.q));const o=el('div','opts');const idx=shuffle(it.opts.map((_,k)=>k),n*100+i+e.id.length);idx.forEach(k=>{const l=el('label');const r=el('input');r.type='radio';r.name=e.id+i;r.value=k;l.append(r,document.createTextNode(it.opts[k]));o.append(l)});body.append(o);it._ins=[...o.querySelectorAll('input')];
   get=()=>{const c=it._ins.find(x=>x.checked);return c&&+c.value===it.a?2:0};it._ans=()=>it.opts[it.a]}
  body.append(res);rows.push({it,row,res,get,pb});box.append(row)});
 const sc=el('div','score');
 const chk=el('button','btn','채점하기');const rs=el('button','btn alt','다시 풀기');
 const show=r=>{let c=0;rows.forEach(({it,row,res,get,pb})=>{const v=get();row.classList.remove('c','w');if(v){c++;row.classList.add('c');res.innerHTML='<span class="ok">✔ 정답</span>'+(v===1?' <span class="no">(악센트/철자 부호를 확인하세요: '+it._ans()+')</span>':'');}else{row.classList.add('w');res.innerHTML='<span class="no">✘ 오답</span> · 정답: <b>'+it._ans()+'</b>'}
   if(it.note)res.innerHTML+='<div style="color:var(--mute)">💡 '+it.note+'</div>';pb.disabled=false});
  sc.innerHTML=`점수: <span class="ok">${c}</span> / ${rows.length} (${Math.round(c/rows.length*100)}점)`;saved[e.id]={c};store.set('sp-'+n,saved);upd()};
 chk.onclick=()=>show();rs.onclick=()=>{rows.forEach(({it,row,res,pb})=>{it._ins.forEach(x=>{if(x.type==='radio')x.checked=false;else x.value=''});row.classList.remove('c','w');res.innerHTML='';pb.disabled=e.audio==='after'});sc.innerHTML='';delete saved[e.id];store.set('sp-'+n,saved);upd()};
 box.append(chk,rs,sc);if(saved[e.id])sc.innerHTML=`지난 점수: ${saved[e.id].c} / ${rows.length}`;return box}
function renderIndex(){const I=window.INDEX;const all=store.get('sp-all',{});let tc=0,tt=0,td=0;const g=$('#grid');
 I.forEach(l=>{const s=all[l.n]||{c:0,t:l.count,done:0,tot:l.ex.length};tc+=s.c;tt+=l.count;td+=s.done;const a=el('a','lc');a.href='lesson.html?n='+l.n;
  a.innerHTML=`<div class="num">LECCIÓN ${String(l.n).padStart(2,'0')}</div><h3>${l.es}</h3><div class="ko">${l.ko}</div><ul style="margin:0 0 10px;padding-left:18px;color:var(--mute);font-size:13px">${l.goals.map(x=>'<li>'+x+'</li>').join('')}</ul><div class="bar"><i style="width:${Math.round(s.c/l.count*100)}%"></i></div><small>문제 ${l.count}개 · 어휘 ${l.vocab}개 · 점수 ${s.c}/${l.count}</small>`;g.append(a)});
 $('#st').innerHTML=`<div class="stat"><b>${I.length}</b>레슨</div><div class="stat"><b>${tt}</b>문제</div><div class="stat"><b>${tc}</b>내 정답 수</div>`}
