/* ---------- Arena (PvP) ----------
   Entrada pelo Lanceiro da taverna (js/taverna.js): partidas 1x1 ou 2x2 montadas num lobby (arenas/{lider} no Firebase,
   convites pelo Correio) ou treino sozinho com o Boneco. Na partida cada equipe começa numa ponta, quem cai fica assistindo
   e ela acaba quando uma equipe perde todos ou em 5 minutos. Os inimigos viram alvos (en, com pvp:true): qualquer golpe,
   habilidade, projétil ou área funciona neles; o dano vai por salas/{sala}/pvp e quem é atingido aplica as próprias
   defesas (hurtP). Cair não custa ouro; vitórias, derrotas, abates e mortes ficam em p.pvp. */
(function(){
 if(MODO.motor)return;
 const OX=24,OY=24,AW=480,AH=352,CXa=OX+AW/2,CYa=OY+AH/2,RX=AW/2-22,RY=AH/2-24;
 const PORTAO={x:CXa,y:CYa+RY+6},PILARES=[[-110,-70],[110,-70],[-110,70],[110,70]].map(([dx,dy])=>({x:CXa+dx,y:CYa+dy}));
 const dentro=(x,y,m=0)=>((x-CXa)/(RX-m))**2+((y-CYa)/(RY-m))**2<=1;
 const noPilar=(x,y,m=0)=>PILARES.some(q=>Math.hypot(x-q.x,(y-q.y)*1.3)<10+m);
 window.inArena=false;
 window.arenaWalk=(x,y)=>(dentro(x,y,4)&&!noPilar(x,y))||(Math.abs(x-PORTAO.x)<12&&y>=CYa+RY-8&&y<=PORTAO.y+4);
 window.arenaParede=(x,y)=>!dentro(x,y)||noPilar(x,y,-2);
 let ilhaPos=null,enGuardado=null,fundo=null,boneco=null;
 const feed=[]; // abates recentes (no alto da tela)
 p.pvp=p.pvp||{abates:0,mortes:0};

 /* ---- arte ---- */
 const R=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),w,h)};
 const hs=(a,b)=>{let h=(a*374761393+b*668265263)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967296};
 function desenharFundo(){
  const c=document.createElement('canvas');c.width=AW;c.height=AH;const g=c.getContext('2d'),cx=AW/2,cy=AH/2;
  // arquibancada de pedra em volta
  R(g,0,0,AW,AH,'#2a2522');
  for(let y=0;y<AH;y+=6)for(let x=(y/6%2)*7;x<AW;x+=14){R(g,x,y,13,5,hs(x,y)<.5?'#4a423c':'#423b35');R(g,x,y,13,1,'#5a514a')}
  // areia (elipse) com borda de pedra clara
  const img=g.getImageData(0,0,AW,AH),D=img.data;
  for(let y=0;y<AH;y++)for(let x=0;x<AW;x++){const k=((x-cx)/RX)**2+((y-cy)/RY)**2;if(k>1.06)continue;const o=(y*AW+x)*4,n=hs(x>>1,y>>1);
   let col=k>1?[150,138,120]:k>.97?[118,104,86]:[214+(n*16|0),180+(n*14|0),122+(n*10|0)];
   if(k<=.97&&hs(x,y)>.985)col=[180,150,100];D[o]=col[0];D[o+1]=col[1];D[o+2]=col[2];D[o+3]=255}
  g.putImageData(img,0,0);
  // círculo central e marcas na areia
  g.strokeStyle='#b8925c';g.lineWidth=2;g.beginPath();g.ellipse(cx,cy,46,32,0,0,7);g.stroke();g.beginPath();g.ellipse(cx,cy,6,4,0,0,7);g.stroke();
  for(let i=0;i<40;i++){const a=hs(i,3)*6.28,r=hs(i,4)*.85;R(g,cx+Math.cos(a)*RX*r,cy+Math.sin(a)*RY*r,3,1,'#c79d63')}
  // portão (embaixo)
  const px=cx-14,py=AH-18;R(g,px-4,py-6,36,24,'#1d1916');R(g,px,py-2,28,20,'#3b2a1a');for(let i=0;i<28;i+=5)R(g,px+i,py-2,2,20,'#6b5a48');R(g,px-4,py-8,36,3,'#8a7a66');
  // estandartes no alto
  for(const bx of [cx-120,cx+120,cx-40,cx+40]){R(g,bx-1,4,2,30,'#5a3a20');R(g,bx-9,8,18,22,bx<cx?'#8e2f2a':'#2a4a8e');R(g,bx-9,8,18,2,'#d9a441');R(g,bx-3,16,6,6,'#d9a441');R(g,bx-9,30,4,4,bx<cx?'#8e2f2a':'#2a4a8e');R(g,bx+5,30,4,4,bx<cx?'#8e2f2a':'#2a4a8e')}
  return c;
 }
 function pilar(q){const x=Math.round(q.x),y=Math.round(q.y);R(ctx,x-11,y+1,22,4,'#0005');R(ctx,x-9,y-30,18,32,'#8b8178');R(ctx,x-9,y-30,4,32,'#a39a90');R(ctx,x+5,y-30,4,32,'#6e655d');R(ctx,x-11,y-34,22,5,'#b1a89d');R(ctx,x-11,y-2,22,4,'#6e655d');for(let k=0;k<4;k++)R(ctx,x-9,y-24+k*7,18,1,'#6e655d')}
 function tocha(x,y){R(ctx,x-1,y-10,2,10,'#4a3420');const f=Math.sin(time*12+x)>0?1:0;R(ctx,x-2,y-14-f,4,4,'#ff7a1a');R(ctx,x-1,y-13-f,2,2,'#ffd36b')}
 function desenharBoneco(b){const k=b.hit>0?Math.sin(time*60)*1.5:0;
  // desenhado em 2× e mostrado pela metade, do tamanho dos personagens
  ctx.save();ctx.translate(Math.round(b.x),Math.round(b.y));ctx.scale(.55,.55);const x=0,y=0;
  R(ctx,x-8,y+1,16,3,'#0005');R(ctx,x-1,y-20,2,21,'#6b4a2a');R(ctx,x-9+k,y-17,18,3,'#6b4a2a');
  R(ctx,x-6+k,y-22,12,14,'#d9b56a');R(ctx,x-6+k,y-22,12,2,'#e8cc8a');R(ctx,x-6+k,y-14,12,1,'#a8843f');R(ctx,x-4+k,y-30,8,8,'#d9b56a');R(ctx,x-2+k,y-27,1,1,'#3a2a14');R(ctx,x+1+k,y-27,1,1,'#3a2a14');R(ctx,x-1+k,y-17,3,3,'#b02a2a');ctx.restore()}
 window.drawArena=function(){
  if(!fundo)fundo=desenharFundo();
  ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#0b0806';ctx.fillRect(0,0,cv.width,cv.height);
  ctx.setTransform(S,0,0,S,Math.round(cv.width/2-p.x*S),Math.round(cv.height/2-p.y*S));ctx.imageSmoothingEnabled=false;
  ctx.drawImage(fundo,OX,OY);
  const L=[];
  PILARES.forEach(q=>L.push([q.y,()=>pilar(q)]));
  if(boneco)L.push([boneco.y,()=>{if(p.tgt===boneco)circ(boneco.x,boneco.y,12,'#f55');desenharBoneco(boneco);const r=boneco.hp/boneco.max;R(ctx,boneco.x-14,boneco.y-22,28,1,'#4b121c');R(ctx,boneco.x-14,boneco.y-22,28*r,1,'#ed354e');ctx.font='5px monospace';ctx.textAlign='center';ctx.fillStyle='#000';ctx.fillText('Boneco de treino',boneco.x+.4,boneco.y-24.6);ctx.fillStyle='#ffe28a';ctx.fillText('Boneco de treino',boneco.x,boneco.y-25)}]);
  // alvo marcado nos outros jogadores
  for(const e of en)if(e.pvp&&e.uid&&p.tgt===e)L.push([e.y-.1,()=>circ(e.x,e.y,12,'#f55')]);
  if(p.dead<=0)L.push([p.y,()=>{const o=lunge(p,p.wt,p.aw,.25);ctx.globalAlpha=p.hit>0?.5:1;const f=face(p),an=anim(p,.25);dr(heroImg(f.d,an),p.x+o[0],p.y+o[1],f.fl,1,an);ctx.globalAlpha=1;
   const barW=28,t=1/S,bx=Math.round(p.x-barW/2),by=Math.round(p.y-25),hr=Math.max(0,Math.min(1,p.hp/mhp())),mr=Math.max(0,Math.min(1,p.mp/mmp()));
   R(ctx,bx-t,by-t,barW+2*t,3+3*t,'#3a3a3a');R(ctx,bx,by,barW,2,'#173d1c');ctx.fillStyle='#4cd04f';ctx.fillRect(bx,by,barW*hr,2);ctx.fillStyle='#10203a';ctx.fillRect(bx,by+2+t,barW,1);ctx.fillStyle='#3985ed';ctx.fillRect(bx,by+2+t,barW*mr,1)}]);
  if(window.onlineDrawables)onlineDrawables(L);
  L.sort((a,b)=>a[0]-b[0]).forEach(l=>l[1]());
  for(const [x,y] of [[OX+60,OY+60],[OX+AW-60,OY+60],[OX+40,OY+AH-70],[OX+AW-40,OY+AH-70]])tocha(x,y);
  if(window.desenharConj)desenharConj();
  proj.forEach(q=>{R(ctx,q.x-3,q.y-3,6,6,q.c||'#ff7a1a');R(ctx,q.x-2,q.y-2,4,4,'#ffe28a')});
  fxs.forEach(f=>{const q=Math.max(0,Math.min(1,f.t/f.d));ctx.globalAlpha=1-q;circ(f.x,f.y,f.r*(.35+q),f.c);ctx.globalAlpha=1});
  ctx.font='6px monospace';ctx.textAlign='center';
  fts.forEach(f=>{ctx.globalAlpha=Math.max(0,f.a);ctx.fillStyle='#000';ctx.fillText(f.t,Math.round(f.x)+.5,Math.round(f.y)+.5);ctx.fillStyle=f.c;ctx.fillText(f.t,Math.round(f.x),Math.round(f.y));ctx.globalAlpha=1});
  ctx.setTransform(1,0,0,1,0,0);
  const v=ctx.createRadialGradient(cv.width/2,cv.height/2,Math.min(cv.width,cv.height)*.35,cv.width/2,cv.height/2,Math.max(cv.width,cv.height)*.75);
  v.addColorStop(0,'rgba(10,5,2,0)');v.addColorStop(1,'rgba(10,5,2,.5)');ctx.fillStyle=v;ctx.fillRect(0,0,cv.width,cv.height);
  hudArena();
  minimapa();
 };
 function minimapa(){
  const mm=$('mm').getContext('2d'),SZ=160,k=(SZ-16)/AW,ox=8,oy=(SZ-AH*k)/2;
  mm.setTransform(1,0,0,1,0,0);mm.fillStyle='#0b0806';mm.fillRect(0,0,SZ,SZ);mm.imageSmoothingEnabled=false;if(fundo)mm.drawImage(fundo,ox,oy,AW*k,AH*k);
  if(window.onlineMinimap)onlineMinimap(mm,OX-ox/k,OY-oy/k,k,SZ);
  const at=(x,y)=>[ox+(x-OX)*k,oy+(y-OY)*k],[px,py]=at(p.x,p.y);mm.fillStyle='#000';mm.fillRect(px-3,py-3,6,6);mm.fillStyle='#fff';mm.fillRect(px-2,py-2,4,4);
 }
 const aviso=(txt,cor='#ffd84a')=>{feed.unshift({txt,cor,t:5});if(feed.length>5)feed.pop()};
 const texto=(t,x,y,cor,fonte)=>{ctx.font=fonte;ctx.fillStyle='#000';ctx.fillText(t,x+1,y+1);ctx.fillStyle=cor;ctx.fillText(t,x,y)};
 /* placar no alto: equipes, vivos e tempo (partida) ou abates (treino) */
 function hudArena(){
  ctx.textAlign='center';const cx=cv.width/2;
  if(partida){
   const vivos=e=>Object.entries(partida.membros).filter(([id,m])=>m.equipe===e&&!partida.mortos.has(id)).length,resta=Math.max(0,DURACAO-(agora()-partida.inicio)),mm=Math.floor(resta/60000),ss=Math.floor(resta/1000)%60;
   texto('Equipe A  '+vivos('a')+' vivo(s)   ×   '+vivos('b')+' vivo(s)  Equipe B',cx,23,'#ffd84a','bold 14px monospace');
   texto(mm+':'+String(ss).padStart(2,'0'),cx,42,resta<30000?'#f87171':'#f2e8d2','bold 16px monospace');
   texto('Você está na Equipe '+partida.equipe.toUpperCase(),cx,60,partida.equipe==='a'?'#ff9a8a':'#9ac0ff','12px monospace');
  }else texto('ARENA · TREINO · '+p.pvp.abates+' abates · '+p.pvp.mortes+' mortes',cx,23,'#ffd84a','bold 13px monospace');
  ctx.font='12px monospace';feed.forEach((m,i)=>{ctx.globalAlpha=Math.min(1,m.t);texto(m.txt,cx,(partida?82:42)+i*16,m.cor,'12px monospace')});ctx.globalAlpha=1;
  if(resultado){ctx.fillStyle='#000a';ctx.fillRect(0,cv.height/2-50,cv.width,90);texto(resultado.titulo,cx,cv.height/2,resultado.cor,'bold 40px monospace');texto(resultado.sub,cx,cv.height/2+28,'#f2e8d2','14px monospace')}
  else if(p.dead>0){ctx.fillStyle='#0007';ctx.fillRect(0,0,cv.width,cv.height);texto(partida?'Você caiu. Assistindo até o fim da partida…':'Você caiu... volta em '+Math.ceil(p.dead)+'s',cx,cv.height/2,'#fff','24px monospace')}
 }

 /* ================= partida 1x1 / 2x2 ================= */
 const DURACAO=5*60000;
 let partida=null,lobby=null,lobbyLider=null,lobbyOff=null,resultado=null,painelAberto=false,convidarEquipe=null;
 const enviados=new Map(); // uid -> {nome,equipe}
 const nuvemOk=()=>!!(window.NUVEM&&window.MP&&NUVEM.uid);
 const eu=()=>window.NUVEM&&NUVEM.uid;
 const agora=()=>Date.now()+((window.NUVEM&&NUVEM.offset)||0);
 const refL=l=>NUVEM.db.ref('arenas/'+l);
 const TS=()=>firebase.database.ServerValue.TIMESTAMP;

 /* ---- lobby: arenas/{lider} = {modo, estado:'espera'|'luta'|'fim', membros:{uid:{nome,equipe,nivel}}, sala, inicio, mortos, fim} ---- */
 function seguirLobby(lider){
  if(lobbyOff){lobbyOff();lobbyOff=null}
  lobbyLider=lider;if(!lider){lobby=null;return}
  const r=refL(lider),fn=s=>{const v=s.val();lobby=v;
   if(!v){if(partida&&!partida.acabou)terminar('empate');lobbyLider=null;if(painelAberto)painel();return}
   if(v.estado==='luta'&&!partida&&v.membros&&v.membros[eu()])iniciarPartida(v);
   if(partida){partida.mortos=new Set(Object.keys(v.mortos||{}));if(v.fim&&!partida.acabou)terminar(v.fim.vencedor)}
   if(painelAberto)painel()};
  r.on('value',fn);lobbyOff=()=>r.off('value',fn);
 }
 async function criarLobby(modo){
  if(!nuvemOk())return;
  await refL(eu()).set({modo,estado:'espera',membros:{[eu()]:{nome:NUVEM.nome(),equipe:'a',nivel:p.lvl}},t:TS()});
  enviados.clear();seguirLobby(eu());
 }
 async function sairDoLobby(){
  if(!lobbyLider)return;const l=lobbyLider;
  if(l===eu())await refL(l).remove().catch(()=>{});else await refL(l).child('membros/'+eu()).remove().catch(()=>{});
  seguirLobby(null);
 }
 async function aceitarConvite(de,c){
  if(!nuvemOk())return;
  if(partida){ft(p.x,p.y-24,'Termine a partida atual primeiro.','#f87171');return}
  if(lobbyLider&&lobbyLider!==de)await sairDoLobby();
  const s=await refL(de).once('value'),v=s.val();
  if(!v||v.estado!=='espera'){ft(p.x,p.y-24,'Essa partida já começou ou acabou.','#f87171');return}
  const cap=v.modo||1,equipe=['a','b'].includes(c.equipe)?c.equipe:'b',naEquipe=Object.values(v.membros||{}).filter(m=>m.equipe===equipe).length;
  const outra=equipe==='a'?'b':'a',vagaOutra=Object.values(v.membros||{}).filter(m=>m.equipe===outra).length<cap;
  const final=naEquipe<cap?equipe:vagaOutra?outra:null;if(!final){ft(p.x,p.y-24,'A partida está cheia.','#f87171');return}
  await refL(de).child('membros/'+eu()).set({nome:NUVEM.nome(),equipe:final,nivel:p.lvl});
  seguirLobby(de);abrirPainel();
 }
 async function trocarModo(modo){
  if(lobbyLider!==eu()||!lobby)return;
  // quem não couber no modo novo sai do lobby
  const membros={...lobby.membros},cont={a:0,b:0};
  for(const [id,m] of Object.entries(membros)){if(cont[m.equipe]>=modo&&id!==eu())delete membros[id];else cont[m.equipe]++}
  await refL(eu()).update({modo,membros});
 }
 async function comecar(){
  if(lobbyLider!==eu()||!lobby)return;
  const sala='arena:'+eu()+':'+Date.now().toString(36);
  await refL(eu()).update({estado:'luta',sala,inicio:TS(),mortos:null,fim:null});
 }

 /* ---- partida ---- */
 function iniciarPartida(v){
  partida={lider:lobbyLider,sala:v.sala,modo:v.modo,membros:v.membros,equipe:v.membros[eu()].equipe,inicio:v.inicio||agora(),mortos:new Set(),acabou:false};
  fecharPainel();resultado=null;
  entrar({partida:true});
  // cada equipe começa numa ponta da arena
  const lado=partida.equipe==='a'?-1:1,ids=Object.keys(v.membros).filter(id=>v.membros[id].equipe===partida.equipe).sort(),k=ids.indexOf(eu());
  p.x=CXa+lado*RX*.72;p.y=CYa+(k?28:-10);p.fx=-lado;p.fy=0;
  aviso('A partida começou! 5 minutos.','#ffd84a');if(window.playGameSound)playGameSound('quest');
 }
 function vivosDe(e){return Object.entries(partida.membros).filter(([id,m])=>m.equipe===e&&!partida.mortos.has(id))}
 // só o líder decide o fim: uma equipe sem ninguém vivo, ou o tempo acabou (ganha quem tem mais gente viva e depois mais vida)
 function juiz(){
  if(!partida||partida.acabou||partida.lider!==eu()||!lobby||lobby.fim)return;
  const a=vivosDe('a').length,b=vivosDe('b').length;let venc=null;
  if(!a&&!b)venc='empate';else if(!a)venc='b';else if(!b)venc='a';
  else if(agora()-partida.inicio>=DURACAO){
   if(a!==b)venc=a>b?'a':'b';
   else{const vida=e=>vivosDe(e).reduce((s,[id])=>s+(id===eu()?p.hp/Math.max(1,mhp()):+(MP.remotos.get(id)?.hp||0)),0),va=vida('a'),vb=vida('b');venc=Math.abs(va-vb)<.02?'empate':va>vb?'a':'b'}
  }
  if(venc)refL(eu()).update({estado:'fim',fim:{vencedor:venc}});
 }
 function terminar(venc){
  if(!partida||partida.acabou)return;partida.acabou=true;
  const eq=partida.equipe,ganhou=venc===eq,emp=venc==='empate';
  p.pvp.vitorias=(p.pvp.vitorias||0)+(ganhou?1:0);p.pvp.derrotas=(p.pvp.derrotas||0)+(!ganhou&&!emp?1:0);p.pvp.empates=(p.pvp.empates||0)+(emp?1:0);
  resultado={titulo:emp?'EMPATE':ganhou?'VITÓRIA!':'DERROTA',cor:emp?'#f2e8d2':ganhou?'#8fe388':'#f87171',sub:emp?'Ninguém venceu desta vez.':ganhou?'A sua equipe venceu a partida.':'A outra equipe venceu a partida.'};
  if(window.playGameSound)playGameSound(ganhou?'quest':'defeat');if(window.saveGame)saveGame();
  setTimeout(()=>{const lider=partida&&partida.lider;resultado=null;partida=null;sair(true);if(lider===eu())setTimeout(()=>refL(lider).remove().catch(()=>{}),3000);seguirLobby(null)},4500);
 }
 function desistir(){
  if(!partida||partida.acabou)return;
  marcarMorto();const lider=partida.lider;partida.acabou=true;partida=null;resultado=null;sair();seguirLobby(null);
  if(lider===eu())refL(lider).update({estado:'fim',fim:{vencedor:'b'}}).catch(()=>{});
 }
 function marcarMorto(){if(partida&&nuvemOk())refL(partida.lider).child('mortos/'+eu()).set(true).catch(()=>{})}

 /* ---- entrar e sair da arena ---- */
 const lugarLivre=()=>{for(let t=0;t<40;t++){const a=Math.random()*6.283,r=.55+Math.random()*.3,x=CXa+Math.cos(a)*RX*r,y=CYa+Math.sin(a)*RY*r;if(arenaWalk(x,y))return{x,y}}return{x:CXa,y:CYa+RY-30}};
 function entrar(o={}){
  if(window.inArena||(p.dead>0&&!o.partida))return;
  if(window.inDungeon){ft(p.x,p.y-24,'Saia da masmorra antes de ir à arena.','#f87171');return}
  if(window.inTaverna&&window.sairTaverna)sairTaverna(true);
  if(window.MP&&MP.antesDeSair)MP.antesDeSair();
  ilhaPos={x:p.x,y:p.y};enGuardado=en.splice(0,en.length);
  clearMovementInput();window.inArena=true;proj.length=0;
  const l=lugarLivre();p.x=l.x;p.y=l.y;p.dead=0;p.hp=mhp();p.mp=mmp();p.st=null;
  boneco=o.partida?null:{pvp:true,boneco:true,x:CXa,y:CYa-40,hp:5000,max:5000,hit:0,lvl:p.lvl,name:'Boneco de treino',img:null};if(boneco)en.push(boneco);
  ft(p.x,p.y-30,o.partida?'PARTIDA':'TREINO','#ffd84a');ring(p.x,p.y,30,'#ffd84a',.6);atualizarBotao();
 }
 function sair(silencioso){
  if(!window.inArena)return;
  if(partida&&!partida.acabou){ft(p.x,p.y-24,'Só dá para sair no fim da partida (ou desistindo).','#f87171');return}
  window.inArena=false;clearMovementInput();p.tgt=null;
  en.length=0;if(enGuardado)en.push(...enGuardado);enGuardado=null;boneco=null;
  const volta=ilhaPos&&walk(ilhaPos.x,ilhaPos.y)?ilhaPos:{x:CX,y:CY+34};p.x=volta.x;p.y=volta.y;ilhaPos=null;
  p.dead=0;p.hp=mhp();p.mp=mmp();
  if(!silencioso)ft(p.x,p.y-24,'De volta à ilha','#ffd84a');
  atualizarBotao();if(window.saveGame)saveGame();
 }
 const posAntes=window.posicaoParaSalvar;
 window.posicaoParaSalvar=()=>window.inArena&&ilhaPos?ilhaPos:posAntes?posAntes():p;
 const botao=document.createElement('button');botao.type='button';botao.className='ib tavBtn arenaBtn';botao.onclick=()=>partida?desistir():sair();
 function atualizarBotao(){botao.style.display=window.inArena?'':'none';botao.textContent=partida?'Desistir':'Sair da arena';const tav=document.querySelector('.tavBtn:not(.arenaBtn)');if(tav)tav.style.display=window.inArena?'none':''}
 (document.getElementById('hbtns')||document.body).append(botao);atualizarBotao();

 /* ---- painel do Lanceiro: escolher 1x1 ou 2x2, montar as equipes e começar ---- */
 const E=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
 const B=(txt,fn,cls)=>{const b=E('button',cls||'',txt);b.type='button';b.onclick=fn;return b};
 function fecharPainel(){painelAberto=false;const box=$('dialogue');if(box.classList.contains('arenaModal')){box.classList.remove('open','arenaModal','dgModal')}}
 let marca=null; // primeiro elemento do painel: se sumiu da caixa, outro diálogo tomou o lugar e o painel não volta sozinho
 function abrirPainel(){painelAberto=true;marca=null;painel()}
 function painel(){
  const box=$('dialogue');if(!painelAberto)return;
  if(marca&&!(box.contains(marca)&&box.classList.contains('open'))){painelAberto=false;return}
  if(document.activeElement&&box.contains(document.activeElement)&&document.activeElement.closest('.dgm-cand'))return;
  box.classList.add('dgModal','arenaModal');box.replaceChildren();
  const pv=p.pvp;marca=E('b','','Lanceiro Aldric · Arena');
  box.append(marca,E('p','','Partidas de equipe: 1 contra 1 ou 2 contra 2. Cada um usa as próprias defesas; quem cai fica assistindo. A partida acaba quando uma equipe perde todos ou em 5 minutos (ganha quem tiver mais gente viva, depois mais vida). Cair não custa ouro.'));
  const placar=E('div','lobPlacar');placar.innerHTML='<span>Vitórias <b>'+(pv.vitorias||0)+'</b></span><span>Derrotas <b>'+(pv.derrotas||0)+'</b></span><span>Empates <b>'+(pv.empates||0)+'</b></span><span>Abates <b>'+(pv.abates||0)+'</b></span>';box.append(placar);
  if(!nuvemOk()){box.append(E('p','dgm-muted','Sem conexão online não há partidas: treine sozinho com o Boneco de treino.'),B('Treinar com o boneco',()=>{fecharPainel();entrar()}),B('Até mais',fecharPainel));box.classList.add('open');return}
  if(!lobby){
   const modos=E('div','lobModos');modos.append(B('1 x 1',()=>criarLobby(1)),B('2 x 2',()=>criarLobby(2)));
   box.append(E('p','','Escolha o modo para montar a partida:'),modos,B('Treinar com o boneco',()=>{fecharPainel();entrar()}),B('Até mais',fecharPainel));box.classList.add('open');return;
  }
  const souLider=lobbyLider===eu(),modo=lobby.modo||1,membros=Object.entries(lobby.membros||{});
  for(const [id] of membros)enviados.delete(id);
  if(souLider){const modos=E('div','lobModos');for(const m of [1,2]){const b=B(m+' x '+m,()=>trocarModo(m),m===modo?'on':'');modos.append(b)}box.append(modos)}
  // cartas: equipe A (P1, P2) × equipe B (P3, P4), desencontradas como no esboço
  const da=e=>membros.filter(([,m])=>m.equipe===e),cartas=[],slotsA=da('a'),slotsB=da('b');
  const espera=e=>[...enviados.entries()].filter(([,x])=>x.equipe===e);
  const carta=(lista,e,k,num,alto)=>{const m=lista[k];
   if(m){const [id,x]=m;return LOBBY.carta({rotulo:x.nome,sprite:id===eu()?heroImg('d'):window.spriteDeJogador&&spriteDeJogador(id),sub:(id===eu()?'Você · ':'')+'Nv '+(x.nivel||1),lider:id===lobbyLider,voce:id===eu(),alto})}
   const esp=espera(e)[k-lista.length];
   return LOBBY.carta({rotulo:'Jogador '+num,vazio:true,esperando:esp&&esp[1].nome,podeClicar:souLider,alto,onClick:()=>{convidarEquipe=convidarEquipe===e?null:e;painel()}})};
  if(modo===2){cartas.push(carta(slotsA,'a',1,2,true),carta(slotsA,'a',0,1,false),carta(slotsB,'b',0,3,false),carta(slotsB,'b',1,4,true))}
  else cartas.push(carta(slotsA,'a',0,1,false),carta(slotsB,'b',0,2,false));
  box.append(LOBBY.linha(cartas,modo===2?2:1));
  if(souLider&&convidarEquipe){
   const conv=E('div','dgp-convidar');conv.append(E('span','dgm-label','Convidar para a Equipe '+convidarEquipe.toUpperCase()));
   const cand=window.MP&&MP.candidatosDg?MP.candidatosDg().filter(c=>!lobby.membros[c.id]).slice(0,10):[];
   if(!cand.length)conv.append(E('span','dgm-muted','Ninguém online para convidar agora.'));
   for(const c of cand){const li=E('div','dgm-cand');li.append(E('span','',c.nome+' · Nv '+c.nivel+(c.amigo?' · amigo':'')),E('small','',c.onde));
    const b=B(enviados.has(c.id)?'Enviado':'Convidar',async()=>{b.disabled=true;await MP.convidar(c.id,'arena',{modo,equipe:convidarEquipe});enviados.set(c.id,{nome:c.nome,equipe:convidarEquipe});convidarEquipe=null;painel()},'dgm-convite');b.disabled=enviados.has(c.id);li.append(b);conv.append(li)}
   box.append(conv);
  }
  const cheio=slotsA.length>=modo&&slotsB.length>=modo;
  box.append(E('p','dgm-muted',souLider?(cheio?'Equipes completas: pode começar!':'Clique em + para convidar. O convite chega no Correio de quem você chamar.'):'Esperando o líder começar a partida.'));
  if(souLider){const go=B('Começar a partida',comecar,'dgm-enter');go.disabled=!cheio;box.append(go)}
  box.append(B(souLider?'Cancelar partida':'Sair do lobby',sairDoLobby),B('Fechar',fecharPainel));
  box.classList.add('open');
 }

 /* ---- dano entre jogadores (salas/{sala}/pvp) ---- */
 const nuvem=()=>window.NUVEM&&window.MP&&MP.sala&&MP.sala.startsWith('arena:');
 function enviar(o){if(!nuvem())return;const r=NUVEM.db.ref('salas/'+MP.sala+'/pvp').push({de:NUVEM.uid,nome:NUVEM.nome(),...o,t:TS()});setTimeout(()=>r.remove().catch(()=>{}),6000)}
 /* chamado pelo hurtE (combat.js) quando o alvo é um jogador inimigo ou o boneco */
 function golpe(e,d,magic,fx,dot){
  if(dot||e.hp<=0)return;
  const roll=combatRoll(p,1),mul=roll.damage,obj=d&&typeof d=='object'?d:magic?{physical:0,magic:+d||0}:{physical:+d||0,magic:0};
  const fis=Math.round((obj.physical||0)*mul),mag=Math.round((obj.magic||0)*mul),total=fis+mag;
  e.hit=.15;if(window.playGameSound)playGameSound(magic?'magicHit':'sword');if(window.marcarCombate)marcarCombate();
  ft(e.x,e.y-22,(roll.crit?'CRÍTICO ':'')+total,roll.crit?'#ffd84a':'#fff');
  if(e.boneco){e.hp-=total;if(e.hp<=0){e.hp=e.max;aviso('Boneco de treino derrubado!','#e7dcc4')}return}
  enviar({tipo:'golpe',alvo:e.uid,d:fis,m:mag});
 }
 function receber(f){
  if(!f||!window.inArena||!window.NUVEM)return;
  if(agora()-(f.t||0)>4000)return;
  if(f.tipo==='morte'){
   if(f.matou===eu()){p.pvp.abates++;aviso('Você derrotou '+(f.nomeAlvo||'um jogador')+'!','#8fe388');if(window.saveGame)saveGame()}
   else if(f.alvo!==eu())aviso((f.nomeDe||'Alguém')+' derrotou '+(f.nomeAlvo||'alguém'),'#f87171');
   return;
  }
  if(f.tipo!=='golpe'||f.alvo!==eu()||f.de===eu()||p.dead>0||!partida||partida.acabou)return;
  // cair não custa ouro: o hurtP aplica as defesas; quem cai fica assistindo até o fim
  const ouro=p.gold;hurtP({physical:+f.d||0,magic:+f.m||0},(+f.m||0)>(+f.d||0));
  if(p.hp<=0){p.gold=ouro;p.dead=1e9;p.pvp.mortes++;marcarMorto();enviar({tipo:'morte',alvo:eu(),nomeAlvo:NUVEM.nome(),nomeDe:f.nome,matou:f.de});aviso((f.nome||'Alguém')+' derrotou você','#f87171');if(window.saveGame)saveGame()}
 }
 window.addEventListener('mp-sala',e=>{
  const sala=e.detail&&e.detail.sala;
  if(window._arenaOff){_arenaOff();window._arenaOff=null}
  if(!sala||!sala.startsWith('arena:')||!window.NUVEM)return;
  const r=NUVEM.db.ref('salas/'+sala+'/pvp'),fn=s=>receber(s.val());
  r.on('child_added',fn);window._arenaOff=()=>r.off('child_added',fn);
 });

 /* ---- inimigos viram alvos (en com pvp:true); posição e vida vêm do online. Aliados não são alvo ---- */
 let tJuiz=0;
 const upd0=upd;upd=function(dt){upd0(dt);
  for(const m of feed)m.t-=dt*.25;while(feed.length&&feed[feed.length-1].t<=0)feed.pop();
  if(!window.inArena)return;
  if(boneco){boneco.hit-=dt}
  const remotos=window.MP?MP.remotos:new Map(),vistos=new Set();
  for(const r of remotos.values()){
   if(!partida||!partida.membros[r.uid]||partida.membros[r.uid].equipe===partida.equipe)continue;
   vistos.add(r.uid);let e=en.find(o=>o.pvp&&o.uid===r.uid);
   if(!e){e={pvp:true,uid:r.uid,max:100,hit:0,stats:{F:0,A:0,I:0}};en.push(e)}
   e.x=r.x;e.y=r.y;e.hp=r.dead||partida.mortos.has(r.uid)?0:Math.max(1,(+r.hp||0)*100);e.name=r.name;e.lvl=r.lvl;e.hit-=dt}
  for(let i=en.length;i--;){const e=en[i];if(e.pvp&&e.uid&&!vistos.has(e.uid)){if(p.tgt===e)p.tgt=null;en.splice(i,1)}}
  if(partida){if((tJuiz-=dt)<=0){tJuiz=.5;juiz()}
   // sem notícia do líder muito depois do fim do tempo, a partida acaba empatada para não prender ninguém
   if(!partida.acabou&&agora()-partida.inicio>DURACAO+20000)terminar('empate')}
  else if(p.y>CYa+RY+2&&Math.abs(p.x-PORTAO.x)<12)sair();
 };
 window.ARENA={entrar,sair,golpe,aceitarConvite,abrirPainel,desistir,
  sala:()=>partida&&partida.sala||null,emPartida:()=>!!partida,
  renascer(){const l=lugarLivre();p.x=l.x;p.y=l.y;p.hp=mhp();p.mp=mmp();p.st=null;ring(p.x,p.y,30,'#fff6b0',.7);if(window.playGameSound)playGameSound('revive')},
  jogadores:()=>window.ONLINE_NUVEM?[...ONLINE_NUVEM.outros.values()].filter(o=>o.sala&&o.sala.startsWith('arena')).length:0,
  clique:(w,mode)=>{if(partida)return false;if(Math.hypot(w.x-PORTAO.x,w.y-PORTAO.y)<16){if(dist(p,PORTAO)<30)sair();else setDest(PORTAO.x,PORTAO.y-10);return true}return false}};
})();
