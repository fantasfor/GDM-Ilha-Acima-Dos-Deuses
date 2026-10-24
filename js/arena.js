/* ---------- Arena (PvP) ----------
   Entrada pelo Lanceiro da taverna (js/taverna.js): partidas 1x1 ou 2x2 montadas num lobby (arenas/{lider} no Firebase,
   convites pelo Correio) ou treino sozinho com o Boneco. Na partida cada equipe começa numa ponta, quem cai fica assistindo
   e ela acaba quando uma equipe perde todos ou em 5 minutos. Os inimigos viram alvos (en, com pvp:true): qualquer golpe,
   habilidade, projétil ou área funciona neles; o dano vai por salas/{sala}/pvp e quem é atingido aplica as próprias
   defesas (hurtP). Cair não custa ouro; vitórias, derrotas, abates e mortes ficam em p.pvp. */
(function(){
 // arena grande em relação ao herói (~25 px): 880×640 de areia+arquibancada interna
 const OX=24,OY=24,AW=880,AH=640,CXa=OX+AW/2,CYa=OY+AH/2,RX=AW/2-22,RY=AH/2-24;
 const PORTAO={x:CXa,y:CYa+RY+6},PILARES=[[-200,-130],[200,-130],[-200,130],[200,130]].map(([dx,dy])=>({x:CXa+dx,y:CYa+dy}));
 const dentro=(x,y,m=0)=>((x-CXa)/(RX-m))**2+((y-CYa)/(RY-m))**2<=1;
 const noPilar=(x,y,m=0)=>PILARES.some(q=>Math.hypot(x-q.x,(y-q.y)*1.3)<12+m); // as 4 colunas têm colisão (andar, tiros e visão)
 window.inArena=false;
 window.arenaWalk=(x,y)=>(dentro(x,y,4)&&!noPilar(x,y))||(Math.abs(x-PORTAO.x)<12&&y>=CYa+RY-8&&y<=PORTAO.y+4);
 window.arenaParede=(x,y)=>!dentro(x,y)||noPilar(x,y,-2);
 let ilhaPos=null,enGuardado=null,fundo=null,boneco=null;
 const feed=[]; // abates recentes (no alto da tela)
 p.pvp=p.pvp||{abates:0,mortes:0};

 /* ---- arte ---- */
 const R=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),w,h)};
 const hs=(a,b)=>{let h=(a*374761393+b*668265263)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967296};
 /* coliseu na escala do herói (visão 3/4): parede do pódio da altura de um personagem (só a de cima mostra a face),
    degraus de 14 px com a torcida sentada, muro externo e o túnel do portão embaixo. O fundo passa da arena (MG) para
    a câmera nunca ver vazio. */
 const MG=300,WH=26,DEGRAU=14,DEGRAUS=7;
 const faceH=s=>WH*Math.sqrt(Math.max(0,-s));
 const anel=(a,o)=>({x:CXa+Math.cos(a)*(RX+o),y:CYa+Math.sin(a)*(RY+o)});
 const inicioDegraus=s=>faceH(s)+5;
 function desenharFundo(){
  const W=AW+2*MG,H=AH+2*MG,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
  const img=g.createImageData(W,H),D=img.data,hex=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
  const C={face:hex('#6e655d'),faceL:hex('#857b72'),rejunte:hex('#4a423c'),sombra:hex('#3a332e'),topo:hex('#b1a89d'),topoE:hex('#7a7068'),
   assento:hex('#5a514a'),assento2:hex('#544b44'),beira:hex('#6e655d'),espelho:hex('#3a332e'),muro:hex('#8b8178'),muroE:hex('#5d554e'),fora:hex('#17120f')};
  const fim=DEGRAUS*DEGRAU;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
   const wx=x+OX-MG,wy=y+OY-MG,nx=(wx-CXa)/RX,ny=(wy-CYa)/RY,k=Math.hypot(nx,ny),i=(y*W+x)*4;let col;
   if(k<=1){const n=hs(wx>>1,wy>>1);col=k>.975?[118,104,86]:[214+(n*16|0),180+(n*14|0),122+(n*10|0)];if(k<=.975&&hs(wx,wy)>.985)col=[180,150,100]}
   else{const s=ny/k,o=(k-1)*Math.hypot(RX*nx/k,RY*ny/k),fh=faceH(s);
    if(o<fh){const lin=Math.floor(o/7),q=o%7;col=q<1||((wx+lin*8)%16+16)%16<1?C.rejunte:o<2?C.sombra:o>fh-3?C.faceL:C.face}
    else if(o<fh+5)col=o>fh+4?C.topoE:C.topo;
    else{const tt=o-fh-5,t=Math.floor(tt/DEGRAU),q=tt-t*DEGRAU;
     if(t<DEGRAUS)col=q<1?C.beira:q>=DEGRAU-4?C.espelho:t%2?C.assento2:C.assento;
     else if(tt<fim+12){const m=(tt-fim)<4&&(Math.floor(Math.atan2(ny,nx)*40)%2);col=tt-fim>10?C.muroE:m?C.muroE:C.muro}
     else{const n=hs(wx>>2,wy>>2);col=C.fora.map(v=>v+(n*6|0))}}}
   D[i]=col[0];D[i+1]=col[1];D[i+2]=col[2];D[i+3]=255}
  g.putImageData(img,0,0);
  const L=(x,y,w,h,cor)=>R(g,x-OX+MG,y-OY+MG,w,h,cor);
  // círculo central e marcas na areia
  g.save();g.translate(MG-OX,MG-OY);g.strokeStyle='#b8925c';g.lineWidth=2;g.beginPath();g.ellipse(CXa,CYa,46,32,0,0,7);g.stroke();g.beginPath();g.ellipse(CXa,CYa,6,4,0,0,7);g.stroke();g.restore();
  for(let i=0;i<40;i++){const a=hs(i,3)*6.28,r=hs(i,4)*.85;L(CXa+Math.cos(a)*RX*r,CYa+Math.sin(a)*RY*r,3,1,'#c79d63')}
  // túnel do portão (embaixo): passa pelo pódio e pelos primeiros degraus
  const gy=CYa+RY-2,gh=5+3*DEGRAU;L(CXa-18,gy,36,gh,'#5d554e');L(CXa-15,gy,30,gh,'#120e0b');L(CXa-15,gy,30,3,'#2a211a');
  for(let i=0;i<30;i+=5)L(CXa-15+i,gy+gh-10,2,10,'#6b5a48');L(CXa-15,gy+gh-11,30,2,'#8a7a66');
  // estandartes pendurados na parede de cima (vermelho à esquerda, azul à direita)
  for(const a of [-2.45,-2.0,-1.14,-.69]){const q=anel(a,0),fh=faceH(Math.sin(a)),cor=Math.cos(a)<0?'#8e2f2a':'#2a4a8e',x=Math.round(q.x),y=Math.round(q.y-fh);
   L(x-6,y+1,12,2,'#d9a441');L(x-5,y+3,10,fh-8,cor);L(x-2,y+8,4,4,'#d9a441');L(x-5,y+fh-5,3,2,cor);L(x+2,y+fh-5,3,2,cor)}
  return c;
 }
 function pilar(q,g=ctx){const x=Math.round(q.x),y=Math.round(q.y);R(g,x-11,y+1,22,4,'#0005');R(g,x-9,y-30,18,32,'#8b8178');R(g,x-9,y-30,4,32,'#a39a90');R(g,x+5,y-30,4,32,'#6e655d');R(g,x-11,y-34,22,5,'#b1a89d');R(g,x-11,y-2,22,4,'#6e655d');for(let k=0;k<4;k++)R(g,x-9,y-24+k*7,18,1,'#6e655d')}
 function tocha(x,y){R(ctx,x-1,y-10,2,10,'#4a3420');const f=Math.sin(time*12+x)>0?1:0;R(ctx,x-2,y-14-f,4,4,'#ff7a1a');R(ctx,x-1,y-13-f,2,2,'#ffd36b')}
 function desenharBoneco(b){const k=b.hit>0?Math.sin(time*60)*1.5:0;
  // desenhado em 2× e mostrado pela metade, do tamanho dos personagens
  ctx.save();ctx.translate(Math.round(b.x),Math.round(b.y));ctx.scale(.55,.55);const x=0,y=0;
  R(ctx,x-8,y+1,16,3,'#0005');R(ctx,x-1,y-20,2,21,'#6b4a2a');R(ctx,x-9+k,y-17,18,3,'#6b4a2a');
  R(ctx,x-6+k,y-22,12,14,'#d9b56a');R(ctx,x-6+k,y-22,12,2,'#e8cc8a');R(ctx,x-6+k,y-14,12,1,'#a8843f');R(ctx,x-4+k,y-30,8,8,'#d9b56a');R(ctx,x-2+k,y-27,1,1,'#3a2a14');R(ctx,x+1+k,y-27,1,1,'#3a2a14');R(ctx,x-1+k,y-17,3,3,'#b02a2a');ctx.restore()}
 /* ---- torcida: gente nas arquibancadas pulando e jogando tomates na areia (só visual) ---- */
 let torcedores=null;const tomates=[],manchas=[];let proxTomate=0;
 const CORES_ROUPA=['#8e2f2a','#2a4a8e','#d9a441','#4a7a3a','#7a4a8e','#b06030','#d9d0c7','#3a3a3a'],PELES=['#f2c28b','#d9a066','#a86a3c','#7a4a28'];
 const CABELOS=['#2a1a10','#4a2c14','#7a4a20','#c8a050','#1a1a1a','#8a8a8a'];
 /* torcedores sentados nos degraus, em fileiras: ~11 px de altura (sentado), na mesma escala do herói; os do lado de
    baixo estão de costas (só cabelo) */
 function montarTorcida(){torcedores=[];let n=0;
  for(let t=0;t<DEGRAUS;t++)for(let a=-Math.PI;a<Math.PI;){const s=Math.sin(a),o=inicioDegraus(s)+t*DEGRAU+DEGRAU-5,q=anel(a,o);
   a+=11/Math.hypot((RX+o)*s,(RY+o)*Math.cos(a));n++;
   if(hs(n,t)<.18)continue;if(s>.8&&Math.abs(q.x-CXa)<26&&t<4)continue;
   torcedores.push({x:Math.round(q.x),y:Math.round(q.y),costas:s>.35,cor:CORES_ROUPA[hs(n,t+1)*CORES_ROUPA.length|0],pele:PELES[hs(n+3,t)*PELES.length|0],cabelo:CABELOS[hs(n,t+5)*CABELOS.length|0],fase:hs(n,t+7)*6.28,anima:hs(n+9,t)})}
  torcedores.sort((a,b)=>a.y-b.y)}
 function torcida(g){if(!torcedores)montarTorcida();const t=time;
  for(const q of torcedores){const pula=q.anima>.35&&Math.sin(t*(4+q.anima*4)+q.fase)>.55,x=q.x,y=q.y-(pula?2:0);
   R(g,x-3,y-6,7,6,q.cor);R(g,x-3,y-6,7,1,shade(q.cor,1.25));R(g,x-2,y-10,5,4,q.costas?q.cabelo:q.pele);R(g,x-2,y-11,5,q.costas?2:1,q.cabelo);
   if(!q.costas){R(g,x-1,y-8,1,1,'#1a1010');R(g,x+1,y-8,1,1,'#1a1010')}
   if(pula){R(g,x-4,y-10,1,4,q.pele);R(g,x+4,y-10,1,4,q.pele)}}
  // tomates: saem de alguém da arquibancada e caem na areia, onde ficam manchas
  if(t>proxTomate&&torcedores.length&&tomates.length<14){proxTomate=t+.35+Math.random()*.6;const q=torcedores[Math.random()*torcedores.length|0],a=Math.random()*6.283,r=Math.random()*.85;
   tomates.push({x0:q.x,y0:q.y-10,x1:CXa+Math.cos(a)*RX*r,y1:CYa+Math.sin(a)*RY*r,t:0,dur:.8+Math.random()*.5})}
  for(let i=manchas.length;i--;){const m=manchas[i];m.t-=1/60;if(m.t<=0){manchas.splice(i,1);continue}g.globalAlpha=Math.min(1,m.t/2);R(g,m.x-2,m.y-1,5,3,'#b0201a');R(g,m.x-1,m.y-2,3,1,'#d03a2a');R(g,m.x+3,m.y,1,1,'#b0201a');R(g,m.x-4,m.y+1,1,1,'#b0201a');g.globalAlpha=1}
  for(let i=tomates.length;i--;){const o=tomates[i];o.t+=1/60;const k=Math.min(1,o.t/o.dur),x=o.x0+(o.x1-o.x0)*k,y=o.y0+(o.y1-o.y0)*k-Math.sin(Math.PI*k)*40;
   if(k>=1){tomates.splice(i,1);manchas.push({x:o.x1,y:o.y1,t:6});if(manchas.length>40)manchas.shift();continue}
   R(g,x-1,y-1,3,3,'#d02a1a');R(g,x-1,y-1,1,1,'#ff8a6a');R(g,x,y-2,1,1,'#3a7a2a')}}
 /* ---- campo de visão: escuro fora do raio e atrás das colunas; inimigos fora da visão somem (aqui e no minimapa) ---- */
 const VISAO=150,visaoArena=()=>Math.round(VISAO*(window.TEMPO?TEMPO.visao():1)); // à noite −10% (js/tempo.js)
 const cortaPilar=(x0,y0,x1,y1)=>PILARES.some(q=>{const dx=x1-x0,dy=(y1-y0)*1.3,fx=x0-q.x,fy=(y0-q.y)*1.3,a=dx*dx+dy*dy,b=2*(fx*dx+fy*dy),c=fx*fx+fy*fy-100,D=b*b-4*a*c;if(D<0||a===0)return false;const s=Math.sqrt(D),t1=(-b-s)/(2*a),t2=(-b+s)/(2*a);return(t1>0&&t1<1)||(t2>0&&t2<1)});
 // quem enxerga: você e os aliados vivos da sua equipe (a visão deles também vale para você)
 const olhos=()=>{const r=[{x:p.x,y:p.y}];if(partida&&window.MP&&MP.remotos)for(const o of MP.remotos.values()){const m=partida.membros[o.uid];if(!m||m.equipe!==partida.equipe||o.dead||partida.mortos.has(o.uid))continue;const q=window.ONLINE_NUVEM&&ONLINE_NUVEM.posicao?ONLINE_NUVEM.posicao(o.uid):null;if(q||o.x!=null)r.push({x:q?q.x:o.x,y:q?q.y:o.y})}return r};
 const ve=(x,y)=>{const R=visaoArena();return olhos().some(o=>Math.hypot(x-o.x,y-o.y)<=R&&!cortaPilar(o.x,o.y-6,x,y-6))};
 /* névoa no estilo LoL/Dota (render.js aplicarNevoa): máscara da visão em resolução reduzida, borda suave, colunas fazem sombra */
 const mascara=document.createElement('canvas');
 function nevoa(){
  const Q=window.modoDesempenho?.2:.35,W=Math.max(1,Math.ceil(cv.width*Q)),H=Math.max(1,Math.ceil(cv.height*Q));if(mascara.width!==W||mascara.height!==H){mascara.width=W;mascara.height=H}
  const g=mascara.getContext('2d'),k=S*Q;g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-over';g.filter='none';g.clearRect(0,0,W,H);
  g.setTransform(k,0,0,k,W/2-p.x*k,H/2-p.y*k);g.globalCompositeOperation='lighter';
  const VR=visaoArena(),N=180;
  // um polígono de visão por quem enxerga (você e aliados), cada um com a borda suave; somados formam a área visível
  for(const o of olhos()){const ox=o.x,oy=o.y-6;g.beginPath();
   for(let i=0;i<=N;i++){const a=i/N*Math.PI*2,dx=Math.cos(a),dy=Math.sin(a);let r=VR;
    for(const q of PILARES){const fx=ox-q.x,fy=(oy-q.y)*1.3,ddy=dy*1.3,A=dx*dx+ddy*ddy,B=2*(fx*dx+fy*ddy),C=fx*fx+fy*fy-100,D=B*B-4*A*C;if(D<0)continue;const tt=(-B-Math.sqrt(D))/(2*A);if(tt>0&&tt<r)r=tt+6}
    const x=ox+dx*r,y=oy+dy*r;if(i)g.lineTo(x,y);else g.moveTo(x,y)}
   g.closePath();const vis=g.createRadialGradient(ox,oy,Math.max(0,VR-40),ox,oy,VR);vis.addColorStop(0,'#fff');vis.addColorStop(1,'rgba(255,255,255,0)');
   g.fillStyle=vis;g.filter='blur('+(4*k)+'px)';g.fill();g.filter='none'}
  g.globalCompositeOperation='source-over';  if(window.aplicarNevoa)aplicarNevoa(mascara);
  ctx.setTransform(S,0,0,S,Math.round(cv.width/2-p.x*S),Math.round(cv.height/2-p.y*S))} /* ---- duelo com o Mestre de classe (taverna): NPC nível 10 com os atributos da classe; vencer libera a classe ---- */
 let duelo=null;
 function criarMestre(cls){
  const id='mestre_'+cls,c=(window.GAMEDATA&&GAMEDATA.classes||[]).find(x=>x.id===cls)||{},a=c.attrs||{F:5,A:5,I:5},kit=(CL[cls]&&CL[cls].kit)||[],magica=kit.some(r=>BASIC[r.id]&&BASIC[r.id].damageType==='magic'||ITEMS[r.id]&&ITEMS[r.id].damageType==='magic')||(+a.I||0)>(+a.F||0); // mágico pela arma do kit da classe (ou mais Inteligência que Força)
  MONSTER_TYPES[id]={name:'Mestre '+(CL[cls]?CL[cls].n:cls),stats:{F:+a.F||5,A:+a.A||5,I:+a.I||5},attributeStats:{},custom:true,ataqueDoNivel:true,bossType:'normal',sprite:HS[cls]&&HS[cls].d,sp:HS[cls],size:100,tags:[],drops:[],
   equipment:{stats:{},weaponRanges:[],weapon:magica?{damageType:'magic',basic:{rng:110,proj:'#b07bff'},effects:[]}:{damageType:'physical',basic:{rng:24},effects:[]}},skills:[],attackSpeed:CL[cls]&&CL[cls].attackSpeed||1};
  MB[id]={max:100,dmg:10,spd:58,xp:0,xpFixo:0,g:0,aggro:500,wu:.35,ac:1,base:'goblin'};
  const e={boss:false,img:HS[cls]&&HS[cls].d,sp:HS[cls],max:100,dmg:10,spd:58,xp:0,g:0,aggro:900,wu:.35,ac:1};
  configureMonster(e,id,10);
  Object.assign(e,{x:CXa+RX*.72,y:CYa,hx:CXa+RX*.72,hy:CYa,fx:-1,fy:0,hp:e.max,mp:e.maxMp,rt:0,duelo:cls,name:MONSTER_TYPES[id].name+' (Nv 10)',chasing:true,aw:0,cd:1});
  return e}
 function comecarDuelo(cls){if(!CL[cls])return;entrar({duelo:cls})}
 function venceuDuelo(e){const cls=e.duelo;duelo=null;
  p.classProgress=p.classProgress||{};const nova=!p.classProgress[cls];if(nova)p.classProgress[cls]={rank:1,xp:0};
  // revanche (classe já aprendida): só a vitória, sem trocar de classe
  resultado={titulo:'VITÓRIA!',cor:'#8fe388',sub:'Você venceu o '+MONSTER_TYPES[e.ty].name+'.'+(nova?' A classe '+CL[cls].n+' é sua!':' Revanche vencida!')};if(window.playGameSound)playGameSound('quest');
  setTimeout(()=>{resultado=null;sair(true);if(nova&&typeof setClass==='function'&&p.cls!==cls)setClass(cls);if(window.saveGame)saveGame()},3500)}
 /* ---- o Mestre usa as habilidades da classe que ele ensina (as mesmas do jogador: projétil, golpe, investida, aura,
    canal, cura, nova, meteoro, salto), com o dano do próprio ataque × % da habilidade e os efeitos dela ---- */
 const tiros=[],efeitosM=[]; // efeitosM: área e pulsos do Mestre Curandeiro
 const habsDoMestre=e=>e._habs||(e._habs=(typeof skillEntries=='function'?skillEntries(e.duelo):[]).map(s=>(GAMEDATA.skills||[]).find(r=>r.id===s.id)).filter(r=>r&&r.effect&&(r.category||'ability')==='ability'));
 const danoBase=e=>(e.weaponDamageBase??e.dmg??10)*(e.weaponDamageMultiplier||1);
 const magicaDe=(e,s)=>s.damageType==='magic'||(s.damageType!=='physical'&&!!e.attackMagic);
 function golpeDoMestre(e,a,s,mult=1){
  const mg=magicaDe(e,s),base=danoBase(e)*(+s.charPercent||100)/100*mult*(1+stSum(e,mg?'magup':'physup')/100);
  const fx=Array.isArray(s.effects)&&s.effects.length?resolveFx(s.effects.filter(f=>f.target!=='self'),base,monsterCtx(e)):null;
  hitTarget(a,mg?{physical:0,magic:base}:{physical:base,magic:0},mg,fx,null,e)}
 function usarHab(e,a,d,ve,s){
  const cor=s.color||s.c2||'#ffd84a',r=+s.radius||40,ang=Math.atan2(a.y-e.y,a.x-e.x);
  switch(s.effect){
   case 'projectile':if(!ve||d>220)return false;tiros.push({x:e.x,y:e.y-8,a,e,s,cor,vfx:s.vfx,vx:0,vy:0});return true;
   case 'golpe':if(d>40||!ve)return false;if(window.VFX)VFX.tocar('corte',{x:e.x,y:e.y-8,ang,raio:36,arco:(+s.arc||140)*Math.PI/180,cor});golpeDoMestre(e,a,s);return true;
   case 'nova':if(d>r)return false;ring(e.x,e.y,r,cor,.4);golpeDoMestre(e,a,s);return true;
   case 'investida':{if(!ve||d<60||d>(+s.alcance||120)+40)return false;const dd=d-16;for(let k=8;k<dd;k+=8)if(!arenaWalk(e.x+Math.cos(ang)*k,e.y+Math.sin(ang)*k))return false;
    ring(e.x,e.y,14,cor,.4);e.x+=Math.cos(ang)*dd;e.y+=Math.sin(ang)*dd;e.dest=null;e.path=[];e.pathKey='';
    if(window.VFX)VFX.tocar('impacto',{x:a.x,y:a.y-8});golpeDoMestre(e,a,s);e.cd=Math.max(e.cd,.6);return true}
   case 'aura':{if(e.st&&(s.effects||[]).some(f=>e.st[f.type]))return false;const fx=resolveFx((s.effects||[]).map(f=>({...f,target:'other'})),0,monsterCtx(e));if(fx)applyFx(e,fx);
    if(window.VFX)VFX.tocar('grito',{x:e.x,y:e.y-4,raio:r,cor});else ring(e.x,e.y,r,cor,.5);return true}
   case 'heal':if(e.hp>monsterMaxHp(e)*.6)return false;e.hp=Math.min(monsterMaxHp(e),e.hp+Math.max(10,danoBase(e)*(+s.charPercent||100)/100+(+s.heal||0)));ring(e.x,e.y,24,'#6f6',.5);return true;
   case 'meteor':if(!ve||d>200)return false;{const x=a.x,y=a.y;if(window.VFX)VFX.tocar('meteoro',{x,y,raio:r,cor,dur:.6,fim:()=>{if(Math.hypot(a.x-x,a.y-y)<r)golpeDoMestre(e,a,s)}});else golpeDoMestre(e,a,s)}return true;
   case 'blink':if(d>45)return false;for(const o of [0,.6,-.6,1.2,-1.2]){const x=e.x-Math.cos(ang+o)*85,y=e.y-Math.sin(ang+o)*85;if(arenaWalk(x,y)){ring(e.x,e.y,16,cor,.4);e.x=x;e.y=y;e.dest=null;e.path=[];e.pathKey='';ring(x,y,16,cor,.4);return true}}return false;
   // Curandeiro (as mesmas da classe): cura a si, área que fere quem está perto, aura de fortalecimento e pulsos de luz
   case 'curar':{if(e.hp>monsterMaxHp(e)*.7)return false;const v=Math.round(monsterMaxHp(e)*(+s.curaPct||3)/100);e.hp=Math.min(monsterMaxHp(e),e.hp+v);ft(e.x,e.y-30,'+'+v,'#6fe36f');if(window.VFX)VFX.tocar('grito',{x:e.x,y:e.y-4,raio:16,cor});return true}
   case 'zonaCura':if(d>(+s.radius||50)+30)return false;efeitosM.push({e,a,s,cor,tipo:'zona',t:+s.duracao||5,dur:+s.duracao||5,prox:0,r:+s.radius||50});return true;
   case 'auraContinua':{if(e.st&&e.st.presenca)return false;applyFx(e,[{type:'presenca',chance:100,pw:+s.danoPct||2,dur:12},{type:'regen',chance:100,pw:+s.regen||2,dur:12}]);if(window.VFX)VFX.tocar('grito',{x:e.x,y:e.y-4,raio:r,cor});return true}
   case 'pulso':{if(d>r+10)return false;for(let k=0;k<Math.max(1,+s.pulsos||3);k++)efeitosM.push({e,a,s,cor,tipo:'pulso',t:k,r});return true}   case 'canal':{const mouse=s.local==='mouse',tick=Math.max(.3,+s.intervalo||1),porVez=Math.max(1,+s.porGolpe||1),rImp=+s.raioImpacto||22;
    if(mouse?(!ve||d>200):d>r+10)return false;const cx=a.x,cy=a.y;let n=+s.totalGolpes>0?Math.ceil(+s.totalGolpes/porVez):Math.round((+s.duracao||5)/tick);
    e.canalM={t:+s.duracao||5,tick,prox:mouse?.3:0,n,anda:!s.parado,area:mouse?{x:cx,y:cy,r}:null,golpe:()=>{
     if(!mouse){ring(e.x,e.y,r,cor,.3);if(window.VFX)VFX.tocar('corte',{x:e.x,y:e.y-8,ang:Math.random()*6.28,raio:r,arco:6.28,cor});if(dist(e,a)<r+8)golpeDoMestre(e,a,s);return}
     for(let k=0;k<porVez;k++){const x=a.x+(Math.random()-.5)*24,y=a.y+(Math.random()-.5)*18;if(window.VFX)VFX.tocar('meteoro',{x,y,raio:rImp,cor,dur:.5,fim:()=>{if(Math.hypot(a.x-x,a.y-y)<rImp+6)golpeDoMestre(e,a,s)}});else if(Math.hypot(a.x-x,a.y-y)<rImp+6)golpeDoMestre(e,a,s)}}};return true}
  }
  return false}
 function iaMestre(e,a,d,ve,dt){
  e.habCd=e.habCd||{};for(const k in e.habCd)e.habCd[k]-=dt;e.habGlobal=(e.habGlobal??1.5)-dt;
  if(e.canalM){const c=e.canalM;c.t-=dt;c.prox-=dt;if(c.prox<=0){c.prox=c.tick;c.n--;c.golpe()}if(c.n<=0||c.t<=0)e.canalM=null;if(!c.anda){e.dest=null;return true}}
  if(e.habGlobal>0)return false;
  for(const s of habsDoMestre(e)){if((e.habCd[s.id]||0)>0)continue;if(usarHab(e,a,d,ve,s)){if(window.playGameSound&&window.somHabilidade)playGameSound(somHabilidade(s),.8);e.habCd[s.id]=Math.max(2,+s.cd||5);e.habGlobal=1.1;e.fx=a.x-e.x;e.fy=a.y-e.y;ft(e.x,e.y-32,s.name,'#f9c');return true}}
  return false}
 function moverEfeitosM(dt){
  for(let i=efeitosM.length;i--;){const f=efeitosM[i],e=f.e,a=f.a,mx=monsterMaxHp(e);if(e.hp<=0){efeitosM.splice(i,1);continue}
   if(f.tipo==='pulso'){f.t-=dt;if(f.t>0)continue;efeitosM.splice(i,1);if(window.VFX)VFX.tocar('grito',{x:e.x,y:e.y-4,raio:Math.round(f.r),cor:f.cor});
    e.hp=Math.min(mx,e.hp+mx*(+f.s.curaPct||3)/100);if(dist(e,a)<=f.r){hitTarget(a,{physical:0,magic:mx*(+f.s.danoVidaPct||20)/100},true,null,null,e);const ang=Math.atan2(a.y-e.y,a.x-e.x);for(let k=0;k<(+f.s.empurra||14);k++){const nx=a.x+Math.cos(ang),ny=a.y+Math.sin(ang);if(!arenaWalk(nx,ny))break;a.x=nx;a.y=ny}}continue}
   f.t-=dt;f.prox-=dt;f.x=e.x;f.y=e.y;if(f.prox<=0&&f.t>0){f.prox=1;e.hp=Math.min(mx,e.hp+mx*(+f.s.curaPct||1)/100);if(Math.hypot(a.x-e.x,a.y-e.y)<=f.r)hitTarget(a,{physical:0,magic:mx*(+f.s.danoVidaPct||20)/100},true,null,null,e)}
   if(f.t<=0)efeitosM.splice(i,1)}} function moverTiros(dt){
  for(let i=tiros.length;i--;){const q=tiros[i],dx=q.a.x-q.x,dy=q.a.y-8-q.y,dd=Math.hypot(dx,dy);q.vx=dx/(dd||1)*190;q.vy=dy/(dd||1)*190;
   if(dd<8||q.e.hp<=0){tiros.splice(i,1);if(q.e.hp>0){if(window.VFX)VFX.tocar(q.vfx==='gelo'?'explosaoGelo':'explosaoFogo',{x:q.x,y:q.y});golpeDoMestre(q.e,q.a,q.s)}continue}
   q.x+=q.vx*dt;q.y+=q.vy*dt}}
 function desenharTiros(){for(const f of efeitosM)if(f.tipo==='zona'&&f.x!=null){const k=Math.max(0,Math.min(1,f.t*2,(f.dur-f.t)*4));ctx.save();ctx.globalAlpha=.3*k;ctx.fillStyle=f.cor;ctx.beginPath();ctx.ellipse(f.x,f.y,f.r,f.r*.8,0,0,7);ctx.fill();ctx.globalAlpha=.85*k;ctx.strokeStyle=f.cor;ctx.beginPath();ctx.ellipse(f.x,f.y,f.r,f.r*.8,0,0,7);ctx.stroke();ctx.restore()}for(const q of tiros){if(window.VFX&&VFX.projetil(ctx,q))continue;R(ctx,q.x-3,q.y-3,6,6,q.cor);R(ctx,q.x-2,q.y-2,4,4,'#fff6d0')}
  for(const e of en)if(e.canalM&&e.canalM.area){const A=e.canalM.area;ctx.save();ctx.globalAlpha=.45;ctx.strokeStyle='#ff7a1a';ctx.beginPath();ctx.ellipse(A.x,A.y,A.r,A.r*.8,0,0,7);ctx.stroke();ctx.restore()}} /* fundo do painel da arena: o coliseu com a torcida, a câmera passando devagar */
 function animarFundoPainel(cv){if(cv._vivo)return;cv._vivo=true;const t0=performance.now();
  const passo=now=>{if(!cv.isConnected||!cv.closest('.open')){cv._vivo=false;return}
   const W=cv.clientWidth|0,H=cv.clientHeight|0;if(!W||!H){requestAnimationFrame(passo);return}if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H}
   if(!fundo)fundo=desenharFundo();const g=cv.getContext('2d'),Z=Math.max(2,Math.round(Math.min(W/AW,H/AH)*1.5)),k=(now-t0)/1000*.05,cx=CXa+Math.cos(k)*AW*.2,cy=CYa+Math.sin(k*1.3)*AH*.14;
   g.setTransform(1,0,0,1,0,0);g.fillStyle='#0b0806';g.fillRect(0,0,W,H);g.setTransform(Z,0,0,Z,Math.round(W/2-cx*Z),Math.round(H/2-cy*Z));g.imageSmoothingEnabled=false;
   g.drawImage(fundo,OX-MG,OY-MG);torcida(g);for(const q of PILARES)pilar(q,g);requestAnimationFrame(passo)};
  requestAnimationFrame(passo)}
 window.drawArena=function(){
  if(!fundo)fundo=desenharFundo();
  ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#0b0806';ctx.fillRect(0,0,cv.width,cv.height);
  ctx.setTransform(S,0,0,S,Math.round(cv.width/2-p.x*S),Math.round(cv.height/2-p.y*S));ctx.imageSmoothingEnabled=false;
  ctx.drawImage(fundo,OX-MG,OY-MG);torcida(ctx);if(window.CURANDEIRO)CURANDEIRO.desenhar();
  const L=[];
  for(const e of en)if(e.duelo&&e.hp>0&&window.desenharMonstro&&ve(e.x,e.y))L.push([e.y,()=>desenharMonstro(e)]); // fora da visão não aparece
  PILARES.forEach(q=>L.push([q.y,()=>pilar(q)]));
  if(boneco)L.push([boneco.y,()=>{if(p.tgt===boneco)circ(boneco.x,boneco.y,12,'#f55');desenharBoneco(boneco);const r=boneco.hp/boneco.max;R(ctx,boneco.x-14,boneco.y-22,28,1,'#4b121c');R(ctx,boneco.x-14,boneco.y-22,28*r,1,'#ed354e');ctx.font='5px monospace';ctx.textAlign='center';ctx.fillStyle='#000';ctx.fillText('Boneco de treino',boneco.x+.4,boneco.y-24.6);ctx.fillStyle='#ffe28a';ctx.fillText('Boneco de treino',boneco.x,boneco.y-25)}]);
  // alvo marcado nos outros jogadores
  for(const e of en)if(e.pvp&&e.uid&&p.tgt===e)L.push([e.y-.1,()=>circ(e.x,e.y,12,'#f55')]);
  if(p.dead<=0)L.push([p.y,()=>{const o=lunge(p,p.wt,p.aw,.25);ctx.globalAlpha=p.hit>0?.5:1;const f=face(p),an=anim(p,.25);dr.ent=p;dr(heroImg(f.d,an),p.x+o[0],p.y+o[1],f.fl,1,an);ctx.globalAlpha=1;
   const barW=28,t=1/S,bx=Math.round(p.x-barW/2),by=Math.round(p.y-25-ACIMA_HEROI()),hr=Math.max(0,Math.min(1,p.hp/mhp())),mr=Math.max(0,Math.min(1,p.mp/mmp()));
   R(ctx,bx-t,by-t,barW+2*t,3+3*t,'#3a3a3a');R(ctx,bx,by,barW,2,'#173d1c');ctx.fillStyle='#4cd04f';ctx.fillRect(bx,by,barW*hr,2);ctx.fillStyle='#10203a';ctx.fillRect(bx,by+2+t,barW,1);ctx.fillStyle='#3985ed';ctx.fillRect(bx,by+2+t,barW*mr,1)}]);
  if(p.dead>0)L.push([p.y,desenharHeroiMorto]);
  if(window.onlineDrawables)onlineDrawables(L);
  L.sort((a,b)=>a[0]-b[0]).forEach(l=>l[1]());
  for(const a of [-2.75,-.39,2.5,.64]){const q=anel(a,faceH(Math.sin(a))+3);tocha(Math.round(q.x),Math.round(q.y))} /* tochas em cima da parede do pódio */
  desenharTiros(); // golpes à distância do Mestre
  if(window.desenharConj)desenharConj();
  proj.forEach(q=>{R(ctx,q.x-3,q.y-3,6,6,q.c||'#ff7a1a');R(ctx,q.x-2,q.y-2,4,4,'#ffe28a')});
  fxs.forEach(f=>{const q=Math.max(0,Math.min(1,f.t/f.d));ctx.globalAlpha=1-q;circ(f.x,f.y,f.r*(.35+q),f.c);ctx.globalAlpha=1});
  if(window.desenharNoite){desenharNoite(.85,[{x:p.x,y:p.y-8,r:60,a:.5},...[-2.75,-.39,2.5,.64].map(a=>{const q=anel(a,faceH(Math.sin(a))+3);return{x:q.x,y:q.y-12,r:110}})]);ctx.setTransform(S,0,0,S,Math.round(cv.width/2-p.x*S),Math.round(cv.height/2-p.y*S));for(const a of [-2.75,-.39,2.5,.64]){const q=anel(a,faceH(Math.sin(a))+3);luzNoite(q.x,q.y-12,90)}}
  ctx.font='6px monospace';ctx.textAlign='center';
  fts.forEach(f=>{ctx.globalAlpha=Math.max(0,f.a);ctx.fillStyle='#000';ctx.fillText(f.t,Math.round(f.x)+.5,Math.round(f.y)+.5);ctx.fillStyle=corFt(f);ctx.fillText(f.t,Math.round(f.x),Math.round(f.y));if(f.crit)iconeCrit(f);ctx.globalAlpha=1});
  nevoa();
  ctx.setTransform(1,0,0,1,0,0);
  const v=ctx.createRadialGradient(cv.width/2,cv.height/2,Math.min(cv.width,cv.height)*.35,cv.width/2,cv.height/2,Math.max(cv.width,cv.height)*.75);
  v.addColorStop(0,'rgba(10,5,2,0)');v.addColorStop(1,'rgba(10,5,2,.5)');ctx.fillStyle=v;ctx.fillRect(0,0,cv.width,cv.height);
  hudArena();setasInimigos();
  minimapa();
 };
 /* 30 s sem ninguém causar nem levar dano na partida: setas na borda da tela apontando para cada inimigo vivo */
 function setasInimigos(){
  if(!partida||partida.acabou||agora()-ultimoDano<30000)return;
  const W=cv.width,H=cv.height,cx=W/2,cy=H/2,m=46,t=performance.now()/1000;
  for(const e of en){if(!e.pvp||!e.uid||e.hp<=0)continue;
   const dx=(e.x-p.x)*S,dy=(e.y-p.y)*S;if(Math.abs(dx)<cx-m&&Math.abs(dy)<cy-m)continue;
   const a=Math.atan2(dy,dx),k=Math.min((cx-m)/Math.abs(Math.cos(a)||1e-6),(cy-m)/Math.abs(Math.sin(a)||1e-6)),x=cx+Math.cos(a)*k,y=cy+Math.sin(a)*k,pul=1+.12*Math.sin(t*6);
   ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.scale(pul,pul);ctx.fillStyle='#f87171';ctx.strokeStyle='#0d0d0d';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(18,0);ctx.lineTo(-10,-12);ctx.lineTo(-4,0);ctx.lineTo(-10,12);ctx.closePath();ctx.stroke();ctx.fill();ctx.restore();
   ctx.font='bold 12px monospace';ctx.textAlign='center';ctx.fillStyle='#000';const txt=(e.name||'Inimigo')+' · '+Math.round(Math.hypot(e.x-p.x,e.y-p.y))+' px';ctx.fillText(txt,x-Math.cos(a)*30+1,y-Math.sin(a)*30+1);ctx.fillStyle='#ffd0d0';ctx.fillText(txt,x-Math.cos(a)*30,y-Math.sin(a)*30)}} function minimapa(){
  const mm=$('mm').getContext('2d'),SZ=160,k=(SZ-16)/AW,ox=8,oy=(SZ-AH*k)/2;
  mm.setTransform(1,0,0,1,0,0);mm.fillStyle='#0b0806';mm.fillRect(0,0,SZ,SZ);mm.imageSmoothingEnabled=false;if(fundo)mm.drawImage(fundo,ox,oy,AW*k,AH*k);
  if(window.onlineMinimap)onlineMinimap(mm,OX-ox/k,OY-oy/k,k,SZ);
  const at=(x,y)=>[ox+(x-OX)*k,oy+(y-OY)*k],[px,py]=at(p.x,p.y);mm.fillStyle='#000';mm.fillRect(px-3,py-3,6,6);mm.fillStyle='#fff';mm.fillRect(px-2,py-2,4,4);
 }
 /* na Engine (modo motor) só a prévia da cena (painel Projeto › Cenas): fundo, torcida e colunas; o resto do arquivo não roda */
 if(MODO.motor){window.CENA_PREVIA=window.CENA_PREVIA||{};CENA_PREVIA.arena=()=>{const f=fundo||(fundo=desenharFundo()),c=document.createElement('canvas');c.width=f.width;c.height=f.height;const g=c.getContext('2d');g.drawImage(f,0,0);g.translate(MG-OX,MG-OY);if(!torcedores)montarTorcida();for(const q of torcedores){R(g,q.x-3,q.y-6,7,6,q.cor);R(g,q.x-2,q.y-10,5,4,q.costas?q.cabelo:q.pele)}for(const q of PILARES)pilar(q,g);return{c,x:OX-MG,y:OY-MG,w:f.width,h:f.height,nome:'Arena'}};return}
 const aviso=(txt,cor='#ffd84a')=>{feed.unshift({txt,cor,t:5});if(feed.length>5)feed.pop()};
 const texto=(t,x,y,cor,fonte)=>{ctx.font=fonte;ctx.fillStyle='#000';ctx.fillText(t,x+1,y+1);ctx.fillStyle=cor;ctx.fillText(t,x,y)};
 /* placar no alto: equipes, vivos e tempo (partida) ou abates (treino) */
 function hudArena(){
  ctx.textAlign='center';const cx=cv.width/2;
  if(partida){
   const vivos=e=>Object.entries(partida.membros).filter(([id,m])=>m.equipe===e&&!partida.mortos.has(id)).length,resta=Math.max(0,DURACAO-(agora()-partida.inicio)),mm=Math.floor(resta/60000),ss=Math.floor(resta/1000)%60;
   texto('Equipe A  '+vivos('a')+' vivo(s)   ×   '+vivos('b')+' vivo(s)  Equipe B',cx,23,'#d9d0c7','bold 14px monospace');
   texto(mm+':'+String(ss).padStart(2,'0'),cx,42,resta<30000?'#f87171':'#d9d0c7','bold 16px monospace');
   texto('Você está na Equipe '+partida.equipe.toUpperCase(),cx,60,partida.equipe==='a'?'#ff9a8a':'#9ac0ff','12px monospace');
  }else texto('ARENA · TREINO · '+p.pvp.abates+' abates · '+p.pvp.mortes+' mortes',cx,23,'#d9d0c7','bold 13px monospace');
  ctx.font='12px monospace';feed.forEach((m,i)=>{ctx.globalAlpha=Math.min(1,m.t);texto(m.txt,cx,(partida?82:42)+i*16,m.cor,'12px monospace')});ctx.globalAlpha=1;
  if(resultado){ctx.fillStyle='#000a';ctx.fillRect(0,cv.height/2-50,cv.width,90);texto(resultado.titulo,cx,cv.height/2,resultado.cor,'bold 40px monospace');texto(resultado.sub,cx,cv.height/2+28,'#d9d0c7','14px monospace')}
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
 const erro=(e,oque)=>{if(window.MP&&MP.falhou)MP.falhou(e,oque);else ft(p.x,p.y-24,'Não foi possível '+oque+'.','#f87171')};

 /* ---- lobby: arenas/{lider} = {modo, estado:'espera'|'luta'|'fim', membros:{uid:{nome,equipe,nivel}}, sala, inicio, mortos, fim} ---- */
 function seguirLobby(lider){
  if(lobbyOff){lobbyOff();lobbyOff=null}
  lobbyLider=lider;if(!lider){lobby=null;return}
  const r=refL(lider),fn=s=>{const v=s.val();lobby=v;
   if(v&&!lobbyLider)lobbyLider=lider; // ranqueada: o lobby do anfitrião pode aparecer depois de começarmos a seguir
   lobbyRanqueado(v,lider);
   if(!v){if(partida&&!partida.acabou)terminar('empate');lobbyLider=null;if(painelAberto)painel();return}
   if(v.estado==='luta'&&!partida&&v.membros&&v.membros[eu()])iniciarPartida(v);
   if(partida){partida.mortos=new Set(Object.keys(v.mortos||{}));if(v.fim&&!partida.acabou)terminar(v.fim.vencedor)}
   if(painelAberto)painel()};
  r.on('value',fn);lobbyOff=()=>r.off('value',fn);
 }
 async function criarLobby(modo){
  if(!nuvemOk())return;
  try{await refL(eu()).set({modo,estado:'espera',membros:{[eu()]:{nome:NUVEM.nome(),equipe:'a',nivel:p.lvl}},t:TS()})}catch(e){erro(e,'criar a partida');return}
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
  let v;try{v=(await refL(de).once('value')).val()}catch(e){erro(e,'abrir a partida');return}
  if(!v||v.estado!=='espera'){ft(p.x,p.y-24,'Essa partida já começou ou acabou.','#f87171');return}
  const cap=v.modo||1,equipe=['a','b'].includes(c.equipe)?c.equipe:'b',naEquipe=Object.values(v.membros||{}).filter(m=>m.equipe===equipe).length;
  const outra=equipe==='a'?'b':'a',vagaOutra=Object.values(v.membros||{}).filter(m=>m.equipe===outra).length<cap;
  const final=naEquipe<cap?equipe:vagaOutra?outra:null;if(!final){ft(p.x,p.y-24,'A partida está cheia.','#f87171');return}
  try{await refL(de).child('membros/'+eu()).set({nome:NUVEM.nome(),equipe:final,nivel:p.lvl})}catch(e){erro(e,'a entrada na partida');return}
  seguirLobby(de);abrirPainel();
 }
 async function trocarModo(modo){
  if(lobbyLider!==eu()||!lobby)return;
  // quem não couber no modo novo sai do lobby
  const membros={...lobby.membros},cont={a:0,b:0};
  for(const [id,m] of Object.entries(membros)){if(cont[m.equipe]>=modo&&id!==eu())delete membros[id];else cont[m.equipe]++}
  await refL(eu()).update({modo,membros}).catch(e=>erro(e,'a troca de modo'));
 }
 async function comecar(){
  if(lobbyLider!==eu()||!lobby)return;
  const sala='arena:'+eu()+':'+Date.now().toString(36);
  await refL(eu()).update({estado:'luta',sala,inicio:TS(),mortos:null,fim:null}).catch(e=>erro(e,'o começo da partida'));
 }

 /* ---- ranqueada 1x1: busca de oponente; vitória +10 pontos, derrota −10 (mínimo 0), empate 0 ----
   ranqueada/fila/{uid} = {nome,nivel,pontos,t}. Todos que estão buscando veem a mesma fila e calculam o mesmo pareamento
   (quem entrou antes escolhe primeiro o oponente com pontos mais perto; a tolerância começa em 50 pontos e cresce 5 por
   segundo de espera). Do par, o uid menor é o anfitrião: cria arenas/{anfitrião} com convidado = o outro; o convidado se
   coloca em membros/{uid} e o anfitrião começa. Sem resposta em 8 s, o par se desfaz e os dois continuam na fila.
   ranqueada/ranking/{uid} = {nome,pontos} (tabela dos melhores no painel do Lanceiro). */
 const refR=c=>NUVEM.db.ref('ranqueada/'+c);
 const PONTOS_RANK=10;
 let busca=null,rankingTop=null,rankingT=0;
 const pontosRank=()=>Math.max(0,+(p.pvp&&p.pvp.pontos)||0);
 async function buscarRanqueada(){
  if(!nuvemOk()||busca||lobby||partida)return;
  busca={desde:agora(),fila:{},par:null};
  try{await refR('fila/'+eu()).set({nome:NUVEM.nome(),nivel:p.lvl,pontos:pontosRank(),t:TS()});const od=refR('fila/'+eu()).onDisconnect&&refR('fila/'+eu()).onDisconnect();if(od)od.remove()}
  catch(e){erro(e,'entrar na fila ranqueada');busca=null;return}
  const r=refR('fila'),fn=s=>{if(!busca)return;busca.fila=s.val()||{};parear()};r.on('value',fn);busca.off=()=>r.off('value',fn);
  busca.timer=setInterval(()=>{parear();if(painelAberto&&!lobby)painel()},1000);
  painel();
 }
 async function pararBusca(quieto){
  if(!busca)return;const b=busca;busca=null;clearInterval(b.timer);if(b.off)b.off();if(b.espera)clearTimeout(b.espera);
  await refR('fila/'+eu()).remove().catch(()=>{});
  if(!quieto)painel();
 }
 // pareamento igual em todos os clientes (mesma fila → mesmos pares)
 function pares(fila){
  const t0=agora(),lista=Object.entries(fila).filter(([,x])=>x&&typeof x==='object').map(([id,x])=>({id,pts:+x.pontos||0,t:+x.t||0})).sort((a,b)=>a.t-b.t||(a.id<b.id?-1:1)),usados=new Set(),out=new Map();
  for(const a of lista){if(usados.has(a.id))continue;let melhor=null,dif=1e9;
   for(const b of lista){if(b.id===a.id||usados.has(b.id))continue;const d=Math.abs(a.pts-b.pts);if(d<dif){dif=d;melhor=b}}
   if(!melhor)continue;
   const tol=50+Math.max(0,(t0-Math.max(a.t,melhor.t))/1000)*5;if(dif>tol)continue;
   usados.add(a.id);usados.add(melhor.id);out.set(a.id,melhor.id);out.set(melhor.id,a.id)}
  return out}
 function parear(){
  if(!busca||busca.par||lobby||partida)return;const outro=pares(busca.fila).get(eu());if(!outro)return;
  busca.par=outro;if(eu()<outro)criarRanqueada(outro);else{seguirLobby(outro);esperar(outro)}}
 function esperar(outro){if(busca.espera)clearTimeout(busca.espera);busca.espera=setTimeout(async()=>{if(!busca||busca.par!==outro||partida)return;
  if(lobbyLider===eu())await refL(eu()).remove().catch(()=>{});seguirLobby(null);if(busca)busca.par=null},8000)}
 async function criarRanqueada(outro){
  try{await refL(eu()).set({modo:1,ranqueada:true,convidado:outro,estado:'espera',membros:{[eu()]:{nome:NUVEM.nome(),equipe:'a',nivel:p.lvl,pontos:pontosRank()}},t:TS()})}
  catch(e){erro(e,'criar a partida ranqueada');if(busca)busca.par=null;return}
  seguirLobby(eu());esperar(outro)}
 // chamado a cada mudança do lobby: o convidado entra sozinho e o anfitrião começa quando os dois estão lá
 function lobbyRanqueado(v,lider){
  if(!v||!v.ranqueada||v.estado!=='espera')return;
  if(v.convidado===eu()&&!(v.membros&&v.membros[eu()]))refL(lider).child('membros/'+eu()).set({nome:NUVEM.nome(),equipe:'b',nivel:p.lvl,pontos:pontosRank()}).catch(()=>{});
  if(lider===eu()&&v.membros&&v.membros[v.convidado])comecar()}
 function publicarRanking(){if(nuvemOk())refR('ranking/'+eu()).set({nome:NUVEM.nome(),pontos:pontosRank()}).catch(()=>{})}
 function carregarRanking(){
  if(!nuvemOk()||Date.now()-rankingT<30000)return;rankingT=Date.now();
  refR('ranking').once('value').then(s=>{const v=s.val()||{};rankingTop=Object.entries(v).filter(([,x])=>x&&typeof x==='object').map(([id,x])=>({id,nome:String(x.nome||'?'),pontos:+x.pontos||0})).sort((a,b)=>b.pontos-a.pontos).slice(0,10);if(painelAberto&&!lobby)painel()}).catch(()=>{})}

 /* ---- partida ---- */
 function iniciarPartida(v){
  if(busca)pararBusca(true);
  ultimoDano=agora();partida={lider:lobbyLider,sala:v.sala,modo:v.modo,membros:v.membros,equipe:v.membros[eu()].equipe,inicio:v.inicio||agora(),mortos:new Set(),acabou:false,ranqueada:!!v.ranqueada};
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
  if(partida.ranqueada&&!emp){const d=ganhou?PONTOS_RANK:-PONTOS_RANK;p.pvp.pontos=Math.max(0,pontosRank()+d);resultado.sub+=' Ranqueada: '+(d>0?'+':'')+d+' pontos (agora '+p.pvp.pontos+').';publicarRanking()}
  if(window.playGameSound)playGameSound(ganhou?'quest':'defeat');if(window.saveGame)saveGame();
  setTimeout(()=>{const lider=partida&&partida.lider;resultado=null;partida=null;sair(true);if(lider===eu())setTimeout(()=>refL(lider).remove().catch(()=>{}),3000);seguirLobby(null)},4500);
 }
 function desistir(){
  if(!partida||partida.acabou)return;
  marcarMorto();const lider=partida.lider,outra=partida.equipe==='a'?'b':'a',rank=partida.ranqueada;
  if(rank){p.pvp.pontos=Math.max(0,pontosRank()-PONTOS_RANK);p.pvp.derrotas=(p.pvp.derrotas||0)+1;publicarRanking();aviso('Desistiu da ranqueada: −'+PONTOS_RANK+' pontos.','#f87171');if(window.saveGame)saveGame()} // desistir conta como derrota
  partida.acabou=true;partida=null;resultado=null;sair();seguirLobby(null);
  if(lider===eu())refL(lider).update({estado:'fim',fim:{vencedor:outra}}).catch(()=>{});
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
  // começa na lateral esquerda (o adversário/boneco fica à direita)
  const l=arenaWalk(CXa-RX*.72,CYa)?{x:CXa-RX*.72,y:CYa}:lugarLivre();p.x=l.x;p.y=l.y;p.fx=1;p.fy=0;p.dead=0;p.hp=mhp();p.mp=mmp();p.st=null;
  boneco=o.partida||o.duelo?null:{pvp:true,boneco:true,x:CXa+RX*.4,y:CYa,hp:5000,max:5000,hit:0,lvl:p.lvl,name:'Boneco de treino',img:null};if(boneco)en.push(boneco);
  if(o.duelo){duelo=o.duelo;en.push(criarMestre(o.duelo))} // duelo: você à esquerda, o Mestre à direita
  ft(p.x,p.y-30,o.duelo?'DUELO':o.partida?'PARTIDA':'TREINO','#ffd84a');ring(p.x,p.y,30,'#ffd84a',.6);atualizarBotao();
 }
 function sair(silencioso){
  if(!window.inArena)return;
  if(partida&&!partida.acabou){ft(p.x,p.y-24,'Só dá para sair no fim da partida (ou desistindo).','#f87171');return}
  window.inArena=false;clearMovementInput();p.tgt=null;
  en.length=0;if(enGuardado)en.push(...enGuardado);enGuardado=null;boneco=null;duelo=null;
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
  box.classList.add('dgModal','arenaModal');box.replaceChildren();const fcv=E('canvas','arn-fundo'),wrap=E('div','arn-wrap');box.append(fcv,wrap);animarFundoPainel(fcv); /* tela cheia: o coliseu passando ao fundo e tudo numa coluna no centro */
  const pv=p.pvp;marca=E('b','','Lanceiro Aldric · Arena');
  wrap.append(marca,E('p','','Partidas de equipe: 1 contra 1 ou 2 contra 2. Cada um usa as próprias defesas; quem cai fica assistindo. A partida acaba quando uma equipe perde todos ou em 5 minutos (ganha quem tiver mais gente viva, depois mais vida). Cair não custa ouro.'));
  const placar=E('div','lobPlacar');const jogos=(pv.vitorias||0)+(pv.derrotas||0)+(pv.empates||0);placar.innerHTML='<span>Pontos ranqueada <b>'+pontosRank()+'</b></span><span>Vitórias <b>'+(pv.vitorias||0)+'</b></span><span>Derrotas <b>'+(pv.derrotas||0)+'</b></span><span>Empates <b>'+(pv.empates||0)+'</b></span><span>Abates <b>'+(pv.abates||0)+'</b></span><span>Aproveitamento <b>'+(jogos?Math.round((pv.vitorias||0)/jogos*100)+'%':'—')+'</b></span>';wrap.append(placar);
  if(!nuvemOk()){wrap.append(E('p','dgm-muted','Sem conexão online não há partidas: treine sozinho com o Boneco de treino.'),B('Treinar com o boneco',()=>{fecharPainel();entrar()}),B('Até mais',fecharPainel));box.classList.add('open');return}
  if(!lobby||(busca&&lobby&&lobby.ranqueada&&lobby.estado==='espera')){
   carregarRanking();
   if(busca){ // procurando oponente na ranqueada
    const s=Math.floor((agora()-busca.desde)/1000),fila=Object.keys(busca.fila||{}).length;
    wrap.append(E('p','arn-busca','Procurando oponente na ranqueada… '+Math.floor(s/60)+':'+String(s%60).padStart(2,'0')),E('p','dgm-muted',busca.par?'Oponente encontrado! Preparando a partida…':'Na fila: '+fila+' jogador(es). Oponentes com pontos parecidos primeiro; a busca alarga com o tempo.'),B('Cancelar busca',()=>pararBusca()),B('Fechar (continua buscando)',fecharPainel));
   }else{
    const modos=E('div','arn-modos');const modo=(n,d,fn)=>{const b=E('button','arn-modo');b.type='button';b.append(E('b','',n),E('small','',d));b.onclick=fn;return b};
    modos.append(modo('Ranqueada 1 x 1','Busca um oponente com pontos parecidos. Vitória +'+PONTOS_RANK+', derrota −'+PONTOS_RANK+'.',buscarRanqueada),modo('1 x 1','Duelo: você contra um jogador.',()=>criarLobby(1)),modo('2 x 2','Equipes de dois: chame um amigo para o seu lado.',()=>criarLobby(2)));
    wrap.append(E('p','','Escolha o modo para montar a partida:'),modos,B('Treinar com o boneco',()=>{fecharPainel();entrar()}),B('Até mais',fecharPainel));
   }
   if(rankingTop&&rankingTop.length){const t=E('div','arn-rank');t.append(E('b','','Melhores da ranqueada'));rankingTop.forEach((x,i)=>{const l=E('div','arn-rankLinha'+(x.id===eu()?' voce':''));l.append(E('span','',(i+1)+'. '+x.nome),E('span','',x.pontos+' pts'));t.append(l)});wrap.append(t)}
   box.classList.add('open');return;
  }
  const souLider=lobbyLider===eu(),modo=lobby.modo||1,membros=Object.entries(lobby.membros||{});
  for(const [id] of membros)enviados.delete(id);
  if(souLider){const modos=E('div','lobModos');for(const m of [1,2]){const b=B(m+' x '+m,()=>trocarModo(m),m===modo?'on':'');modos.append(b)}wrap.append(modos)}
  // cartas: equipe A (P1, P2) × equipe B (P3, P4), desencontradas como no esboço
  const da=e=>membros.filter(([,m])=>m.equipe===e),cartas=[],slotsA=da('a'),slotsB=da('b');
  const espera=e=>[...enviados.entries()].filter(([,x])=>x.equipe===e);
  const carta=(lista,e,k,num,alto)=>{const m=lista[k];
   if(m){const [id,x]=m;return LOBBY.carta({rotulo:x.nome,sprite:id===eu()?heroImg('d'):window.spriteDeJogador&&spriteDeJogador(id),sub:(id===eu()?'Você · ':'')+'Nv '+(x.nivel||1),lider:id===lobbyLider,voce:id===eu(),alto})}
   const esp=espera(e)[k-lista.length];
   return LOBBY.carta({rotulo:'Jogador '+num,vazio:true,esperando:esp&&esp[1].nome,podeClicar:souLider,alto,onClick:()=>{convidarEquipe=convidarEquipe===e?null:e;painel()}})};
 const lado=(titulo,cor,lista)=>{const c=E('div','arn-time');c.style.borderColor=cor;const h=E('b','',titulo);h.style.color=cor;c.append(h,...lista);return c};
 const timeA=modo===2?[carta(slotsA,'a',0,1,false),carta(slotsA,'a',1,2,false)]:[carta(slotsA,'a',0,1,false)],timeB=modo===2?[carta(slotsB,'b',0,3,false),carta(slotsB,'b',1,4,false)]:[carta(slotsB,'b',0,2,false)];
 const times=E('div','arn-times');times.append(lado('Equipe A','#ff9a8a',timeA),E('div','arn-vs','VS'),lado('Equipe B','#9ac0ff',timeB));wrap.append(times); // um time de cada lado do coliseu
  if(souLider&&convidarEquipe){
   const conv=E('div','dgp-convidar');conv.append(E('span','dgm-label','Convidar para a Equipe '+convidarEquipe.toUpperCase()));
   const cand=window.MP&&MP.candidatosDg?MP.candidatosDg().filter(c=>!lobby.membros[c.id]).slice(0,10):[];
   if(!cand.length)conv.append(E('span','dgm-muted','Ninguém online para convidar agora.'));
   for(const c of cand){const li=E('div','dgm-cand');li.append(E('span','',c.nome+' · Nv '+c.nivel+(c.amigo?' · amigo':'')),E('small','',c.onde));
    const b=B(enviados.has(c.id)?'Enviado':'Convidar',async()=>{b.disabled=true;if(await MP.convidar(c.id,'arena',{modo,equipe:convidarEquipe}))enviados.set(c.id,{nome:c.nome,equipe:convidarEquipe});convidarEquipe=null;painel()},'dgm-convite');b.disabled=enviados.has(c.id);li.append(b);conv.append(li)}
   wrap.append(conv);
  }
  const cheio=slotsA.length>=modo&&slotsB.length>=modo;
  wrap.append(E('p','dgm-muted',souLider?(cheio?'Equipes completas: pode começar!':'Clique em + para convidar. O convite chega no Correio de quem você chamar.'):'Esperando o líder começar a partida.'));
  if(souLider){const go=B('Começar a partida',comecar,'dgm-enter');go.disabled=!cheio;wrap.append(go)}
  wrap.append(B(souLider?'Cancelar partida':'Sair do lobby',sairDoLobby),B('Fechar',fecharPainel));
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
  ftDano(e.x,e.y-22,total+(roll.crit?'!':''),null,roll.crit,mag/(total||1));
  if(e.boneco){e.hp-=total;if(e.hp<=0){e.hp=e.max;aviso('Boneco de treino derrubado!','#e7dcc4')}return}
  // perfuração e efeitos (atordoar, gelo, fogo…) vão junto: o alvo aplica em si; atordoado, ele perde a conjuração
  const efs=(fx||[]).filter(f=>f&&!f.self&&FX_INFO[f.type]).slice(0,4).map(f=>[f.type,Math.round(f.chance??100),+(+f.dur||0).toFixed(1),+(+f.pw||0).toFixed(2)]);
  ultimoDano=agora();enviar({tipo:'golpe',alvo:e.uid,d:fis,m:mag,pf:+bonus('physicalPen').toFixed(3),pm:+bonus('magicPen').toFixed(3),...(efs.length?{fx:efs}:{})});
 }
 function receber(f){
  if(!f||!window.inArena||!window.NUVEM)return;
  if(agora()-(f.t||0)>4000)return;
  if(f.tipo==='morte'){
   if(f.matou===eu()){p.pvp.abates++;aviso('Você derrotou '+(f.nomeAlvo||'um jogador')+'!','#8fe388');if(window.saveGame)saveGame()}
   else if(f.alvo!==eu())aviso((f.nomeDe||'Alguém')+' derrotou '+(f.nomeAlvo||'alguém'),'#f87171');
   return;
  }
  if(f.tipo==='golpe')ultimoDano=agora(); // qualquer golpe na partida zera o tempo sem combate (setas)
  if(f.tipo!=='golpe'||f.alvo!==eu()||f.de===eu()||p.dead>0||!partida||partida.acabou)return;
  // cair não custa ouro: o hurtP aplica as defesas; quem cai fica assistindo até o fim
  const ouro=p.gold;hurtP({physical:+f.d||0,magic:+f.m||0},(+f.m||0)>(+f.d||0),Array.isArray(f.fx)?f.fx.filter(a=>Array.isArray(a)&&FX_INFO[a[0]]).map(a=>({type:a[0],chance:+a[1],dur:+a[2]||1,pw:+a[3]||0,caster:p})):null,null,null,{f:+f.pf||0,m:+f.pm||0});
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
 let tJuiz=0,ultimoDano=0; // ultimoDano: hora do último golpe da partida (30 s sem golpes = setas para os inimigos)
 const upd0=upd;upd=function(dt){upd0(dt);if(window.inArena){moverTiros(dt);moverEfeitosM(dt)}else{tiros.length=0;efeitosM.length=0}
  for(const m of feed)m.t-=dt*.25;while(feed.length&&feed[feed.length-1].t<=0)feed.pop();
  if(!window.inArena)return;
  if(boneco){boneco.hit-=dt}
  const remotos=window.MP?MP.remotos:new Map(),vistos=new Set();
  for(const r of remotos.values()){
   if(!partida||!partida.membros[r.uid]||partida.membros[r.uid].equipe===partida.equipe)continue;
   vistos.add(r.uid);let e=en.find(o=>o.pvp&&o.uid===r.uid);
   if(!e){e={pvp:true,uid:r.uid,max:100,hit:0,stats:{F:0,A:0,I:0}};en.push(e)}
   // mesma posição interpolada em que o jogador é desenhado (o alvo e os golpes batem com o boneco na tela)
   const q=window.ONLINE_NUVEM&&ONLINE_NUVEM.posicao?ONLINE_NUVEM.posicao(r.uid):null;
   e.x=q?q.x:r.x;e.y=q?q.y:r.y;e.hp=r.dead||partida.mortos.has(r.uid)?0:Math.max(1,(+r.hp||0)*100);e.name=r.name;e.lvl=r.lvl;e.hit-=dt}
  for(let i=en.length;i--;){const e=en[i];if(e.pvp&&e.uid&&!vistos.has(e.uid)){if(p.tgt===e)p.tgt=null;en.splice(i,1)}}
  if(partida){if((tJuiz-=dt)<=0){tJuiz=.5;juiz()}
   // sem notícia do líder muito depois do fim do tempo, a partida acaba empatada para não prender ninguém
   if(!partida.acabou&&agora()-partida.inicio>DURACAO+20000)terminar('empate')}
  else if(p.y>CYa+RY+2&&Math.abs(p.x-PORTAO.x)<12)sair();
 };
 window.ARENA={entrar,sair,golpe,aceitarConvite,abrirPainel,desistir,
  sala:()=>partida&&partida.sala||null,emPartida:()=>!!partida,
  ve:(x,y)=>ve(x,y),aliado:id=>!!(partida&&partida.membros&&partida.membros[id]&&partida.membros[id].equipe===partida.equipe),
  duelo:comecarDuelo,venceuDuelo,emDuelo:()=>!!duelo,iaMestre,
  renascer(){if(duelo){const c=duelo;duelo=null;p.dead=0;p.hp=mhp();p.mp=mmp();sair(true);ft(p.x,p.y-24,'O Mestre '+(CL[c]?CL[c].n:'')+' venceu. Treine e tente de novo!','#f87171');return}const l=lugarLivre();p.x=l.x;p.y=l.y;p.hp=mhp();p.mp=mmp();p.st=null;ring(p.x,p.y,30,'#fff6b0',.7);if(window.playGameSound)playGameSound('revive')},
  jogadores:()=>window.ONLINE_NUVEM?[...ONLINE_NUVEM.outros.values()].filter(o=>o.sala&&o.sala.startsWith('arena')).length:0,
  clique:(w,mode)=>{if(partida)return false;if(Math.hypot(w.x-PORTAO.x,w.y-PORTAO.y)<16){if(dist(p,PORTAO)<30)sair();else setDest(PORTAO.x,PORTAO.y-10);return true}return false}};
})();
