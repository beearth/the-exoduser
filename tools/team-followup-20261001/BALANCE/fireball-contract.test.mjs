import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { createFireballContract, FIREBALL_TIERS } from './fireball-contract.mjs';

function fixture(overrides = {}) {
  const evidence = { rolls: 0, emissions: [] };
  const hook = createFireballContract({
    eligible: event => event.accepted === true,
    probability: () => .22,
    random: () => { evidence.rolls++; return 0; },
    emit: (event, provenance) => evidence.emissions.push({ event, provenance }),
    ...overrides
  });
  return { hook, evidence };
}

test('양쪽 생산 데이터의 다섯 확률을 그대로 보존', () => {
  for (const file of ['game.html', 'game-easy-test.html']) {
    const source = readFileSync(new URL(`../../../${file}`, import.meta.url), 'utf8');
    const row = source.match(/^\s*\{id:'onHitFireball',[^\n]+/m)[0].trim().replace(/,$/, '');
    const tiers = vm.runInNewContext(`(${row}).tiers`);
    assert.deepEqual(Array.from(tiers), FIREBALL_TIERS);
  }
});

for (const chance of FIREBALL_TIERS) {
  test(`확률 ${chance}: 하한·직전·동일·상한 경계`, () => {
    for (const [sample, expected] of [[0,'emission-requested'],[chance-1e-8,'emission-requested'],[chance,'miss'],[.999999,'miss']]) {
      const { hook } = fixture({ probability: () => chance, random: () => sample });
      assert.equal(hook({ accepted: true }).status, expected);
    }
  });
}

test('성공·실패 적중은 동일 객체 재전달에서 재추첨하지 않음', () => {
  for (const sample of [0,.99]) {
    const { hook, evidence } = fixture({ random: () => { evidence.rolls++; return sample; } });
    const event = { accepted: true };
    hook(event);
    assert.equal(hook(event).status, 'duplicate-blocked');
    assert.equal(evidence.rolls, 1);
    assert.equal(evidence.emissions.length, sample === 0 ? 1 : 0);
  }
});

test('생성탄·교차 프록 메타는 RNG/피해 콜백 전에 차단', () => {
  const { hook, evidence } = fixture();
  for (const event of [{noProc:true},{procOrigin:'onHitFireball'},{procOrigin:'otherProc'}]) {
    assert.equal(hook(event).status, 'generated-hit-blocked');
  }
  assert.equal(evidence.rolls, 0);
  assert.equal(evidence.emissions.length, 0);
});

test('동기 재진입과 비동기 생성탄 재적중 차단', () => {
  let nested;
  let marker;
  const { hook } = fixture({ emit: (event, provenance) => {
    marker = provenance;
    nested = hook({ accepted: true }).status;
  } });
  assert.equal(hook({ accepted: true }).status, 'emission-requested');
  assert.equal(nested, 'reentrant-blocked');
  assert(Object.isFrozen(marker));
  assert.equal(hook({ accepted: true, ...marker }).status, 'generated-hit-blocked');
});

test('피해원·DOT·0피해·무적 허용은 주입 정책만 결정', () => {
  const { hook, evidence } = fixture({ eligible: event => event.source === 'explicit-fixture' && !event.dot && event.damage > 0 && !event.immune });
  for (const event of [{source:'pet',damage:10},{source:'explicit-fixture',dot:true,damage:10},{source:'explicit-fixture',damage:0},{source:'explicit-fixture',damage:10,immune:true}]) {
    assert.equal(hook(event).status, 'ineligible');
  }
  assert.equal(evidence.rolls, 0);
});

test('미장착 확률0은 RNG/발사 없음; 합산 .44는 명시 정책 fixture만', () => {
  const empty = fixture({ probability: () => 0 });
  assert.equal(empty.hook({accepted:true}).status, 'no-affix');
  assert.equal(empty.evidence.rolls, 0);
  const forced = fixture({ probability: () => .22+.22, random: () => .43 });
  assert.equal(forced.hook({accepted:true}).status, 'emission-requested');
});

test('누락 콜백·미결정 확률·잘못된 난수/허용값은 실패 폐쇄', () => {
  assert.throws(() => createFireballContract({}), TypeError);
  for (const chance of [undefined,NaN,-.1,1.1,Infinity]) {
    const {hook,evidence} = fixture({probability:()=>chance});
    assert.throws(()=>hook({accepted:true}),RangeError);
    assert.equal(evidence.emissions.length,0);
  }
  for (const sample of [NaN,-.1,1]) {
    assert.throws(()=>fixture({random:()=>sample}).hook({accepted:true}),RangeError);
  }
  assert.throws(()=>fixture({eligible:()=>undefined}).hook({}),TypeError);
});

test('emit 예외 후 동일 적중 재시도 금지·새 적중은 계속 처리', () => {
  let calls = 0;
  const { hook } = fixture({ emit: () => {calls++; if(calls===1)throw Error('fixture failure');} });
  const event = {accepted:true};
  assert.throws(()=>hook(event),/fixture failure/);
  assert.equal(hook(event).status,'duplicate-blocked');
  assert.equal(hook({accepted:true}).status,'emission-requested');
  assert.equal(calls,2);
});
