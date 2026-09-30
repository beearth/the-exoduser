import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

// [SKILL-02] 폭산탄 activateBlastShot 자원 게이트/차감 일치 회귀.
// 확정 계약: 원가5 → 실비 _malCost(5). 게이트·차감·T라우터가 모두 원가5여야 한다.
// 결함(수정 전): 게이트만 _malCost(8)이라 정확한 실비(_malCost(5))를 보유해도 발동 거부.
function extract(file) {
  const source = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
  const costStart = source.indexOf('const _MALICE_COST_MUL=');
  const costEnd = source.indexOf('function enhCostRaw(', costStart);
  const activateStart = source.indexOf('function activateBlastShot(){');
  const activateEnd = source.indexOf('function activateNeedleShot(){', activateStart);
  assert.ok(costStart >= 0 && costEnd > costStart, `${file}: live _malCost exists`);
  assert.ok(activateStart >= 0 && activateEnd > activateStart, `${file}: activateBlastShot exists`);
  const malCost = new Function(`${source.slice(costStart, costEnd)}; return _malCost;`)();
  const body = source.slice(activateStart, activateEnd);
  const make = () => new Function('P', 'G', '_malCost', '_addSkProf', 'playSample', '_r',
    'SFX', 'addTxt', '_T', 'shake', `${body}; return activateBlastShot;`);
  return {source, malCost, body, activate(P, G) {
    return make()(P, G, malCost, () => {}, () => {}, () => 1, {crossbowLoad() {}},
      () => {}, x => x, () => {});
  }};
}

function run(file, mats) {
  const {malCost, activate} = extract(file);
  const P = {skills: {blastShot: 1}, st: 10, x: 0, y: 0, facing: 0, _bsCd2: 0};
  const G = {mats, _bsBombs: []};
  activate(P, G)();
  return {cost: malCost(5), maliceAfter: G.mats, staminaAfter: P.st,
    bombs: G._bsBombs.length, cooldown: P._bsCd2 || 0};
}

for (const file of ['game.html', 'game-easy-test.html']) {
  test(`${file}: 정확한 실비(_malCost(5)) 보유 시 폭산탄 발동+정확 차감`, () => {
    const cost = extract(file).malCost(5);
    const r = run(file, cost);
    assert.equal(r.bombs > 0, true, '폭탄이 발사되어야 한다');
    assert.equal(r.maliceAfter, cost - r.cost, `악의는 원가5(=${cost})만큼 차감돼 0이어야 한다`);
    assert.equal(r.maliceAfter, 0, '정확한 실비면 발동 후 악의 0');
    assert.equal(r.staminaAfter, 9, 'ST는 Lv1 _bsStC=1 차감');
    assert.equal(r.cooldown, 30, '쿨다운 설정');
  });

  test(`${file}: 실비보다 1 부족(_malCost(5)-1)이면 미발동·자원 무변화`, () => {
    const cost = extract(file).malCost(5);
    const r = run(file, cost - 1);
    assert.equal(r.bombs, 0, '부족 자원이면 폭탄 미발사');
    assert.equal(r.maliceAfter, cost - 1, '미발동 시 악의 차감 없음');
    assert.equal(r.staminaAfter, 10, '미발동 시 ST 차감 없음');
    assert.equal(r.cooldown, 0, '미발동 시 쿨다운 없음');
  });

  test(`${file}: 게이트가 옛 원가8(_malCost(8))이 아닌 원가5로 정렬`, () => {
    const {source} = extract(file);
    // activateBlastShot 게이트 라인이 _malCost(8)을 쓰지 않아야 한다(차감·라우터와 일치).
    const gate = source.match(/if\(G\.mats<_malCost\((\d)\)\|\|P\.st<_bsStC/);
    assert.ok(gate, `${file}: activateBlastShot 자원 게이트 존재`);
    assert.equal(gate[1], '5', '게이트 원가는 5여야 한다(차감·T라우터와 일치)');
  });
}
