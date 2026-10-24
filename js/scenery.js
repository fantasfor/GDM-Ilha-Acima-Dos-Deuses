/* ---------- cenário: pixel art procedural em 1:1 (1 pixel = 1 pixel do mundo, como os personagens), com variantes únicas e cercas que se conectam ---------- */
(function(){
const mul=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const ih=(x,y,s)=>{let h=Math.imul(x|0,374761393)+Math.imul(y|0,668265263)+Math.imul(s|0,2147483647);h=Math.imul(h^h>>>13,1274126177);return((h^h>>>16)>>>0)/4294967296};
const noise=(x,y,sc,s)=>{const a=x/sc,b=y/sc,i=Math.floor(a),j=Math.floor(b),u=a-i,v=b-j,su=u*u*(3-2*u),sv=v*v*(3-2*v);
 return(ih(i,j,s)*(1-su)+ih(i+1,j,s)*su)*(1-sv)+(ih(i,j+1,s)*(1-su)+ih(i+1,j+1,s)*su)*sv};
const rgb=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
const RAW={
 stone:['#1f2430','#363d4c','#505a6b','#6f7a8c','#97a2b3','#c6cfdb'],
 granite:['#2a2523','#443d3a','#645a55','#877b73','#b0a49a','#d9cfc4'],
 slate:['#1b2433','#2c3b52','#43587a','#627c9f','#8aa6c6','#b9d0e6'],
 leaf:['#0d2a1a','#16452b','#22662f','#38893a','#5fb04e','#9ed86a'],
 leaf2:['#18301a','#2c4f1f','#477a25','#6da130','#9ccb4a','#d2ee7a'],
 pine:['#082022','#0f3a37','#17564a','#247a5a','#3fa06c','#7ccb8a'],
 flor:['#3a1630','#6e2a52','#a8467a','#d9709e','#f3a6c4','#ffe0ec'],
 outono:['#3a1608','#6e2c0e','#a8481a','#d9702a','#f5a43e','#ffd987'],
 carvalho:['#0a2014','#123824','#1d542e','#2f7236','#4c9442','#86c062'],
 moss:['#1a2c14','#2d4a1c','#456f25','#62933a','#8bba4f','#bfe07a'],
 wood:['#24130a','#432612','#65401f','#8c5b2d','#b8803f','#e0aa62'],
 drift:['#25211e','#413c37','#645d55','#898177','#afa597','#d4cbbb'],
 birch:['#2b2c2e','#55565a','#8a8b8f','#bcbdbf','#e0e0dc','#f6f6f0'],
 cactus:['#0f2f1f','#194c2e','#296f3f','#41935a','#6fbf79','#b2e6a0'],
 cb:['#0b2038','#12426b','#1c6f9e','#34a2c6','#74d4e0','#d4fbff'],
 cp:['#1d0f3a','#3a1d70','#5e32a8','#8657d6','#b58cf2','#eddcff'],
 cg:['#06302a','#0b5a47','#13896a','#2fc08a','#7ee8b4','#d9ffe9'],
 cr:['#3a0b16','#6e1226','#a31f3a','#d63f55','#f5808c','#ffd5d8'],
 capr:['#3b0f12','#701a1d','#a82a2a','#d44a3a','#f08060','#ffd2b8'],
 capb:['#2a1a10','#4a2e1c','#6e4a2c','#946a40','#bd915c','#e6c796'],
 capu:['#0f2040','#1a3d7a','#2a62b8','#4c8ee8','#8cc4ff','#d6efff'],
 capo:['#3a1a08','#6e3410','#a8521c','#d9782e','#f5a24f','#ffd9a0'],
 stem:['#4a3d30','#7a6a55','#a8977d','#cfc1a4','#ece3cc','#fffaf0']
};
const R={};for(const k in RAW)R[k]=RAW[k].map(rgb);
const GL={cb:'116,212,224',cp:'181,140,242',cg:'126,232,180',cr:'245,128,140',capu:'140,196,255'};
class B{constructor(w,h){this.w=w;this.h=h;this.d=new Uint8ClampedArray(w*h*4)}
 set(x,y,c,a=255){x|=0;y|=0;if(x<0||y<0||x>=this.w||y>=this.h)return;const i=(y*this.w+x)*4;this.d[i]=c[0];this.d[i+1]=c[1];this.d[i+2]=c[2];this.d[i+3]=a}
 solid(x,y){return x>=0&&y>=0&&x<this.w&&y<this.h&&this.d[(y*this.w+x)*4+3]>200}}
function cvs(b,glow){const c=document.createElement('canvas');c.width=b.w;c.height=b.h;const x=c.getContext('2d');x.putImageData(new ImageData(b.d,b.w,b.h),0,0);
 if(glow){x.globalCompositeOperation='destination-over';const g=x.createRadialGradient(b.w/2,b.h*.6,2,b.w/2,b.h*.6,b.w*.62);g.addColorStop(0,'rgba('+glow+',.38)');g.addColorStop(1,'rgba('+glow+',0)');x.fillStyle=g;x.fillRect(0,0,b.w,b.h)}return c}
const BAY=[[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]].map(r=>r.map(v=>(v+.5)/16));
function shape(b,hf,ramp,o={}){
 const w=b.w,h=b.h,n=ramp.length-1,K=o.k||1.1,Z=new Float32Array(w*h).fill(-1),Lx=-.49,Ly=-.6,Lz=.63;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const z=hf(x,y);Z[y*w+x]=z==null?-1:z}
 const zz=(x,y)=>x<0||y<0||x>=w||y>=h?0:Math.max(0,Z[y*w+x]);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const z=Z[y*w+x];if(z<0)continue;
  const gx=(zz(x+1,y)-zz(x-1,y))*.5*K,gy=(zz(x,y+1)-zz(x,y-1))*.5*K,lit=(-gx*Lx-gy*Ly+Lz)/Math.hypot(gx,gy,1);
  let t=lit*1.15+.04,rp=ramp;if(o.tex){const r=o.tex(x,y,t,z,y*w+x);if(typeof r=='number')t=r;else if(r){t=r.t;rp=r.ramp||ramp}}
  t=Math.max(0,Math.min(1,t));const v=t*n,lo=Math.floor(v),f=v-lo;let i=lo+(f>.72?1:f<.28?0:(f>BAY[y&3][x&3]?1:0));
  b.set(x,y,rp[Math.max(0,Math.min(n,i))])}}
