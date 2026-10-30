/* ---------- estado ---------- */
const I=Array(40).fill(null);let dirtyInv=true;
// itens de missão: aparecem em dourado com "!" só enquanto a missão que pede o item está em andamento
// (Serrote e Madeira: até a paliçada ficar pronta; Madeira Mágica: até o portal do acampamento)
const ITENS_MISSAO={saw:()=>!wallBuilt,wood:()=>!wallBuilt,magicWood:()=>!campPortalBuilt};
window.ehMissao=(id,quest)=>!!(ITENS_MISSAO[id]?ITENS_MISSAO[id]():quest||(ITEMS[id]&&ITEMS[id].quest));
/* itens de missão são temporários (2026-10-24, pedido do usuário): só caem (de monstro ou baú) enquanto a missão que pede o
   item foi aceita e não terminou; quando ela termina, as sobras saem da mochila e dos itens encontrados */
const MISSAO_ATIVA={saw:()=>sawQuestActive&&!sawObtained&&!wallBuilt,wood:()=>woodQuestActive&&!wallBuilt,magicWood:()=>magicWoodQuestActive&&!campPortalBuilt};
const MISSAO_ACABOU={saw:()=>wallBuilt,wood:()=>wallBuilt,magicWood:()=>campPortalBuilt};
window.podeCairDeMissao=id=>!MISSAO_ATIVA[id]||MISSAO_ATIVA[id]();
window.limparItensDeMissao=()=>{let n=0;
 for(const id of Object.keys(MISSAO_ACABOU))if(MISSAO_ACABOU[id]()){const c=itemCount(id);if(c){consumeItems(id,c);n+=c}
  if(typeof drops!=='undefined')for(let i=drops.length-1;i>=0;i--)if(drops[i]&&drops[i].id===id){n+=drops[i].n||1;drops.splice(i,1)}}
 return n};
/* bestiário (enciclopédia): quantos de cada monstro o jogador matou e quais itens cada um já deixou cair */
const BESTIARIO={k:{},d:{}};window.BESTIARIO=BESTIARIO;
window.anotarMorte=ty=>{if(ty)BESTIARIO.k[ty]=(BESTIARIO.k[ty]||0)+1};
window.anotarDrop=(ty,id)=>{if(ty&&id)(BESTIARIO.d[ty]=BESTIARIO.d[ty]||{})[id]=1};
const SLOTS=['he','ch','le','bo','ca','ne','r1','r2','sw','sh'];
const EQ=Object.fromEntries(SLOTS.map(s=>[s,null]));
const fits=(slot,id)=>!!gearType[id]&&(gearType[id]==slot||(gearType[id]=='ri'&&(slot=='r1'||slot=='r2'))||(slot=='sh'&&gearType[id]=='sw'&&!ITEMS[id].th));
/* raridade (qualidade) de um item novo: sorteia a faixa pelas chances da Engine (Fórmulas › Drops) e depois um valor dentro
   dela. Padrão: Ruim 0-19 35%, Comum 20-44 35%, Boa 45-69 20%, Rara 70-89 8%, Épica 90-99 1,9%, Perfeita 100 0,1% */
