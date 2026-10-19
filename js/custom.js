/* Conteúdo criado no Editor (../Editor): lê GAMEDATA (js/data.js) e registra classes, itens, habilidades e monstros. */
(function(){
// ícone no padrão (js/proporcao.js): desenho de outro tamanho é reduzido sem borrar e centralizado em 16×16
// ícone antigo de 8×8 (ainda não convertido pela Engine) dobra de tamanho; o de um item embutido volta ao desenho 16×16 dele
const icone16=(d,id)=>{const c=pixelArt(d);if(!c)return c;
 if(c.width<=8&&c.height<=8){if(id&&ITEMS[id]&&ITEMS[id].c)return ITEMS[id].c;const o=mkCanvas(16,16),x=o.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(c,8-c.width,8-c.height,c.width*2,c.height*2);return o}
 return (c.width!==16||c.height!==16)&&typeof ajustarArte==='function'?ajustarArte(c,16,16):c};
const D=typeof GAMEDATA!=='undefined'?GAMEDATA:{},L=k=>Array.isArray(D[k])?D[k]:[],n=(v,d=0)=>Number.isFinite(+v)&&v!==''&&v!=null?+v:d,pc=v=>n(v)/100,
 tags=v=>Array.isArray(v)?v.map(String):[],lc=a=>tags(a).map(s=>s.trim().toLowerCase()).filter(Boolean),
 weaponId=weaponTag,
 pw=()=>basic().damageType=='magic'?magicPower():physicalPower();

/* Monstros importados (js/pacote-monstros.js): entram no jogo mesmo antes de a Engine gravá-los no projeto, com um
   portal por grupo (os mesmos dados que engine/js/project.js criarMonstrosPacote grava).
   - monstro do pacote que o projeto guardou de uma versão antiga: usa o desenho novo;
   - monstros novos e portais: só se o projeto ainda não recebeu esta versão (quem apagou um não o recebe de volta). */
(()=>{const P=window.PACOTE_MONSTROS;if(!P)return;
 const proj=L('monsters'),recebeu=proj.some(m=>m&&m.pacote===P.versao),ids=new Set(proj.map(m=>m&&m.id));
 const lista=proj.map(m=>m&&m.pacote&&m.pacote!==P.versao&&P.MONSTROS[m.id]?{...m,sprite:P.MONSTROS[m.id].sprite,animation:P.MONSTROS[m.id].animation}:m);
 const novos=recebeu?[]:Object.values(P.MONSTROS).filter(m=>!ids.has(m.id)).map(m=>({id:m.id,name:m.nome,pacote:P.versao,ataqueDoNivel:true,base:'goblin',bossType:'normal',tags:[...(m.tags||[])],minLevel:m.nivel,maxLevel:999,weight:2,zone:'',
  stats:{...m.stats},per:{...m.per},xp:m.xp,gold:m.ouro,aggro:m.aggro,equipment:[],drops:[{id:'hp',chance:8}],skills:[],attackSpeed:m.atk,moveSpeed:m.vel,hpMult:m.hp,dmgMult:m.dano,sprite:m.sprite,animation:m.animation}));
 GAMEDATA.monsters=[...lista,...novos];
 if(recebeu)return;
 const tem=new Set(GAMEDATA.monsters.map(m=>m&&m.id));
 for(const [grupo,q] of Object.entries(P.PORTAIS||{})){
  if((PROJ.portalDefs||[]).some(d=>d&&d.id===q.id))continue;
  const ms=Object.values(P.MONSTROS).filter(m=>m.portal===grupo&&tem.has(m.id));if(!ms.length)continue;
  PROJ.portalDefs=[...(PROJ.portalDefs||[]),{id:q.id,name:q.nome,minLevel:q.nivel||1,targetLevel:10,frequency:1,monsters:ms.map(m=>({id:m.id,chance:Math.floor(100/ms.length),min:1,max:2,elite:10}))}]}})();

ITEMS.sw.wt='espada';ITEMS.sw2.wt='machado_2mao';ITEMS.sw3.wt='cajado';
/* arma do pacote (js/pacote-armas.js) de um tipo; as armas embutidas usam o desenho dela no ícone e na mão (mesma escala) */
const armaDoPacote=t=>{const A=window.PACOTE_ARMAS&&PACOTE_ARMAS.ARMAS;return A&&t?Object.values(A).find(a=>weaponTag(a.tag)===t)||null:null};
for(const [id,ataque] of [['sw','corte'],['sw2','pesado'],['sw3','vertical']]){const it=ITEMS[id],pk=armaDoPacote(it.wt);if(!pk)continue;
 it.c=pixelArt(pk.icone);it.ic=it.c.toDataURL();it.equippedSprite=pixelArt(pk.mao);it.pega=pk.pega;it.escalaMao=2;it.ataque=ataque}

/* ---------- habilidades ---------- */
if(L('effects').length){L('effects').forEach(e=>{FX_INFO[e.id]={...FX_INFO[e.id],...e,n:e.n||e.name||e.id,c:e.c||e.color||'#fff',kind:e.kind||'dot',tick:n(e.tick,1),dtype:['true','physical','magic'].includes(e.dtype)?e.dtype:'true'}})}
const FXATTR={F:'Força',A:'Agilidade',I:'Inteligência',physicalPower:'poder físico',magicPower:'poder mágico',dmg:'dano de equipamento',weaponPower:'poder da arma'};
const fxText=l=>Array.isArray(l)&&l.length?' '+l.filter(f=>FX_INFO[f.type]).map(f=>(f.chance==null||f.chance===''?100:f.chance)+'% de '+(f.target=='self'?'ganhar ':'causar ')+FX_INFO[f.type].n+' por '+(f.dur||3)+'s'+(fxKind(f.type)=='dot'?' ('+[n(f.power)||'',n(f.pct)?n(f.pct)+'% do dano'+(f.src=='physical'?' físico':f.src=='magic'?' mágico':''):'',n(f.attrPct)&&f.attr&&f.attr!='none'?n(f.attrPct)+'% de '+(FXATTR[f.attr]||f.attr):''].filter(Boolean).join(' + ')+' por '+(FX_INFO[f.type].tick==1?'segundo':FX_INFO[f.type].tick+'s')+')':fxKind(f.type)=='slow'?' (-'+n(f.power)+'% vel.)':fxKind(f.type)=='vuln'?' (+'+n(f.power)+'% dano recebido)':fxExtra(f))).join('; ')+'.':'';
const SDEF={};
// tempo de conjuração: o da habilidade; sem valor, projéteis levam 0,5 s e o resto é instantâneo
const CONJ_PROJETIL=.5,conj=s=>s.castTime!==undefined&&s.castTime!==''&&s.castTime!==null?Math.max(0,n(s.castTime)):s.effect=='projectile'?CONJ_PROJETIL:0;
function makeSkill(s){
 if(s.category&&s.category!='ability')return null;
 const split=(s.damageModel=='split'||hasSplitDamage(s))&&!['heal','guard','buff'].includes(s.effect),pv=()=>split?skillDamage(s):scaledDamage(s),hasDamage=()=>hasSplitDamage(s)||n(s.base)||n(s.per)||n(s.charPercent)||n(s.scalePercent),col=s.color||s.c2||'#fff',hl=n(s.heal)>0?()=>n(s.heal):undefined,r=n(s.radius,40),magic=skillMagic(s);let f,d;
 /* efeitos no golpe: os da habilidade e os da arma da mão principal (ex.: sangramento da arma também sai nas habilidades) */
 const dty=s.damageType=='physical'||s.damageType=='magic'?s.damageType:'weapon',proprios=Array.isArray(s.effects)?s.effects:[];
 const fx=()=>{const a=EQ.sw&&ITEMS[EQ.sw.id],l=[...proprios,...(a&&Array.isArray(a.fx)?a.fx:[])];return l.length?resolveFx(l,danoHabilidade(dty)):null};
 /* animações do pacote de efeitos (js/efeitos-sprite.js): animLancar ao lançar, animAcerto em cada inimigo atingido;
    animEscala = tamanho (0 = automático: o raio da área ou 1×) */
 const animL=window.EFX&&EFX.valido(s.animLancar)?s.animLancar:null,animA=window.EFX&&EFX.valido(s.animAcerto)?s.animAcerto:null,escA=n(s.animEscala);
 const tocar=(id,x,y,o={})=>{if(id)EFX.tocar(id,x,y,{dur:.35,...o,esc:Math.max(1,Math.round(o.esc||1))})}; // escala inteira: pixel do mesmo tamanho
 const alvos=(lista,cond)=>{for(const e of en)if(e.hp>0&&cond(e)&&linhaLivre(p,e)){hurtE(e,pv(),magic,fx());tocar(animA,e.x,e.y-8,{esc:escA||1})}};
 const P=()=>split?damageText(pv()):pv();
 // conjuração pela velocidade de ataque: % do intervalo do ataque básico (true dos dados antigos = 100%)
 const conjAtq=s.conjAtaque===true?100:Math.max(0,n(s.conjAtaque));
 const noArco=(e,a0,arco)=>{const a=Math.atan2(e.y-p.y,e.x-p.x);return Math.abs(Math.atan2(Math.sin(a-a0),Math.cos(a-a0)))<=arco};
 switch(s.effect){
  case'projectile':f=pr(pv,col,hl,{flat:true,magic,fx});d=()=>'Dispara um projétil teleguiado: '+P()+' de dano'+(hl?' e cura '+hl():'')+'.';break;
  case'nova':f=nova(r,pv,col,hl,{flat:true,magic,fx});d=()=>'Explosão ao redor ('+r+' px): '+P()+' de dano'+(hl?' e cura '+hl():'')+'.';break;
  case'blink':f=blink(hasDamage()?pv:null,{flat:true,magic,fx});d=()=>'Avança até 80 px na direção do mouse'+(hasDamage()?' e causa '+P()+' de dano a quem estiver perto':'')+'.';break;
  case'heal':f=()=>{heal(Math.round(pv()));if(n(s.mpRestore)>0)p.mp=Math.min(mmp(),p.mp+n(s.mpRestore))};d=()=>'Recupera '+Math.round(pv())+' de vida'+(n(s.mpRestore)>0?' e '+n(s.mpRestore)+' de mana':'')+'.';break;
  case'guard':f=guard;d=()=>'Por 6 s você recebe metade do dano.';break;
  case'buff':f=()=>{p.bf=n(s.base,8);ring(p.x,p.y,40,col,.5);ft(p.x,p.y-24,s.name+'!',col)};d=()=>'Por '+n(s.base,8)+' s aumenta o dano e a velocidade.';break;
  /* golpe corpo a corpo num arco à frente, no alcance da arma (Corte Horizontal). mira 'direcao' (padrão) = para onde
     o mouse aponta, sem alvo; mira 'alvo' = precisa de um inimigo e golpeia na direção dele */
  case'golpe':{const arco=n(s.arc,140)/2*Math.PI/180,alc=()=>Math.max(22,basic().rng||22)+10,porAlvo=s.mira==='alvo';
   const golpe=a0=>{if(s.vfx==='corte'&&window.VFX)VFX.tocar('corte',{x:p.x,y:p.y-8,ang:a0,raio:Math.round(alc()+8),arco:arco*2,cor:col});tocar(animL,p.x+Math.cos(a0)*alc()*.55,p.y-8+Math.sin(a0)*alc()*.55,{ang:a0+Math.PI/2,esc:escA||Math.max(1,alc()/20)});
    if(!animL&&s.vfx!=='corte')ring(p.x+Math.cos(a0)*12,p.y-6+Math.sin(a0)*12,14,col,.25);alvos(en,e=>dist(e,p)-(typeof targetReach=='function'?targetReach(e):0)<=alc()&&noArco(e,a0,arco))};
   f=porAlvo?Object.assign((w,t)=>golpe(Math.atan2(t.y-p.y,t.x-p.x)),{tg:1}):w=>golpe(Math.atan2(w.y-p.y,w.x-p.x));
   d=()=>'Golpe '+(porAlvo?'no alvo':'à frente, na direção do mouse')+' ('+n(s.arc,140)+'°, alcance da arma): '+P()+' de dano em quem estiver no arco.';break}
  // avança até o inimigo e golpeia (Investida com Escudo)
  case'investida':f=Object.assign((w,t)=>{const a=Math.atan2(t.y-p.y,t.x-p.x);let dd=Math.max(0,dist(p,t)-14);
    while(dd>0&&(!walk(p.x+Math.cos(a)*dd,p.y+Math.sin(a)*dd)||!campWallSegmentClear(p,{x:p.x+Math.cos(a)*dd,y:p.y+Math.sin(a)*dd})))dd=Math.max(0,dd-4);
    // corre até o alvo em alta velocidade (combat.js tickDash), com rastro; o golpe sai na chegada
    tocar(animL,p.x,p.y-8,{ang:a,esc:escA||1});const rastro=!s.vfx||s.vfx==='investida'||s.vfx==='arcane';
    p.dash={x0:p.x,y0:p.y,x1:p.x+Math.cos(a)*dd,y1:p.y+Math.sin(a)*dd,t:0,dur:Math.max(.05,dd/Math.max(60,n(s.velocidade,420))),dir:{x:Math.cos(a),y:Math.sin(a)},rastro,
     fim:()=>withWeaponDamageRoll(()=>{if(hasDamage()||proprios.length)alvos(en,e=>e===t);if(rastro&&window.VFX&&t.hp>0)VFX.tocar('impacto',{x:(p.x+t.x)/2,y:(p.y+t.y)/2-8});else if(!animA)ring(p.x,p.y,18,col,.4)})};
    p.dest=null;p.path=[];p.fx=Math.cos(a);p.fy=Math.sin(a)},{tg:1});
   d=()=>'Corre até o alvo (até '+n(s.alcance,120)+' px, '+n(s.velocidade,420)+' px/s)'+(hasDamage()?' e causa '+P()+' de dano na chegada':'')+'.';break;
  // grito: os efeitos valem para você e para os aliados na área (online.js leva aos outros jogadores)
  case'aura':f=()=>{const raio=r*areaMultiplier(p);applyFx(p,resolveFx(proprios.map(e=>({...e,target:'self'})),0));tocar(animL,p.x,p.y-8,{esc:escA||Math.min(3,raio*2/24),dur:.5});
    if(s.vfx==='aura'&&window.VFX){VFX.tocar('grito',{x:p.x,y:p.y-4,raio:Math.round(raio),cor:col});for(let i=0;i<24;i++)VFX.faisca(p.x+(Math.random()-.5)*16,p.y-Math.random()*20,col)}else ring(p.x,p.y,raio,col,.5);
    // aliados online perto também ficam com a aura/contorno na minha tela (online.js)
    if(window.marcarAura)marcarAura(p.x,p.y,raio,col,Math.max(...proprios.map(e=>n(e.dur,3)),1));ft(p.x,p.y-30,(s.name||'')+'!',col)};
   d=()=>'Vale para você e para os aliados a até '+r+' px.';break;
  // girar: golpes em área a cada intervalo enquanto dura (combat.js tickCanal); a animação de lançar toca a cada golpe
  case'canal':{const dur=Math.max(.2,n(s.duracao,5)),tick=Math.max(.2,n(s.intervalo,1));
   f=()=>{p.canal={r:dur+.05,tick,prox:0,n:Math.max(1,Math.round(dur/tick)),ang:Math.atan2(p.fy||1,p.fx||0),visual:s.vfx==='giro'?{raio:Math.round(r*areaMultiplier(p)),cor:col}:null,golpe:()=>withWeaponDamageRoll(()=>{const raio=r*areaMultiplier(p);if(animL)tocar(animL,p.x,p.y-8,{esc:escA||Math.min(3,raio*2/24),dur:Math.min(tick,.6)});else if(s.vfx!=='giro')ring(p.x,p.y,raio,col,.3);alvos(en,e=>dist(e,p)<raio)})}};
   d=()=>'Gira por '+dur+' s: '+P()+' de dano em área ('+r+' px) a cada '+tick+' s. Dá para andar; sem ataque básico enquanto gira.';break}
  case'meteor':f=Object.assign(w=>mets.push({x:w.x,y:w.y,t:.9,radius:r*areaMultiplier(p),dmg:pv(),magic,fx:fx&&fx()}),{mira:1});d=()=>'Chama um meteoro no local do mouse: '+P()+' de dano em área.';break;
  default:return null}
 if(['heal','guard','buff'].includes(s.effect)&&(n(s.actionStats?.physicalDmg)||n(s.actionStats?.magicDmg))){
  const perform=f;f=(w,t)=>{perform(w,t);for(const enemy of en)if(enemy.hp>0&&dist(enemy,p)<r*areaMultiplier(p)&&linhaLivre(p,enemy))hurtE(enemy,{physical:Math.max(0,n(s.actionStats.physicalDmg)),magic:Math.max(0,n(s.actionStats.magicDmg))},false,fx&&fx())};
 }
 if(animL&&!['golpe','investida','aura','canal'].includes(s.effect)){const f0=f,tg=f0.tg,mi=f0.mira;f=(w,t)=>{tocar(animL,p.x,p.y-8,{esc:escA||(['nova','heal'].includes(s.effect)?r*2/24:1)});return f0(w,t)};if(tg)f.tg=tg;if(mi)f.mira=mi}
 const sprite=pixelArt(s.sprite),dd=d,dmgTag=()=>skillMagic(s)?'mágico':'físico';d=()=>dd().replace(/ de dano/g,' de dano '+(split?'':dmgTag()))+fxText(s.effects)+(attributeText(s.actionStats)?' Ação: '+attributeText(s.actionStats)+'.':'')+(attributeText(s.bonuses)?' Bônus: '+attributeText(s.bonuses)+'.':'');
 return{id:s.id,category:s.category||'ability',n:s.name||s.id,effect:s.effect,radius:r,mana:n(s.mana),cd:Math.max(.3,n(s.cd,3)),castTime:conj(s),actionStats:s.actionStats,bonuses:s.bonuses,bonusDuration:n(s.bonusDuration,5),ic:sprite?sprite.toDataURL():SKI(s.icon||'orb',s.c1||'#4a6a96',s.c2||'#fff'),f,conjAtaque:conjAtq,efs:s.effect=='aura'?proprios:null,alcance:s.effect=='golpe'?()=>Math.max(22,basic().rng||22)+14:s.effect=='investida'?()=>n(s.alcance,120):null,d:s.desc?()=>s.desc+' ('+d()+')':d,wt:lc(s.weaponTypes).map(weaponTag),tags:tags(s.tags),cross:!!s.cross,vfx:s.vfx||'arcane',vfxColor:col}}
L('skills').forEach(s=>{const o=makeSkill(s);if(o)SDEF[s.id]=o});

/* ---------- itens ---------- */
L('items').forEach(it=>{
 if(!it.id)return;
 const st={};Object.keys(ITEM_STATS).forEach(k=>{const v=n(it.stats&&it.stats[k]);if(v)st[k]=ITEM_STATS[k].percent?v/100:v});
 const c=[it.c1||'#9aa7b8',it.c2||'#c9a227'],style=Math.max(0,Math.min(2,n(it.style))),nm=it.name||it.id;let o;
 if(it.kind=='material'){
  o={n:nm,material:true,stackable:true,c:icone16(it.sprite,it.id)||woodIcon(it.id=='magicWood')}
 }
 else if(it.kind=='consumable'){
  const h={hp:n(it.healHp),mp:n(it.healMp)};
  o={n:nm+' ('+[h.hp&&'cura '+h.hp,h.mp&&'+'+h.mp+' mana'].filter(Boolean).join(', ')+')',use:1,heal:h,c:icone16(it.sprite,it.id)||potion(c[0],shade(c[0],1.4),shade(c[0],.55))}}
 else if(it.kind=='weapon'){
  const wtype=weaponId(it.wtype),twoHanded=!!it.twoHanded||['espada_grande','cajado','machado_2mao','martelo_2mao'].includes(wtype);
  // um item com dano inválido não pode impedir o jogo de abrir: avisa e usa os valores em ordem
  let range;try{range=weaponDamageRange(it)}catch(e){const a=Math.max(0,Math.round(+it.damageMin||0)),b=Math.max(0,Math.round(+it.damageMax||0));range={min:Math.min(a,b),max:Math.max(a,b)};console.warn('Arma "'+(it.name||it.id)+'": '+e.message+' Usando '+range.min+' - '+range.max+'.')}
  if(range)st.dmg=(range.min+range.max)/2;
  o={n:nm+' ('+(range?'dano '+range.min+' - '+range.max+(statTxt({...st,dmg:0})?', '+statTxt({...st,dmg:0}):''):statTxt(st))+')',...st,...(range?{damageMin:range.min,damageMax:range.max}:{}),c:icone16(it.sprite,it.id)||weaponIcon(style,c),g:1,v:{c,st:style},wt:wtype,th:twoHanded,equippedSprite:pixelArt(it.equippedSprite)};
  gearType[it.id]='sw';
  /* ícone e mão na mesma escala (js/pacote-armas.js): arma do pacote ainda com o ícone grande antigo usa o desenho da mão;
     arma sem desenho nenhum usa a do pacote do mesmo tipo */
  const pk=armaDoPacote(wtype);
  if(pk&&it.pacote==='armas-v1'&&it.sprite&&it.sprite.pixels===pk.iconeAntigo.pixels)o.c=pixelArt(pk.icone);
  if(pk&&!it.sprite&&!it.equippedSprite){o.c=pixelArt(pk.icone);o.equippedSprite=pixelArt(pk.mao);if(it.pega==null||it.pega==='')o.pega=pk.pega}
  // pose e golpe na mão (js/sprites.js POSES_ARMA): escolhido na Engine ou pelo tipo da arma
  const ATAQUE_PADRAO={espada_grande:'pesado',machado_2mao:'pesado',martelo_2mao:'pesado',adaga:'estocada',lanca:'estocada',cajado:'vertical',arco:'arco',besta:'besta',manopla:'soco',escudo:'escudo',orbe:'orbe',vara:'varinha',varinha:'varinha'};
  o.ataque=POSES_ARMA[it.ataque]?it.ataque:ATAQUE_PADRAO[wtype]||'corte';
  if(it.pega!=null&&it.pega!=='')o.pega=Math.max(0,Math.min(1,+it.pega/100));
  o.escalaMao=2; // padrão de proporção: na mão, 1 pixel do desenho = 1 pixel do herói
  // desenho antigo (feito para outra escala, ainda não convertido pela Engine): reduz para a altura que ele tinha na mão
  if(+it.escalaMao!==2&&o.equippedSprite&&typeof reduzirArte==='function'){const e=o.equippedSprite,alvo=style==2?20:style==1?14:16,k=Math.min(1,alvo/e.height);if(k<1)o.equippedSprite=reduzirArte(e,e.width*k,e.height*k)}
  /* ataque básico: configurado na própria arma (it.basic). Projetos antigos ligavam uma habilidade da
     categoria "basic" (basic.skillId); a Engine move esses dados para a arma, mas o jogo ainda lê os dois. */
  const b0=it.basic||{},basicSkill=b0.skillId?L('skills').find(s=>s.id==b0.skillId&&s.category=='basic'):null;
  const b=basicSkill?{...basicSkill,ranged:!!basicSkill.isRanged,rng:basicSkill.basicRange,proj:basicSkill.projectileColor}
   :{...b0,base:b0.base??b0.flat,charPercent:b0.charPercent??b0.pct,scaleStat:b0.scaleStat||b0.attr,scalePercent:b0.scalePercent??b0.attrPct};
  const ranged=!!b.ranged;
  const damageType=it.damageType=='magic'?'magic':'physical';
  const basicFx=[...(Array.isArray(b.effects)?b.effects:[]),...(Array.isArray(it.effects)?it.effects:[])];
  // o golpe usa só o dano da arma (sem fórmula própria de ataque básico); da configuração antiga valem alcance e projétil
  BASIC[it.id]={n:nm,rng:n(b.rng,22),dm:1,damageType,formula:null,splitDamage:false,effects:basicFx,
   ic:o.c.toDataURL(),
   t:'Golpe com '+nm+(ranged?', à distância':'')+'. Dano '+(damageType=='magic'?'mágico':'físico')+' da arma.'+fxText(basicFx),
   // som do golpe: o da arma (Sons › Ataque básico); projetos antigos usam o da habilidade
   som:basicSkill?['skills',basicSkill.id,'cast']:['items',it.id,'attack'],
   ...(ranged?{proj:b.proj||'#fff'}:{})};
  // até duas habilidades por arma (espaços Z e X)
  WSK[it.id]=tags(it.skills).slice(0,2).map(id=>SDEF[id]).filter(s=>s&&s.category=='ability').map(s=>({...s}))}
 else{
  const slot=['he','ch','le','bo','ca','ne','ri','sh'].includes(it.slot)?it.slot:'ch';
  o={n:nm+' ('+statTxt(st)+')',...st,c:icone16(it.sprite,it.id)||(slot=='sh'?ITEMS.sh.c:gearIcon(slot,c,Math.min(style,slot=='ri'||slot=='ne'?0:2))),g:1,v:{c,st:slot=='sh'?0:style}};gearType[it.id]=slot;o.fx=Array.isArray(it.effects)?it.effects:[]}
 o.bonuses=it.stats;o.bonusDuration=n(it.bonusDuration,5);
 // preço de venda na taverna (Engine › Item › Preço de venda); vazio = calculado pelos atributos
 if(it.price!==undefined&&it.price!==''&&it.price!==null&&Number.isFinite(+it.price))o.price=Math.max(0,Math.round(+it.price));
 o.itemSprite=pixelArt(it.itemSprite);

 o.equippedSprites=Object.fromEntries(Object.entries(it.equippedSprites||{}).map(([dir,art])=>[dir,pixelArt(art)]));
 // animação vestida/empunhada (d, u, s e w = arma na mão): quadros Parado/Andando/Atacando
 const anims=Object.entries(it.equippedAnim||{}).map(([dir,a])=>{if(!a||typeof a!='object')return null;const q=k=>(Array.isArray(a[k])?a[k]:[]).map(pixelArt).filter(Boolean),r={idle:q('idle'),walk:q('walk'),attack:q('attack'),durations:{...a.durations},interval:a.interval};return r.idle.length||r.walk.length||r.attack.length?[dir,r]:null}).filter(Boolean);
 if(anims.length)o.equippedAnim=Object.fromEntries(anims);
 o.tags=it.kind=='weapon'?weaponTags({...it,wt:o.wt}):lc(it.tags);ITEMS[it.id]=o;o.ic=o.c.toDataURL()});
if(ITEMS.saw){ITEMS.saw.c=sawToolIcon();ITEMS.saw.ic=ITEMS.saw.c.toDataURL();ITEMS.saw.equippedSprite=typeof reduzirArte==='function'?reduzirArte(sawToolSprite(),14,6):sawToolSprite();ITEMS.saw.escalaMao=2} // na mão no padrão: 1 pixel = 1 pixel do herói
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
 const previousSkills=SKS[c.id]||[];
 const a=c.attrs||{},g=c.per||{},ps=c.passive||{},base=['war','mag','hea'].includes(c.base)?c.base:'war';
 /* passiva da classe: libera no rank da classe (rank) ou, em dados antigos, no nível do personagem (lv) */
 const pl=(Array.isArray(c.passives)?c.passives:[]).map(r=>({d:PDEF[r.id],lv:Math.max(1,n(r.lv,1)),rank:n(r.rank)})).filter(r=>r.d).sort((x,y)=>(x.rank||x.lv)-(y.rank||y.lv));
 pl.forEach(r=>{r.on=()=>r.rank?classRank(c.id)>=r.rank:p.lvl>=r.lv});
 const sum=k=>pl.reduce((t,r)=>t+(r.on()?n(r.d[k]):0),0);
 CL[c.id]={...CL[c.id],n:c.name||c.id,F:n(a.F,5)-3,A:n(a.A,5)-3,I:n(a.I,5)-3,perLevel:{F:n(g.F),A:n(g.A),I:n(g.I)},attackSpeed:Math.max(.1,n(c.attackSpeed,1)),
  get pDmg(){return pc(ps.dmg)+pc(sum('dmg'))},get pMp(){return pc(ps.mp)+pc(sum('mp'))},get passiveHp(){return pc(ps.hp)+pc(sum('hp'))},get pSpd(){return pc(ps.spd)+pc(sum('spd'))},
  get pArm(){return pc(ps.arm)+pc(sum('arm'))},get pMagicArm(){return pc(ps.magicArm)+pc(sum('magicArm'))},get pAttackSpeed(){return pc(ps.attackSpeed)+pc(sum('attackSpeed'))},get pMoveSpeed(){return pc(ps.moveSpeed)+pc(sum('moveSpeed'))},
  statBonus:k=>(!['F','A','I'].includes(k)?attributeValue(a,k)+attributeValue(g,k)*(p.lvl-1):0)+attributeValue(ps.stats,k)+pl.reduce((total,r)=>total+(r.on()?attributeValue(r.d.stats,k):0),0),
  pa:k=>sum(k),plist:pl,passive:{n:ps.name||'',d:ps.desc||''},base,sprite:pixelArt(c.sprite),
  kit:(Array.isArray(c.kit)?c.kit:[]).filter(r=>r&&ITEMS[r.id]).map(r=>({id:r.id,n:Math.max(1,Math.floor(n(r.n,1)))}))};
 const createdSkills=(Array.isArray(c.skills)?c.skills:[]).slice(0,6).map(r=>({d:SDEF[r.id],rank:Math.max(1,Math.min(10,n(r.rank,n(r.lv,1))))})).filter(r=>r.d).sort((x,y)=>x.rank-y.rank).map(r=>({...r.d,rank:r.rank,owner:c.id}));
 SKS[c.id]=createdSkills.length?createdSkills:previousSkills;
 HS[c.id]=HS[base];
});