function outline(b,c){const w=b.w,h=b.h,add=[];for(let y=0;y<h;y++)for(let x=0;x<w;x++){if(b.solid(x,y))continue;if(b.solid(x-1,y)||b.solid(x+1,y)||b.solid(x,y-1)||b.solid(x,y+1))add.push([x,y])}add.forEach(([x,y])=>b.set(x,y,c))}
function shadow(b,cx,cy,rx,ry){for(let y=Math.floor(cy-ry);y<=cy+ry;y++)for(let x=Math.floor(cx-rx);x<=cx+rx;x++)if(((x+.5-cx)/rx)**2+((y+.5-cy)/ry)**2<=1&&!b.solid(x,y))b.set(x,y,[18,14,28],74)}
const cap=(x,y,ax,ay,bx,by,r)=>{x+=.5;y+=.5;const dx=bx-ax,dy=by-ay,l=dx*dx+dy*dy,t=l?Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/l)):0,d=Math.hypot(x-ax-dx*t,y-ay-dy*t);return d<r?r*Math.sqrt(1-(d/r)*(d/r)):-1};
const ell=(x,y,cx,cy,rx,ry,hh)=>{const d=Math.hypot((x+.5-cx)/rx,(y+.5-cy)/ry);return d<1?hh*Math.sqrt(1-d*d):-1};

/* ---- pedras ---- */
const ROCKV=[
 {w:24,h:18,ramp:'stone',b:[{cx:12,cy:9.5,rx:8.5,ry:6}]},
 {w:30,h:20,ramp:'granite',moss:1,b:[{cx:15,cy:11,rx:11.5,ry:7}]},
 {w:20,h:22,ramp:'slate',b:[{cx:10,cy:12,rx:6.5,ry:8}]},
 {w:36,h:20,ramp:'stone',b:[{cx:11,cy:12,rx:7,ry:5.5},{cx:25,cy:11,rx:9.5,ry:7}]},
 {w:32,h:18,ramp:'granite',b:[{cx:8,cy:12,rx:5,ry:3.8},{cx:19,cy:10,rx:7,ry:5.2},{cx:26,cy:13,rx:4.5,ry:3.4}]},
 {w:28,h:16,ramp:'slate',moss:1,b:[{cx:14,cy:9,rx:11,ry:5.5}]}];
const BOULDV=[
 {w:46,h:42,ramp:'stone',b:[{cx:23,cy:25,rx:18,ry:16}]},
 {w:54,h:40,ramp:'granite',moss:1,b:[{cx:27,cy:25,rx:22,ry:14}]},
 {w:36,h:50,ramp:'slate',b:[{cx:18,cy:32,rx:13,ry:18}]},
 {w:58,h:44,ramp:'stone',b:[{cx:20,cy:27,rx:14,ry:13},{cx:36,cy:29,rx:17,ry:14}]},
 {w:52,h:46,ramp:'granite',moss:1,facets:10,b:[{cx:26,cy:28,rx:20,ry:15}]},
 {w:60,h:46,ramp:'slate',b:[{cx:16,cy:30,rx:10,ry:9},{cx:44,cy:31,rx:11,ry:9},{cx:30,cy:27,rx:15,ry:13}]}];
function rockBody(b,o){
 const r=mul(o.seed),hs=[2,3,4,5].map((f,k)=>({f,a:(r()-.5)*.34/(1+k*.5),p:r()*6.28})),rad=th=>1+hs.reduce((s,q)=>s+q.a*Math.cos(q.f*th+q.p),0),
  pts=[...Array(o.facets||7)].map(()=>({x:o.cx+(r()-.5)*o.rx*1.7,y:o.cy+(r()-.5)*o.ry*1.5,off:(r()-.5)*.36})),sd=o.seed;
 const d=(x,y)=>{const dx=(x+.5-o.cx)/o.rx,dy=(y+.5-o.cy)/(y<o.cy?o.ry:o.ry*.72);return Math.hypot(dx,dy)/rad(Math.atan2(dy,dx))};
 shape(b,(x,y)=>{const q=d(x,y);return q<1?o.ry*Math.sqrt(1-q*q)*1.05+noise(x,y,3,sd)*1.2:-1},o.ramp,{k:1,tex:(x,y,t)=>{
  let a=1e9,c=1e9,ai=0;pts.forEach((p,i)=>{const e=Math.hypot(x-p.x,(y-p.y)*1.2);if(e<a){c=a;a=e;ai=i}else if(e<c)c=e});
  t+=pts[ai].off;if(c-a<1.1&&ih(ai,Math.round(c*3),sd)>.45)t-=.3;
  const s=ih(x,y,sd);if(s>.965)t+=.22;else if(s<.03)t-=.2;
  if(o.moss&&noise(x,y,4.5,sd+7)>.6&&t>.4&&y<o.cy+o.ry*.2)return{t:t+.05,ramp:R.moss};return t}})}
