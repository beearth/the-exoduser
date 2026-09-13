/* 1-1 guided practice. Completion requires actual movement, casts and combat hits. */
window._parryLesson = {
  active: false, seen: false, phase: 'intro', step: 0, checks: Array(8).fill(false), shot: null,
  labels: ['마법탄 패링', '물리탄 패링', 'Q 홀딩 · 다수 마법탄 패링', 'E 홀딩 · 다수 물리탄 패링', 'Shift · 사슬 이동', '방향키 + Space · 전격이동', '패링 · 분노 축적', 'Space · 분노 발동'],
  heldDirections: new Set(),
  skipKey() {
    const params=new URLSearchParams(location.search);
    const char=params.get('test')==='1'?null:params.get('char');
    return 'exoduser:tutorial-skipped:v2:'+(char?'char:'+encodeURIComponent(char):'slot:'+encodeURIComponent(params.get('slot')||'t1'));
  },
  resetForNewCharacter() {
    this.skippedKey=null;this.newCharacterKey=this.skipKey();this.seen=false;
    try{localStorage.removeItem(this.newCharacterKey);}catch{}
  },
  dismissed() {
    const key=this.skipKey();
    if(this.skippedKey===key)return true;
    // A new character and explicit replay bypass older opt-outs for this visit.
    if(this.newCharacterKey===key||new URLSearchParams(location.search).get('tutorial')==='1')return false;
    try{return localStorage.getItem(key)==='1';}catch{return false;}
  },
  skipAll() {
    this.skippedKey=this.skipKey();this.seen=true;
    try{localStorage.setItem(this.skippedKey,'1');}catch{}
    this.finish();
    const system=window._systemLesson;
    if(system){system.closed=true;system.active=false;system.panel?.remove();}
  },
  actions() { if(this.chapter===1&&this.step===8)return [];if(this.chapter===2)return window._resourcePractice.actions(this);if(this.step<0)return this.step===-2?['weapon']:this.step===-1?['beam']:[];return this.step === 4 ? ['charge'] : this.step === 5 ? ['up','down','left','right','bow'] : this.step === 7 ? ['bow'] : ['parry','shield']; },
  isDirection(action) { return ['up','down','left','right'].includes(action); },
  allows(action) { return !this.active || (this.phase !== 'intro' && this.isDirection(action)) || (this.phase === 'practice' && !this.focusTicks && this.actions().includes(action)); },
  directionHeld() { return this.heldDirections.size > 0 || ['up','down','left','right'].some(a => KH[BINDS[a]] || (BINDS2[a] && KH[BINDS2[a]])); },
  releaseKey(code) { this.heldDirections.delete(code);const d=this.dashPractice;if(d&&code===d.code){d.pressed=false;if(!(P._bdMoveT>0))d.armed=false;} },
  allowKey(code) {
    if(!this.active)return true;
    if(this.phase==='intro'&&['KeyW','KeyA','KeyS','KeyD'].includes(code))this.beginPractice();
    if(['up','down','left','right'].some(a=>code===BINDS[a]||code===BINDS2[a])){this.heldDirections.add(code);return this.phase!=='intro';}
    if(this.phase !== 'practice' || this.focusTicks > 0)return false;
    if(this.chapter===1&&this.step===8)return code==='Digit1';
    // The live chain handler uses physical Left Shift, including with saved custom binds.
    if(code==='ShiftLeft'&&this.actions().includes('charge')){
      if(this.chapter===2)return window._resourcePractice.allowKey(this,code);
      return true;
    }
    if(this.chapter===2)return window._resourcePractice.allowKey(this,code);
    const allowed=this.actions().some(a => code === BINDS[a] || code === BINDS2[a]);
    if(this.step === 7 && code === 'Space' && this.directionHeld())return false;
    if(allowed&&this.step===5&&(code===BINDS.bow||code===BINDS2.bow)&&this.directionHeld())this.armDashPractice(code);
    return allowed;
  },
  node(tag, text, css) {
    const el = document.createElement(tag);
    if (text !== undefined) el.textContent = text;
    if (css) el.style.cssText = css;
    return el;
  },
  build() {
    this.backdrop = this.node('div'); this.backdrop.id = 'parryLessonBackdrop';
    // Decorative layer must never swallow game mouse input.
    this.backdrop.style.pointerEvents = 'none';
    document.body.append(this.backdrop);
    this.panel = this.node('section'); this.panel.id = 'parryLesson';
    this.panel.setAttribute('aria-label', '1-1 패링 튜토리얼');
    const eyebrow = this.node('div'); eyebrow.className = 'lesson-eyebrow';
    this.status = this.node('span'); this.status.className = 'lesson-state';
    eyebrow.append(this.node('span', this.chapter===2?'CHAPTER 02 · PRACTICE':'CHAPTER 01 · TRAINING'), this.status);
    const art = this.node('div'); art.className = 'lesson-art';
    this.keycap = this.node('kbd'); this.keycap.className = 'lesson-key'; art.append(this.keycap);
    this.title = this.node('h2');
    this.subtitle = this.node('p'); this.subtitle.className = 'lesson-subtitle';
    const checklist = this.node('div'); checklist.className = 'lesson-checklist'; this.checklist=checklist;
    this.rowLabels = []; this.rowTexts = [];
    if(this.chapter!==2){
      this.basicRows=['WASD / 방향키 · 이동','좌클릭 · 적 3마리 처치','우클릭 · 적 3마리 처치','1 · 가시덫 설치 후 도망 · 10마리 처치'].map(label=>{
        const row=this.node('label');row.className='lesson-row';
        const box=this.node('input');box.type='checkbox';box.disabled=true;
        row.append(box,this.node('span',label));checklist.append(row);return {row,box};
      });
    }
    this.rows = this.labels.map(label => {
      const row = this.node('label'); row.className = 'lesson-row';
      const box = this.node('input'); box.type = 'checkbox'; box.disabled = true;
      const text = this.node('span', label); this.rowTexts.push(text);
      row.append(box, text); checklist.append(row); this.rowLabels.push(row); return box;
    });
    this.hint = this.node('p'); this.hint.className = 'lesson-hint'; this.hint.setAttribute('role', 'status');
    this.holdBox = this.node('div'); this.holdBox.className = 'lesson-hold';
    this.holdLabel = this.node('span', '키를 길게 눌러보세요');
    this.holdMeter = this.node('progress'); this.holdMeter.max = 100; this.holdMeter.value = 0; this.holdMeter.setAttribute('aria-label', '홀딩 충전');
    this.holdBox.append(this.holdLabel, this.holdMeter);
    this.rageBox = this.node('div'); this.rageBox.className = 'lesson-rage';
    this.rageText = this.node('span'); this.rageMeter = this.node('progress'); this.rageMeter.max=100;this.rageMeter.value=0;this.rageMeter.setAttribute('aria-label','분노 게이지');
    this.rageBox.append(this.rageText,this.rageMeter);
    this.rageZoom = this.node('section');this.rageZoom.id='lessonRageZoom';this.rageZoom.hidden=true;
    this.zoomText=this.node('h2');
    this.rageArrow=this.node('span','↓');this.rageArrow.className='lesson-rage-arrow';this.rageArrow.setAttribute('aria-hidden','true');
    this.rageZoom.append(this.node('span','아래 SPACE 슬롯을 확인하세요'),this.zoomText,this.node('p','잠시 후 방향키를 떼고 SPACE만 누르세요.'),this.rageArrow);document.body.append(this.rageZoom);
    const safety = this.node('span', '패링 실패 시 폭발 피해를 받습니다. 재시도하면 체력이 회복됩니다.'); safety.className = 'lesson-safety';
    this.button = this.node('button'); this.button.className = 'lesson-primary';
    this.button.onclick = () => this.beginPractice();
    const skip = this.node('button', '연습 건너뛰기'); skip.className = 'lesson-skip'; skip.onclick = () => this.skipAll();
    const progress = this.node('div'); progress.className = 'lesson-progress';
    this.progressFill = this.node('div'); this.progressFill.className = 'lesson-progress-fill'; progress.append(this.progressFill);
    const content = this.node('div'); content.className = 'lesson-content';
    this.details=this.node('div');this.details.className='lesson-details';
    this.details.append(this.hint,this.holdBox,this.rageBox);
    content.append(eyebrow, art, this.title, this.subtitle, checklist, this.details, safety);
    const footer = this.node('div'); footer.className = 'lesson-footer';
    footer.append(this.button, skip, progress);
    this.panel.append(content, footer);
    for (const event of ['mousedown', 'mouseup', 'click', 'pointerdown', 'pointerup']) this.panel.addEventListener(event, e => e.stopPropagation());
    document.body.append(this.panel);
  },
  key(step = this.step) { if(step===4)return 'SHIFT';if(step===5)return '↔ + SPACE';if(step===7)return 'SPACE';return String(BINDS[step % 2 === 0 ? 'parry' : 'shield'] || (step % 2 === 0 ? 'q' : 'e')).replace(/^Key/,'').toUpperCase(); },
  label(step) { return step < 2 ? `${this.key(step)} · ${this.labels[step]}` : this.labels[step]; },
  render() {
    if(this.chapter===2){window._resourcePractice.render(this);this.placeDetails();return;}
    const q = this.step % 2 === 0, complete = this.phase === 'done';
    this.panel.setAttribute('data-kind', q ? 'magic' : 'physical');
    this.panel.setAttribute('data-phase', this.phase);
    this.rows.forEach((box, i) => {
      box.checked = this.checks[i];
      this.rowLabels[i].setAttribute('data-current', String(i === this.step));
      this.rowLabels[i].setAttribute('data-complete', String(this.checks[i]));
      this.rowTexts[i].textContent = this.label(i);
    });
    this.status.textContent = complete ? 'COMPLETE' : this.phase === 'practice' ? '연습 중' : this.phase === 'success' ? '성공' : '일시정지';
    this.keycap.textContent = complete ? '✓' : this.key();
    this.title.textContent = complete ? '전투 준비 완료' : ['마법을 되돌려라', '물리탄을 쳐내라', '보호막을 펼쳐라', '힘을 모아 쳐내라', '사슬로 이동하라', '방향을 정해 이동하라', '패링으로 분노를 채워라', '분노를 폭발시켜라'][this.step];
    this.subtitle.textContent = complete ? '전투 기본 조작을 모두 익혔습니다.' : `${this.step + 1} / ${this.labels.length} · ${this.label(this.step)}`;
    const tips = this.step === 4 ? '이동할 곳에 마우스를 향하고 Shift를 눌렀다 떼세요. 사슬이 실제 발사되면 성공입니다.' : this.step === 5 ? 'WASD 또는 방향키를 누른 채 Space를 누르세요. 전격이동을 5번 발동하면 성공입니다.' : this.step === 6 ? 'Q를 2초 동안 누른 뒤, 함께 날아오는 마법탄 10발이 가까워지면 떼세요. 한 번에 여러 발을 패링해 분노 100%를 채워보세요.' : this.step === 7 ? '몬스터들이 주변을 둘러쌌습니다. 방향키에서 손을 떼고 Space만 눌러 분노 폭발로 한 번에 쓸어버리세요.' : this.step === 2 ? `[${this.key()}]를 2초 동안 누르세요. 화염·물·암흑·번개·무지개탄을 보고 키를 떼어 한 번에 3발 이상 패링하세요. 홀딩 중 보호막은 피해를 일부 흡수하고 그로기를 막습니다. 피해를 완전히 막는 무적은 아닙니다.` : this.step === 3 ? `[${this.key()}]를 누른 채 탄 쪽을 바라보세요. 이빨입탄·혈안탄·관통탄·물리 검기파·물리 환영검이 함께 날아옵니다. 3단계 충전 후 키를 떼어 5종 중 3발 이상 한 번에 쳐내세요. 풀차지 자동 발동도 인정합니다.` : q ? `보라색 탄이 가까워지는 순간 [${this.key()}]를 누르세요. 너무 일찍 눌렀다면 떼고 다시 시도하세요.` : `탄을 바라보고 [${this.key()}]를 짧게 눌렀다 떼세요. 길게 누르면 차징이 됩니다.`;
    this.hint.textContent = complete ? '모든 연습 성공! 잠시 후 1-1 전투로 이어집니다.' : tips;
    if(this.step===0||this.step===1)this.updateParryPractice();
    this.holdBox.hidden = (this.step !== 2 && this.step !== 3) || complete;
    this.holdMeter.value = 0; this.holdLabel.textContent = '키를 길게 눌러보세요';
    this.rageBox.hidden = this.step !== 6 || complete; this.updateRage();
    this.button.hidden = this.phase !== 'intro';
    this.button.textContent = 'W / A / S / D 또는 클릭하여 시작';
    this.progressFill.style.width = `${this.checks.filter(Boolean).length / this.labels.length * 100}%`;
    const basicChecks=[this.movementDone,this.leftClickDone,this.rightClickDone,this.spikeTrapDone];
    this.basicRows.forEach(({row,box},i)=>{box.checked=!!basicChecks[i];row.setAttribute('data-current',String(this.step===(i===3?8:i-3)));row.setAttribute('data-complete',String(!!basicChecks[i]));});
    const basicLabels=['WASD / 방향키 · 이동','좌클릭 · 적 3마리 처치','우클릭 · 적 3마리 처치'];
    this.subtitle.textContent=`${this.step===8?4:this.step<0?this.step+4:this.step+5} / ${this.labels.length+4} · ${this.step===8?'1 · 가시덫':this.step<0?basicLabels[this.step+3]:this.label(this.step)}`;
    this.progressFill.style.width=`${(this.checks.filter(Boolean).length+basicChecks.filter(Boolean).length)/(this.labels.length+4)*100}%`;
    if(this.step<0){
      const i=this.step+3;
      this.keycap.textContent=['W A S D','좌클릭','우클릭'][i];
      this.title.textContent=['먼저 움직여보세요','무기를 휘둘러보세요','마법을 발사해보세요'][i];
      this.hint.textContent=[
        'W 위 · A 왼쪽 · S 아래 · D 오른쪽. WASD 또는 방향키로 조금 걸어보세요. 이후 모든 실습에서도 이동할 수 있습니다.',
        '마우스로 조준하고 좌클릭 기본공격 기검참으로 적 3마리를 처치하세요.',
        '마우스로 조준하고 우클릭 마법탄으로 적 3마리를 처치하세요.'
      ][i];
      if(this.step===-2||this.step===-1)this.updateAttackPractice();
    }
    if(this.step===4)this.updateChainPractice();
    if(this.step===5)this.updateDashPractice();
    if(this.step===8)this.updateTrapPractice();
    this.placeDetails();
  },
  placeDetails() {
    const guide=this.chapter===2&&this.resourceGuide&&!this.resourceGuide.hidden;
    const row=this.chapter===2?this.rowLabels[this.step]:this.step<0?this.basicRows[this.step+3]?.row:this.step===8?this.basicRows[3]?.row:this.rowLabels[this.step];
    const anchor=guide?(this.step===5?this.resourceGuideRows[window._resourcePractice.resourceIndex]:this.resourceGuide):row;
    (anchor||this.checklist).after(this.details);
  },
  beginPractice() {
    if(!this.active||this.phase!=='intro')return;
    this.phase='practice';this.cooldown=45;
    this.resetPose();this.button.blur();this.render();
  },
  updateParryPractice() {
    const q=this.step===0;
    this.title.textContent=q?'마법탄을 패링해 몬스터를 처치하세요':'물리탄을 패링해 몬스터를 처치하세요';
    this.hint.textContent='몬스터 주위의 링이 완성되면 탄이 발사됩니다. 링 색으로 탄 종류를 미리 예측하세요. 흰색 링은 물리탄(E), 속성색 링은 마법탄(Q)입니다. '+
      (q?'이번 보라색 링은 암흑 마법탄입니다. 탄이 가까워지면 ['+this.key()+']로 패링하세요.':'이번 흰색 링은 물리탄입니다. 탄이 가까워지면 ['+this.key()+']를 짧게 눌렀다 떼어 패링하세요.')+
      '\n'+(this.parriedShot?'패링 성공! 반사탄으로 발사한 몬스터를 처치하면 완료됩니다.':'패링으로 탄을 되돌려 발사한 몬스터까지 처치하세요.');
  },
  spawnParryEnemy() {
    const q=this.step===0;
    if(this.parryEnemy){const i=ens.indexOf(this.parryEnemy);if(i>=0)ens.splice(i,1);}
    this.parryEnemy=null;this.parriedShot=null;
    for(let i=0;i<8;i++){
      const a=-Math.PI/2+i*Math.PI/4;
      const e=mkEn(P.x+Math.cos(a)*280,P.y+Math.sin(a)*280,G.stage,0,false,q?EL.D:EL.P,-1);
      if(!e||Math.hypot(e.x-P.x,e.y-P.y)>450||Math.hypot(e.x-P.x,e.y-P.y)<160)continue;
      e._lessonEnemy=true;e._lessonStage=this.step;e.hp=1;e.mhp=1;e.atk=0;e.elite=0;e.mods=[];e.spd=0;
      e.el=q?EL.D:EL.P;e.s='idle';e._spawnT=0;e._projChargeT=0;e._projChargeCol=null;
      e.facing=Math.atan2(P.y-e.y,P.x-e.x);
      ens.push(e);this.parryEnemy=e;_shDirty=true;
      addParts(e.x,e.y,q?'#b26dff':'#f4f4f4',12);return;
    }
    _shDirty=true;
  },
  tickParryEnemy() {
    if(!this.parryEnemy?.alive||this.parryEnemy._lessonStage!==this.step){
      this.clearShot();this.spawnParryEnemy();
      if(!this.parryEnemy){this.cooldown=60;return;}
    }
    const e=this.parryEnemy;
    e.facing=Math.atan2(P.y-e.y,P.x-e.x);
    if(this.shot){
      if(!projs.includes(this.shot)||this.shot.life<=0||Math.hypot(this.shot.x-P.x,this.shot.y-P.y)>1200){
        this.clearShot(true);this.resetPose();this.cooldown=60;this.updateParryPractice();
      }
      return;
    }
    if(e._projChargeT>0){
      e._projChargeT=Math.max(0,e._projChargeT-_dtSp);
      if(e._projChargeT>0)return;
      const q=this.step===0,ang=e.facing;
      this.shot=spawnProj({x:e.x,y:e.y,vx:Math.cos(ang)*3,vy:Math.sin(ang)*3,dmg:0,el:q?EL.D:EL.P,col:q?'#b26dff':'#f4f4f4',life:360,ml:360,friendly:false,_commit:true,_lessonShot:true});
      e._projChargeCol=null;
      if(this.shot){this.shot._lessonExploded=false;this.shot.vx=Math.cos(ang)*3;this.shot.vy=Math.sin(ang)*3;this.shot.homing=true;}
      else this.cooldown=60;
      return;
    }
    if((this.cooldown-=_dtSp)<=0){
      e._projChargeT=60;e._projChargeBean='normal';e._projChargeCol=this.step===0?'#b26dff':'#f4f4f4';
    }
  },
  spawnAttackEnemies() {
    this.attackEnemies=[];
    const radius=this.step===-2?120:220;
    for(let i=0;i<24&&this.attackEnemies.length<3;i++){
      const a=-Math.PI/2+(i%3-1)*.65+Math.floor(i/3)*Math.PI/4;
      const e=mkEn(P.x+Math.cos(a)*radius,P.y+Math.sin(a)*radius,G.stage,0,false,EL.P,-1);
      if(!e||Math.hypot(e.x-P.x,e.y-P.y)>450||this.attackEnemies.some(other=>Math.hypot(e.x-other.x,e.y-other.y)<40))continue;
      e._lessonEnemy=true;e._lessonStage=this.step;e.hp=1;e.mhp=1;e.atk=0;e.elite=0;e.mods=[];e.spd=0;
      e.facing=Math.atan2(P.y-e.y,P.x-e.x);
      ens.push(e);this.attackEnemies.push(e);addParts(e.x,e.y,'#b26dff',12);
    }
    _shDirty=true;
  },
  updateAttackPractice() {
    const left=this.step===-2,count=left?this.leftKills:this.rightKills;
    this.title.textContent=left?'기검참으로 적 3마리를 처치하세요':'마법으로 적 3마리를 처치하세요';
    this.hint.textContent=`${left?'기검참은 기본공격입니다. 적을 마우스로 조준하고 좌클릭으로 검기를 날리세요.':'적을 마우스로 조준하고 우클릭으로 마법탄을 발사하세요.'}\n처치 ${count||0}/3 · 실제로 처치해야 완료됩니다.`;
  },
  startTrapPractice() {
    this.trapSnapshot={slot:SKILL_SLOTS[0],mats:G.mats,skills:P.skills,cd:{had:Object.prototype.hasOwnProperty.call(P,'_gcCd'),value:P._gcCd}};
    P.skills={...P.skills,spikeTrap:Math.max(1,P.skills.spikeTrap||0)};SKILL_SLOTS[0]='spikeTrap';P._gcCd=0;
    this.trapEnemies=[];this.trapKills=0;this.trapZone=null;this.trapEscaped=false;
    this.spawnTrapEnemies();
  },
  spawnTrapEnemies() {
    // Existing enemy placement and flow-field movement retain the world's collision rules.
    for(let i=0;i<60&&this.trapEnemies.length<10;i++){
      const a=-Math.PI/2+(i%10-4.5)*.16+Math.floor(i/10)*Math.PI/3;
      const radius=180+(i%3)*40;
      const e=mkEn(P.x+Math.cos(a)*radius,P.y+Math.sin(a)*radius,G.stage,0,false,EL.P,-1);
      if(!e||Math.hypot(e.x-P.x,e.y-P.y)>300||this.trapEnemies.some(o=>o.alive&&Math.hypot(e.x-o.x,e.y-o.y)<24))continue;
      // Stagger lethal DOT ticks so pursuers fall over time instead of bursting together.
      e._lessonEnemy=true;e._lessonStage=8;e.hp=Math.max(1,_spikeTrapDmg())*(5+this.trapEnemies.length)*.5;e.mhp=e.hp;
      e.eShield=e.hp;e.eShieldMax=e.mhp;
      e.atk=0;e.elite=0;e.mods=[];e.speed=1.6;e.s='chase';e.facing=Math.atan2(P.y-e.y,P.x-e.x);
      ens.push(e);this.trapEnemies.push(e);addParts(e.x,e.y,'#b26dff',12);
    }
    _shDirty=true;
  },
  tickTrapPractice() {
    if(this.trapEnemies.length<10)this.spawnTrapEnemies();
    G.mats=Math.max(G.mats||0,_malCost(10));
    const zone=(G._fireZones||[]).find(z=>z.type==='spikeTrap'&&z.t<z.maxT);
    if(zone&&zone!==this.trapZone){this.trapZone=zone;this.trapEscaped=false;}
    if(this.trapZone&&this.directionHeld()&&Math.hypot(P.x-this.trapZone.x,P.y-this.trapZone.y)>=120)this.trapEscaped=true;
    if(!zone)P._gcCd=0;
    for(const e of this.trapEnemies){
      if(!e.alive)continue;
      e.facing=Math.atan2(P.y-e.y,P.x-e.x);
      if(Math.hypot(e.x-P.x,e.y-P.y)>45){e.s='chase';e._aSpdM=e._spikeSlow>0?1-_spikeTrapSlowPct(e._spikeSlowLv):1;_ffMoveE(e,_dtSp);}
      else e.s='idle';
    }
    _shDirty=true;this.updateTrapPractice();
    if(this.trapKills>=10&&this.trapEscaped)this.completeStep();
  },
  updateTrapPractice() {
    this.keycap.textContent='1 + W A S D';
    this.title.textContent='붙으면 가시덫을 깔고 도망치세요';
    this.hint.textContent='몬스터 10마리가 쫓아옵니다. 가까이 붙으면 1번으로 발밑에 가시덫을 깔고, WASD / 방향키로 도망치세요. 덫 안의 적은 느려지고 지속 피해로 쓰러집니다.\n'+
      `${this.trapZone?'✓':'□'} 가시덫 설치 · ${this.trapEscaped?'✓':'□'} 설치 후 이동 · 처치 ${this.trapKills||0}/10`;
    this.holdBox.hidden=true;this.rageBox.hidden=true;
  },
  restoreTrapPractice() {
    if(!this.trapSnapshot)return;
    const s=this.trapSnapshot;SKILL_SLOTS[0]=s.slot;G.mats=s.mats;P.skills=s.skills;
    if(s.cd.had)P._gcCd=s.cd.value;else delete P._gcCd;
    G._fireZones=G._fireZones.filter(z=>z.type!=='spikeTrap');
    this.trapSnapshot=null;this.trapZone=null;this.trapEnemies=[];
  },
  resetPose() {
    P.s = 'idle'; P.st2 = 0; P._sbParryT = 0; P._sbHoldT = 0; P._sbReleaseR = 0; P._sbCd = 0;
    this.holdReady = false; this.holdStarted = false;
    this.volleyReleased=false;this.volleyHits=new Set();this.volleyRetryTicks=0;this.volleyFailed=false;this.releaseTicks=0;
    P._kgChg = 0; P._kgTier = 0; P._sBashChgMul = 1;
    _harpActive=false;_dashActive=false;_dashHold=false;_dashHoldF=0;_dashTier=0;_dashLeft=0;_dashPhase=0;
    P._bdMoveT=0; P._preBdState=null;this.directionSpace=false;this.dashPractice=null;
    P._sdHold = 0; P._bdTrigger = null; P.kb.x = 0; P.kb.y = 0;
    for (const key of Object.keys(K)) K[key] = false;
    for (const key of Object.keys(KH)) KH[key] = false;
    for (const key of Object.keys(MB)) MB[key] = false;
    _stopShieldLoop();
  },
  initDashPractice() {
    if(!this.dashPractice){P.mp=P.mmp;_harpGauge=_HARP_GAUGE_MAX;this.dashPractice={count:0,armed:false,flight:false,pressed:false,code:null};}
    return this.dashPractice;
  },
  armDashPractice(code) {
    const d=this.initDashPractice();d.pressed=true;d.code=code;
    if(d.flight||P._bdMoveT>0||d.armed)return;
    d.armed=true;d.mp=P.mp;d.gauge=_harpGauge;
  },
  tickDashPractice(requireCost=false) {
    const d=this.initDashPractice();
    if(d.flight){
      if(!(P._bdMoveT>0)&&!d.pressed){d.flight=false;P.mp=P.mmp;_harpGauge=_HARP_GAUGE_MAX;}
    }else if(d.armed&&P._bdMoveT>0&&(!requireCost||P.mp<d.mp&&_harpGauge<d.gauge)){
      d.count++;d.armed=false;d.flight=true;
      if(d.count===5)this.completeStep();
    }
    if(this.chapter===1)this.updateDashPractice();
  },
  updateDashPractice() {
    this.hint.textContent='WASD 또는 방향키를 누른 채 Space로 전격이동을 5번 사용하세요. 이동이 끝나면 Space를 떼고 다시 누르세요.\n전격이동 성공 '+(this.dashPractice?.count||0)+'/5';
  },
  tickChainPractice() {
    if(!this.chainPractice){
      _harpGauge=_HARP_GAUGE_MAX;P.st=P.mst;
      this.chainPractice={target:1,completed:[],gauge:_harpGauge,flight:null,feedback:''};
    }
    const s=this.chainPractice,active=_harpActive||_dashActive;
    if(!s.flight&&active&&_harpGauge<s.gauge){
      s.flight={tier:_harpTier,spent:s.gauge-_harpGauge,x:P.x,y:P.y,pulled:false,moved:false};
      s.feedback=`${_harpTier}단 발사 · 기동력 −${Math.round(s.flight.spent)} · 이동이 끝나면 Shift를 놓으세요.`;
    }
    if(s.flight){
      const f=s.flight;
      if(_dashActive)f.pulled=true;
      if(f.pulled&&Math.hypot(P.x-f.x,P.y-f.y)>=1)f.moved=true;
      if(!active&&!_dashHold&&!KH.ShiftLeft){
        if(f.tier===s.target&&f.moved){
          s.completed.push(s.target);
          s.feedback=`${s.target}단 이동 완료 · 기동력 −${Math.round(f.spent)}`;
          if(s.target===3){this.updateChainPractice();this.completeStep();return;}
          s.target++;
        }else{
          s.feedback=f.tier!==s.target?`${f.tier}단으로 발사했습니다. ${s.target}단을 다시 연습하세요.`:'이동이 막히거나 취소됐습니다. 열린 바닥을 가리켜 다시 시도하세요.';
        }
        // Refill only between attempts so all tiers remain repeatable and costs stay visible.
        s.flight=null;_harpGauge=_HARP_GAUGE_MAX;P.st=P.mst;s.gauge=_harpGauge;
      }
    }
    this.updateChainPractice();
  },
  updateChainPractice() {
    const s=this.chainPractice;if(!s)return;
    const seconds=t=>_HARP_TIER_F[t]/60;
    const instruction=s.target===1?`왼쪽 Shift를 ${seconds(2)}초 전에 짧게 눌렀다 놓으세요.`:s.target===2?`왼쪽 Shift를 ${seconds(2)}초 이상, ${seconds(3)}초 전에 놓으세요.`:`왼쪽 Shift를 ${seconds(3)}초 이상 누르면 자동 발사됩니다.`;
    this.hint.textContent=`${[1,2,3].map(t=>`${s.completed.includes(t)?'✓':'□'} ${t}단`).join(' · ')}\n${s.completed.length===3?'1·2·3단 사슬이동을 모두 완료했습니다.':`지금은 ${s.target}단 연습입니다. 마우스로 열린 바닥을 가리키세요. ${instruction}`}\n${s.feedback}`;
    this.holdBox.hidden=false;
    this.holdMeter.value=Math.min(100,(_dashHoldF||0)/_HARP_TIER_F[3]*100);
    this.holdLabel.textContent=_dashHold?`현재 ${_dashTier||1}단 충전 중 · 목표 ${s.target}단`:s.completed.length===3?'모든 단계 완료':`${s.target}단 준비 · 1단 탭 / 2단 ${seconds(2)}초 / 3단 ${seconds(3)}초 자동`;
  },
  start() {
    this.spikeTrapDone=false;this.trapEnemies=[];this.trapSnapshot=null;
    this.chainPractice=null;
    this.parryEnemy=null;this.parriedShot=null;
    this.attackEnemies=[];this.leftKills=0;this.rightKills=0;
    this.combatLabels??=this.labels.slice();this.labels=this.combatLabels.slice();this.chapter=1;this.resourceReadout=null;
    window._resourcePractice?.save();
    this.seen = true; this.active = true; this.phase = 'intro'; this.step = -3; this.checks = Array(this.labels.length).fill(false);
    this.movementDone=false;this.leftClickDone=false;this.rightClickDone=false;this.moveDistance=0;this.moveLast={x:P.x,y:P.y};
    this.basicSkillSnapshot={};for(const key of ['activeLMBSk','activeMagicSk'])this.basicSkillSnapshot[key]={had:Object.prototype.hasOwnProperty.call(P,key),value:P[key]};
    P.activeLMBSk='kiSlash';P.activeMagicSk='fireball';
    this.saved = { ens, projs, pProjs, worldItems, fields: {}, hp: P.hp, mp: P.mp, st: P.st, shield: P.shield, iframes: P.iframes, x: P.x, y: P.y, q: P.activeQSk, bank: P.parryBank, rage: P.rage, harp: _harpGauge, skills: P.skills, fused: P._fused, slot: SKILL_SLOTS[4], binds2: BINDS2, charge: P.activeChargeSk, slamCd: P._gslCd, io: P._ioActive };
    ens = []; projs = []; pProjs = []; worldItems = [];
    _shDirty = true;
    for (const key of ['spawnHoles', 'rifts', '_fieldBosses', '_fireDevils', '_fireZones']) { this.saved.fields[key] = G[key]; G[key] = []; }
    for (const key of ['_bonfire', '_fieldBoss', '_gateGuard', '_bossRef']) { this.saved.fields[key] = G[key]; G[key] = null; }
    P.skills={...P.skills,kiSlash:Math.max(1,P.skills.kiSlash||0),bladeDash:Math.max(1,P.skills.bladeDash||0),giantSlam:1};P._fused={};P._ioActive=false;
    SKILL_SLOTS[4]='giantSlam';P.activeChargeSk='charge';P._gslCd=0;P.rage=0;
    BINDS2={...BINDS2,up:BINDS2.up||'ArrowUp',down:BINDS2.down||'ArrowDown',left:BINDS2.left||'ArrowLeft',right:BINDS2.right||'ArrowRight'};
    this.focusTicks=0;this.rageParried=false;this.rageClearTicks=0;this.failTicks=0;
    P.activeQSk = 'detonate'; this.resetPose(); this.build(); this.render();
    if(new URLSearchParams(location.search).get('practice')==='2')window._resourcePractice?.start(this);
  },
  hit(p, kind) {
    if(this.chapter===2)return window._resourcePractice.hit(this,p,kind);
    if (!this.active || this.phase !== 'practice' || this.pending || this.failTicks || kind !== (this.step % 2 === 0 ? 'magic' : 'physical')) return;
    if(this.step===2||this.step===3){
      if(!this.volleyReleased||this.volleyFailed||!this.volley?.includes(p)||this.volleyHits.has(p))return;
      if(this.step===2&&(P.s==='sBlock'||P._sbReleaseR<300||P._sbParryT<=0))return;
      if(this.step===3&&(P.s!=='sBash'||P._sBashChgMul<3))return;
      this.volleyHits.add(p);this.holdLabel.textContent=`한 번에 패링 · ${this.volleyHits.size}/3발`;
      if(this.volleyHits.size>=3)this.completeStep();
      return;
    }
    if(this.step===6){
      if(!this.volley?.includes(p)||this.volleyHits.has(p))return;
      this.volleyHits.add(p);this.rageParried=true;return;
    }
    if(this.step<0||this.step>1||!p||p!==this.shot||!this.parryEnemy?.alive)return;
    this.parriedShot=p;this.updateParryPractice();
  },
  completeStep() {
    if(this.chapter===1&&this.step===8){if(!this.spikeTrapDone){this.spikeTrapDone=true;this.pending='success';}return;}
    if(this.chapter!==2&&this.step<0){const key=['movementDone','leftClickDone','rightClickDone'][this.step+3];if(!this[key]){this[key]=true;this.pending='success';}return;}
    if(this.pending || this.checks[this.step])return;
    this.checks[this.step] = true;
    this.pending = this.step < this.labels.length-1 ? 'success' : 'done';
    if(this.pending==='done')window._tutorialBadges?.complete(this.chapter===2?'resources':'combat',this.chapter===2?this.checks:[this.movementDone,this.leftClickDone,this.rightClickDone,this.spikeTrapDone,...this.checks]);
  },
  explode(p) {
    if(p._lessonExploded||p.friendly)return;
    p._lessonExploded=true;
    if(p.parryClass==='physical'||(!p.parryClass&&p.el===EL.P&&!p.blackBean)){
      const angle=Math.atan2(p.vy||0,p.vx||0);
      playVFXAng('death_blood',p.x,p.y,1.2,4,angle,false,1.5);
    }else{
      _addBoom(p.x,p.y,100,72,'dark');
      _spawnSmoke(p.x,p.y,'dark');
      addParts(p.x,p.y,p.col||'#b26dff',32);
    }
  },
  miss(p,absorbed=false) {
    if(this.chapter===2)return window._resourcePractice.miss(this,p,absorbed);
    if(!this.active||this.phase!=='practice'||this.pending||this.failTicks||!p._lessonShot||p.friendly)return;
    this.explode(p);
    doHitFlash('#ff4422',.35);shake(7);
    playSample(absorbed?'shield_hit':'player_hit1',.6,1);
    const damage=Math.min(Math.max(0,P.hp-1),Math.max(1,Math.ceil(P.mhp*.1)));
    P.hp-=damage;
    addTxt(P.x,P.y-30,`패링 실패! -${damage} HP`,'#ff6644',60);
    this.failTicks=60;
    this.hint.textContent='패링 실패! 탄에 맞았습니다. 체력을 회복하고 다시 연습합니다.';
    if(this.step===2||this.step===3)this.volleyFailed=true;
  },
  clearShot(explode = false) {
    for (let i = projs.length - 1; i >= 0; i--) {
      if (projs[i]._lessonShot) { if(explode)this.explode(projs[i]);_recycleProj(projs[i]); projs.splice(i, 1); }
    }
    this.shot = null; this.volley=[];
    this.parriedShot=null;
    if(this.parryEnemy){this.parryEnemy._projChargeT=0;this.parryEnemy._projChargeCol=null;}
  },
  tick() {
    if (!this.active) {
      if(this.dismissed()){this.seen=true;return false;}
      const query = new URLSearchParams(location.search);
      if (this.seen || G.stage !== 0 || G._intro || G.paused || _saving || !P || P.hp <= 0 || _EDITOR_MODE || _bossTestReq >= 0 || _MAP_QA_MODE || query.has('projectilelab') || query.get('tutorial') === '0') return false;
      this.start();
    }
    if (G.stage !== 0) { this.finish(); return false; }
    if(this.chapter===2)return window._resourcePractice.tick(this);
    if (this.pending) { this.phase = this.pending; this.pending = null; this.transitionTicks = 90; this.render(); }
    if (this.phase === 'intro') return true;
    if (G.paused) return false;
    if(this.failTicks>0){
      this.clearShot(true);
      if((this.failTicks-=_dtSp)>0)return false;
      P.hp=this.saved.hp;P.shield=this.saved.shield;
      this.resetPose();this.cooldown=45;this.render();
    }
    if (this.phase === 'success' || this.phase === 'done') {
      // Keep the real reflection animation running; only the checklist changes on success.
      if ((this.transitionTicks -= _dtSp) > 0) return false;
      if (this.phase === 'done') {
        if(window._resourcePractice&&new URLSearchParams(location.search).get('resourceTutorial')==='1'){window._resourcePractice.start(this);return false;}
        this.finish(); return false;
      }
      this.clearShot();
      if(this.step===8)this.restoreTrapPractice();
      this.step=this.step===-1?8:this.step===8?0:this.step+1; this.phase = 'practice'; this.cooldown = 45;
      this.resetPose();
      if(this.step===8)this.startTrapPractice();
      if(this.step===-2||this.step===-1)this.spawnAttackEnemies();
      if(this.step===7){this.spawnRageEnemies();this.focusTicks=150;this.setRageFocus(true);}
      this.render();
    }
    P.hp = this.saved.hp; P.mp = P.mmp; if(this.step!==4)P.st = P.mst; P.shield = this.saved.shield; P.iframes = 0;
    P.kb.x = 0; P.kb.y = 0;
    if(this.step===8){this.tickTrapPractice();return false;}
    if(this.step===-3){
      if(this.directionHeld())this.moveDistance+=Math.hypot(P.x-this.moveLast.x,P.y-this.moveLast.y);
      this.moveLast={x:P.x,y:P.y};
      if(this.moveDistance>=120)this.completeStep();
      return false;
    }
    if(this.step===-2||this.step===-1){
      this.updateAttackPractice();
      return false;
    }
    if (this.step === 2 || this.step === 3) { this.watchHold(); return false; }
    if (this.step === 4 || this.step === 5) {
      if(this.step===4)this.tickChainPractice();
      else this.tickDashPractice();
      return false;
    }
    if(this.step>=6)this.updateRage();
    if(this.step===7){
      P._gslCd=0;
      if(this.focusTicks>0){this.positionRageFocus();this.focusTicks-=_dtSp;if(this.focusTicks<=0)this.setRageFocus(false);}
      return false;
    }
    if(this.step===6&&this.rageParried&&P.rage>=100){this.completeStep();return false;}
    if(this.step===6){
      if(this.volley?.length){
        const incoming=this.volley.some(p=>!this.volleyHits.has(p)&&!p.friendly&&projs.includes(p)&&p.life>0&&Math.hypot(p.x-P.x,p.y-P.y)<=1200);
        if(incoming)return false;
        if(!this.rageClearTicks)this.rageClearTicks=45;
        if((this.rageClearTicks-=_dtSp)>0)return false;
        this.clearShot(true);this.resetPose();this.cooldown=60;
      }
      if((this.cooldown-=_dtSp)<=0){this.fireVolley();this.rageClearTicks=0;if(!this.volley.length)this.cooldown=60;}
      return false;
    }
    if(this.step===0||this.step===1)this.tickParryEnemy();
    return false;
  },
  fireVolley() {
    const q=this.step===2||this.step===6;
    const magicTypes=[
      {el:EL.F,fireMagic:true,col:'#ff4422',_lessonKind:'화염'},
      {el:EL.I,waterBean:true,col:'#55bbff',_lessonKind:'물'},
      {el:EL.D,gbBean:true,col:'#a44cff',_lessonKind:'암흑'},
      {el:EL.L,col:'#ffee55',_lessonKind:'번개'},
      {el:EL.P,blackBean:true,col:'#ff44ff',_lessonKind:'무지개'}
    ];
    const physicalTypes=[
      {el:EL.P,redBean:true,col:'#cc1100',sz:1.5,_lessonKind:'이빨입탄'},
      {el:EL.F,titanEye:true,col:'#ff2233',sz:6.4,r:12,_lessonKind:'혈안탄'},
      {el:EL.P,pierce:true,col:'#889999',sz:3,_lessonKind:'관통탄'},
      {el:EL.P,redBean:true,swordWave:true,col:'#cc1100',sz:1.5,_lessonKind:'물리 검기파'},
      {el:EL.P,redBean:true,phantomSword:true,col:'#f4f4f4',sz:2,_lessonKind:'물리 환영검'}
    ];
    const base=q?-Math.PI/2:(P.facing??-Math.PI/2);
    const speed=q?4.8:6.4;
    this.volley=[];this.volleyHits=new Set();this.volleyReleased=false;this.volleyFailed=false;
    const count=this.step===6?10:5;
    for(let i=0;i<count;i++){
      const a=base+(i/(count-1)-.5)*.64;
      const p=spawnProj({x:P.x+Math.cos(a)*800,y:P.y+Math.sin(a)*800,vx:-Math.cos(a)*speed,vy:-Math.sin(a)*speed,dmg:0,el:EL.P,col:'#f4f4f4',...(q?{...magicTypes[i%magicTypes.length],parryClass:'magic'}:physicalTypes[i]),life:420,ml:420,friendly:false,_commit:true,_lessonShot:true});
      if(p){p._lessonExploded=false;p.vx=-Math.cos(a)*speed;p.vy=-Math.sin(a)*speed;p.homing=true;this.volley.push(p);}
    }
    if(this.volley.length<3)this.volleyFailed=true;
  },
  holdRelease(kind,charge) {
    if(!this.active||this.phase!=='practice'||(this.step!==2&&this.step!==3)||this.pending)return;
    if(kind!==(this.step===2?'magic':'physical'))return;
    if(this.volleyReleased||charge<(this.step===2?120:180)||!this.volley?.length){this.volleyFailed=true;return;}
    this.volleyReleased=true;this.releaseTicks=24;this.volleyHits=new Set();
  },
  physicalParry(x,y) {
    if(!this.active||P.s!=='sBash')return;
    const shots=(this.step===3?this.volley:[this.shot])||[];
    for(const p of shots)if(p&&p.x===x&&p.y===y&&p.friendly&&p.parryBlueBean&&p.parryClass==='physical')this.hit(p,'physical');
  },
  retryVolley() {
    this.clearShot(true);this.resetPose();this.volleyRetryTicks=60;
    this.holdMeter.value=0;this.holdLabel.textContent='다시 시도 · 한 번의 해제로 3발 이상';
    this.hint.textContent=`[${this.key()}]를 다시 길게 누르세요. 충전이 끝나고 탄이 가까워지면 키를 떼세요.`;
  },
  watchHold() {
    if(this.volleyRetryTicks>0){this.volleyRetryTicks-=_dtSp;return;}
    const q=this.step===2;
    const holding=q?P.s==='sBlock':P.s==='sDraw'||P.s==='kiGather';
    const amount=q?(P._sbHoldT||0):(P._kgChg||0),target=q?120:180;
    if(holding&&!this.holdStarted){this.holdStarted=true;this.fireVolley();}
    if(this.volleyFailed){this.retryVolley();return;}
    if(this.volleyReleased){
      if((this.releaseTicks-=_dtSp)<=0&&!this.pending)this.retryVolley();
      return;
    }
    if(holding){
      this.holdMeter.value=Math.min(100,Math.floor(amount/target*100));
      this.holdLabel.textContent=amount>=target?'지금 키를 떼세요 · 3발 이상 패링':`충전 ${this.holdMeter.value}% · 한 번에 3발 이상`;
    }
    if(this.holdStarted&&(!holding||!this.volley.some(p=>projs.includes(p)&&!p.friendly)))this.retryVolley();
  },
  setRageFocus(on) {
    this.rageZoom.hidden=!on;
    this.panel.setAttribute('data-rage-focus',String(on));
    document.getElementById('skBar')?.classList.toggle('lesson-rage-focus',on);
    if(on)this.positionRageFocus();
  },
  positionRageFocus() {
    const slot=document.getElementById('skSlot1');
    if(!slot)return;
    const rect=slot.getBoundingClientRect();
    const width=Math.min(280,window.innerWidth-24);
    const center=rect.left+rect.width/2;
    const left=Math.max(12,Math.min(window.innerWidth-width-12,center-width/2));
    this.rageZoom.style.width=width+'px';
    this.rageZoom.style.left=left+'px';
    this.rageZoom.style.bottom=Math.max(12,window.innerHeight-rect.top+34)+'px';
    this.rageArrow.style.left=(center-left)+'px';
  },
  updateRage() {
    const value=Math.max(0,P.rage||0);
    this.rageMeter.value=Math.min(100,value);
    this.rageText.textContent=`패링으로 축적한 분노 · ${Math.floor(value)}%`;
    this.zoomText.textContent=`분노 ${Math.floor(value)}%`;
  },
  spawnRageEnemies() {
    this.rageEnemies=[];
    for(let i=0;i<48&&this.rageEnemies.length<24;i++){
      const a=(i%12)*Math.PI/6+(Math.floor(i/12)%2)*Math.PI/12;
      const radius=180+(Math.floor(i/12)%2)*100;
      const e=mkEn(P.x+Math.cos(a)*radius,P.y+Math.sin(a)*radius,G.stage,0,false,EL.P,-1);
      if(!e||Math.hypot(e.x-P.x,e.y-P.y)>450)continue;
      e._lessonEnemy=true;e.hp=1;e.mhp=1;e.atk=0;e.elite=0;e.mods=[];e.spd=0;
      e.facing=Math.atan2(P.y-e.y,P.x-e.x);
      ens.push(e);this.rageEnemies.push(e);
      addParts(e.x,e.y,'#b26dff',12);
    }
    _shDirty=true;
  },
  hurtEnemy(e,dmg,ang,opts) {
    if(!e?._lessonEnemy||!e.alive||!(dmg>0))return;
    const rage=this.chapter===1&&this.step===7&&P.s==='gSlamWindup';
    const attack=this.chapter===1&&this.phase==='practice'&&!this.pending&&e._lessonStage===this.step&&this.attackEnemies.includes(e);
    const left=attack&&this.step===-2&&(opts?._lessonAttack==='kiSlash'||P.s==='wSwing'&&opts?._lessonAttack==='weapon');
    const right=attack&&this.step===-1&&opts?.magic&&opts?.fireball&&!opts._fromTurret&&!opts.dot;
    const reflected=this.chapter===1&&this.phase==='practice'&&!this.pending&&(this.step===0||this.step===1)&&e===this.parryEnemy&&e._lessonStage===this.step&&
      !!this.parriedShot&&this.parriedShot===this.shot&&opts?._lessonParryShot===this.parriedShot&&this.parriedShot.friendly&&this.parriedShot.parryBlueBean;
    const trap=this.chapter===1&&this.step===8&&this.phase==='practice'&&!this.pending&&this.trapEnemies.includes(e)&&opts?.dot&&opts?._lessonAttack==='spikeTrap';
    if(!rage&&!left&&!right&&!reflected&&!trap)return;
    if(trap){
      if(e.eShieldMax>0&&e.eShield>0){
        const absorbed=Math.min(e.eShield,dmg);
        e.eShield=Math.max(0,e.eShield-absorbed);dmg-=absorbed;
      }
      e.hp=Math.max(0,e.hp-dmg);e.flashT=6;if(e.hp>0)return;
    }
    e.hp=0;e.alive=false;
    const killAng=Number.isFinite(ang)?ang:Math.atan2(e.y-P.y,e.x-P.x);
    deathFX(e.x,e.y,e.r,e.col,false,false,e.etype);
    _addCorpse(e,killAng,Math.min(8,dmg/Math.max(1,e.mhp)*20));
    _addGorePiece(e.x,e.y,'flesh');_addDeathImpact(e.x,e.y,e.r);
    if(rage){_addBoom(e.x,e.y,100,72,'fire');addParts(e.x,e.y,'#ff6633',24);}
    if(left||right){
      if(left)this.leftKills++;else this.rightKills++;
      this.updateAttackPractice();
      if((left?this.leftKills:this.rightKills)>=3)this.completeStep();
    }
    if(reflected)this.completeStep();
    if(trap){this.trapKills++;this.updateTrapPractice();if(this.trapKills>=10&&this.trapEscaped)this.completeStep();}
    _shDirty=true;
  },
  rageCast(amount) {
    if(this.active&&this.phase==='practice'&&this.step===7&&this.focusTicks<=0&&!this.directionHeld()&&amount>=100)this.completeStep();
  },
  finish() {
    if (!this.active) return;
    this.restoreTrapPractice();
    this.clearShot(); this.resetPose();
    ens = this.saved.ens; projs = this.saved.projs; pProjs = this.saved.pProjs; worldItems = this.saved.worldItems;
    Object.assign(G, this.saved.fields);
    P.hp = this.saved.hp; P.mp = this.saved.mp; P.st = this.saved.st; P.shield = this.saved.shield;
    P.iframes = this.saved.iframes; P.x = this.saved.x; P.y = this.saved.y; P.activeQSk = this.saved.q; P.parryBank = this.saved.bank;
    P.rage=this.saved.rage;_harpGauge=this.saved.harp;P.skills=this.saved.skills;P._fused=this.saved.fused;SKILL_SLOTS[4]=this.saved.slot;BINDS2=this.saved.binds2;P.activeChargeSk=this.saved.charge;P._gslCd=this.saved.slamCd;P._ioActive=this.saved.io;
    this.heldDirections.clear();this.setRageFocus(false);this.rageZoom.remove();_shDirty = true;
    window._resourcePractice?.restore();
    for(const [key,entry] of Object.entries(this.basicSkillSnapshot||{})){if(entry.had)P[key]=entry.value;else delete P[key];}
    this.basicSkillSnapshot=null;
    this.active = false; this.pending = null; this.chainPractice=null; this.attackEnemies=[];this.parryEnemy=null;this.parriedShot=null; this.panel.remove(); this.backdrop.remove(); this.saved = null;
  }
};
