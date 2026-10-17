/* ---------- combate ---------- */
function statusAttributeBonus(entity,key){
 let total=0;
 for(const buff of entity.attributeBuffs||[])total+=attributeValue(buff.stats,key);
 for(const [id,status] of Object.entries(entity.st||{})){
  const effect=FX_INFO[id];if(!effect)continue;
  total+=((attributeValue(effect.bonuses,key))+
   (!['physicalDmg','magicDmg','hp','mp'].includes(key)?attributeValue(effect.actionStats,key):0))*(status.n||1);
 }
 return total;
}
function playerAttributeBonus(key){return (CL[p.cls]?.statBonus?.(key)||0)+statusAttributeBonus(p,key)}
function grantAttributeBuff(entity,id,stats,duration){
 if(!stats||!Object.values(stats).some(Number))return;
 entity.attributeBuffs=entity.attributeBuffs||[];
 const buff={id,stats:{...stats},t:Math.max(.1,Number(duration)||5)};
 const index=entity.attributeBuffs.findIndex(b=>b.id===id);
 if(index<0)entity.attributeBuffs.push(buff);else entity.attributeBuffs[index]=buff;
}
function tickAttributeBuffs(entity,dt){
 entity.attributeBuffs=(entity.attributeBuffs||[]).filter(b=>(b.t-=dt)>0);
}
const monsterAttribute=(entity,key)=>attributeValue(entity.attributeStats,key)+attributeValue(entity.equipmentStats,key)+statusAttributeBonus(entity,key);
const monsterAttributes=entity=>Object.fromEntries(['F','A','I'].map(k=>[k,Math.max(0,(entity.stats?.[k]||0)+statusAttributeBonus(entity,k))]));
const monsterMaxHp=entity=>Math.max(1,entity.max+statusAttributeBonus(entity,'hp')+statusAttributeBonus(entity,'F')*CALC.monHpPerF);
const monsterMaxMp=entity=>Math.max(0,(entity.maxMp??35+(entity.stats.I-3)*5)+statusAttributeBonus(entity,'mp')+statusAttributeBonus(entity,'I')*5);
const areaMultiplier=entity=>Math.sqrt(Math.max(.01,1+(entity===p?bonus('area'):monsterAttribute(entity,'area'))));
const cooldownMultiplier=entity=>1-Math.max(0,Math.min(.9,entity===p?bonus('cooldownReduction'):monsterAttribute(entity,'cooldownReduction')));
function combatRoll(entity,damage){
 const value=k=>entity===p?bonus(k):monsterAttribute(entity,k),crit=Math.random()<Math.max(0,Math.min(1,value('critChance')));
 return {damage:damage*(crit?Math.max(1,1.5+value('critDamage')):1),crit,lifeSteal:Math.max(0,Math.min(1,value('lifeSteal'))),magicLifeSteal:Math.max(0,Math.min(1,value('magicLifeSteal')))};
}
/* Roubo de vida físico vale para a parte física do dano; o mágico, para a parte mágica. */
const stealRatio=(roll,magicShare)=>roll.lifeSteal*(1-magicShare)+roll.magicLifeSteal*magicShare;
function drainLife(entity,damage,ratio){
 if(!entity||entity.hp<=0||!ratio||damage<=0)return;
 entity.hp=Math.min(entity===p?mhp():monsterMaxHp(entity),entity.hp+damage*ratio);
}
function applyActionAttributes(entity,source){
 const action=source.actionStats||{},temporary={...action};
 for(const key of ['physicalDmg','magicDmg','hp','mp'])delete temporary[key];
 grantAttributeBuff(entity,'action:'+source.id,temporary,source.bonusDuration||source.dur);
 grantAttributeBuff(entity,'bonus:'+source.id,source.bonuses,source.bonusDuration||source.dur);
 entity.hp=Math.min(entity===p?mhp():monsterMaxHp(entity),entity.hp+(+action.hp||0));
 entity.mp=Math.min(entity===p?mmp():monsterMaxMp(entity),(entity.mp||0)+(+action.mp||0));
}
const campB=()=>insideCamp(p.x,p.y)?CALC.camp:0,regenHp=()=>attributes().F*CALC.regenPerF+campB()+bonus('regenHp'),regenMp=()=>attributes().I*CALC.regenPerI+campB()+bonus('regenMp');
const dmgP=()=>Math.round((bonus('dmg')+weaponPower())*(p.bf>0?1.5:1)*(1+(CL[p.cls].pDmg||0)));
function gainPlayerXp(value){
 p.xp+=Math.max(0,value);
 while(p.lvl<CALC.maxLevel&&p.xp>=p.lvl*CALC.xpPerLevel){p.xp-=p.lvl*CALC.xpPerLevel;p.lvl++;applySkills();p.hp=mhp();p.mp=mmp();ring(p.x,p.y,50,'#ffd84a',.8);ft(p.x,p.y-24,'NÍVEL '+p.lvl+'!','#ffd84a')}
 if(p.lvl>=CALC.maxLevel)p.xp=0
}
const FX_INFO={poison:{n:'Veneno',c:'#7d3',kind:'dot',tick:1,dtype:'true'},burn:{n:'Queimadura',c:'#f83',kind:'dot',tick:1,dtype:'true'},bleed:{n:'Sangramento',c:'#d33',kind:'dot',tick:1,dtype:'true'},slow:{n:'Lentidão',c:'#6bf',kind:'slow'},stun:{n:'Atordoado',c:'#fd4',kind:'stun'}};
const fxKind=k=>FX_INFO[k]&&FX_INFO[k].kind;
function vulnMult(t){let m=0;if(t.st)for(const k in t.st)if(fxKind(k)=='vuln')m=Math.max(m,t.st[k].pw*(t.st[k].n||1));return 1+m/100}
const charDamage=t=>typedPower(t)+bonus('dmg');
const monsterWeaponDamageDelta=e=>(e.weaponRanges||[]).reduce((sum,range)=>sum+rollWeaponDamage(range)-(range.min+range.max)/2,0);
function monsterCtx(e,weaponDelta=0){const s=monsterAttributes(e),equipmentDamage=monsterAttribute(e,'dmg')+weaponDelta,ph=s.F*CALC.physPerF+monsterAttribute(e,'physicalDmg')+equipmentDamage,mg=s.I*CALC.magPerI+monsterAttribute(e,'magicDmg')+equipmentDamage;return{phys:ph,mag:mg,entity:e,attr:k=>k=='none'||!k?0:k=='physicalPower'?ph-equipmentDamage:k=='magicPower'?mg-equipmentDamage:k=='dmg'?equipmentDamage:k=='weaponPower'||k=='charDamage'?(e.attackMagic?mg:ph):s[k]||0}}
function resolveFx(list,cd,ctx){ctx=ctx||{phys:charDamage('physical'),mag:charDamage('magic'),entity:p,attr:k=>k=='none'||!k?0:scaleBase(k,'physical')};return(Array.isArray(list)?list:[]).filter(f=>f&&FX_INFO[f.type]).map(f=>{const dot=fxKind(f.type)=='dot',src=f.src=='physical'?ctx.phys:f.src=='magic'?ctx.mag:cd;return{caster:ctx.entity||p,self:f.target=='self',type:f.type,chance:f.chance==null||f.chance===''?100:+f.chance,dur:Math.max(.5,+f.dur||FX_INFO[f.type].dur||3),pw:(+f.power||FX_INFO[f.type].power||0)+(dot?(+f.pct||0)/100*src+(+f.attrPct||0)/100*ctx.attr(f.attr):0)}})}
function applyFx(t,fx){if(!fx||!fx.length)return;let k=0;for(const f of fx){if(Math.random()*100>=f.chance)continue;const tg=f.self?f.caster||p:t;tg.st=tg.st||{};const o=tg.st[f.type];tg.st[f.type]={t:f.dur,d:f.dur,pw:Math.max(f.pw||0,o?o.pw:0),tk:o?o.tk:0,n:Math.min(FX_INFO[f.type].stacks||1,(o?o.n||1:0)+1)};ft(tg.x,tg.y-36-k++*7,FX_INFO[f.type].n,FX_INFO[f.type].c)}}
function tickStatus(t,dt){
 if(!t.st)return;
 for(const k of Object.keys(t.st)){
  const s=t.st[k],effect=FX_INFO[k];if(!effect){delete t.st[k];continue}
  const elapsed=Math.min(dt,Math.max(0,s.t));s.t-=dt;
  const action=effect.actionStats||{},interval=Math.max(.2,effect.tick||1);
  s.tk=(s.tk||0)+elapsed;
  while(s.tk>=interval&&t.hp>0){
   s.tk-=interval;const stacks=s.n||1;
   if(fxKind(k)==='hot'){t.hp=Math.min(t===p?mhp():monsterMaxHp(t),t.hp+s.pw*stacks);ft(t.x,t.y-24,'+'+Math.round(s.pw*stacks),'#6f6')}
   if(fxKind(k)==='dot'){if(t===p)hurtP(s.pw*stacks,true,null,k);else hurtE(t,s.pw*stacks,true,null,k)}
   if(t.hp<=0)break;
   if(action.physicalDmg||action.magicDmg){
    const damage={physical:Math.max(0,+action.physicalDmg||0)*stacks,magic:Math.max(0,+action.magicDmg||0)*stacks};
    if(t===p)hurtP(damage,false,null,k);else hurtE(t,damage,false,null,k);
   }
   if(t.hp<=0)break;
   t.hp=Math.min(t===p?mhp():monsterMaxHp(t),t.hp+(+action.hp||0)*stacks);
   t.mp=Math.min(t===p?mmp():monsterMaxMp(t),(t.mp||0)+(+action.mp||0)*stacks);
  }
  if(s.t<=0)delete t.st[k];
 }
}
const statusSpeed=t=>{const s=t.st;if(!s)return 1;let v=1;for(const k in s){const q=fxKind(k);if(q=='stun')return 0;if(q=='slow')v=Math.min(v,Math.max(.1,1-s[k].pw*(s[k].n||1)/100))}for(const k in s)if(fxKind(k)=='haste')v*=1+s[k].pw*(s[k].n||1)/100;return v};
function hurtE(e,d,magic=false,fx=null,dot=null){if(e.hp<=0)return;const di=dot&&FX_INFO[dot],tr=di&&(di.dtype||'true')=='true',mg=di&&!tr?di.dtype=='magic':magic;
 const physicalDefense=(e.armor??e.stats?.A*5??0)+statusAttributeBonus(e,'arm')+statusAttributeBonus(e,'A')*5;
 const magicalDefense=(e.magicArmor??(e.stats?e.stats.F+e.stats.A+e.stats.I:0))+statusAttributeBonus(e,'magicArm')+['F','A','I'].reduce((sum,k)=>sum+statusAttributeBonus(e,k),0);
 let magicShare=mg?1:0;
 if(d&&typeof d=='object'){const phys=+d.physical||0,mag=+d.magic||0,pp=phys>0?Math.max(1,phys-physicalDefense):0,mp=mag>0?Math.max(1,mag-magicalDefense):0;magicShare=mp/((pp+mp)||1);d=pp+mp;if(!dot)d*=vulnMult(e)*(1+stSum(p,'dmgup')/100)*Math.max(.2,1-stSum(p,'dmgdown')/100)}
 else{const defense=tr?0:mg?magicalDefense:physicalDefense;d=Math.max(1,(d-defense)*(dot?1:vulnMult(e)*(1+stSum(p,'dmgup')/100)*Math.max(.2,1-stSum(p,'dmgdown')/100)))}
 const roll=dot?{damage:d,lifeSteal:0,magicLifeSteal:0}:combatRoll(p,d);d=roll.damage;drainLife(p,Math.min(e.hp,d),stealRatio(roll,magicShare));
 // monstro de outro jogador (multijogador): o dano vai para o dono da sala, que decide a morte
 if(!e.mpProxy&&!dot&&window.MP&&MP.participou)MP.participou(e);
 if(e.mpProxy){e.hp=Math.max(1,e.hp-d);if(!dot){e.hit=.15;if(!(window.playEntitySound&&playEntitySound('monsters',e.ty,'hurt'))&&window.playGameSound)playGameSound(magic?'magicHit':'sword')}ft(e.x,e.y-22,Math.round(d),dot?FX_INFO[dot].c:'#fff');if(fx)applyFx(e,fx.filter(f=>f.self));if(window.MP)MP.golpe(e,d,fx&&fx.filter(f=>!f.self));return}
 e.hp-=d;if(!dot){e.hit=.15;if(!(window.playEntitySound&&playEntitySound('monsters',e.ty,'hurt'))&&window.playGameSound)playGameSound(magic?'magicHit':'sword')}ft(e.x,e.y-22,Math.round(d),dot?FX_INFO[dot].c:'#fff');if(fx&&e.hp>0)applyFx(e,fx);
 if(e.hp<=0)killMonster(e)}
