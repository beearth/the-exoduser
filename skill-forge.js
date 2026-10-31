/* Skill Forge — K 스킬 창 (2026-10-10, 전면 교체).
   위: HUD의 13개 키 슬롯 + 구르기/X처형/T자동석궁(2026-10-31). 슬롯을 고르면 해당 스킬이 가운데 "합성 제단"의 모체가 되고,
   아래 트레이에 그 슬롯에 넣을 수 있는 스킬(장착)과 모체와 합성할 수 있는 재료가 나온다.
   재료를 제단으로 끌어 넣으면 소켓이 개수대로 자동 배치된다(2=위아래, 3=세 방향, 4=네 방향 … 최대 10).
   합성 규칙은 기존 합체 레시피(_FUSE_PAIRS) 그대로 — 넣은 세트가 레시피와 같아지면 확인 후 _execFuse.
   로직은 전부 기존 함수(_skLearnUp/_skLevelDown/_skResetSkill/_execFuse/_canFuse/_canAssignSkillSlot) 호출만.
   3D 연출은 skill-forge-3d.js(ES 모듈, three r186, 패널이 열려 게임이 멈춘 동안만 렌더). 3D가 없으면 같은 DOM이 2D로 동작.
   2026-10-21 개편: 아래 가로 스크롤 트레이를 없애고 제단 원을 아래로 내려 줄였다. 넣을 수 있는 스킬은 원 둘레(양옆·위·아래 모서리)에
   떠다니는 구슬로 한 번에 전부 펼치고, 합성 관계(모체-재료)끼리는 전류가 흐른다(2D 캔버스 한 장, 패널이 열린 동안만 rAF 하나).
   끄기: ?skillForge=0 (구 카드형 창). */
