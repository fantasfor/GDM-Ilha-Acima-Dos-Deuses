/* ---------- pixel art novo: pintor com sombreamento e contorno automáticos ---------- */
function paint(w,h,draw,c){c=c||mkCanvas(w,h);c.width=w;c.height=h;const x=c.getContext('2d');
 const R=(a,b,ww,hh,col)=>{x.fillStyle=col;x.fillRect(a,b,ww,hh)},
 E=(cx,cy,rx,ry,col)=>{x.fillStyle=col;for(let j=Math.floor(cy-ry);j<=cy+ry;j++)for(let i=Math.floor(cx-rx);i<=cx+rx;i++)if(((i+.5-cx)/rx)**2+((j+.5-cy)/ry)**2<=1)x.fillRect(i,j,1,1)};
 draw(R,E);
 const im=x.getImageData(0,0,w,h),d=im.data,o=new Uint8ClampedArray(d),A=(i,j)=>i>=0&&j>=0&&i<w&&j<h&&d[(j*w+i)*4+3]>0;
 for(let j=0;j<h;j++)for(let i=0;i<w;i++){const p=(j*w+i)*4;
  if(d[p+3]){const f=!A(i,j-1)?1.3:!A(i,j+1)?.7:!A(i-1,j)?1.12:!A(i+1,j)?.85:1;for(let k=0;k<3;k++)o[p+k]=Math.min(255,d[p+k]*f)}
  else if(A(i-1,j)||A(i+1,j)||A(i,j-1)||A(i,j+1)){o[p]=27;o[p+1]=18;o[p+2]=38;o[p+3]=255}}
 x.putImageData(new ImageData(o,w,h),0,0);return c}
