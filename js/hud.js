/* ---------- HUD e Mochila (visual quadrado) ----------
   Barra de XP no topo da barra inferior, selo de nível no retrato, barra de itens rápidos (1–6),
   alerta de vida baixa, recargas que piscam ao ficar prontas, minimapa com nome do lugar e zoom no canto.
   Mochila com abas Equipamento/Atributos, grade de espaços quadrados, arrastar para trocar, atalhos 1–6,
   menu do botão direito (usar, equipar, descartar) e Organizar. */
(function(){
 if(MODO.motor)return;
 const E=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e};
 const dock=$('dock'),port=$('port'),invp=$('invp');
 const itemName=id=>ITEMS[id].n.split(' (')[0];
 const QUEST_ITEMS=new Set(['saw']);

 /* ---------- barra inferior ---------- */
 const badge=E('div','lvBadge');badge.id='lvBadge';port.append(badge);
 port._tip=()=>'<b>'+CL[p.cls].n+' · Nível '+p.lvl+'</b>'+$('st').innerHTML.replace(/<div class="gl">.*$/,'')+'<div class=tm>Atributos completos: Mochila › Atributos</div>';
 // botões laterais com atalho
 [['codexBtn','J'],['bag','I'],['skillBtn','K']].forEach(([id,k])=>{const b=$(id);if(b)b.dataset.key=k});
 // itens rápidos: os 6 primeiros espaços da bolsa (teclas 1–6)
 const quick=E('div');quick.id='quick';
 const qhead=E('div','qhead','<span>Itens</span><b id="qgold"></b>');
 const qgrid=E('div','qgrid');quick.append(qhead,qgrid);
 const qslots=[...Array(6)].map((_,i)=>{const s=E('button','qslot');s.type='button';s.dataset.i=i;s.innerHTML='<img alt=""><b></b><kbd>'+(i+1)+'</kbd>';
  s.onclick=e=>{e.stopPropagation();useSlot(i)};
  s._tip=()=>I[i]?itemTip(I[i].id,I[i].q)+'<div class=tm>Tecla '+(i+1)+' · arraste itens da mochila para cá</div>':'<b>Atalho '+(i+1)+'</b><div class=tm>Vazio. Arraste uma poção ou outro consumível da mochila para cá. Só consumíveis ficam nos atalhos.</div>';
  dragSource(s,()=>i);dropTarget(s,from=>swapSlots(from,i));qgrid.append(s);return s});
 dock.append(quick);
 // alerta de vida baixa
 const vignette=E('div');vignette.id='lowhp';document.body.append(vignette);
 // minimapa: nome do lugar e zoom no canto
 const mmLabel=E('div');mmLabel.id='mmLabel';document.body.append(mmLabel);

 /* ---------- arrastar e soltar ---------- */
 let dragFrom=null;
 function dragSource(el,get){el.draggable=true;el.addEventListener('dragstart',e=>{dragFrom=get();e.dataTransfer.effectAllowed='move';try{e.dataTransfer.setData('text/plain','slot')}catch(err){}el.classList.add('dragging');tipEl.style.display='none'});el.addEventListener('dragend',()=>{dragFrom=null;el.classList.remove('dragging');document.querySelectorAll('.dropOver').forEach(x=>x.classList.remove('dropOver'))})}
 function dropTarget(el,fn){el.addEventListener('dragover',e=>{if(dragFrom==null)return;e.preventDefault();el.classList.add('dropOver')});el.addEventListener('dragleave',()=>el.classList.remove('dropOver'));el.addEventListener('drop',e=>{e.preventDefault();el.classList.remove('dropOver');const f=dragFrom;dragFrom=null;if(f!=null)fn(f)})}
 // atalhos 1–6 (espaços 0–5 da bolsa) só aceitam consumíveis
 const podeEm=(k,s)=>k>=QUICK_N||!s||ehConsumivel(s.id);
 function swapSlots(a,b){
  if(typeof a=='string'){if(b<QUICK_N){unequip(a);return}if(I[b]&&!fits(a,I[b].id)){unequip(a);return}if(I[b])useSlot(b,a);else{if(window.ehArma&&ehArma(EQ[a])&&armaTravada())return;const old=EQ[a];EQ[a]=null;I[b]=old;dirtyInv=true;setPortrait();saveGame()}return}
  if(a===b)return;
  if(!podeEm(b,I[a])||!podeEm(a,I[b])){ft(p.x,p.y-24,'Atalhos 1–6: só itens consumíveis','#ccc');return}
  [I[a],I[b]]=[I[b],I[a]];dirtyInv=true;saveGame();
 }

 /* ---------- mochila ---------- */
 const ttl=invp.querySelector('.ttl');ttl.innerHTML='<span>Mochila</span><span class="invGold" id="invGold"></span>';
 const tabs=E('div','invTabs');[['eq','Equipamento'],['attr','Atributos']].forEach(([id,l])=>{const b=E('button','',l);b.type='button';b.dataset.tab=id;b.onclick=e=>{e.stopPropagation();invp.dataset.tab=id;tabs.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x.dataset.tab==id));if(id=='attr')attrPanel()};tabs.append(b)});
 ttl.after(tabs);invp.dataset.tab='eq';tabs.firstChild.classList.add('on');
 const doll=invp.querySelector('.doll'),apEl=$('ap');doll.after(apEl);
 const toolbar=$('invToolbar');toolbar.textContent='';toolbar.append($('invCategories'));
 const grid=$('inv');invp.append(grid);$('invLayout').remove();
 const foot=E('div');foot.id='invFoot';
 const cap=E('span','invCap'),hint=E('span','invHint','Arraste para trocar · botão direito: opções'),sortBtn=E('button','invSort','Organizar');sortBtn.type='button';
 sortBtn.onclick=e=>{e.stopPropagation();sortBag()};foot.append(cap,hint,sortBtn);invp.append(foot);
 const SLOT_ORDER=['sw','sh','he','ch','le','bo','ca','ne','ri'];
 const catOf=s=>{const t=gearType[s.id],d=ITEMS[s.id];return d.use?0:d.material?1:t?2+SLOT_ORDER.indexOf(t==='sh'?'sh':t):20};
 function sortBag(){const items=I.filter(Boolean).sort((a,b)=>catOf(a)-catOf(b)||(b.q||0)-(a.q||0)||a.id.localeCompare(b.id));I.fill(null);
  // consumíveis primeiro (enchem os atalhos); o resto começa depois dos atalhos
  const nc=items.filter(s=>ehConsumivel(s.id)).length,base=Math.max(QUICK_N,nc);I.length=Math.max(I.length,base+items.length-nc);I.fill(null);
  items.forEach((s,i)=>I[i<nc?i:base+i-nc]=s);dirtyInv=true;saveGame();ft(p.x,p.y-24,'Mochila organizada','#e7cb88')}
 // ícone de escudo para o espaço Mão 2 vazio
 const SHIELD=spr(["..kkkkkkkk..",".kssssssssk.",".kswwsssssk.",".kswssssssk.",".kssssssssk.",".kssssssssk.","..kssssssk..","...kssssk...","....kssk....",".....kk....."],{k:'#243243',s:'#8796a8',w:'#dbe8f2'});
 const EMPTY_ICON={he:'he',ch:'ch',le:'le',bo:'bo',ca:'ca',ne:'ne',r1:'ri',r2:'ri',sw:'sw'};
 const emptyIcon=id=>(id=='sh'?SHIELD:INV_CATEGORY_ICONS[EMPTY_ICON[id]]).toDataURL();
 const catMatch=(s,cat)=>{const t=gearType[s.id],d=ITEMS[s.id];if(cat=='all')return true;if(cat=='consumables')return !!d.use;if(cat=='materials')return !!d.material;if(cat=='sw')return t=='sw'||t=='sh';return t==cat};
 /* menu do botão direito */
 const menu=E('div');menu.id='invMenu';document.body.append(menu);
 const closeMenu=()=>{menu.classList.remove('open');menu.replaceChildren()};
 document.addEventListener('pointerdown',e=>{if(!menu.contains(e.target))closeMenu()});
 addEventListener('keydown',e=>{if(e.key=='Escape')closeMenu()});
 function openMenu(i,x,y){
  const s=I[i];if(!s)return;closeMenu();const t=gearType[s.id],d=ITEMS[s.id];
  menu.append(E('div','imHead','<img src="'+d.ic+'"><b>'+itemName(s.id)+'</b>'));
  const add=(label,fn,cls)=>{const b=E('button',cls||'',label);b.type='button';b.onclick=e=>{e.stopPropagation();fn(b)};menu.append(b);return b};
  if(t){add('Equipar',()=>{useSlot(i);closeMenu()});
   if(t=='sw'&&!d.th)add('Equipar na Mão 2',()=>{useSlot(i,'sh');closeMenu()});
   if(t=='ri')add('Equipar no Anel 2',()=>{useSlot(i,'r2');closeMenu()})}
  else if(d.use)add('Usar',()=>{useSlot(i);closeMenu()});
  if(i>=QUICK_N&&d.use){const free=[0,1,2,3,4,5];add('Mover para os atalhos (1–6)',()=>{const j=free.find(k=>!I[k]);swapSlots(i,j==null?0:j);closeMenu()})}
  if(QUEST_ITEMS.has(s.id))menu.append(E('div','imNote','Item de missão: não pode ser descartado.'));
  else add('Descartar'+(s.n>1?' (×'+s.n+')':''),b=>{if(!b.dataset.ok){b.dataset.ok='1';b.textContent='Clique de novo para confirmar';b.classList.add('danger');return}I[i]=null;dirtyInv=true;saveGame();ft(p.x,p.y-24,itemName(s.id)+' descartado','#f99');closeMenu()},'danger');
  menu.classList.add('open');const w=menu.offsetWidth,h=menu.offsetHeight;menu.style.left=Math.max(4,Math.min(innerWidth-w-4,x))+'px';menu.style.top=Math.max(4,Math.min(innerHeight-h-4,y))+'px';
 }
 function slotEl(i,s){
  const d=E('button','islot'+(s?qc(s):' empty'));d.type='button';d.dataset.i=i;
  if(s){const def=ITEMS[s.id];d.innerHTML='<img src="'+def.ic+'" alt="">'+(s.n>1?'<b>'+s.n+'</b>':'')+(gearType[s.id]&&s.q!=null?'<i style="color:'+QCOL[qi(s.q)]+'">'+s.q+'%</i>':'');
   d.setAttribute('aria-label',itemName(s.id)+(s.n>1?' ×'+s.n:''));
   d._tip=()=>itemTip(s.id,s.q)+'<div class=tm>'+(gearType[s.id]?'Clique: equipar':ITEMS[s.id].use?'Clique: usar':'Material')+' · botão direito: mais opções</div>';
   d.onclick=e=>{e.stopPropagation();useSlot(i,invEquipSlot)};
   d.oncontextmenu=e=>{e.preventDefault();e.stopPropagation();openMenu(i,e.clientX,e.clientY)};
   dragSource(d,()=>i)}
  else d.setAttribute('aria-label','Espaço vazio');
  if(i<6)d.append(E('kbd','',String(i+1)));
  dropTarget(d,from=>swapSlots(from,i));
  return d;
 }
 renderInv=function(){
  // bolsa sem limite: sempre sobra pelo menos uma fileira vazia no fim
  arrumarAtalhos();let last=I.length-1;while(last>=0&&!I[last])last--;
  const want=Math.max(40,Math.ceil((last+1+8)/8)*8),old=I.length;I.length=want;if(want>old)I.fill(null,old);
  const el=$('eql'),er=$('eqr');el.innerHTML='';er.innerHTML='';grid.innerHTML='';
  const sprite=heroImg('d'),px=sprite.getContext('2d').getImageData(0,0,sprite.width,sprite.height).data;let x0=sprite.width,y0=sprite.height,x1=-1,y1=-1;
  for(let y=0;y<sprite.height;y++)for(let x=0;x<sprite.width;x++)if(px[(y*sprite.width+x)*4+3]){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y)}
  if(x1>=x0){const c=mkCanvas(x1-x0+1,y1-y0+1);c.getContext('2d').drawImage(sprite,x0,y0,c.width,c.height,0,0,c.width,c.height);$('dollimg').src=c.toDataURL()}else $('dollimg').src=sprite.toDataURL();
  for(const [col,list] of [[el,['he','ch','le','bo','sw']],[er,['ca','ne','r1','r2','sh']]])for(const id of list){
   const s=EQ[id],d=E('button','eqslot'+(s?qc(s):' empty')+(invEquipSlot==id?' sel':''));d.type='button';d.dataset.slot=id;
   d.innerHTML=s?'<img src="'+ITEMS[s.id].ic+'" alt="">':'<img class="ghost" src="'+emptyIcon(id)+'" alt="">';
   d.append(E('span','eqName',SLOT_LABEL[id]));
   d._tip=()=>s?itemTip(s.id,s.q,id)+'<div class=tm>Clique: filtrar a bolsa para este espaço · botão direito: desequipar · arraste para a bolsa</div>':'<b>'+SLOT_LABEL[id]+'</b><div class=tm>Vazio. Clique para ver na bolsa o que serve aqui, ou arraste um item para cá.</div>';
   d.onclick=e=>{e.stopPropagation();const same=invEquipSlot==id;invEquipSlot=same?null:id;invCategory=same?'all':id=='r1'||id=='r2'?'ri':id=='sw'||id=='sh'?'sw':id;renderInv()};
   d.oncontextmenu=e=>{e.preventDefault();e.stopPropagation();if(EQ[id])unequip(id)};
   if(s)dragSource(d,()=>id);
   dropTarget(d,from=>{if(typeof from=='number'&&I[from]&&fits(id,I[from].id))useSlot(from,id);else if(typeof from=='number'&&I[from])ft(p.x,p.y-24,'Não serve em '+SLOT_LABEL[id],'#ccc')});
   col.append(d)}
  $('invCategories').querySelectorAll('.invCategory').forEach(b=>{const on=b.dataset.category==invCategory;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))});
  // na aba "Todos" mostra a bolsa inteira (com espaços vazios); nas outras, só o que combina
  if(invCategory=='all')I.forEach((s,i)=>grid.append(slotEl(i,s)));
  else{const hits=I.map((s,i)=>[s,i]).filter(([s])=>s&&catMatch(s,invCategory));hits.forEach(([s,i])=>grid.append(slotEl(i,s)));if(!hits.length)grid.append(E('div','invEmpty','Nada nesta categoria.'))}
  const used=I.filter(Boolean).length;cap.textContent=used+(used==1?' item':' itens');
  hint.textContent=invEquipSlot?'Escolha o item para '+SLOT_LABEL[invEquipSlot]+' (clique no espaço de novo para cancelar)':'Arraste para trocar · botão direito: opções';
  dirtyInv=false;
 };
 dirtyInv=true; // o primeiro quadro do jogo roda antes deste arquivo: desenha a mochila de novo com esta versão
 // equipar com o espaço de destino escolhido volta para "Todos"
 const use0=useSlot;useSlot=function(i,slot){const r=use0.apply(this,arguments);if(slot&&invEquipSlot){invEquipSlot=null;invCategory='all'}return r};
 /* ---------- atualização por quadro ---------- */
 let qsig='',lastLoc='',ready=new Map(),ouroVisto=null;
 const hud0=hud;hud=function(){hud0();
  badge.textContent=p.lvl;$('lv').textContent=p.lvl>=CALC.maxLevel?'XP MÁX':'XP '+p.xp+'/'+p.lvl*CALC.xpPerLevel;
  {const g=p.gold|0;if(g!==ouroVisto){ouroVisto=g;$('invGold').innerHTML=moeda(g);$('qgold').innerHTML=moeda(g)}} // número + símbolo da moeda
  const sig=I.slice(0,6).map(s=>s?s.id+':'+s.n+':'+s.q:'').join('|');
  if(sig!==qsig){qsig=sig;qslots.forEach((el,i)=>{const s=I[i],img=el.querySelector('img'),b=el.querySelector('b');el.className='qslot'+(s?qc(s):' empty');if(s){img.src=ITEMS[s.id].ic;img.hidden=false;b.textContent=s.n>1?s.n:''}else{img.hidden=true;b.textContent=''}})}
  const low=p.hp>0&&p.hp/mhp()<.3;document.body.classList.toggle('lowHp',low);
  // em combate as armas ficam travadas (js/state.js): marca os espaços de arma e avisa na mochila
  const cmb=window.emCombate&&emCombate();document.body.classList.toggle('emCombate',!!cmb);
  if(cmb&&!invEquipSlot)hint.textContent='Em combate: armas travadas até '+SAIR_COMBATE_S+'s depois de sair do combate ('+Math.ceil(combateRestante())+'s)';
  else if(!cmb&&/^Em combate/.test(hint.textContent))hint.textContent='Arraste para trocar · botão direito: opções';
  SK.forEach(s=>{const was=ready.get(s);if(was>0&&!(s.t>0)&&s.el){s.el.classList.remove('readyFlash');void s.el.offsetWidth;s.el.classList.add('readyFlash')}ready.set(s,s.t)});
  const loc=window.inArena?'Arena':window.inTaverna?'Taverna do Javali Dourado':window.MP&&MP.visitando?'Ilha de '+MP.nomeDe(MP.visitando):window.inDungeon?((window.getActiveDungeonConfig&&getActiveDungeonConfig().name)||'Masmorra'):insideCamp(p.x,p.y)?'Acampamento':'Ilha';
  // relógio do jogo (js/tempo.js): igual para todos, dia e noite de 30 min reais
  const rel=window.TEMPO?(TEMPO.ehNoite()?'Noite ':'Dia ')+TEMPO.hora():'',txt=loc+'|'+rel;
  if(txt!==lastLoc){lastLoc=txt;mmLabel.innerHTML='';mmLabel.append(loc);if(rel){const s=E('span');s.className='mmHora'+(TEMPO.ehNoite()?' noite':'');s.textContent=rel;s.title=(TEMPO.ehNoite()?'Amanhece':'Anoitece')+' em '+TEMPO.minutosAte()+' min';mmLabel.append(s)}}
  const r=$('mm').getBoundingClientRect();mmLabel.style.left=r.left+'px';mmLabel.style.width=r.width+'px';mmLabel.style.top=(r.top-mmLabel.offsetHeight-6)+'px';
  const z=$('mmz');z.style.top=(r.top+4)+'px';z.style.left=(r.right-z.offsetWidth-4)+'px';
 };
 /* barra inferior: encolhe em telas estreitas e afasta o minimapa se ele ficar por baixo */
 function layout(){
  dock.style.transform='';const w=dock.offsetWidth,k=Math.min(1,(innerWidth-12)/w);
  dock.style.transform=k<1?'scale('+k.toFixed(3)+')':'';
  const d=dock.getBoundingClientRect(),mm=$('mm'),mr=mm.getBoundingClientRect();
  const clash=d.left<mr.right+8;mm.style.bottom=clash?Math.round(innerHeight-d.top+30)+'px':'';
  // a mochila (à direita) para acima da barra inferior quando as duas se cruzam
  const invLeft=innerWidth-8-Math.min(452,innerWidth-16);document.documentElement.style.setProperty('--dockClear',d.right>invLeft?Math.round(innerHeight-d.top+4)+'px':'0px');
 }
 addEventListener('resize',layout);setTimeout(layout,0);setTimeout(layout,600);
})();
