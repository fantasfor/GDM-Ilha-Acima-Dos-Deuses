/* ---------- ícones dos efeitos (2026-11-05, pedido do usuário: "cada efeito tem seu ícone") ----------
   16×16 no mesmo padrão dos ícones das habilidades (js/classe-explorador.js): fundo em degradê da cor do efeito com
   moldura (luz em cima e à esquerda, sombra embaixo e à direita) e o símbolo desenhado com a paleta do jogo
   (js/paleta.js) e contorno escuro automático. Efeito novo = um desenho novo aqui; sem desenho, vale o antigo de
   js/effects.js. Desenho próprio na Engine (Projeto › arte "efeitos/<id>") continua tendo prioridade. */
(function(){
 // cores por letra (rampas da paleta do jogo: 3 tons por parte)
 const C={k:'#0d0d0d',w:'#ffffff',
  s:'#3e3a52',m:'#7c8098',l:'#c4c8d6',          // aço
  t:'#4e2430',r:'#7d3f34',o:'#a8653f',          // madeira
  g:'#263a3a',n:'#3f6b45',f:'#79a35a',          // folhagem
  v0:'#2f3a1c',v1:'#6f8f2a',v2:'#c4dc5a',       // veneno
  a:'#9a5a2a',b:'#d08a3a',c:'#efc56a',          // ouro
  x0:'#b8402a',x1:'#e8743a',x2:'#f7b84a',       // fogo
  d0:'#6e1438',d:'#a22b4b',e:'#cf4554',         // sangue
  u:'#7a6650',i:'#b8a47c',j:'#ddd0a6',          // osso
  q0:'#2a2a52',q1:'#3d5a8c',q2:'#6e9cc4',       // água
  z0:'#4a5a7a',z1:'#8fb4cc',z2:'#e4f0f2',       // gelo
  p0:'#4a1f6e',p1:'#7a3ca8',p2:'#b07ad8',       // magia
  h0:'#3a3040',h1:'#5e5668',h2:'#8e8898',       // pedra
  y0:'#9c4a4a',y1:'#cf7a6a',y2:'#e8b096',       // pele
  u0:'#2b3324',u1:'#56703a',u2:'#9aab5c'};      // musgo
 const sh=(hex,k)=>{const n=parseInt(hex.slice(1),16);return'rgb('+[16,8,0].map(s=>Math.round(((n>>s)&255)*k)).join(',')+')'};
 function icone(fundo,desenha){
  const cv=document.createElement('canvas');cv.width=cv.height=16;const g=cv.getContext('2d');
  if(window.PALETA_JOGO&&PALETA_JOGO.fundoIcone)PALETA_JOGO.fundoIcone(g,16,16,fundo); // fundo: 3 cores (centro, borda clara, borda escura)
  const S=[...Array(16)].map(()=>Array(16).fill(null));
  const P=(x,y,c)=>{x=Math.round(x);y=Math.round(y);if(x>=1&&y>=1&&x<15&&y<15)S[y][x]=C[c]||c};
  const Rr=(x,y,w,h,c)=>{for(let j=0;j<h;j++)for(let i=0;i<w;i++)P(x+i,y+j,c)};
  const Ci=(cx,cy,r,c,f)=>{for(let y=1;y<15;y++)for(let x=1;x<15;x++){const dx=x+.5-cx,dy=y+.5-cy;if(dx*dx+dy*dy<=r*r){const k=f?f(dx,dy):c;if(k)P(x,y,k)}}};
  const Ln=(x0,y0,x1,y1,c)=>{const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))||1;for(let k=0;k<=n;k++)P(x0+(x1-x0)*k/n,y0+(y1-y0)*k/n,c)};
  // gota: ponta em cima, barriga redonda embaixo (veneno, sangue)
  const gota=(cx,top,r,c0,c1,c2)=>{for(let y=top;y<top+r;y++){const w=Math.round((y-top)/r*r*.75);Rr(cx-w,y,w*2+1,1,c1)}Ci(cx+.5,top+r+r*.55,r,c1,(dx,dy)=>dy>r*.35||dx>r*.45?c0:dx<-r*.2&&dy<-r*.1?c2:c1);P(cx-1,top+r,c2)};
  desenha({P,Rr,Ci,Ln,gota});
  for(let y=1;y<15;y++)for(let x=1;x<15;x++){const c=S[y][x];if(c){g.fillStyle=c;g.fillRect(x,y,1,1)}
   else if([[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>S[y+b]&&S[y+b][x+a]&&S[y+b][x+a]!==C.k)){g.fillStyle=C.k;g.fillRect(x,y,1,1)}}
  return (window.PALETA_JOGO&&PALETA_JOGO.iconeNaPaleta?PALETA_JOGO.iconeNaPaleta(cv):cv).toDataURL()} // na paleta do jogo (js/paleta.js)
 // chama (fogo, queimadura): três línguas de fogo
 const chama=(o,cx,base,h,c0,c1,c2)=>{for(let y=0;y<h;y++){const k=y/h,w=Math.max(0,Math.round((1-k)*(h*.42)*(.6+.4*Math.sin(k*3.1))));o.Rr(cx-w,base-y,w*2+1,1,k>.55?c2:k>.25?c1:c0)}};
 const escudo=(o,c0,c1,c2)=>{o.Rr(3,2,10,7,c1);o.Rr(4,9,8,2,c1);o.Rr(5,11,6,2,c1);o.Rr(7,13,2,1,c1);o.Rr(3,2,10,1,c2);o.Rr(3,2,1,7,c2);o.Rr(12,3,1,6,c0);o.Rr(8,9,4,2,c0);o.Rr(8,11,3,2,c0)};
 const D={
  // veneno: gota verde-ácida com bolhas
  poison:['#6f8f2a',o=>{o.gota(7,2,4,'v0','v1','v2');o.P(12,3,'v2');o.P(11,5,'v1');o.P(3,4,'v1')}],
  // queimadura: chama de três tons
  burn:['#e8743a',o=>{chama(o,8,13,12,'x0','x1','x2');o.P(8,10,'c');o.P(7,11,'c')}],
  // sangramento: gota de sangue com respingos
  bleed:['#a22b4b',o=>{o.gota(7,2,4,'d0','d','e');o.P(12,10,'d');o.P(13,12,'d0');o.P(3,11,'e')}],
  // lentidão: ampulheta com a areia escorrendo
  slow:['#3d5a8c',o=>{o.Rr(3,2,10,1,'o');o.Rr(3,13,10,1,'o');o.Rr(3,1,10,1,'r');o.Rr(3,14,10,1,'r');
   for(let k=0;k<5;k++){o.Rr(4+k,3+k,8-2*k,1,'z2');o.Rr(4+k,12-k,8-2*k,1,'z2')}o.Rr(5,4,6,2,'c');o.Rr(7,8,2,1,'c');o.Rr(6,11,4,1,'c');o.Rr(5,12,6,1,'b');o.P(4,3,'w')}],
  // atordoado: três estrelas girando
  stun:['#d08a3a',o=>{const est=(x,y,c,l)=>{o.P(x,y,l);o.P(x-1,y,c);o.P(x+1,y,c);o.P(x,y-1,c);o.P(x,y+1,c)};est(4,4,'c','w');est(11,6,'c','w');est(6,11,'b','c');o.Ln(6,6,10,9,'a');o.P(12,11,'x2')}],
  // medo: fantasminha assustado
  medo:['#7a3ca8',o=>{o.Ci(8,7,5,'p2');o.Rr(3,7,10,5,'p2');for(const x of [3,6,9,12])o.P(x,12,'p1');o.Rr(3,9,1,3,'p1');o.Rr(5,6,2,2,'k');o.Rr(9,6,2,2,'k');o.Rr(7,9,2,2,'k');o.P(13,3,'z1');o.P(13,4,'z2')}],
  // fratura: osso rachado
  fratura:['#7a6650',o=>{o.Ln(4,11,11,4,'j');o.Ln(5,11,12,4,'i');o.Ci(3.5,11.5,1.6,'j');o.Ci(5,13,1.4,'i');o.Ci(12.5,3.5,1.6,'j');o.Ci(11,2.4,1.4,'j');o.P(7,8,'d');o.P(8,8,'d0');o.P(8,7,'d')}],
  // corrosão: escudo de aço com ácido escorrendo
  corrosao:['#6f8f2a',o=>{escudo(o,'s','m','l');o.Rr(5,4,2,6,'v1');o.Rr(9,3,2,4,'v1');o.P(5,10,'v2');o.P(9,7,'v2');o.P(6,12,'v1')}],
  // congelado: bloco de gelo com brilho
  congelado:['#8fb4cc',o=>{o.Rr(3,3,10,10,'z1');o.Rr(3,3,10,1,'z2');o.Rr(3,3,1,10,'z2');o.Rr(12,4,1,9,'z0');o.Rr(4,12,9,1,'z0');o.Ln(5,9,9,5,'z2');o.Ln(7,11,11,7,'w');o.P(5,5,'w')}],
  // gelo: floco de neve
  gelo:['#3d5a8c',o=>{o.Ln(8,2,8,13,'z2');o.Ln(3,5,13,11,'z1');o.Ln(3,11,13,5,'z1');for(const [x,y] of [[7,3],[9,3],[7,12],[9,12]])o.P(x,y,'z1');o.P(8,8,'w')}],
  // vulnerável: escudo roxo partido ao meio
  vuln:['#7a3ca8',o=>{escudo(o,'p0','p1','p2');o.Ln(8,2,7,5,'k');o.Ln(7,5,9,8,'k');o.Ln(9,8,7,11,'k');o.P(7,13,'k')}],
  // fraqueza: espada caída com seta para baixo
  weak:['#5e5668',o=>{o.Ln(3,3,9,9,'l');o.Ln(4,3,10,9,'m');o.Rr(9,9,3,1,'a');o.Rr(10,8,1,3,'a');o.P(11,11,'r');o.Rr(12,3,1,5,'e');o.Ln(10,6,12,8,'e');o.Ln(14,6,12,8,'e')}],
  // regeneração: folha com cruz verde
  regen:['#3f6b45',o=>{o.Ci(8,8,5,'n');o.Rr(7,4,2,8,'f');o.Rr(4,7,8,2,'f');o.Rr(7,4,1,8,'v2');o.Rr(4,7,8,1,'v2');o.P(12,3,'v2');o.P(13,4,'f')}],
  // fúria: punho cerrado em brasa
  rage:['#b8402a',o=>{o.Rr(4,6,8,6,'y1');o.Rr(4,6,8,1,'y2');for(const x of [4,6,8,10])o.Rr(x,6,1,3,'y0');o.Rr(3,8,2,3,'y1');o.Rr(5,12,6,2,'y0');o.P(4,3,'x2');o.P(8,2,'x1');o.P(12,3,'x2');o.P(6,4,'x1');o.P(10,4,'x1')}],
  // proteção: escudo azul com cruz clara
  ward:['#3d5a8c',o=>{escudo(o,'q0','q1','q2');o.Rr(7,3,2,9,'z2');o.Rr(4,5,8,2,'z2')}],
  // pressa: bota com asinha
  haste:['#d08a3a',o=>{o.Rr(5,4,4,7,'o');o.Rr(5,10,8,3,'o');o.Rr(5,4,4,1,'b');o.Rr(5,12,8,1,'r');o.Rr(4,4,1,9,'r');o.Ln(9,6,13,3,'w');o.Ln(9,7,13,5,'l');o.Ln(9,8,12,7,'w');o.P(2,9,'c');o.P(1,11,'c');o.P(2,12,'b')}],
  // Grito de Guerra: duas espadas cruzadas em vermelho
  grito:['#a22b4b',o=>{o.Ln(3,3,11,11,'l');o.Ln(12,3,4,11,'l');o.Ln(4,3,12,11,'m');o.Ln(11,3,3,11,'m');o.Rr(10,11,3,1,'c');o.Rr(3,11,3,1,'c');o.P(12,12,'r');o.P(3,12,'r');o.P(7,7,'e');o.P(8,7,'e')}],
  // Inspiração Mágica: estrela arcana de quatro pontas
  inspiracao:['#7a3ca8',o=>{o.Rr(7,2,2,12,'p2');o.Rr(2,7,12,2,'p2');o.Ci(8,8,2.6,'p1');o.Rr(7,7,2,2,'w');o.P(4,4,'p2');o.P(11,4,'p2');o.P(4,11,'p2');o.P(11,11,'p2')}],
  // Cura: coração verde com mais
  cura:['#3f6b45',o=>{o.Ci(5.5,6,2.8,'f');o.Ci(10.5,6,2.8,'f');for(let y=7;y<14;y++){const w=Math.max(0,6-(y-7));o.Rr(8-w,y,w*2,1,'f')}o.Rr(7,5,2,6,'w');o.Rr(5,7,6,2,'w');o.P(4,5,'v2')}],
  // Iluminação: sol de raios brancos e dourados
  luz:['#d08a3a',o=>{o.Ci(8,8,3.2,'c');o.Ci(7.5,7.5,1.6,'w');for(const [dx,dy] of [[0,-1],[1,0],[0,1],[-1,0]])o.Ln(8+dx*5,8+dy*5,8+dx*6,8+dy*6,'w');for(const [dx,dy] of [[1,1],[1,-1],[-1,1],[-1,-1]])o.P(8+dx*5,8+dy*5,'c')}],
  // Pulso de Luz: onda de batimento dourada
  curafixa:['#9a5a2a',o=>{o.Rr(2,8,3,1,'c');o.Ln(5,8,6,4,'c');o.Ln(6,4,8,12,'w');o.Ln(8,12,10,6,'c');o.Ln(10,6,11,8,'c');o.Rr(11,8,3,1,'c');o.P(13,3,'f');o.Rr(12,3,3,1,'f');o.Rr(13,2,1,3,'f')}],
  // Presença Curativa: anel de folhas em volta de uma luz
  presenca:['#3f6b45',o=>{for(let k=0;k<10;k++){const a=k/10*Math.PI*2;o.P(8+Math.cos(a)*5,8+Math.sin(a)*5,k%2?'f':'v2')}o.Ci(8,8,2,'w');o.P(8,3,'w')}],
  // Grito de Estratégia: corneta de caça
  estrategia:['#56703a',o=>{for(let k=0;k<=30;k++){const t=k/30,cx=3+6*t,cy=11-4*t*t,r=.5+2.4*t*t;o.Ci(cx,cy,r,'i',(dx,dy)=>Math.abs(t-.5)<.06?'c':dy<0?'j':'i')}o.Rr(9,5,1,3,'t');o.Ln(11,3,13,1,'v2');o.Ln(12,5,14,5,'v2');o.Ln(11,7,13,9,'v2')}],
  // Instinto de Caça: mira vermelha travada
  instinto:['#a22b4b',o=>{for(let k=0;k<24;k++){const a=k/24*Math.PI*2;if(Math.abs(Math.cos(a))>.92||Math.abs(Math.sin(a))>.92)continue;o.P(8+Math.cos(a)*5,8+Math.sin(a)*5,'e')}
   for(const [x,y] of [[8,2],[8,3],[8,13],[8,14],[2,8],[3,8],[13,8],[14,8]])o.P(x,y,'w');o.Rr(7,7,2,2,'e');o.P(7,7,'w')}],
  // Enraizado: raízes presas no chão em volta do pé
  enraizado:['#3f6b45',o=>{o.Rr(6,2,4,8,'y1');o.Rr(6,2,1,8,'y2');o.Rr(6,10,6,2,'o');o.Rr(6,10,6,1,'r');
   o.Ln(2,13,6,8,'r');o.Ln(14,13,10,7,'r');o.Ln(3,13,7,9,'o');o.Ln(13,13,9,8,'o');o.Rr(1,13,14,1,'t');o.P(4,9,'f');o.P(12,8,'f');o.P(5,8,'n');o.P(11,7,'n')}]};
 /* cabeça gritando (2026-11-05, pedido do usuário): ícone do Grito de Guerra e, em tons esverdeados, do Grito de
    Estratégia; os efeitos de mesmo nome usam o ícone da habilidade. De perfil olhando para a direita: cabelo, rosto
    (3 tons: luz em cima/à esquerda, sombra embaixo/à direita), sobrancelha brava, boca bem aberta com os dentes e três
    ondas de som saindo. T = tons de cada parte (até 3 por parte, da rampa dela) */
 // desenhada pixel a pixel (14×14 dentro da moldura): a/b/c cabelo, d/e/f rosto, k preto, w dentes, m boca, 2/3 ondas
 const CABECA=['..............','...bbbbc......','..abbbbbbc....','.abbbbbbbbc...','.aabefffff....','.abeeffkkkf.2.','.abeeeffwkf..2',
  '.aaeeeeefff.32','..deeeewwww.32','..deeeemmmm.32','..ddeeemmmm.32','...ddeewwww..2','....ddddd...2.','..............'];
 function cabecaGritando(T){const cor={a:T.cabelo[0],b:T.cabelo[1],c:T.cabelo[2],d:T.pele[0],e:T.pele[1],f:T.pele[2],k:'k',w:'j',m:'t','2':T.onda[1],'3':T.onda[2]};
  return o=>CABECA.forEach((l,y)=>{for(let x=0;x<l.length;x++)if(cor[l[x]])o.P(x+1,y+1,cor[l[x]])})}
 const GRITO={
  war_grito:['#a22b4b',cabecaGritando({pele:['y0','y1','y2'],cabelo:['r','o','b'],onda:['d0','d','e']})],
  exp_estrategia:['#56703a',cabecaGritando({pele:['u0','u1','u2'],cabelo:['g','n','f'],onda:['v0','v1','v2']})]};
 const cacheH={};
 {const antes=window.iconeHabilidade;window.iconeHabilidade=id=>GRITO[id]?cacheH[id]||(cacheH[id]=icone(GRITO[id][0],GRITO[id][1])):antes?antes(id):null}
 const cache={};
 window.ICONES_EFEITO={tem:id=>!!D[id],url:id=>D[id]?cache[id]||(cache[id]=icone(D[id][0],D[id][1])):null,lista:()=>Object.keys(D)};
})();