function rockSprite(kind,vi){const D=(kind=='rock'?ROCKV:BOULDV)[vi],b=new B(D.w,D.h),sd=(vi+1)*977+(kind=='rock'?13:101);
 shadow(b,D.w/2,D.h-3.5,D.w*.43,D.h*.09+1.5);
 D.b.forEach((o,i)=>rockBody(b,{...o,seed:sd+i*31,ramp:R[D.ramp],moss:D.moss,facets:D.facets}));outline(b,R[D.ramp][0]);
 return{c:cvs(b),ax:D.w/2,ay:D.h-4}}

/* ---- arbustos ---- */
const BUSHV=[
 {w:40,h:28,ramp:'leaf',lobes:[[13,16,9],[26,15,10],[20,12,9],[20,18,8]]},
 {w:34,h:24,ramp:'leaf2',lobes:[[10,14,7],[22,13,8],[16,10,7]]},
 {w:44,h:30,ramp:'leaf',berry:[216,58,74],lobes:[[12,18,10],[30,18,10],[21,13,11]]},
 {w:38,h:26,ramp:'moss',flower:[[255,246,216],[255,214,74]],lobes:[[12,15,8],[26,15,9],[19,11,8]]},
 {w:36,h:26,ramp:'leaf',flower:[[245,138,192],[255,232,244]],lobes:[[10,15,8],[24,16,8],[17,11,8]]},
 {w:30,h:22,ramp:'leaf2',berry:[90,108,255],lobes:[[15,11,9]]}];
function bushSprite(vi){const D=BUSHV[vi],b=new B(D.w,D.h),sd=vi*53+5,r=mul(sd);
 shadow(b,D.w/2,D.h-3,D.w*.42,2.4);
 const lz=(x,y)=>{let z=-1;for(const[cx,cy,rr]of D.lobes){const e=noise(x,y,2.6,sd)-.5,q=Math.hypot((x+.5-cx)/rr,(y+.5-cy)/(rr*.86))-e*.4;if(q<1)z=Math.max(z,rr*Math.sqrt(1-q*q))}return z};
 shape(b,(x,y)=>{const z=lz(x,y);return z<0?-1:z+noise(x,y,3.2,sd+2)*2.2},R[D.ramp],{k:1,tex:(x,y,t)=>{const s=ih(x,y,sd);return t+(noise(x,y,4,sd+9)-.5)*.34+(s>.95?.2:s<.04?-.18:0)}});
 const pts=[];for(let k=0;k<160&&pts.length<(D.berry?6:D.flower?7:0);k++){const x=Math.floor(4+r()*(D.w-8)),y=Math.floor(4+r()*(D.h-9));if(b.solid(x,y)&&b.solid(x+1,y+1)&&lz(x,y)>2&&!pts.some(p=>Math.abs(p[0]-x)<4&&Math.abs(p[1]-y)<4))pts.push([x,y])}
 pts.forEach(([x,y])=>{if(D.berry){const c=D.berry;b.set(x,y,c.map(v=>Math.min(255,v*1.5)));b.set(x+1,y,c);b.set(x,y+1,c);b.set(x+1,y+1,c.map(v=>v*.55))}
  else{const[pc,cc]=D.flower;[[1,0],[0,1],[2,1],[1,2]].forEach(([a,e])=>b.set(x+a-1,y+e-1,pc));b.set(x,y,cc)}});
 outline(b,R[D.ramp][0]);return{c:cvs(b),ax:D.w/2,ay:D.h-3.5}}

/* ---- troncos ---- */
function logBody(b,o){const{x0,x1,cy,r,side}=o,sd=o.seed,ramp=R[o.ramp];
 const body=(x,y)=>{const dy=(y+.5-cy)/r;if(x<x0||x>x1||Math.abs(dy)>=1)return-1;
  if(side<0&&x>x1-3){const e=(x+.5-(x1-3))/3;if(e*e+dy*dy>1)return-1}if(side>0&&x<x0+3){const e=(x0+3-(x+.5))/3;if(e*e+dy*dy>1)return-1}
  return r*Math.sqrt(1-dy*dy)};
 shape(b,(x,y)=>{let z=body(x,y);if(o.stub)z=Math.max(z,cap(x,y,o.stub[0],cy-r*.7,o.stub[0]+2,cy-r-5,2.4));return z},ramp,{k:1,tex:(x,y,t)=>{
  const s=noise(x*.28,y*1.5,1,sd);t+=(s-.5)*.5;if(ih(x,y,sd)>.96)t-=.2;
  if(o.moss&&noise(x,y,5,sd+3)>.58&&y<cy+1)return{t:t+.08,ramp:R.moss};return t}});
 const cx=side<0?x1-1.5:x0+1.5,rx=3.4;
 for(let y=Math.floor(cy-r);y<=cy+r;y++)for(let x=Math.floor(cx-rx);x<=cx+rx;x++){const e=Math.hypot((x+.5-cx)/rx,(y+.5-cy)/r);if(e>=1)continue;
  let c;if(e>.86)c=ramp[2];else if(o.hollow&&e<.5)c=ramp[0];else{const k=Math.floor(e*5+noise(x,y,2,sd)*.8);c=k%2?ramp[4]:ramp[3];if(e<.16)c=ramp[2]}b.set(x,y,c)}}
