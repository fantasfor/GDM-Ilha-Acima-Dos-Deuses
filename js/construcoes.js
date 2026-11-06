/* ---------- Construções: telhado e paredes que somem ao entrar (2026-11-04, pedido do usuário) ----------
   Estilo Tibia/RuneScape: de fora se vê o telhado e a parede da frente (fachada); quem passa pela porta vê o telhado
   e a fachada sumirem devagar e aparece o interior, sem tela de carregamento. Quem está lá dentro fica escondido
   para quem está fora (o telhado entra na ordem de profundidade, na linha da parede da frente).
   Vale para TODA construção: a taverna e o cassino (js/taverna.js, js/cassino.js) e as casas que a ilha vai ganhar.
   Construção nova = registrar:
     CONSTRUCOES.registrar({id, cena:'taverna'|'ilha', x, y, w, h, fachada, beiral, telhado, parede, portas, janelas,
       placa, chamine, extra})
     x, y, w, h  planta (o chão de dentro, com as paredes);
     fachada     altura da parede da frente vista de fora (px; 0 = só telhado);
     beiral      quanto o telhado sobe acima da parede do fundo (px);
     telhado     cores {sombra, base, luz, cumeeira}; parede {sombra, base, luz, tipo:'tabuas'|'pedra'|'tijolo'};
     portas      [{lado:'s'|'n'|'l'|'o', x (lados n/s) ou y (l/o), w}]: vãos nas paredes (colisão e desenho);
     janelas     [x...] na fachada (acendem de noite); placa {texto, cor}; chamine: x da chaminé (ou null);
     paredeEsp   espessura das paredes para a colisão genérica (padrão 8);
     extra(ctx, a, c) desenha por cima do telhado (letreiros, luzes), a = opacidade.
   Na cena: CONSTRUCOES.objetos(L, cena) põe telhado e fachada na lista de profundidade; atualizar(dt) faz o
   esmaecer; bloqueia(x, y, cena) é a colisão genérica das paredes (com as portas) para construções sem colisão própria
   (a taverna e o cassino têm a delas e marcam colisao:false). */
