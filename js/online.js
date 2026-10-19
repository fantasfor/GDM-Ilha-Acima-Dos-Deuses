/* ---------- Online: outros jogadores na ilha + chat ----------
   Com conta (js/conta.js, Firebase) usa window.ONLINE_NUVEM em tempo real;
   sem conta conversa com o servidor do jogo (servidor.py, rota /api/online) por sincronização curta.
   Cada aventureiro envia posição, classe, nível e equipamento visível; recebe os demais e o chat.
   Com conta, cada um aparece só para quem está na mesma sala (ilha, DG do grupo ou taverna: js/multiplayer.js)
   e o chat tem dois canais: Global (todos online) e Local (a sala). Sem conta, as DGs são instâncias. */
(function(){
 const nuvem=!!window.CONTA_ATIVA;
 if(MODO.teste||MODO.motor||(!nuvem&&!/^https?:$/.test(location.protocol)))return;
 const KEY='ilha-rpg-online',SYNC_MS=nuvem?100:200,BUBBLE_S=6,LOG_MAX=40,SOM_ALCANCE=330;
 const store={get(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return {}}},set(v){try{localStorage.setItem(KEY,JSON.stringify(v))}catch(e){}}};
 const cfg=Object.assign({name:''},store.get());
 if(!cfg.name){cfg.name='Aventureiro'+Math.floor(1000+Math.random()*9000);store.set(cfg)}
 let myId=sessionStorage.getItem('ilha-online-id');
 if(!myId){myId='j'+Date.now().toString(36)+Math.random().toString(36).slice(2,8);sessionStorage.setItem('ilha-online-id',myId)}
 const others=new Map(),outbox=[],log=[];
 window.ONLINE_OUTROS=others; // jogadores desenhados (para depuração e testes)
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
  if(window.MP&&MP.botaoPainel)bar.append(MP.botaoPainel); }
 function refreshTabs(){for(const id in tabs){tabs[id].classList.toggle('on',canal===id);tabs[id].setAttribute('aria-pressed',String(canal===id))}input.placeholder=(nuvem?(canal==='g'?'[Global] ':'[Local] '):'')+'Mensagem (Enter envia, Esc fecha) · /nome NovoNome'}
 refreshTabs();
 form.append(input);box.append(bar,lines,form);document.body.append(box);
 const fmtTime=t=>new Date(t*1000).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
 function addLine(entry){
  log.push(entry);if(log.length>LOG_MAX)log.shift();
  const row=el('div','onlineLine'+(entry.system?' system':'')+(entry.id===myId?' mine':'')+(entry.canal?' canal-'+entry.canal:''));
  if(entry.system)row.textContent=entry.text;
  else{const who=el('b','',entry.name+': ');row.append(el('time','',fmtTime(entry.t)));if(entry.canal)row.append(el('i','tag',{g:'G',l:'L',s:'S'}[entry.canal]||'?'));row.append(who,document.createTextNode(entry.text))}
  row.dataset.at=String(performance.now());lines.append(row);
  while(lines.childElementCount>LOG_MAX)lines.firstElementChild.remove();
  lines.scrollTop=lines.scrollHeight;
 }
 const system=text=>addLine({system:true,text});
 window.onlineSystem=system;window.onlineLinha=addLine;
 window.abrirChatCom=texto=>{openChat();input.value=texto;input.setSelectionRange(texto.length,texto.length)};
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
  // sussurro: "/s Nome mensagem" (ou /w) e "/r mensagem" responde o último que sussurrou para você
  const sus=text.match(/^\/(s|w|sussurrar)\s+(.+)/i),resp=text.match(/^\/r\s+(.+)/i);
  if(sus||resp){
   if(!nuvem||!window.MP||!MP.sussurrar){system('Sussurros precisam de conta (online pela nuvem).');return}
   let alvo=null,msg='';
   if(resp){alvo=MP.ultimoSussurro;msg=resp[1];if(!alvo){system('Ninguém sussurrou para você ainda.');return}}
   else{const r=MP.resolverSussurro(sus[2]);if(!r){system('Jogador não encontrado. Use /s Nome mensagem (precisa estar online ou ser seu amigo).');return}alvo=r.id;msg=r.msg}
   if(!msg){system('Escreva a mensagem depois do nome.');return}
   MP.sussurrar(alvo,msg);return;
  }
  const rename=text.match(/^\/nome\s+(.+)/i);
  if(rename){
   const name=rename[1].replace(/[^\p{L}\p{N} _-]/gu,'').trim().slice(0,18);
   if(name.length<3){system('O nome precisa de 3 a 18 letras ou números.');return}
   // com conta, o nome precisa estar livre (ninguém pode ter o mesmo)
   if(nuvem&&window.ONLINE_NUVEM){ONLINE_NUVEM.rename(name).then(ok=>{if(ok){cfg.name=name;system('Agora você é '+name+'.')}else system('O nome '+name+' já está em uso ou é inválido.')});return}
   cfg.name=name;store.set(cfg);system('Agora você é '+name+'.');return;
  }
  const msg=text.slice(0,140);
  outbox.push(nuvem?{text:msg,canal}:msg);
  // o balão sobre o personagem aparece no chat local (no global quem fala pode estar longe)
  if(!nuvem||canal==='l')myBubble={text:msg,t:performance.now()/1000};
  closeChat();
 };
 addEventListener('keydown',e=>{
  if(TECLAS.acao(e)!=='chat'||document.getElementById('menu')?.classList.contains('open')||document.getElementById('conta')?.classList.contains('open'))return;
  e.preventDefault();openChat();
 });

 /* ---- sons de combate: os golpes e habilidades deste jogador tocam para os outros da sala ---- */
 const filaSons=[];
 window.somDoJogador=token=>{if(nuvem&&filaSons.length<6)filaSons.push(token)};
 /* habilidades: tudo o que a habilidade criou na tela (círculos, efeitos, projéteis, meteoros e as partículas
    do tipo dela) vai num evento só, "k;...", e os outros jogadores reproduzem o visual, sem dano */
 const hex=c=>/^#[0-9a-fA-F]{3,8}$/.test(c||'')?c.slice(1):'';
 const nomeLimpo=t=>String(t||'').replace(/[^a-z]/gi,'').slice(0,12);
 // lancar (combat.js) é o momento em que a habilidade sai: na hora, ou no fim do tempo de conjuração
 if(nuvem&&typeof lancar==='function'){
  const cast0=lancar;
  lancar=function(s){
   const t0=s.t,px=p.x,py=p.y,nf=fxs.length,np=proj.length,nm=mets.length,ng=window.EFX?EFX.total:0,nv=window.VFX?VFX.total:0;
   const r=cast0.apply(this,arguments);
   if(s&&s.t>t0&&!window.inTaverna){
    const R=Math.round,partes=['e:'+nomeLimpo(s.effect||'x')+':'+hex(s.vfxColor||'#9bd4ff')+':'+R(+s.radius||40)+':'+R(px)+':'+R(py)+':'+R(p.x)+':'+R(p.y)];
    for(const f of fxs.slice(nf,nf+4))partes.push('f:'+R(f.x)+':'+R(f.y)+':'+R(f.r)+':'+hex(f.c)+':'+R((f.d||.4)*100)+':'+nomeLimpo(f.style));
    for(const q of proj.slice(np,np+3)){const tx=q.tg?q.tg.x:q.x+q.vx*q.t,ty=q.tg?q.tg.y-8:q.y+q.vy*q.t;partes.push('p:'+R(q.x)+':'+R(q.y)+':'+R(tx)+':'+R(ty)+':'+hex(q.c)+(q.seta?':s':''))}
    for(const m of mets.slice(nm,nm+2))partes.push('m:'+R(m.x)+':'+R(m.y));
    // animações do pacote de efeitos (g:folha.linha.grupo:x:y:ângulo×100:escala×10:duração×100)
    // logo depois do 'e' (antes dos círculos simples) para não cair no corte de 200 caracteres
    const kv=window.VFX?Math.min(2,VFX.total-nv):0;if(kv>0)partes.splice(1,0,...VFX.recentes.slice(-kv).map(v=>'v:'+v.tipo+':'+R(v.x)+':'+R(v.y)+':'+R((v.ang||0)*100)+':'+R(v.raio||0)+':'+R((v.arco||0)*100)+':'+hex(v.cor||'')));
    if(p.canal&&p.canal.visual)partes.splice(1,0,'r:'+R(p.canal.r*10)+':'+p.canal.visual.raio+':'+hex(p.canal.visual.cor));
    const kg=window.EFX?Math.min(2,EFX.total-ng):0;if(kg>0)partes.splice(1,0,...EFX.recentes.slice(-kg).map(g=>'g:'+g.id+':'+R(g.x)+':'+R(g.y)+':'+R(g.ang*100)+':'+R(g.esc*10)+':'+R(g.dur*100)));
    // grito/aura: os efeitos chegam aos aliados perto de quem lançou (a:tipo:força:duração×10:raio), logo depois do 'e' para não cair no corte de 200 caracteres
    if(s.effect==='aura'&&Array.isArray(s.efs))for(const f of s.efs.slice(0,2))partes.splice(1,0,'a:'+nomeLimpo(f.type)+':'+R(+f.power||0)+':'+R((+f.dur||3)*10)+':'+R((+s.radius||40)*(typeof areaMultiplier==='function'?areaMultiplier(p):1)));
    let tok='k;'+partes.join(';');while(tok.length>200&&tok.includes(';'))tok=tok.slice(0,tok.lastIndexOf(';'));
    if(filaSons.length>=6)filaSons.shift();filaSons.push(tok);
   }
   return r;
  };
 }
 /* aura de um aliado (Grito de Guerra): quem estiver no raio fica com aura e contorno na minha tela (js/vfx-habilidades.js) */
 window.marcarAura=(x,y,r,cor,dur)=>{const ate=performance.now()/1000+dur;for(const o of others.values())if(o.x!=null&&Math.hypot(o.x-x,o.y-y)<=r)o.vfxAura={ate,cor}};
 function habilidadeRemota(tok,quem){
  const n=v=>Number(v)||0,cor=c=>c?'#'+c:null;let ox=null,oy=null;
  for(const parte of tok.split(';').slice(1)){
   const a=parte.split(':');
   if(a[0]==='e'){ox=n(a[6]);oy=n(a[7])}
   // aura de um aliado (ex.: Grito de Guerra): vale para mim se eu estiver no raio; na arena não vale (lá são adversários)
   if(a[0]==='a'){if(ox!=null&&!window.inArena&&FX_INFO[a[1]]){const dur=Math.max(.5,n(a[3])/10);if(FX_INFO[a[1]].aura)marcarAura(ox,oy,n(a[4]),FX_INFO[a[1]].c,dur);
     if(p.hp>0&&!(p.dead>0)&&Math.hypot(p.x-ox,p.y-oy)<=n(a[4]))applyFx(p,[{caster:p,self:true,type:a[1],chance:100,dur,pw:n(a[2])}])}continue}
   // efeitos desenhados (js/vfx-habilidades.js): v:tipo:x:y:ângulo×100:raio:arco×100:cor
   if(a[0]==='v'&&window.VFX){VFX.tocar(a[1],{x:n(a[2]),y:n(a[3]),ang:n(a[4])/100,raio:n(a[5]),arco:n(a[6])/100,cor:cor(a[7])||undefined});continue}
   // giro de um aliado: r:duração×10:raio:cor (a lâmina roda em volta dele)
   if(a[0]==='r'&&quem){quem.vfxGiro={ate:performance.now()/1000+n(a[1])/10,raio:n(a[2]),cor:cor(a[3])||'#d8e6ff'};continue}
   if(a[0]==='e'&&window.efeitoVisualHabilidade)efeitoVisualHabilidade(a[1],cor(a[2])||'#9bd4ff',n(a[3])||40,n(a[6]),n(a[7]),n(a[4]),n(a[5]));
   else if(a[0]==='f')fxs.push({x:n(a[1]),y:n(a[2]),r:Math.min(80,n(a[3])),c:cor(a[4])||'#9bd4ff',t:0,d:Math.max(.1,Math.min(2,n(a[5])/100)),...(a[6]?{style:a[6]}:{})});
   else if(a[0]==='p'&&window.projetilVisual)projetilVisual(n(a[1]),n(a[2]),n(a[3]),n(a[4]),cor(a[5]),a[6]==='s');
   else if(a[0]==='m'&&window.meteoroVisual)meteoroVisual(n(a[1]),n(a[2]));
   else if(a[0]==='g'&&window.EFX)EFX.tocar(a[1],n(a[2]),n(a[3]),{ang:n(a[4])/100,esc:Math.max(.2,n(a[5])/10),dur:Math.max(.1,n(a[6])/100)});
  }
 }
 function tocarSomRemoto(token,vol){
  const ps=window.playEntitySound,pg=window.playGameSound;let m;
  if((m=token.match(/^h\.(.+)\.([01])$/))){if(!(ps&&ps('monsters',m[1],'hurt',vol))&&pg)pg(m[2]==='1'?'magicHit':'sword',vol)}
  else if((m=token.match(/^c\.(.+)$/))){if(!(ps&&ps('skills',m[1],'cast',vol))&&pg)pg('magic',vol)}
  else if((m=token.match(/^b\.(skills|items)\.(.+)\.(\w+)$/))&&ps)ps(m[1],m[2],m[3],vol);
  else if((m=token.match(/^b\.(.+)$/))&&ps)ps('skills',m[1],'cast',vol);
 }
 // eventos de combate de outro jogador: a.x.y = golpe (animação), v.estilo.cor.raio.x.y = efeito de habilidade; o resto é som
 if(nuvem&&window.ONLINE_NUVEM)ONLINE_NUVEM.aoSom=(id,tokens,r)=>{
  const o=others.get(id);
  const d=Math.hypot(r.x-p.x,r.y-p.y),vol=.75*Math.max(.15,1-d/SOM_ALCANCE);
  let atraso=0;
  for(const t of tokens.slice(0,6)){
   let m;
   if(t.startsWith('k;')){if(d<SOM_ALCANCE*1.5)habilidadeRemota(t,o)}
   else if((m=t.match(/^a\.(-?\d+)\.(-?\d+)$/))){if(o){o.aw=.25;o.wt={x:+m[1],y:+m[2]};o.fx=o.wt.x-r.x;o.fy=o.wt.y-r.y}}
   else if((m=t.match(/^v\.([a-z]+)\.([0-9a-fA-F]{3,8})\.(\d+)\.(-?\d+)\.(-?\d+)$/))){if(d<SOM_ALCANCE*1.5)fxs.push({x:+m[4],y:+m[5],r:Math.min(52,+m[3]),c:'#'+m[2],t:0,d:.55,style:m[1]})}
   else if(d<=SOM_ALCANCE)setTimeout(()=>tocarSomRemoto(t,vol),(atraso++)*60); // mais baixo com a distância
  }
 };

 /* ---- sincronização com o servidor ---- */
 function snapshot(){
  const eq={};for(const slot of ['he','ch','le','bo','ca','ne','sw','sh'])if(EQ[slot])eq[slot]=EQ[slot].id;
  return {id:myId,name:cfg.name,cls:p.cls,sex:p.sex,ap:window.APARENCIA?APARENCIA.codificar(APARENCIA.normalizar(p.look,p.sex)):'',lvl:p.lvl,x:Math.round(p.x),y:Math.round(p.y),fx:Math.sign(p.fx||0),fy:Math.sign(p.fy||0),
   hp:Math.max(0,Math.min(1,p.hp/Math.max(1,mhp()))),mp:Math.max(0,Math.min(1,p.mp/Math.max(1,mmp()))),dead:p.dead>0,dg:!!window.inDungeon,eq,sala:minhaSala(),
   ping:window.REDE?REDE.ping:0,sons:filaSons.splice(0)};
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
   Object.assign(o,{id:j.id,name:j.name,cls:j.cls,sex:j.sex,ap:j.ap||'',lvl:j.lvl,tx:j.x,ty:j.y,hp:j.hp,mp:j.mp,dead:j.dead,dg:j.dg,sala:j.sala,eq:j.eq||{},ping:j.ping||0,left:false,at:now});
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
 function lookOf(o,dir,ph,swing=0){
  const own=CL[o.cls]&&CL[o.cls].sprite;if(own)return own;
  const base=CL[o.cls]?.base||(HS[o.cls]?o.cls:'war');
  let key=base+o.sex+dir+ph+'w'+swing+(o.ap||'')+(window.HEROI_MANA?'m'+HEROI_MANA.versao():'');const E={nude:1,sex:o.sex==='f'?'f':'m',swing,shWeapon:!!(o.eq.sh&&gearType[o.eq.sh]==='sw')};
  if(window.APARENCIA)E.look=APARENCIA.decodificar(o.ap,E.sex); // aparência escolhida na criação (pele, cabelo, olhos, estilo)
  for(const [slot,id] of Object.entries(o.eq))if(ITEMS[id]&&gearType[id]){E[slot]=ITEMS[id];key+=slot+id}
  key+=chaveEquipAnim(Object.values(E),dir,swing?'attack':ph?'walk':'idle');
  if(!looks.has(key)){if(looks.size>400)looks.clear();looks.set(key,human(base,dir,ph,E))}
  return looks.get(key);
 }
 // sprite de frente de outro jogador (retratos do grupo da DG e do Social)
 window.spriteDeJogador=id=>{const o=window.ONLINE_NUVEM&&ONLINE_NUVEM.outros&&ONLINE_NUVEM.outros.get(id);if(!o||!o.cls)return null;try{return lookOf({...o,eq:o.eq||{}},'d',0)}catch(e){return null}};
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
   // com conta: posição interpolada entre as amostras recebidas (movimento liso mesmo com a rede oscilando)
   const q=nuvem&&window.ONLINE_NUVEM&&ONLINE_NUVEM.posicao?ONLINE_NUVEM.posicao(o.id):null;
   if(q){o.x=q.x;o.y=q.y}
   else{const k=Math.min(1,dt*10);o.x+=(o.tx-o.x)*k;o.y+=(o.ty-o.y)*k}
   if(Math.abs(o.x-p.x)>320||Math.abs(o.y-p.y)>240)continue;
   if(o.aw>0)o.aw=Math.max(0,o.aw-dt);
   list.push([o.y,()=>{
    // golpe: mesma animação do próprio jogador (avanço na direção do alvo e balanço da arma)
    const f=face(o),an=anim(o,.25),lg=lunge(o,o.wt,o.aw,.25);ctx.globalAlpha=o.dead?.35:1;
    // aliado girando: roda o desenho e a lâmina junto (js/vfx-habilidades.js)
    if(o.vfxGiro&&o.vfxGiro.ate>t){const ang=t*Math.PI*2*2.2;o.fx=Math.cos(ang);o.fy=Math.sin(ang);o.fk=undefined}
    const f2=o.vfxGiro&&o.vfxGiro.ate>t?face(o):f;
    dr.ent=o;dr(lookOf(o,f2.d,an.ph||0,an.sw||0),o.x+lg[0],o.y+lg[1],f2.fl,1,an);ctx.globalAlpha=1;
    if(o.vfxGiro&&o.vfxGiro.ate>t&&window.VFX)VFX.lamina(ctx,o.x,o.y-8,o.vfxGiro.raio,t*Math.PI*2*2.2,o.vfxGiro.cor);
    // nome na fonte dos rótulos do jogo; barras de vida e mana iguais às do jogador, com o nível à esquerda
    ctx.font='5px monospace';ctx.textAlign='center';ctx.textBaseline='alphabetic';
    ctx.fillStyle='#000';ctx.fillText(o.name,o.x+.4,o.y-27.6-ACIMA_HEROI());ctx.fillStyle='#9fe3ff';ctx.fillText(o.name,o.x,o.y-28-ACIMA_HEROI());
    const barW=28,tt=1/S,bx=Math.round(o.x-barW/2),by=Math.round(o.y-25-ACIMA_HEROI()),hp=Math.max(0,Math.min(1,+o.hp||0)),mp=Math.max(0,Math.min(1,+o.mp||0));
    ctx.fillStyle='#3a3a3a';ctx.fillRect(bx-tt,by-tt,barW+2*tt,3+3*tt);
    ctx.fillStyle='#173d1c';ctx.fillRect(bx,by,barW,2);ctx.fillStyle='#4cd04f';ctx.fillRect(bx,by,barW*hp,2);
    ctx.fillStyle='#10203a';ctx.fillRect(bx,by+2+tt,barW,1);ctx.fillStyle='#3985ed';ctx.fillRect(bx,by+2+tt,barW*mp,1);
    ctx.textBaseline='middle';ctx.textAlign='right';ctx.fillStyle='#000';ctx.fillText(String(o.lvl||1),bx-1.6,by+2);ctx.fillStyle='#fff2d7';ctx.fillText(String(o.lvl||1),bx-2,by+1.6);
    ctx.textAlign='center';ctx.textBaseline='alphabetic';
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