/* Morte de um monstro: XP, ouro, missões e itens. No multijogador o dono da sala avisa os outros,
   e cada um recebe a própria recompensa chamando esta mesma função com a cópia local do monstro. */
function killMonster(e){
 {
  if(window.MP)MP.morreu(e);
  e.rt = (window.inDungeon || e.isDungeonMob) ? 0 : 15;
  if(window.inDungeon || e.isDungeonMob) e.gone = 1;
  // na ilha com outros jogadores, XP e ouro são divididos entre quem participou (js/multiplayer.js)
  const parte=window.MP&&MP.parte?MP.parte(e):1;
  if(parte<=0){if(p.tgt==e)p.tgt=null;return}
  const xp=Math.max(1,Math.round(e.xp*parte)),gold=Math.round(e.g*parte);
  gainPlayerXp(xp);p.gold+=gold;gainClassXp(xp);ft(e.x,e.y-30,'+'+gold+'g'+(parte<1?' (÷'+Math.round(1/parte)+')':''),'#fd4');if(!(window.playEntitySound&&playEntitySound('monsters',e.ty,'death'))&&window.playGameSound)playGameSound('death');if(gold>0&&window.playGameSound)playGameSound('coin');if(p.tgt==e){p.tgt=null;if(window.autoTargetAfterKill){let nearest=120;for(const other of en){if(other===e||other.hp<=0||!canSee(other.x,other.y))continue;const d=dist(other,p);if(d<nearest){nearest=d;p.tgt=other}}}}
  if(e.boss&&!window.inDungeon){questDone=true;ft(e.x,e.y-45,'GUARDIÃO ESQUELETO DERROTADO!','#ffd84a');saveGame()}
  if(e.sawGoblin){sawGoblin=null;ft(e.x,e.y-45,'SERROTE ENCONTRADO!','#ffd84a');offerDrop('saw',true)}
  const guaranteed=MONSTER_TYPES[e.ty].guaranteedDrops||[];
  guaranteed.forEach(id=>offerDrop(id));
  const chance=CALC.dropChance*(1+(e.dropBonus||0)),r=Math.random(),drops=(e.dropIds||[]).filter(id=>!guaranteed.includes(id));
  if(guaranteed.length&&!drops.length)return;
  const id=drops.length?(r<chance?drops[Math.floor(Math.random()*drops.length)]:null):r<.3?'hp':r<.45?'mp':r<.5?'sw':r<.55?'bo':r<.6?'sh':r<.78?GEARIDS[Math.floor(Math.random()*GEARIDS.length)]:null;if(id&&ITEMS[id]&&!ITEMS[id].use)offerDrop(id);
 }}
