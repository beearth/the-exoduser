import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('bonfire projectile blocking retains its squared-radius binding', () => {
  const barrierStart = gameHtml.indexOf('// ── 화톳불 배리어 타이머 ──');
  const projectileBlock = gameHtml.indexOf('// 화톳불 배리어: 적 투사체 차단', barrierStart);
  assert.ok(barrierStart >= 0 && projectileBlock > barrierStart, 'bonfire update sections must exist');

  const setup = gameHtml.slice(barrierStart, projectileBlock);
  assert.match(
    setup,
    /const _bf=G\._bonfire;const _bfActive=_bf&&_bf\.t>0;const _bfR2=_bfActive\?_bf\.r\*_bf\.r:0;/,
    '_bfR2 must stay in update scope for the later projectile barrier check',
  );
});

test('whirl detonation absorption retains its per-projectile state binding', () => {
  const absorptionStart = gameHtml.indexOf('// ══ 회전참 범위 내 탄 흡수:');
  const radiusUse = gameHtml.indexOf('const _wwAbsR=', absorptionStart);
  assert.ok(absorptionStart >= 0 && radiusUse > absorptionStart, 'whirlwind absorption section must exist');

  const setup = gameHtml.slice(absorptionStart, radiusUse);
  assert.match(
    setup,
    /const _wwDetAbs=P\.s==='whirlwind'&&_isFused\('whirlDet'\);/,
    '_wwDetAbs must be defined before the ordinary projectile absorption radius uses it',
  );
});
