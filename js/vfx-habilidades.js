/* ---------- Efeitos visuais das habilidades, desenhados pixel a pixel na grade do mundo (1 pixel = 1 pixel do mundo) ----------
   VFX.tocar(tipo, {...}) toca um efeito uma vez: 'corte' (meia-lua grande à frente), 'impacto', 'grito' (onda de choque).
   Contínuos: giro (p.canal.visual: lâmina girando junto com o herói), rastro da investida (VFX.fantasma) e
   aura/contorno de status (FX_INFO[k].aura): VFX.atras é chamado pelo dr() (render.js) antes de desenhar o personagem.
   VFX.desenhar é chamado pelo menu.js no passe do mundo (ilha e DG). */
(function(){
 const ativos=[],fantasmas=[],faiscas=[],recentes=[];
 const Q=a=>a>.85?1:a>.6?.75:a>.35?.5:a>.1?.25:0; // alfa em degraus (visual de pixel art)
 const px=(g,x,y,c,a)=>{if(a<=0)return;g.globalAlpha=a;g.fillStyle=c;g.fillRect(x,y,1,1)};
 const easeOut=t=>1-(1-t)*(1-t);
 const hash=(a,b)=>{let h=(a*374761393+b*668265263)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967296};
 const hex=c=>{const m=/^#?([0-9a-f]{6})$/i.exec(c||'');const n=m?parseInt(m[1],16):0xffffff;return[n>>16&255,n>>8&255,n&255]};
 const mix=(a,b,k)=>{const x=hex(a),y=hex(b);return'#'+x.map((v,i)=>Math.round(v+(y[i]-v)*k).toString(16).padStart(2,'0')).join('')};
 const ACHATA=.8; // vista de cima em 3/4: círculos no chão ficam um pouco achatados
 /* espiral de tontura: dois braços girando, achatados como um halo em cima da cabeça */
 function espiral(g,x,y,rot){x=Math.round(x);y=Math.round(y);const feitos=new Set();
  for(const braco of [0])for(let i=0;i<=26;i++){const a=rot+braco+i*.38,r=.6+i*.24,X=Math.round(x+Math.cos(a)*r*1.3),Y=Math.round(y+Math.sin(a)*r*.55),k=X+','+Y;if(feitos.has(k))continue;feitos.add(k);
   px(g,X,Y,i<6?'#ffffff':i<14?'#ffe66b':'#f0a020',i>18?.6:1)}
  g.globalAlpha=1}

 /* bola de fogo / gelo (projéteis do Mago): disco com núcleo claro e borda tremulando */
 function bola(g,x,y,R,tipo,f){x=Math.round(x);y=Math.round(y);const fogo=tipo!=='gelo',n=Math.ceil(R);
  for(let dy=-n;dy<=n;dy++)for(let dx=-n;dx<=n;dx++){const d=Math.hypot(dx,dy)+hash(dx*5+dy*11,f)*(fogo?.9:.4);if(d>R)continue;const u=d/R;
   px(g,x+dx,y+dy,fogo?(u<.3?'#fff6c0':u<.55?'#ffd040':u<.8?'#ff7a1a':'#c0300a'):(u<.3?'#ffffff':u<.6?'#bfefff':u<.85?'#5ab8f0':'#1f5aa0'),1)}
  if(!fogo)for(let i=0;i<4;i++){const t=f*.25+i*Math.PI/2;px(g,Math.round(x+Math.cos(t)*(R+1)),Math.round(y+Math.sin(t)*(R+1)),'#e8fbff',1)} // pontas de cristal
  g.globalAlpha=1}
 /* lâmina em arco: anel entre raio-T e raio, de 'de' até 'ate' (ângulos relativos a a0). força(off) 0..1 dá a espessura e o brilho */
 function lamina(g,cx,cy,raio,a0,de,ate,forca,cor,alfa){
  const T=Math.max(5,Math.round(raio*.4)),meio=cor||'#d8e6ff',fundo=mix(meio,'#28407a',.45);
  cx=Math.round(cx);cy=Math.round(cy);
  for(let dy=-raio;dy<=raio;dy++)for(let dx=-raio;dx<=raio;dx++){
   const yy=dy/ACHATA,r=Math.hypot(dx,yy);if(r>raio||r<raio-T)continue;
   let off=Math.atan2(yy,dx)-a0;off=Math.atan2(Math.sin(off),Math.cos(off));if(off<de||off>ate)continue;
   const w=forca(off);if(w<=0)continue;const th=T*(.25+.75*w);if(r<raio-th)continue;
   const fundoK=(raio-r)/th,a=Q(alfa*(.55+.45*w));if(!a)continue;
   px(g,cx+dx,cy+dy,fundoK<.2?'#ffffff':fundoK<.6?meio:fundo,a)}
  g.globalAlpha=1}

 const TIPOS={
  // golpe grande à frente: a lâmina varre o arco do golpe (rastro mais fino e apagado atrás da ponta)
  corte(g,e){const k=e.t/e.dur,sw=easeOut(Math.min(1,k/.4)),fade=k<.45?1:1-(k-.45)/.55,ini=-e.arco/2,lead=ini+e.arco*sw;
   lamina(g,e.x,e.y,e.raio,e.ang,ini,lead,off=>{const tr=(off-ini)/Math.max(.01,lead-ini);return tr*Math.sin(Math.PI*Math.min(1,(off-ini)/e.arco*.9+.1))},e.cor,fade);
   if(k<.5){const a=e.ang+lead;for(let i=0;i<3;i++)px(g,Math.round(e.x+Math.cos(a)*(e.raio-1-i)),Math.round(e.y+Math.sin(a)*(e.raio-1-i)*ACHATA),'#ffffff',1)}},
  // impacto: anel que abre e lascas saindo do centro
  impacto(g,e){const k=e.t/e.dur,r=Math.round(3+k*11),a=Q(1-k);
   for(let i=0;i<40;i++){const t=i/40*Math.PI*2;px(g,Math.round(e.x+Math.cos(t)*r),Math.round(e.y+Math.sin(t)*r*ACHATA),k<.4?'#ffffff':e.cor||'#ffe0b0',a)}
   for(let i=0;i<8;i++){const t=i/8*Math.PI*2+.3,l=Math.round(2+k*9);for(let j=Math.round(k*6);j<l;j++)px(g,Math.round(e.x+Math.cos(t)*j),Math.round(e.y+Math.sin(t)*j*ACHATA),j>l-3?'#ffffff':'#ffd27a',a)}
   g.globalAlpha=1},
  // explosão de fogo: bola que abre do amarelo ao vermelho, com borda irregular
  explosaoFogo(g,e){const k=e.t/e.dur,R=Math.max(4,e.raio||10),r=R*easeOut(Math.min(1,k/.55)),a=Q(1-Math.max(0,k-.35)/.65),cx=Math.round(e.x),cy=Math.round(e.y),f=Math.floor(e.t*20);
   for(let dy=-R;dy<=R;dy++)for(let dx=-R;dx<=R;dx++){const d=Math.hypot(dx,dy/ACHATA)+hash(dx*7+dy,f)*1.6;if(d>r)continue;const u=d/Math.max(1,r);
    px(g,cx+dx,cy+dy,k>.6&&u<.5?'#5a4a44':u<.3?'#fff6c0':u<.55?'#ffd040':u<.8?'#ff7a1a':'#c0300a',k>.6&&u<.5?a*.5:a)}g.globalAlpha=1},
  // explosão de gelo: lascas azuis saindo e um anel de geada
  explosaoGelo(g,e){const k=e.t/e.dur,R=Math.max(4,e.raio||10),a=Q(1-k),cx=Math.round(e.x),cy=Math.round(e.y),r=Math.round(R*easeOut(k));
   for(let i=0;i<48;i++){const t=i/48*Math.PI*2;px(g,Math.round(cx+Math.cos(t)*r),Math.round(cy+Math.sin(t)*r*ACHATA),k<.35?'#ffffff':'#8fd8ff',a)}
   for(let i=0;i<10;i++){const t=i/10*Math.PI*2+.2,l=Math.round(3+k*R*.8);for(let j=Math.round(k*R*.4);j<l;j++)px(g,Math.round(cx+Math.cos(t)*j),Math.round(cy+Math.sin(t)*j*ACHATA),j>l-2?'#ffffff':j%2?'#bfefff':'#4aa0e0',a)}
   g.globalAlpha=1},
  // meteoro: cai do céu na diagonal até o ponto, com sombra crescendo no chão; no fim chama e.fim (dano) e explode
  meteoro(g,e){const k=e.t/e.dur,x=e.x+(1-k)*36,y=e.y-(1-k)*90;
   const sr=Math.round(2+k*(e.raio||14)*.5);for(let dx=-sr;dx<=sr;dx++)for(let dy=-sr;dy<=sr;dy++)if(Math.hypot(dx,dy/.5)<=sr)px(g,Math.round(e.x)+dx,Math.round(e.y)+Math.round(dy*.5),'#000000',.25*k);
   for(let i=1;i<10;i++)px(g,Math.round(x+i*2),Math.round(y-i*5),i<3?'#ffd040':i<6?'#ff7a1a':'#8a2a10',Q(1-i/10));
   bola(g,x,y,4.6,'fogo',Math.floor(e.t*20));g.globalAlpha=1},
  // grito: onda de choque vermelha até o raio da área
  grito(g,e){const k=e.t/e.dur,a=Q(.6*(1-k)),cor=e.cor||'#ff3a2a';
   for(const [rk,c] of [[easeOut(k),cor]]){const r=Math.round(6+rk*(e.raio-6)),n=Math.max(24,Math.round(r*6));
    for(let i=0;i<n;i++){const t=i/n*Math.PI*2;px(g,Math.round(e.x+Math.cos(t)*r),Math.round(e.y+Math.sin(t)*r*ACHATA),c,a)}}
   g.globalAlpha=1}
 };

 // contorno e aura são calculados na grade do mundo a partir da silhueta do desenho (com cache por desenho)
 const cacheSil=new WeakMap();
 function silhueta(img){
  let s=cacheSil.get(img);if(s)return s;
  const q=img.q||1,W=Math.ceil(img.width/q),H=Math.ceil(img.height/q),m=new Uint8Array(W*H);
  try{const d=img.getContext('2d').getImageData(0,0,img.width,img.height).data;
   for(let y=0;y<H;y++)for(let x=0;x<W;x++){const ix=Math.min(img.width-1,Math.floor(x*q+q/2)),iy=Math.min(img.height-1,Math.floor(y*q+q/2));m[y*W+x]=d[(iy*img.width+ix)*4+3]>40?1:0}}catch(e){}
  s={W,H,m,q,aura:{},contorno:{}};cacheSil.set(img,s);return s}
 const P_LADO=4,P_TOPO=8,P_BAIXO=2;
 function contornoDe(img,cor){
  const s=silhueta(img);if(s.contorno[cor])return s.contorno[cor];
  const {W,H,m}=s,c=document.createElement('canvas');c.width=W+2*P_LADO;c.height=H+P_TOPO+P_BAIXO;const g=c.getContext('2d');g.fillStyle=cor;
  const em=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m[y*W+x];
  for(let y=-1;y<=H;y++)for(let x=-1;x<=W;x++)if(!em(x,y)&&(em(x-1,y)||em(x+1,y)||em(x,y-1)||em(x,y+1)))g.fillRect(x+P_LADO,y+P_TOPO,1,1);
  return s.contorno[cor]=c}
 // aura de fúria (estilo "super saiyajin"): chamas subindo em volta do corpo, 6 quadros que tremulam
 function auraDe(img,cor,f){
  const s=silhueta(img),key=cor+f;if(s.aura[key])return s.aura[key];
  const {W,H,m}=s,ow=W+2*P_LADO,oh=H+P_TOPO+P_BAIXO,N=ow*oh,d=new Float32Array(N).fill(99);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(m[y*W+x])d[(y+P_TOPO)*ow+x+P_LADO]=0;
  // distância até o corpo (chanfro em duas passadas)
  for(let y=0;y<oh;y++)for(let x=0;x<ow;x++){const i=y*ow+x;if(x)d[i]=Math.min(d[i],d[i-1]+1);if(y)d[i]=Math.min(d[i],d[i-ow]+1);if(x&&y)d[i]=Math.min(d[i],d[i-ow-1]+1.4);if(y&&x<ow-1)d[i]=Math.min(d[i],d[i-ow+1]+1.4)}
  for(let y=oh;y--;)for(let x=ow;x--;){const i=y*ow+x;if(x<ow-1)d[i]=Math.min(d[i],d[i+1]+1);if(y<oh-1)d[i]=Math.min(d[i],d[i+ow]+1);if(x<ow-1&&y<oh-1)d[i]=Math.min(d[i],d[i+ow+1]+1.4);if(x&&y<oh-1)d[i]=Math.min(d[i],d[i+ow-1]+1.4)}
  const topo=new Array(ow).fill(Infinity);for(let x=0;x<ow;x++)for(let y=0;y<oh;y++)if(d[y*ow+x]===0){topo[x]=y;break}
  // colunas de chama: altura serrilhada que muda a cada quadro
  // línguas de fogo: colunas de 2 px com alturas serrilhadas (mais altas no meio), mudando a cada quadro
  const chama=new Array(ow);for(let x=0;x<ow;x++){const n=hash(x>>1,f*7+3),n2=hash(x,f*13+1),meio=1-Math.abs(x-ow/2)/(ow/2);chama[x]=Math.round(1+meio*2+n*2+n2)}
  let corpoTopo=Infinity;for(const t of topo)corpoTopo=Math.min(corpoTopo,t);
  const c=document.createElement('canvas');c.width=ow;c.height=oh;const g=c.getContext('2d');
  const claro=mix(cor,'#ffffff',.55),escuro=mix(cor,'#200000',.55);
  for(let y=0;y<oh;y++)for(let x=0;x<ow;x++){const i=y*ow+x,dd=d[i];if(dd===0)continue;
   const yk=Math.max(0,Math.min(1,(y-corpoTopo)/Math.max(1,H))),r=1+.6*(1-yk)+hash(x+y*3,f)*.6;
   // chama acima do corpo, saindo das colunas vizinhas
   let viz=Infinity;for(let k=-2;k<=2;k++){const t=topo[x+k];if(t!==undefined)viz=Math.min(viz,t)}
   const sobe=viz!==Infinity&&y<viz&&viz-y<=chama[x];
   if(dd>r&&!sobe)continue;
   const borda=sobe?viz-y>=chama[x]-2:dd>r-1.2,nucleo=false;
   g.globalAlpha=borda?.3:.4;g.fillStyle=nucleo?claro:borda?escuro:cor;g.fillRect(x,y,1,1)}
  return s.aura[key]=c}

 // rastro da investida: silhueta clara do herói que apaga
 const cacheFant=new WeakMap();
 function fantasmaDe(img){let c=cacheFant.get(img);if(c)return c;const s=silhueta(img);c=document.createElement('canvas');c.width=s.W;c.height=s.H;const g=c.getContext('2d');g.fillStyle='#cfe4ff';
  for(let y=0;y<s.H;y++)for(let x=0;x<s.W;x++)if(s.m[y*s.W+x])g.fillRect(x,y,1,1);cacheFant.set(img,c);return c}

 window.VFX={
  total:0,recentes,
  // lâmina do giro em volta de alguém (aliado online): ponta no ângulo ang, rastro de 250° atrás
  lamina(g,x,y,raio,ang,cor){g.save();g.imageSmoothingEnabled=false;const span=Math.PI*1.4;lamina(g,x,y,raio,ang,-span,0,off=>1+off/span,cor,1);g.restore()},
  tocar(tipo,o={}){if(!TIPOS[tipo])return;const e={tipo,t:0,dur:o.dur||(tipo=='corte'?.4:tipo=='grito'?.55:tipo=='meteoro'?.5:.32),...o};ativos.push(e);this.total++;recentes.push(e);if(recentes.length>6)recentes.shift();if(ativos.length>40)ativos.shift()},
  /* projétil desenhado (q.vfx 'fogo' | 'gelo'): bola virada para onde vai, rastro e brasas/flocos. Devolve true se desenhou */
  projetil(g,q){if(q.vfx!=='fogo'&&q.vfx!=='gelo')return false;const sp=Math.hypot(q.vx,q.vy)||1,ux=q.vx/sp,uy=q.vy/sp,f=Math.floor(performance.now()/50),fogo=q.vfx==='fogo';
   g.save();g.imageSmoothingEnabled=false;
   // rastro contínuo: 2 px de largura que afina e apaga
   for(let i=2;i<14;i++){const k=i/14,ox=-uy,oy=ux,lx=q.x-ux*i,ly=q.y-uy*i,c=fogo?(k<.3?'#ffd040':k<.6?'#ff7a1a':'#b0300c'):(k<.3?'#ffffff':k<.6?'#8fd8ff':'#3a80c0'),a=Q(1-k);
    px(g,Math.round(lx),Math.round(ly),c,a);if(k<.6)px(g,Math.round(lx+ox),Math.round(ly+oy),c,a*.75)}
   bola(g,q.x,q.y,4.6,q.vfx,f);g.restore();
   if(Math.random()<.5)faiscas.push({x:q.x-ux*4,y:q.y-uy*4,vx:(Math.random()-.5)*8,vy:fogo?-10-Math.random()*10:6+Math.random()*6,t:0,dur:.35,cor:fogo?(Math.random()<.5?'#ffb030':'#ff6020'):(Math.random()<.5?'#ffffff':'#bfefff')});
   return true},
  // investida: guarda uma silhueta do herói e solta linhas de velocidade
  fantasma(img,x,y,fl,dir){if(!img)return;fantasmas.push({img,x,y,fl,t:0,dur:.22});if(fantasmas.length>14)fantasmas.shift();
   for(let i=0;i<2;i++){const l=4+Math.random()*6;faiscas.push({x:x-dir.x*(2+Math.random()*6)+(Math.random()*10-5),y:y-8-dir.y*(2+Math.random()*6)+(Math.random()*12-8),vx:-dir.x*l,vy:-dir.y*l,t:0,dur:.18,linha:1})}},
  // faíscas subindo (aura)
  faisca(x,y,cor){faiscas.push({x,y,vx:(Math.random()-.5)*6,vy:-18-Math.random()*20,t:0,dur:.5+Math.random()*.3,cor});if(faiscas.length>120)faiscas.shift()},
  desenhar(g,dt){
   g.save();g.imageSmoothingEnabled=false;
   for(let i=fantasmas.length;i--;){const f=fantasmas[i];f.t+=dt;if(f.t>=f.dur){fantasmas.splice(i,1);continue}
    const c=fantasmaDe(f.img),s=silhueta(f.img),x=Math.round(f.x-s.W/2),y=Math.round(f.y-s.H+3+(f.img.anchorY||0)/s.q);
    g.globalAlpha=Q(.55*(1-f.t/f.dur));if(f.fl<0){g.save();g.translate(x+s.W,y);g.scale(-1,1);g.drawImage(c,0,0);g.restore()}else g.drawImage(c,x,y)}
   for(let i=faiscas.length;i--;){const f=faiscas[i];f.t+=dt;if(f.t>=f.dur){faiscas.splice(i,1);continue}const a=Q(1-f.t/f.dur);
    if(f.linha){const n=Math.max(1,Math.round(Math.hypot(f.vx,f.vy)));for(let j=0;j<n;j++)px(g,Math.round(f.x+f.vx*j/n),Math.round(f.y+f.vy*j/n),'#e8f2ff',a*(1-j/n))}
    else{f.x+=f.vx*dt;f.y+=f.vy*dt;px(g,Math.round(f.x),Math.round(f.y),f.cor||'#ff5a3a',a)}}
   // atordoado: espiral girando em cima da cabeça
   const fxi=typeof FX_INFO!=='undefined'?FX_INFO:{},rot=performance.now()/1000*7;
   const tonto=t=>{if(!t||!t.st||t.hp<=0)return false;for(const k in t.st)if(fxi[k]&&fxi[k].kind==='stun'&&t.st[k].t>0)return true;return false};
   const altura=t=>t===p?(typeof heroImg=='function'?wh(heroImg('d')):26):typeof wh=='function'?wh(t.img):20;
   if(typeof p!=='undefined'&&tonto(p))espiral(g,p.x,p.y-altura(p)+5,rot);
   if(typeof en!=='undefined')for(const e of en)if(tonto(e))espiral(g,e.x,e.y-altura(e)+5,rot);
   // área do canal no mouse (Chuva de meteoros): círculo pontilhado pulsando no chão enquanto dura
   if(typeof p!=='undefined'&&p.canal&&p.canal.area){const a=p.canal.area,pul=.5+.5*Math.sin(performance.now()/1000*5),n=Math.max(32,Math.round(a.r*4));
    for(let i=0;i<n;i++){if(i%4===3)continue;const t=i/n*Math.PI*2+performance.now()/4000;px(g,Math.round(a.x+Math.cos(t)*a.r),Math.round(a.y+Math.sin(t)*a.r*ACHATA),i%2?a.cor:'#ffe08a',.55+.3*pul)}
    g.globalAlpha=.08+.05*pul;g.fillStyle=a.cor;g.beginPath();g.ellipse(a.x,a.y,a.r,a.r*ACHATA,0,0,7);g.fill();g.globalAlpha=1}
   // giro: lâmina girando junto com o herói (a ponta está no ângulo para onde ele olha)
   if(typeof p!=='undefined'&&p.canal&&p.canal.visual){const v=p.canal.visual,span=Math.PI*1.4;
    lamina(g,p.x,p.y-8,v.raio,p.canal.ang,-span,0,off=>1+off/span,v.cor,1)}
   // conjurando: faíscas na cor da habilidade girando e fechando em volta do herói
   if(typeof p!=='undefined'&&p.conj&&p.conj.total>.3){const c=p.conj,k=1-c.r/c.total,cor=c.s.vfxColor||'#9bd4ff',rr=10-k*6,t0=performance.now()/1000*6;
    for(let i=0;i<5;i++){const a=t0+i*Math.PI*2/5;px(g,Math.round(p.x+Math.cos(a)*rr),Math.round(p.y-10+Math.sin(a)*rr*.6),i%2?'#ffffff':cor,.85)}g.globalAlpha=1}
   for(let i=ativos.length;i--;){const e=ativos[i];e.t+=dt;if(e.t>=e.dur){ativos.splice(i,1);if(e.fim)try{e.fim()}catch(err){console.warn(err)}if(e.tipo==='meteoro')VFX.tocar('explosaoFogo',{x:e.x,y:e.y,raio:e.raio||14,dur:.4});continue}TIPOS[e.tipo](g,e)}
   g.restore()},
  /* antes do personagem (dr em render.js): aura e contorno dos status com FX_INFO[k].aura; pintar(canvas, margemLado, margemTopo) */
  atras(ent,img,pintar){
   const fx=typeof FX_INFO!=='undefined'?FX_INFO:{},agora=performance.now()/1000;let cor=null;
   if(ent.st)for(const k in ent.st){const f=fx[k];if(f&&f.aura&&ent.st[k].t>0){cor=f.c||'#ff3a2a';break}}
   if(!cor&&ent.vfxAura&&ent.vfxAura.ate>agora)cor=ent.vfxAura.cor; // aliado online (online.js marca)
   if(!cor||!img||!img.getContext)return;
   const quadro=Math.floor(agora*10)%6,ga=ctx.globalAlpha;pintar(auraDe(img,cor,quadro),P_LADO,P_TOPO);ctx.globalAlpha=ga*.6;pintar(contornoDe(img,cor),P_LADO,P_TOPO);ctx.globalAlpha=ga; // discreto
   if(Math.random()<.05){const s=silhueta(img);VFX.faisca(ent.x+(Math.random()-.5)*s.W,ent.y-Math.random()*s.H,cor)}}
 };
})();