const LOGV=[
 {w:56,h:28,b:[{x0:6,x1:48,cy:16,r:7,side:1,ramp:'wood'}]},
 {w:56,h:30,b:[{x0:6,x1:48,cy:18,r:7,side:-1,ramp:'wood',stub:[34]}]},
 {w:56,h:28,b:[{x0:5,x1:49,cy:16,r:6.5,side:1,ramp:'drift',moss:1}]},
 {w:50,h:28,b:[{x0:5,x1:43,cy:16,r:8,side:-1,ramp:'wood',hollow:1}]},
 {w:58,h:38,b:[{x0:6,x1:50,cy:18,r:6,side:1,ramp:'wood'},{x0:9,x1:52,cy:30,r:6.5,side:-1,ramp:'drift'}]}];
function logSprite(vi){const D=LOGV[vi],b=new B(D.w,D.h);shadow(b,D.w/2,D.h-4,D.w*.42,2.6);D.b.forEach((o,i)=>logBody(b,{...o,seed:vi*17+i*5+3}));outline(b,R.wood[0]);return{c:cvs(b),ax:D.w/2,ay:D.h-5}}

/* ---- toco ---- */
const STUMPV=[
 {w:36,h:34,rx:10,hh:13,ramp:'wood'},{w:36,h:34,rx:10,hh:12,ramp:'wood',moss:1},{w:30,h:42,rx:8,hh:20,ramp:'drift'},
 {w:36,h:34,rx:10,hh:12,ramp:'wood',mush:1},{w:42,h:30,rx:13,hh:9,ramp:'wood'}];
function stumpSprite(vi){const D=STUMPV[vi],b=new B(D.w,D.h),sd=vi*29+11,ramp=R[D.ramp],cx=D.w/2,base=D.h-6,top=base-D.hh,ry=D.rx*.42;
 shadow(b,cx,base+1,D.rx*1.25,3);
 const rxAt=y=>D.rx*(1+.28*Math.max(0,(y-(base-7))/7)**2);
 shape(b,(x,y)=>{if(y<top)return-1;const rr=rxAt(y),dx=(x+.5-cx)/rr,edge=base+ry*Math.sqrt(Math.max(0,1-dx*dx));if(Math.abs(dx)>=1||y>edge)return-1;return rr*Math.sqrt(1-dx*dx)},ramp,{k:1,tex:(x,y,t)=>{
  t+=(noise(x*1.2,y*.25,1,sd)-.5)*.5;if(D.moss&&noise(x,y,4,sd)>.55&&y<top+7)return{t,ramp:R.moss};return t}});
 for(let y=Math.floor(top-ry);y<=top+ry;y++)for(let x=Math.floor(cx-D.rx);x<=cx+D.rx;x++){const e=Math.hypot((x+.5-cx)/D.rx,(y+.5-top)/ry);if(e>=1)continue;let c;
  if(e>.84)c=ramp[2];else{const k=Math.floor(e*6+noise(x,y,2.5,sd)*1.1);c=k%2?ramp[4]:ramp[3];if(e<.12)c=ramp[2]}b.set(x,y,c)}
 if(D.mush){[[cx-4,top-1,3],[cx+4,top+1,2]].forEach(([mx,my,s])=>{for(let j=0;j<s;j++)b.set(mx,my-j,R.stem[3]);for(let j=-s;j<=s;j++)for(let i=-s;i<=s;i++)if(i*i+j*j*1.6<=s*s+1&&j<=0)b.set(mx+i,my-s-1+j,j==0?R.capr[2]:R.capr[3]);b.set(mx-1,my-s-2,R.stem[5])})}
 outline(b,ramp[0]);return{c:cvs(b),ax:cx,ay:base+1}}

/* ---- cristais ---- */
const CRYV=[
 {w:44,h:36,ramp:'cb',sp:[{cx:14,by:30,w:9,h:17,lean:-1},{cx:23,by:32,w:11,h:27,lean:1},{cx:31,by:31,w:8,h:14,lean:2}]},
 {w:46,h:40,ramp:'cp',sp:[{cx:17,by:34,w:13,h:31,lean:0},{cx:29,by:34,w:8,h:16,lean:3},{cx:8,by:34,w:7,h:12,lean:-2}]},
 {w:48,h:34,ramp:'cg',sp:[{cx:10,by:29,w:8,h:13,lean:-2},{cx:18,by:31,w:9,h:21,lean:-1},{cx:28,by:31,w:9,h:19,lean:2},{cx:37,by:29,w:7,h:12,lean:2}]},
 {w:42,h:34,ramp:'cr',sp:[{cx:14,by:30,w:10,h:20,lean:-2},{cx:26,by:31,w:12,h:26,lean:1}]},
 {w:50,h:28,ramp:'cb',sp:[{cx:10,by:25,w:7,h:10,lean:-2},{cx:19,by:25,w:8,h:14,lean:0},{cx:28,by:26,w:9,h:12,lean:1},{cx:38,by:25,w:7,h:9,lean:2}]},
 {w:40,h:40,ramp:'cp',sp:[{cx:15,by:34,w:11,h:28,lean:-1},{cx:27,by:35,w:10,h:19,lean:2}]}];
function crystalSprite(vi){const D=CRYV[vi],b=new B(D.w,D.h),ramp=R[D.ramp],sd=vi*41+7;shadow(b,D.w/2,D.h-4,D.w*.42,2.6);
 D.sp.slice().sort((a,c)=>a.by-c.by||a.h-c.h).forEach((s,k)=>{
  for(let y=0;y<D.h;y++)for(let x=0;x<D.w;x++){const t=(s.by-y)/s.h;if(t<0||t>1)continue;const xc=s.cx+s.lean*t,hw=s.w/2*(t<.6?.94+.06*t/.6:1-(t-.6)/.4*.97);if(hw<=.3)continue;const u=(x+.5-xc)/hw;if(Math.abs(u)>=1)continue;
   let i=u<-.32?3:u<.2?4:2;if(Math.abs(u)>.82)i--;if(t>.82)i++;if(t<.1)i--;if(Math.abs(t-.6)<.045)i++;if(u>=-.32&&u<-.2)i=5;if(t>.94&&u<.2)i=5;
   b.set(x,y,ramp[Math.max(0,Math.min(5,i))])}
  b.set(Math.round(s.cx+s.lean-1),Math.round(s.by-s.h*.55),ramp[5])});
 for(let k=0;k<3;k++)b.set(Math.floor(6+ih(k,1,sd)*(D.w-12)),Math.floor(D.h*.3+ih(k,2,sd)*D.h*.4),[255,255,255]);
 outline(b,ramp[0]);return{c:cvs(b,GL[D.ramp]),ax:D.w/2,ay:D.h-4.5}}