const FAIXAS_Q=[['qualRuim',0,19],['qualComum',20,44],['qualBoa',45,69],['qualRara',70,89],['qualEpica',90,99],['qualPerfeita',100,100]];
const rollQ=()=>{const w=FAIXAS_Q.map(([k])=>Math.max(0,+CALC[k]||0)),tot=w.reduce((a,b)=>a+b,0);if(!(tot>0))return Math.round(100*Math.pow(Math.random(),CALC.qualExp||2.2));let r=Math.random()*tot;for(let i=0;i<w.length;i++){r-=w[i];if(r<0||i===w.length-1){const [,a,b]=FAIXAS_Q[i];return a+Math.floor(Math.random()*(b-a+1))}}},qMul=q=>CALC.qualBase+(q==null?50:q)/100,
/* atributos de um item numa qualidade: guardados (o bônus do equipamento era recalculado várias vezes por quadro) */
qCache=new Map(),qStats=(id,q)=>{const ch=id+'|'+q,it=ITEMS[id];let c=qCache.get(ch);if(c&&c.it===it)return c.v;if(qCache.size>800)qCache.clear();c={it,v:qStats0(id,q)};qCache.set(ch,c);return c.v}, /* se o item for trocado, recalcula */
qStats0=(id,q)=>{const it=ITEMS[id],o={};for(const k of Object.keys(ITEM_STATS))if(it[k])o[k]=ITEM_STATS[k].percent||ITEM_STATS[k].fractional?it[k]*qMul(q):Math.max(1,Math.round(it[k]*qMul(q)));const range=gearType[id]==='sw'&&qualityWeaponRange(it,q);if(range)o.dmg=(range.min+range.max)/2;return o},
qName=q=>q<20?'Ruim':q<45?'Comum':q<70?'Boa':q<90?'Rara':q<100?'Épica':'Perfeita',
bonus=k=>Object.values(EQ).reduce((a,s)=>a+(s&&gearType[s.id]&&(k==='dmg'&&weaponDamageRolls?.has(s)?weaponDamageRolls.get(s):qStats(s.id,s.q)[k])||0),0)+playerAttributeBonus(k);
let weaponDamageRolls=null,weaponDamage2Rolls=null;
function qualityWeaponRange(it,q){const range=weaponDamageRange(it);return range?{min:Math.round(range.min*qMul(q)),max:Math.round(range.max*qMul(q))}:null}
function qualityWeaponRange2(it,q){const range=weaponDamage2Range(it);return range?{min:Math.round(range.min*qMul(q)),max:Math.round(range.max*qMul(q))}:null}
/* segundo dano (do outro tipo) da arma de uma mão: sorteado no golpe; fora do golpe, a média */
const danoExtraMao=mao=>{if(mao=='ambas'){if(weaponDamage2Rolls&&weaponDamage2Rolls.has('ambas'))return weaponDamage2Rolls.get('ambas');return (danoExtraMao('sw')+danoExtraMao('sh'))/2*(typeof fatorAmbas=='function'?fatorAmbas():.8)} // duas armas: média × 80%
 const s=EQ[mao];if(!s||gearType[s.id]!=='sw')return 0;if(weaponDamage2Rolls&&weaponDamage2Rolls.has(s))return weaponDamage2Rolls.get(s);const r=qualityWeaponRange2(ITEMS[s.id],s.q);return r?(r.min+r.max)/2:0};