(function(root){
  'use strict';
  const MAX_SOCKETS=10;
  const L=(ko,en)=>typeof _L==='function'?_L(ko,en):ko;
  const T=s=>typeof _T==='function'?_T(s):s;
  const qs=new URLSearchParams(root.location?root.location.search:'');
  const ENABLED=qs.get('skillForge')!=='0';
  // 실제 입력: RMB=마법(activeMagicSk), E=처내기(activeRMBSk). 레거시 DOM 이름과 구분한다.
  const SLOTS=[
    {k:'1',kind:'num',idx:0},{k:'2',kind:'num',idx:1},{k:'3',kind:'num',idx:2},{k:'4',kind:'num',idx:3},
    {k:'F',kind:'num',idx:5},{k:'Z',kind:'ult'},
    {k:'LMB',kind:'fixed',def:'lmb',v:'activeLMBSk',bind:'weapon'},{k:'RMB',kind:'fixed',def:'magic',v:'activeMagicSk',bind:'beam'},
    {k:'Shift',kind:'fixed',def:'charge',v:'activeChargeSk',bind:'charge'},{k:'E',kind:'fixed',def:'rmb',v:'activeRMBSk',bind:'shield'},
    {k:'Q',kind:'fixed',def:'q',v:'activeQSk',bind:'parry'},{k:'Ctrl',kind:'fixed',def:'ct',v:'activeCtSk'},
    {k:'Space',kind:'num',idx:4},
    {k:'Space',kind:'intrinsic',intrinsic:'roll',bind:'roll'},
    {k:'X',kind:'intrinsic',intrinsic:'execution'},
    {k:'T',kind:'fixed',def:'bow',v:'activeBowSk'}
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
    if(id==='roll')return L('구르기','Roll');
    if(!id)return'';const s=sk(id);
    if(s)return L(T(s.name),s.nameEn||T(s.name));
    for(const d of Object.values(SKILL_SLOT_DEFS)){if(d.info&&d.info[id])return typeof _skN==='function'?_skN(d.info[id]):d.info[id].name}
    return id;
  }
  function iconUrl(id){ // 게임 공용 아이콘 해석(_skIcon: 합체 호스트 아이콘 대체 포함)을 그대로 따른다
    if(id==='roll')return'img/ui/item-cutouts/boots_phys_cutout.png';
    if(id==='normal')id='fanShot';
    if(!id||typeof _skIcon!=='function')return'';
    const m=/src="([^"]+)"/.exec(_skIcon(id)||'');return m?m[1]:'';
  }
  function displayName(id){const k=groupKey(id);return k&&hostOf(k)===id?_fuseName(k):skName(id)}
  // ── 슬롯 ──
  function slotValue(s){
    if(s.kind==='intrinsic')return s.intrinsic==='roll'&&typeof _mobilityKind==='function'&&_mobilityKind()==='bladeDash'?'bladeDash':s.intrinsic;
    if(s.kind==='num')return SKILL_SLOTS[s.idx]||null;
    if(s.kind==='ult')return ULT_SLOT||null;
    return P[s.v]||null;
  }
  function slotKey(s){
    const code=s.bind&&typeof BINDS!=='undefined'&&BINDS[s.bind];
    const mouse={mouse0:'LMB',mouse1:'MMB',mouse2:'RMB'};
    const key=mouse[code]||(code&&typeof keyName==='function'?keyName(code,true):s.k);
    return s.intrinsic==='roll'?'↑↓←→ + '+key:key;
  }
  // 미장착 전용 칸의 안내용 아이콘. 습득/장착/합체 상태에는 쓰지 않는다.
  function slotPreview(s){
    if(slotValue(s)||!(s.kind==='ult'||s.kind==='num'&&s.idx===4))return null;
    const ids=slotEligible(s),preferred=s.kind==='ult'?'blackStar':'giantSlam';
    return ids.find(id=>lv(id))||(ids.includes(preferred)?preferred:ids[0])||null;
  }
  function slotCondition(s){
    if(s.kind==='intrinsic')return L('고정','Fixed')+(s.intrinsic==='execution'&&!lv('execution')?' · '+L('습득 필요','Learn'):'');
    if(s.def==='charge'||s.def==='ct')return L('기절 탈출','Stun escape');
    if(slotValue(s))return s.kind==='fixed'?L('전용','Dedicated'):'';
    const candidates=slotEligible(s),reqs=candidates.map(id=>sk(id)).filter(Boolean).map(x=>x.reqLv||0);
    const req=reqs.length?Math.min(...reqs):0;
    if(req>P.lv)return'Lv'+req+L(' 도달 시 해금',' to unlock');
    const preview=slotPreview(s),x=preview&&sk(preview);
    if(x&&!lv(preview))return L('습득 ','Learn ')+'SP '+x.spCost+(x.matCost?'\n'+L('악의구슬 ','Malice Sphere ')+_malCost(x.matCost):'');
    return candidates.some(id=>lv(id))?L('이 슬롯에 장착','Equip to this slot'):L('스킬 습득 후 장착','Learn a skill to equip it');
  }
  function slotName(s){
    const v=slotValue(s);if(v)return displayName(v);
    const preview=slotPreview(s);if(preview)return skName(preview);
    if(s.kind==='ult')return T('필살기');
    if(s.idx===4)return T('분노 폭발 스킬 전용');
    if(s.idx===5)return T('영역 스킬');
    return T('스킬')+' '+s.k;
  }
  function slotEligible(s){
    if(s.kind==='intrinsic')return[];
    const out=[];
    if(s.kind==='fixed'){const d=SKILL_SLOT_DEFS[s.def];for(const id of(d?d.skills:[]))out.push(id);}
    else if(s.kind==='ult'){for(const x of SKILL_LIST)if(x.ult)out.push(x.id);}
    else{for(const x of SKILL_LIST){if(!x.act||x.ult||x.fixed)continue;if(_canAssignSkillSlot(x.id,s.idx))out.push(x.id);}}
    // 흡수된 스킬은 단독 장착 불가, 숨김 스킬은 습득 전 비공개
    return out.filter(id=>!_isAbsorbed(id)&&!(sk(id)&&sk(id).hidden&&!lv(id)&&!sk(id).reqLv));
  }
  function canEquip(s,id){
    if(!id||s.kind==='intrinsic')return false;
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
  // 숫자·Space·Z 슬롯만 비울 수 있다 — 고정 슬롯(LMB/RMB/Shift/E/Q/Ctrl)은 늘 하나가 장착돼 있어야 해서 교체만
  function canUnequip(s){return!!s&&(s.kind==='num'||s.kind==='ult')&&!!slotValue(s)}
  function unequip(s){
    if(!canUnequip(s))return false;
    if(s.kind==='num'){SKILL_SLOTS[s.idx]=null;if(typeof updateQS==='function')updateQS();}
    else{ULT_SLOT=null;if(typeof _updateUltSlot==='function')_updateUltSlot();}
    if(typeof dbSaveForce==='function')dbSaveForce();
    if(typeof SFX!=='undefined'&&SFX.pickup)SFX.pickup();
    return true;
  }
  // ── 합성 제단 상태 ──
  const st={slot:6,staged:[],sel:null,trayTab:'all',dirty:true};
   function forgeHost(){const s=SLOTS[st.slot];const v=slotValue(s);if(!v||s.kind==='intrinsic')return null;
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
    // 떠다니는 스킬 구슬 층: 전류 캔버스(아래) + 구슬(위). 제단 원 둘레 빈 공간에 전부 펼친다 — 가로 스크롤 없음
    parts.field=mk('div','sf-field',parts.altar);
    parts.bolts=mk('canvas','sf-bolts',parts.field);parts.bolts.setAttribute('aria-hidden','true');
    parts.orbs=mk('div','sf-orbs',parts.field);
    parts.fieldHead=mk('div','sf-field-head',parts.altar);
    parts.core=mk('div','sf-core',parts.altar);
    parts.coreName=mk('div','sf-core-name',parts.altar);
    parts.coreStar=mk('div','sf-core-star',parts.altar);
    parts.nodes=mk('div','sf-nodes',parts.altar);
    parts.altarHint=mk('div','sf-altar-hint',parts.altar);
    parts.altarBtns=mk('div','sf-altar-btns',parts.altar);
    parts.ghost=mk('div','sf-drag-ghost',document.body);parts.ghost.hidden=true;
    el.addEventListener('pointerdown',onDown);
    // 구슬 위에 올리면 그 구슬의 합성 관계 전류가 밝아진다
    el.addEventListener('pointerover',e=>{const o=e.target&&e.target.closest?e.target.closest('.sf-orb'):null;fxHover(o?o.dataset.skId:null)});
    el.addEventListener('pointerleave',()=>fxHover(null));
    el.addEventListener('focusin',e=>{const o=e.target&&e.target.closest?e.target.closest('.sf-orb'):null;if(o)fxHover(o.dataset.skId)});
    if(typeof ResizeObserver==='function'){const ro=new ResizeObserver(()=>{if(isOpen())requestAnimationFrame(()=>{renderAltarGeoOnly();layout3d()})});ro.observe(parts.altar)}
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
      const v=slotValue(s),preview=slotPreview(s),socket=!v&&s.kind==='num'&&s.idx>=1&&s.idx<4,b=mk('button','sf-slot',box);
      b.type='button';b.dataset.slot=i;b.setAttribute('role','tab');b.setAttribute('aria-selected',i===st.slot?'true':'false');
      if(i===st.slot)b.classList.add('on');if(!v)b.classList.add('empty');
      if(s.kind==='intrinsic')b.classList.add('intrinsic');
      const h=v&&(isHost(v)||(s.def==='charge'&&lv('chargeBoost')>=1));
      if(h)b.classList.add('host');if(v&&groupKey(v))b.classList.add('fused');
      const disc=mk('span','sf-slot-disc',b);if(v||preview)icon(disc,v||preview);
      if(preview)b.classList.add('preview');
      if(socket){b.classList.add('socket-art');const im=mk('img','sf-empty-socket',disc);im.src='img/ui/skill-forge/empty-socket-'+s.k+'.png';im.alt='';im.draggable=false;im.onerror=()=>{im.hidden=true;b.classList.add('art-failed')};}
      mk('span','sf-slot-key',b,slotKey(s));
      mk('span','sf-slot-name',b,slotName(s));
      mk('span','sf-slot-state',b,slotCondition(s));
      b.title=slotName(s)+' ['+slotKey(s)+'] — '+slotCondition(s)+(s.kind==='intrinsic'?' · '+L('고정 기술은 교체할 수 없습니다','Fixed abilities cannot be replaced'):'');
      if(preview)b.title+='\n'+(s.kind==='ult'?T('필살기'):T('분노 폭발 스킬 전용'))+' — '+slotEligible(s).map(skName).join(' / ');
      b.setAttribute('aria-label',b.title);
      b.onclick=()=>{if(st.slot!==i){st.slot=i;st.staged=[];st.sel=null}render()};
    });
  }
  function nodeEl(parent,id,kind,x,y,size){
    const n=mk('div','sf-node sf-'+kind,parent);n.dataset.skId=id||'';n.dataset.kind=kind;
    n.style.left=x+'px';n.style.top=y+'px';n.style.width=n.style.height=size+'px';
    if(id){icon(n,id,'sf-node-ico');const t=mk('span','sf-node-name',n,skName(id));if(kind==='host')mk('span','sf-crown',n,L('모체','Host'));}
    else{mk('span','sf-plus',n,'+');n.title=L('제단에 넣기','Place on altar')} // 빈 소켓 = 다음 재료를 넣는 자리
    return n;
  }
  function renderAltar(m){
    const a=parts.altar,r=a.getBoundingClientRect();
    const W=r.width||600,H=r.height||400;
    // 2026-10-21: 원을 아래로 내리고 줄인다 — 원판 아래 끝이 안내·버튼 띠(78px) 바로 위. 위·양옆은 스킬 구슬 자리
    const TOP=10,BOT=78,usable=Math.max(160,H-TOP-BOT),cx=W/2;
    const cnt=Math.max(1,m.set.length+1);
    let R=Math.max(56,Math.min(W*.19,usable*.27)*(st.wheelK||1));
    let nodeSize=Math.max(30,Math.min(84,R*.56,2*Math.PI*R/cnt*.72));
    // 3D 원판 반지름(skill-forge-3d.js discCss와 같은 식) — 구슬 배치·드롭 판정의 원 경계
    const discR=Math.max(R*1.32,R+nodeSize/2*1.3);
    const cy=Math.max(TOP+discR,TOP+usable-discR-4);
    // 코어는 소켓 안쪽 가장자리와 간격을 둔다(소켓이 많아 커지면 코어 테에 닿던 문제)
    const coreSize=Math.max(48,Math.min(150,R*1.02,(R-nodeSize/2)*1.3));
    parts.core.style.top=cy+'px';parts.core.style.left=cx+'px';parts.core.style.width=coreSize+'px';
    parts.nodes.replaceChildren();parts.altarBtns.replaceChildren();
    st.geo={cx,cy,R,nodeSize,W,H,nodes:[],discR,coreR:coreSize/2};
    const k=m.ready||groupKey(m.host||'');
    if(!m.host){
      const s=SLOTS[st.slot],fixed=s.kind==='intrinsic',id=fixed?slotValue(s):null;
      parts.core.className='sf-core'+(fixed?'':' empty');parts.core.replaceChildren();if(id)icon(parts.core,id,'sf-core-ico');
      parts.coreName.textContent=fixed?slotName(s):L('슬롯이 비어 있습니다','Empty slot');parts.coreStar.textContent='';
      parts.altarHint.textContent=fixed?L('고정 기술은 교체할 수 없습니다','Fixed abilities cannot be replaced'):slotCondition(s);
      return;
    }
    const ring=m.set.length>1?m.set:[];
    const showGhost=m.cands.some(c=>c.ok&&c.learned&&!c.demo)&&m.set.length<MAX_SOCKETS;
    const n=ring.length+(showGhost?1:0);
    parts.core.className='sf-core'+(m.ready?' ready':k?' fused':'')+(canUnequip(SLOTS[st.slot])?' sf-unequip':'');
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
  // ── 떠다니는 스킬 구슬 (2026-10-21: 가로 스크롤 트레이 대체) ──
  // 넣을 수 있는 스킬 = 이 슬롯 장착 후보 + 모체 합성 재료(중복은 한 구슬). 재료는 원에 가까운 자리부터, 장착 후보는 합성 묶음별로 같은 쪽에.
  function orbItems(m){
    const s=SLOTS[st.slot],cur=slotValue(s),items=new Map();
    if(m.host)for(const c of m.cands){
      if(items.has(c.id))continue;
      const it={id:c.id,mat:true,cls:['mat'],role:'none',badge:'',pri:0,str:0};
      if(c.hidden&&!c.learned){it.cls.push('sealed');it.sealed=true;it.pri=5;it.str=.12}
      else if(c.demo){it.cls.push('dim');it.badge=L('정식판','Full game');it.pri=4;it.str=.14}
      else if(!c.learned){it.cls.push('dim');it.badge=L('습득 필요','Learn');it.pri=3;it.str=.14}
      else if(c.ok&&c.next){it.cls.push('glow');it.pri=0;it.str=1}
      else if(c.ok&&!c.later){it.badge=L('추가 재료','More');it.pri=1;it.str=.45}
      else{it.cls.push('dim');it.badge=L('다음 단계','Later');it.pri=2;it.str=.14}
      it.role=c.ok&&c.learned&&!c.demo?'mat':'none';
      items.set(c.id,it);
    }
    for(const id of slotEligible(s)){
      let it=items.get(id);
      if(!it){it={id,mat:false,cls:[],role:'equip',badge:'',pri:id===cur?10:lv(id)?11:12,str:0};if(!canEquip(s,id))it.cls.push('dim');items.set(id,it)}
      else if(it.role==='none'&&canEquip(s,id)){it.role='equip';it.cls=it.cls.filter(c=>c!=='dim')}
      if(id===cur)it.cls.push('on');
    }
    for(const it of items.values())it.host=isHost(it.id);
    return items;
  }
  // 합성 관계 선: 모체-재료(레시피 첫 원소 ↔ 나머지). 지금 제단 모체와의 관계는 원 중심(코어)으로 흐른다
  function orbEdges(m,items){
    const out=[],seen=new Set();
    for(const it of items.values())if(it.mat)out.push({a:it.id,b:'core',core:true,str:it.str});
    for(const k of fuseKeys()){const h=hostOf(k);if(h===m.host)continue;
      for(const id of members(k)){if(id===h||id===m.host)continue;const key=h<id?h+'|'+id:id+'|'+h;if(seen.has(key))continue;seen.add(key);
        if(items.has(h)&&items.has(id))out.push({a:h,b:id,core:false,str:.3});}}
    return out;
  }
  // 원 둘레 빈 공간의 자리(엇갈린 격자, 좌우 대칭). o=구슬 지름. 원판·명패·안내 띠와 겹치는 자리는 뺀다
  // compact = 이름 한 줄(레벨은 구슬 위 작은 숫자) — 낮은 화면에서 구슬이 많을 때만
  // 부유 진폭 배율(구슬 52px 이상 1, 작으면 비례·최소 0.5) — 타원 드리프트 가로 4~7·세로 5~9px(+숨 1.2px)
  const ampK=o=>Math.min(1,Math.max(.5,o/52));
  function orbSlots(o,g,reserved,k,compact){
    k=k||1;const A=ampK(o),up=10.2*A,lg=Math.round(up+3),TOP=up+3,LB=lg+(compact?15:29),
      dx=Math.max(o*1.62,o+40)*k,dy=(o+LB+up+3)*k,Lw=Math.min(2*dx-o-10-14*A,2*dx-44,136);
    const wx=g.cx,wy=g.cy,ex=g.discR+o/2+12,out={L:[],R:[],M:[],dx,dy,Lw};
    const hit=(x0,y0,x1,y1)=>reserved.some(r=>x0<r.r&&x1>r.l&&y0<r.b&&y1>r.t);
    for(let j=-40;j<=40;j++){const x=wx+j*dx;if(x-Lw/2<2||x+Lw/2>g.W-2)continue;const off=(Math.abs(j)%2)?dy/2:0;
      for(let i=-40;i<=40;i++){const y=wy+i*dy+off;if(y-o/2-TOP<2||y+o/2+LB>g.H-2)continue;
        if(Math.hypot(x-wx,y-wy)<ex+up)continue;
        const lt=y+o/2+2,lb=y+o/2+LB,ddx=Math.max(x-Lw/2-wx,0,wx-x-Lw/2),ddy=Math.max(lt-wy,0,wy-lb);
        if(Math.hypot(ddx,ddy)<g.discR+6)continue;
        if(hit(x-Lw/2,y-o/2-TOP,x+Lw/2,y+o/2+LB))continue;
        const d=Math.hypot(x-wx,y-wy),ang=Math.atan2(y-wy,Math.abs(x-wx)||1);
        (j<0?out.L:j>0?out.R:out.M).push({x,y,score:d+Math.abs(ang+.35)*dy*.55});}}
    for(const q of [out.L,out.R,out.M])q.sort((p,q2)=>p.score-q2.score);
    out.lg=lg;return out;
  }
  function relRect(e,base){if(!e||!e.isConnected||!e.textContent&&!e.childElementCount)return null;const r=e.getBoundingClientRect();if(!r.width||!r.height)return null;return{l:r.left-base.left-6,t:r.top-base.top-6,r:r.right-base.left+6,b:r.bottom-base.top+6}}
  function renderField(m,force,probe){
    const s=SLOTS[st.slot],g=st.geo;
    // 제단 오른쪽 위 명패: 넣을 수 있는 스킬 [키] — 왼쪽 위 모체 명패와 대칭
    parts.fieldHead.replaceChildren();
    mk('span','sf-field-title',parts.fieldHead,(s.kind==='intrinsic'?L('고정','Fixed'):L('넣을 수 있는 스킬','Skills for this slot'))+'  ['+slotKey(s)+']');
    mk('span','sf-field-sub',parts.fieldHead,s.kind==='intrinsic'?L('고정 기술은 교체할 수 없습니다','Fixed abilities cannot be replaced'):L('끌어서 위 슬롯에 장착 · 빛나는 재료는 제단으로','Drag to a slot to equip · glowing materials go to the altar'));
    parts.orbs.replaceChildren();fx.orbs=[];fx.edges=[];
    const items=orbItems(m),list=[...items.values()];
    const edges=orbEdges(m,items);
    if(!g||!list.length){fxResize();fxStart();return{o:99,oMax:99,compact:false}}
    const base=parts.altar.getBoundingClientRect();
    const reserved=[parts.coreName,parts.coreStar,parts.fieldHead,parts.altarHint,parts.altarBtns].map(e=>relRect(e,base)).filter(Boolean);
    // 구슬 지름: 넓은 화면 58px에서 시작해 전부 들어갈 때까지 줄인다(최소 34px). 그래도 안 되면 이름 한 줄(compact, 최소 28px)
    const oMax=Math.max(34,Math.min(58,g.H*.088,g.W*.052)),cap=x=>x.L.length+x.R.length+x.M.length;
    let o=oMax,slots=null,compact=false;
    fit:for(const cp of [false,true]){o=oMax;const oMin=cp?28:34;
      for(let pass=0;pass<24;pass++){slots=orbSlots(o,g,reserved,1,cp);if(cap(slots)>=list.length){compact=cp;break fit}if(o<=oMin)break;o=Math.max(oMin,o*.95)}}
    // 자리가 남으면 간격을 넓혀 양옆 빈 공간 전체에 고르게 펼친다(원에만 몰리지 않게)
    if(cap(slots)>=list.length)for(const k of [1.6,1.5,1.42,1.34,1.26,1.18,1.1]){const s2=orbSlots(o,g,reserved,k,compact);if(cap(s2)>=list.length){slots=s2;break}}
    const total=cap(slots);
    if(total<list.length&&!force)return 0;
    if(probe)return{o,oMax,compact}; // 크기만 재 본다(구슬 DOM 미생성)
    // 묶음(합성 관계로 이어진 구슬들)을 같은 쪽에 — 관계선이 원판을 가로지르지 않게
    const par=new Map(list.map(it=>[it.id,it.id]));const find=x=>{while(par.get(x)!==x)x=par.get(x);return x};
    for(const e of edges)if(!e.core){const ra=find(e.a),rb=find(e.b);if(ra!==rb)par.set(ra,rb)}
    const groups=new Map();for(const it of list){const r=find(it.id);if(!groups.has(r))groups.set(r,[]);groups.get(r).push(it)}
    const gl=[...groups.values()].map(gr=>gr.sort((x,y)=>x.pri-y.pri||(lv(y.id)-lv(x.id))));
    gl.sort((x,y)=>x[0].pri-y[0].pri||y.length-x.length);
    let lastP=null;
    // 묶음의 둘째 구슬부터는 이미 놓인 같은 묶음 구슬에 가장 가까운 자리 — 관계 전류가 짧은 이웃끼리 흐르게
    const pickNear=(q,near)=>{if(!q.length)return null;if(!near||!near.length)return q.shift();let bi=0,bs=1e9;
      q.forEach((p,i)=>{let d=1e9;for(const n of near)d=Math.min(d,Math.hypot(p.x-n.x,p.y-n.y));const s=d+p.score*.12;if(s<bs){bs=s;bi=i}});return q.splice(bi,1)[0]};
    const take=(side,near)=>{const other=side==='L'?'R':'L';const p=pickNear(slots[side],near)||pickNear(slots.M,near)||pickNear(slots[other],near);
      if(p){lastP=p;return p}
      if(!lastP)lastP={x:g.cx-g.discR-40,y:40};lastP={x:lastP.x,y:lastP.y+14};return lastP}; // force: 겹치더라도 표시
    let nL=0,nR=0;const place=[];
    for(const gr of gl){let side=nL<=nR?'L':'R';const other=side==='L'?'R':'L';
      if(slots[side].length+slots.M.length<gr.length&&slots[other].length>=gr.length)side=other;
      const near=[];for(const it of gr){const p=take(side,near);near.push(p);place.push([it,p]);if(p.x<g.cx)nL++;else nR++}}
    const Lw=slots.Lw;
    for(const [it,p] of place){
      const n=mk('div','sf-orb',parts.orbs);for(const c of it.cls)n.classList.add(c);if(compact)n.classList.add('compact');
      n.dataset.skId=it.id;n.dataset.role=it.role;n.tabIndex=0;
      n.style.left=p.x+'px';n.style.top=p.y+'px';n.style.setProperty('--o',o.toFixed(1)+'px');n.style.setProperty('--lw',Lw.toFixed(0)+'px');n.style.setProperty('--lg',slots.lg+'px');
      if(st.sel===it.id)n.classList.add('sel');
      const fl=mk('span','sf-orb-float',n),ball=mk('span','sf-orb-ball',fl);
      if(it.sealed)mk('span','sf-orb-seal',ball,'?');else icon(ball,it.id,'sf-ico sf-orb-ico');
      const nm=it.sealed?'???':displayName(it.id),l=lv(it.id);
      if(l&&!it.sealed)n.classList.add('learned');if(it.host&&!it.sealed)n.classList.add('host');
      // 둘째 줄: [모체] + 재료 배지 또는 Lv. 미습득은 글자 없이 흐린 구슬로(22번 반복되던 「미습득」 제거) — 툴팁에만 남김
      const sub=it.sealed?'':it.badge||(l?('Lv '+l):'');
      const lab=mk('span','sf-orb-label',n);mk('span','sf-orb-name',lab,nm);
      if(sub||it.host&&!it.sealed){const sr=mk('span','sf-orb-sub'+(it.badge?' badge':l?' lv':''),lab);if(it.host&&!it.sealed)mk('span','sf-orb-host',sr,L('모체','Host'));if(sub)mk('span','sf-orb-subt',sr,sub)}
      if(compact&&l&&!it.sealed)mk('span','sf-orb-pip',fl,String(l));
      n.title=nm+(it.host&&!it.sealed?' · '+L('모체','Host'):'')+' — '+(sub||(it.sealed?'???':L('미습득','Not learned')));
      n.onclick=()=>{st.sel=it.id;parts.orbs.querySelectorAll('.sf-orb.sel').forEach(x=>x.classList.remove('sel'));n.classList.add('sel');renderInfo();fxDraw()};
      let h=2166136261;for(let i=0;i<it.id.length;i++)h=Math.imul(h^it.id.charCodeAt(i),16777619);
      const rnd=k=>((h>>>(k*5))&1023)/1023;
      const A=ampK(o);
      fx.orbs.push({id:it.id,el:n,fl,x:p.x,y:p.y,r:o/2,ph1:rnd(0)*6.283,ph2:rnd(1)*6.283,w:6.283*(.13+rnd(2)*.07)*(rnd(5)<.5?-1:1),fb:.45+rnd(3)*.15,
        ax:(4+3*rnd(4))*A,ay:(5+4*rnd(6))*A,ab:1.2*A,bx:0,by:0,s:1});
    }
    const byId=new Map(fx.orbs.map(x=>[x.id,x]));
    for(const e of edges){const A=byId.get(e.a),B=e.core?'core':byId.get(e.b);if(!A||!B)continue;
      fx.edges.push({A,B,core:e.core,str:e.str,ph:A.ph1+(e.core?0:B.ph2),next:0,off:null,br:null,cp:0});}
    routeEdges(g);
    fxResize();fxStart();
    return{o,oMax,compact};
  }
  // 선 경로: 2차 곡선의 조절점을 현(chord) 수직으로 밀어 이름표·다른 구슬·원판을 피하는 값을 고른다(배치 때 1회, 16점 표본)
  function routeEdges(g){
    const base=parts.altar.getBoundingClientRect();
    const obs=fx.orbs.map(o=>{let l=1e9,t=1e9,r=-1e9,b=-1e9;for(const s of o.el.querySelectorAll('.sf-orb-name,.sf-orb-sub')){const q=s.getBoundingClientRect();if(!q.width)continue;l=Math.min(l,q.left);t=Math.min(t,q.top);r=Math.max(r,q.right);b=Math.max(b,q.bottom)}
      return{o,lab:{l:l-base.left-4,t:t-base.top-3,r:r-base.left+4,b:b-base.top+3}}});
    for(const e of fx.edges){
      const A=e.A,core=e.B==='core',ex=core?g.cx:e.B.x,ey=core?g.cy:e.B.y,er=core?g.coreR:e.B.r;
      const vx=ex-A.x,vy=ey-A.y,len=Math.hypot(vx,vy)||1,nx=-vy/len,ny=vx/len,mx=(A.x+ex)/2,my=(A.y+ey)/2;
      const out=((mx-g.cx)*nx+(my-g.cy)*ny)>=0?1:-1; // 원판 반대쪽
      const b0=core?0:out*Math.min(60,len*.16);let best=null;
      for(const c of [b0,b0+out*40,b0-out*40,b0+out*80,b0-out*80,b0+out*120,b0-out*120,b0+out*170,b0-out*170,b0+out*230,b0-out*230]){
        const Cx=mx+nx*c,Cy=my+ny*c;let hits=0;
        for(let i=1;i<16;i++){const k=i/16,px=(1-k)*(1-k)*A.x+2*k*(1-k)*Cx+k*k*ex,py=(1-k)*(1-k)*A.y+2*k*(1-k)*Cy+k*k*ey;
          if(Math.hypot(px-A.x,py-A.y)<A.r+2||Math.hypot(px-ex,py-ey)<er+2)continue;
          for(const ob of obs){const L=ob.lab;if(px>L.l&&px<L.r&&py>L.t&&py<L.b){hits+=2;break}if(ob.o!==A&&ob.o!==e.B&&Math.hypot(px-ob.o.x,py-ob.o.y)<ob.o.r+8){hits+=2;break}}
          if(!core&&Math.hypot(px-g.cx,py-g.cy)<g.discR)hits+=.25;} // 원판 위를 지나는 건 이름표보다 덜 나쁘다
        const sc=hits*1000+Math.abs(c-b0);if(!best||sc<best.sc)best={sc,c,hits};if(!hits)break;}
      e.cp=best.c;e.hits=Math.floor(best.hits);
    }
  }
  // ── 구슬 부유 + 전류 (캔버스 한 장, rAF 하나 — 패널이 닫히면 멈춘다) ──
  const fx={raf:0,orbs:[],edges:[],hover:null,ctx:null,dpr:1,W:0,H:0,reduce:false,t:0};
  function fxResize(){
    const c=parts.bolts,g=st.geo;if(!c||!g)return;
    const dpr=Math.min(2,root.devicePixelRatio||1);const w=Math.max(1,Math.round(g.W*dpr)),h=Math.max(1,Math.round(g.H*dpr));
    if(c.width!==w||c.height!==h){c.width=w;c.height=h}
    fx.dpr=dpr;fx.W=g.W;fx.H=g.H;fx.ctx=c.getContext('2d');
  }
  function fxStart(){
    fx.reduce=!!(root.matchMedia&&root.matchMedia('(prefers-reduced-motion: reduce)').matches);
    if(fx.reduce){fxDraw();return}
    if(!fx.raf)fx.raf=requestAnimationFrame(fxTick);
  }
  function fxStop(){if(fx.raf)cancelAnimationFrame(fx.raf);fx.raf=0}
  function fxTick(now){
    fx.raf=0;if(!el||!el.isConnected||!isOpen())return;
    fx.t=now/1000;
    // 느린 타원 드리프트(구슬마다 주기 5~7.7초·방향·위상 다름) + 빠른 미세 숨(위아래 1.2px·크기 ±1.8%)
    for(const o of fx.orbs){const a=fx.t*o.w+o.ph1;o.bx=o.ax*Math.cos(a);o.by=o.ay*Math.sin(a)+o.ab*Math.sin(fx.t*6.283*o.fb+o.ph2);o.s=1+.018*Math.sin(fx.t*2.51+o.ph2);
      o.fl.style.transform='translate3d('+o.bx.toFixed(2)+'px,'+o.by.toFixed(2)+'px,0) scale('+o.s.toFixed(4)+')';}
    fxDraw();
    fx.raf=requestAnimationFrame(fxTick);
  }
  function fxHover(id){if(fx.hover===id)return;fx.hover=id;if(fx.reduce)fxDraw()}
  // 중간점 변위로 만든 번개 굴곡(양 끝 0). 짧은 주기마다 새로 뽑아 깜박이게
  function zig(n,amp){const a=new Float32Array(n+1);let step=n,sc=amp;while(step>1){const h=step>>1;for(let i=h;i<n;i+=step)a[i]=(a[i-h]+a[Math.min(n,i+h)])/2+(Math.random()*2-1)*sc;step=h;sc*=.56}return a}
  // 지옥불(재료→제단 코어·강조) / 적갈·금빛 잔불(평소 합성 관계) / 금빛(먼 단계 재료). 네온·청록 없음
  const PAL={fire:['255,70,26','255,140,76','255,236,214'],ember:['150,38,18','214,120,60','255,216,168'],gold:['176,128,64','226,192,130','255,238,210']};
  // 선 모양 3단: strong=다음 합성 재료·호버/선택 강조(지옥불) / mid=평소 합성 관계 전류(적갈·금빛 잔잔한 번개) / faint=먼 단계 재료
  // 굴곡은 re 초 간격으로 다시 뽑아(같은 모양 반복 없음) 깜박이고, br 확률로 곁가지가 튄다. 흐르는 마디 pulse개가 sp 속도로 흐른다
  const STY={
    strong:{w:[9,3.2,1.3],a:[.09,.34,.85],jit:.11,re:[.07,.12],br:.75,pulse:2,sp:.6,spark:9},
    mid:{w:[7,2.6,1.15],a:[.11,.4,.85],jit:.095,re:[.08,.15],br:.4,pulse:2,sp:.42,spark:6},
    faint:{w:[4,1.4,.8],a:[.08,.3,.7],jit:.07,re:[.1,.15],br:.15,pulse:1,sp:.3,spark:0}};
  function fxDraw(){
    const ctx=fx.ctx,g=st.geo;if(!ctx||!g)return;
    ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,parts.bolts.width,parts.bolts.height);
    if(!fx.edges.length)return;
    ctx.setTransform(fx.dpr,0,0,fx.dpr,0,0);ctx.globalCompositeOperation='lighter';ctx.lineJoin='round';ctx.lineCap='round';
    const t=fx.reduce?0:fx.t,focus=fx.hover||st.sel;
    for(const e of fx.edges){
      const A=e.A,core=e.B==='core';
      const ax=A.x+A.bx,ay=A.y+A.by,bx=core?g.cx:e.B.x+e.B.bx,by=core?g.cy:e.B.y+e.B.by;
      const vx=bx-ax,vy=by-ay,len=Math.hypot(vx,vy)||1,ux=vx/len,uy=vy/len,nx=-uy,ny=ux;
      // 구슬 테두리에서 시작해 테두리(코어는 핵 테)에서 끝난다 — 끝점은 떠다니는 구슬을 매 프레임 따라감.
      // 경로 = 조절점(routeEdges가 고른 수직 오프셋)을 지나는 2차 곡선: 이름표·다른 구슬을 돌아간다
      const r0=A.r*A.s+1.5,r1=core?g.coreR+4:e.B.r*e.B.s+1.5;if(len<=r0+r1+6)continue;
      const Cx=(ax+bx)/2+nx*e.cp,Cy=(ay+by)/2+ny*e.cp;
      const d0=Math.hypot(Cx-ax,Cy-ay)||1,d1=Math.hypot(Cx-bx,Cy-by)||1;
      const x0=ax+(Cx-ax)/d0*r0,y0=ay+(Cy-ay)/d0*r0,x1=bx+(Cx-bx)/d1*r1,y1=by+(Cy-by)/d1*r1,L2=Math.hypot(x1-x0,y1-y0);
      const lit=!!focus&&(A.id===focus||(!core&&e.B.id===focus));
      let kind,I,pal;
      if(lit){kind='strong';I=Math.max(.95,e.str);pal=PAL.fire}
      else if(core&&e.str>=.9){kind='strong';I=e.str;pal=PAL.fire}
      else if(core&&e.str>=.3){kind='mid';I=.68;pal=PAL.fire}
      else if(!core){kind='mid';I=.74;pal=PAL.ember}
      else{kind='faint';I=.45;pal=PAL.gold}
      if(focus&&!lit)I*=.4;
      const S=STY[kind];
      if(!fx.reduce){I*=.78+.22*Math.sin(t*21+e.ph)*Math.sin(t*6.7+e.ph*1.7);if(((t*.37+e.ph)%1+1)%1<(kind==='strong'?.06:.04))I*=1.45}
      if(I<.02)continue;
      const N=L2>220?32:L2>90?16:8;
      if(!e.off||e.off.length!==N+1||t>=e.next||fx.reduce||e.kind!==kind){e.kind=kind;e.off=zig(N,S.jit);e.next=t+S.re[0]+Math.random()*(S.re[1]-S.re[0]);
        e.br=L2>60&&Math.random()<S.br?{i:(N*(.25+Math.random()*.5))|0,a:(Math.random()<.5?-1:1)*(.45+Math.random()*.55),l:.1+Math.random()*.16,z:zig(8,.14)}:null}
      const pts=[];for(let i=0;i<=N;i++){const k=i/N,k1=1-k,j2=e.off[i]*L2;pts.push(k1*k1*x0+2*k*k1*Cx+k*k*x1+nx*j2,k1*k1*y0+2*k*k1*Cy+k*k*y1+ny*j2)}
      const stroke=(w,al,c)=>{ctx.strokeStyle='rgba('+c+','+Math.min(1,al).toFixed(3)+')';ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)ctx.lineTo(pts[i],pts[i+1]);ctx.stroke()};
      for(let q=0;q<3;q++)stroke(S.w[q],S.a[q]*I,pal[q]);
      if(e.br){const i=Math.min(N-1,e.br.i),px=pts[i*2],py=pts[i*2+1],c=Math.cos(e.br.a),sn=Math.sin(e.br.a),dx2=ux*c-uy*sn,dy2=ux*sn+uy*c,bl=L2*e.br.l;
        for(const [w,al,c2] of [[S.w[1]+1,.22,pal[1]],[Math.max(.8,S.w[2]),.6,pal[2]]]){ctx.strokeStyle='rgba('+c2+','+Math.min(1,al*I).toFixed(3)+')';ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(px,py);
          for(let q=1;q<=8;q++){const k=q/8,o2=e.br.z[q]*bl;ctx.lineTo(px+dx2*bl*k-dy2*o2,py+dy2*bl*k+dx2*o2)}ctx.stroke()}}
      // 흐르는 전류: 선을 따라 밝은 마디가 흘러간다(재료→코어, 모체→재료 방향)
      if(!fx.reduce){const seg=Math.max(2,Math.round(N*.14));
        for(let q=0;q<S.pulse;q++){const u=((t*S.sp+e.ph*.159+q/S.pulse)%1+1)%1,i0=Math.floor(u*(N-1));
          for(const [w,al,c] of [[S.w[1]*1.9,.28,pal[1]],[S.w[2]*1.7,.95,pal[2]]]){ctx.strokeStyle='rgba('+c+','+Math.min(1,al*(I+.25)).toFixed(3)+')';ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(pts[i0*2],pts[i0*2+1]);
            for(let k=1;k<=seg&&i0+k<=N;k++)ctx.lineTo(pts[(i0+k)*2],pts[(i0+k)*2+1]);ctx.stroke()}}}
      // 양 끝 불꽃: 전류가 구슬 테에 닿는 자리
      if(S.spark){const ends=core?[[x0,y0]]:[[x0,y0],[pts[N*2],pts[N*2+1]]];
        for(const [ex,ey] of ends){const gr=ctx.createRadialGradient(ex,ey,0,ex,ey,S.spark);gr.addColorStop(0,'rgba('+pal[2]+','+(.55*I).toFixed(3)+')');gr.addColorStop(1,'rgba('+pal[0]+',0)');ctx.fillStyle=gr;ctx.beginPath();ctx.arc(ex,ey,S.spark,0,6.283);ctx.fill()}}
    }
    ctx.globalCompositeOperation='source-over';
  }
  function renderInfo(){
    const box=parts.info;box.replaceChildren();
    const selected=SLOTS[st.slot],intrinsic=selected.kind==='intrinsic';
    const id=st.sel||(intrinsic?slotValue(selected):forgeHost());
    if(!id){mk('div','sf-info-empty',box,L('스킬을 고르면 정보가 표시됩니다','Select a skill to see details'));return}
    const x=sk(id);
    const head=mk('div','sf-info-head',box);icon(head,id,'sf-info-ico');
    const ht=mk('div','sf-info-title',head);mk('div','sf-info-name',ht,displayName(id));
    const k=groupKey(id);
    mk('div','sf-info-sub',ht,(k?_fuseName(k)+' · ':'')+(x?(L('Lv ','Lv ')+lv(id)+' / 20'):''));
    if(x){
      let desc=L(x.desc||'',x.descEn||x.desc||'');
      // 일부 원본 마법 설명의 스왑 전 E/RMB 안내만 현행 입력으로 표시한다.
      if(SKILL_SLOT_DEFS.magic&&SKILL_SLOT_DEFS.magic.skills.includes(id))desc=desc.replace(/\b(?:E|RMB)\b/g,slotKey(SLOTS.find(s=>s.def==='magic')));
      mk('p','sf-info-desc',box,desc);
    }
    else{for(const d of Object.values(SKILL_SLOT_DEFS)){if(d.info&&d.info[id]){mk('p','sf-info-desc',box,_skD(d.info[id]));break}}}
    if(id==='roll')mk('p','sf-info-desc',box,L('방향키와 함께 사용 · 기절 탈출','Use with movement keys · stun escape'));
    if(intrinsic)mk('p','sf-info-fixed',box,L('고정 기술은 교체할 수 없습니다','Fixed abilities cannot be replaced'));
    if(selected.def==='charge'||selected.def==='ct')mk('p','sf-info-fixed',box,L('기절 탈출','Stun escape')+' ['+slotKey(selected)+']');
    if(selected.intrinsic==='execution')mk('p','sf-info-fixed',box,L('그로기 보스 전용','Groggy bosses only'));
    if(x){
      const c=_skCtx(x);
      const row=mk('div','sf-info-cost',box);
      if(!c.learned)mk('span','',row,L('습득 ','Learn ')+'SP '+x.spCost+(x.matCost?(' · '+L('악의구슬 ','Malice Sphere ')+_malCost(x.matCost)):''));
      else if(c._isFuseUp)mk('span','',row,L('합성 강화 ','Fusion up ')+'SP '+c._fuseUpSp);
      else mk('span','',row,L('강화 ','Upgrade ')+'SP '+c._singleUpSp+(x.upMat?(' · '+L('악의구슬 ','Malice Sphere ')+_malCost(x.upMat)):''));
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
    res.textContent='SP '+P.sp+'  ·  '+L('악의구슬 ','Malice Sphere ')+(G.mats||0).toLocaleString()+'  ·  LV '+P.lv;
  }
  function renderRoad(m){
    const box=parts.road;box.replaceChildren();
    const empty=!m.host||!m.keys.length;box.hidden=empty;parts.mid.classList.toggle('sf-no-road',empty);
    if(empty)return;
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
    // 중앙 코어 = 선택 슬롯에 장착된 스킬. 원판 밖으로 끌어내면 탈착, 위 슬롯에 놓으면 그 슬롯으로 옮긴다
    const core=e.target.closest('.sf-core');
    if(core&&el.contains(core)){const s=SLOTS[st.slot];if(!canUnequip(s))return;
      drag={id:slotValue(s),role:'unequip',slot:st.slot,x0:e.clientX,y0:e.clientY,on:false,src:core};return}
    const c=e.target.closest('.sf-orb,.sf-node.sf-staged');if(!c||!el.contains(c))return;
    const id=c.dataset.skId;if(!id)return;
    const role=c.classList.contains('sf-node')?'unstage':c.dataset.role;
    drag={id,role,x0:e.clientX,y0:e.clientY,on:false,src:c};
  }
  function onMove(e){
    if(!drag)return;
    if(!drag.on){if(Math.hypot(e.clientX-drag.x0,e.clientY-drag.y0)<6)return;drag.on=true;
      parts.ghost.replaceChildren();icon(parts.ghost,drag.id,'sf-ghost-ico');parts.ghost.hidden=false;el.classList.add('dragging');}
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
    if(slotB&&el.contains(slotB)){const s=SLOTS[+slotB.dataset.slot];return{kind:'slot',el:slotB,s,ok:drag.role==='equip'||drag.role==='mat'||drag.role==='unequip'?canEquip(s,drag.id):false}}
    const alt=hit.closest('.sf-altar');
    if(alt&&el.contains(alt)){
      // 제단 = 원판 위만. 원 밖(구슬 들판)에 놓으면 대기 재료를 빼는 자리
      const g=st.geo,ar=alt.getBoundingClientRect();
      if(!g||Math.hypot(x-ar.left-g.cx,y-ar.top-g.cy)<=g.discR+10){const m=forgeModel();const c=m.cands.find(c=>c.id===drag.id);return{kind:'altar',el:alt,ok:drag.role==='mat'&&!!(c&&c.ok&&c.learned&&!c.demo)}}
      return{kind:'field',el:null,ok:drag.role==='unstage'||drag.role==='unequip'};
    }
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
    if(d.role==='unequip'){
      if(t&&t.kind==='altar')return; // 원판 위에 다시 놓음 = 취소
      if(t&&t.kind==='slot'){
        if(!t.ok){if(typeof notify==='function')notify(L('이 슬롯에는 넣을 수 없습니다','Cannot go in this slot'));return}
        if(equip(t.s,d.id)){st.slot=+t.el.dataset.slot;st.staged=[];render()}return}
      if(unequip(SLOTS[d.slot])){st.staged=[];render()}
      return}
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
    import('./skill-forge-3d.js?v=20261031-sockets1').then(mod=>mod.createForge3D(parts.canvasWrap)).then(t=>{
      three=t;if(three){el.classList.add('sf-3d');layout3d();}
    }).catch(err=>{root.console&&root.console.warn('[SkillForge] 3D unavailable, 2D fallback',err);el.classList.remove('sf-3d')});
  }
  function layout3d(){
    if(!three||!el)return;
    const base=parts.canvasWrap.getBoundingClientRect();
    const rel=r=>({x:r.left+r.width/2-base.left,y:r.top+r.height/2-base.top,r:r.width/2});
    const slots=[...parts.slots.querySelectorAll('.sf-slot')].map((b,i)=>{const d=b.querySelector('.sf-slot-disc');const p=rel(d.getBoundingClientRect());
      const s=SLOTS[i],v=slotValue(s);return{...p,icon:iconUrl(v),domArt:b.classList.contains('preview')||b.classList.contains('socket-art'),on:i===st.slot,empty:!v,host:b.classList.contains('host'),fused:b.classList.contains('fused')}});
    const ar=parts.altar.getBoundingClientRect();
    const m=forgeModel(),k=m.ready||groupKey(m.host||'');const g=_FUSE_GEM_GROUPS[k]||{};
    const focus=m.host||(SLOTS[st.slot].kind==='intrinsic'?slotValue(SLOTS[st.slot]):null);
    const nodes=(st.geo?st.geo.nodes:[]).map(n=>({id:n.id||'ghost',kind:n.kind,x:n.x+ar.left-base.left,y:n.y+ar.top-base.top,icon:iconUrl(n.id)}));
    const coreP=rel(parts.core.getBoundingClientRect());
    three.setState({width:base.width,height:base.height,slots,
      // 원판 중심 = 소켓 고리 중심(st.geo.cx/cy). 영역 정중앙을 쓰면 아래 안내 띠만큼 어긋나 고리와 원판이 틀어진다
      altar:{x:ar.left+(st.geo?st.geo.cx:ar.width/2)-base.left,y:ar.top+(st.geo?st.geo.cy:ar.height/2)-base.top,R:st.geo?st.geo.R:120,nodeR:st.geo?st.geo.nodeSize/2:40,
        core:{...coreP,icon:iconUrl(m.set.length>1&&k?hostOf(k):focus),ready:!!m.ready,fused:!!k,empty:!focus},
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
    renderSlots();renderRoad(m);layoutAltar(m);renderInfo();
    load3d();
    requestAnimationFrame(()=>{renderAltarGeoOnly();layout3d()});
  }
  // 제단 원 + 구슬. 구슬이 최소 크기로도 다 안 들어가면 원을 단계적으로 줄인다(가로 스크롤·숨김 없음)
  function layoutAltar(m){
    // 구슬 지름 44px(작은 화면은 그 화면 최대치) 이상·두 줄 이름을 지킬 수 있는 가장 큰 원을 고른다.
    // 끝까지 안 되면 두 줄 > 큰 구슬 > 큰 원 순으로 가장 나은 단계
    const KS=[1,.9,.8,.7,.6,.52];let best=null,bs=-1;
    for(const k of KS){st.wheelK=k;renderAltar(m);const r=renderField(m,false,true);if(!r)continue;
      if(!r.compact&&r.o>=Math.min(44,r.oMax-.5)){best=k;break}
      const sc=(r.compact?0:1000)+r.o*10+k;if(sc>bs){bs=sc;best=k}}
    st.wheelK=best==null?KS[KS.length-1]:best;renderAltar(m);
    if(!renderField(m))renderField(m,true); // 극단적으로 작은 창: 남은 구슬은 겹치더라도 전부 보이게
  }
  function renderAltarGeoOnly(){ // 첫 렌더 직후·창 크기 변경 시 실제 크기로 소켓·구슬 위치를 다시 잡는다
    const r=parts.altar.getBoundingClientRect();if(!st.geo||Math.abs(r.width-st.geo.W)>1||Math.abs(r.height-st.geo.H)>1)layoutAltar(forgeModel());
  }
  root.SkillForge=Object.freeze({active,render,_model:forgeModel,_layout:socketLayout,_slots:SLOTS,_state:st,
    _close(){if(three)three.pause();fxStop()},_fx:fx,_fxDraw:()=>fxDraw(),_orbItems:m=>orbItems(m),_orbEdges:(m,items)=>orbEdges(m,items),_orbSlots:orbSlots,_route:()=>fx.edges.map(e=>({a:e.A.id,b:e.B==='core'?'core':e.B.id,cp:e.cp,hits:e.hits})),_open(){if(three)three.resume()}});
})(globalThis);
