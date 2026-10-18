/* ---------- estado ---------- */
const I=Array(40).fill(null);let dirtyInv=true;
// itens de missão: aparecem em dourado com "!" só enquanto a missão que pede o item está em andamento
// (Serrote e Madeira: até a paliçada ficar pronta; Madeira Mágica: até o portal do acampamento)
const ITENS_MISSAO={saw:()=>!wallBuilt,wood:()=>!wallBuilt,magicWood:()=>!campPortalBuilt};
window.ehMissao=(id,quest)=>!!(ITENS_MISSAO[id]?ITENS_MISSAO[id]():quest||(ITEMS[id]&&ITEMS[id].quest));
/* bestiário (enciclopédia): quantos de cada monstro o jogador matou e quais itens cada um já deixou cair */
const BESTIARIO={k:{},d:{}};window.BESTIARIO=BESTIARIO;
window.anotarMorte=ty=>{if(ty)BESTIARIO.k[ty]=(BESTIARIO.k[ty]||0)+1};
window.anotarDrop=(ty,id)=>{if(ty&&id)(BESTIARIO.d[ty]=BESTIARIO.d[ty]||{})[id]=1};
const SLOTS=['he','ch','le','bo','ca','ne','r1','r2','sw','sh'];
const EQ=Object.fromEntries(SLOTS.map(s=>[s,null]));
const fits=(slot,id)=>!!gearType[id]&&(gearType[id]==slot||(gearType[id]=='ri'&&(slot=='r1'||slot=='r2'))||(slot=='sh'&&gearType[id]=='sw'&&!ITEMS[id].th));
const rollQ=()=>Math.round(100*Math.pow(Math.random(),CALC.qualExp)),qMul=q=>CALC.qualBase+(q==null?50:q)/100,
qStats=(id,q)=>{const it=ITEMS[id],o={};for(const k of Object.keys(ITEM_STATS))if(it[k])o[k]=ITEM_STATS[k].percent||ITEM_STATS[k].fractional?it[k]*qMul(q):Math.max(1,Math.round(it[k]*qMul(q)));const range=gearType[id]==='sw'&&qualityWeaponRange(it,q);if(range)o.dmg=(range.min+range.max)/2;return o},
qName=q=>q<20?'Ruim':q<45?'Comum':q<70?'Boa':q<90?'Rara':q<100?'Épica':'Perfeita',
bonus=k=>Object.values(EQ).reduce((a,s)=>a+(s&&gearType[s.id]&&(k==='dmg'&&weaponDamageRolls?.has(s)?weaponDamageRolls.get(s):qStats(s.id,s.q)[k])||0),0)+playerAttributeBonus(k);
let weaponDamageRolls=null;
function qualityWeaponRange(it,q){const range=weaponDamageRange(it);return range?{min:Math.round(range.min*qMul(q)),max:Math.round(range.max*qMul(q))}:null}
function withWeaponDamageRoll(action){
 if(weaponDamageRolls)return action();
 weaponDamageRolls=new Map();
 try{
  for(const slot of ['sw','sh']){
   const s=EQ[slot],range=s&&gearType[s.id]==='sw'&&qualityWeaponRange(ITEMS[s.id],s.q);
   if(range)weaponDamageRolls.set(s,rollWeaponDamage(range));
  }
  return action();
 }finally{weaponDamageRolls=null}
}
const heroC={};
function heroImg(dir,an){if(CL[p.cls]&&CL[p.cls].sprite)return CL[p.cls].sprite;const ph=an&&an.ph||0,E={nude:1,sex:p.sex,swing:an&&an.sw||0,shWeapon:!!(EQ.sh&&gearType[EQ.sh.id]=='sw')};let key=p.cls+p.sex+dir+ph+'w'+E.swing;for(const s of ['he','ch','le','bo','ca','ne','r1','r2','sw','sh'])if(EQ[s]){E[s]=ITEMS[EQ[s].id];key+=s+EQ[s].id}
 key+=chaveEquipAnim(Object.values(E),dir,E.swing?'attack':an&&an.mv?'walk':'idle');if(Object.keys(heroC).length>600)for(const k in heroC)delete heroC[k];return heroC[key]||(heroC[key]=human(CL[p.cls].base||p.cls,dir,ph,E))}
