/* ---------- Classe Explorador (2026-11-02, pedido do usuário) ----------
   Classe da história (não tem Mestre na taverna e não aparece na criação de personagem — CL.explorador.historia):
   aprendida na caçada do Arqueiro Caçador ao Ladino (js/historia.js): pegar o item com o Ladino ou entregar a
   relíquia ao Arqueiro Caçador ensina Explorador; deixar o item com o Ladino ensina Ladino (classe futura).
   Habilidades (1 por rank):
    1 Armadilha de Caça — arma uma armadilha no chão (quantas quiser, cada uma dura 30 s; conjuração 0,5 s, recarga
      10 s): o primeiro inimigo que pisar nela leva 100% do dano da arma, 3 acúmulos de sangramento e fica enraizado
      por 3 s (não anda, mas ataca e usa habilidades);
    2 Gancho — lança um projétil-gancho com corda na direção do mouse: fisga o que vier primeiro — um inimigo
      (comum: vocês se puxam até o meio, dano leve; chefe/elite: você se puxa até ele) ou um OBSTÁCULO com
      colisão (árvore, muro, parede de DG: você se puxa até ele). O inimigo fisgado fica atordoado 0,25 s. Recarga 10 s;
      sem nada para fisgar, devolve mana e recarga;
    3 Grito de Estratégia — brado verde: +10% de velocidade de ataque e +10% de chance crítica por 10 s (recarga 20 s);
    4 Instinto de Caça — marca um inimigo: contra ele, +10% de dano, de dano crítico e de chance crítica por 10 s
      (conjuração 0,25 s, recarga 30 s). A armadilha só vai a até 36 px do herói.
   (valores pedidos pelo usuário em 2026-11-05)
   Passiva: Passos de Caçador, +20% de velocidade de movimento (CL.pSpd).
   O visual do herói usa o conjunto 'explorador' do js/sprites.js (CLASSE_VISUAL, o arqueiro de verde). */
