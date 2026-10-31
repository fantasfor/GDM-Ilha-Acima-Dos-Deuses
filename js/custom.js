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
/* equipamentos gerados pelo plano (pacote equip-v1, nomes com números romanos I a V) saíram do jogo (pedido do usuário, 2026-10-23),
   mesmo antes de a Engine salvar a limpeza (mundo.ajustesV 12); itens criados à mão (sem pacote) e os outros pacotes ficam */
if(!MODO.motor&&Array.isArray(D.items))D.items=D.items.filter(i=>!(i&&i.pacote==='equip-v1'));

/* Monstros importados (js/pacote-monstros.js): entram no jogo mesmo antes de a Engine gravá-los no projeto, com um
   portal por grupo (os mesmos dados que engine/js/project.js criarMonstrosPacote grava).
   - monstro do pacote que o projeto guardou de uma versão antiga: usa o desenho novo;
   - monstros novos e portais: só se o projeto ainda não recebeu esta versão (quem apagou um não o recebe de volta). */
(()=>{const P=window.PACOTE_MONSTROS;if(!P)return;
 const proj=L('monsters'),recebeu=proj.some(m=>m&&m.pacote===P.versao),ids=new Set(proj.map(m=>m&&m.id));
 const lista=proj.map(m=>m&&m.pacote&&m.pacote!==P.versao&&P.MONSTROS[m.id]?{...m,sprite:P.MONSTROS[m.id].sprite,animation:P.MONSTROS[m.id].animation}:m);
 const novos=recebeu?[]:Object.values(P.MONSTROS).filter(m=>!ids.has(m.id)).map(m=>({id:m.id,name:m.nome,pacote:P.versao,ataqueDoNivel:true,base:'goblin',bossType:'normal',tags:[...(m.tags||[])],minLevel:m.nivel,maxLevel:m.nivelMax||999,weight:2,zone:'',
  stats:{...m.stats},per:{...m.per},xp:m.xp,gold:m.ouro,aggro:m.aggro,equipment:[],drops:[{id:'hp',chance:8},{id:'mp',chance:5}],skills:[],attackSpeed:m.atk,moveSpeed:m.vel,hpMult:1,dmgMult:1,sprite:m.sprite,animation:m.animation}));
 GAMEDATA.monsters=[...lista,...novos];
 if(recebeu)return;
 const tem=new Set(GAMEDATA.monsters.map(m=>m&&m.id));
 for(const [grupo,q] of Object.entries(P.PORTAIS||{})){
  if((PROJ.portalDefs||[]).some(d=>d&&d.id===q.id))continue;
  const ms=Object.values(P.MONSTROS).filter(m=>m.portal===grupo&&tem.has(m.id));if(!ms.length)continue;
  PROJ.portalDefs=[...(PROJ.portalDefs||[]),{id:q.id,name:q.nome,minLevel:q.nivel||1,targetLevel:10,frequency:1,monsters:ms.map(m=>({id:m.id,chance:Math.floor(100/ms.length),min:1,max:2,elite:10}))}]}})();

/* Gosma redesenhada (js/arte-gosma.js, parado/andando/atacando): vale até a Engine gravar no projeto (mundo.ajustesV 10) */
(()=>{const A=window.ARTE_GOSMA;if(!A||+(PROJETO.mundo&&PROJETO.mundo.ajustesV)>=10)return;GAMEDATA.monsters=GAMEDATA.monsters.map(m=>m&&m.id==='sl'?{...m,sprite:A.sprite,animation:A.animation}:m)})();
/* arte nova (js/arte-criaturas.js) antes de a Engine gravar (mundo.ajustesV 11): Esqueleto e Esqueleto do Serrote redesenhados,
   Guardião = Glooc Saqueador; os esqueletos do pacote Dark saem */
(()=>{const A=window.ARTE_CRIATURAS;if(!A||+(PROJETO.mundo&&PROJETO.mundo.ajustesV)>=11)return;
 const arte={sk:['esqueleto_comum','Esqueleto'],gob:['esqueleto_serrote','Esqueleto do Serrote'],boss:['glooc_machadinha','Glooc Saqueador']};
 GAMEDATA.monsters=GAMEDATA.monsters.filter(m=>!(m&&['esqueleto_sombrio','esqueleto_palido'].includes(m.id))).map(m=>{const a=m&&arte[m.id],d=a&&A[a[0]];return d?{...m,name:a[1],sprite:d.sprite,animation:d.animation}:m})})();
/* Morcego, Aranha, Caranguejo, Fantasma, Broto Vivo e Lorde Goblin saíram do jogo (pedido do usuário, 2026-10-23), mesmo antes
   de a Engine gravar (mundo.ajustesV 13). A madeira da missão passa a cair do Toco Vivo. */
(()=>{const FORA=['bat','spider','crab','ghost','sprout','goblinBoss'],broto=GAMEDATA.monsters.find(m=>m&&m.id==='sprout');
 GAMEDATA.monsters=GAMEDATA.monsters.filter(m=>!(m&&FORA.includes(m.id)));
 const toco=GAMEDATA.monsters.find(m=>m&&m.id==='toco_vivo');
 if(toco&&broto&&!(toco.drops||[]).some(d=>d&&d.id==='wood'))GAMEDATA.monsters=GAMEDATA.monsters.map(m=>m===toco?{...m,drops:[...(broto.drops||[]).filter(d=>d&&(d.id==='wood'||d.id==='magicWood')),...(m.drops||[])]}:m)})();
/* vistas de frente e de costas (2026-10-23) das criaturas desenhadas no jogo, antes de a Engine gravar (mundo.ajustesV 12):
   só quando o desenho de lado do projeto ainda é o da arte (quem trocou o desenho não ganha vistas que não combinam) */
(()=>{const A=window.ARTE_CRIATURAS||{},M={sl:window.ARTE_GOSMA,sk:A.esqueleto_comum,gob:A.esqueleto_serrote,boss:A.glooc_machadinha};
 const arteDe=id=>M[id]||A[id];
 GAMEDATA.monsters=GAMEDATA.monsters.map(m=>{if(!m||m.direcoes)return m;const d=arteDe(m.id),q=m.animation&&m.animation.idle&&m.animation.idle[0];
  return d&&d.direcoes&&q&&d.animation.idle[0].pixels===q.pixels?{...m,direcoes:d.direcoes}:m})
 /* desenho novo em camadas (2026-10-23, 4 posições) de Lobos, Glooc e Esqueletos: vale até a Engine gravar (mundo.ajustesV 13) */
 if(+(PROJETO.mundo&&PROJETO.mundo.ajustesV)>=13)return;
 const NOVOS={...M,rei_esqueleto_covil:A.esqueleto_rei};delete NOVOS.sl;
 for(const k of Object.keys(A))if(/^(lobo_|glooc_|esqueleto_|javaporco)/.test(k))NOVOS[k]=A[k];
 GAMEDATA.monsters=GAMEDATA.monsters.map(m=>{const d=m&&NOVOS[m.id];return d&&d.direcoes?{...m,sprite:d.sprite,animation:d.animation,direcoes:d.direcoes}:m})})();
/* esqueletos de lado corrigidos (2026-10-24: bacia e pés): valem até a Engine gravar (mundo.ajustesV 16) */
(()=>{const A=window.ARTE_CRIATURAS;if(!A||+(PROJETO.mundo&&PROJETO.mundo.ajustesV)>=16)return;
 const E={sk:A.esqueleto_comum,gob:A.esqueleto_serrote,rei_esqueleto_covil:A.esqueleto_rei};
 GAMEDATA.monsters=GAMEDATA.monsters.map(m=>{const d=m&&(E[m.id]||(/^esqueleto_/.test(m.id)?A[m.id]:null));return d&&d.direcoes?{...m,sprite:d.sprite,animation:d.animation,direcoes:{...(m.direcoes||{}),esquerda:d.direcoes.esquerda}}:m})})();