const port=$('port');
if(port)port._tip=()=>{const c=CL[p.cls],ps=c.passive;return'<b>'+c.n+'</b>'+(ps&&ps.n?'<div class=tw>Passiva: '+ps.n+'</div><div>'+(ps.d||'')+'</div>':'')
 +(c.plist||[]).map(r=>'<div class=tw'+(!r.on()?' style="opacity:.5"':'')+'>Passiva: '+r.d.n+(!r.on()?r.rank?' (rank '+r.rank+')':' (nível '+r.lv+')':'')+'</div><div>'+r.d.t+'</div>').join('')};

/* ---------- monstros ---------- */
/* Drops: [{id, chance}] com chance em % (cada item é sorteado sozinho). O formato antigo (lista de ids
   dividindo a chance base + drops garantidos) vira o mesmo resultado em %. Não existe mais tabela padrão. */
function normDrops(m){
 const out={},put=(id,c)=>{if(ITEMS[id])out[id]=Math.max(out[id]||0,Math.max(0,Math.min(100,+c||0)))};
 const lista=Array.isArray(m.drops)?m.drops:[],g=Array.isArray(m.guaranteedDrops)?m.guaranteedDrops:[];
 const velhos=lista.filter(x=>typeof x=='string'&&!g.includes(x)),bn=m.bossType=='grandboss'?.4:m.bossType=='boss'?.2:0;
 velhos.forEach(id=>put(id,.22*(1+bn)/velhos.length*100)); // lista antiga (sem %): 22% divididos entre os itens
 g.forEach(id=>put(id,100));
 lista.forEach(x=>{if(x&&typeof x=='object')put(x.id,x.chance)});
 return Object.entries(out).filter(([,c])=>c>0).map(([id,chance])=>({id,chance}));
}
const CM={};
/* projeto ainda não convertido pela Engine (padrão de proporção, js/proporcao.js): desenho com "Tamanho" menor que 100%,
   em 2× ou em resolução dobrada é reduzido na hora, para os pixels ficarem do tamanho dos do herói */
