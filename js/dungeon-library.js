/* ---------- Biblioteca de DGs do projeto ----------
   As DGs ficam em PROJETO.dgs ({version:2, activeId, dungeons:[{id, config}]}) e são editadas pela Engine. */
(function(){
 const clone=value=>JSON.parse(JSON.stringify(value));
 const validConfig=config=>Array.isArray(config?.rooms)&&config.rooms.length>0&&config.rooms.every(room=>room&&[room.x,room.y,room.w,room.h].every(Number.isFinite)&&room.w>0&&room.h>0);
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
  for(const id of MONSTER_TYPES[boss.type]?.drops||[])if(ITEMS[id])drops.add(id);
  const tiers={};for(const ch of c.chests||[]){const k=ch.randomTier?'random':ch.tier||'blue';tiers[k]=(tiers[k]||0)+1}
  const waves=spawns.reduce((n,s)=>n+(s.respawnMode==='once'?1:+s.waves||0),0);
  return{c,boss,bossName,rec,minLevel:+c.minLevel||0,drops:[...drops].slice(0,10),tiers,mobs:mobs.length,spawns:spawns.length,waves};
 }
 function difficulty(rec){const d=rec-p.lvl;return d<=-5?['Fácil','#7bd389']:d<=1?['Normal','#e7cb88']:d<=4?['Difícil','#f0a052']:['Mortal','#ff6b5a']}
 let selected=null;try{selected=localStorage.getItem('ilha-rpg-dg-escolhida')}catch(e){}
 window.showProjectDungeonMenu=()=>{
  const box=document.getElementById('dialogue');
  box.replaceChildren();box.classList.add('dgModal','open');
  const close=()=>box.classList.remove('open','dgModal');
  const root=E('div','dgm');
  const head=E('header','dgm-head');head.append(E('b','dgm-title','Portal do Acampamento'),E('small','dgm-sub','Escolha uma masmorra · você está no nível '+p.lvl));
  root.append(head);
  if(!library.dungeons.length){root.append(E('p','dgm-empty','Nenhuma DG disponível no momento.'));box.append(root);return}
  if(!library.dungeons.some(d=>d.id===selected))selected=library.dungeons[0].id;
  const list=E('div','dgm-list'),detail=E('section','dgm-detail'),body=E('div','dgm-body');list.setAttribute('role','listbox');
  body.append(list,detail);root.append(body);box.append(root);
  const enter=entry=>{const i=info(entry);if(i.minLevel&&p.lvl<i.minLevel)return;window.currentDungeonId=entry.id;close();window.enterGoblinDungeon()};
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
   detail.replaceChildren();
   const top=E('div','dgm-top'),frame=E('div','dgm-boss'),img=E('img');img.src=monsterImg(i.boss);img.alt=i.bossName;frame.append(img,E('span','dgm-bossTag','CHEFE'));
   const ttl=E('div','dgm-ttl');ttl.append(E('h3','',c.name||'Masmorra'));
   const tags=E('div','dgm-tags');tags.append(E('span','dgm-tag',THEME[c.theme]||'Masmorra'),E('span','dgm-tag','Nv recomendado '+i.rec));const dt=E('span','dgm-tag',dn);dt.style.color=dc;dt.style.borderColor=dc;tags.append(dt);
   ttl.append(tags,E('p','dgm-desc',c.desc||'Uma masmorra dimensional aberta pelo portal do acampamento. Derrote o chefe para liberar a saída.'));
   top.append(frame,ttl);detail.append(top);
   const stats=E('div','dgm-stats');
   const stat=(l,v)=>{const s=E('div','dgm-stat');s.append(E('span','',l),E('b','',v));stats.append(s)};
   stat('Chefe',i.bossName);stat('Salas',String(c.rooms.length));stat('Monstros',i.mobs+(i.spawns?' + '+i.spawns+' spawn'+(i.spawns>1?'s':'')+(i.waves?' ('+i.waves+' ondas)':''):''));
   const chests=Object.entries(i.tiers);stat('Baús',chests.length?chests.reduce((n,[,v])=>n+v,0)+'':'nenhum');
   detail.append(stats);
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
  renderList();renderDetail();
  root.addEventListener('keydown',e=>{const ids=library.dungeons.map(d=>d.id),k=ids.indexOf(selected);
   if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();selected=ids[(k+(e.key==='ArrowDown'?1:-1)+ids.length)%ids.length];renderList();renderDetail();list.querySelector('.on')?.focus()}
   else if(e.key==='Enter'&&e.target.closest('.dgm-item')){e.preventDefault();enter(library.dungeons[k])}});
  (detail.querySelector('.dgm-enter:not(:disabled)')||list.querySelector('.on'))?.focus();
 };
})();
