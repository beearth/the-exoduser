/* Character growth presentation; gameplay data stays in game.html. */
(function (global) {
  'use strict';
  const COSTS = [1, 1, 1, 2, 2, 2, 3, 3, 3, 5];
  const rankCost = rank => COSTS[rank] || 5;
  function statChange(value, max, points, amount) {
    if (!Number.isInteger(amount) || !amount || value + amount < 0 || value + amount > max || points - amount < 0) return null;
    return {value: value + amount, points: points - amount};
  }
  function passiveChange(value, max, points, amount) {
    if (amount !== 1 && amount !== -1) return null;
    const next = value + amount;
    const balance = points - (amount > 0 ? rankCost(value) : -rankCost(next));
    return next < 0 || next > max || balance < 0 ? null : {value: next, points: balance};
  }
  function refundTotals(stats, passives, grit) {
    const sp = Object.values(stats).reduce((sum, value) => sum + value, grit);
    const ap = Object.values(passives).reduce((sum, level) => {
      for (let rank = 0; rank < level; rank++) sum += rankCost(rank);
      return sum;
    }, 0);
    return {sp, ap};
  }
  const paths = [
    {id:'assault',ko:'맹공과 반격',en:'Assault',icon:'pAtk',color:'#d99172',keys:['pAtk','pMelee','pCharge','pParry','pRage'],hint:['근접 압박 · 기동 · 패링 · 분노','Melee pressure · mobility · parry · rage']},
    {id:'arcane',ko:'비전과 마력',en:'Arcana',icon:'pMagic',color:'#83b1c5',keys:['pMagic','pVital','pMRegen'],hint:['마법 연사 · 마나 유지 · 에너지 쉴드','Spell casting · mana sustain · energy shield']},
    {id:'precision',ko:'탄도와 약점',en:'Precision',icon:'pBow',color:'#c5b27c',keys:['pBow','pXbow','pPierce','pCrit','pCombo'],hint:['투사체 · 관통 · 치명타 · 연속 명중','Projectiles · pierce · critical hits · sustained hits']},
    {id:'erosion',ko:'침식과 사냥',en:'Hunt',icon:'pDot',color:'#a3b789',keys:['pDot','pAbund','pPred','pHunter'],hint:['지속 피해 · 선제 공격 · 마무리','Damage over time · opening strikes · execution']},
    {id:'survival',ko:'생존과 회복',en:'Survival',icon:'pGuard',color:'#91b8ac',keys:['pGuard','pRegen','pStamina','pFortify','pArmor'],hint:['피해 흡수 · 자원 순환 · 방어','Damage absorption · resource recovery · defense']},
    {id:'fate',ko:'인간과 악마',en:'Fate',icon:'pHuman',color:'#b3a2c0',keys:['pHuman','pDemon','pDrop','pMalice'],hint:['생존의 대가 · 부활 · 전리품','Survival tradeoffs · revival · rewards']}
  ];
  const pathFor = key => paths.find(path=>path.keys.includes(key));
  // Connections describe anatomy and navigation; they do not impose purchase prerequisites.
  const bodyJoints={origin:{x:500,y:470},spine:{x:500,y:320,parent:'origin'},neck:{x:500,y:180,parent:'spine'},leftShoulder:{x:405,y:235,parent:'spine'},rightShoulder:{x:595,y:235,parent:'spine'}};
  const bodyNodes=[
    ['int',430,115,'neck'],['lck',570,115,'neck'],['pMagic',500,40,'int',1],['pCrit',590,195,'lck'],['pCombo',410,195,'int'],
    ['str',355,265,'leftShoulder'],['pAtk',290,315,'str'],['pMelee',210,375,'pAtk',1],['pRage',145,445,'pMelee'],['pDot',225,475,'pMelee'],['pHunter',315,425,'pAtk'],
    ['dex',645,265,'rightShoulder'],['pBow',710,315,'dex'],['pXbow',790,375,'pBow'],['pPierce',855,445,'pXbow',1],['pParry',775,475,'pXbow'],
    ['grit',500,365,'origin'],['pArmor',435,290,'grit'],['pGuard',565,290,'grit'],['pFortify',500,235,'grit',1],['pHuman',435,420,'origin'],['pDemon',565,420,'origin'],
    ['pCharge',420,510,'origin'],['pPred',370,585,'pCharge'],['pAbund',320,680,'pPred',1],['pDrop',435,680,'pPred'],
    ['pVital',580,510,'origin'],['pMRegen',630,585,'pVital'],['pStamina',680,680,'pMRegen',1],['pRegen',565,680,'pMRegen'],['pMalice',640,755,'pStamina']
  ].map(([key,x,y,parent,major])=>({key,x,y,parent,major:!!major,stat:!key.startsWith('p')}));
  const bodyPoints=Object.fromEntries([...Object.entries(bodyJoints),...bodyNodes.map(n=>[n.key,n])]);
  function bodyRoute(key){
    const route=[];
    for(let point=key;bodyPoints[point];point=bodyPoints[point].parent)route.unshift(point);
    return route;
  }
  function mountBodyTree(root,t,format){
    const doc=root.ownerDocument,$=id=>root.querySelector('#'+id);
    const make=(tag,cls)=>{const n=doc.createElement(tag);n.className=cls;return n;};
    const svg=(tag,attrs={})=>{const n=doc.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);return n;};
    root.classList.add('growth-body-tree');
    const viewport=make('div','growth-tree-viewport');viewport.id='growthTreeViewport';
    const scene=make('div','growth-tree-scene');scene.id='growthTreeScene';
    const art=svg('svg',{viewBox:'0 0 1000 800','aria-hidden':'true',class:'growth-body-engraving'});
    const ornament=svg('g',{class:'growth-body-ornament',fill:'none'});
    for(const r of [275,305,365])ornament.append(svg('circle',{cx:500,cy:395,r}));
    for(let i=0;i<48;i++){const a=i*Math.PI/24;ornament.append(svg('line',{x1:500+Math.sin(a)*365,y1:395+Math.cos(a)*365,x2:500+Math.sin(a)*(i%4?369:377),y2:395+Math.cos(a)*(i%4?369:377)}));}
    ornament.append(svg('path',{d:'M500 10V790 M100 395H900 M270 115L730 675 M730 115L270 675'}));art.append(ornament);
    const anatomy=svg('g',{class:'growth-body-anatomy',fill:'none'});
    anatomy.append(svg('path',{class:'growth-body-outline',d:'M474 168 C455 153 459 112 463 87 C469 48 531 48 537 87 C541 112 545 153 526 168 L532 195 C551 213 597 205 621 227 C650 254 670 287 703 316 L801 395 L842 424 Q866 452 850 463 L821 445 Q846 479 829 483 L797 451 Q816 488 800 490 L773 449 Q789 481 775 484 L754 444 C721 419 690 395 660 374 L602 319 C609 358 589 415 575 454 L584 485 C604 526 610 554 625 590 L671 690 L698 731 Q704 747 680 751 L627 739 L602 700 C580 664 567 632 553 600 L510 536 Q500 524 490 536 L447 600 C433 632 420 664 398 700 L373 739 L320 751 Q296 747 302 731 L329 690 L375 590 C390 554 396 526 416 485 L425 454 C411 415 391 358 398 319 L340 374 C310 395 279 419 246 444 L225 484 Q211 481 227 449 L200 490 Q184 488 203 451 L171 483 Q154 479 179 445 L150 463 Q134 452 158 424 L199 395 L297 316 C330 287 350 254 379 227 C403 205 449 213 468 195 Z'}));
    anatomy.append(svg('path',{d:'M500 174V466 M466 204Q500 219 534 204 M415 245Q447 230 484 251 M585 245Q553 230 516 251 M421 310Q445 356 463 390 M579 310Q555 356 537 390 M458 406Q480 443 482 470 M542 406Q520 443 518 470 M444 488Q500 461 556 488 M433 514L397 611L354 714 M567 514L603 611L646 714 M394 262L308 341L211 425 M606 262L692 341L789 425 M480 104Q500 93 520 104 M477 128L489 124 M523 128L511 124 M485 151Q500 158 515 151'}));
    for(let i=0;i<5;i++){const y=267+i*20;anatomy.append(svg('path',{d:`M490 ${y}Q451 ${y-22} ${429+i*3} ${y-4}Q444 ${y+17} 486 ${y+17} M510 ${y}Q549 ${y-22} ${571-i*3} ${y-4}Q556 ${y+17} 514 ${y+17}`}));}
    art.append(anatomy);
    const links=svg('g',{class:'growth-tree-links',fill:'none'}),linkNodes=new Map();
    for(const [key,p] of Object.entries(bodyPoints))if(p.parent){const from=bodyPoints[p.parent];const line=svg('path',{d:`M${from.x} ${from.y}L${p.x} ${p.y}`,'data-connection':key});links.append(line);linkNodes.set(key,line);}
    const anchors=svg('g',{class:'growth-tree-anchors',fill:'none'});
    for(const node of bodyNodes)anchors.append(svg('circle',{cx:node.x,cy:node.y,r:node.major?29:21}));
    art.append(links,anchors);scene.append(art);
    const origin=make('span','growth-tree-origin');origin.textContent='✦';origin.setAttribute('aria-hidden','true');scene.append(origin);
    scene.append($('statGrid'),$('passiveGrid'));viewport.append(scene);
    const preview=make('aside','growth-node-preview');preview.id='growthNodePreview';preview.hidden=true;preview.setAttribute('role','tooltip');viewport.append(preview);
    const previewData=new Map();let previewControl=null;
    const hidePreview=()=>{preview.hidden=true;previewControl?.removeAttribute('aria-describedby');previewControl=null;for(const line of linkNodes.values())line.classList.remove('preview');};
    const showPreview=control=>{
      const key=control?.dataset.bodyNode,data=previewData.get(key);if(!data)return;
      previewControl?.removeAttribute('aria-describedby');previewControl=control;control.setAttribute('aria-describedby',preview.id);
      const route=new Set(bodyRoute(key));
      for(const [id,line] of linkNodes)line.classList.toggle('preview',route.has(id));
      const heading=make('strong','growth-preview-name');heading.textContent=data.label;
      const rank=make('span','growth-preview-rank');rank.textContent=data.value+(data.stat?' SP':' / '+data.max);
      const headingRow=make('div','growth-preview-heading');headingRow.append(heading,rank);
      const columns=make('div','growth-preview-columns');columns.textContent=t('현재','NOW')+' → '+t('다음','NEXT');
      const rows=data.rows.slice(0,2).map((r,i)=>{const row=make('div','growth-preview-row'),label=make('span',''),values=make('strong','');label.textContent=t(r.ko,r.en);values.textContent=format(r)+' → '+format(data.next[i]);row.append(label,values);return row;});
      preview.replaceChildren(headingRow,columns,...rows);preview.hidden=false;
      const v=viewport.getBoundingClientRect(),n=control.getBoundingClientRect(),w=preview.offsetWidth,h=preview.offsetHeight;
      let x=n.right-v.left+16;if(x+w>v.width-12)x=n.left-v.left-w-16;
      let y=n.top-v.top+n.height/2-h/2;
      x=Math.max(12,Math.min(v.width-w-12,x));y=Math.max(12,Math.min(v.height-h-12,y));
      // On narrow views place the preview above/below the target when neither side fits.
      if(x<n.right-v.left+6&&x+w>n.left-v.left-6){y=n.bottom-v.top+14;if(y+h>v.height-12)y=n.top-v.top-h-14;y=Math.max(12,Math.min(v.height-h-12,y));}
      preview.style.left=x+'px';preview.style.top=y+'px';
    };
    const toolbar=make('div','growth-tree-toolbar');
    toolbar.append($('statLeft').querySelector('.growth-section-heading'));
    const controls=make('div','growth-tree-zoom');controls.setAttribute('dir','ltr');
    let zoom=1,panX=0,panY=0,scale=1,width=0,height=0,drag=null,moved=false;
    const zoomButtons=[];
    const draw=()=>{
      hidePreview();
      const w=viewport.clientWidth,h=viewport.clientHeight;if(!w||!h)return;
      if(w!==width||h!==height){width=w;height=h;panX=panY=0;}
      scale=Math.min((w-12)/1000,(h-12)/800)*zoom;
      panX=Math.max(-500*scale,Math.min(500*scale,panX));panY=Math.max(-400*scale,Math.min(400*scale,panY));
      scene.style.transform=`translate(-50%,-50%) translate(${panX}px,${panY}px) scale(${scale})`;
      scene.style.setProperty('--tree-inverse',Math.min(2,1/scale));
      scene.style.setProperty('--node-scale',Math.max(1,Math.min(1.8,32/(48*scale))));
      viewport.classList.toggle('zoomed',zoom>1.05);zoomButtons[1].textContent=Math.round(zoom*100)+'%';
      zoomButtons[0].disabled=zoom<=1;zoomButtons[2].disabled=zoom>=2.5;
    };
    const setZoom=n=>{zoom=Math.max(1,Math.min(2.5,n));if(zoom===1)panX=panY=0;draw();};
    viewport.addEventListener('focusin',e=>{
      const control=e.target.closest('[data-body-node]');if(!control)return;
      const p=bodyPoints[control.dataset.bodyNode],x=width/2+panX+(p.x-500)*scale,y=height/2+panY+(p.y-400)*scale;
      panX+=Math.max(30,Math.min(width-30,x))-x;panY+=Math.max(30,Math.min(height-30,y))-y;draw();
      if(control.matches(':focus-visible'))showPreview(control);
    });
    viewport.addEventListener('pointerover',e=>{if(!drag)showPreview(e.target.closest('[data-body-node]'));});
    viewport.addEventListener('pointerout',e=>{if(e.target.closest('[data-body-node]')&&!e.relatedTarget?.closest?.('[data-body-node]'))hidePreview();});
    viewport.addEventListener('pointerleave',hidePreview);
    viewport.addEventListener('focusout',hidePreview);
    for(const [label,action] of [['−',()=>setZoom(zoom-.25)],['100%',()=>setZoom(1)],['+',()=>setZoom(zoom+.25)]]){const b=make('button','growth-zoom-button');b.type='button';b.textContent=label;b.onclick=action;controls.append(b);zoomButtons.push(b);}
    toolbar.append(controls);$('statRight').append(toolbar,viewport);
    const resize=new ResizeObserver(draw);resize.observe(viewport);
    viewport.addEventListener('wheel',e=>{if(e.ctrlKey||e.metaKey)return;e.preventDefault();setZoom(zoom+(e.deltaY<0?.15:-.15));},{passive:false});
    viewport.addEventListener('pointerdown',e=>{if(e.button!==0||e.target.closest('button'))return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,px:panX,py:panY};moved=false;viewport.setPointerCapture(e.pointerId);});
    viewport.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;moved ||= Math.abs(dx)+Math.abs(dy)>4;panX=drag.px+dx;panY=drag.py+dy;draw();});
    const end=e=>{if(drag?.id===e.pointerId){drag=null;if(viewport.hasPointerCapture(e.pointerId))viewport.releasePointerCapture(e.pointerId);}};
    viewport.addEventListener('pointerup',end);viewport.addEventListener('pointercancel',end);
    viewport.addEventListener('click',e=>{if(moved){e.stopPropagation();moved=false;}},true);
    viewport.addEventListener('keydown',e=>{
      if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;
      const current=e.target.closest('[data-body-node]');if(!current)return;
      const p=bodyPoints[current.dataset.bodyNode],dx=e.key==='ArrowLeft'?-1:e.key==='ArrowRight'?1:0,dy=e.key==='ArrowUp'?-1:e.key==='ArrowDown'?1:0;
      const candidates=[...scene.querySelectorAll('[data-body-node]')].filter(n=>n!==current&&!n.hidden);
      const next=candidates.map(n=>{const q=bodyPoints[n.dataset.bodyNode],x=q.x-p.x,y=q.y-p.y,along=x*dx+y*dy;return {n,score:along>0?Math.hypot(x,y)+Math.abs(x*dy-y*dx)*2:Infinity};}).sort((a,b)=>a.score-b.score)[0];
      e.preventDefault();e.stopPropagation();if(next&&Number.isFinite(next.score)){next.n.click();const target=scene.querySelector(`[data-body-node="${next.n.dataset.bodyNode}"]`);target?.focus({preventScroll:true});}
    });
    return {update(selected,state,live){
      previewData.clear();
      const route=new Set(bodyRoute(selected));
      for(const node of bodyNodes){
        const element=node.stat?$(`statGrid`).querySelector(`[data-stat="${node.key}"]`):$('passiveGrid').querySelector(`[data-passive="${node.key}"]`);
        if(!element)continue;
        element.style.left=node.x/10+'%';element.style.top=node.y/8+'%';element.classList.add('growth-body-node');element.classList.toggle('major',node.major);
        const control=node.stat?element.querySelector('.growth-stat-select'):element;control.dataset.bodyNode=node.key;
        if(node.stat)control.dataset.statLabel=node.key.toUpperCase();
        const value=node.stat?(node.key==='grit'?state.grit:state.stats[node.key]||0):state.passives[node.key]||0;
        const before=node.stat?(node.key==='grit'?live.grit:live.stats[node.key]||0):live.passives[node.key]||0;
        if(!node.stat)element.querySelector('.growth-card-rank').dataset.level=value;
        element.classList.toggle('learned',value>0);element.classList.toggle('selected',selected===node.key);element.classList.toggle('pending',value!==before);
        const label=node.stat?control.textContent:element.querySelector('.growth-card-name').textContent;
        element.dataset.level=value;
        const max=Number(element.dataset.max),rows=(node.stat?statEffects:passiveEffects)(node.key,value),next=(node.stat?statEffects:passiveEffects)(node.key,Math.min(max,value+1));
        previewData.set(node.key,{label,value,max,stat:node.stat,rows,next});
        control.title=label+' · '+value+(node.stat?' SP':' Lv.');control.setAttribute('aria-label',control.title);
      }
      for(const [key,line] of linkNodes){const n=bodyPoints[key],value=n.stat?(key==='grit'?state.grit:state.stats[key]||0):state.passives[key]||0;line.classList.toggle('route',route.has(key));line.classList.toggle('allocated',value>0);}
      zoomButtons[1].title=t('전체','All');draw();
    }};
  }
  const row=(ko,en,per,unit='%',base=0,cap=Infinity)=>({ko,en,per,unit,base,cap});
  const effects = {
    pAtk:[row('공통 피해 기여','Shared damage contribution',10),row('ST 비용 감소','ST cost reduction',4,'%',0,40)],
    pCharge:[row('사슬 사거리','Chain range',2),row('기동게이지 회복','Mobility gauge recovery',3)],
    pParry:[row('카운터 피해','Counter damage',50),row('E 공격속도','E attack speed',10),row('무지개탄 피해 감소','Rainbow damage reduction',10,'%',0,50)],
    pMagic:[row('마법 피해','Magic damage',10),row('MP 비용 감소','MP cost reduction',4,'%',0,60),row('시전속도 배율','Cast speed multiplier',.08,'×',2)],
    pBow:[row('투사체 피해','Projectile damage',15),row('석궁 공격속도','Crossbow attack speed',10),row('석궁 사거리','Crossbow range',8),row('석궁 ST 비용 감소','Crossbow ST cost reduction',4,'%',0,40)],
    pGuard:[row('보호막 흡수율','Shield absorption',2,'%',30,50)],
    pRegen:[row('HP / ST 재생','HP / ST regeneration',3),row('물약 쿨다운 감소','Potion cooldown reduction',3,'%',0,30),row('패링 회복량','Parry recovery',20)],
    pCrit:[row('치명타 확률','Critical chance',1.5),row('치명타 피해','Critical damage',8)],
    pDrop:[row('아이템 드롭률','Item drop rate',8)],
    pPierce:[row('기본 관통 확률','Base pierce chance',5,'%',0,95),row('기본 관통 횟수','Base pierce count',1,''),row('관통 후 피해 유지','Damage retained after piercing',3,'%',85,100)],
    pMRegen:[row('MP / 쉴드 재생','MP / shield regeneration',3),row('쉴드 쿨다운 감소','Shield cooldown reduction',3,'%',0,30)],
    pXbow:[row('자동쇠뇌 피해','Auto crossbow damage',5),row('자동쇠뇌 공격속도','Auto crossbow attack speed',5)],
    pMelee:[row('근접 피해','Melee damage',15),row('기본 HP 배율 기여','Base HP contribution',3),row('물리 ST 비용 감소','Physical ST cost reduction',5,'%',0,50)],
    pCombo:[row('약점노출 최대 중첩','Maximum weakness stacks',5,''),row('중첩당 받는 피해 증가','Damage taken per stack',0,'%',3)],
    pAbund:[row('적 HP 70% 이상 피해','Damage vs enemies at 70%+ HP',20),row('상시 회복력','Unconditional recovery',5)],
    pPred:[row('적 HP 30% 이하 피해','Damage vs enemies at 30%- HP',20),row('내 HP 30% 이하 회복','Recovery at 30%- HP',10),row('내 HP 30% 이하 이동속도','Move speed at 30%- HP',5)],
    pDot:[row('지속 피해','Damage over time',15),row('지속 시간','Duration',10),row('축적률','Buildup',5)],
    pVital:[row('최대 MP','Maximum MP',50,''),row('MP 재생','MP regeneration',1)],
    pStamina:[row('최대 ST','Maximum ST',50,''),row('ST 재생','ST regeneration',1)],
    pMalice:[row('악의 획득량','Malice gained',8)],
    pFortify:[row('최대 HP','Maximum HP',300,'')],
    pArmor:[row('물리 방어','Physical defense',20,'')],
    pHunter:[row('정예 / 보스 추가 피해','Elite / boss bonus damage',10)],
    pHuman:[row('부활 확률 감소','Revival chance reduction',10),row('공통 피해 기여','Shared damage contribution',5),row('최대 HP / MP / ST 각각','Maximum HP / MP / ST each',100,'')],
    pDemon:[row('부활 확률','Revival chance',2),row('기본 부활 쿨다운','Base revival cooldown',-30,'s',600)],
    pRage:[row('분노 최대치','Maximum rage',10),row('분노 피해 계수','Rage damage scaling',10)]
  };
  const notes={
    pAtk:['공통 합연산 피해 묶음에 더해집니다. 최종 피해 배율은 다른 패시브·장비와 함께 계산됩니다.','Added to the shared additive damage pool; final damage also depends on other passives and gear.'],
    pParry:['무지개탄 감소는 Lv5에서 상한에 도달합니다. 무지개탄 패링은 Q만 가능합니다.','Rainbow damage reduction caps at rank 5. Only Q can parry rainbow shots.'],
    pMagic:['시전속도 기본 배율은 ×2입니다. MP 비용 감소는 장비를 포함해 최대 60%입니다.','Base cast speed is ×2. MP cost reduction caps at 60% including gear.'],
    pGuard:['지속 피해에는 흡수율의 절반이 적용됩니다.','Damage over time uses half the absorption rate.'],
    pPierce:['기본 투사체 기준입니다. 일부 스킬은 자체 관통 공식을 사용합니다. 장비 포함 기본 관통 확률 상한 95%.','Base projectile values. Some skills use their own pierce rules. Base chance caps at 95% including gear.'],
    pCombo:['직접 명중마다 중첩. 빔은 4틱마다 1중첩. 초당 20% 감소, 5초 미명중 시 초기화. DOT·장판 제외.','Stacks on direct hits; beams add one per four ticks. Decays 20% per second, resets after five seconds without hits. Excludes DoT and ground effects.'],
    pAbund:['추가 피해는 적의 HP 조건입니다. 회복력 증가는 항상 적용됩니다.','Damage bonus checks enemy HP. Recovery is always active.'],
    pHuman:['성장과 자원을 얻는 대신 부활 확률을 잃습니다. 악마성과 함께 투자하면 부활 효과가 상쇄될 수 있습니다.','Gain damage and resources at the cost of revival chance. Humanity can offset Demon investment.'],
    pDemon:['부활 성공 시 HP·MP·ST를 전부 회복합니다. 실제 확률은 레벨·장비·인간성을 함께 계산하며 0~100%입니다. 기본 쿨다운 최저 100초.','Successful revival restores all HP, MP and ST. Actual chance includes level, gear and Humanity, clamped to 0–100%. Base cooldown has a 100-second floor.']
  };
  function passiveEffects(key,rank){
    const level=Math.max(0,Number(rank)||0);
    return (effects[key]||[]).map(effect=>({...effect,value:Math.round(Math.max(key==='pDemon'&&effect.unit==='s'?100:-Infinity,Math.min(effect.cap,effect.base+effect.per*level))*10000)/10000}));
  }
  const attributeEffects={
    str:[row('물리 공격력','Physical attack',1,''),row('기본 최대 HP','Base maximum HP',5,''),row('HP 재생','HP regeneration',.12,'/s')],
    dex:[row('석궁 공격력','Crossbow attack',1,''),row('공격속도','Attack speed',.05),row('최대 ST','Maximum ST',2,''),row('ST 재생','ST regeneration',.3,'/s')],
    int:[row('마법 공격력','Magic attack',1,''),row('최대 MP','Maximum MP',2,''),row('MP 재생','MP regeneration',.3,'/s'),row('최대 에너지 쉴드','Maximum energy shield',5,'')],
    lck:[row('치명타 확률','Critical chance',.025),row('치명타 피해','Critical damage',.2),row('아이템 드롭률','Item drop rate',.15)],
    grit:[row('최대 HP / MP / ST 각각','Maximum HP / MP / ST each',1,''),row('물리 / 속성 방어 기여','DEF / eDEF contribution',.5,'')]
  };
  function statEffects(key,points){return (attributeEffects[key]||[]).map(r=>({...r,value:Math.round(r.per*Math.max(0,Number(points)||0)*10000)/10000}));}
  function createPlan(state){
    const base={stats:{...state.stats},passives:{...state.passives},grit:state.grit||0};
    return {base,stats:{...base.stats},passives:{...base.passives},grit:base.grit};
  }
  const sameValues=(a,b)=>Object.keys(a).length===Object.keys(b).length&&Object.keys(a).every(key=>a[key]===b[key]);
  function evaluatePlan(plan,live,caps,defs){
    if(!plan||!sameValues(plan.base.stats,live.stats)||!sameValues(plan.base.passives,live.passives)||plan.base.grit!==(live.grit||0))return null;
    if(!sameValues(Object.fromEntries(Object.keys(plan.stats).map(k=>[k,true])),Object.fromEntries(Object.keys(live.stats).map(k=>[k,true])))||
       !sameValues(Object.fromEntries(Object.keys(plan.passives).map(k=>[k,true])),Object.fromEntries(Object.keys(live.passives).map(k=>[k,true]))))return null;
    const valid=n=>Number.isSafeInteger(n)&&n>=0;
    if(!valid(plan.grit)||!valid(live.sp)||!valid(live.ap))return null;
    for(const [key,value] of Object.entries(plan.stats))if(!valid(value)||!(key in caps)||value>Math.max(caps[key],live.stats[key]))return null;
    const limits=Object.fromEntries(defs.map(d=>[d.key,d.max]));
    for(const [key,value] of Object.entries(plan.passives))if(!valid(value)||value>Math.max(limits[key]??0,live.passives[key]))return null;
    const before=refundTotals(live.stats,live.passives,live.grit||0),after=refundTotals(plan.stats,plan.passives,plan.grit);
    const sp=live.sp+before.sp-after.sp,ap=live.ap+before.ap-after.ap;
    if(!valid(sp)||!valid(ap))return null;
    const changes=Object.keys(plan.stats).filter(k=>plan.stats[k]!==live.stats[k]).length+Object.keys(plan.passives).filter(k=>plan.passives[k]!==live.passives[k]).length+Number(plan.grit!==(live.grit||0));
    return {...live,stats:{...plan.stats},passives:{...plan.passives},grit:plan.grit,sp,ap,changes,spentSP:live.sp-sp,spentAP:live.ap-ap};
  }
  function mount(api) {
    const root=api.root,doc=root.ownerDocument,t=api.text;
    const $=id=>root.querySelector('#'+id);
    const el=(tag,cls,text)=>{const n=doc.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
    const set=(id,value)=>{$(id).textContent=value;};
    const name=d=>api.strip(t(d.name,d.nameEn||d.name));
    const icon=(key,size=24)=>{const n=el('span','growth-glyph');n.innerHTML=api.icon(key,'currentColor',size);n.setAttribute('aria-hidden','true');return n;};
    const button=(label,cls,action,focus)=>{const n=el('button',cls,label);n.type='button';n.onclick=action;if(focus)n.dataset.focus=focus;return n;};
    const format=r=>r.unit==='×'?'×'+r.value.toFixed(2):r.value.toLocaleString(undefined,{maximumFractionDigits:4})+(r.unit==='s'?t('초','s'):r.unit);
    let selected=api.passiveDefs[0].key,selectedStat=null,path='all',filter='all',amount=1,plan=null;
    const search=$('growthSearch');
    const pathNav=el('div','growth-paths');pathNav.id='growthPaths';
    search.before(pathNav);
    const pathHint=el('p','growth-path-hint');pathNav.after(pathHint);
    const apply=button('', 'growth-apply',()=>{if(plan&&api.applyPlan(plan)){plan=createPlan(api.state());render();}},'apply');apply.id='growthApply';
    const cancel=button('', 'growth-cancel',()=>{plan=createPlan(api.state());render();},'cancel');cancel.id='growthCancel';
    const footer=$('statClose').parentElement;footer.insertBefore(cancel,$('statClose'));footer.insertBefore(apply,$('statClose'));
    const planNotice=el('div','growth-plan-notice');planNotice.setAttribute('aria-live','polite');$('growthUpgradeNote').after(planNotice);
    const liveLabel=el('p','growth-live-label'),resources=el('div','growth-resources');
    resources.append(liveLabel,$('growthMetrics'));root.querySelector('.growth-header').append(resources);
    root.classList.add('growth-remaster');
    const bodyTree=mountBodyTree(root,t,format);
    const draftList=el('section','growth-draft-list');draftList.id='growthDraftList';draftList.hidden=true;
    root.querySelector('.growth-actions').before(draftList);
    new MutationObserver(()=>{if(!root.classList.contains('on'))plan=null;}).observe(root,{attributes:true,attributeFilter:['class']});
    search.addEventListener('input',render);
    for(const event of ['keydown','keyup'])root.addEventListener(event,e=>{
      if(e.key==='Tab'||(e.target.closest('button')&&(e.key===' '||e.key==='Enter')))e.stopPropagation();
    });
    for(const event of ['keydown','keyup'])search.addEventListener(event,e=>{e.stopPropagation();if(event==='keydown'&&e.key==='Escape'){e.preventDefault();search.blur();}});
    $('statResetBtn').onclick=()=>{
      if(!plan)plan=createPlan(api.state());
      for(const k in plan.stats)plan.stats[k]=0;
      for(const k in plan.passives)plan.passives[k]=0;
      plan.grit=0;render();
    };
    function change(type,key,n){
      selectedStat=type==='stat'?key:null;
      const live=api.state(),current=evaluatePlan(plan,live,api.caps,api.passiveDefs);
      if(!current){plan=createPlan(live);render();return;}
      const draft={...plan,stats:{...plan.stats},passives:{...plan.passives}};
      if(type==='passive')draft.passives[key]+=n;
      else if(key==='grit')draft.grit+=n;
      else draft.stats[key]+=n;
      if(evaluatePlan(draft,live,api.caps,api.passiveDefs))plan=draft;
      render();
    }
    function render(){
      const live=api.state(),focus=doc.activeElement?.dataset.focus;
      const scroll=[$('statGrid').scrollTop,$('passiveGrid').scrollTop,$('growthDetail').scrollTop];
      if(!plan||!evaluatePlan(plan,live,api.caps,api.passiveDefs))plan=createPlan(live);
      const state=evaluatePlan(plan,live,api.caps,api.passiveDefs)||live;
      const changed=state.changes||0;
      const activePath=paths.find(p=>p.id===path);
      root.style.setProperty('--path-accent',activePath?.color||'#d99172');
      set('growthKicker',t('EXODUSER · 캐릭터 성장','EXODUSER / CHARACTER'));
      set('growthTitle',t('성장의 각인','Sigils of Ascension'));
      set('growthSubtitle',t('힘을 벼리고, 당신의 길을 새기세요.','Temper your strength. Inscribe your path.'));
      set('growthSPLabel',t('계획 후 SP','SP AFTER PLAN'));set('spRemain',state.sp);
      set('growthAPLabel',t('계획 후 AP','AP AFTER PLAN'));set('apRemain',state.ap);
      set('growthAttributesTitle',t('기본 능력치','ATTRIBUTES'));
      set('growthAttributesNote',t('투자량 · 1포인트 = 1 SP','Allocated points · 1 point = 1 SP'));
      set('growthPassivesTitle',t('전투의 길','COMBAT PATHS'));
      set('growthDetailLabel',t('패시브 분석','PASSIVE INSIGHT'));
      set('growthFooterNote',changed?t('{n}개 변경 대기 · 적용 전에는 저장되지 않습니다.','{n} pending changes · Not saved until applied.',{n:changed}):t('자유롭게 배분하고, 적용하세요. 창을 닫으면 미적용 계획은 취소됩니다.','Plan freely, then apply. Closing discards unapplied changes.'));
      set('statResetBtn',t('전체 환불 계획','Plan full refund'));
      set('statClose',t('닫기 [J]','Close [J]'));
      set('smToggleBtn',t('현재 전투 능력치 ↗','Current combat stats ↗'));
      set('growthSummaryClose',t('닫기','Close'));set('growthSummaryTitle',t('현재 전투 능력치','Current combat stats'));
      apply.textContent=t('변경 적용','Apply changes');apply.disabled=!changed;
      cancel.textContent=t('계획 취소','Discard plan');cancel.disabled=!changed;
      liveLabel.textContent=t('현재 적용된 자원','LIVE RESOURCES');
      search.placeholder=t('이름 · 효과 · 영문명 검색','Search name or effect');search.setAttribute('aria-label',search.placeholder);
      const metrics=doc.createDocumentFragment();
      for(const [label,value] of [['HP',live.hp],['ST',live.st],['MP',live.mp]]){const metric=el('div','growth-metric');metric.append(el('span','',label),el('strong','',Number(value||0).toLocaleString()));metrics.append(metric);}
      $('growthMetrics').replaceChildren(metrics);
      $('growthAmount').replaceChildren(...[1,10].map(n=>{const b=button('×'+n,'growth-amount-btn',()=>{amount=n;render();},'amount-'+n);b.setAttribute('aria-pressed',String(amount===n));return b;}));
      const stats=doc.createDocumentFragment();
      const query=search.value.trim().toLocaleLowerCase();
      const defs=[...api.statDefs,{key:'grit',name:'근성 (GRIT)',nameEn:'GRIT',desc:'HP / MP / ST 각각 +1 · 물리/속성 방어 +0.5',descEn:'HP / MP / ST +1 each · DEF / eDEF +0.5'}];
      for(const def of defs){
        const value=def.key==='grit'?state.grit:state.stats[def.key]||0;
        const current=def.key==='grit'?live.grit:live.stats[def.key]||0;
        const statPath={str:'assault',dex:'precision',int:'arcane',lck:'fate',grit:'survival'}[def.key];
        if(!statPath||(path!=='all'&&path!==statPath)||(filter==='learned'&&value===0)||(filter==='planned'&&value===current))continue;
        if(query&&![name(def),def.name,def.nameEn,t(def.desc,def.descEn),def.desc,def.descEn,def.key,...statEffects(def.key,1).flatMap(r=>[t(r.ko,r.en),r.ko,r.en])].join(' ').toLocaleLowerCase().includes(query))continue;
        const max=def.key==='grit'?Infinity:api.caps[def.key];
        const item=el('article','growth-stat');item.dataset.stat=def.key;item.dataset.max=max;
        const head=el('div','growth-stat-head');
        const selectStat=button(name(def),'growth-stat-select',()=>{selectedStat=def.key;$('growthDetail').scrollTop=0;render();},'inspect-'+def.key);
        selectStat.setAttribute('aria-pressed',String(selectedStat===def.key));
        head.append(icon(def.key,23),selectStat,el('strong','growth-stat-value',value.toLocaleString()));
        const controls=el('div','growth-stat-controls');
        for(const direction of [-1,1]){const n=direction*amount,b=button((n>0?'+':'−')+amount,'growth-step',()=>change('stat',def.key,n),def.key+'-'+direction);b.disabled=!statChange(value,Math.max(max,current),state.sp,n);b.setAttribute('aria-label',name(def)+' '+(n>0?t('계획에 추가','Add to plan'):t('환불 계획','Plan refund'))+' '+amount);controls.append(b);}
        const delta=el('span','growth-stat-delta',value===current?'':`${current} → ${value}`);
        item.append(head,el('p','growth-stat-desc',statEffects(def.key,1).slice(0,2).map(r=>t(r.ko,r.en)+' +'+format(r)).join(' · ')),controls,delta);
        item.title=t('투자 상한','Allocation cap')+': '+(max===Infinity?t('무제한','Uncapped'):max);
        item.classList.toggle('pending',value!==current);stats.append(item);
      }
      $('statGrid').replaceChildren(stats);
      pathNav.replaceChildren(...[{id:'all',ko:'전체',en:'All',icon:null},...paths].map((p,i)=>{
        const b=button(undefined,'growth-path',()=>{path=p.id;selectedStat=null;if(p.keys&&!p.keys.includes(selected))selected=p.keys[0];$('passiveGrid').scrollTop=0;render();},'path-'+p.id);
        b.dataset.path=p.id;b.setAttribute('aria-pressed',String(path===p.id));
        if(p.color)b.style.setProperty('--school-color',p.color);
        if(p.icon)b.append(icon(p.icon,28));
        else {const star=el('span','growth-path-star','✦');star.setAttribute('aria-hidden','true');b.append(star);}
        const numeral=el('span','growth-path-numeral',['','I','II','III','IV','V','VI'][i]);numeral.setAttribute('aria-hidden','true');b.append(numeral);
        const keys=p.keys?[...p.keys,...Object.entries({str:'assault',dex:'precision',int:'arcane',lck:'fate',grit:'survival'}).filter(([,id])=>id===p.id).map(([key])=>key)]:bodyNodes.map(n=>n.key);
        const learned=keys.filter(key=>(key==='grit'?state.grit:key.startsWith('p')?state.passives[key]:state.stats[key])>0).length;
        b.append(el('span','growth-path-label',t(p.ko,p.en)),el('span','growth-path-count',learned+' / '+keys.length));return b;
      }));
      pathHint.textContent=activePath?t(...activePath.hint):t('6개의 길 · 서로 조합 가능한 26개 패시브','6 paths · 26 freely combinable passives');
      const filters=[['all','전체','All'],['learned','습득','Learned'],['planned','변경 중','Pending']];
      $('growthFilters').replaceChildren(...filters.map(([key,ko,en])=>{const b=button(t(ko,en),'growth-filter',()=>{filter=key;render();},'filter-'+key);b.setAttribute('aria-pressed',String(filter===key));return b;}));
      const visible=api.passiveDefs.filter(d=>(!activePath||activePath.keys.includes(d.key))&&(filter==='all'||filter==='learned'&&state.passives[d.key]>0||filter==='planned'&&state.passives[d.key]!==live.passives[d.key])&&(!query||[name(d),d.name,d.nameEn,t(d.desc,d.descEn),d.desc,d.descEn,d.key,...passiveEffects(d.key,0).flatMap(r=>[t(r.ko,r.en),r.ko,r.en])].join(' ').toLocaleLowerCase().includes(query)));
      set('growthCount',`${visible.length+$('statGrid').children.length} / ${api.passiveDefs.length+defs.filter(d=>['str','dex','int','lck','grit'].includes(d.key)).length}`);
      const cards=doc.createDocumentFragment();
      for(const def of visible){
        const value=state.passives[def.key]||0,current=live.passives[def.key]||0,school=pathFor(def.key);
        const card=button(undefined,'growth-passive',()=>{selected=def.key;selectedStat=null;$('growthDetail').scrollTop=0;render();},'passive-'+def.key);
        card.dataset.passive=def.key;card.dataset.max=def.max;card.setAttribute('aria-pressed',String(!selectedStat&&selected===def.key));card.style.setProperty('--school-color',school?.color||'#c5b27c');
        card.classList.toggle('pending',value!==current);card.classList.toggle('learned',value>0);card.classList.toggle('maxed',value>=def.max);
        const top=el('span','growth-card-top');top.append(icon(def.key,26),el('strong','growth-card-name',name(def)));
        const main=passiveEffects(def.key,value)[0];
        const bottom=el('span','growth-card-bottom');bottom.append(el('span','growth-card-rank',value===current?`Lv. ${value} / ${def.max}`:`${current} → ${value} / ${def.max}`),el('span','growth-card-cost',value>=def.max?'MAX':`${rankCost(value)} AP`));
        const bar=el('span','growth-card-bar'),fill=el('span');fill.style.width=Math.min(100,value/def.max*100)+'%';bar.append(fill);
        card.append(top,el('span','growth-card-type',school?t(school.ko,school.en):''),el('span','growth-card-desc',main?t(main.ko,main.en)+' '+format(main):t(def.desc,def.descEn)),bottom,bar);
        cards.append(card);
      }
      if(!visible.length&&!$('statGrid').children.length)cards.append(el('p','growth-empty',t('일치하는 패시브가 없습니다. 검색 또는 필터를 바꿔보세요.','No matching passives. Try another search or filter.')));
      $('passiveGrid').replaceChildren(cards);
      const def=api.passiveDefs.find(d=>d.key===selected)||api.passiveDefs[0],value=state.passives[def.key]||0,current=live.passives[def.key]||0,school=pathFor(def.key);
      const detail=doc.createDocumentFragment(),hero=el('div','growth-detail-hero');
      hero.style.setProperty('--school-color',school?.color||'#c5b27c');hero.append(icon(def.key,52),el('span','growth-detail-category',school?t(school.ko,school.en):''));
      detail.append(hero,el('h2','growth-detail-name',name(def)));
      const ranks=el('div','growth-rank-transition');ranks.append(el('span','',t('투자 레벨','ALLOCATED RANK')),el('strong','',String(value)),el('span','growth-rank-arrow','/ '+def.max));detail.append(ranks);
      const pips=el('div','growth-rank-pips');for(let i=0;i<def.max;i++)pips.append(el('span',i<value?'filled':''));pips.setAttribute('aria-label',`${value} / ${def.max}`);detail.append(pips);
      const pending=value!==current,target=pending?value:Math.min(value+1,def.max),from=pending?current:value;
      const table=el('div','growth-effects-table'),labels=el('div','growth-effect-row growth-effect-columns');
      labels.append(el('span','',t('패시브 기여','PASSIVE CONTRIBUTION')),el('span','',t('현재','NOW')),el('span','',pending?t('계획','PLAN'):t('다음','NEXT')));table.append(labels);
      const rows=passiveEffects(def.key,from),next=passiveEffects(def.key,target);
      rows.forEach((r,i)=>{const line=el('div','growth-effect-row');line.append(el('span','',t(r.ko,r.en)),el('span','growth-effect-before',format(r)),el('strong',r.value===next[i].value?'growth-effect-capped':'growth-effect-after',format(next[i])));table.append(line);});
      detail.append(table);
      const note=notes[def.key]||['다른 패시브와 함께 투자할 수 있습니다. 표는 이 패시브의 기여이며, 최종 전투 능력치는 장비·조건에 따라 달라집니다.','Combine with other passives. These are this passive’s contributions; final combat stats depend on gear and conditions.'];
      detail.append(el('p','growth-effect',t(...note)));
      if(def.key==='pHuman'&&(state.passives.pDemon||0)>0||def.key==='pDemon'&&(state.passives.pHuman||0)>0)detail.append(el('p','growth-tradeoff',t('인간성과 악마성에 함께 투자 중입니다. 부활 확률을 확인하세요.','Humanity and Demon are both allocated. Check your revival chance.')));
      $('growthDetail').replaceChildren(detail);
      const maxed=value>=def.max,cost=rankCost(value),upgrade=$('growthUpgrade'),refund=$('growthRefund');
      upgrade.disabled=maxed||state.ap<cost;upgrade.textContent=maxed?t('최대 레벨','Maximum rank'):t('계획에 추가 · {n} AP','Add to plan · {n} AP',{n:cost});upgrade.onclick=()=>change('passive',def.key,1);
      refund.disabled=value<1;refund.textContent=t('1레벨 환불 계획','Plan rank refund')+(value?' · +'+rankCost(value-1)+' AP':'');refund.onclick=()=>change('passive',def.key,-1);
      set('growthUpgradeNote',maxed?t('레벨 상한에 도달했습니다.','Rank cap reached.'):state.ap<cost?t('AP {n} 부족','Need {n} more AP',{n:cost-state.ap}):t('추가 후 계획 잔여 AP {n}','{n} AP left after adding',{n:state.ap-cost}));
      planNotice.textContent=changed?t('변경 {n}개 · 하단에서 적용','{n} changes · Apply below',{n:changed}):t('탐색과 계획은 포인트를 소모하지 않습니다.','Browsing and planning do not spend points.');
      planNotice.classList.toggle('pending',!!changed);
      if(selectedStat){
        const stat=defs.find(d=>d.key===selectedStat),key=selectedStat;
        const value=key==='grit'?state.grit:state.stats[key]||0,current=key==='grit'?live.grit:live.stats[key]||0;
        const max=key==='grit'?Infinity:api.caps[key],pending=value!==current;
        const target=pending?value:Math.min(max,value+amount),from=pending?current:value;
        set('growthDetailLabel',t('능력치 분석','ATTRIBUTE INSIGHT'));
        const detail=doc.createDocumentFragment(),hero=el('div','growth-detail-hero');
        hero.append(icon(key,52),el('span','growth-detail-category',t('기본 능력치','ATTRIBUTE')));
        detail.append(hero,el('h2','growth-detail-name',name(stat)));
        const rank=el('div','growth-rank-transition');rank.append(el('span','',t('직접 투자량','ALLOCATED POINTS')),el('strong','',String(value)),el('span','growth-rank-arrow',max===Infinity?'∞':'/ '+max));detail.append(rank);
        const table=el('div','growth-effects-table'),labels=el('div','growth-effect-row growth-effect-columns');
        labels.append(el('span','',t('투자분의 기본 기여','BASE CONTRIBUTION')),el('span','',t('현재','NOW')),el('span','',pending?t('계획','PLAN'):'+'+amount));table.append(labels);
        const rows=statEffects(key,from),next=statEffects(key,target);
        rows.forEach((r,i)=>{const line=el('div','growth-effect-row');line.append(el('span','',t(r.ko,r.en)),el('span','growth-effect-before',format(r)),el('strong','growth-effect-after',format(next[i])));table.append(line);});
        detail.append(table,el('p','growth-effect',t('직접 투자한 능력치의 기본 기여입니다. 레벨·장비·패시브 배율은 전투 능력치에 합산됩니다. 재생은 초당 기준이며, 근성 방어는 전체 근성을 합산한 뒤 내림합니다.','Base contribution from allocated points. Level, gear and passive multipliers are included in combat stats. Regeneration is per second; GRIT defense rounds down after total GRIT is summed.')));
        $('growthDetail').replaceChildren(detail);
        upgrade.disabled=!statChange(value,Math.max(max,current),state.sp,amount);upgrade.textContent=t('계획에 추가 · {n} SP','Add to plan · {n} SP',{n:amount});upgrade.onclick=()=>change('stat',key,amount);
        refund.disabled=value<amount;refund.textContent=t('{n}포인트 환불 계획','Plan {n}-point refund',{n:amount});refund.onclick=()=>change('stat',key,-amount);
        set('growthUpgradeNote',upgrade.disabled?t('SP 또는 투자 상한을 확인하세요.','Check SP and the allocation cap.'):t('추가 후 계획 잔여 SP {n}','{n} SP left after adding',{n:state.sp-amount}));
      }
      const entries=[];
      for(const d of [...defs.filter(d=>['str','dex','int','lck','grit'].includes(d.key)),...api.passiveDefs]){
        const stat=!d.key.startsWith('p'),before=d.key==='grit'?live.grit:stat?live.stats[d.key]||0:live.passives[d.key]||0,after=d.key==='grit'?state.grit:stat?state.stats[d.key]||0:state.passives[d.key]||0;
        if(before===after)continue;
        const b=button(undefined,'growth-draft-entry',()=>{path='all';filter='all';search.value='';selectedStat=stat?d.key:null;if(!stat)selected=d.key;render();},'draft-'+d.key);
        b.dataset.draftKey=d.key;b.append(el('span','',name(d)),el('strong','',before+' → '+after));entries.push(b);
      }
      const ledgerHeading=el('h3','growth-draft-heading',t('변경 중','Pending')+' · '+entries.length),ledgerBody=el('div','growth-draft-entries');ledgerBody.append(...entries);
      draftList.replaceChildren(ledgerHeading,ledgerBody);draftList.hidden=!entries.length;
      bodyTree.update(selectedStat||selected,state,live);
      if(focus){const target=Array.from(root.querySelectorAll('[data-focus]')).find(n=>n.dataset.focus===focus);if(target&&!target.disabled)target.focus({preventScroll:true});}
      $('statGrid').scrollTop=scroll[0];$('passiveGrid').scrollTop=scroll[1];$('growthDetail').scrollTop=scroll[2];
    }
    return {render};
  }

  global.ExoduserStatsPanel = {mount, statChange, passiveChange, refundTotals, rankCost,createPlan,evaluatePlan,passiveEffects,statEffects,paths,pathFor,bodyNodes,bodyRoute};
})(globalThis);
