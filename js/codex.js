/* ---------- enciclopédia (monstros, itens, habilidades) + painéis sem sobreposição ---------- */
(function(){
const E=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e};
const SLOT={he:'Capacete',ch:'Peitoral',le:'Calça',bo:'Bota',ca:'Capa',ne:'Colar',ri:'Anel',sw:'Arma',sh:'Escudo'},pct=v=>+(v*100).toFixed(1)+'%',nm=id=>ITEMS[id]?ITEMS[id].n.split(' (')[0]:id,st=id=>{const m=ITEMS[id]&&ITEMS[id].n.match(/\((.*)\)$/);return m?m[1]:''};
/* dock: Inventário em cima de Habilidades */
const col=E('div');col.id='sbtns';$('skillBtn').before(col);col.append($('bag'),$('skillBtn'));$('bag').textContent='Mochila';$('bag').title='Mochila (I)';$('skillBtn').textContent='Habilidades';
/* botão da enciclopédia */
const cb=E('button','','Enciclopédia');cb.id='codexBtn';cb.title='Enciclopédia (J)';col.prepend(cb);cb.onclick=()=>toggle();
const box=E('section');box.id='codex';document.body.appendChild(box);
let tab='mon',q='';
/* ---- dados ---- */
function mons(){const be=en.find(e=>e.boss);return Object.keys(MONSTER_TYPES).map(id=>{const t=MONSTER_TYPES[id],B=id=='boss'&&be?{max:be.max,dmg:be.dmg,spd:be.spd,xp:be.xp,g:be.g,aggro:be.aggro,base:'sk'}:(MB[id]||{max:0,dmg:0,spd:0,xp:0,g:0,aggro:0,base:'sl'});
 return{id,t,B,img:t.sprite||(SP[B.base]||SP.sl).d,sk:(t.skills&&t.skills[0])||t.skill,bt:t.bossType||'normal',sp:window.SPAWNINFO&&SPAWNINFO[id]}})}
/* ---- bestiário: só aparece o que o jogador já descobriu (js/state.js BESTIARIO) ---- */
const MAIS_INFO=100,abertos=new Set(),sombras=new Map();
const mortes=id=>(window.BESTIARIO&&BESTIARIO.k[id])||0,jaCaiu=(ty,id)=>!!(window.BESTIARIO&&BESTIARIO.d[ty]&&BESTIARIO.d[ty][id]);
// silhueta preta do sprite para monstros ainda não derrotados
function sombra(m){if(!sombras.has(m.id)){const c=document.createElement('canvas');c.width=m.img.width;c.height=m.img.height;const x=c.getContext('2d');x.drawImage(m.img,0,0);x.globalCompositeOperation='source-in';x.fillStyle='#4a4236';x.fillRect(0,0,c.width,c.height);sombras.set(m.id,c.toDataURL())}return sombras.get(m.id)}
// chance real de cada item cair deste monstro (mesma regra de killMonster em combat.js)
function chances(m){const out={};for(const d of m.t.drops||[])if(d&&d.id)out[d.id]=d.chance/100;return out}
/* ---- abas ---- */
function tMon(){const g=E('div','cx-grid');mons().sort((a,b)=>(a.bt!='normal')-(b.bt!='normal')||(a.sp?a.sp.min:99)-(b.sp?b.sp.min:99)).forEach(m=>{const c=E('div','cx-card'),B=m.B,sk=m.sk,n=mortes(m.id);
 const badge=m.bt=='grandboss'?'<span class="cx-badge gb">Chefe</span>':m.bt=='boss'?'<span class="cx-badge boss">Elite</span>':'<span class="cx-badge">Normal</span>';
 if(!n){c.classList.add('cx-oculto');c.innerHTML='<div class="cx-head"><img src="'+sombra(m)+'"><div><b>???</b>'+badge+'</div></div><div class="dim">Derrote este monstro para descobrir.</div>';g.appendChild(c);return}
 const lv=m.sp?'Nv '+m.sp.min+(m.sp.max&&m.sp.max<999?'–'+m.sp.max:'+'):m.bt!='normal'?'Único':'—',where=m.sp?(m.sp.far?'longe do acampamento':m.sp.coast?'costa':'toda a ilha'):'ponto fixo';
 const ch=chances(m),ids=Object.keys(ch).filter(id=>ITEMS[id]),vistos=ids.filter(id=>jaCaiu(m.id,id)).sort((a,b)=>ch[b]-ch[a]),falta=ids.length-vistos.length;
 const drops=(vistos.length?'<div class="cx-drops">'+vistos.map(id=>'<div class="cx-drop'+(window.ehMissao&&ehMissao(id)?' missao':'')+'" title="'+nm(id)+'"><img src="'+ITEMS[id].ic+'"><span>'+(window.ehMissao&&ehMissao(id)?'! ':'')+nm(id)+'</span><b>'+pct(ch[id])+'</b></div>').join('')+'</div>':'<div class="dim">Nenhum item caiu ainda.</div>')
  +(falta>0?'<div class="dim">+'+falta+' item(ns) ainda não encontrado(s)</div>':'');
 const info=n>=MAIS_INFO,aberto=info&&abertos.has(m.id);
 c.innerHTML='<div class="cx-head"><img src="'+m.img.toDataURL()+'"><div><b>'+m.t.name+'</b>'+badge+'<span class="cx-badge">'+lv+'</span></div></div>'
 +'<div class="cx-row"><span>Derrotados</span><span>'+n+'</span></div>'
 +'<div class="cx-sub">Drops</div>'+drops
 +(aberto?'<div class="cx-sub">Informações</div><div class="cx-row"><span>Vida base</span><span>'+Math.round(B.max)+'</span></div><div class="cx-row"><span>Dano base</span><span>'+Math.round(B.dmg)+'</span></div><div class="cx-row"><span>Velocidade</span><span>'+Math.round(B.spd)+'</span></div>'
 +'<div class="cx-row"><span>Atributos F/A/I</span><span>'+m.t.stats.F+' / '+m.t.stats.A+' / '+m.t.stats.I+'</span></div><div class="cx-row"><span>Agressividade</span><span>'+B.aggro+' px</span></div>'
 +'<div class="cx-row"><span>XP / Ouro</span><span>'+B.xp+' / '+B.g+'</span></div><div class="cx-row"><span>Aparece</span><span>'+where+'</span></div>'
 +(sk&&sk.name?'<div class="cx-sub">Habilidade</div><div class="cx-row"><span>'+sk.name+'</span><span>'+(sk.cost<999999?sk.cost+' mana · ':'')+(sk.cd<999?sk.cd+'s':'')+'</span></div>'+(((sk.fxs||sk.effects)||[]).length?'<div class="cx-row"><span>Efeitos</span><span>'+(sk.fxs||sk.effects).map(f=>FX_INFO[f.type]?FX_INFO[f.type].n:f.type).join(', ')+'</span></div>':''):''):'');
 const bt=E('button','cx-mais',info?(aberto?'Menos informações':'Mais informações'):'Mais informações: '+n+'/'+MAIS_INFO+' derrotados');bt.type='button';bt.disabled=!info;
 bt.onclick=()=>{if(abertos.has(m.id))abertos.delete(m.id);else abertos.add(m.id);render()};c.appendChild(bt);
 g.appendChild(c)});return g}
function tItem(){const src={};mons().forEach(m=>{const ch=chances(m);for(const id in ch)if(jaCaiu(m.id,id))(src[id]=src[id]||[]).push(m.t.name+' '+pct(ch[id]))});
 const cats={};Object.keys(ITEMS).forEach(id=>{const it=ITEMS[id],k=it.use?'Consumíveis':SLOT[gearType[id]]||'Outros';(cats[k]=cats[k]||[]).push(id)});
 const w=E('div');['Arma','Escudo','Capacete','Peitoral','Calça','Bota','Capa','Colar','Anel','Consumíveis','Outros'].forEach(k=>{if(!cats[k])return;w.appendChild(E('h4','',k+' ('+cats[k].length+')'));const g=E('div','cx-grid');
 cats[k].forEach(id=>{const it=ITEMS[id],c=E('div','cx-card'),from=(src[id]||[]).slice();
  c.innerHTML='<div class="cx-head"><img src="'+(it.ic||it.c.toDataURL())+'"><div><b>'+nm(id)+'</b><span class="cx-badge">'+k+'</span>'+(it.th?'<span class="cx-badge">2 mãos</span>':'')+(it.wt?'<span class="cx-badge">'+it.wt+'</span>':'')+'</div></div>'
  +'<div class="cx-row"><span>Atributos</span><span>'+(st(id)||'—')+'</span></div>'+(it.use?'<div class="cx-row"><span>Uso</span><span>consumível</span></div>':'<div class="cx-row"><span>Qualidade</span><span>0–100 (Ruim → Perfeita)</span></div>')
  +'<div class="cx-sub">Origem</div>'+(from.length?'<ul>'+from.map(s=>'<li>'+s+'</li>').join('')+'</ul>':'<div class="dim">Ainda não descoberta</div>');g.appendChild(c)});w.appendChild(g)});return w}
function tSkill(){const w=E('div'),basics=(GAMEDATA.items||[]).filter(it=>it.kind=='weapon'&&typeof BASIC!='undefined'&&BASIC[it.id]);if(basics.length){w.appendChild(E('h4','','Ataques básicos das armas'));const grid=E('div','cx-grid');basics.forEach(it=>{const b=BASIC[it.id],card=E('div','cx-card'),head=E('div','cx-head'),img=E('img');img.src=b.ic;head.append(img,E('b','',b.n));card.append(head,E('div','cx-badge','Ataque básico · '+(it.name||it.id)),E('div','dim',b.t||'Ataque automático da arma.'),E('div','dim','Alcance '+Math.round(b.rng)+(b.proj?' · à distância':' · corpo a corpo')+'. Configurado no editor da arma.'));grid.appendChild(card)});w.appendChild(grid)}Object.keys(CL).forEach(id=>{const c=CL[id];let ents=[];try{ents=skillEntries(id)}catch(e){}
 w.appendChild(E('h4','',c.n+' — F '+(c.F+3)+' · A '+(c.A+3)+' · I '+(c.I+3)));
 const ps=[c.passive&&c.passive.n?c.passive.n+': '+(c.passive.d||''):'',...(c.plist||[]).map(r=>r.d.n+(r.rank?' (rank '+r.rank+')':' (nv '+r.lv+')')+': '+r.d.t)].filter(Boolean);if(ps.length){const p0=E('div','cx-card','<div class="cx-sub">Passivas</div><ul>'+ps.map(s=>'<li>'+s+'</li>').join('')+'</ul>');p0.style.marginBottom='8px';w.appendChild(p0)}
 const g=E('div','cx-grid');ents.forEach(s=>{const k=E('div','cx-card');let ds='';try{ds=s.d()}catch(e){}k.innerHTML='<div class="cx-head"><img src="'+s.ic+'"><div><b>'+s.n+'</b><span class="cx-badge">Rank '+s.rank+'</span>'+(s.cross?'<span class="cx-badge boss">Cross</span>':'')+'</div></div><div class="cx-row"><span>Mana</span><span>'+(s.mana||0)+'</span></div><div class="cx-row"><span>Recarga</span><span>'+s.cd+'s</span></div><div class="dim" style="margin-top:4px">'+ds+'</div>';g.appendChild(k)});w.appendChild(g)});
 w.appendChild(E('h4','','Habilidades de arma'));const g=E('div','cx-grid');Object.keys(WSK).forEach(id=>(id=='none'?WSK[id]:WSK[id].slice(0,1)).forEach(s=>{if(!s||!s.n)return;const k=E('div','cx-card');let ds='';try{ds=s.d()}catch(e){}k.innerHTML='<div class="cx-head"><img src="'+s.ic+'"><div><b>'+s.n+'</b><span class="cx-badge">'+(id=='none'?'Desarmado':nm(id))+'</span></div></div><div class="cx-row"><span>Mana</span><span>'+(s.mana||0)+'</span></div><div class="cx-row"><span>Recarga</span><span>'+s.cd+'s</span></div><div class="dim" style="margin-top:4px">'+ds+'</div>';g.appendChild(k)}));w.appendChild(g);return w}
function tClass(){const g=E('div','cx-grid');Object.keys(CL).forEach(id=>{const c=CL[id],h=HS[id]&&(HS[id].d||HS[id].s),img=c.sprite||h,sk=skillEntries(id),pl=c.perLevel||{},ps=[c.passive&&c.passive.n?c.passive.n+': '+(c.passive.d||''):'',...(c.plist||[]).map(r=>r.d.n+' (nv '+r.lv+')')].filter(Boolean);
 const cc=E('div','cx-card','<div class="cx-head">'+(img&&img.toDataURL?'<img src="'+img.toDataURL()+'">':'')+'<div><b>'+c.n+'</b><span class="cx-badge">Classe</span></div></div><div class="cx-row"><span>Atributos F/A/I</span><span>'+(c.F+3)+' / '+(c.A+3)+' / '+(c.I+3)+'</span></div><div class="cx-row"><span>Por nível</span><span>+'+(pl.F||0)+' / +'+(pl.A||0)+' / +'+(pl.I||0)+'</span></div><div class="cx-row"><span>Vel. de ataque</span><span>'+c.attackSpeed+'x</span></div><div class="cx-sub">Passivas</div>'+(ps.length?'<ul>'+ps.map(s=>'<li>'+s+'</li>').join('')+'</ul>':'<div class="dim">—</div>')+'<div class="cx-sub">Habilidades</div><ul>'+sk.map(s=>'<li>Rank '+s.rank+' — '+s.n+(s.cross?' (cross)':'')+'</li>').join('')+'</ul>');g.appendChild(cc)});return g}
function tFx(){const g=E('div','cx-grid'),KD={dot:'Dano contínuo',slow:'Reduz velocidade',stun:'Impede de agir',vuln:'Aumenta dano recebido',hot:'Cura contínua',dmgup:'Aumenta dano causado',dmgdown:'Reduz dano causado',guard:'Reduz dano recebido',haste:'Aumenta velocidade'},src={};
 (GAMEDATA.items||[]).forEach(it=>(it.effects||[]).forEach(f=>(src[f.type]=src[f.type]||[]).push(it.name+(f.target=='self'?(it.kind=='weapon'?' (em você, ao atacar)':' (em você, ao ser atingido)'):''))));
 mons().forEach(m=>((m.sk&&(m.sk.fxs||m.sk.effects))||[]).forEach(f=>(src[f.type]=src[f.type]||[]).push(m.t.name)));
 Object.keys(FX_INFO).forEach(id=>{const f=FX_INFO[id];const cc=E('div','cx-card','<div class="cx-head"><img src="'+fxIcon(id)+'"><div><b>'+f.n+'</b><span class="cx-badge '+(f.good?'':'boss')+'">'+(f.good?'Positivo':'Negativo')+'</span></div></div><div class="cx-row"><span>Efeito</span><span>'+(KD[f.kind]||'')+'</span></div><div class="cx-sub">Origem</div>'+(src[id]?'<ul>'+[...new Set(src[id])].map(s=>'<li>'+s+'</li>').join('')+'</ul>':'<div class="dim">—</div>'));g.appendChild(cc)});return g}
function tPassive(){const g=E('div','cx-grid'),list=[...(GAMEDATA.passives||[]),...(GAMEDATA.skills||[]).filter(s=>s.category=='passive')],PL={hp:'Vida máx. %',mp:'Mana máx. %',dmg:'Dano %',arm:'Defesa física %',magicArm:'Defesa mágica %',spd:'Velocidade %',moveSpeed:'Movimento %',attackSpeed:'Vel. de ataque %',F:'Força',A:'Agilidade',I:'Inteligência'};
 list.forEach(ps=>{const used=(GAMEDATA.classes||[]).filter(c=>(c.passives||[]).some(r=>r.id==ps.id)).map(c=>{const r=c.passives.find(r=>r.id==ps.id);return c.name+(r.rank?' (rank '+r.rank+')':' (nv '+r.lv+')')}),c=E('div','cx-card','<div class="cx-head"><div><b>'+(ps.name||ps.id)+'</b><span class="cx-badge">Passiva</span></div></div><div class="dim">'+(ps.desc||'')+'</div>'+Object.keys(PL).filter(k=>+ps[k]).map(k=>'<div class="cx-row"><span>'+PL[k]+'</span><span>'+(+ps[k]>0?'+':'')+ps[k]+'</span></div>').join('')+'<div class="cx-sub">Usada por</div>'+(used.length?'<ul>'+used.map(u=>'<li>'+u+'</li>').join('')+'</ul>':'<div class="dim">nenhuma classe</div>'));
  g.appendChild(c)});return g}
function render(){box.replaceChildren();const top=E('div','cx-top','<h3>Enciclopédia</h3>');
 [['mon','Monstros'],['item','Itens'],['skill','Habilidades'],['class','Classes'],['passive','Passivas'],['fx','Efeitos']].forEach(([k,l])=>{const b=E('button','cx-tab'+(tab==k?' on':''),l);b.onclick=()=>{tab=k;render()};top.appendChild(b)});
 const i=E('input');i.placeholder='Buscar…';i.value=q;i.oninput=()=>{q=i.value.toLowerCase();filt()};top.appendChild(i);const x=E('button','cx-x','✕');x.onclick=()=>toggle(false);top.appendChild(x);
 const body=E('div','cx-body');body.appendChild(tab=='mon'?tMon():tab=='item'?tItem():tab=='class'?tClass():tab=='passive'?tPassive():tab=='fx'?tFx():tSkill());box.append(top,body);filt()}
function filt(){box.querySelectorAll('.cx-card').forEach(c=>{if(c.querySelector('.cx-sub')&&!c.querySelector('.cx-head'))return;c.style.display=!q||c.textContent.toLowerCase().includes(q)?'':'none'})}
window.codexRefresh=()=>{if(box.classList.contains('open'))render()};
function toggle(v){const o=v==null?!box.classList.contains('open'):v;box.classList.toggle('open',o);if(o)render()}
/* ---- painéis exclusivos: abrir um fecha os outros ---- */
const P={inv:{el:$('invp'),on:()=>getComputedStyle($('invp')).display!='none',off:()=>{if(P.inv.on())togInv()}},skill:{el:$('skillPanel'),on:()=>$('skillPanel').classList.contains('open'),off:()=>$('skillPanel').classList.remove('open')},codex:{el:box,on:()=>box.classList.contains('open'),off:()=>box.classList.remove('open')}},was={};
const check=()=>{let opened=null;for(const k in P){const o=P[k].on();if(o&&!was[k])opened=k;was[k]=o}
 if(opened){for(const k in P)if(k!=opened&&P[k].on()){P[k].off();was[k]=false}const pk=$('skillPicker');pk&&pk.classList.remove('open')}};
const mo=new MutationObserver(check);Object.values(P).forEach(p=>mo.observe(p.el,{attributes:true,attributeFilter:['class','style']}));
window.closePanels=()=>{let c=false;for(const k in P)if(P[k].on()){P[k].off();c=true}return c};
addEventListener('keydown',e=>{if(TECLAS.acao(e)=='enciclopedia')toggle()});
const ix=E('button','cx-x','✕');ix.id='invX';$('invp').appendChild(ix);ix.onclick=()=>togInv();
let dropMin=false;const dp0=$('drop'),sd=showDrop;showDrop=function(){sd();const h=dp0.querySelector('.dh');if(h){const b=E('button','dmin',dropMin?'▢':'—');b.onclick=()=>{dropMin=!dropMin;showDrop()};h.appendChild(b)}dp0.classList.toggle('min',dropMin);placeDrop()};
function placeDrop(){if(getComputedStyle(dp0).display=='none')return;const r=$('dock').getBoundingClientRect(),iv=$('invp'),vis=getComputedStyle(iv).display!='none',w=dp0.offsetWidth,h=dp0.offsetHeight,S=(k,v)=>dp0.style.setProperty(k,v,'important'),
 put=right=>{const left=innerWidth-right-w,bottom=left<r.right+8&&left+w>r.left?innerHeight-r.top+8:8;S('right',right+'px');S('bottom',bottom+'px');return{l:left,r:left+w,t:innerHeight-bottom-h,b:innerHeight-bottom}};
 let d=put(8);if(vis){const ir=iv.getBoundingClientRect();if(d.l<ir.right&&d.r>ir.left&&d.t<ir.bottom&&d.b>ir.top)put(innerWidth-ir.left+8)}}
addEventListener('resize',placeDrop);
const hud3=hud;hud=function(){hud3();placeDrop()};
/* arrastar painéis pelo título */
function drag(el,sel){el.addEventListener('pointerdown',e=>{const h=e.target.closest(sel);if(!h||e.target.closest('button,input')||e.button!==0)return;const r=el.getBoundingClientRect(),ox=e.clientX-r.left,oy=e.clientY-r.top,S=(k,v)=>el.style.setProperty(k,v,'important');
 S('transform','none');S('right','auto');S('bottom','auto');S('left',r.left+'px');S('top',r.top+'px');
 const mv=ev=>{S('left',Math.max(0,Math.min(innerWidth-80,ev.clientX-ox))+'px');S('top',Math.max(0,Math.min(innerHeight-40,ev.clientY-oy))+'px')},up=()=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up)};
 addEventListener('pointermove',mv);addEventListener('pointerup',up);e.preventDefault()});el.querySelectorAll(sel).forEach(h=>h.style.cursor='move')}
