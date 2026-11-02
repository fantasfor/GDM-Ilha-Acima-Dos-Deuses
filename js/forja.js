/* ---------- Forja do Ferreiro (2026-10-31, pedido do usuário) ----------
   Junte 2 itens iguais (mesmo equipamento) para forjar 1 desse item com outra qualidade:
   - média = (qualidade do item 1 + qualidade do item 2) / 2, arredondada;
   - pela tabela do nível do ferreiro: chance "Ruim" de sair pior (de 1 até "Qualidade Ruim" pontos abaixo da média) e
     chance "Boa" de sair melhor (de 1 até "Qualidade Boa" pontos acima). Qualquer valor da faixa tem a mesma chance.
     Ex.: nível 1, itens 50% e 75% → média 63%: 75% de chance de sair 33–62%, 25% de sair 64–73%. Fica entre 0 e 100.
   - o ferreiro sobe de nível pelo total de itens forjados (NIVEIS: 10 → nível 2, 50 → 3 ... 1500 → 10; 2000 = Mestre).
     Salvo no progresso (data.forja = {forjados, recorde}, js/ui.js).
   Janela de tela cheia: à esquerda a cena (o ferreiro, a bigorna e a fornalha num canvas) onde os dois itens giram, se
   chocam, levam marteladas e o resultado sobe brilhando com o número rolando; à direita a escolha dos itens.
   Abre pelo diálogo do Ferreiro no acampamento (js/combat.js, data-open-forja). */
