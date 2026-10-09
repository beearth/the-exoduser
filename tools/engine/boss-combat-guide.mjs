const PANEL_ID = 'bossCombatGuide';

const GUIDE_STYLE = `
#bossCombatGuide{z-index:100000;padding:16px;box-sizing:border-box;color:#eadfd0}
#bossCombatGuide .bcg-shell{width:min(940px,100%);max-height:90vh;max-height:90dvh;padding:28px;overflow:auto;overscroll-behavior:contain;background:linear-gradient(145deg,#201719,#100d11 65%);border:1px solid #765347;border-radius:20px;box-shadow:0 24px 90px #000b,inset 0 1px #d0a57522;color:#eadfd0;font-family:var(--font-hell,"Noto Sans KR",sans-serif)}
#bossCombatGuide .bcg-header{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;margin-bottom:18px}
#bossCombatGuide .bcg-eyebrow{margin:0 0 6px;color:#bc9870;font-size:.75rem;font-weight:700;letter-spacing:.18em}
#bossCombatGuide h2{margin:0;font-size:clamp(1.45rem,3vw,2rem);color:#fff0d7;letter-spacing:.03em}
#bossCombatGuide .bcg-intro{margin:9px 0 0;color:#bdafa5;font-size:.95rem;line-height:1.65}
#bossCombatGuide .bcg-close{flex:none;min-width:44px;min-height:44px;padding:8px 14px;border:1px solid #82604e;border-radius:10px;background:#2a1e1d;color:#f2dfc7;font:inherit;font-size:.9rem;cursor:pointer}
#bossCombatGuide .bcg-close:hover{background:#3a2923;border-color:#d2a775}
#bossCombatGuide .bcg-close:focus-visible{outline:3px solid #f5ca81;outline-offset:4px}
#bossCombatGuide .bcg-note{margin:0 0 18px;padding:12px 15px;border:1px solid #72602f;border-radius:10px;background:#a8841912;color:#dfcca0;font-size:.88rem;line-height:1.65}
#bossCombatGuide .bcg-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
#bossCombatGuide .bcg-card{min-width:0;padding:18px;border:1px solid #55423d;border-radius:14px;background:linear-gradient(165deg,#30232266,#171216);box-sizing:border-box}
#bossCombatGuide .bcg-card-top{display:flex;align-items:center;gap:9px;margin-bottom:12px}
#bossCombatGuide .bcg-icon{display:inline-flex;align-items:center;justify-content:center;flex:none;width:32px;height:32px;border:1px solid #97877477;border-radius:9px;color:#eee8dd;background:#d9ceb00a;font-size:1.15rem}
#bossCombatGuide .bcg-magic .bcg-icon{color:#abcff5;border-color:#7293b577;background:#7daff012}
#bossCombatGuide .bcg-rainbow .bcg-icon{color:#e3c2f1;border-color:#bb8ecc77;background:#ba8ee012}
#bossCombatGuide h3{margin:0;color:#f2e3ce;font-size:1rem;line-height:1.4}
#bossCombatGuide .bcg-key{display:inline-flex;align-items:center;justify-content:center;min-width:30px;min-height:30px;padding:2px 9px;margin-left:auto;border:1px solid #a58b66;border-bottom-width:3px;border-radius:6px;background:#100e11;color:#ffdea3;font-family:inherit;font-size:1rem;font-weight:800;box-sizing:border-box;overflow-wrap:anywhere}
#bossCombatGuide .bcg-copy{margin:0;color:#d0c2b6;font-size:.91rem;line-height:1.75;overflow-wrap:anywhere}
#bossCombatGuide .bcg-detail{margin:9px 0 0;color:#b5a69b;font-size:.82rem;line-height:1.65}
#bossCombatGuide .bcg-mode{margin:10px 0 0;color:#a9c7e6;font-size:.84rem;font-weight:700;line-height:1.6}
#bossCombatGuide .bcg-hazards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:12px}
#bossCombatGuide .bcg-hazard{padding:15px 18px;border:1px solid #4b4938;border-radius:12px;background:#1c1b161f}
#bossCombatGuide .bcg-hazard h3{margin-bottom:7px;color:#d9d2ad}
#bossCombatGuide .bcg-execution{margin-top:20px;padding:21px;border:1px solid #95613e;border-radius:15px;background:linear-gradient(125deg,#75432822,#21131755)}
#bossCombatGuide .bcg-execution-head{display:flex;align-items:center;gap:10px;margin-bottom:10px}
#bossCombatGuide .bcg-execution-head h3{font-size:1.12rem;color:#ffcf8e}
#bossCombatGuide .bcg-status{margin:13px 0;padding:11px 13px;border:1px solid #8a643b;border-radius:8px;background:#9e6d1f14;color:#f3cc91;font-size:.9rem;font-weight:700;line-height:1.65}
#bossCombatGuide .bcg-status[data-ready="true"]{border-color:#778b53;background:#76913d14;color:#d4e8ac}
#bossCombatGuide .bcg-costs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin-top:12px}
#bossCombatGuide .bcg-cost{padding:12px;border:1px solid #51413b;border-radius:9px;background:#08070a44}
#bossCombatGuide .bcg-cost h4{margin:0 0 7px;color:#ebd9c3;font-size:.87rem}
#bossCombatGuide .bcg-resource{margin:0;color:#d3c5b6;font-size:.85rem;line-height:1.65;overflow-wrap:anywhere}
#bossCombatGuide .bcg-check{margin:5px 0 0;color:#dbbc83;font-size:.8rem;line-height:1.6}
#bossCombatGuide .bcg-check[data-ok="true"]{color:#bfda98}
#bossCombatGuide .bcg-foot{margin:14px 0 0;color:#b5a79c;font-size:.82rem;line-height:1.7}
@media(max-width:680px){#bossCombatGuide{padding:10px}#bossCombatGuide .bcg-shell{padding:20px 16px;border-radius:14px}#bossCombatGuide .bcg-grid,#bossCombatGuide .bcg-hazards{grid-template-columns:1fr}#bossCombatGuide .bcg-card{padding:15px}#bossCombatGuide .bcg-execution{padding:16px}#bossCombatGuide .bcg-header{gap:10px}#bossCombatGuide .bcg-costs{grid-template-columns:1fr}#bossCombatGuide .bcg-close{padding:8px 10px}}
`;