function withWeaponDamageRoll(action){
 if(weaponDamageRolls)return action();
 weaponDamageRolls=new Map();weaponDamage2Rolls=new Map();
 try{
  for(const slot of ['sw','sh']){
   const s=EQ[slot],range=s&&gearType[s.id]==='sw'&&qualityWeaponRange(ITEMS[s.id],s.q),r2=s&&gearType[s.id]==='sw'&&qualityWeaponRange2(ITEMS[s.id],s.q);
   if(range)weaponDamageRolls.set(s,rollWeaponDamage(range));
   if(r2)weaponDamage2Rolls.set(s,rollWeaponDamage(r2));
  }
  // duas armas ao mesmo tempo: um sorteio na faixa combinada (média das duas × 80%, js/combat.js ambasFaixas)
  const A=typeof ambasFaixas=='function'&&ambasFaixas();if(A){if(A.r)weaponDamageRolls.set('ambas',rollWeaponDamage(A.r));if(A.r2)weaponDamage2Rolls.set('ambas',rollWeaponDamage(A.r2))}
  return action();
 }finally{weaponDamageRolls=null;weaponDamage2Rolls=null}
}
const heroC={};
function heroImg(dir,an){if(CL[p.cls]&&CL[p.cls].sprite)return CL[p.cls].sprite;const mana=window.HEROI_MANA&&HEROI_MANA.jogador(dir,an);if(mana)return mana; /* personagem Mana Seed (js/heroi-mana.js) */const ph=an&&an.ph||0,E={nude:1,sex:p.sex,swing:an&&an.sw||0,shWeapon:!!(EQ.sh&&gearType[EQ.sh.id]=='sw')};if(window.APARENCIA)E.look=APARENCIA.normalizar(p.look,p.sex);/* olhando para a esquerda: camadas próprias (js/sprites.js ORDEM_CAMADAS) */if(dir==='s'&&typeof face=='function'&&face(p).fl<0)E.esquerda=1;let key=p.cls+p.sex+dir+(E.esquerda?'E':'')+ph+'w'+E.swing+(E.look?APARENCIA.codificar(E.look):'');for(const s of ['he','ch','le','bo','ca','ne','r1','r2','sw','sh'])if(EQ[s]){E[s]=ITEMS[EQ[s].id];key+=s+EQ[s].id}
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
  +.5*(pct('spd')+pct('moveSpeed')+pct('attackSpeed')+pct('castSpeed')+pct('area')+pct('cooldownReduction')+pct('critChance')+pct('critDamage')+pct('lifeSteal')+pct('magicLifeSteal')+pct('physicalPen')+pct('magicPen')+pct('healAmp')))*(it.th?1.2:1));
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
/* em combate nenhum equipamento troca (arma, armadura, anéis, colar, capa, Mão 2), em qualquer tela; o aviso diz quanto falta */
function armaTravada(){const r=combateRestante();if(r<=0)return false;ft(p.x,p.y-24,'Em combate: troque equipamentos '+Math.ceil(r)+'s depois de sair do combate','#f0a090');return true}
const ehArma=s=>!!(s&&gearType[s.id]=='sw');
window.armaTravada=armaTravada;window.ehArma=ehArma;
function equipSlot(i,preferredSlot){const s=I[i];if(!s||!gearType[s.id])return;const t=gearType[s.id];
 if(armaTravada())return;let sl=t=='ri'?(preferredSlot=='r1'||preferredSlot=='r2'?preferredSlot:!EQ.r1?'r1':!EQ.r2?'r2':'r1'):t;
 if(t=='sw'&&(preferredSlot=='sw'||preferredSlot=='sh'))sl=preferredSlot;
 if(t=='sw'&&preferredSlot=='sh'&&ITEMS[s.id].th){ft(p.x,p.y-24,'Arma de duas mãos não cabe na Mão 2','#ccc');return}
 if(t=='sw'&&ITEMS[s.id].th)sl='sw';
 if(t=='sh')sl='sh';
 const old=EQ[sl];
 if(sl=='sh'&&EQ.sw&&ITEMS[EQ.sw.id].th){ft(p.x,p.y-24,'Arma de duas mãos','#ccc');return}
 EQ[sl]=s;I[i]=null;if(old)I[i<QUICK_N?livre(old.id):i]=old;if(sl=='sw'&&ITEMS[s.id].th&&EQ.sh){I[livre(EQ.sh.id)]=EQ.sh;EQ.sh=null}
 dirtyInv=true;setPortrait();saveGame();if(window.playEntitySound)playEntitySound('items',s.id,'use')}
function unequip(sl){if(!EQ[sl])return;if(armaTravada())return;I[livre(EQ[sl].id)]=EQ[sl];EQ[sl]=null;dirtyInv=true;setPortrait();saveGame()}
/* consumível: o herói bebe por castTime s (padrão 0,5; barra e som de gole) e só então faz efeito; atordoado cancela sem gastar */
function useSlot(i,preferredSlot){const s=I[i];if(!s||p.dead>0)return;if(gearType[s.id]){equipSlot(i,preferredSlot);return}const d=ITEMS[s.id];if(!d.use)return;
 if(p.beber)return;if(p.canal||p.conj||p.dash){ft(p.x,p.y-24,'Ocupado: termine a habilidade','#ccc');return} // nada de beber girando ou conjurando (pedido do usuário)
 const ct=+d.castTime||0;if(ct>0){p.beber={i,id:s.id,r:ct,total:ct};if(window.playGameSound)playGameSound('beber');return}
 usarConsumivel(i)}
