/* Skill Forge — K 스킬 창 (2026-10-10, 전면 교체).
   위: HUD와 같은 13개 키 슬롯(원형). 슬롯을 고르면 그 슬롯의 스킬이 가운데 "합성 제단"의 모체가 되고,
   아래 트레이에 그 슬롯에 넣을 수 있는 스킬(장착)과 모체와 합성할 수 있는 재료가 나온다.
   재료를 제단으로 끌어 넣으면 소켓이 개수대로 자동 배치된다(2=위아래, 3=세 방향, 4=네 방향 … 최대 10).
   합성 규칙은 기존 합체 레시피(_FUSE_PAIRS) 그대로 — 넣은 세트가 레시피와 같아지면 확인 후 _execFuse.
   로직은 전부 기존 함수(_skLearnUp/_skLevelDown/_skResetSkill/_execFuse/_canFuse/_canAssignSkillSlot) 호출만.
   3D 연출은 skill-forge-3d.js(ES 모듈, three r186, 패널이 열려 게임이 멈춘 동안만 렌더). 3D가 없으면 같은 DOM이 2D로 동작.
   끄기: ?skillForge=0 (구 카드형 창). */
(function(root){
  'use strict';
  const MAX_SOCKETS=10;
  const L=(ko,en)=>typeof _L==='function'?_L(ko,en):ko;
  const T=s=>typeof _T==='function'?_T(s):s;
  const qs=new URLSearchParams(root.location?root.location.search:'');
  const ENABLED=qs.get('skillForge')!=='0';
  // HUD 순서·실제 배정 변수 (updateMagicSlot→qsE=activeMagicSk, updateRMBSlot→skSlotRMB=activeRMBSk)
  const SLOTS=[
    {k:'1',kind:'num',idx:0},{k:'2',kind:'num',idx:1},{k:'3',kind:'num',idx:2},{k:'4',kind:'num',idx:3},
    {k:'F',kind:'num',idx:5},{k:'Z',kind:'ult'},
    {k:'LMB',kind:'fixed',def:'lmb',v:'activeLMBSk'},{k:'RMB',kind:'fixed',def:'rmb',v:'activeRMBSk'},
    {k:'Shift',kind:'fixed',def:'charge',v:'activeChargeSk'},{k:'E',kind:'fixed',def:'magic',v:'activeMagicSk'},
    {k:'Q',kind:'fixed',def:'q',v:'activeQSk'},{k:'Ctrl',kind:'fixed',def:'ct',v:'activeCtSk'},
    {k:'Space',kind:'num',idx:4}
  ];
  // ── 데이터 헬퍼 (게임 전역을 호출 시점에 읽는다) ──
  const sk=id=>typeof _skById==='function'?_skById(id):null;
  const lv=id=>(P&&P.skills&&P.skills[id])||0;
  const HOST_OVERRIDE={elemFuse:'omniBeam'};
  function fuseKeys(){return Object.keys(_FUSE_PAIRS)}
  function members(key){return(_FUSE_PAIRS[key]||[]).slice()}
  function hostOf(key){return HOST_OVERRIDE[key]||(_FUSE_PAIRS[key]||[])[0]}
  function starOf(key){const g=_FUSE_GEM_GROUPS[key]||{};return g.star||members(key).length}
  function isHost(id){return fuseKeys().some(k=>hostOf(k)===id)}
  function groupKey(id){ // 이 스킬이 속한 가장 큰 완성 합체
    let best=null,n=0;
    for(const k of fuseKeys()){if(!_isFused(k))continue;const m=members(k);if(m.includes(id)&&m.length>n){best=k;n=m.length}}
    return best;
  }
  function group(id){const k=groupKey(id);return k?members(k):[id]}
  function familyKeys(h){return fuseKeys().filter(k=>hostOf(k)===h).sort((a,b)=>members(a).length-members(b).length)}
  const subset=(a,b)=>a.every(x=>b.includes(x));
  const sameSet=(a,b)=>a.length===b.length&&subset(a,b);
  function demoLocked(k){return typeof _DEMO_MODE!=='undefined'&&_DEMO_MODE&&typeof _DEMO_FUSE_ALLOWED!=='undefined'&&!_DEMO_FUSE_ALLOWED.has(k)}
  function hiddenKey(k){const g=_FUSE_GEM_GROUPS[k]||{};return!!g.hidden&&!_isFused(k)}
  function skName(id){
    if(!id)return'';const s=sk(id);
    if(s)return L(T(s.name),s.nameEn||T(s.name));
    for(const d of Object.values(SKILL_SLOT_DEFS)){if(d.info&&d.info[id])return typeof _skN==='function'?_skN(d.info[id]):d.info[id].name}
    return id;
  }
  function iconUrl(id){ // 게임 공용 아이콘 해석(_skIcon: 합체 호스트 아이콘 대체 포함)을 그대로 따른다
    if(!id||typeof _skIcon!=='function')return'';
    const m=/src="([^"]+)"/.exec(_skIcon(id)||'');return m?m[1]:'';
  }
  function displayName(id){const k=groupKey(id);return k&&hostOf(k)===id?_fuseName(k):skName(id)}
  // ── 슬롯 ──
  function slotValue(s){
    if(s.kind==='num')return SKILL_SLOTS[s.idx]||null;
    if(s.kind==='ult')return ULT_SLOT||null;
    return P[s.v]||null;
  }
  function slotEligible(s){
    const out=[];
    if(s.kind==='fixed'){const d=SKILL_SLOT_DEFS[s.def];for(const id of(d?d.skills:[]))out.push(id);}
    else if(s.kind==='ult'){for(const x of SKILL_LIST)if(x.ult)out.push(x.id);}
    else{for(const x of SKILL_LIST){if(!x.act||x.ult||x.fixed)continue;if(_canAssignSkillSlot(x.id,s.idx))out.push(x.id);}}
    // 흡수된 스킬은 단독 장착 불가, 숨김 스킬은 습득 전 비공개
    return out.filter(id=>!_isAbsorbed(id)&&!(sk(id)&&sk(id).hidden&&!lv(id)&&!sk(id).reqLv));
  }
  function canEquip(s,id){
    if(!id)return false;
    if(s.kind==='fixed'){const d=SKILL_SLOT_DEFS[s.def];if(!d||!d.skills.includes(id))return false;return!sk(id)||lv(id)>=1||id==='charge'||id==='parry'||id==='normal'||id==='fireball'||id==='kiSlash'||id==='ghostWalk'}
    if(s.kind==='ult'){const x=sk(id);return!!(x&&x.ult&&lv(id)>=1)}
    return lv(id)>=1&&!_isAbsorbed(id)&&_canAssignSkillSlot(id,s.idx);
  }
  function equip(s,id){
    if(!canEquip(s,id))return false;
    if(s.kind==='num'){for(let j=0;j<SKILL_SLOTS.length;j++)if(SKILL_SLOTS[j]===id)SKILL_SLOTS[j]=null;SKILL_SLOTS[s.idx]=id;if(typeof updateQS==='function')updateQS();}
    else if(s.kind==='ult'){ULT_SLOT=id;if(typeof _updateUltSlot==='function')_updateUltSlot();}
    else{P[s.v]=id;if(typeof updateSkSlot==='function')updateSkSlot();if(typeof updateQS==='function')updateQS();}
    if(typeof dbSaveForce==='function')dbSaveForce();
    if(typeof SFX!=='undefined'&&SFX.pickup)SFX.pickup();
    return true;
  }
  // ── 합성 제단 상태 ──
  const st={slot:6,staged:[],sel:null,trayTab:'all',dirty:true};
  function forgeHost(){const s=SLOTS[st.slot];const v=slotValue(s);if(!v)return null;
    if(isHost(v))return v;
    // SH 'charge'(기본 사슬)는 합체 모체가 아니다 — 사슬기동:충돌(chargeBoost)이 모체
    if(s.def==='charge'&&lv('chargeBoost')>=1)return'chargeBoost';
    return v;}
  function forgeModel(){
    const h=forgeHost();
    if(!h)return{host:null,set:[],keys:[],nodes:[],ready:null,cands:[]};
    const keys=familyKeys(h);
    const base=group(h);
    const set=[...new Set([...base,...st.staged])];
    let ready=null;for(const k of keys){if(!_isFused(k)&&sameSet(members(k),set)){ready=k;break}}
    // 후보: 넣었을 때 세트가 어떤 레시피의 부분집합으로 남는 재료
    const cands=[];
    for(const k of keys){
      if(_isFused(k))continue;
      const m=members(k);if(!subset(set,m))continue;
      for(const id of m){if(set.includes(id)||cands.some(c=>c.id===id))continue;
        const unit=group(id),next=[...new Set([...set,...unit])];
        const ok=subset(next,m);
        const completes=keys.some(k2=>!_isFused(k2)&&sameSet(members(k2),next));
        cands.push({id,unit,ok,next:completes,key:k,learned:lv(id)>=1,demo:demoLocked(k),hidden:hiddenKey(k)});}
    }
    // 이 모체 계열의 나머지 재료(지금은 못 넣는 단계)도 흐리게 보여준다
    for(const k of keys)for(const id of members(k))if(!set.includes(id)&&!cands.some(c=>c.id===id))cands.push({id,unit:group(id),ok:false,key:k,learned:lv(id)>=1,demo:demoLocked(k),hidden:hiddenKey(k),later:true});
    return{host:h,set,base,keys,ready,cands};
  }
  // N개를 원형으로: 위(-90°)부터 시계방향 균등 — 2=위아래, 3=세 방향, 4=네 방향
  function socketLayout(n,R){const out=[];for(let i=0;i<n;i++){const a=-Math.PI/2+i*2*Math.PI/n;out.push({x:Math.cos(a)*R,y:Math.sin(a)*R,a})}return out}
  // ── DOM ──
  let el=null,parts={},three=null,threeTried=false,drag=null;
  function mk(tag,cls,parent,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;if(parent)parent.appendChild(e);return e}
  function ensureDom(){
    const panel=document.getElementById('skillPanel');if(!panel)return null;
    const pbox=panel.querySelector('.skill-pbox');if(!pbox)return null;
    if(el&&el.isConnected)return el;
    el=mk('section','sf-root');el.id='skillForge';el.setAttribute('aria-label',L('스킬 합성','Skill Forge'));
    const foot=pbox.querySelector('.skill-close');pbox.insertBefore(el,foot||null);
    parts.canvasWrap=mk('div','sf-canvas',el);
    parts.slots=mk('div','sf-slots',el);parts.slots.setAttribute('role','tablist');
    parts.mid=mk('div','sf-mid',el);
    parts.info=mk('aside','sf-info',parts.mid);
    parts.altar=mk('div','sf-altar',parts.mid);
    parts.road=mk('aside','sf-road',parts.mid);
    parts.core=mk('div','sf-core',parts.altar);
    parts.coreName=mk('div','sf-core-name',parts.altar);
    parts.coreStar=mk('div','sf-core-star',parts.altar);
    parts.nodes=mk('div','sf-nodes',parts.altar);
    parts.altarHint=mk('div','sf-altar-hint',parts.altar);
    parts.altarBtns=mk('div','sf-altar-btns',parts.altar);
    parts.tray=mk('div','sf-tray',el);
    parts.trayHead=mk('div','sf-tray-head',parts.tray);
    parts.trayEquip=mk('div','sf-tray-row',parts.tray);
    parts.trayFuse=mk('div','sf-tray-row',parts.tray);
    parts.ghost=mk('div','sf-drag-ghost',document.body);parts.ghost.hidden=true;
    el.addEventListener('pointerdown',onDown);
    // 캡처 단계: 게임 전역 마우스 처리가 전파를 끊어도 드래그가 끝까지 온다
    document.addEventListener('pointermove',onMove,{capture:true,passive:true});
    document.addEventListener('pointerup',onUp,{capture:true});
    document.addEventListener('pointercancel',()=>{if(drag){drag=null;parts.ghost.hidden=true;el.classList.remove('dragging')}},{capture:true});
    root.addEventListener('resize',()=>{if(active()&&isOpen())layout3d()});
    return el;
  }
  function isOpen(){const p=document.getElementById('skillPanel');return!!(p&&p.classList.contains('on'))}
  function icon(parent,id,cls){const w=mk('span',cls||'sf-ico',parent);const u=iconUrl(id);
    if(u){const im=mk('img','',w);im.src=u;im.alt='';im.draggable=false;}
    else w.textContent=(skName(id)||'?').charAt(0);
    return w}
  function renderSlots(){
    const box=parts.slots;box.replaceChildren();
    SLOTS.forEach((s,i)=>{
      const v=slotValue(s),b=mk('button','sf-slot',box);
      b.type='button';b.dataset.slot=i;b.setAttribute('role','tab');b.setAttribute('aria-selected',i===st.slot?'true':'false');
      if(i===st.slot)b.classList.add('on');if(!v)b.classList.add('empty');
      const h=v&&(isHost(v)||(s.def==='charge'&&lv('chargeBoost')>=1));
      if(h)b.classList.add('host');if(v&&groupKey(v))b.classList.add('fused');
      const disc=mk('span','sf-slot-disc',b);if(v)icon(disc,v);
      mk('span','sf-slot-key',b,s.k);
      mk('span','sf-slot-name',b,v?displayName(v):L('비어 있음','Empty'));
      b.title=(v?displayName(v):L('비어 있음','Empty'))+' ['+s.k+']';
      b.onclick=()=>{if(st.slot!==i){st.slot=i;st.staged=[];st.sel=null}render()};
    });
  }
  function nodeEl(parent,id,kind,x,y,size){
    const n=mk('div','sf-node sf-'+kind,parent);n.dataset.skId=id||'';n.dataset.kind=kind;
    n.style.left=x+'px';n.style.top=y+'px';n.style.width=n.style.height=size+'px';
    if(id){icon(n,id,'sf-node-ico');const t=mk('span','sf-node-name',n,skName(id));if(kind==='host')mk('span','sf-crown',n,L('모체','Host'));}
    else mk('span','sf-plus',n,'+');
    return n;
  }
  function renderAltar(m){
    const a=parts.altar,r=a.getBoundingClientRect();
    const W=r.width||600,H=r.height||400;
    // 아래 안내·버튼 띠(76px)와 위 여백을 빼고 남는 공간 안에 원이 들어가도록
    const TOP=10,BOT=78,usable=Math.max(160,H-TOP-BOT),cx=W/2,cy=TOP+usable/2;
    const cnt=Math.max(1,m.set.length+1);
    let R=Math.max(70,Math.min(W*.3,usable*.4));
    let nodeSize=Math.max(34,Math.min(92,R*.56,2*Math.PI*R/cnt*.72));
    R=Math.max(64,Math.min(R,usable/2-nodeSize/2-16));
    nodeSize=Math.max(34,Math.min(nodeSize,2*Math.PI*R/cnt*.72));
    // 코어는 소켓 안쪽 가장자리와 간격을 둔다(소켓이 많아 커지면 코어 테에 닿던 문제)
    const coreSize=Math.max(48,Math.min(150,R*1.02,(R-nodeSize/2)*1.3));
    parts.core.style.top=cy+'px';parts.core.style.width=coreSize+'px';
    parts.nodes.replaceChildren();parts.altarBtns.replaceChildren();
    st.geo={cx,cy,R,nodeSize,W,H,nodes:[]};
    const k=m.ready||groupKey(m.host||'');
    if(!m.host){
      parts.core.className='sf-core empty';parts.coreName.textContent=L('슬롯이 비어 있습니다','Empty slot');parts.coreStar.textContent='';
      parts.altarHint.textContent=L('아래에서 스킬을 끌어 위의 슬롯에 넣으세요','Drag a skill from below onto a slot above');
      return;
    }
    const ring=m.set.length>1?m.set:[];
    const showGhost=m.cands.some(c=>c.ok&&c.learned&&!c.demo)&&m.set.length<MAX_SOCKETS;
    const n=ring.length+(showGhost?1:0);
    parts.core.className='sf-core'+(m.ready?' ready':k?' fused':'');
    parts.core.replaceChildren();icon(parts.core,ring.length?(k?hostOf(k):m.host):m.host,'sf-core-ico');
    parts.coreName.textContent=m.ready?_fuseName(m.ready):k&&ring.length?_fuseName(k):displayName(m.host);
    parts.coreStar.textContent=ring.length?('★'.repeat(starOf(m.ready||k))):'';
    if(n){
      const pos=socketLayout(n,R);
      ring.forEach((id,i)=>{const kind=id===m.host?'host':m.base.includes(id)?'bound':'staged';
        nodeEl(parts.nodes,id,kind,cx+pos[i].x,cy+pos[i].y,nodeSize);st.geo.nodes.push({id,kind,x:cx+pos[i].x,y:cy+pos[i].y});});
      if(showGhost){const p=pos[ring.length];nodeEl(parts.nodes,null,'ghost',cx+p.x,cy+p.y,nodeSize*.86);st.geo.nodes.push({id:null,kind:'ghost',x:cx+p.x,y:cy+p.y});}
    }
    // 안내·버튼
    if(m.ready){
      parts.altarHint.textContent=L('레시피 완성 — 합성할 수 있습니다','Recipe complete — ready to fuse');
      const b=mk('button','sf-btn sf-btn-fire',parts.altarBtns,L('합성','Fuse')+'  ·  SP '+starOf(m.ready)*3);b.type='button';b.onclick=()=>doFuse(m.ready);
    }else if(st.staged.length){
      const need=m.cands.filter(c=>c.ok&&!c.later&&!m.set.includes(c.id)).map(c=>skName(c.id));
      parts.altarHint.textContent=L('재료를 더 넣으세요: ','Add more: ')+need.join(', ');
    }else if(showGhost){
      parts.altarHint.textContent=L('빛나는 재료를 끌어 제단에 넣으면 합성됩니다','Drag a glowing material onto the altar to fuse');
    }else if(k&&m.keys.some(x=>!_isFused(x)&&demoLocked(x))){
      parts.altarHint.textContent=L('다음 합성은 정식판에서 열립니다','The next fusion unlocks in the full game');
    }else if(k&&m.keys.some(x=>!_isFused(x))){
      parts.altarHint.textContent=L('다음 합성 재료를 먼저 습득하세요','Learn the next material first');
    }else if(k){
      parts.altarHint.textContent=L('이 계열의 합성을 모두 마쳤습니다','This line is fully fused');
    }else parts.altarHint.textContent=m.keys.length?L('합성할 재료를 먼저 습득하세요','Learn a material first'):L('이 스킬은 합성 계열이 없습니다','This skill has no fusion line');
    if(st.staged.length){const b=mk('button','sf-btn',parts.altarBtns,L('대기 비우기','Clear'));b.type='button';b.onclick=()=>{st.staged=[];render()};}
    if(k&&!m.ready){const b=mk('button','sf-btn sf-btn-ghost',parts.altarBtns,L('분해','Unfuse'));b.type='button';
      b.onclick=async()=>{const x=sk(hostOf(k));if(x&&typeof _skResetSkill==='function'){await _skResetSkill(x);st.staged=[];render()}}}
  }
  function chip(parent,id,opt){
    const c=mk('div','sf-chip',parent);c.dataset.skId=id;c.dataset.role=opt.role;c.tabIndex=0;
    if(opt.cls)for(const x of opt.cls)c.classList.add(x);
    icon(c,id,'sf-chip-ico');
    const t=mk('span','sf-chip-text',c);mk('span','sf-chip-name',t,displayName(id));
    const l=lv(id);mk('span','sf-chip-lv',t,l?('Lv '+l):(sk(id)?L('미습득','Not learned'):''));
    if(opt.host)mk('span','sf-crown',c,L('모체','Host'));
    if(opt.badge)mk('span','sf-chip-badge',c,opt.badge);
    c.onclick=()=>{st.sel=id;renderInfo()};
    return c;
  }
  function renderTray(m){
    const s=SLOTS[st.slot];
    parts.trayHead.replaceChildren();
    mk('span','sf-tray-title',parts.trayHead,L('넣을 수 있는 스킬','Skills for this slot')+'  ['+s.k+']');
    mk('span','sf-tray-sub',parts.trayHead,L('끌어서 위 슬롯에 장착 · 빛나는 재료는 제단으로','Drag to a slot to equip · glowing materials go to the altar'));
    parts.trayEquip.replaceChildren();parts.trayFuse.replaceChildren();
    mk('span','sf-row-label',parts.trayEquip,L('장착','Equip'));
    const cur=slotValue(s);
    for(const id of slotEligible(s)){
      const cls=[];if(id===cur)cls.push('on');if(!canEquip(s,id))cls.push('dim');
      chip(parts.trayEquip,id,{role:'equip',cls,host:isHost(id)});
    }
    mk('span','sf-row-label',parts.trayFuse,L('합성 재료','Materials'));
    if(!m.host||!m.cands.length){mk('span','sf-empty',parts.trayFuse,m.host?L('이 모체로 합성할 재료가 없습니다','No materials for this host'):L('모체 스킬을 먼저 장착하세요','Equip a host skill first'));return}
    for(const c of m.cands){
      if(c.hidden&&!c.learned){chip(parts.trayFuse,c.id,{role:'none',cls:['sealed'],badge:'???'});continue}
      const cls=[];let badge='';
      if(c.demo){cls.push('dim');badge=L('정식판','Full game')}
      else if(!c.learned){cls.push('dim');badge=L('습득 필요','Learn')}
      else if(c.ok&&c.next)cls.push('glow');
      else if(c.ok&&!c.later)badge=L('추가 재료','More');
      else{cls.push('dim');badge=L('다음 단계','Later')}
      chip(parts.trayFuse,c.id,{role:c.ok&&c.learned&&!c.demo?'mat':'none',cls,badge,host:isHost(c.id)});
    }
  }
  function renderInfo(){
    const box=parts.info;box.replaceChildren();
    const id=st.sel||forgeHost();
    if(!id){mk('div','sf-info-empty',box,L('스킬을 고르면 정보가 표시됩니다','Select a skill to see details'));return}
    const x=sk(id);
    const head=mk('div','sf-info-head',box);icon(head,id,'sf-info-ico');
    const ht=mk('div','sf-info-title',head);mk('div','sf-info-name',ht,displayName(id));
    const k=groupKey(id);
    mk('div','sf-info-sub',ht,(k?_fuseName(k)+' · ':'')+(x?(L('Lv ','Lv ')+lv(id)+' / 20'):''));
    if(x){mk('p','sf-info-desc',box,L(x.desc||'',x.descEn||x.desc||''));}
    else{for(const d of Object.values(SKILL_SLOT_DEFS)){if(d.info&&d.info[id]){mk('p','sf-info-desc',box,_skD(d.info[id]));break}}}
    if(x){
      const c=_skCtx(x);
      const row=mk('div','sf-info-cost',box);
      if(!c.learned)mk('span','',row,L('습득 ','Learn ')+'SP '+x.spCost+(x.matCost?(' · '+L('악의 ','Malice ')+_malCost(x.matCost)):''));
      else if(c._isFuseUp)mk('span','',row,L('합성 강화 ','Fusion up ')+'SP '+c._fuseUpSp);
      else mk('span','',row,L('강화 ','Upgrade ')+'SP '+c._singleUpSp+(x.upMat?(' · '+L('악의 ','Malice ')+_malCost(x.upMat)):''));
      if(c.learned&&c.slv>=c._skLvLock&&c.slv<20)mk('span','sf-warn',row,'Lv'+(c._skLvLock*50)+L(' 도달 시 해금',' to unlock'));
      const btns=mk('div','sf-info-btns',box);
      const up=mk('button','sf-btn sf-btn-fire',btns,c.learned?L('강화 +','Upgrade +'):L('습득','Learn'));up.type='button';
      up.disabled=!(c.canLearn||c.canUp);up.onclick=()=>{_skLearnUp(x)};
      if(c.learned){
        const dn=mk('button','sf-btn',btns,L('강화 −','Level −'));dn.type='button';dn.disabled=c.slv<=1;dn.onclick=()=>{_skLevelDown(x)};
        const rs=mk('button','sf-btn sf-btn-ghost',btns,k?L('분해','Unfuse'):L('리셋','Reset'));rs.type='button';rs.onclick=async()=>{await _skResetSkill(x);render()};
      }
    }
    // 드래그 대신 클릭(게임패드·키보드): 이 슬롯에 장착 / 제단에 넣기
    const s=SLOTS[st.slot],acts=mk('div','sf-info-btns',box);
    if(id!==slotValue(s)&&canEquip(s,id)){const b=mk('button','sf-btn',acts,L('이 슬롯에 장착','Equip to this slot')+' ['+s.k+']');b.type='button';b.onclick=()=>{if(equip(s,id)){st.staged=[];render()}}}
    {const m=forgeModel(),c=m.cands.find(c=>c.id===id);
      if(c&&c.ok&&c.learned&&!c.demo&&!m.set.includes(id)){const b=mk('button','sf-btn sf-btn-fire',acts,L('제단에 넣기','Place on altar'));b.type='button';
        b.onclick=()=>{for(const x of group(id))if(!st.staged.includes(x))st.staged.push(x);if(three)three.drop();render();const m2=forgeModel();if(m2.ready)doFuse(m2.ready)}}}
    if(!acts.childElementCount)acts.remove();
    const res=mk('div','sf-info-res',box);
    res.textContent='SP '+P.sp+'  ·  '+L('악의 ','Malice ')+(G.mats||0).toLocaleString()+'  ·  LV '+P.lv;
  }
  function renderRoad(m){
    const box=parts.road;box.replaceChildren();
    mk('div','sf-road-title',box,L('합성 로드맵','Fusion Roadmap'));
    if(!m.host||!m.keys.length){mk('div','sf-empty',box,L('이 스킬은 합성 계열이 없습니다','No fusion line for this skill'));return}
    for(const k of m.keys){
      const hid=hiddenKey(k)&&!_canFuse(k);
      const row=mk('div','sf-road-row',box);
      const done=_isFused(k),now=!done&&m.ready===k,can=!done&&!demoLocked(k)&&_canFuse(k);
      row.classList.add(done?'done':now?'now':can?'can':demoLocked(k)?'locked':'todo');
      mk('span','sf-road-star',row,'★'.repeat(starOf(k)));
      mk('span','sf-road-name',row,hid?'???':_fuseName(k));
      mk('span','sf-road-state',row,done?L('완성','Done'):now?L('준비됨','Ready'):can?L('합성 가능','Can fuse'):demoLocked(k)?L('정식판','Full game'):hid?L('숨겨진 합성','Hidden'):L('재료 부족','Missing'));
      if(!hid){const ing=mk('div','sf-road-ing',row);for(const id of members(k)){const t=mk('span','sf-road-mat'+(lv(id)?' have':''),ing);icon(t,id,'sf-mini-ico');}}
    }
  }
  async function doFuse(key){
    if(!_canFuse(key)){if(typeof notify==='function')notify(L('재료를 모두 습득해야 합니다','Learn every material first'));return}
    const ab=_getAbsorbed(key).map(skName);
    const cost=starOf(key)*3;
    const msg=_fuseName(key)+' '+L('합성','fusion')+'\n'+members(key).map(skName).join(' + ')+
      (ab.length?('\n'+L('흡수되어 단독 사용 불가: ','Absorbed (no standalone use): ')+ab.join(', ')):'')+'\nSP -'+cost;
    const ok=typeof gameConfirm==='function'?await gameConfirm(msg):true;if(!ok)return;
    if(_execFuse(key)){
      st.staged=[];
      if(typeof updateQS==='function')updateQS();if(typeof updateSkSlot==='function')updateSkSlot();
      if(typeof dbSaveForce==='function')dbSaveForce();
      if(three)three.burst(_FUSE_GEM_GROUPS[key]||{});
      render();
    }
  }
  // ── 드래그 (포인터 이벤트, HTML5 DnD 없음) ──
  function onDown(e){
    if(e.button!==0)return;
    const c=e.target.closest('.sf-chip,.sf-node.sf-staged');if(!c||!el.contains(c))return;
    const id=c.dataset.skId;if(!id)return;
    const role=c.classList.contains('sf-node')?'unstage':c.dataset.role;
    drag={id,role,x0:e.clientX,y0:e.clientY,on:false,src:c};
  }
  function onMove(e){
    if(!drag)return;
    if(!drag.on){if(Math.hypot(e.clientX-drag.x0,e.clientY-drag.y0)<6)return;drag.on=true;
      parts.ghost.replaceChildren();icon(parts.ghost,drag.id,'sf-chip-ico');parts.ghost.hidden=false;el.classList.add('dragging');}
    parts.ghost.style.transform='translate('+(e.clientX-28)+'px,'+(e.clientY-28)+'px)';
    const t=dropTarget(e.clientX,e.clientY,drag);
    el.querySelectorAll('.drop-ok,.drop-no').forEach(n=>n.classList.remove('drop-ok','drop-no'));
    if(t&&t.el)t.el.classList.add(t.ok?'drop-ok':'drop-no');
    if(three)three.hover(t&&t.kind==='altar'?(t.ok?1:-1):0);
  }
  function dropTarget(x,y,dd){
    const drag=dd;
    const hit=document.elementFromPoint(x,y);if(!hit)return null;
    const slotB=hit.closest('.sf-slot');
    if(slotB&&el.contains(slotB)){const s=SLOTS[+slotB.dataset.slot];return{kind:'slot',el:slotB,s,ok:drag.role==='equip'||drag.role==='mat'?canEquip(s,drag.id):false}}
    const alt=hit.closest('.sf-altar');
    if(alt&&el.contains(alt)){const m=forgeModel();const c=m.cands.find(c=>c.id===drag.id);return{kind:'altar',el:alt,ok:drag.role==='mat'&&!!(c&&c.ok&&c.learned&&!c.demo)}}
    const tray=hit.closest('.sf-tray');if(tray&&el.contains(tray))return{kind:'tray',el:tray,ok:drag.role==='unstage'};
    return null;
  }
  function onUp(e){
    if(!drag)return;const d=drag;drag=null;
    if(!d.on)return;
    parts.ghost.hidden=true;el.classList.remove('dragging');
    el.querySelectorAll('.drop-ok,.drop-no').forEach(n=>n.classList.remove('drop-ok','drop-no'));
    if(three)three.hover(0);
    const t=dropTarget(e.clientX,e.clientY,d);
    if(d.role==='unstage'){if(!t||t.kind!=='altar'){st.staged=st.staged.filter(x=>!group(d.id).includes(x));render()}return}
    if(!t||!t.ok){if(t&&t.kind==='slot'&&typeof notify==='function')notify(L('이 슬롯에는 넣을 수 없습니다','Cannot go in this slot'));return}
    if(t.kind==='slot'){if(equip(t.s,d.id)){st.slot=+t.el.dataset.slot;st.staged=[];render()}return}
    if(t.kind==='altar'){
      for(const x of group(d.id))if(!st.staged.includes(x))st.staged.push(x);
      if(three)three.drop();
      render();
      const m=forgeModel();if(m.ready)doFuse(m.ready);
    }
  }
  // ── 3D ──
  function want3d(){return qs.get('skillForge3d')!=='0'}
  function load3d(){
    if(threeTried||!want3d())return;threeTried=true;
    import('./skill-forge-3d.js?v=20261010-forge6').then(mod=>mod.createForge3D(parts.canvasWrap)).then(t=>{
      three=t;if(three){el.classList.add('sf-3d');layout3d();}
    }).catch(err=>{root.console&&root.console.warn('[SkillForge] 3D unavailable, 2D fallback',err);el.classList.remove('sf-3d')});
  }
  function layout3d(){
    if(!three||!el)return;
    const base=parts.canvasWrap.getBoundingClientRect();
    const rel=r=>({x:r.left+r.width/2-base.left,y:r.top+r.height/2-base.top,r:r.width/2});
    const slots=[...parts.slots.querySelectorAll('.sf-slot')].map((b,i)=>{const d=b.querySelector('.sf-slot-disc');const p=rel(d.getBoundingClientRect());
      const s=SLOTS[i],v=slotValue(s);return{...p,icon:iconUrl(v),on:i===st.slot,empty:!v,host:b.classList.contains('host'),fused:b.classList.contains('fused')}});
    const ar=parts.altar.getBoundingClientRect();
    const m=forgeModel(),k=m.ready||groupKey(m.host||'');const g=_FUSE_GEM_GROUPS[k]||{};
    const nodes=(st.geo?st.geo.nodes:[]).map(n=>({id:n.id||'ghost',kind:n.kind,x:n.x+ar.left-base.left,y:n.y+ar.top-base.top,icon:iconUrl(n.id)}));
    const coreP=rel(parts.core.getBoundingClientRect());
    three.setState({width:base.width,height:base.height,slots,
      // 원판 중심 = 소켓 고리 중심(st.geo.cx/cy). 영역 정중앙을 쓰면 아래 안내 띠만큼 어긋나 고리와 원판이 틀어진다
      altar:{x:ar.left+(st.geo?st.geo.cx:ar.width/2)-base.left,y:ar.top+(st.geo?st.geo.cy:ar.height/2)-base.top,R:st.geo?st.geo.R:120,nodeR:st.geo?st.geo.nodeSize/2:40,
        core:{...coreP,icon:iconUrl(m.set.length>1&&k?hostOf(k):m.host),ready:!!m.ready,fused:!!k,empty:!m.host},
        color:g.color||'#ec7958',color2:g.color2||'#ffb070',nodes}});
  }
  // ── 공개 ──
  function active(){return ENABLED}
  function render(){
    if(!ensureDom())return;
    const pbox=el.parentNode;pbox.classList.add('sf-on');
    // 구 버튼 문구에서 이모지 제거 (리프 노드만)
    const bu=document.getElementById('skBatchUpBtn');if(bu)bu.textContent=L('일괄 레벨업','Batch Level Up');
    const ra=document.getElementById('skRecAutoBtn');if(ra)ra.textContent=L('추천 자동','Auto Build');
    const bk=document.getElementById('skBackBtn');if(bk)bk.textContent=L('닫기 [ESC]','Close [ESC]');
    if(typeof _isFused==='function'&&_isFused('stormBeam')){}
    const m=forgeModel();
    // 대기 재료 정합성: 이미 흡수/세트에 들어간 것 제거
    st.staged=st.staged.filter(id=>!m.base.includes(id));
    renderSlots();renderAltar(m);renderTray(m);renderInfo();renderRoad(m);
    load3d();
    requestAnimationFrame(()=>{renderAltarGeoOnly();layout3d()});
  }
  function renderAltarGeoOnly(){ // 첫 렌더 직후 실제 크기로 소켓 위치를 다시 잡는다
    const r=parts.altar.getBoundingClientRect();if(!st.geo||Math.abs(r.width-st.geo.W)>1||Math.abs(r.height-st.geo.H)>1)renderAltar(forgeModel());
  }
  root.SkillForge=Object.freeze({active,render,_model:forgeModel,_layout:socketLayout,_slots:SLOTS,_state:st,
    _close(){if(three)three.pause()},_open(){if(three)three.resume()}});
})(globalThis);
