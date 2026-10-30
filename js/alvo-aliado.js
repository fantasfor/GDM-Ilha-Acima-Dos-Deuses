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
 /* efeitos ativos de outro jogador (chegam na posição rápida como "id:acúmulos.id:acúmulos", js/online.js): um objeto com st
    para os ícones do painel de alvo (js/effects.js); refeito só quando a lista muda. O tempo restante não vem pela rede. */
 const cacheEfs=new Map();
 function efeitosDe(a){let c=cacheEfs.get(a.uid);const s=a.efs||'';if(c&&c.s===s)return c.ent;
  const st={};for(const par of s.split('.')){const [k,n]=par.split(':');if(k&&window.FX_INFO&&FX_INFO[k])st[k]={n:Math.max(1,+n||1),t:1,d:1,remoto:true}}
  c={s,ent:{hp:1,st}};cacheEfs.set(a.uid,c);return c.ent}
 // dados para o painel (js/ui.js): nome, nível, vida e mana (0..1), textos e a imagem
 function info(){
  const a=alvo();if(!a){sel=null;return null}
  if(sel.tipo==='boneco')return{nome:a.name,nivel:a.lvl,vida:a.hp/a.max,vidaTxt:Math.ceil(a.hp)+' / '+a.max,mana:null,img:null,ent:a};
  const img=window.spriteDeJogador?spriteDeJogador(a.uid):null,hp=Number.isFinite(+a.hp)?Math.max(0,Math.min(1,+a.hp)):1,mp=Number.isFinite(+a.mp)?Math.max(0,Math.min(1,+a.mp)):null;
  return{nome:a.name||'Jogador',nivel:a.lvl||1,vida:hp,vidaTxt:Math.round(hp*100)+'%',mana:mp,manaTxt:mp==null?'':Math.round(mp*100)+'%',img,ent:efeitosDe(a)};
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
