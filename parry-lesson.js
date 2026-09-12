/* 1-1 guided practice. Success is reported only by the game's projectile collision branches. */
window._parryLesson = {
  active: false, seen: false, phase: 'intro', step: 0, checks: Array(8).fill(false), shot: null,
  labels: ['마법탄 패링', '물리탄 패링', 'Q 홀딩 · 다수 마법탄 패링', 'E 홀딩 · 다수 물리탄 패링', 'Shift · 사슬 이동', '방향키 + Space · 전격이동', '패링 · 분노 축적', 'Space · 분노 발동'],
  heldDirections: new Set(),
  dismissed() {
    if(this.skipRemembered)return true;
    try{return localStorage.getItem('exoduser:tutorial-skipped:v1')==='1';}catch{return false;}
  },
  skipAll() {
    this.skipRemembered=true;this.seen=true;
    try{localStorage.setItem('exoduser:tutorial-skipped:v1','1');}catch{}
    this.finish();
    const system=window._systemLesson;
    if(system){system.closed=true;system.active=false;system.panel?.remove();}
  },
  actions() { if(this.chapter===2)return window._resourcePractice.actions(this);if(this.step<0)return this.step===-2?['weapon']:this.step===-1?['beam']:[];return this.step === 4 ? ['charge'] : this.step === 5 ? ['up','down','left','right','bow'] : this.step === 7 ? ['bow'] : ['parry','shield']; },
  isDirection(action) { return ['up','down','left','right'].includes(action); },
  allows(action) { return !this.active || (this.phase !== 'intro' && this.isDirection(action)) || (this.phase === 'practice' && !this.focusTicks && this.actions().includes(action)); },
  directionHeld() { return this.heldDirections.size > 0 || ['up','down','left','right'].some(a => KH[BINDS[a]] || (BINDS2[a] && KH[BINDS2[a]])); },
  releaseKey(code) { this.heldDirections.delete(code); },
  allowKey(code) {
    if(!this.active)return true;
    if(['up','down','left','right'].some(a=>code===BINDS[a]||code===BINDS2[a])){this.heldDirections.add(code);return this.phase!=='intro';}
    if(this.phase !== 'practice' || this.focusTicks > 0)return false;
    if(this.chapter===2)return window._resourcePractice.allowKey(this,code);
    const allowed=this.actions().some(a => code === BINDS[a] || code === BINDS2[a]);
    if(this.step === 7 && code === 'Space' && this.directionHeld())return false;
    if(this.step === 5 && code === 'Space' && this.directionHeld())this.directionSpace=true;
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
    for (const event of ['mousedown', 'mouseup', 'click', 'pointerdown', 'pointerup', 'contextmenu']) this.backdrop.addEventListener(event, e => { e.preventDefault(); e.stopPropagation(); });
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
    const checklist = this.node('div'); checklist.className = 'lesson-checklist';
    this.rowLabels = []; this.rowTexts = [];
    if(this.chapter!==2){
      this.basicRows=['WASD / 방향키 · 이동','좌클릭 · 무기 공격','우클릭 · 마법 공격'].map(label=>{
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
    this.button.onclick = () => {
      if (this.phase === 'intro') {
        this.phase = 'practice'; this.cooldown = 45;
        this.resetPose(); this.button.blur(); this.render();
      }
    };
    const skip = this.node('button', '연습 건너뛰기'); skip.className = 'lesson-skip'; skip.onclick = () => this.skipAll();
    const progress = this.node('div'); progress.className = 'lesson-progress';
    this.progressFill = this.node('div'); this.progressFill.className = 'lesson-progress-fill'; progress.append(this.progressFill);
    const content = this.node('div'); content.className = 'lesson-content';
    content.append(eyebrow, art, this.title, this.subtitle, checklist, this.hint, this.holdBox, this.rageBox, safety);
    const footer = this.node('div'); footer.className = 'lesson-footer';
    footer.append(this.button, skip, progress);
    this.panel.append(content, footer);
    for (const event of ['mousedown', 'mouseup', 'click', 'pointerdown', 'pointerup']) this.panel.addEventListener(event, e => e.stopPropagation());
    document.body.append(this.panel);
  },
  key(step = this.step) { if(step===4)return 'SHIFT';if(step===5)return '↔ + SPACE';if(step===7)return 'SPACE';return String(BINDS[step % 2 === 0 ? 'parry' : 'shield'] || (step % 2 === 0 ? 'q' : 'e')).replace(/^Key/,'').toUpperCase(); },
  label(step) { return step < 2 ? `${this.key(step)} · ${this.labels[step]}` : this.labels[step]; },
  render() {
    if(this.chapter===2)return window._resourcePractice.render(this);
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
    const tips = this.step === 4 ? '이동할 곳에 마우스를 향하고 Shift를 눌렀다 떼세요. 사슬이 실제 발사되면 성공입니다.' : this.step === 5 ? 'WASD 또는 방향키를 누른 채 Space를 누르세요. 방향 입력과 함께 전격이동이 발동하면 성공입니다.' : this.step === 6 ? 'Q를 2초 동안 누른 뒤, 함께 날아오는 마법탄 10발이 가까워지면 떼세요. 한 번에 여러 발을 패링해 분노 100%를 채워보세요.' : this.step === 7 ? '몬스터들이 주변을 둘러쌌습니다. 방향키에서 손을 떼고 Space만 눌러 분노 폭발로 한 번에 쓸어버리세요.' : this.step === 2 ? `[${this.key()}]를 2초 동안 누르세요. 화염·물·암흑·번개·무지개탄을 보고 키를 떼어 한 번에 3발 이상 패링하세요. 홀딩 중 보호막은 피해를 일부 흡수하고 그로기를 막습니다. 피해를 완전히 막는 무적은 아닙니다.` : this.step === 3 ? `[${this.key()}]를 누른 채 탄 쪽을 바라보세요. 이빨입탄·혈안탄·관통탄·물리 검기파·물리 환영검이 함께 날아옵니다. 3단계 충전 후 키를 떼어 5종 중 3발 이상 한 번에 쳐내세요. 풀차지 자동 발동도 인정합니다.` : q ? `보라색 탄이 가까워지는 순간 [${this.key()}]를 누르세요. 너무 일찍 눌렀다면 떼고 다시 시도하세요.` : `탄을 바라보고 [${this.key()}]를 짧게 눌렀다 떼세요. 길게 누르면 차징이 됩니다.`;
    this.hint.textContent = complete ? '모든 연습 성공! 잠시 후 1-1 전투로 이어집니다.' : tips;
    this.holdBox.hidden = (this.step !== 2 && this.step !== 3) || complete;
    this.holdMeter.value = 0; this.holdLabel.textContent = '키를 길게 눌러보세요';
    this.rageBox.hidden = this.step !== 6 || complete; this.updateRage();
    this.button.hidden = this.phase !== 'intro';
    this.button.textContent = '연습 시작  →';
    this.progressFill.style.width = `${this.checks.filter(Boolean).length / this.labels.length * 100}%`;
    const basicChecks=[this.movementDone,this.leftClickDone,this.rightClickDone];
    this.basicRows.forEach(({row,box},i)=>{box.checked=!!basicChecks[i];row.setAttribute('data-current',String(this.step===i-3));row.setAttribute('data-complete',String(!!basicChecks[i]));});
    const basicLabels=['WASD / 방향키 · 이동','좌클릭 · 무기 공격','우클릭 · 마법 공격'];
    this.subtitle.textContent=`${this.step+4} / ${this.labels.length+3} · ${this.step<0?basicLabels[this.step+3]:this.label(this.step)}`;
    this.progressFill.style.width=`${(this.checks.filter(Boolean).length+basicChecks.filter(Boolean).length)/(this.labels.length+3)*100}%`;
    if(this.step<0){
      const i=this.step+3;
      this.keycap.textContent=['W A S D','좌클릭','우클릭'][i];
      this.title.textContent=['먼저 움직여보세요','무기를 휘둘러보세요','마법을 발사해보세요'][i];
      this.hint.textContent=[
        'W 위 · A 왼쪽 · S 아래 · D 오른쪽. WASD 또는 방향키로 조금 걸어보세요. 이후 모든 실습에서도 이동할 수 있습니다.',
        '마우스로 공격할 방향을 가리키고 왼쪽 버튼을 누르세요. 무기 공격은 녹색 스태미나를 사용합니다. 실제로 무기를 휘두르면 성공입니다.',
        '마우스로 발사할 방향을 가리키고 오른쪽 버튼을 누르세요. 기본 마법 공격은 마력을 사용합니다. 실제 마법 시전이 시작되면 성공입니다.'
      ][i];
    }
  },
  resetPose() {
    P.s = 'idle'; P.st2 = 0; P._sbParryT = 0; P._sbHoldT = 0; P._sbReleaseR = 0; P._sbCd = 0;
    this.holdReady = false; this.holdStarted = false;
    this.volleyReleased=false;this.volleyHits=new Set();this.volleyRetryTicks=0;this.volleyFailed=false;this.releaseTicks=0;
    P._kgChg = 0; P._kgTier = 0; P._sBashChgMul = 1;
    _harpActive=false;_dashActive=false;_dashHold=false;_dashHoldF=0;_dashTier=0;_dashLeft=0;_dashPhase=0;
    P._bdMoveT=0; P._preBdState=null;this.directionSpace=false;
    P._sdHold = 0; P._bdTrigger = null; P.kb.x = 0; P.kb.y = 0;
    for (const key of Object.keys(K)) K[key] = false;
    for (const key of Object.keys(KH)) KH[key] = false;
    for (const key of Object.keys(MB)) MB[key] = false;
    _stopShieldLoop();
  },
  start() {
    this.combatLabels??=this.labels.slice();this.labels=this.combatLabels.slice();this.chapter=1;this.resourceReadout=null;
    window._resourcePractice?.save();
    this.seen = true; this.active = true; this.phase = 'intro'; this.step = -3; this.checks = Array(this.labels.length).fill(false);
    this.movementDone=false;this.leftClickDone=false;this.rightClickDone=false;this.moveDistance=0;this.moveLast={x:P.x,y:P.y};
    this.basicSkillSnapshot={};for(const key of ['activeLMBSk','activeMagicSk'])this.basicSkillSnapshot[key]={had:Object.prototype.hasOwnProperty.call(P,key),value:P[key]};
    P.activeLMBSk=null;P.activeMagicSk='fireball';
    this.saved = { ens, projs, pProjs, worldItems, fields: {}, hp: P.hp, mp: P.mp, st: P.st, shield: P.shield, iframes: P.iframes, x: P.x, y: P.y, q: P.activeQSk, bank: P.parryBank, rage: P.rage, harp: _harpGauge, skills: P.skills, fused: P._fused, slot: SKILL_SLOTS[4], binds2: BINDS2, charge: P.activeChargeSk, slamCd: P._gslCd, io: P._ioActive };
    ens = []; projs = []; pProjs = []; worldItems = [];
    _shDirty = true;
    for (const key of ['spawnHoles', 'rifts', '_fieldBosses', '_fireDevils', '_fireZones']) { this.saved.fields[key] = G[key]; G[key] = []; }
    for (const key of ['_bonfire', '_fieldBoss', '_gateGuard', '_bossRef']) { this.saved.fields[key] = G[key]; G[key] = null; }
    P.skills={...P.skills,bladeDash:Math.max(1,P.skills.bladeDash||0),giantSlam:1};P._fused={};P._ioActive=false;
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
    if(this.step>1||p!==this.shot)return;
    this.completeStep();
  },
  completeStep() {
    if(this.chapter!==2&&this.step<0){const key=['movementDone','leftClickDone','rightClickDone'][this.step+3];if(!this[key]){this[key]=true;this.pending='success';}return;}
    if(this.pending || this.checks[this.step])return;
    this.checks[this.step] = true;
    this.pending = this.step < this.labels.length-1 ? 'success' : 'done';
    if(this.pending==='done')window._tutorialBadges?.complete(this.chapter===2?'resources':'combat',this.chapter===2?this.checks:[this.movementDone,this.leftClickDone,this.rightClickDone,...this.checks]);
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
  miss(p) {
    if(this.chapter===2)return window._resourcePractice.miss(this,p);
    if(!this.active||this.phase!=='practice'||this.pending||this.failTicks||!p._lessonShot||p.friendly)return;
    this.explode(p);
    doHitFlash('#ff4422',.35);shake(7);
    playSample('player_hit1',.6,1);
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
        if(window._resourcePractice&&new URLSearchParams(location.search).get('resourceTutorial')!=='0'){window._resourcePractice.start(this);return false;}
        this.finish(); return false;
      }
      this.clearShot(); this.step++; this.phase = 'practice'; this.cooldown = 45;
      this.resetPose();
      if(this.step===7){this.spawnRageEnemies();this.focusTicks=150;this.setRageFocus(true);}
      this.render();
    }
    P.hp = this.saved.hp; P.mp = P.mmp; P.st = P.mst; P.shield = this.saved.shield; P.iframes = 0;
    P.kb.x = 0; P.kb.y = 0;
    if(this.step===-3){
      if(this.directionHeld())this.moveDistance+=Math.hypot(P.x-this.moveLast.x,P.y-this.moveLast.y);
      this.moveLast={x:P.x,y:P.y};
      if(this.moveDistance>=120)this.completeStep();
      return false;
    }
    if(this.step===-2||this.step===-1){
      if(this.step===-2&&P.s==='wSwing'||this.step===-1&&P.s==='magicCast')this.completeStep();
      return false;
    }
    if (this.step === 2 || this.step === 3) { this.watchHold(); return false; }
    if (this.step === 4 || this.step === 5) {
      _harpGauge=_HARP_GAUGE_MAX;
      if(this.step===4&&(_harpActive||_dashActive))this.completeStep();
      if(this.step===5&&this.directionSpace&&P._bdMoveT>0)this.completeStep();
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
    if (this.shot && (!projs.includes(this.shot) || this.shot.life <= 0 || Math.hypot(this.shot.x - P.x, this.shot.y - P.y) > 1200)) {
      this.clearShot(true); this.resetPose(); this.cooldown = 60;
      this.hint.textContent = '다시 해볼게요. 탄이 가까워질 때 ' + ('[' + this.key() + ']' + (this.step % 2 === 0 ? '를 눌러' : '를 짧게 눌렀다 떼어')) + ' 패링하세요.';
    }
    if (!this.shot && (this.cooldown -= _dtSp) <= 0) {
      const q = this.step % 2 === 0;
      this.shot = spawnProj({ x: P.x, y: P.y - 800, vx: 0, vy: 3, dmg: 0, el: q ? EL.D : EL.P, col: q ? '#b26dff' : '#f4f4f4', life: 360, ml: 360, friendly: false, _commit: true, _lessonShot: true });
      if (this.shot) { this.shot._lessonExploded=false;this.shot.vx = 0; this.shot.vy = 3; this.shot.homing = false; }
      else this.cooldown = 60;
    }
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
      if(p){p._lessonExploded=false;p.vx=-Math.cos(a)*speed;p.vy=-Math.sin(a)*speed;p.homing=false;this.volley.push(p);}
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
  hurtEnemy(e,dmg) {
    if(!e?._lessonEnemy||!e.alive||this.step!==7||P.s!=='gSlamWindup'||!(dmg>0))return;
    e.hp=0;e.alive=false;
    _addBoom(e.x,e.y,100,72,'fire');
    addParts(e.x,e.y,'#ff6633',24);
    _shDirty=true;
  },
  rageCast(amount) {
    if(this.active&&this.phase==='practice'&&this.step===7&&this.focusTicks<=0&&!this.directionHeld()&&amount>=100)this.completeStep();
  },
  finish() {
    if (!this.active) return;
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
    this.active = false; this.pending = null; this.panel.remove(); this.backdrop.remove(); this.saved = null;
  }
};