const one=c=>({d:c,u:c,s:c,ds:c,us:c,w:null});
const ART={
 sl:()=>paint(18,14,(R,E)=>{E(9,8,8,5,'#58c75e');E(9,10,7,3,'#49b152');R(4,4,3,2,'#d6ffd0');R(5,6,3,4,'#fff');R(10,6,3,4,'#fff');R(6,7,2,3,'#111');R(11,7,2,3,'#111');R(8,11,3,1,'#1f6b2c');R(13,10,1,1,'#9be99a')}),
 wolf:()=>paint(26,17,(R,E)=>{E(11,9,8,4,'#8a8f9a');E(11,10,5,2,'#b6bbc6');E(19,7,4,3,'#9aa0ac');R(21,8,4,2,'#aeb4c0');R(18,3,2,3,'#6e7380');R(21,3,2,3,'#6e7380');E(3,7,3,2,'#6e7380');[6,10,14,17].forEach(x=>R(x,12,2,4,'#6e7380'));R(21,6,2,1,'#ff4a3a');R(24,8,1,1,'#222');R(22,10,2,1,'#fff')}),
 bat:()=>paint(24,16,(R,E)=>{E(5,6,5,3,'#5a3a86');E(19,6,5,3,'#5a3a86');E(5,7,3,1,'#7a56b0');E(19,7,3,1,'#7a56b0');R(0,8,3,3,'#5a3a86');R(21,8,3,3,'#5a3a86');E(12,8,3,4,'#3d2a5c');R(10,3,1,3,'#3d2a5c');R(14,3,1,3,'#3d2a5c');R(10,7,1,1,'#ffe14a');R(14,7,1,1,'#ffe14a');R(11,11,1,1,'#fff');R(13,11,1,1,'#fff')}),
 spider:()=>paint(22,16,(R,E)=>{for(let k=0;k<4;k++){const y=3+k*3;R(2,y,5,1,'#2a1c1c');R(1,y+1,1,2,'#2a1c1c');R(15,y,5,1,'#2a1c1c');R(20,y+1,1,2,'#2a1c1c')}E(11,9,4,3,'#3a2a2a');E(11,5,3,2,'#4a3636');R(10,8,2,2,'#c0392b');R(10,4,1,1,'#f33');R(12,4,1,1,'#f33')}),
 shroom:()=>paint(18,20,(R,E)=>{R(6,11,6,8,'#e8dcc0');E(9,7,8,5,'#c0392b');R(2,10,14,1,'#8f2a20');R(5,5,2,2,'#f4ecd8');R(10,4,3,2,'#f4ecd8');R(12,8,2,2,'#f4ecd8');R(7,8,1,1,'#f4ecd8');R(7,13,1,2,'#222');R(10,13,1,2,'#222');R(5,18,3,2,'#c9bd9c');R(10,18,3,2,'#c9bd9c')}),
 crab:()=>paint(22,15,(R,E)=>{E(11,9,6,4,'#e0662a');E(3,6,3,3,'#f08a3a');E(19,6,3,3,'#f08a3a');R(5,8,3,1,'#e0662a');R(14,8,3,1,'#e0662a');R(8,3,1,3,'#f08a3a');R(13,3,1,3,'#f08a3a');R(8,2,2,2,'#fff');R(13,2,2,2,'#fff');R(9,3,1,1,'#111');R(14,3,1,1,'#111');R(5,12,1,3,'#b84a1a');R(8,13,1,2,'#b84a1a');R(14,13,1,2,'#b84a1a');R(17,12,1,3,'#b84a1a')}),
 ghost:()=>paint(18,22,(R,E)=>{E(9,9,6,7,'#dfe8f5');R(3,10,12,9,'#dfe8f5');R(3,19,3,2,'#c5d2e6');R(8,19,2,2,'#c5d2e6');R(12,19,3,2,'#c5d2e6');R(6,8,2,3,'#1b2a4a');R(11,8,2,3,'#1b2a4a');R(8,13,3,2,'#1b2a4a')}),
 goblin:()=>paint(18,22,(R,E)=>{R(5,16,3,5,'#3f7a2a');R(10,16,3,5,'#3f7a2a');R(5,10,8,7,'#6a4a2a');R(3,11,2,5,'#7bbf45');R(13,11,2,5,'#7bbf45');E(9,6,5,4,'#7bbf45');R(1,5,4,2,'#7bbf45');R(14,5,4,2,'#7bbf45');R(6,5,2,2,'#ffe14a');R(10,5,2,2,'#ffe14a');R(7,8,4,1,'#2a1a10');R(15,13,1,5,'#cfd6dd');R(14,17,3,1,'#6a4a2a')}),
 sprout:()=>paint(22,25,(R,E)=>{
  R(7,13,8,9,'#49302d');R(8,16,2,5,'#795045');R(13,17,1,4,'#ba442c');
  R(3,15,4,3,'#49302d');R(2,12,2,5,'#49302d');R(1,11,1,3,'#d1b891');
  R(15,15,4,3,'#49302d');R(18,12,2,5,'#49302d');R(20,11,1,3,'#d1b891');
  R(5,20,4,3,'#49302d');R(3,22,5,2,'#795045');R(13,20,4,3,'#49302d');R(15,22,4,2,'#795045');
  E(11,8,7,6,'#283d30');E(6,10,4,4,'#385439');E(16,10,4,4,'#385439');E(10,5,4,3,'#526341');
  R(4,2,2,5,'#795045');R(3,1,2,2,'#d1b891');R(16,2,2,5,'#795045');R(17,1,2,2,'#d1b891');
  R(10,1,2,3,'#49302d');R(12,1,3,2,'#64734b');
  R(6,10,4,3,'#311722');R(12,10,4,3,'#311722');R(7,11,3,1,'#ff492e');R(12,11,3,1,'#ff492e');
  R(8,11,1,1,'#ffd57a');R(13,11,1,1,'#ffd57a');R(6,9,2,1,'#1b2620');R(14,9,2,1,'#1b2620');
  R(8,14,6,3,'#21191d');R(9,14,1,2,'#e0cfa3');R(12,14,1,2,'#e0cfa3');R(10,16,2,1,'#ad352e')
 }),
 goblinSaw:()=>paint(22,22,(R,E)=>{
  R(6,16,3,5,'#3f7a2a');R(11,16,3,5,'#3f7a2a');
  R(5,10,9,7,'#6a4a2a');R(3,11,3,5,'#7bbf45');R(13,10,3,4,'#7bbf45');
  E(9,6,6,4,'#7bbf45');R(0,5,5,2,'#7bbf45');R(14,5,5,2,'#7bbf45');
  R(6,5,2,2,'#ffe14a');R(11,5,2,2,'#ffe14a');R(7,8,5,1,'#2a1a10');
  R(14,12,2,5,'#6a4a2a');R(14,12,2,1,'#a87942');
  R(16,10,2,2,'#3f474d');R(17,9,2,2,'#3f474d');R(18,8,2,2,'#3f474d');R(19,7,2,2,'#3f474d');
  R(16,10,1,1,'#d7e0df');R(17,9,1,1,'#d7e0df');R(18,8,1,1,'#d7e0df');R(19,7,1,1,'#d7e0df');
  R(16,12,1,1,'#d7e0df');R(18,10,1,1,'#d7e0df')
 })};