/* Os 6 primeiros espaços são a barra de atalhos (teclas 1–6) e só aceitam consumíveis.
   A bolsa não tem limite: sem espaço livre, ela cresce. */
const QUICK_N=6,ehConsumivel=id=>!!(ITEMS[id]&&ITEMS[id].use);
function livre(id){const de=ehConsumivel(id)?0:QUICK_N;let i=I.indexOf(null,de);if(i<0){i=Math.max(I.length,de);const old=I.length;I.length=i+8;I.fill(null,old)}return i}
// tira dos atalhos o que não é consumível (saves antigos)
function arrumarAtalhos(){for(let i=0;i<QUICK_N&&i<I.length;i++){const s=I[i];if(s&&!ehConsumivel(s.id)){I[i]=null;I[livre(s.id)]=s;dirtyInv=true}}}
window.ehConsumivel=ehConsumivel;
/* preço de venda (taverna): o configurado no item ou um calculado pelos atributos.
   Equipamento vale de 50% a 150% conforme a qualidade (0 a 100). Itens de missão não são vendidos. */
function precoBase(id){
 const it=ITEMS[id];if(!it)return 0;if(it.price!=null)return it.price;
 if(it.use)return 5;if(it.material)return 3;
 const v=k=>Math.max(0,+it[k]||0),pct=k=>Math.max(0,+it[k]||0)*100;
 return Math.round((10+2*(v('dmg')+v('arm')+v('magicArm')+v('physicalDmg')+v('magicDmg'))+.25*(v('hp')+v('mp'))+3*(v('F')+v('A')+v('I'))+2*(v('regenHp')+v('regenMp'))
  +.5*(pct('spd')+pct('moveSpeed')+pct('attackSpeed')+pct('castSpeed')+pct('area')+pct('cooldownReduction')+pct('critChance')+pct('critDamage')+pct('lifeSteal')+pct('magicLifeSteal')))*(it.th?1.2:1));
}
function precoVenda(id,q){const b=precoBase(id);return gearType[id]?Math.max(1,Math.round(b*(.5+(q==null?50:q)/100))):b}
window.precoVenda=precoVenda;
function addItem(id,q,count=1){if(!ITEMS[id]||!Number.isInteger(count)||count<1)return false;const pilha=ITEMS[id].use||ITEMS[id].stackable;if(pilha){const s=I.find(s=>s&&s.id==id);if(s){s.n+=count;dirtyInv=true;return true}}for(let n=0;n<count;n++){const i=livre(id);I[i]={id,n:pilha?count:1};if(gearType[id])I[i].q=q==null?rollQ():q;if(pilha)break}dirtyInv=true;return true}
const itemCount=id=>I.reduce((n,s)=>n+(s&&s.id==id?s.n:0),0);
function consumeItems(id,count){
 if(itemCount(id)<count)return false;
 for(let i=0;i<I.length&&count>0;i++){const s=I[i];if(!s||s.id!=id)continue;const used=Math.min(s.n,count);s.n-=used;count-=used;if(!s.n)I[i]=null}
 dirtyInv=true;return true
}
/* combate: a arma só pode ser trocada fora de combate, SAIR_COMBATE_S segundos depois que nenhum monstro
   persegue o jogador (bater ou levar dano também conta como combate) */
