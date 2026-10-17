/* ---------- Runtime da Engine (?motor=1) ----------
   O jogo é carregado de forma invisível dentro da Engine (editor.html) para que o editor use exatamente as mesmas
   artes, terreno e regras do jogo. Nada aqui existe para o jogador: no jogo normal este arquivo não faz nada. */
(function(){
 /* Play da Engine (?teste=1): posição inicial, DG, classe e nível escolhidos na Engine. */
 if(MODO.teste)addEventListener('load',()=>{
  const q=new URLSearchParams(location.search),cls=q.get('classe'),nivel=+q.get('nivel')||0;
  if(q.has('novo')){if(cls)TESTE.classe(cls);for(let i=1;i<Math.min(nivel,CALC.maxLevel);i++)TESTE.nivel();TESTE.curar()}
  if(MODO.dg)TESTE.entrarDG(MODO.dg);
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
 function defaultEquippedWeapon(d){
  const c=mkCanvas(32,32),x=c.getContext('2d'),R=(a,b,w,h,col)=>{x.fillStyle=col;x.fillRect(a,b,w,h)},it=ITEMS[d.id],v=it&&it.v||{};
  drawWeapon(R,v.st==null?Math.max(0,Math.min(2,+d.style||0)):v.st,v.c||[d.c1||'#9aa7b8',d.c2||'#c9a227'],16,29,-90,22,2);
  return c
 }
 function defaultEquippedArmor(d,dir){
  const c=mkCanvas(28,32),x=c.getContext('2d'),{box,R}=kit(x),slot=d.slot=='ri'?'r1':d.slot||'ch';
  const item=ITEMS[d.id]||{v:{c:[d.c1||'#9aa7b8',d.c2||'#c9a227'],st:+d.style||0}},equipment={[slot]:item};
  gearPre(equipment,dir,box,R);gearBody(equipment,dir,0,box,R);gearHead(equipment,dir,box,R);
  if(slot=='sh')gearWeapon(equipment,dir,0,box,R,x);
  return c
 }
 const skillIcon=id=>{const entry=Object.keys(CL).flatMap(c=>skillEntries(c)).find(s=>s.id==id),d=GAMEDATA.skills.find(s=>s.id==id);return entry&&entry.ic||(d?SKI(d.icon||'orb',d.c1||'#4a6a96',d.c2||'#fff'):null)};
 window.MOTOR={
  versao:1,
  mundo:()=>({W,T,N,CX,CY,campo:CAMP_SAFE_HALF_SIZE,portalAcampamento:{x:campPortal.x,y:campPortal.y},pontes:RBR.slice()}),
  terreno:()=>map,
  /* terreno sem o chão pintado: a Engine desenha a pintura por cima, ao vivo */
  terrenoBase:()=>mapBase,
  /* terreno original da ilha, ignorando a pintura (a Engine combina com a pintura atual) */
  terrenoLivreBase(x,y){const i=Math.floor(x/T),j=Math.floor(y/T);if(i<0||j<0||i>=N||j>=N||V(i,j)>=28.5)return false;return !(inRiver(x,y)&&!onBridge(x,y))},
  terrenoLivre:(x,y)=>groundFree(x,y),
  tipoTerreno(x,y){x=Math.floor(x);y=Math.floor(y);if(!(x>=0&&y>=0&&x<W&&y<W))return 'fora';const k=islandTerrainMask[y*W+x];return k===6?(CHAO_GRID[Math.floor(y/T)*N+Math.floor(x/T)]?.name||'chão pintado'):['grama','areia','água','acampamento','rio','ponte'][k]},
  tipoTerrenoBase(x,y){x=Math.floor(x);y=Math.floor(y);if(!(x>=0&&y>=0&&x<W&&y<W))return 'fora';const v=V(x/T|0,y/T|0);return inRiver(x,y)&&v<28.6?(onBridge(x,y)?'ponte':'rio'):v>28.6?'água':v>26.2?'areia':Math.hypot(x/T-32,y/T-32)<5.9?'acampamento':'grama'},
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
  bases:()=>Object.keys(SP).filter(k=>SP[k]&&SP[k].d),
  item:id=>ITEMS[id]?.c||null,
  itemChao:id=>ITEMS[id]?.itemSprite||ITEMS[id]?.c||null,
  itemEquipado:(id,dir)=>{const d=GAMEDATA.items.find(i=>i.id==id);if(!d)return null;const it=ITEMS[id];if(!dir)return it&&it.equippedSprite||defaultEquippedWeapon(d);return it&&equippedArt(it,dir)||(d.kind=='weapon'?defaultEquippedWeapon(d):defaultEquippedArmor(d,dir))},
  classe:id=>CL[id]?.sprite||classDefault(id),
  classeBase:base=>(HS[base]||HS.war).d,
  heroi:(cls,sex,eq)=>{const E={nude:1,sex:sex||'m',swing:0,shWeapon:!!(eq&&eq.sh&&gearType[eq.sh]=='sw')};for(const [s,id] of Object.entries(eq||{}))if(ITEMS[id])E[s]=ITEMS[id];return human(CL[cls]?.base||cls||'war','d',0,E)},
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
    add('itens',id,it.c,name);add('itens-chao',id,it.itemSprite||it.c,name+' — no chão');
    for(const [dir,c] of Object.entries(it.equippedSprites||{}))add('equipados',id+'-'+dir,c,name+' — '+({d:'frente',u:'costas',s:'lados'}[dir]||dir));
    if(gearType[id]=='sw'){const d=GAMEDATA.items.find(d=>d.id==id);if(d)add('armas-equipadas',id,it.equippedSprite||defaultEquippedWeapon(d),d.name)}
   }
   for(const [id,m] of Object.entries(MONSTER_TYPES))add('monstros',id,m.sprite||monsterDefault(id),m.name,{monsterId:id});
   for(const [id,c] of Object.entries(CL))add('classes',id,c.sprite||classDefault(id),c.n);
   for(const [group,sets] of [['sprites',SP],['personagens',HS]])for(const [id,set] of Object.entries(sets))for(const dir of DIRS){add(group,id+'-'+dir,set[dir],id+' '+dir);(set.w&&set.w[dir]||[]).forEach((c,i)=>add(group,id+'-'+dir+'-'+(i+1),c,id+' '+dir+' '+(i+1)))}
   for(const d of GAMEDATA.skills){const ic=d.sprite?pixelArt(d.sprite):skillIcon(d.id);add('habilidades',d.id,typeof ic=='string'?await image(ic):ic,d.name)}
   for(const [id,f] of Object.entries(FX_INFO))add('efeitos',id,await image(fxIcon(id)),f.n);
   for(const d of [...GAMEDATA.passives,...GAMEDATA.skills.filter(d=>d.category=='passive')])add('passivas',d.id,await image(passIcon(d)),d.name);
   for(const t of ['tree',...sceneryArtTypes()])for(let vi=0;vi<(t=='tree'?4:sceneryVariants(t));vi++){
    const d=mapArtOverride(t,vi),def=sceneryDefault(t,vi);add('mapa',t+'-'+(vi+1),d?pixelArt(d):def&&def.c,(MAP_ELEMENT_TYPES[t]?.name||'Árvore')+' '+(vi+1),{mapType:t,variant:vi,ax:d&&d.ax!=null?d.ax:def&&def.ax,ay:d&&d.ay!=null?d.ay:def&&def.ay});
   }
   for(const entry of gameArtEntries())add('ambiente',entry.id,gameArtCanvas(entry.id),entry.name);
   add('mapa','arvore-legado',TREE,'Árvore original');add('mapa','tenda',TENT,'Tenda');
   add('personagens','ferreiro',SPRITE_BLACKSMITH.idle,'Ferreiro');
   for(const [id,c] of Object.entries(DG_BOSS_ICONS))add('masmorra',id,typeof c=='string'?await image(c):c,id);
   for(const tier of ['blue','purple','gold'])for(const style of ['classic','wood','crystal','cursed','royal'])for(const opened of [false,true])add('baus',tier+'-'+style+'-'+(opened?'aberto':'fechado'),dungeonChestSprite(tier,style,opened),'Baú '+tier+' '+style+(opened?' aberto':' fechado'));
   return arts
  }
 };
 try{parent!==window&&parent.ENGINE&&parent.ENGINE.runtimePronto(window.MOTOR)}catch(e){console.warn('Engine indisponível:',e)}
})();
