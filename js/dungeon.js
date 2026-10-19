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
 const limparTelegrafos = () => { if(window.TELEGRAFOS) TELEGRAFOS.length = 0; };
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
  if(!MONSTER_TYPES.goblinBoss){
   MONSTER_TYPES.goblinBoss = { name: 'Lorde Goblin Demoníaco', stats: { F: 28, A: 12, I: 16 }, bossType: 'grandboss' };
  }
 }

 // Geometria Dinâmica e Configuração da Masmorra
 let CAVE_ROOMS = [];
 let CAVE_CORRIDORS = [];
 let DUNGEON_DOORS = [];
 let DUNGEON_DECORATIONS = [];
 let DUNGEON_THEME = 'cave';
 let DUNGEON_ART = {};
 let DUNGEON_NAME = 'Covil do Lorde Goblin';
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
  DUNGEON_THEME = ['cave', 'underground', 'forest'].includes(cfg.theme) ? cfg.theme : 'cave';
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
 let DUNGEON_CHAO = null, DUNGEON_CAIXA = null, dungeonCamada = null, dungeonTexturas = null;
 const texturasChao = () => dungeonTexturas || (dungeonTexturas = window.CHAO ? CHAO.texturas(PROJ.pixel) : {});
 const chaoDG = (x, y) => DUNGEON_CHAO && DUNGEON_CHAO[Math.floor(x / 16) + ',' + Math.floor(y / 16)];
 // caixas que cobrem o mapa da DG (caminhos, minimapa): salas, corredores e a área pintada
 window.dungeonCaixas = () => [...CAVE_ROOMS, ...CAVE_CORRIDORS, ...(DUNGEON_CAIXA ? [DUNGEON_CAIXA] : [])];
 window.syncDungeonFromConfig = syncDungeonFromConfig;
 syncDungeonFromConfig();

 const DUNGEON_THEME_COLORS = {
  cave: { outer: '#1c1613', inner: '#29201b', wall: '#423329', highlight: '#5c483b', shadow: '#100c09', texture: '#140f0c' },
  underground: { outer: '#0d1b22', inner: '#12313a', wall: '#214854', highlight: '#397080', shadow: '#071115', texture: '#0a2028' },
  forest: { outer: '#1a2b18', inner: '#294526', wall: '#3b5a2f', highlight: '#62864a', shadow: '#111d12', texture: '#172817' }
 };
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

 /* ---------- Sprites em Pixel Art dos Baús (Azul, Roxo, Dourado) ---------- */
 const CHEST_SPRITES = {};
 function initChestSprites(){
  if(CHEST_SPRITES.blue_closed) return;
  const tiers = {
   blue:   { body1: '#1e3a8a', body2: '#2563eb', trim1: '#334155', trim2: '#64748b', lock: '#67e8f9', glow: '#38bdf8' },
   purple: { body1: '#4c1d95', body2: '#7c3aed', trim1: '#2e1065', trim2: '#a855f7', lock: '#f472b6', glow: '#c084fc' },
   gold:   { body1: '#78350f', body2: '#d97706', trim1: '#451a03', trim2: '#fbbf24', lock: '#ef4444', glow: '#f59e0b' }
  };

  for(const [tier, col] of Object.entries(tiers)){
   // Baú Fechado (20x16)
   CHEST_SPRITES[tier + '_closed'] = paint(20, 16, (R, E) => {
    // Sombra da base
    R(2, 13, 16, 3, '#09080c');
    // Corpo inferior
    R(2, 7, 16, 7, col.body1);
    R(3, 8, 14, 5, col.body2);
    // Tampa abaulada
    R(2, 2, 16, 5, col.body1);
    R(3, 3, 14, 4, col.body2);
    R(4, 2, 12, 1, col.trim2);
    // Travessas e ferragens reforçadas
    R(2, 2, 2, 12, col.trim1);
    R(16, 2, 2, 12, col.trim1);
    R(9, 2, 2, 12, col.trim1);
    R(2, 6, 16, 2, col.trim1);
    R(3, 7, 14, 1, col.trim2);
    // Fechadura reluzente
    R(9, 6, 2, 3, col.lock);
    R(9, 7, 1, 1, '#ffffff');
   });

   // Baú Aberto (20x20)
   CHEST_SPRITES[tier + '_open'] = paint(20, 20, (R, E) => {
    // Sombra da base
    R(2, 17, 16, 3, '#09080c');
    // Fundo interno escuro do baú
    R(3, 9, 14, 8, '#0b060d');
    R(4, 10, 12, 6, '#180e1b');
    // Tesouro brilhando dentro
    R(5, 12, 10, 4, col.glow);
    R(7, 11, 6, 2, '#ffffff');
    // Paredes e bordas da base
    R(2, 10, 16, 7, col.body1);
    R(2, 10, 2, 7, col.trim1);
    R(16, 10, 2, 7, col.trim1);
    R(2, 15, 16, 2, col.trim1);
    R(3, 16, 14, 1, col.trim2);
    // Tampa aberta reclinada para trás
    R(2, 2, 16, 6, col.body1);
    R(3, 3, 14, 4, col.body2);
    R(2, 2, 2, 6, col.trim1);
    R(16, 2, 2, 6, col.trim1);
    R(9, 2, 2, 6, col.trim1);
    R(4, 2, 12, 1, col.trim2);
    // Fechadura na tampa
    R(9, 7, 2, 2, col.lock);
    R(9, 7, 1, 1, '#ffffff');
   });
  }

  const styles = {
   wood: { body1: '#543018', body2: '#925626', trim1: '#302016', trim2: '#d6a45e', lock: '#f1d27a', glow: '#d6a45e' },
   crystal: { body1: '#30234f', body2: '#6448a3', trim1: '#211631', trim2: '#b49bff', lock: '#67e8f9', glow: '#a5f3fc' },
   cursed: { body1: '#241623', body2: '#59313d', trim1: '#130d18', trim2: '#a35d68', lock: '#a3e635', glow: '#a3e635' },
   royal: { body1: '#501724', body2: '#92283a', trim1: '#35130f', trim2: '#f6c453', lock: '#fff1a8', glow: '#facc15' }
  };
  Object.entries(styles).forEach(([style, col]) => {
   ['blue', 'purple', 'gold'].forEach(tier => {
    CHEST_SPRITES[tier + '_' + style + '_closed'] = paint(22, 18, R => {
     R(2, 14, 18, 3, '#09080c');
     R(2, 7, 18, 8, col.body1); R(3, 8, 16, 6, col.body2);
     R(2, 2, 18, 6, col.body1); R(3, 3, 16, 4, col.body2);
     R(2, 2, 2, 13, col.trim1); R(18, 2, 2, 13, col.trim1);
     R(2, 7, 18, 2, col.trim1); R(3, 8, 16, 1, col.trim2);
     R(10, 7, 2, 4, col.lock); R(10, 8, 1, 1, '#ffffff');
     if(style === 'wood'){
      R(6, 3, 2, 4, '#bc7a3c'); R(14, 3, 2, 4, '#bc7a3c');
      R(5, 10, 2, 3, col.trim2); R(15, 10, 2, 3, col.trim2);
     } else if(style === 'crystal'){
      R(4, 1, 3, 2, '#a5f3fc'); R(5, 0, 1, 2, '#e0ffff');
      R(15, 1, 3, 2, '#a5f3fc'); R(16, 0, 1, 2, '#e0ffff');
      R(6, 4, 2, 1, '#d9faff');
     } else if(style === 'cursed'){
      R(5, 4, 3, 1, '#a3e635'); R(14, 4, 3, 1, '#a3e635');
      R(9, 11, 4, 2, '#ded3c2'); R(10, 11, 1, 1, '#261923'); R(12, 11, 1, 1, '#261923');
     } else if(style === 'royal'){
      R(5, 0, 2, 3, col.trim2); R(7, 1, 2, 2, col.trim2);
      R(10, 0, 2, 3, col.trim2); R(13, 1, 2, 2, col.trim2); R(15, 0, 2, 3, col.trim2);
      R(6, 4, 2, 1, '#fff1a8'); R(14, 4, 2, 1, '#fff1a8');
     }
    });
    CHEST_SPRITES[tier + '_' + style + '_open'] = paint(22, 22, R => {
     R(2, 19, 18, 3, '#09080c');
     R(3, 11, 16, 7, col.body1); R(4, 12, 14, 5, col.body2);
     R(5, 13, 12, 3, col.glow); R(8, 12, 6, 1, '#ffffff');
     R(2, 11, 2, 7, col.trim1); R(18, 11, 2, 7, col.trim1);
     R(2, 16, 18, 2, col.trim1); R(3, 17, 16, 1, col.trim2);
     R(2, 2, 18, 7, col.body1); R(3, 3, 16, 5, col.body2);
     R(2, 2, 2, 7, col.trim1); R(18, 2, 2, 7, col.trim1);
     R(10, 2, 2, 7, col.trim1); R(5, 2, 12, 1, col.trim2);
     R(10, 8, 2, 3, col.lock);
     if(style === 'crystal'){
      R(4, 1, 3, 2, '#a5f3fc'); R(15, 1, 3, 2, '#a5f3fc');
     } else if(style === 'cursed'){
      R(8, 14, 2, 1, '#a3e635'); R(12, 14, 2, 1, '#a3e635');
     } else if(style === 'royal'){
      R(6, 0, 2, 2, col.trim2); R(10, 0, 2, 2, col.trim2); R(14, 0, 2, 2, col.trim2);
     } else if(style === 'wood'){
      R(5, 3, 2, 5, '#bc7a3c'); R(15, 3, 2, 5, '#bc7a3c');
     }
    });
   });
  });
 }
 window.dungeonChestSprite = (tier, style, opened) => {
  const artId = `baus/${tier || 'blue'}-${style || 'classic'}-${opened ? 'aberto' : 'fechado'}`;
  const customArt = PROJ.art[artId];
  if(customArt) return cachedDungeonArt(customArt);
  initChestSprites();
  const key = (tier || 'blue') + '_' + ((style && style !== 'classic') ? style + '_' : '') + (opened ? 'open' : 'closed');
  return CHEST_SPRITES[key] || CHEST_SPRITES.blue_closed;
 };

 /* ---------- Sprite do Lorde Goblin Demoníaco (Full-Body) ---------- */
 function makeBossGoblinSprite(){
  return paint(36, 40, (R, E) => {
   // Sombra nos pés
   E(18, 38, 14, 4, '#080509');
   // Pernas musculosas com calçadeiras de ferro
   R(9, 26, 6, 10, '#2d5c1e');
   R(21, 26, 6, 10, '#2d5c1e');
   R(8, 33, 8, 5, '#1e1a17');
   R(20, 33, 8, 5, '#1e1a17');
   R(9, 34, 6, 3, '#483526');
   R(21, 34, 6, 3, '#483526');

   // Saiote tribal de couro e caveira no cinto
   R(9, 21, 18, 7, '#3d2516');
   R(11, 22, 14, 6, '#5a3a22');
   R(15, 22, 6, 5, '#e0d5be'); // Caveira no cinto
   R(17, 24, 1, 1, '#222');R(19, 24, 1, 1, '#222');

   // Tronco imponente e musculoso de goblin demoníaco
   R(9, 11, 18, 12, '#387226');
   R(11, 12, 14, 9, '#4d9834');
   // Tatuagens / veias de magma demoníaco pulsante
   R(12, 14, 4, 1, '#dc2626');R(14, 15, 2, 3, '#ea580c');R(13, 18, 3, 1, '#f59e0b');
   R(20, 14, 4, 1, '#dc2626');R(20, 15, 2, 3, '#ea580c');R(20, 18, 3, 1, '#f59e0b');

   // Ombreiras colossais pontiagudas de ferro negro com cravos de sangue
   R(4, 9, 7, 7, '#241a1c');
   R(25, 9, 7, 7, '#241a1c');
   R(5, 10, 5, 5, '#423135');
   R(26, 10, 5, 5, '#423135');
   R(3, 7, 3, 4, '#7f1d1d');R(2, 6, 2, 2, '#ef4444'); // Espinho esquerdo
   R(30, 7, 3, 4, '#7f1d1d');R(32, 6, 2, 2, '#ef4444'); // Espinho direito

   // Braços fortes
   R(6, 14, 5, 11, '#387226');
   R(25, 14, 5, 11, '#387226');
   R(5, 21, 6, 4, '#241a1c'); // Braceletes
   R(25, 21, 6, 4, '#241a1c');

   // Arma demoníaca: Grande Cutelo Denteado de Magma
   R(29, 13, 3, 18, '#523722'); // Cabo
   R(30, 8, 4, 14, '#1c1917');  // Lâmina pesada
   R(31, 9, 3, 12, '#7f1d1d');
   R(32, 10, 2, 9, '#ea580c');
   R(33, 12, 1, 5, '#fef08a');  // Fio em brasa
   R(34, 10, 1, 2, '#fff');R(34, 14, 1, 2, '#fff'); // Serrilhado

   // Cabeça e mandíbula demoníaca
   E(18, 8, 7, 6, '#387226');
   E(18, 8, 6, 5, '#4d9834');
   // Orelhas pontudas
   R(8, 7, 4, 3, '#387226');R(6, 8, 2, 1, '#4d9834');
   R(24, 7, 4, 3, '#387226');R(28, 8, 2, 1, '#4d9834');
   // Chifres superiores da testa
   R(12, 2, 3, 5, '#3b1216');R(11, 0, 2, 3, '#7f1d1d');R(10, 0, 1, 1, '#ef4444');
   R(21, 2, 3, 5, '#3b1216');R(23, 0, 2, 3, '#7f1d1d');R(25, 0, 1, 1, '#ef4444');
   // Olhos demoníacos em brasa
   R(13, 6, 3, 2, '#7f1d1d');R(14, 6, 2, 2, '#ef4444');R(15, 6, 1, 1, '#fef08a');
   R(19, 6, 3, 2, '#7f1d1d');R(20, 6, 2, 2, '#ef4444');R(21, 6, 1, 1, '#fef08a');
   // Nariz achatado
   R(17, 8, 2, 2, '#2d5c1e');
   // Boca e presas
   R(14, 10, 8, 4, '#120404');
   R(15, 10, 1, 1, '#ffffff');R(20, 10, 1, 1, '#ffffff');
   // CHIFRES CURVADOS SAINDO DA BOCA / MANDÍBULA
   R(11, 11, 3, 3, '#78592d');R(9, 8, 3, 4, '#ab8446');R(8, 5, 2, 4, '#e0bb72');R(8, 4, 1, 1, '#ffffff');
   R(22, 11, 3, 3, '#78592d');R(24, 8, 3, 4, '#ab8446');R(26, 5, 2, 4, '#e0bb72');R(27, 4, 1, 1, '#ffffff');
  });
 }

 /* ---------- Sprite do Ferreiro Prisioneiro e Resgatado ---------- */
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
 window.SPRITE_BLACKSMITH = { idle: makeBlacksmithSprite(false) };

 /* ---------- Verificação de Caminhada (Paredes da Caverna) ---------- */
 function dungeonWalk(x, y){
  if(!window.inDungeon) return false;

  const isInsideCave = (px, py) => {
   if(DUNGEON_CHAO){ const id = chaoDG(px, py), t = id && texturasChao()[id]; return !!id && !(t && t.liquido); }
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
  const dentro = DUNGEON_CHAO ? !!chaoDG(x, y) : [...CAVE_ROOMS, ...CAVE_CORRIDORS].some(r => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h);
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
  ring(chest.x, chest.y, 30, chest.tier === 'gold' ? '#f59e0b' : chest.tier === 'purple' ? '#c084fc' : '#38bdf8', 0.5);

  let gold = 0, items = [], qualityRange = [40, 70];
  if(chest.randomTier){
   qualityRange = chest.tier === 'gold' ? [90, 100] : chest.tier === 'purple' ? [70, 92] : [40, 75];
  }
  if(chest.loot && Array.isArray(chest.loot.items)){
   const loot = chest.loot;
   const goldMin = Math.max(0, Math.floor(Number(loot.goldMin) || 0));
   const goldMax = Math.max(goldMin, Math.floor(Number(loot.goldMax) || goldMin));
   gold = Math.floor(rnd(goldMin, goldMax + 1));
   const qualityMin = Math.max(1, Math.min(100, Math.floor(Number(loot.qualityMin) || 1)));
   const qualityMax = Math.max(qualityMin, Math.min(100, Math.floor(Number(loot.qualityMax) || qualityMin)));
   if(!chest.randomTier) qualityRange = [qualityMin, qualityMax];
   loot.items.forEach(drop => {
    if(!drop || typeof drop !== 'object') return;
    const chance = Math.max(0, Math.min(100, Number(drop.chance) || 0));
    if(ITEMS[drop.id] && Math.random() * 100 < chance) items.push(drop.id);
   });
  } else if(chest.tier === 'blue'){
   gold = Math.floor(rnd(45, 90));
   qualityRange = [40, 75];
   items = ['hp', 'mp'];
   if(Math.random() < 0.8) items.push(rndChoice(['sw', 'he1', 'ch1', 'le1', 'bo', 'wood']));
   if(Math.random() < 0.4) items.push(rndChoice(['sw2', 'ca1', 'ne1', 'ri1']));
  } else if(chest.tier === 'purple'){
   gold = Math.floor(rnd(140, 260));
   qualityRange = [70, 92];
   items = ['hp', 'mp'];
   items.push(rndChoice(['sw2', 'he2', 'ch2', 'le2', 'bo2']));
   if(Math.random() < 0.75) items.push(rndChoice(['ca2', 'ne2', 'ri2', 'magicWood', 'saw']));
  } else if(chest.tier === 'gold'){
   gold = Math.floor(rnd(400, 750));
   qualityRange = [90, 100];
   items = ['hp', 'mp'];
   items.push(rndChoice(['sw3', 'he3', 'ch3', 'le3', 'bo3']));
   items.push(rndChoice(['ca3', 'ne3', 'ri3', 'magicWood']));
   if(Math.random() < 0.6) items.push(rndChoice(['saw', 'sw3', 'magicWood']));
  }

  p.gold += gold;
  ft(chest.x, chest.y - 26, `+${gold} Ouro!`, '#ffd700');
  ft(chest.x, chest.y - 38, `BAÚ ${chest.tier.toUpperCase()} ABERTO!`, chest.tier === 'gold' ? '#f59e0b' : chest.tier === 'purple' ? '#c084fc' : '#38bdf8');
  if(window.playGameSound) playGameSound('item');

  // Dispara animação de moedas e itens saltando para fora do baú
  spawnChestFlyLoot(chest.x, chest.y, gold, items, qualityRange, chest.tier);
  saveGame();
 }

 function rndChoice(arr){
  return arr[Math.floor(Math.random() * arr.length)];
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
   const tierColor = tier === 'gold' ? '#f59e0b' : tier === 'purple' ? '#c084fc' : '#38bdf8';
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

 /* ---------- Configuração e IA do Boss Goblin Demoníaco ---------- */
 function spawnDungeonBoss(bx, by, blvl){
  initChestSprites();
  const bossLvl = blvl || Math.max(5, p.lvl + 1);
  const bossSprite = makeBossGoblinSprite();
  SP.goblinBoss = one(bossSprite);

  dungeonBoss = {
   boss: true,
   bossType: 'grandboss',
   ty: 'goblinBoss',
   name: 'Lorde Goblin Demoníaco',
   img: SP.goblinBoss.d,
   sp: SP.goblinBoss,
   max: 850 + p.lvl * 90,
   dmg: 28 + p.lvl * 4,
   spd: 70,
   xp: 320,
   g: 150,
   aggro: 480,
   wu: 0.45,
   ac: 1.3,
   weaponBasic: { rng: 40 },
   lvl: bossLvl,
   stats: { F: 28 + p.lvl * 3, A: 12 + p.lvl, I: 16 + p.lvl },
   equipmentStats: { arm: 18, magicArm: 12, dmg: 14 },
   size: 1.4,
   armor: 22,
   magicArmor: 18,
   isDungeonMob: true,
   rt: 0
  };

  dungeonBoss.x = dungeonBoss.hx = (bx != null ? bx : 780);
  dungeonBoss.y = dungeonBoss.hy = (by != null ? by : 480);
  if(MONSTER_TYPES.goblinBoss?.custom)configureMonster(dungeonBoss,'goblinBoss',bossLvl);
  dungeonBoss.hp = dungeonBoss.max;
  dungeonBoss.mp = 100;
  dungeonBoss.fx = -1;
  dungeonBoss.fy = 0;
  dungeonBoss.aw = 0;
  dungeonBoss.cd = 0;
  dungeonBoss.hit = 0;
  dungeonBoss.rt = 0;
  dungeonBoss.dest = null;
  dungeonBoss.path = [];
  dungeonBoss.pathI = 0;
  dungeonBoss.pathKey = '';
  dungeonBoss.roamT = 5;
  dungeonBoss.roamRadius = 30;
  // mecânicas (js/chefes.js): as do projeto, se o Lorde Goblin tiver sido editado na Engine; senão as originais
  if(!MONSTER_TYPES.goblinBoss?.mecanicas) dungeonBoss.mecanicas = window.MECANICAS_LORDE_GOBLIN;
  if(!MONSTER_TYPES.goblinBoss?.furia) dungeonBoss.furiaPct = 25;
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
    ft(dungeonBoss.x, dungeonBoss.y - 30, '✦ LORDE GOBLIN DERROTADO! ✦', '#ffd700');
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
  initChestSprites();
  window.campPortalTheme = 'goblin';
  window.inDungeon = true;
  bossDefeatedEvent = false;
  clearRecorded = false;
  limparTelegrafos();
  flyingLoots = [];
  dungeonBoss = null;
  dungeonBosses = [];

  // Sincroniza configuração mais recente da masmorra (salas, corredores, tochas, baús, mobs)
  syncDungeonFromConfig();
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
    style: ch.style || 'classic',
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
   if(mobType === 'goblinBoss'){
    mon = spawnDungeonBoss(m.x, m.y, targetLvl);
   } else {
    // Usa a mesma construção do catálogo da ilha para qualquer tipo selecionado no editor.
    mon = spawnAt(m.x, m.y, mobType, targetLvl);
    const fallbackSprites = { gob: SP.goblinSaw, sprout: SP.sprout, sk: SP.sk, sl: SP.sl, goblin: SP.goblin };
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
  if(!dec.sprite&&!original&&gameArtDraw('dg-decor-'+type,ctx,x,y))return;
  if(dec.sprite){
   const sprite = cachedDungeonArt(dec.sprite);
   if(sprite){
    const scale = Math.min(32 / sprite.width, 32 / sprite.height);
    const width = sprite.width * scale, height = sprite.height * scale;
    ctx.drawImage(sprite, Math.round(x - width / 2), Math.round(y - height), width, height);
    return;
   }
  }
  if(type === 'barrel'){
   // Barril de goblin com aros de ferro
   ctx.fillStyle = '#451a03'; ctx.fillRect(x - 6, y - 10, 12, 10);
   ctx.fillStyle = '#78350f'; ctx.fillRect(x - 5, y - 9, 10, 8);
   ctx.fillStyle = '#92400e'; ctx.fillRect(x - 4, y - 8, 8, 6);
   // Aros de ferro
   ctx.fillStyle = '#334155';
   ctx.fillRect(x - 6, y - 8, 12, 1.5);
   ctx.fillRect(x - 6, y - 3, 12, 1.5);
   ctx.fillStyle = '#64748b';
   ctx.fillRect(x - 4, y - 8, 2, 1.5);
  } else if(type === 'crate'){
   // Caixote de madeira reforçado
   ctx.fillStyle = '#5c3a1e'; ctx.fillRect(x - 7, y - 10, 14, 10);
   ctx.fillStyle = '#854d0e'; ctx.fillRect(x - 6, y - 9, 12, 8);
   ctx.fillStyle = '#a16207'; ctx.fillRect(x - 5, y - 8, 10, 6);
   // Ripas cruzadas
   ctx.fillStyle = '#451a03';
   ctx.fillRect(x - 6, y - 5, 12, 1);
   ctx.fillRect(x - 1, y - 9, 2, 8);
   // Pregos de ferro nos cantos
   ctx.fillStyle = '#cbd5e1';
   ctx.fillRect(x - 5, y - 8, 1, 1);
   ctx.fillRect(x + 4, y - 8, 1, 1);
   ctx.fillRect(x - 5, y - 3, 1, 1);
   ctx.fillRect(x + 4, y - 3, 1, 1);
  } else if(type === 'bones'){
   // Pilha de ossos e crânios de aventureiros
   ctx.fillStyle = '#0f172a'; ctx.fillRect(x - 6, y - 4, 12, 4);
   ctx.fillStyle = '#cbd5e1';
   ctx.fillRect(x - 5, y - 3, 10, 2);
   ctx.fillRect(x - 2, y - 6, 4, 4); // crânio
   ctx.fillStyle = '#f8fafc';
   ctx.fillRect(x - 1, y - 5, 2, 2);
   ctx.fillStyle = '#0f172a';
   ctx.fillRect(x - 1, y - 4, 1, 1); // órbita
   ctx.fillRect(x, y - 4, 1, 1);
  } else if(type === 'stalagmite'){
   // Estalagmite de rocha pontiaguda
   ctx.fillStyle = '#1e293b';
   ctx.beginPath();
   ctx.moveTo(x - 6, y);
   ctx.lineTo(x, y - 14);
   ctx.lineTo(x + 6, y);
   ctx.closePath();
   ctx.fill();
   ctx.fillStyle = '#334155';
   ctx.beginPath();
   ctx.moveTo(x - 4, y);
   ctx.lineTo(x, y - 12);
   ctx.lineTo(x + 2, y);
   ctx.closePath();
   ctx.fill();
   // Brilho úmido da rocha
   ctx.fillStyle = '#64748b';
   ctx.fillRect(x - 1, y - 10, 1, 6);
  } else if(type === 'puddle'){
   // Poça d'água subterrânea com reflexo
   ctx.fillStyle = '#0f172a';
   ctx.beginPath(); ctx.ellipse(x, y, 12, 5, 0, 0, Math.PI * 2); ctx.fill();
   ctx.fillStyle = '#1e293b';
   ctx.beginPath(); ctx.ellipse(x, y, 10, 4, 0, 0, Math.PI * 2); ctx.fill();
   // Brilho sutil da água ondulando
   const wave = Math.sin(time * 3 + x) * 1.5;
   ctx.fillStyle = 'rgba(56,189,248,0.35)';
   ctx.fillRect(x - 5 + wave, y - 1, 6, 1.5);
  } else if(type === 'crystal'){
   // Cristais mágicos luminescentes da caverna
   ctx.fillStyle = 'rgba(16,185,129,0.18)';
   ctx.beginPath(); ctx.ellipse(x, y, 14, 7, 0, 0, Math.PI * 2); ctx.fill();
   // Formação de cristais pontiagudos
   ctx.fillStyle = '#047857';
   ctx.fillRect(x - 4, y - 10, 3, 10);
   ctx.fillRect(x, y - 13, 3, 13);
   ctx.fillRect(x + 3, y - 8, 3, 8);
   ctx.fillStyle = '#10b981';
   ctx.fillRect(x - 3, y - 9, 2, 8);
   ctx.fillRect(x + 1, y - 12, 2, 11);
   ctx.fillRect(x + 4, y - 7, 2, 6);
   ctx.fillStyle = '#6ee7b7';
   ctx.fillRect(x + 1, y - 11, 1, 5);
   ctx.fillStyle = '#a7f3d0';
   ctx.fillRect(x + 1, y - 9, 1, 2);
  } else if(type === 'web'){
   // Teia de aranha de canto na caverna
   ctx.fillStyle = 'rgba(241,245,249,0.35)';
   ctx.beginPath();
   ctx.moveTo(x, y);
   ctx.lineTo(x + 12, y);
   ctx.lineTo(x, y + 12);
   ctx.closePath();
   ctx.fill();
   ctx.strokeStyle = 'rgba(255,255,255,0.6)';
   ctx.lineWidth = 0.8;
   ctx.beginPath();
   ctx.moveTo(x, y); ctx.lineTo(x + 10, y + 10);
   ctx.moveTo(x + 5, y); ctx.lineTo(x, y + 5);
   ctx.moveTo(x + 9, y); ctx.lineTo(x, y + 9);
   ctx.stroke();
  } else if(type === 'banner'){
   // Estandarte tribal goblin pendurado na parede
   ctx.fillStyle = '#451a03'; ctx.fillRect(x - 6, y - 8, 12, 2);
   ctx.fillStyle = '#7f1d1d'; ctx.fillRect(x - 5, y - 6, 10, 10);
   ctx.fillStyle = '#991b1b'; ctx.fillRect(x - 4, y - 5, 8, 8);
   ctx.fillStyle = '#fef08a'; ctx.fillRect(x - 2, y - 4, 4, 3);
   ctx.fillStyle = '#450a0a'; ctx.fillRect(x - 1, y - 3, 1, 1); ctx.fillRect(x + 1, y - 3, 1, 1);
   ctx.fillStyle = '#7f1d1d';
   ctx.fillRect(x - 5, y + 4, 3, 3);
   ctx.fillRect(x + 2, y + 4, 3, 3);
  } else if(type === 'tree'){
   ctx.fillStyle = '#16301c'; ctx.fillRect(x - 3, y - 8, 6, 9);
   ctx.fillStyle = '#5b3a29'; ctx.fillRect(x - 2, y - 9, 4, 10);
   ctx.fillStyle = '#1f5b35';
   ctx.fillRect(x - 10, y - 20, 20, 10);
   ctx.fillRect(x - 7, y - 25, 14, 8);
   ctx.fillRect(x - 13, y - 17, 5, 7);
   ctx.fillRect(x + 8, y - 17, 5, 7);
   ctx.fillStyle = '#4a9a3a';
   ctx.fillRect(x - 7, y - 20, 5, 5);
   ctx.fillRect(x + 3, y - 24, 4, 4);
   ctx.fillRect(x + 7, y - 16, 4, 4);
  } else if(type === 'bush'){
   ctx.fillStyle = '#1f5b35';
   ctx.fillRect(x - 10, y - 7, 20, 7);
   ctx.fillRect(x - 7, y - 11, 14, 7);
   ctx.fillStyle = '#4a9a3a';
   ctx.fillRect(x - 6, y - 9, 5, 3);
   ctx.fillRect(x + 2, y - 12, 4, 4);
  } else if(type === 'flower'){
   ctx.fillStyle = '#2f6b32'; ctx.fillRect(x, y - 9, 2, 9);
   ctx.fillRect(x - 3, y - 4, 4, 2);
   ctx.fillStyle = '#f472b6';
   ctx.fillRect(x - 3, y - 13, 3, 3);
   ctx.fillRect(x + 2, y - 13, 3, 3);
   ctx.fillRect(x - 1, y - 16, 3, 3);
   ctx.fillRect(x - 1, y - 10, 3, 3);
   ctx.fillStyle = '#fbbf24'; ctx.fillRect(x, y - 12, 2, 2);
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
  const sprite=cachedDungeonArt(item.sprite);if(!sprite)return false;
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
  for(const part of ['floor','wall'])gameArtRegister('dg-'+part+'-'+theme,(part==='floor'?'Chão':'Parede')+' da DG — '+({cave:'Caverna',underground:'Subterrâneo',forest:'Floresta'}[theme]),{
   w:16,h:16,draw:g=>{
    g.fillStyle=part==='floor'?palette.inner:palette.wall;g.fillRect(0,0,16,16);
    g.fillStyle=part==='floor'?palette.texture:palette.shadow;
    if(part==='wall'){g.fillRect(0,7,16,1);g.fillRect(7,0,1,7);g.fillRect(3,8,1,8)}
    else for(let i=0;i<12;i++)g.fillRect(i*7%16,i*11%16,2,1);
   }
  });
 }
 for(const type of ['return','exit'])for(const active of [true,false])gameArtRegister('portal-dg-'+type+(active?'':'-locked'),(type==='return'?'Portal de retorno da DG':'Portal de saída da DG')+(active?' — ativo':' — bloqueado'),{
  w:40,h:48,ay:42/48,draw:g=>drawDungeonGate(20,42,type,active,g,true)
 });
 for(const orientation of ['vertical','horizontal'])for(const open of [false,true]){
  const vertical=orientation==='vertical',w=vertical?12:56,h=vertical?56:12;
  gameArtRegister('dg-door-'+orientation+(open?'-open':'-closed'),'Porta da DG — '+(vertical?'vertical':'horizontal')+(open?' aberta':' fechada'),{
   w,h,ay:.5,draw:g=>drawDungeonDoor({x:w/2,y:h/2,w,h,orientation,previewOpen:open},g,true)
  });
 }
 for(const [type,name] of Object.entries({barrel:'Barril',crate:'Caixote',bones:'Ossos',stalagmite:'Estalagmite',puddle:'Poça',crystal:'Cristal',web:'Teia',banner:'Estandarte',tree:'Árvore',bush:'Arbusto',flower:'Flor'})){
  gameArtRegister('dg-decor-'+type,name+' da DG',{w:40,h:48,ay:42/48,draw:g=>drawDungeonDecoration({x:20,y:42,type},g,true)});
 }
 gameArtRegister('dg-torch','Tocha da DG',{w:12,h:16,ay:12/16,draw:g=>{
  g.fillStyle='#33271f';g.fillRect(4,10,4,6);
  g.fillStyle='#ea580c';g.fillRect(4,6,4,5);g.fillStyle='#fde047';g.fillRect(5,7,2,3);
 }});
 // Desenho dos elementos da DG para a Engine montar a cena com as mesmas artes do jogo.
 window.DG_DRAW={
  temas:DUNGEON_THEME_COLORS,
  decoracoes:{barrel:'Barril',crate:'Caixote',bones:'Ossos',stalagmite:'Estalagmite',puddle:'Poça',crystal:'Cristal',web:'Teia',banner:'Estandarte',tree:'Árvore',bush:'Arbusto',flower:'Flor'},
  decoracao:(d,g)=>drawDungeonDecoration(d,g),
  porta:(d,g)=>drawDungeonDoor(d,g),
  portal:(x,y,tipo,ativo,g)=>drawDungeonGate(x,y,tipo,ativo,g)
 };

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

  // Luz e aura do Lorde Goblin se vivo
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
  const floorData = DUNGEON_ART.floor||gameArtData('dg-floor-'+(getActiveDungeonConfig().theme||'cave')), wallData = DUNGEON_ART.wall||gameArtData('dg-wall-'+(getActiveDungeonConfig().theme||'cave'));
  const floorPattern = cachedDungeonPattern(floorData);
  const wallPattern = cachedDungeonPattern(wallData);
  if(DUNGEON_CHAO && window.CHAO){
   if(!dungeonCamada) dungeonCamada = CHAO.dgCamada(DUNGEON_CHAO, texturasChao(), { piso: cachedDungeonArt(floorData), parede: cachedDungeonArt(wallData), cores: palette });
   if(dungeonCamada) ctx.drawImage(dungeonCamada.c, dungeonCamada.x, dungeonCamada.y);
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
    if(!isInsideOtherBox(x + segW / 2, b.y - 4, b)){
     ctx.fillStyle = wallPattern || palette.wall; ctx.fillRect(x, b.y - 4, segW, 4);
     ctx.fillStyle = palette.highlight; ctx.fillRect(x, b.y - 4, segW, 1);
     ctx.fillStyle = palette.shadow; ctx.fillRect(x, b.y, segW, 2);
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
  DUNGEON_DECORATIONS.forEach(dec => {
   drawDungeonDecoration(dec);
  });
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

  // 6. Lista de Entidades para desenhar com ordenação por Y (Y-sort)
  const renderList = [];

  // Baús da Masmorra
  dungeonChests.forEach(ch => {
   renderList.push([ch.y, () => {
    const spr = cachedDungeonArt(ch.sprite)||window.dungeonChestSprite(ch.tier, ch.style || 'classic', ch.opened);
    if(spr){
     const isHov = dist(wpos(), ch) < 18;
     if(isHov){
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.beginPath(); ctx.ellipse(ch.x, ch.y, 14, 6, 0, 0, Math.PI * 2); ctx.fill();
     }
     ctx.drawImage(spr, Math.round(ch.x - spr.width / 2), Math.round(ch.y - spr.height + 2));

     ctx.font = '5px monospace'; ctx.textAlign = 'center';
     const tierNames = { blue: 'Baú Azul', purple: 'Baú Roxo', gold: 'Baú Dourado' };
     const tierColors = { blue: '#60a5fa', purple: '#c084fc', gold: '#fbbf24' };
     ctx.fillStyle = tierColors[ch.tier] || '#fff';
     ctx.fillText(tierNames[ch.tier] || 'Baú', ch.x, ch.y - 18);
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

    if(hov == e || p.tgt == e) circ(e.x, e.y, 14, hov == e ? '#ff5' : '#f55');
    ctx.globalAlpha = e.hit > 0 ? .5 : 1;
    const an = anim(e, e.wu, false);
    const sprite = monsterSpriteFrame(e, f.d, an);
    dr(sprite, e.x, e.y, f.fl, scale, an);
    ctx.globalAlpha = 1;

    // Se for o Boss, não desenha a barra de vida minúscula em cima da cabeça porque temos a barra de elite no topo da tela!
    if(!e.boss){
     const hpRatio = Math.max(0, Math.min(1, e.hp / monsterMaxHp(e)));
     const barW = 28, t = 1 / S, barX = Math.round(e.x - barW / 2), barY = Math.round(labelY + 2);
     ctx.fillStyle = '#3a3a3a'; ctx.fillRect(barX - t, barY - t, barW + 2 * t, 1 + 2 * t);
     ctx.fillStyle = '#4b121c'; ctx.fillRect(barX, barY, barW, 1);
     ctx.fillStyle = '#ed354e'; ctx.fillRect(barX, barY, barW * hpRatio, 1);
     ctx.font = '5px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#d8d8d8';
     ctx.fillText(e.name || 'Goblin', e.x, labelY);
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

  // Outros jogadores do grupo (js/online.js)
  if(window.onlineDrawables) onlineDrawables(renderList);

  // Ordena por profundidade Y e desenha todos
  renderList.sort((a, b) => a[0] - b[0]).forEach(item => item[1]());

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
     ctx.shadowColor = fl.rarityColor || (fl.tier === 'gold' ? '#f59e0b' : fl.tier === 'purple' ? '#c084fc' : '#38bdf8');
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

  // Efeitos visuais e feitiços (fxs e proj)
  proj.forEach(q => {
   ctx.fillStyle = q.c || '#ff7a1a';
   ctx.fillRect(Math.round(q.x - 3), Math.round(q.y - 3), 6, 6);
  });
  fxs.forEach(f => {
   const q = Math.max(0, Math.min(1, f.t / f.d)), fade = 1 - q, r = f.r * (.35 + q);
   ctx.globalAlpha = fade;
   circ(f.x, f.y, r, f.c);
   ctx.globalAlpha = 1;
  });

  // 7. Campo de Visão / Névoa de Guerra Dinâmica (Atmosfera Escura da Caverna)
  drawDungeonVision(W, H, shakeX, shakeY);

  // Textos flutuantes (dano, avisos, ouro)
  ctx.font = '6px monospace'; ctx.textAlign = 'center';
  fts.forEach(f => {
   ctx.globalAlpha = Math.max(0, f.a);
   ctx.fillStyle = '#000'; ctx.fillText(f.t, Math.round(f.x) + .5, Math.round(f.y) + .5);
   ctx.fillStyle = f.c; ctx.fillText(f.t, Math.round(f.x), Math.round(f.y));
   ctx.globalAlpha = 1;
  });

  // 8. Barra de Vida Épica de Elite do Boss no Topo da Tela
  drawDungeonEliteBossBar();

  // 9. Minimapa da Masmorra
  drawDungeonMinimap();

  // 10. Tela de Morte na Masmorra (se caiu)
  if(p.dead > 0){
   ctx.setTransform(1, 0, 0, 1, 0, 0);
   ctx.fillStyle = 'rgba(0,0,0,0.75)';
   ctx.fillRect(0, 0, cv.width, cv.height);
   ctx.fillStyle = '#ef4444';
   ctx.font = 'bold 24px monospace';
   ctx.textAlign = 'center';
   ctx.fillText('Você caiu na Masmorra...', cv.width / 2, cv.height / 2 - 10);
   ctx.fillStyle = '#ffffff';
   ctx.font = '14px monospace';
   ctx.fillText(`Expulso de volta ao acampamento em ${Math.ceil(p.dead)}s`, cv.width / 2, cv.height / 2 + 20);
  }
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
  const iconSrc = boss === dungeonBoss && (window.DG_BOSS_ICONS && window.DG_BOSS_ICONS.goblin) || '';
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

  // Salas e corredores: só o trecho dentro do campo de visão agora (sem memória do que já foi visto)
  const near = (x, y) => Math.hypot(x - p.x, y - p.y) <= VISION_RANGE;
  mm.save();
  mm.beginPath();
  mm.arc(toMmX(p.x), toMmY(p.y), VISION_RANGE * scale, 0, Math.PI * 2);
  mm.clip();
  mm.fillStyle = '#261f1c';
  if(DUNGEON_CHAO){
   const i0 = Math.floor((p.x - VISION_RANGE) / 16), i1 = Math.floor((p.x + VISION_RANGE) / 16), j0 = Math.floor((p.y - VISION_RANGE) / 16), j1 = Math.floor((p.y + VISION_RANGE) / 16);
   for(let j = j0; j <= j1; j++) for(let i = i0; i <= i1; i++) if(DUNGEON_CHAO[i + ',' + j]) mm.fillRect(toMmX(i * 16), toMmY(j * 16), 16 * scale + .5, 16 * scale + .5);
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
   if(ch.opened || Math.hypot(ch.x - p.x, ch.y - p.y) > VISION_RANGE) return;
   mm.fillStyle = ch.tier === 'gold' ? '#fbbf24' : ch.tier === 'purple' ? '#c084fc' : '#38bdf8';
   mm.fillRect(toMmX(ch.x) - 2, toMmY(ch.y) - 2, 4, 4);
  });

  // Inimigos no minimapa: só os que estão no campo de visão
  en.forEach(e => {
   if(e.hp <= 0 || Math.hypot(e.x - p.x, e.y - p.y) > VISION_RANGE) return;
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