const SAIR_COMBATE_S=10;let ultimoCombate=-1e9;
function marcarCombate(){ultimoCombate=performance.now()}
function combateRestante(){return Math.max(0,SAIR_COMBATE_S-(performance.now()-ultimoCombate)/1000)}
window.emCombate=()=>combateRestante()>0;window.marcarCombate=marcarCombate;
function armaTravada(){const r=combateRestante();if(r<=0)return false;ft(p.x,p.y-24,'Em combate: troque de arma '+Math.ceil(r)+'s depois de sair do combate','#f0a090');return true}
const ehArma=s=>!!(s&&gearType[s.id]=='sw');
window.armaTravada=armaTravada;window.ehArma=ehArma;
function equipSlot(i,preferredSlot){const s=I[i];if(!s||!gearType[s.id])return;const t=gearType[s.id];
 if((t=='sw'||(t=='sh'&&ehArma(EQ.sh)))&&armaTravada())return;let sl=t=='ri'?(preferredSlot=='r1'||preferredSlot=='r2'?preferredSlot:!EQ.r1?'r1':!EQ.r2?'r2':'r1'):t;
 if(t=='sw'&&(preferredSlot=='sw'||preferredSlot=='sh'))sl=preferredSlot;
 if(t=='sw'&&preferredSlot=='sh'&&ITEMS[s.id].th){ft(p.x,p.y-24,'Arma de duas mãos não cabe na Mão 2','#ccc');return}
 if(t=='sw'&&ITEMS[s.id].th)sl='sw';
 if(t=='sh')sl='sh';
 const old=EQ[sl];
 if(sl=='sh'&&EQ.sw&&ITEMS[EQ.sw.id].th){ft(p.x,p.y-24,'Arma de duas mãos','#ccc');return}
 EQ[sl]=s;I[i]=null;if(old)I[i<QUICK_N?livre(old.id):i]=old;if(sl=='sw'&&ITEMS[s.id].th&&EQ.sh){I[livre(EQ.sh.id)]=EQ.sh;EQ.sh=null}
 dirtyInv=true;setPortrait();saveGame();if(window.playEntitySound)playEntitySound('items',s.id,'use')}
function unequip(sl){if(!EQ[sl])return;if(ehArma(EQ[sl])&&armaTravada())return;I[livre(EQ[sl].id)]=EQ[sl];EQ[sl]=null;dirtyInv=true;setPortrait();saveGame()}
function useSlot(i,preferredSlot){const s=I[i];if(!s||p.dead>0)return;if(gearType[s.id]){equipSlot(i,preferredSlot);return}const d=ITEMS[s.id];if(!d.use)return;
 const h=d.heal||{};if(h.hp){p.hp=Math.min(mhp(),p.hp+h.hp);ft(p.x,p.y-12,'+'+h.hp,'#6f6')}if(h.mp){p.mp=Math.min(mmp(),p.mp+h.mp);ft(p.x,p.y-12,'+'+h.mp,'#6cf')}
 grantAttributeBuff(p,'item:'+s.id,d.bonuses,d.bonusDuration||5);
 if(--s.n<=0)I[i]=null;dirtyInv=true;saveGame();if(!(window.playEntitySound&&playEntitySound('items',s.id,'use'))&&window.playGameSound)playGameSound('item')}
