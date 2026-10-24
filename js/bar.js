/* ---------- Bar ao ar livre: pátio da Taverna do Javali Dourado (2026-10-24, pedido do usuário) ----------
   Área externa ao lado da taverna (porta na parede da direita), na mesma sala online: todos os jogadores se veem.
   Calçamento, deck de madeira com as 4 mesas de jogo (js/mesas.js), quiosque do bar com o Barman, churrasqueira com
   fumaça, chafariz, fogueira com bancos, lampiões, bandeirinhas balançando, árvores, guarda-sóis e flores (elementos
   do tema "Bar ao ar livre" do pacote de mapa, alguns animados); de noite, vaga-lumes e luzes quentes; de dia, folhas.
   A taverna chama BAR.walk/chao/objetos/luzes/click/atualizar (js/taverna.js). */
(function(){
 const G=()=>window.TAVERNA_GEO||{OX:24,OY:24,TW:480,TH:320};
 const BW=440,BH=360;
 const X0=()=>G().OX+G().TW,Y0=()=>G().OY-20;               // canto de cima à esquerda do pátio
 const at=(x,y)=>({x:X0()+x,y:Y0()+y});
 const PORTA={y0:168,y1:196};                                 // porta na parede da direita da taverna (relativo ao pátio)
 const R=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),w,h)};
 const hsh=(a,b)=>{let h=(a*374761393+b*668265263)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967296};
 /* mesas de jogo: centro e os 4 lugares (norte, leste, sul, oeste) */
 const MESAS_JOGO=[['bar1',86,236],['bar2',196,236],['bar3',86,322],['bar4',196,322]].map(([id,x,y])=>({id,x,y}));
 const LUGARES=[[0,-19],[25,0],[0,15],[-25,0]];
 // mesas da taverna (js/taverna.js TAVERNA_MESAS) já vêm com o centro e os lugares no mundo
 const centro=m=>m.lugares?{x:m.cx,y:m.cy}:at(m.x,m.y);
 const lugar=(m,i)=>{if(m.lugares)return m.lugares[i];const c=at(m.x,m.y);return{x:c.x+LUGARES[i][0],y:c.y+LUGARES[i][1]}};
 const TODAS=()=>[...MESAS_JOGO,...(window.TAVERNA_MESAS||[])];
 const naMesa=(m,w)=>{const c=centro(m);return m.lugares?Math.hypot(w.x-c.x,(w.y-c.y+6)*1.2)<19:Math.abs(w.x-c.x)<22&&w.y>c.y-16&&w.y<c.y+18};
 /* elementos do pacote (id, x, y) e os sólidos (raio) */
 const ELEM=[
  ['pk_bar_arvore',26,64],['pk_bar_arvore',412,346],['pk_bar_arvore',30,356],
  ['pk_bar_churrasqueira',262,80],['pk_bar_barril',432,96],['pk_bar_barril',432,116],['pk_bar_caixas',282,112],
  ['pk_bar_chafariz',338,214],['pk_bar_fogueira',350,306],['pk_bar_banco',350,286],['pk_bar_banco',350,334],
  ['pk_bar_guarda_sol',140,120],['pk_bar_mesa',140,124],['pk_bar_guarda_sol',236,128],['pk_bar_mesa',236,132],
  ['pk_bar_lampiao',24,182],['pk_bar_lampiao',262,196],['pk_bar_lampiao',262,352],['pk_bar_lampiao',424,182],['pk_bar_lampiao',120,182],
  ['pk_bar_placa',50,150],['pk_bar_vaso',14,214],['pk_bar_vaso',282,262],['pk_bar_vaso',282,300],['pk_bar_vaso',404,252],['pk_bar_vaso',300,160],
  ['pk_bar_bandeirinhas',30,30],['pk_bar_bandeirinhas',94,30],['pk_bar_bandeirinhas',158,30],['pk_bar_bandeirinhas',222,30],
  ['pk_bar_bandeirinhas',44,196],['pk_bar_bandeirinhas',108,196],['pk_bar_bandeirinhas',172,196]
 ];
 const SOLIDOS=[]; // [x, y, raio] no mundo
 const DECK={x0:34,y0:206,x1:250,y1:350},QUIOSQUE={x0:294,x1:426,y0:24,y1:84},BARMAN={x:360,y:54,fx:0,fy:1,alvo:null,espera:2,nm:'Barman Tonho'};
 const pack=id=>window.PACOTE_MAPA&&PACOTE_MAPA.elementos[id];
 const arte=new Map();const canvasDe=d=>{if(!d)return null;let c=arte.get(d);if(!c){c=pixelArt(d);arte.set(d,c)}return c};
 const quadro=d=>window.CHAO&&CHAO.quadroEm?CHAO.quadroEm(d,time).data:d;
 function desenharElem(g,id,x,y){const e=pack(id);if(!e)return;const c=canvasDe(quadro(e.data));if(c)g.drawImage(c,Math.round(x-c.width/2),Math.round(y-c.height+3))}

 /* ---- chão: calçamento, grama nas beiradas, deck das mesas, caminho de terra da porta, cerca ---- */
 let fundo=null;
 function textura(id){const t=window.PACOTE_MAPA&&PACOTE_MAPA.texturas[id];return t?pixelArt(t.data):null}
 function desenharFundo(){
  const c=document.createElement('canvas');c.width=BW;c.height=BH;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
  const pat=id=>{const t=textura(id);return t?g.createPattern(t,'repeat'):'#555'};
  g.fillStyle=pat('pk_bar_calcada');g.fillRect(0,0,BW,BH);
  g.fillStyle=pat('pk_bar_grama');g.fillRect(0,0,BW,18);g.fillRect(BW-18,0,18,BH);g.fillRect(0,BH-14,BW,14);g.fillRect(0,BH-60,24,60);g.fillRect(0,0,22,140);
  g.fillStyle=pat('pk_bar_terra');for(let x=0;x<70;x+=2){const w=2+Math.round(Math.sin(x*.2)*2);g.fillRect(x,PORTA.y0+2-w,2,PORTA.y1-PORTA.y0-4+2*w)}
  // deck das mesas, com borda e degrau
  g.fillStyle='#24140a';g.fillRect(DECK.x0-3,DECK.y0-3,DECK.x1-DECK.x0+6,DECK.y1-DECK.y0+6);g.fillStyle=pat('pk_bar_deck');g.fillRect(DECK.x0,DECK.y0,DECK.x1-DECK.x0,DECK.y1-DECK.y0);
  R(g,DECK.x0,DECK.y0,DECK.x1-DECK.x0,1,'#c08a52');R(g,DECK.x0-3,DECK.y1+3,DECK.x1-DECK.x0+6,2,'#1a0e06');
  // praça do chafariz: calçamento claro em círculo
  g.lineWidth=3;g.strokeStyle='#6e6658';g.beginPath();g.ellipse(338,208,60,34,0,0,7);g.stroke();g.lineWidth=1;g.strokeStyle='#a69a86';g.beginPath();g.ellipse(338,207,60,34,0,0,7);g.stroke(); // anel de pedras da praça
  // quiosque: piso de tábuas atrás do balcão
  g.fillStyle=pat('pk_bar_deck');g.fillRect(QUIOSQUE.x0,QUIOSQUE.y0,QUIOSQUE.x1-QUIOSQUE.x0,QUIOSQUE.y1-QUIOSQUE.y0);
  // cerca em volta (em cima, à direita e embaixo): postes e duas travessas
  const cerca=(x0,y0,x1,y1)=>{const n=Math.max(1,Math.round(Math.hypot(x1-x0,y1-y0)/14));for(let k=0;k<=n;k++){const x=x0+(x1-x0)*k/n,y=y0+(y1-y0)*k/n;R(g,x-1,y-12,3,14,'#5c3a20');R(g,x-1,y-12,1,14,'#7c5230');R(g,x-1,y-13,3,1,'#a06c3e')}
   if(y0===y1){R(g,x0,y0-9,x1-x0,2,'#8a5a32');R(g,x0,y0-9,x1-x0,1,'#a06c3e');R(g,x0,y0-4,x1-x0,2,'#8a5a32')}else{R(g,x0,y0,2,y1-y0,'#8a5a32');R(g,x0+2,y0,1,y1-y0,'#5c3a20')}};
  cerca(4,14,BW-4,14);cerca(BW-6,14,BW-6,BH-4);cerca(4,BH-2,BW-4,BH-2);
  return c;
 }
 /* quiosque do bar: balcão com toldo listrado, prateleira de garrafas e o barman (o toldo vai por cima, depois do barman) */
 function prateleira(){
  const a=at(QUIOSQUE.x0,QUIOSQUE.y0),w=QUIOSQUE.x1-QUIOSQUE.x0;
  R(ctx,a.x,a.y+4,w,4,'#3a2414');for(let k=0;k<11;k++){const bx=a.x+6+k*11,cor=['#3f7a3a','#7a2a2a','#2f4f8a','#a8862f','#5a3a7a'][k%5];R(ctx,bx,a.y-2,4,6,cor);R(ctx,bx+1,a.y-4,2,2,'#2a1a0c');R(ctx,bx+1,a.y-1,1,3,'#ffffff40')}
 }
 function balcao(){
  const a=at(QUIOSQUE.x0,QUIOSQUE.y0),w=QUIOSQUE.x1-QUIOSQUE.x0,by=a.y+44;R(ctx,a.x,by,w,16,'#3e2210');R(ctx,a.x,by-2,w,5,'#9a6636');R(ctx,a.x,by-2,w,1,'#c08a52');for(let x=a.x+6;x<a.x+w-10;x+=22){R(ctx,x,by+5,16,9,'#5a3418');R(ctx,x+1,by+6,14,1,'#7a4a24')}R(ctx,a.x,by+14,w,2,'#24140a');
  for(const [dx,cor] of [[20,'#d9a441'],[46,'#c8c8c8'],[84,'#d9a441'],[108,'#7a2a2a']]){R(ctx,a.x+dx,by-8,4,6,cor);R(ctx,a.x+dx+4,by-6,2,3,cor);R(ctx,a.x+dx,by-9,4,2,'#fff6e0')}
 }
 function toldo(){
  const a=at(QUIOSQUE.x0-6,QUIOSQUE.y0-22),w=QUIOSQUE.x1-QUIOSQUE.x0+12;
  for(let x=0;x<w;x+=8){const o=Math.round(Math.sin(time*2+x*.2)*.6);R(ctx,a.x+x,a.y,8,14+o,(x/8|0)%2?'#f2eee6':'#d8432f');R(ctx,a.x+x,a.y+14+o,8,2,(x/8|0)%2?'#d8d2c6':'#a8322a')}
  R(ctx,a.x,a.y-2,w,3,'#5c3a20');R(ctx,a.x-2,a.y,3,40,'#5c3a20');R(ctx,a.x+w-1,a.y,3,40,'#5c3a20');
  ctx.font='bold 6px monospace';ctx.textAlign='center';ctx.fillStyle='#24140a';ctx.fillText('BAR DO JAVALI',a.x+w/2+.5,a.y+9.5);ctx.fillStyle='#fff6e0';ctx.fillText('BAR DO JAVALI',a.x+w/2,a.y+9);
 }
 /* mesa de jogo quadrada com feltro verde e 4 banquinhos; com jogo, cartas ou pedras no feltro */
 function mesaJogo(m){
  const c=at(m.x,m.y),x=Math.round(c.x),y=Math.round(c.y),d=window.MESAS&&MESAS.dados[m.id],j=d&&d.jogo;
  ctx.fillStyle='#0006';ctx.beginPath();ctx.ellipse(x,y+6,22,5,0,0,7);ctx.fill();
  R(ctx,x-15,y-2,2,9,'#3a2414');R(ctx,x+13,y-2,2,9,'#3a2414');
  R(ctx,x-18,y-12,36,14,'#3a2414');R(ctx,x-17,y-12,34,12,'#7c5230');R(ctx,x-17,y-12,34,1,'#c08a52');R(ctx,x-14,y-10,28,8,'#2c6a3a');R(ctx,x-14,y-10,28,1,'#3f8a4c');R(ctx,x-17,y,34,2,'#5c3a20');
  if(j&&j.fase==='jogando'){const tipo=j.tipo;for(let k=0;k<3;k++){const px=x-9+k*7,py=y-8+(k%2);
   if(tipo==='domino'){R(ctx,px,py,5,3,'#efe8d4');R(ctx,px+2,py,1,3,'#1a1a22')}else{R(ctx,px,py,4,5,tipo==='uno'?['#d8432f','#2f6fd0','#e0b62a'][k]:'#efe8d4');R(ctx,px,py,4,1,'#ffffff')}}}
  else{R(ctx,x-3,y-9,6,4,'#d9a441');R(ctx,x-2,y-10,4,1,'#fff6e0')} // caneca no meio
 }
 /* cadeira das mesas do pátio: encosto do lado de fora (0 atrás, 1 direita, 2 frente, 3 esquerda), almofada vermelha
    e contorno escuro para destacar do deck */
 function cadeira(x,y,i){x=Math.round(x);y=Math.round(y);const C='#24140a',M='#b07a44',ML='#d09a5e',A='#b8322a',AL='#d8483a';
  R(ctx,x-6,y+1,12,2,'#0005');R(ctx,x-5,y-3,2,5,C);R(ctx,x+3,y-3,2,5,C);
  const encosto=(bx,by,w,h)=>{R(ctx,bx-1,by-1,w+2,h+2,C);R(ctx,bx,by,w,h,M);R(ctx,bx,by,w,1,ML);if(w>4)for(let k=bx+2;k<bx+w-1;k+=3)R(ctx,k,by+2,1,h-3,'#7c5230')};
  if(i===0)encosto(x-6,y-17,12,10);if(i===1)encosto(x+5,y-17,3,14);if(i===3)encosto(x-8,y-17,3,14);
  R(ctx,x-7,y-7,14,5,C);R(ctx,x-6,y-7,12,3,M);R(ctx,x-5,y-7,10,2,A);R(ctx,x-5,y-7,10,1,AL);
  if(i===2)encosto(x-6,y-12,12,8)} // de frente para a mesa: o encosto fica entre quem vê e quem senta

 /* ---- botões em cima das mesas (Truco, Uno, Dominó, Assistir, Voltar ao jogo) e o convite em cima de quem convidou ---- */
 let botoes=[];
 function botao(x,y,txt,cor,fn){ctx.font='bold 5px monospace';const w=Math.ceil(ctx.measureText(txt).width)+8,h=9,bx=Math.round(x-w/2),by=Math.round(y);
  R(ctx,bx-1,by-1,w+2,h+2,'#0d0d0d');R(ctx,bx,by,w,h,cor);R(ctx,bx,by,w,1,'#ffffff55');ctx.textAlign='center';ctx.fillStyle='#0d0d0d';ctx.fillText(txt,bx+w/2,by+6.5);botoes.push({x:bx,y:by,w,h,fn})}
 function interfaceMesa(m){
  if(!window.MESAS||!MESAS.dados[m.id])return;const d=MESAS.dados[m.id],j=d.jogo,c=centro(m),u=MESAS.eu(),sent=MESAS.sentado&&MESAS.sentado.mesa===m.id,perto=Math.hypot(p.x-c.x,p.y-c.y)<110;
  if(j&&(j.fase==='jogando'||j.fase==='fim')){
   const joga=Array.isArray(j.jog)&&j.jog.includes(u);
   const v=j.fase==='jogando'&&MESAS.infoVez(m.id);
   if(v&&v.minha)botao(c.x,c.y-44,(Math.floor(time*2)%2?'>> ':'')+'SUA VEZ! '+v.resta+'s','#ffe28a',()=>MESAS.abrirPainel(m.id)); // pisca para chamar atenção
   else if(joga&&(perto||j.fase==='jogando'))botao(c.x,c.y-44,j.fase==='fim'?'Ver resultado':'Voltar ao jogo','#d9a441',()=>MESAS.abrirPainel(m.id));
   else if(!joga&&perto)botao(c.x,c.y-44,'Assistir','#a69c94',()=>MESAS.assistir(m.id));
   // de quem é a vez (para todos perto da mesa), com o prazo
   if(v&&!v.minha&&(perto||joga)){ctx.font='5px monospace';ctx.textAlign='center';const tx='Vez de '+v.nomes.join(' e ')+' · '+v.resta+'s';ctx.fillStyle='#000';ctx.fillText(tx,c.x+.4,c.y-54.6);ctx.fillStyle=v.resta<=5?'#f87171':'#e7dcc4';ctx.fillText(tx,c.x,c.y-55)}
   ctx.font='5px monospace';ctx.textAlign='center';ctx.fillStyle='#000';ctx.fillText(J_NOME(j.tipo)+(j.fase==='fim'?' · fim':' · jogando'),c.x+.4,c.y-47.6);ctx.fillStyle='#ffe28a';ctx.fillText(J_NOME(j.tipo)+(j.fase==='fim'?' · fim':' · jogando'),c.x,c.y-48);
  }
  if(sent)botao(c.x,c.y+20,'Levantar','#a69c94',()=>{const s=lugar(m,MESAS.sentado.i),d=Math.hypot(s.x-c.x,s.y-c.y)||1;MESAS.levantar();p.x=s.x+(s.x-c.x)/d*10;p.y=s.y+(s.y-c.y)/d*10}); // um passo para longe da mesa
  // sentado e sem jogo rolando: os 3 jogos (somem quando um jogo começa)
  if(sent&&!MESAS.ativo(j)){let x=c.x-32;for(const [tipo,nome] of [['truco','Truco'],['uno','Uno'],['domino','Dominó']]){botao(x,c.y-58,nome,'#d9d0c7',()=>MESAS.convidar(m.id,tipo));x+=32}}
  // convite: balão em cima de quem convidou
  if(MESAS.ativo(j)&&j.fase==='convite'){const i=MESAS.assentoDe(m.id,j.dono),pos=i>=0?lugar(m,i):c,eu_conv=j.conv&&j.conv[u];
   const txt=J_NOME(j.tipo)+'?'+(j.aposta?' '+j.aposta+'g':'');
   if(j.dono===u)botao(pos.x,pos.y-58,'Painel: '+txt,'#d9a441',()=>MESAS.abrirPainel(m.id));
   else if(sent||eu_conv)botao(pos.x,pos.y-58,eu_conv==='a'?'Painel: '+txt:'Jogar '+txt,'#7ad07a',()=>MESAS.aceitar(m.id));
   else{ctx.font='bold 5px monospace';ctx.textAlign='center';ctx.fillStyle='#000';ctx.fillText(txt,pos.x+.4,pos.y-52.6);ctx.fillStyle='#7ad07a';ctx.fillText(txt,pos.x,pos.y-53)}}
 }
 const J_NOME=t=>window.JOGOS_MESA&&JOGOS_MESA[t]?JOGOS_MESA[t].nome:t;

 /* ---- partículas: vaga-lumes (noite), folhas (dia), faíscas da fogueira ---- */
 const vaga=[],folhas=[];
 for(let k=0;k<26;k++)vaga.push({x:20+hsh(k,1)*400,y:20+hsh(k,2)*320,f:hsh(k,3)*6.28});
 function particulas(dt,nk){
  if(nk>.2)for(const v of vaga){v.f+=dt;const x=X0()+v.x+Math.sin(v.f*.7)*14,y=Y0()+v.y+Math.cos(v.f*.5)*10,a=(.5+.5*Math.sin(v.f*3))*nk;ctx.globalAlpha=a;R(ctx,x,y,1,1,'#f2ffa0');ctx.globalAlpha=a*.35;R(ctx,x-1,y-1,3,3,'#d8ff70')}
  ctx.globalAlpha=1;
  if(nk<.6){if(folhas.length<10&&Math.random()<dt*1.2){const arv=[[26,30],[412,312],[30,322]][Math.random()*3|0];folhas.push({x:arv[0]+(Math.random()-.5)*30,y:arv[1],t:0,c:['#4b9a44','#78c260','#c8a040'][Math.random()*3|0]})}
   for(let i=folhas.length;i--;){const f=folhas[i];f.t+=dt;f.y+=dt*12;f.x+=Math.sin(f.t*2.4)*dt*10;if(f.t>3.2){folhas.splice(i,1);continue}ctx.globalAlpha=Math.min(1,(3.2-f.t));R(ctx,X0()+f.x,Y0()+f.y,2,1,f.c);ctx.globalAlpha=1}}
 }
 /* barman: anda atrás do balcão; clicado, oferece bebida (igual à taverneira) */
 function andarBarman(dt){const B=BARMAN;if(!B.alvo){B.espera-=dt;if(B.espera<=0)B.alvo={x:304+Math.random()*112,y:44+Math.random()*12}}
  if(B.alvo){const dx=B.alvo.x-B.x,dy=B.alvo.y-B.y,d=Math.hypot(dx,dy);if(d>1){const k=Math.min(d,26*dt)/d;B.x+=dx*k;B.y+=dy*k;B.fx=dx;B.fy=dy}else{B.alvo=null;B.espera=2+Math.random()*5;B.fx=0;B.fy=1}}}
 function falarBarman(){
  const box=$('dialogue');box.classList.remove('dgModal');
  box.innerHTML='<b>Barman Tonho</b><p>Bem-vindo ao pátio! Sente numa das mesas do deck para jogar <b>Truco</b>, <b>Uno</b> ou <b>Dominó</b> com quem estiver por lá. Dá para apostar ouro: o vencedor leva o pote.</p><button type="button" data-bar-bebida>Pedir um chope ('+moeda(5)+'): vida e mana cheias</button><button type="button" data-close-dialog>Até mais</button>';
  box.classList.add('open');
  box.querySelector('[data-bar-bebida]').onclick=()=>{if(p.gold<5){ft(p.x,p.y-24,'Ouro insuficiente','#f87171');return}p.gold-=5;p.hp=mhp();p.mp=mmp();ring(p.x,p.y,24,'#ffd84a',.5);ft(p.x,p.y-24,'Saúde!','#ffd84a');box.classList.remove('open');if(window.playGameSound)playGameSound('coin')};
 }

 let alvoMesa=null; // {mesa, i}: indo sentar
 // clique numa mesa (do pátio ou da taverna): vai até o lugar livre mais perto do clique e senta ao chegar
 function clicarMesa(m,w){
  if(window.MESAS&&MESAS.sentado&&MESAS.sentado.mesa===m.id)return true;
  const ocup=window.MESAS&&MESAS.dados[m.id]?MESAS.dados[m.id].assentos:{},livres=[0,1,2,3].filter(i=>!ocup[i]);
  if(!livres.length){ft(p.x,p.y-24,'Mesa cheia (4 pessoas).','#f87171');return true}
  const d=i=>Math.hypot(lugar(m,i).x-w.x,lugar(m,i).y-w.y),i=livres.sort((a,b)=>d(a)-d(b))[0],s=lugar(m,i);
  alvoMesa={mesa:m.id,i};setDest(s.x,s.y);return true}
 window.BAR={
  MESAS_JOGO,lugar,BW,BH,
  dentro:(x,y)=>x>=X0()&&x<X0()+BW&&y>=Y0()&&y<Y0()+BH,
  // porta: passagem na parede da direita da taverna até o pátio
  portaEm:(x,y)=>{const yy=y-Y0();return yy>PORTA.y0+3&&yy<PORTA.y1-3&&x>X0()-14&&x<X0()+12},
  walk(x,y){const rx=x-X0(),ry=y-Y0();
   if(rx<10)return ry>PORTA.y0+3&&ry<PORTA.y1-3;
   if(rx>BW-14||ry<22||ry>BH-10)return false;
   if(rx>QUIOSQUE.x0-4&&rx<QUIOSQUE.x1+4&&ry<QUIOSQUE.y1+6)return false;
   for(const m of MESAS_JOGO)if(Math.abs(rx-m.x)<20&&ry>m.y-14&&ry<m.y+6)return false;
   for(const s of SOLIDOS)if(Math.hypot(x-s[0],(y-s[1])*1.3)<s[2])return false;
   return true},
  chao(){if(!fundo){fundo=desenharFundo();SOLIDOS.length=0;for(const [id,x,y] of ELEM){const e=pack(id);if(e&&e.solido){const w=at(x,y);SOLIDOS.push([w.x,w.y,Math.max(4,e.raio||6)])}}}
   ctx.drawImage(fundo,X0(),Y0());
   // porta aberta na parede da taverna, com batente
   const px=X0()-12,py=Y0()+PORTA.y0;R(ctx,px,py,14,PORTA.y1-PORTA.y0,'#5a3a20');R(ctx,px+2,py+2,10,PORTA.y1-PORTA.y0-2,'#7a5230');R(ctx,px,py-3,14,3,'#3f2816');R(ctx,px,py+PORTA.y1-PORTA.y0,14,2,'#2a1a0e')},
  objetos(L){
   botoes=[];
   L.push([Y0()+QUIOSQUE.y0+4,prateleira]);L.push([Y0()+QUIOSQUE.y0+60,balcao]); // o balcão fica na frente do barman
   L.push([Y0()+BARMAN.y,()=>{const B=BARMAN,w=at(B.x,B.y),f=face(B),spr=(HS.sty||HS.war)[f.d];dr(spr,w.x,w.y,f.fl,1,anim({...B,x:w.x,y:w.y},0));
    ctx.font='6px monospace';ctx.textAlign='center';ctx.fillStyle='#000';ctx.fillText(B.nm,w.x+.5,w.y-21.5-ACIMA_HEROI());ctx.fillStyle='#ffe28a';ctx.fillText(B.nm,w.x,w.y-22-ACIMA_HEROI());ctx.fillStyle='#ffd84a';ctx.fillText('!',w.x,w.y-28+Math.round(Math.sin(time*4)*1.5))}]);
   L.push([Y0()+QUIOSQUE.y0-30,toldo]);
   for(const [id,x,y] of ELEM){const w=at(x,y);L.push([w.y-(id==='pk_bar_bandeirinhas'?400:0),()=>desenharElem(ctx,id,w.x,w.y)])}
   for(const m of MESAS_JOGO){const c=at(m.x,m.y);for(let i=0;i<4;i++){const s=lugar(m,i);L.push([s.y+(i===2?1:-1),()=>cadeira(s.x,s.y+2,i)])}L.push([c.y,()=>mesaJogo(m)])}
  },
  // por cima de tudo: botões e convites das mesas (fora da ordem de profundidade, para não ficarem atrás de ninguém)
  interface(){for(const m of TODAS())interfaceMesa(m)},
  luzes(){const ls=[];for(const [id,x,y] of ELEM){const w=at(x,y);if(id==='pk_bar_lampiao')ls.push({x:w.x,y:w.y-32,r:70,a:.75});if(id==='pk_bar_fogueira')ls.push({x:w.x,y:w.y-8,r:95});if(id==='pk_bar_churrasqueira')ls.push({x:w.x,y:w.y-14,r:40,a:.5})}
   for(const m of MESAS_JOGO){const c=at(m.x,m.y);ls.push({x:c.x,y:c.y-12,r:40,a:.4})}const k=at(360,60);ls.push({x:k.x,y:k.y,r:80,a:.6});return ls},
  brilho(nk){ctx.save();ctx.globalCompositeOperation='screen';
   for(const [id,x,y] of ELEM){if(id!=='pk_bar_lampiao'&&id!=='pk_bar_fogueira')continue;const w=at(x,y),yy=id==='pk_bar_lampiao'?w.y-32:w.y-8,r=id==='pk_bar_lampiao'?40:60,a=(id==='pk_bar_fogueira'?.22:.14)+.14*nk+.03*Math.sin(time*9+x);
    const g=ctx.createRadialGradient(w.x,yy,1,w.x,yy,r);g.addColorStop(0,'rgba(255,190,90,'+a+')');g.addColorStop(1,'rgba(255,160,60,0)');ctx.fillStyle=g;ctx.fillRect(w.x-r,yy-r,2*r,2*r)}
   // lâmpadas no varal de bandeirinhas: piscam devagar de noite
   if(nk>.15)for(let x=34;x<290;x+=12){const yy=Y0()+31+Math.round(Math.sin((x-30)/64*Math.PI%Math.PI)*5),a=nk*(.5+.5*Math.sin(time*2+x*.3));ctx.globalAlpha=a;R(ctx,X0()+x,yy,2,2,'#fff0a0');ctx.globalAlpha=a*.3;R(ctx,X0()+x-2,yy-2,6,6,'#ffd84a')}
   ctx.restore();particulas(1/60,nk)},
  click(w,mode){
   for(const b of botoes)if(w.x>=b.x&&w.x<=b.x+b.w&&w.y>=b.y&&w.y<=b.y+b.h){b.fn();return true}
   if(mode!=2)for(const m of TODAS())if(naMesa(m,w))return clicarMesa(m,w);
   if(!(BAR.dentro(w.x,w.y)||BAR.portaEm(w.x,w.y)))return false;
   if(mode==2)return false;
   const bw=at(BARMAN.x,BARMAN.y);if(Math.hypot(w.x-bw.x,w.y-(bw.y-8))<14){if(Math.hypot(p.x-bw.x,p.y-bw.y)<60)falarBarman();else setDest(bw.x,bw.y+38);return true}
   return false},
  atualizar(dt){
   andarBarman(dt);
   if(alvoMesa){const m=TODAS().find(x=>x.id===alvoMesa.mesa),s=lugar(m,alvoMesa.i);
    if(Math.hypot(p.x-s.x,p.y-s.y)<9){const alvo=alvoMesa;alvoMesa=null;p.dest=null;p.path=[];
     if(window.MESAS)MESAS.sentar(alvo.mesa,alvo.i).then(ok=>{if(ok){p.x=s.x;p.y=s.y;const c=centro(m);p.fx=c.x-s.x;p.fy=c.y-s.y;ft(p.x,p.y-30,'Sentou na '+MESAS.NOME_MESA[alvo.mesa],'#ffe28a')}})}
    else if(!p.dest)alvoMesa=null}
   // levantou: andou para longe do lugar
   // levanta ao mandar andar (clique no chão) ou se algo tirou o herói do lugar; parado, fica na cadeira
   if(window.MESAS&&MESAS.sentado){const m=TODAS().find(x=>x.id===MESAS.sentado.mesa);if(!m){MESAS.levantar();return}const s=lugar(m,MESAS.sentado.i);if(p.dest||(p.path&&p.path.length)||Math.hypot(p.x-s.x,p.y-s.y)>6)MESAS.levantar();else{p.x=s.x;p.y=s.y}}
  },
  minimapa(mm,ox,oy,k){if(fundo)mm.drawImage(fundo,ox+(X0()-G().OX)*k,oy+(Y0()-G().OY)*k,BW*k,BH*k)}
 };
})();
