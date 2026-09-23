/* Contextual onboarding: observe real system actions; never alter gameplay or saves. */
window._systemLesson = {
  t(ko,en,values) { return typeof _L==='function' ? _L(ko,en,values) : ko.replace(/\{(\w+)\}/g,(all,key)=>values?.[key]??all); },
  active: false,
  seen: false,
  closed: false,
  collapsed: false,
  checks: new Set(),
  skipped: new Set(),
  get steps() { return [
    { id: 'pickup', label: this.t("장비 획득","Pick up equipment"), action: 'interact', title: this.t("전리품을 챙겨보세요","Collect your loot"), text: key => this.t("장비 가까이 다가가 [{key}]로 주우세요. 빈 장착 슬롯이면 자동으로 장착됩니다. 가방이 가득 차 획득하지 못한 경우에는 완료되지 않습니다.","Move close to equipment and press [{key}] to pick it up. It is equipped automatically if its slot is empty. A failed pickup due to a full inventory does not complete this step.",{key}) },
    { id: 'inventory', label: this.t("인벤토리 열기","Open inventory"), action: 'inventory', title: this.t("가방과 장비를 살펴보세요","Inspect your inventory"), text: key => this.t("[{key}]로 인벤토리를 열어보세요. 가방의 장비와 현재 장착한 장비를 확인할 수 있습니다.","Press [{key}] to open your inventory and inspect carried and equipped items.",{key}) },
    { id: 'equipment', label: this.t("장비 장착 확인","Inspect equipped gear"), action: 'inventory', title: this.t("장착한 장비를 확인하세요","Check your equipped gear"), text: key => this.t("[{key}]로 인벤토리를 열고 장착 슬롯의 장비를 선택하세요. 또는 가방의 장비를 선택해 장착하세요. 교체 시 요구 레벨과 강화 이전 비용을 확인하세요.","Press [{key}] to open your inventory and select an equipped item, or equip an item from your bag. Check the level requirement and upgrade transfer cost before replacing gear.",{key}) },
    { id: 'stats', label: this.t("능력치 살펴보기","Explore stats"), action: 'stats', title: this.t("내 능력치를 확인하세요","Check your stats"), text: key => this.t("[{key}]로 능력치 화면을 열어 스탯과 패시브를 살펴보세요. 지금 포인트를 사용할 필요는 없습니다.","Press [{key}] to inspect your stats and passives. You do not need to spend any points now.",{key}) },
    { id: 'skills', label: this.t("스킬 살펴보기","Explore skills"), action: 'skill', title: this.t("전투 스킬을 확인하세요","Check your combat skills"), text: key => this.t("[{key}]로 스킬 화면을 열어 습득한 스킬과 구성을 살펴보세요.","Press [{key}] to inspect your learned skills and loadout.",{key}) },
    { id: 'forge', label: this.t("대장간 살펴보기","Visit the forge"), action: 'forge', title: this.t("강화 메뉴를 확인하세요","Explore upgrades"), text: key => this.t("[{key}]로 대장간을 열어 강화 메뉴와 필요한 비용을 살펴보세요. 실제 강화를 하지 않아도 이 안내는 완료됩니다.","Press [{key}] to visit the forge and inspect upgrades and their costs. You do not need to perform an upgrade to complete this step.",{key}) },
    { id: 'recovery', label: this.t("자동 회복 경험","Experience auto-healing"), title: this.t("악의로 자동 회복합니다","Malice fuels auto-healing"), text: () => this.t("부족한 체력이 물약 회복량 이상이고 재사용 대기시간이 끝나면 악의 1개를 소비해 자동 회복합니다. 악의를 남겨두고 평소처럼 전투하세요. 일부러 피해를 받을 필요는 없으며, 이 항목은 건너뛸 수 있습니다.","When your missing HP reaches the potion healing amount and its cooldown is over, auto-healing consumes 1 Malice. Keep some Malice and fight normally. You do not need to take damage on purpose; you can skip this step.") }
  ]; },
  eligible() {
    if(window._parryLesson?.dismissed?.())return false;
    const q = new URLSearchParams(location.search);
    return q.get('tutorial') !== '0' && q.get('systemTutorial') !== '0' &&
      !q.has('projectilelab') && !_EDITOR_MODE && !_MAP_QA_MODE && _bossTestReq < 0;
  },
  available() {
    return this.active && !this.closed && G.on && P && P.hp > 0 &&
      !G._intro && !window._parryLesson?.active;
  },
  key(action) {
    const code = BINDS[action] || BINDS2[action];
    return code ? keyName(code, true) : this.t("설정에서 키 배정","Assign a key in Settings");
  },
  node(tag, text, className) {
    const el = document.createElement(tag);
    if (text !== undefined) el.textContent = text;
    if (className) el.className = className;
    return el;
  },
  build() {
    this.panel = this.node('aside');
    this.panel.id = 'systemLesson';
    this.panel.setAttribute('aria-label', this.t("시스템 튜토리얼","System tutorial"));
    const header = this.node('div', undefined, 'system-lesson-header');
    this.toggle = this.node('button', this.t("시스템 안내 접기","Collapse system guide"));
    this.toggle.type = 'button';
    this.toggle.setAttribute('aria-controls', 'systemLessonBody');
    this.toggle.onclick = () => { this.collapsed = !this.collapsed; this.render(); };
    this.counter = this.node('span');
    header.append(this.toggle, this.counter);
    this.body = this.node('div'); this.body.id = 'systemLessonBody';
    this.title = this.node('h2');
    this.hint = this.node('p');
    this.status = this.node('p', '', 'system-lesson-status');
    this.status.setAttribute('role', 'status');
    this.status.setAttribute('aria-live', 'polite');
    this.list = this.node('ol');
    this.rows = this.steps.map(step => {
      const row = this.node('li');
      const mark = this.node('span', '○'); mark.setAttribute('aria-hidden', 'true');
      const label = this.node('span', step.label);
      row.append(mark, label); this.list.append(row);
      return { row, mark, label };
    });
    const actions = this.node('div', undefined, 'system-lesson-actions');
    this.skip = this.node('button', this.t("이 항목 건너뛰기","Skip this step")); this.skip.type = 'button';
    this.skip.onclick = () => {
      const step = this.current();
      if (step) { this.skipped.add(step.id); this.lastStatus={id:step.id,skipped:true}; this.render(); }
    };
    const close = this.close = this.node('button', this.t("안내 종료","Close guide")); close.type = 'button';
    close.onclick = () => { this.closed = true; this.active = false; this.panel.remove(); };
    actions.append(this.skip, close);
    this.body.append(this.title, this.hint, this.status, this.list, actions);
    this.panel.append(header, this.body);
    for (const name of ['mousedown', 'pointerdown', 'click', 'dblclick', 'contextmenu', 'wheel']) {
      this.panel.addEventListener(name, event => event.stopPropagation());
    }
    this.panel.addEventListener('keydown', event => {
      if (['Space', 'Enter', 'Tab'].includes(event.code)) event.stopPropagation();
    });
    // Release events reach the engine so a held attack/movement never gets stuck over this panel.
    document.body.append(this.panel);
  },
  current() { return this.steps.find(step => !this.checks.has(step.id) && !this.skipped.has(step.id)); },
  record(id) {
    if (!this.available() || this.checks.has(id) || this.skipped.has(id) || !this.steps.some(step => step.id === id)) return;
    this.checks.add(id);
    const step = this.steps.find(step => step.id === id);
    this.lastStatus={id:step.id,skipped:false};
    this.render();
    window._tutorialBadges?.complete('systems',this.steps.map(entry=>this.checks.has(entry.id)));
  },
  pickedUp(item) {
    if (item && item.slot !== 'bonePart' && (INV.bag.includes(item) || Object.values(INV.equipped).includes(item))) this.record('pickup');
  },
  equipped(item) {
    if (item && item.slot !== 'bonePart' && INV.equipped[item.slot] === item) this.record('equipment');
  },
  recovered(before, after) {
    if (before.hp > 0 && after.hp > before.hp && after.mats === before.mats - 1 && after.cooldown > 0) this.record('recovery');
  },
  render() {
    const step = this.current();
    this.panel.setAttribute('aria-label',this.t('시스템 튜토리얼','System tutorial'));
    this.skip.textContent=this.t('이 항목 건너뛰기','Skip this step');
    this.close.textContent=this.t('안내 종료','Close guide');
    if(this.lastStatus){
      const last=this.steps.find(entry=>entry.id===this.lastStatus.id);
      this.status.textContent=last.label+(this.lastStatus.skipped?this.t(' · 건너뜀',' · Skipped'):this.t(' · 완료',' · Complete'));
    }
    this.toggle.textContent = this.collapsed ? this.t("시스템 안내 펼치기","Expand system guide") : this.t("시스템 안내 접기","Collapse system guide");
    this.toggle.setAttribute('aria-expanded', String(!this.collapsed));
    this.body.hidden = this.collapsed;
    this.counter.textContent = this.t('{done} / {total} 완료','{done} / {total} complete',{done:this.checks.size,total:this.steps.length});
    this.title.textContent = step ? step.title : this.skipped.size ? this.t("시스템 안내를 마쳤습니다","System guide finished") : this.t("시스템 기본을 익혔습니다","System basics complete");
    this.hint.textContent = step ? step.text(step.action ? this.key(step.action) : '') : this.skipped.size ? this.t('{done}개 완료 · {skipped}개 건너뜀. 안내 종료를 누르면 닫힙니다.','{done} complete · {skipped} skipped. Select Close guide to dismiss this panel.',{done:this.checks.size,skipped:this.skipped.size}) : this.t("획득·장비·성장 메뉴와 자동 회복을 모두 확인했습니다. 안내 종료를 누르면 닫힙니다.","You have explored loot, equipment, progression menus and auto-healing. Select Close guide to dismiss this panel.");
    this.skip.hidden = !step;
    this.rows.forEach(({ row, mark, label }, i) => {
      const entry = this.steps[i], done = this.checks.has(entry.id), skipped = this.skipped.has(entry.id);
      mark.textContent = done ? '✓' : skipped ? '–' : '○';
      label.textContent = entry.label + (done ? this.t(" · 완료"," · Complete") : skipped ? this.t(" · 건너뜀"," · Skipped") : '');
      row.setAttribute('data-current', String(step?.id === entry.id));
      row.setAttribute('data-done', String(done));
    });
    this.bindingSignature = JSON.stringify([BINDS, BINDS2, typeof OPT==='undefined'?'ko':OPT.lang]);
  },
  tick() {
    if (this.closed) return;
    if (!this.seen) {
      if (!this.eligible() || !G.on || G.stage !== 0 || G._intro || G.paused || !P || P.hp <= 0 || _saving) return;
      const combat = window._parryLesson;
      if (combat && (!combat.seen || combat.active)) return;
      this.seen = true; this.active = true; this.build(); this.render();
    }
    this.panel.hidden = !this.available();
    if (this.panel.hidden) return;
    const open = id => document.getElementById(id)?.classList.contains('on');
    if (open('invPanel')) {
      this.record('inventory');
      if (typeof INV.selected === 'string' && INV.selected.startsWith('eq:') && INV.equipped[INV.selected.slice(3)]) this.record('equipment');
    }
    if (open('statPanel')) this.record('stats');
    if (open('skillPanel')) this.record('skills');
    if (open('forge')) this.record('forge');
    if (JSON.stringify([BINDS, BINDS2, typeof OPT==='undefined'?'ko':OPT.lang]) !== this.bindingSignature) this.render();
  }
};
