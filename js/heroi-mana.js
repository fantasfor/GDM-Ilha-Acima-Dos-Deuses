/* ---------- Personagem principal: Mana Seed Character Base (js/pacote-heroi.js + assets/heroi/*.png) ----------
   Feito em camadas, em quadros de 64×64 com 1 pixel = 1 pixel do mundo (o personagem tem ~30 px de altura):
     escudo/arma de trás · corpo (pele na cor escolhida) · roupa · cabelo (cor escolhida) · chapéu · escudo/arma da frente.
   Páginas: p1 = parado e andando; c2 = postura de combate (parado e andando); c3 = golpes (corte, estocada, escudo).
   Fora de combate a arma fica guardada; em combate o herói saca a arma e o escudo. A arma é o desenho do próprio item
   (o mesmo do ícone), colocada na pose da espada do Mana Seed de cada quadro (mão e direção vêm de js/pacote-heroi.js).
   Equipamento → camadas: peitoral = roupa (estilo 2 = camponês, outros = guarda-florestal; a variante de cor mais
   parecida com a do item), calça/bota sem peitoral = roupa de camponês, capacete = chapéu (capuz = chapéu pontudo),
   escudo = escudo do Mana Seed. Sem roupa: roupa de baixo.
   As imagens carregam sozinhas; até lá o jogo usa o herói antigo (js/sprites.js human). */