ITEMS.sw.wt='espada';ITEMS.sw2.wt='machado_2mao';ITEMS.sw3.wt='cajado';
/* arma do pacote (js/pacote-armas.js) de um tipo; as armas embutidas usam o desenho dela no ícone e na mão (mesma escala) */
const armaDoPacote=t=>{const A=window.PACOTE_ARMAS&&PACOTE_ARMAS.ARMAS;return A&&t?Object.values(A).find(a=>weaponTag(a.tag)===t)||null:null};
for(const [id,ataque] of [['sw','corte'],['sw2','pesado'],['sw3','vertical']]){const it=ITEMS[id],pk=armaDoPacote(it.wt);if(!pk)continue;
 it.c=pixelArt(pk.icone);it.ic=it.c.toDataURL();it.equippedSprite=pixelArt(pk.mao);it.pega=pk.pega;it.escalaMao=2;it.ataque=ataque}

/* ---------- habilidades ---------- */
if(L('effects').length){L('effects').forEach(e=>{FX_INFO[e.id]={...FX_INFO[e.id],...e,n:e.n||e.name||e.id,c:e.c||e.color||'#fff',kind:e.kind||'dot',tick:n(e.tick,1),dtype:['true','physical','magic'].includes(e.dtype)?e.dtype:'true'}})}
const FXATTR={F:'Força',A:'Agilidade',I:'Inteligência',physicalPower:'poder físico',magicPower:'poder mágico',dmg:'dano de equipamento',weaponPower:'poder da arma'};
/* valores de um efeito de arma/habilidade para os textos: os que acumulam (veneno, sangramento, lentidão…) usam só a
   configuração do efeito (combat.js resolveFx); os outros, a da arma/habilidade com o efeito como padrão */
const fxVal=f=>{const i=FX_INFO[f.type]||{},ac=typeof decai=='function'&&decai(f.type);return ac?{ac,pw:n(i.power),dur:Math.max(.5,n(i.dur,3)),attr:i.attr,attrPct:n(i.attrPct)}:{ac,pw:n(f.power,n(i.power)),dur:Math.max(.5,n(f.dur,n(i.dur,3))),attr:'',attrPct:0}};
const escalaTxt=v=>v.attrPct&&v.attr&&v.attr!='none'?' + '+v.attrPct+'% de '+(FXATTR[v.attr]||v.attr):'';
const fxText=l=>Array.isArray(l)&&l.length?' '+l.filter(f=>FX_INFO[f.type]).map(f=>(f.chance==null||f.chance===''?100:f.chance)+'% de '+(f.target=='self'?'ganhar ':'causar ')+FX_INFO[f.type].n+' por '+(f.dur||3)+'s'+(fxKind(f.type)=='dot'?' ('+[n(f.power)||'',n(f.pct)?n(f.pct)+'% do dano'+(f.src=='physical'?' físico':f.src=='magic'?' mágico':''):'',n(f.attrPct)&&f.attr&&f.attr!='none'?n(f.attrPct)+'% de '+(FXATTR[f.attr]||f.attr):''].filter(Boolean).join(' + ')+' por '+(FX_INFO[f.type].tick==1?'segundo':FX_INFO[f.type].tick+'s')+')':fxKind(f.type)=='slow'?' (-'+n(f.power)+'% vel.)':fxKind(f.type)=='vuln'?' (+'+n(f.power)+'% dano recebido)':fxExtra(f))).join('; ')+'.':'';
const SDEF={};
/* efeito no painel: só o tipo e o número (ex.: "3 de dano de Queimadura por acúmulo/s", "1 de Regeneração de vida/s") */
const efeitoTexto=l=>(Array.isArray(l)?l:[]).filter(f=>f&&FX_INFO[f.type]).map(f=>{const i=FX_INFO[f.type],V=fxVal(f),pw=V.pw,ch=f.chance==null||f.chance===''||+f.chance>=100?'':' ('+n(f.chance)+'%)',k=i.kind,dur=V.dur,ac=V.ac;
 const t=k=='dot'?pw+escalaTxt(V)+' de dano de '+i.n+(ac?' por acúmulo':'')+'/s':k=='slow'?'-'+pw+'% '+i.n+(i.atk?' (movimento e ataque)':'')+(ac?' por acúmulo':'')+(i.congela?', '+(i.stacks||1)+' acúmulos congelam '+i.congela+' s':''):k=='hot'?pw+' de '+i.n+' de vida/s':k=='stun'?i.n+' '+dur+' s':k=='physup'?'+'+pw+'% de dano físico ('+i.n+')':k=='magup'?'+'+pw+'% de dano mágico ('+i.n+')':k=='dmgup'?'+'+pw+'% de dano ('+i.n+')':k=='dmgdown'?'-'+pw+'% de dano ('+i.n+')':k=='guard'?'-'+pw+'% de dano recebido ('+i.n+')':k=='haste'?'+'+pw+'% de velocidade ('+i.n+')':k=='vuln'?'+'+pw+'% de dano recebido ('+i.n+')':k=='regenPct'?'-'+pw+'% de regeneração de vida ('+i.n+')':k=='armorPct'?'-'+pw+'% de defesa física ('+i.n+')':i.n;
 return t+(ac?' (−1 acúmulo a cada '+dur+' s)':k=='stun'?'':' por '+dur+' s')+ch}).join(' · ');
window.efeitoTexto=efeitoTexto;
/* frase completa de cada efeito para as dicas dos itens, gerada da configuração (Engine › item › efeitos), ex.:
   "20% de chance de aplicar Veneno durante 5 s, causando 5 de dano por segundo por acúmulo (até 3 acúmulos)".
   proprio: o efeito é em quem usa o item (armadura: ao ser atingido) */
const efeitoFrase=(l,proprio)=>(Array.isArray(l)?l:[]).filter(f=>f&&FX_INFO[f.type]).map(f=>{
 const i=FX_INFO[f.type],k=i.kind,ch=f.chance==null||f.chance===''?100:n(f.chance),V=fxVal(f),dur=V.dur,pw=V.pw,ac=V.ac,por=Math.max(1,Math.round(n(f.acumulos)||1)),max=i.stacks||1;
 const verbo=proprio?(ch>=100?'Ganha ':'ganhar '):(ch>=100?'Aplica ':'aplicar ');
 let t=(ch>=100?'':ch+'% de chance de ')+verbo+i.n+(ac?'':' durante '+dur+' s');
 if(k=='dot'){const tipo=i.dtype=='magic'?' mágico':i.dtype=='physical'?' físico':'',partes=[pw?String(pw):'',V.attrPct&&V.attr&&V.attr!='none'?V.attrPct+'% de '+(FXATTR[V.attr]||V.attr):''].filter(Boolean);
  t+=', causando '+(partes.join(' + ')||'0')+' de dano'+tipo+' a cada '+(n(i.tick,1)==1?'segundo':n(i.tick,1)+' s')+(ac&&max>1?' por acúmulo':'')}
 else if(k=='slow')t+=', reduzindo '+(i.atk?'o movimento e o ataque':'o movimento')+' em '+pw+'%'+(ac&&max>1?' por acúmulo':'')+(i.congela?'; com '+max+' acúmulos congela por '+i.congela+' s':'');
 else if(k=='vuln')t+=' (+'+pw+'% de dano recebido)';
 else if(k!='stun'){const x=fxExtra(f).replace(/^ \(|\)$/g,'');if(x)t+=' ('+x+')'}
 if(ac){const x=i.maxFx&&FX_INFO[i.maxFx],xk=x&&x.kind,xd=x?(xk=='regenPct'?' (-'+n(x.power)+'% de regeneração de vida'+(i.maxEnquanto?', enquanto no máximo':'')+')':xk=='armorPct'?' (-'+n(x.power)+'% de defesa física'+(i.maxEnquanto?', enquanto no máximo':'')+')':xk=='stun'?' por '+n(i.maxFxDur,2)+' s'+(i.maxResto!=null?', depois volta para '+i.maxResto+' acúmulo'+(+i.maxResto==1?'':'s'):''):''):'';
  t+=' (até '+max+' acúmulo'+(max>1?'s':'')+(por>1?', '+por+' por acerto':'')+'; perde 1 acúmulo a cada '+dur+' s'+(x?'; com '+max+': '+x.n+xd:'')+')'}
 return t}).join('; ');