/* ---- cogumelos ---- */
const MUSHV=[
 {w:34,h:30,cap:'capr',spots:1,m:[{cx:17,by:25,sw:5,sh:9,cw:11,ch:8}]},
 {w:40,h:30,cap:'capr',spots:1,m:[{cx:11,by:26,sw:3,sh:6,cw:6,ch:5},{cx:24,by:25,sw:4,sh:8,cw:9,ch:7},{cx:32,by:27,sw:3,sh:4,cw:5,ch:4}]},
 {w:40,h:28,cap:'capb',m:[{cx:12,by:25,sw:4,sh:7,cw:8,ch:6},{cx:25,by:24,sw:5,sh:9,cw:10,ch:7},{cx:33,by:26,sw:3,sh:4,cw:5,ch:4}]},
 {w:34,h:30,cap:'capu',spots:1,glow:'capu',m:[{cx:11,by:26,sw:3,sh:6,cw:7,ch:5},{cx:23,by:25,sw:4,sh:10,cw:10,ch:8}]},
 {w:32,h:24,cap:'capo',spots:1,m:[{cx:10,by:21,sw:3,sh:5,cw:6,ch:4},{cx:21,by:21,sw:4,sh:7,cw:8,ch:6}]}];
function mushSprite(vi){const D=MUSHV[vi],b=new B(D.w,D.h),sd=vi*13+4,cr=R[D.cap];shadow(b,D.w/2,D.h-3.5,D.w*.4,2.2);
 D.m.slice().sort((a,c)=>a.by-c.by).forEach((m,k)=>{
  shape(b,(x,y)=>cap(x,y,m.cx,m.by-1,m.cx,m.by-m.sh,m.sw/2),R.stem,{k:1});
  const cy=m.by-m.sh;shape(b,(x,y)=>{if(y>cy+m.ch*.42)return-1;return ell(x,y,m.cx,cy,m.cw,m.ch,m.ch*1.1)},cr,{k:1,tex:(x,y,t)=>t+(ih(x,y,sd)>.96?.2:0)});
  for(let x=Math.floor(m.cx-m.cw);x<=m.cx+m.cw;x++)if(b.solid(x,Math.round(cy+m.ch*.4)))b.set(x,Math.round(cy+m.ch*.4)+1,cr[1]);
  if(D.spots){const r=mul(sd+k*7);for(let q=0;q<4;q++){const a=r()*Math.PI,rr=r()*.62*m.cw,sx=Math.round(m.cx+Math.cos(a)*rr),sy=Math.round(cy-Math.sin(a)*rr*.75-m.ch*.15);if(b.solid(sx,sy)&&b.solid(sx+1,sy)){b.set(sx,sy,R.stem[5]);b.set(sx+1,sy,R.stem[4]);if(b.solid(sx,sy+1))b.set(sx,sy+1,R.stem[3])}}}});
 outline(b,cr[0]);return{c:cvs(b,D.glow&&GL[D.glow]),ax:D.w/2,ay:D.h-4}}

/* ---- cactos ---- */
const CACV=[
 {w:38,h:54,caps:[[19,48,19,13,5.6],[19,34,9,34,3.6],[9,34,9,23,3.6],[19,28,29,28,3.6],[29,28,29,18,3.6]],fl:[19,9]},
 {w:34,h:40,caps:[[17,35,17,10,5],[17,26,8,26,3.2],[8,26,8,17,3.2]],fl:[17,6]},
 {w:34,h:28,barrel:1},
 {w:42,h:36,pads:[[21,24,10,8],[11,12,7,6],[31,13,7,6.5],[21,9,5.5,5]]},
 {w:30,h:52,caps:[[15,47,15,8,4.6],[15,30,24,30,3],[24,30,24,19,3]],fl:[15,4]}];
