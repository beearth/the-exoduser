import test from 'node:test';
import assert from 'node:assert/strict';

let createLab;
try { ({ createLab } = await import('../tools/vfx/testbed/engine.mjs')); }
catch (error) { if (error.code !== 'ERR_MODULE_NOT_FOUND') throw error; }
function labWith(targets = [{ id: 'near', x: 200, y: 0, r: 22 }]) {
  assert.equal(typeof createLab, 'function', '이펙트를 직접 발동할 전용 테스트베드가 아직 없습니다');
  return createLab({ targets });
}

test('검기가 실제로 지나간 허수아비에서 접촉은 한 번만 발생한다', () => {
  const lab = labWith();
  lab.attackDown(); lab.attackUp();
  assert.equal(lab.state.contacts.length, 0);
  lab.step(16);
  assert.equal(lab.state.contacts.length, 1);
  assert.equal(lab.state.contacts[0].target, 'near');
  lab.step(30);
  assert.equal(lab.state.contacts.length, 1);
});

test('세 번째 입력을 누르는 동안에는 발사하지 않고 해제할 때 충전 검기를 한 번 발사한다', () => {
  const lab = labWith([]);
  lab.attackDown(); lab.attackUp(); lab.step(12);
  lab.attackDown(); lab.attackUp(); lab.step(12);
  lab.attackDown(); lab.step(120);
  assert.equal(lab.state.charging, true);
  assert.equal(lab.state.casts.filter(c => c.type === 'ki').length, 2);
  assert.equal(lab.state.chargeTier, 3);
  lab.attackUp(); lab.attackUp();
  const cast = lab.state.casts.at(-1);
  assert.equal(cast.step, 3);
  assert.equal(cast.tier, 3);
  assert.equal(cast.scale, 2.2);
  assert.equal(lab.state.casts.filter(c => c.type === 'ki').length, 3);
});

test('강타 접촉은 발동 시 판정하고 확산 영상 때문에 지연·추가 접촉을 만들지 않는다', () => {
  const lab = labWith([{ id: 'near', x: 450, y: 0, r: 22 }, { id: 'far', x: 600, y: 0, r: 22 }]);
  lab.slam(100);
  assert.equal(lab.state.contacts.length, 1);
  assert.equal(lab.state.contacts[0].tick, 0);
  assert.equal(lab.state.contacts[0].target, 'near');
  lab.step(50);
  assert.equal(lab.state.contacts.length, 1);
});

test('정지·한 프레임 진행으로 같은 발동 상태를 검사할 수 있다', () => {
  const lab = labWith([]);
  lab.triggerKi(1);
  lab.state.paused = true;
  lab.advance(500);
  assert.equal(lab.state.tick, 0);
  lab.step(1);
  assert.equal(lab.state.tick, 1);
  assert.equal(lab.state.waves[0].x, 14);
});

test('초기화가 누른 입력·충전·검기·접촉을 함께 지운다', () => {
  const lab = labWith();
  lab.triggerKi(2); lab.step(12); lab.attackDown(); lab.step(60);
  assert.equal(lab.state.charging, true);
  lab.reset();
  assert.equal(lab.state.charging, false);
  assert.equal(lab.state.held, false);
  assert.equal(lab.state.waves.length, 0);
  assert.equal(lab.state.contacts.length, 0);
  assert.equal(lab.state.tick, 0);
});

test('A/B 표시를 여러 번 조회해도 발동·접촉 횟수가 증가하지 않는다', () => {
  const lab = labWith(); lab.triggerKi(1); lab.step(12);
  const before = [lab.state.casts.length, lab.state.contacts.length, lab.state.tick];
  for (let i = 0; i < 10; i++) lab.snapshot();
  assert.deepEqual([lab.state.casts.length, lab.state.contacts.length, lab.state.tick], before);
});