drag($('invp'),'.ttl');drag($('skillPanel'),'.skillHead');drag(box,'.cx-top');
/* botão direito no minimapa = andar até o ponto */
const mmEl=$('mm'),go=e=>{if(p.dead>0)return;const r=mmEl.getBoundingClientRect(),R=window.MMR||170,wx=p.x+((e.clientX-r.left)/r.width-.5)*2*R,wy=p.y+((e.clientY-r.top)/r.height-.5)*2*R;p.npcT=null;p.tgt=null;p.aw=0;p.wt=null;p.attackBasic=null;setDest(wx,wy);ring(wx,wy,8,'#5f5',.35)};
mmEl.addEventListener('pointerdown',e=>{if(e.button===2){e.preventDefault();go(e)}});mmEl.addEventListener('pointermove',e=>{if(e.buttons&2)go(e)});
/* painel de status */
let lastSt='';const hud0=hud;hud=function(){hud0();const a=attributes(),cell=(l,v)=>'<div class="sc"><span>'+l+'</span><b>'+v+'</b></div>',
 /* foto do herói: dano do ataque (mínimo–máximo, com buffs), crítico e defesas */
 fx0=faixaBasico(),tot=k=>Math.round(fx0[k].physical+fx0[k].magic),crit=Math.max(0,Math.min(1,bonus('critChance')+critAgi(p))),
 h='<div class="sg">'+cell('Dano',textoFaixa(fx0))+cell('Crítico',Math.round(crit*1000)/10+'%')+cell('Defesa',armor())+cell('Def. mág.',magicArmor())+cell('Vel. atq.',attackInterval().toFixed(2)+'s')+cell('Movim.',Math.round(CALC.move*(1+spdB())))+'</div><div class="fai2"><span><b style="color:#f55">F</b> '+a.F+'</span><span><b style="color:#5ee05a">A</b> '+a.A+'</span><span><b style="color:#5aa8ff">I</b> '+a.I+'</span></div><div class="gl">Ouro <b>'+(p.gold|0)+'</b></div>';
 if(h!==lastSt){lastSt=h;$('st').innerHTML=h}};
})();
