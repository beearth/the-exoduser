/* Contextual onboarding: observe real system actions; never alter gameplay or saves. */
window._systemLesson = {
  active: false,
  seen: false,
  closed: false,
  collapsed: false,
  checks: new Set(),
  skipped: new Set(),
  steps: [
    { id: 'pickup', label: '장비 획득', action: 'interact', title: '전리품을 챙겨보세요', text: key => `장비 가까이 다가가 [${key}]로 주우세요. 빈 장착 슬롯이면 자동으로 장착됩니다. 가방이 가득 차 획득하지 못한 경우에는 완료되지 않습니다.` },
    { id: 'inventory', label: '인벤토리 열기', action: 'inventory', title: '가방과 장비를 살펴보세요', text: key => `[${key}]로 인벤토리를 열어보세요. 가방의 장비와 현재 장착한 장비를 확인할 수 있습니다.` },
    { id: 'equipment', label: '장비 장착 확인', action: 'inventory', title: '장착한 장비를 확인하세요', text: key => `[${key}]로 인벤토리를 열고 장착 슬롯의 장비를 선택하세요. 또는 가방의 장비를 선택해 장착하세요. 교체 시 요구 레벨과 강화 이전 비용을 확인하세요.` },
    { id: 'stats', label: '능력치 살펴보기', action: 'stats', title: '내 능력치를 확인하세요', text: key => `[${key}]로 능력치 화면을 열어 스탯과 패시브를 살펴보세요. 지금 포인트를 사용할 필요는 없습니다.` },
    { id: 'skills', label: '스킬 살펴보기', action: 'skill', title: '전투 스킬을 확인하세요', text: key => `[${key}]로 스킬 화면을 열어 습득한 스킬과 구성을 살펴보세요.` },
    { id: 'forge', label: '대장간 살펴보기', action: 'forge', title: '강화 메뉴를 확인하세요', text: key => `[${key}]로 대장간을 열어 강화 메뉴와 필요한 비용을 살펴보세요. 실제 강화를 하지 않아도 이 안내는 완료됩니다.` },
    { id: 'recovery', label: '자동 회복 경험', title: '악의로 자동 회복합니다', text: () => '부족한 체력이 물약 회복량 이상이고 재사용 대기시간이 끝나면 악의 1개를 소비해 자동 회복합니다. 악의를 남겨두고 평소처럼 전투하세요. 일부러 피해를 받을 필요는 없으며, 이 항목은 건너뛸 수 있습니다.' }
  ],
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
    return code ? keyName(code, true) : '설정에서 키 배정';
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
    this.panel.setAttribute('aria-label', '시스템 튜토리얼');
    const header = this.node('div', undefined, 'system-lesson-header');
    this.toggle = this.node('button', '시스템 안내 접기');
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
    this.skip = this.node('button', '이 항목 건너뛰기'); this.skip.type = 'button';
    this.skip.onclick = () => {
      const step = this.current();
      if (step) { this.skipped.add(step.id); this.status.textContent = step.label + ' · 건너뜀'; this.render(); }
    };
    const close = this.node('button', '안내 종료'); close.type = 'button';
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
    this.status.textContent = step.label + ' · 완료';
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
    this.toggle.textContent = this.collapsed ? '시스템 안내 펼치기' : '시스템 안내 접기';
    this.toggle.setAttribute('aria-expanded', String(!this.collapsed));
    this.body.hidden = this.collapsed;
    this.counter.textContent = `${this.checks.size} / ${this.steps.length} 완료`;
    this.title.textContent = step ? step.title : this.skipped.size ? '시스템 안내를 마쳤습니다' : '시스템 기본을 익혔습니다';
    this.hint.textContent = step ? step.text(step.action ? this.key(step.action) : '') : this.skipped.size ? `${this.checks.size}개 완료 · ${this.skipped.size}개 건너뜀. 안내 종료를 누르면 닫힙니다.` : '획득·장비·성장 메뉴와 자동 회복을 모두 확인했습니다. 안내 종료를 누르면 닫힙니다.';
    this.skip.hidden = !step;
    this.rows.forEach(({ row, mark, label }, i) => {
      const entry = this.steps[i], done = this.checks.has(entry.id), skipped = this.skipped.has(entry.id);
      mark.textContent = done ? '✓' : skipped ? '–' : '○';
      label.textContent = entry.label + (done ? ' · 완료' : skipped ? ' · 건너뜀' : '');
      row.setAttribute('data-current', String(step?.id === entry.id));
      row.setAttribute('data-done', String(done));
    });
    this.bindingSignature = JSON.stringify([BINDS, BINDS2]);
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
    if (JSON.stringify([BINDS, BINDS2]) !== this.bindingSignature) this.render();
  }
};