function usarConsumivel(i){const s=I[i];if(!s)return;const d=ITEMS[s.id];if(!d||!d.use)return;
 const h=d.heal||{},vh=Math.round((h.hp||0)+mhp()*(h.hpPct||0)/100),vm=Math.round((h.mp||0)+mmp()*(h.mpPct||0)/100);if(vh){p.hp=Math.min(mhp(),p.hp+vh);ft(p.x,p.y-12,'+'+vh,'#6f6')}if(vm){p.mp=Math.min(mmp(),p.mp+vm);ft(p.x,p.y-12,'+'+vm,'#6cf')}
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
 gob:{name:'Esqueleto do Serrote',stats:{F:17,A:10,I:5},skill:{name:'Corte de serrote',cost:999999,cd:999,range:24,windup:.4,damage:0}},
 boss:{name:'Glooc Saqueador',stats:{F:25,A:8,I:10},skill:{name:'Rugido arcano',cost:25,cd:10,range:55,windup:.9,damage:25,magic:true,radius:48},bossType:'boss'}
};
/* nível de um monstro sem faixa própria: o do jogador, no máximo 3 abaixo ou 3 acima (mais perto do nível do jogador é mais comum) */
const DIF_NIVEL=3;
function monsterLevel(){const d=Math.round((Math.random()+Math.random()+Math.random()-1.5)*2*DIF_NIVEL/3);return Math.max(1,p.lvl+Math.max(-DIF_NIVEL,Math.min(DIF_NIVEL,d)))}
function configureMonster(e,type,level){
 level=Math.max(1,Math.min(+CALC.maxLevel||10,level)); // ninguém passa do nível máximo do jogo
 const template=MONSTER_TYPES[type],growth=level-1;
 e.ty=type;e.lvl=level;
 // mesmo esquema da classe: atributos iniciais + "por nível" × (nível-1); sem "por nível", +1 de F/A/I por nível
 const per=typeof atrNivel=='function'?atrNivel():{F:2,A:2,I:2},grow=k=>(+per[k]||0)*growth, /* mesmo ganho por nível das classes (Fórmulas) */base=template.attributeStats||{};
 e.attributeStats=Object.fromEntries([...new Set([...Object.keys(base),...Object.keys(per||{})])].map(k=>[k,(+base[k]||0)+grow(k)]));e.attributeBuffs=[];e.st=null;
 e.size=Math.max(.25,(+template.size||100)/100);
 if(template.custom&&template.sprite){e.img=template.sprite;e.sp=template.sp}
 else if(type=='boss'&&SP.boss){e.img=SP.boss.d;e.sp=SP.boss}
 const attrScale=template.bossType=='grandboss'?1.5:template.bossType=='boss'?1.25:1;
 e.stats={F:Math.round((template.stats.F+grow('F'))*attrScale),A:Math.round((template.stats.A+grow('A'))*attrScale),I:Math.round((template.stats.I+grow('I'))*attrScale)};
 e.bossType=template.bossType||'normal';e.skill=template.skill;e.skillCd=0;e.skillWindup=false;e.mp=monMana(e.stats.I);e.armor=e.magicArmor=undefined;
 // fórmulas dos monstros: Engine › Fórmulas › Monstros
 e.max+=(e.stats.F-template.stats.F)*CALC.monHpPerF;e.dmg=Math.round(e.dmg*(1+e.stats.F*monPhysPerF()/100)); /* Força: +% de dano */
 e.ac=Math.max(CALC.monMinInterval,e.ac*(1-(e.stats.A-template.stats.A)*CALC.monAtkSpdPerA));
 e.spd*=1+(e.stats.A-template.stats.A)*.005;
 e.weaponRanges=[];e.weaponDamageMultiplier=1;e.weaponDamageBase=null;
 if(template.custom){
  const eq=template.equipment||{},weapon=eq.weapon;let stats=eq.stats||{},faixas=eq.weaponRanges||[];
  // ataque básico pelo nível (plano de balanceamento, js/balanceamento.js): faixa mín–máx do nível em que o monstro nasce
  if(template.ataqueDoNivel&&window.BALANCEAMENTO){const r=BALANCEAMENTO.ataqueMonstro(level,CALC,PLANO_CLASSES());stats={...stats,dmg:(stats.dmg||0)+(r.min+r.max)/2};faixas=[...faixas,{min:r.min,max:r.max}]}
  e.stats.F=Math.round((template.stats.F+grow('F')+(stats.F||0))*attrScale);
  e.stats.A=Math.round((template.stats.A+grow('A')+(stats.A||0))*attrScale);
  e.stats.I=Math.round((template.stats.I+grow('I')+(stats.I||0))*attrScale);
  const maxBase=CALC.monHp0+e.stats.F*CALC.monHpPerF+(stats.hp||0),magica=weapon&&weapon.damageType=='magic',power=magica?(stats.magicDmg||0):(stats.physicalDmg||0),multAtr=1+(magica?e.stats.I*monMagPerI():e.stats.F*monPhysPerF())/100; // Força/Inteligência: +% de dano (como o personagem)
  e.max=Math.round(maxBase*(e.bossType=='grandboss'?2:e.bossType=='boss'?1.5:1)*(template.hpMult||1));
  e.weaponDamageBase=(stats.dmg||0)+power;e.dmg=Math.round(e.weaponDamageBase*(template.dmgMult||1)*multAtr);e.armor=e.stats.A*CALC.monArmPerA+(stats.arm||0);e.magicArmor=monMagArm(e.stats.F,e.stats.A,e.stats.I)+(stats.magicArm||0);
  e.attackMagic=!!(weapon&&weapon.damageType=='magic');e.weaponBasic=weapon&&weapon.basic;e.weaponFx=weapon&&weapon.effects||[];
  e.weaponRanges=faixas;e.weaponDamageMultiplier=(template.dmgMult||1)*multAtr;
  e.spd=(template.moveSpeed||CALC.monMove0*Math.max(0,1+e.stats.A*CALC.monMovePerA))*(1+((stats.spd||0)+(stats.moveSpeed||0))/100);e.ac=Math.max(CALC.monMinInterval,(template.attackSpeed||1)*(1-e.stats.A*CALC.monAtkSpdPerA)*(1-(stats.attackSpeed||0)/100));
  e.skill=template.skills&&template.skills.length?{...template.skills[0],damage:template.skills[0].damage+template.skills[0].per*level}:{name:'Ataque',cost:999999,cd:999,range:e.weaponBasic?e.weaponBasic.rng:22,windup:.4,damage:0};
  e.equipmentStats=stats;
 }
 const own=e.attributeStats;
 // vida: só a das fórmulas (vida inicial + Força × vida por Força) e a do atributo do monstro
 // mana e defesas arredondadas como as do personagem (mmp, armor, magicArmor em js/combat.js)
 e.max=Math.max(1,Math.round(e.max+(+own.hp||0)));e.maxMp=Math.max(0,Math.round(monMana(e.stats.I)+(e.equipmentStats?.mp||0)+(+own.mp||0)));e.mp=e.maxMp;
 e.armor=Math.round((e.armor??e.stats.A*CALC.monArmPerA)+(+own.arm||0));e.magicArmor=Math.round((e.magicArmor??monMagArm(e.stats.F,e.stats.A,e.stats.I))+(+own.magicArm||0));
 e.spd*=Math.max(0,1+attributeValue(own,'moveSpeed'));e.ac=Math.max(CALC.monMinInterval,e.ac*(1-Math.min(.9,attributeValue(own,'attackSpeed'))));
 // XP: o do monstro (Engine, se maior que 0) ou a fórmula: XP por nível × nível (chefe e chefão multiplicam)
 const fixo=+((typeof MB!=='undefined'&&MB[type]||{}).xpFixo)||0;e.xp=fixo>0?fixo:Math.round((+CALC.monXpPorNivel||5)*level*(e.bossType=='grandboss'?(+CALC.xpChefao||15):e.bossType=='boss'||e.boss?(+CALC.xpChefe||5):1));
}
// classes de referência do plano de balanceamento (js/balanceamento.js): Guerreiro (físico) e Mago (mágico) do projeto
const PLANO_CLASSES=()=>{const l=GAMEDATA.classes||[];return{war:l.find(c=>c&&c.id=='war'),mag:l.find(c=>c&&c.id=='mag')}};
const MB={sl:{max:40,dmg:5,spd:28,xp:10,g:3,aggro:60,wu:.35,ac:1.1,base:'sl'},gob:{max:130,dmg:15,spd:34,xp:55,g:24,aggro:90,wu:.45,ac:1.25,base:'goblin'}};
function pickType(far){return far?'gob':'sl'}
/* nasce numa clareira da floresta (js/world.js CLAREIRAS) */
function spawn(e){let x,y,t=0;const cl=window.CLAREIRAS&&CLAREIRAS.length?CLAREIRAS:null;do{if(cl&&t<300){const c=cl[Math.floor(Math.random()*cl.length)],a=rnd(0,6.283),r=Math.sqrt(Math.random())*c.r*.7;x=c.x+Math.cos(a)*r;y=c.y+Math.sin(a)*r}else{x=rnd(0,W);y=rnd(0,W)}t++}while(t<500&&(!walk(x,y)||V(x/T|0,y/T|0)>25||insideCamp(x,y,8)));
 const far=Math.hypot(x-CX,y-CY)>240&&Math.random()<.55,type=pickType(far),B=MB[type];
 Object.assign(e,{img:SP[B.base].d,sp:SP[B.base],max:B.max,dmg:B.dmg,spd:B.spd,xp:B.xp,g:B.g,aggro:B.aggro,wu:B.wu,ac:B.ac});
 configureMonster(e,type,monsterLevel());
 e.x=e.hx=x;e.y=e.hy=y;e.hp=e.max;e.st=null;e.fx=0;e.fy=1;e.aw=0;e.cd=0;e.hit=0;e.rt=0;e.dest=null;e.path=[];e.pathI=0;e.pathKey='';e.roamT=5;e.roamRadius=rnd(38,82)}