function hurtP(d,magic=false,fx=null,dot=null,attacker=null){const di=dot&&FX_INFO[dot],tr=di&&(di.dtype||'true')=='true',mg=di&&!tr?di.dtype=='magic':magic;
 let magicShare=mg?1:0;
 if(d&&typeof d=='object'){const phys=+d.physical||0,mag=+d.magic||0,pp=phys>0?Math.max(1,phys-armor()):0,mp=mag>0?Math.max(1,mag-magicArmor()):0;magicShare=mp/((pp+mp)||1);d=pp+mp;d=Math.round(d*vulnMult(p)*Math.max(.2,1-stSum(p,'guard')/100))}
 else d=tr?Math.max(1,Math.round(d)):Math.max(1,Math.round((d-(mg?magicArmor():armor()))*(dot?1:vulnMult(p)*Math.max(.2,1-stSum(p,'guard')/100))));
 if(!dot&&p.guard>0)d=Math.max(1,Math.round(d/2));if(!dot&&attacker){const roll=combatRoll(attacker,d);d=roll.damage;drainLife(attacker,Math.min(p.hp,d),stealRatio(roll,magicShare))}p.hp-=d;if(!dot){p.hit=.15;if(window.playGameSound)playGameSound('hurt')}ft(p.x,p.y-24,Math.round(d),dot?FX_INFO[dot].c:'#f66');if(fx&&p.hp>0)applyFx(p,fx);if(p.hp<=0){p.st=null;p.attributeBuffs=[];p.dead=4;p.gold=Math.floor(p.gold/2);p.dest=p.tgt=null;p.aw=0;p.wt=null;p.attackBasic=null;saveGame()}}
const CL={war:{n:'Guerreiro',F:17,A:7,I:2,perLevel:{F:6,A:3,I:1},attackSpeed:1.25},mag:{n:'Mago',F:2,A:2,I:12,perLevel:{F:1,A:2,I:5},attackSpeed:1},hea:{n:'Curandeiro',F:4,A:4,I:10,perLevel:{F:2,A:2,I:4},attackSpeed:1.1}};
p.classProgress=p.classProgress||{war:{rank:1,xp:0}};
function gainClassXp(value){
 p.classProgress=p.classProgress||{};const progress=p.classProgress[p.cls]||(p.classProgress[p.cls]={rank:1,xp:0});
 if(progress.rank>=10)return;progress.xp+=Math.max(0,value);
 while(progress.rank<10&&progress.xp>=progress.rank*CALC.rankXp){progress.xp-=progress.rank*CALC.rankXp;progress.rank++;
  applySkills();p.hp=Math.min(mhp(),p.hp);p.mp=Math.min(mmp(),p.mp);ring(p.x,p.y,42,'#72d9ff',.65);ft(p.x,p.y-28,'RANK '+progress.rank+'!','#72d9ff')}
 if(progress.rank>=10)progress.xp=0;
 if(window.renderSkillMenu)renderSkillMenu();if(window.saveGame)saveGame()}
const attributes=()=>{const c=CL[p.cls],growth=c.perLevel||{},x=k=>c.pa?c.pa(k):0;return{F:3+(c.F||0)+(growth.F||0)*(p.lvl-1)+x('F')+bonus('F'),A:3+(c.A||0)+(growth.A||0)*(p.lvl-1)+x('A')+bonus('A'),I:3+(c.I||0)+(growth.I||0)*(p.lvl-1)+x('I')+bonus('I')}};
const mhp=()=>Math.max(1,Math.round((CALC.hp0+(attributes().F-3)*CALC.hpPerF)*(1+(CL[p.cls].passiveHp||0)))+bonus('hp'));
const mmp=()=>Math.max(0,Math.round((CALC.mp0+(attributes().I-3)*CALC.mpPerI)*(1+(CL[p.cls].pMp||0)))+bonus('mp'));
const armor=()=>Math.round(attributes().A*CALC.armPerA+bonus('arm')*(1+(CL[p.cls].pArm||0)));
const magicArmor=()=>Math.round(attributes().F+attributes().A+attributes().I+bonus('magicArm')*(1+(CL[p.cls].pMagicArm||0)));
const attackInterval=()=>Math.max(CALC.minInterval,(CL[p.cls].attackSpeed||1)*(1-attributes().A*CALC.atkSpdPerA)*(1-(CL[p.cls].pAttackSpeed||0))*(1-bonus('attackSpeed')));
const spdB=()=>Math.max(-1,bonus('spd')+bonus('moveSpeed')+attributes().A*CALC.spdPerA+(CL[p.cls].pSpd||0)+(CL[p.cls].pMoveSpeed||0));
const magicPower=()=>attributes().I*CALC.magPerI+bonus('magicDmg');
const physicalPower=()=>attributes().F*CALC.physPerF+bonus('physicalDmg');
const weaponPower=()=>{const b=p.attackBasic||basic();return b.damageType=='magic'?magicPower():physicalPower()};
const scaleValue=s=>({weaponPower:weaponPower(),physicalPower:physicalPower(),magicPower:magicPower(),dmg:bonus('dmg'),F:attributes().F,A:attributes().A,I:attributes().I}[s]||0);
const typedPower=t=>t=='magic'?magicPower():t=='physical'?physicalPower():weaponPower();
const scaleBase=(st,t)=>st=='weaponPower'?typedPower(t):st=='charDamage'?typedPower(t)+bonus('dmg'):scaleValue(st);
/* dano = fixo + por nível + % do dano do personagem + % de um atributo/poder */
const scaledDamage=s=>{const st=s.scaleStat||'none',ap=s.scalePercent==null?100:+s.scalePercent||0;
 return Math.round((+s.base||0)+(+s.per||0)*p.lvl+(+s.charPercent||0)/100*charDamage(s.damageType)+(st=='none'?0:scaleBase(st,s.damageType)*ap/100))};
const splitSkillDamage=s=>({physical:Math.max(0,(+s.physicalFlat||0)+(+s.actionStats?.physicalDmg||0)+(+s.physicalPercent||0)*charDamage('physical')/100),magic:Math.max(0,(+s.magicFlat||0)+(+s.actionStats?.magicDmg||0)+(+s.magicPercent||0)*charDamage('magic')/100)});
const hasSplitDamage=s=>['physicalFlat','physicalPercent','magicFlat','magicPercent'].some(k=>+s[k]>0)||+s.actionStats?.physicalDmg>0||+s.actionStats?.magicDmg>0,
 skillDamage=s=>{if(s.damageModel=='split')return splitSkillDamage(s);if(!hasSplitDamage(s))return scaledDamage(s);
  const d=splitSkillDamage(s),old=scaledDamage(s),magic=s.damageType=='magic'||s.damageType!='physical'&&basic().damageType=='magic';d[magic?'magic':'physical']+=old;return d};
