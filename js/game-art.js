/* Artes procedurais compartilham a mesma origem no catálogo e no jogo. */
(function(){
 const entries=new Map(),cache=new WeakMap(),defaults=new Map();
 const canvasFor=data=>{
  if(!data||typeof data!=='object')return null;
  if(!cache.has(data))cache.set(data,pixelArt(data));
  return cache.get(data);
 };
 window.gameArtRegister=(id,name,options)=>entries.set(id,{id,name,...options});
 window.gameArtData=id=>PROJ.art['ambiente/'+id]||null;
 window.gameArtCanvas=(id,original=false)=>{
  const entry=entries.get(id);if(!entry)return null;
  const custom=!original&&canvasFor(gameArtData(id));if(custom)return custom;
  if(!defaults.has(id)){
   const canvas=mkCanvas(entry.w,entry.h),g=canvas.getContext('2d');
   g.imageSmoothingEnabled=false;entry.draw(g);defaults.set(id,canvas);
  }
  return defaults.get(id);
 };
 window.gameArtDraw=(id,g,x,y,width,height)=>{
  const entry=entries.get(id),canvas=canvasFor(gameArtData(id));
  if(!entry||!canvas)return false;
  const w=width??entry.w,h=height??entry.h;
  g.drawImage(canvas,x-w*(entry.ax??.5),y-h*(entry.ay??1),w,h);
  return true;
 };
 window.gameArtEntries=()=>Array.from(entries.values());
})();