(function(){
 const LISTA=[];
 const R=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.max(0,Math.round(w)),Math.max(0,Math.round(h)))};
 const hsh=(a,b)=>{let h=(a*374761393+b*668265263)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967296};
 // cores padrão na paleta do jogo (js/paleta.js): telhado de telha vinho, parede de madeira
 const TELHADO={sombra:'#4e2430',base:'#7d3f34',luz:'#a8653f',cumeeira:'#311339'};
 const PAREDE={sombra:'#4e2430',base:'#7d3f34',luz:'#a8653f',tipo:'tabuas'};
 const dentroDe=(c,x,y)=>x>=c.x&&x<c.x+c.w&&y>=c.y&&y<c.y+c.h;

 function registrar(def){
  const c={cena:'ilha',fachada:30,beiral:14,portas:[],janelas:[],placa:null,chamine:null,paredeEsp:8,colisao:true,...def,
   telhado:{...TELHADO,...(def.telhado||{})},parede:{...PAREDE,...(def.parede||{})},a:1,arte:null};
  const i=LISTA.findIndex(o=>o.id===c.id);if(i>=0)LISTA[i]=c;else LISTA.push(c);return c}

 /* ---- arte (feita uma vez por construção e guardada) ---- */
 function arte(c){
  if(c.arte)return c.arte;
  const pad=6,W=c.w+pad*2,topo=c.beiral,H=c.h+topo,cv=document.createElement('canvas');cv.width=W;cv.height=H+2;
  const g=cv.getContext('2d'),T=c.telhado,P=c.parede;
  const ty0=0,ty1=topo+c.h-c.fachada; // telhado: do beiral até o alto da fachada
  // telhado de quatro águas: a água de trás (estreita, mais escura), a cumeeira e a água da frente (larga), com
  // as pontas laterais em diagonal e fileiras de telhas desencontradas
  const cum=ty0+Math.round((ty1-ty0)*.32),inc=Math.min(26,Math.round((ty1-ty0)*.5));
  R(g,0,ty0,W,cum-ty0,T.sombra);R(g,0,cum,W,ty1-cum,T.base);
  // telhas: fileiras de 5 px na frente (meia telha desencontrada) e de 4 px atrás
  for(let y=cum+2,row=0;y<ty1-3;y+=5,row++){R(g,0,y+4,W,1,T.sombra);for(let x=(row%2)*6;x<W;x+=12){R(g,x,y,1,4,T.sombra);if(hsh(x,row)>.6)R(g,x+2,y+1,7,1,T.luz)}}
  for(let y=ty0+1,row=0;y<cum-1;y+=4,row++){R(g,0,y+3,W,1,'#00000040');for(let x=(row%2)*6+3;x<W;x+=12)R(g,x,y,1,3,'#00000040')}
  // pontas laterais (as águas dos lados): faixas em diagonal mais escuras
  for(let y=ty0;y<ty1;y++){const d=y<cum?Math.round((y-ty0)*inc/(cum-ty0||1)):Math.round((ty1-y)*inc/(ty1-cum||1));
   R(g,0,y,Math.max(2,d),1,T.sombra);R(g,W-Math.max(2,d),y,Math.max(2,d),1,T.sombra);R(g,Math.max(2,d),y,1,1,T.luz);R(g,W-Math.max(2,d)-1,y,1,1,'#00000050')}
  // cumeeira, beirada da frente com sombra e contorno
  R(g,inc,cum-1,W-inc*2,3,T.cumeeira);R(g,inc,cum-1,W-inc*2,1,T.luz);
  R(g,0,ty1-2,W,2,T.cumeeira);R(g,0,ty1-3,W,1,T.luz);R(g,0,0,W,1,'#000000');R(g,0,0,1,ty1,'#000000');R(g,W-1,0,1,ty1,'#000000');
  // chaminé de pedra
  if(c.chamine!=null){const cx=pad+c.chamine-c.x;R(g,cx-6,cum-16,12,18,'#3a3040');R(g,cx-5,cum-16,10,17,'#5e5668');R(g,cx-7,cum-18,14,3,'#8e8898');R(g,cx-7,cum-18,14,1,'#c4c8d6');for(let y=cum-12;y<cum;y+=4)R(g,cx-5,y,10,1,'#3a3040')}
  // fachada: a parede da frente vista de fora (tábuas ou pedra), com rodapé, portas e janelas
  if(c.fachada>0){const fy=ty1,fh=c.fachada;
   R(g,pad,fy,c.w,fh,P.base);
   if(P.tipo==='pedra'){for(let y=fy,row=0;y<fy+fh-4;y+=6,row++)for(let x=pad+(row%2)*7;x<pad+c.w;x+=14){R(g,x,y,13,5,hsh(x,y)<.5?P.base:P.sombra);R(g,x,y,13,1,P.luz)}}
   else if(P.tipo==='tijolo')tijolos(g,pad,fy,c.w,fh-4,P,c.x);
   else{for(let x=pad;x<pad+c.w;x+=7){R(g,x,fy,1,fh,P.sombra);if(hsh(x,3)>.5)R(g,x+3,fy+4+(hsh(x,4)*10|0),1,3,P.sombra)}R(g,pad,fy,c.w,1,P.luz)}
   R(g,pad,fy+fh-4,c.w,4,'#3a3040');R(g,pad,fy+fh-4,c.w,1,'#5e5668');R(g,pad-1,fy,1,fh,'#000000');R(g,pad+c.w,fy,1,fh,'#000000');R(g,pad,fy+fh-1,c.w,1,'#000000');
   // vigas nos cantos
   for(const vx of [pad,pad+c.w-5]){R(g,vx,fy,5,fh-4,P.sombra);R(g,vx+1,fy,1,fh-4,P.luz)}
   for(const jx of c.janelas){const x=pad+jx-c.x-8;R(g,x-2,fy+7,20,15,'#000000');R(g,x-1,fy+8,18,13,P.sombra);R(g,x,fy+9,16,11,'#2a2a52');R(g,x+7,fy+9,2,11,P.sombra);R(g,x,fy+14,16,1,P.sombra);R(g,x+1,fy+10,2,3,'#6e9cc4');R(g,x-2,fy+21,20,2,P.luz)}
   for(const po of c.portas)if(po.lado==='s'){const x=pad+po.x-c.x-po.w/2,top=fy+Math.max(2,fh-26);
    R(g,x-3,top-3,po.w+6,fy+fh-top+3,'#000000');R(g,x-2,top-2,po.w+4,fy+fh-top+2,P.sombra);R(g,x,top,po.w,fy+fh-top,'#1f1a1a');R(g,x,top,po.w,2,'#00000080');
    R(g,x-2,top-2,po.w+4,1,P.luz)}}
  return c.arte={cv,ox:c.x-pad,oy:c.y-topo,ty1}}

 /* desenho: telhado + fachada com a opacidade de agora; janelas acesas de noite; placa; extra */
 function desenhar(c,g){
  const a=c.a;if(a<=.01)return;const A=arte(c);
  g.save();g.globalAlpha=a;g.drawImage(A.cv,A.ox,A.oy);
  const nk=window.TEMPO?TEMPO.escuro():0;
  if(c.fachada>0){const fy=A.oy+A.ty1;
   const PXa=window.CASSINO_JOGOS&&CASSINO_JOGOS.PX; // peças de pixel art (elipse, luz em degraus, letras 3×5)
   if(nk>.05)for(const jx of c.janelas){g.globalAlpha=a*nk*(.75+.25*Math.sin(time*3+jx));R(g,jx-8,fy+9,16,11,'#efc56a');R(g,jx-1,fy+9,2,11,'#9a5a2a');R(g,jx-8,fy+14,16,1,'#9a5a2a');
    g.globalAlpha=1;if(PXa)PXa.luz(g,jx,fy+16,24,'#f7b84a',a*nk*.5)}
   g.globalAlpha=a;
   if(c.placa){const po=c.portas.find(o=>o.lado==='s'),px=po?po.x:c.x+c.w/2,py=fy+Math.max(2,c.fachada-26)-12,tw=c.placa.texto.length*4+11;
    R(g,px-tw/2-1,py-1,tw+2,11,'#000000');R(g,px-tw/2,py,tw,9,'#4e2430');R(g,px-tw/2,py,tw,1,'#a8653f');R(g,px-tw/2+1,py+8,tw-2,1,'#311339');
    if(PXa)PXa.texto(g,c.placa.texto,px,py+2,c.placa.cor||'#efc56a','#000000');else{g.font='bold 6px monospace';g.textAlign='center';g.fillStyle=c.placa.cor||'#efc56a';g.fillText(c.placa.texto,px,py+7)}}}
  if(c.extra)try{c.extra(g,a,c)}catch(e){}
  g.restore()}

 /* muro da frente visto de dentro (2026-11-04, a partir da imagem do usuário): com o telhado aberto, a parede da frente
    continua ali, baixa — pedra com viga de madeira em cima, colunas de madeira, janelas de vidro com parapeito e o vão
    da porta. Fica na frente de quem está encostado nela (profundidade da linha da parede). c.muro = {alt, pedra:[3 tons], tijolo?, tabuas?} */
 const muroArte=new Map();
 /* parede de tijolos (fachada tipo 'tijolo' e muro com tijolo:true): fiadas de 4 px (3 de tijolo + 1 de argamassa),
    tijolos de 8 px desencontrados, tons variando entre base, sombra e luz */
 function tijolos(g,x0,y0,w,h,P,sx){const arg=P.argamassa||'#5e5668';R(g,x0,y0,w,h,arg);
  for(let y=y0,row=0;y<y0+h;y+=4,row++)for(let x=x0-(row%2)*4;x<x0+w;x+=8){const n=hsh(x+sx,y),bx=Math.max(x0,x),bw=Math.min(x+7,x0+w)-bx;if(bw<=0)continue;
   R(g,bx,y,bw,Math.min(3,y0+h-y),n<.6?P.base:n<.85?P.sombra:P.luz);if(n<.6)R(g,bx,y,bw,1,P.luz)}}
 function arteMuro(c){if(muroArte.has(c.id))return muroArte.get(c.id);
  const M=c.muro,alt=M.alt||22,P=M.pedra||['#3a3040','#5e5668','#8e8898'],W=c.w,cv=document.createElement('canvas');cv.width=W;cv.height=alt+4;const g=cv.getContext('2d');
  if(M.tijolo)tijolos(g,0,4,W,alt,{sombra:P[0],base:P[1],luz:P[2]},c.x);
  // tábuas: o mesmo material da fachada de tábuas (c.parede), visto de dentro
  else if(M.tabuas){const Q=c.parede;R(g,0,4,W,alt,Q.base);for(let x=0;x<W;x+=7){R(g,x,4,1,alt,Q.sombra);if(hsh(x+c.x,3)>.5)R(g,x+3,6+(hsh(x,4)*(alt-6)|0),1,3,Q.sombra)}}
  else for(let y=4,row=0;y<alt+4;y+=6,row++)for(let x=-((row%2)*7);x<W;x+=14){R(g,x,y,13,5,hsh(x+c.x,y)<.5?P[1]:P[0]);R(g,x,y,13,1,P[2]);R(g,x+13,y,1,6,'#000000')}
  R(g,0,0,W,4,'#4e2430');R(g,0,0,W,1,'#a8653f');R(g,0,3,W,1,'#2a1a10');R(g,0,alt+3,W,1,'#000000');
  for(let x=0;x<W;x+=96){R(g,x,0,5,alt+4,'#4e2430');R(g,x+1,0,1,alt+4,'#a8653f')}R(g,W-5,0,5,alt+4,'#4e2430');R(g,W-4,0,1,alt+4,'#a8653f');
  for(const jx of c.janelas){const x=jx-c.x-8;R(g,x-1,5,18,12,'#000000');R(g,x,6,16,10,'#4e2430');R(g,x+1,7,14,8,'#3d5a8c');R(g,x+7,7,2,8,'#4e2430');R(g,x+1,10,14,1,'#4e2430');R(g,x+2,8,2,2,'#6e9cc4');R(g,x-2,16,20,2,'#a8653f')}
  // vão da porta: aberto, com os batentes
  for(const po of c.portas)if(po.lado==='s'){const x=po.x-c.x-po.w/2;g.clearRect(x,0,po.w,alt+4);R(g,x-3,0,3,alt+4,'#2a1a10');R(g,x-2,0,1,alt+4,'#a8653f');R(g,x+po.w,0,3,alt+4,'#2a1a10');R(g,x+po.w+1,0,1,alt+4,'#a8653f')}
  const r=window.PALETA_JOGO?PALETA_JOGO.canvasNaPaleta(cv):cv;muroArte.set(c.id,r);return r}
 function desenharMuro(c,g){const a=1-c.a;if(!c.muro||a<=.01)return;const A=arteMuro(c),alt=c.muro.alt||22;g.save();g.globalAlpha=a;g.drawImage(A,c.x,c.y+c.h-alt-4);g.restore()}
 /* esmaecer: some quando o herói está dentro (ou passando pela porta), volta quando sai */
 function atualizar(dt,cena){if(typeof p==='undefined')return;
  for(const c of LISTA){if(cena&&c.cena!==cena)continue;const alvo=dentroDe(c,p.x,p.y)?0:1;c.a+=(alvo-c.a)*Math.min(1,dt*7);if(Math.abs(alvo-c.a)<.005)c.a=alvo}}
 const naCena=cena=>LISTA.filter(c=>c.cena===cena);
 window.CONSTRUCOES={
  registrar,lista:()=>LISTA.slice(),
  objetos(L,cena){for(const c of naCena(cena)){L.push([c.y+c.h-.5,()=>desenhar(c,ctx)]);if(c.muro)L.push([c.y+c.h-.4,()=>desenharMuro(c,ctx)])}},
  atualizar,
  // opacidade do telhado (0 = herói dentro), quem está dentro, e se um ponto está escondido sob um telhado
  alfa:id=>{const c=LISTA.find(o=>o.id===id);return c?c.a:1},
  dentro:id=>{const c=LISTA.find(o=>o.id===id);return!!c&&typeof p!=='undefined'&&dentroDe(c,p.x,p.y)},
  em:(x,y,cena)=>LISTA.find(c=>(!cena||c.cena===cena)&&dentroDe(c,x,y))||null,
  coberto:(x,y,cena)=>LISTA.some(c=>(!cena||c.cena===cena)&&c.a>.5&&dentroDe(c,x,y)),
  // colisão genérica: paredes com os vãos das portas (só nas construções com colisao:true)
  bloqueia(x,y,cena){for(const c of LISTA){if(!c.colisao||cena&&c.cena!==cena||!dentroDe(c,x,y))continue;const e=c.paredeEsp;
   const vao=(lado,v)=>c.portas.some(po=>po.lado===lado&&Math.abs(v-(lado==='n'||lado==='s'?po.x:po.y))<po.w/2);
   if(y<c.y+e&&!vao('n',x))return true;if(y>=c.y+c.h-e&&!vao('s',x))return true;if(x<c.x+e&&!vao('o',y))return true;if(x>=c.x+c.w-e&&!vao('l',y))return true}return false},
  refazer:id=>{for(const c of LISTA)if(!id||c.id===id)c.arte=null}
 };
})();