const damageText=d=>d&&typeof d=='object'?Math.round(d.physical||0)+' físico + '+Math.round(d.magic||0)+' mágico':Math.round(d);
const skillMagic=s=>s.damageType=='magic'||(s.damageType!='physical'&&basic().damageType=='magic');
const basicAttackDamage=b=>withWeaponDamageRoll(()=>{if(b&&b.formula){applyActionAttributes(p,b.formula);const damage=b.splitDamage?skillDamage(b.formula):scaledDamage(b.formula),factor=(p.bf>0?1.5:1)*(1+(CL[p.cls].pDmg||0))*(b.dm||1);return damage&&typeof damage=='object'?{physical:Math.round((damage.physical||0)*factor),magic:Math.round((damage.magic||0)*factor)}:Math.round(damage*factor)}
 const factor=(p.bf>0?1.5:1)*(1+(CL[p.cls].pDmg||0))*(b.dm||1),primary=Math.round((bonus('dmg')+weaponPower())*factor),off=bonus(b&&b.damageType=='magic'?'physicalDmg':'magicDmg')*factor;
 return b&&b.damageType=='magic'?{physical:off,magic:primary}:{physical:primary,magic:off}});
p.hp=mhp();p.mp=mmp();
const heal=n=>{p.hp=Math.min(mhp(),p.hp+n);ft(p.x,p.y-24,'+'+n,'#6f6');ring(p.x,p.y,24,'#6f6',.4)};
const withWeaponDamage=(d,flat)=>d&&typeof d=='object'||flat?d:d+weaponPower();
const pr=(dm,col,hl,opt={})=>{const f=(w,t)=>{const a=Math.atan2(t.y-8-p.y,t.x-p.x),d=dm();proj.push({x:p.x,y:p.y-8,vx:Math.cos(a)*190,vy:Math.sin(a)*190,t:1.6,d:withWeaponDamage(d,opt.flat),magic:opt.magic??(basic().damageType=='magic'),c:col,hl,tg:t,fx:opt.fx&&opt.fx()})};f.tg=1;return f};
const blink=(dm,opt={})=>w=>{let d=Math.min(80,dist(p,w)),a=Math.atan2(w.y-p.y,w.x-p.x);while(d>0&&(!walk(p.x+Math.cos(a)*d,p.y+Math.sin(a)*d)||!campWallSegmentClear(p,{x:p.x+Math.cos(a)*d,y:p.y+Math.sin(a)*d})))d=Math.max(0,d-4);ring(p.x,p.y,16,'#9cf');p.x+=Math.cos(a)*d;p.y+=Math.sin(a)*d;p.dest=null;ring(p.x,p.y,16,'#9cf');if(dm)en.forEach(e=>{if(e.hp>0&&dist(e,p)<32*areaMultiplier(p))hurtE(e,withWeaponDamage(dm(),opt.flat),opt.magic??(basic().damageType=='magic'),opt.fx&&opt.fx())})};
const nova=(r,dm,col,hl,opt={})=>()=>{const radius=r*areaMultiplier(p);ring(p.x,p.y,radius,col,.35);en.forEach(e=>{if(e.hp>0&&dist(e,p)<radius)hurtE(e,withWeaponDamage(dm(),opt.flat),opt.magic??(basic().damageType=='magic'),opt.fx&&opt.fx())});if(hl)heal(hl())};
function SKI(k,a,b){const c=mkCanvas(24,24),x=c.getContext('2d'),{R,disc}=kit(x),D=shade(a,.35),L=shade(a,1.35);
 for(let y=0;y<24;y++){x.fillStyle=shade(a,.16+.14*(1-y/24));x.fillRect(0,y,24,1)}
 R(0,0,24,1,shade(a,.55));R(0,0,1,24,shade(a,.45));R(0,23,24,1,'#05070a');R(23,0,1,24,'#05070a');
 const ln=(x0,y0,x1,y1,w,col)=>{const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0));for(let i=0;i<=n;i++)R(Math.round(x0+(x1-x0)*i/n),Math.round(y0+(y1-y0)*i/n),w,w,col)};
 if(k=='orb'||k=='meteor'){const big=k=='meteor',cx=big?15:14,cy=big?15:10,r=big?6:6;
  for(let i=1;i<=(big?9:6);i++){disc(cx-i*(big?1.6:1.4)|0,cy-i*(big?1.6:1.4)|0,Math.max(1,r-1-i*.5|0),shade(a,1.25-i*.1))}
  disc(cx,cy,r+1,D);disc(cx,cy,r,a);disc(cx-1,cy-1,r-2,b);disc(cx-2,cy-2,Math.max(1,r-4),'#fff');
  if(big){R(cx+2,cy+1,2,2,D);R(cx-3,cy+3,2,2,D)}}
 else if(k=='blade'||k=='axe'){ln(4,19,17,6,3,D);ln(5,19,17,7,1,'#7a4a25');ln(5,18,16,7,1,'#a8703a');
  if(k=='blade'){ln(15,8,19,4,3,D);ln(16,8,19,5,1,b);ln(16,7,20,3,1,'#fff');ln(5,15,9,19,2,D);ln(6,15,9,18,1,L)}
  else{for(let i=0;i<7;i++){R(12+i,4+Math.abs(3-i)*0+0,1,1,D)}disc(15,8,5,D);disc(15,8,4,b);disc(14,7,2,'#fff');R(18,9,4,2,D);ln(5,19,13,11,2,'#7a4a25')}}
 else if(k=='dash'){for(const [y,l] of [[6,9],[11,13],[16,9]]){R(2,y,l,2,shade(b,.6));R(2,y,l-3,1,b)}
  for(let i=0;i<7;i++){R(12+i,4+i,3,3,D);R(12+i,17-i,3,3,D)}for(let i=0;i<7;i++){R(13+i,5+i,2,2,b);R(13+i,17-i,2,2,L)}}
 else if(k=='spin'){for(let t=0;t<300;t+=6){const r=t*Math.PI/180;R(Math.round(11+Math.cos(r)*8),Math.round(11+Math.sin(r)*8),3,3,D)}
  for(let t=0;t<300;t+=6){const r=t*Math.PI/180;R(Math.round(12+Math.cos(r)*8),Math.round(12+Math.sin(r)*8),1+(t>150?1:0),1+(t>150?1:0),t>150?b:L)}
  ln(15,2,21,5,2,D);ln(16,3,20,5,1,b);ln(21,5,18,10,2,D);ln(20,6,18,9,1,'#fff');disc(12,12,2,b)}
 else if(k=='flame'){for(const [s,col,o] of [[1.25,D,0],[1,a,0],[.65,b,3],[.32,'#fff',5]])for(let y=3;y<=21;y++){const t=(y-3-o*.3)/(18-o*.3);if(t<0||t>1)continue;const hw=Math.sin(Math.PI*Math.pow(t,.75))*7*s,cx=12+Math.sin(t*4+.5)*(1-t)*3;R(Math.round(cx-hw),y,Math.max(1,Math.round(hw*2)),1,col)}}
 else if(k=='burst'||k=='snow'){const n=k=='snow'?6:8;for(let i=0;i<n;i++){const r=i*2*Math.PI/n+(k=='snow'?Math.PI/2:0.3926);ln(12+Math.cos(r)*3,12+Math.sin(r)*3,12+Math.cos(r)*10,12+Math.sin(r)*10,3,D);}
  for(let i=0;i<n;i++){const r=i*2*Math.PI/n+(k=='snow'?Math.PI/2:0.3926);ln(12+Math.cos(r)*3,12+Math.sin(r)*3,12+Math.cos(r)*9,12+Math.sin(r)*9,1,i%2?L:b)}
  disc(12,12,4,D);disc(12,12,3,a);disc(11,11,2,b);R(10,10,1,1,'#fff')}
 else if(k=='cross'){R(8,2,8,20,D);R(2,8,20,8,D);R(9,3,6,18,a);R(3,9,18,6,a);R(9,3,6,2,L);R(3,9,18,2,L);R(10,5,2,14,b);R(5,10,14,2,b);R(10,10,4,4,'#fff')}
 else if(k=='shield'){for(let y=2;y<=22;y++){const hw=y<13?9:Math.max(0,9-(y-13)*1.0);R(Math.round(12-hw),y,Math.round(hw*2),1,D)}
  for(let y=3;y<=21;y++){const hw=(y<13?9:Math.max(0,9-(y-13)*1.0))-1.5;if(hw>0)R(Math.round(12-hw),y,Math.round(hw*2),1,a)}
  R(11,4,2,16,b);R(5,9,14,2,b);R(6,5,4,3,L);R(11,9,2,2,'#fff')}
 else if(k=='fist'){R(5,8,15,12,D);R(6,9,13,10,a);for(let i=0;i<4;i++){R(6+i*3+0,6,3,4,D);R(7+i*3,7,2,3,L)}R(4,13,4,6,D);R(5,14,2,4,a);R(17,11,2,6,shade(a,.7));R(8,12,8,1,b)}
 return c.toDataURL()}