const sl2=ART.sl();Object.assign(SP.sl,one(sl2));
paint(24,26,(R,E)=>{R(10,18,4,7,'#7a4a25');R(10,18,1,7,'#9a6a3a');R(9,24,6,1,'#5a3a1a');E(12,9,10,7,'#2d7a37');E(7,13,6,5,'#2d7a37');E(17,13,6,5,'#2d7a37');E(9,7,5,3,'#3f9a47');E(8,6,2,1,'#6cc06a');for(let i=0;i<26;i++)R(4+(i*7)%16,4+(i*5)%12,1,1,'#4aa653')},TREE);
['wolf','bat','spider','shroom','crab','ghost','goblin','goblinSaw','sprout'].forEach(id=>{SP[id]=one(ART[id]())});

/* ---------- Ícones de Bosses das DGs (Pixel Art) ---------- */
function makeBossIconGoblin(){
 const c=mkCanvas(40,40),x=c.getContext('2d'),{R,disc}=kit(x);
 x.fillStyle='#130d12';x.fillRect(0,0,40,40);
 // Orelhas pontudas e rasgadas
 R(1,14,7,3,'#224515');R(2,12,6,2,'#366e22');R(0,15,2,1,'#142b0d');
 R(32,14,7,3,'#224515');R(32,12,6,2,'#366e22');R(38,15,2,1,'#142b0d');
 // Chifres superiores da cabeça
 R(10,5,3,6,'#261517');R(8,2,3,4,'#472224');R(6,0,2,3,'#7d2a2a');R(5,0,1,1,'#ba3838');
 R(27,5,3,6,'#261517');R(29,2,3,4,'#472224');R(32,0,2,3,'#7d2a2a');R(34,0,1,1,'#ba3838');
 // Crânio goblin demoníaco
 disc(20,18,10,'#2b571c');disc(20,16,8,'#41802a');
 R(15,10,10,3,'#1f4014');R(18,11,4,1,'#5ca83e');
 // Olhos demoníacos (vermelho escarlate e pupila amarelo ardente)
 R(12,14,4,3,'#140808');R(13,14,3,2,'#ff1e00');R(14,15,1,1,'#ffea3b');
 R(24,14,4,3,'#140808');R(24,14,3,2,'#ff1e00');R(25,15,1,1,'#ffea3b');
 // Nariz achatado e torto
 R(18,17,4,3,'#254c18');R(19,19,1,1,'#13260c');R(20,19,1,1,'#13260c');
 // Boca aberta e sombria
 R(13,22,14,7,'#170606');R(14,23,12,5,'#3a0a0a');
 // Mandíbula inferior pesada
 R(14,28,12,4,'#254c18');R(16,31,8,2,'#1b3611');
 // Dentes afiados internos
 R(16,22,1,2,'#fff');R(19,22,2,1,'#e8dec5');R(23,22,1,2,'#fff');
 R(17,27,1,2,'#fff');R(22,27,1,2,'#fff');
 // CHIFRES NA BOCA / MANDÍBULA (CHIFRES CURVADOS SAINDO DA BOCA)
 // Chifre esquerdo da boca
 R(9,25,5,4,'#45311b');R(7,21,4,5,'#78592d');R(6,17,3,5,'#ab8446');R(5,13,3,5,'#e0bb72');R(5,10,2,4,'#fdf0c7');R(5,9,1,1,'#fff');
 // Chifre direito da boca
 R(26,25,5,4,'#45311b');R(29,21,4,5,'#78592d');R(31,17,3,5,'#ab8446');R(32,13,3,5,'#e0bb72');R(33,10,2,4,'#fdf0c7');R(34,9,1,1,'#fff');
 // Sangue demoníaco escorrendo
 R(19,28,1,3,'#961616');R(20,27,1,2,'#b32020');
 // Ombreiras de ferro pontiagudas
 R(8,33,24,7,'#291a14');R(10,34,20,6,'#473024');R(7,34,3,3,'#6e4a37');R(30,34,3,3,'#6e4a37');
 return c.toDataURL();
}