window.efeitoFrase=efeitoFrase;
// tempo de conjuração: o da habilidade; sem valor, projéteis levam 0,5 s e o resto é instantâneo
/* alcance de golpe corpo a corpo (Corte Horizontal…): o da arma, mas arma de tiro (cajado, arco) golpeia de perto */
const alcanceCorpo=()=>{const b=basic();return Math.max(22,b.ranged||b.proj?24:Math.min(48,b.rng||22))};
const CONJ_PROJETIL=.5,conj=s=>s.castTime!==undefined&&s.castTime!==''&&s.castTime!==null?Math.max(0,n(s.castTime)):s.effect=='projectile'?CONJ_PROJETIL:0;
function makeSkill(s){
 if(s.category&&s.category!='ability')return null;
 const split=(s.damageModel=='split'||hasSplitDamage(s))&&!['heal','guard','buff'].includes(s.effect),pv0=()=>split?skillDamage(s):scaledDamage(s),pv=()=>['heal','guard','buff','aura'].includes(s.effect)?pv0():comExtra(s,pv0()),hasDamage=()=>hasSplitDamage(s)||n(s.base)||n(s.per)||n(s.charPercent)||n(s.scalePercent),col=s.color||s.c2||'#fff',hl=n(s.heal)>0?()=>n(s.heal):undefined,r=n(s.radius,40),magic=skillMagic(s);let f,d,extraInfo=null;
 /* efeitos no golpe: os da habilidade e os da arma da mão principal (ex.: sangramento da arma também sai nas habilidades) */
 const dty=s.damageType=='physical'||s.damageType=='magic'?s.damageType:'weapon',proprios=Array.isArray(s.effects)?s.effects:[];
 const fx=()=>{const a=EQ.sw&&ITEMS[EQ.sw.id],l=[...proprios,...(a&&Array.isArray(a.fx)?a.fx:[])];return l.length?resolveFx(l,danoHabilidade(dty)):null};
 const alvos=(lista,cond)=>{for(const e of en)if(e.hp>0&&cond(e)&&linhaLivre(p,e))hurtE(e,pv(),magic,fx())};
 const P=()=>{const v=pv();return typeof v=='object'?damageText(v):v};
 // conjuração pela velocidade de ataque: % do intervalo do ataque básico (true dos dados antigos = 100%)
 const conjAtq=s.conjAtaque===true?100:Math.max(0,n(s.conjAtaque));
 const noArco=(e,a0,arco)=>{const a=Math.atan2(e.y-p.y,e.x-p.x);return Math.abs(Math.atan2(Math.sin(a-a0),Math.cos(a-a0)))<=arco};
 // projétil: dano em área ao acertar (areaRaio px, areaPct % do dano nos outros inimigos) e desenho próprio (vfx 'fogo' / 'gelo')
 const area=n(s.areaRaio)>0?{r:n(s.areaRaio),pct:n(s.areaPct,50)}:null,vfxProj=['fogo','gelo'].includes(s.vfx)?s.vfx:null;
 const textoArea=()=>area?' e '+area.pct+'% desse dano em área ('+area.r+' px) em volta do alvo':'';
 switch(s.effect){
  case'projectile':f=pr(pv,col,hl,{flat:true,magic,fx,area,vfx:vfxProj});d=()=>'Dispara um projétil teleguiado: '+P()+' de dano'+textoArea()+(hl?' e cura '+hl():'')+'.';break;
  case'nova':f=nova(r,pv,col,hl,{flat:true,magic,fx});d=()=>'Explosão ao redor ('+r+' px): '+P()+' de dano'+(hl?' e cura '+hl():'')+'.';break;
  case'blink':f=blink(hasDamage()?pv:null,{flat:true,magic,fx});d=()=>'Avança até 80 px na direção do mouse'+(hasDamage()?' e causa '+P()+' de dano a quem estiver perto':'')+'.';break;
  case'heal':f=()=>{heal(Math.round(pv()));if(n(s.mpRestore)>0)p.mp=Math.min(mmp(),p.mp+n(s.mpRestore))};d=()=>'Recupera '+Math.round(pv())+' de vida'+(n(s.mpRestore)>0?' e '+n(s.mpRestore)+' de mana':'')+'.';break;
  case'guard':f=guard;d=()=>'Por 6 s você recebe metade do dano.';break;
  case'buff':f=()=>{p.bf=n(s.base,8);ring(p.x,p.y,40,col,.5);ft(p.x,p.y-24,s.name+'!',col)};d=()=>'Por '+n(s.base,8)+' s aumenta o dano e a velocidade.';break;
  /* golpe corpo a corpo num arco à frente, no alcance da arma (Corte Horizontal). mira 'direcao' (padrão) = para onde
     o mouse aponta, sem alvo; mira 'alvo' = precisa de um inimigo e golpeia na direção dele */
  case'golpe':{const arco=n(s.arc,140)/2*Math.PI/180,alc=()=>alcanceCorpo()+10,porAlvo=s.mira==='alvo';
   const golpe=a0=>{if(s.vfx==='corte'&&window.VFX)VFX.tocar('corte',{x:p.x,y:p.y-8,ang:a0,raio:Math.round(alc()+8),arco:arco*2,cor:col});
    else ring(p.x+Math.cos(a0)*12,p.y-6+Math.sin(a0)*12,14,col,.25);alvos(en,e=>dist(e,p)-(typeof targetReach=='function'?targetReach(e):0)<=alc()&&noArco(e,a0,arco))};
   f=porAlvo?Object.assign((w,t)=>golpe(Math.atan2(t.y-p.y,t.x-p.x)),{tg:1}):w=>golpe(Math.atan2(w.y-p.y,w.x-p.x));
   d=()=>'Golpe '+(porAlvo?'no alvo':'à frente, na direção do mouse')+' ('+n(s.arc,140)+'°, alcance da arma): '+P()+' de dano em quem estiver no arco.';break}
  // avança até o inimigo e golpeia (Investida com Escudo)
  case'investida':f=Object.assign((w,t)=>{const a=Math.atan2(t.y-p.y,t.x-p.x);let dd=Math.max(0,dist(p,t)-14);
    while(dd>0&&(!walk(p.x+Math.cos(a)*dd,p.y+Math.sin(a)*dd)||!campWallSegmentClear(p,{x:p.x+Math.cos(a)*dd,y:p.y+Math.sin(a)*dd})))dd=Math.max(0,dd-4);
    // corre até o alvo em alta velocidade (combat.js tickDash), com rastro; o golpe sai na chegada
    const rastro=!s.vfx||s.vfx==='investida'||s.vfx==='arcane';
    p.dash={x0:p.x,y0:p.y,x1:p.x+Math.cos(a)*dd,y1:p.y+Math.sin(a)*dd,t:0,dur:Math.max(.05,dd/Math.max(60,n(s.velocidade,420))),dir:{x:Math.cos(a),y:Math.sin(a)},rastro,
     fim:()=>withWeaponDamageRoll(()=>{if(hasDamage()||proprios.length)alvos(en,e=>e===t);if(rastro&&window.VFX&&t.hp>0)VFX.tocar('impacto',{x:(p.x+t.x)/2,y:(p.y+t.y)/2-8});else ring(p.x,p.y,18,col,.4)})};
    p.dest=null;p.path=[];p.fx=Math.cos(a);p.fy=Math.sin(a)},{tg:1});
   d=()=>'Corre até o alvo (até '+n(s.alcance,120)+' px, '+n(s.velocidade,420)+' px/s)'+(hasDamage()?' e causa '+P()+' de dano na chegada':'')+'.';break;
  // grito / inspiração: os efeitos valem para você e para os aliados na área (online.js leva aos outros jogadores)
  case'aura':f=()=>{const raio=r*areaMultiplier(p);applyFx(p,resolveFx(proprios.map(e=>({...e,target:'self'})),0));
    if(s.vfx==='aura'&&window.VFX){VFX.tocar('grito',{x:p.x,y:p.y-4,raio:Math.round(raio),cor:col});for(let i=0;i<8;i++)VFX.faisca(p.x+(Math.random()-.5)*14,p.y-Math.random()*18,col)}else ring(p.x,p.y,raio,col,.5);
    // aliados online perto também ficam com a aura/contorno na minha tela (online.js)
    if(window.marcarAura)marcarAura(p.x,p.y,raio,col,Math.max(...proprios.map(e=>n(e.dur,3)),1));ft(p.x,p.y-30,(s.name||'')+'!',col)};
   d=()=>'Vale para você e para os aliados a até '+r+' px.';break;
  /* canal: golpes a cada intervalo enquanto dura (combat.js tickCanal).
     local 'heroi' (padrão, Girar) = área em volta do herói; local 'mouse' (Chuva de meteoros) = área no ponto do mouse.
     porGolpe = impactos ao mesmo tempo em pontos sorteados da área (raioImpacto); totalGolpes limita o total; parado = andar cancela */
  case'canal':{const dur=Math.max(.2,n(s.duracao,5)),tick=Math.max(.2,n(s.intervalo,1)),noMouse=s.local==='mouse',porVez=Math.max(1,n(s.porGolpe,1)),raioImp=n(s.raioImpacto,22);
   const totalMax=n(s.totalGolpes)>0?n(s.totalGolpes):Infinity,ondas=Math.max(1,Math.min(Math.round(dur/tick),Math.ceil(totalMax/porVez)));
   f=Object.assign(w=>{const cx=noMouse?w.x:p.x,cy=noMouse?w.y:p.y;let restam=totalMax;
    p.canal={r:dur+.05,tick,prox:noMouse?.25:0,n:ondas,ang:Math.atan2(p.fy||1,p.fx||0),parado:!!s.parado,x0:p.x,y0:p.y,id:s.id,
     area:noMouse?{x:cx,y:cy,r:Math.round(r*areaMultiplier(p)),cor:col}:null, // área no chão enquanto dura (js/vfx-habilidades.js)
     visual:s.vfx==='giro'?{raio:Math.round(r*areaMultiplier(p)),cor:col}:null,
     golpe:()=>withWeaponDamageRoll(()=>{const raio=r*areaMultiplier(p);
      if(!noMouse){if(s.vfx!=='giro')ring(p.x,p.y,raio,col,.3);alvos(en,e=>dist(e,p)<raio);return}
      // impactos sorteados dentro da área do mouse; o dano sai quando o meteoro cai (VFX 'meteoro' chama fim)
      const dentro=en.filter(e=>e.hp>0&&dist(e,{x:cx,y:cy})<raio);
      for(let k=0;k<porVez&&restam>0;k++,restam--){const alvo=dentro.length?dentro[(Math.random()*dentro.length)|0]:null,a=Math.random()*Math.PI*2,dd=alvo?Math.random()*6:Math.sqrt(Math.random())*raio;
       const x=(alvo?alvo.x:cx)+Math.cos(a)*dd,y=(alvo?alvo.y:cy)+Math.sin(a)*dd*.8,dano=pv(); // cai em cima de um inimigo da área (ou num ponto qualquer, sem ninguém)
       const cair=()=>{if(window.playGameSound)playGameSound('explosao',.6);for(const e of en)if(e.hp>0&&dist(e,{x,y})<raioImp&&linhaLivre({x,y},e))hurtE(e,dano,magic,fx())};
       if(s.vfx==='meteoros'&&window.VFX)VFX.tocar('meteoro',{x,y,raio:raioImp,cor:col,dur:.5,fim:cair});else{ring(x,y,raioImp,col,.4);cair()}}})}},noMouse?{mira:1}:{});
   d=()=>(noMouse?'Fica parado conjurando na área do mouse ('+r+' px)':'Gira')+' por '+dur+' s: '+(porVez>1?porVez+' impactos por vez, ':'')+P()+' de dano'+(noMouse?' por impacto ('+raioImp+' px)':' em área ('+r+' px)')+' a cada '+tick+' s'+(totalMax<Infinity?', '+totalMax+' no total':'')+'.'+(s.parado?' Você fica parado; aperte de novo para cancelar.':' Dá para andar.')+' Sem ataque básico enquanto dura.';break}
  case'meteor':f=Object.assign(w=>mets.push({x:w.x,y:w.y,t:.9,radius:r*areaMultiplier(p),dmg:pv(),magic,fx:fx&&fx()}),{mira:1});d=()=>'Chama um meteoro no local do mouse: '+P()+' de dano em área.';break;
  default:{const x=window.CURANDEIRO&&CURANDEIRO.criar(s,{r,col,proprios});if(!x)return null;f=x.f;d=x.d;extraInfo=x.info;break} // Curandeiro (js/curandeiro.js)
  }
 if(['heal','guard','buff'].includes(s.effect)&&(n(s.actionStats?.physicalDmg)||n(s.actionStats?.magicDmg))){
  const perform=f;f=(w,t)=>{perform(w,t);for(const enemy of en)if(enemy.hp>0&&dist(enemy,p)<r*areaMultiplier(p)&&linhaLivre(p,enemy))hurtE(enemy,{physical:Math.max(0,n(s.actionStats.physicalDmg)),magic:Math.max(0,n(s.actionStats.magicDmg))},false,fx&&fx())};
 }
 const sprite=pixelArt(s.sprite),dd=d,dmgTag=()=>skillMagic(s)?'mágico':'físico';d=()=>dd().replace(/ de dano/g,' de dano'+(typeof pv()=='object'?'':' '+dmgTag()))+fxText(s.effects)+(attributeText(s.actionStats)?' Ação: '+attributeText(s.actionStats)+'.':'')+(attributeText(s.bonuses)?' Bônus: '+attributeText(s.bonuses)+'.':'');
 // partes para o painel (ui.js skTip): descrição, dano já calculado e efeito
 const extra=()=>s.effect==='projectile'&&area?area.pct+'% do dano em área de '+area.r+' px':s.effect==='aura'?'você e aliados a até '+r+' px':s.effect==='golpe'?'arco de '+n(s.arc,140)+'° à frente':s.effect==='investida'?'corre até '+n(s.alcance,120)+' px':s.effect==='canal'?(s.local==='mouse'?n(s.porGolpe,1)+' impactos por vez'+(n(s.totalGolpes)?', '+n(s.totalGolpes)+' no total':'')+' na área do mouse ('+r+' px)':'golpes em área ('+r+' px) a cada '+n(s.intervalo,1)+' s')+' por '+n(s.duracao,5)+' s'+(s.parado?'; parado, aperte de novo para cancelar':''):s.effect==='nova'?'área de '+r+' px em volta':'';
 /* painel (ui.js skTip): Descrição, Dano, Cura, Mana, Alcance, Área e Efeito (só o tipo e o número) */
 const alcanceTxt=()=>s.effect==='golpe'?Math.round(alcanceCorpo()+10)+' px (alcance da arma)':s.effect==='investida'?n(s.alcance,120)+' px':s.effect==='projectile'?'200 px (no alvo)':s.effect==='blink'?'80 px':s.effect==='meteor'||s.effect==='canal'&&s.local==='mouse'?'no ponto do mouse':'em você';
 const areaTxt=()=>s.effect==='projectile'?(area?area.r+' px em volta do alvo ('+area.pct+'% do dano)':''):s.effect==='golpe'?'arco de '+n(s.arc,140)+'° à frente':s.effect==='canal'?(s.local==='mouse'?r+' px; impactos de '+n(s.raioImpacto,22)+' px':r+' px em volta'):['nova','aura','meteor'].includes(s.effect)||s.effect==='heal'&&hl?r+' px'+(s.effect==='aura'?' (você e aliados)':''):s.effect==='blink'&&hasDamage()?'32 px':'';
 const curaTxt=()=>s.effect==='heal'?ampCura(+pv()||0)+' de vida':hl?ampCura(hl())+' de vida':'';
 const info=()=>{const v=hasDamage()&&s.effect!=='heal'?pv():null;const vb=v==null?null:comBuffs(typeof v=='object'?v:magic?{physical:0,magic:+v||0}:{physical:+v||0,magic:0}); /* com os buffs ativos */
  return{desc:s.desc||dd(),dano:vb==null?'':danoHTML(vb),dano2:null,
  cura:curaTxt(),mana:n(s.mpRestore)>0?'+'+n(s.mpRestore)+' de mana':'',alcance:alcanceTxt(),area:areaTxt(),efeito:efeitoTexto(s.effects),extra:extra(),...(extraInfo?extraInfo():{}),...textosProprios()}};
 /* textos escritos na Engine (Caixa de informação) valem no lugar dos calculados; '-' esconde a linha */
 const textosProprios=()=>{const o={},tx=s.textos&&typeof s.textos=='object'?s.textos:{};for(const k of ['dano','cura','mana','alcance','area','efeito']){const v=String(tx[k]??'').trim();if(v)o[k]=v==='-'?'':v}return o};
 return{id:s.id,category:s.category||'ability',n:s.name||s.id,effect:s.effect,radius:r,info,mana:n(s.mana),manaSeg:s.effect==='auraContinua'?n(s.manaPorSeg,2):0,cd:Math.max(.3,n(s.cd,3)),castTime:conj(s),actionStats:s.actionStats,bonuses:s.bonuses,bonusDuration:n(s.bonusDuration,5),ic:sprite?sprite.toDataURL():window.iconeHabilidade&&iconeHabilidade(s.id)||SKI(s.icon||'orb',s.c1||'#4a6a96',s.c2||'#fff'),f,conjAtaque:conjAtq,efs:s.effect=='aura'?proprios:null,alcance:s.effect=='golpe'?()=>alcanceCorpo()+14:s.effect=='investida'?()=>n(s.alcance,120):null,d:s.desc?()=>s.desc+' ('+d()+')':d,wt:lc(s.weaponTypes).map(weaponTag),tags:tags(s.tags),cross:!!s.cross,vfx:s.vfx||'arcane',vfxColor:col}}
