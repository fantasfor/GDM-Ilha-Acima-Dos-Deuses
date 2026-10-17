/* ---------- Online: outros jogadores na ilha + chat ----------
   Com conta (js/conta.js, Firebase) usa window.ONLINE_NUVEM em tempo real;
   sem conta conversa com o servidor do jogo (servidor.py, rota /api/online) por sincronização curta.
   Cada aventureiro envia posição, classe, nível e equipamento visível; recebe os demais e o chat.
   Com conta, cada um aparece só para quem está na mesma sala (ilha, DG do grupo ou taverna: js/multiplayer.js)
   e o chat tem dois canais: Global (todos online) e Local (a sala). Sem conta, as DGs são instâncias. */
(function(){
 const nuvem=!!window.CONTA_ATIVA;
 if(MODO.teste||MODO.motor||(!nuvem&&!/^https?:$/.test(location.protocol)))return;
 const KEY='ilha-rpg-online',SYNC_MS=200,BUBBLE_S=6,LOG_MAX=40;
 const store={get(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return {}}},set(v){try{localStorage.setItem(KEY,JSON.stringify(v))}catch(e){}}};
 const cfg=Object.assign({name:''},store.get());
 if(!cfg.name){cfg.name='Aventureiro'+Math.floor(1000+Math.random()*9000);store.set(cfg)}
 let myId=sessionStorage.getItem('ilha-online-id');
 if(!myId){myId='j'+Date.now().toString(36)+Math.random().toString(36).slice(2,8);sessionStorage.setItem('ilha-online-id',myId)}
 const others=new Map(),outbox=[],log=[];
 let since=0,state='conectando',failures=0,busy=false,lastFrame=performance.now(),myBubble=null,unsupported=false;

 /* ---- interface: indicador, registro do chat e campo de mensagem ---- */
 const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e};
 const box=el('section','onlineChat');box.setAttribute('aria-label','Chat online');
 const badge=el('button','onlineBadge');badge.type='button';badge.title='Jogadores online. Clique para conversar.';
 const lines=el('div','onlineLog');lines.setAttribute('role','log');lines.setAttribute('aria-live','polite');
 const form=el('form','onlineForm');form.hidden=true;
 const input=el('input');input.maxLength=140;input.placeholder='Mensagem (Enter envia, Esc fecha) · /nome NovoNome';input.setAttribute('aria-label','Mensagem do chat');input.autocomplete='off';
 // barra: indicador + (com conta) canais Local/Global, Jogadores e Voz (js/voz.js entra aqui)
 const bar=el('div','onlineBar');bar.append(badge);
 let canal='l';const tabs={};
 if(nuvem){
  for(const [id,rotulo,dica] of [['l','Local','Só quem está no mesmo lugar (ilha, DG ou taverna)'],['g','Global','Todos os jogadores online']]){
   const b=el('button','onlineTab',rotulo);b.type='button';b.title=dica;b.onclick=()=>{canal=id;refreshTabs();openChat()};tabs[id]=b;bar.append(b);
  }
  if(window.MP&&MP.botaoPainel)bar.append(MP.botaoPainel);
 }
 function refreshTabs(){for(const id in tabs){tabs[id].classList.toggle('on',canal===id);tabs[id].setAttribute('aria-pressed',String(canal===id))}input.placeholder=(nuvem?(canal==='g'?'[Global] ':'[Local] '):'')+'Mensagem (Enter envia, Esc fecha) · /nome NovoNome'}
 refreshTabs();
 form.append(input);box.append(bar,lines,form);document.body.append(box);
 const fmtTime=t=>new Date(t*1000).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
 function addLine(entry){
  log.push(entry);if(log.length>LOG_MAX)log.shift();
  const row=el('div','onlineLine'+(entry.system?' system':'')+(entry.id===myId?' mine':'')+(entry.canal?' canal-'+entry.canal:''));
  if(entry.system)row.textContent=entry.text;
  else{const who=el('b','',entry.name+': ');row.append(el('time','',fmtTime(entry.t)));if(entry.canal)row.append(el('i','tag',entry.canal==='g'?'G':'L'));row.append(who,document.createTextNode(entry.text))}
  row.dataset.at=String(performance.now());lines.append(row);
  while(lines.childElementCount>LOG_MAX)lines.firstElementChild.remove();
  lines.scrollTop=lines.scrollHeight;
 }
 const system=text=>addLine({system:true,text});
 window.onlineSystem=system;
 // com conta: visível só quem está na mesma sala; sem conta: todos fora das DGs
 const minhaSala=()=>window.MP&&MP.salaAtual?MP.salaAtual():null;
 const visivel=o=>nuvem?!!o.sala&&o.sala===minhaSala():!o.dg&&!window.inDungeon;
 function refreshBadge(){
  const count=[...others.values()].filter(visivel).length;
  const lugar=window.inTaverna?'na taverna':window.inDungeon?'na masmorra':'aqui';
  badge.textContent=state==='online'?(nuvem?'● '+(count+1)+' '+lugar+' · '+(others.size+1)+' online':'● Online · '+(count+1)+' na ilha'):state==='offline'?'○ Offline — tentando reconectar':'○ Conectando…';
  badge.classList.toggle('on',state==='online');
 }
 function openChat(){form.hidden=false;box.classList.add('open');input.focus()}
 function closeChat(){form.hidden=true;box.classList.remove('open');input.value='';input.blur()}
 badge.onclick=()=>form.hidden?openChat():closeChat();
 input.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();closeChat()}});
 form.onsubmit=e=>{
  e.preventDefault();const text=input.value.trim();input.value='';
  if(!text){closeChat();return}
  const rename=text.match(/^\/nome\s+(.+)/i);
  if(rename){
   const name=rename[1].replace(/[^\p{L}\p{N} _-]/gu,'').trim().slice(0,18);
   if(name.length<3){system('O nome precisa de 3 a 18 letras ou números.');return}
   cfg.name=name;store.set(cfg);if(nuvem&&window.ONLINE_NUVEM)ONLINE_NUVEM.rename(name);system('Agora você é '+name+'.');return;
  }
  const msg=text.slice(0,140);
  outbox.push(nuvem?{text:msg,canal}:msg);
  // o balão sobre o personagem aparece no chat local (no global quem fala pode estar longe)
  if(!nuvem||canal==='l')myBubble={text:msg,t:performance.now()/1000};
 };
 addEventListener('keydown',e=>{
  if(e.key!=='Enter'||e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement||document.getElementById('menu')?.classList.contains('open'))return;
  e.preventDefault();openChat();
 });

 /* ---- sincronização com o servidor ---- */
 function snapshot(){
  const eq={};for(const slot of ['he','ch','le','bo','ca','ne','sw','sh'])if(EQ[slot])eq[slot]=EQ[slot].id;
  return {id:myId,name:cfg.name,cls:p.cls,sex:p.sex,lvl:p.lvl,x:Math.round(p.x),y:Math.round(p.y),fx:Math.sign(p.fx||0),fy:Math.sign(p.fy||0),
   hp:Math.max(0,Math.min(1,p.hp/Math.max(1,mhp()))),dead:p.dead>0,dg:!!window.inDungeon,eq,sala:minhaSala()};
 }
 let joined=false;
 async function sync(){
  // só entra na ilha depois de sair do menu inicial; pausas posteriores mantêm o jogador conectado
  if(!joined){if(document.getElementById('menu')?.classList.contains('open'))return;joined=true}
  if(busy||unsupported)return;
  const net=nuvem&&window.ONLINE_NUVEM;
  if(nuvem){if(!net||!net.pronto)return;myId=net.id;cfg.name=net.name}
  busy=true;
  const ctl=new AbortController(),timeout=setTimeout(()=>ctl.abort(),2500);
  try{
   const chat=outbox.splice(0,3);
   let data;
   if(net)data=await net.sync({me:snapshot(),since,chat});
   else{
    const r=await fetch('/api/online',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({me:snapshot(),since,chat}),signal:ctl.signal});
    // hospedagem só de arquivos (GitHub Pages sem Firebase): não há online
    if(r.status===404||r.status===405||r.status===501){unsupported=true;box.hidden=true;return}
    data=await r.json();if(!r.ok||!data.ok)throw new Error(data.erro||'falha');
   }
   receive(data);
   if(state!=='online'){if(state==='offline')system('Conexão restabelecida.');else system('Você entrou como '+cfg.name+'. Enter abre o chat; /nome muda seu nome.')}
   state='online';failures=0;
  }catch(e){
   failures++;if(failures===3){state='offline';system('Sem conexão com o servidor. Tentando novamente…')}
  }finally{clearTimeout(timeout);busy=false;refreshBadge()}
 }
 function receive(data){
  const now=performance.now()/1000,seen=new Set();
  for(const j of data.jogadores||[]){
   seen.add(j.id);let o=others.get(j.id);
   const antes=o&&visivel(o);
   if(!o){o={x:j.x,y:j.y,fx:0,fy:1};others.set(j.id,o)}
   // trocou de lugar (ilha, DG, taverna): as coordenadas são de outro mapa
   if(o.sala!==j.sala){o.x=j.x;o.y=j.y}
   Object.assign(o,{id:j.id,name:j.name,cls:j.cls,sex:j.sex,lvl:j.lvl,tx:j.x,ty:j.y,hp:j.hp,dead:j.dead,dg:j.dg,sala:j.sala,eq:j.eq||{},left:false,at:now});
   if(Math.hypot(o.x-j.x,o.y-j.y)>140){o.x=j.x;o.y=j.y}
   if(j.fx||j.fy){o.fx=j.fx;o.fy=j.fy}
   const agora=visivel(o);
   if(state==='online'&&agora&&!antes)system(j.name+' chegou.');
   else if(state==='online'&&antes&&!agora)system(j.name+' saiu daqui.');
  }
  for(const [id,o] of others)if(!seen.has(id)){if(!o.left&&visivel(o))system(o.name+' saiu.');others.delete(id)}
  for(const m of data.chat||[]){
   since=Math.max(since,m.n);addLine(m);
   if(m.id!==myId&&(!m.canal||m.canal==='l')){const o=others.get(m.id);if(o)o.bubble={text:m.text,t:now}}
  }
 }
 setInterval(sync,SYNC_MS);sync();
 addEventListener('pagehide',()=>{try{if(nuvem)window.ONLINE_NUVEM&&ONLINE_NUVEM.leave();else navigator.sendBeacon('/api/online/sair',JSON.stringify({id:myId}))}catch(e){}});

 /* ---- desenho dos outros jogadores (chamado pelo render.js) ---- */
 const looks=new Map();
 function lookOf(o,dir,ph){
  const own=CL[o.cls]&&CL[o.cls].sprite;if(own)return own;
  const base=CL[o.cls]?.base||(HS[o.cls]?o.cls:'war');
  let key=base+o.sex+dir+ph;const E={nude:1,sex:o.sex==='f'?'f':'m',swing:0,shWeapon:!!(o.eq.sh&&gearType[o.eq.sh]==='sw')};
  for(const [slot,id] of Object.entries(o.eq))if(ITEMS[id]&&gearType[id]){E[slot]=ITEMS[id];key+=slot+id}
  if(!looks.has(key)){if(looks.size>400)looks.clear();looks.set(key,human(base,dir,ph,E))}
  return looks.get(key);
 }
 function bubble(x,y,text){
  ctx.font='5px monospace';ctx.textAlign='center';
  const words=text.split(' '),rows=[];let row='';
  for(const w of words){const next=row?row+' '+w:w;if(ctx.measureText(next).width>70&&row){rows.push(row);row=w}else row=next}
  if(row)rows.push(row);if(rows.length>3){rows.length=3;rows[2]=rows[2].slice(0,-1)+'…'}
  const w=Math.min(78,Math.max(...rows.map(r=>ctx.measureText(r).width))+6),h=rows.length*6+4,bx=Math.round(x-w/2),by=Math.round(y-h);
  ctx.fillStyle='#000a';ctx.fillRect(bx+1,by+1,w,h);ctx.fillStyle='#fdf6e3';ctx.fillRect(bx,by,w,h);ctx.fillRect(Math.round(x)-1,by+h,3,2);
  ctx.fillStyle='#2a2116';rows.forEach((r,i)=>ctx.fillText(r,x,by+6.5+i*6));
 }
 window.onlineDrawables=list=>{
  const now=performance.now(),dt=Math.min(.1,(now-lastFrame)/1000);lastFrame=now;
  const t=now/1000;
  if(myBubble&&t-myBubble.t<BUBBLE_S&&p.dead<=0&&(nuvem||!window.inDungeon)){const b=myBubble;list.push([p.y+.1,()=>bubble(p.x,p.y-34,b.text)])}
  if(window.vozFalando&&vozFalando(myId)&&p.dead<=0)list.push([p.y+.2,()=>falaIcone(p.x,p.y-30)]);
  for(const o of others.values()){
   if(!visivel(o)||o.tx==null)continue;
   const k=Math.min(1,dt*10);o.x+=(o.tx-o.x)*k;o.y+=(o.ty-o.y)*k;
   if(Math.abs(o.x-p.x)>320||Math.abs(o.y-p.y)>240)continue;
   list.push([o.y,()=>{
    const f=face(o),an=anim(o,0);ctx.globalAlpha=o.dead?.35:1;
    dr(lookOf(o,f.d,an.ph||0),o.x,o.y,f.fl,1,an);ctx.globalAlpha=1;
    ctx.font='6px monospace';ctx.textAlign='center';
    const label=o.name+' · Nv '+o.lvl;ctx.fillStyle='#000';ctx.fillText(label,o.x+.5,o.y-27.5);ctx.fillStyle='#9fe3ff';ctx.fillText(label,o.x,o.y-28);
    const w=24,bx=Math.round(o.x-w/2),by=Math.round(o.y-25);ctx.fillStyle='#000a';ctx.fillRect(bx-.5,by-.5,w+1,3);ctx.fillStyle='#173d1c';ctx.fillRect(bx,by,w,2);ctx.fillStyle='#4cd04f';ctx.fillRect(bx,by,w*o.hp,2);
    if(o.bubble&&t-o.bubble.t<BUBBLE_S)bubble(o.x,o.y-36,o.bubble.text);
    else if(window.vozFalando&&vozFalando(o.id))falaIcone(o.x,o.y-36);
   }]);
  }
 };
 // ícone de quem está falando no chat de voz: alto-falante com ondas
 function falaIcone(x,y){
  const r=(a,b,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x+a),Math.round(y+b),w,h)};
  r(-5,-3,10,7,'#0009');r(-4,-1,2,3,'#9be7a8');r(-2,-2,1,5,'#9be7a8');
  const k=Math.floor(performance.now()/180)%3;if(k>0)r(1,-1,1,3,'#e9fff0');if(k>1)r(3,-2,1,5,'#e9fff0');
 }
 window.onlineMinimap=(g,ox,oy,k,size)=>{
  for(const o of others.values()){
   if(!visivel(o)||o.tx==null)continue;const x=(o.x-ox)*k,y=(o.y-oy)*k;if(x<0||y<0||x>size||y>size)continue;
   g.fillStyle='#000';g.fillRect(Math.round(x)-3,Math.round(y)-3,6,6);g.fillStyle='#5fd4ff';g.fillRect(Math.round(x)-2,Math.round(y)-2,4,4);
  }
 };
 // as mensagens antigas somem da tela quando o chat está fechado
 setInterval(()=>{const now=performance.now();for(const row of lines.children)row.classList.toggle('old',now-Number(row.dataset.at)>15000)},1000);
 refreshBadge();
})();
