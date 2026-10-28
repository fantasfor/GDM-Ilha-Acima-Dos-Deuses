/* ---------- dungeon.js: Sistema da Masmorra (DG) da Caverna dos Goblins ---------- */

(function(){
 window.inDungeon = false;
 window.campPortalTheme = window.campPortalTheme || 'normal';
 window.blacksmithSaved = window.blacksmithSaved || false;

 // Variáveis da DG ativa
 let dungeonChests = [];
 let dungeonBosses = [];
 let dungeonBoss = null;
 let flyingLoots = [];
 let dungeonShake = 0;
 window.tremerDG = v => { dungeonShake = Math.max(dungeonShake, v); }; // mecânicas de chefe (js/chefes.js)
 const limparTelegrafos = () => { for(const l of [window.TELEGRAFOS, window.NUVENS_VENENO, window.CAVEIRAS_FOGO]) if(l) l.length = 0; };
 let bossDefeatedEvent = false;
 let clearRecorded = false;
 let dungeonTorches = [];

 // Canvas offscreen para o Campo de Visão / Fog of War da Masmorra
 const dungeonVisionCv = document.createElement('canvas');
 const dungeonVisionCtx = dungeonVisionCv.getContext('2d');

 // Registro de tipos de monstros da masmorra para inspeção / barra de vida
 if(typeof MONSTER_TYPES !== 'undefined'){
  if(!MONSTER_TYPES.goblin){
   MONSTER_TYPES.goblin = { name: 'Goblin', stats: { F: 14, A: 8, I: 4 }, bossType: 'normal' };
  }
 }

 // Geometria Dinâmica e Configuração da Masmorra
 let CAVE_ROOMS = [];
 let CAVE_CORRIDORS = [];
 let DUNGEON_DOORS = [];
 let DUNGEON_DECORATIONS = [];
 let DUNGEON_THEME = 'cave';
 let DUNGEON_ART = {};
 let DUNGEON_NAME = 'Covil do Rei Esqueleto';
 let DUNGEON_ENTRANCE_PORTAL = { x: 125, y: 210, name: 'Portal de Retorno' };
 let DUNGEON_EXIT_PORTAL = { x: 920, y: 480, name: 'Portal Mágico de Saída' };
 let DUNGEON_BLACKSMITH_POS = { x: 890, y: 560, name: 'Ferreiro Prisioneiro' };
 window.DUNGEON_BLACKSMITH_POS = DUNGEON_BLACKSMITH_POS;

 function syncDungeonFromConfig(){
  const cfg = (window.getActiveDungeonConfig && window.getActiveDungeonConfig()) || {};
  CAVE_ROOMS = (cfg.rooms || []).map(r => ({ ...r }));
  CAVE_CORRIDORS = (cfg.corridors || []).map(c => ({ ...c }));
  DUNGEON_DOORS = (cfg.doors || []).map(door => ({ ...door }));
  DUNGEON_DECORATIONS = (cfg.decorations || []).map(d => ({ ...d }));
  // decorações sólidas (árvores, lápides, troncos...) numa grade de 32 px para a colisão ficar barata
  DECOR_SOLIDOS = new Map();
  for(const d of DUNGEON_DECORATIONS) if(d.solido){ const k = Math.floor(d.x / 32) + ',' + Math.floor(d.y / 32); if(!DECOR_SOLIDOS.has(k)) DECOR_SOLIDOS.set(k, []); DECOR_SOLIDOS.get(k).push(d); }
  DUNGEON_THEME = ['cave', 'underground', 'forest', 'ossos', 'chamas'].includes(cfg.theme) ? cfg.theme : 'cave'; // ossos e chamas: 2026-10-24
  DUNGEON_ART = cfg.art && typeof cfg.art === 'object' ? cfg.art : {};
  DUNGEON_NAME = cfg.name || 'Masmorra';
  window.CAVE_ROOMS = CAVE_ROOMS;
  window.CAVE_CORRIDORS = CAVE_CORRIDORS;
  window.DUNGEON_DOORS = DUNGEON_DOORS;
  window.DUNGEON_DECORATIONS = DUNGEON_DECORATIONS;
  DUNGEON_ENTRANCE_PORTAL={x:125,y:210,name:'Retorno',...cfg.entrancePortal};
  DUNGEON_EXIT_PORTAL={x:920,y:480,name:'Saída',...cfg.exitPortal};
  DUNGEON_BLACKSMITH_POS={x:890,y:560,name:'Ferreiro',...cfg.blacksmithPos};
  window.DUNGEON_BLACKSMITH_POS = DUNGEON_BLACKSMITH_POS;
  dungeonTorches = (cfg.torches || []).map(t => ({ ...t }));
  window.dungeonTorches = dungeonTorches;
  // chão pintado (Engine): o que está pintado é chão, o resto é parede; salas viram só áreas (portas, monstros, spawns)
  DUNGEON_CHAO = cfg.pintado && cfg.chao && typeof cfg.chao === 'object' && Object.keys(cfg.chao).length ? cfg.chao : null;
  DUNGEON_CAIXA = DUNGEON_CHAO && window.CHAO ? CHAO.dgCaixa(DUNGEON_CHAO) : null;
  dungeonCamada = null;
 }
 let DUNGEON_CHAO = null, DUNGEON_CAIXA = null, dungeonCamada = null, dungeonTexturas = null, DECOR_SOLIDOS = new Map();
 /* desenho de uma decoração: dec.el = elemento do pacote de mapa ou da biblioteca (js/pacote-mapa.js), dec.arvore = árvore
    da ilha (variante de TREEV), dec.sprite = desenho próprio. Sempre 1 pixel do desenho = 1 pixel do mundo. */
 function arteDecoracao(dec){
  if(dec.arvore != null && window.TREEV) return TREEV[dec.arvore % TREEV.length];
  // barril, caixote e flor antigos (desenhados por código, saíram em 2026-10-24) aparecem como os elementos do pacote
  const el = dec.el || (!dec.sprite && dec.arvore == null ? { crate: 'pk_gue_caixote', barrel: 'pk_gue_barril', flower: 'pk_flo_arbusto' }[dec.type] : null);
  if(el){ const d = (window.PIXLIB && PIXLIB[el]) || (window.PACOTE_MAPA && PACOTE_MAPA.elementos[el] && PACOTE_MAPA.elementos[el].data); return d ? cachedDungeonArt(window.CHAO&&CHAO.quadroEm?CHAO.quadroEm(d,time).data:d) : null; } // elemento animado: o quadro da hora
  return dec.sprite ? cachedDungeonArt(dec.sprite) : null;
 }
 window.decorSolida = (x, y) => { const i = Math.floor(x / 32), j = Math.floor(y / 32); for(let b = -1; b <= 1; b++) for(let a = -1; a <= 1; a++){ const l = DECOR_SOLIDOS.get((i + a) + ',' + (j + b)); if(l) for(const d of l){ const r = d.raio || 6; if(Math.abs(x - d.x) < r && Math.abs(y - d.y) < r * .7 && Math.hypot(x - d.x, (y - d.y) * 1.4) < r) return true; } } return false; };
 const texturasChao = () => dungeonTexturas || (dungeonTexturas = window.CHAO ? CHAO.texturas(PROJ.pixel) : {});
 const chaoDG = (x, y) => DUNGEON_CHAO && DUNGEON_CHAO[Math.floor(x / 16) + ',' + Math.floor(y / 16)];
 // caixas que cobrem o mapa da DG (caminhos, minimapa): salas, corredores e a área pintada
 window.dungeonCaixas = () => [...CAVE_ROOMS, ...CAVE_CORRIDORS, ...(DUNGEON_CAIXA ? [DUNGEON_CAIXA] : [])];
 window.syncDungeonFromConfig = syncDungeonFromConfig;
 syncDungeonFromConfig();

 const DUNGEON_THEME_COLORS = {
  cave: { outer: '#1c1613', inner: '#29201b', wall: '#423329', highlight: '#5c483b', shadow: '#100c09', texture: '#140f0c' },
  underground: { outer: '#0d1b22', inner: '#12313a', wall: '#214854', highlight: '#397080', shadow: '#071115', texture: '#0a2028' },
  forest: { outer: '#1a2b18', inner: '#294526', wall: '#3b5a2f', highlight: '#62864a', shadow: '#111d12', texture: '#172817' },
  // temas novos (2026-10-24, pedido do usuário): DG de ossos e DG de chamas ardentes (chão, parede e moldura próprios)
  ossos: { outer: '#18161a', inner: '#2a2628', wall: '#4a4440', highlight: '#8a8270', shadow: '#0e0c0e', texture: '#1e1a1c' },
  chamas: { outer: '#1a0e0c', inner: '#2a1614', wall: '#4a2018', highlight: '#ff7a1a', shadow: '#0e0606', texture: '#1e100e' }
 };
 const NOME_TEMA_DG = { cave: 'Caverna', underground: 'Subterrâneo', forest: 'Floresta escura', ossos: 'DG de ossos', chamas: 'DG de chamas ardentes' };
 const ESTILO_TEMA_DG = { cave: 'pedra', underground: 'tijolos', forest: 'floresta', ossos: 'cripta', chamas: 'chamas' }; // parede e moldura padrão (js/paredes-dg.js); a DG pode escolher outra (config.paredeEstilo)
 const PISO_TEMA_DG = { ossos: 'pk_os_lajes', chamas: 'pk_ch_rocha' };          // chão da DG (textura do pacote de mapa)
 const dungeonArtCache = new WeakMap();
 const dungeonPatternCache = new WeakMap();
 function cachedDungeonArt(data){
  if(!data || typeof data !== 'object' || typeof pixelArt !== 'function') return null;
  if(dungeonArtCache.has(data)) return dungeonArtCache.get(data);
  const canvas = pixelArt(data);
  if(canvas) dungeonArtCache.set(data, canvas);
  return canvas;
 }
 function cachedDungeonPattern(data){
  if(!data || typeof data !== 'object') return null;
  if(dungeonPatternCache.has(data)) return dungeonPatternCache.get(data);
  const image = cachedDungeonArt(data);
  const pattern = image && ctx.createPattern(image, 'repeat');
  if(pattern) dungeonPatternCache.set(data, pattern);
  return pattern;
 }

 function dungeonRoomAt(x, y){
  return CAVE_ROOMS.filter(room => x >= room.x && x <= room.x + room.w && y >= room.y && y <= room.y + room.h)
   .sort((a, b) => a.w * a.h - b.w * b.h)[0] || null;
 }
 function nearestDungeonRoom(x, y){
  return CAVE_ROOMS.reduce((nearest, room) => {
   const distance = Math.hypot(x - (room.x + room.w / 2), y - (room.y + room.h / 2));
   return !nearest || distance < nearest.distance ? { room, distance } : nearest;
  }, null)?.room || null;
 }

 function dungeonDoorOpen(door){
  if(door.opened) return true;
  // no grupo, quem abre as portas é o líder (js/multiplayer.js marca door.opened)
  if(window.mpEspelho) return false;
  if(window.SPAWNS && SPAWNS.roomBusy(door.roomId)) return false;
  return !en.some(enemy => enemy.hp > 0 && String(enemy.dungeonRoomId) === String(door.roomId));
 }

 function dungeonBossesDefeated(){
  return dungeonBosses.length > 0 && dungeonBosses.every(enemy => enemy.hp <= 0);
 }

 /* ---------- Baús (js/baus.js): madeira, verde, azul, roxo e dourado ----------
    arte própria do projeto em Artes do jogo › baus/<categoria>-fechado|aberto; senão a arte de js/baus.js */
 window.dungeonChestSprite = (tier, style, opened) => {
  tier = window.BAUS ? BAUS.tipo(tier) : (tier || 'blue');
  const customArt = PROJ.art['baus/' + tier + '-' + (opened ? 'aberto' : 'fechado')];
  if(customArt) return cachedDungeonArt(customArt);
  return window.BAUS ? cachedDungeonArt(BAUS.arte(tier, !!opened)) : null;
 };

 function makeBlacksmithSprite(chained=false){
  return paint(24, 26, (R, E) => {
   // Sombra
   E(12, 24, 8, 3, '#0b080f');
   // Calças e botas de trabalho
   R(8, 17, 3, 7, '#3b2f27');R(13, 17, 3, 7, '#3b2f27');
   R(7, 22, 4, 3, '#1f1915');R(13, 22, 4, 3, '#1f1915');
   // Tronco forte com avental de ferreiro de couro reforçado
   R(7, 10, 10, 8, '#785233');
   R(8, 11, 8, 7, '#a16e45');
   // Faixas do avental cruzadas no peito
   R(8, 10, 2, 6, '#4a3321');R(14, 10, 2, 6, '#4a3321');
   // Braços de ferreiro
   R(5, 11, 3, 6, '#d9a679');R(16, 11, 3, 6, '#d9a679');
   if(chained){
    // Correntes de ferro pesadas prendendo os pulsos
    R(4, 16, 5, 3, '#64748b');R(15, 16, 5, 3, '#64748b');
    R(3, 18, 2, 6, '#475569');R(19, 18, 2, 6, '#475569');
   } else {
    // Martelo de forja na mão direita
    R(16, 15, 2, 7, '#5c4028');
    R(15, 13, 4, 3, '#475569');R(15, 13, 2, 2, '#94a3b8');
   }
   // Cabeça, barba ruiva e bandana de ferreiro
   E(12, 6, 4, 4, '#d9a679');
   // Bandana vermelha na testa
   R(8, 3, 8, 2, '#dc2626');R(7, 4, 2, 2, '#991b1b');
   // Cabelo e barba de ferreiro
   R(8, 2, 8, 2, '#92400e');
   R(9, 7, 6, 4, '#b45309');R(10, 10, 4, 2, '#b45309');
   // Olhos
   R(10, 5, 1, 1, '#1e293b');R(13, 5, 1, 1, '#1e293b');
  });
 }
 window.makeBlacksmithSprite = makeBlacksmithSprite;
 window.SPRITE_BLACKSMITH = { idle: typeof HS === 'object' && HS.ferreiro ? HS.ferreiro.d : makeBlacksmithSprite(false) }; // ferreiro no estilo do herói (js/sprites.js)

 /* ---------- Verificação de Caminhada (Paredes da Caverna) ---------- */
 function dungeonWalk(x, y){
  if(!window.inDungeon) return false;

  const isInsideCave = (px, py) => {
   if(DUNGEON_CHAO){ const id = chaoDG(px, py), t = id && texturasChao()[id]; return !!id && !(t && (t.liquido || t.parede)); }
   for(let i = 0; i < CAVE_ROOMS.length; i++){
    const r = CAVE_ROOMS[i];
    if(px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) return true;
   }
   for(let i = 0; i < CAVE_CORRIDORS.length; i++){
    const c = CAVE_CORRIDORS[i];
    if(px >= c.x && px <= c.x + c.w && py >= c.y && py <= c.y + c.h) return true;
   }
   return false;
  };

  // Folga suave de colisão de 3px em relação a qualquer parede externa da caverna
  const pad = 3;
  if(!isInsideCave(x - pad, y) || !isInsideCave(x + pad, y) ||
     !isInsideCave(x, y - pad) || !isInsideCave(x, y + pad)){
   return false;
  }

  for(let i = 0; i < DUNGEON_DOORS.length; i++){
   const door = DUNGEON_DOORS[i];
   if(dungeonDoorOpen(door)) continue;
   const halfW = Math.max(8, Number(door.w) || 12) / 2 + pad;
   const halfH = Math.max(8, Number(door.h) || 56) / 2 + pad;
   if(Math.abs(x - door.x) <= halfW && Math.abs(y - door.y) <= halfH) return false;
  }

  // decorações sólidas (árvores, lápides, troncos)
  if(DECOR_SOLIDOS.size && window.decorSolida(x, y)) return false;

  // Colisão com baús não abertos (baús abertos não bloqueiam passagem)
  for(let i = 0; i < dungeonChests.length; i++){
   const ch = dungeonChests[i];
   if(!ch.opened && Math.hypot(x - ch.x, y - ch.y) < 7) return false;
  }

  // Colisão com o Ferreiro prisioneiro (se ainda não salvo)
  if(!DUNGEON_BLACKSMITH_POS.disabled&&!window.blacksmithSaved && Math.hypot(x - DUNGEON_BLACKSMITH_POS.x, y - DUNGEON_BLACKSMITH_POS.y) < 7){
   return false;
  }

  return true;
 }
 window.dungeonWalk = dungeonWalk;
 // parede para golpes e magias: fora das salas/corredores ou porta fechada (baús e NPCs não bloqueiam)
 window.dungeonParede = (x, y) => {
  if(!window.inDungeon) return false;
  const dentro = DUNGEON_CHAO ? (id => !!id && !(texturasChao()[id] && texturasChao()[id].parede))(chaoDG(x, y)) : [...CAVE_ROOMS, ...CAVE_CORRIDORS].some(r => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h);
  if(!dentro) return true;
  return DUNGEON_DOORS.some(door => !dungeonDoorOpen(door) && Math.abs(x - door.x) <= Math.max(8, Number(door.w) || 12) / 2 && Math.abs(y - door.y) <= Math.max(8, Number(door.h) || 56) / 2);
 };

 function updateDungeonDoors(){
  DUNGEON_DOORS.forEach(door => {
   if(door.opened || !dungeonDoorOpen(door)) return;
   door.opened = true;
   if(door.wasLocked){
    ring(door.x, door.y, 30, '#4ade80', 0.7);
    ft(door.x, door.y - 18, 'PORTA ABERTA!', '#4ade80');
   }
  });
 }

 /* ---------- Interações do Jogador na DG ---------- */
 function pickDungeonChest(w){
  if(!w) return null;
  return dungeonChests.find(ch => Math.hypot(w.x - ch.x, w.y - ch.y) < 22);
 }

 function pickDungeonExit(w){
  if(!w) return null;
  if(Math.hypot(w.x - DUNGEON_ENTRANCE_PORTAL.x, w.y - DUNGEON_ENTRANCE_PORTAL.y) < 26) return DUNGEON_ENTRANCE_PORTAL;
  if(!DUNGEON_EXIT_PORTAL.disabled&&dungeonBossesDefeated() && Math.hypot(w.x - DUNGEON_EXIT_PORTAL.x, w.y - DUNGEON_EXIT_PORTAL.y) < 26) return DUNGEON_EXIT_PORTAL;
  return null;
 }

 function pickDungeonBlacksmith(w){
  if(!w || window.blacksmithSaved||DUNGEON_BLACKSMITH_POS.disabled) return null;
  return Math.hypot(w.x - DUNGEON_BLACKSMITH_POS.x, w.y - DUNGEON_BLACKSMITH_POS.y) < 26 ? DUNGEON_BLACKSMITH_POS : null;
 }

 function pickDungeonInteractable(w){
  if(!w) return null;
  return pickDungeonChest(w) || pickDungeonExit(w) || pickDungeonBlacksmith(w);
 }
 window.pickDungeonInteractable = pickDungeonInteractable;
 window.pickDungeonHover = pickDungeonInteractable;

 function handleDungeonClick(w, mode){
  if(!window.inDungeon) return false;

  // Clique em baú
  const chest = pickDungeonChest(w);
  if(chest){
   const d = dist(p, chest);
   if(d > 30){
    setDest(chest.x, chest.y + 14);
   } else {
    tryOpenChest(chest);
   }
   return true;
  }

  // Clique no Portal de Retorno ou de Saída
  const portal = pickDungeonExit(w);
  if(portal){
   const d = dist(p, portal);
   if(d > 30){
    setDest(portal.x, portal.y);
   } else {
    if(portal === DUNGEON_ENTRANCE_PORTAL){
     showExitConfirmation();
    } else {
     ft(p.x, p.y - 20, 'SAINDO DA MASMORRA!', '#ffd84a');
     exitDungeon(true);
    }
   }
   return true;
  }

  // Clique no Ferreiro Prisioneiro
  const bs = pickDungeonBlacksmith(w);
  if(bs){
   const d = dist(p, bs);
   if(d > 32){
    setDest(bs.x - 16, bs.y);
   } else {
    interactBlacksmithPrisoner();
   }
   return true;
  }

  return false;
 }
 window.handleDungeonClick = handleDungeonClick;

 function showExitConfirmation(){
  const box = $('dialogue');
  box.classList.remove('dgModal');
  box.innerHTML = `
   <b>Portal de Retorno</b>
   <p>Deseja sair da Masmorra e voltar para o Acampamento? Seu progresso nesta incursão será encerrado.</p>
   <button type="button" data-confirm-exit-dg>Sim, voltar ao Acampamento</button>
   <button type="button" data-close-dialog>Permanecer na DG</button>
  `;
  box.classList.add('open');
 }

 function interactBlacksmithPrisoner(){
  if(!dungeonBossesDefeated()){
   ft(DUNGEON_BLACKSMITH_POS.x, DUNGEON_BLACKSMITH_POS.y - 26, 'Derrote o chefe da masmorra para quebrar as correntes!', '#f87171');
   return;
  }
  const box = $('dialogue');
  box.classList.remove('dgModal');
  box.innerHTML = `
   <b>Ferreiro Resgatado</b>
   <p>Pelos deuses, você derrotou o chefe! Achei que seria o meu fim nestas masmorras sombrias... Vou imediatamente para o acampamento montar minha bigorna e forja para ajudar com equipamentos lendários!</p>
   <button type="button" data-rescue-blacksmith>Resgatar o Ferreiro e enviar ao Acampamento</button>
  `;
  box.classList.add('open');
 }

 function rescueBlacksmithFromDungeon(){
  window.blacksmithSaved = true;
  if(typeof blacksmithSaved !== 'undefined') blacksmithSaved = true;
  ring(DUNGEON_BLACKSMITH_POS.x, DUNGEON_BLACKSMITH_POS.y, 40, '#ffd84a', 0.8);
  ft(DUNGEON_BLACKSMITH_POS.x, DUNGEON_BLACKSMITH_POS.y - 30, 'FERREIRO RESGATADO!', '#ffd84a');
  if(window.placeBlacksmith) placeBlacksmith();
  saveGame();
 }
 window.rescueBlacksmithFromDungeon = rescueBlacksmithFromDungeon;

 /* ---------- Abertura de Baús e Animação de Loot ---------- */
 function tryOpenChest(chest){
  if(chest.opened){
   ft(chest.x, chest.y - 18, 'Este baú já foi saqueado!', '#a1a1aa');
   return;
  }

  // REGRA 1: "qualquer bau so pode ser aberto se nao tiver monstro por perto"
  const nearbyMonster = en.some(e => e.hp > 0 && Math.hypot(e.x - chest.x, e.y - chest.y) < 135);
  if(nearbyMonster){
   ft(chest.x, chest.y - 22, 'Derrote os monstros por perto primeiro!', '#ef4444');
   return;
  }

  // REGRA 2: "A sala do boss sempre tem bau dourado e so pode ser aberto apos o boss ser morto"
  if(chest.bossChest && !dungeonBossesDefeated()){
   ft(chest.x, chest.y - 22, 'Derrote o chefe da masmorra primeiro!', '#ef4444');
   return;
  }

  // Abre o baú com sucesso!
  chest.opened = true;
  ring(chest.x, chest.y, 30, (window.BAUS && BAUS.COR[BAUS.tipo(chest.tier)]) || '#38bdf8', 0.5);

  // cada baú tem a sua tabela (ouro, qualidade, itens com chance); sem tabela, a padrão da categoria (js/baus.js)
  const loot = chest.loot && Array.isArray(chest.loot.items) ? chest.loot : (window.BAUS ? BAUS.lootPadrao(chest.tier) : { goldMin: 0, goldMax: 0, items: [] });
  const goldMin = Math.max(0, Math.floor(Number(loot.goldMin) || 0));
  const goldMax = Math.max(goldMin, Math.floor(Number(loot.goldMax) || goldMin));
  let gold = Math.floor(rnd(goldMin, goldMax + 1)), items = [];
  // faixa de qualidade da tabela + o aumento de qualidade deste baú
  const qualityRange = window.BAUS ? BAUS.faixaQualidade({ tier: chest.tier, loot, qualidadeBonus: chest.qualidadeBonus }) : [40, 70];
  loot.items.forEach(drop => {
   if(!drop || typeof drop !== 'object' || (typeof NUNCA_CAI !== 'undefined' ? NUNCA_CAI : ['nova_arma', 'teste']).includes(drop.id)) return; // arma ADM/teste nunca sai de baú (js/custom.js)
   const chance = Math.max(0, Math.min(100, Number(drop.chance) || 0));
   if(ITEMS[drop.id] && Math.random() * 100 < chance) items.push(drop.id);
  });
  items = items.filter(id => window.podeCairDeMissao ? podeCairDeMissao(id) : true); // itens de missão só com a missão ativa
  p.gold += gold;
  ft(chest.x, chest.y - 26, `+${gold} Ouro!`, '#ffd700');
  ft(chest.x, chest.y - 38, ((window.BAUS && BAUS.NOME[BAUS.tipo(chest.tier)]) || 'Baú').toUpperCase() + ' ABERTO!', (window.BAUS && BAUS.COR[BAUS.tipo(chest.tier)]) || '#38bdf8');
  if(window.playGameSound) playGameSound('item');

  // Dispara animação de moedas e itens saltando para fora do baú
  spawnChestFlyLoot(chest.x, chest.y, gold, items, qualityRange, chest.tier);
  saveGame();
 }

 function spawnChestFlyLoot(cx, cy, gold, items, qualityRange, tier){
  // Moedas saltando
  const numCoins = Math.min(10, Math.max(5, Math.floor(gold / 40)));
  for(let i = 0; i < numCoins; i++){
   const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.3;
   const speed = rnd(65, 120);
   flyingLoots.push({
    type: 'coin',
    x: cx, y: cy - 4,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    targetY: cy + rnd(4, 18),
    bounce: 2,
    life: 2.2,
    maxLife: 2.2
   });
  }

  // Itens saltando para fora com raio de luz
  items.forEach((id, idx) => {
   const it = ITEMS[id];
   // mesmo desenho dos itens no chão (js/loot.js): próprio do item ou o ícone reduzido a 8×8, em tamanho real
   const img = it && (it.itemSprite || (it.c && it.c.getContext ? reduzirArte(it.c, 8, 8) : null)) || null;
   const q = gearType[id] ? Math.floor(rnd(qualityRange[0], qualityRange[1] + 1)) : null;
   const itemRarityColors = ['#9a9a9a', '#f0f0f0', '#4fd860', '#4f9af0', '#c060f0', '#ffb830'];
   const qualityIndex = q == null ? -1 : q < 20 ? 0 : q < 45 ? 1 : q < 70 ? 2 : q < 90 ? 3 : q < 100 ? 4 : 5;
   const tierColor = (window.BAUS && BAUS.COR[BAUS.tipo(tier)]) || '#38bdf8';
   const angle = Math.random() * Math.PI * 2;
   const distance = rnd(14, 28);
   flyingLoots.push({
    type: 'item',
    id, q,
    rarityColor: qualityIndex >= 0 ? itemRarityColors[qualityIndex] : tierColor,
    img,
    x: cx, y: cy - 8,
    startX: cx, startY: cy - 8,
    targetX: cx + Math.cos(angle) * distance,
    targetY: cy - 8 + Math.sin(angle) * distance,
    arcHeight: rnd(14, 24),
    delay: idx * 0.38,
    phase: 'waiting',
    phaseT: 0,
    tier
   });
  });
 }

 function randomChestTier(chances){
  const weights = ['blue','purple','gold'].map(rarity => Math.max(0, Number(chances && chances[rarity]) || 0));
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  if(total <= 0) throw new Error('O baú aleatório precisa ter ao menos uma chance de raridade maior que zero.');
  let roll = Math.random() * total;
  for(let i = 0; i < weights.length; i++){
   roll -= weights[i];
   if(roll < 0) return ['blue','purple','gold'][i];
  }
  return 'gold';
 }

 /* ---------- Chefe padrão da DG: Rei Esqueleto do Covil (o Lorde Goblin saiu do jogo, pedido do usuário 2026-10-23) ----------
    É um monstro do projeto como os outros (Engine › Chefes); sem ele no projeto, o Rei Esqueleto comum vira chefe. */
 const CHEFE_DG = 'rei_esqueleto_covil';
 const tipoChefeDG = () => MONSTER_TYPES[CHEFE_DG] ? CHEFE_DG : MONSTER_TYPES.esqueleto_rei ? 'esqueleto_rei' : 'goblin';
 function spawnDungeonBoss(bx, by, blvl){
  const ty = tipoChefeDG(), bossLvl = blvl || Math.max(5, p.lvl + 1);
  dungeonBoss = spawnAt(bx != null ? bx : 780, by != null ? by : 480, ty, bossLvl);
  Object.assign(dungeonBoss, { boss: true, bossType: 'grandboss', isDungeonMob: true, rt: 0, roamT: 5, roamRadius: 30 });
  if(ty !== CHEFE_DG) dungeonBoss.size = 1.3;
  // mecânicas (js/chefes.js): as do projeto; sem nenhuma, as padrão do chefe da DG
  if(!MONSTER_TYPES[ty]?.mecanicas) dungeonBoss.mecanicas = window.MECANICAS_CHEFE_DG;
  if(!MONSTER_TYPES[ty]?.furia) dungeonBoss.furiaPct = 25;
  dungeonBoss.delayedHp = dungeonBoss.max;
  window.dungeonBoss = dungeonBoss;
  en.push(dungeonBoss);
  return dungeonBoss;
 }
 function updateBossAI(dt){
  if(!dungeonBoss) return;
  // Animação de barra de dano recente (delayedHp)
  if(dungeonBoss.delayedHp > dungeonBoss.hp){
   dungeonBoss.delayedHp = Math.max(dungeonBoss.hp, dungeonBoss.delayedHp - dt * 140);
  }

  // Verificação de morte do Boss
  if(dungeonBoss.hp <= 0){
   if(!bossDefeatedEvent){
    bossDefeatedEvent = true;
    dungeonShake = 0.6;
    ring(dungeonBoss.x, dungeonBoss.y, 60, '#f59e0b', 1.0);
    ft(dungeonBoss.x, dungeonBoss.y - 30, '✦ ' + String(dungeonBoss.name || 'Chefe').toUpperCase() + ' DERROTADO! ✦', '#ffd700');
    if(!DUNGEON_EXIT_PORTAL.disabled)ft(DUNGEON_EXIT_PORTAL.x, DUNGEON_EXIT_PORTAL.y - 20, 'PORTAL DE SAÍDA ATIVADO!', '#38bdf8');
    if(!window.blacksmithSaved&&!DUNGEON_BLACKSMITH_POS.disabled){
     ft(DUNGEON_BLACKSMITH_POS.x, DUNGEON_BLACKSMITH_POS.y - 20, 'O ferreiro está livre! Fale com ele!', '#ffd84a');
    }
    saveGame();
   }
   return;
  }
  // as mecânicas do chefe (golpes telegrafados, fúria, invocações) ficam em js/chefes.js
 }

 function updateFlyingLoot(dt){
  for(let i = flyingLoots.length - 1; i >= 0; i--){
   const fl = flyingLoots[i];
   if(fl.type === 'item'){
    if(fl.delay > 0){
     fl.delay = Math.max(0, fl.delay - dt);
     continue;
    }
    fl.phaseT += dt;
    if(fl.phase === 'waiting'){
     fl.phase = 'burst';
     fl.phaseT = 0;
    }
    if(fl.phase === 'burst'){
     const progress = Math.min(1, fl.phaseT / 0.28);
     fl.x = fl.startX + (fl.targetX - fl.startX) * progress;
     fl.y = fl.startY + (fl.targetY - fl.startY) * progress - 4 * fl.arcHeight * progress * (1 - progress);
     if(progress >= 1){
      fl.phase = 'ground';
      fl.phaseT = 0;
      fl.startX = fl.x;
      fl.startY = fl.y;
     }
    } else if(fl.phase === 'ground'){
     if(fl.phaseT >= 3){
      fl.phase = 'seek';
      fl.phaseT = 0;
      fl.startX = fl.x;
      fl.startY = fl.y;
     }
    } else if(fl.phase === 'seek'){
     const progress = Math.min(1, fl.phaseT / 0.75);
     const eased = 1 - Math.pow(1 - progress, 2);
     fl.x = fl.startX + (p.x - fl.startX) * eased;
     fl.y = fl.startY + (p.y - 16 - fl.startY) * eased;
     if(progress >= 1){
      offerDrop(fl.id, false, fl.q);
      if(window.somRaridade) somRaridade(fl.q, fl.id);
      flyingLoots.splice(i, 1);
     }
    }
    continue;
   }
   fl.life -= dt;
   fl.x += fl.vx * dt;
   fl.y += fl.vy * dt;
   fl.vy += 220 * dt; // Gravidade

   if(fl.y >= fl.targetY){
    fl.y = fl.targetY;
    if(fl.bounce > 0){
     fl.bounce--;
     fl.vy = -fl.vy * 0.45;
     fl.vx *= 0.6;
    } else {
     fl.vx = 0;
     fl.vy = 0;
    }
   }

   if(fl.life <= 0){
    flyingLoots.splice(i, 1);
   }
  }
 }

 /* ---------- Ciclo de Atualização da Masmorra ---------- */
 function updateDungeon(dt){
  if(!window.inDungeon) return;
  if(dungeonShake > 0) dungeonShake = Math.max(0, dungeonShake - dt * 2);

  updateDungeonDoors();
  if(!clearRecorded && dungeonBossesDefeated()){
   clearRecorded = true;
   const ms = performance.now() - (window.dungeonEnteredAt || performance.now());
   const rec = window.recordDungeonClear && window.getActiveDungeonId && recordDungeonClear(getActiveDungeonId(), ms);
   if(rec) ft(p.x, p.y - 44, 'MASMORRA CONCLUÍDA · ' + Math.floor(ms / 60000) + ':' + String(Math.round(ms / 1000) % 60).padStart(2, '0') + (rec.best === Math.round(ms) ? ' · NOVO RECORDE!' : ''), '#ffd84a');
  }
  updateBossAI(dt);
  updateFlyingLoot(dt);
 }
 window.updateDungeon = updateDungeon;

 /* ---------- Entrada e Saída da Masmorra ---------- */
 function enterGoblinDungeon(){
  if(window.getDungeonLibrary&&!window.getDungeonLibrary().dungeons.length){alert('Nenhuma DG disponível no momento.');return}
  window.campPortalTheme = 'goblin';
  window.inDungeon = true;
  if(window.STATS_DG) STATS_DG.zerar(); // estatísticas da DG começam do zero (js/estatisticas-dg.js)
  bossDefeatedEvent = false;
  clearRecorded = false;
  limparTelegrafos();
  flyingLoots = [];
  dungeonBoss = null;
  dungeonBosses = [];

  // Sincroniza configuração mais recente da masmorra (salas, corredores, tochas, baús, mobs)
  syncDungeonFromConfig();
  window.zerarMemoriaDG(); // minimapa começa sem nada explorado
  const cfg = (window.getActiveDungeonConfig && window.getActiveDungeonConfig()) || {};

  // Salva os monstros do mapa da ilha para restaurar ao sair
  window.dungeonOverworldEnemies = en.splice(0, en.length);

  // Posiciona o jogador no ponto de início configurado
  clearMovementInput();
  const spawnPos = cfg.playerSpawn || { x: 150, y: 210 };
  p.x = spawnPos.x;
  p.y = spawnPos.y;
  p.dest = null;
  p.tgt = null;
  p.aw = 0;
  p.hp = mhp();
  p.mp = mmp();

  // Spawna baús da DG
  dungeonChests = (cfg.chests || [
   { id: 1, tier: 'blue',   x: 470, y: 175, opened: false },
   { id: 2, tier: 'purple', x: 365, y: 520, opened: false },
   { id: 3, tier: 'gold',   x: 890, y: 390, opened: false, bossChest: true }
  ]).map(ch => {
   const tier = ch.randomTier ? randomChestTier(ch.rarityChances) : ch.tier;
   return {
    id: ch.id,
    tier,
    randomTier: !!ch.randomTier,
    x: ch.x,
    y: ch.y,
    opened: false,
    bossChest: !!ch.bossChest,
    sprite: ch.sprite || null,
    qualidadeBonus: +ch.qualidadeBonus || 0,
    loot: ch.loot && Array.isArray(ch.loot.items) ? ch.loot : null
   };
  });
  window.dungeonChests = dungeonChests;

  /* sala do chefe: a área (ou sala) em que ele foi colocado; sem área (chão pintado), um quadrado de 120 px em volta dele.
     O chefe não sai dela e só luta com quem está dentro (update.js naSalaDoChefe) */
  const salaDoChefe = (room, mon) => room ? { x: room.x, y: room.y, w: room.w, h: room.h } : { x: mon.x - 120, y: mon.y - 120, w: 240, h: 240 };
  // Spawna monstros fixos configurados no editor (100% fixos sem respawn)
  const mobsList = cfg.mobs || [];
  dungeonBosses = [];
  let bossSpawned = false;
  mobsList.forEach(m => {
   const mobType = m.type || 'goblin';
   const targetLvl = m.lvl || Math.max(4, p.lvl);
   const isBoss = !!m.isBoss || !!(MONSTER_TYPES[mobType] && ['boss', 'grandboss'].includes(MONSTER_TYPES[mobType].bossType));
   let mon;
   if(mobType === 'goblinBoss' || mobType === CHEFE_DG){ // goblinBoss: DG salva antes de o Lorde Goblin sair
    mon = spawnDungeonBoss(m.x, m.y, targetLvl);
   } else {
    // Usa a mesma construção do catálogo da ilha para qualquer tipo selecionado no editor.
    mon = spawnAt(m.x, m.y, mobType, targetLvl);
    const fallbackSprites = { gob: SP.goblinSaw, sl: SP.sl, goblin: SP.goblin, boss: SP.glooc };
    const fallbackSprite = fallbackSprites[mobType];
    const monsterTemplate = MONSTER_TYPES[mobType];
    if(fallbackSprite && !(monsterTemplate && monsterTemplate.custom && monsterTemplate.sprite)){
     mon.img = fallbackSprite.d;
     mon.sp = fallbackSprite;
    }
    mon.roamRadius = 25;
    mon.roamT = 4;
    mon.boss = isBoss;
    mon.isDungeonMob = true;
    mon.rt = 0;
    en.push(mon);
   }
   const mobRoom = CAVE_ROOMS.find(room => String(room.id) === String(m.roomId)) || dungeonRoomAt(m.x, m.y);
   const bossRoom = isBoss ? (mobRoom || (DUNGEON_CHAO ? null : nearestDungeonRoom(m.x, m.y))) : mobRoom;
   mon.dungeonRoomId = bossRoom && bossRoom.id;
   if(isBoss) mon.dungeonRoomBounds = salaDoChefe(bossRoom, mon);
   if(m.animation && typeof m.animation === 'object'){
    mon.dungeonAnimation = {};
    for(const action of ['idle', 'walk', 'attack']){
     mon.dungeonAnimation[action] = (Array.isArray(m.animation[action]) ? m.animation[action] : [])
      .map(frame => cachedDungeonArt(frame)).filter(Boolean);
    }
    mon.dungeonAnimation.interval = Math.max(0.05, Number(m.animation.interval) || 0.18);
    mon.dungeonAnimation.durations = { ...m.animation.durations };
   }
   if(m.name) mon.name = m.name;
   // elite e mecânicas próprias deste monstro nesta DG (ex.: Flor Selvagem elite com a fumaça venenosa)
   if(m.elite && window.makeElite && !mon.elite) makeElite(mon);
   if(Array.isArray(m.mecanicas) && m.mecanicas.length) mon.mecanicas = m.mecanicas.map(x => ({ ...x }));
   if(Number(m.maxHp) > 0){
    mon.max = Math.round(Number(m.maxHp));
    mon.hp = mon.max;
    mon.delayedHp = mon.max;
   }
   if(Number(m.damage) > 0) mon.dmg = Number(m.damage);
   if(Number(m.speed) > 0) mon.spd = Number(m.speed);
   if(m.sprite){
    const sprite = cachedDungeonArt(m.sprite);
    if(sprite){
     mon.img = sprite;
     mon.sp = { d: sprite, u: sprite, s: sprite, ds: sprite, us: sprite, w: null };
    }
   }
   if(isBoss) bossSpawned = true;
   if(isBoss) dungeonBosses.push(mon);
  });

  // Se a masmorra não tiver um Boss explicitamente colocado, garante o Boss padrão
  if(!bossSpawned){
   const fallbackBoss = spawnDungeonBoss();
   const fallbackRoom = dungeonRoomAt(fallbackBoss.x, fallbackBoss.y) || nearestDungeonRoom(fallbackBoss.x, fallbackBoss.y);
   fallbackBoss.dungeonRoomId = fallbackRoom && fallbackRoom.id;
   fallbackBoss.dungeonRoomBounds = salaDoChefe(fallbackRoom, fallbackBoss);
   dungeonBosses.push(fallbackBoss);
  }
  // Pontos de spawn da DG (ondas); precisam existir antes de decidir quais portas começam trancadas
  // (no grupo, só o líder solta as ondas; os outros recebem os monstros dele)
  if(window.SPAWNS) SPAWNS.enterDungeon(window.mpEspelho ? {} : cfg);
  window.dungeonEnteredAt = performance.now();
  DUNGEON_DOORS.forEach(door => {
   door.opened = false;
   door.wasLocked = en.some(enemy => enemy.hp > 0 && String(enemy.dungeonRoomId) === String(door.roomId)) || !!(window.SPAWNS && SPAWNS.roomBusy(door.roomId));
  });

  ft(p.x, p.y - 30, `MASMORRA: ${DUNGEON_NAME}`, '#ef4444');
  ring(p.x, p.y, 42, '#ef4444', 0.8);
  window.dispatchEvent(new CustomEvent('ilha-dg-entrou'));
 }
 window.enterGoblinDungeon = enterGoblinDungeon;

 function exitDungeon(toCampPortal = true){
  if(!window.inDungeon) return;
  if(window.STATS_DG) STATS_DG.fim(); // painel de estatísticas do fim (antes de sair da sala do grupo)
  window.inDungeon = false;
  limparTelegrafos();
  flyingLoots = [];
  dungeonBosses = [];
  dungeonBoss = null;

  // Restaura monstros da ilha
  en.splice(0, en.length, ...(window.dungeonOverworldEnemies || []));
  window.dungeonOverworldEnemies = [];
  window.dispatchEvent(new CustomEvent('ilha-dg-saiu'));

  clearMovementInput();
  if(toCampPortal){
   p.x = campPortal.x;
   p.y = campPortal.y + 24;
   ft(p.x, p.y - 24, 'Retornou ao Acampamento', '#ffd84a');
  } else {
   p.x = CX;
   p.y = CY + 34;
   ft(p.x, p.y - 24, 'Você sucumbiu e foi expulso da Masmorra!', '#ef4444');
  }

  saveGame();
 }
 window.exitDungeon = exitDungeon;

 /* ---------- ELEMENTOS DE RENDERIZAÇÃO DA MASMORRA ---------- */
 // 1. Decorações da Caverna (Pixel Art)
 function drawDungeonDecoration(dec,target,original=false){
  const ctx=target||cv.getContext('2d');
  const { x, y, type } = dec;
  if(!dec.sprite&&dec.el==null&&dec.arvore==null&&!original&&gameArtDraw('dg-decor-'+type,ctx,x,y))return;
  const arte = arteDecoracao(dec);
  if(arte){
   // 1:1 (padrão do jogo): o desenho no tamanho real, com os pés na posição; as altas balançam com o vento
   const q = arte.q || 1, w = arte.width / q, h = arte.height / q;
   if(dec.balanca && !target){ const sk = Math.sin(time * 1.3 + x * .07) * .05; ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.transform(1, 0, sk, 1, 0, 0); ctx.drawImage(arte, Math.round(-w / 2), Math.round(-h + 3), w, h); ctx.restore(); }
   else ctx.drawImage(arte, Math.round(x - w / 2), Math.round(y - h + 3), w, h);
   return;
  }
  // decorações desenhadas por código (barril, caixote, ossos, estalagmite, poça, cristal, teia, estandarte, árvore, arbusto e flor)
  // saíram do jogo (2026-10-24, pedido do usuário): ficam a escada e os elementos de mapa (el, arvore, sprite), desenhados acima
  if(type === 'escada' && window.PAREDES_DG){ // escada de madeira subindo para dentro da parede (paredes-dg.js)
   const a = pixelArt(PAREDES_DG.escada()); if(a) ctx.drawImage(a, Math.round(x - a.width / 2), Math.round(y - a.height + 3));
  }
 }

 // 2. Portais de Madeira Mágica com Quadradinhos Mágicos em Pixel Art
 const GATE_PARTICLES = [];
 for(let i = 0; i < 20; i++){
  GATE_PARTICLES.push({
   xOff: ((i * 7) % 16) - 8,
   speed: 7 + (i % 4) * 2.5,
   size: 1.5 + (i % 3) * 0.8,
   phase: i * 0.65
  });
 }

 function drawDungeonGate(x, y, type, active,target,original=false){
  const ctx=target||cv.getContext('2d');
  if(!original&&gameArtDraw('portal-dg-'+type+(active?'':'-locked'),ctx,x,y))return;
  const isReturn = type === 'return';
  const themeColor = isReturn ? '#38bdf8' : (active ? '#4ade80' : '#475569');
  const lightColor = isReturn ? '#e0f2fe' : (active ? '#dcfce7' : '#94a3b8');
  const coreGlow = isReturn ? 'rgba(56,189,248,0.3)' : (active ? 'rgba(74,222,128,0.35)' : 'rgba(100,116,139,0.15)');

  // Base oval no chão de rocha
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.beginPath(); ctx.ellipse(x, y, 16, 6, 0, 0, Math.PI * 2); ctx.fill();

  // Brilho mágico no chão
  ctx.fillStyle = coreGlow;
  ctx.beginPath(); ctx.ellipse(x, y, 18, 7, 0, 0, Math.PI * 2); ctx.fill();

  // Fundo escuro do vórtice interno
  ctx.fillStyle = '#09080d';
  ctx.fillRect(x - 9, y - 28, 18, 28);

  // Vórtice de energia mágica interna
  const vortexGrad = ctx.createLinearGradient(x, y - 28, x, y);
  vortexGrad.addColorStop(0, themeColor);
  vortexGrad.addColorStop(0.5, isReturn ? '#0284c7' : (active ? '#16a34a' : '#334155'));
  vortexGrad.addColorStop(1, '#09080d');
  ctx.fillStyle = vortexGrad;
  ctx.fillRect(x - 7, y - 26, 14, 26);

  // Quadradinhos em pixel art subindo devagar pelo vórtice
  if(active){
   GATE_PARTICLES.forEach(gp => {
    const yProgress = (time * gp.speed + gp.phase * 22) % 24;
    const py = y - 3 - yProgress;
    const sway = Math.sin(time * 3 + gp.phase) * 1.5;
    const px = Math.round(x + gp.xOff + sway);
    const alpha = Math.sin((yProgress / 24) * Math.PI);

    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.fillStyle = lightColor;
    ctx.fillRect(px, py, gp.size, gp.size);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(px, py, Math.max(1, gp.size - 1), Math.max(1, gp.size - 1));
   });
   ctx.globalAlpha = 1;
  }

  // Estrutura de Madeira Mágica (Simplificada, Inspirada no Portal do Acampamento)
  // Pilares laterais de madeira entalhada
  ctx.fillStyle = '#27170e'; ctx.fillRect(x - 12, y - 32, 4, 32);
  ctx.fillStyle = '#543217'; ctx.fillRect(x - 11, y - 31, 2, 30);
  ctx.fillStyle = '#7a4b27'; ctx.fillRect(x - 11, y - 26, 1, 20);

  ctx.fillStyle = '#27170e'; ctx.fillRect(x + 8, y - 32, 4, 32);
  ctx.fillStyle = '#543217'; ctx.fillRect(x + 9, y - 31, 2, 30);
  ctx.fillStyle = '#7a4b27'; ctx.fillRect(x + 10, y - 26, 1, 20);

  // Bases dos pilares reforçadas
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(x - 13, y - 4, 6, 4);
  ctx.fillRect(x + 7, y - 4, 6, 4);
  ctx.fillStyle = '#44403c';
  ctx.fillRect(x - 12, y - 3, 4, 2);
  ctx.fillRect(x + 8, y - 3, 4, 2);

  // Lintel / Arco superior de madeira esculpida
  ctx.fillStyle = '#27170e'; ctx.fillRect(x - 13, y - 34, 26, 5);
  ctx.fillStyle = '#543217'; ctx.fillRect(x - 12, y - 33, 24, 3);
  ctx.fillStyle = '#7a4b27'; ctx.fillRect(x - 10, y - 32, 20, 1);

  // Runas entalhadas na madeira mágica que brilham sutilmente
  const runeGlow = 0.5 + 0.5 * Math.sin(time * 4 + (isReturn ? 1 : 2));
  ctx.fillStyle = active ? themeColor : '#475569';
  ctx.globalAlpha = active ? runeGlow : 0.4;
  ctx.fillRect(x - 11, y - 20, 2, 3);
  ctx.fillRect(x - 11, y - 12, 2, 2);
  ctx.fillRect(x + 9, y - 20, 2, 3);
  ctx.fillRect(x + 9, y - 12, 2, 2);
  ctx.fillRect(x - 2, y - 33, 4, 2);
  ctx.globalAlpha = 1;

  // Cristal mágico entalhado no topo do arco
  ctx.fillStyle = '#1e293b'; ctx.fillRect(x - 3, y - 39, 6, 6);
  ctx.fillStyle = active ? themeColor : '#475569'; ctx.fillRect(x - 2, y - 38, 4, 4);
  ctx.fillStyle = active ? lightColor : '#94a3b8'; ctx.fillRect(x - 1, y - 37, 2, 2);

 }

 function drawCustomDungeonObject(item,alpha=1){
  const sprite=cachedDungeonArt(window.CHAO&&CHAO.quadroEm?CHAO.quadroEm(item.sprite,time).data:item.sprite);if(!sprite)return false; // desenho próprio animado (quadros na aba Parado)
  const q=sprite.q||1;ctx.save();ctx.globalAlpha=alpha;
  ctx.drawImage(sprite,item.x-sprite.width/q/2,item.y-sprite.height/q,sprite.width/q,sprite.height/q);ctx.restore();return true;
 }

 function drawDungeonDoor(door,target,original=false){
  const ctx=target||cv.getContext('2d');
  const open = original&&door.previewOpen!=null?door.previewOpen:dungeonDoorOpen(door);
  if(!target&&drawCustomDungeonObject(door,open ? .35 : 1))return;
  const vertical = (door.orientation || 'vertical') === 'vertical';
  const width = Math.max(8, Number(door.w) || (vertical ? 12 : 56));
  const height = Math.max(8, Number(door.h) || (vertical ? 56 : 12));
  if(!original&&gameArtDraw('dg-door-'+(vertical?'vertical':'horizontal')+(open?'-open':'-closed'),ctx,door.x,door.y,width,height))return;
  // porta do tema (js/portas-dg.js); arte própria por tema em Artes do jogo › dg-door-<tema>-…
  const tema = door.tema || DUNGEON_THEME || 'cave';
  if(window.PORTAS_DG){
   const a = PORTAS_DG.arte(tema, vertical, open, width, height, door.estilo); // door.estilo: variação escolhida na Engine
   if(!original&&!door.estilo&&gameArtDraw('dg-door-'+tema+'-'+(vertical?'vertical':'horizontal')+(open?'-open':'-closed'),ctx,door.x,door.y+a.dy+a.c.height,a.c.width,a.c.height))return; // âncora: pé da arte
   ctx.drawImage(a.c, Math.round(door.x + a.dx), Math.round(door.y + a.dy));
   return;
  }
  const frame = '#451a03';
  const metal = open ? '#4ade80' : '#ef4444';
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(door.x - width / 2 - 2, door.y - height / 2 - 2, width + 4, height + 4);
  if(open){
   ctx.fillStyle = frame;
   if(vertical){
    ctx.fillRect(door.x - width / 2, door.y - height / 2, width, 9);
    ctx.fillRect(door.x - width / 2, door.y + height / 2 - 9, width, 9);
   } else {
    ctx.fillRect(door.x - width / 2, door.y - height / 2, 9, height);
    ctx.fillRect(door.x + width / 2 - 9, door.y - height / 2, 9, height);
   }

   ctx.fillStyle = metal;
   ctx.fillRect(door.x - 1, door.y - 2, 2, 4);
   return;
  }
  ctx.fillStyle = frame;
  ctx.fillRect(door.x - width / 2, door.y - height / 2, width, height);
  ctx.fillStyle = metal;
  ctx.fillRect(door.x - width / 2 + 2, door.y - height / 2 + 2, Math.max(3, width - 4), Math.max(3, height - 4));
  ctx.fillStyle = '#451a03';
  if(vertical){
   for(let y = door.y - height / 2 + 7; y < door.y + height / 2 - 3; y += 9){
    ctx.fillRect(door.x - width / 2 + 3, y, width - 6, 3);
   }
  } else {
   for(let x = door.x - width / 2 + 7; x < door.x + width / 2 - 3; x += 9){
    ctx.fillRect(x, door.y - height / 2 + 3, 3, height - 6);
   }
  }
 }

 for(const [theme,palette] of Object.entries(DUNGEON_THEME_COLORS)){
  const estilo = ESTILO_TEMA_DG[theme], piso = PISO_TEMA_DG[theme] && window.PACOTE_MAPA && PACOTE_MAPA.texturas[PISO_TEMA_DG[theme]];
  for(const part of ['floor','wall'])gameArtRegister('dg-'+part+'-'+theme,(part==='floor'?'Chão':'Parede')+' da DG — '+NOME_TEMA_DG[theme],{
   w:part==='wall'&&estilo?64:16,h:part==='wall'&&estilo?32:16,draw:g=>{
    if(part==='wall'&&estilo&&window.PAREDES_DG){g.drawImage(pixelArt(PAREDES_DG.face(estilo)),0,0);return} // face da parede do estilo do tema (paredes-dg.js)
    if(part==='floor'&&piso){g.drawImage(pixelArt(piso.data),0,0);return}
    g.fillStyle=part==='floor'?palette.inner:palette.wall;g.fillRect(0,0,16,16);
    g.fillStyle=part==='floor'?palette.texture:palette.shadow;
    if(part==='wall'){g.fillRect(0,7,16,1);g.fillRect(7,0,1,7);g.fillRect(3,8,1,8)}
    else for(let i=0;i<12;i++)g.fillRect(i*7%16,i*11%16,2,1);
   }
  });
  // moldura grossa em volta do chão e das paredes (chao.js dgCamada), no estilo do tema (paredes-dg.js)
  gameArtRegister('dg-borda-'+theme,'Borda da DG — '+NOME_TEMA_DG[theme],{w:16,h:16,draw:g=>{
   if(estilo&&window.PAREDES_DG){g.drawImage(pixelArt(PAREDES_DG.borda(estilo)),0,0);return}
   g.fillStyle=palette.shadow;g.fillRect(0,0,16,16);g.fillStyle=palette.wall;
   for(let i=0;i<10;i++)g.fillRect(i*5%16,i*9%16,3,2);
  }});
 }
 for(const type of ['return','exit'])for(const active of [true,false])gameArtRegister('portal-dg-'+type+(active?'':'-locked'),(type==='return'?'Portal de retorno da DG':'Portal de saída da DG')+(active?' — ativo':' — bloqueado'),{
  w:40,h:48,ay:42/48,draw:g=>drawDungeonGate(20,42,type,active,g,true)
 });
 // portas de cada tema (js/portas-dg.js), no tamanho padrão, editáveis em Artes do jogo (pé da arte no pé da porta)
 for(const tema of Object.keys(DUNGEON_THEME_COLORS))for(const orientation of ['vertical','horizontal'])for(const open of [false,true]){
  const vertical=orientation==='vertical',a=window.PORTAS_DG&&PORTAS_DG.arte(tema,vertical,open,vertical?12:56,vertical?56:12);if(!a)continue;
  gameArtRegister('dg-door-'+tema+'-'+orientation+(open?'-open':'-closed'),'Porta da DG — '+NOME_TEMA_DG[tema]+' — '+(vertical?'vertical':'horizontal')+(open?' aberta':' fechada'),{w:a.c.width,h:a.c.height,ay:1,draw:g=>g.drawImage(a.c,0,0)});
 }
 for(const orientation of ['vertical','horizontal'])for(const open of [false,true]){
  const vertical=orientation==='vertical',w=vertical?12:56,h=vertical?56:12;
  gameArtRegister('dg-door-'+orientation+(open?'-open':'-closed'),'Porta da DG — '+(vertical?'vertical':'horizontal')+(open?' aberta':' fechada'),{
   w,h,ay:.5,draw:g=>drawDungeonDoor({x:w/2,y:h/2,w,h,orientation,previewOpen:open},g,true)
  });
 }
 for(const [type,name] of Object.entries({escada:'Escada'})){
  gameArtRegister('dg-decor-'+type,name+' da DG',{w:40,h:48,ay:42/48,draw:g=>drawDungeonDecoration({x:20,y:42,type},g,true)});
 }
 gameArtRegister('dg-torch','Tocha da DG',{w:12,h:16,ay:12/16,draw:g=>{
  g.fillStyle='#33271f';g.fillRect(4,10,4,6);
  g.fillStyle='#ea580c';g.fillRect(4,6,4,5);g.fillStyle='#fde047';g.fillRect(5,7,2,3);
 }});
 // Desenho dos elementos da DG para a Engine montar a cena com as mesmas artes do jogo.
 window.DG_DRAW={
  temas:DUNGEON_THEME_COLORS, estiloTema:ESTILO_TEMA_DG, pisoTema:PISO_TEMA_DG,
  decoracoes:{escada:'Escada'},
  decoracao:(d,g)=>drawDungeonDecoration(d,g),
  porta:(d,g)=>drawDungeonDoor(d,g),
  portal:(x,y,tipo,ativo,g)=>drawDungeonGate(x,y,tipo,ativo,g)
 };

 // aliados vivos na mesma DG (online.js); sem multijogador, nenhum
 const aliadosDG = () => window.inDungeon && window.aliadosVisiveis ? aliadosVisiveis() : [];
 // 3. Campo de Visão / Névoa Dinâmica (Fog of War) da Caverna
 function drawDungeonVision(W, H, shakeX, shakeY){
  if(dungeonVisionCv.width !== W || dungeonVisionCv.height !== H){
   dungeonVisionCv.width = W;
   dungeonVisionCv.height = H;
  }
  const vctx = dungeonVisionCtx;
  vctx.globalCompositeOperation = 'source-over';
  vctx.fillStyle = 'rgba(4, 3, 3, 0.94)';
  vctx.fillRect(0, 0, W, H);

  // Escava áreas iluminadas no campo de visão
  vctx.globalCompositeOperation = 'destination-out';

  const toScreenX = wx => Math.round(W / 2 + (wx - p.x) * S + shakeX);
  const toScreenY = wy => Math.round(H / 2 + (wy - p.y) * S + shakeY);

  // Luz do Jogador (raio de visão ~165px)
  const px = toScreenX(p.x);
  const py = toScreenY(p.y);
  const playerRadius = Math.round(165 * S);
  const pg = vctx.createRadialGradient(px, py, 20 * S, px, py, playerRadius);
  pg.addColorStop(0, 'rgba(0,0,0,1)');
  pg.addColorStop(0.65, 'rgba(0,0,0,0.85)');
  pg.addColorStop(1, 'rgba(0,0,0,0)');
  vctx.fillStyle = pg;
  vctx.beginPath();
  vctx.arc(px, py, playerRadius, 0, Math.PI * 2);
  vctx.fill();

  // visão compartilhada: cada aliado na mesma DG ilumina a mesma área que o herói
  for(const a of aliadosDG()){
   const ax = toScreenX(a.x), ay = toScreenY(a.y);
   if(ax < -playerRadius || ax > W + playerRadius || ay < -playerRadius || ay > H + playerRadius) continue;
   const ag = vctx.createRadialGradient(ax, ay, 20 * S, ax, ay, playerRadius);
   ag.addColorStop(0, 'rgba(0,0,0,1)');
   ag.addColorStop(0.65, 'rgba(0,0,0,0.85)');
   ag.addColorStop(1, 'rgba(0,0,0,0)');
   vctx.fillStyle = ag;
   vctx.beginPath();
   vctx.arc(ax, ay, playerRadius, 0, Math.PI * 2);
   vctx.fill();
  }

  // Luz das Tochas da Caverna
  dungeonTorches.forEach(t => {
   const tx = toScreenX(t.x);
   const ty = toScreenY(t.y);
   if(tx < -100 || tx > W + 100 || ty < -100 || ty > H + 100) return;
   const flicker = Math.sin(time * 16 + t.x) * 4;
   const torchRadius = Math.round((85 + flicker) * S);
   const tg = vctx.createRadialGradient(tx, ty, 10 * S, tx, ty, torchRadius);
   tg.addColorStop(0, 'rgba(0,0,0,0.95)');
   tg.addColorStop(0.6, 'rgba(0,0,0,0.7)');
   tg.addColorStop(1, 'rgba(0,0,0,0)');
   vctx.fillStyle = tg;
   vctx.beginPath();
   vctx.arc(tx, ty, torchRadius, 0, Math.PI * 2);
   vctx.fill();
  });

  // Luz dos Portais (Retorno e Saída)
  [DUNGEON_ENTRANCE_PORTAL, DUNGEON_EXIT_PORTAL].forEach(pt => {
   if(pt.disabled)return;
   const gx = toScreenX(pt.x);
   const gy = toScreenY(pt.y);
   if(gx < -100 || gx > W + 100 || gy < -100 || gy > H + 100) return;
   const gateRadius = Math.round(90 * S);
   const gg = vctx.createRadialGradient(gx, gy, 15 * S, gx, gy, gateRadius);
   gg.addColorStop(0, 'rgba(0,0,0,0.9)');
   gg.addColorStop(1, 'rgba(0,0,0,0)');
   vctx.fillStyle = gg;
   vctx.beginPath();
   vctx.arc(gx, gy, gateRadius, 0, Math.PI * 2);
   vctx.fill();
  });

  // Luz e aura do chefe se vivo
  if(dungeonBoss && dungeonBoss.hp > 0){
   const bx = toScreenX(dungeonBoss.x);
   const by = toScreenY(dungeonBoss.y);
   if(bx >= -100 && bx <= W + 100 && by >= -100 && by <= H + 100){
    const bossRadius = Math.round(110 * S);
    const bg = vctx.createRadialGradient(bx, by, 20 * S, bx, by, bossRadius);
    bg.addColorStop(0, 'rgba(0,0,0,0.85)');
    bg.addColorStop(1, 'rgba(0,0,0,0)');
    vctx.fillStyle = bg;
    vctx.beginPath();
    vctx.arc(bx, by, bossRadius, 0, Math.PI * 2);
    vctx.fill();
   }
  }

  // Desenha a máscara de campo de visão por cima do cenário da caverna
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(dungeonVisionCv, 0, 0);

  // Restaura a transformação da câmera da DG para os textos flutuantes e interface
  ctx.setTransform(S, 0, 0, S, Math.round(W / 2 - p.x * S + shakeX), Math.round(H / 2 - p.y * S + shakeY));
 }

 /* ---------- RENDERIZAÇÃO DA MASMORRA E DO AMBIENTE ESCURO ---------- */
 function drawDungeonWorld(){
  const { width: W, height: H } = cv;

  // REQUISITO: "como estamos dentro de uma caverna temos o corredor e resto do mapa e preto"
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, W, H);

  // Efeito de tremor de tela da DG (dungeonShake)
  let shakeX = 0, shakeY = 0;
  if(dungeonShake > 0){
   shakeX = (Math.random() - 0.5) * 8 * dungeonShake;
   shakeY = (Math.random() - 0.5) * 8 * dungeonShake;
  }

  ctx.setTransform(S, 0, 0, S, Math.round(W / 2 - p.x * S + shakeX), Math.round(H / 2 - p.y * S + shakeY));
  ctx.imageSmoothingEnabled = false;

  // 1. Chão da Caverna de Rocha (Salas e Corredores integrados perfeitamente)
  // com chão pintado as salas são só áreas lógicas: o chão e as paredes vêm da camada pintada
  const allBoxes = DUNGEON_CHAO ? [] : [...CAVE_ROOMS, ...CAVE_CORRIDORS];
  const palette = DUNGEON_THEME_COLORS[DUNGEON_THEME] || DUNGEON_THEME_COLORS.cave;
  // artes da DG: a própria (config.art), a editada em Artes do jogo, ou a padrão do tema (piso do pacote, parede e moldura de paredes-dg.js)
  const temaDG = getActiveDungeonConfig().theme||'cave', estiloEscolhido = getActiveDungeonConfig().paredeEstilo, estiloDG = estiloEscolhido || ESTILO_TEMA_DG[temaDG], pisoDG = PISO_TEMA_DG[temaDG] && window.PACOTE_MAPA && PACOTE_MAPA.texturas[PISO_TEMA_DG[temaDG]];
  const floorData = DUNGEON_ART.floor||gameArtData('dg-floor-'+temaDG)||(pisoDG?pisoDG.data:null), wallData = DUNGEON_ART.wall||(estiloEscolhido&&window.PAREDES_DG?PAREDES_DG.face(estiloEscolhido):null)||gameArtData('dg-wall-'+temaDG)||(estiloDG&&window.PAREDES_DG?PAREDES_DG.face(estiloDG):null);
  const floorPattern = cachedDungeonPattern(floorData);
  const wallPattern = cachedDungeonPattern(wallData);
  if(DUNGEON_CHAO && window.CHAO){
   const bordaData = DUNGEON_ART.borda||(estiloEscolhido&&window.PAREDES_DG?PAREDES_DG.borda(estiloEscolhido):null)||gameArtData('dg-borda-'+temaDG)||(estiloDG&&window.PAREDES_DG?PAREDES_DG.borda(estiloDG):null);
   if(!dungeonCamada) dungeonCamada = CHAO.dgCamada(DUNGEON_CHAO, texturasChao(), { piso: CHAO.comAnim(cachedDungeonArt(floorData), floorData, cachedDungeonArt), parede: CHAO.comAnim(cachedDungeonArt(wallData), wallData, cachedDungeonArt), borda: cachedDungeonArt(bordaData), largura: getActiveDungeonConfig().bordaLargura, cores: palette, estilos: window.PAREDES_DG ? PAREDES_DG.estilosDe(getActiveDungeonConfig(), cachedDungeonArt) : null });
   if(dungeonCamada){
    ctx.drawImage(dungeonCamada.c, dungeonCamada.x, dungeonCamada.y);
    // piso e parede animados (lava, pântano, sangue, rachaduras, paredes de chamas e cripta): só o que está à vista
    const mw = cv.width / S / 2 + 48, mh = cv.height / S / 2 + 64;
    CHAO.dgAnimar(ctx, dungeonCamada, time, { x0: p.x - mw, y0: p.y - mh, x1: p.x + mw, y1: p.y + mh });
   }
  }

  // Base escura de todas as salas e corredores
  ctx.fillStyle = palette.outer;
  allBoxes.forEach(r => ctx.fillRect(r.x, r.y, r.w, r.h));

  // Interior de rocha do chão (unificado sem bordas internas)
  ctx.fillStyle = floorPattern || palette.inner;
  allBoxes.forEach(r => ctx.fillRect(r.x + 2, r.y + 2, r.w - 4, r.h - 4));
  (DUNGEON_CHAO ? [] : CAVE_CORRIDORS).forEach(c => {
   if(c.dir === 'h' || c.w >= c.h){
    ctx.fillRect(c.x - 3, c.y + 2, c.w + 6, c.h - 4);
   } else {
    ctx.fillRect(c.x + 2, c.y - 3, c.w - 4, c.h + 6);
   }
  });

  // Textura de cascalho e fendas de rocha
  ctx.fillStyle = palette.texture;
  allBoxes.forEach(r => {
   for(let i = r.x + 12; i < r.x + r.w - 10; i += 24){
    for(let j = r.y + 12; j < r.y + r.h - 10; j += 22){
     ctx.fillRect(i, j, 4, 2);
     ctx.fillRect(i + 9, j + 7, 2, 3);
    }
   }
  });

  // 2. Paredes de Rocha e Bordas Exteriores Procedurais (Passagens abertas automaticamente)
  const isInsideOtherBox = (px, py, self) => {
   for(let k = 0; k < allBoxes.length; k++){
    const b = allBoxes[k];
    if(b === self) continue;
    if(px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h) return true;
   }
   return false;
  };

  const wallStep = 8;
  allBoxes.forEach(b => {
   // Borda Norte
   for(let x = b.x; x < b.x + b.w; x += wallStep){
    const segW = Math.min(wallStep, b.x + b.w - x);
    // parede de cima em visão 3/4: face de 32 px (2 ladrilhos) com o desenho da parede da DG, sem faixas de brilho/sombra
    if(!isInsideOtherBox(x + segW / 2, b.y - 8, b)){
     ctx.fillStyle = wallPattern || palette.wall; ctx.fillRect(x, b.y - 32, segW, 32);
    }
   }
   // Borda Sul
   for(let x = b.x; x < b.x + b.w; x += wallStep){
    const segW = Math.min(wallStep, b.x + b.w - x);
    if(!isInsideOtherBox(x + segW / 2, b.y + b.h + 4, b)){
     ctx.fillStyle = wallPattern || palette.shadow; ctx.fillRect(x, b.y + b.h - 2, segW, 2);
    }
   }
   // Borda Oeste
   for(let y = b.y; y < b.y + b.h; y += wallStep){
    const segH = Math.min(wallStep, b.y + b.h - y);
    if(!isInsideOtherBox(b.x - 4, y + segH / 2, b)){
     ctx.fillStyle = wallPattern || palette.shadow; ctx.fillRect(b.x, y, 2, segH);
     ctx.fillStyle = palette.wall; ctx.fillRect(b.x, y, 1, segH);
    }
   }
   // Borda Leste
   for(let y = b.y; y < b.y + b.h; y += wallStep){
    const segH = Math.min(wallStep, b.y + b.h - y);
    if(!isInsideOtherBox(b.x + b.w + 4, y + segH / 2, b)){
     ctx.fillStyle = wallPattern || palette.shadow; ctx.fillRect(b.x + b.w - 2, y, 2, segH);
     ctx.fillStyle = palette.wall; ctx.fillRect(b.x + b.w - 1, y, 1, segH);
    }
   }
  });

  // Portas liberadas após derrotar os inimigos da sala vinculada.
  DUNGEON_DOORS.forEach(door=>drawDungeonDoor(door));

  // 5. Elementos Decorativos da Caverna (Chão / Cenário)
  DUNGEON_DECORATIONS.forEach(dec => { if(!dec.alto) drawDungeonDecoration(dec); });
  // 6. Tochas da Caverna com Iluminação Dinâmica
  dungeonTorches.forEach(t => {
   if(drawCustomDungeonObject(t))return;
   if(!gameArtDraw('dg-torch',ctx,t.x,t.y)){
   // Suporte de ferro da tocha
   ctx.fillStyle = '#33271f';
   ctx.fillRect(t.x - 2, t.y - 2, 4, 6);
   // Fogo animado
   const fl = Math.sin(time * 16 + t.x) * 1.2;
   ctx.fillStyle = '#ea580c';
   ctx.fillRect(t.x - 2, t.y - 6 + fl, 4, 5);
   ctx.fillStyle = '#fde047';
   ctx.fillRect(t.x - 1, t.y - 5 + fl, 2, 3);
   }
   // Brilho quente radial no chão/parede
   const tg = ctx.createRadialGradient(t.x, t.y, 2, t.x, t.y, 48);
   tg.addColorStop(0, 'rgba(251,146,60,0.24)');
   tg.addColorStop(1, 'rgba(234,88,12,0)');
   ctx.fillStyle = tg;
   ctx.fillRect(t.x - 48, t.y - 48, 96, 96);
  });

  // 7. Portais da Masmorra (Estilo Madeira Mágica com Vórtice e Quadradinhos Mágicos em Pixel Art)
  // Portal de Entrada / Retorno (Sala 0)
  if(!drawCustomDungeonObject(DUNGEON_ENTRANCE_PORTAL))drawDungeonGate(DUNGEON_ENTRANCE_PORTAL.x, DUNGEON_ENTRANCE_PORTAL.y, 'return', true);

  // Portal de Saída (Sala 3 - Fundo da Sala do Boss)
  const isBossDead = dungeonBossesDefeated();
  if(!DUNGEON_EXIT_PORTAL.disabled&&!drawCustomDungeonObject(DUNGEON_EXIT_PORTAL,isBossDead?1:.5))drawDungeonGate(DUNGEON_EXIT_PORTAL.x, DUNGEON_EXIT_PORTAL.y, 'exit', isBossDead);

  // 5. Avisos das mecânicas de chefe no chão e auras (js/chefes.js)
  if(window.desenharTelegrafos) desenharTelegrafos();
  if(window.CURANDEIRO) CURANDEIRO.desenhar(); // áreas e pulsos do Curandeiro (antes não apareciam na DG)

  // 6. Lista de Entidades para desenhar com ordenação por Y (Y-sort)
  const renderList = [];

  // Baús da Masmorra
  dungeonChests.forEach(ch => {
   renderList.push([ch.y, () => {
    const spr = (!ch.opened && cachedDungeonArt(ch.sprite))||window.dungeonChestSprite(ch.tier, '', ch.opened);
    if(spr){
     const isHov = dist(wpos(), ch) < 18;
     if(isHov){
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.beginPath(); ctx.ellipse(ch.x, ch.y, 14, 6, 0, 0, Math.PI * 2); ctx.fill();
     }
     ctx.drawImage(spr, Math.round(ch.x - spr.width / 2), Math.round(ch.y - spr.height + 2));

     ctx.font = '5px monospace'; ctx.textAlign = 'center';
     const tipoBau = window.BAUS ? BAUS.tipo(ch.tier) : ch.tier;
     ctx.fillStyle = (window.BAUS && BAUS.COR[tipoBau]) || '#fff';
     ctx.fillText((window.BAUS && BAUS.NOME[tipoBau]) || 'Baú', ch.x, ch.y - 18);
     if(!ch.opened && isHov){
      ctx.fillStyle = '#ffffff';
      ctx.fillText('Clique para abrir', ch.x, ch.y - 25);
     }
    }
   }]);
  });

  // Ferreiro Prisioneiro na Sala do Boss (se ainda não resgatado)
  if(!window.blacksmithSaved&&!DUNGEON_BLACKSMITH_POS.disabled){
   const bsPos = DUNGEON_BLACKSMITH_POS;
   renderList.push([bsPos.y, () => {
    const isBossDead = dungeonBossesDefeated();
    const spr = cachedDungeonArt(bsPos.sprite)||makeBlacksmithSprite(!isBossDead);
    ctx.drawImage(spr, Math.round(bsPos.x - spr.width / 2), Math.round(bsPos.y - spr.height + 2));

    ctx.font = '5px monospace'; ctx.textAlign = 'center';
    ctx.fillStyle = '#fbbf24';
    ctx.fillText('Ferreiro', bsPos.x, bsPos.y - 24);

    if(isBossDead){
     ctx.font = 'bold 8px monospace';
     ctx.fillStyle = '#ffd84a';
     ctx.fillText('!', bsPos.x, bsPos.y - 30 + Math.sin(time * 5) * 2);
    } else {
     ctx.fillStyle = '#94a3b8';
     ctx.fillText('(Prisioneiro)', bsPos.x, bsPos.y - 18);
    }
   }]);
  }

  // Inimigos da DG
  en.forEach(e => {
   if(e.hp <= 0 && (!e.deathFade || e.deathFade <= 0)) return;
   renderList.push([e.y, () => {
    const f = face(e);
    const scale = ESCALA_MUNDO;
    const spriteH = wh(e.img) * scale;
    const labelY = e.y - spriteH - 1;

    if(p.tgt == e) circ(e.x, e.y, 14, '#f55'); // mouse em cima: contorno vermelho no desenho (dr.borda)
    ctx.globalAlpha = e.hit > 0 ? .5 : 1;
    const an = window.animMonstro ? animMonstro(e, false) : anim(e, e.wu, false); // sem tranco para a frente; quadros próprios sem animação procedural
    const sprite = monsterSpriteFrame(e, f.d, an || {}, f.fl);
    if(hov == e) dr.borda = '#ff2b2b';
    dr(sprite, e.x, e.y, window.esqMonstro && esqMonstro(e, f.d, f.fl) ? 1 : f.fl, scale, an);
    ctx.globalAlpha = 1;

    // Se for o Boss, não desenha a barra de vida minúscula em cima da cabeça porque temos a barra de elite no topo da tela!
    if(!e.boss){
     const hpRatio = Math.max(0, Math.min(1, e.hp / monsterMaxHp(e)));
     const barW = 28, t = 1 / S, barX = Math.round(e.x - barW / 2), barY = Math.round(labelY + 2);
     ctx.fillStyle = '#3a3a3a'; ctx.fillRect(barX - t, barY - t, barW + 2 * t, 1 + 2 * t);
     ctx.fillStyle = '#4b121c'; ctx.fillRect(barX, barY, barW, 1);
     ctx.fillStyle = '#ed354e'; ctx.fillRect(barX, barY, barW * hpRatio, 1);
     ctx.font = '5px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#d8d8d8';
     ctx.fillText(e.name || (MONSTER_TYPES[e.ty] && MONSTER_TYPES[e.ty].name) || 'Monstro', e.x, labelY);
    }
   }]);
  });

  // Jogador
  if(p.dead <= 0){
   renderList.push([p.y, () => {
    const o = lunge(p, p.wt, p.aw, .25);
    ctx.globalAlpha = p.hit > 0 ? .5 : 1;
    const f = face(p);
    const an = anim(p, .25);
    dr.ent = p; dr(heroImg(f.d, an), p.x + o[0], p.y + o[1], f.fl, 1, an);
    ctx.globalAlpha = 1;

    // Barra de vida e mana acima do jogador
    const barW = 28, t = 1 / S, barX = Math.round(p.x - barW / 2), barY = Math.round(p.y - 25 - ACIMA_HEROI());
    const maxHp = mhp(), maxMp = mmp();
    const hpRatio = Math.max(0, Math.min(1, p.hp / maxHp)), mpRatio = Math.max(0, Math.min(1, p.mp / maxMp));
    ctx.fillStyle = '#3a3a3a'; ctx.fillRect(barX - t, barY - t, barW + 2 * t, 3 + 3 * t);
    ctx.fillStyle = '#173d1c'; ctx.fillRect(barX, barY, barW, 2);
    ctx.fillStyle = '#4cd04f'; ctx.fillRect(barX, barY, barW * hpRatio, 2);
    ctx.fillStyle = '#10203a'; ctx.fillRect(barX, barY + 2 + t, barW, 1);
    ctx.fillStyle = '#3985ed'; ctx.fillRect(barX, barY + 2 + t, barW * mpRatio, 1);
   }]);
  }

  // decorações altas (árvores, lápides, estacas): na ordem de profundidade, só as perto da câmera
  for(const dec of DUNGEON_DECORATIONS) if(dec.alto && Math.abs(dec.x - p.x) < 300 && Math.abs(dec.y - p.y) < 220) renderList.push([dec.y, () => drawDungeonDecoration(dec)]);

  // Outros jogadores do grupo (js/online.js)
  if(window.onlineDrawables) onlineDrawables(renderList);

  // Ordena por profundidade Y e desenha todos
  renderList.sort((a, b) => a[0] - b[0]).forEach(item => item[1]());
  if(window.ILHA_VIVA && DUNGEON_THEME === 'forest') ILHA_VIVA.dgAr(); // folhas, névoa e esporos (js/ilha-viva.js)

  // 7. Partículas e Loots Voadores
  flyingLoots.forEach(fl => {
   if(fl.type === 'item' && fl.delay > 0) return;
   if(fl.type === 'coin'){
    // Moeda de ouro reluzente
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(Math.round(fl.x - 2), Math.round(fl.y - 2), 4, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(Math.round(fl.x - 1), Math.round(fl.y - 1), 2, 2);
   } else if(fl.type === 'item'){
    // Ícone do item saltando com halo
    const it = ITEMS[fl.id];
    if(it && it.ic){
     ctx.save();
     ctx.shadowColor = fl.rarityColor || ((window.BAUS && BAUS.COR[BAUS.tipo(fl.tier)]) || '#38bdf8');
     ctx.shadowBlur = 4;
     ctx.fillStyle = '#0f172a';
     ctx.fillRect(Math.round(fl.x - 6), Math.round(fl.y - 6), 12, 12);
     ctx.strokeStyle = ctx.shadowColor;
     ctx.strokeRect(Math.round(fl.x - 6), Math.round(fl.y - 6), 12, 12);
     if(fl.img) ctx.drawImage(fl.img, Math.round(fl.x - fl.img.width / 2), Math.round(fl.y - fl.img.height / 2));
     ctx.restore();
    }
   }
  });

  // itens e moedas caídos dos monstros (js/loot.js)
  if(window.desenharLoot) desenharLoot();
  if(window.desenharConj) desenharConj();

  // Efeitos visuais e feitiços: os mesmos da ilha (projéteis com efeito, explosões de fogo, gelo, luz...)
  if(window.desenharEfeitosMundo) desenharEfeitosMundo();

  // 7. Campo de Visão / Névoa de Guerra Dinâmica (Atmosfera Escura da Caverna)
  drawDungeonVision(W, H, shakeX, shakeY);
  if(window.ILHA_VIVA && DUNGEON_THEME === 'forest') ILHA_VIVA.dgLuzes(); // vaga-lumes acesos por cima da escuridão

  // Textos flutuantes (dano, avisos, ouro)
  ctx.font = '6px monospace'; ctx.textAlign = 'center';
  fts.forEach(f => {
   ctx.globalAlpha = Math.max(0, f.a);
   ctx.fillStyle = '#000'; ctx.fillText(f.t, Math.round(f.x) + .5, Math.round(f.y) + .5);
   ctx.fillStyle = corFt(f); ctx.fillText(f.t, Math.round(f.x), Math.round(f.y)); if (f.crit) iconeCrit(f);
   ctx.globalAlpha = 1;
  });

  // 8. Barra de Vida Épica de Elite do Boss no Topo da Tela
  drawDungeonEliteBossBar();

  // 9. Minimapa da Masmorra
  drawDungeonMinimap();

  // 10. morte na masmorra: tela própria em #telaMorte (render.js) com Sair da dungeon e Assistir (js/morte-dg.js)

 }
 window.drawDungeonWorld = drawDungeonWorld;

 /* ---------- BARRA DE VIDA DE ELITE DO BOSS NO TOPO DA TELA ---------- */
 function drawDungeonEliteBossBar(){
  const boss = dungeonBoss || dungeonBosses.find(enemy => enemy.hp > 0);
  if(!boss || (boss.hp <= 0 && (boss.delayedHp || 0) <= 0)) return;
  // A vida do boss só aparece quando o jogador clica nele (selecionado como alvo ou inspecionado)
  const isSelected = (p.tgt === boss) || (window.insp === boss);
  if(!isSelected) return;

  const { width: W } = cv;
  const barW = Math.min(440, W - 60);
  const barH = 22;
  const barX = Math.round((W - barW) / 2);
  const barY = 22;

  ctx.setTransform(1, 0, 0, 1, 0, 0);

  // Moldura externa escura de elite
  ctx.fillStyle = 'rgba(10,5,5,0.85)';
  ctx.fillRect(barX - 44, barY - 14, barW + 50, barH + 24);
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 2;
  ctx.strokeRect(barX - 44, barY - 14, barW + 50, barH + 24);

  // Adorno superior e nome de elite do chefe
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'center';
  const bossName = boss.name || (MONSTER_TYPES[boss.ty] && MONSTER_TYPES[boss.ty].name) || 'Chefe';
  const bossTitle = `✦ ${bossName.toUpperCase()} ✦  [CHEFÃO · NV ${boss.lvl || 1}]`;
  ctx.fillStyle = '#000000';
  ctx.fillText(bossTitle, W / 2 + 1, barY - 3);
  ctx.fillStyle = '#ffd700';
  ctx.fillText(bossTitle, W / 2, barY - 4);

  // Fundo da barra de vida
  ctx.fillStyle = '#260408';
  ctx.fillRect(barX, barY, barW, barH);

  // Barra de atraso (dano recente / delayedHp em amarelo-alaranjado)
  const maxHp=monsterMaxHp(boss);
  const delayedRatio = Math.max(0, Math.min(1, Math.max(boss.hp, boss.delayedHp || boss.hp) / maxHp));
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(barX, barY, barW * delayedRatio, barH);

  // Barra ativa de HP (gradiente carmesim a fogo ardente)
  const hpRatio = Math.max(0, Math.min(1, boss.hp / maxHp));
  const hpGrad = ctx.createLinearGradient(barX, barY, barX + barW * hpRatio, barY);
  hpGrad.addColorStop(0, '#991b1b');
  hpGrad.addColorStop(0.5, '#dc2626');
  hpGrad.addColorStop(1, '#ea580c');
  ctx.fillStyle = hpGrad;
  ctx.fillRect(barX, barY, barW * hpRatio, barH);

  // Segmentos e marcadores de HP
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  for(let f = 0.2; f < 1; f += 0.2){
   ctx.fillRect(barX + barW * f, barY, 1.5, barH);
  }

  // Brilho de reflexo superior na barra
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fillRect(barX, barY, barW, barH / 2);

  // Borda dourada da barra
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(barX, barY, barW, barH);

  const effects = Object.entries(boss.st || {}).filter(([id, effect]) => FX_INFO[id] && effect && effect.t > 0);
  if(effects.length){
   const iconSize = 14, gap = 5, rowWidth = effects.length * (iconSize + gap) - gap;
   const startX = Math.round((W - rowWidth) / 2), effectY = barY + barH + 5;
   window._dungeonEffectIcons = window._dungeonEffectIcons || {};
   effects.forEach(([id, effect], index) => {
    const x = startX + index * (iconSize + gap), info = FX_INFO[id];
    ctx.fillStyle = 'rgba(8,8,10,0.9)';ctx.fillRect(x - 1, effectY - 1, iconSize + 2, iconSize + 2);
    ctx.strokeStyle = info.good ? '#4ade80' : '#f87171';ctx.lineWidth = 1;ctx.strokeRect(x - 1, effectY - 1, iconSize + 2, iconSize + 2);
    const iconUrl = window.fxIcon && fxIcon(id);
    if(iconUrl){
     let icon = window._dungeonEffectIcons[id];
     if(!icon){icon = new Image();icon.src = iconUrl;window._dungeonEffectIcons[id] = icon}
     if(icon.complete)ctx.drawImage(icon, x, effectY, iconSize, iconSize);
     else{ctx.fillStyle = info.c || '#fff';ctx.fillRect(x + 3, effectY + 3, iconSize - 6, iconSize - 6)}
    } else {ctx.fillStyle = info.c || '#fff';ctx.fillRect(x + 3, effectY + 3, iconSize - 6, iconSize - 6)}
    ctx.font = '8px monospace';ctx.textAlign = 'center';ctx.fillStyle = '#fff';
    ctx.fillText(String(Math.ceil(effect.t)), x + iconSize / 2, effectY + iconSize + 9);
   });
  }

  // Texto numérico de vida
  ctx.font = 'bold 10px monospace';
  ctx.fillStyle = '#000000';
  const hpText = `${Math.ceil(Math.max(0, boss.hp))} / ${Math.round(maxHp)} (${Math.ceil(hpRatio * 100)}%)`;
  ctx.fillText(hpText, barX + barW / 2 + 1, barY + 15);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(hpText, barX + barW / 2, barY + 14);

  // Ícone do Boss à esquerda em moldura dourada
  const iconSrc = boss === dungeonBoss && (window.DG_BOSS_ICONS && window.DG_BOSS_ICONS.skeleton) || '';
  if(iconSrc || boss.img){
   if(!window._cachedBossIconImg){
    window._cachedBossIconImg = new Image();
    if(typeof iconSrc == 'string' && iconSrc) window._cachedBossIconImg.src = iconSrc;
   }
   ctx.fillStyle = '#180709';
   ctx.fillRect(barX - 40, barY - 4, 32, 32);
   if(iconSrc && typeof iconSrc != 'string') ctx.drawImage(iconSrc, barX - 40, barY - 4, 32, 32);
   else if(iconSrc && window._cachedBossIconImg.complete) ctx.drawImage(window._cachedBossIconImg, barX - 40, barY - 4, 32, 32);
   else if(boss.img) ctx.drawImage(boss.img, barX - 40, barY - 4, 32, 32);
   ctx.strokeStyle = '#fbbf24';
   ctx.lineWidth = 2;
   ctx.strokeRect(barX - 40, barY - 4, 32, 32);
  }
 }

 /* ---------- MINIMAPA DA MASMORRA ---------- */
 /* memória do minimapa (2026-10-23): o que o herói já viu fica desenhado (mais escuro); o campo de visão de agora, claro.
    Chão pintado: 1 pixel por ladrilho num desenho guardado; salas e corredores: os que já entraram no campo de visão.
    Zera ao entrar na DG. */
 let memDG = null;
 window.zerarMemoriaDG = () => { memDG = null; };
 function memoriaDG(){
  if(!memDG){
   memDG = { salas: new Set(), t: -1 };
   if(DUNGEON_CHAO && DUNGEON_CAIXA){ const c = document.createElement('canvas'); c.width = DUNGEON_CAIXA.i1 - DUNGEON_CAIXA.i0 + 1; c.height = DUNGEON_CAIXA.j1 - DUNGEON_CAIXA.j0 + 1; memDG.cv = c; memDG.g = c.getContext('2d'); memDG.g.fillStyle = '#5a4a3e'; }
  }
  if(time - memDG.t < .15) return memDG;
  memDG.t = time;
  const R = VISION_RANGE;
  // o que o herói e os aliados da mesma DG enxergam entra na memória
  for(const o of [p, ...aliadosDG()]){
   if(memDG.cv){
    const i0 = Math.floor((o.x - R) / 16), i1 = Math.floor((o.x + R) / 16), j0 = Math.floor((o.y - R) / 16), j1 = Math.floor((o.y + R) / 16);
    for(let j = j0; j <= j1; j++) for(let i = i0; i <= i1; i++) if(DUNGEON_CHAO[i + ',' + j] && Math.hypot((i + .5) * 16 - o.x, (j + .5) * 16 - o.y) <= R) memDG.g.fillRect(i - DUNGEON_CAIXA.i0, j - DUNGEON_CAIXA.j0, 1, 1);
   } else [...CAVE_ROOMS, ...CAVE_CORRIDORS].forEach((b, k) => { const dx = Math.max(b.x - o.x, 0, o.x - b.x - b.w), dy = Math.max(b.y - o.y, 0, o.y - b.y - b.h); if(Math.hypot(dx, dy) <= R) memDG.salas.add(k); });
  }
  return memDG;
 }
 function drawDungeonMinimap(){
  const sz = 160;
  mm.fillStyle = '#050508';
  mm.fillRect(0, 0, sz, sz);

  // Ajusta o minimapa ao tamanho real do pack, inclusive mapas abertos e coordenadas negativas.
  const boxes = window.dungeonCaixas();
  if(!boxes.length) return;
  const minX = Math.min(...boxes.map(box => box.x)) - 24;
  const maxX = Math.max(...boxes.map(box => box.x + box.w)) + 24;
  const minY = Math.min(...boxes.map(box => box.y)) - 24;
  const maxY = Math.max(...boxes.map(box => box.y + box.h)) + 24;
  const mapW = maxX - minX, mapH = maxY - minY;
  const scale = (sz - 24) / Math.max(mapW, mapH);
  const offsetX = (sz - mapW * scale) / 2, offsetY = (sz - mapH * scale) / 2;

  const toMmX = x => offsetX + (x - minX) * scale;
  const toMmY = y => offsetY + (y - minY) * scale;

  // o que já foi visto (memória, mais escuro)
  const mem = memoriaDG();
  if(mem.cv){ mm.imageSmoothingEnabled = false; mm.drawImage(mem.cv, toMmX(DUNGEON_CAIXA.i0 * 16), toMmY(DUNGEON_CAIXA.j0 * 16), mem.cv.width * 16 * scale, mem.cv.height * 16 * scale); }
  else { mm.fillStyle = '#5a4a3e'; [...CAVE_ROOMS, ...CAVE_CORRIDORS].forEach((b, k) => { if(mem.salas.has(k)) mm.fillRect(toMmX(b.x), toMmY(b.y), b.w * scale, b.h * scale); }); }
  // o campo de visão de agora (do herói e dos aliados da mesma DG), mais claro
  const olhos = [p, ...aliadosDG()];
  const near = (x, y) => olhos.some(o => Math.hypot(x - o.x, y - o.y) <= VISION_RANGE);
  mm.save();
  mm.beginPath();
  for(const o of olhos){ mm.moveTo(toMmX(o.x) + VISION_RANGE * scale, toMmY(o.y)); mm.arc(toMmX(o.x), toMmY(o.y), VISION_RANGE * scale, 0, Math.PI * 2); }
  mm.clip();
  mm.fillStyle = '#a08a74';
  if(DUNGEON_CHAO){
   for(const o of olhos){
    const i0 = Math.floor((o.x - VISION_RANGE) / 16), i1 = Math.floor((o.x + VISION_RANGE) / 16), j0 = Math.floor((o.y - VISION_RANGE) / 16), j1 = Math.floor((o.y + VISION_RANGE) / 16);
    for(let j = j0; j <= j1; j++) for(let i = i0; i <= i1; i++) if(DUNGEON_CHAO[i + ',' + j]) mm.fillRect(toMmX(i * 16), toMmY(j * 16), 16 * scale + .5, 16 * scale + .5);
   }
  } else {
   CAVE_ROOMS.forEach(r => {
    mm.fillRect(toMmX(r.x), toMmY(r.y), r.w * scale, r.h * scale);
   });
   CAVE_CORRIDORS.forEach(c => {
    mm.fillRect(toMmX(c.x), toMmY(c.y), c.w * scale, c.h * scale);
   });
  }
  mm.restore();

  // Baús no minimapa
  dungeonChests.forEach(ch => {
   if(ch.opened || !near(ch.x, ch.y)) return;
   mm.fillStyle = (window.BAUS && BAUS.COR[BAUS.tipo(ch.tier)]) || '#38bdf8';
   mm.fillRect(toMmX(ch.x) - 2, toMmY(ch.y) - 2, 4, 4);
  });

  // Inimigos no minimapa: só os que estão no campo de visão
  en.forEach(e => {
   if(e.hp <= 0 || !near(e.x, e.y)) return;
   if(e.boss){
    mm.fillStyle = '#ef4444';
    mm.fillRect(toMmX(e.x) - 3, toMmY(e.y) - 3, 7, 7);
   } else {
    mm.fillStyle = '#f87171';
    mm.fillRect(toMmX(e.x) - 1.5, toMmY(e.y) - 1.5, 3, 3);
   }
  });

  // Portais no minimapa
  mm.fillStyle = '#38bdf8';
  if(near(DUNGEON_ENTRANCE_PORTAL.x, DUNGEON_ENTRANCE_PORTAL.y))mm.fillRect(toMmX(DUNGEON_ENTRANCE_PORTAL.x) - 2, toMmY(DUNGEON_ENTRANCE_PORTAL.y) - 2, 5, 5);
  if(!DUNGEON_EXIT_PORTAL.disabled&&dungeonBossesDefeated()&&near(DUNGEON_EXIT_PORTAL.x, DUNGEON_EXIT_PORTAL.y)){
   mm.fillStyle = '#4ade80';
   mm.fillRect(toMmX(DUNGEON_EXIT_PORTAL.x) - 2, toMmY(DUNGEON_EXIT_PORTAL.y) - 2, 5, 5);
  }

  // aliados da mesma DG (online.js: só quem está na mesma sala), na mesma escala do minimapa da DG
  if(window.onlineMinimap) onlineMinimap(mm, minX - offsetX / scale, minY - offsetY / scale, scale, sz);

  // Jogador no minimapa
  mm.fillStyle = '#ffffff';
  mm.fillRect(toMmX(p.x) - 2.5, toMmY(p.y) - 2.5, 5, 5);
  mm.strokeStyle = '#000';
  mm.lineWidth = 1;
  mm.strokeRect(toMmX(p.x) - 2.5, toMmY(p.y) - 2.5, 5, 5);

 }

 window.CAVE_ROOMS = CAVE_ROOMS;
 window.CAVE_CORRIDORS = CAVE_CORRIDORS;
 window.DUNGEON_DECORATIONS = DUNGEON_DECORATIONS;
 window.dungeonChests = dungeonChests;
 window.dungeonTorches = dungeonTorches;
})();