L('skills').forEach(s=>{const o=makeSkill(s);if(o)SDEF[s.id]=o});
window.infoHabilidade=id=>{const s=SDEF[id];if(!s||!s.info)return null;try{const i=s.info();return{dano:i.dano,cura:i.cura,mana:i.mana,alcance:i.alcance,area:i.area,efeito:i.efeito}}catch(e){return null}}; // a Engine mostra estes textos de exemplo

/* ---------- itens ---------- */
L('items').forEach(it=>{
 if(!it.id)return;
 const st={};Object.keys(ITEM_STATS).forEach(k=>{const v=n(it.stats&&it.stats[k]);if(v)st[k]=ITEM_STATS[k].percent?v/100:v});
 const c=[it.c1||'#9aa7b8',it.c2||'#c9a227'],style=Math.max(0,Math.min(2,n(it.style))),nm=it.name||it.id;let o;
 if(it.kind=='material'){
  o={n:nm,material:true,stackable:true,c:icone16(it.sprite,it.id)||woodIcon(it.id=='magicWood')}
 }
 else if(it.kind=='consumable'){
  const h={hp:n(it.healHp),mp:n(it.healMp),hpPct:n(it.healHpPct),mpPct:n(it.healMpPct)};
  o={n:nm+' ('+[h.hp&&'cura '+h.hp,h.hpPct&&'cura '+h.hpPct+'% da vida',h.mp&&'+'+h.mp+' mana',h.mpPct&&'+'+h.mpPct+'% da mana'].filter(Boolean).join(', ')+')',use:1,heal:h,castTime:it.castTime===''||it.castTime==null?.5:Math.max(0,n(it.castTime)),c:icone16(it.sprite,it.id)||potion(c[0],shade(c[0],1.4),shade(c[0],.55))}}
 else if(it.kind=='weapon'){
  const wtype=weaponId(it.wtype),twoHanded=!!it.twoHanded||['espada_grande','cajado','machado_2mao','martelo_2mao'].includes(wtype);
  // um item com dano inválido não pode impedir o jogo de abrir: avisa e usa os valores em ordem
  let range;try{range=weaponDamageRange(it)}catch(e){const a=Math.max(0,Math.round(+it.damageMin||0)),b=Math.max(0,Math.round(+it.damageMax||0));range={min:Math.min(a,b),max:Math.max(a,b)};console.warn('Arma "'+(it.name||it.id)+'": '+e.message+' Usando '+range.min+' - '+range.max+'.')}
  if(range)st.dmg=(range.min+range.max)/2;
  o={n:nm+' ('+(range?'dano '+range.min+' - '+range.max+(statTxt({...st,dmg:0})?', '+statTxt({...st,dmg:0}):''):statTxt(st))+')',...st,...(range?{damageMin:range.min,damageMax:range.max}:{}),...(weaponDamage2Range(it)?{damage2Min:weaponDamage2Range(it).min,damage2Max:weaponDamage2Range(it).max}:{}),c:icone16(it.sprite,it.id)||weaponIcon(style,c),g:1,v:{c,st:style},wt:wtype,th:twoHanded,equippedSprite:pixelArt(it.equippedSprite)};
  gearType[it.id]='sw';
  /* ícone e mão na mesma escala (js/pacote-armas.js): arma do pacote ainda com o ícone grande antigo usa o desenho da mão;
     arma sem desenho nenhum usa a do pacote do mesmo tipo */
  const pk=armaDoPacote(wtype);
  if(pk&&it.pacote==='armas-v1'&&it.sprite&&it.sprite.pixels===pk.iconeAntigo.pixels)o.c=pixelArt(pk.icone);
  if(pk&&!it.sprite&&!it.equippedSprite){o.c=pixelArt(pk.icone);o.equippedSprite=pixelArt(pk.mao);if(it.pega==null||it.pega==='')o.pega=pk.pega}
  // pose e golpe na mão (js/sprites.js POSES_ARMA): escolhido na Engine ou pelo tipo da arma
  const ATAQUE_PADRAO={espada_grande:'pesado',machado_2mao:'pesado',martelo_2mao:'pesado',adaga:'estocada',lanca:'estocada',cajado:'vertical',arco:'arco',besta:'besta',manopla:'soco',escudo:'escudo',orbe:'orbe',vara:'varinha',varinha:'varinha',cetro:'varinha'};
  o.ataque=POSES_ARMA[it.ataque]?it.ataque:ATAQUE_PADRAO[wtype]||'corte';
  if(it.pega!=null&&it.pega!=='')o.pega=Math.max(0,Math.min(1,+it.pega/100));
  o.escalaMao=2; // padrão de proporção: na mão, 1 pixel do desenho = 1 pixel do herói
  // desenho antigo (feito para outra escala, ainda não convertido pela Engine): reduz para a altura que ele tinha na mão
  // a mesma redução vale depois para os desenhos por direção e os quadros animados da arma (escalaReduz, mais abaixo)
  if(+it.escalaMao!==2&&o.equippedSprite&&typeof reduzirArte==='function'){const e=o.equippedSprite,alvo=style==2?20:style==1?14:16,k=Math.min(1,alvo/e.height);if(k<1){o.equippedSprite=reduzirArte(e,e.width*k,e.height*k);o.escalaReduz=k}}
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
 // arma com desenho antigo reduzido: frente, costas, lados e os quadros animados na mesma escala da arma na mão
 // (antes só o desenho principal encolhia e cada perspectiva aparecia de um tamanho)
 if(o.escalaReduz){const k=o.escalaReduz,red=c=>c&&c.width?reduzirArte(c,Math.max(1,c.width*k),Math.max(1,c.height*k)):c;
  for(const d in o.equippedSprites)o.equippedSprites[d]=red(o.equippedSprites[d]);
  for(const d in o.equippedAnim||{}){const a=o.equippedAnim[d];for(const e of ['idle','walk','attack'])a[e]=a[e].map(red)}}
 /* arma (2026-10-28, pedido do usuário): "Na mão, usar o desenho do ícone" (o ícone já na diagonal vira o desenho da mão,
    em todas as direções) e o pixel de engate, marcado na Engine em pixels do desenho e levado ao tamanho do desenho na mão */
 if(it.kind=='weapon'){
  /* as posições desenhadas à parte (Frente/Costas/Lados, ex.: as costas do Escudo de Osso, 2026-10-30) continuam valendo;
     só saem as que são cópia do ícone (antes todas saíam e de costas aparecia o ícone) */
  if(it.maoIcone&&it.sprite){const c=pixelArt(it.sprite);if(c){o.equippedSprite=c;o.equippedSprites=Object.fromEntries(Object.entries(posicoesProprias(it)).map(([k,a])=>[k,pixelArt(a)]).filter(([,a])=>a));delete o.equippedAnim}}
  const dEng=it.maoIcone?it.sprite:it.equippedSprite,e=it.engate;
  if(e&&Number.isFinite(+e.x)&&Number.isFinite(+e.y)&&o.equippedSprite&&dEng&&dEng.w){const k=o.equippedSprite.width/dEng.w;o.engate={x:+e.x*k,y:+e.y*k}}}
 o.tags=it.kind=='weapon'?weaponTags({...it,wt:o.wt}):lc(it.tags);ITEMS[it.id]=o;o.ic=o.c.toDataURL()});
if(ITEMS.saw){ITEMS.saw.c=sawToolIcon();ITEMS.saw.ic=ITEMS.saw.c.toDataURL();ITEMS.saw.equippedSprite=typeof reduzirArte==='function'?reduzirArte(sawToolSprite(),14,6):sawToolSprite();ITEMS.saw.escalaMao=2} // na mão no padrão: 1 pixel = 1 pixel do herói
for(const key of Object.keys(heroC))delete heroC[key];

/* ---------- passivas ---------- */
const PDEF={},PL={hp:'vida máx.',mp:'mana máx.',regenMp:'regeneração de mana',dmg:'dano',arm:'defesa física',magicArm:'defesa mágica',spd:'velocidade',moveSpeed:'movimento',attackSpeed:'velocidade de ataque'},PA={F:'Força',A:'Agilidade',I:'Inteligência'};
const passiveData=[...L('passives'),...L('skills').filter(s=>s.category=='passive')];
passiveData.forEach(s=>{
 if(!s.id)return;
 const auto=[...Object.keys(PL).filter(k=>n(s[k])).map(k=>(n(s[k])>0?'+':'')+n(s[k])+'% '+PL[k]),...Object.keys(PA).filter(k=>n(s[k])).map(k=>(n(s[k])>0?'+':'')+n(s[k])+' '+PA[k])].join(', ');
 PDEF[s.id]={id:s.id,n:s.name||s.id,t:s.desc||auto,stats:s.stats||{},hp:n(s.hp),mp:n(s.mp),dmg:n(s.dmg),arm:n(s.arm),magicArm:n(s.magicArm),spd:n(s.spd),moveSpeed:n(s.moveSpeed),attackSpeed:n(s.attackSpeed),regenMp:n(s.regenMp),F:n(s.F),A:n(s.A),I:n(s.I)}});

/* ---------- classes (builds) ---------- */
L('classes').forEach(c=>{
 if(!c.id)return;
 const previousSkills=SKS[c.id]||[];
 const a=c.attrs||{},g=c.per||{},ps=c.passive||{},base=['war','mag','hea'].includes(c.base)?c.base:'war';
 /* passiva da classe: libera no rank da classe (rank) ou, em dados antigos, no nível do personagem (lv) */
 const pl=(Array.isArray(c.passives)?c.passives:[]).map(r=>({d:PDEF[r.id],lv:Math.max(1,n(r.lv,1)),rank:n(r.rank)})).filter(r=>r.d).sort((x,y)=>(x.rank||x.lv)-(y.rank||y.lv));
 pl.forEach(r=>{r.on=()=>r.rank?classRank(c.id)>=r.rank:p.lvl>=r.lv});
 const sum=k=>pl.reduce((t,r)=>t+(r.on()?n(r.d[k]):0),0);
 CL[c.id]={...CL[c.id],n:c.name||c.id,F:n(a.F,5)-3,A:n(a.A,5)-3,I:n(a.I,5)-3,get perLevel(){return atrNivel()},attackSpeed:Math.max(.1,n(c.attackSpeed,1)),
  get pDmg(){return pc(ps.dmg)+pc(sum('dmg'))},get pMp(){return pc(ps.mp)+pc(sum('mp'))},get pRegenMp(){return pc(ps.regenMp)+pc(sum('regenMp'))},get passiveHp(){return pc(ps.hp)+pc(sum('hp'))},get pSpd(){return pc(ps.spd)+pc(sum('spd'))},
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
const NUNCA_CAI=['nova_arma','teste']; // arma ADM e a de teste nunca caem de monstro (mesma lista da Engine, project.js)
function normDrops(m){
 // quantidade (min–max, sorteada quando o item cai) é separada da chance; sem valores, cai 1
 const out={},qtd={},put=(id,c,x)=>{if(!ITEMS[id]||NUNCA_CAI.includes(id))return;out[id]=Math.max(out[id]||0,Math.max(0,Math.min(100,+c||0)));
  if(x){const mn=Math.max(1,Math.min(99,Math.floor(+x.min||1))),mx=Math.max(mn,Math.min(99,Math.floor(+x.max||mn)));if(mx>1)qtd[id]={min:mn,max:mx}}};
 const lista=Array.isArray(m.drops)?m.drops:[],g=Array.isArray(m.guaranteedDrops)?m.guaranteedDrops:[];
 const velhos=lista.filter(x=>typeof x=='string'&&!g.includes(x)),bn=m.bossType=='grandboss'?.4:m.bossType=='boss'?.2:0;
 velhos.forEach(id=>put(id,.22*(1+bn)/velhos.length*100)); // lista antiga (sem %): 22% divididos entre os itens
 g.forEach(id=>put(id,100));
 lista.forEach(x=>{if(x&&typeof x=='object')put(x.id,x.chance,x)});
 return Object.entries(out).filter(([,c])=>c>0).map(([id,chance])=>({id,chance,...qtd[id]}));
}
const CM={};
/* projeto ainda não convertido pela Engine (padrão de proporção, js/proporcao.js): desenho com "Tamanho" menor que 100%,
   em 2× ou em resolução dobrada é reduzido na hora, para os pixels ficarem do tamanho dos do herói */
const fatorMonstro=m=>{const s=m.sprite;if(!s||!s.w||m.pacote||(PROJETO.mundo&&PROJETO.mundo.proporcaoV>=1))return 1;const chefe=['boss','grandboss'].includes(m.bossType);return +m.size>0&&+m.size<100?+m.size/100:s.q===2?.5:!chefe&&(s.w>48||s.h>40)?.5:1};
const reduzCanvas=(c,k)=>{if(!c||k>=1||typeof reduzirArte!=='function')return c;const r=reduzirArte(c,c.width*k,c.height*k);if(c.pad)r.pad=Math.round(c.pad*k);return r};
const reduzido=(d,k)=>reduzCanvas(pixelArt(d),k);
/* Arma na mão do monstro (2026-10-30, pedido do usuário): o monstro equipa a arma como o herói, em vez de ela vir pintada.
   Cada quadro marca a mão (mao1 = arma da frente, mao2 = arma de trás: {x, y, giro?, espelho?}; o quadro sem marca herda a
   do anterior). As camadas do desenho "Mão 2", "Corpo" e "Mão 1", de trás para a frente, por posição (ORDEM_MAOS, corrigida
   pelo usuário): frente e costas Corpo → Mão 2 → Mão 1; lado Mão 2 → Corpo → Mão 1. Cada "mão" é a arma dela e, por cima, a
   camada da mão (os dedos ficam por cima do cabo). A arma é o desenho do item (o ícone com "Na mão, usar o ícone", senão
   o "Empunhada"), 1 pixel = 1 pixel do mundo, presa pelo pixel de engate. Parado/andando fica como foi desenhada; no golpe
   gira pelo giro do quadro ou, sem ele, pelo golpe padrão. Vale só para armas (inclui o escudo, na mão 2). */
// desenhos por posição (d frente, u costas, s lados) que não são cópia do ícone
function posicoesProprias(it){const ic=it.sprite,igual=a=>ic&&a.w===ic.w&&a.h===ic.h&&a.pixels===ic.pixels&&JSON.stringify(a.palette)===JSON.stringify(ic.palette);
 return Object.fromEntries(Object.entries(it.equippedSprites||{}).filter(([,a])=>a&&a.pixels&&!igual(a)))}
const normCamada=n=>String(n||'').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\s+/g,' ');
// vista: 'frente' usa o desenho de frente (d), 'costas' o de costas (u), 'lado'/'esquerda' o de lado (s), se o item tiver
function armaDesenho(it,vista){if(!it)return null;const pos=posicoesProprias(it),dir=vista==='costas'?'u':vista==='frente'?'d':'s';
 const d=pos[dir]||(it.maoIcone?it.sprite:(it.equippedSprite||it.sprite)),c=pixelArt(d);if(!c)return null;
 const e=it.engate&&Number.isFinite(+it.engate.x)&&Number.isFinite(+it.engate.y)?{x:+it.engate.x,y:+it.engate.y}:{x:Math.floor(d.w/2),y:Math.floor(d.h*.85)};
 return{c,e}}
// golpe padrão (quadro sem giro): preparo para trás, golpe para a frente e volta, pelo andamento da animação de ataque
const GOLPE_MONSTRO=[[0,0],[.3,-40],[.55,90],[.8,45],[1,0]];
function giroGolpe(t){for(let i=1;i<GOLPE_MONSTRO.length;i++){const[a,ga]=GOLPE_MONSTRO[i-1],[b,gb]=GOLPE_MONSTRO[i];if(t<=b)return ga+(gb-ga)*(t-a)/(b-a||1)}return 0}
const ORDEM_MAOS={frente:['corpo','mao2','mao1'],costas:['corpo','mao2','mao1'],lado:['mao2','corpo','mao1'],esquerda:['mao2','corpo','mao1']};
function quadroComArma(d,maos,armas,vista){
 if(!d||!d.pixels)return null;
 // grupos de camadas; sem as camadas Mão 1/Mão 2, o desenho todo é o corpo
 const cam=Array.isArray(d.camadas)&&d.camadas.length>1?d.camadas.filter(c=>c&&c.visivel!==false):null,grupo={mao2:[],corpo:[],mao1:[]};
 if(cam&&cam.some(c=>/^mao [12]$/.test(normCamada(c.nome))))for(const c of cam){const n=normCamada(c.nome);grupo[n==='mao 2'?'mao2':n==='mao 1'?'mao1':'corpo'].push(pixelArt({w:d.w,h:d.h,palette:c.palette,pixels:c.pixels}))}
 else grupo.corpo.push(pixelArt(d));
 // folga para a arma não sair do quadro: dos lados igual (o centro não muda) e em cima o quanto precisar
 const pecas=[];let fx=0,fy=0;
 for(const[k,a]of[['mao2',armas[1]],['mao1',armas[0]]]){const m=maos[k];if(!m||!a)continue;
  const g=(+m.giro||0)*Math.PI/180,s=m.espelho?-1:1,cs=Math.cos(g),sn=Math.sin(g);
  for(const[px,py]of[[0,0],[a.c.width,0],[0,a.c.height],[a.c.width,a.c.height]]){const ax=px-a.e.x-.5,ay=py-a.e.y-.5,X=s*(ax*cs-ay*sn)+m.x+.5,Y=ax*sn+ay*cs+m.y+.5;fx=Math.max(fx,Math.ceil(-X),Math.ceil(X-d.w));fy=Math.max(fy,Math.ceil(-Y))}
  pecas.push([k,m,a,g,s])}
 const c=mkCanvas(d.w+2*fx,d.h+fy),g=c.getContext('2d');g.imageSmoothingEnabled=false;
 const poe=l=>l.forEach(x=>x&&g.drawImage(x,fx,fy));
 const poeArma=k=>{for(const[kk,m,a,giro,s]of pecas)if(kk===k){g.save();g.translate(fx+m.x+.5,fy+m.y+.5);g.scale(s,1);g.rotate(giro);g.drawImage(a.c,-a.e.x-.5,-a.e.y-.5);g.restore()}};
 for(const parte of ORDEM_MAOS[vista]||ORDEM_MAOS.lado){if(parte!=='corpo')poeArma(parte);poe(grupo[parte])}
 c.pad=(+d.pad||0)+fx;c.pixelData=d;return c}
const temMao=d=>!!(d&&(d.mao1||d.mao2));
const animTemMao=A=>!!A&&Object.values(A).some(l=>Array.isArray(l)&&l.some(temMao));
function primeiraMao(A,k){if(!A)return null;for(const l of[A.idle,...Object.values(A)])if(Array.isArray(l))for(const d of l)if(d&&d[k])return d[k];return null}
// animação {idle, walk, attack, ...} de dados → quadros prontos (canvas) com as armas; base = mãos do primeiro quadro
function animComArma(A,armas,base,espelhoPadrao,k,vista){
 if(!A)return A;const o={...A};
 for(const nome of Object.keys(A)){const l=A[nome];if(!Array.isArray(l))continue;let m1=base.mao1,m2=base.mao2;const n=l.length;
  o[nome]=l.map((d,i)=>{if(!d||!d.pixels)return d;if(d.mao1)m1=d.mao1;if(d.mao2)m2=d.mao2;
   const auto=nome==='attack'&&n>1?giroGolpe(i/(n-1)):0;
   // o golpe padrão é só da mão 1 (o escudo/arma da mão 2 fica firme, a não ser que o quadro diga o giro)
   const mk=(m,own,giroPadrao)=>m&&{x:+m.x,y:+m.y,espelho:own&&own.espelho!=null?!!own.espelho:m.espelho!=null?!!m.espelho:espelhoPadrao,giro:own&&Number.isFinite(+own.giro)?+own.giro:giroPadrao};
   return reduzCanvas(quadroComArma(d,{mao1:mk(m1,d.mao1,auto),mao2:mk(m2,d.mao2,0)},armas,vista),k)||d})}
 return o}
L('monsters').forEach(m=>{
 if(!m.id)return;
 const s=m.stats||{},base=SP[m.base]?m.base:'sl',atk=n(m.attackSpeed)||(CL[m.classId]&&CL[m.classId].attackSpeed)||1; /* sem classe base: intervalo de ataque do próprio monstro (projetos antigos: o da classe que ele tinha) */
 const equipment=(Array.isArray(m.equipment)?m.equipment:[]).map(id=>D.items.find(it=>it.id==id)).filter(Boolean);
 // com 'ataque do nível' o dano vem da tabela do nível: a arma equipada só dá o alcance/visual e os outros atributos (não soma dano)
 const total={},weaponRanges=[];equipment.forEach(it=>{const stats={...it.stats},range=it.kind==='weapon'&&!m.ataqueDoNivel&&weaponDamageRange(it);if(it.kind==='weapon'&&m.ataqueDoNivel)delete stats.dmg;if(range){stats.dmg=(range.min+range.max)/2;weaponRanges.push(range)}Object.keys(stats).forEach(k=>{total[k]=(total[k]||0)+n(stats[k])})});
 // dano do ataque básico do próprio monstro (Engine › Ataque básico): mínimo–máximo sorteado a cada golpe, como o de uma arma
 let basico=null;try{basico=weaponDamageRange(m)}catch(e){console.warn('Monstro "'+(m.name||m.id)+'": dano do ataque básico inválido ('+e.message+')')}
 if(basico&&!m.ataqueDoNivel){total.dmg=(total.dmg||0)+(basico.min+basico.max)/2;weaponRanges.push(basico)} // com ataqueDoNivel o dano vem da tabela do nível (state.js)
 const weapon=equipment.find(it=>it.kind=='weapon')||null,createdSkills=(Array.isArray(m.skills)?m.skills:[]).map(id=>D.skills.find(k=>k.id==id)).filter(k=>k&&(!k.category||k.category=='ability')&&skillWeaponAllowed({wt:k.weaponTypes},weapon)).map(k=>({
  id:k.id,name:k.name||'Habilidade',cost:n(k.mana),cd:Math.max(.3,n(k.cd,3)),range:n(k.monRange)||(k.effect=='nova'?n(k.radius,30):weapon&&weapon.basic?n(weapon.basic.rng,30):30),damageModel:k.damageModel||'legacy',physicalFlat:n(k.physicalFlat),physicalPercent:n(k.physicalPercent),magicFlat:n(k.magicFlat),magicPercent:n(k.magicPercent),
  actionStats:k.actionStats,bonuses:k.bonuses,bonusDuration:n(k.bonusDuration,5),effect:k.effect,windup:conj(k)>0?conj(k):.5,damage:n(k.base),per:n(k.per),charPercent:n(k.charPercent),effects:Array.isArray(k.effects)?k.effects:[],magic:k.damageType=='magic'||k.damageType!='physical'&&!!(weapon&&weapon.damageType=='magic'),radius:n(k.radius),flatDamage:true,scaleStat:k.scaleStat||'none',scalePercent:n(k.scalePercent,k.scaleStat&&k.scaleStat!='none'?100:0),vfx:k.vfx||'arcane',vfxColor:k.color||k.c2||'#9bd4ff'
 }));
 const k=fatorMonstro(m);
 // arma na mão (quadros com mão marcada): mão 1 = a primeira arma que não é escudo; mão 2 = o escudo ou a segunda arma
 const armasEq=equipment.filter(it=>it.kind==='weapon'),a1=armasEq.find(it=>it.wtype!=='escudo')||armasEq[0]||null,a2=armasEq.find(it=>it!==a1&&it.wtype==='escudo')||armasEq.find(it=>it!==a1)||null;
 const armasV=v=>[armaDesenho(a1,v),armaDesenho(a2,v)],armas=armasV('lado'),dirs=m.direcoes&&typeof m.direcoes=='object'?m.direcoes:{};
 const comMao=(armas[0]||armas[1])&&(temMao(m.sprite)||animTemMao(m.animation)||Object.values(dirs).some(animTemMao));
 const baseMao=A=>({mao1:primeiraMao(A,'mao1')||m.sprite&&m.sprite.mao1,mao2:primeiraMao(A,'mao2')||m.sprite&&m.sprite.mao2});
 const parado=x=>x&&{espelho:false,...x,giro:0},b0=comMao?baseMao(m.animation):{},s0=m.sprite||{};
 const sprite=(comMao&&reduzCanvas(quadroComArma(m.sprite,{mao1:parado(s0.mao1||b0.mao1),mao2:parado(s0.mao2||b0.mao2)},armas,'lado'),k))||reduzido(m.sprite,k),sp=sprite?{d:sprite,u:sprite,s:sprite,ds:sprite,us:sprite,w:null}:null;
 const reduzirAnim=A=>k<1&&A?{...A,...Object.fromEntries(Object.keys(A).filter(a=>Array.isArray(A[a])).map(a=>[a,(A[a]||[]).map(f=>reduzido(f,k)).filter(Boolean)]))}:A;
 // de costas e do lado esquerdo a arma vem espelhada (como o serrote), a não ser que o quadro diga outra coisa
 const vista=(A,esp,v)=>comMao?animComArma(A,armasV(v),baseMao(A),esp,k,v):reduzirAnim(A);
 const animation=vista(m.animation,false,'lado'),direcoes=m.direcoes&&typeof m.direcoes=='object'?{frente:vista(m.direcoes.frente,false,'frente'),costas:vista(m.direcoes.costas,true,'costas'),esquerda:vista(m.direcoes.esquerda,true,'esquerda')}:null;
 /* semArma: os mesmos quadros sem a arma na mão (Chefe Glooc depois de arremessar o machado) */
 const semArma=m.semArma&&m.semArma.animation?{animation:reduzirAnim(m.semArma.animation),direcoes:m.semArma.direcoes?{frente:reduzirAnim(m.semArma.direcoes.frente),costas:reduzirAnim(m.semArma.direcoes.costas),esquerda:reduzirAnim(m.semArma.direcoes.esquerda)}:null}:null;
 MONSTER_TYPES[m.id]={name:m.name||m.id,stats:{F:n(s.F,5),A:n(s.A,3),I:n(s.I,3)},attributeStats:s,perLevel:m.per&&typeof m.per=='object'?m.per:null,tags:lc(m.tags),custom:true,ataqueDoNivel:!!m.ataqueDoNivel,sprite,sp,animation,direcoes,semArma,size:n(m.size,100),attackSpeed:atk,moveSpeed:n(m.moveSpeed),hpMult:n(m.hpMult)||1,dmgMult:n(m.dmgMult)||1,
  bossType:['boss','grandboss'].includes(m.bossType)?m.bossType:'normal',equipment:{stats:total,weaponRanges,weapon:weapon?{damageType:weapon.damageType=='magic'?'magic':'physical',basic:weapon.basic||{},effects:Array.isArray(weapon.effects)?weapon.effects:[]}:null},
  drops:normDrops(m),skills:createdSkills,nivelMin:n(m.minLevel,0), // nível mínimo de aparição: base do +8% de dano por nível (multNivelMonstro)
  ia:{esquiva:!!(m.ia&&m.ia.esquiva===true),distancia:!!(m.ia&&m.ia.distancia===true),lado:!!(m.ia&&m.ia.lado===true)}, // táticas (update.js iaTatica); padrão: todas desligadas (ligue na Engine)
  // chefe com mecânicas (js/chefes.js) e fúria abaixo de X% da vida
  mecanicas:Array.isArray(m.mecanicas)&&m.mecanicas.length?m.mecanicas.filter(x=>x&&x.tipo):null,furia:n(m.furia)};
 const f=n(s.F,5),pow=weapon&&weapon.damageType=='magic'?n(s.I,3)*5:f*3;
 MB[m.id]={max:40+f*5,dmg:pow+n(total.dmg),spd:28+n(s.A,3)*.45,xp:n(m.xp,0),xpFixo:n(m.xp,0), /* XP 0 = pela fórmula (nível) */g:n(m.gold,5),aggro:n(m.aggro,65),wu:.4,ac:Math.max(.3,atk),base};
 if(m.id!='boss'&&!['boss','grandboss'].includes(m.bossType))CM[m.id]={min:n(m.minLevel,1),max:n(m.maxLevel,999),w:Math.max(.1,n(m.weight,1))}});
const ids=Object.keys(CM);
if(ids.length){
 pickType=function(far){
  const c=ids.filter(k=>k!='gob'&&CM[k].min<=p.lvl&&CM[k].max>=p.lvl);
  if(c.length&&Math.random()<Math.min(.6,.2*c.length)){let r=Math.random()*c.reduce((a,k)=>a+questSpawnWeight(k,CM[k].w),0);for(const k of c){r-=questSpawnWeight(k,CM[k].w);if(r<=0)return k}return c[0]}
  return far?'gob':'sl'};
 window.repop=()=>en.forEach(e=>{if(!e.boss&&e.hp>0)spawn(e)});
 repop()}
const questBoss=en.find(e=>e.boss);
if(questBoss&&MONSTER_TYPES.boss&&MONSTER_TYPES.boss.custom){configureMonster(questBoss,'boss',questBoss.lvl);questBoss.hp=questBoss.max}
/* chefe da missão inicial (2026-10-28, pedido do usuário): é o Glooc Saqueador do projeto (glooc_saqueador, editável na
   Engine) e o tipo embutido "boss" sai da lista de monstros. Sem ele no projeto, fica o embutido. */
else if(questBoss&&MONSTER_TYPES.glooc_saqueador){const x=questBoss.x,y=questBoss.y;configureMonster(questBoss,'glooc_saqueador',questBoss.lvl);questBoss.boss=true;questBoss.x=x;questBoss.y=y;questBoss.hp=questBoss.max;delete MONSTER_TYPES.boss}
applySkills();
})();
