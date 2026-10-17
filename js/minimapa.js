/* ---------- Minimapa da ilha ----------
   Terreno com névoa nas áreas ainda não exploradas, marcadores em pixel (monstros, elites, chefes, NPCs, jogadores online),
   acampamento, portal, paliçada, alvo de missão, seta do jogador na direção em que ele olha e bússola. */
(function(){
 const SZ=160,CELL=8,FW=W/CELL,KEY='ilha-rpg-explorado';
 const store=()=>MODO.teste?sessionStorage:localStorage;
 /* névoa: 1 bit por célula de 8×8 px, salva junto do progresso (some no "Novo jogo") */
 const seen=new Uint8Array(FW*FW);
 try{const raw=store().getItem(KEY);if(raw&&store().getItem('ilha-rpg-save')){const b=atob(raw);for(let i=0;i<seen.length;i++)seen[i]=(b.charCodeAt(i>>3)>>(i&7))&1}}catch(e){}
 const fog=mkCanvas(FW,FW),fg=fog.getContext('2d');
 fg.fillStyle='#0b0f16';fg.fillRect(0,0,FW,FW);for(let i=0;i<seen.length;i++)if(seen[i])fg.clearRect(i%FW,i/FW|0,1,1);
 let dirty=false;
 function explore(){const r=Math.ceil(150/CELL),ci=p.x/CELL|0,cj=p.y/CELL|0;
  for(let j=cj-r;j<=cj+r;j++)for(let i=ci-r;i<=ci+r;i++){if(i<0||j<0||i>=FW||j>=FW)continue;const k=j*FW+i;if(seen[k]||(i-ci)**2+(j-cj)**2>r*r)continue;seen[k]=1;fg.clearRect(i,j,1,1);dirty=true}}
 setInterval(()=>{if(!dirty||MODO.motor)return;dirty=false;let s='';for(let i=0;i<seen.length;i+=8){let b=0;for(let k=0;k<8;k++)b|=seen[i+k]<<k;s+=String.fromCharCode(b)}try{store().setItem(KEY,btoa(s))}catch(e){}},4000);
 /* moldura de sombra interna e bússola: desenhadas uma vez */
 const frame=mkCanvas(SZ,SZ),fr=frame.getContext('2d');
 {const g=fr.createRadialGradient(SZ/2,SZ/2,SZ*.32,SZ/2,SZ/2,SZ*.74);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.55)');fr.fillStyle=g;fr.fillRect(0,0,SZ,SZ);
  fr.fillStyle='#0d0b09';fr.fillRect(SZ/2-6,1,12,11);fr.fillStyle='#6a512e';fr.fillRect(SZ/2-6,12,12,1);
  fr.fillStyle='#e7cb88';fr.font='bold 9px monospace';fr.textAlign='center';fr.textBaseline='top';fr.fillText('N',SZ/2,2)}
 const px=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),w,h)};
 const dot=(g,x,y,c,s=3)=>{px(g,x-(s>>1)-1,y-(s>>1)-1,s+2,s+2,'#0a0806');px(g,x-(s>>1),y-(s>>1),s,s,c)};
 const diamond=(g,x,y,c,r=4)=>{g.fillStyle='#0a0806';g.beginPath();g.moveTo(x,y-r-1.5);g.lineTo(x+r+1.5,y);g.lineTo(x,y+r+1.5);g.lineTo(x-r-1.5,y);g.fill();g.fillStyle=c;g.beginPath();g.moveTo(x,y-r);g.lineTo(x+r,y);g.lineTo(x,y+r);g.lineTo(x-r,y);g.fill()};
 window.drawMinimap=function(){
  const mm=$('mm').getContext('2d'),R=window.MMR||170,k=SZ/(2*R),ox=p.x-R,oy=p.y-R,cl=v=>Math.max(4,Math.min(SZ-4,v));
  explore();
  mm.imageSmoothingEnabled=false;mm.fillStyle='#173f5c';mm.fillRect(0,0,SZ,SZ);
  const sx=Math.max(0,ox),sy=Math.max(0,oy),ex=Math.min(W,p.x+R),ey=Math.min(W,p.y+R);
  if(ex>sx&&ey>sy){mm.drawImage(map,sx,sy,ex-sx,ey-sy,(sx-ox)*k,(sy-oy)*k,(ex-sx)*k,(ey-sy)*k);
   mm.imageSmoothingEnabled=true;mm.globalAlpha=.88;mm.drawImage(fog,sx/CELL,sy/CELL,(ex-sx)/CELL,(ey-sy)/CELL,(sx-ox)*k,(sy-oy)*k,(ex-sx)*k,(ey-sy)*k);mm.globalAlpha=1;mm.imageSmoothingEnabled=false}
  const at=(x,y)=>[(x-ox)*k,(y-oy)*k],inside=([x,y])=>x>=0&&y>=0&&x<SZ&&y<SZ;
  if(wallBuilt){mm.strokeStyle='#0a0806';mm.lineWidth=3;const path=()=>{mm.beginPath();for(let i=0;i<=campWallPosts.length;i++){const q=campWallPosts[i%campWallPosts.length],[x,y]=at(q.x,q.y);if(!i||dist(q,campWallPosts[i-1])>20)mm.moveTo(x,y);else mm.lineTo(x,y)}mm.stroke()};path();mm.strokeStyle='#c99a5e';mm.lineWidth=1.5;path();
   const [gx,gy]=at(campGate.x,campGate.y);px(mm,gx-3,gy-2,6,4,CAMP_WALL.gateOpen?'#87dd71':'#e8b654')}
  // acampamento (tenda) e portal
  {const [x,y]=at(CX,CY);if(inside([x,y])){mm.fillStyle='#0a0806';mm.beginPath();mm.moveTo(x,y-6);mm.lineTo(x+6,y+4);mm.lineTo(x-6,y+4);mm.fill();mm.fillStyle='#ffb02e';mm.beginPath();mm.moveTo(x,y-4.5);mm.lineTo(x+4.5,y+3);mm.lineTo(x-4.5,y+3);mm.fill();px(mm,x-1,y,2,3,'#5a3417')}}
  if(campPortalBuilt){const [x,y]=at(campPortal.x,campPortal.y);if(inside([x,y])){px(mm,x-3,y-4,6,8,'#0a0806');px(mm,x-2,y-3,4,6,'#8a4ad0');px(mm,x-1,y-2,2,4,'#e0b8ff')}}
  // NPCs
  if(typeof NPCS!='undefined')NPCS.forEach(n=>{if(n.x<-1000)return;const q=at(n.x,n.y);if(inside(q))dot(mm,q[0],q[1],'#ffe28a',2)});
  // monstros: pontos; elites e chefes em losango (ficam presos na borda quando estão perto)
  en.forEach(e=>{if(e.hp<=0||!canSee(e.x,e.y))return;const [x,y]=at(e.x,e.y);if(!inside([x,y]))return;
   if(e.bossType=='grandboss'||e.bossType=='boss'||e.boss)diamond(mm,cl(x),cl(y),'#ff4d6a',4+Math.sin(time*5));
   else if(e.elite)diamond(mm,cl(x),cl(y),'#f0a52e',3);
   else dot(mm,x,y,p.tgt===e?'#ffffff':'#e8443a',3)});
  // alvo de missão
  en.forEach(t=>{if(t.hp<=0||!questMonsterRequested(t.ty))return;const [tx,ty]=at(t.x,t.y),x=cl(tx),y=cl(ty),r=5+Math.sin(time*6)*1.3;
   mm.strokeStyle='#0a0806';mm.lineWidth=3;mm.beginPath();mm.arc(x,y,r,0,7);mm.stroke();mm.strokeStyle='#ffe26a';mm.lineWidth=1.5;mm.beginPath();mm.arc(x,y,r,0,7);mm.stroke();
   mm.fillStyle='#ffd84a';mm.font='bold 9px monospace';mm.textAlign='center';mm.textBaseline='middle';mm.fillText('!',x,y)});
  if(window.onlineMinimap)onlineMinimap(mm,ox,oy,k,SZ);
  // jogador: seta na direção do olhar
  {const a=Math.atan2(p.fy||1,p.fx||0),c=SZ/2,pt=(r,t)=>[c+Math.cos(a+t)*r,c+Math.sin(a+t)*r];
   const tri=(s,col)=>{mm.fillStyle=col;mm.beginPath();const [x1,y1]=pt(6*s,0),[x2,y2]=pt(5*s,2.5),[x3,y3]=pt(2*s,Math.PI),[x4,y4]=pt(5*s,-2.5);mm.moveTo(x1,y1);mm.lineTo(x2,y2);mm.lineTo(x3,y3);mm.lineTo(x4,y4);mm.fill()};
   tri(1.35,'#0a0806');tri(1,'#ffffff')}
  mm.drawImage(frame,0,0);
 };
 window.resetExploredMap=()=>{seen.fill(0);fg.fillStyle='#0b0f16';fg.fillRect(0,0,FW,FW);try{store().removeItem(KEY)}catch(e){}};
})();
