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
function mons(){const be=en.find(e=>e.boss);return Object.keys(MONSTER_TYPES).map(id=>{const t=MONSTER_TYPES[id],B=id=='boss'&&be?{max:be.max,dmg:be.dmg,spd:be.spd,xp:be.xp,g:be.g,aggro:be.aggro,base:'glooc'}:(MB[id]||{max:0,dmg:0,spd:0,xp:0,g:0,aggro:0,base:'sl'});
 return{id,t,B,img:t.sprite||(SP[B.base]||SP.sl).d,sk:(t.skills&&t.skills[0])||t.skill,bt:t.bossType||'normal',sp:window.SPAWNINFO&&SPAWNINFO[id]}})}
/* ---- bestiário: só aparece o que o jogador já descobriu (js/state.js BESTIARIO) ---- */
const MAIS_INFO=100,abertos=new Set(),sombras=new Map();
const mortes=id=>(window.BESTIARIO&&BESTIARIO.k[id])||0,jaCaiu=(ty,id)=>!!(window.BESTIARIO&&BESTIARIO.d[ty]&&BESTIARIO.d[ty][id]);
// silhueta preta do sprite para monstros ainda não derrotados
function sombra(m){if(!sombras.has(m.id)){const c=document.createElement('canvas');c.width=m.img.width;c.height=m.img.height;const x=c.getContext('2d');x.drawImage(m.img,0,0);x.globalCompositeOperation='source-in';x.fillStyle='#4a4236';x.fillRect(0,0,c.width,c.height);sombras.set(m.id,c.toDataURL())}return sombras.get(m.id)}
// chance real de cada item cair deste monstro (mesma regra de killMonster em combat.js)
function chances(m){const out={};for(const d of m.t.drops||[])if(d&&d.id)out[d.id]=d.chance/100;return out}
/* ---- abas ---- */
function tMon(){const g=E('div','cx-grid');mons().sort((a,b)=>(a.bt!='normal')-(b.bt!='normal')||(a.sp?a.sp.min:99)-(b.sp?b.sp.min:99)).forEach(m=>{const c=E('div','cx-card'),B=m.B;c.dataset.ref='mon:'+m.id;const _=0,sk=m.sk,n=mortes(m.id);
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
/* ---- descobertas (2026-10-31, pedido do usuário): item só aparece depois de obtido (caiu, comprou, ganhou, equipou);
   habilidade e passiva, depois de liberadas (classe aprendida no rank/nível pedido). O resto vira silhueta "???" ---- */
const temItem=id=>{const B=window.BESTIARIO||{};if(B.v&&B.v[id])return true;if(I.some(s=>s&&s.id==id)||Object.values(EQ).some(s=>s&&s.id==id)||(window.RAPIDO||[]).some(s=>s&&s.id==id))return true;
 for(const ty in B.d||{})if(B.d[ty][id])return true;return false};
const rankDe=cls=>p.classProgress&&p.classProgress[cls]?p.classProgress[cls].rank:0;
const liberada=s=>rankDe(s.owner)>=(s.rank||1);
const FXATTR={F:'Força',A:'Agilidade',I:'Inteligência',physicalPower:'poder físico',magicPower:'poder mágico',dmg:'dano de equipamento',weaponPower:'poder da arma'};
const KD={dot:'Dano contínuo',slow:'Reduz a velocidade',stun:'Impede de agir',medo:'Foge com medo',vuln:'Aumenta o dano recebido',hot:'Cura contínua',dmgup:'Aumenta o dano causado',physup:'Aumenta o dano físico',magup:'Aumenta o dano mágico',dmgdown:'Reduz o dano causado',guard:'Reduz o dano recebido',haste:'Aumenta a velocidade',regenPct:'Reduz a regeneração de vida',armorPct:'Reduz a defesa física'};
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const raw=id=>(GAMEDATA.items||[]).find(i=>i.id==id)||{};
const skDef=id=>(GAMEDATA.skills||[]).find(s=>s.id==id);
// SKI (combat.js) já devolve a imagem pronta (data URL)
const icoSkill=d=>{try{const v=SKI(d.icon||'orb',d.c1||'#4a6a96',d.c2||'#fff');return typeof v=='string'?v:v&&v.toDataURL?v.toDataURL():''}catch(e){return''}};
// silhueta do ícone (item ainda não encontrado, habilidade ainda não liberada): o próprio ícone, escurecido pelo CSS
const imgSombra=url=>url?'<img class="cx-silimg" src="'+esc(url)+'" alt="">':'<span class="cx-silvazio"></span>';
/* ---- palavras-chave: nome de habilidade, efeito, passiva, item ou monstro conhecido vira link para a ficha ---- */
const link=(tipo,id,txt)=>'<a class="cx-link" data-ref="'+tipo+':'+esc(id)+'" href="#">'+txt+'</a>';
let NOMES=null;
function indice(){if(NOMES)return NOMES;const l=[];
 for(const c of Object.keys(CL)){let es=[];try{es=skillEntries(c)}catch(e){}for(const s of es)if(s.n&&liberada(s))l.push([s.n,'skill',s.id])}
 for(const id in WSK)if(id!=='none'&&temItem(id))for(const s of WSK[id]||[])if(s&&s.n)l.push([s.n,'skill',s.id||s.n]);
 for(const id in FX_INFO)if(FX_INFO[id].n)l.push([FX_INFO[id].n,'fx',id]);
 for(const ps of passivas())if(ps.liberada)l.push([ps.n,'passive',ps.id]);
 for(const id in ITEMS)if(temItem(id))l.push([nm(id),'item',id]);
 l.sort((a,b)=>b[0].length-a[0].length);return NOMES=l}
const reEsc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
function linkar(html){const L=indice().filter(x=>x[0].length>=4);if(!html||!L.length)return html||'';
 const re=new RegExp('(^|[^0-9A-Za-zÀ-ÿ])('+L.map(x=>reEsc(x[0])).join('|')+')(?=$|[^0-9A-Za-zÀ-ÿ])','gi'),por=new Map(L.map(x=>[x[0].toLowerCase(),x]));
 return String(html).split(/(<[^>]+>)/).map(parte=>parte.startsWith('<')?parte:parte.replace(re,(m,a,nome)=>{const x=por.get(nome.toLowerCase());return x?a+link(x[1],x[2],nome):m})).join('')}
// clique num link: vai para a aba da ficha, rola até ela e acende
box.addEventListener('click',e=>{const a=e.target.closest('.cx-link');if(!a)return;e.preventDefault();irPara(a.dataset.ref)});
function irPara(r){const tipo=r.split(':')[0],abas={skill:'skill',fx:'fx',passive:'passive',item:'item',mon:'mon',class:'class'};if(!abas[tipo])return;tab=abas[tipo];q='';render();
 const c=box.querySelector('[data-ref="'+CSS.escape(r)+'"]');if(c){c.style.display='';c.scrollIntoView({block:'center',behavior:'smooth'});c.classList.remove('cx-flash');void c.offsetWidth;c.classList.add('cx-flash')}}
const linha=(rot,val,cls)=>val===''||val==null?'':'<div class="cx-row'+(cls?' '+cls:'')+'"><span>'+rot+'</span><span>'+val+'</span></div>';
const valorStat=(k,v)=>{const s=ITEM_STATS[k];return(v>0?'+':'')+(+v)+(s&&s.percent?'%':'')};
function atributos(stats){const ks=Object.keys(stats||{}).filter(k=>ITEM_STATS[k]&&+stats[k]);if(!ks.length)return'';
 return'<div class="cx-sub">Atributos</div><div class="cx-attrs">'+ks.map(k=>'<div><span>'+ITEM_STATS[k].label.replace(/ \(.*\)$/,'')+'</span><b class="'+(+stats[k]>0?'pos':'neg')+'">'+valorStat(k,stats[k])+'</b></div>').join('')+'</div>'}
function efeitos(lista,proprio){const l=(Array.isArray(lista)?lista:[]).filter(f=>f&&FX_INFO[f.type]);if(!l.length)return'';
 return'<div class="cx-sub">Efeitos</div>'+l.map(f=>'<div class="cx-fx"><img src="'+fxIcon(f.type)+'"><div>'+link('fx',f.type,'<b>'+esc(FX_INFO[f.type].n)+'</b>')+'<span>'+esc(window.efeitoFrase?efeitoFrase([f],proprio||f.target=='self'):'')+'</span></div></div>').join('')}

/* ---- Itens: só os já obtidos; dano, atributos, efeitos e habilidades organizados; de onde cai ---- */
function tItem(){const src={};mons().forEach(m=>{const ch=chances(m);for(const id in ch)if(jaCaiu(m.id,id))(src[id]=src[id]||[]).push(link('mon',m.id,esc(m.t.name))+' <i>'+pct(ch[id])+'</i>')});
 const cats={};Object.keys(ITEMS).forEach(id=>{const it=ITEMS[id];if(window.ehMissao&&ehMissao(id)&&!temItem(id))return;const k=it.use?'Consumíveis':SLOT[gearType[id]]||'Outros';(cats[k]=cats[k]||[]).push(id)});
 const w=E('div');['Arma','Escudo','Capacete','Peitoral','Calça','Bota','Capa','Colar','Anel','Consumíveis','Outros'].forEach(k=>{if(!cats[k])return;const vistos=cats[k].filter(temItem),falta=cats[k].filter(id=>!temItem(id));
  w.appendChild(E('h4','',k+' <small>'+vistos.length+'/'+cats[k].length+' descobertos</small>'));const g=E('div','cx-grid');
  vistos.forEach(id=>{const it=ITEMS[id],r=raw(id),c=E('div','cx-card cx-item');c.dataset.ref='item:'+id;
   const tipo=r.damageType=='magic'?'mágico':'físico',outro=r.damageType=='magic'?'físico':'mágico';
   const dano=gearType[id]=='sw'&&(+r.damageMax||+r.damageMin)?'<div class="cx-dano"><b>'+(+r.damageMin||0)+'–'+(+r.damageMax||0)+'</b> de dano '+tipo+((+r.damage2Max||+r.damage2Min)?' <b>+'+(+r.damage2Min||0)+'–'+(+r.damage2Max||0)+'</b> '+outro:'')+'</div>':'';
   const basico=gearType[id]=='sw'&&r.basic&&r.basic.name?'<div class="cx-sub">Ataque básico</div><div class="cx-origem">'+esc(r.basic.name)+(r.basic.ranged?' · à distância':' · corpo a corpo')+(r.basic.rng?' · alcance '+Math.round(r.basic.rng):'')+'</div>':'';
   const habs=(Array.isArray(r.skills)?r.skills:[]).map(skDef).filter(Boolean);
   const cura=it.use&&r.heal?[r.heal.hp?'+'+r.heal.hp+' vida':'',r.heal.hpPct?'+'+r.heal.hpPct+'% da vida':'',r.heal.mp?'+'+r.heal.mp+' mana':'',r.heal.mpPct?'+'+r.heal.mpPct+'% da mana':''].filter(Boolean).join(' · '):'';
   c.innerHTML='<div class="cx-head"><img src="'+(it.ic||it.c.toDataURL())+'"><div><b>'+esc(nm(id))+'</b><span class="cx-badge">'+k+'</span>'+(it.wt&&typeof NOME_ARMA!='undefined'&&NOME_ARMA[it.wt]?'<span class="cx-badge">'+NOME_ARMA[it.wt]+'</span>':'')+(it.th?'<span class="cx-badge">2 mãos</span>':'')+'</div></div>'
    +dano+(cura?'<div class="cx-dano">'+cura+'</div>':'')
    +atributos(r.stats)+(it.use&&r.bonuses?atributos(r.bonuses).replace('Atributos','Bônus por '+(+r.bonusDuration||5)+' s'):'')
    +efeitos(r.effects,r.kind!=='weapon')
    +(habs.length?'<div class="cx-sub">Habilidades da arma</div><div class="cx-chips">'+habs.map(d=>'<span class="cx-chip"><img src="'+icoSkill(d)+'">'+link('skill',d.id,esc(d.name||d.id))+'</span>').join('')+'</div>':'')
    +basico+linha('Valor',(typeof precoVenda=='function'?precoVenda(id,50):0)+' ouro')
    +'<div class="cx-sub">Onde cai</div>'+((src[id]||[]).length?'<div class="cx-origem">'+src[id].join(' · ')+'</div>':'<div class="dim">Ainda não caiu de nenhum monstro.</div>');
   g.appendChild(c)});
  if(falta.length){const c=E('div','cx-card cx-oculto cx-faltam','<div class="cx-sils">'+falta.slice(0,24).map(id=>imgSombra(ITEMS[id].ic)).join('')+'</div><div class="dim">'+falta.length+' ainda não encontrado'+(falta.length>1?'s':'')+'. Derrote monstros, abra baús e visite as lojas.</div>');g.appendChild(c)}
  w.appendChild(g)});return w}

/* ---- Habilidades: por classe; só as liberadas aparecem por inteiro (sem ataques básicos) ---- */
function cardSkill(s,dono,extra){const k=E('div','cx-card cx-skill');k.dataset.ref='skill:'+(s.id||s.n);let ds='';try{ds=typeof s.d=='function'?s.d():s.d||''}catch(e){}
 const conj=typeof tempoConj=='function'?tempoConj(s):0,fx=(s.fxs||s.effects||[]);
 k.innerHTML='<div class="cx-head"><img src="'+s.ic+'"><div><b>'+esc(s.n)+'</b>'+(s.rank?'<span class="cx-badge">Rank '+s.rank+'</span>':'')+(s.cross?'<span class="cx-badge boss">Cross</span>':'')+(extra||'')+'</div></div>'
  +'<div class="cx-nums"><span><i>Mana</i>'+(s.mana||0)+'</span><span><i>Recarga</i>'+s.cd+' s</span><span><i>Conjuração</i>'+(conj>0?(+conj).toFixed(1)+' s':'instantânea')+'</span></div>'
  +'<div class="cx-desc">'+linkar(ds)+'</div>'+efeitos(fx,false);return k}
function tSkill(){const w=E('div');NOMES=null;
 Object.keys(CL).forEach(id=>{const c=CL[id];let ents=[];try{ents=skillEntries(id)}catch(e){}if(!ents.length)return;const rk=rankDe(id);
  w.appendChild(E('h4','',(iconeClasse(id)?'<img class="cx-hico" src="'+iconeClasse(id)+'">':'')+link('class',id,esc(c.n))+' <small>'+(rk?'rank '+rk+' · '+ents.filter(liberada).length+'/'+ents.length+' liberadas':'classe não aprendida')+'</small>'));
  const g=E('div','cx-grid');ents.forEach(s=>{if(liberada(s)){g.appendChild(cardSkill(s,id));return}
   const k=E('div','cx-card cx-oculto');k.dataset.ref='skill:'+s.id;k.innerHTML='<div class="cx-head">'+imgSombra(s.ic)+'<div><b>???</b><span class="cx-badge">Rank '+s.rank+'</span></div></div><div class="dim">'+(rk?'Libera no rank '+s.rank+' de '+esc(c.n)+'.':'Aprenda '+esc(c.n)+' com o Mestre na taverna.')+'</div>';g.appendChild(k)});
  w.appendChild(g)});
 // habilidades das armas já obtidas
 const vistas=new Set(),cards=[];Object.keys(WSK).forEach(id=>{if(id=='none'||!temItem(id))return;(WSK[id]||[]).forEach(s=>{if(!s||!s.n||vistas.has(s.id||s.n))return;vistas.add(s.id||s.n);cards.push(cardSkill(s,null,'<span class="cx-badge">'+link('item',id,esc(nm(id)))+'</span>'))})});
 if(cards.length){w.appendChild(E('h4','','Habilidades de arma <small>das armas que você já encontrou</small>'));const g=E('div','cx-grid');cards.forEach(c=>g.appendChild(c));w.appendChild(g)}
 return w}

/* ---- Passivas: com ícone; liberada = classe aprendida no rank (ou nível) pedido ---- */
function passivas(){const defs=[...(GAMEDATA.passives||[]),...(GAMEDATA.skills||[]).filter(s=>s.category=='passive')],out=[];
 for(const ps of defs){const usos=(GAMEDATA.classes||[]).flatMap(c=>(c.passives||[]).filter(r=>r.id==ps.id).map(r=>({cls:c.id,nome:c.name,rank:+r.rank||0,lv:+r.lv||1})));
  if(!usos.length)continue; // passiva que nenhuma classe usa não aparece
  const lib=usos.some(u=>rankDe(u.cls)>0&&(u.rank?rankDe(u.cls)>=u.rank:p.lvl>=u.lv));out.push({id:ps.id,n:ps.name||ps.id,d:ps,usos,liberada:lib})}
 return out}
function tPassive(){const g=E('div','cx-grid'),PL={hp:'Vida máx.',mp:'Mana máx.',dmg:'Dano',arm:'Defesa física',magicArm:'Defesa mágica',spd:'Velocidade',moveSpeed:'Movimento',attackSpeed:'Vel. de ataque',regenMp:'Regeneração de mana'},PA={F:'Força',A:'Agilidade',I:'Inteligência'};NOMES=null;
 passivas().forEach(ps=>{const d=ps.d,ic=window.ICONE_PASSIVA?ICONE_PASSIVA(d):icoSkill({icon:d.icon||'shield',c1:d.c1,c2:d.c2}),c=E('div','cx-card'+(ps.liberada?'':' cx-oculto'));c.dataset.ref='passive:'+ps.id;
  const req=ps.usos.map(u=>link('class',u.cls,esc(u.nome))+(u.rank?' rank '+u.rank:' nível '+u.lv)).join(' · ');
  if(!ps.liberada){c.innerHTML='<div class="cx-head">'+imgSombra(ic)+'<div><b>???</b><span class="cx-badge">Passiva</span></div></div><div class="dim">Libera com '+(req||'—')+'.</div>';g.appendChild(c);return}
  const stats=[...Object.keys(PL).filter(k=>+d[k]).map(k=>[PL[k],(+d[k]>0?'+':'')+d[k]+'%']),...Object.keys(PA).filter(k=>+d[k]).map(k=>[PA[k],(+d[k]>0?'+':'')+d[k]])];
  c.innerHTML='<div class="cx-head"><img src="'+ic+'"><div><b>'+esc(ps.n)+'</b><span class="cx-badge">Passiva</span></div></div><div class="cx-desc">'+linkar(esc(d.desc||''))+'</div>'
   +(stats.length?'<div class="cx-attrs">'+stats.map(([a,b])=>'<div><span>'+a+'</span><b class="pos">'+b+'</b></div>').join('')+'</div>':'')+'<div class="cx-sub">Classe</div><div class="cx-origem">'+req+'</div>';
  g.appendChild(c)});return g}

/* ---- Efeitos: duração, dano/potência, acúmulos, com o que aumenta e de onde vem ---- */
function tFx(){const g=E('div','cx-grid'),src={};const add=(id,html)=>(src[id]=src[id]||new Set()).add(html);
 (GAMEDATA.items||[]).forEach(it=>{if(!temItem(it.id))return;(it.effects||[]).forEach(f=>add(f.type,link('item',it.id,esc(it.name))+(f.target=='self'?' (em você)':'')))});
 mons().forEach(m=>{if(!mortes(m.id))return;((m.sk&&(m.sk.fxs||m.sk.effects))||[]).forEach(f=>add(f.type,link('mon',m.id,esc(m.t.name))))});
 Object.keys(CL).forEach(c=>{let es=[];try{es=skillEntries(c)}catch(e){}es.filter(liberada).forEach(s=>(s.fxs||s.effects||[]).forEach(f=>add(f.type,link('skill',s.id,esc(s.n)))))});
 Object.keys(FX_INFO).forEach(id=>{const f=FX_INFO[id],ac=typeof decai=='function'&&decai(id),k=f.kind,tick=+f.tick||1,tipo=f.dtype=='magic'?' mágico':f.dtype=='physical'?' físico':'';
  const pot=k=='dot'?(+f.power||0)+' de dano'+tipo+' a cada '+(tick==1?'segundo':tick+' s')+(ac?' por acúmulo':''):k=='slow'?'−'+(+f.power||0)+'% de '+(f.atk?'movimento e ataque':'movimento')+(ac?' por acúmulo':''):k=='hot'?(+f.power||0)+' de vida por segundo':k=='regenPct'?'−'+(+f.power||0)+'% de regeneração de vida':k=='armorPct'?'−'+(+f.power||0)+'% de defesa física':['vuln','dmgup','physup','magup','dmgdown','guard','haste'].includes(k)?'definida por quem aplica':'—';
  const dur=ac?'perde 1 acúmulo a cada '+(+f.dur||3)+' s':k=='stun'||k=='medo'?(f.dur?f.dur+' s (ou o que quem aplica definir)':'definida por quem aplica'):f.dur?'padrão '+f.dur+' s (quem aplica pode mudar)':'definida por quem aplica';
  const escala=f.attr&&f.attr!='none'&&+f.attrPct?'+'+f.attrPct+'% de '+(FXATTR[f.attr]||f.attr)+' de quem aplicou':(k=='dot'?'não aumenta':'');
  const x=f.maxFx&&FX_INFO[f.maxFx];
  const c=E('div','cx-card cx-efeito');c.dataset.ref='fx:'+id;
  c.innerHTML='<div class="cx-head"><img src="'+fxIcon(id)+'"><div><b>'+esc(f.n)+'</b><span class="cx-badge '+(f.good?'':'boss')+'">'+(f.good?'Positivo':'Negativo')+'</span></div></div>'
   +'<div class="dim">'+(KD[k]||'')+'</div>'
   +'<div class="cx-attrs cx-fxinfo">'+[['Dano / força',pot],['Duração',dur],['Dano aumenta com',escala],['Acúmulos',(f.stacks||1)>1?'até '+f.stacks:''],['No máximo',x?link('fx',f.maxFx,esc(x.n))+(f.maxEnquanto?' enquanto no máximo':''):'']].filter(r=>r[1]).map(([a,b])=>'<div><span>'+a+'</span><b>'+b+'</b></div>').join('')+'</div>'
   +'<div class="cx-sub">Vem de</div>'+(src[id]?'<div class="cx-origem">'+[...src[id]].join(' · ')+'</div>':'<div class="dim">Nada que você já conheça.</div>');
  g.appendChild(c)});return g}
function render(){box.replaceChildren();NOMES=null;const top=E('div','cx-top','<h3>Enciclopédia</h3>');
 [['mon','Monstros'],['item','Itens'],['skill','Habilidades'],['class','Classes'],['passive','Passivas'],['fx','Efeitos']].forEach(([k,l])=>{const b=E('button','cx-tab'+(tab==k?' on':''),l);b.onclick=()=>{tab=k;render()};top.appendChild(b)});
 const i=E('input');i.placeholder='Buscar…';i.value=q;i.oninput=()=>{q=i.value.toLowerCase();filt()};top.appendChild(i);const x=E('button','cx-x','✕');x.onclick=()=>toggle(false);top.appendChild(x);
 const body=E('div','cx-body');body.appendChild(tab=='mon'?tMon():tab=='item'?tItem():tab=='class'?tClass():tab=='passive'?tPassive():tab=='fx'?tFx():tSkill());box.append(top,body);filt()}
function filt(){box.querySelectorAll('.cx-card').forEach(c=>{if(c.classList.contains('cx-faltam'))return;c.style.display=!q||c.textContent.toLowerCase().includes(q)?'':'none'})}
const iconeClasse=id=>window.ICONE_CLASSE?ICONE_CLASSE(id):'';
function tClass(){const g=E('div','cx-grid');NOMES=null;Object.keys(CL).filter(id=>id!=='sty').forEach(id=>{const c=CL[id],h=HS[id]&&(HS[id].d||HS[id].s),img=c.sprite||h,sk=skillEntries(id),pl=c.perLevel||{},ps=[c.passive&&c.passive.n?c.passive.n+': '+(c.passive.d||''):'',...(c.plist||[]).map(r=>r.d.n+' (nv '+r.lv+')')].filter(Boolean);
 const cc=E('div','cx-card','<div class="cx-head">'+(img&&img.toDataURL?'<img src="'+img.toDataURL()+'">':'')+'<div><b>'+c.n+'</b><span class="cx-badge">Classe</span></div></div><div class="cx-row"><span>Atributos F/A/I</span><span>'+(c.F+3)+' / '+(c.A+3)+' / '+(c.I+3)+'</span></div><div class="cx-row"><span>Por nível</span><span>+'+(pl.F||0)+' / +'+(pl.A||0)+' / +'+(pl.I||0)+'</span></div><div class="cx-row"><span>Vel. de ataque</span><span>'+c.attackSpeed+'x</span></div><div class="cx-sub">Passivas</div>'+(ps.length?'<ul>'+ps.map(s=>'<li>'+linkar(esc(s))+'</li>').join('')+'</ul>':'<div class="dim">—</div>')
 // habilidades da classe: as liberadas viram link para a ficha (com ícone); as outras ficam "???" até o rank
 +'<div class="cx-sub">Habilidades</div><div class="cx-chips cx-chipsCol">'+sk.map(s=>liberada(s)?'<span class="cx-chip"><img src="'+s.ic+'">Rank '+s.rank+' · '+link('skill',s.id,esc(s.n))+(s.cross?' <i>cross</i>':'')+'</span>':'<span class="cx-chip cx-chipOff">Rank '+s.rank+' · ???</span>').join('')+'</div>');cc.dataset.ref='class:'+id;g.appendChild(cc)});return g}
window.codexRefresh=()=>{if(box.classList.contains('open'))render()};
// o painel de Classes (js/painel-classes.js) usa os mesmos links: palavras-chave clicáveis que abrem a ficha aqui
window.CODEX={linkar:html=>{NOMES=null;return linkar(html)},abrir:ref=>{toggle(true);irPara(ref)}};
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
/* posição da caixa de itens: mede o layout (caro) só 4× por segundo, não a cada quadro */
let tDrop=0;const hud3=hud;hud=function(){hud3();const t=performance.now();if(t-tDrop>250){tDrop=t;placeDrop()}};
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
