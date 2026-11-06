/* ---------- Loja do Viajante (2026-11-04, pedido do usuário) ----------
   Na Cidade, à esquerda da taverna (do mesmo lado da rua): uma loja pequena de telhado de ardósia azul, com a porta
   para a rua. Lá dentro o Viajante (js/viajante.js) fica atrás do balcão, e atrás dele, na parede, a vitrine com os
   5 itens mais caros que ele tem à venda (o estoque que os jogadores venderam), cada um com o desenho de quando o
   personagem está segurando o item, a joia da qualidade e o preço. Duas vitrines de pé mostram curiosidades mágicas.
   Telhado e fachada somem ao entrar (js/construcoes.js). Tudo em pixel art (CASSINO_JOGOS.PX).
   A taverna chama LOJA_VIAJANTE: contem/walk (colisão), chao, objetos, brilho, minimapa. */
(function(){
 const L={x:-228,y:194,w:216,h:150},PAREDE=50,PORTA={x:-120,w:24};
 // posições editáveis na Engine (cena Cidade): js/taverna-layout.js (TAVERNA_LAYOUT.L.cidade.loja)
 const LJ=window.TAVERNA_LAYOUT.L.cidade.loja;
 const NPC={x:LJ.npc.x,y:LJ.npc.y},BALCAO={x0:LJ.balcao.x-38,x1:LJ.balcao.x+38,y0:LJ.balcao.y-16,y1:LJ.balcao.y},VAGA={x:LJ.npc.x,y:LJ.balcao.y+9}; // a vaga: na frente do balcão, na direção do Viajante
 const VIT={x0:LJ.vitrine.x-52,y0:LJ.vitrine.y,w:104,h:34}; // vitrine da parede (5 nichos)
 const VITRINES=LJ.vitrines; // vitrines de pé
 const DECOR=LJ.decor;
 const R=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
 const hsh=(a,b)=>{let h=(a*374761393+b*668265263)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967296};
 const COR={noite:['#311339','#4f2052','#74366e'],ouro:['#9a5a2a','#d08a3a','#efc56a'],madeira:['#4e2430','#7d3f34','#a8653f'],agua:['#2a2a52','#3d5a8c','#6e9cc4'],aco:['#3e3a52','#7c8098','#c4c8d6'],sangue:['#6e1438','#a22b4b','#cf4554'],osso:['#7a6650','#b8a47c','#ddd0a6'],magia:['#4a1f6e','#7a3ca8','#b07ad8'],folha:['#263a3a','#3f6b45','#79a35a']};
 const PX=()=>window.CASSINO_JOGOS&&CASSINO_JOGOS.PX;
 const tipoEl=e=>typeof MAP_ELEMENT_TYPES!=='undefined'?MAP_ELEMENT_TYPES[e.type]:null; // global do jogo (não fica em window)
 const desenharElem=(g,e)=>{const a=window.sceneryFor&&sceneryFor(e);if(a&&a.c)g.drawImage(a.c,Math.round(e.x-a.ax),Math.round(e.y-a.ay))};
 const dentro=(x,y)=>x>=L.x&&x<L.x+L.w&&y>=L.y&&y<L.y+L.h;

 /* ---- chão e paredes de dentro (uma vez) ---- */
 let chao=null;
 function desenharChao(){
  const c=document.createElement('canvas');c.width=L.w;c.height=L.h;const g=c.getContext('2d');
  // assoalho de tábuas corridas
  for(let y=PAREDE,row=0;y<L.h;y+=6,row++){let x=-((hsh(row,3)*30)|0);while(x<L.w){const len=26+((hsh(x,row)*24)|0),v=hsh(row,x);
   R(g,x,y,len,6,v<.5?COR.madeira[1]:'#6e3a30');R(g,x,y,len,1,COR.madeira[2]);R(g,x,y+5,len,1,COR.madeira[0]);R(g,x+len-1,y,1,6,COR.madeira[0]);x+=len}}
  // tapete na entrada até o balcão
  const tx=PORTA.x-L.x;R(g,tx-20,BALCAO.y1-L.y+6,40,L.h-(BALCAO.y1-L.y)-16,COR.sangue[0]);R(g,tx-18,BALCAO.y1-L.y+8,36,L.h-(BALCAO.y1-L.y)-20,COR.sangue[1]);
  for(let y=BALCAO.y1-L.y+12;y<L.h-14;y+=6)R(g,tx-12,y,24,1,COR.ouro[0]);
  // parede do fundo: as mesmas tábuas de madeira da fachada (dentro e fora do mesmo material, 2026-11-05), viga em cima,
  // prateleiras com potes e rolos de pergaminho
  R(g,0,0,L.w,PAREDE,COR.madeira[1]);for(let x=0;x<L.w;x+=7){R(g,x,5,1,PAREDE-9,COR.madeira[0]);if(hsh(x,3)>.5)R(g,x+3,9+(hsh(x,4)*10|0),1,3,COR.madeira[0])}
  R(g,0,0,L.w,5,COR.madeira[0]);R(g,0,4,L.w,1,COR.madeira[2]);R(g,0,PAREDE-4,L.w,4,COR.madeira[0]);R(g,0,PAREDE-4,L.w,1,COR.madeira[2]);R(g,0,PAREDE-1,L.w,1,'#000000');
  for(const [sx,sw] of [[8,44]])for(const sy of [16,30]){R(g,sx,sy,sw,2,COR.madeira[2]);R(g,sx,sy+2,sw,1,COR.madeira[0]);
   for(let k=0;k<5;k++){const bx=sx+3+k*9,tipo=(hsh(sx+k,sy)*3)|0,cor=[COR.agua[2],COR.folha[2],COR.sangue[2],COR.osso[2],COR.magia[2]][(k+sy)%5];
    if(tipo===0){R(g,bx,sy-6,5,6,'#000000');R(g,bx+1,sy-5,3,5,cor);R(g,bx+1,sy-7,3,1,COR.madeira[2])}
    else if(tipo===1){R(g,bx,sy-4,7,4,'#000000');R(g,bx+1,sy-3,5,3,COR.osso[1]);R(g,bx+2,sy-4,3,1,COR.sangue[1])}
    else{R(g,bx+1,sy-8,3,8,'#000000');R(g,bx+2,sy-7,1,7,cor)}}}
  // paredes dos lados e de baixo (com o vão da porta)
  R(g,0,0,6,L.h,COR.madeira[0]);R(g,6,0,1,L.h,COR.madeira[2]);R(g,L.w-6,0,6,L.h,COR.madeira[0]);R(g,L.w-7,0,1,L.h,COR.madeira[2]);
  R(g,0,L.h-6,L.w,6,COR.madeira[0]);R(g,0,L.h-7,L.w,1,COR.madeira[2]);R(g,tx-PORTA.w/2,L.h-7,PORTA.w,7,'#3a2420');
  return chao=window.PALETA_JOGO?PALETA_JOGO.canvasNaPaleta(c):c}

 /* ---- vitrine da parede: os 5 itens mais caros, com o desenho de quando o personagem segura o item ---- */
 const nichoW=18,nichoH=26;
 function spriteMao(id){const it=ITEMS[id];if(!it)return null;return it.equippedSprite||it.c||null}
 function vitrineParede(t,V=VIT){const x0=V.x0,y0=V.y0,g=ctx,P=PX();
  R(g,x0-2,y0-2,VIT.w+4,VIT.h+4,'#000000');R(g,x0-1,y0-1,VIT.w+2,VIT.h+2,COR.ouro[1]);R(g,x0-1,y0-1,VIT.w+2,1,COR.ouro[2]);R(g,x0,y0,VIT.w,VIT.h,COR.madeira[0]);
  const itens=window.VIAJANTE&&VIAJANTE.maisCaros?VIAJANTE.maisCaros(5):[];
  for(let k=0;k<5;k++){const nx=x0+3+k*(nichoW+2),ny=y0+3,o=itens[k];
   R(g,nx,ny,nichoW,nichoH,COR.noite[0]);R(g,nx,ny+nichoH-3,nichoW,3,COR.noite[1]);
   if(o){const s=spriteMao(o.id);
    if(s&&s.width){let k2=Math.min(1,(nichoW-2)/s.width,(nichoH-5)/s.height);if(k2<1)k2=1/Math.ceil(1/k2); // reduz por inteiro: continua pixel
     const w=Math.max(1,Math.round(s.width*k2)),h=Math.max(1,Math.round(s.height*k2)),flut=Math.round(Math.sin(t*1.6+k)*1);
     g.imageSmoothingEnabled=false;g.drawImage(s,Math.round(nx+(nichoW-w)/2),Math.round(ny+nichoH-4-h+flut),w,h)}
    // joia com a cor da qualidade e a etiqueta de preço
    if(o.q!=null&&typeof QCOL!=='undefined'&&typeof qi==='function'){R(g,nx+1,ny+1,3,3,'#000000');R(g,nx+1,ny+1,2,2,QCOL[qi(o.q)])}
    if(P){const pr=o.preco>=10000?Math.round(o.preco/1000)+'K':String(o.preco);R(g,nx,ny+nichoH+1,nichoW,6,'#000000');P.num(g,pr,nx+nichoW/2,ny+nichoH+1,COR.ouro[2])}}
   else if(P){R(g,nx,ny+nichoH+1,nichoW,6,'#000000');P.num(g,'-',nx+nichoW/2,ny+nichoH+1,COR.osso[0])}
   // vidro: reflexo que passa devagar
   const rf=Math.floor((t*8+k*9)%60)-10;if(rf>=0&&rf<nichoW-2){g.globalAlpha=.35;R(g,nx+rf,ny,1,nichoH,'#ffffff');R(g,nx+rf+2,ny,1,nichoH,'#ffffff');g.globalAlpha=1}
   R(g,nx,ny,nichoW,1,COR.aco[2]+'80');R(g,nx+nichoW,ny,2,nichoH,COR.ouro[0])}
  if(P)P.texto(g,'TESOUROS',x0+VIT.w/2,y0-8,COR.ouro[2],'#000000')}
 // balcão de madeira com tampo claro, livro de contas e balança
 function balcao(B=BALCAO){const g=ctx,{x0,x1,y0,y1}=B,w=x1-x0;
  R(g,x0-1,y0-1,w+2,y1-y0+2,'#000000');R(g,x0,y0,w,y1-y0,COR.madeira[1]);R(g,x0,y0,w,4,COR.madeira[2]);R(g,x0,y0+4,w,1,COR.madeira[0]);
  for(let x=x0+4;x<x1-10;x+=16){R(g,x,y0+7,12,7,COR.madeira[0]);R(g,x+1,y0+8,10,1,COR.madeira[2])}
  R(g,x0+10,y0-3,10,4,'#000000');R(g,x0+11,y0-3,8,3,COR.osso[2]);R(g,x0+15,y0-3,1,3,COR.sangue[1]);
  R(g,x1-20,y0-8,1,8,COR.ouro[0]);R(g,x1-25,y0-8,11,1,COR.ouro[1]);R(g,x1-25,y0-6,3,2,COR.ouro[2]);R(g,x1-17,y0-5,3,2,COR.ouro[2])}
 // vitrine de pé: caixa de vidro sobre um móvel, com uma curiosidade mágica girando
 const CURIOS=[{c:[COR.agua[0],COR.agua[2],'#ffffff']},{c:[COR.magia[0],COR.magia[2],'#ffffff']}];
 function vitrinePe(v,k,t){const g=ctx,x=v.x,y=v.y;
  R(g,x-11,y-12,22,12,'#000000');R(g,x-10,y-11,20,10,COR.madeira[1]);R(g,x-10,y-11,20,1,COR.madeira[2]);R(g,x-8,y-8,16,5,COR.madeira[0]);
  R(g,x-11,y-30,22,19,'#000000');R(g,x-10,y-29,20,17,'#1a1a2e');
  const c=CURIOS[k].c,by=Math.round(y-22+Math.sin(t*2+k)*1.5);
  if(k===0){for(let i=0;i<7;i++){const w=i<3?i:6-i;R(g,x-w,by-3+i,w*2+1,1,i===0||i===6?'#000000':c[1])}R(g,x,by-1,1,2,c[2])}
  else{R(g,x-3,by-3,7,7,'#000000');R(g,x-2,by-2,5,5,c[1]);R(g,x-1,by-1,2,2,c[2]);for(let i=0;i<3;i++){const a=t*2+i*2.1;R(g,Math.round(x+Math.cos(a)*6),Math.round(by+Math.sin(a)*2),1,1,c[2])}}
  g.globalAlpha=.3;R(g,x-9,y-28,1,15,'#ffffff');R(g,x-7,y-28,1,6,'#ffffff');g.globalAlpha=1;R(g,x-11,y-31,22,2,COR.ouro[1])}
 // lampião pendurado no teto
 function lampiao(x,y){R(ctx,x,y-14,1,8,'#000000');R(ctx,x-2,y-6,5,6,'#000000');R(ctx,x-1,y-5,3,4,'#f7b84a');R(ctx,x,y-4,1,2,'#fffbf0')}

 function bloqueia(x,y){
  if(x>BALCAO.x0-4&&x<BALCAO.x1+4&&y<BALCAO.y1+3)return true; // balcão e a área de trás (do Viajante)
  for(const v of VITRINES)if(Math.abs(x-v.x)<13&&y>v.y-14&&y<v.y+3)return true;
  for(const e of DECOR){const t=tipoEl(e);if(t&&t.blocks&&!ehBancoDecor(e)&&Math.hypot(x-e.x,(y-e.y)*1.3)<Math.max(5,t.radius||6))return true}
  return false}

 // o Viajante mora aqui agora (antes ficava no pátio do bar)
 if(window.VIAJANTE&&VIAJANTE.npc){Object.assign(VIAJANTE.npc,{x:NPC.x,y:NPC.y,vaga:VAGA,fx:0,fy:1})}
 function registrar(){if(!window.CONSTRUCOES)return;
  CONSTRUCOES.registrar({id:'loja',cena:'taverna',x:L.x,y:L.y,w:L.w,h:L.h,fachada:32,beiral:14,colisao:false,muro:{alt:20,tabuas:true},
   telhado:{sombra:'#2a2a52',base:'#3d5a8c',luz:'#6e9cc4',cumeeira:'#1f1a1a'},
   portas:[{lado:'s',x:PORTA.x,w:PORTA.w}],janelas:[L.x+34,L.x+L.w-34],placa:{texto:'LOJA DO VIAJANTE',cor:'#efc56a'},
   extra(g,a){const P=PX();// tabuleta pendurada com a mochila do Viajante, balançando
    const x=PORTA.x+44,y=L.y+L.h-34,b=Math.round(Math.sin(time*1.5)*1);R(g,x-1,y-6,1,6,'#000000');R(g,x+10,y-6,1,6,'#000000');
    R(g,x-3+b,y,16,13,'#000000');R(g,x-2+b,y+1,14,11,COR.madeira[1]);R(g,x+1+b,y+3,8,7,'#000000');R(g,x+2+b,y+4,6,5,COR.madeira[2]);R(g,x+4+b,y+2,2,2,COR.ouro[2]);
    const nk=window.TEMPO?TEMPO.escuro():0;if(nk>.05&&P)P.luz(g,PORTA.x,L.y+L.h-14,26,'#f7b84a',a*nk*.5)}})}

 window.LOJA_VIAJANTE={L,PORTA,
  contem:dentro,
  dentro:()=>typeof p!=='undefined'&&dentro(p.x,p.y),
  walk(x,y){if(Math.abs(x-PORTA.x)<PORTA.w/2-1&&y>=L.y+L.h-10)return true; // porta
   if(x<L.x+9||x>L.x+L.w-9||y<L.y+PAREDE+2||y>L.y+L.h-9)return false;return!bloqueia(x,y)},
  chao(){ctx.drawImage(chao||desenharChao(),L.x,L.y)},
  objetos(Lst){const t=time;
   Lst.push([L.y+PAREDE-1,()=>vitrineParede(t)]);Lst.push([BALCAO.y1,balcao]);
   VITRINES.forEach((v,k)=>Lst.push([v.y,()=>vitrinePe(v,k,t)]));for(const e of DECOR)Lst.push([e.y,()=>desenharElem(ctx,e)]);
   Lst.push([L.y+L.h-1,()=>{lampiao(L.x+60,L.y+PAREDE+14);lampiao(L.x+L.w-60,L.y+PAREDE+14)}])},
  luzes:()=>[{x:L.x+60,y:L.y+PAREDE+10,r:70,a:.8},{x:L.x+L.w-60,y:L.y+PAREDE+10,r:70,a:.8},{x:NPC.x,y:VIT.y0+14,r:60,a:.6}],
  // brilho das luzes de dentro (some com o telhado)
  brilho(){const a=window.CONSTRUCOES?1-CONSTRUCOES.alfa('loja'):1,P=PX();if(a<=.01||!P)return;
   P.luz(ctx,L.x+60,L.y+PAREDE+10,40,'#f7b84a',a*.3);P.luz(ctx,L.x+L.w-60,L.y+PAREDE+10,40,'#f7b84a',a*.3);P.luz(ctx,VIT.x0+VIT.w/2,VIT.y0+16,44,'#efc56a',a*(.22+.05*Math.sin(time*2)));
   VITRINES.forEach((v,k)=>P.luz(ctx,v.x,v.y-22,16,k?'#b07ad8':'#6e9cc4',a*.4))},
  // clique na vitrine da parede: fala com o Viajante
  click(w,mode){if(mode==2||!window.VIAJANTE)return false;if(w.x>=VIT.x0&&w.x<=VIT.x0+VIT.w&&w.y>=VIT.y0-10&&w.y<=VIT.y0+VIT.h+8){return VIAJANTE.click({x:NPC.x,y:NPC.y-10},mode)}return false},
  minimapa(mm,at,k){const [x,y]=at(L.x,L.y);mm.drawImage(chao||desenharChao(),x,y,L.w*k,L.h*k)},
  // Engine (cena Cidade): peças móveis em volta de (0,0)
  pecas:{'npc-viajante':{w:64,h:90,ox:-32,oy:-78,fn:()=>window.VIAJANTE&&VIAJANTE.desenhar(0,0,1.2)},
   'balcao-loja':{w:90,h:30,ox:-45,oy:-26,fn:()=>balcao({x0:-38,x1:38,y0:-16,y1:0})},
   'vitrine-parede':{w:112,h:52,ox:-56,oy:-12,fn:()=>vitrineParede(1,{x0:-52,y0:0,w:104,h:34})},
   'vitrine-pe':{w:30,h:40,ox:-15,oy:-34,fn:()=>vitrinePe({x:0,y:0},0,1)}}};
 if(document.readyState==='complete')registrar();else addEventListener('load',registrar);
})();
