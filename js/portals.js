/* ---------- novos monstros + portais de spawn ---------- */
(function(){
if(window.rebuildWG)rebuildWG();
const SPAWN={};(GAMEDATA.monsters||[]).forEach(m=>{if(m.id&&MONSTER_TYPES[m.id])SPAWN[m.id]={min:+m.minLevel||1,max:+m.maxLevel||999,w:Math.max(.1,+m.weight||1),far:m.zone=='far'?1:0,coast:m.zone=='coast'?1:0}});
if(!Object.keys(SPAWN).length)SPAWN.sl={min:1,w:1};
window.SPAWNINFO=SPAWN;
const DEFAULT_PORTAL_DEFS=[
 {id:'portal_ruins',name:'Ruínas do Norte',minLevel:1,targetLevel:1,countMin:2,countMax:3,eliteChance:.03,frequency:1,monsters:[{id:'sl',chance:65},{id:'bat',chance:35}]},
 {id:'portal_cliff',name:'Penhasco Leste',minLevel:4,targetLevel:6,countMin:2,countMax:4,eliteChance:.05,frequency:1,monsters:[{id:'sk',chance:45},{id:'wolf',chance:35},{id:'spider',chance:20}]},
 {id:'portal_wolf_trail',name:'Trilha dos Lobos',minLevel:4,targetLevel:6,countMin:2,countMax:3,eliteChance:.08,frequency:.9,monsters:[{id:'wolf',chance:60},{id:'spider',chance:40}]},
 {id:'portal_forest',name:'Floresta Antiga',minLevel:7,targetLevel:10,countMin:3,countMax:4,eliteChance:.08,frequency:1,monsters:[{id:'shroom',chance:50},{id:'ghost',chance:30},{id:'goblin',chance:20}]},
 {id:'portal_mushroom_grove',name:'Bosque dos Cogumelos',minLevel:7,targetLevel:9,countMin:3,countMax:4,eliteChance:.1,frequency:1.1,monsters:[{id:'shroom',chance:45},{id:'ghost',chance:35},{id:'sprout',chance:20}]},
 {id:'portal_coast',name:'Costa Sul',minLevel:11,targetLevel:14,countMin:3,countMax:5,eliteChance:.1,frequency:1,monsters:[{id:'crab',chance:50},{id:'ghost',chance:30},{id:'sk',chance:20}]},
 {id:'portal_guardian_sanctum',name:'Santuário do Guardião',minLevel:15,targetLevel:18,countMin:2,countMax:3,eliteChance:.12,frequency:.7,monsters:[{id:'ghost',chance:50},{id:'sk',chance:40},{id:'boss',chance:10}]}
];
/* Cada monstro do portal tem chance de vir (%), quantidade mín/máx e chance de elite (%).
   Portais antigos (quantidade e elite no portal) dividem a quantidade pela chance de cada monstro. */
const clonePortalDefs=list=>list.map((q,i)=>{
 const rows=(Array.isArray(q.monsters)?q.monsters:[]).filter(m=>m&&MONSTER_TYPES[m.id]);
 const cMin=Math.max(1,Math.floor(+q.countMin||2)),cMax=Math.max(cMin,Math.floor(+q.countMax||cMin)),elite0=Math.max(0,+q.eliteChance||0)*100;
 const total=rows.reduce((n,m)=>n+Math.max(0,+m.chance||0),0)||1;
 const monsters=rows.map(m=>{const chance=Math.max(0,Math.min(100,+m.chance||0)),parte=Math.max(0,+m.chance||0)/total;
  const min=m.min!==undefined?Math.max(0,Math.floor(+m.min||0)):Math.max(1,Math.round(cMin*parte));
  const max=Math.max(min,m.max!==undefined?Math.floor(+m.max||0):Math.round(cMax*parte));
  return{id:m.id,chance,min,max,elite:Math.max(0,Math.min(100,m.elite!==undefined?+m.elite||0:elite0))/100}});
 return{id:String(q.id||'portal_'+i),name:String(q.name||('Portal '+(i+1))),minLevel:Math.max(1,Math.floor(+q.minLevel||1)),targetLevel:Math.max(1,Math.floor(+q.targetLevel||1)),frequency:Math.max(.01,+q.frequency||1),monsters}});
const portalDefs=clonePortalDefs(Array.isArray(PROJ.portalDefs)?PROJ.portalDefs:DEFAULT_PORTAL_DEFS);
window.PORTAL_DEFS=portalDefs;
function spawnAt(x,y,type,level=monsterLevel()){const B=MB[type]||MB.sl,S=SP[B.base]||SP.sl,e={};Object.assign(e,{img:S.d,sp:S,max:B.max,dmg:B.dmg,spd:B.spd,xp:B.xp,g:B.g,aggro:B.aggro,wu:B.wu,ac:B.ac,boss:false});
 configureMonster(e,type,level);Object.assign(e,{x,y,hx:x,hy:y,hp:e.max,st:null,fx:0,fy:1,aw:0,cd:0,hit:0,rt:0,dest:null,path:[],pathI:0,pathKey:'',roamT:3,roamRadius:rnd(38,70)});return e}
window.spawnAt=spawnAt;
/* Elite: +50% de vida, +35% de dano, +25% de defesas e +50% de XP e ouro. */
function makeElite(e){e.elite=true;e.max=Math.round(e.max*1.5);e.hp=e.max;e.dmg=Math.round(e.dmg*1.35);e.armor=Math.round((e.armor||e.stats.A*5)*1.25);e.magicArmor=Math.round((e.magicArmor||e.stats.F+e.stats.A+e.stats.I)*1.25);e.xp=Math.round(e.xp*1.5);e.g=Math.round(e.g*1.5);return e}
window.makeElite=makeElite;
/* áreas: grade 3x3; no máximo 5 inimigos por área (contando os que ainda vão sair dos portais) */
const PORTAL_DURATION=2,PORTAL_OPEN=.3,PORTAL_CLOSE=.35,PORTAL_FIRST_SPAWN=.4,PORTAL_LAST_SPAWN=1.55;
const portals=[],AR=W/3,areaOf=(x,y)=>Math.min(2,x/AR|0)+3*Math.min(2,y/AR|0);let pid=0;
const cnt=a=>en.reduce((n,e)=>n+(e.hp>0&&e.area==a?1:0),0)+portals.reduce((n,q)=>n+(q.a==a?q.left:0),0);
let timer=2;
function startSawQuest(){
 if(sawQuestActive||sawObtained||wallBuilt)return;
 sawQuestActive=true;sawGoblin=null;
 if(window.saveGame)saveGame()
}
function resumeSawQuest(){
 if(!sawQuestActive||sawObtained||wallBuilt)return;
 sawGoblin=null
}
window.startSawQuest=startSawQuest;
window.resumeSawQuest=resumeSawQuest;
const eligibleMonsters=def=>def.monsters.filter(m=>m.chance>0&&m.max>0&&MONSTER_TYPES[m.id]&&!(m.id=='gob'&&(!sawQuestActive||sawObtained||wallBuilt||drops.some(d=>d.questReward))));
const qtd=m=>m.min+Math.floor(Math.random()*(m.max-m.min+1));
// menor matilha possível: o monstro garantido com a menor quantidade mínima
const minPack=def=>Math.max(1,Math.min(...eligibleMonsters(def).map(m=>m.min)));
/* Monta a matilha: cada monstro vem com a sua chance; se nenhum vier, um deles vem (sorteado pela chance). */
function planPack(def,available){
 const choices=eligibleMonsters(def);if(!choices.length)return[];
 const plan=[],add=(m,n)=>{for(let k=0;k<n;k++)plan.push({type:m.id,elite:Math.random()<m.elite})};
 for(const m of choices)if(Math.random()*100<m.chance)add(m,qtd(m));
 if(!plan.length){const total=choices.reduce((n,m)=>n+m.chance,0);let r=Math.random()*total,m=choices[choices.length-1];
  for(const c of choices){r-=c.chance;if(r<=0){m=c;break}}add(m,Math.max(1,qtd(m)))}
 // embaralha para o corte pelo limite da área não favorecer o primeiro da lista
 for(let i=plan.length;i-->1;){const j=Math.floor(Math.random()*(i+1));[plan[i],plan[j]]=[plan[j],plan[i]]}
 return plan.slice(0,available)
}
const portalIsActive=id=>portals.some(q=>q.siteId==id);
const portalWeight=def=>def.frequency*(1+Math.max(0,CALC.portalLevelBonus||0)*Math.max(0,1-Math.abs(p.lvl-def.targetLevel)/Math.max(1,CALC.portalLevelRange||1)));
function openPortal(){
 const portalOptions=portalDefs.filter(def=>p.lvl>=def.minLevel&&!portalIsActive(def.id)&&eligibleMonsters(def).length);
 if(!portalOptions.length)return;
 const availableByArea=Array.from({length:9},(_,a)=>Math.floor(CALC.areaCap-cnt(a)));
 if(!availableByArea.some(available=>available>0))return;
 const positions=[];
 for(let y=8;y<W-8;y+=16)for(let x=8;x<W-8;x+=16){
  const a=areaOf(x,y),available=availableByArea[a];
  if(available>0&&walk(x,y)&&V(x/T|0,y/T|0)<=25&&!insideCamp(x,y,20)&&dist(p,{x,y})>=120&&!portals.some(q=>Math.hypot(q.x-x,q.y-y)<96))positions.push({x,y,a,available})
 }
 const candidates=portalOptions.filter(def=>positions.some(pos=>pos.available>=minPack(def)));
 if(!candidates.length)return;
 const total=candidates.reduce((n,def)=>n+portalWeight(def),0);let roll=Math.random()*total,site=candidates[candidates.length-1];
 for(const def of candidates){roll-=portalWeight(def);if(roll<=0){site=def;break}}
 const validPositions=positions.filter(pos=>pos.available>=minPack(site)),position=validPositions[Math.floor(Math.random()*validPositions.length)];
 const a=position.a,plan=planPack(site,position.available);
 if(!plan.length)return;
 portals.push({x:position.x,y:position.y,t:0,a,n0:plan.length,left:plan.length,plan,next:PORTAL_FIRST_SPAWN,interval:(PORTAL_LAST_SPAWN-PORTAL_FIRST_SPAWN)/Math.max(1,plan.length-1),fin:0,id:++pid,siteId:site.id,ang:Math.atan2(CY-position.y,CX-position.x)+rnd(-.8,.8)});
}
/* A composição segue as chances e quantidades configuradas para o portal escolhido. */
function emit(q){let ox=q.x,oy=q.y;for(let t=0;t<14;t++){const a=q.ang+rnd(-1.1,1.1),r=rnd(16,34),px=q.x+Math.cos(a)*r,py=q.y+Math.sin(a)*r;if(walk(px,py)&&!insideCamp(px,py)){ox=px;oy=py;break}}
 const entry=q.plan.shift();if(!entry)return;const e=spawnAt(q.x,q.y,entry.type);Object.assign(e,{hx:ox,hy:oy,dest:{x:ox,y:oy},area:q.a,pack:q.id});
 if(entry.elite)makeElite(e);
 if(entry.type=='gob'&&questMonsterRequested('gob')&&!sawGoblin){
  e.sawGoblin=true;sawGoblin=e
 }
 ring(q.x,q.y-8,14,'#b98cff',.3);en.push(e);q.left--}
/* um alerta: os da mesma matilha vêm ajudar */
const h0=hurtE;hurtE=function(e){const r=h0.apply(this,arguments);if(e&&e.pack&&!e.boss)en.forEach(o=>{if(o!==e&&o.pack===e.pack&&o.hp>0){if(!(o.alert>0))ft(o.x,o.y-30,'!','#f66');o.alert=8}});return r};
/* colisão entre entidades (herói, NPCs, monstros): ninguém fica em cima do outro */
function separate(){const U=[];if(p.dead<=0)U.push({o:p,r:5,m:1.6,c:1});if(!window.inDungeon&&!window.inTaverna)NPCS.forEach(n=>U.push({o:n,r:5,m:1e9,c:1}));
 en.forEach(e=>{if(e.hp>0)U.push({o:e,r:entityRadius(e),m:1})});
 const ok=(u,x,y)=>walk(x,y)&&(u.c||!insideCamp(x,y));
 for(let i=0;i<U.length;i++)for(let j=i+1;j<U.length;j++){const a=U[i],b=U[j],R=a.r+b.r,dx=b.o.x-a.o.x,dy=b.o.y-a.o.y;if(Math.abs(dx)>R||Math.abs(dy)>R)continue;
  let d=Math.hypot(dx,dy);if(d>=R)continue;let nx,ny;if(d<.01){const g=Math.random()*6.283;nx=Math.cos(g);ny=Math.sin(g);d=0}else{nx=dx/d;ny=dy/d}
  const push=(R-d)*.5,wa=b.m/(a.m+b.m),wb=1-wa;
  if(wa>.001&&ok(a,a.o.x-nx*push*wa,a.o.y-ny*push*wa)){a.o.x-=nx*push*wa;a.o.y-=ny*push*wa}
  if(wb>.001&&ok(b,b.o.x+nx*push*wb,b.o.y+ny*push*wb)){b.o.x+=nx*push*wb;b.o.y+=ny*push*wb}}}
const upd0=upd;upd=function(dt){upd0(dt);
 sawGoblin=questMonsterRequested('gob')?questMonsterTarget('gob'):null;
 // portais só na própria ilha: na taverna não há monstros e, visitando outra ilha, quem solta os monstros é o dono
 if(!window.inDungeon&&!window.inTaverna&&!window.mpEspelho){
  timer-=dt;if(timer<=0){timer=CALC.portalInterval;if(CALC.randomPortals!==false)openPortal()}
  // Toda a matilha sai antes do fechamento; o portal dura 2 segundos no total.
  for(let i=portals.length;i--;){const q=portals[i];q.t+=dt;
   while(q.left>0&&q.t>=q.next){emit(q);q.next+=q.interval}
   q.fin=Math.max(0,q.t-(PORTAL_DURATION-PORTAL_CLOSE));
   if(q.t>=PORTAL_DURATION)portals.splice(i,1)}
 }
 separate();for(let i=en.length;i--;)if(en[i].gone)en.splice(i,1)};
/* Fenda retangular vertical: moldura com runas, energia interna e faiscas em pixel art. */
function drawSpawnPortal(q,target,original=false){
 const ctx=target||cv.getContext('2d');
 const s=Math.max(0,Math.min(1,q.t/PORTAL_OPEN,(PORTAL_DURATION-q.t)/PORTAL_CLOSE));if(s<.03)return;
 if(!original){
  ctx.save();ctx.globalAlpha*=s;
  const drawn=gameArtDraw('portal-spawn-'+q.siteId,ctx,q.x,q.y)||gameArtDraw('portal-spawn',ctx,q.x,q.y);
  ctx.restore();if(drawn)return;
 }
 const t=q.t,phase=q.id*.73;
 ctx.save();ctx.translate(Math.round(q.x),Math.round(q.y));ctx.globalAlpha*=s;
 ctx.scale(.6,.6);
 const rect=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
 const frame=(x,y,w,h,c)=>{rect(x,y,w,1,c);rect(x,y+h-1,w,1,c);rect(x,y,1,h,c);rect(x+w-1,y,1,h,c)};
 rect(-17,-2,34,5,'#0007');rect(-15,-1,30,2,'#a855f744');
 ctx.scale(.75+.25*s,s);
 rect(-21,-49,42,53,'#8b5cf610');rect(-17,-46,34,48,'#a855f71c');rect(-14,-44,28,45,'#c084fc26');
 rect(-13,-43,26,43,'#241638');rect(-12,-42,24,41,'#655080');
 rect(-10,-40,20,38,'#10091e');frame(-10,-40,20,38,'#c4a0ff');
 ctx.save();ctx.beginPath();ctx.rect(-9,-39,18,36);ctx.clip();
 rect(-9,-39,18,36,'#06020c');rect(-9,-34,18,31,'#0d041a');
 rect(-8,-29,16,26,'#140626');rect(-7,-23,14,20,'#1c0836');rect(-6,-17,12,14,'#260a4a');
 for(let col=-8;col<=7;col+=2){
  const bandPulse=.5+.5*Math.sin(t*3+col*.8+phase);
  rect(col,-35,1,32,`rgba(168,85,247,${.06+bandPulse*.08})`);
 }
 for(let i=0;i<PORTAL_SQUARES.length;i++){
  const sq=PORTAL_SQUARES[i],progress=(t*sq.spd+sq.ph+phase)%35;
  const alpha=Math.max(0,Math.min(1,progress/5,(35-progress)/6));
  const x=sq.col*.8+Math.sin(t*1.8+sq.ph*.6)*1.1,y=-4-progress;
  ctx.globalAlpha=s*alpha;
  rect(x-1,y-1,sq.sz+2,sq.sz+2,'#a855f733');
  rect(x,y,sq.sz,sq.sz,i%3==0?'#a855f7':i%3==1?'#c084fc':'#9333ea');
  rect(x,y,1,1,'#f3e8ff');
 }
 ctx.restore();
 for(const side of [-1,1]){
  rect(side<0?-13:10,-41,3,40,'#493358');rect(side<0?-12:10,-40,1,38,'#a384bd');
  for(let j=0;j<6;j++){
   const x=side<0?-12:10,y=-37+j*6,col=(j+Math.floor(t*6))%3==0?'#f5e5ff':'#b580f4';
   rect(x,y,2,1,col);rect(x+(j%2),y+1,1,2,col);
  }
 }
 rect(-13,-43,26,3,'#72518e');rect(-11,-42,22,1,'#ead2ff');
 rect(-13,-3,26,3,'#72518e');rect(-11,-2,22,1,'#dab7ff');
 for(const x of [-13,9])for(const y of [-43,-4]){
  rect(x-1,y-1,5,5,'#39264d');rect(x,y,3,3,'#c493f3');rect(x+1,y,1,2,'#fff0ff');
 }
 rect(-3,-45,6,5,'#3b2154');rect(-2,-44,4,3,'#bd8aff');rect(-1,-44,2,1,'#fff2ff');
 for(let i=0;i<32;i++){
  const f=(t*(.65+(i%4)*.12)+i*.618+phase)%1,side=i%2?-1:1;
  const x=side*(11+f*15)+Math.sin(i*2.4+t*3)*2,y=-4-f*47;
  const size=i%5==0?2:1;
  ctx.globalAlpha=s*Math.sin(f*Math.PI);
  rect(x-1,y-1,size+2,size+2,'#a855f733');
  rect(x,y,size,size,i%3==0?'#f6e9ff':i%3==1?'#c084fc':'#a855f7');
  if(i%5==0)rect(x,y+3,1,3,'#bb8aff77');
 }
 ctx.restore()
}
window.drawPortals=()=>portals.forEach(q=>drawSpawnPortal(q));
for(const site of [{id:null,name:'Portal de invocação — padrão'},...portalDefs]){
 gameArtRegister(site.id?'portal-spawn-'+site.id:'portal-spawn',site.name,{
  w:40,h:40,ay:34/40,draw:g=>drawSpawnPortal({x:20,y:34,t:1,id:1},g,true)
 });
}
window.PORTALS=portals;
if(sawQuestActive&&!sawObtained)resumeSawQuest();
})();