const p={x:CX,y:CY+34,hp:140,mp:35,lvl:1,xp:0,gold:0,dest:null,tgt:null,acd:0,dead:0,hit:0,fl:1,aw:0,wt:null,attackBasic:null,basicMode:'sw',basicNext:'sw',cls:'war',sex:'m',bf:0,npcT:null,fx:0,fy:1};
window.p = p;
Object.assign(p,{path:[],pathI:0,pathKey:'',joy:{x:0,y:0}});
function setDest(x,y){
 if(!walk(x,y)){
  let best=null,distBest=Infinity;
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){const q={x:(i+.5)*T,y:(j+.5)*T};if(!walk(q.x,q.y))continue;const d=(q.x-x)**2+(q.y-y)**2;if(d<distBest){best=q;distBest=d}}
  if(best){x=best.x;y=best.y}
 }
 p.dest={x,y};p.pathKey=Math.floor(x/T)+','+Math.floor(y/T);p.path=buildPath(p,{x,y});p.pathI=0
}
const en=[],drops=[],proj=[],mets=[],fxs=[],fts=[];
const MONSTER_TYPES={
 sl:{name:'Gosma',stats:{F:10,A:3,I:3},skill:{name:'Cuspe ácido',cost:10,cd:7,range:88,windup:.55,damage:12,magic:true}},
 sk:{name:'Esqueleto',stats:{F:16,A:5,I:5},skill:{name:'Golpe esmagador',cost:12,cd:6,range:28,windup:.65,damage:25,multiplier:1.5}},
 gob:{name:'Goblin do Serrote',stats:{F:17,A:10,I:5},skill:{name:'Corte de serrote',cost:999999,cd:999,range:24,windup:.4,damage:0}},
 boss:{name:'Guardião Esqueleto',stats:{F:25,A:8,I:10},skill:{name:'Rugido arcano',cost:25,cd:10,range:55,windup:.9,damage:25,magic:true,radius:48},bossType:'boss'}
};
function monsterLevel(){return Math.max(1,p.lvl-10)+Math.floor(Math.random()*(p.lvl+10-Math.max(1,p.lvl-10)+1))}
function configureMonster(e,type,level){
 const template=MONSTER_TYPES[type],growth=level-1;
 e.ty=type;e.lvl=level;
 // mesmo esquema da classe: atributos iniciais + "por nível" × (nível-1); sem "por nível", +1 de F/A/I por nível
 const per=template.perLevel,grow=k=>per?(+per[k]||0)*growth:['F','A','I'].includes(k)?growth:0,base=template.attributeStats||{};
 e.attributeStats=Object.fromEntries([...new Set([...Object.keys(base),...Object.keys(per||{})])].map(k=>[k,(+base[k]||0)+grow(k)]));e.attributeBuffs=[];e.st=null;
 e.size=Math.max(.25,(+template.size||100)/100);
 if(template.custom&&template.sprite){e.img=template.sprite;e.sp=template.sp}
 else if(type=='boss'&&SP.boss){e.img=SP.boss.d;e.sp=SP.boss}
 const attrScale=template.bossType=='grandboss'?1.5:template.bossType=='boss'?1.25:1;
 e.stats={F:Math.round((template.stats.F+grow('F'))*attrScale),A:Math.round((template.stats.A+grow('A'))*attrScale),I:Math.round((template.stats.I+grow('I'))*attrScale)};
 e.bossType=template.bossType||'normal';e.skill=template.skill;e.skillCd=0;e.skillWindup=false;e.mp=monMana(e.stats.I);e.armor=e.magicArmor=undefined;
 // fórmulas dos monstros: Engine › Fórmulas › Monstros
 e.max+=(e.stats.F-template.stats.F)*CALC.monHpPerF;e.dmg+=(e.stats.F-template.stats.F)*monPhysPerF();
 e.ac=Math.max(.25,e.ac*(1-(e.stats.A-template.stats.A)*CALC.monAtkSpdPerA));
 e.spd*=1+(e.stats.A-template.stats.A)*.005;
 e.weaponRanges=[];e.weaponDamageMultiplier=1;e.weaponDamageBase=null;
 if(template.custom){
  const c=CL[template.classId]||CL.war,eq=template.equipment||{},stats=eq.stats||{},weapon=eq.weapon;
  e.stats.F=Math.round((template.stats.F+grow('F')+(stats.F||0))*attrScale);
  e.stats.A=Math.round((template.stats.A+grow('A')+(stats.A||0))*attrScale);
  e.stats.I=Math.round((template.stats.I+grow('I')+(stats.I||0))*attrScale);
  const maxBase=CALC.monHp0+e.stats.F*CALC.monHpPerF+(stats.hp||0),power=weapon&&weapon.damageType=='magic'?e.stats.I*monMagPerI()+(stats.magicDmg||0):e.stats.F*monPhysPerF()+(stats.physicalDmg||0);
  e.max=Math.round(maxBase*(e.bossType=='grandboss'?2:e.bossType=='boss'?1.5:1)*(template.hpMult||1));
  e.weaponDamageBase=(stats.dmg||0)+power;e.dmg=Math.round(e.weaponDamageBase*(template.dmgMult||1));e.armor=e.stats.A*CALC.monArmPerA+(stats.arm||0);e.magicArmor=monMagArm(e.stats.F,e.stats.A,e.stats.I)+(stats.magicArm||0);
  e.attackMagic=!!(weapon&&weapon.damageType=='magic');e.weaponBasic=weapon&&weapon.basic;e.weaponFx=weapon&&weapon.effects||[];
  e.weaponRanges=eq.weaponRanges||[];e.weaponDamageMultiplier=template.dmgMult||1;
  e.spd=(template.moveSpeed||Math.max(18,CALC.monMove0+e.stats.A*CALC.monMovePerA))*(1+((stats.spd||0)+(stats.moveSpeed||0))/100);e.ac=Math.max(.25,(template.attackSpeed||c.attackSpeed||1)*Math.max(.1,1-e.stats.A*CALC.monAtkSpdPerA)*(1-(stats.attackSpeed||0)/100));
  e.skill=template.skills&&template.skills.length?{...template.skills[0],damage:template.skills[0].damage+template.skills[0].per*level}:{name:'Ataque',cost:999999,cd:999,range:e.weaponBasic?e.weaponBasic.rng:22,windup:.4,damage:0};
  e.equipmentStats=stats;
 }
 const own=e.attributeStats;
 // balanceamento: vida × multiplicador e +X% por nível (Cálculos › Monstros), para as lutas durarem mais golpes
 e.max=Math.max(1,Math.round((e.max+(+own.hp||0))*(CALC.monHpMul??6)*(1+(CALC.monHpLevel??.08)*(level-1))));e.maxMp=Math.max(0,monMana(e.stats.I)+(e.equipmentStats?.mp||0)+(+own.mp||0));e.mp=e.maxMp;
 e.armor=(e.armor??e.stats.A*CALC.monArmPerA)+(+own.arm||0);e.magicArmor=(e.magicArmor??monMagArm(e.stats.F,e.stats.A,e.stats.I))+(+own.magicArm||0);
 e.spd*=Math.max(0,1+attributeValue(own,'moveSpeed'));e.ac=Math.max(CALC.monMinInterval,e.ac*(1-Math.min(.9,attributeValue(own,'attackSpeed'))));
}
const MB={sl:{max:40,dmg:5,spd:28,xp:10,g:3,aggro:60,wu:.35,ac:1.1,base:'sl'},sk:{max:90,dmg:12,spd:36,xp:25,g:8,aggro:75,wu:.45,ac:1.5,base:'sk'},gob:{max:130,dmg:15,spd:34,xp:55,g:24,aggro:90,wu:.45,ac:1.25,base:'goblin'}};
function pickType(far){return far?'sk':'sl'}
function spawn(e){let x,y,t=0;do{x=rnd(0,W);y=rnd(0,W);t++}while(t<500&&(!walk(x,y)||V(x/T|0,y/T|0)>25||insideCamp(x,y,8)));
 const far=Math.hypot(x-CX,y-CY)>240&&Math.random()<.55,type=pickType(far),B=MB[type];
 Object.assign(e,{img:SP[B.base].d,sp:SP[B.base],max:B.max,dmg:B.dmg,spd:B.spd,xp:B.xp,g:B.g,aggro:B.aggro,wu:B.wu,ac:B.ac});
 configureMonster(e,type,monsterLevel());
 e.x=e.hx=x;e.y=e.hy=y;e.hp=e.max;e.st=null;e.fx=0;e.fy=1;e.aw=0;e.cd=0;e.hit=0;e.rt=0;e.dest=null;e.path=[];e.pathI=0;e.pathKey='';e.roamT=5;e.roamRadius=rnd(38,82)}
