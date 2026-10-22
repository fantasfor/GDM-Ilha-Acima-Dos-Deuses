/* Chama em pixel art (lareira da taverna, velas, fogueira do acampamento): colunas de 1 px que sobem e descem, em
   camadas (vermelho por fora, laranja, amarelo e o miolo claro), pontas soltas subindo e faíscas. (x,y) = base. */
window.desenharChama=function(g,x,y,w,h,s=0){
 const t=typeof time=='number'?time:performance.now()/1000,c=(w-1)/2;
 for(let i=0;i<w;i++){
  const d=Math.abs(i-c)/(c+1),base=Math.pow(1-d,.8),n=.62+.38*Math.abs(Math.sin(t*8.3+i*1.7+s)*Math.sin(t*4.9+i*.9+s*2.1)),hh=Math.max(1,Math.round(h*base*n)),X=Math.round(x-c+i);
  g.fillStyle='#a82a16';g.fillRect(X,y-hh,1,hh);
  const h2=Math.round(hh*.8);g.fillStyle='#e8541e';g.fillRect(X,y-h2,1,h2);
  const h3=Math.round(hh*.55*(1-d*.5));g.fillStyle='#ffa22a';g.fillRect(X,y-h3,1,h3);
  if(d<.45){const h4=Math.round(hh*.3);g.fillStyle='#fff0a0';g.fillRect(X,y-h4,1,h4)}}
 for(let k=0;k<3;k++){const q=(t*1.7+k/3+s*.13)%1,px=Math.round(x+Math.sin(t*3+k*2+s)*w*.22),py=Math.round(y-h*(.85+q*.55));g.globalAlpha=1-q;g.fillStyle=q<.5?'#ffa22a':'#e8541e';g.fillRect(px,py,1,2);g.globalAlpha=1}
 for(let k=0;k<4;k++){const q=(t*.6+k*.25+s*.37)%1,px=Math.round(x+Math.sin(k*12.9+s)*w*.5+Math.sin(t*2+k)*3),py=Math.round(y-h*.6-q*h*1.6);g.globalAlpha=(1-q)*.9;g.fillStyle='#ffd36b';g.fillRect(px,py,1,1);g.globalAlpha=1}
};
/* lenha cruzada com casca e pontas claras, e as brasas embaixo */
window.desenharLenha=function(g,x,y,w){
 const R=(a,b,c,d,e)=>{g.fillStyle=e;g.fillRect(Math.round(a),Math.round(b),c,d)},t=typeof time=='number'?time:0;
 for(let i=0;i<w;i++){const k=.5+.5*Math.sin(t*3+i*1.3);R(x-w/2+i,y-1,1,2,k>.6?'#ff7a1a':k>.3?'#c8401a':'#5a1a0a')}
 R(x-w/2,y-4,w,3,'#4a2a14');R(x-w/2,y-4,w,1,'#6a4424');R(x-w/2,y-4,2,3,'#c8a070');R(x+w/2-2,y-4,2,3,'#c8a070');
 for(let i=0;i<w-6;i+=2){R(x-w/2+3+i,y-6+Math.round(i*.15),2,3,'#3e2210');R(x-w/2+3+i,y-6+Math.round(i*.15),2,1,'#5a3418')}
};
