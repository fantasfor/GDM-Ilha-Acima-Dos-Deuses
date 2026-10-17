/* ---------- Artes personalizadas do projeto ----------
   PROJETO.artes guarda desenhos que substituem artes geradas pelo código, indexados pelo caminho do catálogo
   (ex.: "itens/sw", "monstros/sl", "sprites/wolf-d", "mapa/tenda"). Aplicadas uma vez ao carregar o jogo. */
(function(){
 const decodeArtId=s=>s.replace(/_([0-9a-f]{2})/gi,(_,hex)=>String.fromCharCode(parseInt(hex,16)));
 function applyGameArt(path,data){
  if(!data||!data.pixels)return false;
  const canvas=pixelArt(data);if(!canvas)return false;
  const slash=path.indexOf('/'),group=slash<0?'':path.slice(0,slash),id=decodeArtId(slash<0?path:path.slice(slash+1));
  if(group=='itens'&&ITEMS[id]){ITEMS[id].c=canvas;ITEMS[id].ic=canvas.toDataURL();return true}
  if(group=='itens-chao'&&ITEMS[id]){ITEMS[id].itemSprite=canvas;return true}
  if(group=='equipados'){
   const match=id.match(/^(.*)-(d|u|s|ds|us)$/);
   if(match&&ITEMS[match[1]]){
    const item=ITEMS[match[1]];item.equippedSprites=item.equippedSprites||{};item.equippedSprites[match[2]]=canvas;
    for(const key of Object.keys(heroC))delete heroC[key];
    return true
   }
  }
  if(group=='armas-equipadas'&&ITEMS[id]){ITEMS[id].equippedSprite=canvas;return true}
  if(group=='monstros'&&MONSTER_TYPES[id]){
   const monster=MONSTER_TYPES[id];
   monster.sprite=canvas;monster.sp={d:canvas,u:canvas,s:canvas,ds:canvas,us:canvas,w:null};
   for(const enemy of en)if(enemy.ty==id){enemy.img=canvas;enemy.sp=monster.sp}
   return true
  }
  if(group=='classes'&&CL[id]){CL[id].sprite=canvas;return true}
  if(group=='habilidades'||group=='passivas'){
   const entry=[...(GAMEDATA.skills||[]),...(GAMEDATA.passives||[])].find(item=>item.id==id);
   if(entry&&!entry.sprite)entry.sprite=data;
   for(const skill of typeof SK!=='undefined'?SK:[])if(skill.id==id)skill.ic=canvas.toDataURL();
   return !!entry
  }
  if(group=='mapa'){
   const copyInto=target=>{if(!target)return false;target.width=canvas.width;target.height=canvas.height;target.getContext('2d').drawImage(canvas,0,0);return true};
   if(id=='arvore-legado'){canvas.pad=0;if(window.TREEV)window.TREEV[0]=canvas;copyInto(TREE);return true}
   if(id=='tenda')return copyInto(TENT);
  }
  if(group=='personagens'||group=='sprites'){
   if(group=='personagens'&&id=='ferreiro'){SPRITE_BLACKSMITH.idle=canvas;return true}
   const sets=group=='personagens'?HS:SP;
   for(const [setId,set] of Object.entries(sets))for(const dir of DIRS){
    if(id==setId+'-'+dir){set[dir]=canvas;return true}
    const prefix=setId+'-'+dir+'-';
    if(id.startsWith(prefix)&&set.w&&Array.isArray(set.w[dir])){
     const index=Number(id.slice(prefix.length))-1;
     if(index>=0&&index<set.w[dir].length){set.w[dir][index]=canvas;return true}
    }
   }
  }
  if(group=='masmorra'&&window.DG_BOSS_ICONS){window.DG_BOSS_ICONS[id]=canvas;return true}
  if(group==='ambiente'&&id.startsWith('island-ground-'))window.applyIslandTerrainArt();
  return group=='baus'||group==='ambiente';
 }
 for(const [path,data] of Object.entries(PROJ.art))applyGameArt(path,data);
})();