function cactusSprite(vi){const D=CACV[vi],b=new B(D.w,D.h),sd=vi*19+2,ramp=R.cactus;shadow(b,D.w/2,D.h-3.5,D.w*.36,2.4);
 if(D.barrel){const cx=D.w/2,cy=D.h-12;shape(b,(x,y)=>ell(x,y,cx,cy,12,11,12),ramp,{k:1,tex:(x,y,t)=>{const u=Math.max(-1,Math.min(1,(x+.5-cx)/12)),rib=Math.sin(Math.asin(u)*5.2);return t+(rib<-.55?-.2:rib>.6?.08:0)}});
  for(let i=-2;i<=2;i++){const x=Math.round(cx+i*3.6);b.set(x,Math.round(cy-9.6-Math.abs(i)*.4),[255,110,160]);b.set(x,Math.round(cy-10.6-Math.abs(i)*.4),[255,200,220])}}
 else if(D.pads){shape(b,(x,y)=>{let z=-1;D.pads.forEach(([cx,cy,rx,ry])=>{z=Math.max(z,ell(x,y,cx,cy,rx,ry,ry*1.1))});return z},ramp,{k:1,tex:(x,y,t)=>t+(noise(x,y,3,sd)-.5)*.2});
  D.pads.slice(1).forEach(([cx,cy],i)=>{b.set(cx-1,cy-4-(i?0:1),[220,60,90]);b.set(cx,cy-4-(i?0:1),[250,120,140])})}
 else{shape(b,(x,y)=>{let z=-1;D.caps.forEach(([ax,ay,bx,by,r])=>{z=Math.max(z,cap(x,y,ax,ay,bx,by,r))});return z},ramp,{k:1,tex:(x,y,t)=>t+(((x+60)%4)==0?-.12:0)});
  if(D.fl){const[fx,fy]=D.fl;[[0,0],[-1,1],[1,1],[0,2],[0,1]].forEach(([a,e],i)=>b.set(fx+a,fy+e,i==4?[255,225,90]:[245,110,170]))}}
 for(let y=0;y<D.h;y++)for(let x=0;x<D.w;x++)if(b.solid(x,y)&&b.solid(x,y+1)&&b.solid(x+1,y)&&ih(x,y,sd)>.955){b.set(x,y,ramp[5])}
 outline(b,ramp[0]);return{c:cvs(b),ax:D.w/2,ay:D.h-4}}

/* ---- placa ---- */
const SIGNV=[{w:40,h:36,kind:0},{w:42,h:36,kind:1},{w:42,h:36,kind:-1},{w:36,h:38,kind:2}];
function signSprite(vi){const D=SIGNV[vi],b=new B(D.w,D.h),ramp=R.wood,sd=vi*7+1,r=mul(sd),x0=D.kind==2?9:6,x1=D.kind==2?27:D.w-7,y0=D.kind==2?5:7,y1=D.kind==2?22:19,cx=D.w/2;
 shadow(b,cx,D.h-3,8,2);
 shape(b,(x,y)=>cap(x,y,cx,D.h-4,cx,y1-2,2.3),R.drift,{k:1});
 const inside=(x,y)=>{if(x<x0||x>=x1+(D.kind==1?5:0)||y<y0||y>=y1)return false;
  if(D.kind==1&&x>=x1-4){return Math.abs(y+.5-(y0+y1)/2)<(x1+5-x)*1.45}
  if(D.kind==-1&&x<x0+4){return Math.abs(y+.5-(y0+y1)/2)<(x-x0+1)*1.45}return true};
 const edge=(x,y)=>{let e=9;for(let k=1;k<=3;k++){if(!inside(x-k,y))e=Math.min(e,k);if(!inside(x+k,y))e=Math.min(e,k);if(!inside(x,y-k))e=Math.min(e,k);if(!inside(x,y+k))e=Math.min(e,k)}return e};
 shape(b,(x,y)=>inside(x,y)?Math.min(3,edge(x,y)):-1,ramp,{k:1,tex:(x,y,t)=>{t+=(noise(x*.3,y*2,1,sd)-.5)*.3;if(y==Math.floor((y0+y1)/2))t-=.3;return t}});
 const my=[y0+4,y0+8];my.forEach((yy,i)=>{let x=x0+5+(D.kind==-1?4:0);const end=x1-6-i*6;while(x<end){const l=2+Math.floor(r()*4);for(let k=0;k<l&&x<end;k++,x++)b.set(x,yy,ramp[0]);x+=1+Math.floor(r()*2)}});
 [[x0+2,y0+2],[x1-3,y0+2],[x0+2,y1-3],[x1-3,y1-3]].forEach(([nx,ny])=>{if(inside(nx,ny)&&inside(nx+1,ny+1)&&D.kind==0){b.set(nx,ny,ramp[5]);b.set(nx+1,ny+1,ramp[0])}});
 outline(b,ramp[0]);return{c:cvs(b),ax:cx,ay:D.h-4}}

