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
 return{id:String(q.id||'portal_'+i),name:String(q.name||('Portal '+(i+1))),minLevel:Math.max(1,Math.floor(+q.minLevel||1)),targetLevel:Math.max(1,Math.floor(+q.targetLevel||1)),frequency:Math.max(.01,+q.frequency||1),grupo:!!q.grupo,cor:/^#[0-9a-f]{6}$/i.test(q.cor||'')?q.cor:'#b06bff',monsters}});
const portalDefs=clonePortalDefs(Array.isArray(PROJ.portalDefs)?PROJ.portalDefs:DEFAULT_PORTAL_DEFS);
window.PORTAL_DEFS=portalDefs;
function spawnAt(x,y,type,level=monsterLevel()){const B=MB[type]||MB.sl,S=SP[B.base]||SP.sl,e={};Object.assign(e,{img:S.d,sp:S,max:B.max,dmg:B.dmg,spd:B.spd,xp:B.xp,g:B.g,aggro:B.aggro,wu:B.wu,ac:B.ac,boss:false});
 configureMonster(e,type,level);Object.assign(e,{x,y,hx:x,hy:y,hp:e.max,st:null,fx:0,fy:1,aw:0,cd:0,hit:0,rt:0,dest:null,path:[],pathI:0,pathKey:'',roamT:3,roamRadius:rnd(38,70)});return e}
window.spawnAt=spawnAt;
/* Elite: +50% de vida, +35% de dano, +25% de defesas e +50% de XP e ouro. */
function makeElite(e){e.elite=true;e.max=Math.round(e.max*1.5);e.hp=e.max;e.dmg=Math.round(e.dmg*1.35);e.armor=Math.round((e.armor||e.stats.A*CALC.monArmPerA)*1.25);e.magicArmor=Math.round((e.magicArmor||monMagArm(e.stats.F,e.stats.A,e.stats.I))*1.25);e.xp=Math.round(e.xp*1.5);e.g=Math.round(e.g*1.5);return e}
window.makeElite=makeElite;
/* áreas: grade 3x3; no máximo 5 inimigos por área (contando os que ainda vão sair dos portais) */
const PORTAL_BORDA=18.5,PORTAL_REFILL=.7,PORTAL_DURATION=2,PORTAL_OPEN=.3,PORTAL_CLOSE=.35,PORTAL_FIRST_SPAWN=.4,PORTAL_LAST_SPAWN=1.55;
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
  const borda=V(x/T|0,y/T|0); // portais só na faixa perto da borda da ilha (28,6 = beira do vazio)
  if(available>0&&walk(x,y)&&longeDeArvores(x,y)&&borda<=25&&borda>=PORTAL_BORDA&&!insideCamp(x,y,20)&&dist(p,{x,y})>=120&&!portals.some(q=>Math.hypot(q.x-x,q.y-y)<96))positions.push({x,y,a,available})
 }
 const candidates=portalOptions.filter(def=>positions.some(pos=>pos.available>=minPack(def)));
 if(!candidates.length)return;
 const total=candidates.reduce((n,def)=>n+portalWeight(def),0);let roll=Math.random()*total,site=candidates[candidates.length-1];
 for(const def of candidates){roll-=portalWeight(def);if(roll<=0){site=def;break}}
 const validPositions=positions.filter(pos=>pos.available>=minPack(site)),position=validPositions[Math.floor(Math.random()*validPositions.length)];
 const a=position.a,plan=planPack(site,position.available);
 if(!plan.length)return;
 portals.push({x:position.x,y:position.y,t:0,a,n0:plan.length,left:plan.length,plan,next:PORTAL_FIRST_SPAWN,interval:(PORTAL_LAST_SPAWN-PORTAL_FIRST_SPAWN)/Math.max(1,plan.length-1),fin:0,id:++pid,siteId:site.id,grupo:site.grupo,cor:site.cor,ang:Math.atan2(CY-position.y,CX-position.x)+rnd(-.8,.8)});
}
/* A composição segue as chances e quantidades configuradas para o portal escolhido. */
function emit(q){let ox=q.x,oy=q.y;for(let t=0;t<14;t++){const a=q.ang+rnd(-1.1,1.1),r=rnd(16,34),px=q.x+Math.cos(a)*r,py=q.y+Math.sin(a)*r;if(walk(px,py)&&!insideCamp(px,py)&&longeDeArvores(px,py)){ox=px;oy=py;break}}
 const entry=q.plan.shift();if(!entry)return;const e=spawnAt(q.x,q.y,entry.type);Object.assign(e,{hx:ox,hy:oy,dest:{x:ox,y:oy},area:q.a,pack:q.id});
 if(entry.elite)makeElite(e);
 // saem da borda e vão se espalhando para o centro; em grupo, seguem o primeiro que saiu (o líder)
 e.migra=true;e.migraT=rnd(3,6);
 if(q.grupo){const g=grupos.get(q.id);if(!g)grupos.set(q.id,{lider:e,migra:true});else{const a=rnd(0,6.283),r=rnd(9,17);e.seguidor=g;e.offx=Math.cos(a)*r;e.offy=Math.sin(a)*r;e.migra=false}}
 if(entry.type=='gob'&&questMonsterRequested('gob')&&!sawGoblin){
  e.sawGoblin=true;sawGoblin=e
 }
 ring(q.x,q.y-8,14,q.cor||'#b98cff',.3);en.push(e);q.left--}
