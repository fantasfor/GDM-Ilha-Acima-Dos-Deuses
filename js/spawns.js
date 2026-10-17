/* ---------- Pontos de spawn (criados na Engine) ----------
   Cada ponto fica num lugar fixo da ilha (PROJETO.mundo.spawns) ou de uma DG (config.spawns) e solta ondas de monstros:
   quais monstros (por peso), quantidade fixa ou aleatória, máximo vivo, reaparecimento, nível, chance de elite,
   ativação por proximidade, faixa de nível do jogador e, na DG, a sala cujas portas esperam todas as ondas. */
(function(){
 const num=(v,d)=>{v=Number(v);return Number.isFinite(v)?v:d};
 const irand=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
 /* Valores padrão: os mesmos que a Engine mostra no Inspetor. */
 function normalize(def,inDg){
  const d=def||{},min=Math.max(1,Math.floor(num(d.countMin,2))),max=Math.max(min,Math.floor(num(d.countMax,4)));
  return{id:String(d.id||'spawn'),name:d.name||'Ponto de spawn',x:num(d.x,0),y:num(d.y,0),radius:Math.max(8,num(d.radius,inDg?40:56)),
   disabled:!!d.disabled,monsters:(Array.isArray(d.monsters)?d.monsters:[]).filter(m=>m&&MONSTER_TYPES[m.id]&&num(m.chance,0)>0).map(m=>({id:m.id,chance:num(m.chance,0)})),
   countMode:d.countMode=='fixed'?'fixed':'random',count:Math.max(1,Math.floor(num(d.count,3))),countMin:min,countMax:max,
   maxAlive:Math.max(1,Math.floor(num(d.maxAlive,inDg?max:Math.max(max,6)))),
   respawnMode:['interval','cleared','once'].includes(d.respawnMode)?d.respawnMode:inDg?'cleared':'interval',respawn:Math.max(0,num(d.respawn,inDg?2:25)),
   waves:Math.max(0,Math.floor(num(d.waves,inDg?1:0))),startDelay:Math.max(0,num(d.startDelay,0)),
   levelMode:['fixed','range','player'].includes(d.levelMode)?d.levelMode:'player',level:Math.max(1,Math.floor(num(d.level,1))),levelMin:Math.max(1,Math.floor(num(d.levelMin,1))),levelMax:Math.max(1,Math.floor(num(d.levelMax,5))),levelOffset:Math.floor(num(d.levelOffset,0)),
   eliteChance:Math.max(0,Math.min(100,num(d.eliteChance,5))),eliteMax:Math.max(0,Math.floor(num(d.eliteMax,0))),
   activation:d.activation=='always'?'always':'near',activationRadius:Math.max(32,num(d.activationRadius,inDg?220:340)),
   minPlayerLevel:Math.max(1,Math.floor(num(d.minPlayerLevel,1))),maxPlayerLevel:Math.max(0,Math.floor(num(d.maxPlayerLevel,0))),
   roam:Math.max(0,num(d.roam,inDg?24:60)),effect:['portal','smoke','none'].includes(d.effect)?d.effect:'portal',
   xpPct:Math.max(0,num(d.xpPct,100)),goldPct:Math.max(0,num(d.goldPct,100)),pack:d.pack!==false,
   roomId:d.roomId!=null&&d.roomId!==''?d.roomId:null,lockRoom:d.lockRoom!==false}
 }
 const state=def=>({def,mobs:[],queue:[],timer:def.startDelay,waves:0,cleared:false,active:false});
 let island=(Array.isArray(PROJ.spawns)?PROJ.spawns:[]).map(d=>state(normalize(d,false)));
 let dungeon=[];
 const alive=s=>{s.mobs=s.mobs.filter(e=>e.hp>0&&!e.gone);return s.mobs.length};
 const finished=s=>s.def.respawnMode=='once'?s.waves>=1:s.def.waves>0&&s.waves>=s.def.waves;
 function pickType(def){const total=def.monsters.reduce((n,m)=>n+m.chance,0);let r=Math.random()*total;for(const m of def.monsters){r-=m.chance;if(r<=0)return m.id}return def.monsters[def.monsters.length-1].id}
 function levelFor(def){
  if(def.levelMode=='fixed')return def.level;
  if(def.levelMode=='range')return irand(Math.min(def.levelMin,def.levelMax),Math.max(def.levelMin,def.levelMax));
  return Math.max(1,p.lvl+def.levelOffset);
 }
 function spot(def){
  for(let t=0;t<30;t++){const a=Math.random()*Math.PI*2,r=Math.sqrt(Math.random())*def.radius,x=def.x+Math.cos(a)*r,y=def.y+Math.sin(a)*r;
   if(walk(x,y)&&(window.inDungeon||!insideCamp(x,y,6))&&(typeof longeDeArvores!='function'||longeDeArvores(x,y)))return{x,y}}
  return walk(def.x,def.y)?{x:def.x,y:def.y}:null;
 }
 function effect(def,x,y){
  if(def.effect=='portal'){ring(x,y-6,14,'#b98cff',.35);ring(x,y,8,'#e9d5ff',.25)}
  else if(def.effect=='smoke'){ring(x,y,12,'#9a8f80',.4);ring(x,y,6,'#d6cbb8',.3)}
 }
 function emit(s,entry){
  const def=s.def,at=spot(def);if(!at)return;
  const e=spawnAt(at.x,at.y,entry.type,entry.lvl);
  Object.assign(e,{hx:at.x,hy:at.y,roamRadius:def.roam,roamT:1+Math.random()*3,spawner:def.id});
  if(def.pack)e.pack='sp:'+def.id+':'+entry.wave;
  if(entry.elite)makeElite(e);
  e.xp=Math.round(e.xp*def.xpPct/100);e.g=Math.round(e.g*def.goldPct/100);
  if(window.inDungeon){
   e.isDungeonMob=true;
   const room=def.roomId!=null?(window.CAVE_ROOMS||[]).find(r=>String(r.id)===String(def.roomId)):(window.CAVE_ROOMS||[]).find(r=>at.x>=r.x&&at.x<=r.x+r.w&&at.y>=r.y&&at.y<=r.y+r.h);
   if(room)e.dungeonRoomId=room.id;
  }
  effect(def,at.x,at.y);en.push(e);s.mobs.push(e);
 }
 function wave(s){
  const def=s.def,room=def.maxAlive-alive(s)-s.queue.length;if(room<=0||!def.monsters.length)return false;
  const n=Math.min(room,def.countMode=='fixed'?def.count:irand(def.countMin,def.countMax));if(n<=0)return false;
  s.waves++;let elites=0;
  for(let i=0;i<n;i++){const elite=Math.random()*100<def.eliteChance&&(!def.eliteMax||elites<def.eliteMax);if(elite)elites++;
   s.queue.push({t:i*.18,type:pickType(def),lvl:levelFor(def),elite,wave:s.waves})}
  return true;
 }
 function tick(s,dt){
  const def=s.def;
  for(let i=s.queue.length;i--;){const q=s.queue[i];q.t-=dt;if(q.t<=0){s.queue.splice(i,1);emit(s,q)}}
  if(def.disabled||!def.monsters.length||finished(s))return;
  if(p.lvl<def.minPlayerLevel||(def.maxPlayerLevel&&p.lvl>def.maxPlayerLevel))return;
  const near=def.activation=='always'||Math.hypot(p.x-def.x,p.y-def.y)<=def.activationRadius||!!(window.MP&&MP.pertoDeAlguem&&MP.pertoDeAlguem(def.x,def.y,def.activationRadius));
  if(!near&&!s.active)return;
  s.active=s.active||near;
  const n=alive(s);
  if(def.respawnMode!='interval'&&s.waves>0&&(n>0||s.queue.length))return; // "quando limpar" e "uma vez": espera a onda acabar
  s.timer-=dt;if(s.timer>0)return;
  if(!near&&def.activation=='near')return;
  if(wave(s)||def.respawnMode=='interval')s.timer=s.waves?def.respawn:def.startDelay;
 }
 const upd0=upd;upd=function(dt){upd0(dt);if(p.dead>0||window.inTaverna||window.mpEspelho)return;(window.inDungeon?dungeon:island).forEach(s=>tick(s,dt))};
 /* Na DG: cria os pontos da DG ativa; as portas de uma sala esperam as ondas finitas dos pontos ligados a ela. */
 window.SPAWNS={
  enterDungeon(cfg){dungeon=(Array.isArray(cfg&&cfg.spawns)?cfg.spawns:[]).map(d=>state(normalize(d,true)));dungeon.forEach(s=>{if(s.def.activation=='always'&&!s.def.startDelay)tick(s,0)})},
  roomBusy(roomId){return dungeon.some(s=>{const d=s.def;if(d.disabled||!d.lockRoom||!d.monsters.length||d.roomId==null||String(d.roomId)!==String(roomId))return false;
   if(d.respawnMode=='interval'&&!d.waves)return false;return !finished(s)||s.queue.length>0})},
  lista:()=>(window.inDungeon?dungeon:island).map(s=>({id:s.def.id,nome:s.def.name,vivos:alive(s),ondas:s.waves,ativo:s.active,fim:finished(s)})),
  normalize
 };
 window.addEventListener('ilha-dg-saiu',()=>{dungeon=[]});
})();