(function(){
 const MOTOR=typeof MODO!=='undefined'&&MODO.motor; // na Engine: só os dados (ícones, efeitos, criar), sem o laço do jogo
 const VERDE='#79a35a',VERDE_E='#3f6b45',VERDE_C='#c4dc5a'; // rampa Folhagem/Veneno da paleta do jogo

 /* ---- ícones próprios (2026-11-04, pedido do usuário: ícones únicos) ----
    16×16 no mesmo padrão dos outros (fundo em degradê da cor da classe e moldura; js/combat.js SKI), cor da classe
    verde-musgo (paleta Musgo) e o símbolo desenhado à mão com a paleta do jogo e contorno escuro. */
 const COR_CLASSE='#9aab5c'; // musgo claro: o fundo fica oliva (o do Curandeiro é verde)
 const PI={k:'#0d0d0d',s:'#3e3a52',m:'#7c8098',l:'#c4c8d6',w:'#ffffff',t:'#4e2430',r:'#7d3f34',o:'#a8653f',
  g:'#3f6b45',n:'#79a35a',y:'#c4dc5a',a:'#9a5a2a',b:'#d08a3a',c:'#efc56a',d:'#a22b4b',e:'#cf4554',u:'#7a6650',v:'#b8a47c',i:'#ddd0a6'};
 function icone(desenha){const o=mkCanvas(16,16),g=o.getContext('2d');
  if(window.PALETA_JOGO&&PALETA_JOGO.fundoIcone)PALETA_JOGO.fundoIcone(g,16,16,COR_CLASSE); // fundo: 3 cores (centro, borda clara, borda escura)
  const S=[...Array(16)].map(()=>Array(16).fill(null)),P=(x,y,c)=>{x=Math.round(x);y=Math.round(y);if(x>=1&&y>=1&&x<15&&y<15)S[y][x]=PI[c]||c};
  desenha(P);
  for(let y=0;y<16;y++)for(let x=0;x<16;x++){const c=S[y][x];if(c){g.fillStyle=c;g.fillRect(x,y,1,1)}else if([[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>S[y+b]&&S[y+b][x+a]&&S[y+b][x+a]!==PI.k)&&x>=1&&y>=1&&x<15&&y<15){g.fillStyle=PI.k;g.fillRect(x,y,1,1)}}
  return (window.PALETA_JOGO&&PALETA_JOGO.iconeNaPaleta?PALETA_JOGO.iconeNaPaleta(o):o).toDataURL()} // na paleta do jogo
 const ICONE={
  // armadilha de urso aberta: argola de aço com dentes para dentro, prato de ouro no meio e a corrente com a estaca
  armadilha:icone(P=>{for(let y=1;y<15;y++)for(let x=1;x<15;x++){const dx=(x+.5-7.5)/5.6,dy=(y+.5-7.2)/3.9,d=Math.hypot(dx,dy);if(d<=1&&d>.66)P(x,y,dy<-.3?'l':dy>.45?'s':'m')}
   for(const x of [4,6,8,10])P(x,5,'w');for(const x of [5,7,9,11])P(x,9,'l');
   for(let x=6;x<=9;x++)P(x,7,x<8?'c':'b');P(7,8,'a');P(8,8,'a');
   P(12,11,'s');P(13,11,'m');P(13,12,'s');P(13,13,'m');P(14,13,'s');P(12,13,'r');P(12,14,'t')}),
  // gancho de três pontas com a corda saindo da argola
  gancho:icone(P=>{for(let y=4;y<=10;y++){P(7,y,'l');P(8,y,'m')}P(7,2,'m');P(8,2,'l');P(6,3,'m');P(9,3,'m');P(6,4,'s');P(9,4,'s');
   for(const [x,y,c] of [[6,11,'m'],[5,11,'m'],[4,10,'l'],[3,9,'l'],[3,8,'w'],[9,11,'m'],[10,11,'m'],[11,10,'l'],[12,9,'l'],[12,8,'w'],[7,11,'m'],[8,11,'m'],[7,12,'l'],[8,12,'s'],[7,13,'w']])P(x,y,c);
   for(const [x,y,c] of [[10,2,'o'],[11,2,'r'],[12,3,'o'],[13,4,'r'],[13,5,'o'],[12,6,'r'],[11,6,'o'],[10,5,'r']])P(x,y,c);
   P(2,4,'n');P(3,4,'y');P(1,6,'g');P(2,6,'n')}),
  // corneta de caça de marfim com aros de ouro, soltando ondas verdes
  corneta:icone(P=>{for(let k=0;k<=40;k++){const t=k/40,cx=2.5+6.5*t,cy=12.2-5.2*Math.pow(t,1.3),r=.6+2.7*Math.pow(t,2.4);
    for(let y=Math.floor(cy-r);y<=Math.ceil(cy+r);y++)for(let x=Math.floor(cx-r);x<=Math.ceil(cx+r);x++)if(Math.hypot(x+.5-cx,y+.5-cy)<=r){const banda=Math.abs(t-.38)<.04||Math.abs(t-.7)<.035;P(x,y,banda?(y<cy?'c':'b'):y<cy-r*.3?'i':y>cy+r*.4?'u':'v')}}
   P(9,6,'t');P(10,7,'t');P(9,7,'k');P(10,6,'r');P(2,12,'b');P(1,13,'a'); // boca da corneta (escura por dentro)
   for(let a=-1.25;a<=.75;a+=.14){P(9.5+Math.cos(a)*4.3,7+Math.sin(a)*4.3,'y');P(9.5+Math.cos(a)*6.1,7+Math.sin(a)*6.1,a>-.4&&a<.4?'n':'g')}}),
  // mira vermelha travada sobre o olho do caçador
  instinto:icone(P=>{for(let y=1;y<15;y++)for(let x=1;x<15;x++){const dx=x+.5-7.5,dy=y+.5-7.5,d=Math.hypot(dx,dy);
    if(d<=6&&d>4.9&&!(Math.abs(dx)<1.2||Math.abs(dy)<1.2))P(x,y,dy>2?'d':'e')
    const ol=Math.abs(dx)<=3.3&&Math.abs(dy)<=1.75*(1-(dx/3.3)**2);if(ol)P(x,y,'i')}
   P(7,7,'n');P(8,7,'g');P(7,8,'g');P(8,8,'n');P(7,7,'w');P(8,7,'k');P(8,8,'k');
   for(const [x,y] of [[7,1],[8,1],[7,2],[8,2],[7,13],[8,13],[7,14],[8,14],[1,7],[1,8],[2,7],[2,8],[13,7],[13,8],[14,7],[14,8]])P(x,y,(x==7||y==7)?'w':'e')})};
 window.ICONE_EXPLORADOR=ICONE;
 // ícone de cada habilidade do projeto (id em dados.skills): entra no iconeHabilidade de js/icones-habilidades.js
 const ICONE_POR_ID={exp_armadilha:ICONE.armadilha,exp_gancho:ICONE.gancho,exp_instinto:ICONE.instinto};
 {const antes=window.iconeHabilidade;window.iconeHabilidade=id=>ICONE_POR_ID[id]||(antes?antes(id):null)}

 /* ---- animações próprias (2026-11-04): desenhadas pixel a pixel como as outras (js/vfx-habilidades.js) ---- */
 const U=window.VFX&&VFX.util;
 if(window.VFX&&VFX.registrar&&U){const {px,Q,easeOut,ACHATA}=U;
  // a armadilha abre como uma mola: as mandíbulas saltam para fora, balançam e assentam; poeira dos lados
  VFX.registrar('armadilhaArma',(g,e)=>{const k=e.t/e.dur,s=k<.35?easeOut(k/.35)*1.25:1.25-.25*Math.min(1,(k-.35)/.3),a=Q(1-Math.max(0,k-.6)/.4);
   for(let i=0;i<36;i++){const t=i/36*Math.PI*2;px(g,Math.round(e.x+Math.cos(t)*6.5*s),Math.round(e.y+Math.sin(t)*3.5*s),Math.sin(t)<0?'#c4c8d6':'#7c8098',a)}
   for(let i=0;i<6;i++){const lado=i%2?1:-1,r=4+k*10;px(g,Math.round(e.x+lado*r+(i>>1)),Math.round(e.y+1-k*4-(i>>1)),'#a69c94',Q(1-k)*.8)}g.globalAlpha=1});
  // a armadilha fecha: as duas mandíbulas batem no meio, estrela branca, faíscas e gotas de sangue
  VFX.registrar('armadilhaFecha',(g,e)=>{const k=e.t/e.dur,f=Math.min(1,k/.22),ry=3.6*(1-f)+.6,a=Q(1-Math.max(0,k-.5)/.5);
   for(let i=0;i<32;i++){const t=i/32*Math.PI*2;px(g,Math.round(e.x+Math.cos(t)*6.5),Math.round(e.y+Math.sin(t)*ry),Math.sin(t)<0?'#c4c8d6':'#7c8098',a)}
   if(k>.18&&k<.5){const r=Math.round(2+(k-.18)*20);for(let i=0;i<8;i++){const t=i/8*Math.PI*2;for(let j=0;j<r;j++)px(g,Math.round(e.x+Math.cos(t)*j),Math.round(e.y-3+Math.sin(t)*j*ACHATA),j>r-2?'#ffffff':'#efc56a',Q(1-(k-.18)/.32))}}
   if(k>.2)for(let i=0;i<7;i++){const t=-.4-i*.33,v=10+i*3,q=k-.2;px(g,Math.round(e.x+Math.cos(t)*v*q*2),Math.round(e.y-4+Math.sin(t)*v*q*2+q*q*60),i%2?'#cf4554':'#a22b4b',a)}g.globalAlpha=1});
  // Grito de Estratégia: três ondas de chevrons verdes abrindo em volta do herói, com folhas subindo
  VFX.registrar('brado',(g,e)=>{const k=e.t/e.dur;for(let w=0;w<3;w++){const kk=k*1.4-w*.2;if(kk<0||kk>1)continue;const r=6+easeOut(kk)*40,a=Q(1-kk);
    // cada onda: frente branca e dois tons de verde atrás (aparece em cima da grama), em chevrons tracejados
    for(let i=0;i<64;i++){if(i%8>5)continue;const t=i/64*Math.PI*2;
     for(const [dr,c] of [[0,'#ffffff'],[-1,'#c4dc5a'],[-2,'#3f6b45']])px(g,Math.round(e.x+Math.cos(t)*(r+dr)),Math.round(e.y-6+Math.sin(t)*(r+dr)*ACHATA),c,a)}}
   if(k<.7&&Math.random()<.5&&window.VFX)VFX.faisca(e.x+(Math.random()-.5)*30,e.y-4-Math.random()*16,Math.random()<.5?'#79a35a':'#c4dc5a');g.globalAlpha=1});
  // Instinto de Caça: a mira grande fecha sobre o alvo e trava num clarão
  VFX.registrar('mira',(g,e)=>{const k=e.t/e.dur,r=Math.round(26-easeOut(Math.min(1,k/.6))*17),a=Q(k<.6?1:1-(k-.6)/.4),rot=k*2.5;
   for(let i=0;i<40;i++){const t=i/40*Math.PI*2+rot;if(Math.abs(Math.sin(2*(t-rot)))<.25)continue;px(g,Math.round(e.x+Math.cos(t)*r),Math.round(e.y+Math.sin(t)*r*ACHATA),'#cf4554',a)}
   for(let q=0;q<4;q++){const t=rot+q*Math.PI/2;for(let j=r-3;j<=r+3;j++)px(g,Math.round(e.x+Math.cos(t)*j),Math.round(e.y+Math.sin(t)*j*ACHATA),j==r+3?'#ffffff':'#cf4554',a)}
   if(k>.6){const f=Q(1-(k-.6)/.4);for(let i=-3;i<=3;i++){px(g,Math.round(e.x+i),Math.round(e.y),'#ffffff',f);px(g,Math.round(e.x),Math.round(e.y+i),'#ffffff',f)}}g.globalAlpha=1})}
 const vfx=(t,o)=>{if(window.VFX)VFX.tocar(t,o)};

 /* ---- efeitos próprios da classe ---- */
 Object.assign(FX_INFO,{
  // bonuses: atributos em % enquanto o efeito dura (js/combat.js statusAttributeBonus)
  estrategia:{n:'Grito de Estratégia',c:VERDE,kind:'bonus',good:true,aura:true,bonuses:{attackSpeed:10,critChance:10}},
  instinto:{n:'Instinto de Caça',c:'#cf4554',kind:'marcaCaca'}, // alvo marcado: o herói causa +pw% de dano, chance e dano crítico nele (js/combat.js marcaCaca)
  enraizado:{n:'Enraizado',c:'#79a35a',kind:'root'}}); // não anda; ataca e usa habilidades (js/combat.js enraizado)

 /* ---- Gancho: projétil-gancho com corda (rápido no voo e no puxão) ----
    Fisga o que vier primeiro na direção do mouse: um inimigo (vocês se puxam; chefe/elite puxa só você) ou um
    OBSTÁCULO com colisão — árvore, muro do acampamento, parede de DG (2026-11-02, pedido do usuário) — e você
    se puxa até ele. Sem nada para fisgar em 140 px, a habilidade não gasta mana nem recarga. */
 const VEL_GANCHO=280; // px/s (voo e puxão; metade da de antes, 2026-11-04); alcance, dano e efeitos: da habilidade (cfg)
 let gancho=null; // {e (inimigo) OU o {x,y,gx,gy} (obstáculo), x, y, fase:'ida'|'puxa', d:{x,y} destino do inimigo puxado}
 function lancarGancho(w,cfg){const ALCANCE_GANCHO=cfg.alcance;
  // 1) inimigo embaixo do mouse ou o alvo selecionado, dentro do alcance e à vista
  let t=typeof pick=='function'?pick(w):null;
  if(!(t&&t.hp>0))t=p.tgt&&p.tgt.hp>0?p.tgt:null;
  if(t&&(t.pvp||Math.hypot(t.x-p.x,t.y-p.y)>ALCANCE_GANCHO||!linhaLivre(p,t)))t=null;
  let obst=null;
  if(!t){ // 2) raio na direção do mouse: o primeiro inimigo perto da linha ou a primeira colisão (árvore, muro, parede)
   const a=Math.atan2(w.y-p.y,w.x-p.x),co=Math.cos(a),si=Math.sin(a);
   for(let d=10;d<=ALCANCE_GANCHO;d+=4){const X=p.x+co*d,Y=p.y+si*d;
    t=en.find(e=>e.hp>0&&!e.pvp&&Math.hypot(e.x-X,e.y-Y)<10);if(t)break;
    if(!walk(X,Y)||!campWallSegmentClear(p,{x:X,y:Y})){let r=Math.max(0,d-10);while(r>0&&!walk(p.x+co*r,p.y+si*r))r-=4;obst={x:p.x+co*r,y:p.y+si*r,gx:X,gy:Y};break}}}
  if(!t&&!obst){ // nada fisgável: devolve a mana e zera a recarga (não tem como "errar" e perder a habilidade)
   const sk=SK.find(k=>k.id===cfg.id);if(sk){p.mp=Math.min(mmp(),p.mp+(+sk.mana||0));sk.t=0}
   ft(p.x,p.y-24,'Nada para fisgar por perto','#ccc');return}
  gancho={e:t||null,o:t?null:obst,x:p.x,y:p.y-8,fase:'ida',lugar:lugar(),cfg};if(window.playGameSound)playGameSound('gancho')}
 function tickGancho(dt){
  const g=gancho;if(!g)return;
  if(g.lugar!==lugar()||p.dead>0){gancho=null;return}
  const e=g.e;
  if(g.fase==='ida'){
   if(e&&(e.hp<=0||!en.includes(e))){gancho=null;return}
   const tx=e?e.x:g.o.gx,ty=e?e.y-6:g.o.gy,dx=tx-g.x,dy=ty-g.y,d=Math.hypot(dx,dy),passo=VEL_GANCHO*dt;
   if(d>passo+8){g.x+=dx/d*passo;g.y+=dy/d*passo;return} // ainda voando (num inimigo, persegue)
   // fisgou!
   const ax=e?e.x:g.o.x,ay=e?e.y:g.o.y,dd=Math.hypot(ax-p.x,ay-p.y)||1,co=(ax-p.x)/dd,si=(ay-p.y)/dd;
   const puxar=(x1,y1)=>{p.dash={x0:p.x,y0:p.y,x1,y1,t:0,dur:Math.max(.06,Math.hypot(x1-p.x,y1-p.y)/VEL_GANCHO),dir:{x:co,y:si},rastro:true,fim:()=>{}};p.dest=null;p.path=[]};
   if(!e){ // obstáculo (árvore, muro, parede de DG): você se puxa até o último ponto livre antes dele
    vfx('impacto',{x:g.o.gx,y:g.o.gy,cor:'#c4c8d6'});if(window.playGameSound)playGameSound('gancho');
    g.d=null;puxar(g.o.x,g.o.y);g.fase='puxa';return}
   hurtE(e,g.cfg.pv(),g.cfg.magic,g.cfg.fx&&g.cfg.fx());vfx('impacto',{x:e.x,y:e.y-6,cor:VERDE_C});if(window.playGameSound)playGameSound('gancho');
   if(e.hp<=0){gancho=null;return}
   const grande=e.boss||e.elite||['boss','grandboss'].includes(e.bossType);
   if(grande){g.d=null;puxar(e.x-co*16,e.y-si*16)} // chefe ou elite não sai do lugar: você vai até ele
   else{const mx=(p.x+e.x)/2,my=(p.y+e.y)/2;g.d={x:mx+co*10,y:my+si*10};puxar(mx-co*6,my-si*6)} // os dois se puxam até o meio
   g.fase='puxa';return}
  // fase 'puxa': o inimigo desliza até o ponto de encontro enquanto o dash puxa o herói
  if(g.d&&e&&e.hp>0&&en.includes(e)){const dx=g.d.x-e.x,dy=g.d.y-e.y,d=Math.hypot(dx,dy),passo=VEL_GANCHO*dt;
   if(d<=passo){if(walk(g.d.x,g.d.y)){e.x=g.d.x;e.y=g.d.y}g.d=null}
   else{const nx=e.x+dx/d*passo,ny=e.y+dy/d*passo;if(walk(nx,ny)){e.x=nx;e.y=ny}else g.d=null}}
  else g.d=null;
  if(!p.dash&&!g.d)gancho=null}
 function desenharGancho(){
  const g=gancho;if(!g||g.lugar!==lugar())return;
  const e=g.e,x0=Math.round(p.x),y0=Math.round(p.y-8);
  const x1=Math.round(g.fase==='ida'?g.x:e?e.x:g.o?g.o.gx:x0),y1=Math.round(g.fase==='ida'?g.y:e?e.y-6:g.o?g.o.gy:y0);
  // a corda: arqueada enquanto voa (sobra corda), reta e esticada no puxão; dois tons alternados e sombra no chão
  const L=Math.hypot(x1-x0,y1-y0),sag=g.fase==='ida'?Math.min(10,L*.12):0,n=Math.max(2,Math.round(L/2));
  ctx.save();
  for(let i=0;i<=n;i++){const k=i/n,X=Math.round(x0+(x1-x0)*k),Y=Math.round(y0+(y1-y0)*k+Math.sin(Math.PI*k)*sag);R1(X,Y+1,1,1,'#00000066');R1(X,Y,1,1,Math.floor(i/2)%2?'#7d3f34':'#a8653f')}
  // o gancho de três pontas, girando no voo e apontado para o alvo no puxão
  const a=g.fase==='ida'?performance.now()/1000*18:Math.atan2(y1-y0,x1-x0);ctx.translate(x1,y1);ctx.rotate(a);
  ctx.fillStyle='#000';ctx.fillRect(-2,-1,7,3);ctx.fillRect(2,-4,3,9);
  ctx.fillStyle='#7c8098';ctx.fillRect(-1,0,5,1);ctx.fillStyle='#c4c8d6';ctx.fillRect(3,-3,1,7);
  ctx.fillStyle='#ffffff';ctx.fillRect(4,-3,1,1);ctx.fillRect(4,3,1,1);ctx.fillRect(5,0,1,1);
  ctx.restore()}

 /* ---- Armadilha de Caça: armadilhas no chão ---- */
 const armadilhas=[];
 const lugar=()=>(window.inTutorial?'u':window.inArena?'a':window.inTaverna?'t':window.inDungeon?'d':'i')+(window.MP&&MP.visitando||'');
 // a armadilha vai bem perto do herói (2026-11-05): no mouse até cfg.alcance px; mais longe, na beirada desse alcance
 function armar(w,cfg){const ALC_ARMADILHA=cfg.alcance;
  const d=Math.hypot(w.x-p.x,w.y-p.y);if(d>ALC_ARMADILHA){const k=ALC_ARMADILHA/d;w={x:p.x+(w.x-p.x)*k,y:p.y+(w.y-p.y)*k}}
  if(!walk(w.x,w.y))w={x:p.x,y:p.y};
  armadilhas.push({x:w.x,y:w.y,t:cfg.duracao,cfg,lugar:lugar(),nasceu:performance.now()/1000});vfx('armadilhaArma',{x:w.x,y:w.y,dur:.45});if(window.playGameSound)playGameSound('armadilhaArma')}
 const presos=[]; // inimigos com a armadilha fechada no pé (só o desenho; o atordoamento é o efeito stun)
 function tickArmadilhas(dt){
  if(!armadilhas.length)return;const aqui=lugar();
  for(let i=armadilhas.length;i--;){const a=armadilhas[i];a.t-=dt;
   if(a.t<=0||a.lugar!==aqui){armadilhas.splice(i,1);continue}
   const e=en.find(e=>e.hp>0&&!e.pvp&&!e.duelo&&Math.hypot(e.x-a.x,e.y-a.y)<a.cfg.raio);
   if(e){armadilhas.splice(i,1);vfx('armadilhaFecha',{x:e.x,y:e.y,dur:.5});ft(a.x,a.y-24,'Armadilha!',VERDE);if(window.playGameSound)playGameSound('armadilhaFecha');presos.push({e,ate:performance.now()/1000+a.cfg.preso,lugar:aqui});
    hurtE(e,a.cfg.pv(),a.cfg.magic,a.cfg.fx&&a.cfg.fx())}}}
 // desenho: junto dos itens no chão (desenharLoot é chamado pela ilha e pela DG com a câmera do mundo)
 function desenharArmadilhas(){
  if(!armadilhas.length)return;const aqui=lugar(),t=performance.now()/1000;
  for(const a of armadilhas){if(a.lugar!==aqui)continue;if(t-(a.nasceu||0)<.4)continue; // nos primeiros instantes quem desenha é a animação de armar
   desenharArmadilha(Math.round(a.x),Math.round(a.y),t,a.x)}}
 const R1=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)};
 function desenharArmadilha(x,y,t,sem){
  // estaca e corrente
  R1(x+7,y+1,1,3,'#000');R1(x+7,y+1,1,2,'#7d3f34');R1(x+5,y+1,1,1,'#7c8098');R1(x+6,y+2,1,1,'#3e3a52');
  // argola de aço achatada com os dentes para dentro
  for(let i=0;i<28;i++){const a=i/28*Math.PI*2,X=Math.round(x+Math.cos(a)*6),Y=Math.round(y+Math.sin(a)*2.6);R1(X,Y,1,1,Math.sin(a)<0?'#c4c8d6':'#7c8098')}
  for(let i=-4;i<=4;i+=2){R1(x+i,y-1,1,1,'#ffffff');R1(x+i+1,y+1,1,1,'#c4c8d6')}
  R1(x-1,y,3,1,'#d08a3a');R1(x-1,y,1,1,'#efc56a');
  // brilho correndo no aço (só o dono vê onde armou)
  const b=Math.floor((t*3+sem)%4*4)-6;if(b>=-6&&b<=6)R1(x+b,y-Math.round(Math.sqrt(Math.max(0,36-b*b))*2.6/6),1,1,'#ffffff')}
 function desenharPresos(){const agora=performance.now()/1000,aqui=lugar();
  for(let i=presos.length;i--;){const q=presos[i];if(agora>q.ate||q.lugar!==aqui||!q.e||q.e.hp<=0){presos.splice(i,1);continue}
   const x=Math.round(q.e.x),y=Math.round(q.e.y);
   // fechada no pé: as duas mandíbulas encostadas e a corrente esticada
   R1(x-6,y-1,13,3,'#000');R1(x-5,y,11,1,'#7c8098');R1(x-5,y-1,11,1,'#c4c8d6');for(let k=-4;k<=4;k+=2)R1(x+k,y+1,1,1,'#ffffff');
   R1(x+6,y+1,3,1,'#3e3a52');R1(x+9,y+2,1,1,'#7d3f34')}}
 // mira girando sobre quem está marcado como presa (Instinto de Caça)
 function desenharPresas(){if(typeof en==='undefined')return;const t=performance.now()/1000;
  for(const e of en){if(e.hp<=0||!e.st||!e.st.instinto||!(e.st.instinto.t>0))continue;const h=typeof wh=='function'?wh(e.img):20,cx=e.x,cy=e.y-h/2,r=9+Math.sin(t*6)*1,rot=t*1.6;
   for(let i=0;i<32;i++){const a=i/32*Math.PI*2+rot;if(Math.abs(Math.sin(2*(a-rot)))<.3)continue;R1(Math.round(cx+Math.cos(a)*r),Math.round(cy+Math.sin(a)*r*.8),1,1,'#cf4554')}
   for(let q=0;q<4;q++){const a=rot+q*Math.PI/2;for(let j=0;j<3;j++)R1(Math.round(cx+Math.cos(a)*(r+1+j)),Math.round(cy+Math.sin(a)*(r+1+j)*.8),1,1,j==2?'#ffffff':'#cf4554')}}} // piscada para o dono ver onde armou
 // a armadilha fica no chão, atrás dos personagens (camada do chão: render.js e dungeon.js); a corda e o gancho voam por cima
 if(!MOTOR)addEventListener('load',()=>{if(window.CAMADA_CHAO)CAMADA_CHAO.lista.push(desenharArmadilhas);
  const des0=window.desenharLoot;if(des0)window.desenharLoot=()=>{des0();if(!window.CAMADA_CHAO)desenharArmadilhas();desenharGancho()};
  if(window.desenharLoot){const d1=window.desenharLoot;window.desenharLoot=()=>{d1();desenharPresos();desenharPresas()}}
  const upd0=upd;upd=function(dt){upd0(dt);try{tickArmadilhas(dt);tickGancho(dt)}catch(e){console.error('Explorador:',e)}}});

 /* ---- habilidades (2026-11-05, pedido do usuário: "coloque tudo no mesmo lugar"): a classe Explorador, as 4 habilidades e a
    passiva ficam no projeto (PROJETO.dados: classes, skills, passives), editáveis na Engine como as outras classes. Aqui só
    a mecânica de cada efeito próprio, chamada por js/custom.js makeSkill (como o Curandeiro): s = a habilidade do projeto,
    ctx = {pv (dano), fx (efeitos da habilidade + os da arma), proprios (efeitos da habilidade), magic}.
      armadilha   alcance (px até onde arma), duracao (s que a armadilha fica), radius (px de quem pisa), dano e efeitos
      gancho      alcance (px), dano e efeitos de quem for fisgado
      bradoCaca   efeitos em você (Grito de Estratégia: efeito 'estrategia'); aliados: opção geral de toda habilidade
      marcaPresa  efeitos no inimigo marcado (Instinto de Caça: efeito 'instinto') */
 const num=(v,d)=>Number.isFinite(+v)&&v!==''&&v!=null?+v:d;
 // a caixa de informação (Dano, Alcance, Área, Efeito) sai sozinha dos campos da habilidade (js/custom.js efeitoCurto)
 function criar(s,ctx){const {pv,fx,proprios,magic}=ctx;
  switch(s.effect){
   case 'armadilha':{const cfg={alcance:num(s.alcance,36),duracao:num(s.duracao,30),raio:num(s.radius,12)||12,pv,fx,magic,preso:Math.max(0,...proprios.filter(e=>e&&e.type==='enraizado').map(e=>num(e.dur,3)),0)||1};
    return{f:Object.assign(w=>armar(w,cfg),{mira:1}),alcance:()=>cfg.alcance,
     d:()=>'Arma uma armadilha no chão, perto de você.'}}
   case 'gancho':{const cfg={id:s.id,alcance:num(s.alcance,140),pv,fx,magic};
    return{f:w=>lancarGancho(w,cfg),
     d:()=>'Lança um gancho com corda na direção do mouse e puxa.'}}
   case 'bradoCaca':
    // os aliados (opção geral "Também vale para os aliados", js/custom.js) ganham os mesmos efeitos
    return{f:()=>{applyFx(p,proprios.map(e=>({chance:100,...e,caster:p,self:true})));vfx('brado',{x:p.x,y:p.y,dur:.9});if(window.playGameSound)playGameSound('corneta')},
     d:()=>'Sopra a corneta de caça e fortalece você.'}
   case 'marcaPresa':
    return{f:Object.assign((w,t)=>{applyFx(t,proprios.map(e=>({chance:100,...e,caster:p})));vfx('mira',{x:t.x,y:t.y-(typeof wh=='function'?wh(t.img)/2:10),dur:.55});if(window.playGameSound)playGameSound('mira')},{tg:1}),
     d:()=>'Marca um inimigo como sua presa.'}
  }
  return null}
 window.EXPLORADOR={criar};
})();
