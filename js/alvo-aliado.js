/* ---------- Alvo aliado (2026-10-28, pedido do usuário) ----------
   Clique esquerdo num aliado (outro jogador na mesma sala, ou o Boneco aliado da arena) seleciona e mostra o painel de
   alvo (o mesmo #mon dos monstros, com a borda verde): nome, nível, vida e, no boneco, os efeitos recebidos.
   Botão direito no painel abre as interações do jogo com aquele jogador (as mesmas do painel Jogadores, js/multiplayer.js):
   convidar para a ilha, convidar para o grupo, adicionar amigo e sussurrar. No boneco: recomeçar o teste.
   Selecionar um aliado não muda o alvo de ataque (p.tgt). Clique esquerdo em outro lugar desfaz a seleção. */
(function(){
 let sel=null; // {tipo:'jogador', uid} | {tipo:'boneco'}
 const remotos=()=>window.MP&&MP.remotos?[...MP.remotos.values()]:[];
 const inimigoNaArena=o=>window.inArena&&window.ARENA&&ARENA.aliado&&!ARENA.aliado(o.uid);
 function alvo(){
  if(!sel)return null;
  if(sel.tipo==='boneco'){const b=window.ARENA&&ARENA.bonecoAliado&&ARENA.bonecoAliado();return b||null}
  const o=window.MP&&MP.remotos&&MP.remotos.get(sel.uid);return o&&!o.dead?o:null;
 }
 // clique esquerdo no mundo: escolhe o aliado sob o cursor (o desenho fica ~10 px acima do pé)
 function clique(w){
  let melhor=null,bd=12;
  for(const o of remotos()){if(o.dead||o.x==null||inimigoNaArena(o))continue;const d=Math.hypot(w.x-o.x,w.y-(o.y-10));if(d<bd){bd=d;melhor={tipo:'jogador',uid:o.uid}}}
  const b=window.inArena&&window.ARENA&&ARENA.bonecoAliado&&ARENA.bonecoAliado();
  if(b){const d=Math.hypot(w.x-b.x,w.y-(b.y-10));if(d<bd){bd=d;melhor={tipo:'boneco'}}}
  sel=melhor;
  if(melhor){const a=alvo();if(a&&typeof ring=='function')ring(a.x,a.y,10,'#7ad07a',.3);return true}
  return false;
 }
 // dados para o painel (js/ui.js): nome, nível, vida (0..1), texto da vida e a imagem
 function info(){
  const a=alvo();if(!a){sel=null;return null}
  if(sel.tipo==='boneco')return{nome:a.name,nivel:a.lvl,vida:a.hp/a.max,vidaTxt:Math.ceil(a.hp)+' / '+a.max,img:null,ent:a};
  const img=window.spriteDeJogador?spriteDeJogador(a.uid):null,hp=Number.isFinite(+a.hp)?Math.max(0,Math.min(1,+a.hp)):1;
  return{nome:a.name||'Jogador',nivel:a.lvl||1,vida:hp,vidaTxt:Math.round(hp*100)+'%',img,ent:null};
 }
 /* menu do botão direito no painel */
 let menu=null;
 const fecharMenu=()=>{if(menu){menu.remove();menu=null}};
 function abrirMenu(x,y){
  fecharMenu();if(!sel)return;
  const acoes=sel.tipo==='boneco'?[['Recomeçar o teste (40% da vida, sem efeitos)',()=>ARENA.resetarBoneco(alvo())]]:(window.MP&&MP.acoesJogador?MP.acoesJogador(sel.uid):[]);
  menu=document.createElement('div');menu.className='menuAliado';menu.setAttribute('role','menu');
  const t=document.createElement('b');t.textContent=(info()||{}).nome||'Aliado';menu.append(t);
  if(!acoes.length){const s=document.createElement('small');s.textContent='Sem interações agora (entre com a conta online).';menu.append(s)}
  for(const [rot,fn] of acoes){const b=document.createElement('button');b.type='button';b.setAttribute('role','menuitem');b.textContent=rot;b.onclick=()=>{fecharMenu();fn()};menu.append(b)}
  document.body.append(menu);const r=menu.getBoundingClientRect();menu.style.left=Math.min(x,innerWidth-r.width-6)+'px';menu.style.top=Math.min(y,innerHeight-r.height-6)+'px';
 }
 document.addEventListener('pointerdown',e=>{if(menu&&!menu.contains(e.target))fecharMenu()});
 addEventListener('keydown',e=>{if(menu&&e.key==='Escape'){fecharMenu();e.stopImmediatePropagation()}},true);
 addEventListener('load',()=>{const mon=document.getElementById('mon');if(mon)mon.addEventListener('contextmenu',e=>{if(!sel||!alvo())return;e.preventDefault();e.stopPropagation();abrirMenu(e.clientX,e.clientY)})});
 window.ALVO_ALIADO={clique,info,eh:o=>!!o&&alvo()===o,limpar:()=>{sel=null;fecharMenu()},get sel(){return sel}};
})();
