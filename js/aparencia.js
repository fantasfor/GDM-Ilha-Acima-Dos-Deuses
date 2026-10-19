/* ---------- Aparência do personagem: corpo, cabelo e cores ----------
   O corpo (masculino e feminino; direções d, ds, u, us, s; passos 0, 1, 2) e cada estilo de cabelo (direções) são pixel art
   16x26 em tamanho real, na mesma grade do herói (js/sprites.js human), a partir do molde de frente feito na Engine. O projeto pode trocar qualquer desenho em Artes do jogo › Aparência
   (PROJETO.artes "aparencia/corpo-m-d-0", "aparencia/cabelo-curto-d"...); sem desenho, vale o gerado aqui.
   Os desenhos usam cores de referência (REF): pele, cabelo e olhos. O jogo troca cada uma, com os tons mais claros e
   mais escuros dela, pela cor que o jogador escolheu (qualquer cor). Estilos e cores sugeridas: PROJETO.mundo.aparencia. */
(function(){
 const REF={pele:'#f2c28b',cabelo:'#4a2c14',olhos:'#111111'};
 const PADRAO={m:{pele:'#f2c28b',cabelo:'#4a2c14',olhos:'#4a9a3a',estilo:'curto'},f:{pele:'#f2c28b',cabelo:'#8a3b1c',olhos:'#4a9a3a',estilo:'longo'}};
 const ESTILOS=[{id:'curto',nome:'Curto'},{id:'longo',nome:'Longo'},{id:'rabo',nome:'Rabo de cavalo'},{id:'moicano',nome:'Moicano'},{id:'espetado',nome:'Espetado'},{id:'careca',nome:'Careca'}];
 const CORES={
  pele:['#f2c28b','#ffdbb5','#e0a878','#c68650','#9a6438','#6b4226','#4a2c1a'],
  cabelo:['#4a2c14','#8a3b1c','#1a1412','#d9b45a','#f0e0b0','#c0c0c8','#b8323a','#3a5ac8','#3fa05a'],
  olhos:['#4a9a3a','#3a2414','#2a5ab8','#111111','#7a7a86','#8a2fb8']};
 const DIRS=['d','ds','u','us','s'],FASES=[0,1,2];
 const cfg=()=>(window.PROJETO&&PROJETO.mundo&&PROJETO.mundo.aparencia)||{};
 const hex=c=>/^#[0-9a-f]{6}$/i.test(c||'')?c.toLowerCase():null;
 // com o personagem Mana Seed (js/heroi-mana.js) os estilos e as cores sugeridas são os dele
 const mana=()=>window.HEROI_MANA||null;
 function estilos(){const l=cfg().estilos;return Array.isArray(l)&&l.length?l.filter(e=>e&&e.id).map(e=>({id:String(e.id),nome:e.nome||e.id})):mana()?mana().ESTILOS:ESTILOS}
 function cores(){const c=cfg().cores||{},o={},s=mana()&&mana().sugestoes||{};for(const k in CORES){const v=Array.isArray(c[k])?c[k].map(hex).filter(Boolean):[];o[k]=v.length?v:s[k]&&s[k].length?s[k]:CORES[k]}return o}

 /* ---- desenhos gerados (cores de referência) ----
    Grade 16×26 em tamanho real (1 pixel = 1 pixel do mundo), feita a partir do molde de frente desenhado na Engine:
    cabeça x3–12 y1–10 (olhos brancos com íris em y6, boca em y9), pescoço y11, ombros y12, tronco x4–11 y13–17,
    braços x2 e x13 com mãos em y17–18, cintura (linha) y18, quadril y19–21, pernas y22–24, contorno dos pés y25.
    Cada letra do molde é uma região: as roupas do jogo pintam as regiões (tronco, braços, quadril, pernas, pés), por
    isso servem em todas as direções e passos. 0 contorno · k/K pele (luz/sombra) · w branco do olho · e íris · n pescoço ·
    t/T tronco · a/A braço · h mão · p/P quadril (roupa de baixo) · l/L perna · f pé. */
 const W=16,H=26;
 const FRENTE=[
  '................','....00000000....','...00kkkkkk00...','..0kkkkkkkkkK0..','..0kkkkkkkkkK0..','..0kkkkkkkkkK0..',
  '..0kkwekkwekK0..','..0kkkkkkkkkK0..','..0kkkkkkkkkK0..','...0kkk00kkK0...','...0KkkkkkkK0...','..0000nnnn0000..',
  '..0aa000000aA0..','.0aattttttttaA0.','.0a0tttttttT0A0.','.0a0tttttttT0A0.','.0a0tttttttT0A0.','0hh0tttttttT0hh0',
  '0hh0000000000hh0','.000ppppppPP000.','...0ppppppPP0...','...0ppp00pPP0...'];
 const DIAG=FRENTE.map((r,y)=>y==6?'..0Kkkwekkwek0..':y==9?'...0Kkkk00kk0...':y>=3&&y<=8?'..0Kkkkkkkkkk0..':r);
 const COSTAS=FRENTE.map((r,y)=>y==6?'..0kkkkkkkkkK0..':y==9?'...0kkkkkkkK0...':r);
 const LADO=[
  '................','....00000000....','...00kkkkkk00...','..0Kkkkkkkkkk0..','..0Kkkkkkkkkk0..','..0Kkkkkkkkkk0..',
  '..0Kkkkkkkwek0..','..0Kkkkkkkkkk0..','..0Kkkkkkkkkk0..','...0Kkkkkk0k0...','...0Kkkkkkkk0...','....000nn000....',
  '....0tttttt0....','....0t0aa0T0....','....0t0aa0T0....','....0t0aa0T0....','....0t0aa0T0....','....0t0aa0T0....',
  '....000hh000....','....0p0hh0P0....','....0pp00PP0....','....0ppppPP0....'];
 // molde completo de uma direção e passo (pernas: de frente uma levanta a cada passo; de lado abrem e cruzam)
 const grades=new Map();
 function grade(dir,ph){
  const k=dir+ph;if(grades.has(k))return grades.get(k);
  const d=dir[0],dg=dir.length>1,sd=d=='s',bk=d=='u';
  const g=(sd?LADO:bk?COSTAS:dg?DIAG:FRENTE).map(r=>[...r]);while(g.length<H)g.push([...'.'.repeat(W)]);
  const P=(x,y,c)=>{if(x>=0&&x<W&&y>=0&&y<H)g[y][x]=c};
  if(sd){const [b,f]=ph==1?[4,9]:ph==2?[6,7]:[5,8];
   for(const [x,c,dedo] of [[b,'L',0],[f,'l',1]]){P(x,22,c);P(x+1,22,c);P(x,23,c);P(x+1,23,c);P(x,24,'f');P(x+1,24,'f');if(dedo)P(x+2,24,'f')}}
  else for(const [x,sobe,c] of [[4,ph==1,'l'],[10,ph==2,'L']]){const pe=sobe?23:24;for(let y=22;y<pe;y++){P(x,y,'l');P(x+1,y,c)}P(x,pe,'f');P(x+1,pe,'f')}
  grades.set(k,g);return g;
 }
 const CONT='#161022';
 function corpoPadrao(sex,dir,ph){
  const c=mkCanvas(W,H),x=c.getContext('2d'),fem=sex=='f',g=grade(dir,ph);
  const S=REF.pele,S2=shade(S,.84),S3=shade(S,.72),A='#e8e0cc',A2=shade(A,.8),TOP='#d0507e';
  const COR={'0':CONT,k:S,K:S2,w:'#ffffff',e:REF.olhos,n:S2,t:S,T:S2,a:S,A:S2,h:S,p:A,P:A2,l:S,L:S2,f:S3};
  for(let y=0;y<H;y++)for(let i=0;i<W;i++){const ch=g[y][i];if(ch=='.')continue;
   let cor=COR[ch];if(fem&&(ch=='t'||ch=='T')&&(y==14||y==15))cor=ch=='T'?shade(TOP,.8):TOP; // top
   x.fillStyle=cor;x.fillRect(i,y,1,1)}
  return contornar(c);
 }
 function cabeloPadrao(estilo,dir){
  const c=mkCanvas(W,H),x=c.getContext('2d'),R=(a,b,w,h,col)=>{x.fillStyle=col;x.fillRect(a,b,w,h)},P=(a,b,col)=>R(a,b,1,1,col);
  const d=dir[0],dg=dir.length>1,sd=d=='s',bk=d=='u',Hc=REF.cabelo,hi=shade(Hc,1.35),dk=shade(Hc,.72);
  // topo da cabeça (y1–3) com brilho
  const topo=()=>{R(4,1,8,1,Hc);R(3,2,10,2,Hc);R(5,1,3,1,hi);R(4,2,2,1,hi)};
  const curto=()=>{topo();
   if(bk){R(3,4,10,5,Hc);R(4,9,8,1,dk)}
   else if(sd){R(3,4,5,4,Hc);R(3,8,3,1,dk);R(11,4,2,1,Hc)}
   else if(dg){R(3,4,3,3,Hc);P(12,4,Hc)}
   else{R(3,4,2,1,Hc);R(11,4,2,1,Hc);R(3,5,1,2,Hc);R(12,5,1,2,Hc)}};
  if(estilo=='curto')curto();
  else if(estilo=='longo'){curto();
   if(bk){R(2,4,12,10,Hc);R(2,13,12,1,dk)}
   else if(sd){R(2,3,6,11,Hc);R(2,13,6,1,dk)}
   else if(dg){R(2,3,4,11,Hc);R(2,13,4,1,dk);R(12,5,1,5,Hc)}
   else{R(2,3,2,11,Hc);R(12,3,2,11,Hc);R(2,13,2,1,dk);R(12,13,2,1,dk)}}
  else if(estilo=='rabo'){curto();
   if(bk){R(7,9,2,7,Hc);R(7,15,2,1,dk)}
   else if(sd){R(1,4,2,3,Hc);R(1,7,1,6,Hc);P(1,12,dk)}
   else if(dg){R(2,5,1,7,Hc);P(2,11,dk)}
   else{R(13,3,1,3,Hc);P(13,5,dk)}}
  else if(estilo=='moicano'){
   if(bk)R(7,0,2,9,Hc);else if(sd){R(4,0,7,2,Hc);R(4,0,7,1,hi)}else{R(7,0,2,4,Hc);P(7,0,hi)}}
  else if(estilo=='espetado'){curto();x.clearRect(4,1,8,1);
   for(const [a,b,k] of [[4,1,Hc],[5,0,hi],[7,1,Hc],[8,0,hi],[10,1,Hc],[11,0,hi],[2,2,Hc],[13,2,Hc]])P(a,b,k)}
  // careca e estilos novos sem desenho: nada
  return c;
 }

 /* ---- desenho do projeto (Artes do jogo › Aparência) ou o gerado ----
    Só vale desenho na grade atual (16×26); os de grades antigas ficam de lado. Um corpo sem nenhum tom de pele
    (só o contorno, um molde ainda sem cor) também fica de lado. */
 const artes={};
 function doProjeto(d,id){
  if(!d||!d.pixels||d.w!==W||d.h!==H)return null;
  if(id.startsWith('corpo-')&&!(d.palette||[]).some(c=>/^#[0-9a-f]{6}$/i.test(c||'')&&tom(rgb(c),REFRGB.pele)>0))return null;
  return pixelArt(d);
 }
 function arte(id,gerar){
  if(id in artes)return artes[id];
  const d=typeof PROJ!=='undefined'&&PROJ.art&&PROJ.art['aparencia/'+id];
  return artes[id]=doProjeto(d,id)||gerar();
 }
 /* ---- troca as cores de referência (e os tons delas) pelas escolhidas ---- */
 const rgb=h=>{const n=parseInt(h.slice(1),16);return[n>>16&255,n>>8&255,n&255]};
 const REFRGB=Object.fromEntries(Object.entries(REF).map(([k,v])=>[k,rgb(v)]));
 // quanto este pixel é um tom (cor × f) da referência; -1 = não é da família
 function tom(v,ref){
  let s=0,n=0;for(let i=0;i<3;i++)if(v[i]<255&&ref[i]>0){s+=v[i]/ref[i];n++}
  if(!n)return -1;const f=s/n;if(f<.3||f>1.8)return -1;
  for(let i=0;i<3;i++){const e=Math.min(255,Math.round(ref[i]*f));if(Math.abs(e-v[i])>3)return -1}
  return f;
 }
 const cacheCor=new Map();
 function recolorir(src,look,chave){
  const k=chave+'|'+look.pele+look.cabelo+look.olhos;if(cacheCor.has(k))return cacheCor.get(k);
  const c=mkCanvas(src.width,src.height),x=c.getContext('2d');x.drawImage(src,0,0);
  const im=x.getImageData(0,0,c.width,c.height),D=im.data,mapa=new Map(),alvo={pele:rgb(look.pele),cabelo:rgb(look.cabelo),olhos:rgb(look.olhos)};
  for(let i=0;i<D.length;i+=4){if(!D[i+3])continue;const key=D[i]<<16|D[i+1]<<8|D[i+2];let out=mapa.get(key);
   if(out===undefined){out=null;const v=[D[i],D[i+1],D[i+2]];
    for(const nome of ['olhos','pele','cabelo']){const f=tom(v,REFRGB[nome]);if(f>0){out=alvo[nome].map(c=>Math.max(0,Math.min(255,Math.round(c*f))));break}}
    mapa.set(key,out)}
   if(out){D[i]=out[0];D[i+1]=out[1];D[i+2]=out[2]}}
  x.putImageData(im,0,0);if(cacheCor.size>400)cacheCor.clear();cacheCor.set(k,c);return c;
 }
 const dirOk=d=>DIRS.includes(d)?d:(d&&DIRS.includes(d[0])?d[0]:'d');
 function normalizar(look,sex){
  const base=PADRAO[sex=='f'?'f':'m'],l=look||{};
  const lista=estilos(),tem=e=>lista.some(x=>x.id===e),m=mana();
  const estilo=tem(l.estilo)?l.estilo:m&&tem(m.estiloDe(l.estilo||base.estilo))?m.estiloDe(l.estilo||base.estilo):(tem(base.estilo)?base.estilo:lista[0].id);
  return{pele:hex(l.pele)||base.pele,cabelo:hex(l.cabelo)||base.cabelo,olhos:hex(l.olhos)||base.olhos,estilo};
 }
 function corpo(sex,dir,ph,look){
  sex=sex=='f'?'f':'m';dir=dirOk(dir);ph=FASES.includes(ph)?ph:0;const id='corpo-'+sex+'-'+dir+'-'+ph;
  return recolorir(arte(id,()=>corpoPadrao(sex,dir,ph)),look,id);
 }
 function cabelo(look,dir){
  dir=dirOk(dir);const id='cabelo-'+look.estilo+'-'+dir;
  return recolorir(arte(id,()=>cabeloPadrao(look.estilo,dir)),look,id);
 }
 // texto curto para o online e para a chave de cache: "f2c28b.4a2c14.111111.curto"
 const codificar=l=>l?[l.pele,l.cabelo,l.olhos].map(c=>String(c).slice(1)).join('.')+'.'+l.estilo:'';
 function decodificar(s,sex){const m=/^([0-9a-f]{6})\.([0-9a-f]{6})\.([0-9a-f]{6})\.([A-Za-z0-9_-]{1,24})$/i.exec(s||'');return normalizar(m?{pele:'#'+m[1],cabelo:'#'+m[2],olhos:'#'+m[3],estilo:m[4]}:null,sex)}
 window.APARENCIA={REF,PADRAO,ESTILOS,CORES,DIRS,FASES,estilos,cores,normalizar,corpo,cabelo,corpoPadrao,cabeloPadrao,codificar,decodificar,
  TAM:{W,H},grade:(dir,ph)=>grade(dirOk(dir),FASES.includes(ph)?ph:0), // regiões do molde (as roupas pintam por elas)
  padrao:sex=>normalizar(null,sex),
  // desenho atual (do projeto ou gerado), ainda nas cores de referência: catálogo de artes da Engine
  corpoArte:(sex,dir,ph)=>arte('corpo-'+sex+'-'+dir+'-'+ph,()=>corpoPadrao(sex,dir,ph)),
  cabeloArte:(estilo,dir)=>arte('cabelo-'+estilo+'-'+dir,()=>cabeloPadrao(estilo,dir))};
})();