const pw=()=>weaponPower();
const guard=()=>{p.guard=6;ring(p.x,p.y,30,'#9cf',.5);ft(p.x,p.y-24,'Escudo!','#9cf')};
const SKS={
war:[{n:'Arremesso',mana:10,cd:2.5,ic:SKI('blade','#8a94a8','#fff'),f:pr(()=>25+p.lvl*5,'#ddd'),d:()=>'Arremessa uma lança teleguiada no alvo e causa '+(25+p.lvl*5+pw())+' de dano.'},
 {n:'Investida',mana:20,cd:7,ic:SKI('dash','#d9823a','#ffe0b0'),f:blink(()=>25+p.lvl*5),d:()=>'Avança até 80 px na direção do mouse e causa '+(25+p.lvl*5+weaponPower())+' de dano a quem estiver perto.'},
 {n:'Giro',mana:20,cd:6,ic:SKI('spin','#b8322a','#ffd0c0'),f:nova(40,()=>35+p.lvl*8,'#e55'),d:()=>'Gira a arma e causa '+(35+p.lvl*8+pw())+' de dano a todos ao redor.'},
 {n:'Fúria',mana:40,cd:25,ic:SKI('flame','#e0401e','#ffd84a'),f:()=>{p.bf=8;ring(p.x,p.y,40,'#f55',.5);ft(p.x,p.y-24,'Fúria!','#f77')},d:()=>'Por 8 s aumenta o dano e a velocidade de ataque.'},
 {n:'Impacto',mana:15,cd:4,ic:SKI('burst','#d98a20','#fff0b0'),f:nova(30,()=>50+p.lvl*10,'#fa4'),d:()=>'Golpe curto e pesado em área: '+(50+p.lvl*10+pw())+' de dano.'},
 {n:'Muralha',mana:25,cd:18,ic:SKI('shield','#4a6a96','#dfe8f5'),f:guard,d:()=>'Por 6 s você recebe metade do dano.'}],
mag:[{n:'Bola de fogo',mana:15,cd:2,ic:SKI('orb','#d9501a','#ffd84a'),f:pr(()=>25+p.lvl*6),d:()=>'Dispara uma bola de fogo no alvo: '+(25+p.lvl*6+pw())+' de dano.'},
 {n:'Salto',mana:20,cd:6,ic:SKI('dash','#3a8ab8','#bfefff'),f:blink(),d:()=>'Teletransporta você até 80 px na direção do mouse.'},
 {n:'Nova',mana:30,cd:8,ic:SKI('burst','#2f62c0','#cfe8ff'),f:nova(48,()=>30+p.lvl*8,'#7cf'),d:()=>'Explosão de energia ao redor: '+(30+p.lvl*8+pw())+' de dano.'},
 {n:'Meteoro',mana:70,cd:25,ic:SKI('meteor','#a02010','#ffd84a'),f:w=>mets.push({x:w.x,y:w.y,t:.9,dmg:120+p.lvl*12+magicPower()}),d:()=>'Chama um meteoro no local do mouse: '+(120+p.lvl*12+magicPower())+' de dano em área.'},
 {n:'Raio de gelo',mana:20,cd:3,ic:SKI('snow','#3a7ab8','#e0f6ff'),f:pr(()=>40+p.lvl*8,'#9ef'),d:()=>'Lança gelo teleguiado no alvo: '+(40+p.lvl*8+pw())+' de dano.'},
 {n:'Escudo arcano',mana:30,cd:18,ic:SKI('shield','#6a4ab8','#e0d0ff'),f:guard,d:()=>'Por 6 s você recebe metade do dano.'}],
hea:[{n:'Raio sagrado',mana:12,cd:2,ic:SKI('orb','#c9a020','#fff6b0'),f:pr(()=>18+p.lvl*4,'#ffe66b',()=>8),d:()=>'Dispara luz no alvo: '+(18+p.lvl*4+pw())+' de dano e cura 8 de vida.'},
 {n:'Cura',mana:25,cd:5,ic:SKI('cross','#2f9a58','#bff5cf'),f:()=>heal(60+p.lvl*10),d:()=>'Recupera '+(60+p.lvl*10)+' de vida.'},
 {n:'Aura sagrada',mana:30,cd:8,ic:SKI('burst','#2f9a58','#dfffe0'),f:nova(50,()=>20+p.lvl*4,'#7f7',()=>30),d:()=>'Fere inimigos próximos ('+(20+p.lvl*4+pw())+') e cura 30 de vida.'},
 {n:'Renascer',mana:60,cd:30,ic:SKI('flame','#d9a020','#fff'),f:()=>{heal(150+p.lvl*20);p.mp=Math.min(mmp(),p.mp+30)},d:()=>'Recupera '+(150+p.lvl*20)+' de vida e 30 de mana.'},
 {n:'Lança de luz',mana:18,cd:3,ic:SKI('blade','#c9a020','#fff'),f:pr(()=>35+p.lvl*6,'#fff6a0'),d:()=>'Lança de luz teleguiada no alvo: '+(35+p.lvl*6+pw())+' de dano.'},
 {n:'Escudo divino',mana:30,cd:18,ic:SKI('shield','#b8962a','#fff6c0'),f:guard,d:()=>'Por 6 s você recebe metade do dano.'}]};