// quanto subir nome e barras de vida sobre personagens (herói de 16×26: 6 px acima das marcas antigas)
window.ACIMA_HEROI=()=>6;
(function(){
const P=window.PACOTE_HEROI;if(!P)return;
const Q=P.quadro,PG={p1:0,c2:1,c3:2};
const img={},pedidas={};let versao=0;
const BASE=['corpo','cabelo_bob1','cabelo_dap1','roupa_boxr','roupa_undi'];
function folha(nome){
 if(!nome||!P.camadas[nome])return null;if(img[nome])return img[nome];
 if(!pedidas[nome]){pedidas[nome]=1;const i=new Image();i.onload=()=>{img[nome]=i;versao++;mudou()};i.src=P.camadas[nome].arquivo}
 return null}
let avisado=false;
function mudou(){
 if(!pronto())return;
 // desenhos guardados com o herói antigo ou com camadas que faltavam
 if(typeof heroC==='object')for(const k in heroC)delete heroC[k];
 if(!avisado){avisado=true;
  // NPCs de classe passam para o mesmo estilo
  if(typeof HS==='object'&&typeof set3==='function'&&typeof human==='function')for(const k of Object.keys(HS))if(HS[k]&&k!=='sk'&&CLASSE_MANA[k]){const n=set3(human,k);for(const d in n)HS[k][d]=n[d]}
  dispatchEvent(new Event('heroi-pronto'))}}
const pronto=()=>BASE.every(n=>img[n]);
BASE.forEach(folha);

/* ---- cores ---- */
const rgb=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
const cl=v=>Math.max(0,Math.min(255,Math.round(v)));
const rampaPele=c=>{const[r,g,b]=rgb(c);return[[r,g,b],[r*.86,g*.68,b*.64],[r*.55,g*.4,b*.38]].map(a=>a.map(cl))};
const rampaCabelo=c=>{const v=rgb(c),mix=k=>v.map(x=>x+(255-x)*k);return[mix(.45),v,v.map(x=>x*.75),v.map(x=>x*.45),mix(.85)].map(a=>a.map(cl))};
const recoloridas=new Map();
function recolorida(nome,ref,alvo,chave){
 const k=nome+'|'+chave;if(recoloridas.has(k))return recoloridas.get(k);
 const i=folha(nome);if(!i)return null;
 const c=document.createElement('canvas');c.width=i.width;c.height=i.height;const x=c.getContext('2d');x.drawImage(i,0,0);
 try{const im=x.getImageData(0,0,c.width,c.height),D=im.data,mapa=new Map(ref.map((h,j)=>[parseInt(h.slice(1),16),alvo[j]]));
  for(let p=0;p<D.length;p+=4){if(!D[p+3])continue;const t=mapa.get(D[p]<<16|D[p+1]<<8|D[p+2]);if(t){D[p]=t[0];D[p+1]=t[1];D[p+2]=t[2]}}
  x.putImageData(im,0,0)}catch(e){} // aberto como arquivo (file://) o navegador não deixa ler a imagem: fica a cor original
 if(recoloridas.size>48)recoloridas.clear();recoloridas.set(k,c);return c}

/* ---- equipamento → camadas ---- */
const dist=(a,b)=>{const x=rgb(a),y=rgb(b);return(x[0]-y[0])**2+(x[1]-y[1])**2+(x[2]-y[2])**2};
function variante(prefixo,cor){let m=null,d=Infinity;for(let v=1;v<=5;v++){const n=prefixo+'_v'+v,c=P.camadas[n];if(!c)continue;const e=/^#[0-9a-f]{6}$/i.test(cor||'')?dist(c.cor,cor):v;if(e<d){d=e;m=n}}return m}
const corDe=it=>it&&it.v&&it.v.c&&it.v.c[0];
function roupaDe(E,sex){const it=E.ch||E.le||E.bo;if(!it)return sex=='f'?'roupa_undi':'roupa_boxr';return variante('roupa_'+(E.ch&&(E.ch.v&&E.ch.v.st)!==2?'fstr':'pfpn'),corDe(it))}
const chapeuDe=E=>E.he?variante('chapeu_'+((E.he.v&&E.he.v.st)==2?'pnty':'pfht'),corDe(E.he)):null;
const escudoDe=E=>E.sh&&!E.shWeapon?variante('escudo_sh0'+(Math.min(2,E.sh.v&&E.sh.v.st||0)+1),corDe(E.sh)):null;
// estilos de cabelo do Mana Seed; os antigos (js/aparencia.js) viram o mais parecido
const ESTILOS=[{id:'dap1',nome:'Curto'},{id:'bob1',nome:'Chanel'},{id:'careca',nome:'Careca'}];
const ANTIGO={curto:'dap1',moicano:'dap1',espetado:'dap1',longo:'bob1',rabo:'bob1'};
const estiloDe=e=>P.camadas['cabelo_'+e]?e:e=='careca'?'careca':ANTIGO[e]||'dap1';

/* ---- quadro: [página, linha, coluna] ----
   linhas: 0 frente, 1 costas, 2 direita, 3 esquerda (p1: +4 andando; c3: +4 estocada e escudo) */
const DUR_ANDAR_COMBATE=[.14,.14,.2,.24];
function quadroDe(o){
 const d=o.dir[0],r=d=='s'?(o.fl<0?3:2):d=='u'?1:0;
 if(o.estado=='ataque'){const col=Math.min(3,Math.max(0,Math.floor((o.k||0)*4)));
  return o.ataque=='estocada'||o.ataque=='soco'?['c3',4+r,col]:o.ataque=='escudo'?['c3',4+r,4+col]:['c3',r,col]}
 if(o.estado=='combateAndando'){let t=o.t%.72,i=0;while(i<3&&t>DUR_ANDAR_COMBATE[i]){t-=DUR_ANDAR_COMBATE[i];i++}return['c2',r,4+i]}
 if(o.estado=='combate')return['c2',r,Math.floor(o.t/.2)%4];
 if(o.estado=='andando')return['p1',4+r,o.passo!=null?o.passo:Math.floor(o.t/.135)%6];
 return['p1',r,0]}

/* ---- arma do item na pose da espada do Mana Seed ---- */
const ids=new WeakMap();let seq=0;const idDe=o=>{if(!o)return'';if(!ids.has(o))ids.set(o,++seq);return ids.get(o)};
function desenhaArma(x,w,[gx,gy,ang]){
 const s=w.equippedSprite;x.save();x.translate(gx,gy);x.imageSmoothingEnabled=false;
 if(s){x.rotate((ang+90)*Math.PI/180);x.drawImage(s,-s.width/2,-s.height*(w.pega??1))}
 else if(w.c){const p=w.pega??.75;x.rotate((ang+45)*Math.PI/180);x.drawImage(w.c,-16*(1-p),-16*p)} // só ícone: o próprio ícone, na diagonal
 x.restore()}

/* ---- monta o quadro ---- */
const cache=new Map();
function imagem(o){
 if(!pronto())return null;
 const E=o.E||{},look=o.look||{},sex=o.sex=='f'?'f':'m',estilo=estiloDe(look.estilo);
 const [pg,lin,col]=quadroDe(o),sx=col*Q,sy=PG[pg]*512+lin*Q;
 const roupa=roupaDe(E,sex),chapeu=chapeuDe(E),escudo=pg=='p1'?null:escudoDe(E),arma=pg=='p1'?null:E.sw,pose=arma&&P.arma[pg]&&P.arma[pg][(lin%8)*8+col];
 const espelho=o.dir[0]=='s'&&o.fl<0; // linha da esquerda: o jogo espelha quem olha para a esquerda, então vai espelhada
 const key=[pg,lin,col,look.pele,look.cabelo,estilo,roupa,chapeu,escudo,idDe(arma),espelho?1:0,versao].join('|');
 if(cache.has(key))return cache.get(key);
 const corpo=recolorida('corpo',P.rampas.pele,rampaPele(look.pele||'#f2c28b'),look.pele);if(!corpo)return null;
 const cabelo=estilo=='careca'?null:recolorida('cabelo_'+estilo,P.rampas.cabelo,rampaCabelo(look.cabelo||'#4a2c14'),look.cabelo);
 const frente=t=>{const l=P.frente[t][pg];return!!(l&&l[lin]&&l[lin][col]=='F')};
 const c=mkCanvas(Q,Q),x=c.getContext('2d');x.imageSmoothingEnabled=false;
 if(espelho){x.translate(Q,0);x.scale(-1,1)}
 const pinta=s=>{if(s)x.drawImage(s,sx,sy,Q,Q,0,0,Q,Q)};
 if(escudo&&!frente('escudo'))pinta(folha(escudo));
 if(pose&&!frente('arma'))desenhaArma(x,arma,pose);
 pinta(corpo);pinta(folha(roupa));pinta(cabelo);pinta(folha(chapeu));
 if(escudo&&frente('escudo'))pinta(folha(escudo));
 if(pose&&frente('arma'))desenhaArma(x,arma,pose);
 // âncora: pés (linha 44 do quadro) onde o jogo põe os pés; sombra do tamanho do corpo
 c.pad=23;c.anchorY=20;
 if(cache.size>500)cache.clear();cache.set(key,c);return c}

/* ---- NPCs de classe: roupa e cabelo de cada uma ---- */
const CLASSE_MANA={
 war:{ch:['#716558',0],look:{pele:'#e8b888',cabelo:'#725436',estilo:'dap1'}},
 mag:{ch:['#5c4a8a',0],he:['#5c99c6',2],look:{pele:'#f8d098',cabelo:'#7e868e',estilo:'bob1'}},
 hea:{ch:['#e0d8b0',2],look:{pele:'#f8c0b0',cabelo:'#d6ae42',estilo:'bob1'}},
 sty:{ch:['#e37baf',2],look:{pele:'#ffc784',cabelo:'#3a1f10',estilo:'bob1'},sex:'f'}};
window.CLASSE_MANA=CLASSE_MANA;
// mesma assinatura do human() antigo (outros jogadores, NPCs, retratos): passo (ph) e golpe (swing) viram quadros
function deHuman(cl,dir,ph,E){
 const V=!E.nude&&CLASSE_MANA[cl];if(!E.nude&&!V)return null;
 const eq={...E};if(V){for(const k of ['ch','he'])if(V[k]&&!eq[k])eq[k]={v:{c:[V[k][0]],st:V[k][1]}}}
 const look=E.nude?(E.look||{}):V.look,sex=E.nude?E.sex:(V.sex||'m');
 const estado=E.swing>0?'ataque':ph>0?'andando':'parado';
 return imagem({E:eq,look,sex,dir,fl:1,estado,k:(E.swing-1)/3+.05,passo:ph==1?1:ph==2?4:0,t:0,ataque:eq.sw&&eq.sw.ataque})}
// o jogador: estado de verdade (andando, em combate, golpe) e a linha certa para a esquerda
function jogador(dir,an){
 if(!pronto())return null;
 const E={sex:p.sex,shWeapon:!!(EQ.sh&&gearType[EQ.sh.id]=='sw')};
 for(const s of ['he','ch','le','bo','ca','ne','r1','r2','sw','sh'])if(EQ[s])E[s]=ITEMS[EQ[s].id];
 const look=window.APARENCIA?APARENCIA.normalizar(p.look,p.sex):{},comb=!!(window.emCombate&&emCombate());
 const estado=an&&an.sw>0?'ataque':an&&an.mv?(comb?'combateAndando':'andando'):(comb?'combate':'parado');
 // os quadros já animam: sem o balanço/giro procedural (fica só a tremida ao apanhar)
 if(an){an.rot=0;an.sx=1;an.sy=1;an.dy=0;an.sk=0}
 const fl=dir[0]=='s'&&typeof face=='function'?face(p).fl:1;
 return imagem({E,look,sex:p.sex,dir,fl,estado,t:typeof time=='number'?time:performance.now()/1000,k:an&&an.k,ataque:E.sw&&E.sw.ataque})}
window.ACIMA_HEROI=()=>pronto()?8:0;
window.HEROI_MANA={pronto,imagem,deHuman,jogador,ESTILOS,estiloDe,sugestoes:P.sugestoes,credito:P.credito,versao:()=>versao};
})();