/* ---- árvores (copas e troncos variados) ---- */
const TREEV=[];
function buildTree(v){const w=48,h=52,b=new B(w,h),sd=v*61+9,tx=24;shadow(b,tx,47,14,3.6);
 let canopy,ramp=R.leaf,tr=R.wood,trW=3.4,trTop=34;
 if(v==0)canopy=(x,y)=>{let z=-1;[[24,17,13],[13,25,10],[35,25,10],[24,28,11]].forEach(([cx,cy,r])=>{const q=Math.hypot((x+.5-cx)/r,(y+.5-cy)/(r*.9))-(noise(x,y,2.8,sd)-.5)*.3;if(q<1)z=Math.max(z,r*Math.sqrt(1-q*q))});return z};
 else if(v==1){ramp=R.leaf2;trW=4;canopy=(x,y)=>{let z=-1;[[24,20,17],[11,28,9],[37,28,9],[24,12,9]].forEach(([cx,cy,r])=>{const q=Math.hypot((x+.5-cx)/r,(y+.5-cy)/(r*.88))-(noise(x,y,2.6,sd)-.5)*.32;if(q<1)z=Math.max(z,r*Math.sqrt(1-q*q))});return z}}
 else if(v==2){ramp=R.pine;trW=2.8;trTop=40;canopy=(x,y)=>{const t=[[4,17,10],[13,25,14],[22,34,18]];for(const[ay,by,hw]of t){if(y<ay||y>by+Math.sin(x*1.3)*.9)continue;const k=(y-ay)/(by-ay),w2=hw*(.15+.85*k),dx=(x+.5-tx);if(Math.abs(dx)<w2)return(1-Math.abs(dx)/w2)*w2*.8+3+(1-k)*3+noise(x,y,2.4,sd)*1.4}return-1}}
 else if(v==3){ramp=R.leaf2;tr=R.birch;trW=2.5;trTop=30;canopy=(x,y)=>{let z=-1;[[24,15,9],[16,22,8],[32,22,8],[24,24,7]].forEach(([cx,cy,r])=>{const q=Math.hypot((x+.5-cx)/r,(y+.5-cy)/(r*.9))-(noise(x,y,2.4,sd)-.5)*.34;if(q<1)z=Math.max(z,r*Math.sqrt(1-q*q))});return z}}
 // 4 cerejeira florida (copa rosa em tufos), 5 árvore de outono (laranja), 6 carvalho grande (copa larga e escura)
 else{const bolas=v==4?[[24,16,10],[14,22,8],[34,21,8],[20,27,7],[30,28,7]]:v==5?[[24,18,12],[14,25,9],[34,25,9],[24,10,8]]:[[24,19,15],[10,26,10],[38,26,10],[17,12,9],[31,12,9]];
  ramp=v==4?R.flor:v==5?R.outono:R.carvalho;trW=v==6?4.6:3;trTop=v==6?33:32;
  canopy=(x,y)=>{let z=-1;bolas.forEach(([cx,cy,r])=>{const q=Math.hypot((x+.5-cx)/r,(y+.5-cy)/(r*.9))-(noise(x,y,2.6,sd)-.5)*.34;if(q<1)z=Math.max(z,r*Math.sqrt(1-q*q))});return z}}
 shape(b,(x,y)=>{let z=cap(x,y,tx,46,tx,trTop,trW);const f=Math.max(0,(y-43)/4);if(y>=42&&y<=47){const q=Math.abs(x+.5-tx)/(trW+3.2*f);if(q<1)z=Math.max(z,trW*Math.sqrt(1-q*q))}return z},tr,{k:1,tex:(x,y,t)=>{t+=(noise(x*1.4,y*.3,1,sd)-.5)*.5;if(canopy(x,y-3)>=0||canopy(x,y-5)>=0)t-=.32;if(v==3&&ih(x,y,sd)>.9&&(y%5<2))return{t:.0,ramp:R.birch};return t}});
 shape(b,(x,y)=>{const z=canopy(x,y);return z<0?-1:z+noise(x,y,3.4,sd+4)*2.2},ramp,{k:1,tex:(x,y,t)=>{const s=ih(x,y,sd);return t+(noise(x,y,4,sd+9)-.5)*.36+(s>.95?.2:s<.04?-.18:0)}});
 outline(b,ramp[0]);const c=cvs(b);c.pad=0;return c}
for(let i=0;i<7;i++)TREEV.push(buildTree(i));
/* arte do mapa editada pelo GM: PROJ.mapArt[tipo][variante] = pixel art (null = desenho padrão) */
const artOv=(t,vi)=>{const o=PROJ.mapArt&&PROJ.mapArt[t],d=o&&o[vi];return d&&d.pixels?d:null};
window.mapArtOverride=artOv;
window.TREE_DEFAULT=TREEV.slice();
for(let i=0;i<TREEV.length;i++){const d=artOv('tree',i),c=d&&pixelArt(d);if(c){c.pad=0;TREEV[i]=c}}
/* tipo de cada árvore pela posição: os 4 de sempre são a maioria; carvalhos no meio dos bosques, cerejeiras e árvores de
   outono em manchas (bosque florido a oeste, outono a leste) */
window.TREEV=TREEV;window.treeVar=t=>{const x=Math.round(t.x),y=Math.round(t.y),r=ih(x,y,97),m=noise(x,y,160,31);
 if(m>.66&&r<.55)return x<CX?4:5;if(r>.88)return 6;return Math.floor(ih(x,y,98)*4)%4};

/* ---- cercas e muros que se conectam sozinhos ---- */
let fv=0;window.sceneryDirty=()=>{fv++;for(const key of Object.keys(cache))delete cache[key]};
function linksOf(e){if(e._fv===fv)return e._lk;const lk=[];for(const n of mapElements){if(n===e||n.type!==e.type)continue;const dx=n.x-e.x,dy=n.y-e.y;if(Math.hypot(dx,dy)>20)continue;if(dy>0||(dy===0&&dx>0))lk.push([Math.round(dx),Math.round(dy)])}
 lk.sort((a,b)=>a[1]-b[1]||a[0]-b[0]);e._fv=fv;e._lk=lk;return lk}