const WSK={
none:[{n:'Soco',mana:0,cd:1.5,ic:SKI('fist','#c08a62','#ffe0c0'),f:nova(22,()=>12,'#fc9'),d:()=>'Golpe rápido de punho: '+(12+pw())+' de dano em área curta.'},
 {n:'Chute',mana:5,cd:4,ic:SKI('dash','#c08a62','#ffe0c0'),f:nova(30,()=>28,'#fc9'),d:()=>'Chute giratório: '+(28+pw())+' de dano em área.'}],
sw:[{n:'Corte',mana:10,cd:3,ic:SKI('blade','#8a94a8','#e6eef8'),f:nova(32,()=>40,'#cfe'),d:()=>'Corte largo com a espada: '+(40+pw())+' de dano em área.'},
 {n:'Estocada',mana:15,cd:6,ic:SKI('dash','#8a94a8','#e6eef8'),f:blink(()=>35),d:()=>'Avança com a arma equipada e causa '+(35+weaponPower())+' de dano.'}],
sw2:[{n:'Golpe pesado',mana:15,cd:5,ic:SKI('axe','#9a6a30','#d0d8e4'),f:nova(34,()=>70,'#fa6'),d:()=>'Machadada devastadora: '+(70+pw())+' de dano em área.'},
 {n:'Rachadura',mana:25,cd:9,ic:SKI('burst','#9a6a30','#ffd0a0'),f:nova(52,()=>45,'#fa6'),d:()=>'Abre o chão ao redor: '+(45+pw())+' de dano em área ampla.'}],
sw3:[{n:'Orbe arcano',mana:12,cd:2.5,ic:SKI('orb','#2aa0a0','#bffff8'),f:pr(()=>40,'#5ff'),d:()=>'Dispara um orbe no alvo: '+(40+pw())+' de dano.'},
 {n:'Explosão arcana',mana:30,cd:8,ic:SKI('burst','#2aa0a0','#bffff8'),f:nova(50,()=>55,'#5ff'),d:()=>'Explosão mágica: '+(55+pw())+' de dano em área.'}]};
const BASIC={
 unarmed:{n:'Soco',rng:18,dm:1,damageType:'physical',ic:SKI('fist','#c08a62','#ffe0c0'),t:'Ataque desarmado corpo a corpo.'},
 sw:{n:'Golpe de espada',rng:22,dm:1.1,damageType:'physical',ic:SKI('blade','#8a94a8','#e6eef8'),t:'Corte rápido e preciso.'},
 sw2:{n:'Machadada',rng:22,dm:1.7,damageType:'physical',ic:SKI('axe','#9a6a30','#d0d8e4'),t:'Ataque lento e pesado.'},
 sw3:{n:'Orbe do cajado',rng:80,dm:1,damageType:'magic',proj:'#5ff',ic:SKI('orb','#2aa0a0','#bffff8'),t:'Dispara um orbe arcano.'}};
