/* ---------- Cartas de lobby (grupo da DG e arena 1x1 / 2x2) ----------
   Nome em cima da carta, carta escura com a fotinha do personagem; espaço vazio = "+" grande e "Convidar".
   As cartas ficam desencontradas na altura e, na arena, um "X" separa as equipes. */
(function(){
 const E=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
 /* fotinha: o sprite de frente recortado até a borda do personagem (data URL) */
 function foto(sprite){
  if(!sprite)return '';const t=document.createElement('canvas');t.width=sprite.width;t.height=sprite.height;const g=t.getContext('2d');g.drawImage(sprite,0,0);
  const d=g.getImageData(0,0,t.width,t.height).data;let x0=t.width,y0=t.height,x1=-1,y1=-1;
  for(let y=0;y<t.height;y++)for(let x=0;x<t.width;x++)if(d[(y*t.width+x)*4+3]>8){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
  if(x1<0)return '';const o=document.createElement('canvas');o.width=x1-x0+1;o.height=y1-y0+1;o.getContext('2d').drawImage(t,x0,y0,o.width,o.height,0,0,o.width,o.height);return o.toDataURL();
 }
 /* uma carta: {rotulo, sprite, sub, lider, voce, vazio, esperando, podeClicar, onClick, alto} */
 function carta(o){
  const w=E('div','lobCarta'+(o.alto?' alto':''));w.append(E('span','lobRotulo',o.rotulo||''));
  if(o.vazio){
   const b=E('button','lobCard vazio'+(o.esperando?' esperando':''));b.type='button';b.disabled=!o.podeClicar;
   b.append(E('span','lobMais',o.esperando?'…':'+'),E('span','lobConv',o.esperando?'Aguardando':o.podeClicar?'Convidar':'Vazio'));
   if(o.esperando)b.append(E('small','',o.esperando));
   if(o.onClick)b.onclick=o.onClick;w.append(b);return w;
  }
  const c=E('div','lobCard cheio'+(o.lider?' lider':'')+(o.voce?' voce':''));const f=E('span','lobFoto'),src=foto(o.sprite);
  if(src){const im=E('img');im.src=src;im.alt='';f.append(im)}else f.append(E('span','lobSem','?'));
  c.append(f,E('small','',(o.lider?'★ ':'')+(o.sub||'')));w.append(c);return w;
 }
 /* linha de cartas; xEm = posição do "X" entre as equipes (arena) */
 function linha(cartas,xEm){const l=E('div','lobLinha');cartas.forEach((c,i)=>{if(xEm===i)l.append(E('span','lobX','×'));l.append(c)});return l}
 window.LOBBY={carta,linha,foto};
})();