function makeBossIconSkeleton(){
 const c=mkCanvas(40,40),x=c.getContext('2d'),{R,disc}=kit(x);
 x.fillStyle='#0f1118';x.fillRect(0,0,40,40);
 // Crânio em osso antigo
 disc(20,20,10,'#6d685c');disc(20,19,9,'#aba494');disc(20,18,8,'#eae5d5');
 R(15,25,10,7,'#aba494');R(16,26,8,5,'#eae5d5');
 // Órbitas oculares com chamas espectrais azuis
 R(13,16,5,5,'#0a0f18');R(22,16,5,5,'#0a0f18');
 R(14,17,3,3,'#22aacc');R(23,17,3,3,'#22aacc');
 R(15,18,1,1,'#66ffff');R(24,18,1,1,'#66ffff');
 R(13,15,2,2,'#44ccff');R(24,15,2,2,'#44ccff');
 // Cavidade nasal
 R(19,21,2,3,'#1f1c18');
 // Dentes cerrados do crânio
 for(let i=0;i<4;i++){R(16+i*2,26,1,3,'#fff');R(16+i*2,29,1,2,'#d6d0c0')}
 // Coroa Real Dourada Antiga
 R(10,8,20,4,'#8f6e1f');R(11,7,18,3,'#d9aa2e');R(12,6,16,2,'#fae16d');
 // Pontas da coroa
 R(10,3,3,5,'#d9aa2e');R(11,2,1,2,'#fae16d');
 R(19,1,3,6,'#d9aa2e');R(20,0,1,3,'#fae16d');
 R(27,3,3,5,'#d9aa2e');R(28,2,1,2,'#fae16d');
 // Rubi central na coroa
 R(19,6,3,3,'#ff1e46');R(20,7,1,1,'#ffffff');
 // Manto real e névoa espectral
 R(7,33,26,7,'#221733');R(10,35,20,5,'#442a66');
 return c.toDataURL();
}

function makeBossIconTreant(){
 const c=mkCanvas(40,40),x=c.getContext('2d'),{R,disc}=kit(x);
 x.fillStyle='#140e0b';x.fillRect(0,0,40,40);
 // Galhos demoníacos no topo (chifres de madeira)
 R(6,4,3,8,'#361f14');R(4,1,3,5,'#5c3722');R(3,0,1,2,'#8c5838');
 R(31,4,3,8,'#361f14');R(33,1,3,5,'#5c3722');R(36,0,1,2,'#8c5838');
 // Folhas e espinhos de sangue
 R(7,2,2,2,'#a32418');R(31,2,2,2,'#a32418');R(10,5,2,3,'#3a542b');R(28,5,2,3,'#3a542b');
 // Tronco ancestral demoníaco
 disc(20,20,11,'#361f14');disc(20,19,10,'#5c3722');disc(20,18,8,'#805032');
 // Casca rachada e veios incandescentes
 R(18,9,4,3,'#361f14');R(19,12,2,4,'#bf3b1d');
 // Olhos de fogo vulcânico
 R(12,15,5,4,'#1a0804');R(13,16,4,2,'#ff3300');R(14,16,2,1,'#ffcc00');
 R(23,15,5,4,'#1a0804');R(23,16,4,2,'#ff3300');R(24,16,2,1,'#ffcc00');
 // Boca na casca com presas de madeira negra
 R(13,23,14,6,'#1a0804');R(14,24,12,4,'#471207');
 R(15,23,2,2,'#fff');R(23,23,2,2,'#fff');R(18,27,4,1,'#ffaa00');
 // Raízes e musgo escuro
 R(8,32,24,8,'#29160e');R(12,33,16,7,'#4a291b');R(9,34,3,3,'#2d4a22');R(28,34,3,3,'#2d4a22');
 return c.toDataURL();
}

