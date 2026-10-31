/* ---------- Runtime da Engine (?motor=1) ----------
   O jogo é carregado de forma invisível dentro da Engine (editor.html) para que o editor use exatamente as mesmas
   artes, terreno e regras do jogo. Nada aqui existe para o jogador: no jogo normal este arquivo não faz nada. */
(function(){
 /* Play da Engine (?teste=1): posição inicial, DG, classe e nível escolhidos na Engine. */
 if(MODO.teste)addEventListener('load',()=>{
  const q=new URLSearchParams(location.search),cls=q.get('classe'),nivel=+q.get('nivel')||0;
  if(q.has('novo')){if(cls)TESTE.classe(cls);for(let i=1;i<Math.min(nivel,CALC.maxLevel);i++)TESTE.nivel();TESTE.curar()}
  if(MODO.dg)TESTE.entrarDG(MODO.dg);
  else if(q.get('cena')==='arena'&&window.ARENA)setTimeout(()=>ARENA.entrar(),300); // Play na cena Arena
  else if(q.get('cena')==='taverna'&&window.entrarTaverna)setTimeout(()=>entrarTaverna(),300); // Play na cena Taverna
  else if(MODO.x!=null&&MODO.y!=null&&!TESTE.teleportar(MODO.x,MODO.y))ft(p.x,p.y-30,'Ponto escolhido não é caminhável; começando no acampamento.','#ffd84a');
  try{parent!==window&&parent.ENGINE&&parent.ENGINE.jogoPronto(window)}catch(e){}
 });
 if(!MODO.motor)return;
 document.documentElement.classList.add('modoMotor');
 const safe=s=>encodeURIComponent(String(s)).replace(/[!'()*]/g,c=>'%'+c.charCodeAt(0).toString(16)).replace(/%/g,'_');
 const image=src=>new Promise((ok,bad)=>{const im=new Image();im.onload=()=>{const c=mkCanvas(im.width,im.height);c.getContext('2d').drawImage(im,0,0);ok(c)};im.onerror=()=>bad(new Error('Não foi possível carregar uma arte.'));im.src=src});
 const monsterBase=id=>{const d=GAMEDATA.monsters.find(m=>m.id==id);return (MB[id]&&MB[id].base)||(d&&d.base)||id};
 const monsterDefault=id=>(SP[monsterBase(id)]||SP[id]||SP.sl).d;
 const classDefault=id=>(HS[CL[id]?.base]||HS[id]||HS.war).d;
 // arma sem desenho da mão: o jogo empunha o próprio ícone (mesma escala)
 function defaultEquippedWeapon(d){const it=ITEMS[d.id];return it&&(it.equippedSprite||it.c)||null}
 // roupa padrão na grade do herói 16×26 (js/sprites.js), pintada nas regiões do molde e contornada
 function defaultEquippedArmor(d,dir){
  const c=mkCanvas(HT.W,HT.H),x=c.getContext('2d'),R=(a,b,w,h,col)=>{x.fillStyle=col;x.fillRect(a,b,w,h)},P=(a,b,col)=>R(a,b,1,1,col),slot=d.slot=='ri'?'r1':d.slot||'ch';
  const item=ITEMS[d.id]||{v:{c:[d.c1||'#9aa7b8',d.c2||'#c9a227'],st:+d.style||0}},equipment={[slot]:item},dd=(dir||'d')[0],dg=(dir||'').length>1,G=moldeDe(dir||'d',0);
  gearPre(equipment,dd,R);gearBody(equipment,dd,dg,R,P,G);gearHead(equipment,dd,dg,R,P,G);
  if(slot=='sh'&&dd=='d'){const [m,a]=item.v.c;R(1,14,4,6,m);R(1,14,4,1,a);R(2,15,2,1,a);R(2,16,1,3,a);R(1,19,4,1,shade(m,.75))}
  return contornar(c)
 }
 const skillIcon=id=>{const entry=Object.keys(CL).flatMap(c=>skillEntries(c)).find(s=>s.id==id),d=GAMEDATA.skills.find(s=>s.id==id);return entry&&entry.ic||(d?SKI(d.icon||'orb',d.c1||'#4a6a96',d.c2||'#fff'):null)};
 window.MOTOR={
  // prévia das cenas fixas (arena, taverna) para o painel de cenas da Engine
  previaCena:id=>{const f=window.CENA_PREVIA&&CENA_PREVIA[id];return f?f():null},
  // cena Taverna editável: layout padrão, fundo fixo e as peças móveis (js/taverna.js)
  taverna:()=>window.TAVERNA_MOTOR||null,
  infoHabilidade:id=>window.infoHabilidade?infoHabilidade(id):null,
  versao:1,
  mundo:()=>({W,T,N,CX,CY,campo:CAMP_SAFE_HALF_SIZE,portalAcampamento:{x:campPortal.x,y:campPortal.y},pontes:RBR.slice()}),
  terreno:()=>map,
  /* terreno sem o chão pintado: a Engine desenha a pintura por cima, ao vivo */
  terrenoBase:()=>mapBase,
  /* terreno original da ilha, ignorando a pintura (a Engine combina com a pintura atual) */
  terrenoLivreBase(x,y){const i=Math.floor(x/T),j=Math.floor(y/T);if(i<0||j<0||i>=N||j>=N||V(i,j)>=28.5)return false;return !(inRiver(x,y)&&!onBridge(x,y))},
  terrenoLivre:(x,y)=>groundFree(x,y),
  tipoTerreno(x,y){x=Math.floor(x);y=Math.floor(y);if(!(x>=0&&y>=0&&x<W&&y<W))return 'fora';const k=islandTerrainMask[y*W+x];return k===6?(CHAO_GRID[Math.floor(y/T)*N+Math.floor(x/T)]?.name||'chão pintado'):['grama','areia','vazio','terra','rio','ponte'][k]},
  tipoTerrenoBase(x,y){x=Math.floor(x);y=Math.floor(y);if(!(x>=0&&y>=0&&x<W&&y<W))return 'fora';const v=V(x/T|0,y/T|0);return v>28.6?'vazio':inRiver(x,y)?(onBridge(x,y)?'ponte':'rio'):v>26.2?'areia':Math.hypot((x-CX)/T,(y-CY)/T)<5.9||caminhoDist(x,y)<6?'terra':'grama'},
  /* árvores dos bosques da borda nova (a Engine grava no projeto ao converter uma ilha antiga) */
  arvoresDoAnel:existentes=>arvoresDoAnel(existentes),
  arvoresDaIlha:()=>arvoresDaIlha(),elementosDaIlha:arvores=>elementosDaIlha(arvores),noCaminho:(x,y)=>terraDist(x,y)<12||inRiver(x,y,4),
  npcs:()=>NPCS.filter(n=>n.x>-1000).map(n=>({nome:n.nm,cls:n.cls,x:n.x,y:n.y,sprite:(CL[n.cls]&&CL[n.cls].sprite)||HS[n.cls]?.d||null})),
  tiposElemento:()=>Object.entries(MAP_ELEMENT_TYPES).filter(([id])=>!id.startsWith('px:')).map(([id,t])=>({id,nome:t.name,raio:t.radius,solido:!!t.blocks,variantes:sceneryVariants(id)})),
  arteArvore:(x,y)=>(window.TREEV&&TREEV[treeVar({x,y})])||TREE,
  arteElemento:(e,lista)=>window.sceneryArt(e,lista||[]),
  previaElemento:(tipo,variante=0)=>{const s=window.sceneryPreview(tipo,variante);return s&&s.c},
  arteMapa:(tipo,variante)=>{const s=tipo=='tree'?{c:TREE_DEFAULT[variante]}:window.sceneryDefault(tipo,variante);return s&&s.c},
  monstro:id=>MONSTER_TYPES[id]?.sprite||monsterDefault(id),
  monstroPadrao:base=>(SP[base]||SP.sl).d,
  monstrosEmbutidos:()=>Object.keys(MONSTER_TYPES).filter(id=>!GAMEDATA.monsters.some(m=>m.id==id)).map(id=>({id,nome:MONSTER_TYPES[id].name||id,bossType:MONSTER_TYPES[id].bossType||'normal'})),
  calcPadrao:()=>({...CALC_DEF}),
  /* Prévia de balanceamento (Engine › Prévia): monta o herói e o monstro com as regras do jogo e calcula a luta.
     o = {calc, cls, lvl, rank, itens:[id], qualidade, monstro, nivelMon, elite}. Tudo é restaurado no fim. */
  previa(o){
   const salva={cls:p.cls,lvl:p.lvl,cp:p.classProgress,st:p.st,buffs:p.attributeBuffs,bf:p.bf,eq:{...EQ},calc:{...CALC},tb:p.attackBasic};
   // média exata do golpe: os sorteios (dano entre mínimo e máximo) passam por valores espalhados por igual, sem acaso
   const media=f=>{const n=24,sorteio=Math.random;let s=0;try{for(let i=0;i<n;i++){Math.random=()=>(i+.5)/n;s+=f()}}finally{Math.random=sorteio}return s/n},soma=d=>d&&typeof d=='object'?(d.physical||0)+(d.magic||0):+d||0;
   try{
    Object.assign(CALC,CALC_DEF,o.calc||{});
    if(CL[o.cls])p.cls=o.cls;p.lvl=Math.max(1,Math.floor(+o.lvl||1));p.classProgress={[p.cls]:{rank:Math.max(1,Math.min(10,Math.floor(+o.rank||1))),xp:0}};
    p.st=null;p.attributeBuffs=[];p.bf=0;p.attackBasic=null;for(const s of SLOTS)EQ[s]=null;
    for(const id of o.itens||[]){const t=gearType[id];if(!t)continue;const sl=t=='ri'?(!EQ.r1?'r1':'r2'):t=='sw'&&EQ.sw&&!ITEMS[id].th?'sh':t;if(!EQ[sl])EQ[sl]={id,n:1,q:o.qualidade??50}}
    applySkills();
    const a=attributes(),b=basic(),golpeMedio={physical:media(()=>basicAttackDamage(b).physical||0),magic:media(()=>basicAttackDamage(b).magic||0)};
    const heroi={F:a.F,A:a.A,I:a.I,vida:mhp(),mana:mmp(),poderFisico:Math.round(physicalPower()),poderMagico:Math.round(magicPower()),golpe:Math.round(soma(golpeMedio)),tipo:b.damageType=='magic'?'mágico':'físico',
     defesaFisica:armor(),defesaMagica:magicArmor(),intervalo:+attackInterval().toFixed(2),velocidade:Math.round(CALC.move*(1+spdB())),regenVida:+regenHp().toFixed(2),regenMana:+regenMp().toFixed(2),
     critico:Math.round((bonus('critChance')+critAgi(p))*100),danoCritico:Math.round(150+(bonus('critDamage')+critAgi(p))*100),equipamentos:Object.entries(EQ).filter(([,s])=>s).map(([sl,s])=>sl+':'+s.id)};
    let mon=null,luta=null;
    if(MONSTER_TYPES[o.monstro]&&window.spawnAt){
     const e=spawnAt(0,0,o.monstro,Math.max(1,Math.floor(+o.nivelMon||1)));if(o.elite)makeElite(e);
     const base=e.weaponRanges?.length?(e.weaponDamageBase??e.dmg)*(e.weaponDamageMultiplier||1):e.dmg,extra=k=>attributeValue(e.attributeStats,k);
     const golpeMon=e.attackMagic?{physical:monsterAttribute(e,'physicalDmg'),magic:base+extra('magicDmg')}:{physical:base+extra('physicalDmg'),magic:monsterAttribute(e,'magicDmg')};
     mon={nome:MONSTER_TYPES[o.monstro].name||o.monstro,nivel:e.lvl,elite:!!e.elite,F:e.stats.F,A:e.stats.A,I:e.stats.I,vida:Math.round(monsterMaxHp(e)),mana:Math.round(monsterMaxMp(e)),golpe:Math.round(soma(golpeMon)),tipo:e.attackMagic?'mágico':'físico',
      defesaFisica:Math.round(e.armor),defesaMagica:Math.round(e.magicArmor),intervalo:+e.ac.toFixed(2),velocidade:Math.round(e.spd),xp:e.xp,ouro:e.g,habilidade:e.skill&&e.skill.cost<999999?e.skill.name:null};
     // mesmas contas do hurtE (defesa do monstro com piso) e do hurtP (defesa do herói)
     const noMon=(v,def)=>Math.max(0,v-def),noHeroi=(v,def)=>Math.max(0,v-def); // dano − defesa, igual ao jogo
     const heroiBate=noMon(golpeMedio.physical,e.armor)+noMon(golpeMedio.magic,e.magicArmor),monBate=noHeroi(golpeMon.physical,armor())+noHeroi(golpeMon.magic,magicArmor());
     const golpesH=Math.ceil(mon.vida/Math.max(1,heroiBate)),golpesM=Math.ceil(heroi.vida/Math.max(1,monBate));
     luta={heroiBate:Math.round(heroiBate),monBate:Math.round(monBate),golpesParaMatar:golpesH,segundosParaMatar:+(golpesH*heroi.intervalo).toFixed(1),golpesParaMorrer:golpesM,segundosParaMorrer:+(golpesM*mon.intervalo).toFixed(1),
      dpsHeroi:+(heroiBate/heroi.intervalo).toFixed(1),dpsMonstro:+(monBate/mon.intervalo).toFixed(1)};
     // empate: os dois caem no mesmo instante (mesma conta de tempo, arredondada a 0,1 s)
     luta.empate=luta.segundosParaMatar===luta.segundosParaMorrer;luta.vence=!luta.empate&&luta.segundosParaMatar<luta.segundosParaMorrer;
    }
    return {heroi,monstro:mon,luta};
   }finally{
    Object.assign(CALC,salva.calc);p.cls=salva.cls;p.lvl=salva.lvl;p.classProgress=salva.cp;p.st=salva.st;p.attributeBuffs=salva.buffs;p.bf=salva.bf;p.attackBasic=salva.tb;Object.assign(EQ,salva.eq);
    try{applySkills()}catch(e){}
   }
  },
  bases:()=>Object.keys(SP).filter(k=>SP[k]&&SP[k].d),
  item:id=>ITEMS[id]?.c||null,
  itemChao:id=>ITEMS[id]?.itemSprite||ITEMS[id]?.c||null,
  itemEquipado:(id,dir)=>{const d=GAMEDATA.items.find(i=>i.id==id);if(!d)return null;const it=ITEMS[id];if(!dir)return it&&it.equippedSprite||defaultEquippedWeapon(d);return it&&equippedArt(it,dir)||(d.kind=='weapon'?defaultEquippedWeapon(d):defaultEquippedArmor(d,dir))},
  classe:id=>CL[id]?.sprite||classDefault(id),
  classeBase:base=>(HS[base]||HS.war).d,
  heroi:(cls,sex,eq)=>{const E={nude:1,sex:sex||'m',swing:0,shWeapon:!!(eq&&eq.sh&&gearType[eq.sh]=='sw')};for(const [s,id] of Object.entries(eq||{}))if(ITEMS[id])E[s]=ITEMS[id];return human(CL[cls]?.base||cls||'war','d',0,E)},
  aparenciaCorpo:(sex,dir,ph)=>APARENCIA.corpoPadrao(sex,dir,ph),
  aparenciaCabelo:(estilo,dir)=>APARENCIA.cabeloPadrao(estilo,dir),
  aparenciaHeroi:(sex,look,dir)=>human('war',dir||'d',0,{nude:1,sex,look:APARENCIA.normalizar(look,sex)}),
  /* herói usando um desenho em edição (editor de sprites › No personagem): 'arma' = na mão, 'vestido' = roupa (grade 16×26) */
  /* o = {id, ataque, pega (%), slot, dir (direção do desenho vestido), passo (passo do golpe)}: usa a pose e a pega do item */
  heroiComArte:(tipo,data,dir,o={})=>{const art=pixelArt(data);if(!art)return null;const base=o.id&&ITEMS[o.id]||null;
   const E={nude:1,sex:'m',swing:o.passo||0,look:APARENCIA.padrao('m')};
   if(tipo==='arma'){const ataque=POSES_ARMA[o.ataque]?o.ataque:base&&POSES_ARMA[base.ataque]?base.ataque:'corte';
    const pega=o.pega!=null&&o.pega!==''?Math.max(0,Math.min(1,+o.pega/100)):base&&base.pega!=null?base.pega:.7;
    // o.engate {x,y}: pixel de engate em pixels do desenho (js/sprites.js engateArma); sem ele, a pega
    const k=art.width/(data.w||art.width),engate=o.engate&&Number.isFinite(+o.engate.x)?{x:+o.engate.x*k,y:+o.engate.y*k}:null;
    // o.dir: desenho de uma posição (d frente, u costas, s lados) na mão; sem ele, o desenho principal (ícone/empunhada) e as
    // posições próprias que o item já tem (ex.: de costas o escudo mostra o desenho de costas)
    const prop={...(base&&base.equippedSprites||{})};
    E.sw={...(base||{v:{c:['#9aa7b8','#7a4a25'],st:0}}),equippedAnim:null,escalaMao:2,pega,ataque,engate:engate||(o.dir&&base?base.engate:null),
     ...(o.dir?{equippedSprites:{...prop,[o.dir]:art}}:{equippedSprite:art,equippedSprites:prop})}}
   else{const slot=o.slot||'ch';E[slot]={...(base||{v:{c:['#9aa7b8','#9aa7b8'],st:0}}),equippedAnim:null,equippedSprites:{...(base&&base.equippedSprites||{}),[o.dir||'d']:art}}}
   return human('war',dir||'d',0,E)},
  aparenciaPadrao:()=>({estilos:APARENCIA.ESTILOS,cores:APARENCIA.CORES,ref:APARENCIA.REF}),
  habilidade:id=>skillIcon(id),
  passiva:id=>{const d=[...GAMEDATA.passives,...GAMEDATA.skills].find(p=>p.id==id);return d?passIcon(d):null},
  efeito:id=>FX_INFO[id]?fxIcon(id):null,
  efeitosEmbutidos:()=>Object.fromEntries(Object.entries(FX_INFO).map(([id,f])=>[id,{n:f.n,c:f.c,kind:f.kind,good:!!f.good,tick:f.tick,dtype:f.dtype,dur:f.dur,power:f.power,stacks:f.stacks}])),
  temasDG:()=>window.DG_DRAW.temas,
  decoracoesDG:()=>window.DG_DRAW.decoracoes,
  desenharDecoracao:(d,g)=>window.DG_DRAW.decoracao(d,g),
  desenharPorta:(d,g)=>window.DG_DRAW.porta(d,g),
  desenharPortal:(x,y,tipo,ativo,g)=>window.DG_DRAW.portal(x,y,tipo,ativo,g),
  arteAmbiente:id=>{const e=gameArtEntries().find(e=>e.id==id);return e?{canvas:gameArtCanvas(id),ax:e.ax??.5,ay:e.ay??1,w:e.w,h:e.h}:null},
  bau:(tier,estilo,aberto)=>window.dungeonChestSprite(tier,estilo,aberto),
  ferreiro:()=>SPRITE_BLACKSMITH.idle,
  async catalogo(){
   const arts=[],add=(group,id,c,name,extra={})=>{if(c)arts.push({path:group+'/'+safe(id),name:name||id,canvas:c,...extra})};
   for(const [id,it] of Object.entries(ITEMS)){
    const name=it.n.split(' (')[0];
    add('itens',id,it.c,name);/* no chão = o próprio ícone (o desenho "no chão" saiu, 2026-10-30) */
    for(const [dir,c] of Object.entries(it.equippedSprites||{}))add('equipados',id+'-'+dir,c,name+' — '+({d:'frente',u:'costas',s:'lados'}[dir]||dir));
    if(gearType[id]=='sw'){const d=GAMEDATA.items.find(d=>d.id==id);if(d)add('armas-equipadas',id,it.equippedSprite||defaultEquippedWeapon(d),d.name)}
   }
   for(const [id,m] of Object.entries(MONSTER_TYPES))add('monstros',id,m.sprite||monsterDefault(id),m.name,{monsterId:id});
   for(const [id,c] of Object.entries(CL))add('classes',id,c.sprite||classDefault(id),c.n);
   // aparência do personagem (js/aparencia.js): corpo por sexo, direção e passo; cabelo por estilo e direção
   if(window.APARENCIA){const A=APARENCIA,DN={d:'frente',ds:'diagonal frente',s:'lado',us:'diagonal costas',u:'costas'};
    for(const sex of ['m','f'])for(const dir of A.DIRS)for(const ph of A.FASES)add('aparencia','corpo-'+sex+'-'+dir+'-'+ph,A.corpoArte(sex,dir,ph),'Corpo '+(sex=='f'?'feminino':'masculino')+' · '+DN[dir]+' · '+(ph?'passo '+ph:'parado'));
    for(const e of A.estilos())for(const dir of A.DIRS)add('aparencia','cabelo-'+e.id+'-'+dir,A.cabeloArte(e.id,dir),'Cabelo '+e.nome+' · '+DN[dir])}
   for(const [group,sets] of [['sprites',SP],['personagens',HS]])for(const [id,set] of Object.entries(sets))for(const dir of DIRS){add(group,id+'-'+dir,set[dir],id+' '+dir);(set.w&&set.w[dir]||[]).forEach((c,i)=>add(group,id+'-'+dir+'-'+(i+1),c,id+' '+dir+' '+(i+1)))}
   for(const d of GAMEDATA.skills){const ic=d.sprite?pixelArt(d.sprite):skillIcon(d.id);add('habilidades',d.id,typeof ic=='string'?await image(ic):ic,d.name)}
   for(const [id,f] of Object.entries(FX_INFO))add('efeitos',id,await image(fxIcon(id)),f.n);
   for(const d of [...GAMEDATA.passives,...GAMEDATA.skills.filter(d=>d.category=='passive')])add('passivas',d.id,await image(passIcon(d)),d.name);
   for(const t of ['tree'])for(let vi=0;vi<(t=='tree'?TREEV.length:sceneryVariants(t));vi++){
    const d=mapArtOverride(t,vi),def=sceneryDefault(t,vi);add('mapa',t+'-'+(vi+1),d?pixelArt(d):def&&def.c,(MAP_ELEMENT_TYPES[t]?.name||'Árvore')+' '+(vi+1),{mapType:t,variant:vi,ax:d&&d.ax!=null?d.ax:def&&def.ax,ay:d&&d.ay!=null?d.ay:def&&def.ay});
   }
   for(const entry of gameArtEntries())add('ambiente',entry.id,gameArtCanvas(entry.id),entry.name);
   // ícones dos filtros da mochila (ui.js): desenhe aqui para trocar no jogo
   if(window.INV_FILTRO_ORIGINAIS)for(const [id,label] of INV_CATEGORIES)add('interface','filtro-'+id,INV_FILTRO_ORIGINAIS[id],'Filtro da mochila: '+label);
   add('mapa','arvore-legado',TREE,'Árvore original');add('mapa','tenda',TENT,'Tenda');
   add('personagens','ferreiro',SPRITE_BLACKSMITH.idle,'Ferreiro');
   for(const [id,c] of Object.entries(DG_BOSS_ICONS))add('masmorra',id,typeof c=='string'?await image(c):c,id);
   for(const [tier] of (window.BAUS?BAUS.TIPOS:[]))for(const opened of [false,true])add('baus',tier+'-'+(opened?'aberto':'fechado'),dungeonChestSprite(tier,'',opened),BAUS.NOME[tier]+(opened?' aberto':' fechado'));
   return arts
  }
 };
 try{parent!==window&&parent.ENGINE&&parent.ENGINE.runtimePronto(window.MOTOR)}catch(e){console.warn('Engine indisponível:',e)}
})();