(function(){
 // tabela do usuário, uma linha por nível do ferreiro: [chance ruim, chance boa, até quanto pior, até quanto melhor]
 const TABELA=[[75,25,30,10],[70,30,28,14],[65,35,26,16],[60,40,24,18],[55,45,22,20],[50,50,20,22],[45,55,18,24],[40,60,16,26],[35,65,14,28],[30,70,10,30]];
 // total de itens forjados para chegar ao nível 2, 3 ... 10; o último (2000) é o Mestre Ferreiro
 const NIVEIS=[10,50,100,200,350,550,800,1000,1500,2000];
 let forjados=0,recorde=null,martelo=null; // martelo: a marreta dada ao ferreiro {id, q}; sem nada ele usa a improvisada
 /* marretas do ferreiro (2026-11-01, pedido do usuário): armas do tipo maça (estilo marreta pequena) que caem no jogo e
    podem ser usadas para lutar ou dadas ao ferreiro. qual = pontos somados à qualidade do resultado (3% → 4%);
    chance = pontos a mais na chance de sair melhor (e a menos na de sair pior). Os itens estão no projeto (Engine › Itens). */
 const MARRETAS={
  marreta_improvisada:{qual:0,chance:0},marreta_glooc:{qual:1,chance:0},marreta_ossos:{qual:0,chance:1}};
 const PADRAO='marreta_improvisada';
 const marretaAtual=()=>martelo&&MARRETAS[martelo.id]?martelo.id:PADRAO;
 const bonus=()=>MARRETAS[marretaAtual()];
 const bonusTxt=id=>{const b=MARRETAS[id];return !b?'':b.qual?'+'+b.qual+'% de qualidade no resultado':b.chance?'+'+b.chance+'% de chance de sair melhor':'sem bônus (é a que ele já usa)'};
 const nivelDe=f=>Math.min(TABELA.length,1+NIVEIS.slice(0,TABELA.length-1).filter(n=>f>=n).length);
 const linhaDo=n=>TABELA[Math.max(1,Math.min(TABELA.length,n))-1];
 // a linha da tabela já com o bônus da marreta: [chance pior, chance melhor, até quanto pior, até quanto melhor]
 const chances=(n,b=bonus())=>{const [r,o,p,m]=linhaDo(n);return[Math.max(0,r-b.chance),Math.min(100,o+b.chance),p,m]};
 const media=(a,b)=>Math.round((a+b)/2);
 // nem o melhor resultado possível passa do melhor dos dois itens? → {max, melhor} (o aviso da forja); senão null
 function semMelhora(q1,q2,n=nivelDe(forjados),b=bonus()){const max=Math.min(100,media(q1,q2)+linhaDo(n)[3]+b.qual),melhor=Math.max(q1,q2);return max<=melhor?{max,melhor}:null}
 // sorteia a qualidade do item forjado (r1 e r2 só para testar); a marreta soma pontos ao resultado e chance de melhorar
 function sortear(q1,q2,n=nivelDe(forjados),r1=Math.random(),r2=Math.random(),b=bonus()){
  const [ruim,,piorMax,melhorMax]=chances(n,b),m=media(q1,q2),pior=r1*100<ruim,max=pior?piorMax:melhorMax,d=1+Math.floor(r2*max);
  return{q:Math.max(0,Math.min(100,m+(pior?-d:d)+b.qual)),pior,media:m}}
 // o que falta para o próximo nível: {de, ate, rotulo} (null = Mestre)
 function proximo(f=forjados){const n=nivelDe(f);if(n<TABELA.length)return{de:n>1?NIVEIS[n-2]:0,ate:NIVEIS[n-1],rotulo:'nível '+(n+1)};
  const m=NIVEIS[NIVEIS.length-1];return f<m?{de:NIVEIS[NIVEIS.length-2],ate:m,rotulo:'Mestre'}:null}

 /* ---------- estado do painel ---------- */
 let el=null,esc=[],ultimo=null,vigia=0,hist=[],seguidas=0,confirmar=false;
 const E=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
 const aberto=()=>!!el&&!el.hidden;
 const nomeItem=id=>String(ITEMS[id]&&ITEMS[id].n||id).replace(/ \(.*$/,'');
 const cor=q=>QCOL[qi(q)];
 const pinta=(e,q)=>{e.style.color=cor(q);return e};
 const som=(n,v)=>{if(window.playGameSound)playGameSound(n,v)};
 // equipamentos da mochila que têm par (dois ou mais iguais), agrupados por item
 function grupos(){const c={};I.forEach((s,i)=>{if(s&&ITEMS[s.id]&&gearType[s.id]&&s.q!=null)(c[s.id]=c[s.id]||[]).push(i)});return Object.entries(c).filter(([,l])=>l.length>1)}
 function abrir(){if(window.HISTORIA&&!HISTORIA.forjaPronta())return;esc=[];ultimo=null;if($('dialogue'))$('dialogue').classList.remove('open');montar();desenhar();iniciarCena();
  clearInterval(vigia);vigia=setInterval(()=>{const f=typeof blacksmith=='object'?blacksmith:null;if(!aberto()||!f||Math.hypot(p.x-f.x,p.y-f.y)>90||window.inTaverna||(typeof inDungeon!='undefined'&&inDungeon))fechar()},400)}
 function fechar(){if(el)el.hidden=true;clearInterval(vigia);pararCena();if(anim)terminarAnim();if(typeof tipEl!='undefined')tipEl.style.display='none'}
 // a escolha ainda vale? (o item pode ter saído da mochila por outra tela)
 function conferir(){esc=esc.filter(i=>I[i]&&gearType[I[i].id]&&I[i].q!=null);if(esc.length==2&&I[esc[0]].id!==I[esc[1]].id)esc.length=1}
 function escolher(i){if(anim)return;conferir();if(ultimo)recolher(true);confirmar=false;const k=esc.indexOf(i);
  if(k>=0){derrubar(I[i].id,posEscolhido(k),1);esc.splice(k,1)}
  else{if(esc.length>=2||(esc.length&&I[esc[0]].id!==I[i].id)){esc.forEach((j,n)=>derrubar(I[j].id,posEscolhido(n),1));esc=[]}esc.push(i);chega.set(i,tempo)}
  som('tiqueVez');desenhar()}
 // escolhe sozinho um par: do mesmo item da última forja se ainda tiver, senão o primeiro; os dois de maior qualidade
 function proximoPar(){if(anim)return;const gs=grupos();if(!gs.length)return;const g=gs.find(([id])=>ultimo&&id===ultimo.id)||gs[0];
  if(ultimo)recolher(true);esc=g[1].slice().sort((a,b)=>I[b].q-I[a].q).slice(0,2);esc.forEach(i=>chega.set(i,tempo));confirmar=false;som('tiqueVez');desenhar()}
 // dar uma marreta da mochila ao ferreiro (a que ele tinha volta para o mesmo espaço) e pegar de volta
 function darMartelo(i){if(anim)return;const s=I[i];if(!s||!MARRETAS[s.id])return;const velho=martelo;martelo={id:s.id,q:s.q};I[i]=velho?{id:velho.id,n:1,q:velho.q}:null;
  dirtyInv=true;saveGame();dispatchEvent(new Event('mochila-mudou'));som('bigorna',.5);batidaMartelo=tempo;atualizarFerreiroMundo();desenhar()}
 function tirarMartelo(){if(anim||!martelo)return;if(!addItem(martelo.id,martelo.q)){som('forjaPior',.5);return}martelo=null;
  dirtyInv=true;saveGame();dispatchEvent(new Event('mochila-mudou'));som('item',.6);atualizarFerreiroMundo();desenhar()}
 /* o ferreiro no acampamento também segura a marreta (de frente, como o herói parado). Se o desenho dele vier da Engine
    (js/artes.js personagens/ferreiro), fica o da Engine */
 let feitoMundo=null;
 function atualizarFerreiroMundo(){try{if(!window.SPRITE_BLACKSMITH||typeof human!='function'||typeof ITEMS=='undefined')return;
  const atual=SPRITE_BLACKSMITH.idle;if(atual&&atual!==feitoMundo&&!(typeof HS!='undefined'&&HS.ferreiro&&atual===HS.ferreiro.d))return;
  // sem as ferramentas (história, js/historia.js) ele fica de mãos vazias
  const comMartelo=!window.HISTORIA||HISTORIA.forjaPronta();
  feitoMundo=human('ferreiro','d',0,{sw:comMartelo&&ITEMS[marretaAtual()]||{}});SPRITE_BLACKSMITH.idle=feitoMundo}catch(e){}}
 const marretasNaMochila=()=>I.map((s,i)=>[s,i]).filter(([s])=>s&&MARRETAS[s.id]);
 let batidaMartelo=-9;
 // o item forjado cai da bigorna e vai para a mochila (ele já está lá; aqui é só a cena)
 function recolher(calado){if(!ultimo)return;derrubar(ultimo.id,{x:BX,y:Y_RES},1,true);ultimo=null;if(!calado){som('tiqueVez');desenhar()}}
 function forjar(){if(anim)return;conferir();if(esc.length<2)return;const [a,b]=esc,s1=I[a],s2=I[b];if(!s1||!s2||s1.id!==s2.id)return;
  // não tem como melhorar: o primeiro clique só pede confirmação
  if(semMelhora(s1.q,s2.q)&&!confirmar){confirmar=true;som('forjaPior',.6);desenhar();return}confirmar=false;
  const nAntes=nivelDe(forjados),r=sortear(s1.q,s2.q),id=s1.id;
  // o item muda na hora (fechar no meio da animação não perde nada); a cena só mostra
  I[a]={id,n:1,q:r.q};I[b]=null;esc=[];dirtyInv=true;forjados++;
  const subiu=nivelDe(forjados)>nAntes,mestre=forjados===NIVEIS[NIVEIS.length-1],novoRecorde=recorde==null||r.q>recorde;if(novoRecorde)recorde=r.q;
  seguidas=r.pior?0:seguidas+1;hist.unshift({id,q:r.q,pior:r.pior});hist.length=Math.min(hist.length,14);
  ultimo={id,q:r.q,pior:r.pior,media:r.media,q1:s1.q,q2:s2.q,subiu,mestre,novoRecorde,i:a};
  saveGame();dispatchEvent(new Event('mochila-mudou'));comecarAnim(s1,s2,ultimo);desenhar()}

 /* ---------- cena animada (canvas): fornalha, ferreiro, bigorna, itens, martelo, faíscas ---------- */
 /* tamanho lógico da cena e onde ficam as coisas: o ferreiro é o humanoide do jogo em tamanho real (40×32, pés na linha 27),
    segurando a marreta como o herói; o golpe "pesado" acerta na altura do quadril, então a bigorna é baixa e colada nele */
 const LW=140,LH=120,CHAO=92,FX=26,PES=27,BX=FX+36,BY=CHAO-9,BATE={x:FX+27,y:BY-1};
 const Y_ITEM=BY-16,Y_RES=BY-22; // altura dos itens escolhidos e do resultado sobre a bigorna
 const Cc={k:'#0d0d0d',e:'#1a1a1a',c:'#262626',p:'#3a3436',g:'#595959',m:'#7d756e',l:'#a69c94',a:'#c4c8d6',w:'#e7dcc4',
  t:'#7d3f34',tl:'#a8653f',o:'#d08a3a',ol:'#efc56a',f1:'#cf4554',f2:'#e8743a',f3:'#f7b84a',f4:'#fffbf0'};
 let cv=null,g=null,raf=0,tempo=0,ult=0,S=1,ox=0,oy=0,tremor=0,flash=0,parts=[],anim=null,muro=null,caindo=[],letreiros=[],sob=null;
 const chega=new Map(); // quando cada item escolhido chegou na bigorna (ele desce do alto até flutuar)
 const CHAO_VISTO=9; // quanto do chão aparece embaixo da cena
 // onde flutua o k-ésimo item escolhido
 const posEscolhido=k=>({x:esc.length==1&&k==0?BX+2:BX+(k?9:-5),y:Y_ITEM});
 // item caindo da bigorna: pula, gira, quica duas vezes no chão e some brilhando ("+1 na mochila")
 function derrubar(id,de,lado=1,mochila=false){caindo.push({id,x:de.x,y:de.y,vx:lado*(28+Math.random()*26),vy:-70-Math.random()*30,rot:0,vr:lado*(6+Math.random()*5),t:0,quiques:0,mochila})}
 const imgs=new Map();const icone=id=>{let i=imgs.get(id);if(!i){i=new Image();i.src=ITEMS[id].ic;imgs.set(id,i)}return i};
 function iniciarCena(){if(!raf){ult=performance.now();raf=requestAnimationFrame(quadro)}}
 function pararCena(){cancelAnimationFrame(raf);raf=0}
 function quadro(ms){raf=requestAnimationFrame(quadro);const dt=Math.min(.05,(ms-ult)/1000);ult=ms;tempo+=dt;if(!cv||!cv.isConnected)return;passo(dt);pintar()}
 const R=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),w,h)};
 function brilho(x,y,r,c,a){const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,c);gr.addColorStop(1,'rgba(0,0,0,0)');g.globalAlpha=a;g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2);g.globalAlpha=1}
 // parede de pedra (desenhada uma vez), maior que a cena para cobrir a tela toda; MX/MY = onde ela começa na cena
 const MX=-120,MY=CHAO-260;
 function fazerMuro(){const c=document.createElement('canvas');c.width=LW-2*MX;c.height=CHAO-MY;const q=c.getContext('2d');q.fillStyle=Cc.k;q.fillRect(0,0,c.width,c.height);
  for(let y=c.height-8,l=0;y>-8;y-=8,l++)for(let x=-(l%2)*7;x<c.width;x+=14){const v=(Math.abs(x*7+y*13+l*3))%7;q.fillStyle=v<3?'#1f1c1c':v<5?'#252121':'#2c2727';q.fillRect(x+1,y+1,12,6);q.fillStyle='#ffffff08';q.fillRect(x+1,y+1,12,1)}
  return c}
 // prateleira com ferramentas penduradas na parede, atrás do ferreiro
 function ferramentas(){R(0,44,26,3,Cc.k);R(0,44,25,2,Cc.t);R(0,44,25,1,Cc.tl);
  R(4,47,1,10,Cc.m);R(2,57,5,3,Cc.k);R(3,57,3,2,Cc.l);            // martelinho
  R(11,47,1,13,Cc.m);R(13,47,1,13,Cc.m);R(10,60,2,2,Cc.l);R(13,60,2,2,Cc.l); // tenaz
  R(19,47,2,3,Cc.t);R(19,50,2,11,Cc.a);R(19,50,1,11,Cc.w);R(17,49,6,1,Cc.o)} // espada pendurada
 function fornalha(){const x=92,y=40,ch=t=>Math.sin(tempo*9+t*1.7)*Math.sin(tempo*5.3+t);
  brilho(x+22,74,46,'rgba(232,116,58,.9)',.32+.06*ch(1));
  R(x-2,y-2,48,CHAO-y+2,Cc.k);R(x,y,44,CHAO-y,Cc.g);R(x,y,44,2,Cc.l);for(let k=0;k<6;k++)R(x+2+k*7,y+6,6,1,Cc.m);
  R(x+8,y+18,28,CHAO-y-18,Cc.k);R(x+10,y+16,24,2,Cc.k); // boca
  for(let i=0;i<24;i++){const h=8+Math.round(9*Math.abs(ch(i))+4*Math.sin(i*1.3));for(let j=0;j<h;j++){const f=j/h;R(x+10+i,CHAO-1-j,1,1,f<.25?Cc.f4:f<.5?Cc.f3:f<.8?Cc.f2:Cc.f1)}}
  R(x+6,y-14,32,14,Cc.k);R(x+8,y-14,28,13,Cc.p); // chaminé
  if(Math.random()<.25)parts.push({x:x+12+Math.random()*20,y:CHAO-12,vx:(Math.random()-.5)*6,vy:-14-Math.random()*16,v:.9+Math.random(),c:Math.random()<.5?Cc.f3:Cc.f2,g:-4,s:1})}
 function bigorna(){const x0=BX-11;
  R(x0+24,BY-1,7,4,Cc.k);R(x0+24,BY,5,2,Cc.g);R(x0+29,BY,1,1,Cc.g);R(x0+24,BY,6,1,Cc.l);   // chifre afinando
  R(x0-1,BY-1,26,5,Cc.k);R(x0,BY,24,3,Cc.g);R(x0,BY,24,1,Cc.a);R(x0,BY+2,24,1,Cc.p);      // tampo
  R(x0+6,BY+4,12,3,Cc.k);R(x0+7,BY+4,10,3,Cc.p);R(x0+7,BY+4,2,3,Cc.g);                    // cintura
  R(x0+2,BY+6,20,CHAO-BY-6,Cc.k);R(x0+3,BY+6,18,CHAO-BY-6,Cc.g);R(x0+3,BY+6,18,1,Cc.l)}   // base com pés
 /* o ferreiro de lado, virado para a bigorna, segurando a marreta equipada (ou a improvisada) como o herói segura uma arma:
    o desenho sai do mesmo gerador do herói (js/sprites.js human) com a marreta como arma e o passo do golpe (0 parado,
    1 levanta, 2 bate). Guardado por marreta e passo */
 const corpos=new Map();
 function corpoFerreiro(passo){const id=marretaAtual(),k=id+'|'+Math.round(passo*10);let c=corpos.get(k);
  if(c===undefined){try{c=human('ferreiro','s',0,{sw:ITEMS[id]||{},swing:Math.round(passo*10)/10})}catch(e){c=null}corpos.set(k,c)}return c}
 function ferreiro(passo){const c=corpoFerreiro(passo);if(c&&c.width)g.drawImage(c,FX,CHAO-PES)}
 // passo do golpe durante a forja: levanta (0→1 ou 2→1), bate (1→2) e fica com a marreta na bigorna até a próxima
 function passoGolpe(t){const B=T.batidas;if(t<B[0]-.4||t>B[B.length-1]+.35)return 0;let k=-1;for(let i=0;i<B.length;i++)if(t>=B[i]-.4)k=i;
  const d=t-(B[k]-.4);if(d<.26)return k?2-ease(d/.26):ease(d/.26);if(d<.4)return 1+(d-.26)/.14;return 2}
 function item(id,x,y,giro,esc_=1,flip=1){const im=icone(id);if(!im.complete||!im.naturalWidth)return;g.save();g.translate(Math.round(x),Math.round(y));g.rotate(giro);g.scale(flip*esc_,esc_);g.drawImage(im,-8,-8,16,16);g.restore()}
 function raios(x,y,c,a,r){g.save();g.translate(x,y);g.rotate(tempo*.8);g.globalAlpha=a;g.fillStyle=c;for(let k=0;k<12;k++){g.rotate(Math.PI/6);g.beginPath();g.moveTo(0,0);g.lineTo(r,-2.2);g.lineTo(r,2.2);g.fill()}g.restore();g.globalAlpha=1}
 function faiscas(x,y,n,cores,forca=1){for(let k=0;k<n;k++){const a=Math.random()*Math.PI*2,v=(20+Math.random()*60)*forca;parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-25*forca,v:.4+Math.random()*.8,c:cores[k%cores.length],g:90,s:Math.random()<.2?2:1})}}
 function confete(c){for(let k=0;k<70;k++)parts.push({x:BX+(Math.random()-.5)*20,y:Y_RES-10,vx:(Math.random()-.5)*150,vy:-40-Math.random()*90,v:1.4+Math.random()*1.4,c:k%3?c:k%2?Cc.ol:Cc.f4,g:70,s:2,conf:1})}
 const ease=t=>1-Math.pow(1-Math.min(1,Math.max(0,t)),3),volta=t=>{t=Math.min(1,Math.max(0,t));const c=1.7;return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2)};
 // a animação da forja: tempos em segundos
 const T={gira:1.05,batidas:[1.45,1.85,2.25],revela:2.45,numero:3.15,fim:3.9};
 function comecarAnim(s1,s2,r){anim={t:0,a:s1,b:s2,r,ev:{}};som('forjaGira')}
 function terminarAnim(){if(!anim)return;if(!anim.ev.numero)resultadoSom(anim.r);if(anim.r.subiu&&!anim.ev.nivel)som('levelUp');anim=null;desenhar()}
 function pular(){if(!anim)return;if(anim.t<T.numero){anim.t=T.numero-.01;anim.ev.choque=anim.ev.revela=1;T.batidas.forEach((_,k)=>anim.ev['b'+k]=1)}}
 function resultadoSom(r){if(r.pior)som('forjaPior');else{som(typeof LOOT!='undefined'?LOOT[qi(r.q)]:'lootRaro');setTimeout(()=>som('brilho'),180)}}
 function passo(dt){
  tremor=Math.max(0,tremor-dt*18);flash=Math.max(0,flash-dt*3.2);
  for(const q of parts){q.v-=dt;q.vy+=q.g*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;if(q.conf){q.vx*=.985}if(q.y>CHAO&&!q.conf){q.y=CHAO;q.vy*=-.3;q.vx*=.6}}
  parts=parts.filter(q=>q.v>0);
  for(const c of caindo){c.t+=dt;c.vy+=320*dt;c.x+=c.vx*dt;c.y+=c.vy*dt;c.rot+=c.vr*dt;
   if(c.y>=CHAO-6&&c.vy>0){c.y=CHAO-6;c.vy*=-.42;c.vx*=.65;c.vr*=.5;c.quiques++;som('drop',.7);
    for(let k=0;k<6;k++)parts.push({x:c.x+(Math.random()-.5)*8,y:CHAO-1,vx:(Math.random()-.5)*30,vy:-8-Math.random()*14,v:.35+Math.random()*.3,c:Cc.m,g:40,s:1})}
   if((c.quiques>=2&&Math.abs(c.vy)<40)||c.t>1.8){c.fim=1;faiscas(c.x,c.y,14,[Cc.ol,Cc.f4,Cc.a],.6);
    if(c.mochila){letreiros.push({s:'+1 na mochila',x:c.x,y:c.y-10,t:0});som('item',.7)}}}
  caindo=caindo.filter(c=>!c.fim);
  for(const l of letreiros)l.t+=dt;letreiros=letreiros.filter(l=>l.t<1.2);
  if(!anim)return;const A=anim,t=(A.t+=dt),ev=A.ev;
  if(t>=T.gira&&!ev.choque){ev.choque=1;flash=1;tremor=6;faiscas(BX,Y_RES-2,46,[Cc.f4,Cc.f3,Cc.ol,cor(A.a.q),cor(A.b.q)],1.3);som('bigorna');som('explosao',.6)}
  T.batidas.forEach((b,k)=>{if(t>=b&&!ev['b'+k]){ev['b'+k]=1;tremor=3+k;faiscas(BATE.x,BATE.y,18+k*8,[Cc.f4,Cc.f3,Cc.f2]);som('bigorna')}});
  if(t>=T.revela&&!ev.revela){ev.revela=1;flash=.6;som('magic',.6)}
  if(t>=T.revela&&t<T.numero){A.tique=(A.tique||0)+dt;if(A.tique>.07){A.tique=0;A.rola=Math.round(Math.random()*100);som('tiqueVez',.5)}}
  if(t>=T.numero&&!ev.numero){ev.numero=1;tremor=A.r.pior?1:4;resultadoSom(A.r);if(!A.r.pior){confete(cor(A.r.q));faiscas(BX,Y_RES,30,[cor(A.r.q),Cc.ol,Cc.f4],1.2)}}
  if(A.r.subiu&&t>=T.numero+.5&&!ev.nivel){ev.nivel=1;som('levelUp');confete(Cc.ol)}
  if(t>=T.fim+(A.r.subiu?1.2:0))terminarAnim()}
 function texto(s,x,y,tam,c,a=1,borda=Cc.k){g.save();g.globalAlpha=a;g.font='bold '+tam+'px monospace';g.textAlign='center';g.textBaseline='middle';g.lineWidth=Math.max(1.5,tam/5);g.strokeStyle=borda;g.lineJoin='round';g.strokeText(s,x,y);g.fillStyle=c;g.fillText(s,x,y);g.restore()}
 function pintar(){
  const w=cv.clientWidth|0,h=cv.clientHeight|0;if(!w||!h)return;if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h}
  g.setTransform(1,0,0,1,0,0);g.imageSmoothingEnabled=false;g.fillStyle=Cc.k;g.fillRect(0,0,w,h);
  // a cena encosta embaixo (só uma faixa fina de chão aparece); o espaço de sobra fica em cima, na parede, onde vai a placa
  S=Math.max(1,Math.floor(Math.min(w/LW,h/LH)*2)/2);ox=Math.round((w-LW*S)/2);oy=Math.round(h-(CHAO+CHAO_VISTO)*S);
  const tx=tremor?(Math.random()-.5)*tremor:0,ty=tremor?(Math.random()-.5)*tremor:0;
  g.setTransform(S,0,0,S,ox+tx*S,oy+ty*S);g.imageSmoothingEnabled=false;
  if(!muro)muro=fazerMuro();g.drawImage(muro,MX,MY);
  // chão: uma fileira de lajotas de pedra com a borda de cima clara
  R(MX,CHAO,LW-2*MX,40,'#1a1614');for(let x=MX+((CHAO*3)%11);x<LW-MX;x+=11){R(x,CHAO+1,10,4,'#2c2622');R(x,CHAO+1,10,1,'#3e3530');R(x+3,CHAO+6,10,3,'#241f1c')}R(MX,CHAO,LW-2*MX,1,Cc.k);
  ferramentas();fornalha();
  // luz quente vinda da fornalha e do metal
  brilho(BX,BY,40,'rgba(247,184,74,.8)',anim&&anim.t>T.gira&&anim.t<T.revela?.35:.12);
  const A=anim,t=A?A.t:0;
  bigorna();
  if(!A){ // parado: os itens escolhidos flutuam sobre a bigorna, ou o último resultado brilhando
   const bob=Math.sin(tempo*2.4)*1.5;
   if(esc.length){esc.forEach((i,k)=>{const s=I[i];if(!s)return;const ps=posEscolhido(k),c=cor(s.q),
     // acabou de ser escolhido: desce do alto girando e pousa no ar sobre a bigorna, com um brilho
     f=ease(Math.min(1,(tempo-(chega.get(i)??-9))/.45)),y=ps.y+(k?-bob:bob)-(1-f)*40;
     brilho(ps.x,y,11+3*Math.sin(tempo*3+k),c,.35+.15*f);
     g.globalAlpha=.25;R(ps.x-5,BY-1,10,1,Cc.k);g.globalAlpha=1; // sombra na bigorna
     item(s.id,ps.x,y,(1-f)*6.283*(k?-1:1)+Math.sin(tempo*1.6+k)*.15)})}
   else if(ultimo){const c=cor(ultimo.q),y=Y_RES+bob;raios(BX,y,c,.18,26);brilho(BX,y,16,c,.5);item(ultimo.id,BX,y,0,1.3,Math.cos(tempo*1.2)>=0?1:-1);
    const dif=ultimo.q-ultimo.media;texto('clique no item para recolher',BX,Y_RES-38,4,Cc.w,.55+.35*Math.sin(tempo*3));texto(ultimo.q+'%',BX,Y_RES-28,11,c);
    texto(dif>0?'MELHOR que '+ultimo.media+'%':dif<0?'pior que '+ultimo.media+'%':'igual à média',BX,Y_RES-18,5,dif>0?Cc.ol:Cc.l)}}
  else{
   const r=A.r;
   if(t<T.gira){ // os dois sobem e giram em volta um do outro, cada vez mais rápido e mais perto
    const f=t/T.gira,rad=24*(1-ease(f))+1,th=f*f*16,cy=Y_RES-2-6*ease(Math.min(1,f*3)),sp=f*f*30;
    for(const [s,o] of [[A.a,0],[A.b,Math.PI]]){for(let k=4;k>=1;k--){const th2=th-k*.18*(.3+f);g.globalAlpha=.12*(5-k)*f;item(s.id,BX+Math.cos(th2+o)*rad,cy+Math.sin(th2+o)*rad*.45,sp-k*.4)}g.globalAlpha=1;
     brilho(BX+Math.cos(th+o)*rad,cy+Math.sin(th+o)*rad*.45,10,cor(s.q),.4+.4*f);item(s.id,BX+Math.cos(th+o)*rad,cy+Math.sin(th+o)*rad*.45,sp)}
    texto(A.a.q+'%  +  '+A.b.q+'%',BX,Y_RES-30,6,Cc.w,1-f)}
   else if(t<T.revela){ // metal em brasa na bigorna levando marteladas
    const f=(t-T.gira)/(T.revela-T.gira),quente=f<.5?Cc.f4:f<.8?Cc.f3:Cc.f2;brilho(BATE.x+3,BY-2,12,'rgba(255,240,200,.9)',.6);
    R(BATE.x-3,BY-3,13,3,Cc.k);R(BATE.x-2,BY-2,11,1,quente);R(BATE.x-2,BY-2,11,1,Cc.f4);R(BATE.x-2,BY-1,11,1,quente);texto('média '+r.media+'%',BX,Y_RES-26,6,Cc.ol,1)}
   else{ // o resultado sobe girando como moeda, com raios da cor da qualidade, e o número rola até parar
    const f=(t-T.revela)/(T.numero-T.revela),y=BY-4-(BY-4-Y_RES)*volta(f),giroM=(1-ease(Math.min(1,f*1.15)))*24,c=t>=T.numero?cor(r.q):Cc.f4;
    raios(BX,y,c,Math.min(.3,f*.4),20+14*ease(f));brilho(BX,y,16,c,.6);item(r.id,BX,y,0,1+.3*ease(f),Math.cos(giroM));
    if(t<T.numero)texto((A.rola!=null?A.rola:r.media)+'%',BX,Y_RES-28,10,Cc.w,.9);
    else{const d=t-T.numero,pul=1+.5*Math.max(0,1-d*4)*Math.abs(Math.sin(d*18));texto(r.q+'%',BX,Y_RES-28,Math.round(11*pul),c);
     const dif=r.q-r.media;texto(dif>0?'MELHOR!  +'+dif:dif<0?'pior  −'+(-dif):'igual à média',BX,Y_RES-17,dif>0?7:5,dif>0?Cc.ol:Cc.l,Math.min(1,d*4));
     if(r.novoRecorde&&!r.pior)texto('novo recorde!',BX,Y_RES-11+Math.sin(tempo*6),4,Cc.a,Math.min(1,d*3));
     if(r.subiu&&d>.5)texto(r.mestre?'MESTRE FERREIRO!':'FERREIRO NÍVEL '+nivelDe(forjados)+'!',BX,Y_RES-42,7,Cc.ol,Math.min(1,(d-.5)*3),'#4e2430')}}}
  ferreiro(A?passoGolpe(t):0);
  for(const c of caindo){brilho(c.x,c.y,8,'rgba(239,197,106,.8)',.25);item(c.id,c.x,c.y,c.rot)}
  for(const l of letreiros)texto(l.s,l.x,l.y-l.t*14,5,Cc.ol,Math.min(1,(1.2-l.t)*3));
  for(const q of parts){g.globalAlpha=Math.min(1,q.v*2);R(q.x,q.y,q.s,q.s,q.c)}g.globalAlpha=1;
  if(flash){g.globalAlpha=flash*.8;g.fillStyle=Cc.f4;g.fillRect(-20,-20,LW+40,LH+40);g.globalAlpha=1}
  // escurece as bordas
  g.setTransform(1,0,0,1,0,0);const v=g.createRadialGradient(w/2,h/2,Math.min(w,h)*.35,w/2,h/2,Math.max(w,h)*.7);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.65)');g.fillStyle=v;g.fillRect(0,0,w,h);
  posicionarPlaca(w,h)}
 // a placa (HTML) fica pendurada sobre a bigorna, logo acima dos itens escolhidos
 function posicionarPlaca(w,h){if(!placa)return;
  // some durante a forja, com o item forjado na bigorna e enquanto ele cai para a mochila
  placa.classList.toggle('fora',!!anim||!!ultimo||caindo.some(c=>c.mochila));const pw=placa.offsetWidth,ph=placa.offsetHeight;
  const x=Math.max(pw/2+8,Math.min(w-pw/2-8,ox+BX*S)),y=Math.max(ph+8,oy+(Y_ITEM-10)*S); /* acima dos itens, longe da prateleira e do ferreiro */placa.style.left=Math.round(x)+'px';placa.style.top=Math.round(y)+'px'}
 // clique na cena: pula a animação; tira da bigorna um item escolhido; recolhe o item forjado
 function alvoNaCena(ev){const r=cv.getBoundingClientRect(),lx=(ev.clientX-r.left-ox)/S,ly=(ev.clientY-r.top-oy)/S,perto=(p,raio)=>Math.hypot(lx-p.x,ly-p.y)<raio;
  if(anim)return null;if(ultimo&&!esc.length&&perto({x:BX,y:Y_RES},12))return{tipo:'recolher'};
  for(let k=0;k<esc.length;k++)if(perto(posEscolhido(k),10))return{tipo:'tirar',i:esc[k]};return null}

 /* ---------- painel (HTML) ---------- */
 let lado=null,placa=null;
 function montar(){
  if(!el){el=E('div');el.id='forjaPainel';el.setAttribute('role','dialog');el.setAttribute('aria-label','Forja do Ferreiro');document.body.append(el);
   for(const ev of ['pointerdown','mousedown','click','wheel','contextmenu'])el.addEventListener(ev,e=>e.stopPropagation())}
  if(cv&&cv.isConnected){el.hidden=false;return}
  el.replaceChildren();el.hidden=false;
  const topo=E('div','fjTopo'),x=E('button','biFechar','×');x.type='button';x.setAttribute('aria-label','Fechar');x.onclick=fechar;
  topo.append(E('h3','','Forja do Ferreiro'),x);
  const corpo=E('div','fjCorpo'),cena=E('div','fjCena');cv=E('canvas');g=cv.getContext('2d');placa=E('div','fjPlaca');cena.append(cv,placa);
  cv.onclick=ev=>{if(anim){pular();return}const a=alvoNaCena(ev);if(!a)return;if(a.tipo=='recolher')recolher();else escolher(a.i)};
  cv.onmousemove=ev=>{sob=alvoNaCena(ev);cv.style.cursor=anim||sob?'pointer':'default';cv.title=anim?'Clique para pular a animação':sob?(sob.tipo=='recolher'?'Recolher para a mochila':'Tirar da bigorna'):''};
  lado=E('div','fjLado');corpo.append(cena,lado);el.append(topo,corpo)}
 function faixa(m,[,,pmax,mmax],soma=0){
  const d=E('div','fjFaixa'),z=(c,a,b)=>{const s=E('i',c);s.style.left=a+'%';s.style.width=Math.max(.6,b-a)+'%';d.append(s)};
  z('fjPior',Math.max(0,m-pmax+soma),Math.max(0,m-1+soma));z('fjMelhor',Math.min(100,m+1+soma),Math.min(100,m+mmax+soma));
  const mk=E('b','fjMedia');mk.style.left=m+'%';d.append(mk);return d}
 function desenhar(){
  if(!aberto())return;montar();conferir();if(esc.length<2)confirmar=false;
  const n=nivelDe(forjados),t=chances(n),px=proximo(),B=bonus(),soma=B.qual;
  const gs=grupos(),bp=()=>{const b=E('button','fjBtn fjPar','Próximo par');b.type='button';b.disabled=!gs.length||!!anim;b.title='Escolhe sozinho dois itens iguais (os de maior qualidade)';b.onclick=proximoPar;return b};
  /* placa sobre a bigorna: as chances, a barra, o aviso e o botão Forjar. Some durante a forja e enquanto o item forjado
     está na bigorna (aí a cena mostra o resultado) */
  const assinatura=[anim?1:0,ultimo?1:0,...esc.map(i=>i+':'+(I[i]&&I[i].q)),confirmar?1:0,n,gs.length,marretaAtual()].join('|'),mudou=placa.dataset.k!==assinatura;placa.dataset.k=assinatura;
  placa.classList.toggle('fora',!!anim||!!ultimo);
  if(mudou){placa.replaceChildren();const corpoP=E('div','fjPlacaCorpo');placa.append(corpoP);
   if(esc.length==2){const a=I[esc[0]],b=I[esc[1]],m=media(a.q,b.q),lo=Math.max(0,m-t[2]+soma),hi=Math.max(0,m-1+soma),lo2=Math.min(100,m+1+soma),hi2=Math.min(100,m+t[3]+soma);
    const cab=E('div','fjPlacaCab'),im=E('img');im.src=ITEMS[a.id].ic;im.alt='';
    const conta=E('span','fjConta');conta.append(pinta(E('b','',a.q+'%'),a.q),document.createTextNode(' + '),pinta(E('b','',b.q+'%'),b.q),document.createTextNode(' = média '));
    cab.append(im,E('span','fjNomeP',nomeItem(a.id)),conta,pinta(E('b','fjMediaP',m+'%'),m));
    const l1=E('div','fjLinha'),l2=E('div','fjLinha');
    l1.append(E('span','fjTag pior',t[0]+'%'),document.createTextNode(' sai pior '),pinta(E('b','',lo+'%'),lo),document.createTextNode(' a '),pinta(E('b','',hi+'%'),hi));
    l2.append(E('span','fjTag melhor',t[1]+'%'),document.createTextNode(' sai melhor '),pinta(E('b','',lo2+'%'),lo2),document.createTextNode(' a '),pinta(E('b','',hi2+'%'),hi2));
    corpoP.append(cab,l1,l2,faixa(m,t,soma));
    const av=semMelhora(a.q,b.q);
    if(av){const d=E('div','fjAviso');d.append(E('b','','Não passa de '+av.max+'%'),document.createTextNode(' · seu melhor é '+av.melhor+'%'));corpoP.append(d)}
    const acoes=E('div','fjAcoes'),bt=E('button','fjBtn fjForjar'+(confirmar?' confirma':''),confirmar?'Forjar mesmo assim?':'Forjar');bt.type='button';bt.onclick=forjar;
    acoes.append(bt,bp());corpoP.append(acoes)}
   else{const s=esc.length&&I[esc[0]];
    corpoP.append(E('div','fjPlacaTit',s?'Agora outro '+nomeItem(s.id)+' igual':'Escolha 2 itens iguais'),
     E('div','fjPlacaSub',gs.length?'Clique nos itens da mochila, à direita, ou deixe o ferreiro escolher':'Você não tem dois equipamentos iguais na mochila'));
    if(gs.length){const acoes=E('div','fjAcoes');acoes.append(bp());corpoP.append(acoes)}}
   placa.classList.remove('pop');void placa.offsetWidth;placa.classList.add('pop')}
  lado.replaceChildren();
  lado.append(cartaoFerreiro(n,t,px,B));
  // últimas forjas
  if(hist.length){const h=E('div','fjHist');h.append(E('h4','',seguidas>1?'Últimas forjas · '+seguidas+' melhores seguidas!':'Últimas forjas'));const fila=E('div','fjHistFila');
   for(const o of hist){const c=E('span','fjChip'+(o.pior?' pior':'')),im=E('img');im.src=ITEMS[o.id].ic;im.alt='';c.append(im,pinta(E('b','',(o.pior?'▼':'▲')+o.q),o.q));c._tip=()=>itemTip(o.id,o.q);fila.append(c)}
   h.append(fila);lado.append(h)}
  // equipamentos com par na mochila, agrupados por item
  lado.querySelector('.fjFerreiro').after(E('h4','','Na mochila (só equipamentos com par)'));
  const lista=E('div','fjLista'),base=esc.length?I[esc[0]].id:null;
  for(const [id,ids] of gs){const gr=E('div','fjGrupo');gr.append(E('small','',nomeItem(id)+' ×'+ids.length));const fila=E('div','fjGrupoFila');
   for(const i of ids.slice().sort((a,b)=>I[b].q-I[a].q)){const s=I[i],d=E('button','fjItem'+(esc.includes(i)?' on':'')+(base&&id!==base&&esc.length<2?' fora':''));d.type='button';
    const im=E('img');im.src=ITEMS[s.id].ic;im.alt='';d.append(im,pinta(E('small','',s.q+'%'),s.q));d.onclick=()=>escolher(i);
    d._tip=()=>itemTip(s.id,s.q)+'<div class=tm>Clique: '+(esc.includes(i)?'tirar da bigorna':'pôr na bigorna')+'</div>';fila.append(d)}
   gr.append(fila);lista.append(gr)}
  if(!gs.length)lista.append(E('p','biVazio','Você não tem dois equipamentos iguais na mochila. Traga pares de armas, armaduras ou acessórios.'));
  // a lista vem logo depois do título (as últimas forjas ficam embaixo dela)
  lado.querySelector(':scope>h4').after(lista);
  lado.append(E('p','biDica','Os dois itens somem e volta um só · equipados e itens do baú não entram · clique num item sobre a bigorna para tirá-lo · clique na cena ou Espaço para pular a animação.'))}

 /* cartão do ferreiro: a marreta na mão (clique para pegar de volta), o nível com a barra até o próximo, as chances
    já com o bônus, o recorde e o total forjado; embaixo, as marretas da mochila para dar a ele */
 function cartaoFerreiro(n,t,px,B){
  const c=E('div','fjFerreiro'),topo=E('div','fjFerTopo'),id=marretaAtual();
  const slot=E('button','fjMarreta'+(martelo?'':' padrao'));slot.type='button';const im=E('img');im.src=ITEMS[id]?ITEMS[id].ic:'';im.alt='';slot.append(im);
  if(tempo-batidaMartelo<.5)slot.classList.add('bate');
  slot._tip=()=>(ITEMS[id]?itemTip(id,martelo?martelo.q:null):'<b>Marreta Improvisada</b>')+'<div class=tm>'+(martelo?'Clique: pegar de volta para a mochila':'O ferreiro já usa esta por padrão. Dê a ele uma marreta melhor da mochila.')+'</div>';
  if(martelo)slot.onclick=tirarMartelo;
  const info=E('div','fjFerInfo'),linha=E('div','fjFerNv');
  linha.append(E('b','',n<TABELA.length||px?'Nível '+n:'Mestre'),E('small','',px?forjados+' / '+px.ate+' para o '+px.rotulo:forjados+' forjados'));
  const bar=E('div','fjXp'),f=E('i');f.style.width=(px?Math.min(100,(forjados-px.de)/(px.ate-px.de)*100):100)+'%';bar.append(f);
  info.append(linha,bar,E('small','fjFerMarreta',(ITEMS[id]?nomeItem(id):'Marreta Improvisada')+' · '+(B.qual||B.chance?bonusTxt(id):'sem bônus')));
  topo.append(slot,info);
  const dados=E('div','fjFerDados'),dado=(rot,val,cls)=>{const d=E('div','fjDado'+(cls?' '+cls:''));d.append(E('small','',rot),val);dados.append(d)};
  dado('Sai pior',E('b','',t[0]+'% · até −'+t[2]));dado('Sai melhor',E('b','',t[1]+'% · até +'+t[3]),'bom');
  dado('Forjados',E('b','',String(forjados)));dado('Recorde',recorde!=null?pinta(E('b','',recorde+'%'),recorde):E('b','','—'));
  c.append(topo,dados);
  const ms=marretasNaMochila();
  if(ms.length){const f2=E('div','fjMarretas');f2.append(E('small','','Marretas na mochila · clique para dar ao ferreiro'));const fila=E('div','fjGrupoFila');
   for(const [s,i] of ms){const b=E('button','fjItem');b.type='button';const im2=E('img');im2.src=ITEMS[s.id].ic;im2.alt='';b.append(im2,pinta(E('small','',s.q+'%'),s.q));b.onclick=()=>darMartelo(i);
    b._tip=()=>itemTip(s.id,s.q)+'<div class=tm>Clique: dar ao ferreiro</div>';fila.append(b)}
   f2.append(fila);c.append(f2)}
  return c}

 window.FORJA={abrir,fechar,atualizarMundo:()=>atualizarFerreiroMundo(),sortear,media,semMelhora,nivelDe,proximo,chances,bonusTxt,MARRETAS,TABELA,NIVEIS,get martelo(){return martelo},get nivel(){return nivelDe(forjados)},get forjados(){return forjados},get aberto(){return aberto()},
  dados:()=>({forjados,recorde,martelo}),
  carregar(d){const f=d&&(Number.isInteger(d.forjados)?d.forjados:Number.isInteger(d.xp)?d.xp:0);forjados=f>0?f:0;recorde=d&&Number.isInteger(d.recorde)&&d.recorde>=0&&d.recorde<=100?d.recorde:null;
   // a marreta dada ao ferreiro (se o item ainda existir no jogo)
   const m=d&&d.martelo;martelo=m&&MARRETAS[m.id]&&(typeof ITEMS=='undefined'||ITEMS[m.id])?{id:m.id,q:Number.isInteger(m.q)?Math.max(0,Math.min(100,m.q)):50}:null;atualizarFerreiroMundo()}};
 addEventListener('keydown',e=>{if(!aberto())return;if(e.key==='Escape'){fechar();e.stopImmediatePropagation()}else if(e.code==='Space'){e.preventDefault();e.stopImmediatePropagation();if(anim)pular();else if(esc.length==2)forjar();else if(ultimo)recolher()}},true);
 addEventListener('mochila-mudou',()=>{if(aberto()&&!anim)desenhar()});
 atualizarFerreiroMundo(); // já começa com a improvisada na mão
})();
