/* ---------- Biblioteca de DGs do projeto ----------
   As DGs ficam em PROJETO.dgs ({version:2, activeId, dungeons:[{id, config}]}) e são editadas pela Engine. */
(function(){
 const clone=value=>JSON.parse(JSON.stringify(value));
 // DG de chão pintado vale com o chão (as áreas são opcionais); DG antiga precisa de salas
 const validConfig=config=>Array.isArray(config?.rooms)&&(config.rooms.length>0||!!(config.pintado&&config.chao&&Object.keys(config.chao).length))&&config.rooms.every(room=>room&&[room.x,room.y,room.w,room.h].every(Number.isFinite)&&room.w>0&&room.h>0);
 window.normalizeDungeonLibrary=value=>{
  if(value?.version!==2||!Array.isArray(value.dungeons))return {version:2,activeId:null,dungeons:[]};
  const ids=new Set(),dungeons=[];
  for(const entry of value.dungeons){
   if(!entry||typeof entry.id!=='string'||!entry.id.trim()||ids.has(entry.id)||!validConfig(entry.config)){console.warn('DG inválida ignorada:',entry&&entry.id);continue}
   ids.add(entry.id);dungeons.push(clone(entry));
  }
  return {version:2,activeId:ids.has(value.activeId)?value.activeId:dungeons[0]?.id||null,dungeons};
 };
 const library=window.normalizeDungeonLibrary(typeof PROJETO!=='undefined'?PROJETO.dgs:null);
 window.getDungeonLibrary=()=>clone(library);
 window.getActiveDungeonId=()=>(library.dungeons.find(d=>d.id==window.currentDungeonId)||library.dungeons.find(d=>d.id==library.activeId)||library.dungeons[0])?.id;
 window.getActiveDungeonConfig=()=>{
  const entry=library.dungeons.find(d=>d.id==window.currentDungeonId)||library.dungeons.find(d=>d.id==library.activeId)||library.dungeons[0];
  return clone(entry?.config||{rooms:[],corridors:[],mobs:[],chests:[],decorations:[],torches:[],doors:[]});
 };
 /* ---------- recordes (por navegador) ---------- */
 const REC='ilha-rpg-dg-recordes';
 const records=()=>{try{return JSON.parse(localStorage.getItem(REC)||'{}')||{}}catch(e){return {}}};
 window.recordDungeonClear=(id,ms)=>{const r=records(),o=r[id]||{clears:0,best:0};o.clears++;if(ms>0&&(!o.best||ms<o.best))o.best=Math.round(ms);r[id]=o;try{localStorage.setItem(REC,JSON.stringify(r))}catch(e){}return o};
 const fmtTime=ms=>{const s=Math.round(ms/1000);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};

 /* ---------- menu do portal ---------- */
 const E=(t,c,text)=>{const e=document.createElement(t);if(c)e.className=c;if(text!=null)e.textContent=text;return e};
 const src=c=>!c?'':typeof c=='string'?c:c.toDataURL?c.toDataURL():'';
 const THEME={cave:'Caverna',underground:'Subterrâneo',forest:'Floresta'};
 const TIER={blue:['Azul','#4f9af0'],purple:['Roxo','#c060f0'],gold:['Dourado','#ffb830'],random:['Aleatório','#c9b88f']};
 const isBossMob=m=>!!m.isBoss||['boss','grandboss'].includes(MONSTER_TYPES[m.type]?.bossType);
 function monsterImg(m){
  if(m.sprite&&typeof pixelArt=='function'){const c=pixelArt(m.sprite);if(c)return src(c)}
  if(m.type==='goblinBoss')return src(window.DG_BOSS_ICONS&&DG_BOSS_ICONS.goblin);
  const t=MONSTER_TYPES[m.type];if(t&&t.sprite)return src(t.sprite);
  const base=(MB[m.type]||{}).base;return src(SP[base]&&SP[base].d);
 }
 function info(entry){
  const c=entry.config,mobs=c.mobs||[],spawns=(c.spawns||[]).filter(s=>s&&!s.disabled);
  const boss=mobs.find(isBossMob)||{type:'goblinBoss',name:'Lorde Goblin Demoníaco'};
  const bossName=boss.name||MONSTER_TYPES[boss.type]?.name||'Chefe';
  const lvls=[...mobs.map(m=>+m.lvl||4),...spawns.filter(s=>s.levelMode==='fixed').map(s=>+s.level||1)];
  const rec=+c.recLevel||(lvls.length?Math.round(lvls.reduce((a,b)=>a+b,0)/lvls.length):Math.max(5,p.lvl+1));
  const drops=new Set();
  for(const ch of c.chests||[])for(const it of ch.loot?.items||[])if(ITEMS[it.id])drops.add(it.id);
  for(const d of MONSTER_TYPES[boss.type]?.drops||[]){const id=d&&d.id||d;if(ITEMS[id])drops.add(id)}
  const tiers={};for(const ch of c.chests||[]){const k=ch.randomTier?'random':ch.tier||'blue';tiers[k]=(tiers[k]||0)+1}
  const waves=spawns.reduce((n,s)=>n+(s.respawnMode==='once'?1:+s.waves||0),0);
  return{c,boss,bossName,rec,minLevel:+c.minLevel||0,drops:[...drops].slice(0,10),tiers,mobs:mobs.length,spawns:spawns.length,waves};
 }
 /* ---------- prévia da DG no fundo do painel: o mapa (chão, paredes, decorações, tochas e baús) com os monstros no
    lugar, e a câmera viajando devagar de sala em sala ---------- */
 const mapas=new Map();
 // desenho do monstro como canvas/imagem (o sprite pode vir como conjunto de direções {d,s,u})
 const comoImg=v=>!v?null:(v.getContext||v instanceof HTMLImageElement)?v:v.d&&(v.d.getContext||v.d instanceof HTMLImageElement)?v.d:null;
 function imgMonstro(tipo){if(tipo==='goblinBoss'&&window.DG_BOSS_ICONS&&comoImg(DG_BOSS_ICONS.goblin))return comoImg(DG_BOSS_ICONS.goblin);const t=MONSTER_TYPES[tipo];const s=t&&(comoImg(t.sprite)||comoImg(t.sp));if(s)return s;const b=(MB[tipo]||{}).base;return comoImg(SP[b])}
 function mapaDG(entry){
  if(mapas.has(entry.id))return mapas.get(entry.id);let m=null;
  try{
   const c=entry.config,tema=c.theme||'cave',temas=window.DG_DRAW&&DG_DRAW.temas||{},cores=temas[tema]||temas.cave;
   const tiles=c.pintado&&c.chao&&Object.keys(c.chao).length?c.chao:CHAO.dgDeSalas([...(c.rooms||[]),...(c.corridors||[])]);
   const arte=d=>d&&typeof pixelArt=='function'?pixelArt(d):null,gd=id=>window.gameArtData?gameArtData(id):null;
   const camada=CHAO.dgCamada(tiles,CHAO.texturas(PROJ.pixel),{piso:arte(c.art&&c.art.floor||gd('dg-floor-'+tema)),parede:arte(c.art&&c.art.wall||gd('dg-wall-'+tema)||(tema==='forest'?CHAO.paredeFloresta():null)),cores});
   if(camada){
    const g=camada.c.getContext('2d');g.save();g.translate(-camada.x,-camada.y);for(const d of c.decorations||[])try{DG_DRAW.decoracao(d,g)}catch(e){}g.restore();
    const salas=(c.rooms||[]).map(r=>({x:r.x+r.w/2,y:r.y+r.h/2}));
    m={camada,pontos:salas.length>1?salas:[{x:camada.x+camada.c.width*.3,y:camada.y+camada.c.height*.4},{x:camada.x+camada.c.width*.7,y:camada.y+camada.c.height*.6}],cores,ladrilhos:Object.keys(tiles).length};
   }
  }catch(e){console.warn('prévia da DG:',e)}
  mapas.set(entry.id,m);return m;
 }
 function iniciarPrevia(cv,entry){
  const m=mapaDG(entry);if(!m)return()=>{};
  let vivo=true,t=Math.random()*20,last=performance.now();const g=cv.getContext('2d'),c=entry.config;
  const mons=[...(c.mobs||[]).map(x=>({tipo:x.type,x:x.x,y:x.y})),...(c.spawns||[]).filter(s=>s&&!s.disabled).map(s=>({tipo:(s.monsters&&s.monsters[0]&&s.monsters[0].id)||'',x:s.x,y:s.y}))]
   .map(o=>({...o,img:imgMonstro(o.tipo),fase:Math.random()*6}));
  const passo=now=>{
   if(!vivo||!cv.isConnected||!cv.closest('.open'))return; // painel fechado ou trocado: para de desenhar
   const dt=Math.min(.05,(now-last)/1000);last=now;t+=dt;
   const W=cv.clientWidth|0,H=cv.clientHeight|0;if(!W||!H){requestAnimationFrame(passo);return}if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H}
   const S=Math.max(2,Math.round(Math.min(W,H)/200)),P=m.pontos,n=P.length,k=(t*.05)%n,i=Math.floor(k),f=k-i,e=f*f*(3-2*f),a=P[i],b=P[(i+1)%n];
   const cx=a.x+(b.x-a.x)*e,cy=a.y+(b.y-a.y)*e;
   g.setTransform(1,0,0,1,0,0);g.fillStyle='#0d0d0d';g.fillRect(0,0,W,H);
   g.setTransform(S,0,0,S,Math.round(W/2-cx*S),Math.round(H/2-cy*S));g.imageSmoothingEnabled=false;
   g.drawImage(m.camada.c,m.camada.x,m.camada.y);
   for(const ch of c.chests||[]){g.fillStyle='#3e2614';g.fillRect(ch.x-6,ch.y-5,12,9);g.fillStyle='#7a4a25';g.fillRect(ch.x-5,ch.y-4,10,7);g.fillStyle=(TIER[ch.randomTier?'random':ch.tier||'blue']||TIER.blue)[1];g.fillRect(ch.x-5,ch.y-2,10,1)}
   for(const tc of c.torches||[]){const fl=Math.sin(t*11+tc.x)*.5+.5;g.fillStyle='rgba(255,160,60,'+(.1+.06*fl).toFixed(3)+')';g.beginPath();g.arc(tc.x,tc.y-2,20,0,7);g.fill();g.fillStyle='#33271f';g.fillRect(tc.x-1,tc.y-2,3,5);g.fillStyle='#ea580c';g.fillRect(tc.x-1,tc.y-6,3,4);g.fillStyle='#fde047';g.fillRect(tc.x,tc.y-5,1,2+(fl>.5?1:0))}
   for(const o of mons){if(!o.img)continue;const q=o.img.q||1,w=o.img.width/q,h=o.img.height/q,bob=Math.round(Math.sin(t*3+o.fase));
    g.fillStyle='#0007';g.fillRect(Math.round(o.x-w/3),Math.round(o.y)+1,Math.round(w*2/3),2);g.drawImage(o.img,Math.round(o.x-w/2),Math.round(o.y-h+3+bob),w,h)}
   requestAnimationFrame(passo)};
  requestAnimationFrame(passo);return()=>{vivo=false};
 }
 function difficulty(rec){const d=rec-p.lvl;return d<=-5?['Fácil','#7bd389']:d<=1?['Normal','#e7cb88']:d<=4?['Difícil','#f0a052']:['Mortal','#ff6b5a']}
 let selected=null;try{selected=localStorage.getItem('ilha-rpg-dg-escolhida')}catch(e){}
 window.showProjectDungeonMenu=()=>{
  const box=document.getElementById('dialogue');
  box.replaceChildren();box.classList.add('dgModal','open');
  const close=()=>box.classList.remove('open','dgModal');
  const root=E('div','dgm');
  // fundo: a prévia animada da DG escolhida (por baixo de tudo) e um véu escuro nas laterais
  const cvPrevia=E('canvas','dgm-preview'),veu=E('div','dgm-veu');let pararPrevia=()=>{};
  root.append(cvPrevia,veu);
  const head=E('header','dgm-head');head.append(E('b','dgm-title','Portal do Acampamento'),E('small','dgm-sub','Escolha uma masmorra · você está no nível '+p.lvl));
  root.append(head);
  if(!library.dungeons.length){root.append(E('p','dgm-empty','Nenhuma DG disponível no momento.'));box.append(root);return}
  if(!library.dungeons.some(d=>d.id===selected))selected=library.dungeons[0].id;
  const list=E('div','dgm-list'),detail=E('section','dgm-detail'),body=E('div','dgm-body');list.setAttribute('role','listbox');
  body.append(list,detail);root.append(body);box.append(root);
  const entrar=entry=>{window.currentDungeonId=entry.id;close();window.enterGoblinDungeon()};
  // online: antes de entrar, a tela de montar o grupo; offline: entra direto
  const enter=entry=>{const i=info(entry);if(i.minLevel&&p.lvl<i.minLevel)return;if(window.MP&&MP.grupoDg)montarGrupo(entry);else entrar(entry)};
  function renderList(){
   list.replaceChildren();
   for(const entry of library.dungeons){
    const i=info(entry),[dn,dc]=difficulty(i.rec),locked=i.minLevel&&p.lvl<i.minLevel,rec=records()[entry.id];
    const b=E('button','dgm-item'+(entry.id===selected?' on':'')+(locked?' locked':''));b.type='button';b.setAttribute('role','option');b.setAttribute('aria-selected',String(entry.id===selected));
    const img=E('img');img.src=monsterImg(i.boss);img.alt='';
    const txt=E('span','dgm-itemTxt');txt.append(E('b','',entry.config.name||'Masmorra'));
    const meta=E('small');meta.append(E('span','','Nv '+i.rec+' · '));const d=E('span','',dn);d.style.color=dc;meta.append(d);if(rec)meta.append(E('span','dgm-done',' · ✓ '+rec.clears+'×'));txt.append(meta);
    b.append(img,txt);if(locked)b.append(E('span','dgm-lock','Nv '+i.minLevel));
    b.onclick=()=>{selected=entry.id;try{localStorage.setItem('ilha-rpg-dg-escolhida',selected)}catch(e){}renderList();renderDetail()};
    b.ondblclick=()=>enter(entry);
    list.append(b);
   }
  }
  function renderDetail(){
   const entry=library.dungeons.find(d=>d.id===selected),i=info(entry),c=i.c,[dn,dc]=difficulty(i.rec),locked=i.minLevel&&p.lvl<i.minLevel,rec=records()[entry.id];
   detail.replaceChildren();pararPrevia();pararPrevia=iniciarPrevia(cvPrevia,entry);
   const top=E('div','dgm-top'),frame=E('div','dgm-boss'),img=E('img');img.src=monsterImg(i.boss);img.alt=i.bossName;frame.append(img,E('span','dgm-bossTag','CHEFE'));
   const ttl=E('div','dgm-ttl');ttl.append(E('h3','',c.name||'Masmorra'));
   const tags=E('div','dgm-tags');tags.append(E('span','dgm-tag',THEME[c.theme]||'Masmorra'),E('span','dgm-tag','Nv recomendado '+i.rec));const dt=E('span','dgm-tag',dn);dt.style.color=dc;dt.style.borderColor=dc;tags.append(dt);
   ttl.append(tags,E('p','dgm-desc',c.desc||'Uma masmorra dimensional aberta pelo portal do acampamento. Derrote o chefe para liberar a saída.'));
   top.append(frame,ttl);detail.append(top);
   const stats=E('div','dgm-stats');
   const stat=(l,v)=>{const s=E('div','dgm-stat');s.append(E('span','',l),E('b','',v));stats.append(s)};
   const mapa=mapaDG(entry);
   stat('Chefe',i.bossName);stat(c.pintado?'Áreas':'Salas',String(c.rooms.length));if(mapa)stat('Tamanho',mapa.ladrilhos+' ladrilhos');stat('Monstros',i.mobs+(i.spawns?' + '+i.spawns+' spawn'+(i.spawns>1?'s':'')+(i.waves?' ('+i.waves+' ondas)':''):''));
   const chests=Object.entries(i.tiers);stat('Baús',chests.length?chests.reduce((n,[,v])=>n+v,0)+'':'nenhum');
   detail.append(stats);
   // monstros que aparecem: desenho, nome e faixa de nível
   const tipos=new Map();for(const m of c.mobs||[]){const o=tipos.get(m.type)||{n:0,lv:[]};o.n++;o.lv.push(+m.lvl||4);tipos.set(m.type,o)}
   for(const s of (c.spawns||[]).filter(s=>s&&!s.disabled))for(const mm of s.monsters||[]){if(!mm||!mm.id)continue;const o=tipos.get(mm.id)||{n:0,lv:[]};o.n+=+mm.max||1;tipos.set(mm.id,o)}
   if(tipos.size){const ros=E('div','dgm-roster');ros.append(E('span','dgm-label','Monstros'));const lin=E('div','dgm-rosterList');
    for(const [tipo,o] of tipos){const d=E('div','dgm-mon'),cv=E('canvas');cv.width=32;cv.height=32;const im=imgMonstro(tipo);
     if(im){const q=im.q||1,w=im.width/q,h=im.height/q,k=Math.max(1,Math.floor(Math.min(32/w,32/h))),g=cv.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(im,Math.round((32-w*k)/2),Math.round(32-h*k),w*k,h*k)}
     const lv=o.lv.length?(Math.min(...o.lv)===Math.max(...o.lv)?'Nv '+o.lv[0]:'Nv '+Math.min(...o.lv)+'–'+Math.max(...o.lv)):'';
     d.append(cv,E('span','',(MONSTER_TYPES[tipo]?.name||tipo)+(o.n>1?' ×'+o.n:'')),E('small','',lv));lin.append(d)}
    ros.append(lin);detail.append(ros)}
   if(chests.length){const row=E('div','dgm-chests');for(const [k,n] of chests){const t=E('span','dgm-chest',n+'× '+TIER[k][0]);t.style.borderColor=TIER[k][1];t.style.color=TIER[k][1];row.append(t)}detail.append(row)}
   const dr=E('div','dgm-drops');dr.append(E('span','dgm-label','Possíveis drops'));const icons=E('div','dgm-dropIcons');
   if(i.drops.length)for(const id of i.drops){const d=E('div','dgm-drop'),im=E('img');im.src=ITEMS[id].ic;im.alt='';d.append(im);d._tip=()=>window.itemTip?itemTip(id,null):ITEMS[id].n;icons.append(d)}
   else icons.append(E('span','dgm-muted','Equipamentos aleatórios conforme a cor dos baús.'));
   dr.append(icons);detail.append(dr);
   const foot=E('div','dgm-foot');
   foot.append(E('span','dgm-rec',rec?'Concluída '+rec.clears+'×'+(rec.best?' · melhor tempo '+fmtTime(rec.best):''):'Ainda não concluída'));
   const go=E('button','dgm-enter',locked?'Requer nível '+i.minLevel:'Entrar na masmorra');go.type='button';go.disabled=!!locked;go.onclick=()=>enter(entry);
   foot.append(go);detail.append(foot);
  }
  /* ---------- montar grupo: 5 espaços com a fotinha de cada jogador; os vazios têm "+" para convidar.
     Ao começar, o grupo é chamado para a mesma DG e os inimigos ficam mais fortes a cada um que entra. ---------- */
  const enviados=new Map(); // id -> nome (convite enviado, ainda não entrou)
  function montarGrupo(entry){
   const c=entry.config;let abertoConvite=false;
   root.replaceChildren(cvPrevia,veu);pararPrevia();pararPrevia=iniciarPrevia(cvPrevia,entry); // a prévia continua ao fundo
   const head=E('header','dgm-head');head.append(E('b','dgm-title','Montar grupo · '+(c.name||'Masmorra')),E('small','dgm-sub','Até 5 jogadores. Clique em + para convidar ou comece sozinho.'));
   const slots=E('div',''),conv=E('div','dgp-convidar'),dif=E('p','dgp-dif'),nota=E('p','dgm-muted');
   const foot=E('div','dgm-foot'),voltar=E('button','dgp-voltar','Voltar'),comecar=E('button','dgm-enter','Começar');voltar.type=comecar.type='button';
   voltar.onclick=()=>{root.replaceChildren(cvPrevia,veu,head0,body);renderList();renderDetail()};
   comecar.onclick=()=>entrar(entry);
   foot.append(voltar,comecar);conv.hidden=true;
   root.append(head,slots,dif,conv,nota,foot);
   function render(){
    const g=MP.grupoDg(),n=g.membros.length;
    for(const m of g.membros)enviados.delete(m.id);
    // cartas no estilo do lobby (js/lobby.js): nome em cima, fotinha, "+" para convidar; alturas desencontradas
    const cartas=[];
    for(let k=0;k<g.max;k++){
     const m=g.membros[k],alto=k%2===1;
     if(m){cartas.push(LOBBY.carta({rotulo:m.nome,sprite:m.voce?heroImg('d'):window.spriteDeJogador&&spriteDeJogador(m.id),sub:(m.voce?'Você · ':'')+'Nv '+m.nivel,lider:m.lider,voce:m.voce,alto}));continue}
     const esperando=[...enviados.values()][k-n];
     cartas.push(LOBBY.carta({rotulo:'Jogador '+(k+1),vazio:true,esperando,podeClicar:g.podeConvidar&&!g.cheio,alto,onClick:()=>{abertoConvite=!abertoConvite;renderConvite()}}));
    }
    slots.replaceChildren(LOBBY.linha(cartas));
    dif.replaceChildren(E('b','',n>1?'Dificuldade com '+n+': ':'Sozinho: '),document.createTextNode(n>1?'inimigos com '+MP.escalaTexto(n)+'.':'dificuldade normal. Cada jogador a mais: '+MP.escalaTexto(2)+'.'));
    nota.textContent=g.podeConvidar?'O convite chega no Correio de quem você chamar. Ao começar, o grupo recebe o chamado para esta masmorra; a dificuldade sobe a cada um que entra.':'Só o líder do grupo convida e começa. Quando o líder entrar, você recebe o chamado.';
    comecar.disabled=!g.podeConvidar;
    if(abertoConvite)renderConvite();
   }
   function renderConvite(){
    conv.hidden=!abertoConvite;if(!abertoConvite)return;
    conv.replaceChildren(E('span','dgm-label','Convidar jogador'));
    const cand=MP.candidatosDg().slice(0,10);
    if(!cand.length)conv.append(E('span','dgm-muted','Ninguém online para convidar agora.'));
    for(const cnd of cand){const li=E('div','dgm-cand');li.append(E('span','',cnd.nome+' · Nv '+cnd.nivel+(cnd.amigo?' · amigo':'')),E('small','',cnd.onde));
     const b=E('button','dgm-convite',enviados.has(cnd.id)?'Enviado':'Convidar');b.type='button';b.disabled=enviados.has(cnd.id);
     b.onclick=async()=>{b.disabled=true;b.textContent='Enviando…';if(await MP.convidar(cnd.id,'grupo'))enviados.set(cnd.id,cnd.nome);abertoConvite=false;render();conv.hidden=true};
     li.append(b);conv.append(li)}
   }
   render();comecar.focus();
   // atualiza enquanto a tela está aberta (alguém aceitou, saiu ou ficou online)
   const vivo=setInterval(()=>{if(!box.classList.contains('open')||!root.contains(slots)){clearInterval(vivo);return}if(!conv.contains(document.activeElement))render()},1500);
  }
  const head0=head;
  renderList();renderDetail();
  root.addEventListener('keydown',e=>{const ids=library.dungeons.map(d=>d.id),k=ids.indexOf(selected);
   if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();selected=ids[(k+(e.key==='ArrowDown'?1:-1)+ids.length)%ids.length];renderList();renderDetail();list.querySelector('.on')?.focus()}
   else if(e.key==='Enter'&&e.target.closest('.dgm-item')){e.preventDefault();enter(library.dungeons[k])}});
  (detail.querySelector('.dgm-enter:not(:disabled)')||list.querySelector('.on'))?.focus();
 };
})();
