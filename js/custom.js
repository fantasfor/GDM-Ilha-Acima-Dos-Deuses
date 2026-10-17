/* Conteúdo criado no Editor (../Editor): lê GAMEDATA (js/data.js) e registra classes, itens, habilidades e monstros. */
(function(){
const D=typeof GAMEDATA!=='undefined'?GAMEDATA:{},L=k=>Array.isArray(D[k])?D[k]:[],n=(v,d=0)=>Number.isFinite(+v)&&v!==''&&v!=null?+v:d,pc=v=>n(v)/100,
 tags=v=>Array.isArray(v)?v.map(String):[],lc=a=>tags(a).map(s=>s.trim().toLowerCase()).filter(Boolean),
 weaponId=weaponTag,
 pw=()=>basic().damageType=='magic'?magicPower():physicalPower();

ITEMS.sw.wt='espada';ITEMS.sw2.wt='machado_2mao';ITEMS.sw3.wt='cajado';

/* ---------- habilidades ---------- */
if(L('effects').length){L('effects').forEach(e=>{FX_INFO[e.id]={...FX_INFO[e.id],...e,n:e.n||e.name||e.id,c:e.c||e.color||'#fff',kind:e.kind||'dot',tick:n(e.tick,1),dtype:['true','physical','magic'].includes(e.dtype)?e.dtype:'true'}})}
const FXATTR={F:'Força',A:'Agilidade',I:'Inteligência',physicalPower:'poder físico',magicPower:'poder mágico',dmg:'dano de equipamento',weaponPower:'poder da arma'};
const fxText=l=>Array.isArray(l)&&l.length?' '+l.filter(f=>FX_INFO[f.type]).map(f=>(f.chance==null||f.chance===''?100:f.chance)+'% de '+(f.target=='self'?'ganhar ':'causar ')+FX_INFO[f.type].n+' por '+(f.dur||3)+'s'+(fxKind(f.type)=='dot'?' ('+[n(f.power)||'',n(f.pct)?n(f.pct)+'% do dano'+(f.src=='physical'?' físico':f.src=='magic'?' mágico':''):'',n(f.attrPct)&&f.attr&&f.attr!='none'?n(f.attrPct)+'% de '+(FXATTR[f.attr]||f.attr):''].filter(Boolean).join(' + ')+' por '+(FX_INFO[f.type].tick==1?'segundo':FX_INFO[f.type].tick+'s')+')':fxKind(f.type)=='slow'?' (-'+n(f.power)+'% vel.)':fxKind(f.type)=='vuln'?' (+'+n(f.power)+'% dano recebido)':fxExtra(f))).join('; ')+'.':'';
const SDEF={};
function makeSkill(s){
 if(s.category&&s.category!='ability')return null;
 const split=(s.damageModel=='split'||hasSplitDamage(s))&&!['heal','guard','buff'].includes(s.effect),pv=()=>split?skillDamage(s):scaledDamage(s),hasDamage=()=>hasSplitDamage(s)||n(s.base)||n(s.per)||n(s.charPercent)||n(s.scalePercent),col=s.color||s.c2||'#fff',hl=n(s.heal)>0?()=>n(s.heal):undefined,r=n(s.radius,40),magic=skillMagic(s);let f,d;
 const dty=s.damageType=='physical'||s.damageType=='magic'?s.damageType:'weapon',fx=Array.isArray(s.effects)&&s.effects.length?()=>resolveFx(s.effects,charDamage(dty)):undefined;
 const P=()=>split?damageText(pv()):pv();
 switch(s.effect){
  case'projectile':f=pr(pv,col,hl,{flat:true,magic,fx});d=()=>'Dispara um projétil teleguiado: '+P()+' de dano'+(hl?' e cura '+hl():'')+'.';break;
  case'nova':f=nova(r,pv,col,hl,{flat:true,magic,fx});d=()=>'Explosão ao redor ('+r+' px): '+P()+' de dano'+(hl?' e cura '+hl():'')+'.';break;
  case'blink':f=blink(hasDamage()?pv:null,{flat:true,magic,fx});d=()=>'Avança até 80 px na direção do mouse'+(hasDamage()?' e causa '+P()+' de dano a quem estiver perto':'')+'.';break;
  case'heal':f=()=>{heal(Math.round(pv()));if(n(s.mpRestore)>0)p.mp=Math.min(mmp(),p.mp+n(s.mpRestore))};d=()=>'Recupera '+Math.round(pv())+' de vida'+(n(s.mpRestore)>0?' e '+n(s.mpRestore)+' de mana':'')+'.';break;
  case'guard':f=guard;d=()=>'Por 6 s você recebe metade do dano.';break;
  case'buff':f=()=>{p.bf=n(s.base,8);ring(p.x,p.y,40,col,.5);ft(p.x,p.y-24,s.name+'!',col)};d=()=>'Por '+n(s.base,8)+' s aumenta o dano e a velocidade.';break;
  case'meteor':f=w=>mets.push({x:w.x,y:w.y,t:.9,radius:r*areaMultiplier(p),dmg:pv(),magic,fx:fx&&fx()});d=()=>'Chama um meteoro no local do mouse: '+P()+' de dano em área.';break;
  default:return null}
 if(['heal','guard','buff'].includes(s.effect)&&(n(s.actionStats?.physicalDmg)||n(s.actionStats?.magicDmg))){
  const perform=f;f=(w,t)=>{perform(w,t);for(const enemy of en)if(enemy.hp>0&&dist(enemy,p)<r*areaMultiplier(p))hurtE(enemy,{physical:Math.max(0,n(s.actionStats.physicalDmg)),magic:Math.max(0,n(s.actionStats.magicDmg))},false,fx&&fx())};
 }
 const sprite=pixelArt(s.sprite),dd=d,dmgTag=()=>skillMagic(s)?'mágico':'físico';d=()=>dd().replace(/ de dano/g,' de dano '+(split?'':dmgTag()))+fxText(s.effects)+(attributeText(s.actionStats)?' Ação: '+attributeText(s.actionStats)+'.':'')+(attributeText(s.bonuses)?' Bônus: '+attributeText(s.bonuses)+'.':'');
 return{id:s.id,category:s.category||'ability',n:s.name||s.id,effect:s.effect,radius:r,mana:n(s.mana),cd:Math.max(.3,n(s.cd,3)),actionStats:s.actionStats,bonuses:s.bonuses,bonusDuration:n(s.bonusDuration,5),ic:sprite?sprite.toDataURL():SKI(s.icon||'orb',s.c1||'#4a6a96',s.c2||'#fff'),f,d:s.desc?()=>s.desc+' ('+d()+')':d,wt:lc(s.weaponTypes).map(weaponTag),tags:tags(s.tags),cross:!!s.cross,vfx:s.vfx||'arcane',vfxColor:col}}
L('skills').forEach(s=>{const o=makeSkill(s);if(o)SDEF[s.id]=o});

/* ---------- itens ---------- */
L('items').forEach(it=>{
 if(!it.id)return;
 const st={};Object.keys(ITEM_STATS).forEach(k=>{const v=n(it.stats&&it.stats[k]);if(v)st[k]=ITEM_STATS[k].percent?v/100:v});
 const c=[it.c1||'#9aa7b8',it.c2||'#c9a227'],style=Math.max(0,Math.min(2,n(it.style))),nm=it.name||it.id;let o;
 if(it.kind=='material'){
  o={n:nm,material:true,stackable:true,c:pixelArt(it.sprite)||woodIcon(it.id=='magicWood')}
 }
 else if(it.kind=='consumable'){
  const h={hp:n(it.healHp),mp:n(it.healMp)};
  o={n:nm+' ('+[h.hp&&'cura '+h.hp,h.mp&&'+'+h.mp+' mana'].filter(Boolean).join(', ')+')',use:1,heal:h,c:pixelArt(it.sprite)||half(potion(c[0],shade(c[0],1.4),shade(c[0],.55)))}}
 else if(it.kind=='weapon'){
  const wtype=weaponId(it.wtype),twoHanded=!!it.twoHanded||['espada_grande','cajado','machado_2mao','martelo_2mao'].includes(wtype);
  // um item com dano inválido não pode impedir o jogo de abrir: avisa e usa os valores em ordem
  let range;try{range=weaponDamageRange(it)}catch(e){const a=Math.max(0,Math.round(+it.damageMin||0)),b=Math.max(0,Math.round(+it.damageMax||0));range={min:Math.min(a,b),max:Math.max(a,b)};console.warn('Arma "'+(it.name||it.id)+'": '+e.message+' Usando '+range.min+' - '+range.max+'.')}
  if(range)st.dmg=(range.min+range.max)/2;
  o={n:nm+' ('+(range?'dano '+range.min+' - '+range.max+(statTxt({...st,dmg:0})?', '+statTxt({...st,dmg:0}):''):statTxt(st))+')',...st,...(range?{damageMin:range.min,damageMax:range.max}:{}),c:pixelArt(it.sprite)||half(weaponIcon(style,c)),g:1,v:{c,st:style},wt:wtype,th:twoHanded,equippedSprite:pixelArt(it.equippedSprite)};
  gearType[it.id]='sw';
  /* ataque básico: configurado na própria arma (it.basic). Projetos antigos ligavam uma habilidade da
     categoria "basic" (basic.skillId); a Engine move esses dados para a arma, mas o jogo ainda lê os dois. */
  const b0=it.basic||{},basicSkill=b0.skillId?L('skills').find(s=>s.id==b0.skillId&&s.category=='basic'):null;
  const b=basicSkill?{...basicSkill,ranged:!!basicSkill.isRanged,rng:basicSkill.basicRange,proj:basicSkill.projectileColor}
   :{...b0,base:b0.base??b0.flat,charPercent:b0.charPercent??b0.pct,scaleStat:b0.scaleStat||b0.attr,scalePercent:b0.scalePercent??b0.attrPct};
  const ranged=!!b.ranged;
  const damageType=['physical','magic'].includes(b.damageType)?b.damageType:it.damageType=='magic'?'magic':'physical';
  const basicFx=[...(Array.isArray(b.effects)?b.effects:[]),...(Array.isArray(it.effects)?it.effects:[])];
  const splitDamage=b.damageModel=='split'||hasSplitDamage(b);
  const hasBasicFormula=!!basicSkill||splitDamage||n(b.base)||n(b.per)||n(b.charPercent)||n(b.scalePercent);
  const formula=hasBasicFormula?{...b,id:basicSkill?basicSkill.id:it.id,base:n(b.base),per:n(b.per),charPercent:n(b.charPercent),scaleStat:b.scaleStat||'none',scalePercent:n(b.scalePercent),damageType}:null;
  const basicSprite=pixelArt(b.sprite);
  BASIC[it.id]={n:b.name||'Ataque básico',rng:n(b.rng,22),dm:basicSkill?1:n(b.dm,1),damageType,formula,splitDamage,effects:basicFx,
   ic:basicSprite?basicSprite.toDataURL():SKI(b.icon||(ranged?'orb':style==1?'axe':'blade'),b.c1||c[0],b.c2||c[1]),
   t:(b.desc||'Ataque básico da arma.')+' Dano '+(damageType=='magic'?'mágico':'físico')+'.'+fxText(basicFx),
   // som do golpe: o da arma (Sons › Ataque básico); projetos antigos usam o da habilidade
   som:basicSkill?['skills',basicSkill.id,'cast']:['items',it.id,'attack'],
   ...(ranged?{proj:b.proj||'#fff'}:{})};
  WSK[it.id]=tags(it.skills).slice(0,1).map(id=>SDEF[id]).filter(s=>s&&s.category=='ability').map(s=>({...s}))}
 else{
  const slot=['he','ch','le','bo','ca','ne','ri','sh'].includes(it.slot)?it.slot:'ch';
  o={n:nm+' ('+statTxt(st)+')',...st,c:pixelArt(it.sprite)||(slot=='sh'?ITEMS.sh.c:gearIcon(slot,c,Math.min(style,slot=='ri'||slot=='ne'?0:2))),g:1,v:{c,st:slot=='sh'?0:style}};gearType[it.id]=slot;o.fx=Array.isArray(it.effects)?it.effects:[]}
 o.bonuses=it.stats;o.bonusDuration=n(it.bonusDuration,5);
 o.itemSprite=pixelArt(it.itemSprite);
 o.equippedSprites=Object.fromEntries(Object.entries(it.equippedSprites||{}).map(([dir,art])=>[dir,pixelArt(art)]));
 o.tags=it.kind=='weapon'?weaponTags({...it,wt:o.wt}):lc(it.tags);ITEMS[it.id]=o;o.ic=o.c.toDataURL();
 if(it.drop!==false&&!GEARIDS.includes(it.id))GEARIDS.push(it.id)});
if(ITEMS.saw){ITEMS.saw.c=sawToolIcon();ITEMS.saw.ic=ITEMS.saw.c.toDataURL();ITEMS.saw.equippedSprite=sawToolSprite()}
for(const key of Object.keys(heroC))delete heroC[key];

/* ---------- passivas ---------- */
const PDEF={},PL={hp:'vida máx.',mp:'mana máx.',dmg:'dano',arm:'defesa física',magicArm:'defesa mágica',spd:'velocidade',moveSpeed:'movimento',attackSpeed:'velocidade de ataque'},PA={F:'Força',A:'Agilidade',I:'Inteligência'};
const passiveData=[...L('passives'),...L('skills').filter(s=>s.category=='passive')];
passiveData.forEach(s=>{
 if(!s.id)return;
 const auto=[...Object.keys(PL).filter(k=>n(s[k])).map(k=>(n(s[k])>0?'+':'')+n(s[k])+'% '+PL[k]),...Object.keys(PA).filter(k=>n(s[k])).map(k=>(n(s[k])>0?'+':'')+n(s[k])+' '+PA[k])].join(', ');
 PDEF[s.id]={n:s.name||s.id,t:s.desc||auto,stats:s.stats||{},hp:n(s.hp),mp:n(s.mp),dmg:n(s.dmg),arm:n(s.arm),magicArm:n(s.magicArm),spd:n(s.spd),moveSpeed:n(s.moveSpeed),attackSpeed:n(s.attackSpeed),F:n(s.F),A:n(s.A),I:n(s.I)}});

/* ---------- classes (builds) ---------- */
L('classes').forEach(c=>{
 if(!c.id)return;
 const isBase=!!CL[c.id],previousSkills=SKS[c.id]||[];
 const a=c.attrs||{},g=c.per||{},ps=c.passive||{},base=['war','mag','hea'].includes(c.base)?c.base:'war';
 const pl=(Array.isArray(c.passives)?c.passives:[]).map(r=>({d:PDEF[r.id],lv:Math.max(1,n(r.lv,1))})).filter(r=>r.d).sort((x,y)=>x.lv-y.lv);
 const sum=k=>pl.reduce((t,r)=>t+(p.lvl>=r.lv?n(r.d[k]):0),0);
 CL[c.id]={...CL[c.id],n:c.name||c.id,F:n(a.F,5)-3,A:n(a.A,5)-3,I:n(a.I,5)-3,perLevel:{F:n(g.F),A:n(g.A),I:n(g.I)},attackSpeed:Math.max(.1,n(c.attackSpeed,1)),
  get pDmg(){return pc(ps.dmg)+pc(sum('dmg'))},get pMp(){return pc(ps.mp)+pc(sum('mp'))},get passiveHp(){return pc(ps.hp)+pc(sum('hp'))},get pSpd(){return pc(ps.spd)+pc(sum('spd'))},
  get pArm(){return pc(ps.arm)+pc(sum('arm'))},get pMagicArm(){return pc(ps.magicArm)+pc(sum('magicArm'))},get pAttackSpeed(){return pc(ps.attackSpeed)+pc(sum('attackSpeed'))},get pMoveSpeed(){return pc(ps.moveSpeed)+pc(sum('moveSpeed'))},
  statBonus:k=>(!['F','A','I'].includes(k)?attributeValue(a,k)+attributeValue(g,k)*(p.lvl-1):0)+attributeValue(ps.stats,k)+pl.reduce((total,r)=>total+(p.lvl>=r.lv?attributeValue(r.d.stats,k):0),0),
  pa:k=>sum(k),plist:pl,passive:{n:ps.name||'',d:ps.desc||''},base,sprite:pixelArt(c.sprite)};
 const createdSkills=(Array.isArray(c.skills)?c.skills:[]).slice(0,6).map(r=>({d:SDEF[r.id],rank:Math.max(1,Math.min(10,n(r.rank,n(r.lv,1))))})).filter(r=>r.d).sort((x,y)=>x.rank-y.rank).map(r=>({...r.d,rank:r.rank,owner:c.id}));
 SKS[c.id]=createdSkills.length?createdSkills:previousSkills;
 HS[c.id]=HS[base];
});

const port=$('port');
if(port)port._tip=()=>{const c=CL[p.cls],ps=c.passive;return'<b>'+c.n+'</b>'+(ps&&ps.n?'<div class=tw>Passiva: '+ps.n+'</div><div>'+(ps.d||'')+'</div>':'')
 +(c.plist||[]).map(r=>'<div class=tw'+(p.lvl<r.lv?' style="opacity:.5"':'')+'>Passiva: '+r.d.n+(p.lvl<r.lv?' (nível '+r.lv+')':'')+'</div><div>'+r.d.t+'</div>').join('')};

/* ---------- monstros ---------- */
const CM={};
L('monsters').forEach(m=>{
 if(!m.id)return;
 const s=m.stats||{},base=SP[m.base]?m.base:'sl',classId=CL[m.classId]?m.classId:'war';
 const equipment=(Array.isArray(m.equipment)?m.equipment:[]).map(id=>D.items.find(it=>it.id==id)).filter(Boolean);
 const total={},weaponRanges=[];equipment.forEach(it=>{const stats={...it.stats},range=it.kind==='weapon'&&weaponDamageRange(it);if(range){stats.dmg=(range.min+range.max)/2;weaponRanges.push(range)}Object.keys(stats).forEach(k=>{total[k]=(total[k]||0)+n(stats[k])})});
 const weapon=equipment.find(it=>it.kind=='weapon')||null,createdSkills=(Array.isArray(m.skills)?m.skills:[]).map(id=>D.skills.find(k=>k.id==id)).filter(k=>k&&(!k.category||k.category=='ability')&&skillWeaponAllowed({wt:k.weaponTypes},weapon)).map(k=>({
  id:k.id,name:k.name||'Habilidade',cost:n(k.mana),cd:Math.max(.3,n(k.cd,3)),range:n(k.monRange)||(k.effect=='nova'?n(k.radius,30):weapon&&weapon.basic?n(weapon.basic.rng,30):30),damageModel:k.damageModel||'legacy',physicalFlat:n(k.physicalFlat),physicalPercent:n(k.physicalPercent),magicFlat:n(k.magicFlat),magicPercent:n(k.magicPercent),
  actionStats:k.actionStats,bonuses:k.bonuses,bonusDuration:n(k.bonusDuration,5),effect:k.effect,windup:.5,damage:n(k.base),per:n(k.per),charPercent:n(k.charPercent),effects:Array.isArray(k.effects)?k.effects:[],magic:k.damageType=='magic'||k.damageType!='physical'&&!!(weapon&&weapon.damageType=='magic'),radius:n(k.radius),flatDamage:true,scaleStat:k.scaleStat||'none',scalePercent:n(k.scalePercent,k.scaleStat&&k.scaleStat!='none'?100:0),vfx:k.vfx||'arcane',vfxColor:k.color||k.c2||'#9bd4ff'
 }));
 const sprite=pixelArt(m.sprite),sp=sprite?{d:sprite,u:sprite,s:sprite,ds:sprite,us:sprite,w:null}:null;
 MONSTER_TYPES[m.id]={name:m.name||m.id,stats:{F:n(s.F,5),A:n(s.A,3),I:n(s.I,3)},attributeStats:s,tags:lc(m.tags),custom:true,classId,sprite,sp,animation:m.animation,size:n(m.size,100),attackSpeed:n(m.attackSpeed),moveSpeed:n(m.moveSpeed),hpMult:n(m.hpMult)||1,dmgMult:n(m.dmgMult)||1,
  bossType:['boss','grandboss'].includes(m.bossType)?m.bossType:'normal',equipment:{stats:total,weaponRanges,weapon:weapon?{damageType:weapon.damageType=='magic'?'magic':'physical',basic:weapon.basic||{},effects:Array.isArray(weapon.effects)?weapon.effects:[]}:null},
  drops:Array.isArray(m.drops)?m.drops.filter(id=>ITEMS[id]):[],guaranteedDrops:Array.isArray(m.guaranteedDrops)?m.guaranteedDrops.filter(id=>ITEMS[id]):[],skills:createdSkills};
 const f=n(s.F,5),pow=weapon&&weapon.damageType=='magic'?n(s.I,3)*5:f*3;
 MB[m.id]={max:40+f*5,dmg:pow+n(total.dmg),spd:28+n(s.A,3)*.45,xp:n(m.xp,15),g:n(m.gold,5),aggro:n(m.aggro,65),wu:.4,ac:Math.max(.3,n(m.attackSpeed)||CL[classId].attackSpeed||1),base};
 if(m.id!='boss')CM[m.id]={min:n(m.minLevel,1),max:n(m.maxLevel,999),w:Math.max(.1,n(m.weight,1))}});
const ids=Object.keys(CM);
if(ids.length){
 pickType=function(far){
  const c=ids.filter(k=>k!='gob'&&CM[k].min<=p.lvl&&CM[k].max>=p.lvl);
  if(c.length&&Math.random()<Math.min(.6,.2*c.length)){let r=Math.random()*c.reduce((a,k)=>a+questSpawnWeight(k,CM[k].w),0);for(const k of c){r-=questSpawnWeight(k,CM[k].w);if(r<=0)return k}return c[0]}
  return far?'sk':'sl'};
 window.repop=()=>en.forEach(e=>{if(!e.boss&&e.hp>0)spawn(e)});
 repop()}
const questBoss=en.find(e=>e.boss);
if(questBoss&&MONSTER_TYPES.boss&&MONSTER_TYPES.boss.custom){configureMonster(questBoss,'boss',questBoss.lvl);questBoss.hp=questBoss.max}
applySkills();
})();