/* Espalhar para o centro: a cada poucos segundos a "casa" do monstro anda 40–80 px em direção ao acampamento,
   até parar a uma distância segura dele. Grupo: os seguidores têm a casa colada no líder. */
const grupos=new Map(),PARADA=CAMP_SAFE_HALF_SIZE+110;
/* grupo (portais da ilha e da DG): o seguidor tem a casa colada no líder; se o líder morrer, o primeiro seguidor vivo assume */
function seguirLider(){
 for(const e of en){if(e.hp<=0||e.mpProxy||!e.seguidor)continue;const g=e.seguidor,L=g.lider;
  if(!L||L.hp<=0||!en.includes(L)){g.lider=e;e.seguidor=null;e.roamRadius=rnd(38,70);if(g.migra){e.migra=true;e.migraT=rnd(2,4)}continue}
  if(!e.chasing){e.hx=L.x+e.offx;e.hy=L.y+e.offy;e.roamRadius=10}}
}
function espalhar(dt){
 for(const e of en){if(e.hp<=0||e.mpProxy||e.chasing||e.seguidor)continue;
  if(!e.migra||(e.migraT-=dt)>0)continue;e.migraT=rnd(5,9);
  if(campDistance(e.hx,e.hy)<PARADA){e.migra=false;continue}
  const a=Math.atan2(CY-e.hy,CX-e.hx)+rnd(-.6,.6),r=rnd(40,80);
  for(let t=0;t<6;t++){const x=e.hx+Math.cos(a)*r*(1-t*.12),y=e.hy+Math.sin(a)*r*(1-t*.12);if(walk(x,y)&&!insideCamp(x,y,40)&&longeDeArvores(x,y)){e.hx=x;e.hy=y;break}}}
}
/* um alerta: os da mesma matilha vêm ajudar */
const h0=hurtE;hurtE=function(e){const r=h0.apply(this,arguments);if(e&&e.pack&&!e.boss)en.forEach(o=>{if(o!==e&&o.pack===e.pack&&o.hp>0){if(!(o.alert>0))ft(o.x,o.y-30,'!','#f66');o.alert=8}});return r};
const upd0=upd;upd=function(dt){upd0(dt);
 sawGoblin=questMonsterRequested('gob')?questMonsterTarget('gob'):null;
 // portais só na própria ilha: na taverna não há monstros e, visitando outra ilha, quem solta os monstros é o dono
 if(!window.inDungeon&&!window.inTaverna&&!window.inArena&&!window.mpEspelho){
  // abaixo do mínimo de monstros na ilha, os portais abrem bem mais rápido até completar; depois, no intervalo normal
  const naIlha=en.reduce((n,e)=>n+(e.hp>0&&!e.boss&&!e.mpProxy?1:0),0)+portals.reduce((n,q)=>n+q.left,0),minimo=CALC.islandMinMonsters??20;
  timer-=dt;if(timer<=0){timer=naIlha<minimo?PORTAL_REFILL:CALC.portalInterval;if(CALC.randomPortals!==false)openPortal()}
  // Toda a matilha sai antes do fechamento; o portal dura 2 segundos no total.
  for(let i=portals.length;i--;){const q=portals[i];q.t+=dt;
   while(q.left>0&&q.t>=q.next){emit(q);q.next+=q.interval}
   q.fin=Math.max(0,q.t-(PORTAL_DURATION-PORTAL_CLOSE));
   if(q.t>=PORTAL_DURATION){portals.splice(i,1);grupos.delete(q.id)}}
  espalhar(dt);
 }
 if(!window.mpEspelho)seguirLider();
 for(let i=en.length;i--;)if(en[i].gone)en.splice(i,1)}; // sem empurrão entre corpos: a colisão sólida está em update.js (corpoNoCaminho)
/* Portal de invocação: anel de luz vertical (como um portal mágico) na cor escolhida para ele na Engine (q.cor):
   brilho em volta, reflexo no chão, borda em degradê da cor (mais quente de um lado, mais fria do outro), um ponto
   de luz correndo pela borda, centro escuro com redemoinho e faíscas subindo. Abre crescendo e fecha encolhendo. */