function makeBossIconSpider(){
 const c=mkCanvas(40,40),x=c.getContext('2d'),{R,disc}=kit(x);
 x.fillStyle='#120a14';x.fillRect(0,0,40,40);
 // Pernas traseiras da aranha arqueando
 R(4,5,3,10,'#291226');R(3,2,3,5,'#4d1d46');R(2,0,2,3,'#802f74');
 R(33,5,3,10,'#291226');R(34,2,3,5,'#4d1d46');R(36,0,2,3,'#802f74');
 // Carapaça quitinosa da rainha
 disc(20,19,11,'#210e20');disc(20,18,9,'#3b1838');disc(20,17,7,'#592455');
 // Cluster de 8 olhos rubis ameaçadores
 // Dois olhos centrais grandes
 R(16,14,3,3,'#ff0033');R(17,14,1,1,'#fff');
 R(21,14,3,3,'#ff0033');R(22,14,1,1,'#fff');
 // Olhos secundários ao redor
 R(13,13,2,2,'#d60029');R(25,13,2,2,'#d60029');
 R(14,17,2,2,'#ff2255');R(24,17,2,2,'#ff2255');
 R(18,12,2,1,'#ff3366');R(20,12,2,1,'#ff3366');
 // Quelíceras / Presas colossais
 R(14,21,4,7,'#170b16');R(14,22,3,6,'#451838');
 R(22,21,4,7,'#170b16');R(23,22,3,6,'#451838');
 // Pontas afiadas das presas curvando para dentro
 R(16,27,3,4,'#e0d0b0');R(18,29,2,3,'#fff');
 R(21,27,3,4,'#e0d0b0');R(20,29,2,3,'#fff');
 // Veneno ácido verde escorrendo
 R(18,32,2,4,'#33ff55');R(19,36,1,3,'#aaff99');
 R(21,31,1,2,'#33ff55');
 return c.toDataURL();
}

function makeBossIconPhantom(){
 const c=mkCanvas(40,40),x=c.getContext('2d'),{R,disc}=kit(x);
 x.fillStyle='#0a0a17';x.fillRect(0,0,40,40);
 // Capuz e manto espectral
 disc(20,18,11,'#1b1330');disc(20,17,10,'#2e1f52');disc(20,15,8,'#48327d');
 // Cavidade do rosto: vácuo cósmico
 disc(20,19,7,'#07050d');R(16,17,8,6,'#07050d');
 // Olhos astrais brilhando em ciano celestial
 R(15,18,3,2,'#4eedff');R(16,18,1,1,'#ffffff');R(15,16,1,4,'rgba(78,238,255,0.4)');
 R(22,18,3,2,'#4eedff');R(23,18,1,1,'#ffffff');R(24,16,1,4,'rgba(78,238,255,0.4)');
 // Runas flutuantes arcanas ao redor da cabeça
 R(6,12,2,3,'#b87eff');R(7,11,3,1,'#b87eff');
 R(32,12,2,3,'#52e5ff');R(31,13,3,1,'#52e5ff');
 R(19,5,2,2,'#ffffff');
 // Broche místico e dobras do manto
 R(18,27,4,4,'#7a38cc');R(19,28,2,2,'#e0aaff');
 R(7,30,26,10,'#171029');R(9,32,22,8,'#2a1c47');
 return c.toDataURL();
}

window.DG_BOSS_ICONS = {
 goblin: makeBossIconGoblin(),
 skeleton: makeBossIconSkeleton(),
 treant: makeBossIconTreant(),
 spider: makeBossIconSpider(),
 phantom: makeBossIconPhantom()
};

