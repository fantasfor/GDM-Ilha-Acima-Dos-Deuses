/* ---------- Morte na masmorra ----------
   Quem cai na DG não renasce lá dentro. A tela de morte (render.js #telaMorte) mostra "Sair da dungeon" e "Assistir":
   - Assistir (só com aliados vivos na DG): a câmera segue um aliado (Trocar passa para o próximo) até ele sair ou cair;
     sem nenhum aliado vivo, sai da DG.
   - Sozinho na DG: sai da masmorra depois de alguns segundos (ou no botão) e ela recomeça do zero na próxima entrada.
   Sair da dungeon: volta ao acampamento com vida e mana cheias (morrer não custa nada).
   Assistindo, o jogador fica em p.dead = 1e9 (sem corpo nem tela de morte) e o online manda o lugar onde ele caiu. */
(function(){
 if(MODO.motor)return;
 const SOZINHO_S=6;
 const aliados=()=>window.MP&&MP.remotos?[...MP.remotos.values()].filter(r=>r&&r.uid&&!r.dead):[];
 let assistindo=null,tSolo=0;
 const barra=document.createElement('div');barra.id='assistindo';
 barra.innerHTML='<span></span><button type="button" data-a="trocar">Trocar</button><button type="button" data-a="sair">Sair da dungeon</button>';
 document.body.append(barra);
 function sairDaDG(){
  assistindo=null;p.espectando=null;barra.classList.remove('on');
  if(window.inDungeon&&window.exitDungeon)exitDungeon(true);
  p.dead=0;p.morreuEm=null;p.hp=mhp();p.mp=mmp();p.st=null;p.dest=null;p.path=[];p.tgt=null;
  ring(p.x,p.y,30,'#fff6b0',.7);if(window.playGameSound)playGameSound('revive');if(window.saveGame)saveGame()}
 function assistir(uid){
  const l=aliados();if(!l.length){sairDaDG();return}
  const alvo=uid&&l.find(r=>r.uid===uid)||l[0];
  if(!assistindo){p.morteX=p.x;p.morteY=p.y}
  assistindo=alvo.uid;p.espectando=alvo.uid;p.dead=1e9;barra.classList.add('on');rotulo()}
 function rotulo(){const r=window.MP&&MP.remotos.get(assistindo);barra.querySelector('span').textContent='Assistindo '+(r&&r.name||'aliado')+' · você não pode renascer na masmorra'}
 barra.onclick=e=>{const a=e.target.dataset&&e.target.dataset.a;if(a==='sair')sairDaDG();
  if(a==='trocar'){const l=aliados(),i=l.findIndex(r=>r.uid===assistindo);if(l.length)assistir(l[(i+1)%l.length].uid)}};
 window.MORTE_DG={aliados,assistindo:()=>assistindo,sair:sairDaDG,assistir};
 const upd0=upd;upd=function(dt){upd0(dt);
  if(!window.inDungeon){if(assistindo){assistindo=null;p.espectando=null;barra.classList.remove('on')}tSolo=0;return}
  if(assistindo){
   const r=MP.remotos.get(assistindo);
   if(!r||r.dead){const l=aliados();if(l.length)assistir(l[0].uid);else sairDaDG();return}
   const q=window.ONLINE_NUVEM&&ONLINE_NUVEM.posicao?ONLINE_NUVEM.posicao(assistindo):null;p.x=q?q.x:r.x;p.y=q?q.y:r.y;rotulo();return}
  // sozinho: sai sozinho depois de alguns segundos caído
  if(p.dead>0&&p.dead<1e8&&!aliados().length){tSolo+=dt;if(tSolo>SOZINHO_S)sairDaDG()}else tSolo=0};
})();
