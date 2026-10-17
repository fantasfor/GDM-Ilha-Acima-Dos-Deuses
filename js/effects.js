/* ---------- ícones pixel art, barra de efeitos/passivas (acima das habilidades) e efeitos de equipamentos ---------- */
(function(){
const D={
 poison:(R,E)=>{E(8,10,4,4,'#4fcf2f');R(7,2,2,3,'#4fcf2f');R(6,4,4,3,'#4fcf2f');R(6,8,2,2,'#d0ffa8');R(12,3,2,2,'#9aff6a');R(2,5,2,2,'#7fe84f')},
 burn:(R,E)=>{E(8,10,4,4,'#e8431a');E(8,10,3,3,'#ff8a2a');E(8,11,2,2,'#ffe27a');R(7,2,2,5,'#e8431a');R(6,4,4,3,'#ff8a2a');R(10,5,2,2,'#e8431a');R(4,6,2,3,'#e8431a')},
 bleed:(R,E)=>{E(8,10,4,4,'#d92b2b');R(7,2,2,3,'#d92b2b');R(6,4,4,3,'#d92b2b');R(6,8,2,2,'#ffb8b8');R(12,4,2,3,'#a01818');R(12,8,2,2,'#d92b2b')},
 slow:(R,E)=>{for(let i=0;i<10;i++){R(3+i,3+i,2,1,'#5fb4f0');R(11-i,3+i,2,1,'#5fb4f0')}R(7,1,2,14,'#7fcfff');R(1,7,14,2,'#7fcfff');E(8,8,2,2,'#e8f8ff')},
 stun:(R,E)=>{R(7,1,2,6,'#ffd84a');R(5,3,6,2,'#ffd84a');R(1,9,2,4,'#ffd84a');R(0,10,4,2,'#ffd84a');R(12,9,2,4,'#ffd84a');R(11,10,4,2,'#ffd84a');E(8,11,2,2,'#fff2a0')},
 vuln:(R)=>{R(3,2,10,7,'#b055f0');R(4,9,8,2,'#b055f0');R(5,11,6,2,'#b055f0');R(7,13,2,1,'#b055f0');R(8,2,1,3,'#1c0a26');R(7,5,1,3,'#1c0a26');R(8,8,1,3,'#1c0a26')},
 weak:(R)=>{R(6,1,4,8,'#b8b8c4');R(2,8,12,2,'#b8b8c4');R(4,10,8,2,'#b8b8c4');R(6,12,4,2,'#b8b8c4');R(7,14,2,1,'#b8b8c4')},
 regen:(R,E)=>{E(8,8,6,6,'#2f9a50');R(7,3,2,10,'#d8ffe0');R(3,7,10,2,'#d8ffe0')},
 rage:(R)=>{R(7,1,2,9,'#e0e0ee');R(6,2,4,1,'#ffb090');R(4,9,8,2,'#e8431a');R(7,11,2,4,'#8a4a2a');R(2,3,2,2,'#ff6644');R(12,3,2,2,'#ff6644');R(1,6,2,2,'#ff8a5a');R(13,6,2,2,'#ff8a5a')},
 ward:(R)=>{R(3,2,10,7,'#5a9aff');R(4,9,8,2,'#5a9aff');R(5,11,6,2,'#5a9aff');R(7,13,2,1,'#5a9aff');R(7,3,2,9,'#d0eaff');R(4,5,8,2,'#d0eaff')},
 haste:(R)=>{R(9,1,3,4,'#ffe14a');R(7,5,5,2,'#ffe14a');R(5,7,5,2,'#ffe14a');R(7,9,3,2,'#ffe14a');R(5,11,3,4,'#ffe14a')}};
const PD={
 hp:(R,E)=>{E(5,6,3,3,'#e8323c');E(11,6,3,3,'#e8323c');R(3,7,10,3,'#e8323c');R(4,10,8,2,'#e8323c');R(6,12,4,1,'#e8323c');R(7,13,2,1,'#e8323c');R(4,4,2,2,'#ffb0b8')},
 mp:(R)=>{R(7,1,2,2,'#5aa0ff');R(6,3,4,2,'#5aa0ff');R(5,5,6,4,'#5aa0ff');R(6,9,4,3,'#5aa0ff');R(7,12,2,2,'#5aa0ff');R(7,4,1,5,'#d8ecff')},
 dmg:(R)=>{R(7,1,2,9,'#e0e4ec');R(7,1,1,8,'#ffffff');R(4,10,8,2,'#d4a72c');R(7,12,2,3,'#7a4a25')},
 arm:(R)=>{R(3,2,10,7,'#9aa7b8');R(4,9,8,2,'#9aa7b8');R(5,11,6,2,'#9aa7b8');R(7,13,2,1,'#9aa7b8');R(7,3,2,9,'#e0c040');R(4,5,8,2,'#e0c040')},
 magicArm:(R,E)=>{R(3,2,10,7,'#8a5aef');R(4,9,8,2,'#8a5aef');R(5,11,6,2,'#8a5aef');R(7,13,2,1,'#8a5aef');E(8,7,2,2,'#e8d8ff')},
 moveSpeed:(R)=>{R(2,10,4,2,'#e8f2ff');R(4,8,5,2,'#e8f2ff');R(7,6,5,2,'#e8f2ff');R(10,4,4,2,'#e8f2ff');R(3,12,3,1,'#9ac4ff')},
 attackSpeed:D.haste,
 F:(R)=>{R(4,4,8,7,'#e8b890');R(4,4,2,3,'#c88a60');R(7,4,2,3,'#c88a60');R(10,4,2,3,'#c88a60');R(5,11,6,3,'#e8b890');R(3,6,2,4,'#e8b890')},
 A:(R)=>{for(let i=0;i<10;i++)R(3+i,12-i,2,2,'#5fd05f');R(2,12,3,2,'#bfffbf');R(10,2,4,4,'#5fd05f')},
 I:(R,E)=>{R(7,1,2,14,'#8ac8ff');R(1,7,14,2,'#8ac8ff');R(3,3,2,2,'#cfe8ff');R(11,3,2,2,'#cfe8ff');R(3,11,2,2,'#cfe8ff');R(11,11,2,2,'#cfe8ff');E(8,8,2,2,'#ffffff')},
 x:(R,E)=>{R(7,2,2,12,'#ffd84a');R(2,7,12,2,'#ffd84a');E(8,8,3,3,'#fff0a0')}};
PD.spd=PD.moveSpeed;
const ORD=['hp','mp','dmg','arm','magicArm','moveSpeed','spd','attackSpeed','F','A','I'],PLB={hp:'% vida máx.',mp:'% mana máx.',dmg:'% dano',arm:'% defesa física',magicArm:'% defesa mágica',spd:'% velocidade',moveSpeed:'% movimento',attackSpeed:'% vel. de ataque',F:' Força',A:' Agilidade',I:' Inteligência'};
const KI={dot:'poison',slow:'slow',stun:'stun',vuln:'vuln',hot:'regen',dmgup:'rage',dmgdown:'weak',guard:'ward',haste:'haste'},cache={},pc={};
window.fxIcon=id=>{const art=PROJ.art['efeitos/'+id],sprite=art&&pixelArt(art);return sprite?sprite.toDataURL():cache[id]||(cache[id]=(()=>{const f=FX_INFO[id]||{},d=D[id]||D[f.icon]||D[KI[f.kind]];return(d?paint(16,16,d):paint(16,16,(R,E)=>E(8,8,5,5,f.c||'#fff'))).toDataURL()})())};
window.passIcon=o=>{const art=o&&o.sprite||PROJ.art['passivas/'+(o&&o.id)],sprite=art&&pixelArt(art);if(sprite)return sprite.toDataURL();const k=ORD.find(k=>+o[k])||'x';return pc[k]||(pc[k]=paint(16,16,PD[k]||PD.x).toDataURL())};
const KD={dot:(f,s)=>Math.round(s.pw*(s.n||1))+' de dano por '+(f.tick==1||!f.tick?'segundo':f.tick+'s'),slow:(f,s)=>'-'+Math.round(s.pw*(s.n||1))+'% de velocidade',stun:()=>'impede de agir',vuln:(f,s)=>'+'+Math.round(s.pw*(s.n||1))+'% de dano recebido',hot:(f,s)=>'+'+Math.round(s.pw*(s.n||1))+' de vida por segundo',dmgup:(f,s)=>'+'+Math.round(s.pw*(s.n||1))+'% de dano causado',dmgdown:(f,s)=>'-'+Math.round(s.pw*(s.n||1))+'% de dano causado',guard:(f,s)=>'-'+Math.round(s.pw*(s.n||1))+'% de dano recebido',haste:(f,s)=>'+'+Math.round(s.pw*(s.n||1))+'% de velocidade'};
const bar=document.createElement('div');bar.id='fxbar';$('dock').appendChild(bar);let sig='';
const mk=(src,cls,tip)=>{const e=document.createElement('div');e.className='fxi '+cls;e.innerHTML='<img src="'+src+'"><i></i><b></b>';e._tip=tip;bar.appendChild(e);return e};
const fxTip=k=>()=>{const s=(p.st||{})[k],f=FX_INFO[k];if(!s||!f)return'';return'<b style="color:'+f.c+'">'+f.n+'</b> <span class=tm>'+(f.good?'efeito positivo':'efeito negativo')+'</span><div>'+(KD[f.kind]?KD[f.kind](f,s):'')+'</div><div class=tm>Restam '+s.t.toFixed(1)+'s'+(s.n>1?' · '+s.n+' acúmulos':'')+(f.stacks>1?' (máx. '+f.stacks+')':'')+'</div>'};
function passives(){const c=CL[p.cls];if(!c)return[];const out=[],cd=(GAMEDATA.classes||[]).find(x=>x.id==p.cls)||{},pool=[...(GAMEDATA.passives||[]),...(GAMEDATA.skills||[]).filter(s=>s.category=='passive')];
 if(c.passive&&c.passive.n)out.push({n:c.passive.n,desc:c.passive.d||'',raw:cd.passive||{},lv:1});
 (c.plist||[]).forEach(r=>{const g=pool.find(x=>x.name==r.d.n);out.push({n:r.d.n,desc:(g&&g.desc)||'',raw:r.d,lv:r.lv})});return out}
const pasTip=r=>()=>'<b style="color:#e8cb78">'+r.n+'</b> <span class=tm>passiva — sempre ativa</span>'+(r.desc?'<div>'+r.desc+'</div>':'')+ORD.filter(k=>+r.raw[k]).map(k=>'<div style="color:#9fdc9f">'+(r.raw[k]>0?'+':'')+r.raw[k]+PLB[k]+'</div>').join('')+(p.lvl<r.lv?'<div class=tm style="color:#f99">Desbloqueia no nível '+r.lv+'</div>':'');
function upd(){const st=p.st||{},ks=Object.keys(st).filter(k=>FX_INFO[k]&&st[k].t>0),bad=ks.filter(k=>!FX_INFO[k].good).sort(),good=ks.filter(k=>FX_INFO[k].good).sort(),ps=passives(),s2=bad.join()+'|'+good.join()+'|'+p.cls+'|'+p.lvl+'|'+ps.map(r=>r.n).join();
 if(s2!==sig){sig=s2;bar.replaceChildren();
  bad.forEach(k=>mk(fxIcon(k),'bad',fxTip(k)).dataset.k=k);good.forEach(k=>mk(fxIcon(k),'good',fxTip(k)).dataset.k=k);
  if(ks.length&&ps.length){const sp=document.createElement('div');sp.className='fxsep';bar.appendChild(sp)}
  ps.forEach(r=>mk(passIcon(r.raw),'pas'+(p.lvl<r.lv?' lock':''),pasTip(r)))}
 bar.querySelectorAll('.fxi[data-k]').forEach(e=>{const s=st[e.dataset.k];if(!s)return;e.querySelector('b').textContent=Math.ceil(s.t)+(s.n>1?' x'+s.n:'');e.querySelector('i').style.height=(100-Math.max(0,Math.min(1,s.t/(s.d||s.t)))*100)+'%'});
 const fc=$('sks').children[0],dk=$('dock').getBoundingClientRect();if(fc){const r=fc.getBoundingClientRect();bar.style.left=Math.round(r.right-dk.left-3)+'px';bar.style.maxWidth=Math.max(120,Math.round(dk.right-r.right-8))+'px'}}
/* efeitos do alvo (monstro selecionado): mesmos ícones do jogador, abaixo da caixa de informações do topo */
const mbar=document.createElement('div');mbar.id='monfx';document.body.appendChild(mbar);let msig='',malvo=null;
const alvoTip=(t,k)=>()=>{const s=(t.st||{})[k],f=FX_INFO[k];if(!s||!f)return'';return'<b style="color:'+f.c+'">'+f.n+'</b> <span class=tm>'+(f.good?'efeito positivo':'efeito negativo')+'</span><div>'+(KD[f.kind]?KD[f.kind](f,s):'')+'</div><div class=tm>Restam '+s.t.toFixed(1)+'s'+(s.n>1?' · '+s.n+' acúmulos':'')+'</div>'};
function updAlvo(){
 const t=window.alvoInfo,st=t&&t.hp>0&&t.st||{},ks=Object.keys(st).filter(k=>FX_INFO[k]&&st[k].t>0);
 const bad=ks.filter(k=>!FX_INFO[k].good).sort(),good=ks.filter(k=>FX_INFO[k].good).sort(),s2=bad.join()+'|'+good.join();
 if(t!==malvo||s2!==msig){malvo=t;msig=s2;mbar.replaceChildren();
  for(const [k,cls] of [...bad.map(k=>[k,'bad']),...good.map(k=>[k,'good'])]){const e=document.createElement('div');e.className='fxi '+cls;e.innerHTML='<img src="'+fxIcon(k)+'"><i></i><b></b>';e._tip=alvoTip(t,k);e.dataset.k=k;mbar.appendChild(e)}}
 mbar.hidden=!ks.length;if(!ks.length)return;
 mbar.querySelectorAll('.fxi').forEach(e=>{const s=st[e.dataset.k];if(!s)return;e.querySelector('b').textContent=Math.ceil(s.t)+(s.n>1?' x'+s.n:'');e.querySelector('i').style.height=(100-Math.max(0,Math.min(1,s.t/(s.d||s.t)))*100)+'%'});
 // logo abaixo da caixa do alvo; com a caixa escondida (chefe da DG, barra própria no topo), um pouco mais abaixo
 const mon=$('mon'),r=mon.getBoundingClientRect(),vis=mon.style.display!=='none'&&r.height>0;
 mbar.style.top=Math.round(vis?r.bottom+4:64)+'px';
}
const hud2=hud;hud=function(){hud2();upd();updAlvo()};
/* equipamentos: ao ser atingido, chance de ganhar efeitos */
const hp0=hurtP;hurtP=function(d,m,fx,dot){const r=hp0.apply(this,arguments);if(!dot&&p.hp>0)Object.values(EQ).forEach(s=>{const it=s&&ITEMS[s.id];if(it&&it.fx&&it.fx.length)applyFx(p,resolveFx(it.fx.map(f=>({...f,target:'self'})),0))});return r};
const tip0=itemTip;itemTip=function(id,q,sl){let h=tip0(id,q,sl);const it=ITEMS[id];if(it&&it.fx&&it.fx.length)h+='<div class=tm style="color:#9fdc9f">Ao ser atingido: '+it.fx.filter(f=>FX_INFO[f.type]).map(f=>(f.chance==null?100:f.chance)+'% de ganhar '+FX_INFO[f.type].n+' por '+(f.dur||3)+'s'+fxExtra(f)).join('; ')+'.</div>';return h};
})();