const fatorMonstro=m=>{const s=m.sprite;if(!s||!s.w||m.pacote||(PROJETO.mundo&&PROJETO.mundo.proporcaoV>=1))return 1;const chefe=['boss','grandboss'].includes(m.bossType);return +m.size>0&&+m.size<100?+m.size/100:s.q===2?.5:!chefe&&(s.w>48||s.h>40)?.5:1};
const reduzido=(d,k)=>{const c=pixelArt(d);if(!c||k>=1||typeof reduzirArte!=='function')return c;const r=reduzirArte(c,c.width*k,c.height*k);if(c.pad)r.pad=Math.round(c.pad*k);return r};
L('monsters').forEach(m=>{
 if(!m.id)return;
 const s=m.stats||{},base=SP[m.base]?m.base:'sl',atk=n(m.attackSpeed)||(CL[m.classId]&&CL[m.classId].attackSpeed)||1; /* sem classe base: intervalo de ataque do próprio monstro (projetos antigos: o da classe que ele tinha) */
 const equipment=(Array.isArray(m.equipment)?m.equipment:[]).map(id=>D.items.find(it=>it.id==id)).filter(Boolean);
 const total={},weaponRanges=[];equipment.forEach(it=>{const stats={...it.stats},range=it.kind==='weapon'&&weaponDamageRange(it);if(range){stats.dmg=(range.min+range.max)/2;weaponRanges.push(range)}Object.keys(stats).forEach(k=>{total[k]=(total[k]||0)+n(stats[k])})});
 // dano do ataque básico do próprio monstro (Engine › Ataque básico): mínimo–máximo sorteado a cada golpe, como o de uma arma
 let basico=null;try{basico=weaponDamageRange(m)}catch(e){console.warn('Monstro "'+(m.name||m.id)+'": dano do ataque básico inválido ('+e.message+')')}
 if(basico&&!m.ataqueDoNivel){total.dmg=(total.dmg||0)+(basico.min+basico.max)/2;weaponRanges.push(basico)} // com ataqueDoNivel o dano vem da tabela do nível (state.js)
 const weapon=equipment.find(it=>it.kind=='weapon')||null,createdSkills=(Array.isArray(m.skills)?m.skills:[]).map(id=>D.skills.find(k=>k.id==id)).filter(k=>k&&(!k.category||k.category=='ability')&&skillWeaponAllowed({wt:k.weaponTypes},weapon)).map(k=>({
  id:k.id,name:k.name||'Habilidade',cost:n(k.mana),cd:Math.max(.3,n(k.cd,3)),range:n(k.monRange)||(k.effect=='nova'?n(k.radius,30):weapon&&weapon.basic?n(weapon.basic.rng,30):30),damageModel:k.damageModel||'legacy',physicalFlat:n(k.physicalFlat),physicalPercent:n(k.physicalPercent),magicFlat:n(k.magicFlat),magicPercent:n(k.magicPercent),
  actionStats:k.actionStats,bonuses:k.bonuses,bonusDuration:n(k.bonusDuration,5),effect:k.effect,windup:conj(k)>0?conj(k):.5,damage:n(k.base),per:n(k.per),charPercent:n(k.charPercent),effects:Array.isArray(k.effects)?k.effects:[],magic:k.damageType=='magic'||k.damageType!='physical'&&!!(weapon&&weapon.damageType=='magic'),radius:n(k.radius),flatDamage:true,scaleStat:k.scaleStat||'none',scalePercent:n(k.scalePercent,k.scaleStat&&k.scaleStat!='none'?100:0),vfx:k.vfx||'arcane',vfxColor:k.color||k.c2||'#9bd4ff'
 }));
 const k=fatorMonstro(m),sprite=reduzido(m.sprite,k),sp=sprite?{d:sprite,u:sprite,s:sprite,ds:sprite,us:sprite,w:null}:null;
 const animation=k<1&&m.animation?{...m.animation,...Object.fromEntries(['idle','walk','attack'].map(a=>[a,(m.animation[a]||[]).map(f=>reduzido(f,k)).filter(Boolean)]))}:m.animation;
 MONSTER_TYPES[m.id]={name:m.name||m.id,stats:{F:n(s.F,5),A:n(s.A,3),I:n(s.I,3)},attributeStats:s,perLevel:m.per&&typeof m.per=='object'?m.per:null,tags:lc(m.tags),custom:true,ataqueDoNivel:!!m.ataqueDoNivel,sprite,sp,animation,size:n(m.size,100),attackSpeed:atk,moveSpeed:n(m.moveSpeed),hpMult:n(m.hpMult)||1,dmgMult:n(m.dmgMult)||1,
  bossType:['boss','grandboss'].includes(m.bossType)?m.bossType:'normal',equipment:{stats:total,weaponRanges,weapon:weapon?{damageType:weapon.damageType=='magic'?'magic':'physical',basic:weapon.basic||{},effects:Array.isArray(weapon.effects)?weapon.effects:[]}:null},
  drops:normDrops(m),skills:createdSkills,
  // chefe com mecânicas (js/chefes.js) e fúria abaixo de X% da vida
  mecanicas:Array.isArray(m.mecanicas)&&m.mecanicas.length?m.mecanicas.filter(x=>x&&x.tipo):null,furia:n(m.furia)};
 const f=n(s.F,5),pow=weapon&&weapon.damageType=='magic'?n(s.I,3)*5:f*3;
 MB[m.id]={max:40+f*5,dmg:pow+n(total.dmg),spd:28+n(s.A,3)*.45,xp:n(m.xp,15),g:n(m.gold,5),aggro:n(m.aggro,65),wu:.4,ac:Math.max(.3,atk),base};
 if(m.id!='boss'&&!['boss','grandboss'].includes(m.bossType))CM[m.id]={min:n(m.minLevel,1),max:n(m.maxLevel,999),w:Math.max(.1,n(m.weight,1))}});
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
