/* ---------- Tutorial: Santuário Celeste (cena própria, só do personagem novo) ----------
   Uma ilha de mármore flutuando no céu. O Anjo Seraphiel (várias asas douradas) explica o que o jogador é
   (diálogo com retratos, js/dialogo.js) e o Mestre da classe ensina em etapas: andar até o círculo dourado, derrotar
   3 monstros, usar a habilidade do espaço Q e vencer um Elite. No fim o jogador chega ao nível 3, o portal do altar
   abre e leva ao acampamento da ilha. Pode pular. Progresso em p.tutorial {etapa, feito, v, premio}
   (salvo em ui.js saveGame). Cena isolada como a taverna: window.inTutorial, tutorialWalk(), drawTutorial().
   Na Engine: cena fixa "Tutorial" (prévia em CENA_PREVIA.tutorial) e Play › "Iniciar em" (?inicio=tutorial|normal). */
(function(){
 const OX=24,OY=24,TW=560,TH=440;
 const C={x:OX+280,y:OY+196},RX=250,RY=160,BEIRA=14;        // plataforma: elipse
 const AC={x:OX+280,y:OY+168};                                // mosaico do sol (onde os monstros aparecem)
 const ALTAR={x:OX+280,y:OY+78};                              // altar com o portal de saída
 const PORTAL={x:ALTAR.x,y:ALTAR.y+10};                       // onde o jogador entra no portal
 const ENTRADA={x:OX+280,y:OY+322};
 const ANJO={x:OX+334,y:OY+300},MESTRE_POS={x:OX+226,y:OY+304};
 const PONTO={x:OX+280,y:OY+246};
 const PILARES=[-155,-122,-58,-25,12,168,48,132].map((g,i)=>{const a=g*Math.PI/180;return{x:Math.round(C.x+Math.cos(a)*RX*.84),y:Math.round(C.y+Math.sin(a)*RY*.84),quebrado:i===1||i===4||i===7,alt:i===1?24:i===4?30:i===7?18:44}});
 const BRASEIROS=[{x:ALTAR.x-34,y:ALTAR.y+2},{x:ALTAR.x+34,y:ALTAR.y+2}];
 const elip=(x,y,rx=RX,ry=RY)=>((x-C.x)/rx)**2+((y-C.y)/ry)**2;
 const hsh=(a,b)=>{let h=(a*374761393+b*668265263)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967296};
 const R=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),w,h)};

 /* ---- arte do Anjo: túnica branca, cabelo e auréola dourados, 3 pares de asas douradas batendo devagar ---- */
 const ANJO_FR=8,anjoCache=[];
 function fazerAnjo(fase){
  const W=84,H=62,c=mkCanvas(W,H),g=c.getContext('2d'),cx=42,om=30,bat=Math.sin(fase);
  const P=(x,y,col)=>{x=Math.round(x);y=Math.round(y);if(x<0||y<0||x>=W||y>=H)return;g.fillStyle=col;g.fillRect(x,y,1,1)},Q=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h)};
  const COR=['#fff6c8','#ffe28a','#ffd84a','#e8b440','#c9932a','#a8701c'];
  // de cima (mais atrás) para baixo; cada asa é um leque de penas que vão do ombro para fora
  const ASAS=[{a:-1.02,len:31,n:9,abre:.78,bat:.16},{a:-.36,len:35,n:10,abre:.7,bat:.12},{a:.34,len:24,n:7,abre:.62,bat:.08}];
  for(const A of ASAS)for(const lado of [-1,1]){const base=A.a-bat*A.bat;
   for(let k=A.n-1;k>=0;k--){const f=k/(A.n-1),ang=base+(f-.5)*A.abre,len=A.len*(.66+.34*Math.sin(Math.PI*(.2+f*.65)));
    for(let r=2;r<len;r+=.5){const x=cx+lado*(3+Math.cos(ang)*r),y=om-4+Math.sin(ang)*r*.9,q=r/len;
     P(x,y,q>.86?COR[0]:q>.6?COR[1+(k%2)]:q>.3?COR[2+(k%2)]:COR[3+(k%2)]);P(x,y+1,q>.6?COR[3]:COR[4]);if(q<.45)P(x,y+2,COR[5])}}}
  // túnica (alarga para baixo; o Anjo flutua, sem pés)
  for(let y=om-2;y<om+24;y++){const k=(y-om+2)/26,hw=Math.round(4+k*5);for(let x=-hw;x<=hw;x++)P(cx+x,y,Math.abs(x)>=hw-1?'#cfc6b8':x<0?'#f6f1e8':'#e6dfd3')}
  for(let y=om+8;y<om+22;y++)if(y%3===0){P(cx-3,y,'#d6cdbf');P(cx+3,y,'#d6cdbf')}
  Q(cx-9,om+22,19,2,'#d9a441');Q(cx-8,om+21,17,1,'#ffe28a');Q(cx-5,om+6,11,2,'#d9a441');Q(cx,om-2,1,8,'#ffd84a');
  // braços e mãos juntas no peito
  Q(cx-7,om,3,8,'#efe9df');Q(cx+5,om,3,8,'#e2dacc');Q(cx-4,om+7,9,2,'#efe9df');Q(cx-1,om+6,3,2,'#f2c28b');
  // cabeça, cabelo dourado comprido, olhos
  Q(cx-3,om-10,7,8,'#f2c28b');Q(cx-3,om-3,7,1,'#dba476');
  Q(cx-4,om-11,9,3,'#ffd84a');Q(cx-4,om-9,2,10,'#e8b440');Q(cx+3,om-9,2,10,'#e8b440');Q(cx-3,om-11,7,1,'#fff3a0');
  P(cx-1,om-6,'#3a2a14');P(cx+2,om-6,'#3a2a14');
  const o=contornar(c,'#4a2e10');const g2=o.getContext('2d');
  // auréola por cima do contorno
  for(let a=0;a<Math.PI*2;a+=.1){const x=Math.round(cx+.5+Math.cos(a)*5),y=Math.round(om-16+Math.sin(a)*1.6);g2.fillStyle=Math.sin(a)>0?'#d9a441':'#fff3a0';g2.fillRect(x,y,1,1)}
  return o}
 const anjoQuadro=t=>{const i=((Math.floor((t||0)*6)%ANJO_FR)+ANJO_FR)%ANJO_FR;return anjoCache[i]||(anjoCache[i]=fazerAnjo(i/ANJO_FR*Math.PI*2))};
 window.ANJO={quadro:anjoQuadro,nome:'Seraphiel'};

 /* ---- fundo: plataforma de mármore com borda de grama, mosaico do sol, caminho dourado, altar e o penhasco de rocha embaixo ---- */
 const RGB={},rgb=h=>RGB[h]||(RGB[h]=[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]);
 const MARMORE=['#ebe4d8','#e2dacc','#e7e0d3','#dcd3c4'];
 function chao(x,y,e){
  if(e>.955){if(e>.99&&y>C.y)return'#3f6e30';const n=hsh(x,y);if(hsh(x*3,y*5)<.012)return n<.5?'#ffe28a':'#f6f1e8';return n<.2?'#7cbf55':n>.85?'#4a8238':'#5f9e48'}
  if(e>.9&&hsh(x>>2,y>>2)<.35)return hsh(x,y)<.5?'#9cb87a':'#86a866'; // musgo perto da grama
  const r=Math.hypot(x-AC.x,(y-AC.y)*1.35);
  if(r<6)return'#ffd84a';if(r<8)return'#a8701c';
  if(r>=38&&r<43)return r<39?'#ffe28a':r>=42?'#8a5a1a':'#d9a441';
  if(r<38){const a=Math.atan2((y-AC.y)*1.35,x-AC.x),s=Math.floor(a/(Math.PI/8)+16);if(s%2===0&&r>10)return(x+y)%7===0?'#e2c98e':'#efdcaa'}
  const dx=Math.abs(x-C.x);
  if(dx<14&&r>=43&&y>ALTAR.y){if(dx>=12)return dx>=13?'#8a5a1a':'#d9a441';const gy=y%12;return gy===0?'#c9bfb0':gy===1?'#faf6ef':'#f2ece2'}
  const tx=Math.floor(x/16),ty=Math.floor(y/16),gx=x-tx*16,gy=y-ty*16;
  if(gx===0||gy===0)return'#b8ad9e';if(gy===1)return'#f4efe6';
  const h=hsh(tx,ty);if(h>.62&&(gx+gy+tx*3)%11===0)return'#cfc5b6';if(h<.08&&gx===gy)return'#bdb2a3';
  return MARMORE[(h*4)|0]}
 function rocha(x,y,k){
  if(k<.05)return'#a89c8e';if(k<.09)return'#7f7366';
  if(hsh(x,y*7)<.004)return'#ffd84a';
  if(k<.35&&x%7===0&&hsh(x,1)<.35&&y%2===0)return'#4a7a32'; // raízes e trepadeiras penduradas
  const band=(((y+((hsh((x/9)|0,2)*4)|0))/5)|0)%3,esc=k>.55;
  return esc?['#564a3e','#4d4237','#433a30'][band]:['#7d6d5c','#6f604f','#625445'][band]}
 function desenharFundo(){
  const c=document.createElement('canvas');c.width=TW;c.height=TH;const g=c.getContext('2d'),im=g.createImageData(TW,TH),d=im.data;
  const put=(x,y,h)=>{const q=rgb(h),i=(y*TW+x)*4;d[i]=q[0];d[i+1]=q[1];d[i+2]=q[2];d[i+3]=255};
  for(let y=0;y<TH;y++)for(let x=0;x<TW;x++){const wx=x+OX,wy=y+OY,e=elip(wx,wy);
   if(e<1){put(x,y,chao(wx,wy,e));continue}
   const dx=(wx-C.x)/RX;if(Math.abs(dx)>=1)continue;const yb=C.y+RY*Math.sqrt(1-dx*dx);if(wy<yb)continue;
   const fim=yb+(16+82*Math.pow(1-dx*dx,1.4))*(.8+.35*hsh((wx/5)|0,9));if(wy>fim)continue;
   put(x,y,wy>fim-1.5?'#2e2620':rocha(wx,wy,(wy-yb)/(fim-yb)))}
  g.putImageData(im,0,0);
  // altar: três degraus de mármore com borda dourada
  const ax=ALTAR.x-OX,ay=ALTAR.y-OY;
  for(const [w,y0,h] of [[36,-4,8],[28,-12,8],[20,-20,8]]){R(g,ax-w,ay+y0,w*2,h-3,'#e9e2d6');R(g,ax-w,ay+y0+h-3,w*2,3,'#b8ad9e');R(g,ax-w,ay+y0,w*2,1,'#d9a441');R(g,ax-w,ay+y0+h-1,w*2,1,'#8a7e70')}
  // runas no degrau de cima
  for(let i=-3;i<=3;i++)R(g,ax+i*5-1,ay-17,2,2,'#d9a441');
  return c}
 let fundo=null;

 /* ---- céu: degradê, sol, nuvens em pixel art (camadas com paralaxe) e ilhotas ao longe ---- */
 const nuvemCache={};
 function nuvem(i,w){const k=i+':'+w;if(nuvemCache[k])return nuvemCache[k];
  const h=Math.round(w*.42),c=mkCanvas(w,h),g=c.getContext('2d'),bolas=[];
  for(let j=0;j<6;j++){const r=h*(.3+hsh(i,j)*.25);bolas.push({x:r+hsh(j,i+3)*(w-2*r),y:h-r-hsh(i+5,j)*h*.25,r})}
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){let dentro=false,sombra=false;for(const b of bolas){const q=Math.hypot(x-b.x,(y-b.y)*1.25);if(q<b.r){dentro=true;if(y>b.y+b.r*.35)sombra=true}}
   if(dentro){g.fillStyle=sombra?'#d8e4ee':y<h*.35?'#ffffff':'#f2f7fb';g.fillRect(x,y,1,1)}}
  return nuvemCache[k]=c}
 const NUVENS=[...Array(14)].map((_,i)=>({i,w:40+((hsh(i,1)*70)|0),x:hsh(i,2)*1400,y:hsh(i,3)*700-150,v:2+hsh(i,4)*5,par:i<6?.25:.55,baixo:i>=10}));
 function ceu(){
  const W=cv.width,H=cv.height,gr=ctx.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#6fb2e6');gr.addColorStop(1,'#d4ebf8');
  ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);
  const sg=ctx.createRadialGradient(W*.82,H*.1,4,W*.82,H*.1,H*.5);sg.addColorStop(0,'rgba(255,248,210,.9)');sg.addColorStop(.15,'rgba(255,240,180,.35)');sg.addColorStop(1,'rgba(255,240,180,0)');ctx.fillStyle=sg;ctx.fillRect(0,0,W,H);
  const VW=W/S,VH=H/S;ctx.setTransform(S,0,0,S,0,0);ctx.imageSmoothingEnabled=false;
  // ilhotas ao longe
  for(let i=0;i<4;i++){const x=((hsh(i,7)*900-p.x*.15+time*1.5)%(VW+120)+VW+120)%(VW+120)-60,y=VH*.25+hsh(i,8)*VH*.5-p.y*.08;R(ctx,x,y,22,4,'#9ab07a');R(ctx,x+2,y+4,18,3,'#8a7e70');R(ctx,x+6,y+7,10,3,'#6f604f');R(ctx,x+9,y+10,4,2,'#564a3e')}
  for(const n of NUVENS){if(n.baixo)continue;const im=nuvem(n.i,n.w),x=((n.x+time*n.v-p.x*n.par)%(VW+260)+VW+260)%(VW+260)-130,y=n.y*.6-p.y*n.par*.3+VH*.3;ctx.globalAlpha=n.par<.3?.65:.9;ctx.drawImage(im,Math.round(x),Math.round(y));ctx.globalAlpha=1}}
 /* nuvens passando por baixo da ilha (desenhadas depois do penhasco, na frente da rocha) */
 function nuvensBaixas(){for(const n of NUVENS){if(!n.baixo)continue;const im=nuvem(n.i,n.w+40),x=OX+((n.x*.5+time*n.v*1.4)%(TW+260))-130,y=C.y+RY+18+(n.i%3)*22;ctx.globalAlpha=.85;ctx.drawImage(im,Math.round(x),Math.round(y));ctx.globalAlpha=1}}

 /* ---- objetos da cena ---- */
 function pilar(q,g=ctx){const x=q.x,y=q.y,h=q.alt;
  g.fillStyle='rgba(40,30,20,.25)';g.fillRect(x-8,y-1,16,3);
  R(g,x-7,y-4,14,4,'#c9bfb0');R(g,x-7,y-4,14,1,'#e9e2d6');R(g,x-6,y-6,12,2,'#d8cfc2');
  for(let i=0;i<10;i++){const c=i===0||i===9?'#b8ad9e':i%3===0?'#c9bfb0':i<5?'#f2ece2':'#e2dacc';R(g,x-5+i,y-6-h,1,h,c)}
  if(q.quebrado){for(let i=0;i<10;i++){const k=Math.round(hsh(q.x,i)*4);R(g,x-5+i,y-6-h-k,1,k,i<5?'#f2ece2':'#e2dacc')}R(g,x+7,y-3,5,3,'#e2dacc');R(g,x+7,y-3,5,1,'#f2ece2');R(g,x-12,y-1,4,2,'#d8cfc2')}
  else{R(g,x-7,y-10-h,14,4,'#e9e2d6');R(g,x-7,y-7-h,14,1,'#d9a441');R(g,x-8,y-12-h,16,2,'#f2ece2');R(g,x-8,y-12-h,16,1,'#ffe28a')}}
 function braseiro(b){R(ctx,b.x-4,b.y-8,8,8,'#a8701c');R(ctx,b.x-5,b.y-9,10,2,'#d9a441');R(ctx,b.x-2,b.y-1,4,2,'#8a5a1a');if(window.desenharChama)desenharChama(ctx,b.x,b.y-9,6,10,.6)}
 let portalAberto=false;
 function portalSaida(){
  const x=ALTAR.x,y=ALTAR.y-20,k=.5+.5*Math.sin(time*3);
  ctx.save();ctx.globalCompositeOperation='screen';const gl=ctx.createRadialGradient(x,y,2,x,y,40);gl.addColorStop(0,'rgba(255,230,150,.7)');gl.addColorStop(1,'rgba(255,220,120,0)');ctx.fillStyle=gl;ctx.fillRect(x-40,y-40,80,80);ctx.restore();
  ctx.fillStyle='rgba(255,246,200,'+(.55+.25*k)+')';ctx.beginPath();ctx.ellipse(x,y,10,18,0,0,7);ctx.fill();
  for(let i=0;i<3;i++){ctx.strokeStyle=['#fff3a0','#ffd84a','#d9a441'][i];ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(x,y,12+i*1.5,20+i*1.5,0,0,7);ctx.stroke()}
  for(let i=0;i<8;i++){const a=time*1.6+i/8*Math.PI*2;R(ctx,x+Math.cos(a)*9,y+Math.sin(a)*16,1,1,'#ffffff')}}
 function circuloPonto(){const k=.5+.5*Math.sin(time*4);ctx.save();ctx.strokeStyle='#ffd84a';ctx.globalAlpha=.6+.4*k;ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(PONTO.x,PONTO.y,12,7,0,0,7);ctx.stroke();ctx.globalAlpha=.25;ctx.fillStyle='#ffd84a';ctx.fill();ctx.restore()}
 function brilhos(){for(let i=0;i<46;i++){const x=C.x+(hsh(i,1)-.5)*TW*.9,y=C.y+RY-((time*7+hsh(i,2)*380)%380),a=.3+.5*Math.abs(Math.sin(time*2+i));if(elip(x,y)>1.1)continue;ctx.globalAlpha=a;R(ctx,x,y,1,1,i%3?'#fff3a0':'#ffffff');ctx.globalAlpha=1}}
 function nome(txt,x,y,cor='#ffe28a'){ctx.font='5px monospace';ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.fillStyle='#000';ctx.fillText(txt,x+.4,y+.4);ctx.fillStyle=cor;ctx.fillText(txt,x,y)}
 function desenharAnjo(){
  const im=anjoQuadro(time),bob=Math.round(Math.sin(time*2)*1.5),x=Math.round(ANJO.x-im.width/2),y=Math.round(ANJO.y-im.height-4+bob);
  ctx.fillStyle='rgba(40,30,20,.22)';ctx.beginPath();ctx.ellipse(ANJO.x,ANJO.y,9,3,0,0,7);ctx.fill();
  ctx.save();ctx.globalCompositeOperation='screen';const g=ctx.createRadialGradient(ANJO.x,ANJO.y-26,2,ANJO.x,ANJO.y-26,46);g.addColorStop(0,'rgba(255,236,160,.55)');g.addColorStop(1,'rgba(255,220,120,0)');ctx.fillStyle=g;ctx.fillRect(ANJO.x-50,ANJO.y-76,100,100);ctx.restore();
  if(anjoSob)circ(ANJO.x,ANJO.y,12,'#ff5');
  ctx.drawImage(im,x,y);nome('Anjo '+ANJO_NOME,ANJO.x,y-1);
  if(!DIALOGO_ABERTO()){ctx.fillStyle='#ffd84a';ctx.font='bold 7px monospace';ctx.fillText('…',ANJO.x,y-7+Math.round(Math.sin(time*4)*1.5))}}
 const ANJO_NOME='Seraphiel',DIALOGO_ABERTO=()=>!!(window.DIALOGO&&DIALOGO.aberto());

 /* na Engine (modo motor) só a prévia da cena (painel Projeto › Cenas); o resto do arquivo não roda */
 if(MODO.motor){window.CENA_PREVIA=window.CENA_PREVIA||{};CENA_PREVIA.tutorial=()=>{const f=fundo||(fundo=desenharFundo()),c=document.createElement('canvas');c.width=TW;c.height=TH;const g=c.getContext('2d');
  const gr=g.createLinearGradient(0,0,0,TH);gr.addColorStop(0,'#6fb2e6');gr.addColorStop(1,'#d4ebf8');g.fillStyle=gr;g.fillRect(0,0,TW,TH);g.drawImage(f,0,0);g.translate(-OX,-OY);
  for(const q of PILARES.slice().sort((a,b)=>a.y-b.y))pilar(q,g);const a=anjoQuadro(0);g.drawImage(a,ANJO.x-a.width/2,ANJO.y-a.height-4);
  return{c,x:OX,y:OY,w:TW,h:TH,nome:'Tutorial'}};return}

 /* ---- colisão ---- */
 window.tutorialWalk=(x,y)=>{
  if(elip(x,y,RX-BEIRA,RY-BEIRA)>=1)return false;
  if(Math.abs(x-ALTAR.x)<38&&y<ALTAR.y+5&&y>ALTAR.y-26)return false;   // degraus do altar
  for(const q of PILARES)if(Math.hypot(x-q.x,(y-q.y)*1.4)<8)return false;
  for(const b of BRASEIROS)if(Math.hypot(x-b.x,y-b.y)<6)return false;
  if(Math.hypot(x-ANJO.x,(y-ANJO.y)*1.4)<8)return false;
  if(mestre&&Math.hypot(x-mestre.x,(y-mestre.y)*1.4)<6)return false;
  return true};

 /* ---- etapas ---- */
 const ETAPAS=[
  {id:'intro',texto:'Ouça o Anjo.'},
  {id:'andar',texto:'Clique no chão (ou use WASD) para andar até o círculo dourado.'},
  {id:'atacar',texto:'Derrote os 3 monstros: clique em um deles para atacar.'},
  {id:'habilidade',texto:'Use a sua habilidade: aperte Q perto de um monstro (ou clique no ícone Q).'},
  {id:'elite',texto:'Cuidado! Um Elite apareceu: mais forte e brilhando em dourado. Derrote-o!'},
  {id:'portal',texto:'O portal do altar se abriu. Entre nele para descer à ilha.'}];
 let mestre=null,alvos=[],habUsada=false,enGuardado=null,anjoSob=false;
 const q=new URLSearchParams(location.search);
 window.TUTORIAL={ativo:()=>!!(p.tutorial&&!p.tutorial.feito),entrar,sair,renascer,pular:()=>pularTutorial()};
 const nomeHeroi=()=>{try{return window.NUVEM&&NUVEM.nome&&NUVEM.nome()||'Você'}catch(e){return'Você'}};
 const nomeMestre=()=>'Mestre '+((CL[p.cls]||{}).n||'');
 const retratoAnjo=t=>anjoQuadro(t);
 const retratoMestre=()=>{const c=CL[p.cls]||{};return c.sprite||(HS[c.base||p.cls]||HS.war).s};
 const tipoFraco=()=>['sl','rato','bat','lobo'].find(id=>MONSTER_TYPES[id])||Object.keys(MONSTER_TYPES).find(id=>(MONSTER_TYPES[id].bossType||'normal')==='normal');
 function criarMonstro(x,y,elite){
  const e=spawnAt(x,y,tipoFraco(),1);
  // fraco de propósito: pouca vida e pouco dano; dá XP de tutorial
  e.max=elite?90:26;e.hp=e.max;e.dmg=elite?4:2;e.weaponDamageMultiplier=(e.weaponDamageMultiplier||1)*.25;e.xp=elite?60:20;e.g=elite?15:3;e.tutorial=true;e.roamRadius=18;
  if(elite&&window.makeElite){makeElite(e);e.max=90;e.hp=90;e.xp=60}
  en.push(e);if(window.VFX)VFX.tocar('grito',{x:e.x,y:e.y-4,raio:14,cor:'#ffd84a'});return e}
 function soltar(n,elite){for(const e of alvos)if(e.hp>0)e.gone=1;alvos=[];for(let i=0;i<n;i++){const a=(i/n)*Math.PI*2-Math.PI/2,r=n>1?22:0;alvos.push(criarMonstro(AC.x+Math.cos(a)*r,AC.y+Math.sin(a)*r*.7,elite))}}
 const etapa=()=>p.tutorial?ETAPAS[p.tutorial.etapa]:null;
 function falas(lista,direita,aoFim){if(!window.DIALOGO){if(aoFim)aoFim();return}DIALOGO.abrir(lista,{direita,aoFim})}
 function introducao(){
  if(window.playGameSound)playGameSound('anjo');
  const A='Anjo '+ANJO_NOME,H=nomeHeroi();
  falas([
   {lado:'direita',nome:A,texto:'Desperte, pequena centelha. Não tenha medo: você está no Santuário Celeste.'},
   {lado:'direita',nome:A,texto:'Você é uma criação dos deuses, feita para manter a ilha magicamente equilibrada.'},
   {lado:'direita',nome:A,texto:'Estas são as Ilhas Acima dos Deuses. Enquanto elas flutuam, o equilíbrio mágico do universo se mantém.'},
   {lado:'direita',nome:A,texto:'São estas ilhas que mantêm o universo ativo. Se elas caírem, tudo se apaga.'},
   {lado:'esquerda',nome:H,texto:'Eu? Mas como vou proteger algo tão grande?'},
   {lado:'direita',nome:A,texto:'Você não estará sozinho. O seu Mestre vai ensinar o básico antes de você descer à ilha. Vá até ele.'}
  ],retratoAnjo,()=>ir(1))}
 function ir(i,retomando){p.tutorial.etapa=i;const id=ETAPAS[i].id;habUsada=false;
  if(id==='intro')introducao();
  if(id==='andar'&&!retomando)falas([{lado:'direita',nome:nomeMestre(),texto:'Muito bem, recruta! Primeiro, ande até o círculo dourado: clique no chão ou use WASD.'}],retratoMestre);
  if(id==='atacar'){soltar(3,false);if(!retomando)falas([{lado:'direita',nome:nomeMestre(),texto:'Monstros! Clique em um deles para atacar com a sua arma. Derrote os três.'}],retratoMestre)}
  if(id==='habilidade'){soltar(2,false);if(!retomando)falas([{lado:'direita',nome:nomeMestre(),texto:'Agora a sua habilidade: chegue perto de um monstro e aperte Q (ou clique no ícone Q da barra).'}],retratoMestre)}
  if(id==='elite'){soltar(1,true);if(!retomando)falas([{lado:'direita',nome:nomeMestre(),texto:'Cuidado! Um Elite: mais forte, brilha em dourado e deixa mais tesouros. Derrote-o!'}],retratoMestre)}
  if(id==='portal'){
   if(!p.tutorial.premio){p.tutorial.premio=true; // garante o nível 3
    while(p.lvl<3&&p.lvl<(+CALC.maxLevel||10)){const falta=Math.max(1,CALC.xpPerLevel*p.lvl-p.xp);gainPlayerXp(falta)}
    p.gold+=25;ft(p.x,p.y-30,'Tutorial concluído!','#ffd84a');if(window.playGameSound)playGameSound('quest')}
   const abrir=()=>{portalAberto=true;if(window.playGameSound)playGameSound('anjo');ring(ALTAR.x,ALTAR.y-20,40,'#ffd84a',.8)};
   if(retomando)abrir();
   else falas([
    {lado:'direita',nome:nomeMestre(),texto:'Excelente! Você está pronto para a ilha. Me procure na taverna quando quiser aprender mais.'},
    {lado:'direita',nome:'Anjo '+ANJO_NOME,texto:'Abri o portal do altar. Desça, guardião, e mantenha a ilha em equilíbrio.',retrato:retratoAnjo}
   ],retratoMestre,abrir)}
  if(window.saveGame)saveGame()}
 function concluir(){p.tutorial.feito=true;sair();ft(p.x,p.y-30,'Bem-vindo à Ilha Acima dos Deuses','#ffd84a');ring(p.x,p.y,30,'#ffd84a',.7);if(window.playGameSound)playGameSound('revive');if(window.saveGame)saveGame()}
 window.pularTutorial=()=>{if(!p.tutorial||p.tutorial.feito)return;if(window.DIALOGO)DIALOGO.fechar();while(p.lvl<3&&p.lvl<(+CALC.maxLevel||10))gainPlayerXp(Math.max(1,CALC.xpPerLevel*p.lvl-p.xp));p.tutorial.premio=true;concluir();ft(p.x,p.y-44,'Tutorial pulado','#ccc')};

 /* ---- entrar e sair da cena ---- */
 function entrar(){
  if(window.inTutorial)return;
  if(window.inTaverna&&window.sairTaverna)sairTaverna(true);
  if(window.inArena&&window.ARENA)ARENA.sair(true);
  enGuardado=en.splice(0,en.length);alvos=[];portalAberto=false;
  if(window.clearMovementInput)clearMovementInput();window.inTutorial=true;document.body.classList.add('emTutorial');
  p.x=ENTRADA.x;p.y=ENTRADA.y;p.fx=0;p.fy=-1;p.dest=null;p.path=[];p.tgt=null;proj.length=0;
  mestre={x:MESTRE_POS.x,y:MESTRE_POS.y,fx:1,fy:0,nm:nomeMestre()};
  ring(p.x,p.y,30,'#ffd84a',.6);
  ir(p.tutorial.etapa||0,(p.tutorial.etapa||0)>0)}
 function sair(){
  if(!window.inTutorial)return;
  window.inTutorial=false;document.body.classList.remove('emTutorial');if(window.clearMovementInput)clearMovementInput();
  if(window.DIALOGO)DIALOGO.fechar();
  en.length=0;if(enGuardado)en.push(...enGuardado);enGuardado=null;alvos=[];mestre=null;portalAberto=false;proj.length=0;
  p.x=CX;p.y=CY+34;p.dest=null;p.path=[];p.tgt=null}
 function renascer(){p.x=ENTRADA.x;p.y=ENTRADA.y;p.dest=null;p.path=[];p.tgt=null;p.hp=mhp();p.mp=mmp();ring(p.x,p.y,30,'#fff6b0',.7);if(window.playGameSound)playGameSound('revive')}
 // no tutorial o progresso guarda o acampamento (ao voltar, o tutorial recomeça na etapa salva)
 const pos0=window.posicaoParaSalvar;window.posicaoParaSalvar=()=>window.inTutorial?{x:CX,y:CY+34}:pos0?pos0():p;
 // taverna e arena só depois do tutorial
 const bloqueio=()=>{ft(p.x,p.y-30,'Termine ou pule o tutorial primeiro.','#f87171')};
 if(window.entrarTaverna){const t0=entrarTaverna;window.entrarTaverna=function(){if(window.inTutorial)return bloqueio();return t0.apply(this,arguments)}}
 if(window.ARENA&&ARENA.entrar){const a0=ARENA.entrar;ARENA.entrar=function(){if(window.inTutorial)return bloqueio();return a0.apply(this,arguments)}}

 /* ---- cliques: o Anjo repete a explicação; o Mestre repete a etapa ---- */
 const anjoEm=w=>Math.hypot(w.x-ANJO.x,w.y-(ANJO.y-22))<20;
 window.tutorialClick=w=>{
  if(DIALOGO_ABERTO())return true;
  if(anjoEm(w)){if(dist(p,ANJO)<46)falas([{lado:'direita',nome:'Anjo '+ANJO_NOME,texto:'As Ilhas Acima dos Deuses mantêm o universo ativo. Proteja o equilíbrio da sua ilha, guardião.'}],retratoAnjo);else setDest(ANJO.x-14,ANJO.y+10);return true}
  if(mestre&&Math.hypot(w.x-mestre.x,w.y-(mestre.y-10))<13){const et=etapa();if(dist(p,mestre)<40){if(et)falas([{lado:'direita',nome:nomeMestre(),texto:et.texto}],retratoMestre)}else setDest(mestre.x+12,mestre.y+8);return true}
  return false};

 // a habilidade conta quando sai (lancar)
 const lanc0=lancar;lancar=function(s){const t0=s.t,r=lanc0.apply(this,arguments);if(s.t>t0)habUsada=true;return r};
 const upd0=upd;upd=function(dt){upd0(dt);
  if(!p.tutorial&&window.personagemNovo&&!(window.cameraMenu&&cameraMenu.ativo))p.tutorial={etapa:0,feito:false,v:2};
  if(p.tutorial&&!p.tutorial.feito&&!p.tutorial.v){p.tutorial.etapa=0;p.tutorial.v=2} // tutorial antigo (no acampamento): recomeça no santuário
  if(!TUTORIAL.ativo()){if(window.inTutorial)sair();return}
  if(!window.inTutorial){if(window.cameraMenu&&cameraMenu.ativo||window.inDungeon||window.inArena||window.inTaverna||window.MP&&MP.visitando)return;entrar();return}
  if(mestre){mestre.fx=p.x-mestre.x;mestre.fy=p.y-mestre.y;mestre.nm=nomeMestre()}
  if(DIALOGO_ABERTO())return;
  const et=etapa();if(!et)return;
  const mortos=()=>alvos.length&&alvos.every(e=>e.hp<=0||!en.includes(e));
  if(et.id==='andar'&&Math.hypot(p.x-PONTO.x,p.y-PONTO.y)<14)ir(2);
  else if((et.id==='atacar'||et.id==='elite')&&mortos())ir(p.tutorial.etapa+1);
  else if(et.id==='habilidade'&&mortos()){if(habUsada)ir(4);else soltar(1,false)} // ainda não usou: vem outro
  else if(et.id==='portal'&&portalAberto&&Math.hypot(p.x-PORTAL.x,p.y-PORTAL.y)<16)concluir()};
 // passar o mouse no Anjo
 addEventListener('mousemove',e=>{if(!window.inTutorial)return;const r=cv.getBoundingClientRect(),w={x:p.x+(e.clientX-r.left-cv.width/2)/S,y:p.y+(e.clientY-r.top-cv.height/2)/S};anjoSob=anjoEm(w)});

 /* ---- desenho da cena ---- */
 window.drawTutorial=function(){
  if(!fundo)fundo=desenharFundo();
  ceu();
  ctx.setTransform(S,0,0,S,Math.round(cv.width/2-p.x*S),Math.round(cv.height/2-p.y*S));ctx.imageSmoothingEnabled=false;
  ctx.drawImage(fundo,OX,OY);nuvensBaixas();
  if(window.desenharTelegrafos)desenharTelegrafos();if(window.CURANDEIRO)CURANDEIRO.desenhar();
  const et=etapa();if(et&&et.id==='andar')circuloPonto();
  const L=[];
  PILARES.forEach(q=>L.push([q.y,()=>pilar(q)]));
  BRASEIROS.forEach(b=>L.push([b.y,()=>braseiro(b)]));
  if(portalAberto)L.push([ALTAR.y-6,portalSaida]);
  L.push([ANJO.y,desenharAnjo]);
  if(mestre)L.push([mestre.y,()=>{const f=face(mestre),c=CL[p.cls]||{},spr=c.sprite||(HS[c.base||p.cls]||HS.war)[f.d];dr(spr,mestre.x,mestre.y,f.fl,1,anim(mestre,0));nome(mestre.nm,mestre.x,mestre.y-22-ACIMA_HEROI());
   if(!DIALOGO_ABERTO()){ctx.fillStyle='#ffd84a';ctx.font='bold 7px monospace';ctx.fillText('!',mestre.x,mestre.y-29+Math.round(Math.sin(time*4)*1.5))}}]);
  for(const e of en)if(e.hp>0&&window.desenharMonstro)L.push([e.y,()=>desenharMonstro(e)]);
  if(p.dead<=0)L.push([p.y,()=>{const o=lunge(p,p.wt,p.aw,.25);ctx.globalAlpha=p.hit>0?.5:1;const f=face(p),an=anim(p,.25);dr.ent=p;dr(heroImg(f.d,an),p.x+o[0],p.y+o[1],f.fl,1,an);ctx.globalAlpha=1;
   const barW=28,t=1/S,bx=Math.round(p.x-barW/2),by=Math.round(p.y-25-ACIMA_HEROI()),hr=Math.max(0,Math.min(1,p.hp/mhp())),mr=Math.max(0,Math.min(1,p.mp/mmp()));
   R(ctx,bx-t,by-t,barW+2*t,3+3*t,'#3a3a3a');R(ctx,bx,by,barW,2,'#173d1c');ctx.fillStyle='#4cd04f';ctx.fillRect(bx,by,barW*hr,2);ctx.fillStyle='#10203a';ctx.fillRect(bx,by+2+t,barW,1);ctx.fillStyle='#3985ed';ctx.fillRect(bx,by+2+t,barW*mr,1)}]);
  if(p.dead>0)L.push([p.y,desenharHeroiMorto]);
  L.sort((a,b)=>a[0]-b[0]).forEach(l=>l[1]());
  brilhos();
  if(window.desenharLoot)desenharLoot();
  if(window.desenharConj)desenharConj();
  proj.forEach(q=>{if(q.seta&&window.desenharSeta&&desenharSeta(q))return;if(q.vfx&&window.VFX&&VFX.projetil(ctx,q))return;R(ctx,q.x-3,q.y-3,6,6,q.c||'#ff7a1a');R(ctx,q.x-2,q.y-2,4,4,'#ffe28a')});
  fxs.forEach(f=>{const k=Math.max(0,Math.min(1,f.t/f.d));ctx.globalAlpha=1-k;circ(f.x,f.y,f.r*(.35+k),f.c);ctx.globalAlpha=1});
  ctx.font='6px monospace';ctx.textAlign='center';
  fts.forEach(f=>{ctx.globalAlpha=Math.max(0,f.a);ctx.fillStyle='#000';ctx.fillText(f.t,Math.round(f.x)+.5,Math.round(f.y)+.5);ctx.fillStyle=corFt(f);ctx.fillText(f.t,Math.round(f.x),Math.round(f.y));if(f.crit)iconeCrit(f);ctx.globalAlpha=1});
  ctx.setTransform(1,0,0,1,0,0);
  if(p.dead>0&&p.dead<1e8){ctx.fillStyle='rgba(0,0,0,'+Math.min(.45,(time-(p.morreuEm??time))*.4)+')';ctx.fillRect(0,0,cv.width,cv.height)}
  minimapa()};
 function minimapa(){
  const mm=$('mm').getContext('2d'),SZ=160,k=(SZ-16)/TW,ox=8,oy=(SZ-TH*k)/2;
  mm.setTransform(1,0,0,1,0,0);mm.fillStyle='#8fc4ec';mm.fillRect(0,0,SZ,SZ);mm.imageSmoothingEnabled=false;if(fundo)mm.drawImage(fundo,ox,oy,TW*k,TH*k);
  const at=(x,y)=>[ox+(x-OX)*k,oy+(y-OY)*k];
  for(const e of en)if(e.hp>0){const [x,y]=at(e.x,e.y);mm.fillStyle=e.elite?'#f0a52e':'#ed354e';mm.fillRect(x-2,y-2,4,4)}
  {const [x,y]=at(ANJO.x,ANJO.y);mm.fillStyle='#ffd84a';mm.fillRect(x-2,y-2,4,4)}
  if(portalAberto){const [x,y]=at(ALTAR.x,ALTAR.y-6);mm.fillStyle='#fff3a0';mm.fillRect(x-3,y-3,6,6)}
  const [px,py]=at(p.x,p.y);mm.fillStyle='#000';mm.fillRect(px-3,py-3,6,6);mm.fillStyle='#fff';mm.fillRect(px-2,py-2,4,4)}

 /* objetivo do tutorial no quadro de objetivo (canto de cima) com o botão de pular */
 const hud0=hud;hud=function(){hud0();
  if(!window.inTutorial||!TUTORIAL.ativo())return;const et=etapa();if(!et)return;
  const qd=$('quest'),passos=ETAPAS.length-1,n=Math.max(1,Math.min(passos,p.tutorial.etapa));
  const vivos=alvos.filter(e=>e.hp>0&&en.includes(e)).length,extra=et.id==='atacar'||et.id==='elite'||et.id==='habilidade'?' ('+(alvos.length-vivos)+'/'+alvos.length+')':'';
  const html='<b>TUTORIAL · '+n+'/'+passos+'</b>'+et.texto+extra+'<button type="button" class="tutPular">Pular tutorial</button>';
  if(qd.dataset.tut!==html){qd.dataset.tut=html;qd.classList.remove('done');qd.innerHTML=html;const b=qd.querySelector('.tutPular');if(b)b.onclick=e=>{e.stopPropagation();pularTutorial()}}};
 // Play da Engine: ?inicio=normal pula o tutorial do personagem novo; ?cena=tutorial começa nele
 if(MODO.teste){
  if(q.get('inicio')==='normal'&&q.has('novo'))p.tutorial={etapa:0,feito:true,v:2};
  if(q.get('cena')==='tutorial')p.tutorial={etapa:0,feito:false,v:2};
 }
})();
