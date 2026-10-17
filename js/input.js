/* ---------- input ---------- */
let mx=0,my=0,rdown=false,insp=null;
document.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('mousemove',e=>{mx=e.offsetX;my=e.offsetY;if(rdown)order(false,2)});
cv.addEventListener('pointerdown',e=>{mx=e.offsetX;my=e.offsetY;if(e.button==2){rdown=true;order(true,2)}else if(e.pointerType=='touch')order(true,0);else if(e.button==0)order(true,1)});
addEventListener('pointerup',()=>rdown=false);
// mode 0 = toque (mover e atacar), 1 = botão esquerdo (inspecionar/NPC), 2 = botão direito (mover e atacar)
function order(click,mode=0){if(p.dead>0)return;const w=wpos();
 if(window.inTaverna&&click&&window.tavernaClick&&tavernaClick(w,mode))return;
 if(window.inDungeon&&click&&window.handleDungeonClick){
  if(window.handleDungeonClick(w,mode))return;
 }
 if(click&&mode!=2&&pickCampPortal(w)){showDungeonMenu();return}
 if(click&&mode!=2&&pickCampGate(w)){
  p.npcT=null;p.tgt=null;p.aw=0;p.wt=null;p.attackBasic=null;p.gateT=true;
  const side=p.y<campGate.y?-1:1;setDest(campGate.x,campGate.y+side*28);return
 }
 const n=pickN(w),e=pick(w);
 if(click)p.gateT=false;
 if(mode==2){
  if(e){if(click){insp=e;p.npcT=null;p.tgt=e;p.dest=null;p.pathKey='';ring(e.x,e.y,10,'#f55',.3)}return}
  if(n)return;
  p.npcT=null;p.tgt=null;p.aw=0;p.wt=null;p.attackBasic=null;setDest(w.x,w.y);if(click)ring(w.x,w.y,8,'#5f5',.35);return}
 if(!click)return;
 if(n){insp=null;p.npcT=n;p.tgt=null;p.aw=0;p.wt=null;p.attackBasic=null;p.pathKey='';setDest(n.x,n.y);ring(n.x,n.y,10,'#ff5',.3);return}
 if(e){if(mode==0){insp=e;p.npcT=null;p.tgt=e;p.dest=null;p.pathKey='';ring(e.x,e.y,10,'#f55',.3)}else{insp=e;ring(e.x,e.y,10,'#ff5',.3)}}
 else if(mode==0){insp=null;p.npcT=null;p.tgt=null;p.aw=0;p.wt=null;p.attackBasic=null;setDest(w.x,w.y);ring(w.x,w.y,8,'#5f5',.35)}
 else insp=null}
const held=new Set();
addEventListener('keydown',e=>{if(e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement)return;const k=e.key.toLowerCase();
 const s=SK.find(s=>s.k==k);if(s)cast(s);if(k>='1'&&k<='6')useSlot(k-1);if(k=='i'||k=='b')togInv()});
addEventListener('keyup',e=>held.delete(e.key.toLowerCase()));
function clearMovementInput(){
 held.clear();rdown=false;padId=null;p.joy={x:0,y:0};stick.style.transform='';
 p.dest=null;p.npcT=null;p.tgt=null;p.aw=0;p.wt=null;p.attackBasic=null;p.gateT=false;
}
addEventListener('blur',clearMovementInput);
document.addEventListener('visibilitychange',()=>{if(document.hidden)clearMovementInput()});
const pad=$('touchpad'),stick=$('stick');
let padId=null;
pad.addEventListener('pointerdown',e=>{e.preventDefault();padId=e.pointerId;pad.setPointerCapture(padId);joyFrom(e)});
pad.addEventListener('pointermove',e=>{if(e.pointerId===padId)joyFrom(e)});
function joyFrom(e){const r=pad.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),m=Math.hypot(dx,dy),k=Math.min(1,m/(r.width*.36));p.joy={x:m?dx/m*k:0,y:m?dy/m*k:0};stick.style.transform='translate('+p.joy.x*24+'px,'+p.joy.y*24+'px)'}
function stopJoy(e){if(e.pointerId!==padId)return;padId=null;p.joy={x:0,y:0};stick.style.transform=''}
pad.addEventListener('pointerup',stopJoy);pad.addEventListener('pointercancel',stopJoy);