function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function numberOrNull(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function displayNumber(value) {
  return value === null ? '확인 필요' : value.toLocaleString('ko-KR', { maximumFractionDigits: 2 });
}

/**
 * Installs one read-only guide; the caller owns opening, pausing and closing.
 * getState(): {parryKey,magicKey,qMode,executionLevel,executionCooldown,
 *   hp,mp,st,maxHp,maxMp,maxSt,bossGroggy,canAct};
 * bossGroggy includes a live boss; canAct describes player action readiness.
 * Cooldown is in 60 Hz gameplay ticks; the guide pause is owned by the caller.
 * qMode: 'shield' | 'peaceShield' | 'iceOrb'. keyLabel(keyCode): string.
 * Call render() after showing the panel to refresh content and focus Close.
 */
export function installBossCombatGuide({ getState, keyLabel, onClose } = {}) {
  if (typeof getState !== 'function' || typeof keyLabel !== 'function' || typeof onClose !== 'function') {
    throw new TypeError('Boss combat guide requires getState, keyLabel and onClose functions.');
  }
  if (!document.body || document.getElementById(PANEL_ID)) {
    throw new Error('Boss combat guide needs a document body and an unused panel id.');
  }

  const element = node('div', 'panel');
  element.id = PANEL_ID;
  element.setAttribute('role', 'dialog');
  element.setAttribute('aria-modal', 'true');
  element.setAttribute('aria-labelledby', 'bcg-title');
  element.setAttribute('aria-describedby', 'bcg-intro');
  const style = node('style', '', GUIDE_STYLE);
  const shell = node('div', 'pbox bcg-shell');
  shell.tabIndex = 0;
  shell.setAttribute('aria-label', '보스전 안내 내용');
  const header = node('div', 'bcg-header');
  const heading = node('div');
  const title = node('h2', '', '보스전 가이드');
  title.id = 'bcg-title';
  const intro = node('p', 'bcg-intro', '탄막을 받아치고, 그로기의 틈을 노리세요.');
  intro.id = 'bcg-intro';
  heading.append(node('p', 'bcg-eyebrow', 'DARK DRUID'), title, intro);
  const closeButton = node('button', 'bcg-close', '닫기');
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', '보스전 가이드 닫기');
  header.append(heading, closeButton);

  const note = node('p', 'bcg-note', '드루이드 독탄 중앙의 원·마름모와 키 표시를 확인하세요. 바깥의 녹색만으로 패링 종류를 판단하지 마세요.');
  const grid = node('div', 'bcg-grid');
  const makeCard = (className, icon, label, copy, detail) => {
    const card = node('section', `bcg-card ${className}`);
    const top = node('div', 'bcg-card-top');
    const symbol = node('span', 'bcg-icon', icon);
    symbol.setAttribute('aria-hidden', 'true');
    const key = node('kbd', 'bcg-key', '—');
    top.append(symbol, node('h3', '', label), key);
    card.append(top, node('p', 'bcg-copy', copy));
    if (detail) card.append(node('p', 'bcg-detail', detail));
    grid.append(card);
    return { card, key };
  };
  const physical = makeCard('bcg-physical', '✦', '물리탄 · 칼등 처내기',
    '기본 대응은 칼등 처내기입니다. 물리탄이 다가올 때 패링하면 적을 향해 반사합니다.',
    '일반 물리탄은 회백색 입 모양입니다. 드루이드 독탄은 외형이 다를 수 있습니다.');
  const magic = makeCard('bcg-magic', '◇', '마법탄 · 보호막',
    '기본 대응은 보호막 또는 평화의보호입니다. 마법탄이 다가올 때 누르거나 보호막을 해제하세요. 패링에 성공하면 유도 반사탄이 됩니다.',
    '계속 누르고 있는 것과 타이밍 패링은 다릅니다. 보호막을 유지하려면 MP가 필요합니다.');
  const mode = node('p', 'bcg-mode', '');
  mode.id = 'bcg-q-mode';
  magic.card.append(mode);
  const rainbow = makeCard('bcg-rainbow', '◎', '무지개탄 · 마법 패링 전용',
    '무지개탄은 보호막의 마법 패링으로만 반사할 수 있습니다. 성공하면 블루콩으로 바뀌어 적을 추적합니다.',
    '칼등 처내기로는 반사할 수 없습니다. 반사에 성공했다면 다음 탄을 피할 자리를 잡으세요.');
  const rainbowRule = node('p', 'bcg-mode', '');
  rainbowRule.id = 'bcg-rainbow-rule';
  rainbow.card.append(rainbowRule);

  const hazards = node('div', 'bcg-hazards');
  const orb = node('section', 'bcg-hazard');
  orb.append(node('h3', '', '큰 독 오브 · 회피 권장'),
    node('p', 'bcg-copy', '큰 독 오브는 닿으면 폭발하며 유도 반사탄으로 바뀌지 않습니다. 피해서 지나가세요.'),
    node('p', 'bcg-detail', '패링 타이밍에 맞으면 접촉 피해를 막을 수 있지만, 탄을 돌려보내는 반사와는 다릅니다.'));
  const ground = node('section', 'bcg-hazard');
  ground.append(node('h3', '', '바닥 독 · 폭발 범위'),
    node('p', 'bcg-copy', '독웅덩이에서는 벗어나고, 폭발 예고 범위 밖으로 이동하세요. 날아오는 탄과 바닥 위험을 구분하세요.'),
    node('p', 'bcg-detail', '일부 전투에서는 큰 독 오브가 나오지 않습니다.'));
  hazards.append(orb, ground);

  const execution = node('section', 'bcg-execution');
  const executionHead = node('div', 'bcg-execution-head');
  executionHead.append(node('h3', '', '그로기 때 쓰는 처형'), node('kbd', 'bcg-key', 'X'));
  const executionCopy = node('p', 'bcg-copy', '보스 체간을 깎아 주황색 ‘그로기!’ 표시가 나오면 X를 누르세요. 처형을 배웠고, 재사용 시간이 끝났으며, 아래 자원이 충분해야 합니다.');
  const status = node('p', 'bcg-status', '안내를 열면 현재 상태를 확인합니다.');
  status.id = 'bcg-execution-status';
  status.setAttribute('role', 'status');
  const costs = node('div', 'bcg-costs');
  const resources = [
    { label: 'HP', current: 'hp', maximum: 'maxHp', strict: true },
    { label: 'MP', current: 'mp', maximum: 'maxMp', strict: false },
    { label: 'ST', current: 'st', maximum: 'maxSt', strict: false }
  ].map(spec => {
    const card = node('div', 'bcg-cost');
    const cost = node('h4', '', `${spec.label} 비용 —`);
    const current = node('p', 'bcg-resource', '현재 —');
    const check = node('p', 'bcg-check', '확인 필요');
    card.append(cost, current, check);
    costs.append(card);
    return { ...spec, cost, currentNode: current, check };
  });
  execution.append(executionHead, executionCopy, status, costs,
    node('p', 'bcg-detail', 'HP·MP·ST를 각각 최대치의 10%씩 소비합니다(소수점 버림). HP는 비용보다 많이, MP·ST는 비용 이상 남아야 합니다. 재사용 시간은 5초입니다.'),
    node('p', 'bcg-copy', '처형은 강력한 공격이지만, 이 공격만으로는 보스 HP가 1 아래로 내려가지 않습니다. 후속 공격으로 마무리하세요.'),
    node('p', 'bcg-foot', 'X는 그로기 처형, Z는 배정한 일반 필살기입니다. 다른 동작 중에는 처형 입력이 실행되지 않을 수 있습니다.'));
  shell.append(header, note, grid, hazards, execution,
    node('p', 'bcg-foot', '표시된 키는 현재 설정 기준입니다. 자원과 재사용 상태는 안내를 다시 열 때 갱신됩니다.'));
  element.append(style, shell);

  let returnFocus = null;
  function requestClose() {
    onClose();
    if (!element.classList.contains('on') && element.contains(document.activeElement) && returnFocus?.isConnected) {
      returnFocus.focus({ preventScroll: true });
    }
  }
  closeButton.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    requestClose();
  });
  element.addEventListener('click', event => {
    if (event.target === element) requestClose();
  });
  element.addEventListener('keydown', event => {
    if (!element.classList.contains('on')) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      requestClose();
    } else if (event.key === 'Tab') {
      const focusable = Array.from(element.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'))
        .filter(control => control.getClientRects().length > 0);
      const first = focusable[0] || closeButton;
      const last = focusable[focusable.length - 1] || closeButton;
      if (event.shiftKey && (document.activeElement === first || !element.contains(document.activeElement))) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!event.shiftKey && (document.activeElement === last || !element.contains(document.activeElement))) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
      event.stopPropagation();
    }
  });

  function render() {
    const state = getState();
    if (!state || typeof state !== 'object') throw new TypeError('Boss combat guide state is unavailable.');
    const label = (value, fallback) => {
      const result = keyLabel(value);
      return typeof result === 'string' && result.trim() ? result : fallback;
    };
    const physicalKey = label(state.parryKey, '미지정');
    const magicKey = label(state.magicKey, '미지정');
    physical.key.textContent = physicalKey;
    magic.key.textContent = magicKey;
    rainbow.key.textContent = magicKey;
    rainbowRule.textContent = `${magicKey} 전용 · ${physicalKey} 반사 불가`;
    note.textContent = `드루이드 독탄: 원 + ${physicalKey}는 물리 패링, 마름모 + ${magicKey}는 마법 패링입니다. 바깥의 녹색만으로 판단하지 마세요.`;
    mode.textContent = state.qMode === 'iceOrb'
      ? '현재: 얼음보주 선택 — 마법 패링을 쓰려면 보호막 또는 평화의보호로 바꾸세요.'
      : state.qMode === 'peaceShield'
        ? `현재: 평화의보호 · ${magicKey}로 마법 패링`
        : state.qMode === 'shield'
          ? `현재: 보호막 · ${magicKey}로 마법 패링`
          : '현재 마법 패링 선택을 확인하세요: 보호막 또는 평화의보호가 필요합니다.';

    const level = numberOrNull(state.executionLevel);
    const cooldown = numberOrNull(state.executionCooldown);
    const missing = [];
    if (state.bossGroggy !== true) missing.push(state.bossGroggy === false ? '보스 그로기 대기' : '보스 상태 확인 필요');
    if (state.canAct !== true) missing.push(state.canAct === false ? '현재 동작 중에는 처형 불가' : '행동 상태 확인 필요');
    if (level === null) missing.push('처형 습득 상태 확인 필요');
    else if (level < 1) missing.push('처형 미습득');
    if (cooldown === null) missing.push('재사용 상태 확인 필요');
    else if (cooldown > 0) missing.push(`재사용까지 ${(Math.ceil(cooldown / 6) / 10).toFixed(1)}초`);
    for (const resource of resources) {
      const current = numberOrNull(state[resource.current]);
      const maximum = numberOrNull(state[resource.maximum]);
      const cost = maximum !== null && maximum >= 0 ? Math.floor(maximum * .1) : null;
      const ok = current !== null && cost !== null && (resource.strict ? current > cost : current >= cost);
      resource.cost.textContent = `${resource.label} 비용 ${displayNumber(cost)}`;
      resource.currentNode.textContent = `현재 ${displayNumber(current)} / 최대 ${displayNumber(maximum)}`;
      resource.check.textContent = cost === null || current === null
        ? '현재 자원 확인 필요'
        : ok ? '자원 조건 충족' : `${resource.label} 부족 · ${displayNumber(cost)}${resource.strict ? '보다 많이 필요' : ' 이상 필요'}`;
      resource.check.dataset.ok = String(ok);
      if (!ok) missing.push(`${resource.label} ${cost === null || current === null ? '확인 필요' : '부족'}`);
    }
    const ready = missing.length === 0;
    status.dataset.ready = String(ready);
    status.textContent = ready
      ? '처형 가능 — 안내를 닫고 X'
      : `지금 확인할 조건: ${missing.join(' · ')}`;

    if (element.classList.contains('on')) {
      if (!element.contains(document.activeElement)) returnFocus = document.activeElement;
      closeButton.focus({ preventScroll: true });
    }
  }

  document.body.append(element);
  return Object.freeze({ render, element, close: requestClose });
}
