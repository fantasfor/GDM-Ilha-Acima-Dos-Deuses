/* ---------- Layout da Taverna e do pátio do bar (2026-10-28, pedido do usuário) ----------
   Tudo o que se edita na Engine (cena Taverna), em coordenadas do mundo da taverna: mesas de jogo com as 4 cadeiras
   (posição, lado do encosto e o ponto onde o herói senta), barris, decorações (elementos de mapa "px:..."), NPCs,
   mestres de classe, quadro de missões, lareira e palco. PROJETO.mundo.taverna guarda o layout editado; sem ele vale
   o padrão abaixo, idêntico ao de antes do editor. Paredes, balcão e porta continuam fixos (js/taverna.js).
   Lido por js/mesas.js, js/bar.js e js/taverna.js (carregue antes deles). */
(function(){
 const OX=24,OY=24,TW=480,TH=320,PX=OX+TW,PY=OY-20,BW=440,BH=360; // o pátio do bar começa em (PX, PY)
 // cadeiras: o = lado (0 atrás/norte, 1 direita, 2 frente/sul, 3 esquerda); dx/dy = posição em relação ao centro da
 // mesa; sx/sy = ponto onde o herói senta, em relação à cadeira
 const cadeiras=lista=>lista.map(([dx,dy,o,sy])=>({dx,dy,o,sx:0,sy}));
 const CAD_TAV=[[0,-15,0,0],[21,1,1,0],[0,14,2,0],[-21,1,3,0]],CAD_BAR=[[0,-17,0,-2],[25,2,1,-2],[0,17,2,-2],[-25,2,3,-2]];
 const ELEM=[['pk_bar_arvore',26,64],['pk_bar_arvore',412,346],['pk_bar_arvore',30,356],['pk_bar_churrasqueira',262,80],['pk_bar_barril',432,96],['pk_bar_barril',432,116],['pk_bar_caixas',282,112],
  ['pk_bar_chafariz',338,214],['pk_bar_fogueira',350,306],['pk_bar_banco',350,286],['pk_bar_banco',350,334],['pk_bar_guarda_sol',140,120],['pk_bar_mesa',140,124],['pk_bar_guarda_sol',236,128],['pk_bar_mesa',236,132],
  ['pk_bar_lampiao',24,182],['pk_bar_lampiao',262,196],['pk_bar_lampiao',262,352],['pk_bar_lampiao',424,182],['pk_bar_lampiao',120,182],['pk_bar_placa',50,150],['pk_bar_vaso',14,214],['pk_bar_vaso',282,262],['pk_bar_vaso',282,300],['pk_bar_vaso',404,252],['pk_bar_vaso',300,160],
  ['pk_bar_bandeirinhas',30,30],['pk_bar_bandeirinhas',94,30],['pk_bar_bandeirinhas',158,30],['pk_bar_bandeirinhas',222,30],['pk_bar_bandeirinhas',44,196],['pk_bar_bandeirinhas',108,196],['pk_bar_bandeirinhas',172,196]];
 const PADRAO={v:1,
  mesas:[...[[112,150],[232,180],[352,142],[100,244],[212,262]].map(([x,y],k)=>({id:'tav'+(k+1),estilo:'redonda',x:OX+x,y:OY+y,cadeiras:cadeiras(CAD_TAV)})),
   ...[[86,236],[196,236],[86,322],[196,322]].map(([x,y],k)=>({id:'bar'+(k+1),estilo:'jogo',x:PX+x,y:PY+y,cadeiras:cadeiras(CAD_BAR)}))],
  barris:[[462,92],[462,112],[450,102],[26,300]].map(([x,y])=>({x:OX+x,y:OY+y})),
  // o desenho do pacote ficava 2 px mais alto que o dos elementos de mapa: +2 no y mantém o mesmo lugar
  decor:ELEM.map(([id,x,y])=>({type:'px:'+id,x:PX+x,y:PY+y+2})),
  npcs:{lanceiro:{x:OX+232,y:OY+102},bardo:{x:OX+380,y:OY+262},tambor:{x:OX+428,y:OY+252},barman:{x:PX+360,y:PY+54},viajante:{x:PX+96,y:PY+100}},
  mestres:[[36,118],[36,170],[36,220],[292,100],[160,206],[300,240],[36,270],[150,300],[300,296]].map(([x,y])=>({x:OX+x,y:OY+y})),
  quadro:{x:OX+314,y:OY+40},lareira:{x:OX+414,y:OY+44},palco:{x0:OX+330,y0:OY+216,x1:OX+TW-12,y1:OY+290}};
 const clone=o=>JSON.parse(JSON.stringify(o));
 const num=(v,d)=>Number.isFinite(+v)&&v!==''&&v!=null?Math.round(+v):d;
 const ponto=(o,d)=>({x:num(o&&o.x,d.x),y:num(o&&o.y,d.y)});
 /* layout do projeto com o padrão no que faltar (ou estiver estragado); ids de mesa únicos no formato das regras do
    Firebase (bar1..bar99 / tav1..tav99) */
 function normalizar(src){
  const L=clone(PADRAO);if(!src||typeof src!=='object')return L;
  if(Array.isArray(src.mesas)){const usados=new Set();
   L.mesas=src.mesas.filter(m=>m&&typeof m==='object').slice(0,40).map((m,k)=>{
    let id=/^(bar|tav)[0-9]{1,2}$/.test(m.id)&&!usados.has(m.id)?m.id:null;
    if(!id)for(let n=1;n<100&&!id;n++)if(!usados.has('tav'+n)&&!src.mesas.some(o=>o&&o.id==='tav'+n))id='tav'+n;
    usados.add(id);const estilo=m.estilo==='jogo'?'jogo':'redonda',base=estilo==='jogo'?CAD_BAR:CAD_TAV;
    const cad=Array.isArray(m.cadeiras)?m.cadeiras:[];
    return{id,estilo,x:num(m.x,OX+40),y:num(m.y,OY+120),cadeiras:base.map(([dx,dy,o,sy],i)=>{const c=cad[i]||{};return{dx:num(c.dx,dx),dy:num(c.dy,dy),o:[0,1,2,3].includes(+c.o)?+c.o:o,sx:num(c.sx,0),sy:num(c.sy,sy)}})}}).filter(m=>m.id)}
  if(Array.isArray(src.barris))L.barris=src.barris.filter(Boolean).map(b=>ponto(b,{x:OX+40,y:OY+120}));
  if(Array.isArray(src.decor))L.decor=src.decor.filter(e=>e&&typeof e.type==='string').map(e=>({type:e.type,...ponto(e,{x:OX+40,y:OY+120})}));
  if(src.npcs&&typeof src.npcs==='object')for(const k in L.npcs)if(src.npcs[k])L.npcs[k]=ponto(src.npcs[k],L.npcs[k]);
  if(Array.isArray(src.mestres))L.mestres=src.mestres.filter(Boolean).map(m=>ponto(m,{x:OX+40,y:OY+120}));
  for(const k of ['quadro','lareira'])if(src[k])L[k]=ponto(src[k],L[k]);
  if(src.palco){const p=src.palco,x0=num(p.x0,L.palco.x0),y0=num(p.y0,L.palco.y0);L.palco={x0,y0,x1:Math.max(x0+40,num(p.x1,L.palco.x1)),y1:Math.max(y0+30,num(p.y1,L.palco.y1))}}
  return L}
 /* ---- geometria das cadeiras (o mesmo desenho de js/taverna.js e js/bar.js) ---- */
 const cadeiraEm=(m,i)=>{const c=m.cadeiras[i];return{x:m.x+c.dx,y:m.y+c.dy}};
 const lugarEm=(m,i)=>{const c=m.cadeiras[i];return{x:m.x+c.dx+c.sx,y:m.y+c.dy+c.sy}};
 // retângulo do desenho da cadeira (para o destaque "Sentar" ficar exatamente em cima dela)
 function caixaCadeira(m,i){const c=cadeiraEm(m,i),o=m.cadeiras[i].o;
  if(m.estilo==='jogo')return o===0?{x:c.x-7,y:c.y-18,w:14,h:21}:o===1?{x:c.x-7,y:c.y-18,w:17,h:21}:o===3?{x:c.x-10,y:c.y-18,w:17,h:21}:{x:c.x-7,y:c.y-13,w:14,h:16};
  return o===1||o===3?{x:c.x-5,y:c.y-14,w:10,h:17}:{x:c.x-5,y:c.y-12,w:10,h:15}}
 const LAYOUT=normalizar(typeof PROJETO!=='undefined'&&PROJETO.mundo?PROJETO.mundo.taverna:null);
 window.TAVERNA_LAYOUT={OX,OY,TW,TH,PX,PY,BW,BH,L:LAYOUT,padrao:()=>clone(PADRAO),normalizar,cadeiraEm,lugarEm,caixaCadeira,
  // dentro da taverna ou no pátio (mesas e decorações só valem nessas áreas)
  dentro:(x,y)=>x>=OX&&x<OX+TW&&y>=OY&&y<OY+TH||x>=PX&&x<PX+BW&&y>=PY&&y<PY+BH,
  noPatio:(x,y)=>x>=PX&&x<PX+BW&&y>=PY&&y<PY+BH};
})();
