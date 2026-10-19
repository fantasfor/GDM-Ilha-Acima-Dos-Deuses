/* ---------- Padrão de proporção do jogo (carregado pelo jogo e pela Engine) ----------
   Mundo: 1 pixel do desenho = 1 pixel do mundo para herói, NPCs, monstros, chefes e itens no chão; nada é ampliado ou
   reduzido na hora de desenhar, o tamanho vem do próprio desenho. Assim todo pixel na tela tem o mesmo tamanho.
   Ícones (itens, habilidades, passivas, efeitos): 16×16, mostrados a 2× (32 px) na interface.
   Armas na mão: 1 pixel do desenho = 1 pixel do herói (escalaMao 2). Itens no chão sem desenho próprio: ícone reduzido a 8×8.
   Monstros: quadro do tamanho da classe (o corpo ocupa a parte de baixo, com os pés na base; sobra espaço para o golpe). */
(function(){
 const PROPORCAO={
  ICONE:16,CHAO:8,
  HEROI:{altura:25,largura:16}, // corpo do herói (sem arma), para comparar
  MONSTRO:{
   pequeno:{nome:'Pequeno',quadro:[16,16],corpo:'até 12 px de altura',exemplo:'rato, morcego, gosma, toco vivo'},
   medio:{nome:'Médio',quadro:[32,32],corpo:'13 a 26 px (até o tamanho do herói)',exemplo:'goblin, orc, soldado, colmeia'},
   grande:{nome:'Grande',quadro:[48,48],corpo:'27 a 40 px',exemplo:'ogro, urso, cogumelo gigante'},
   chefe:{nome:'Chefe',quadro:[64,64],corpo:'41 a 62 px (64×64 é o máximo)',exemplo:'Lorde Goblin, dragão jovem'}
  },
  MAX:64
 };
 /* Reduz pixel art sem borrar: cada pixel novo fica com a cor mais comum do bloco que ele cobre
    (transparente quando o bloco tem mais vazio que cor). w×h = tamanho final. */
 function reduzirArte(src,w,h){
  w=Math.max(1,Math.round(w));h=Math.max(1,Math.round(h));
  const sw=src.width,sh=src.height,o=document.createElement('canvas');o.width=w;o.height=h;
  const t=document.createElement('canvas');t.width=sw;t.height=sh;const tg=t.getContext('2d');tg.drawImage(src,0,0);
  const d=tg.getImageData(0,0,sw,sh).data,g=o.getContext('2d'),im=g.createImageData(w,h),fx=sw/w,fy=sh/h;
  for(let j=0;j<h;j++)for(let i=0;i<w;i++){
   const x0=Math.floor(i*fx),x1=Math.max(x0+1,Math.floor((i+1)*fx)),y0=Math.floor(j*fy),y1=Math.max(y0+1,Math.floor((j+1)*fy));
   const cont=new Map();let cheio=0,total=0,melhor=-1,mais=0;
   for(let y=y0;y<y1&&y<sh;y++)for(let x=x0;x<x1&&x<sw;x++){total++;const k=(y*sw+x)*4;if(d[k+3]<128)continue;cheio++;
    const c=d[k]<<16|d[k+1]<<8|d[k+2],n=(cont.get(c)||0)+1;cont.set(c,n);if(n>mais){mais=n;melhor=c}}
   if(!cheio||cheio*2<total)continue;
   const p=(j*w+i)*4;im.data[p]=melhor>>16&255;im.data[p+1]=melhor>>8&255;im.data[p+2]=melhor&255;im.data[p+3]=255;
  }
  g.putImageData(im,0,0);return o;
 }
 /* Cabe num quadro w×h: reduz mantendo a proporção (só se for maior) e centraliza; com base=true os pés ficam embaixo. */
 function ajustarArte(src,w,h,{base=false}={}){
  const k=Math.min(1,w/src.width,h/src.height),r=k<1?reduzirArte(src,src.width*k,src.height*k):src;
  const o=document.createElement('canvas');o.width=w;o.height=h;const g=o.getContext('2d');g.imageSmoothingEnabled=false;
  g.drawImage(r,Math.floor((w-r.width)/2),base?h-r.height:Math.floor((h-r.height)/2));return o;
 }
 window.PROPORCAO=PROPORCAO;window.reduzirArte=reduzirArte;window.ajustarArte=ajustarArte;
})();
