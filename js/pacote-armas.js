/* ---------- Pacote de armas ----------
   Uma arma de cada tipo. "arte" é o desenho detalhado que vira o ícone da mochila (girado 45°); "mao" é o desenho
   empunhado, pequeno e na escala do herói (cada pixel = 1 pixel do herói; ponta para cima; "pega" = altura da mão,
   de 0 no topo a 1 embaixo). "ataque" escolhe a pose e o golpe (js/sprites.js POSES_ARMA).
   A Engine cria os itens arma_* no projeto (engine/js/project.js criarArmas); o Lanceiro da taverna usa a lança. */
(function(root){
 const COR={o:'#16121c',w:'#f4f7fb',s:'#c9d2dc',S:'#8892a0',m:'#5a6270',g:'#e8b84a',G:'#a8742a',b:'#9a6436',B:'#5e3a1c',l:'#c08a52',
  k:'#6b4226',K:'#3e2614',r:'#c8323e',R:'#7c1c26',u:'#4a7ae0',U:'#26407e',c:'#7cf0ff',C:'#2a9ac8',p:'#b07bff',P:'#5c2fa8',t:'#eadfc4',y:'#fff3a8'};
 /* desenha numa grade (w×h internos), contorna sozinho com 'o' e devolve os dados de pixel art do jogo */
 function grade(w,h,desenho){
  const G=Array.from({length:h+2},()=>Array(w+2).fill('.'));
  const P=(x,y,c)=>{if(x>=0&&y>=0&&x<w&&y<h)G[y+1][x+1]=c},R=(x,y,ww,hh,c)=>{for(let j=0;j<hh;j++)for(let i=0;i<ww;i++)P(x+i,y+j,c)};
  desenho(R,P);
  for(let y=0;y<h+2;y++)for(let x=0;x<w+2;x++)if(G[y][x]==='.'&&[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>{const v=G[y+b]&&G[y+b][x+a];return v&&v!=='.'&&v!=='O'}))G[y][x]='O';
  return dados(G.map(r=>r.join('').replace(/O/g,'o')));
 }
 function dados(rows){
  const usados=[...new Set(rows.join('').replace(/\./g,''))],palette=usados.map(c=>COR[c]),h=rows.length,w=rows[0].length;
  return{w,h,palette,pixels:rows.map(r=>[...r].map(c=>c==='.'?'-':usados.indexOf(c).toString(36)).join('')).join('')};
 }
 /* ícone 16×16: o desenho empunhado girado 45° (ponta para cima e à direita), encolhido só se não couber */
 function icone(d,girar=true){
  const N=16,k=girar?Math.min(1,21/((d.w+d.h)*.7071)):Math.min(1,14/Math.max(d.w,d.h)),a=girar?Math.PI/4:0,co=Math.cos(a),si=Math.sin(a),cx=d.w/2,cy=d.h/2;
  const px=(x,y)=>{if(x<0||y<0||x>=d.w||y>=d.h)return '-';return d.pixels[y*d.w+x]};let s='';
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const u=(x+.5-N/2)/k,v=(y+.5-N/2)/k,sx=Math.floor(u*co+v*si+cx),sy=Math.floor(-u*si+v*co+cy);s+=px(sx,sy)}
  return{w:N,h:N,palette:d.palette.slice(),pixels:s};
 }
 const ARMAS={
  espada:{nome:'Espada',tag:'espada',ataque:'corte',duasMaos:false,tipo:'physical',dano:[6,9],rng:22,stats:{},
   arte:grade(5,17,(R,P)=>{P(2,0,'w');R(1,1,1,10,'w');R(2,1,1,10,'s');R(3,1,1,10,'S');R(0,11,5,1,'g');P(4,11,'G');R(2,12,1,3,'k');P(2,13,'K');R(1,15,3,1,'g');P(3,15,'G');P(2,16,'G')})},
  espada_grande:{nome:'Espada Grande',tag:'espada_grande',ataque:'pesado',duasMaos:true,tipo:'physical',dano:[11,16],rng:26,stats:{attackSpeed:-12},
   arte:grade(9,25,(R,P)=>{P(4,0,'s');R(3,1,3,1,'s');P(3,1,'w');R(2,2,1,15,'w');R(3,2,3,15,'s');R(6,2,1,15,'S');R(4,4,1,11,'m');R(0,17,9,1,'g');R(0,18,9,1,'G');P(0,17,'G');P(8,17,'G');R(4,19,1,4,'k');P(4,20,'K');P(4,22,'K');R(3,23,3,1,'g');P(5,23,'G');P(4,24,'G')})},
  adaga:{nome:'Adaga',tag:'adaga',ataque:'estocada',duasMaos:false,tipo:'physical',dano:[3,5],rng:18,stats:{attackSpeed:25,critChance:10},
   arte:grade(3,9,(R,P)=>{P(1,0,'w');R(0,1,1,4,'w');R(1,1,1,4,'s');R(2,1,1,4,'S');R(0,5,3,1,'g');R(1,6,1,2,'k');P(1,8,'g')})},
  arco:{nome:'Arco',tag:'arco',ataque:'arco',duasMaos:true,tipo:'physical',dano:[5,8],rng:140,proj:'#eadfc4',stats:{},
   arte:grade(6,21,(R,P)=>{const x=r=>Math.round(3-3*Math.sin(Math.PI*r/20));for(let r=0;r<21;r++){const a=x(r);P(a,r,'b');P(a+1,r,r<3||r>17?'B':'l')}R(0,9,2,3,'k');for(let r=1;r<20;r++)P(5,r,'t')})},
  besta:{nome:'Besta',tag:'besta',ataque:'besta',duasMaos:true,tipo:'physical',dano:[9,13],rng:160,proj:'#c9d2dc',stats:{attackSpeed:-22},
   arte:grade(11,14,(R,P)=>{R(5,0,1,7,'s');P(5,0,'w');R(1,2,9,1,'S');P(0,3,'S');P(10,3,'S');P(5,2,'m');[[1,4],[2,5],[3,5],[4,6],[6,6],[7,5],[8,5],[9,4]].forEach(([x,y])=>P(x,y,'t'));R(4,6,3,6,'b');R(4,6,1,6,'l');P(6,10,'m');R(3,12,5,2,'B')})},
  cajado:{nome:'Cajado',tag:'cajado',ataque:'vertical',duasMaos:true,tipo:'magic',dano:[5,8],rng:120,proj:'#7cf0ff',stats:{mp:30,magicDmg:4},
   arte:grade(8,26,(R,P)=>{R(3,0,2,1,'c');R(2,1,4,4,'c');P(2,1,'w');P(3,2,'y');R(4,3,2,2,'C');R(1,3,1,3,'g');R(6,3,1,3,'g');P(1,2,'G');P(6,2,'G');R(2,5,4,1,'g');R(3,6,2,19,'b');R(4,6,1,19,'B');R(3,13,2,1,'g');R(3,25,2,1,'m')})},
  vara:{nome:'Vara',tag:'vara',ataque:'varinha',duasMaos:false,tipo:'magic',dano:[3,5],rng:110,proj:'#b07bff',stats:{castSpeed:15},
   arte:grade(3,13,(R,P)=>{P(1,0,'p');R(0,1,3,2,'p');P(0,1,'w');P(2,2,'P');R(0,3,3,1,'g');R(1,4,1,8,'l');P(1,8,'b');P(1,12,'B')})},
  manopla:{nome:'Manopla',tag:'manopla',ataque:'soco',duasMaos:false,tipo:'physical',dano:[4,7],rng:16,stats:{attackSpeed:20},
   arte:grade(7,8,(R,P)=>{R(1,0,5,2,'s');R(1,0,5,1,'w');P(2,1,'S');P(4,1,'S');R(0,2,7,3,'s');R(0,2,1,3,'S');R(5,3,2,2,'S');R(1,5,5,2,'m');R(1,5,5,1,'g');P(5,6,'K')}),girarIcone:false},
  machado:{nome:'Machado',tag:'machado_2mao',ataque:'pesado',duasMaos:true,tipo:'physical',dano:[12,17],rng:24,stats:{},
   arte:grade(12,22,(R,P)=>{R(5,0,2,22,'b');R(6,0,1,22,'B');R(5,0,2,1,'m');R(3,2,2,6,'s');R(1,3,2,4,'s');P(1,3,'w');P(1,4,'w');P(1,5,'w');P(1,6,'w');R(7,2,2,6,'S');R(9,3,2,4,'S');P(10,3,'w');P(10,4,'w');P(10,5,'w');P(10,6,'w');R(5,15,2,5,'k');P(5,16,'K');P(5,18,'K');R(5,21,2,1,'m')})},
  martelo:{nome:'Martelo',tag:'martelo_2mao',ataque:'pesado',duasMaos:true,tipo:'physical',dano:[13,18],rng:24,stats:{attackSpeed:-18},
   arte:grade(10,22,(R,P)=>{R(1,1,8,5,'m');R(1,1,8,1,'S');R(0,2,1,3,'S');R(9,2,1,3,'S');R(4,1,2,5,'g');P(4,1,'y');R(4,6,2,15,'b');R(5,6,1,15,'B');R(4,15,2,5,'k');P(4,16,'K');P(4,18,'K');R(4,21,2,1,'m')})},
  lanca:{nome:'Lança',tag:'lanca',ataque:'estocada',duasMaos:true,tipo:'physical',dano:[8,12],rng:34,stats:{},
   arte:grade(5,30,(R,P)=>{P(2,0,'w');R(1,1,3,1,'s');P(1,1,'w');R(0,2,5,2,'s');R(0,2,2,2,'w');P(4,2,'S');P(4,3,'S');R(1,4,3,1,'s');P(3,4,'S');P(2,5,'S');R(2,6,1,2,'m');P(1,7,'r');P(3,7,'r');P(1,8,'R');P(3,8,'R');R(2,8,1,21,'b');R(2,18,1,4,'k');P(2,19,'K');P(2,29,'m')})},
  machadinha:{nome:'Machadinha',tag:'machadinha',ataque:'corte',duasMaos:false,tipo:'physical',dano:[5,8],rng:20,stats:{attackSpeed:8},
   arte:grade(7,12,(R,P)=>{R(2,0,1,12,'b');R(3,1,3,4,'s');P(5,1,'w');P(5,2,'w');P(5,3,'w');P(5,4,'w');P(3,4,'S');P(1,1,'S');P(1,2,'S');R(2,7,1,3,'k');P(2,11,'B')})},
  maca:{nome:'Maça',tag:'maca',ataque:'corte',duasMaos:false,tipo:'physical',dano:[6,9],rng:20,stats:{},
   arte:grade(7,14,(R,P)=>{P(3,0,'S');R(1,1,5,5,'s');R(2,2,1,2,'w');R(5,2,1,4,'S');R(0,2,1,3,'S');R(6,2,1,3,'S');P(3,3,'m');R(3,6,1,7,'b');R(3,9,1,3,'k');P(3,13,'m')})},
  escudo:{nome:'Escudo',tag:'escudo',ataque:'escudo',duasMaos:false,tipo:'physical',dano:[2,4],rng:16,stats:{arm:6,hp:30},
   arte:grade(10,12,(R,P)=>{for(let y=0;y<12;y++){const m=y<7?0:y-6;R(m,y,10-2*m,1,'u');R(5,y,5-m,1,'U')}R(0,0,10,1,'g');R(4,1,2,8,'g');R(2,3,6,2,'g');P(4,1,'y')}),girarIcone:false},
  orbe:{nome:'Orbe',tag:'orbe',ataque:'orbe',duasMaos:false,tipo:'magic',dano:[4,6],rng:120,proj:'#7cf0ff',stats:{mp:20},
   arte:grade(7,7,(R,P)=>{R(2,0,3,1,'c');R(1,1,5,1,'c');R(0,2,7,3,'c');R(1,5,5,1,'C');R(2,6,3,1,'C');R(4,3,3,2,'C');P(2,1,'w');P(1,2,'w');P(3,3,'y')}),girarIcone:false}
 };
 /* desenho na mão: pequeno, na escala do herói (o herói tem uns 16 px de altura); [desenho, pega] */
 const MAO={
  espada:[grade(3,10,(R,P)=>{P(1,0,'w');R(1,1,1,5,'s');P(2,3,'S');R(0,6,3,1,'g');R(1,7,1,2,'k');P(1,9,'g')}),.7],
  espada_grande:[grade(5,14,(R,P)=>{P(2,0,'s');R(1,1,1,8,'w');R(2,1,1,8,'s');R(3,1,1,8,'S');R(0,9,5,1,'g');R(2,10,1,3,'k');P(2,13,'g')}),.74],
  adaga:[grade(3,6,(R,P)=>{P(1,0,'w');R(1,1,1,2,'s');R(0,3,3,1,'g');P(1,4,'k');P(1,5,'g')}),.68],
  arco:[grade(4,13,(R,P)=>{for(let r=0;r<13;r++)P(Math.round(2-2*Math.sin(Math.PI*r/12)),r,r<2||r>10?'B':'b');R(0,5,1,3,'k');for(let r=1;r<12;r++)P(3,r,'t')}),.5],
  besta:[grade(7,8,(R,P)=>{R(3,0,1,4,'s');P(3,0,'w');R(0,1,7,1,'S');P(0,2,'S');P(6,2,'S');P(1,3,'t');P(2,3,'t');P(4,3,'t');P(5,3,'t');R(3,3,1,4,'b');R(2,7,3,1,'B')}),.62],
  cajado:[grade(3,16,(R,P)=>{P(1,0,'c');R(0,1,3,2,'c');P(0,1,'w');P(2,2,'C');R(0,3,3,1,'g');R(1,4,1,11,'b');P(1,15,'m')}),.55],
  vara:[grade(1,8,(R,P)=>{P(0,0,'p');P(0,1,'g');R(0,2,1,6,'l');P(0,7,'B')}),.75],
  manopla:[grade(3,3,(R,P)=>{R(0,0,3,2,'s');P(0,0,'w');R(0,2,3,1,'g')}),.5],
  machado:[grade(5,14,(R,P)=>{R(2,0,1,14,'b');R(0,1,2,3,'s');P(0,2,'w');R(3,1,2,3,'S');P(4,2,'w');R(2,10,1,3,'k')}),.72],
  martelo:[grade(5,14,(R,P)=>{R(0,0,5,3,'m');R(0,0,5,1,'S');R(2,0,1,3,'g');R(2,3,1,11,'b');R(2,10,1,3,'k')}),.75],
  lanca:[grade(3,19,(R,P)=>{P(1,0,'w');R(0,1,3,2,'s');P(0,1,'w');P(1,3,'S');P(0,4,'r');P(2,4,'r');R(1,4,1,15,'b');R(1,12,1,3,'k')}),.66],
  machadinha:[grade(4,8,(R,P)=>{R(1,0,1,8,'b');R(2,1,2,2,'s');P(3,1,'w');P(3,2,'w');P(0,1,'S');R(1,5,1,2,'k')}),.66],
  maca:[grade(3,9,(R,P)=>{R(0,0,3,3,'s');P(0,0,'w');P(2,2,'S');R(1,3,1,6,'b');R(1,6,1,2,'k')}),.66],
  escudo:[grade(5,6,(R,P)=>{R(0,0,5,4,'u');R(3,0,2,4,'U');R(1,4,3,1,'u');P(2,5,'u');R(2,0,1,5,'g');R(1,1,3,1,'g');R(0,0,5,1,'g')}),.5],
  orbe:[grade(4,4,(R,P)=>{R(1,0,2,4,'c');R(0,1,4,2,'c');P(1,1,'w');P(2,2,'C');P(3,2,'C');P(2,3,'C')}),.5]
 };
 for(const [k,a] of Object.entries(ARMAS)){a.icone=icone(a.arte,a.girarIcone!==false);a.mao=MAO[k][0];a.pega=MAO[k][1]}
 root.PACOTE_ARMAS={ARMAS,COR,icone};
})(typeof window!=='undefined'?window:globalThis);