// k: pixels do desenho por pixel do mundo nas ligações (1:1); a altura dos postes acompanha o herói
function fenceSprite(kind,vi,links){const wall=kind=='stonewall',k=1,ph=wall?24:vi==1?28:30,pr=wall?5.2:3,pad=8,
  rails=wall?[8,15]:[9,20],ramp=R[wall?(vi?'granite':'stone'):(vi?'drift':'wood')];
 let mnx=-pad,mxx=pad,mny=-ph-pad,mxy=pad;links.forEach(([dx,dy])=>{mnx=Math.min(mnx,dx*k-pad);mxx=Math.max(mxx,dx*k+pad);mny=Math.min(mny,dy*k-ph-pad);mxy=Math.max(mxy,dy*k+pad)});
 const w=Math.ceil(mxx-mnx),h=Math.ceil(mxy-mny),ox=-mnx,oy=-mny,b=new B(w,h),sd=vi*3+(wall?50:7),pid=new Uint8Array(w*h);
 shadow(b,ox,oy+1,pr+6,2.6);links.forEach(([dx,dy])=>shadow(b,ox+dx*k/2,oy+dy*k/2+1,Math.abs(dx*k)/2+3,2));
 const segs=[];links.forEach(([dx,dy])=>{const L=Math.hypot(dx,dy)*k,ux=dx*k/L,uy=dy*k/L,e=L-pr-.5;rails.forEach(hh=>segs.push([ox+ux*pr*.4,oy+uy*pr*.4-hh,ox+ux*e,oy+uy*e-hh,wall?5.4:1.9]))});
 shape(b,(x,y)=>{const i=y*w+x;let z=-1,id=0;segs.forEach(([ax,ay,bx,by,r])=>{const q=cap(x,y,ax,ay,bx,by,r);if(q>z){z=q;id=1}});
  const p=cap(x,y,ox,oy,ox,oy-ph,pr);if(p>=0&&p+(wall?1.5:.6)>=z){z=p;id=0}pid[i]=id;return z},ramp,{k:1,tex:(x,y,t,z,i)=>{
  if(pid[i]==1){const nb=[x>0&&pid[i-1]==0&&b.solid(x-1,y),x<w-1&&pid[i+1]==0&&b.solid(x+1,y),y>0&&pid[i-w]==0&&b.solid(x,y-1),y<h-1&&pid[i+w]==0&&b.solid(x,y+1)];if(nb.some(Boolean))t-=.34;}
  if(wall){if(pid[i]==1){const row=Math.floor((y+40)/6);if((y+40)%6==0)t-=.3;else if((x+row*4)%11==0)t-=.28;t+=(ih(x,y,sd)-.5)*.16}else{const row=Math.floor((y+40)/5);if((y+40)%5==0)t-=.25;else if((x+row*3)%8==0)t-=.22}}
  else t+=(noise(x*.35,y*1.5,1,sd)-.5)*.42+(ih(x,y,sd)>.97?-.2:0);return t}});
 outline(b,ramp[0]);return{c:cvs(b),ax:ox,ay:oy+1}}

/* ---- seleção de variante / cache ---- */
const FAM={rock:[6,rockSprite,'rock'],boulder:[6,rockSprite,'boulder'],bush:[6,bushSprite],log:[5,logSprite],stump:[5,stumpSprite],crystal:[6,crystalSprite],mushroom:[5,mushSprite],cactus:[5,cactusSprite],sign:[4,signSprite]};
const cache={};
const vari=(e,n)=>Math.floor(ih(Math.round(e.x),Math.round(e.y),31)*n)%n;
window.sceneryFor=function(e){
 const t=e.type;
 if(t=='fence'||t=='stonewall'){
  const lk=linksOf(e),vi=Math.floor(ih(Math.floor(e.x/96),Math.floor(e.y/96),5)*2)%2,key=t+vi+'|'+lk.join(';');
  if(cache[key])return cache[key];
  const data=artOv(t,vi),c=data&&pixelArt(data);
  return cache[key]=c?{c,ax:data.ax??c.width/2,ay:data.ay??c.height-1}:fenceSprite(t,vi,lk);
 }
 const f=FAM[t];if(f){const vi=vari(e,f[0]),key=t+vi;if(cache[key])return cache[key];const d=artOv(t,vi),c=d&&pixelArt(d);
  if(c)return cache[key]={c,ax:d.ax!=null?d.ax:c.width/2,ay:d.ay!=null?d.ay:c.height-1};return cache[key]=f[2]?f[1](f[2],vi):f[1](vi)}
 if(t.startsWith('px:')){const base=window.PIXLIB&&PIXLIB[t.slice(3)];if(!base)return null;const q=window.CHAO&&CHAO.quadroEm?CHAO.quadroEm(base,window.time||0):{i:0,data:base},key=t+'#'+q.i,en=q.data; // elemento animado: um cache por quadro
 if(cache[key]&&cache[key].src===en)return cache[key];const c=pixelArt(en);if(!c)return null;return cache[key]={c,ax:c.width/2,ay:c.height-1,src:en}}
 return null};
/* Mesma arte do jogo para a Engine: as conexões de cercas e muros vêm da lista da cena em edição. */
window.sceneryArt=function(e,list){
 const t=e.type;
 if(t!='fence'&&t!='stonewall')return window.sceneryFor(e);
 const lk=[];for(const n of list){if(n===e||n.type!==t)continue;const dx=n.x-e.x,dy=n.y-e.y;if(Math.hypot(dx,dy)>20)continue;if(dy>0||(dy===0&&dx>0))lk.push([Math.round(dx),Math.round(dy)])}
 lk.sort((a,b)=>a[1]-b[1]||a[0]-b[0]);
 const vi=Math.floor(ih(Math.floor(e.x/96),Math.floor(e.y/96),5)*2)%2,key=t+vi+'|'+lk.join(';');
 if(cache[key])return cache[key];
 const data=artOv(t,vi),c=data&&pixelArt(data);
 return cache[key]=c?{c,ax:data.ax??c.width/2,ay:data.ay??c.height-1}:fenceSprite(t,vi,lk);
};
window.sceneryVariants=(t)=>FAM[t]?FAM[t][0]:t=='fence'||t=='stonewall'?2:0;
window.sceneryArtTypes=()=>[...Object.keys(FAM),'fence','stonewall'];
window.sceneryDefault=(t,vi)=>{if(t=='tree')return{c:TREE_DEFAULT[vi],ax:TREE_DEFAULT[vi].width/2,ay:TREE_DEFAULT[vi].height-3};if(t=='fence'||t=='stonewall')return fenceSprite(t,vi,[]);const f=FAM[t];return f?(f[2]?f[1](f[2],vi):f[1](vi)):null};
window.sceneryPreview=(t,vi,links)=>{if(t=='fence'||t=='stonewall')return fenceSprite(t,vi,links||[]);const f=FAM[t];return f?(f[2]?f[1](f[2],vi):f[1](vi)):null};
})();
