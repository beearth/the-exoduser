/* Chapter 2 shares the combat lesson's isolated world and restores its original snapshot. */
window._resourcePractice = {
  escapeLabels: ['Space · 지옥강타','Shift · 사슬 탈출','방향키 + Space · 전격이동','왼쪽 Ctrl · 유령걸음'],
  resourceSets: [
    {key:'Q',action:'parry',label:'Q 보호막 · 파란 마력(MP)',tip:'Q로 보호막을 펼쳐 파란 마력(MP) 소모를 확인하세요. 홀딩 중에도 소모되며, 마법탄 패링에 성공하면 자원이 회복됩니다.'},
    {key:'E',action:'shield',label:'E 검격 · 스태미나(ST)',tip:'E를 짧게 눌렀다 떼어 검격을 사용하세요. 스태미나는 E 검격 같은 신체 기술에 쓰입니다.'},
    {key:'SHIFT',action:'charge',label:'Shift 사슬 · 노란 기동력 + ST',tip:'마우스로 열린 바닥을 가리키고 왼쪽 Shift를 눌렀다 떼세요. 사슬 발사로 노란 기동력과 스태미나가 함께 줄어듭니다.'}
  ],
  labels: ['자원 소개 · 해골눈','Q 패링 · 정신력 회복','4회 피격 · 그로기','그로기 탈출 · 4가지 방법','Shift · 사슬 1·2·3단','자원 실습 · Q·E·Shift','방향키 + Space · 마력·기동력 소모','Q 홀딩 · 흡수와 그로기 저항','왼쪽 Ctrl · 스킬 발동','Q 패링 · 자원 회복'],
  tips: [
    '해골눈 4개는 정신력입니다. 피격 −1, 패링 +1, 0이면 그로기입니다. Q·E·Shift와 자원 짝을 살펴본 뒤, 탄을 한 번 맞아보세요.',
    '다가오는 마법탄을 Q로 패링하세요. 실제 패링에 성공하면 꺼진 해골눈 1개가 다시 켜집니다.',
    '4발이 연속으로 날아옵니다. 화살표가 가리키는 해골눈이 피격마다 4 → 3 → 2 → 1 → 0으로 줄어들고 그로기에 걸리는 것을 확인하세요.',
    'Space 지옥강타 → Shift → 방향키 + Space 전격이동 → 왼쪽 Ctrl 유령걸음 순서로 네 방법 모두 직접 탈출하세요. 성공할 때마다 그로기와 자원·쿨타임을 다시 준비합니다. Space 지옥강타는 방향키를 떼고 누르세요.',
    '마우스로 이동할 곳을 가리키고 Shift를 누르세요. 오래 누를수록 더 멀리 이동하며 기동력과 스태미나 소모가 커집니다. 1·2단은 키를 떼면 발사하고, 3단 충전이 끝나면 자동 발사합니다. 아래 단계별 수치를 확인하세요.',
    'Q 보호막 → E 검격 → Shift 사슬 순서로 기술을 사용하며, 각 기술이 쓰는 자원을 확인하세요. 세 짝을 모두 직접 실습해야 완료됩니다.',
    '방향키 또는 WASD를 누른 채 Space를 누르세요. 전격이동이 발동하면서 노란 기동력과 파란 마력이 함께 줄어듭니다.',
    '보호막의 기본 피해 흡수율은 30%입니다. 수호신 패시브는 레벨당 +2%p, 견갑의 블록흡수 옵션은 +4~22%p를 더하며 합산 최대 50%입니다. 이번 실습처럼 패링 타이밍 이후 계속 홀딩하면 흡수율은 절반(기본 15%, 최대 25%), 남은 피해는 1.3배가 됩니다. 홀딩 중에는 마지막 해골눈을 지켜 그로기를 막지만 HP 피해는 받습니다. Q를 떼지 말고 3발 모두 받아내세요.',
    '왼쪽 Ctrl을 눌러 유령걸음을 발동하세요. 이번 실습에서는 유령걸음을 제공하며, 발동 후 Ctrl 슬롯의 쿨타임도 확인하세요.',
    '줄어든 체력(HP)·스태미나·마력·기동력을 확인하고 Q로 탄을 패링하세요. 실제 패링 보상으로 네 자원이 모두 회복되면 성공입니다.'
  ],
  save() {
    const names=['poise','maxPoise','poiseR','s','st2','activeCtSk','_stCd','_stWingT','_gwActive','_gwCd','_gwT','_gwMax','_gwCount','_gwHitSet','_gwPath','_gwMarkedEns','_gwPrevS'];
    this.saved=names.map(key=>({key,had:Object.prototype.hasOwnProperty.call(P,key),value:P[key]}));
    this.savedMats={had:Object.prototype.hasOwnProperty.call(G,'mats'),value:G.mats};
  },
  restore() {
    this.clearEyeFocus();
    if(!this.saved)return;
    for(const {key,had,value} of this.saved){if(had)P[key]=value;else delete P[key];}
    if(this.savedMats.had)G.mats=this.savedMats.value;else delete G.mats;
    this.saved=null;
  },
  start(l) {
    l.clearShot();l.resetPose();l.setRageFocus(false);
    ens=[];_shDirty=true;
    l.panel.remove();l.backdrop.remove();l.rageZoom.remove();
    l.chapter=2;l.labels=this.labels.slice();l.checks=Array(this.labels.length).fill(false);l.resourceGuide=null;
    l.step=0;l.pending=null;l.phase='practice';l.focusTicks=0;l.failTicks=0;
    P.skills={...P.skills,ghostWalk:Math.max(1,P.skills.ghostWalk||0)};
    P.activeCtSk='ghostWalk';P._gwActive=false;P._gwCd=0;
    P.poise=4;P.maxPoise=4;P.poiseR=0;
    l.build();this.enter(l);l.render();
  },
  actions(l) {
    if(l.step===3)return this.escapeWait>0?[]:[['bow'],['charge'],['up','down','left','right','bow'],[]][this.escapeIndex]||[];
    if(l.step===5)return this.resourceWait>0?[]:[this.resourceSets[this.resourceIndex].action];
    return [[],['parry'],[],['charge','up','down','left','right','bow'],['charge'],['shield'],['up','down','left','right','bow'],['parry'],[],['parry']][l.step]||[];
  },
  allowKey(l,code) {
    if(l.step===3){
      if(this.escapeWait>0)return false;
      if(code===BINDS.bow||code===BINDS2.bow){
        if(this.escapeIndex===0&&l.directionHeld()||this.escapeIndex===2&&!l.directionHeld())return false;
      }
    }
    const ok=(l.step===8||l.step===3&&this.escapeIndex===3)&&code==='ControlLeft'||this.actions(l).some(a=>code===BINDS[a]||code===BINDS2[a]||a==='charge'&&code==='ShiftLeft');
    if(ok&&l.step===5&&!this.resourcePressed){this.resourcePressed=true;this.resourceBaseline={mp:P.mp,st:P.st,gauge:_harpGauge};}
    if(ok&&l.step===3&&P.s==='pStun'&&(code==='ControlLeft'||code==='ShiftLeft'||code===BINDS.bow||code===BINDS2.bow||code===BINDS.charge||code===BINDS2.charge))this.escapePressed=true;
    if(ok&&l.step===6&&code===BINDS.bow&&l.directionHeld())l.directionSpace=true;
    return ok;
  },
  enter(l) {
    l.chainPractice=null;
    l.clearShot();l.resetPose();P._gwActive=false;P._gwCd=0;P._stWingT=0;P._stCd=9999;
    P.hp=P.mhp;P.mp=P.mmp;P.st=P.mst;P.shield=l.saved.shield;
    P.iframes=0;_harpGauge=_HARP_GAUGE_MAX;
    this.parried=false;this.hits=0;this.wait=60;this.escapePressed=false;this.guardFired=false;
    this.burstShots=[];this.hitShots=new Set();this.burstSpawned=0;
    this.retryTicks=0;this.feedback='';
    P.poise=l.step===1?3:l.step===3?0:l.step===7?1:4;
    if(l.step===3){this.escapeIndex=0;this.escapeChecks=Array(4).fill(false);this.escapeWait=0;this.prepareEscape(l);}
    if(l.step===5){this.resourceIndex=0;this.resourceChecks=Array(3).fill(false);this.prepareResource(l);}
    if(l.step===9){P.hp=Math.max(1,P.mhp*.4);P.st=P.mst*.4;P.mp=P.mmp*.4;_harpGauge=_HARP_GAUGE_MAX*.4;}
    this.baseline={hp:P.hp,st:P.st,mp:P.mp,gauge:_harpGauge,poise:P.poise};
    if(l.step===4)l.tickChainPractice();
  },
  prepareEscape(l) {
    l.resetPose();l.heldDirections.clear();
    P._gwActive=false;P._gwCd=0;P._gslCd=0;
    P.hp=P.mhp;P.mp=P.mmp;P.st=P.mst;_harpGauge=_HARP_GAUGE_MAX;
    P.poise=0;P.poiseR=0;P.s='pStun';P.st2=480;P.iframes=0;
    this.escapePressed=false;this.escapeWait=0;
    this.feedback='현재 목표: '+this.escapeLabels[this.escapeIndex];
  },
  prepareResource(l) {
    l.resetPose();l.heldDirections.clear();
    P.mp=P.mmp;P.st=P.mst;_harpGauge=_HARP_GAUGE_MAX;
    this.resourcePressed=false;this.resourceWait=0;
    this.resourceBaseline={mp:P.mp,st:P.st,gauge:_harpGauge};
    this.feedback='현재 목표: '+this.resourceSets[this.resourceIndex].label;
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
    this.resourceChecks[this.resourceIndex]=true;this.resourcePressed=false;
    this.feedback=this.resourceSets[this.resourceIndex].label+' 확인!';
    if(this.resourceChecks.every(Boolean))l.completeStep();
    else{this.resourceWait=90;this.feedback+=' 키를 놓으세요. 잠시 후 다음 기술을 준비합니다.';}
    l.render();
  },
  render(l) {
    l.panel.setAttribute('data-kind','physical');l.panel.setAttribute('data-phase',l.phase);
    l.rows.forEach((box,i)=>{box.checked=l.checks[i];l.rowTexts[i].textContent=l.labels[i];l.rowLabels[i].setAttribute('data-current',String(i===l.step));l.rowLabels[i].setAttribute('data-complete',String(l.checks[i]));});
    l.status.textContent=l.phase==='intro'?'2단계 · 준비':l.phase==='practice'?'직접 실습':l.phase==='done'?'2단계 완료':'성공';
    l.keycap.textContent=['피격','Q','피격','탈출기','SHIFT','E','↔ + SPACE','Q 홀딩','CTRL','Q'][l.step];
    if(l.step===3)l.keycap.textContent=['SPACE','SHIFT','↔ + SPACE','CTRL'][this.escapeIndex];
    l.title.textContent=l.phase==='done'?'자원 실습 완료':l.labels[l.step];
    l.subtitle.textContent=`2단계 · ${l.step+1} / ${l.labels.length}`;
    const guideVisible=[0,1,2,5].includes(l.step)&&l.phase!=='done';
    l.panel.setAttribute('data-resource-guide',String(guideVisible));
    if(!l.resourceGuide){
      l.resourceGuide=l.node('div');l.resourceGuide.className='lesson-resource-guide';
      l.resourceGuide.append(l.node('p','해골눈 4개 · 정신력\n피격 −1 / 패링 +1 / 0이면 그로기'));
      l.resourceGuideRows=this.resourceSets.map(s=>{const row=l.node('p',s.label);l.resourceGuide.append(row);return row;});
      l.subtitle.after(l.resourceGuide);
    }
    l.resourceGuide.hidden=!guideVisible;
    l.resourceGuideRows.forEach((row,i)=>{row.textContent=(l.step===5?(this.resourceChecks[i]?'✓ ':'□ '):'')+this.resourceSets[i].label;row.setAttribute('data-current',String(l.step===5&&i===this.resourceIndex));});
    l.hint.textContent=l.phase==='done'?'모든 실습 성공! 잠시 후 1-1 전투로 이어집니다.':this.tips[l.step];
    if(l.step===5&&l.phase!=='done'){
      l.keycap.textContent=this.resourceSets[this.resourceIndex].key;
      l.hint.textContent=this.resourceWait>0?this.feedback:this.resourceSets[this.resourceIndex].tip;
    }
    l.holdBox.hidden=true;l.rageBox.hidden=true;l.button.hidden=l.phase!=='intro';l.button.textContent='2단계 실습 시작 →';
    l.progressFill.style.width=`${l.checks.filter(Boolean).length/l.labels.length*100}%`;
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
        if(i%2===0){const caption=l.node('span','▼ 해골눈 · 정신력');caption.className='lesson-eye-caption';marker.append(caption);marker.lessonCaption=caption;}
        this.eyeOverlay.append(marker);return {id,marker};
      });
      document.body.append(this.eyeOverlay);
    }
    this.eyeOverlay.hidden=false;
    for(const {id,marker} of this.eyeMarkers){
      if(marker.lessonCaption)marker.lessonCaption.textContent=l.step===1?'▼ 해골눈 · 정신력 회복':l.step===7?'▼ 해골눈 · 그로기 저항':'▼ 해골눈 · 정신력 감소';
      const eye=document.getElementById(id);const rect=eye?.getBoundingClientRect();
      marker.hidden=!rect||rect.width<=0||rect.height<=0;
      if(marker.hidden)continue;
      marker.style.left=`${rect.left+rect.width/2}px`;marker.style.top=`${rect.top+rect.height/2}px`;
    }
  },
  readout(l) {
    const eye=P.s==='pStun'?0:Math.max(0,Math.min(4,P.poise||0));
    l.resourceReadout.textContent=`정신력 ${eye}/4 · HP ${Math.ceil(P.hp)}/${P.mhp}\n기동력 ${Math.floor(_harpGauge)}/${_HARP_GAUGE_MAX}\nST ${Math.floor(P.st)}/${P.mst} · MP ${Math.floor(P.mp)}/${P.mmp}${this.feedback?'\n'+this.feedback:''}`;
    if(l.step===5)l.resourceReadout.textContent+='\n자원·기술 확인 '+this.resourceChecks.filter(Boolean).length+'/3';
    if(l.step===3)l.resourceReadout.textContent+='\n탈출 성공 '+this.escapeChecks.filter(Boolean).length+'/4\n'+this.escapeLabels.map((name,i)=>(this.escapeChecks[i]?'✓ ':'□ ')+name).join('\n');
    if(l.step===7)l.resourceReadout.textContent+=`\n현재 보호막 흡수율 ${Math.round(pGuardAbsorb()*100)}% · 이번 홀딩 적용 ${Math.round(Math.min(.25,pGuardAbsorb()*.5)*100)}%`;
    if(l.step===4){
      const rows=[1,2,3].map(t=>`${t}단 · ${t===1?'짧게 탭':`${_HARP_TIER_F[t]/60}초 홀딩${t===3?' → 자동 발사':''}`}\n최대 거리 ${_harpDistTier(t)} · 기동력 ${_HARP_GAUGE_COST[t]}(${(_HARP_GAUGE_COST[t]/_HARP_GAUGE_COST[1]).toFixed(t===1?0:2)}칸) · ST ${t}%`);
      const current=l.chainPractice?.feedback||'1단 → 2단 → 3단을 순서대로 모두 이동해 보세요.';
      l.resourceReadout.textContent+='\n\n'+rows.join('\n')+'\n'+current;
    }
  },
  hit(l,p,kind) {
    if(l.step===7&&l.phase==='practice'&&!l.pending&&this.burstShots.includes(p)){this.retryGuard();return;}
    if(l.phase!=='practice'||l.pending||p!==l.shot||kind!=='magic')return;
    if(l.step===1||l.step===9){this.parried=true;this.beforeParry={hp:P.hp,poise:P.poise,st:P.st,mp:P.mp,gauge:_harpGauge};}
  },
  miss(l,p) {
    if(l.step===7&&(!this.guardFired||!this.burstShots.includes(p)))return;
    if(l.phase!=='practice'||l.pending||this.retryTicks||(p!==l.shot&&!this.burstShots.includes(p))||p.friendly||this.hitShots.has(p))return;
    this.hitShots.add(p);
    l.explode(p);doHitFlash('#ff4422',.35);shake(7);playSample('player_hit1',.6,1);
    const raw=Math.max(2,Math.ceil(P.mhp*(l.step===7?.02:.1)));
    const guarding=l.step===7&&P.s==='sBlock';
    const absorb=guarding?raw-Math.max(1,Math.floor(raw*(1-Math.min(.25,pGuardAbsorb()*.5)))):0;
    const damage=Math.min(P.hp-1,guarding?Math.floor((raw-absorb)*1.3):raw);
    P.hp=Math.max(1,P.hp-damage);
    if(!guarding){P.poise=Math.max(0,P.poise-1);P.poiseR=0;}
    else P.poise=Math.max(1,P.poise-1);
    addTxt(P.x,P.y-30,`-${damage} HP`,'#ff6644',60);
    this.hits++;if(l.step!==2)this.wait=75;
    if(P.poise<=0){P.s='pStun';P.st2=480;P.iframes=0;}
    if(l.step===0&&P.poise===3&&P.hp<this.baseline.hp)l.completeStep();
    else if(l.step===2&&P.poise===0&&this.hits>=4)l.completeStep();
    else if(guarding&&absorb>0&&P.s==='sBlock'&&P.poise>=1){
      this.feedback=`연속 흡수 ${this.hits}/3 · 흡수 ${absorb} · 실제 피해 ${damage} · 그로기 없음`;
      if(this.guardFired&&this.burstSpawned===3&&this.hits===3)l.completeStep();
    }
    else if(l.step===1||l.step===7||l.step===9){this.retryTicks=75;this.feedback='다시 시도합니다. 같은 단계에서 연습하세요.';}
  },
  fire(l) {
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
    this.feedback='연속 흡수 0/3 · Q를 계속 누르세요';
  },
  retryGuard() {
    this.retryTicks=75;
    this.feedback='홀딩을 유지해 3발을 모두 받아내세요. 처음부터 다시 시도합니다.';
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
      l.step++;l.phase='practice';this.enter(l);l.render();return false;
    }
    if(this.retryTicks>0){l.clearShot(true);if((this.retryTicks-=_dtSp)<=0){this.enter(l);l.render();}return false;}
    if(l.step===3&&this.escapeWait>0){
      if((this.escapeWait-=_dtSp)<=0){if(this.escapeChecks[this.escapeIndex])this.escapeIndex++;this.prepareEscape(l);l.render();}
      return false;
    }
    if([0,1,2,7,9].includes(l.step)){P.kb.x=0;P.kb.y=0;}
    // Keep an earned groggy state until the user performs the escape, not a timeout.
    if(l.step===3&&P.s==='pStun')P.st2=480;
    if(l.step===3&&P.s!=='pStun'){
      const escaped=[P.s==='gSlamWindup',P.poise===4,P._bdMoveT>0,P._gwActive&&P._gwCd>0][this.escapeIndex];
      if(this.escapePressed&&escaped){
        this.escapeChecks[this.escapeIndex]=true;this.escapePressed=false;
        this.feedback=this.escapeLabels[this.escapeIndex]+' 성공!';
        if(this.escapeChecks.every(Boolean))l.completeStep();
        else{this.escapeWait=90;this.feedback+=' 잠시 후 다음 탈출을 연습합니다.';}
        this.readout(l);
      }else{
        this.escapePressed=false;this.escapeWait=90;
        this.feedback='현재 안내된 방법으로 탈출하세요. 같은 방법을 다시 준비합니다.';
        this.readout(l);
      }
    }
    if(l.step===4){l.tickChainPractice();this.readout(l);}
    if(l.step===5)this.tickResource(l);
    if(l.step===6&&l.directionSpace&&P._bdMoveT>0&&P.mp<this.baseline.mp&&_harpGauge<this.baseline.gauge)l.completeStep();
    if(l.step===8&&P._gwActive&&P._gwCd>0)l.completeStep();
    if(this.parried){
      const b=this.beforeParry;
      if(l.step===1&&P.poise>b.poise)l.completeStep();
      if(l.step===9&&P.hp>b.hp&&P.mp>b.mp&&P.st>b.st&&_harpGauge>b.gauge)l.completeStep();
    }
    if(l.pending)return false;
    if(l.step===2){
      if(this.burstSpawned<4&&(this.wait-=_dtSp)<=0){this.fire(l);this.wait=24;}
      if(this.burstSpawned===4&&this.hits<4&&this.burstShots.every(p=>this.hitShots.has(p)||p.friendly||p.life<=0||!projs.includes(p))){
        this.retryTicks=75;this.feedback='탄을 피했습니다. 정신력 감소 실습을 위해 이번에는 4발을 연속으로 받아보세요.';
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
