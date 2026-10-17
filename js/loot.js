/* ---------- Itens no chão (drops de monstros) ----------
   O item salta de onde o monstro morreu, fica um instante no chão brilhando na cor da raridade
   (com um feixe de luz nas raridades altas) e depois voa até o jogador; só então entra em "Itens encontrados".
   Moedas também saltam e voam até o jogador (só visual: o ouro já foi somado).
   Os sons crescem com a raridade (js/audio.js: somQueda, somRaridade). */
(function(){
 if(MODO.motor)return;
 const SALTO_S=.32,CHAO_S=1.1,VOO_S=.55,MAX_ITENS=40;
 const itens=[],moedas=[],imgs=new Map();
 const rnd=(a,b)=>a+Math.random()*(b-a);
 const raridade=q=>q==null?-1:qi(q); // -1 = sem qualidade (material, consumível)
 const COR_SEM='#e7cb88';
 const corDe=q=>q==null?COR_SEM:QCOL[qi(q)];
 // lugar atual: se o jogador mudar de mapa antes do item chegar, ele vai direto para os encontrados
 const lugar=()=>(window.inTaverna?'t':window.inDungeon?'d':'i')+(window.MP&&MP.visitando||'');
 function imagem(id){
  const it=ITEMS[id];if(!it)return null;
  if(it.itemSprite)return it.itemSprite;
  if(!imgs.has(id)){const im=new Image();im.src=it.ic;imgs.set(id,im)}
  return imgs.get(id);
 }
 window.soltarItem=(id,x,y,{questReward=false,q}={})=>{
  if(!ITEMS[id])return;
  if(q===undefined)q=gearType[id]?rollQ():null;
  if(itens.length>=MAX_ITENS){entregar({id,q,questReward});return}
  const a=Math.random()*Math.PI*2,d=rnd(12,26);
  itens.push({id,q,questReward,x,y:y-6,sx:x,sy:y-6,tx:x+Math.cos(a)*d,ty:y-2+Math.sin(a)*d*.6,arco:rnd(16,26),fase:'salto',t:-itens.filter(o=>o.fase==='salto').length*.12,lugar:lugar(),bob:Math.random()*6});
 };
 window.soltarMoedas=(x,y,ouro)=>{
  const n=Math.min(12,Math.max(3,Math.round(Math.sqrt(ouro)*1.4)));
  for(let i=0;i<n;i++){const a=-Math.PI/2+rnd(-1.2,1.2),v=rnd(55,110);moedas.push({x,y:y-6,vx:Math.cos(a)*v,vy:Math.sin(a)*v,chao:y+rnd(-2,10),t:0,fase:'salto',espera:rnd(.35,.7),lugar:lugar()})}
 };
 function entregar(o){
  offerDrop(o.id,o.questReward,o.q);
  if(window.somRaridade)somRaridade(o.q,o.id);
 }
 function atualizar(dt){
  const aqui=lugar();
  for(let i=itens.length;i--;){
   const o=itens[i];o.t+=dt;
   if(o.lugar!==aqui||p.dead>0&&o.fase==='voo'){entregar(o);itens.splice(i,1);continue}
   if(o.t<0)continue;
   if(o.fase==='salto'){
    const k=Math.min(1,o.t/SALTO_S);o.x=o.sx+(o.tx-o.sx)*k;o.y=o.sy+(o.ty-o.sy)*k-4*o.arco*k*(1-k);
    if(k>=1){o.fase='chao';o.t=0;if(window.somQueda)somQueda(o.q);
     if(raridade(o.q)>=4){ring(o.x,o.y,20,corDe(o.q),.6);ft(o.x,o.y-18,raridade(o.q)>=5?'LENDÁRIO!':'ÉPICO!',corDe(o.q))}}
   }else if(o.fase==='chao'){
    // raridades altas ficam um pouco mais no chão, para o jogador ver o brilho
    if(o.t>=CHAO_S+Math.max(0,raridade(o.q))*.12&&p.dead<=0){o.fase='voo';o.t=0;o.sx=o.x;o.sy=o.y}
   }else{
    const k=Math.min(1,o.t/VOO_S),e=k*k*(3-2*k);
    o.x=o.sx+(p.x-o.sx)*e;o.y=o.sy+(p.y-14-o.sy)*e-Math.sin(k*Math.PI)*10;
    if(k>=1){entregar(o);itens.splice(i,1)}
   }
  }
  for(let i=moedas.length;i--;){
   const m=moedas[i];m.t+=dt;
   if(m.lugar!==aqui){moedas.splice(i,1);continue}
   if(m.fase==='salto'){m.x+=m.vx*dt;m.y+=m.vy*dt;m.vy+=260*dt;if(m.y>=m.chao&&m.vy>0){m.y=m.chao;m.vy*=-.35;m.vx*=.5;if(Math.abs(m.vy)<18){m.vy=0;m.vx=0}}if(m.t>=m.espera){m.fase='voo';m.t=0;m.sx=m.x;m.sy=m.y}}
   else{const k=Math.min(1,m.t/.4),e=k*k;m.x=m.sx+(p.x-m.sx)*e;m.y=m.sy+(p.y-12-m.sy)*e;if(k>=1){moedas.splice(i,1);if(window.playGameSound)playGameSound('moeda')}}
  }
 }
 const upd0=upd;upd=function(dt){upd0(dt);try{atualizar(dt)}catch(e){console.error('Itens no chão:',e)}};
 // desenho (coordenadas do mundo): chamado pelo render.js (ilha) e pelo dungeon.js (DG)
 window.desenharLoot=()=>{
  const tt=performance.now()/1000;
  for(const m of moedas){const x=Math.round(m.x),y=Math.round(m.y);ctx.fillStyle='#7a5a10';ctx.fillRect(x-2,y-1,4,3);ctx.fillStyle='#ffd84a';ctx.fillRect(x-2,y-2,4,3);ctx.fillStyle='#fff6c0';ctx.fillRect(x-1,y-2,1,1)}
  for(const o of itens){
   if(o.t<0&&o.fase==='salto')continue;
   const cor=window.ehMissao&&ehMissao(o.id,o.questReward)?'#ffd84a':corDe(o.q),r=raridade(o.q),x=Math.round(o.x),flut=o.fase==='chao'?Math.round(Math.sin(tt*3+o.bob)*1.5):0,y=Math.round(o.y)+flut;
   // feixe de luz e sombra no chão
   if(o.fase!=='voo'){
    ctx.save();ctx.globalAlpha=.35;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(x,Math.round(o.y)+7,5,2,0,0,7);ctx.fill();ctx.restore();
    if(o.fase==='chao'&&r>=2){const h=10+r*8,pul=.5+.5*Math.sin(tt*4+o.bob),g=ctx.createLinearGradient(0,y-h,0,y+4);g.addColorStop(0,cor+'00');g.addColorStop(1,cor);ctx.save();ctx.globalAlpha=.22+.18*pul+(r-2)*.06;ctx.fillStyle=g;ctx.fillRect(x-2-(r>=4?1:0),y-h,4+(r>=4?2:0),h+4);ctx.restore()}
   }
   ctx.save();ctx.shadowColor=cor;ctx.shadowBlur=r>=3?6:3;
   ctx.fillStyle='#0f0d0a';ctx.fillRect(x-6,y-6,12,12);ctx.strokeStyle=cor;ctx.lineWidth=1;ctx.strokeRect(x-5.5,y-5.5,11,11);ctx.restore();
   const im=imagem(o.id);if(im&&(im.complete===undefined||im.complete))try{ctx.drawImage(im,x-4,y-4,8,8)}catch(e){}
   // item de missão: "!" dourado pulando em cima
   if(window.ehMissao&&ehMissao(o.id,o.questReward)&&o.fase!=='voo'){const yy=y-10-Math.round(Math.abs(Math.sin(tt*5+o.bob))*3);ctx.font='bold 10px monospace';ctx.textAlign='center';ctx.fillStyle='#000';ctx.fillText('!',x+1,yy+1);ctx.fillStyle='#ffd84a';ctx.fillText('!',x,yy)}
   // brilhos girando nas raridades épica e lendária
   if(r>=4&&o.fase!=='voo')for(let k=0;k<(r>=5?4:2);k++){const a=tt*2+k*Math.PI*2/(r>=5?4:2);ctx.fillStyle=k%2?'#fff':cor;ctx.fillRect(Math.round(x+Math.cos(a)*9),Math.round(y+Math.sin(a)*6),1,1)}
  }
 };
 window.lootNoChao=()=>itens.length; // para testes
})();
