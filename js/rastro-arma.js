/* ---------- Rastro na ponta da arma (2026-10-28, pedido do usuário) ----------
   Durante o golpe do herói, guarda a posição da ponta da arma a cada quadro (a mesma pose de js/sprites.js poseArma,
   com o passo fracionário do golpe fluido) e desenha uma faixa clara que afina e some em ~0,16 s.
   Ponta = mão (MAOS, na tela 2× do herói) + direção da pose × distância da mão até a ponta (altura do desenho da arma ×
   pega). As posições ficam relativas ao herói, então o rastro acompanha quem anda ou avança no golpe. */
(function(){
 const VIDA=.16;
 // desenho da arma na mão: altura em pixels do herói e a pega (fração da ponta até a mão)
 function medidas(w){const s=w.equippedSprite,st=w.v?w.v.st:0,k2=w.escalaMao==2;return{alt:s?(k2?s.height:(st==2?20:st==1?14:16)):16,pega:w.pega??(s?1:.75)}}
 window.rastroArma=(u,f,an,bx,by)=>{
  const lst=u._rastro||(u._rastro=[]),w=u===p&&EQ.sw&&ITEMS[EQ.sw.id];
  if(an&&an.sw>=1&&w&&typeof poseArma=='function'&&typeof MAOS!='undefined'){
   const dir=f.d[0]=='s'&&f.d.length===1?'s':f.d[0]=='u'?'u':'d',pose=poseArma(w.ataque,dir,'main',an.sw),m=MAOS[dir][0],{alt,pega}=medidas(w);
   // mão no mundo a partir do ponto do herói: a tela 2× tem a origem 14 px à esquerda do centro e 22 px acima do pé
   // (js/sprites.js human/recortarHeroi + render.js dr: topo = y − 24 − cima/2, origem 2 + cima/2 abaixo do topo)
   const hx=(m[0]+pose.dx-14)/2,hy=(m[1]+pose.dy)/2-22,a=pose.a*Math.PI/180,d=alt*pega;
   let x=hx+Math.cos(a)*d,y=hy+Math.sin(a)*d;
   // arma com pixel de engate (js/sprites.js engateArma): a ponta é o pixel mais longe do engate, girado como no desenho
   const s=w.equippedSprite,eg=typeof engateArma=='function'&&engateArma(w,s);
   if(eg){const k=w.escalaMao==2?1:alt/s.height,r=giroEngate(eg,pose,poseArma(w.ataque,dir,'main',0).a,an.sw,dir=='u')*Math.PI/180;let vx=(eg.t.x-eg.x)*k;const vy=(eg.t.y-eg.y)*k;if(dir=='u')vx=-vx;
    x=hx+vx*Math.cos(r)-vy*Math.sin(r);y=hy+vx*Math.sin(r)+vy*Math.cos(r)}
   if(f.fl<0)x=-x;
   const ult=lst[lst.length-1];if(!ult||Math.hypot(ult.x-x,ult.y-y)>.3)lst.push({x,y,t:time});
  }
  while(lst.length&&time-lst[0].t>VIDA)lst.shift();
  if(lst.length<2)return;
  ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
  for(let i=1;i<lst.length;i++){const a=lst[i-1],b=lst[i],v=Math.max(0,1-(time-b.t)/VIDA);
   ctx.globalAlpha=.18*v;ctx.strokeStyle='#ffffff';ctx.lineWidth=4*v+1;ctx.beginPath();ctx.moveTo(bx+a.x,by+a.y);ctx.lineTo(bx+b.x,by+b.y);ctx.stroke(); // brilho
   ctx.globalAlpha=.7*v;ctx.lineWidth=1.6*v+.4;ctx.stroke()} // miolo
  ctx.restore();
 };
})();