const BASIC_MODES=['sw','sh','alternate','distance'],BASIC_MODE_LABEL={sw:'Arma 1',sh:'Arma 2',alternate:'Revezar',distance:'Melee/Ranged'};
function basicForDistance(distance=Infinity){
 const weapon=slot=>{const equipped=EQ[slot];if(!equipped||gearType[equipped.id]!='sw'||slot=='sh'&&ITEMS[equipped.id].th)return null;const attack=BASIC[equipped.id]||BASIC.unarmed;return{...attack,weaponSlot:slot}};
 const first=weapon('sw'),second=weapon('sh'),available=[first,second].filter(Boolean),fallback=first||second;
 if(p.basicMode=='sh')return second||fallback||BASIC.unarmed;
 if(p.basicMode=='alternate')return available.find(b=>b.weaponSlot==(p.basicNext||'sw'))||fallback||BASIC.unarmed;
 if(p.basicMode=='distance'){
  const melee=available.find(b=>!b.proj),ranged=available.find(b=>!!b.proj);
  if(melee&&ranged)return distance>melee.rng+8?ranged:melee;
  return melee||ranged||BASIC.unarmed
 }
 return first||fallback||BASIC.unarmed
}
const basic=()=>p.attackBasic||basicForDistance(p.tgt?dist(p,p.tgt):Infinity);
function cycleBasicMode(){const i=BASIC_MODES.indexOf(p.basicMode);p.basicMode=BASIC_MODES[(i+1)%BASIC_MODES.length];p.basicNext='sw';if(window.refreshBasicMode)refreshBasicMode();if(window.saveGame)saveGame()}
const basicTip=()=>{const b=basic();return '<b>Ataque básico: '+b.n+'</b><div>'+b.t+'</div><div>Dano: '+damageText(basicAttackDamage(b))+'</div><div class=tm>Modo: '+BASIC_MODE_LABEL[p.basicMode]+' • '+(b.weaponSlot=='sw'?'Arma 1':b.weaponSlot=='sh'?'Arma 2':'Desarmado')+' • Alcance: '+b.rng+' • Tipo: '+(b.damageType=='magic'?'mágico':'físico')+' • Intervalo: '+attackInterval().toFixed(2)+'s • Automático ao atacar</div>'};
const SK=['q','w','e','r','t','y','z','x'].map(k=>({k,t:0,n:''}));
const BLANK='data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
function classRank(id){return p.classProgress&&p.classProgress[id]?p.classProgress[id].rank:0}
function skillEntries(id){return(SKS[id]||[]).map((s,i)=>s.skill?{...s.skill,rank:s.rank||1,owner:id}:{...s,id:s.id||'builtin_'+id+'_'+i,rank:s.rank||i+1,owner:id})}
function availableCrossSkills(){return Object.keys(SKS).flatMap(id=>skillEntries(id)).filter(s=>s.cross&&s.rank<=classRank(s.owner))}
function inCombat(){
 if(p.dead>0||p.tgt&&p.tgt.hp>0||p.aw>0)return true;
 return en.some(e=>e.hp>0&&(e.chasing||e.aw>0)&&dist(e,p)<=(e.aggro||0)+8)
}
function classSlotOptions(index){
const own=skillEntries(p.cls)[index],opts=[];
if(own&&own.rank<=classRank(p.cls))opts.push(own);
availableCrossSkills().forEach(s=>{if(s.owner!=p.cls&&!opts.some(x=>x.id==s.id))opts.push(s)});
return opts}
function selectSkillSlot(index,id){
if(inCombat()){ft(p.x,p.y-24,'Troca de habilidade só fora de combate','#e8bd3e');return}
if(SK[index]&&SK[index].t>0){ft(p.x,p.y-24,'Aguarde a habilidade terminar a recarga','#e8bd3e');return}
const skill=classSlotOptions(index).find(s=>s.id==id);if(!skill)return;
p.skillSlots=p.skillSlots||{};const row=p.skillSlots[p.cls]||(p.skillSlots[p.cls]=[]);
const own0=skillEntries(p.cls),prev=row[index]||(own0[index]||{}).id;for(let i=0;i<6;i++){if(i===index)continue;const cur=row[i]||(own0[i]||{}).id;if(cur===skill.id){const back=classSlotOptions(i).find(s=>s.id===prev&&s.id!==skill.id);row[i]=back?prev:(own0[i]||{}).id}}row[index]=skill.id;applySkills();if(window.renderSkillMenu)renderSkillMenu();if(window.saveGame)saveGame()}
function applySkills(){
const weaponSkills=[['sw',EQ.sw],['sh',EQ.sh]].filter(([,item])=>item&&gearType[item.id]=='sw').map(([slot,item])=>({skill:(WSK[item.id]||[])[0],slot})).filter(x=>x.skill);
const weaponSlots=weaponSkills.length?weaponSkills.map(x=>({...x.skill,w:1,weaponSlot:x.slot})):((WSK.none||[]).slice(0,2).map(skill=>({...skill,w:1})));
const own=skillEntries(p.cls),slots=p.skillSlots&&p.skillSlots[p.cls]||[];
const used=new Set(),L=[0,1,2,3,4,5].map(i=>{
 const current=own[i],selected=slots[i],options=classSlotOptions(i);
 const pick=(selected&&options.find(s=>s.id==selected))||current||null;if(pick&&used.has(pick.id))return current&&!used.has(current.id)?(used.add(current.id),current):null;if(pick)used.add(pick.id);return pick
}).concat([0,1].map(i=>weaponSlots[i]||null));
L.forEach((d,i)=>{const o=SK[i];if(!d)Object.assign(o,{n:'',mana:0,cd:1,t:0,f:null,w:i>5?1:0,rank:0,lock:0,wt:null,weaponSlot:null,ic:BLANK,d:()=>''});else{const same=o.id===d.id;Object.assign(o,{rank:0,wt:null,weaponSlot:null},d,{t:same?o.t:0})}
 const weapon=EQ[o.weaponSlot||'sw'];o.lock=o.rank>classRank(o.owner)?o.rank:0;o.bad=!skillWeaponAllowed(o,weapon&&ITEMS[weapon.id]);
 if(o.el){o.el.style.backgroundImage='url('+o.ic+')';o.el.classList.toggle('wk',!!o.w);o.el.style.visibility=o.n?'':'hidden';o.el.querySelector('em').textContent=o.mana}});
if(window.renderSkillMenu)renderSkillMenu()}
applySkills();const carpenter={cls:'war',nm:'Carpinteiro',x:CX+290,y:CY-180,carpenter:true},blacksmith={cls:'war',nm:'Ferreiro',x:-9999,y:-9999,blacksmith:true},NPCS=[{cls:'war',nm:'Guerreiro',x:CX-58,y:CY+30},{cls:'mag',nm:'Mago',x:CX,y:CY+74},{cls:'hea',nm:'Curandeiro',x:CX+58,y:CY+30},{cls:'sty',nm:'Estilista',x:CX-34,y:CY-4},carpenter,blacksmith];
function placeCarpenter(){carpenter.x=carpenterHelped?CX+34:CX+290;carpenter.y=carpenterHelped?CY-48:CY-180}
function placeBlacksmith(){const saved=(typeof blacksmithSaved!=='undefined'&&blacksmithSaved)||window.blacksmithSaved;blacksmith.x=saved?CX+64:-9999;blacksmith.y=saved?CY-36:-9999}
placeCarpenter();placeBlacksmith();
window.placeBlacksmith=placeBlacksmith;
function showBlacksmithDialogue(){
 const box=$('dialogue');
 box.classList.remove('dgModal');
 box.innerHTML='<b>Ferreiro</b><p>Saudações, herói! Graças ao seu resgate na DG dos Goblins, estou são e salvo aqui no acampamento com meu irmão carpinteiro. Minha forja e bigorna já estão prontas! Em breve poderei forjar e aprimorar equipamentos lendários para suas aventuras.</p><button type="button" data-close-dialog>Excelente!</button>';
 box.classList.add('open')
}
window.showBlacksmithDialogue=showBlacksmithDialogue;
function showCarpenterDialogue(){
 const box=$('dialogue');
 box.classList.remove('dgModal');
 box.innerHTML=!carpenterHelped
  ?'<b>Carpinteiro</b><p>Obrigado por me salvar do Guardião Esqueleto! Vou até seu acampamento e ficarei com os outros moradores.</p><button type="button" data-join-camp>Venha para o acampamento</button>'
  :campPortalBuilt&&blacksmithSaved
  ?'<b>Carpinteiro</b><p>Você salvou meu irmão ferreiro! Ele já está trabalhando na forja do acampamento. Nunca poderei agradecer o suficiente, herói! O portal continua ativo caso você queira explorar o covil dos goblins novamente para saquear baús raros e lendários!</p><button type="button" data-open-dungeon-menu>Abrir Masmorras no Portal</button> <button type="button" data-close-dialog>Fechar</button>'
  :campPortalBuilt
  ?'<b>Carpinteiro</b><p>O portal para a DG dos Goblins está ativo! Meu irmão ferreiro está preso lá dentro nas mãos do terrível Lorde Goblin Demoníaco. Cuidado com as áreas de ataque telegrafadas no chão do lorde: elas causam dano quase letal! Traga meu irmão de volta são e salvo!</p><button type="button" data-open-dungeon-menu>Abrir Masmorras no Portal</button> <button type="button" data-close-dialog>Fechar</button>'
  :wallBuilt&&!magicWoodQuestActive
  ?'<b>Carpinteiro</b><p>A paliçada está pronta, mas precisamos construir um portal logo! Os goblins jogaram meu irmão ferreiro em um portal, e precisamos salvá-lo. Ele poderá nos ajudar com equipamentos. Preciso de 10 madeiras mágicas: elas são deixadas pelas árvores vivas, os Brotos Vivos da ilha.</p><button type="button" data-start-magic-wood-quest>Vou buscar as madeiras mágicas</button>'
  :wallBuilt
  ?'<b>Carpinteiro</b><p>Madeira mágica coletada: '+itemCount('magicWood')+'/'+PORTAL_WOOD_REQUIRED+'. '+(itemCount('magicWood')>=PORTAL_WOOD_REQUIRED?'Já podemos construir o portal para procurar meu irmão ferreiro!':'Derrote as árvores vivas (Brotos Vivos) e aceite as madeiras mágicas nos itens encontrados. Seu peso de spawn aumenta em 20% enquanto faltarem materiais.')+'</p>'+(itemCount('magicWood')>=PORTAL_WOOD_REQUIRED?'<button type="button" data-build-camp-portal>Entregar 10 madeiras mágicas e construir o portal</button>':'<button type="button" data-close-dialog>Vou buscar mais madeira mágica</button>')
  :!sawQuestActive
  ?'<b>Carpinteiro</b><p>Quero construir um muro para proteger o acampamento, mas preciso de um serrote. Um Goblin do Serrote aparece naturalmente junto aos outros monstros pela ilha. Quando ele surgir, um ponto de exclamação vai indicar onde está.</p><button type="button" data-start-saw-quest>Vou buscar o serrote</button>'
  :sawObtained&&!woodQuestActive
  ?'<b>Carpinteiro</b><p>Você encontrou o serrote! Agora preciso de 20 madeiras. Derrote os Brotos Vivos, pequenas árvores que aparecem naturalmente pela ilha, e recolha a madeira que eles deixam. Enquanto a missão precisar deles, seu peso de spawn aumenta em 20%.</p><button type="button" data-start-wood-quest>Vou coletar as madeiras</button>'
  :woodQuestActive
  ?'<b>Carpinteiro</b><p>Madeira coletada: '+itemCount('wood')+'/'+WALL_WOOD_REQUIRED+'. '+(itemCount('wood')>=WALL_WOOD_REQUIRED?'Já temos o material para construir a paliçada de toras e o portão ao sul.':'Derrote Brotos Vivos e aceite as madeiras nos itens encontrados.')+'</p>'+(itemCount('wood')>=WALL_WOOD_REQUIRED?'<button type="button" data-build-wall>Entregar 20 madeiras e construir</button>':'<button type="button" data-close-dialog>Vou buscar mais madeira</button>')
  :'<b>Carpinteiro</b><p>Procure o Goblin do Serrote entre os monstros que aparecem naturalmente pela ilha. Quando ele surgir, você verá um ponto de exclamação indicando a posição.</p><button type="button" data-close-dialog>Fechar</button>';
 box.classList.add('open')
}
document.addEventListener('click',e=>{
 const button=e.target.closest('#dialogue button');if(!button)return;
 if(button.hasAttribute('data-join-camp')){carpenterHelped=true;placeCarpenter();$('dialogue').classList.remove('open');$('dialogue').classList.remove('dgModal');ft(p.x,p.y-28,'O carpinteiro foi para o acampamento!','#ffd84a');saveGame()}
 else if(button.hasAttribute('data-start-saw-quest')){if(window.startSawQuest)startSawQuest();$('dialogue').classList.remove('open');$('dialogue').classList.remove('dgModal')}
 else if(button.hasAttribute('data-start-wood-quest')){
  if(!sawObtained||wallBuilt)return;
  woodQuestActive=true;$('dialogue').classList.remove('open');$('dialogue').classList.remove('dgModal');ft(p.x,p.y-28,'Colete 20 madeiras dos Brotos Vivos!','#ffd84a');saveGame()
 }
 else if(button.hasAttribute('data-build-wall')){
  if(wallBuilt||!sawObtained||!woodQuestActive)return;
  if(!consumeItems('wood',WALL_WOOD_REQUIRED)){ft(p.x,p.y-28,'Precisa de 20 madeiras!','#f66');showCarpenterDialogue();return}
  wallBuilt=true;CAMP_WALL.gateOpen=true;syncCampWall();showCarpenterDialogue();ft(p.x,p.y-28,'PALIÇADA CONSTRUÍDA!','#ffd84a');ring(campGate.x,campGate.y,42,'#d5a85b',.7);saveGame()
 }
 else if(button.hasAttribute('data-start-magic-wood-quest')){
  if(!wallBuilt||campPortalBuilt)return;
  magicWoodQuestActive=true;$('dialogue').classList.remove('open');$('dialogue').classList.remove('dgModal');ft(p.x,p.y-28,'Colete 10 madeiras mágicas dos Brotos Vivos!','#bb88ff');saveGame()
 }
 else if(button.hasAttribute('data-build-camp-portal')){
  if(!wallBuilt||!magicWoodQuestActive||campPortalBuilt)return;
  if(!consumeItems('magicWood',PORTAL_WOOD_REQUIRED)){ft(p.x,p.y-28,'Precisa de 10 madeiras mágicas!','#f66');showCarpenterDialogue();return}
  campPortalBuilt=true;showCarpenterDialogue();ft(campPortal.x,campPortal.y-40,'PORTAL CONSTRUÍDO!','#bb88ff');ring(campPortal.x,campPortal.y,32,'#bb88ff',.7);saveGame()
 }
 else if(button.hasAttribute('data-open-dungeon-menu')){
  $('dialogue').classList.remove('open');
  showDungeonMenu();
 }
 else if(button.hasAttribute('data-rescue-blacksmith')){
  if(window.rescueBlacksmithFromDungeon)rescueBlacksmithFromDungeon();
  $('dialogue').classList.remove('open');
 }
 else if(button.hasAttribute('data-confirm-exit-dg')){
  $('dialogue').classList.remove('open');
  if(window.exitDungeon)exitDungeon(true);
 }
 else if(button.hasAttribute('data-close-dialog')){$('dialogue').classList.remove('open');$('dialogue').classList.remove('dgModal')}
});