const hexRgb=h=>{const n=parseInt(String(h).slice(1),16);return[(n>>16)&255,(n>>8)&255,n&255]};
const girarCor=([r,g,b],k)=>{const m=(r+g+b)/3;return[r,g,b].map((v,i)=>Math.max(0,Math.min(255,Math.round(i===0?v+k*60:i===2?v-k*60:v+(m-v)*.1))))};
const rgba=(c,a)=>'rgba('+c[0]+','+c[1]+','+c[2]+','+a+')';
function drawSpawnPortal(q,target,original=false){
 const ctx=target||cv.getContext('2d');
 const s=Math.max(0,Math.min(1,q.t/PORTAL_OPEN,(PORTAL_DURATION-q.t)/PORTAL_CLOSE));if(s<.03)return;
 if(!original){
  ctx.save();ctx.globalAlpha*=s;
  const drawn=gameArtDraw('portal-spawn-'+q.siteId,ctx,q.x,q.y)||gameArtDraw('portal-spawn',ctx,q.x,q.y);
  ctx.restore();if(drawn)return;
 }
 const def=portalDefs.find(d=>d.id===q.siteId),cor=hexRgb(q.cor||(def&&def.cor)||'#b06bff'),quente=girarCor(cor,.7),fria=girarCor(cor,-.7);
 const t=q.t,phase=q.id*.73,H=46*(.35+.65*s),W=13*(.7+.3*s),cy=-H/2-2;
 ctx.save();ctx.translate(Math.round(q.x),Math.round(q.y));
 // reflexo e brilho no chão
 let g=ctx.createRadialGradient(0,0,0,0,0,22);g.addColorStop(0,rgba(cor,.45*s));g.addColorStop(1,rgba(cor,0));ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,0,22,5,0,0,7);ctx.fill();
 // centro escuro e translúcido com redemoinho
 ctx.fillStyle='rgba(8,4,18,'+(.55*s)+')';ctx.beginPath();ctx.ellipse(0,cy,W-1.5,H/2-1.5,0,0,7);ctx.fill();
 ctx.save();ctx.beginPath();ctx.ellipse(0,cy,W-1.5,H/2-1.5,0,0,7);ctx.clip();ctx.lineWidth=1;
 for(let k=0;k<4;k++){const a0=t*(1.2+k*.3)+k*1.6+phase;ctx.strokeStyle=rgba(k%2?quente:fria,.28*s);ctx.beginPath();ctx.ellipse(0,cy,(W-3)*(1-k*.18),(H/2-3)*(1-k*.18),0,a0,a0+2.2);ctx.stroke()}
 ctx.restore();
 // brilho em volta (soma de luz)
 ctx.globalCompositeOperation='lighter';
 g=ctx.createRadialGradient(0,cy,H*.2,0,cy,H*.8);g.addColorStop(0,rgba(cor,0));g.addColorStop(.55,rgba(cor,.16*s));g.addColorStop(1,rgba(cor,0));ctx.fillStyle=g;ctx.fillRect(-H,cy-H,H*2,H*2);
 // anel: faixa larga e suave, depois a borda em degradê e o fio claro por dentro
 const borda=ctx.createLinearGradient(-W,cy-H/2,W,cy+H/2);borda.addColorStop(0,rgba(quente,.95*s));borda.addColorStop(.5,rgba(cor,.95*s));borda.addColorStop(1,rgba(fria,.95*s));
 ctx.lineWidth=5;ctx.strokeStyle=rgba(cor,.22*s);ctx.beginPath();ctx.ellipse(0,cy,W,H/2,0,0,7);ctx.stroke();
 ctx.lineWidth=2;ctx.strokeStyle=borda;ctx.beginPath();ctx.ellipse(0,cy,W,H/2,0,0,7);ctx.stroke();
 ctx.lineWidth=.8;ctx.strokeStyle='rgba(255,250,240,'+(.85*s)+')';ctx.beginPath();ctx.ellipse(0,cy,W-.8,H/2-.8,0,0,7);ctx.stroke();
 // ponto de luz correndo pela borda
 const a=t*2.4+phase;ctx.lineWidth=2.5;ctx.strokeStyle='rgba(255,255,255,'+(.7*s)+')';ctx.beginPath();ctx.ellipse(0,cy,W,H/2,0,a,a+.5);ctx.stroke();
 // faíscas subindo pela borda
 for(let i=0;i<18;i++){const f=(t*(.5+(i%4)*.12)+i*.618+phase)%1,ang=i*2.39+t*.4,x=Math.cos(ang)*W*(1+f*.25),y=cy+Math.sin(ang)*H/2-f*14;
  ctx.globalAlpha=s*Math.sin(f*Math.PI);ctx.fillStyle=i%3===0?'#ffffff':rgba(i%2?quente:fria,1);ctx.fillRect(Math.round(x),Math.round(y),1,1)}
 ctx.restore()
}window.drawPortals=()=>portals.forEach(q=>drawSpawnPortal(q));
for(const site of [{id:null,name:'Portal de invocação — padrão'},...portalDefs]){
 gameArtRegister(site.id?'portal-spawn-'+site.id:'portal-spawn',site.name,{
  w:48,h:64,ay:58/64,draw:g=>drawSpawnPortal({x:24,y:58,t:1,id:1,siteId:site.id},g,true)
 });
}
window.PORTALS=portals;
if(sawQuestActive&&!sawObtained)resumeSawQuest();
})();