/* sem inimigos iniciais: eles saem de portais (js/portals.js) */
let questDone=false,carpenterHelped=false,sawQuestActive=false,sawObtained=false,woodQuestActive=false,wallBuilt=false,magicWoodQuestActive=false,campPortalBuilt=false,sawGoblin=null,inDungeon=false,campPortalTheme='normal',blacksmithSaved=false;
const WALL_WOOD_REQUIRED=20;
const PORTAL_WOOD_REQUIRED=10,campPortal={x:CX-66,y:CY-48};
function questMonsterRequested(type){
 return type=='gob'?sawQuestActive&&!sawObtained&&!wallBuilt:type=='sprout'?(woodQuestActive&&!wallBuilt&&itemCount('wood')<WALL_WOOD_REQUIRED)||(magicWoodQuestActive&&!campPortalBuilt&&itemCount('magicWood')<PORTAL_WOOD_REQUIRED):false
}
const questSpawnWeight=(type,weight)=>weight*(questMonsterRequested(type)?1.2:1);
function questMonsterTarget(type){let target=null,best=Infinity;for(const e of en){if(e.hp<=0||e.ty!=type)continue;const d=dist(e,p);if(d<best){best=d;target=e}}return target}
function syncCampWall(){
 CAMP_WALL.built=wallBuilt;
 if(wallBuilt){
  // Keep the gate approach clear even when the generated forest crosses it.
  for(let i=trees.length;i--;)if(campGateOccupied(trees[i].x,trees[i].y,18))trees.splice(i,1);
 }
 rebuildWG();
 for(const agent of [p,...en]){
  agent.path=[];agent.pathI=0;agent.pathKey='';agent.dest=null;
  if(!campWallBlocks(agent.x,agent.y))continue;
  const distance=campDistance(agent.x,agent.y),scale=(CAMP_SAFE_HALF_SIZE+(agent===p?-22:22))/distance;
  const target={x:CX+(agent.x-CX)*scale,y:CY+(agent.y-CY)*scale};
  const pos=snapWalk(target.x,target.y,agent!==p);
  agent.x=pos.x;agent.y=pos.y
 }
}
function toggleCampGate(){
 if(!wallBuilt||p.dead>0)return;
 if(dist(p,campGate)>44){ft(p.x,p.y-24,'Aproxime-se do portão.','#ffd84a');return}
 if(CAMP_WALL.gateOpen&&[p,...en.filter(e=>e.hp>0)].some(e=>campGateOccupied(e.x,e.y,5))){ft(campGate.x,campGate.y-34,'Passagem ocupada!','#f66');return}
 CAMP_WALL.gateOpen=!CAMP_WALL.gateOpen;syncCampWall();
 ft(campGate.x,campGate.y-34,CAMP_WALL.gateOpen?'PORTÃO ABERTO':'PORTÃO FECHADO','#ffd84a');saveGame()
}
const boss={boss:true,img:SP.sk.d,sp:SP.sk,max:420,dmg:20,spd:25,xp:180,g:80,aggro:110,wu:.6,ac:1.8};
configureMonster(boss,'boss',monsterLevel());
boss.x=boss.hx=CX+250;boss.y=boss.hy=CY-250;boss.hp=boss.max;boss.fx=0;boss.fy=1;boss.aw=0;boss.cd=0;boss.hit=0;boss.rt=0;en.push(boss);
const ft=(x,y,t,c)=>fts.push({x,y,t,c,a:1});
const ring=(x,y,r,c,d=.4)=>fxs.push({x,y,r,c,t:0,d});