/* sem inimigos iniciais: eles saem de portais (js/portals.js) */
/* cacaFeita/cacaMortes: 1ª missão depois do tutorial = derrotar 10 monstros quaisquer; só então o Guardião aparece */
let cacaFeita=false,cacaMortes=0;const CACA_ALVO=10;
let questDone=false,carpenterHelped=false,sawQuestActive=false,sawObtained=false,woodQuestActive=false,wallBuilt=false,magicWoodQuestActive=false,campPortalBuilt=false,sawGoblin=null,inDungeon=false,campPortalTheme='normal',blacksmithSaved=false;
const WALL_WOOD_REQUIRED=20;
const PORTAL_WOOD_REQUIRED=10,campPortal={x:CX-66,y:CY-48};
function questMonsterRequested(type){
 return type=='gob'?sawQuestActive&&!sawObtained&&!wallBuilt:type=='toco_vivo'?(woodQuestActive&&!wallBuilt&&itemCount('wood')<WALL_WOOD_REQUIRED)||(magicWoodQuestActive&&!campPortalBuilt&&itemCount('magicWood')<PORTAL_WOOD_REQUIRED):false
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
const boss={boss:true,img:SP.glooc.d,sp:SP.glooc,max:420,dmg:20,spd:25,xp:180,g:80,aggro:110,wu:.6,ac:1.8};
configureMonster(boss,'boss',monsterLevel());
{const E=typeof ESCONDERIJO!=='undefined'?ESCONDERIJO:{x:CX+224,y:CY-150};boss.x=boss.hx=E.x-28;boss.y=boss.hy=E.y+14}boss.roamRadius=14; /* colado no esconderijo do carpinteiro (combat.js ESCONDERIJO): ronda a tora */boss.hp=boss.max;boss.fx=0;boss.fy=1;boss.aw=0;boss.cd=0;boss.hit=0;boss.rt=0;en.push(boss);
const ft=(x,y,t,c)=>{for(let i=fts.length-1;i>=0&&i>=fts.length-8;i--){const o=fts[i];if(o.a>.8&&Math.abs(o.x-x)<34&&Math.abs(o.y-y)<9)y=o.y-10}fts.push({x,y,t,c,a:1})}; /* dois textos no mesmo ponto (nome da mecânica e o grito, por ex.) empilham em vez de sobrepor */
const ring=(x,y,r,c,d=.4)=>fxs.push({x,y,r,c,t:0,d});
