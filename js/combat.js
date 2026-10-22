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
const monsterMaxMp=entity=>Math.max(0,(entity.maxMp??monMana(entity.stats.I))+statusAttributeBonus(entity,'mp')+statusAttributeBonus(entity,'I')*CALC.monMpPerI);
const areaMultiplier=entity=>Math.sqrt(Math.max(.01,1+(entity===p?bonus('area'):monsterAttribute(entity,'area'))));
const cooldownMultiplier=entity=>1-Math.max(0,Math.min(.9,entity===p?bonus('cooldownReduction'):monsterAttribute(entity,'cooldownReduction')));
// tempo de conjuração da habilidade: Velocidade de conjuração +100% = metade do tempo
const tempoConj=s=>{if(s.conjAtaque>0)return attackInterval()*s.conjAtaque/100; /* conjuração = % do intervalo do ataque básico (ex.: Corte Horizontal, 50%) */const base=+s.castTime||0;return base>0?base/Math.max(.1,1+bonus('castSpeed')):0};
/* Agilidade: cada ponto dá critPerA % de chance crítica e de dano crítico (0,1 = 10 pontos +1%); monstros: monCritPerA */
const critAgi=u=>{try{const A=u===p?attributes().A:(typeof monsterAttributes=='function'?monsterAttributes(u).A:(u.stats&&u.stats.A)||0);return(+A||0)*(u===p?+(CALC.critPerA??.1):+(CALC.monCritPerA??.1))/100}catch(e){return 0}};
function combatRoll(entity,damage){
 const value=k=>(entity===p?bonus(k):monsterAttribute(entity,k))+critAgi(entity),crit=Math.random()<Math.max(0,Math.min(1,value('critChance')));
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
const campB=()=>insideCamp(p.x,p.y)?CALC.camp:0,regenHp=()=>attributes().F*CALC.regenPerF+campB()+bonus('regenHp'),regenMp=()=>(attributes().I*CALC.regenPerI+campB()+bonus('regenMp'))*(1+(CL[p.cls].pRegenMp||0));
const dmgP=()=>Math.round((danoArma()+weaponPower())*(p.bf>0?1.5:1)*(1+(CL[p.cls].pDmg||0))*multDano((p.attackBasic||basic()).damageType));
function gainPlayerXp(value){
 p.xp+=Math.max(0,value);
 while(p.lvl<CALC.maxLevel&&p.xp>=p.lvl*CALC.xpPerLevel){p.xp-=p.lvl*CALC.xpPerLevel;p.lvl++;applySkills();p.hp=mhp();p.mp=mmp();ring(p.x,p.y,50,'#ffd84a',.8);if(window.playGameSound)playGameSound('levelUp');ft(p.x,p.y-24,'NÍVEL '+p.lvl+'!','#ffd84a')}
 if(p.lvl>=CALC.maxLevel)p.xp=0
}
const FX_INFO={poison:{n:'Veneno',c:'#7d3',kind:'dot',tick:1,dtype:'true'},burn:{n:'Queimadura',c:'#f83',kind:'dot',tick:1,dtype:'true'},bleed:{n:'Sangramento',c:'#d33',kind:'dot',tick:1,dtype:'true'},slow:{n:'Lentidão',c:'#6bf',kind:'slow'},stun:{n:'Atordoado',c:'#fd4',kind:'stun'}};
const fxKind=k=>FX_INFO[k]&&FX_INFO[k].kind;
function vulnMult(t){let m=0;if(t.st)for(const k in t.st)if(fxKind(k)=='vuln')m=Math.max(m,t.st[k].pw*(t.st[k].n||1));return 1+m/100}
const charDamage=t=>typedPower(t)+danoArma();
const monsterWeaponDamageDelta=e=>(e.weaponRanges||[]).reduce((sum,range)=>sum+rollWeaponDamage(range)-(range.min+range.max)/2,0);
function monsterCtx(e,weaponDelta=0){const s=monsterAttributes(e),equipmentDamage=monsterAttribute(e,'dmg')+weaponDelta,ph=(monsterAttribute(e,'physicalDmg')+equipmentDamage)*(1+s.F*monPhysPerF()/100),mg=(monsterAttribute(e,'magicDmg')+equipmentDamage)*(1+s.I*monMagPerI()/100);return{phys:ph,mag:mg,entity:e,attr:k=>k=='none'||!k?0:k=='physicalPower'?monsterAttribute(e,'physicalDmg'):k=='magicPower'?monsterAttribute(e,'magicDmg'):k=='dmg'?equipmentDamage:k=='weaponPower'||k=='charDamage'?(e.attackMagic?mg:ph):s[k]||0}}
function resolveFx(list,cd,ctx){ctx=ctx||{phys:charDamage('physical'),mag:charDamage('magic'),entity:p,attr:k=>k=='none'||!k?0:scaleBase(k,'physical')};return(Array.isArray(list)?list:[]).filter(f=>f&&FX_INFO[f.type]).map(f=>{const dot=fxKind(f.type)=='dot',src=f.src=='physical'?ctx.phys:f.src=='magic'?ctx.mag:cd;return{caster:ctx.entity||p,self:f.target=='self',type:f.type,chance:f.chance==null||f.chance===''?100:+f.chance,dur:Math.max(.5,+f.dur||FX_INFO[f.type].dur||3),pw:(+f.power||FX_INFO[f.type].power||0)+(dot?(+f.pct||0)/100*src+(+f.attrPct||0)/100*ctx.attr(f.attr):0)}})}
/* efeitos negativos que acumulam (dano contínuo, lentidão, gelo…): cada acerto soma 1 acúmulo (até o máximo) e o
   efeito perde 1 acúmulo a cada 2 s; a força vale por acúmulo (fogo: 3 por acúmulo). Os outros duram o tempo do efeito. */
const ACUMULO_S=2;
const decai=k=>{const f=FX_INFO[k];return!!f&&!f.good&&(f.kind==='dot'||f.kind==='slow')};
function applyFx(t,fx){if(!fx||!fx.length)return;let k=0;for(const f of fx){if(Math.random()*100>=f.chance)continue;const tg=f.self?f.caster||p:t;tg.st=tg.st||{};const o=tg.st[f.type],info=FX_INFO[f.type],max=info.stacks||1;
 /* curas instantâneas (Curandeiro): % da vida máxima do alvo (curapct) ou valor fixo (curaabs); limpa acúmulos de veneno e sangramento */
 if(info.kind==='curapct'||info.kind==='curaabs'){const mx=tg===p?mhp():monsterMaxHp(tg),v=Math.max(1,Math.round(info.kind==='curapct'?mx*(+f.pw||0)/100:+f.pw||0));tg.hp=Math.min(mx,tg.hp+v);ft(tg.x,tg.y-30-k++*7,'+'+v,'#6fe36f');
  const lp=+f.limpa||0;if(lp>0)for(const d of ['poison','bleed']){const s=tg.st[d];if(!s)continue;s.n=(s.n||1)-lp;if(s.n<=0)delete tg.st[d];else s.t=s.n*ACUMULO_S-(s.q||0)}continue}
 if(decai(f.type)){const n=Math.min(max,(o?o.n||1:0)+1);tg.st[f.type]={n,q:o?o.q:0,t:n*ACUMULO_S-(o?o.q:0),d:max*ACUMULO_S,pw:Math.max(f.pw||0,o?o.pw:0),tk:o?o.tk:0};
  // gelo no máximo de acúmulos: congela (atordoado) e zera o gelo
  if(info.congela&&n>=max){delete tg.st[f.type];tg.st.stun={t:info.congela,d:info.congela,pw:0,n:1,tk:0};ft(tg.x,tg.y-36-k++*7,'Congelado!',info.c);continue}}
 else tg.st[f.type]={t:f.dur,d:f.dur,pw:Math.max(f.pw||0,o?o.pw:0),tk:o?o.tk:0,n:info.good?1:Math.min(max,(o?o.n||1:0)+1)}; // buff não acumula: só renova
 if(!f.silencioso)ft(tg.x,tg.y-36-k++*7,info.n+(tg.st[f.type]&&tg.st[f.type].n>1?' x'+tg.st[f.type].n:''),info.c)}} // silencioso: aura renovada a cada segundo não repete o nome
function tickStatus(t,dt){
 if(!t.st)return;
 for(const k of Object.keys(t.st)){
  const s=t.st[k],effect=FX_INFO[k];if(!effect){delete t.st[k];continue}
  const acum=decai(k),elapsed=acum?dt:Math.min(dt,Math.max(0,s.t));
  if(acum){s.q=(s.q||0)+dt;while(s.q>=ACUMULO_S&&s.n>0){s.q-=ACUMULO_S;s.n--}s.t=s.n>0?s.n*ACUMULO_S-s.q:0}else s.t-=dt;
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
/* velocidade de ataque com gelo (efeito com atk): −pw% por acúmulo, no máximo 50% */
const statusAtk=t=>{const s=t&&t.st;if(!s)return 1;let r=0;for(const k in s)if(FX_INFO[k]&&FX_INFO[k].atk)r+=s[k].pw*(s[k].n||1);return Math.max(.5,1-r/100)};
const statusSpeed=t=>{if(t===p&&(p.dash||p.canal&&p.canal.parado))return 0; /* investida ou canal parado: o herói não anda */if(t===p&&p.dash)return 0; /* correndo na investida: o movimento é da habilidade */const s=t.st;if(!s)return 1;let v=1;for(const k in s){const q=fxKind(k);if(q=='stun')return 0;if(q=='slow')v=Math.min(v,Math.max(.5,1-s[k].pw*(s[k].n||1)/100))} /* lentidão no máximo 50% */v*=1+stSum(t,'haste')/100;return v};
/* separa o dano em físico e mágico (número = do tipo do golpe) */
/* cor do número de dano: físico laranja, mágico azul, crítico amarelo, efeito na cor dele; recebido em vermelho/roxo */
const COR_DANO={fisico:'#ff9a3c',magico:'#5fb4ff',critico:'#ffd84a',recebeFisico:'#ff4b4b',recebeMagico:'#c77dff'};
const corDano=(dot,crit,share,recebe)=>dot&&FX_INFO[dot]?FX_INFO[dot].c:crit?COR_DANO.critico:recebe?(share>.5?COR_DANO.recebeMagico:COR_DANO.recebeFisico):share>.5?COR_DANO.magico:COR_DANO.fisico;
/* número de dano: com físico e mágico juntos o texto fica em degradê (laranja → azul; recebido: vermelho → roxo) */
const ftDano=(x,y,txt,dot,crit,share,recebe)=>{txt=String(txt).replace(/!$/,'');ft(x,y,txt,corDano(dot,crit,share,recebe));if(crit&&typeof fts!=='undefined'&&fts.length)fts[fts.length-1].crit=true; /* crítico: ícone à esquerda do número (iconeCrit) */if(!dot&&!crit&&share>.02&&share<.98&&typeof fts!=='undefined'){const f=fts[fts.length-1];if(!f||f.t!==txt)return;f.c=recebe?COR_DANO.recebeFisico:COR_DANO.fisico;f.c2=recebe?COR_DANO.recebeMagico:COR_DANO.magico}};
/* cor de um texto flutuante: degradê da esquerda para a direita quando tem c2 */
/* ícone de crítico (estrela/explosão amarela 7×7) desenhado à esquerda do número */
const CRIT_ICON=['...y...','.y.Y.y.','..YWY..','yYWWWYy','..YWY..','.y.Y.y.','...y...'],CRIT_COR={y:'#e8941a',Y:'#ffd84a',W:'#fff6d0'};
const iconeCrit=f=>{const w=ctx.measureText(f.t).width,x0=Math.round(f.x-w/2)-9,y0=Math.round(f.y)-6;CRIT_ICON.forEach((r,j)=>{for(let i=0;i<7;i++){const c=CRIT_COR[r[i]];if(c){ctx.fillStyle=c;ctx.fillRect(x0+i,y0+j,1,1)}}})};
const corFt=f=>{if(!f.c2)return f.c;const w=ctx.measureText(f.t).width||1,x=Math.round(f.x),g=ctx.createLinearGradient(x-w/2,0,x+w/2,0);g.addColorStop(0,f.c);g.addColorStop(1,f.c2);return g};
const partesDano=(d,mg)=>d&&typeof d=='object'?{f:+d.physical||0,m:+d.magic||0}:mg?{f:0,m:+d||0}:{f:+d||0,m:0};
function hurtE(e,d,magic=false,fx=null,dot=null){if(e.hp<=0)return;if(e.pvp){if(window.ARENA)ARENA.golpe(e,d,magic,fx,dot);return}e.foraCombate=0;e.resetando=false;e.giveUp=0;e.noAtk=0;e.alert=Math.max(e.alert||0,6); /* apanhando: não desiste, não volta para casa e não reseta */const di=dot&&FX_INFO[dot],tr=di&&(di.dtype||'true')=='true',mg=di&&!tr?di.dtype=='magic':magic;
 const physicalDefense=(e.armor??(e.stats?e.stats.A*CALC.monArmPerA:0))+statusAttributeBonus(e,'arm')+statusAttributeBonus(e,'A')*CALC.monArmPerA;
 const magicalDefense=(e.magicArmor??(e.stats?monMagArm(e.stats.F,e.stats.A,e.stats.I):0))+statusAttributeBonus(e,'magicArm')+monMagArm(...['F','A','I'].map(k=>statusAttributeBonus(e,k)));
 /* dano recebido = (físico − defesa física) + (mágico − defesa mágica), cada parte nunca abaixo de 0; nada além disso.
    Antes da defesa entram só o crítico e os efeitos (Grito, Inspiração, vulnerável…). Dano contínuo dos efeitos é verdadeiro. */
 let roll={damage:1,crit:false,lifeSteal:0,magicLifeSteal:0},share=mg?1:0;const pt=partesDano(d,mg);
 if(dot&&tr)d=pt.f+pt.m;
 else{
  if(!dot){roll=combatRoll(p,1);const k=roll.damage*vulnMult(e)*(1+stSum(p,'dmgup')/100)*Math.max(.2,1-stSum(p,'dmgdown')/100);pt.f*=k*(1+stSum(p,'physup')/100);pt.m*=k*(1+stSum(p,'magup')/100)}
  if(window.TEMPO){const n=TEMPO.forcaMonstro(e);pt.f/=n;pt.m/=n} /* noite na ilha: o monstro aguenta 5% a mais */
  const pen=k=>Math.max(0,Math.min(1,bonus(k))); /* perfuração: ignora essa parte da defesa do alvo */
  const fi=Math.max(0,pt.f-physicalDefense*(1-pen('physicalPen'))),ma=Math.max(0,pt.m-magicalDefense*(1-pen('magicPen')));d=fi+ma;share=ma/((fi+ma)||1)}
 d=Math.round(d);if(!dot)drainLife(p,Math.min(e.hp,d),stealRatio(roll,share));
 // monstro de outro jogador (multijogador): o dano vai para o dono da sala, que decide a morte
 if(!e.mpProxy&&!dot&&window.MP&&MP.participou)MP.participou(e);
 if(!dot&&window.somDoJogador)somDoJogador('h.'+e.ty+'.'+(magic?1:0)); // os outros jogadores da sala ouvem o golpe
 if(window.marcarCombate)marcarCombate();
 if(e.mpProxy){e.hp=Math.max(1,e.hp-d);if(!dot){e.hit=.15;if(!(window.playEntitySound&&playEntitySound('monsters',e.ty,'hurt'))&&window.playGameSound)playGameSound(magic?'magicHit':'sword')}ftDano(e.x,e.y-22,Math.round(d)+(roll.crit?'!':''),dot,roll.crit,share);if(fx)applyFx(e,fx.filter(f=>f.self));if(window.MP)MP.golpe(e,d,fx&&fx.filter(f=>!f.self));return}
 e.hp-=d;if(!dot){e.hit=.15;if(!(window.playEntitySound&&playEntitySound('monsters',e.ty,'hurt'))&&window.playGameSound)playGameSound(magic?'magicHit':'sword')}ftDano(e.x,e.y-22,Math.round(d)+(roll.crit?'!':''),dot,roll.crit,share);if(fx&&e.hp>0)applyFx(e,fx);
 if(e.hp<=0)killMonster(e)}
/* Morte de um monstro: XP, ouro, missões e itens. No multijogador o dono da sala avisa os outros,
   e cada um recebe a própria recompensa chamando esta mesma função com a cópia local do monstro. */
/* equipamentos do plano de balanceamento de um nível (itens com nivel e pacote equip-v1) */


function killMonster(e){
 if(e.duelo&&window.ARENA&&ARENA.venceuDuelo){e.gone=1;ARENA.venceuDuelo(e);return} // Mestre de classe vencido na arena
 {
  if(window.MP)MP.morreu(e);
  e.rt = (window.inDungeon || e.isDungeonMob) ? 0 : 15;
  if(window.inDungeon || e.isDungeonMob) e.gone = 1;
  // na ilha com outros jogadores, XP e ouro são divididos entre quem participou (js/multiplayer.js)
  const parte=window.MP&&MP.parte?MP.parte(e):1;
  if(parte<=0){if(p.tgt==e)p.tgt=null;return}
  if(window.anotarMorte)anotarMorte(e.ty);
  const noite=window.TEMPO?TEMPO.premio(e):1; /* noite na ilha: +5% de XP, ouro e chance de drop */
  const xp=Math.max(1,Math.round(e.xp*parte*noite)),gold=Math.round(e.g*parte*noite);
  gainPlayerXp(xp);p.gold+=gold;gainClassXp(Math.round((+CALC.rankXpPorAbate||25)*parte*(e.boss||e.bossType=='boss'?5:e.bossType=='grandboss'?15:1))); /* rank: XP fixo por abate (~1 h até o rank 10) */ft(e.x,e.y-30,'+'+gold+'g'+(parte<1?' (÷'+Math.round(1/parte)+')':''),'#fd4');if(!(window.playEntitySound&&playEntitySound('monsters',e.ty,'death'))&&window.playGameSound)playGameSound('death');if(gold>0&&window.playGameSound&&!window.soltarMoedas)playGameSound('coin');if(p.tgt==e){p.tgt=null;if(window.autoTargetAfterKill){let nearest=120;for(const other of en){if(other===e||other.hp<=0||!canSee(other.x,other.y))continue;const d=dist(other,p);if(d<nearest){nearest=d;p.tgt=other}}}}
  if(e.boss&&!window.inDungeon){questDone=true;ft(e.x,e.y-45,'GUARDIÃO ESQUELETO DERROTADO!','#ffd84a');if(window.playGameSound)playGameSound('quest');saveGame()}
  // os itens caem no chão onde o monstro morreu e depois voam até o jogador (js/loot.js)
  const largar=(id,quest=false)=>{if(window.anotarDrop)anotarDrop(e.ty,id);return window.soltarItem?soltarItem(id,e.x,e.y,{questReward:quest}):offerDrop(id,quest)};
  if(gold>0&&window.soltarMoedas)soltarMoedas(e.x,e.y,gold);
  if(e.sawGoblin){sawGoblin=null;ft(e.x,e.y-45,'SERROTE ENCONTRADO!','#ffd84a');largar('saw',true)}
  // cada item da lista do monstro tem a sua chance (%) e é sorteado sozinho; sem lista, não cai nada
  // elite (tipo Elite ou monstro que nasceu elite): chance de drop × Fórmulas › Drops › Elite (1,5); chefe: só a lista dele, sem bônus
  const eliteDrop=(e.bossType==='boss'||e.elite)&&e.bossType!=='grandboss'?Math.max(0,+(CALC.eliteDrop??1.5)):1;
  for(const d of MONSTER_TYPES[e.ty].drops||[])if(ITEMS[d.id]&&!(e.sawGoblin&&d.id=='saw')&&Math.random()*100<d.chance*noite*eliteDrop)largar(d.id);
  // equipamento do nível do monstro (plano de balanceamento): chance em Fórmulas › Monstros › Chance de equipamento do nível

 }}
function hurtP(d,magic=false,fx=null,dot=null,attacker=null,perf=null){if(window.marcarCombate)marcarCombate();const di=dot&&FX_INFO[dot],tr=di&&(di.dtype||'true')=='true',mg=di&&!tr?di.dtype=='magic':magic;
 // mesma regra dos monstros (hurtE): (físico − defesa física) + (mágico − defesa mágica), sem piso nem mínimo
 let share=mg?1:0,roll=null;const pt=partesDano(d,mg);
 if(dot&&tr)d=pt.f+pt.m;
 else{
  if(!dot){roll=attacker?combatRoll(attacker,1):null;const k=(roll?roll.damage:1)*vulnMult(p)*Math.max(.2,1-stSum(p,'guard')/100)*(attacker&&window.TEMPO?TEMPO.forcaMonstro(attacker):1); /* noite na ilha: monstros 5% mais fortes */pt.f*=k;pt.m*=k}
  // perfuração do atacante (monstro: atributo dele; jogador na arena: vem junto do golpe em perf {f,m})
  const pen=k=>Math.max(0,Math.min(1,perf?+perf[k==='physicalPen'?'f':'m']||0:attacker&&attacker!==p&&typeof monsterAttribute=='function'?monsterAttribute(attacker,k)||0:0));
  const fi=Math.max(0,pt.f-armor()*(1-pen('physicalPen'))),ma=Math.max(0,pt.m-magicArmor()*(1-pen('magicPen')));d=fi+ma;share=ma/((fi+ma)||1)}
 d=Math.round(d);if(roll&&attacker)drainLife(attacker,Math.min(p.hp,d),stealRatio(roll,share));
 p.hp-=d;if(!dot){p.hit=.15;if(window.playGameSound)playGameSound('hurt')}ftDano(p.x,p.y-24,Math.round(d)+(roll&&roll.crit?'!':''),dot,roll&&roll.crit,share,true);if(fx&&p.hp>0)applyFx(p,fx);if(p.hp<=0){if(window.playGameSound)playGameSound('defeat');p.st=null;p.attributeBuffs=[];p.dead=4;p.morreuEm=typeof time=='number'?time:0;p.canal=null;p.dash=null;if(!window.inArena&&!window.inTutorial)p.gold=Math.floor(p.gold/2); /* cair na arena (duelo, treino) ou no tutorial não custa ouro */p.dest=p.tgt=null;p.aw=0;p.wt=null;p.attackBasic=null;saveGame()}}
const CL={war:{n:'Guerreiro',F:17,A:7,I:2,perLevel:{F:6,A:3,I:1},attackSpeed:1.25},mag:{n:'Mago',F:2,A:2,I:12,perLevel:{F:1,A:2,I:5},attackSpeed:1},hea:{n:'Curandeiro',F:4,A:4,I:10,perLevel:{F:2,A:2,I:4},attackSpeed:1.1}};
p.classProgress=p.classProgress||{war:{rank:1,xp:0}};
function gainClassXp(value){
 p.classProgress=p.classProgress||{};const progress=p.classProgress[p.cls]||(p.classProgress[p.cls]={rank:1,xp:0});
 if(progress.rank>=10)return;progress.xp+=Math.max(0,value);
 while(progress.rank<10&&progress.xp>=progress.rank*CALC.rankXp){progress.xp-=progress.rank*CALC.rankXp;progress.rank++;
  applySkills();p.hp=Math.min(mhp(),p.hp);p.mp=Math.min(mmp(),p.mp);ring(p.x,p.y,42,'#72d9ff',.65);ft(p.x,p.y-28,'RANK '+progress.rank+'!','#72d9ff');if(window.playGameSound)playGameSound('rankUp')}
 if(progress.rank>=10)progress.xp=0;
 if(window.renderSkillMenu)renderSkillMenu();if(window.saveGame)saveGame()}
/* todas as classes e monstros ganham o mesmo por nível: CALC.atrPorNivel (2) de Força, Agilidade e Inteligência */
const atrNivel=()=>{const k=+(CALC.atrPorNivel??2)||0;return{F:k,A:k,I:k}};
const attributes=()=>{const c=CL[p.cls],growth=atrNivel(),x=k=>c.pa?c.pa(k):0;return{F:3+(c.F||0)+(growth.F||0)*(p.lvl-1)+x('F')+bonus('F'),A:3+(c.A||0)+(growth.A||0)*(p.lvl-1)+x('A')+bonus('A'),I:3+(c.I||0)+(growth.I||0)*(p.lvl-1)+x('I')+bonus('I')}};
const mhp=()=>Math.max(1,Math.round((CALC.hp0+attributes().F*CALC.hpPerF)*(1+(CL[p.cls].passiveHp||0)))+bonus('hp'));
const mmp=()=>Math.max(0,Math.round((CALC.mp0+(attributes().I-3)*CALC.mpPerI)*(1+(CL[p.cls].pMp||0)))+bonus('mp'));
// passivas de defesa (ex.: Alma de Guerreiro +5%) valem sobre a defesa toda (atributo + equipamentos)
const armor=()=>Math.round((attributes().A*CALC.armPerA+bonus('arm'))*(1+(CL[p.cls].pArm||0)));
const magicArmor=()=>Math.round((attributes().I*CALC.magArmPerI+bonus('magicArm'))*(1+(CL[p.cls].pMagicArm||0)));
const attackInterval=()=>(1/statusAtk(p))*Math.max(CALC.minInterval,(CL[p.cls].attackSpeed||1)*(1-attributes().A*CALC.atkSpdPerA)*(1-(CL[p.cls].pAttackSpeed||0))*(1-bonus('attackSpeed')));
const spdB=()=>Math.max(-1,bonus('spd')+bonus('moveSpeed')+attributes().A*CALC.spdPerA+(CL[p.cls].pSpd||0)+(CL[p.cls].pMoveSpeed||0));
/* Força e Inteligência aumentam o dano em %: cada ponto dá physPerF % (Força, dano físico) ou magPerI % (Inteligência,
   dano mágico) — com 0,1, 10 pontos = +1%. O poder é só o dano fixo dos atributos Dano físico / Dano mágico. */
const multDano=t=>1+(t=='magic'?attributes().I*CALC.magPerI:attributes().F*CALC.physPerF)/100;
// dano das armas e itens (a maior parte do golpe): não cresce com o nível, depende da arma equipada
const danoArma=()=>bonus('dmg');
// dano de uma mão: o total dos equipamentos sem a arma da outra mão (o golpe é dado por uma arma só)
const danoMao=mao=>{const s=EQ[mao=='sh'?'sw':'sh'];if(!s||gearType[s.id]!=='sw')return danoArma();const v=weaponDamageRolls&&weaponDamageRolls.has(s)?weaponDamageRolls.get(s):qStats(s.id,s.q).dmg||0;return danoArma()-v};
// habilidades usam só o dano da arma da mão principal: a arma da mão 2 (ex.: escudo) fica de fora
const danoPrimaria=()=>danoMao('sw');
const danoHabilidade=t=>typedPower(t)+danoPrimaria();
const magicPower=()=>bonus('magicDmg');
const physicalPower=()=>bonus('physicalDmg');
const weaponPower=()=>{const b=p.attackBasic||basic();return b.damageType=='magic'?magicPower():physicalPower()};
const scaleValue=s=>({weaponPower:weaponPower(),physicalPower:physicalPower(),magicPower:magicPower(),dmg:danoPrimaria(),F:attributes().F,A:attributes().A,I:attributes().I}[s]||0);
const typedPower=t=>t=='magic'?magicPower():t=='physical'?physicalPower():weaponPower();
const scaleBase=(st,t)=>st=='weaponPower'?typedPower(t):st=='charDamage'?typedPower(t)+danoPrimaria():scaleValue(st);
/* dano = fixo + por nível + % do dano do personagem + % de um atributo/poder */
const scaledDamage=s=>{const st=s.scaleStat||'none',ap=s.scalePercent==null?100:+s.scalePercent||0;
 return Math.round(((+s.base||0)+(+s.per||0)*p.lvl+(+s.charPercent||0)/100*danoHabilidade(s.damageType)+(st=='none'?0:scaleBase(st,s.damageType)*ap/100))*multDano(skillMagic(s)?'magic':'physical'))};
const splitSkillDamage=s=>({physical:Math.max(0,((+s.physicalFlat||0)+(+s.actionStats?.physicalDmg||0)+(+s.physicalPercent||0)*danoHabilidade('physical')/100)*multDano('physical')),magic:Math.max(0,((+s.magicFlat||0)+(+s.actionStats?.magicDmg||0)+(+s.magicPercent||0)*danoHabilidade('magic')/100)*multDano('magic'))});
const hasSplitDamage=s=>['physicalFlat','physicalPercent','magicFlat','magicPercent'].some(k=>+s[k]>0)||+s.actionStats?.physicalDmg>0||+s.actionStats?.magicDmg>0,
 skillDamage=s=>{if(s.damageModel=='split')return splitSkillDamage(s);if(!hasSplitDamage(s))return scaledDamage(s);
  const d=splitSkillDamage(s),old=scaledDamage(s),magic=s.damageType=='magic'||s.damageType!='physical'&&basic().damageType=='magic';d[magic?'magic':'physical']+=old;return d};
const damageText=d=>d&&typeof d=='object'?[d.physical>=.5?Math.round(d.physical)+' físico':'',d.magic>=.5?Math.round(d.magic)+' mágico':''].filter(Boolean).join(' + ')||'0':Math.round(d);
const skillMagic=s=>s.damageType=='magic'||(s.damageType!='physical'&&basic().damageType=='magic');
/* segundo dano da arma principal (do outro tipo, js/state.js danoExtraMao) também entra nas habilidades que usam o dano do personagem */
const comExtra=(s,d)=>{const pct=(+s.charPercent||0)/100,ex=pct?danoExtraMao('sw')*pct:0;if(!ex)return d;const mg=skillMagic(s),outro=mg?'physical':'magic',o=d&&typeof d=='object'?{...d}:{physical:mg?0:+d||0,magic:mg?+d||0:0};o[outro]=(o[outro]||0)+ex*multDano(outro);return o};
const basicAttackDamage=b=>withWeaponDamageRoll(()=>{if(b&&b.formula){applyActionAttributes(p,b.formula);const damage=b.splitDamage?skillDamage(b.formula):scaledDamage(b.formula),factor=(p.bf>0?1.5:1)*(1+(CL[p.cls].pDmg||0))*(b.dm||1);return damage&&typeof damage=='object'?{physical:Math.round((damage.physical||0)*factor),magic:Math.round((damage.magic||0)*factor)}:Math.round(damage*factor)}
 const factor=(p.bf>0?1.5:1)*(1+(CL[p.cls].pDmg||0))*(b.dm||1),mg=!!(b&&b.damageType=='magic'),primary=Math.round((danoMao(b&&b.weaponSlot||'sw')+weaponPower())*factor*multDano(mg?'magic':'physical')),off=(bonus(mg?'physicalDmg':'magicDmg')+danoExtraMao(b&&b.weaponSlot||'sw'))*factor*multDano(mg?'physical':'magic'); /* + o segundo dano da arma (outro tipo) */
 return b&&b.damageType=='magic'?{physical:off,magic:primary}:{physical:primary,magic:off}});
p.hp=mhp();p.mp=mmp();
const ampCura=n=>Math.round(n*(1+Math.max(0,bonus('healAmp')))); // amplificação de cura (atributo)
const heal=n=>{n=ampCura(n);p.hp=Math.min(mhp(),p.hp+n);ft(p.x,p.y-24,'+'+n,'#6f6');ring(p.x,p.y,24,'#6f6',.4)};
const withWeaponDamage=(d,flat)=>d&&typeof d=='object'||flat?d:d+weaponPower();
const pr=(dm,col,hl,opt={})=>{const f=(w,t)=>{const a=Math.atan2(t.y-8-p.y,t.x-p.x),d=dm();proj.push({x:p.x,y:p.y-8,vx:Math.cos(a)*190,vy:Math.sin(a)*190,t:1.6,d:withWeaponDamage(d,opt.flat),magic:opt.magic??(basic().damageType=='magic'),c:col,hl,tg:t,fx:opt.fx&&opt.fx(),area:opt.area,vfx:opt.vfx,seta:!opt.vfx&&!(opt.magic??(basic().damageType=='magic'))&&typeof armaDeTiro=='function'&&armaDeTiro()})};f.tg=1;return f};
const blink=(dm,opt={})=>w=>{let d=Math.min(80,dist(p,w)),a=Math.atan2(w.y-p.y,w.x-p.x);while(d>0&&(!walk(p.x+Math.cos(a)*d,p.y+Math.sin(a)*d)||!campWallSegmentClear(p,{x:p.x+Math.cos(a)*d,y:p.y+Math.sin(a)*d})))d=Math.max(0,d-4);ring(p.x,p.y,16,'#9cf');p.x+=Math.cos(a)*d;p.y+=Math.sin(a)*d;p.dest=null;ring(p.x,p.y,16,'#9cf');if(dm)en.forEach(e=>{if(e.hp>0&&dist(e,p)<32*areaMultiplier(p)&&linhaLivre(p,e))hurtE(e,withWeaponDamage(dm(),opt.flat),opt.magic??(basic().damageType=='magic'),opt.fx&&opt.fx())})};
const nova=(r,dm,col,hl,opt={})=>()=>{const radius=r*areaMultiplier(p);ring(p.x,p.y,radius,col,.35);en.forEach(e=>{if(e.hp>0&&dist(e,p)<radius&&linhaLivre(p,e))hurtE(e,withWeaponDamage(dm(),opt.flat),opt.magic??(basic().damageType=='magic'),opt.fx&&opt.fx())});if(hl)heal(hl())};
/* Ícone de habilidade no padrão de 16×16 (js/proporcao.js): o símbolo é desenhado em 24×24 e reduzido sem borrar;
   fundo e moldura são feitos direto em 16×16 */
function SKI(k,a,b){const c=mkCanvas(24,24),x=c.getContext('2d'),{R,disc}=kit(x),D=shade(a,.35),L=shade(a,1.35);
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
 const o=mkCanvas(16,16),g=o.getContext('2d');
 for(let y=0;y<16;y++){g.fillStyle=shade(a,.16+.14*(1-y/16));g.fillRect(0,y,16,1)}
 g.fillStyle=shade(a,.55);g.fillRect(0,0,16,1);g.fillStyle=shade(a,.45);g.fillRect(0,0,1,16);g.fillStyle='#05070a';g.fillRect(0,15,16,1);g.fillRect(15,0,1,16);
 g.drawImage(typeof reduzirArte==='function'?reduzirArte(c,16,16):c,0,0,16,16);
 return o.toDataURL()}
const pw=()=>weaponPower();
const guard=()=>{applyFx(p,[{caster:p,self:true,type:'ward',chance:100,dur:6,pw:50}]);ring(p.x,p.y,30,'#9cf',.5)}; // Proteção: efeito de status (−50% do golpe antes da defesa)
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
 {n:'Meteoro',mana:70,cd:25,ic:SKI('meteor','#a02010','#ffd84a'),f:Object.assign(w=>mets.push({x:w.x,y:w.y,t:.9,dmg:120+p.lvl*12+magicPower()}),{mira:1}),d:()=>'Chama um meteoro no local do mouse: '+(120+p.lvl*12+magicPower())+' de dano em área.'},
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
/* buffs ativos no dano que você causa (Grito, Inspiração, Fúria, Presença…): usado nos painéis, para o número bater com o golpe */
const buffDano=t=>(1+stSum(p,'dmgup')/100)*Math.max(.2,1-stSum(p,'dmgdown')/100)*(1+stSum(p,t==='magic'?'magup':'physup')/100);
const comBuffs=d=>d&&typeof d=='object'?{physical:(d.physical||0)*buffDano('physical'),magic:(d.magic||0)*buffDano('magic')}:d;
/* faixa do ataque básico (mínimo e máximo das armas, com Força/Inteligência e buffs), sem defesa do alvo */
function faixaBasico(b=basic(),buffs=true){const calc=pick=>{weaponDamageRolls=new Map();weaponDamage2Rolls=new Map();try{for(const sl of ['sw','sh']){const s=EQ[sl];if(!s||gearType[s.id]!=='sw')continue;const r=qualityWeaponRange(ITEMS[s.id],s.q),r2=qualityWeaponRange2(ITEMS[s.id],s.q);if(r)weaponDamageRolls.set(s,r[pick]);if(r2)weaponDamage2Rolls.set(s,r2[pick])}const d=basicAttackDamage(b),o=d&&typeof d=='object'?d:{physical:+d||0,magic:0};return buffs?comBuffs(o):o}finally{weaponDamageRolls=null;weaponDamage2Rolls=null}};return{min:calc('min'),max:calc('max')}}
/* dano nos painéis: "10-18 + 1-2", cada parte na cor do tipo (físico laranja, mágico azul) */
const corDoTipo=t=>t==='magic'?COR_DANO.magico:COR_DANO.fisico,pintaDano=(txt,t)=>'<span style="color:'+corDoTipo(t)+'">'+txt+'</span>';
const faixaTxt=(a,b)=>{a=Math.round(a);b=Math.round(b);return a===b?String(a):a+'-'+b};
const textoFaixa=f=>[['physical',f.min.physical,f.max.physical],['magic',f.min.magic,f.max.magic]].filter(([,,b])=>Math.round(b)>=1).map(([k,a,b])=>pintaDano(faixaTxt(a,b),k)).join(' + ')||'0';
const danoHTML=d=>d&&typeof d=='object'?[['physical',d.physical],['magic',d.magic]].filter(([,v])=>v>=.5).map(([k,v])=>pintaDano(Math.round(v),k)).join(' + ')||'0':String(Math.round(+d||0));
/* painel do ataque básico no mesmo formato das habilidades (rótulo: valor, com cores; ui.js) */
const basicTip=()=>{const b=basic(),L=(r,v,c)=>'<div class=tlin><span class=tl>'+r+':</span> <span class='+c+'>'+v+'</span></div>';return '<div class=tlin><span class=tl>Nome:</span> <b class=tnome>Ataque básico · '+b.n+'</b></div>'+L('Descrição',b.t,'tdesc')+L('Dano',textoFaixa(faixaBasico(b)),'tdano')+'<div class=tlin><span class=tl>Alcance:</span> <span class=tarma>'+b.rng+'</span>  <span class=tl>Intervalo:</span> <span class=tcd>'+attackInterval().toFixed(2)+' s</span>  <span class=tl>Arma:</span> <span class=tarma>'+(b.weaponSlot=='sw'?'mão 1':b.weaponSlot=='sh'?'mão 2':'desarmado')+'</span></div><div class=tm>Modo: '+BASIC_MODE_LABEL[p.basicMode]+' · automático ao atacar</div>'};
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
// espaços Z e X: as habilidades das armas equipadas (até duas, primeiro as da Mão 1); sem habilidade, o espaço fica vazio
const weaponSlots=[['sw',EQ.sw],['sh',EQ.sh]].filter(([,item])=>item&&gearType[item.id]=='sw').flatMap(([slot,item])=>(WSK[item.id]||[]).filter(Boolean).map(skill=>({...skill,w:1,weaponSlot:slot}))).slice(0,2);
const own=skillEntries(p.cls),slots=p.skillSlots&&p.skillSlots[p.cls]||[];
const used=new Set(),L=[0,1,2,3,4,5].map(i=>{
 const current=own[i],selected=slots[i],options=classSlotOptions(i);
 const pick=(selected&&options.find(s=>s.id==selected))||current||null;if(pick&&used.has(pick.id))return current&&!used.has(current.id)?(used.add(current.id),current):null;if(pick)used.add(pick.id);return pick
}).concat([0,1].map(i=>weaponSlots[i]||null));
L.forEach((d,i)=>{const o=SK[i];if(!d)Object.assign(o,{n:'',mana:0,cd:1,castTime:0,t:0,f:null,w:i>5?1:0,rank:0,lock:0,wt:null,weaponSlot:null,ic:BLANK,d:()=>''});else{const same=o.id===d.id;Object.assign(o,{rank:0,wt:null,weaponSlot:null,castTime:0},d,{t:same?o.t:0})}
 // arma exigida: vale a arma de qualquer mão (escudo na mão 2), a mesma regra do cast
 const maos=o.weaponSlot?[o.weaponSlot]:['sw','sh'];o.lock=o.rank>classRank(o.owner)?o.rank:0;o.bad=!(maos.some(sl=>EQ[sl]&&skillWeaponAllowed(o,ITEMS[EQ[sl].id]))||!maos.some(sl=>EQ[sl])&&skillWeaponAllowed(o,null));
 if(o.el){o.el.style.backgroundImage=o.n?'url('+o.ic+')':'none';o.el.classList.toggle('wk',!!o.w);o.el.classList.toggle('skVazio',!o.n);o.el.style.visibility=''; /* os 6 espaços (Q W E R T Y) aparecem sempre; vazio = escolha uma habilidade no seletor */o.el.querySelector('em').textContent=o.n?(o.manaSeg?o.manaSeg+'/s':o.mana):''}});
/* o que ainda está ativo de uma habilidade que saiu da barra para: aura, áreas, pulsos e canal (Girar, Chuva) */
const naBarra=new Set(SK.filter(s=>s.n&&s.id).map(s=>s.id));if(window.CURANDEIRO)CURANDEIRO.sincronizar(naBarra);if(p.canal&&p.canal.id&&!naBarra.has(p.canal.id))p.canal=null;if(p.conj&&p.conj.s&&!naBarra.has(p.conj.s.id))p.conj=null;
if(window.renderSkillMenu)renderSkillMenu()}
applySkills();const carpenter={cls:'war',nm:'Carpinteiro',x:CX+290,y:CY-180,carpenter:true},blacksmith={cls:'war',nm:'Ferreiro',x:-9999,y:-9999,blacksmith:true},NPCS=[carpenter,blacksmith];// classe e sexo são escolhidos na criação do personagem (js/conta.js)
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
  wallBuilt=true;CAMP_WALL.gateOpen=true;syncCampWall();showCarpenterDialogue();ft(p.x,p.y-28,'PALIÇADA CONSTRUÍDA!','#ffd84a');if(window.playGameSound)playGameSound('quest');ring(campGate.x,campGate.y,42,'#d5a85b',.7);saveGame()
 }
 else if(button.hasAttribute('data-start-magic-wood-quest')){
  if(!wallBuilt||campPortalBuilt)return;
  magicWoodQuestActive=true;$('dialogue').classList.remove('open');$('dialogue').classList.remove('dgModal');ft(p.x,p.y-28,'Colete 10 madeiras mágicas dos Brotos Vivos!','#bb88ff');saveGame()
 }
 else if(button.hasAttribute('data-build-camp-portal')){
  if(!wallBuilt||!magicWoodQuestActive||campPortalBuilt)return;
  if(!consumeItems('magicWood',PORTAL_WOOD_REQUIRED)){ft(p.x,p.y-28,'Precisa de 10 madeiras mágicas!','#f66');showCarpenterDialogue();return}
  campPortalBuilt=true;showCarpenterDialogue();ft(campPortal.x,campPortal.y-40,'PORTAL CONSTRUÍDO!','#bb88ff');if(window.playGameSound)playGameSound('quest');ring(campPortal.x,campPortal.y,32,'#bb88ff',.7);saveGame()
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
 if(window.MP&&MP.soDono&&MP.soDono())return; // na ilha de outro jogador o portal é do dono
 clearMovementInput();
 window.showProjectDungeonMenu();
}
function setClass(c){if(c==p.cls){ft(p.x,p.y-24,'Você já é '+CL[c].n,'#fff');return}
 const n=CL[c];p.classProgress=p.classProgress||{};if(!p.classProgress[c])p.classProgress[c]={rank:1,xp:0};
 p.cls=c;p.hp=Math.min(p.hp,mhp());p.mp=Math.min(p.mp,mmp());
 applySkills();setPortrait();ring(p.x,p.y,36,'#ffd84a',.6);ft(p.x,p.y-24,'Classe: '+n.n+' · Rank 1','#ffd84a');darKit(c,{salvar:false});if(window.saveGame)saveGame()}

const wpos=()=>({x:(mx-cv.width/2)/S+p.x,y:(my-cv.height/2)/S+p.y});
/* kit inicial da classe (Engine › Classes › Kit inicial): entregue uma vez por classe.
   Equipamento vai para o espaço se ele estiver vazio; o resto vai para a bolsa. */
function darKit(c,{salvar=true}={}){
 /* p.kits[c]: true (kit inteiro, saves antigos) ou a lista de itens já dados; item novo no kit (ex.: escudo do
    Guerreiro) chega depois, uma vez, mesmo para quem já recebeu o kit */
 const kit=CL[c]&&CL[c].kit;p.kits=p.kits||{};if(!kit||!kit.length)return false;
 const antes=p.kits[c],dados=Array.isArray(antes)?antes:antes?kit.map(r=>r.id).filter(id=>id!=='arma_escudo'):[]; /* save antigo (true): já tinha tudo, menos o escudo que entrou depois */
 const novos=kit.filter(r=>ITEMS[r.id]&&!dados.includes(r.id));p.kits[c]=[...new Set([...dados,...kit.map(r=>r.id)])];if(!novos.length)return false;
 for(const r of novos){const t=gearType[r.id];
  if(!t){addItem(r.id,undefined,r.n);continue}
  for(let k=0;k<r.n;k++){let sl=t=='ri'?(!EQ.r1?'r1':!EQ.r2?'r2':null):t;const th=EQ.sw&&ITEMS[EQ.sw.id].th;if(sl=='sw'&&EQ.sw&&!ITEMS[r.id].th&&!EQ.sh&&!th)sl='sh'; // segunda arma (escudo) vai para a mão 2
   if(sl&&!EQ[sl]&&!(sl=='sh'&&th)&&!(sl=='sw'&&ITEMS[r.id].th&&EQ.sh))EQ[sl]={id:r.id,n:1,q:50};else addItem(r.id,50)}}
 dirtyInv=true;if(window.setPortrait)setPortrait();ft(p.x,p.y-30,'Kit inicial: '+CL[c].n,'#ffd84a');if(salvar)saveGame();return true}
window.darKit=darKit;
// barra de conjuração embaixo do herói (desenhada pelo render.js e pelo dungeon.js)
window.desenharConj=()=>{if(p.beber){const b=p.beber,k=Math.max(0,Math.min(1,1-b.r/b.total)),x=Math.round(p.x)-6,y=Math.round(p.y)+5,h=ITEMS[b.id]&&ITEMS[b.id].heal||{};ctx.fillStyle='#000a';ctx.fillRect(x-.5,y-.5,13,2);ctx.fillStyle=(h.mp||h.mpPct)&&!(h.hp||h.hpPct)?'#5fb4ff':'#e04848';ctx.fillRect(x,y,12*k,1)} // bebendo poção
 const c=p.conj;if(!c)return; // barrinha fina embaixo do herói: 12 px de largura, 1 px de altura
 const k=Math.max(0,Math.min(1,1-c.r/c.total)),x=Math.round(p.x)-6,y=Math.round(p.y)+5;ctx.fillStyle='#000a';ctx.fillRect(x-.5,y-.5,13,2);ctx.fillStyle=c.s.vfxColor||'#ffd84a';ctx.fillRect(x,y,12*k,1)};
/* canal (Girar): um golpe em área a cada intervalo enquanto dura; dá para andar, mas sem ataque básico nem outra habilidade.
   Atordoado ou morto, para. Chamado pelo update.js a cada quadro. */
const atordoado=t=>!!t.st&&Object.keys(t.st).some(k=>fxKind(k)=='stun'&&t.st[k].t>0);
window.tickCanal=dt=>{const c=p.canal;if(!c)return;if(p.dead>0||atordoado(p)){p.canal=null;return}
 // parado (Chuva de meteoros): o herói não anda enquanto dura (statusSpeed); apertar a habilidade de novo cancela (cast)
 p.acd=Math.max(p.acd,.1);p.aw=0;c.r-=dt;c.prox-=dt;
 // giro visual: o herói roda (2,2 voltas/s) e a lâmina acompanha o mesmo ângulo (js/vfx-habilidades.js)
 if(c.visual){c.ang+=dt*Math.PI*2*2.2;p.fx=Math.cos(c.ang);p.fy=Math.sin(c.ang);p.fk=undefined}while(c.prox<=0&&c.n>0){c.prox+=c.tick;c.n--;c.golpe()}if(c.n<=0||c.r<=0)p.canal=null};
/* projétil acertou: dano no alvo e, com área, uma parte do dano nos inimigos em volta (Bola de Fogo / Gelo) */
window.acertoProjetil=(q,alvo)=>{if(q.vfx&&window.playGameSound)playGameSound(q.vfx==='gelo'?'gelo':'explosao',.7);hurtE(alvo,q.d,q.magic,q.fx);if(q.hl)heal(q.hl());
 if(q.area){const raio=q.area.r*areaMultiplier(p),k=q.area.pct/100,dd=q.d&&typeof q.d=='object'?{physical:(q.d.physical||0)*k,magic:(q.d.magic||0)*k}:q.d*k;
  for(const e of en)if(e!==alvo&&e.hp>0&&dist(e,alvo)<raio&&linhaLivre(alvo,e))hurtE(e,dd,q.magic,null)}
 if(q.vfx&&window.VFX)VFX.tocar(q.vfx==='gelo'?'explosaoGelo':'explosaoFogo',{x:q.x,y:q.y,raio:q.area?Math.round(q.area.r*areaMultiplier(p)):8});else ring(q.x,q.y,14,'#f93',.25)};
/* investida: o herói corre do ponto inicial ao final em d.dur segundos (sem teleporte); sem controle durante a corrida */
window.tickDash=dt=>{const d=p.dash;if(!d)return;if(p.dead>0){p.dash=null;return}
 d.t+=dt;const k=Math.min(1,d.t/d.dur);p.x=d.x0+(d.x1-d.x0)*k;p.y=d.y0+(d.y1-d.y0)*k;p.dest=null;p.path=[];p.acd=Math.max(p.acd,.05);
 if(d.rastro&&window.VFX&&(d.g=(d.g||0)+dt)>=.02){d.g=0;const f=face(p);VFX.fantasma(heroImg(f.d),p.x,p.y,f.fl,d.dir)}
 if(k>=1){p.dash=null;d.fim()}};
function cast(s){if(p.canal&&p.canal.id&&p.canal.id===s.id){p.canal=null;ft(p.x,p.y-24,'Cancelado','#ccc');return} // apertar de novo cancela o canal
 if(p.dead>0||s.t>0||!s.f||p.mp<s.mana||p.conj||p.canal||p.dash)return;if(s.lock){ft(p.x,p.y-24,'Libera no rank '+s.lock,'#ccc');return}const maos=s.weaponSlot?[s.weaponSlot]:['sw','sh'],armaOk=maos.some(sl=>EQ[sl]&&skillWeaponAllowed(s,ITEMS[EQ[sl].id]))||!maos.some(sl=>EQ[sl])&&skillWeaponAllowed(s,null);if(!armaOk){ft(p.x,p.y-24,'Precisa de: '+s.wt.join(' / '),'#ccc');return}const w=wpos();let t=null;if(s.f.tg){t=pick(w);if(!t&&p.tgt&&p.tgt.hp>0)t=p.tgt;if(!t){let b=60;en.forEach(e=>{const k=dist(e,w);if(e.hp>0&&k<b){b=k;t=e}})}if(!t){ft(p.x,p.y-24,'Sem alvo','#ccc');return}const lim=typeof s.alcance=='function'?s.alcance():200;if(dist(p,t)-(s.alcance&&typeof targetReach=='function'?targetReach(t):0)>lim){ft(p.x,p.y-24,'Longe demais','#ccc');return}if(!linhaLivre(p,t)){ft(p.x,p.y-24,'Parede no caminho','#ccc');return}p.fx=t.x-p.x;p.fy=t.y-p.y}else{if(s.f.mira&&!linhaLivre(p,w)){ft(p.x,p.y-24,'Parede no caminho','#ccc');return}p.fx=w.x-p.x;p.fy=w.y-p.y}
 // com tempo de conjuração o jogador para e a habilidade sai no fim da barra (update.js); andar cancela
 const ct=tempoConj(s);if(ct>0){p.conj={s,w,t,total:ct,r:ct,volta:p.tgt&&p.tgt.hp>0?p.tgt:null};p.dest=null;p.path=[];p.tgt=null;return}
 lancar(s,w,t)}
function lancar(s,w,t){
 if(s.f.tg&&t&&!linhaLivre(p,t)||s.f.mira&&!linhaLivre(p,w)){ft(p.x,p.y-24,'Parede no caminho','#ccc');return} // o alvo pode ter ido para trás da parede durante a conjuração
 const style=s.vfx||'arcane';if(style!='none'&&!['corte','investida','aura','giro'].includes(style)){const f={x:s.f.tg&&t?t.x:s.effect=='meteor'?w.x:p.x,y:s.f.tg&&t?t.y:s.effect=='meteor'?w.y:p.y,r:Math.max(16,Math.min(52,+s.radius||26)),c:s.vfxColor||'#9bd4ff',t:0,d:.55,style};fxs.push(f)}
 p.mp-=s.mana;applyActionAttributes(p,s);s.t=s.cd*cooldownMultiplier(p);withWeaponDamageRoll(()=>s.f(w,t));if(window.somDoJogador)somDoJogador('c.'+s.id);if(!(window.playEntitySound&&playEntitySound('skills',s.id,'cast'))&&window.playGameSound)playGameSound(somHabilidade(s))}
/* som de cada habilidade pelo tipo (audio.js): corte, investida, brado, giro, fogo, gelo, meteoros, cura, luz, pulso… */
function somHabilidade(s){const v=s.vfx||'',e=s.effect,k=s.efs&&s.efs[0]&&fxKind(s.efs[0].type);
 return e==='pulso'?'pulso':e==='curar'||e==='heal'?'cura':e==='zonaCura'?'luzSagrada':e==='auraContinua'?'brilho':e==='aura'?(k==='physup'?'grito':'brilho'):e==='buff'||e==='guard'?'brilho':v==='corte'||e==='golpe'?'corte':v==='investida'||e==='investida'?'investida':v==='giro'?'giro':v==='fogo'?'fogo':v==='gelo'?'gelo':v==='meteoros'?'meteoros':e==='projectile'?'feitico':e==='nova'||e==='meteor'?'explosao':e==='blink'?'investida':'magic'}
window.somHabilidade=somHabilidade;
