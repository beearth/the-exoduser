/* Chapter 2 shares the combat lesson's isolated world and restores its original snapshot. */
window._resourcePractice = {
  t(ko,en,values) { return typeof _L==='function' ? _L(ko,en,values) : ko.replace(/\{(\w+)\}/g,(all,key)=>values?.[key]??all); },
  stepOrder: [0,1,2,3,10,7,8,9], // Temporarily omit the three standalone movement/resource exercises.
  completionChecks(l) { return this.stepOrder.map(step=>l.checks[step]); },
  get escapeLabels() { return [this.t("Space · 지옥강타","Space · Hell Slam"),this.t("Shift · 사슬 탈출","Shift · Chain escape"),this.t("방향키 + Space · 전격이동","Direction + Space · Lightning Dash"),this.t("왼쪽 Ctrl · 유령걸음","Left Ctrl · Ghost Walk")]; },
  get resourceSets() { return [
    {key:'Q',action:'parry',label:this.t("Q 보호막 · 파란 마력(MP)","Q shield · Blue Mana (MP)"),tip:this.t("Q로 보호막을 펼쳐 파란 마력(MP) 소모를 확인하세요. 홀딩 중에도 소모되며, 마법탄 패링에 성공하면 자원이 회복됩니다.","Raise your shield with Q and watch your blue Mana (MP) decrease. Holding it also drains Mana; successfully parrying magic projectiles restores resources.")},
    {key:'E',action:'shield',label:this.t("E 검격 · 스태미나(ST)","E sword strike · Stamina (ST)"),tip:this.t("E를 짧게 눌렀다 떼어 검격을 사용하세요. 스태미나는 E 검격 같은 신체 기술에 쓰입니다.","Briefly press and release E to use a sword strike. Stamina fuels physical techniques such as the E strike.")},
    {key:'SHIFT',action:'charge',label:this.t("Shift 사슬 · 노란 기동력 + ST","Shift chain · Yellow Mobility + ST"),tip:this.t("마우스로 열린 바닥을 가리키고 왼쪽 Shift를 눌렀다 떼세요. 사슬 발사로 노란 기동력과 스태미나가 함께 줄어듭니다.","Point the mouse toward open ground, then press and release Left Shift. Firing the chain consumes both yellow Mobility and Stamina.")}
  ]; },
  get labels() { return [this.t("자원 소개 · 해골눈","Resource basics · Skull eyes"),this.t("Q 패링 · 정신력 회복","Q parry · Restore Poise"),this.t("4회 피격 · 그로기","Take 4 hits · Groggy"),this.t("그로기 탈출 · 4가지 방법","Escape Groggy · 4 methods"),this.t("Shift · 사슬 1·2·3단","Shift · Chain tiers 1, 2 and 3"),this.t("자원 실습 · Q·E·Shift","Resource practice · Q, E and Shift"),this.t("방향키 + Space · 마력·기동력 소모","Direction + Space · Mana and Mobility costs"),this.t("Q 홀딩 · 흡수와 그로기 저항","Hold Q · Absorption and Groggy resistance"),this.t("왼쪽 Ctrl · 스킬 발동","Left Ctrl · Activate a skill"),this.t("Q 패링 · 자원 회복","Q parry · Restore resources"),this.t("F · 회복의 영역","F · Holy Dome")]; },
  get tips() { return [
    this.t("해골눈 4개는 정신력입니다. 피격 −1, 패링 +1, 0이면 그로기입니다. Q·E·Shift와 자원 짝을 살펴본 뒤, 탄을 한 번 맞아보세요.","The 4 skull eyes represent Poise. Taking a hit costs 1; parrying restores 1. At 0, you become Groggy. Check the resources used by Q, E and Shift, then let one projectile hit you."),
    this.t("다가오는 마법탄을 Q로 패링하세요. 실제 패링에 성공하면 꺼진 해골눈 1개가 다시 켜집니다.","Parry the incoming magic projectile with Q. A successful parry lights up one depleted skull eye."),
    this.t("4발이 연속으로 날아옵니다. 화살표가 가리키는 해골눈이 피격마다 4 → 3 → 2 → 1 → 0으로 줄어들고 그로기에 걸리는 것을 확인하세요.","4 projectiles arrive in succession. Watch the skull eyes marked by the arrows decrease with each hit: 4 → 3 → 2 → 1 → 0, leaving you Groggy."),
    this.t("Space 지옥강타 · Shift 사슬 · 방향키 + Space 전격이동 · 왼쪽 Ctrl 유령걸음으로 순서와 상관없이 각각 한 번씩 탈출하세요. 이미 성공한 방법은 중복 집계하지 않습니다. 탈출 후 그로기와 자원·쿨타임을 다시 준비합니다. Space 지옥강타는 방향키를 떼고 누르세요.","Escape once with each method, in any order: Space for Hell Slam, Shift for the chain, direction + Space for Lightning Dash, and Left Ctrl for Ghost Walk. Repeating a completed method does not count. Groggy, resources and cooldowns reset for the next attempt. Release direction keys before using Space for Hell Slam."),
    this.t("마우스로 이동할 곳을 가리키고 Shift를 누르세요. 오래 누를수록 더 멀리 이동하며 기동력과 스태미나 소모가 커집니다. 1·2단은 키를 떼면 발사하고, 3단 충전이 끝나면 자동 발사합니다. 아래 단계별 수치를 확인하세요.","Point the mouse toward your destination and hold Shift. A longer hold moves you farther and costs more Mobility and Stamina. Release the key to launch tiers 1 and 2; tier 3 launches automatically at full charge. Check the values for each tier below."),
    this.t("Q 보호막 → E 검격 → Shift 사슬 순서로 기술을 사용하며, 각 기술이 쓰는 자원을 확인하세요. 세 짝을 모두 직접 실습해야 완료됩니다.","Use the Q shield → E sword strike → Shift chain in order and observe each resource cost. You must perform all three pairs to complete the exercise."),
    this.t("방향키 또는 WASD를 누른 채 Space로 전격이동을 5번 사용하세요. 매번 노란 기동력과 파란 마력이 함께 줄어드는 것을 확인하세요. 이동이 끝나면 Space를 떼고 다시 누르세요.","Hold an arrow key or WASD and use Space for Lightning Dash 5 times. Watch both yellow Mobility and blue Mana decrease each time. Release Space after each dash before pressing it again."),
    this.t("보호막의 기본 피해 흡수율은 30%입니다. 수호신 패시브는 레벨당 +2%p, 견갑의 블록흡수 옵션은 +4~22%p를 더하며 합산 최대 50%입니다. 이번 실습처럼 패링 타이밍 이후 계속 홀딩하면 흡수율은 절반(기본 15%, 최대 25%), 남은 피해는 1.3배가 됩니다. 홀딩 중에는 마지막 해골눈을 지켜 그로기를 막지만 HP 피해는 받습니다. Q를 떼지 말고 3발 모두 받아내세요.","Base shield absorption is 30%. Guardian Spirit adds 2 percentage points per level; the pauldron Block Absorption affix adds 4–22 points, up to 50% total. Continuing to hold past the parry window, as in this exercise, halves absorption (15% base, 25% maximum) and multiplies the remaining damage by 1.3. Holding preserves the last skull eye and prevents Groggy, but you still lose HP. Keep holding Q through all 3 hits."),
    this.t("왼쪽 Ctrl을 눌러 유령걸음을 발동하세요. 이번 실습에서는 유령걸음을 제공하며, 발동 후 Ctrl 슬롯의 쿨타임도 확인하세요.","Press Left Ctrl to activate Ghost Walk. It is provided for this exercise. After activation, check the cooldown on the Ctrl slot."),
    this.t("줄어든 체력(HP)·스태미나·마력·기동력을 확인하고 Q로 탄을 2회 패링하세요. 매번 실제 패링 보상으로 네 자원이 모두 회복되어야 합니다. 첫 성공 후 자원을 다시 낮춰 두 번째 실습을 준비합니다.","Check your reduced HP, Stamina, Mana and Mobility, then parry 2 projectiles with Q. Each successful parry must restore all four resources through the actual parry reward. After the first success, resources are lowered again for the second attempt."),
    this.t("영역스킬은 영역 안에서 각종 버프를 주거나 적에게 너프(약화 효과)를 부여하는 기술입니다. 기본인 회복의 영역부터 사용해보세요. F를 눌러 현재 위치에 설치한 뒤, 영역 안에 머물며 HP·MP·ST가 회복되는 것을 확인하세요. 회복의 영역은 자원 회복과 다른 스킬의 쿨다운 회복을 돕습니다.","Area skills grant buffs inside their zone or weaken enemies. Try the basic Holy Dome first. Press F to place it at your location, then stay inside and watch HP, MP and ST recover. Holy Dome helps restore resources and recover other skill cooldowns.")
  ]; },
  save() {
    this.savedFSlot=SKILL_SLOTS[5];this.savedSlotLength=SKILL_SLOTS.length;
    const names=['_hdCd','poise','maxPoise','poiseR','s','st2','activeCtSk','_stCd','_stWingT','_gwActive','_gwCd','_gwT','_gwMax','_gwCount','_gwHitSet','_gwPath','_gwMarkedEns','_gwPrevS'];
    this.saved=names.map(key=>({key,had:Object.prototype.hasOwnProperty.call(P,key),value:P[key]}));
    this.savedMats={had:Object.prototype.hasOwnProperty.call(G,'mats'),value:G.mats};
  },
  restore() {
    this.clearEyeFocus();
    if(!this.saved)return;
    this.clearArea();SKILL_SLOTS[5]=this.savedFSlot;SKILL_SLOTS.length=this.savedSlotLength;
    for(const {key,had,value} of this.saved){if(had)P[key]=value;else delete P[key];}
    if(this.savedMats.had)G.mats=this.savedMats.value;else delete G.mats;
    this.saved=null;
  },
  start(l) {
    l.clearShot();l.resetPose();l.setRageFocus(false);
    ens=[];_shDirty=true;
    l.panel.remove();l.backdrop.remove();l.rageZoom.remove();
    l.chapter=2;l.checks=Array(this.labels.length).fill(false);l.resourceGuide=null;
    l.step=0;l.pending=null;l.phase='practice';l.focusTicks=0;l.failTicks=0;
    P.skills={...P.skills,ghostWalk:Math.max(1,P.skills.ghostWalk||0)};
    P.activeCtSk='ghostWalk';P._gwActive=false;P._gwCd=0;
    P.poise=4;P.maxPoise=4;P.poiseR=0;
    l.build();
    l.rowLabels.forEach((row,step)=>{if(!this.stepOrder.includes(step))row.remove();});
    l.rowLabels[3].after(l.rowLabels[10]);
    this.enter(l);l.render();
  },
  actions(l) {
    if(l.step===9&&this.recoveryWait>0)return [];
    if(l.step===3)return this.escapeWait>0?[]:['bow','charge','up','down','left','right'];
    if(l.step===5)return this.resourceWait>0?[]:[this.resourceSets[this.resourceIndex].action];
    return [[],['parry'],[],['charge','up','down','left','right','bow'],['charge'],['shield'],['up','down','left','right','bow'],['parry'],[],['parry']][l.step]||[];
  },
  allowKey(l,code) {
    if(l.step===10){
      if(code!=='KeyF')return false;
      if(!this.areaPressed){this.areaPressed=true;this.areaBaseline={hp:P.hp,mp:P.mp,st:P.st};}
      return true;
    }
    if(l.step===3&&this.escapeWait>0)return false;
    const ok=(l.step===8||l.step===3)&&code==='ControlLeft'||this.actions(l).some(a=>code===BINDS[a]||code===BINDS2[a]||a==='charge'&&code==='ShiftLeft');
    if(ok&&l.step===5&&!this.resourcePressed){this.resourcePressed=true;this.resourceBaseline={mp:P.mp,st:P.st,gauge:_harpGauge};}
    if(ok&&l.step===3&&P.s==='pStun'){
      const attempt=code==='ControlLeft'?3:code==='ShiftLeft'?1:code===BINDS.bow||code===BINDS2.bow?(l.directionHeld()?2:0):code===BINDS.charge||code===BINDS2.charge?1:-1;
      if(attempt>=0){this.escapeAttempt=attempt;this.escapePressed=true;}
    }
    if(ok&&l.step===6&&(code===BINDS.bow||code===BINDS2.bow)&&l.directionHeld())l.armDashPractice(code);
    return ok;
  },
  enter(l,preserveRecovery=false) {
    this.clearArea();
    l.chainPractice=null;
    l.clearShot();l.resetPose();P._gwActive=false;P._gwCd=0;P._stWingT=0;P._stCd=9999;
    P.hp=P.mhp;P.mp=P.mmp;P.st=P.mst;P.shield=l.saved.shield;
    P.iframes=0;_harpGauge=_HARP_GAUGE_MAX;
    this.parried=false;this.hits=0;this.wait=60;this.escapePressed=false;this.guardFired=false;
    this.burstShots=[];this.hitShots=new Set();this.burstSpawned=0;
    this.retryTicks=0;this.feedback='';
    P.poise=l.step===1?3:l.step===3?0:l.step===7?1:4;
    if(l.step===3){this.escapeChecks=Array(4).fill(false);this.escapeWait=0;this.prepareEscape(l);}
    if(l.step===5){this.resourceIndex=0;this.resourceChecks=Array(3).fill(false);this.prepareResource(l);}
    if(l.step===10){
      P.skills={...P.skills,holyDome:1};SKILL_SLOTS[5]='holyDome';P._hdCd=0;
      P.hp=Math.max(1,P.mhp*.5);P.mp=P.mmp*.5;P.st=P.mst*.5;
      this.areaBeforeZones=new Set(G._fireZones||[]);this.areaPressed=false;
    }
    if(l.step===9){
      if(!preserveRecovery)this.recoveryCount=0;
      this.recoveryWait=0;this.beforeParry=null;
      P.hp=Math.max(1,P.mhp*.4);P.st=P.mst*.4;P.mp=P.mmp*.4;_harpGauge=_HARP_GAUGE_MAX*.4;
    }
    this.baseline={hp:P.hp,st:P.st,mp:P.mp,gauge:_harpGauge,poise:P.poise};
    if(l.step===4)l.tickChainPractice();
  },
  clearArea() {
    if(this.areaZone&&G._fireZones?.includes(this.areaZone))G._fireZones=G._fireZones.filter(zone=>zone!==this.areaZone);
    this.areaZone=null;this.areaBeforeZones=null;this.areaPressed=false;
  },
  tickArea(l) {
    if(!this.areaPressed)return;
    const zone=(G._fireZones||[]).find(z=>z.type==='holyDome'&&!this.areaBeforeZones.has(z)&&z.t<z.maxT);
    if(!zone){if(P._hdCd>0){this.enter(l);this.feedback=this.t("영역이 사라졌습니다. F로 다시 설치하고 안에 머무르세요.","The zone has expired. Press F to place it again and stay inside.");l.render();}return;}
    this.areaZone=zone;
    const inside=Math.hypot(P.x-zone.x,P.y-zone.y)<zone.r,b=this.areaBaseline;
    if(P._hdCd>0&&inside&&P.hp>b.hp&&P.mp>b.mp&&P.st>b.st){
      this.feedback=this.t("회복의 영역 안에서 HP·MP·ST 회복 확인!","HP, MP and ST recovery confirmed inside Holy Dome!");l.completeStep();this.readout(l);
    }
  },
  prepareEscape(l) {
    l.resetPose();l.heldDirections.clear();
    P._gwActive=false;P._gwCd=0;P._gslCd=0;
    P.hp=P.mhp;P.mp=P.mmp;P.st=P.mst;_harpGauge=_HARP_GAUGE_MAX;
    P.poise=0;P.poiseR=0;P.s='pStun';P.st2=240;P.iframes=0;
    this.escapePressed=false;this.escapeAttempt=-1;this.escapeWait=0;
    this.feedback=this.t("자유 순서 · 체크되지 않은 탈출기를 사용하세요.","Any order · Use an escape method you have not checked off.");
  },
  prepareResource(l) {
    l.resetPose();l.heldDirections.clear();
    P.mp=P.mmp;P.st=P.mst;_harpGauge=_HARP_GAUGE_MAX;
    this.resourcePressed=false;this.resourceWait=0;
    this.resourceBaseline={mp:P.mp,st:P.st,gauge:_harpGauge};
    this.feedback=this.t("현재 목표: ","Current target: ")+this.resourceSets[this.resourceIndex].label;
  },
  tickResource(l) {
    if(this.resourceWait>0){
      if((this.resourceWait-=_dtSp)<=0){this.resourceIndex++;this.prepareResource(l);l.render();}
      return;
    }
    if(!this.resourcePressed)return;
    const b=this.resourceBaseline;
    const used=[P.s==='sBlock'&&P.mp<b.mp,P.s==='sBash'&&P.st<b.st,(_harpActive||_dashActive)&&_harpGauge<b.gauge&&P.st<b.st][this.resourceIndex];
    if(!used)return;
    // Make the real HUD loss obvious in this resource exercise, once per activation.
    if(this.resourceIndex===0)P.mp=Math.max(0,Math.min(P.mp,b.mp-P.mmp*.5));
    if(this.resourceIndex>0)P.st=Math.max(0,Math.min(P.st,b.st-P.mst*.5));
    if(this.resourceIndex===2)_harpGauge=Math.max(0,Math.min(_harpGauge,b.gauge-_HARP_GAUGE_MAX*.5));
    this.resourceChecks[this.resourceIndex]=true;this.resourcePressed=false;
    this.feedback=this.resourceSets[this.resourceIndex].label+this.t(" 확인! 연습용 소모: 최대치의 최소 50%"," confirmed! Practice cost: at least 50% of maximum.");
    if(this.resourceChecks.every(Boolean))l.completeStep();
    else{this.resourceWait=90;this.feedback+=this.t(" 키를 놓으세요. 잠시 후 다음 기술을 준비합니다."," Release the key. The next technique will be ready shortly.");}
    l.render();
  },
  render(l) {
    l.panel.setAttribute('data-kind','physical');l.panel.setAttribute('data-phase',l.phase);
    l.rows.forEach((box,i)=>{box.checked=l.checks[i];l.rowTexts[i].textContent=l.labels[i];l.rowLabels[i].setAttribute('data-current',String(i===l.step));l.rowLabels[i].setAttribute('data-complete',String(l.checks[i]));});
    l.status.textContent=l.phase==='intro'?this.t("2단계 · 준비","Chapter 2 · Ready"):l.phase==='practice'?this.t("직접 실습","Hands-on practice"):l.phase==='done'?this.t("2단계 완료","Chapter 2 complete"):this.t("성공","Success");
    l.keycap.textContent=[this.t("피격","Take a hit"),'Q',this.t("피격","Take a hit"),this.t("탈출기","Escape skill"),'SHIFT','E','↔ + SPACE',this.t("Q 홀딩","Hold Q"),'CTRL','Q','F'][l.step];
    if(l.step===3)l.keycap.textContent=this.t("자유 순서","Any order");
    l.title.textContent=l.phase==='done'?this.t("자원 실습 완료","Resource practice complete"):l.labels[l.step];
    l.subtitle.textContent=this.t("2단계 · {p0} / {p1}","Chapter 2 · {p0} / {p1}",{p0:(this.stepOrder.indexOf(l.step)+1),p1:(this.stepOrder.length)});
    const guideVisible=[0,1,2,5].includes(l.step)&&l.phase!=='done';
    l.panel.setAttribute('data-resource-guide',String(guideVisible));
    if(!l.resourceGuide){
      l.resourceGuide=l.node('div');l.resourceGuide.className='lesson-resource-guide';
      l.resourceGuide.append(l.node('p',()=>(this.t("해골눈 4개 · 정신력\n피격 −1 / 패링 +1 / 0이면 그로기","4 skull eyes · Poise\nHit −1 / Parry +1 / Groggy at 0"))));
      l.resourceGuideRows=this.resourceSets.map(s=>{const row=l.node('p',s.label);l.resourceGuide.append(row);return row;});
      l.subtitle.after(l.resourceGuide);
    }
    l.resourceGuide.hidden=!guideVisible;
    l.resourceGuideRows.forEach((row,i)=>{row.textContent=(l.step===5?(this.resourceChecks[i]?'✓ ':'□ '):'')+this.resourceSets[i].label;row.setAttribute('data-current',String(l.step===5&&i===this.resourceIndex));});
    l.hint.textContent=l.phase==='done'?this.t("모든 실습 성공! 잠시 후 1-1 전투로 이어집니다.","All exercises complete! Combat in 1-1 will resume shortly."):this.tips[l.step];
    if(l.step===5&&l.phase!=='done'){
      l.keycap.textContent=this.resourceSets[this.resourceIndex].key;
      l.hint.textContent=this.resourceWait>0?this.feedback:this.resourceSets[this.resourceIndex].tip+this.t(" 이번 연습에서는 해당 자원을 최대치의 최소 50% 소모합니다."," This exercise consumes at least 50% of the relevant resource maximum.");
    }
    l.holdBox.hidden=true;l.rageBox.hidden=true;l.button.hidden=l.phase!=='intro';l.button.textContent=this.t("2단계 실습 시작 →","Start chapter 2 practice →");
    l.progressFill.style.width=`${this.completionChecks(l).filter(Boolean).length/this.stepOrder.length*100}%`;
    if(!l.resourceReadout){l.resourceReadout=l.node('p');l.resourceReadout.className='lesson-resource-readout';l.hint.after(l.resourceReadout);}
    this.readout(l);
    this.eyeFocus(l);
    if(l.step===4)l.updateChainPractice();
  },
  clearEyeFocus() {
    this.eyeOverlay?.remove();this.eyeOverlay=null;this.eyeMarkers=null;
    for(const id of ['globeHP','globeMP'])document.getElementById(id)?.classList.remove('lesson-eye-focus');
  },
  eyeFocus(l) {
    const visible=l.active&&l.chapter===2&&[0,1,2].includes(l.step)&&['intro','practice'].includes(l.phase)&&!l.pending&&!l.checks[l.step];
    for(const id of ['globeHP','globeMP'])document.getElementById(id)?.classList.toggle('lesson-eye-focus',visible);
    if(!visible){this.clearEyeFocus();return;}
    if(!this.eyeOverlay){
      this.eyeOverlay=l.node('div');this.eyeOverlay.id='lessonEyePointers';this.eyeOverlay.setAttribute('aria-hidden','true');
      this.eyeMarkers=['hpEyeL','hpEyeR','mpEyeL','mpEyeR'].map((id,i)=>{
        const marker=l.node('div');marker.className='lesson-eye-pointer';
        if(i%2===0){const caption=l.node('span',()=>(this.t("▼ 해골눈 · 정신력","▼ Skull eyes · Poise")));caption.className='lesson-eye-caption';marker.append(caption);marker.lessonCaption=caption;}
        this.eyeOverlay.append(marker);return {id,marker};
      });
      document.body.append(this.eyeOverlay);
    }
    this.eyeOverlay.hidden=false;
    for(const {id,marker} of this.eyeMarkers){
      if(marker.lessonCaption)marker.lessonCaption.textContent=l.step===1?this.t("▼ 해골눈 · 정신력 회복","▼ Skull eyes · Poise recovery"):l.step===7?this.t("▼ 해골눈 · 그로기 저항","▼ Skull eyes · Groggy resistance"):this.t("▼ 해골눈 · 정신력 감소","▼ Skull eyes · Poise loss");
      const eye=document.getElementById(id);const rect=eye?.getBoundingClientRect();
      marker.hidden=!rect||rect.width<=0||rect.height<=0;
      if(marker.hidden)continue;
      marker.style.left=`${rect.left+rect.width/2}px`;marker.style.top=`${rect.top+rect.height/2}px`;
    }
  },
  readout(l) {
    const eye=P.s==='pStun'?0:Math.max(0,Math.min(4,P.poise||0));
    l.resourceReadout.textContent=this.t("정신력 {p0}/4 · HP {p1}/{p2}\n기동력 {p3}/{p4}\nST {p5}/{p6} · MP {p7}/{p8}{p9}","Poise {p0}/4 · HP {p1}/{p2}\nMobility {p3}/{p4}\nST {p5}/{p6} · MP {p7}/{p8}{p9}",{p0:(eye),p1:(Math.ceil(P.hp)),p2:(P.mhp),p3:(Math.floor(_harpGauge)),p4:(_HARP_GAUGE_MAX),p5:(Math.floor(P.st)),p6:(P.mst),p7:(Math.floor(P.mp)),p8:(P.mmp),p9:(this.feedback?'\n'+this.feedback:'')});
    if(l.step===5)l.resourceReadout.textContent+=this.t("\n자원·기술 확인 ","\nResource/skill pairs confirmed ")+this.resourceChecks.filter(Boolean).length+'/3';
    if(l.step===6)l.resourceReadout.textContent+=this.t("\n전격이동 성공 ","\nSuccessful dashes ")+(l.dashPractice?.count||0)+'/5';
    if(l.step===9)l.resourceReadout.textContent+=this.t("\n자원 회복 성공 ","\nResource recovery successes ")+this.recoveryCount+'/2';
    if(l.step===3)l.resourceReadout.textContent+=this.t("\n탈출 성공 ","\nSuccessful escapes ")+this.escapeChecks.filter(Boolean).length+'/4\n'+this.escapeLabels.map((name,i)=>(this.escapeChecks[i]?'✓ ':'□ ')+name).join('\n');
    if(l.step===7)l.resourceReadout.textContent+=this.t("\n현재 보호막 흡수율 {p0}% · 이번 홀딩 적용 {p1}%","\nCurrent shield absorption {p0}% · Applied while holding {p1}%",{p0:(Math.round(pGuardAbsorb()*100)),p1:(Math.round(Math.min(.25,pGuardAbsorb()*.5)*100))});
    if(l.step===4){
      const rows=[1,2,3].map(t=>this.t("{p0}단 · {p1}\n최대 거리 {p2} · 기동력 {p3}({p4}칸) · ST {p5}%","Tier {p0} · {p1}\nMax distance {p2} · Mobility {p3} ({p4} segments) · ST {p5}%",{p0:(t),p1:(t===1?this.t("짧게 탭","Brief tap"):this.t("{p0}초 홀딩{p1}","Hold for {p0}s{p1}",{p0:(_HARP_TIER_F[t]/60),p1:(t===3?this.t(" → 자동 발사"," → Automatic launch"):'')})),p2:(_harpDistTier(t)),p3:(_HARP_GAUGE_COST[t]),p4:((_HARP_GAUGE_COST[t]/_HARP_GAUGE_COST[1]).toFixed(t===1?0:2)),p5:(t)}));
      const current=l.chainPractice?.feedback||this.t("1단 → 2단 → 3단을 순서대로 모두 이동해 보세요.","Complete chain movement at tier 1 → tier 2 → tier 3 in order.");
      l.resourceReadout.textContent+='\n\n'+rows.join('\n')+'\n'+current;
    }
  },
  hit(l,p,kind) {
    if(l.step===9&&(this.recoveryWait>0||this.retryTicks>0||this.parried))return;
    if(l.step===7&&l.phase==='practice'&&!l.pending&&this.burstShots.includes(p)){this.retryGuard();return;}
    if(l.phase!=='practice'||l.pending||p!==l.shot||kind!=='magic')return;
    if(l.step===1||l.step===9){this.parried=true;this.beforeParry={hp:P.hp,poise:P.poise,st:P.st,mp:P.mp,gauge:_harpGauge};}
  },
  miss(l,p,absorbed=false) {
    if(l.step===7&&(!this.guardFired||!this.burstShots.includes(p)))return;
    if(l.phase!=='practice'||l.pending||this.retryTicks||(p!==l.shot&&!this.burstShots.includes(p))||p.friendly||this.hitShots.has(p))return;
    this.hitShots.add(p);
    const guarding=l.step===7&&P.s==='sBlock';
    l.explode(p);doHitFlash('#ff4422',.35);shake(7);playSample(absorbed||guarding?'shield_hit':'player_hit1',.6,1);
    const raw=Math.max(2,Math.ceil(P.mhp*(l.step===7?.02:.1)));
    const absorb=guarding?raw-Math.max(1,Math.floor(raw*(1-Math.min(.25,pGuardAbsorb()*.5)))):0;
    const damage=Math.min(P.hp-1,guarding?Math.floor((raw-absorb)*1.3):raw);
    P.hp=Math.max(1,P.hp-damage);
    if(!guarding){P.poise=Math.max(0,P.poise-1);P.poiseR=0;}
    else P.poise=Math.max(1,P.poise-1);
    addTxt(P.x,P.y-30,`-${damage} HP`,'#ff6644',60);
    this.hits++;if(l.step!==2)this.wait=75;
    if(P.poise<=0){P.s='pStun';P.st2=240;P.iframes=0;}
    if(l.step===0&&P.poise===3&&P.hp<this.baseline.hp)l.completeStep();
    else if(l.step===2&&P.poise===0&&this.hits>=4)l.completeStep();
    else if(guarding&&absorb>0&&P.s==='sBlock'&&P.poise>=1){
      this.feedback=this.t("연속 흡수 {p0}/3 · 흡수 {p1} · 실제 피해 {p2} · 그로기 없음","Consecutive blocks {p0}/3 · Absorbed {p1} · Actual damage {p2} · No Groggy",{p0:(this.hits),p1:(absorb),p2:(damage)});
      if(this.guardFired&&this.burstSpawned===3&&this.hits===3)l.completeStep();
    }
    else if(l.step===1||l.step===7||l.step===9){this.retryTicks=75;this.feedback=this.t("다시 시도합니다. 같은 단계에서 연습하세요.","Try again. Keep practicing this step.");}
  },
  fire(l) {
    if(l.step===9){this.parried=false;this.beforeParry=null;}
    l.shot=spawnProj({x:P.x,y:P.y-800,vx:0,vy:4,dmg:0,el:EL.D,col:'#a44cff',parryClass:'magic',life:420,ml:420,friendly:false,_commit:true,_lessonShot:true});
    if(l.shot){l.shot.vx=0;l.shot.vy=4;l.shot.homing=true;l.shot._lessonExploded=false;if(l.step===2){this.burstShots.push(l.shot);this.burstSpawned++;}}
  },
  fireGuardBurst(l) {
    this.guardFired=true;
    // Allocate the whole stream before collisions so projectile-pool reuse cannot alias hit identities.
    for(let i=0;i<3;i++){
      const p=spawnProj({x:P.x,y:P.y-800-i*24,vx:0,vy:4,dmg:0,el:EL.D,col:'#a44cff',parryClass:'magic',life:600,ml:600,friendly:false,_commit:true,_lessonShot:true});
      if(!p){this.retryGuard();return;}
      p.vx=0;p.vy=4;p.homing=true;p._lessonExploded=false;
      this.burstShots.push(p);this.burstSpawned++;
    }
    this.feedback=this.t("연속 흡수 0/3 · Q를 계속 누르세요","Consecutive blocks 0/3 · Keep holding Q");
  },
  retryGuard() {
    this.retryTicks=75;
    this.feedback=this.t("홀딩을 유지해 3발을 모두 받아내세요. 처음부터 다시 시도합니다.","Keep holding through all 3 projectiles. Try again from the beginning.");
  },
  tick(l) {
    this.eyeFocus(l);
    if(G.paused)return false;
    if(l.pending){l.phase=l.pending;l.pending=null;l.transitionTicks=90;l.render();}
    if(l.phase==='intro')return true;
    this.readout(l);
    if(l.phase==='success'||l.phase==='done'){
      if((l.transitionTicks-=_dtSp)>0)return false;
      if(l.phase==='done'){l.finish();return false;}
      l.step=this.stepOrder[this.stepOrder.indexOf(l.step)+1];l.phase='practice';this.enter(l);l.render();return false;
    }
    if(this.retryTicks>0){l.clearShot(true);if((this.retryTicks-=_dtSp)<=0){this.enter(l,l.step===9);l.render();}return false;}
    if(l.step===9&&this.recoveryWait>0){
      if((this.recoveryWait-=_dtSp)<=0){this.enter(l,true);l.render();}
      return false;
    }
    if(l.step===3&&this.escapeWait>0){
      if((this.escapeWait-=_dtSp)<=0){this.prepareEscape(l);l.render();}
      return false;
    }
    if([0,1,2,7,9].includes(l.step)){P.kb.x=0;P.kb.y=0;}
    // Keep an earned groggy state until the user performs the escape, not a timeout.
    if(l.step===3&&P.s==='pStun')P.st2=240;
    if(l.step===3&&P.s!=='pStun'){
      const attempt=this.escapeAttempt;
      const escaped=[P.s==='gSlamWindup',P.s==='idle'&&P.poise===4,P._bdMoveT>0,P._gwActive&&P._gwCd>0][attempt];
      if(this.escapePressed&&escaped){
        const repeated=this.escapeChecks[attempt];
        this.escapeChecks[attempt]=true;this.escapePressed=false;
        this.feedback=this.escapeLabels[attempt]+(repeated?this.t(" · 이미 성공한 탈출기입니다."," · This escape method is already complete."):this.t(" 성공!"," successful!"));
        if(this.escapeChecks.every(Boolean))l.completeStep();
        else{this.escapeWait=90;this.feedback+=this.t(" 잠시 후 남은 탈출기를 자유롭게 연습하세요."," Practice any remaining escape method when ready.");}
        this.readout(l);
      }else{
        this.escapePressed=false;this.escapeWait=90;
        this.feedback=this.t("탈출 발동이 확인되지 않았습니다. 잠시 후 원하는 방법으로 다시 시도하세요.","No escape activation was confirmed. Try your preferred method again shortly.");
        this.readout(l);
      }
    }
    if(l.step===10)this.tickArea(l);
    if(l.step===4){l.tickChainPractice();this.readout(l);}
    if(l.step===5)this.tickResource(l);
    if(l.step===6){l.tickDashPractice(true);this.readout(l);}
    if(l.step===8&&P._gwActive&&P._gwCd>0)l.completeStep();
    if(this.parried){
      const b=this.beforeParry;
      if(l.step===1&&P.poise>b.poise)l.completeStep();
      if(l.step===9&&P.hp>b.hp&&P.mp>b.mp&&P.st>b.st&&_harpGauge>b.gauge){
        this.parried=false;this.beforeParry=null;this.recoveryCount++;
        l.clearShot(true);
        this.feedback=this.t("네 자원 회복 확인!","All four resources restored!");
        if(this.recoveryCount>=2)l.completeStep();
        else{this.recoveryWait=90;this.feedback+=this.t(" Q를 놓으세요. 잠시 후 두 번째 패링을 준비합니다."," Release Q. The second parry attempt will be ready shortly.");}
        l.render();return false;
      }
    }
    if(l.pending)return false;
    if(l.step===2){
      if(this.burstSpawned<4&&(this.wait-=_dtSp)<=0){this.fire(l);this.wait=24;}
      if(this.burstSpawned===4&&this.hits<4&&this.burstShots.every(p=>this.hitShots.has(p)||p.friendly||p.life<=0||!projs.includes(p))){
        this.retryTicks=75;this.feedback=this.t("탄을 피했습니다. 정신력 감소 실습을 위해 이번에는 4발을 연속으로 받아보세요.","You avoided a projectile. Take all 4 hits in succession this time to observe Poise loss.");
      }
      return false;
    }
    if(l.step===7){
      if(this.guardFired){
        if(P.s!=='sBlock'||this.burstShots.some(p=>!this.hitShots.has(p)&&(p.friendly||p.life<=0||!projs.includes(p))))this.retryGuard();
      }else if(P.s==='sBlock'&&(P._sbHoldT||0)>=30&&(this.wait-=_dtSp)<=0)this.fireGuardBurst(l);
      return false;
    }
    if(l.shot&&!projs.includes(l.shot)){l.shot=null;this.wait=75;}
    if(![0,1,2,7,9].includes(l.step))return false;
    if(!l.shot&&(this.wait-=_dtSp)<=0)this.fire(l);
    return false;
  }
};