/* Menu do portal: as DGs do projeto (js/dungeon-library.js). */
function showDungeonMenu(){
 if(!campPortalBuilt||p.dead>0)return;
 clearMovementInput();
 window.showProjectDungeonMenu();
}
const sexBox=document.createElement('div');
sexBox.style.cssText='position:fixed;left:50%;top:40%;transform:translate(-50%,-50%);background:#1b1530ee;border:2px solid #ffd84a;border-radius:8px;padding:14px 18px;color:#ffe28a;font:14px monospace;text-align:center;display:none;z-index:20';
sexBox.innerHTML='Estilista: escolha seu personagem<br><br><button data-s="m">Masculino</button> <button data-s="f">Feminino</button> <button data-s="">Cancelar</button>';
document.body.appendChild(sexBox);
sexBox.onclick=e=>{const s=e.target.dataset&&e.target.dataset.s;if(s===undefined)return;sexBox.style.display='none';
 if(s&&s!=p.sex){p.sex=s;setPortrait();dirtyInv=true;ring(p.x,p.y,36,'#ffd84a',.6);ft(p.x,p.y-24,s=='m'?'Masculino':'Feminino','#ffd84a')}};
function setClass(c){if(c==p.cls){ft(p.x,p.y-24,'Você já é '+CL[c].n,'#fff');return}
 const n=CL[c];p.classProgress=p.classProgress||{};if(!p.classProgress[c])p.classProgress[c]={rank:1,xp:0};
 p.cls=c;p.hp=Math.min(p.hp,mhp());p.mp=Math.min(p.mp,mmp());
 applySkills();setPortrait();ring(p.x,p.y,36,'#ffd84a',.6);ft(p.x,p.y-24,'Classe: '+n.n+' · Rank 1','#ffd84a');if(window.saveGame)saveGame()}

const wpos=()=>({x:(mx-cv.width/2)/S+p.x,y:(my-cv.height/2)/S+p.y});
function cast(s){if(p.dead>0||s.t>0||!s.f||p.mp<s.mana)return;if(s.lock){ft(p.x,p.y-24,'Libera no rank '+s.lock,'#ccc');return}const equipped=EQ[s.weaponSlot||'sw'];if(!skillWeaponAllowed(s,equipped&&ITEMS[equipped.id])){ft(p.x,p.y-24,'Precisa de uma tag: '+s.wt.join(' / '),'#ccc');return}const w=wpos();let t=null;if(s.f.tg){t=pick(w);if(!t&&p.tgt&&p.tgt.hp>0)t=p.tgt;if(!t){let b=60;en.forEach(e=>{const k=dist(e,w);if(e.hp>0&&k<b){b=k;t=e}})}if(!t){ft(p.x,p.y-24,'Sem alvo','#ccc');return}if(dist(p,t)>200){ft(p.x,p.y-24,'Longe demais','#ccc');return}p.fx=t.x-p.x;p.fy=t.y-p.y}else{p.fx=w.x-p.x;p.fy=w.y-p.y}
 const style=s.vfx||'arcane';if(style!='none')fxs.push({x:s.f.tg&&t?t.x:s.effect=='meteor'?w.x:p.x,y:s.f.tg&&t?t.y:s.effect=='meteor'?w.y:p.y,r:Math.max(16,Math.min(52,+s.radius||26)),c:s.vfxColor||'#9bd4ff',t:0,d:.55,style});
 p.mp-=s.mana;applyActionAttributes(p,s);s.t=s.cd*cooldownMultiplier(p);withWeaponDamageRoll(()=>s.f(w,t));if(!(window.playEntitySound&&playEntitySound('skills',s.id,'cast'))&&window.playGameSound)playGameSound('magic')}
