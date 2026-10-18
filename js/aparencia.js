/* ---------- Aparência do personagem: corpo, cabelo e cores ----------
   O corpo (masculino e feminino; direções d, ds, u, us, s; passos 0, 1, 2) e cada estilo de cabelo (direções) são pixel art
   28x32 na mesma grade do herói (js/sprites.js human). O projeto pode trocar qualquer desenho em Artes do jogo › Aparência
   (PROJETO.artes "aparencia/corpo-m-d-0", "aparencia/cabelo-curto-d"...); sem desenho, vale o gerado aqui.
   Os desenhos usam cores de referência (REF): pele, cabelo e olhos. O jogo troca cada uma, com os tons mais claros e
   mais escuros dela, pela cor que o jogador escolheu (qualquer cor). Estilos e cores sugeridas: PROJETO.mundo.aparencia. */
(function(){
 const REF={pele:'#f2c28b',cabelo:'#4a2c14',olhos:'#111111'};
 const PADRAO={m:{pele:'#f2c28b',cabelo:'#4a2c14',olhos:'#111111',estilo:'curto'},f:{pele:'#f2c28b',cabelo:'#8a3b1c',olhos:'#111111',estilo:'longo'}};
 const ESTILOS=[{id:'curto',nome:'Curto'},{id:'longo',nome:'Longo'},{id:'rabo',nome:'Rabo de cavalo'},{id:'moicano',nome:'Moicano'},{id:'espetado',nome:'Espetado'},{id:'careca',nome:'Careca'}];
 const CORES={
  pele:['#f2c28b','#ffdbb5','#e0a878','#c68650','#9a6438','#6b4226','#4a2c1a'],
  cabelo:['#4a2c14','#8a3b1c','#1a1412','#d9b45a','#f0e0b0','#c0c0c8','#b8323a','#3a5ac8','#3fa05a'],
  olhos:['#111111','#3a2414','#2a5ab8','#2f8a43','#7a7a86','#8a2fb8']};
 const DIRS=['d','ds','u','us','s'],FASES=[0,1,2];
 const cfg=()=>(window.PROJETO&&PROJETO.mundo&&PROJETO.mundo.aparencia)||{};
 const hex=c=>/^#[0-9a-f]{6}$/i.test(c||'')?c.toLowerCase():null;
 function estilos(){const l=cfg().estilos;return Array.isArray(l)&&l.length?l.filter(e=>e&&e.id).map(e=>({id:String(e.id),nome:e.nome||e.id})):ESTILOS}
 function cores(){const c=cfg().cores||{},o={};for(const k in CORES){const v=Array.isArray(c[k])?c[k].map(hex).filter(Boolean):[];o[k]=v.length?v:CORES[k]}return o}

 /* ---- desenhos gerados (cores de referência) ---- */
 function corpoPadrao(sex,dir,ph){
  const c=mkCanvas(28,32),{R,box}=kit(c.getContext('2d'));
  const dg=dir.length>1,d=dir[0],sd=d=='s',bk=d=='u',fem=sex=='f',S=REF.pele,A='#f0e6d2';
  // pernas e pés
  if(sd){const a=ph==1?-3:ph==2?3:0;box(10+a,22,4,7,S);box(14-a,22,4,7,shade(S,.85));box(9+a,28,6,3,S);box(14-a,28,6,3,shade(S,.85))}
  else{const l1=ph==1?2:0,l2=ph==2?2:0;box(9,22,4,7-l1,S);box(15,22,4,7-l2,S);box(8,28-l1,5,3,S);box(15,28-l2,5,3,S)}
  // tronco, roupa de baixo e top
  const tx=sd?10:8,tw=sd?9:12;box(tx,13,tw,10,S);R(tx,22,tw,2,A);if(!sd&&!bk)R(13,15,2,4,shade(S,.9));
  if(sd)R(10,22,9,3,A);else{R(9,22,10,3,A);R(13,23,2,2,shade(A,.8))}
  if(fem){R(tx,15,tw,3,'#e86a9a');if(bk)R(tx,15,tw,1,shade('#e86a9a',.8))}
  // braços e mãos
  if(sd){box(12,14,4,8,shade(S,.9));box(12,21,4,3,S)}
  else{box(5,14,3,8,S);box(20,14,3,8,S);box(5,21,3,3,S);box(20,21,3,3,S)}
  // cabeça, olhos e boca
  box(9,3,10,10,S);
  if(!bk){const o=REF.olhos;
   if(sd)R(15,8,2,2,o);
   else if(dg){R(13,8,2,2,o);R(16,8,2,2,o);R(15,11,2,1,shade(S,.65))}
   else{R(11,8,2,2,o);R(15,8,2,2,o);R(13,11,2,1,shade(S,.65))}}
  return c;
 }
 function cabeloPadrao(estilo,dir){
  const c=mkCanvas(28,32),x=c.getContext('2d'),{R,box}=kit(x);
  const d=dir[0],dg=dir.length>1,sd=d=='s',bk=d=='u',H=REF.cabelo,hi=shade(H,1.35);
  const orelha=()=>{if(bk&&dg)x.clearRect(17,6,2,5)}; // de costas na diagonal aparece a orelha
  const curto=()=>{if(bk)R(9,3,10,10,H);else{R(9,3,10,3,H);R(10,3,7,1,hi);if(sd)R(9,6,4,5,H);else{R(9,6,2,4,H);R(17,6,2,4,H)}}};
  if(estilo=='curto'){curto();orelha()}
  else if(estilo=='longo'){curto();
   if(bk)box(9,12,10,9,H);else if(sd)box(8,8,5,12,H);else{box(7,6,3,13,H);box(18,6,3,13,H)}
   orelha()}
  else if(estilo=='rabo'){curto();
   if(bk)box(12,10,4,10,H);else if(sd){box(5,5,4,4,H);box(5,9,3,8,H)}else{R(19,7,2,3,H)}
   orelha()}
  else if(estilo=='moicano'){
   if(bk){R(12,1,4,12,H);R(12,1,4,1,hi)}else if(sd){R(9,1,9,3,H);R(10,1,7,1,hi)}else{R(12,0,4,6,H);R(12,0,4,1,hi)}}
  else if(estilo=='espetado'){curto();
   const pontas=sd?[[9,1,2,2],[12,0,2,3],[15,1,2,2]]:[[9,1,2,2],[12,0,2,3],[15,0,2,3],[17,1,2,2]];
   for(const [a,b,w,h] of pontas){R(a,b,w,h,H);R(a,b,w,1,hi)}
   orelha()}
  // careca e estilos novos sem desenho: nada
  return c;
 }

 /* ---- desenho do projeto (Artes do jogo › Aparência) ou o gerado ---- */
 const artes={};
 function arte(id,gerar){
  if(id in artes)return artes[id];
  const d=typeof PROJ!=='undefined'&&PROJ.art&&PROJ.art['aparencia/'+id];
  return artes[id]=(d&&d.pixels&&pixelArt(d))||gerar();
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
  const estilo=estilos().some(e=>e.id===l.estilo)?l.estilo:(estilos().some(e=>e.id===base.estilo)?base.estilo:estilos()[0].id);
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
  padrao:sex=>normalizar(null,sex),
  // desenho atual (do projeto ou gerado), ainda nas cores de referência: catálogo de artes da Engine
  corpoArte:(sex,dir,ph)=>arte('corpo-'+sex+'-'+dir+'-'+ph,()=>corpoPadrao(sex,dir,ph)),
  cabeloArte:(estilo,dir)=>arte('cabelo-'+estilo+'-'+dir,()=>cabeloPadrao(estilo,dir))};
})();
